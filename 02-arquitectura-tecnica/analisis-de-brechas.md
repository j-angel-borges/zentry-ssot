---
title: "Análisis de Brechas: Auditoría Honesta del Prototipo al Producto Comercial"
date: 2026-07-25
status: "under-review"
progress: 35%
deadline: 2026-08-30
tags: ["zentryos", "ssot", "analisis-brechas"]
---

# 📉 Análisis de Brechas (Gap Analysis)

Auditoría de ingeniería sobre el paquete `com.example.zentryconfig`, reconciliada con el avance **empírico** verificado en Redmi 9 físico (25 jul 2026). Lectura canónica del estado: la **completitud de producto comercial es del ~20%**, pero repartida de forma muy desigual entre capas — y esta es la única forma autorizada de citar el avance (nunca "MVP al 95%" ni "5% total" a secas):

| Capa | Completitud | Evidencia |
|---|---|---|
| **Device Owner / confinamiento** | **~95%** | **Habilitado y testeado en Redmi 9 físico**: `isDeviceOwnerApp()=true`, LockTask persistente, `setApplicationHidden`, `addPersistentPreferredActivity`, restricciones de usuario y supresión de la barra MIUI vía `policy_control` immersive (permiso `WRITE_SECURE_SETTINGS`) |
| UI / UX | ~40% | Liquid Glass real (blur vía Haze + refracción AGSL), oscilador de motion con tres regímenes, barra de navegación global, pantallas Compose sobre Material 3 |
| Lógica core | ~40% | Bridge de IA, gestos, SQLite, ViewModels, `MonotonicClock` / `PolicyStore` / `ZentryFailSafeStateMachine` / `ZentryFirestoreSync` Kotlin nativo en Redmi 9 |
| Backend | ~35% | Conexión real end-to-end GCP Firestore `zentryos` operativa entre PWA Vercel y Redmi 9 físico (`ZentryFirestoreSync.kt`); canal C&C `LOCK_NOW`/`UNLOCK` activo en tiempo real; reglas de desarrollo desplegadas; `firebase-analytics` integrado |
| Tests | 0% | Sin pruebas unitarias, instrumentadas ni E2E de la superficie comercial |

> **Nota de reconciliación (canónica).** El backend dejó de ser un mapa en papel (anteriormente ~5%): la conexión real con GCP Firestore `zentryos` entre la PWA parental en Vercel (`zentry-parent-dashboard`) y el dispositivo Redmi 9 está **verificada en hardware**, con transmisión de batería real (63%) y canal C&C (`LOCK_NOW`/`UNLOCK`) operativo (**GAP-05 CERRADA**). El peso muerto actual se concentra en telemetría avanzada, App Check y testing.

La **demo-readiness es alta** (el guion de venta corre end-to-end, el confinamiento es real y la respuesta remota está conectada); la **completitud de producto comercial es ~20%**. Confundir ambas es el error que este documento corrige. Este satélite es el **propietario único** del registro de brechas (GAP) y el índice de cierre de la Vertical 02: su mapa GAP→THR→EVA verifica que todo ID citado aguas arriba quedó registrado (single-writer).

---

## 📋 Inventario honesto del prototipo

Base de build verificada: `com.example.zentryconfig` · compileSdk 36 · minSdk 24 · Gradle 9.4.1 / AGP 9.2.1 · Firebase AI Logic (dependencia `firebase-vertexai`) · `firebase-analytics` · CameraX · Compose + Material 3 · `BUILD SUCCESSFUL`. Model ID del tutor **siempre** vía `BuildConfig.ZENTRY_MODEL_ID` (`gemini-2.5-flash`), nunca literal en el código de negocio.

| Clase / Componente | Estado | Nota |
|---|---|---|
| `MainActivity` (navegación AnimatedContent) | FUNCIONAL | Orquestador central; gestos de 2 dedos e inicialización `ZentryFirestoreSync.startSync(this)` integrados |
| `ZentryOSHomeScreen` (launcher + timer circadiano) | FUNCIONAL | Dock + grid, widgets, fases circadianas |
| `ZentryAdminReceiver` | **ACTIVO** | **Declarado en el manifest; el Redmi 9 de laboratorio es Device Owner** (`dpm set-device-owner com.example.zentryconfig/.ZentryAdminReceiver`) |
| `ZentryPolicyManager` | **FUNCIONAL** | Envoltura **real** de `DevicePolicyManager` bajo guarda `isDeviceOwner()`: LockTask, `setApplicationHidden`, `addPersistentPreferredActivity`, restricciones de usuario; ningún método retorna el `false` de stub |
| `ZentryNavAccessibilityService` | FUNCIONAL | **Barra de navegación global** del shell confinado (volver/inicio/recientes dentro de la allowlist). Uso de AccessibilityService **exclusivamente como recurso de UI**; RECHAZADO por canon como monitoreo o control de contenido |
| `ZentryFirestoreSync.kt` | **ACTIVO** | **Módulo Kotlin nativo de sincronización en tiempo real** con GCP Firestore (`zentryos`); transmite latido de batería (63%) y escucha cola C&C `commands` (`LOCK_NOW`/`UNLOCK`) |
| `ZentryAiScreen` + ViewModel (chat tutor) | FUNCIONAL | Gemini vía Firebase AI Logic con fallback offline; model id vía `BuildConfig.ZENTRY_MODEL_ID`; sin App Check todavía |
| Microapps demo: `ZentryCalculatorScreen`, `ZentryCameraScreen`, `ZentryClockScreen`, `ZentryCalendarScreen`, `ZentryFilesScreen`, `ZentryStudyAssistantScreen`, `ZentryResearchScreen`, `ZentryRedactorScreen`, `ZentryCreationScreen` | FUNCIONAL | Cubren el checklist de no-regresión de [calidad y despliegue](./calidad-y-despliegue.md). **Las suites de ofimática (documentos, presentaciones) se gobiernan embebiendo/controlando las apps oficiales de Google Workspace y NotebookLM — no se reimplementan** (C3) |
| `ZentryIntelligenceBridge` (router de prompts) | FUNCIONAL | Contratos `study_assistant`, `[COMMAND:{...}]`; parser pendiente de allowlist endurecida. **Sin verbo `z_slides` / `crear_slide`** (eliminado por canon; Slides = Google Slides real) |
| `ZentryGestureDetector` | FUNCIONAL | Multitouch 2 dedos (pinch, pan) |
| `core/` (`MonotonicClock`, `PolicyStore`, `ZentryFailSafeStateMachine`) | FUNCIONAL | Reloj monotónico, caché de política y máquina fail-safe con tests unitarios locales |
| DbHelpers SQLite (`ZentryDbHelper`, `ZentryClockDbHelper`, `WorldGeneratorDbHelper`, `NeuroArtDbHelper`) | FUNCIONAL | Persistencia local operativa |
| `ZentryWorldGeneratorScreen`, `ZentryNeuroArtScreen` | PARCIAL | DB helpers funcionales; UI mínima |
| `ZentryBrowserScreen` / `SafeBrowserScreen` | PARCIAL | WebView operativa; controles de filtrado incompletos |
| `ZentryPhoneScreen` | STUB | UI simulada sin funcionalidad |

---

## 🔍 Matriz de brechas (registro GAP)

Columna **Estado** canónica: 🟢 CERRADA (verificada en hardware) · 🟡 PARCIAL (en verificación) · 🔴 ABIERTA.

| ID | Brecha | Estado | Evidencia actual | Impacto residual | Cierre / Mitigación | THR | EVA | Fase/Etapa |
|---|---|---|---|---|---|---|---|---|
| GAP-01 | Device Owner real | 🟢 **CERRADA** | Redmi 9 aprovisionado; `isDeviceOwnerApp()=true`; `ZentryAdminReceiver` activo en manifest | — (se **protege**, ya no se activa) | Config DO viva; guardrail = no regresionarla | THR-01, THR-02 | EVA-01..03 | **Hecho** / E4 |
| GAP-02 | Política de dispositivo aplicada | 🟢 **CERRADA** | `ZentryPolicyManager` aplica `DevicePolicyManager` real (`setApplicationHidden`, `addPersistentPreferredActivity`, restricciones); ningún stub retorna `false` | — | Envoltura DO operativa bajo `isDeviceOwner()` | THR-01, THR-02 | EVA-01, EVA-03 | **Hecho** / E4 |
| GAP-03 | LockTask persistente + bloqueo de barra/gestos | 🟢 **CERRADA** | LockTask persistente verificado; supresión de barra MIUI vía `policy_control` immersive (`WRITE_SECURE_SETTINGS`); navegación propia por `ZentryNavAccessibilityService` | — | Confinamiento activo en Redmi 9 | THR-01 | EVA-01 | **Hecho** / E4 |
| GAP-04 | Persistencia de arranque (Direct Boot) | 🟡 PARCIAL | LockTask/DO verificado; falta confirmar `directBootAware` + `ACTION_LOCKED_BOOT_COMPLETED` bajo EVA-02 | Ventana de evasión en el arranque en frío, sin certificar | Receiver de boot + Direct Boot + prueba EVA-02 | THR-01 | EVA-02 | E4 |
| GAP-05 | Backend inexistente: sin colecciones, reglas, listener C&C ni fail-safe **remoto** | 🟢 **CERRADA** | Conexión Firestore GCP `zentryos` activa end-to-end; PWA Vercel y Redmi 9 interconectados; listener C&C real (`LOCK_NOW`/`UNLOCK`) vía `ZentryFirestoreSync.kt` | Cobertura de emulador y reglas de prod pendientes | [modelo de datos](./modelo-de-datos-firestore.md) + [máquina fail-safe](./telemetria-gcp-ai.md) | THR-03, THR-04, THR-07, THR-08 | EVA-04..06 | **Hecho** / E3-E5 |
| GAP-06 | Capa IA sin blindaje operativo | 🔴 ABIERTA | model id ya vía `BuildConfig.ZENTRY_MODEL_ID` (nunca literal); falta App Check, manejo de cuota y allowlist endurecida del parser | Inyección de prompt y fragilidad operativa | Remote Config (override) + App Check + allowlist de comandos | THR-09 | EVA-07 | F1→F2 / E2-E3 |
| GAP-07 | Telemetría v1 inexistente | 🟡 PARCIAL | `firebase-analytics` integrado en APK Redmi 9; transmisión de latido de hardware (`batteryLevel`, `lastSeenAt`) activa en Firestore; falta agregador `telemetry_daily` | Falta consolidación diaria de métricas parentales | Agregados diarios en `telemetry_daily` | THR-05, THR-06 | Auditoría de payloads (E5) | F3 / E5 |
| GAP-08 | Testing de superficie comercial 0% | 🔴 ABIERTA | Solo tests unitarios de `core/`; sin instrumentadas ni E2E ni suite EVA | Sin score de evasión ni red de seguridad de regresión | Pirámide de pruebas + suite EVA ([calidad y despliegue](./calidad-y-despliegue.md)) | — | Toda la batería | F2 / E4-E5 |
| GAP-09 | Identidad de release de ejemplo | 🟡 PARCIAL | applicationId `com.example.zentryconfig` (DO probado con este id); sin firma gestionada ni flavors | El payload QR de producción depende del applicationId final | Flavors `lab`/`prod` + firma release **antes** de emitir QRs | — | EVA-03 (build prod) | F2 |
| GAP-10 | Superficies parciales | 🟡 PARCIAL | `ZentryPhoneScreen` stub; `SafeBrowserScreen` filtrado incompleto; WorldGenerator/NeuroArt UI mínima | Riesgo de pantalla rota en demo o piloto | Completar o excluir del guion tras feature flag | — | Checklist no-regresión | F1→F3 |

> Nota de alcance: la **memoria RAG del tutor** (hito F2 del [roadmap](../04-operaciones-y-roadmap/roadmap.md)) es evolución de producto, no brecha de seguridad, y por eso no ocupa un GAP; una versión anterior la mezclaba con el confinamiento.

---

## 🎯 Criterios de aceptación (Given / When / Then)

Regla de formato: todo *Then* referencia una prueba EVA o un artefacto verificable; **ningún** *Then* contiene cifras de latencia, batería o evasión (las cifras viven en [progreso y métricas](../04-operaciones-y-roadmap/progreso-y-metricas.md)). Las brechas 🟢 CERRADAS conservan su criterio como **prueba de no-regresión** (ya satisfecho en Redmi 9).

*   **GAP-01 — Device Owner activo** · 🟢 *verificado en Redmi 9*
    *Given* un Redmi 9 aprovisionado en laboratorio con `adb shell dpm set-device-owner com.example.zentryconfig/.ZentryAdminReceiver` · *When* arranca `MainActivity` · *Then* `isDeviceOwnerApp()` retorna `true` y `startLockTask()` entra en LockTask sin diálogo de confirmación (EVA-01, **cumplido**).
*   **GAP-02 — Políticas reales** · 🟢 *verificado*
    *Given* DO activo · *When* `ZentryPolicyManager.applyPolicy()` recibe la política cacheada · *Then* cada restricción se refleja en `DevicePolicyManager` (`setApplicationHidden`, `addPersistentPreferredActivity`, restricciones de usuario) y ningún método retorna el `false` de stub (EVA-01, EVA-03, **cumplido**).
*   **GAP-03 — Confinamiento de interfaz** · 🟢 *verificado*
    *Given* build DO en LockTask · *When* el menor ejecuta gestos de sistema y despliega la cortina · *Then* el launcher permanece en primer plano, la barra MIUI queda suprimida (`policy_control` immersive) y la navegación la provee `ZentryNavAccessibilityService` (EVA-01, **cumplido**).
*   **GAP-04 — Persistencia de arranque**
    *Given* el dispositivo apagado · *When* se enciende · *Then* el launcher toma el primer plano antes de que el sistema sea interactivo, incluyendo el arranque Direct Boot (EVA-02, **pendiente de verificación**).
*   **GAP-05 — Kill-switch con fail-safe**
    *Given* `devices/{deviceId}` con `activePolicy.isLocked = true` escrito por el padre · *When* el dispositivo está online · *Then* el cliente aplica el bloqueo y registra `appliedAt` en el comando (protocolo EVA-06). *And given* el dispositivo offline más allá del umbral de gracia · *Then* la política cacheada y los timers monotónicos siguen aplicándose (EVA-04, EVA-05).
*   **GAP-06 — IA blindada**
    *Given* `ai_model_id` resuelto por `BuildConfig.ZENTRY_MODEL_ID` con override de Remote Config y App Check activo · *When* se agota la cuota o el chat induce un comando fuera de allowlist · *Then* el tutor degrada a su fallback local sin crash y el comando se descarta y contabiliza (EVA-07).
*   **GAP-07 — Telemetría v1**
    *Given* un día de uso del dispositivo · *When* ocurre el cierre de día o la reconexión · *Then* existe exactamente un documento `telemetry_daily/{deviceId}_{yyyyMMdd}` con contadores y **cero texto libre** (auditoría de payloads E5).
*   **GAP-08 — Red de pruebas**
    *Given* el pipeline CI de la app operativo · *When* corre una build candidata · *Then* las unitarias y lint pasan, y la suite EVA aplicable publica su score conforme al criterio de salida de F2 definido en [calidad y despliegue](./calidad-y-despliegue.md).
*   **GAP-09 — Identidad comercial**
    *Given* el flavor `prod` con applicationId comercial y firma de release · *When* se genera el payload QR de Android Enterprise · *Then* un dispositivo de prueba se aprovisiona end-to-end y supera EVA-03 en esa build.
*   **GAP-10 — Superficies parciales**
    *Given* el guion de demo F1 · *When* se ejecuta completo frente a cliente · *Then* ninguna pantalla del checklist de no-regresión expone un estado stub; `ZentryPhoneScreen` y el navegador quedan fuera del guion o tras feature flag.

---

## 🛠️ Acciones inmediatas (frente residual tras el cierre del confinamiento)

### 1. PROTEGER la configuración Device Owner ya activa (GAP-01/02/03)

El confinamiento está **vivo y verificado**. Por tanto la acción HITL sensible ya **no** es "activar" el receiver, sino **proteger y no regresionar** la config DO en producción: cualquier cambio al `ZentryAdminReceiver` en el manifest, a la allowlist de LockTask o a la escritura de `policy_control` pasa por gate HITL de [calidad y despliegue](./calidad-y-despliegue.md). Envoltura de referencia (todo bajo guarda `isDeviceOwner()`):

```kotlin
val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
val admin = ComponentName(context, ZentryAdminReceiver::class.java)

if (dpm.isDeviceOwnerApp(context.packageName)) {
    // Confinamiento de tarea (verificado en Redmi 9)
    dpm.setLockTaskPackages(admin, arrayOf(context.packageName))
    dpm.addPersistentPreferredActivity(admin, launcherFilter, launcherComponent)

    // Ocultar superficies del sistema fuera de la allowlist
    dpm.setApplicationHidden(admin, "com.android.settings", true)

    // Endurecimiento de usuario
    dpm.addUserRestriction(admin, UserManager.DISALLOW_SAFE_BOOT)
    dpm.addUserRestriction(admin, UserManager.DISALLOW_ADD_USER)
    dpm.addUserRestriction(admin, UserManager.DISALLOW_FACTORY_RESET)
    dpm.addUserRestriction(admin, UserManager.DISALLOW_DEBUGGING_FEATURES)

    // Supresión de barra MIUI (permiso WRITE_SECURE_SETTINGS)
    Settings.Global.putString(context.contentResolver, "policy_control", "immersive.full")
}
```

> El componente admin real del prototipo es **`ZentryAdminReceiver`** (no la clase inexistente `ZentryDeviceAdminReceiver` que citaban versiones antiguas). La barra de navegación del shell la sirve `ZentryNavAccessibilityService` como recurso de UI, no como vía de monitoreo.

### 2. Direct Boot (GAP-04, PARCIAL)

*   Marcar la aplicación con `android:directBootAware="true"` en `AndroidManifest.xml` y registrar el receiver de `ACTION_LOCKED_BOOT_COMPLETED`.
*   Impacto: cerrar la ventana de evasión previa al desbloqueo y certificar EVA-02.

### 3. Identidad comercial (GAP-09, PARCIAL)

*   Flavors `lab`/`prod` + firma release **antes** de emitir QRs de aprovisionamiento de producción, para que el applicationId del payload QR sea el definitivo.

---

## 🔗 Cableado con la vertical (mapa de cierre GAP → THR → EVA)

Este mapa es la verificación final de la Vertical 02: toda amenaza tiene brecha asignada y toda brecha tiene prueba de cierre. Las filas del confinamiento ya están **certificadas** en hardware.

| GAP | Amenazas (THR) | Pruebas de cierre (EVA) | Estado | Documento de detalle |
|---|---|---|---|---|
| GAP-01..03 | THR-01, THR-02 | EVA-01, EVA-03 | 🟢 **CERRADAS** (Redmi 9) | [control-dispositivo-abm.md](./control-dispositivo-abm.md) |
| GAP-04 | THR-01 | EVA-02 | 🟡 PARCIAL | [control-dispositivo-abm.md](./control-dispositivo-abm.md) |
| GAP-05 | THR-03, THR-04, THR-07, THR-08 | EVA-04, EVA-05, EVA-06 | 🟢 **CERRADA** (Redmi 9 / Firestore) | [telemetria-gcp-ai.md](./telemetria-gcp-ai.md) · [modelo-de-datos-firestore.md](./modelo-de-datos-firestore.md) |
| GAP-06 | THR-09 | EVA-07 | 🔴 ABIERTA | [telemetria-gcp-ai.md](./telemetria-gcp-ai.md) · [seguridad-y-privacidad.md](./seguridad-y-privacidad.md) |
| GAP-07 | THR-05, THR-06 | Auditoría de payloads (E5) | 🟡 PARCIAL | [seguridad-y-privacidad.md](./seguridad-y-privacidad.md) |
| GAP-08..10 | — (habilitadores) | Batería completa + checklist no-regresión | 🔴/🟡 | [calidad-y-despliegue.md](./calidad-y-despliegue.md) |
