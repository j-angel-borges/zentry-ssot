# CANON.md — Reglas de Gobernanza y Decisiones Técnicas

Este documento contiene la verdad inmutable y el estado del proyecto ZentryOS. Ningún agente o plan de desarrollo puede contradecir lo establecido aquí.

---

## 1. Misión del Proyecto
ZentryOS es un launcher kiosk Android para niños y adolescentes (2-20 años) enfocado en la **Gobernanza Activa de la Atención**. Su propósito no es el bloqueo punitivo, sino redirigir los impulsos de dopamina rápida (redes sociales, scroll infinito) hacia flujos de productividad, estudio e interacciones físicas mediante un tutor de Inteligencia Artificial integrado.

---

## 2. Estado Real del Proyecto (Honesto)
* **Completitud Comercial:** ~8-12%.
* **UI/UX:** ~15% (Ajustes de Kiosco premium, integración de atajos nativos, diseño de barra inmersiva).
* **Lógica Core:** ~25% (Políticas MDM totalmente integradas, asignación automática de Launcher, limpieza masiva de bloatware y gestos de sistema activos).
* **Device Owner:** ~95% (Habilitado y testeado exitosamente en Redmi 9 físico; políticas de bloqueo y personalización 100% operativas).
* **Backend:** ~5% (Firebase Vertex AI inicializado con fallos de configuración de APIs).
* **Tests:** 0% (Ningún test unitario o de integración).

---

## 3. Decisiones Técnicas Irrevocables (Pilares de Gobernanza)

### A. Device Owner & Kiosk Mode
* **Único Canal:** Se utiliza **Android Enterprise Device Owner** vía ADB (desarrollo) o aprovisionamiento QR en punto de venta como único mecanismo de control y bloqueo del dispositivo.
* **AccessibilityService RECHAZADO:** No se utiliza para monitoreo o control parental para evitar infracciones de políticas de Google Play y bloqueos automáticos en Android 17+.
* **Asignación del Launcher:** Se fuerza programáticamente a ZentryOS como el Launcher preferido por defecto del sistema mediante `addPersistentPreferredActivity` al arrancar el Kiosco, eliminando bucles y fallos de pantalla negra (`ResolverActivity`).
* **Navegación y Notificaciones del Kiosco:** Se habilitan los gestos de pantalla, la barra de estado y la barra de notificaciones/ajustes rápidos de Android en Kiosco mediante `LOCK_TASK_FEATURE_HOME`, `LOCK_TASK_FEATURE_OVERVIEW`, `LOCK_TASK_FEATURE_SYSTEM_INFO` y `LOCK_TASK_FEATURE_NOTIFICATIONS`. Esto permite al usuario deslizar hacia abajo para ver las notificaciones e ingresar a los Ajustes del dispositivo.

### B. Integración con Google Workspace
* **No reinventar la rueda:** En lugar de crear clones de suites de oficina (Slides, Docs), ZentryOS **instala y controla las aplicaciones oficiales de Google Workspace** (Google Docs, Google Slides, Google Sheets) en el dispositivo.
* **Control de visualización y Bloatware:** ZentryOS (como Device Owner) oculta/congela de forma masiva y dinámica todo el bloatware y juegos de MIUI mediante `setApplicationHidden(..., true)`, excluyendo y protegiendo explícitamente las aplicaciones autorizadas (Google Play Store, Ajustes de Android `com.android.settings`, `com.android.settings.intelligence`, `com.xiaomi.misettings`, teclados activos y componentes core).
* **Whitelisting del Sistema:** Se autorizan explícitamente los paquetes `"com.android.settings"`, `"android"` (ResolverActivity) y `"com.android.systemui"` para garantizar que los diálogos de sistema y la configuración de gestos funcionen sin crashes.

### C. Cerebro Agéntico Central
* **Vertex AI + Firebase:** El tutor socrático interactúa con el niño y es capaz de ejecutar operaciones en el ecosistema (ej. crear un Google Docs con su tarea, agendar una alarma) utilizando **Function Calling** de Gemini.
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
10. Z-Slides (Render de diapositivas en JSON)
11. Study Assistant (Chat socrático MINEDU)
12. Navegación fluida con `AnimatedContent`

---

## 5. Reglas Duras de Desarrollo
1. **No Secretos en Git:** Está terminantemente prohibido guardar API keys, keystores, o `local.properties` en el repositorio.
2. **Ciclo de Compilación:** Compilar el proyecto con `./gradlew assembleDebug` después de cada cambio significativo.
3. **No Dependencias de Terceros:** No agregar librerías de Gradle sin aprobación explícita.
4. **Validación HITL (Human-In-The-Loop):** Toda alteración al AndroidManifest referente a permisos de Device Owner requiere validación del usuario antes de ser compilada.
