---
title: "Calidad y Despliegue: Suite Anti-Evasión, Matriz de Hardware y Pipeline"
date: 2026-07-14
status: "under-review"
progress: 10%
tags: ["zentryos", "ssot", "calidad-despliegue"]
---

# 🧪 Calidad y Despliegue

Estado honesto de partida: la cobertura de pruebas automatizadas del prototipo es **cero** (GAP-08 en el [análisis de brechas](./analisis-de-brechas.md)). Ojo con la lectura: el **confinamiento Device Owner sí está verificado empíricamente en Redmi 9 físico** (LockTask, `setApplicationHidden`, supresión de barra MIUI, Launcher forzado); lo que falta es **convertir esas verificaciones manuales en una suite automatizada con score**. Este documento es el **propietario único** del registro de pruebas de evasión (EVA), del checklist de no-regresión de la demo y de la ruta de despliegue. Define *cómo se mide*; las cifras resultantes viven exclusivamente en [progreso y métricas](../04-operaciones-y-roadmap/progreso-y-metricas.md).

---

## 📱 Matriz de hardware de referencia

| Dispositivo | SoC / RAM | Rol | Notas |
|---|---|---|---|
| **Xiaomi Redmi 9** | MediaTek Helio G80, 3-4 GB | Hardware de demo, banco de pruebas primario **y banco Device Owner activo** | Gama del segmento objetivo; **DO provisionado y verificado (Android 10/11)**; LLM local descartado por RAM → inferencia serverless |
| Emulador API 24 (minSdk) | — | Piso de compatibilidad | Solo smoke tests de arranque y layout |
| Segundo Redmi 9 u homólogo (F2) | tras factory-reset | Banco de aprovisionamiento QR producción | Valida el payload QR de Android Enterprise con applicationId comercial (GAP-09) |

---

## 🧱 Estrategia de pruebas (pirámide)

1. **Unitarias (JVM, rápidas — corren en cada build del ejecutor)**: parser del contrato JSON `study_assistant` (pregunta-guía obligatoria; solución literal = rechazada), allowlist cerrada de `[COMMAND:{...}]`, lógica de ViewModels, transiciones de la máquina de estados fail-safe (`ONLINE_SYNCED → OFFLINE_GRACE → OFFLINE_ENFORCED`) con reloj monotónico simulado.
2. **Instrumentadas (Redmi 9)**: DbHelpers SQLite (`ZentryDbHelper`, `ZentryClockDbHelper`, `WorldGeneratorDbHelper`, `NeuroArtDbHelper`), `ZentryPolicyManager` contra `DevicePolicyManager` **real** en el dispositivo DO (ya operativo), persistencia offline de Firestore contra el emulador de Firebase.
3. **E2E kiosk (manual → automatizado)**: la suite anti-evasión de abajo, hoy ejecutada como **guion manual verificado** en el Redmi 9 con DO, y progresivamente automatizada con UIAutomator donde el vector lo permita (GAP-08).

### ⏱️ Protocolos de medición (los números NO viven aquí)

*   **Latencia IA**: p50/p95 del round-trip de un turno de chat (envío → primer token renderizado) en la red de la demo, N ≥ 30 turnos, Redmi 9. La estimación vigente (registrada en [04](../04-operaciones-y-roadmap/progreso-y-metricas.md)) es hipótesis hasta pasar por este protocolo.
*   **Latencia kill-switch**: EVA-06 (abajo), sobre los timestamps de la cola `commands` — depende del backend (GAP-05).
*   **Batería**: EVA-08 (abajo). Todos los resultados se registran en [progreso y métricas](../04-operaciones-y-roadmap/progreso-y-metricas.md).

---

## 🛡️ Suite anti-evasión (registro EVA) y score por build

El ejecutor local corre esta batería en cada build candidata y calcula el **score de evasión**:

> **score = (escenarios EVA superados ÷ escenarios aplicables a la build) × 100**

Los escenarios que dependen de Device Owner ya son ejecutables (el DO está activo); lo pendiente es **automatizarlos** para que publiquen score por build. Criterio canónico de salida de F2: **100% de la batería automatizada superada en build con DO**. El score vigente y su histórico viven en [progreso y métricas](../04-operaciones-y-roadmap/progreso-y-metricas.md).

| ID | Escenario | Given / When / Then (resumen) | Amenaza | Brecha bloqueante | Estado capacidad |
|---|---|---|---|---|---|
| EVA-01 | Gestos de sistema y barra de estado bajo LockTask | Given build DO en LockTask / When gestos de navegación, cortina de notificaciones, quick settings / Then el launcher permanece en primer plano sin superficie de sistema visible | THR-01 | GAP-08 (automatizar) | **Verificado manual en Redmi 9** |
| EVA-02 | Reinicio + intento de Modo Seguro | Given build DO / When long-press de apagado buscando Safe Mode y reinicio completo / Then Safe Mode no disponible y el launcher retoma el foreground | THR-01 | GAP-04, GAP-08 | DO OK; Direct Boot parcial |
| EVA-03 | Desinstalación, Ajustes y depuración USB | Given build DO / When intento de desinstalar, abrir Ajustes restringidos o habilitar USB debugging / Then acción bloqueada y opciones de desarrollador inaccesibles | THR-01, THR-02 | GAP-08 (automatizar) | **Verificado manual en Redmi 9** |
| EVA-04 | Modo avión y offline prolongado | Given política cacheada vigente / When modo avión hasta vencer `kill_switch_grace_seconds` / Then transición a `OFFLINE_ENFORCED`: límites y ventanas siguen aplicándose sin red; ninguna restricción se relaja | THR-04, THR-07 | GAP-05 | Pendiente (backend) |
| EVA-05 | Manipulación de hora local | Given límite diario casi agotado / When el probador adelanta/atrasa la hora del sistema / Then el presupuesto contabilizado por reloj monotónico no se altera | THR-04 | GAP-05 | Pendiente (backend) |
| EVA-06 | **Protocolo** de latencia del kill-switch online | Given comando `LOCK_NOW` emitido / When el dispositivo está online / Then se registran p50/p95 de `issuedAt → appliedAt` sobre N ≥ 20 repeticiones — **cifras solo en [04](../04-operaciones-y-roadmap/progreso-y-metricas.md)** | THR-08 | GAP-05 | Pendiente (backend) |
| EVA-07 | Inyección de prompt / spoofing de comandos | Given chat tutor activo / When el probador induce al modelo a emitir comandos fuera de allowlist o payloads malformados / Then el comando se descarta, se cuenta en `policy_violation_attempts` y ninguna acción se ejecuta | THR-09 | GAP-06 | Parcial (parser sin allowlist endurecida) |
| EVA-08 | **Protocolo** de consumo de batería | Given Redmi 9 con listener y timers activos / When 24 h de operación de perfil escolar / Then se registra la degradación — **cifras solo en [04](../04-operaciones-y-roadmap/progreso-y-metricas.md)** | — | — | Pendiente (backend) |

---

## ✅ Checklist demo no-regresión (features que nunca pueden romperse)

Toda build que el ejecutor entregue debe pasar este checklist completo — es la línea roja del canon (§4). Alineado a las **12 features canónicas** verificadas en Redmi 9 físico:

| # | Feature | Pantalla / Clase del prototipo | Criterio de no-regresión |
|---|---|---|---|
| 1 | Launcher home (fondo iridiscente + widgets de reloj) | `ZentryOSHomeScreen` | Renderiza dock + grid; lienzo vivo mesh-gradient; fase circadiana correcta según hora |
| 2 | Gesto de 2 dedos (pinch → personalización) | `ZentryGestureDetector` | Pinch y pan de 2 dedos responden en home |
| 3 | Temporizador circadiano | `ZentryOSHomeScreen` (anillo) | Colores adaptativos según hora |
| 4 | Chat tutor con fallback offline | `ZentryAiScreen` + ViewModel | Responde online; sin red degrada al fallback local sin crash |
| 5 | Calculadora | `ZentryCalculatorScreen` | Operaciones básicas y layout adaptativo |
| 6 | Cámara | `ZentryCameraScreen` | Foto, video y QR operativos (CameraX 1.3.3) |
| 7 | Reloj y alarmas | `ZentryClockScreen` + `ZentryClockDbHelper` | Alarmas persisten en SQLite tras reinicio de app |
| 8 | Calendario escolar | `ZentryCalendarScreen` + ViewModel | Eventos y retos visibles |
| 9 | Archivos | `ZentryFilesScreen` | Explorador y galería MediaStore funcionales; acceso seguro a fotos |
| 10 | **Google Workspace (gobernado, no clonado)** | Launcher + `ZentryPolicyManager` | Google Slides/Docs/Sheets/NotebookLM **instalados y lanzables** desde el launcher; se **controlan las apps oficiales**, no se clonan (canon §3B) |
| 11 | Study Assistant | `ZentryStudyAssistantScreen` + ViewModel | Flujo socrático por grado MINEDU completo |
| 12 | Navegación fluida + barra de sistema global | `MainActivity` (AnimatedContent) + `ZentryNavAccessibilityService` | Transiciones sin jank visible; barra de navegación glass global operativa (BACK/HOME/RECENTS) |

> **Z-Slides eliminado (canon, reconciliado 2026-07-14)**: el antiguo ítem "Z-Slides / `ZentrySlidesScreen`" queda **retirado del checklist y del producto**. Se usan Google Slides/NotebookLM reales, presentados desde el launcher. Cualquier código, contrato `z_slides` o navegación a `ZentrySlidesScreen` se elimina.

---

## 📦 Build y variantes

*   **Base verificada del prototipo**: `compileSdk 36`, `minSdk 24`, Firebase BOM 34.14.1 (`firebase-vertexai:16.5.0`, Firebase AI Logic), CameraX 1.3.3, Compose + Material 3, biblioteca **Haze** para el cristal real.
*   **Flavor `lab`**: applicationId actual (`com.example.zentryconfig`), aprovisionamiento por `adb shell dpm set-device-owner` sobre el dispositivo de laboratorio (**ya realizado y verificado**); logging ampliado; apunta a proyecto Firebase de staging.
*   **Flavor `prod`**: applicationId comercial definitivo (cierre de GAP-09) con firma de release gestionada. **Restricción de secuencia**: el applicationId y el checksum de la APK forman parte del payload del QR de Android Enterprise — cambiarlos después invalida los QR emitidos, así que GAP-09 se cierra **antes** de generar QRs de piloto (F2).
*   **Distribución F1→F3**: carga directa del APK (sideload controlado por el asesor) + actualización remota de políticas vía Firestore (cuando exista el backend); Play Store queda como decisión de F4 ([roadmap](../04-operaciones-y-roadmap/roadmap.md)).

---

## 🔁 CI/CD

*   **Existente (repo SSOT)**: CI de regeneración/verificación documental que falla el PR si los compilados quedan desincronizados — guardián de sincronización del SSOT.
*   **Propuesto (app, etapa backend)**: pipeline Android con `gradlew assembleDebug` + unit tests + lint en cada push del ejecutor; las instrumentadas corren en el banco físico (Redmi 9, con DO) bajo demanda; la suite EVA corre en cada build candidata y publica su score.

---

## 🤖 Flujo agéntico de calidad (Antigravity)

*   **Definition of Done del ejecutor**: compila (`./gradlew assembleDebug`) + Walkthrough generado + criterios de aceptación del GAP verificados + checklist de no-regresión completo en dispositivo físico.
*   **Guardrails HITL** (innegociables, canon §5):
    *   **Proteger la configuración Device Owner ya activa**: toda alteración del `AndroidManifest` referente a permisos DO (receiver, restricciones, LockTask) requiere **aprobación humana explícita** antes de compilar. La postura ya no es "no activar" sino "no romper ni degradar" el DO vigente.
    *   No añadir dependencias Gradle ni tocar DbHelpers sin aprobación humana explícita.
    *   No secretos en Git (keystores, API keys, `local.properties`, `google-services.json`).
*   **Hard-stop**: 10 compilaciones fallidas consecutivas → detención automática + reporte estructurado (stack trace, últimas 3 variantes descartadas, hipótesis del bloqueo). 3 ciclos de test fallidos sobre el mismo criterio de aceptación → escalada a humano.

---

## 🚀 Despliegue por fases

| Fase | Entregable de calidad | EVAs exigidas | Gate de salida |
|---|---|---|---|
| F1 — Demo Sólida (jul 2026) | Checklist demo 12/12 en Redmi 9 + confinamiento DO verificado manual | EVA-01/02/03 (verificación manual); EVA-07 parcial | Demo end-to-end repetible en Redmi 9 sin crashes |
| F2 — Seguridad Industrial (ago-oct 2026) | **Automatización** de la suite (DO ya operativo) + backend fail-safe | EVA-01..05, EVA-07 al 100% automatizado; protocolos EVA-06/08 operativos | Score de evasión 100% en build DO sin regresión demo + identidad comercial (GAP-09) |
| F3 — Piloto (nov 2026-feb 2027) | Telemetría v1 + panel parental v1 | EVA-06 y EVA-08 medidos en campo | KPIs del piloto registrados en [04](../04-operaciones-y-roadmap/progreso-y-metricas.md) |
| F4 — Escala + Gate iOS (Q2 2027+) | Canal de distribución validado | Batería completa en hardware de escala | Decisión go/no-go iOS con datos |

> **Nota de secuenciación (2026-07-14)**: el confinamiento (L2) está ~95% hecho y verificado; la capa más baja **no consolidada** es ahora el **backend (L3)** — kill-switch remoto, fail-safe, telemetría y tests. Ver [plan maestro](../04-operaciones-y-roadmap/plan-maestro-por-capas.md).

---

## 🔗 Cableado con la vertical

| Contrato compartido | Documento propietario | IDs citados aquí |
|---|---|---|
| Aprovisionamiento DO (QR producción / ADB laboratorio) y capacidades verificadas | [control-dispositivo-abm.md](./control-dispositivo-abm.md) | — |
| Máquina fail-safe offline y umbral de gracia | [telemetria-gcp-ai.md](./telemetria-gcp-ai.md) | `kill_switch_grace_seconds` |
| Cola `commands` (fuente de EVA-06) y contrato JSON a testear | [modelo-de-datos-firestore.md](./modelo-de-datos-firestore.md) | `commands`, `study_assistant` |
| Amenazas que cada EVA verifica | [seguridad-y-privacidad.md](./seguridad-y-privacidad.md) | THR-01, THR-02, THR-04, THR-07, THR-08, THR-09 |
| Brechas bloqueantes de cada escenario | [analisis-de-brechas.md](./analisis-de-brechas.md) | GAP-04, GAP-05, GAP-06, GAP-08, GAP-09 |
| Score de evasión, latencias y batería (cifras) | [progreso-y-metricas.md](../04-operaciones-y-roadmap/progreso-y-metricas.md) | — |
