# CANON.md — Reglas de Gobernanza y Decisiones Técnicas

Este documento contiene la verdad inmutable y el estado del proyecto ZentryOS. Ningún agente o plan de desarrollo puede contradecir lo establecido aquí.

> **Última consolidación:** 2026-07-25 (incorpora conexión real end-to-end GCP Firestore `zentryos` entre PWA Dashboard en Vercel y APK nativo Android en Redmi 9 físico con latido de batería real 63%, escucha reactiva C&C `LOCK_NOW`/`UNLOCK` vía `ZentryFirestoreSync.kt`, depuración anti-mock y `firebase-analytics`; Cierre de GAP-05 y avance de GAP-07; ver `CHANGELOG-SSOT.md`). Este archivo se actualiza mediante las skills `agent-execute-wt` y `agent-auditor-ss` (ver `.agents/skills/`), nunca a mano de forma dispersa.

---

## 1. Misión del Proyecto
ZentryOS es un launcher kiosk Android para niños y adolescentes (2-20 años) enfocado en la **Gobernanza Activa de la Atención**. Su propósito no es el bloqueo punitivo, sino redirigir los impulsos de dopamina rápida (redes sociales, scroll infinito) hacia flujos de productividad, estudio e interacciones físicas mediante un tutor de Inteligencia Artificial integrado.

---

## 2. Estado Real del Proyecto (Honesto)
* **Completitud Comercial:** ~20%.
* **UI/UX:** ~50% (Sistema Liquid Glass real vía Haze — `zentryGlass`/`zentryVeil`, lienzo vivo mesh-gradient, refracción AGSL —; menú superior desplegable evolucionado con toggles directos y long-press para Wi-Fi, Bluetooth y Datos, control directo de Linterna, deslizadores táctiles Glass de brillo y volumen, y respuesta háptica nativa; barra de navegación glass compacta asa+contenido persistente; verificado en Redmi 9 físico).
* **Lógica Core:** ~40% (Políticas MDM integradas, asignación automática de Launcher, limpieza masiva de bloatware, gestos de sistema, Escudo de Notificaciones, Terminal agéntica local Modo Escudo/Monje, supresión de la barra de MIUI, grabación de pantalla vía MediaProjection).
* **Device Owner:** ~95% (Habilitado y testeado exitosamente en Redmi 9 físico; políticas de bloqueo y personalización 100% operativas; `WRITE_SECURE_SETTINGS` aprovisionado; supresión de barra nativa vía `policy_control` immersive).
* **Backend / IA Local:** ~35% (Conexión real end-to-end con GCP Firestore `zentryos` verificada en hardware; SDK v9 en PWA Vercel `zentry-parent-dashboard` + módulo Kotlin `ZentryFirestoreSync.kt` en Redmi 9; transmisión de latido de batería real (63%) y canal C&C en tiempo real `LOCK_NOW`/`UNLOCK` en subcolección `commands`; depuración anti-mock completa; `firebase-analytics` integrado; Firebase AI Logic / Vertex AI con `gemini-2.5-flash` y tutor IA socrático).
* **Tests:** 0% (Ningún test unitario o de integración).

> Nota de honestidad: "demo-readiness" (alta) ≠ "completitud de producto comercial" (~20%). El canal remoto C&C y el latido de hardware son reales y verificados en Redmi 9 físico (GAP-05 CERRADA); la telemetría masiva (GAP-07), App Check / seguridad prod y los tests siguen siendo la brecha principal.

---

## 3. Decisiones Técnicas Irrevocables (Pilares de Gobernanza)

### A. Device Owner & Kiosk Mode
* **Único Canal:** Se utiliza **Android Enterprise Device Owner** vía ADB (desarrollo) o aprovisionamiento QR en punto de venta como único mecanismo de control y bloqueo del dispositivo.
* **AccessibilityService — uso acotado (reconciliado 2026-07-14):** RECHAZADO como mecanismo de **monitoreo o control parental** (evita infracciones de políticas de Google Play y bloqueos de Android 17+ Advanced Protection). SÍ se utiliza, en cambio, como recurso de **interfaz de sistema**: la barra de navegación propia de ZentryOS (`ZentryNavAccessibilityService` — dibuja la barra glass, ejecuta `performGlobalAction(BACK/HOME/RECENTS)` sobre apps de terceros y hospeda el watchdog que reafirma la supresión de MIUI). La distinción es la clave de compliance: no observamos ni restringimos comportamiento del menor por accesibilidad; solo proveemos navegación.
* **Asignación del Launcher:** Se fuerza programáticamente a ZentryOS como el Launcher preferido por defecto del sistema mediante `addPersistentPreferredActivity` al arrancar el Kiosco, eliminando bucles y fallos de pantalla negra (`ResolverActivity`).
* **Navegación del Kiosco:** Se habilitan los gestos de pantalla nativos de Android en Kiosco mediante `LOCK_TASK_FEATURE_HOME` y `LOCK_TASK_FEATURE_OVERVIEW` para permitir la fluidez dentro de aplicaciones como Google Play Store. La barra de estado superior y el panel de notificaciones permanecen restringidos para la seguridad del modo de bloqueo. El acceso a los Ajustes se canaliza directamente a través del cajón de aplicaciones del Launcher.

### B. Integración con Google Workspace
* **No reinventar la rueda:** En lugar de crear clones de suites de oficina (Slides, Docs), ZentryOS **instala y controla las aplicaciones oficiales de Google Workspace** (Google Docs, Google Slides, Google Sheets) en el dispositivo.
* **Control de visualización y Bloatware:** ZentryOS (como Device Owner) oculta/congela de forma masiva y dinámica todo el bloatware y juegos de MIUI mediante `setApplicationHidden(..., true)`, excluyendo y protegiendo explícitamente las aplicaciones autorizadas (Google Play Store, Ajustes de Android `com.android.settings`, `com.android.settings.intelligence`, `com.xiaomi.misettings`, teclados activos y componentes core).
* **Whitelisting del Sistema:** Se autorizan explícitamente los paquetes `"com.android.settings"`, `"android"` (ResolverActivity) y `"com.android.systemui"` para garantizar que los diálogos de sistema y la configuración de gestos funcionen sin crashes.

### C. Cerebro Agéntico Central
* **Vertex AI + Firebase:** El tutor socrático interactúa con el niño y es capaz de ejecutar operaciones en el ecosistema (ej. crear un Google Docs con su tarea, agendar una alarma) utilizando **Function Calling** de Gemini.
* **Modelo como configuración, nunca literal:** el identificador del modelo se lee de `BuildConfig.ZENTRY_MODEL_ID` (hoy `gemini-2.5-flash`, vía Firebase AI Logic / Vertex AI). PROHIBIDO hardcodear un id de modelo en el código de las microapps o citar una versión como decisión permanente en la documentación.
* **No PDF generation on-device:** La generación de reportes o resúmenes primero crea un documento en Google Docs y luego lo exporta, en lugar de intentar renderizar PDFs complejos por código local.

### D. Hardware de Desarrollo
* **Xiaomi Redmi 9** (Helio G80, 3-4GB RAM). Todo desarrollo debe optimizarse para no exceder los límites de RAM de este dispositivo (ej. no LLMs locales, renderizado de Compose ligero para evitar Battery Overhead).

---

## 4. Checklist Anti-Regresión (Features Demo)
Antes de finalizar cualquier tarea de desarrollo, se debe comprobar manualmente en el dispositivo físico que estas 12 características fundamentales siguen funcionando sin crashes:

1. Launcher Home (Fondo iridiscente + widgets de reloj)
2. Gesto de dos dedos (Pinch para entrar a personalización)
3. Temporizador Circadiano (Colores adaptivos según hora)
4. Chat del Tutor IA (Con fallback de respuestas locales offline)
5. Calculadora (Operaciones básicas)
6. Cámara (Captura de foto/video con CameraX)
7. Reloj / Alarmas (Guardado en SQLite local)
8. Calendario Escolar (Gestión básica de eventos)
9. Explorador de archivos (Acceso seguro a fotos)
10. Google Workspace (Slides/Docs/Sheets instalados y lanzables desde el launcher — se controlan las apps oficiales, no se clonan; ver §3B)
11. Study Assistant (Chat socrático MINEDU)
12. Navegación fluida con `AnimatedContent` + barra de navegación de sistema global

---

## 5. Reglas Duras de Desarrollo
1. **No Secretos en Git:** Está terminantemente prohibido guardar API keys, keystores, o `local.properties` en el repositorio.
2. **Ciclo de Compilación:** Compilar el proyecto con `./gradlew assembleDebug` después de cada cambio significativo.
3. **No Dependencias de Terceros:** No agregar librerías de Gradle sin aprobación explícita.
4. **Validación HITL (Human-In-The-Loop):** Toda alteración al AndroidManifest referente a permisos de Device Owner requiere validación del usuario antes de ser compilada.
