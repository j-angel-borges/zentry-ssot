---
title: "Roadmap SDD: Etapas E0-E6 del Desarrollo Guiado por Especificaciones"
date: 2026-07-14
status: "under-review"
progress: 100%
tags: ["zentryos", "ssot", "arquitectura-agentica", "sdd"]
---

# 🗺️ Roadmap SDD (Spec-Driven Development)

Hoja de ruta agéntica: descompone la evolución del ecosistema local en **7 etapas E0-E6**, cada una atada a una fase del [roadmap operativo](../04-operaciones-y-roadmap/roadmap.md) por **criterios de entrada/salida** (las fechas exactas se fijan en [04/roadmap.md](../04-operaciones-y-roadmap/roadmap.md)). Cada etapa entrega algo verificable por simulación física en el Redmi 9 y cierra brechas GAP concretas de la [Vertical 02](../02-arquitectura-tecnica/analisis-de-brechas.md).

> **Resecuenciación canónica (CANON §2):** el **aprovisionamiento Device Owner ya está HECHO** (~95%, testeado en Redmi 9). Ya no es una etapa futura. La **frontera real** de trabajo es el **backend/telemetría/panel padre**, que vive en **E3 y E5**. La antigua «E4 = aprovisionar DO» se reconvierte en **verificación y endurecimiento** de una configuración que ya está activa.

---

## 🧭 Principio SDD

Ninguna etapa produce código sin una spec aprobada aguas arriba. El bucle por etapa es: **`CANON.md` → spec del SSOT → Task List → Implementation Plan → gate HITL → código secuencial → verificación → Walkthrough** ([workflow spec-a-implementacion](./README.md)). Los criterios de aceptación reutilizan los registros GAP/EVA existentes (single-writer en la Vertical 02); el ejecutor no inventa criterios nuevos.

## ✅ Estado base ya conseguido (no es una etapa futura)

El **Device Owner está activo y aprovisionado** en Redmi 9 físico y forma parte del punto de partida, no del backlog de activación:

*   `LockTask` operativo, `setApplicationHidden`, `addPersistentPreferredActivity`, `WRITE_SECURE_SETTINGS` y supresión de la barra MIUI vía `policy_control` *immersive*.
*   `ZentryPolicyManager` aplica políticas **reales** (no stubs); `ZentryAdminReceiver` registrado.
*   **GAP-01 / GAP-02 / GAP-03** están en gran parte **cerradas y verificadas**.
*   El guardrail **PROTEGE** esta superficie: tocar el `AndroidManifest` o los permisos DO requiere **HITL** — el riesgo es romper un kiosco funcional, no «activarlo».

---

## 📊 Tabla maestra de etapas

| Etapa | Nombre | Fase | Entregable verificable (simulación física) | Cierra |
|---|---|---|---|---|
| E0 | Agentificación del workspace | F1 | `zentrybyantig` con `AGENTS.md`, guardrails, **4 skills propias** (3 activas + legacy), workflows y MCP-template operativos | GAP-08 (base) |
| E1 | Pulido del Launcher / cáscara híbrida | F1 | Launcher estable sin jank; **Liquid Glass real (Haze)** y tokens del design system aplicados | GAP-10 (parcial) |
| E2 | Microapps del guion Demobook (**web-first**) | F1 | Microapps PWA cableadas por el JS Bridge + Workspace oficial embebido, sin stubs visibles | GAP-10 |
| **E3** | **Kill-switch demo + fail-safe offline** ← frontera | F1 | Listener Firestore + máquina de estados offline funcionando en el Redmi 9 | GAP-05 (parcial) |
| E4 | Endurecimiento y verificación del DO (ya activo) | F2 | Batería de evasión EVA-01..03 al **100%** sobre el DO activo; residual de endurecimiento cerrado | GAP-04 residual + verificación GAP-01/02/03 |
| **E5** | **Telemetría v1 + panel padre** ← frontera | F2→F3 | Agregados diarios en Firestore (single-writer) + panel parental mínimo | GAP-05, GAP-06, GAP-07 |
| E6 | Soporte del piloto comercial | F3 | Instrumentación del piloto de 100 familias operativa | GAP-08 (cierre) |

---

## 🎯 Criterios de aceptación por etapa (Given / When / Then)

### E0 — Agentificación del workspace (F1)
- **Given** el workspace `zentrybyantig` · **When** Antigravity 2.0 abre el proyecto · **Then** carga `CANON.md` como verdad suprema y `AGENTS.md` + `.agents/rules/00-guardrails.md` sin error de formato.
- **Given** una tarea de prueba trivial · **When** el ejecutor la procesa · **Then** genera el ciclo Task List → Implementation Plan → Walkthrough y espera el gate HITL antes de tocar código.
- **Given** las skills propias instaladas · **When** se listan las activas · **Then** el total es ≤ 8 e incluye `zentry-design-system`, `zentry-web-microapp` y `zentry-device-owner`; `zentry-microapp-pattern` queda instalada como **legacy inactiva**.

### E1 — Pulido del Launcher / cáscara híbrida (F1)
- **Given** el `ZentryOSHomeScreen` · **When** se navega con gestos de 2 dedos y cambia la fase circadiana · **Then** no hay jank perceptible y la fase corresponde a la hora (verifica checklist no-regresión #3).
- **Given** una superficie nueva de UI · **When** se implementa · **Then** usa el sistema **Liquid Glass real (Haze)** — `zentryGlass()`/`zentryVeil()` — y la paleta canónica, sin propagar el índigo transitorio del prototipo.
- **Given** cualquier cambio de esta etapa · **When** se cierra la tarea · **Then** el checklist anti-regresión de 12 features pasa completo.

### E2 — Microapps del guion Demobook, web-first (F1)
- **Given** el guion de venta de la Demobook · **When** se ejecuta end-to-end en el Redmi 9 · **Then** ninguna pantalla del checklist expone un estado stub (cierra GAP-10).
- **Given** una microapp de contenido · **When** se implementa · **Then** es una **PWA web-first** cableada por el [JS Bridge](../07-plataforma-microapps/contrato-js-bridge.md) (no una pantalla nativa clon); para ofimática se **embeben y controlan** las apps oficiales de Google Workspace (Docs/Slides/Sheets/NotebookLM), **no se clonan**.
- **Given** una microapp con IA · **When** genera contenido · **Then** su respuesta cumple el contrato JSON estricto registrado en `ZentryIntelligenceBridge` (p. ej. `study_assistant`), con el ID del modelo leído de `BuildConfig.ZENTRY_MODEL_ID` (hoy `gemini-2.5-flash`), nunca un literal.

### E3 — Kill-switch demo + fail-safe offline (F1) — **frontera real (backend)**
- **Given** `devices/{deviceId}` con `activePolicy.isLocked=true` escrito por el padre · **When** el dispositivo está online · **Then** el launcher aplica el bloqueo y registra `appliedAt` en el comando (protocolo EVA-06).
- **Given** el dispositivo en modo avión más allá del umbral de gracia · **When** vence `kill_switch_grace_seconds` · **Then** la política cacheada y los timers monotónicos siguen aplicándose — el bloqueo persiste sin red, sin describirse como ineludible (EVA-04).
- **Given** un intento de cambiar la hora del sistema · **When** el límite diario está casi agotado · **Then** el presupuesto contabilizado por reloj monotónico no se altera (EVA-05).

### E4 — Endurecimiento y verificación del Device Owner ya activo (F2) — cualquier toque al Manifest/permisos requiere gate HITL (para PROTEGER, no para activar)
- **Given** un Redmi 9 **ya aprovisionado** como Device Owner (config activa: LockTask, `setApplicationHidden`, `addPersistentPreferredActivity`, `WRITE_SECURE_SETTINGS`, supresión de barra MIUI) · **When** arranca `MainActivity` · **Then** `isDeviceOwnerApp()` es `true` y `startLockTask()` entra en LockTask sin diálogo (EVA-01, verificación — no aprovisionamiento).
- **Given** DO activo · **When** `ZentryPolicyManager.applyPolicy()` recibe la política · **Then** ningún método retorna el `false` de un stub y las restricciones se reflejan en `DevicePolicyManager` (GAP-02 verificada).
- **Given** la build DO · **When** el probador intenta Modo Seguro, desinstalación y USB debugging · **Then** todos los vectores quedan bloqueados (EVA-02, EVA-03) y el score de evasión llega al 100% (criterio de salida de F2).
- **Given** el arranque del dispositivo · **When** se enciende · **Then** el launcher toma el foreground antes de que el sistema sea interactivo, con Direct Boot (cierra el residual de GAP-04).

### E5 — Telemetría v1 + panel padre (F2→F3) — **frontera real (backend + vista padre)**
- **Given** un día de uso · **When** ocurre el cierre de día o la reconexión · **Then** existe **exactamente un** `telemetry_daily/{deviceId}_{yyyyMMdd}` con contadores y cero texto libre (single-writer; cierra GAP-07).
- **Given** las reglas Firestore desplegadas · **When** un padre intenta leer telemetría de otra familia · **Then** la lectura es denegada (mitiga THR-03; prueba en emulador).
- **Given** el chat induce un comando fuera de allowlist · **When** el parser lo procesa · **Then** se descarta y se cuenta en `policy_violation_attempts` (EVA-07, cierra GAP-06).
- **Given** los agregados diarios · **When** el padre abre el panel parental mínimo · **Then** ve los contadores de **su** familia, sin ningún texto libre del menor.

### E6 — Soporte del piloto comercial (F3)
- **Given** el pipeline CI de la app · **When** corre una build candidata · **Then** unit + lint pasan y la suite EVA publica su score (cierra GAP-08).
- **Given** una build con Device Owner · **When** se corre la batería de evasión completa · **Then** el score de evasión es 100% (criterio de salida de F2 verificado en campo).
- **Given** el piloto de 100 familias · **When** se recolecta telemetría v1 · **Then** los KPIs se registran en [progreso y métricas](../04-operaciones-y-roadmap/progreso-y-metricas.md) sin que ningún dato prohibido salga del dispositivo.

---

## 📱 Matriz de viabilidad kiosk: Android vs iOS

El confinamiento por plataforma no se redefine aquí: la tabla comparativa canónica (mecanismo, privilegios, canal de distribución, riesgo de tienda, estado en ZentryOS) es propiedad de [02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md). Implicación para el roadmap SDD: **las etapas E0-E6 son 100% Android**, con el **Device Owner ya activo (~95%)** como base; iOS no tiene etapa E asignada — entra como fase exploratoria tras el gate go/no-go de F4, y solo entonces se abrirá una rama SDD equivalente. Ninguna promesa de esta hoja de ruta asume paridad Android/iOS.

---

## 🔗 Cableado

| Contrato | Documento propietario | IDs citados |
|---|---|---|
| Estado real por capa (DO ~95% activo) | [CANON.md §2](../CANON.md) | — |
| Brechas que cada etapa cierra | [02/analisis-de-brechas.md](../02-arquitectura-tecnica/analisis-de-brechas.md) | GAP-01..GAP-10 |
| Backend, kill-switch y telemetría (E3/E5) | [02/telemetria-gcp-ai.md](../02-arquitectura-tecnica/telemetria-gcp-ai.md) · [02/modelo-de-datos-firestore.md](../02-arquitectura-tecnica/modelo-de-datos-firestore.md) | — |
| Pruebas de aceptación (EVA) | [02/calidad-y-despliegue.md](../02-arquitectura-tecnica/calidad-y-despliegue.md) | EVA-01..EVA-07 |
| Amenaza mitigada en E5 | [02/seguridad-y-privacidad.md](../02-arquitectura-tecnica/seguridad-y-privacidad.md) | THR-03 |
| Matriz de viabilidad Android/iOS y DO activo | [02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md) | — |
| Microapps web-first (E2) | [02/paradigma-web-first.md](../02-arquitectura-tecnica/paradigma-web-first.md) · [07/README.md](../07-plataforma-microapps/README.md) | — |
| Fases F1-F4 y sus criterios de salida | [04/roadmap.md](../04-operaciones-y-roadmap/roadmap.md) | F1, F2, F3, F4 |
| Cifras de score/latencia/batería | [04/progreso-y-metricas.md](../04-operaciones-y-roadmap/progreso-y-metricas.md) | — |
