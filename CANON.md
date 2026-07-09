# CANON.md — Reglas de Gobernanza y Decisiones Técnicas

Este documento contiene la verdad inmutable y el estado del proyecto ZentryOS. Ningún agente o plan de desarrollo puede contradecir lo establecido aquí.

---

## 1. Misión del Proyecto
ZentryOS es un launcher kiosk Android para niños y adolescentes (2-20 años) enfocado en la **Gobernanza Activa de la Atención**. Su propósito no es el bloqueo punitivo, sino redirigir los impulsos de dopamina rápida (redes sociales, scroll infinito) hacia flujos de productividad, estudio e interacciones físicas mediante un tutor de Inteligencia Artificial integrado.

---

## 2. Estado Real del Proyecto (Honesto)
* **Completitud Comercial:** ~5-8%.
* **UI/UX:** ~10% (Esqueleto básico en Jetpack Compose con glassmorphism incipiente).
* **Lógica Core:** ~10% (Navegación básica con stubs, sin lógica de negocio real).
* **Device Owner:** ~5% (Implementado solo como prueba en Redmi 9; código comentado en el codebase principal).
* **Backend:** ~5% (Firebase Vertex AI inicializado con fallos de configuración de APIs).
* **Tests:** 0% (Ningún test unitario o de integración).

---

## 3. Decisiones Técnicas Irrevocables (Pilares de Gobernanza)

### A. Device Owner & Kiosk Mode
* **Único Canal:** Se utiliza **Android Enterprise Device Owner** vía ADB (desarrollo) o aprovisionamiento QR en punto de venta como único mecanismo de control y bloqueo del dispositivo.
* **AccessibilityService RECHAZADO:** No se utiliza para monitoreo o control parental para evitar infracciones de políticas de Google Play y bloqueos automáticos en Android 17+.

### B. Integración con Google Workspace
* **No reinventar la rueda:** En lugar de crear clones de suites de oficina (Slides, Docs), ZentryOS **instala y controla las aplicaciones oficiales de Google Workspace** (Google Docs, Google Slides, Google Sheets) en el dispositivo.
* **Control de visualización:** ZentryOS (como Device Owner) permite el uso de estas apps específicas de Google, mientras mantiene oculto todo el resto del sistema (Chrome, Gmail, Play Store).

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
