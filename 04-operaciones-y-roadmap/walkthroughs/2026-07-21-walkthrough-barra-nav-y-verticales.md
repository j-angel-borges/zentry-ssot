# Walkthrough Técnico: Consolidación de Verticales + Rediseño de Barra de Navegación

**Fecha:** 2026-07-21
**Agente:** Claude Code (Opus 4.8) — sesión continua de implementación + iteración en vivo sobre Redmi 9

## 1. Resumen Ejecutivo

Sesión de dos tramos sobre el launcher ZentryOS (`zentrybyantig`). Tramo 1: se retomó y cerró un equipo agéntico interrumpido que eliminó Z-Slides, rediseñó la pantalla de inicio (búsqueda directa a Google, botón Zentry AI con doble-toque agéntico, página Google Workspace), creó el menú superior desplegable (controles rápidos + notificaciones) y dotó a la Calculadora de un tutor IA real con memoria persistente — documentado en detalle en `docs/evolution_walkthrough_16.md` del propio repo de la app. Tramo 2 (foco de esta sesión): rediseño completo de la barra de navegación inferior a partir de feedback directo del usuario tras probar en dispositivo — se corrigieron bugs de física de gestos poco fiables, un diseño que no coincidía con la referencia visual del usuario, y un bug de auto-expansión al abrir el teclado. Las cuatro iteraciones se verificaron en vivo sobre un Redmi 9 (M2003J15SC, Android 11 / API 30) vía ADB.

## 2. Archivos Modificados o Creados

**Tramo 1 — Consolidación de verticales** (ver detalle completo en `docs/evolution_walkthrough_16.md` en repo de la app):

- [x] `app/src/main/java/com/example/zentryconfig/ZentrySlidesScreen.kt` (eliminado — Z-Slides retirado)
- [x] `app/src/main/java/com/example/zentryconfig/ZentryTutorHubScreen.kt` (retícula 2x2 sin Z-Slides)
- [x] `app/src/main/java/com/example/zentryconfig/ZentryIntelligenceBridge.kt` (purga contrato z_slides; alta de contrato `calculator_tutor`)
- [x] `app/src/main/java/com/example/zentryconfig/ZentryOSHomeScreen.kt` (búsqueda inline a Google, botón AI toque/doble-toque, pager Workspace)
- [x] `app/src/main/java/com/example/zentryconfig/ZentrySafeBrowserScreen.kt` (arranque con query inicial)
- [x] `app/src/main/java/com/example/zentryconfig/ZentryCommandBar.kt` (apertura agéntica de apps)
- [x] `app/src/main/java/com/example/zentryconfig/ZentryQuickPanel.kt` (creado — panel de controles rápidos)
- [x] `app/src/main/java/com/example/zentryconfig/ZentryNotificationPanel.kt` (creado — panel de notificaciones)
- [x] `app/src/main/java/com/example/zentryconfig/core/ZentryNotificationListener.kt` (creado — NotificationListenerService)
- [x] `app/src/main/java/com/example/zentryconfig/ZentryScreenRecordService.kt` (creado — grabación de pantalla vía MediaProjection)
- [x] `app/src/main/java/com/example/zentryconfig/ZentryCalculatorScreen.kt` / `ZentryCalculatorViewModel.kt` (vista chat, fix de layout)
- [x] `app/src/main/java/com/example/zentryconfig/ZentryCalculatorDbHelper.kt` (creado — historial de 20 cálculos + memoria de chat 24h)
- [x] `app/src/main/AndroidManifest.xml` (permisos: Bluetooth, WRITE_SETTINGS, FOREGROUND_SERVICE+mediaProjection, BIND_NOTIFICATION_LISTENER_SERVICE)
- [x] `docs/evolution_walkthrough_16.md` (creado — walkthrough técnico del tramo 1, en el repo de la app)

**Tramo 2 — Rediseño de la barra de navegación** (foco de esta sesión, iterado 3 veces con feedback en vivo):

- [x] `app/src/main/java/com/example/zentryconfig/core/ZentrySystemState.kt` — reemplazado el flag `showNavBarOverZentry: Boolean` por un modelo reactivo completo: `navBarExpanded: StateFlow<Boolean>` (persistente, global, controlado solo por el gesto del usuario), `navBarHeightPx`/`navBarHandlePx` (geometría para el padding de Compose) y `navBarBackgroundArgb`/`navBarIconArgb` (tinte circadiano para la View nativa del overlay)
- [x] `app/src/main/java/com/example/zentryconfig/nav/ZentryNavAccessibilityService.kt` — reescritura completa de la barra: de un bloque opaco grueso (~104dp, `View.GONE` al ocultar) a una barra glass compacta con arquitectura asa+contenido (handle ~18dp / completa ~74dp), tinte circadiano, gesto de expandir/colapsar interceptado directamente en la View (`onInterceptTouchEvent`/`onTouchEvent`), animación de resorte (`OvershootInterpolator`/`AccelerateInterpolator` vía `View.animate()`), `systemGestureExclusionRects`, y el estado expandido/colapsado ya NO reacciona a `AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED`
- [x] `app/src/main/java/com/example/zentryconfig/MainActivity.kt` — el contenido reserva el espacio de la barra con `padding(bottom = navBarContentPad)` animado con resorte; tinte circadiano publicado a la barra nativa vía `LaunchedEffect(glassPalette.isDark)`; eliminado el `LaunchedEffect` que reseteaba la visibilidad de la barra por pantalla
- [x] `app/src/main/java/com/example/zentryconfig/ZentryQuickPanel.kt` — `GESTURE_STRIP_HEIGHT` 80dp → 160dp

## 3. Decisiones Técnicas y Descubrimientos

- **Causa raíz del bug "a veces no se mostraba/ocultaba":** con la barra en `View.GONE`, MIUI reclamaba el borde inferior de la pantalla. Fix: el overlay NUNCA desaparece — colapsado queda como un asa fina siempre presente (~18dp) dueña de esa región táctil.
- **Causa raíz del bug "se levanta sola con el teclado":** `TYPE_WINDOW_STATE_CHANGED` se disparaba al abrir el teclado IME. Fix: el estado expandido/colapsado lo controla EXCLUSIVAMENTE el gesto del usuario (`ZentrySystemState.navBarExpanded`).
- `Settings.Panel.ACTION_INTERNET` no existe en la API pública de Android — usar `Settings.Panel.ACTION_WIFI`.
- Puente de tinte circadiano hacia View nativa fuera de Compose mediante campos `@Volatile` ARGB en `ZentrySystemState`.
- Verificación end-to-end en dispositivo real Xiaomi Redmi 9 (Android 11 / API 30).

## 4. Inferencia de Impacto en SSOT (Para el Auditor)

- Impacta **Vertical 02 (Arquitectura Técnica)**: el sistema motion/glass (`interfaz-compose.md`) y la navegación kiosk (`control-dispositivo-abm.md`).
- Impacta **Vertical 04 (Operaciones y Roadmap)**: Calculadora con IA real + historial SQLite 24h, retirada de Z-Slides, menú desplegable superior.
