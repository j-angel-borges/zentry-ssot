# CANON.md — Reglas de Gobernanza y Decisiones Técnicas

Este documento contiene la verdad inmutable y el estado del proyecto ZentryOS. Ningún agente o plan de desarrollo puede contradecir lo establecido aquí.

> **Última consolidación:** 2026-08-23 (Consolidación del Gran Pivote **Web-First PWA** `zentryos-launcher-pwa` como núcleo primario del MVP para el **25/08/2026**, relegando el Android Device Owner nativo a segundo plano; formalización de la segmentación por edades 2-5 vs 5-10+ años, inmersión antropológica estilo iOS con micro-hápticos y Dynamic Island, depuración anti-ruido de interfaz, Zentry Media Engine curado con 4 plataformas, escáner y persistencia documental en Firestore del Parent Dashboard, y arquitectura multi-agente de 4 Git Worktrees con skills `pwa-operator-wt` y `pwa-merger-auditor`; ver `CHANGELOG-SSOT.md`). Este archivo se actualiza mediante las skills `agent-execute-wt` y `agent-auditor-ss` (ver `.agents/skills/`), nunca a mano de forma dispersa.

---

## 1. Misión del Proyecto
ZentryOS es un entorno y launcher (diseñado primariamente como PWA Web-First de alta fidelidad, con integración futura como Kiosk K-12) enfocado en la **Gobernanza Activa de la Atención**. Su propósito no es el bloqueo punitivo, sino redirigir los impulsos de dopamina rápida (redes sociales, scroll infinito) hacia flujos de aprendizaje, creatividad, estudio socrático e interacciones sensoriales vivas.

---

## 2. Estado Real del Proyecto (Honesto)
* **Completitud Comercial:** ~45%.
* **Paradigma Primario Actual:** **Web-First PWA (`zentryos-launcher-pwa`)**. React 19 + Tailwind CSS v4 + SingleFile Vite.
* **Hito Estratégico Innegociable:** **MVP presentable, fluido y demostrable al 100% para el martes 25 de agosto de 2026.**
* **UI/UX:** ~75% (Home Toddler con cajones bento simétricos, Home Explorer, Dynamic Island con telemetría viva, 4 portales de medios Liquid Glass y barra de navegación unificada).
* **Lógica Core & Microapps:** ~70% (Suite completa de 6 microapps de creación sensorial con física Apple Watch fisheye en cuadrícula de 160px, lienzos Art-Attack y enrutador de vistas).
* **Backend / IA & Voz:** ~65% (GCP Neural TTS con caché IndexedDB 0ms, perfiles por cohorte de edad, escáner de documentos con cámara en Parent Dashboard, persistencia Firestore GCP y C&C `LOCK_NOW`/`UNLOCK`).
* **Device Owner & Android Nativo:** ~95% (Completado y verificado en Redmi 9 físico en `zentryos-launcher-android`; **congelado en segundo plano** como puente MDM para la fase posterior al MVP de la PWA).
* **Tests:** 0% (Validación manual y verificación estricta de compilación `npm run build` SingleFile ~1.31 MB con Código 0).

> Nota de honestidad: El foco total y prioritario de desarrollo es la PWA (`zentryos-launcher-pwa`). El trabajo en Kotlin nativo y políticas de Device Owner queda en pausa estratégica hasta consolidar la entrega del MVP del 25/08.

---

## 3. Decisiones Técnicas Irrevocables (Pilares de Gobernanza)

### A. Paradigma Web-First PWA (Prioridad Absoluta)
* **Repositorio Central Activo:** `D:\1_jose_angel\1_GitHub\Zentry\zentryos-launcher-pwa`.
* **Empaquetado:** SingleFile HTML bundle mediante `vite-plugin-singlefile` para portabilidad y distribución inmediata.
* **Android Kiosk como Fase Posterior:** El APK nativo (`zentryos-launcher-android`) actuará como contenedor WebView/MDM cuando se requiera bloqueo físico a nivel de hardware.

### B. Segmentación Cognitiva por Edades
* **Vertiente 2 a 5 años (Toddler / Guiado):**
  * El sistema **habla, guía y enseña**: retroalimentación constante por voz, asistencia interactiva para aprender a tocar y deslizar.
  * Supresión total de herramientas complejas (Google Workspace, editores avanzados).
  * Microapps de co-creación y exploración sensorial lúdica.
* **Vertiente 5 a 10+ años (Explorer / Studio):**
  * Interfaz de sistema operativo completa, cajón de microapps (Study Assistant, redactor, investigación, calculadora, utilitarios) y widgets de productividad.

### C. Experiencia Sensorial Antropológica & Reducción de Ruido Visual
* **Supresión de Badges Punitivos:** Eliminación definitiva de textos como *"Fase Vespertina"* o *"Protegido por tus padres"* que generen fricción o sensación carcelaria. La protección debe sentirse transparente y natural.
* **Física y Micro-hápticos estilo iOS:** Respuesta háptica táctil (`navigator.vibrate`) en los deslizadores analógicos de brillo y volumen, gestos elásticos y animaciones fluidas en la Dynamic Island.

### D. Zentry Media Engine (Gobernanza de Dopamina)
* En lugar de bloquear el entretenimiento, ZentryOS integra 4 plataformas de consumo curado (**ZentryTube**, **ZentryTok**, **ZentryGram**, **ZentryStream**) con 50 piezas de contenido verificado cada una (STEM, ciencia, arte y habilidades) con reproductores oficiales embebidos, eliminando algoritmos de recomendación adictivos.

### E. Cerebro Agéntico Central & Tutor Socrático
* **Vertex AI + Firebase:** Tutor socrático guiado por System Instructions parametrizadas según la edad del usuario.
* **Modelo como Configuración:** Prohibido hardcodear identificadores de modelos en el código; se leen desde variables de entorno / configuración.

### F. Sincronización en Tiempo Real con Parent Dashboard
* Canal Firestore `zentryos` bidireccional entre `zentryos-launcher-pwa` y `zentry-parent-dashboard`:
  * Telemetría de batería, estado de conexión y tiempos de uso.
  * Canal C&C instantáneo para bloqueo (`LOCK_NOW`) y desbloqueo (`UNLOCK`).

### G. Arquitectura de Desarrollo Multi-Agente (Worktrees)
* 4 Git Worktrees paralelos bajo `zentryos-worktrees/`:
  1. `ui-shell` (Rama: `feat/ui-shell-age-tiering`, Puerto: `5175`)
  2. `microapps-ai` (Rama: `feat/microapps-ai-core`, Puerto: `5176`)
  3. `entertainment` (Rama: `feat/entertainment-hub`, Puerto: `5177`)
  4. `parental-sync` (Rama: `feat/parental-sync-bridge`, Puerto: `5178`)
* **Pipeline de Integración:** Todo operador emite su Walkthrough vía `pwa-operator-wt`; el Agente Mezclador valida `npm run build` en `master` vía `pwa-merger-auditor`.

---

## 4. Checklist Anti-Regresión (Features Demo MVP PWA)
Antes de dar por cerrado cualquier cambio en la PWA, se debe verificar que estas 12 capacidades funcionan limpiamente sin errores de consola ni TypeScript:

1. **Launcher Home:** Lienzo Liquid Glass, fondo dinámico y widgets interactivos.
2. **Selector de Edades:** Transición fluida entre modo 2-5 años (guiado/vocal) y 5-10+ años.
3. **Dynamic Island & Hápticos:** Despliegue de estado y vibración táctil en sliders de brillo/volumen.
4. **Zentry Media Engine:** Reproducción funcional en ZentryTube, ZentryTok, ZentryGram y Stream.
5. **Tutor IA Socrático:** Chat adaptado con respuestas contextuales y fallback local.
6. **Calculadora:** Operaciones matemáticas con panel táctil glass.
7. **Cámara:** Captura de fotos con visor en vivo.
8. **Reloj y Alarmas:** Cronómetro y temporizador funcional.
9. **Calendario:** Visualización de días y eventos.
10. **Explorador de Archivos:** Visualización de medios y documentos.
11. **Study Assistant:** Microapp de apoyo académico y preguntas guiadas.
12. **Firestore Sync:** Recepción de comandos remotos de bloqueo y actualización de estado.

---

## 5. Reglas Duras de Desarrollo
1. **No Secretos en Git:** Prohibido subir API keys, credenciales o `.env.local` al repositorio.
2. **Ciclo de Compilación:** Ejecutar `npm run build` tras cada tanda de cambios y verificar que genera el bundle `dist/index.html` con código 0.
3. **No Colisiones de Dependencias:** No agregar dependencias pesadas en `package.json` sin justificación técnica.
4. **Gobernanza SSOT:** Todo cambio arquitectónico se consolida mediante `pwa-operator-wt` / `agent-execute-wt` y se audita con `agent-auditor-ss`.