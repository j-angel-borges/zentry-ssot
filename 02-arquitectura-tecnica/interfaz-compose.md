---
title: "Interfaz Premium: Sistema Sensorial ZentryOS (Compose, Phygital e IA Ambiental)"
date: 2026-07-14
status: "under-review"
progress: 40%
deadline: 2026-08-30
tags: ["zentryos", "ssot", "interfaz-compose"]
---

# 🎨 Interfaz Premium: el Sistema Sensorial de ZentryOS

ZentryOS no compite con apps de control parental: compite con la sensación de usar un iPhone. Este documento es la **guía de desarrollo UI/UX para el ejecutor Antigravity 2.0** — traduce las tendencias de diseño de iOS 27 / WWDC26 (Liquid Glass, inteligencia ambiental, continuidad física) al stack real del prototipo (Jetpack Compose + Material 3, Redmi 9 como piso de hardware), y define cómo el confinamiento MDM/Device Owner **—ya activo y verificado en Redmi 9—** se convierte en una experiencia premium en lugar de una jaula.

> **Estado empírico (10–14 jul).** Buena parte de esta guía dejó de ser aspiracional: el blur premium ya se resolvió con la librería **Haze** (real, no un PNG), sobre ella corre una capa de **refracción AGSL** propia, la física de motion se calibró sobre un **oscilador de tres regímenes**, y el shell confinado ya sirve una **barra de navegación global**. El documento marca lo implementado frente a lo que sigue siendo objetivo.

## 🧭 Los cinco principios sensoriales

1. **El cristal está vivo**: las superficies translúcidas reaccionan al contenido que tienen debajo, al tacto y al movimiento — nunca son un PNG estático de "efecto vidrio".
2. **Todo se mueve con física**: cero animaciones lineales; todo es resorte (spring), interrumpible y con continuidad espacial. El dedo nunca espera a que termine una animación.
3. **La IA es ambiental, no un chatbot en una pestaña**: la inteligencia aparece donde está la tarea (escribir, dibujar, fotografiar), señalizada por un lenguaje visual único (el *Aura Zentry*), no encerrada en una pantalla de chat.
4. **Phygital**: el ciclo papel → cámara → IA → reto es un patrón de sistema, no una feature de una microapp.
5. **El confinamiento tiene dignidad**: los estados de bloqueo MDM son los momentos de mayor calidad visual del producto, jamás una pantalla roja punitiva. La seguridad se *siente* premium precisamente cuando restringe.

---

## 🏛️ Regla de superficie: gobernar Workspace, no clonarlo (C3)

Principio arquitectónico que precede a cualquier microapp de contenido: **el shell híbrido y las microapps INSTALAN, EMBEBEN y CONTROLAN las apps oficiales de Google Workspace** (Documentos, Presentaciones, Hojas de cálculo) y **NotebookLM** — no reimplementan las suites. La Device Owner-allowlist decide qué se ve; la interfaz Zentry las viste y orquesta.

*   **Microapps propias solo donde aportan valor único**: tutor IA, calculadora-chat, Lente Zentry (phygital), WorldGenerator, NeuroArt, Redactor con Writing Tools. Todo lo que Google ya hace mejor se gobierna, no se copia.
*   **Consecuencia directa**: no existe una "Z-Slides" ni un verbo `crear_slide`/`z_slides`. Crear una presentación significa abrir/controlar **Google Slides real** (o generarla vía NotebookLM), embebida y confinada dentro del shell.

---

## 🧊 Zentry Glass 2.0 (inspiración: Liquid Glass, OS 27)

Liquid Glass (WWDC26) fija el estándar de la industria: vidrio **fluido y dinámico que responde al contenido subyacente**, con un control de intensidad a nivel de sistema y adopción automática por el framework. Traducción a ZentryOS, ya **parcialmente implementada**:

### Sistema de 3 tiers del token `zentryGlass()`

El `zentryGlass(radius)` heredado (clip redondeado + blanco α0.45 + borde blanco α0.55) es la base **Tier C**. La versión 2.0 lo convierte en un sistema de 3 niveles según capacidad del dispositivo — el efecto se degrada, la geometría y la marca nunca:

| Tier | Requisito | Técnica | Estado |
|---|---|---|---|
| **A — Cristal líquido** | Android 13+ (AGSL) | **Blur real vía Haze** + `RuntimeShader` de **refracción AGSL** propio, barrido especular al tacto y distorsión de borde; tinte extraído del contenido subyacente (Palette API) | ✅ **Implementado empíricamente** (10–14 jul); ya no es aspiracional |
| **B — Cristal esmerilado** | Android 12 (API 31-32) | Haze / `RenderEffect.createBlurEffect` + tinte dinámico | Disponible, sin refracción |
| **C — Cristal sereno** | minSdk 24 → **incluye Redmi 9** | Capas alpha + gradiente iridiscente `#E6D4FF → #D4FFEA → #D4E8FF` | Piso de degradación cuando el perfil de jank no sostiene Tier A |

*   **Control de intensidad de cristal** (paridad con el slider del sistema de OS 27): ajuste único en la vista parental que regula transparencia/efectos en todo ZentryOS. Defaults por cohorte: **Infantil = intensidad baja + contraste alto** (legibilidad primero), Teen = intensidad plena. Esto cubre además la accesibilidad (transparencia reducida) que Apple dejó como pregunta abierta — ZentryOS la resuelve de serie.
*   **Regla de rendimiento**: un frame perdido cuesta más que un reflejo bonito. Tier A (Haze + AGSL) jamás se habilita si el perfil de jank del dispositivo no lo sostiene (protocolo de medición en [calidad y despliegue](./calidad-y-despliegue.md); cifras solo en [04](../04-operaciones-y-roadmap/progreso-y-metricas.md)).

## 🌊 Física de movimiento y continuidad

*   **Oscilador de tres regímenes (implementado)**: el motion se calibró sobre un oscilador armónico con tres regímenes seleccionables como presets de `spring()` — **sub-amortiguado** (rebote juguetón, cohorte Infantil), **crítico** (asentamiento sin overshoot, productividad Teen) y **sobre-amortiguado** (entrada suave y contenida). Es el motor real detrás de "todo se mueve con física"; ninguna curva lineal/ease genérica.
*   **Interrumpibilidad**: toda animación es interrumpible — un nuevo gesto redirige el movimiento en curso sin salto, alimentando el spring con la velocidad actual en lugar de reiniciarlo.
*   **Continuidad espacial**: transiciones con elemento compartido (shared element de Compose) entre grid del launcher → microapp: el icono *se convierte* en la pantalla, no "aparece otra pantalla". El patrón `AnimatedContent` actual se conserva como fallback.
*   **Paridad con OS 27 en manipulación directa**: contenedores **reordenables** (drag-to-reorder del grid del launcher para la personalización del menor) y **swipe actions universales** (posponer/completar retos, archivar creaciones) — el mismo lenguaje que iOS 27 llevó a todos los contenedores, implementado con los modificadores de arrastre de Compose.
*   **Coreografía háptica**: cada spring relevante lleva su firma táctil (`VibrationEffect` primitivo: tick al encajar el reorder, doble pulso suave al entrar en bloqueo, textura granular durante el escaneo phygital). El háptico es parte del design system, no un extra.
*   **MVI se mantiene** como patrón de estado (State inmutable + Intents + `StateFlow`), con `@Stable` en modelos y listas optimizadas para recomposición — el motor que hace posible interrumpir animaciones sin corromper estado.

## ✨ IA ambiental: el Aura Zentry

Inspiración directa de Apple Intelligence (WWDC26): la inteligencia **rodea** el contenido (glow perimetral de Siri, Writing Tools en cualquier campo de texto, on-device primero) en lugar de vivir en una app. ZentryOS adopta el patrón con su propio lenguaje:

### El Aura (lenguaje visual único de IA en todo el sistema)

| Estado del Aura | Señal visual | Cuándo |
|---|---|---|
| `AURA_IDLE` | Sin presencia; solo el avatar respira en el dock | IA disponible, nadie la invocó |
| `AURA_LISTENING` | Glow perimetral lavanda `#D6C8FA` suave, pulsante con el input | Dictado o campo activo con asistencia |
| `AURA_THINKING` | El glow rota como gradiente iridiscente; shimmer en el área de respuesta | Petición en vuelo — la coreografía **absorbe la latencia real** (streaming del primer token + render progresivo; jamás un spinner genérico ni promesas de instantaneidad) |
| `AURA_ACTING` | Barrido especular desde el aura hacia el elemento afectado | Un `[COMMAND:{...}]` validado ejecuta una acción (crear alarma, evento) |
| `AURA_OFF` | Badge discreto "tutor descansando" | Sin cuota / offline → fallback local del chat |

### Verbos de IA por microapp (análogo a App Intents)

Cada microapp registra en `ZentryIntelligenceBridge` sus **verbos de IA** — acciones estructuradas invocables desde el chat o desde otra microapp vía el contrato `[COMMAND:{...}]` (allowlist cerrada, [modelo de datos](./modelo-de-datos-firestore.md); endurecimiento THR-09/EVA-07 en [seguridad](./seguridad-y-privacidad.md)). Ejemplos objetivo: `programar_reto`, `guardar_creacion`, `resumir_investigacion`, `tutor_explicar`. El resultado: la IA se percibe **integrada en cada aspecto** porque cualquier superficie puede pedirle trabajo a cualquier otra.

> **Sin verbo de presentaciones propio (C3).** La creación de slides **no** es un verbo Zentry (`crear_slide`/`z_slides` quedaron eliminados): se delega en **Google Slides real** o **NotebookLM**, embebidos y gobernados por el shell. El bridge orquesta la app oficial, no una suite clonada.

### Inteligencia inline

*   **Redactor**: asistencia de escritura contextual (reformular, continuar, corregir) sobre el texto seleccionado — el patrón Writing Tools — con el Aura como indicador, servida por Gemini Flash vía Firebase AI Logic (**ID del modelo vía `BuildConfig.ZENTRY_MODEL_ID` = `gemini-2.5-flash`, nunca literal en el código; override por Remote Config**).
*   **Tips proactivos** (análogo TipKit): motor de sugerencias contextuales del tutor ("¿convertimos tu dibujo en un cuento?"), con presupuesto estricto — máx. 1 tip por sesión de microapp, descartable, y jamás interrumpe una tarea en curso.
*   **Dictado y voz**: entrada por voz en cohorte Infantil como ciudadano de primera clase (paridad con el empuje on-device de iOS 27); transcripciones procesadas bajo la [tabla canónica de privacidad](./seguridad-y-privacidad.md) — nunca salen del dispositivo.

## 📄 Phygital: el puente papel-pantalla como patrón de sistema

El ciclo de NeuroArt (papel → foto → IA → reto → cooldown) se eleva a **patrón de sistema** reutilizable por cualquier microapp:

1. **Lente Zentry**: superficie de captura común (CameraX) con detección de documento/dibujo (ML Kit on-device), recorte automático y coreografía de escaneo (barrido de luz + háptico granular).
2. **Enriquecimiento IA**: la captura entra al bridge con el contrato JSON de la microapp (contar un cuento sobre el dibujo, corregir el ejercicio en papel, digitalizar la maqueta).
3. **Devolución física**: el resultado siempre propone volver al mundo físico — un nuevo reto en papel, una plantilla imprimible, una misión fuera de pantalla. La pantalla es el intermediario, no el destino (es el argumento anti-ludopatía de la vertical 01 hecho interfaz).
4. **Tinta digital**: reconocimiento de escritura y bocetos a mano (ML Kit Digital Ink, offline) para WorldGenerator y Redactor — el menor escribe a mano sobre la pantalla y ZentryOS lo entiende.

## 🔒 UX del confinamiento: MDM/Device Owner como experiencia premium

La capa Device Owner ([control de dispositivo](./control-dispositivo-abm.md)) está **activa y verificada en Redmi 9** (GAP-01..03 cerradas en [análisis de brechas](./analisis-de-brechas.md)); este diseño **viste** un confinamiento que ya es real, sin debilitar sus garantías técnicas (EVA-01..05 intactas):

| Momento | Diseño | Anti-patrón que evita |
|---|---|---|
| **Ceremonia de nacimiento** (aprovisionamiento QR en punto de venta) | Secuencia coreografiada: escaneo → constelación de partículas formando el logo → "este dispositivo nació Zentry" → onboarding de personalidad del menor (TEC-05) | Un wizard corporativo gris de MDM empresarial |
| **Momento Zentry** (kill-switch / `isLocked=true`) | Gradiente respirando en Tier del dispositivo, motivo del bloqueo en lenguaje cálido ("Hora de cenar 🍽️"), mensaje opcional de la familia, reloj de reanudación | Pantalla roja "DISPOSITIVO BLOQUEADO" |
| **Anillo de gracia** (límite diario acercándose) | El anillo circadiano del launcher (TEC-01) cambia de fase con antelación amable; nudge háptico suave; nunca un corte sorpresivo | El corte abrupto que enseña al menor a odiar (y evadir) el sistema |
| **Honestidad offline** (fail-safe activo) | Badge sereno "protección local activa" cuando rige la política cacheada ([máquina fail-safe](./telemetria-gcp-ai.md)) | Fingir conectividad o esconder el estado |

Regla de oro: el menor ve **estados del mundo** (es de noche, es hora de cenar), no castigos del software. La autoridad es de la familia; la interfaz es el mensajero elegante.

### Barra de navegación global (`ZentryNavAccessibilityService`)

Dentro del shell confinado, la navegación (volver / inicio / recientes, siempre dentro de la allowlist) la provee una **barra de navegación global propia**, ya implementada empíricamente y dibujada con el lenguaje Zentry Glass. Se apoya en un `AccessibilityService` **exclusivamente como recurso de UI**.

> **Frontera canónica (C4).** AccessibilityService está **RECHAZADO** como mecanismo de monitoreo o control de contenido, y **PERMITIDO** únicamente como recurso de interfaz para operar esta barra de navegación. El confinamiento vive en Device Owner (LockTask, `policy_control` immersive), no en accesibilidad. La supresión de la barra nativa de MIUI y la barra propia de Zentry son dos caras del mismo confinamiento ya activo.

## 🧒 Adaptación por cohorte × ciclo circadiano

Matriz de modulación de tokens (los valores hex canónicos viven en [colorimetría](../05-mesa-de-trabajo/colorimetria-y-diseno.md); tipografía objetivo Outfit títulos / Inter cuerpo):

| Dimensión | Infantil (2-6) | Middle (7-12) | Teen/Juvenil (13-20) |
|---|---|---|---|
| Cristal | Intensidad baja, contraste alto | Media | Plena (Tier del hardware: Haze + AGSL) + variante productividad oscura permitida |
| Motion | Régimen sub-amortiguado (springs blandos, rebote) | Régimen crítico (equilibrado) | Régimen sobre-amortiguado / crítico (preciso y contenido) |
| Tipografía | Escala grande, Outfit redondeado | Escala media | Escala compacta, densidad de información |
| Aura | Avatar protagonista, voz primero | Avatar + texto | Aura minimalista, texto primero |
| Fase circadiana | Mañana 6-11 fría/brillante · tarde 12-17 neutra · noche 18-5 ámbar/tenue — modula luminosidad, temperatura y velocidad de motion en las tres cohortes | | |

## ⚙️ Rendimiento: el lujo invisible

iOS 27 vendió su rediseño con cifras de velocidad, no solo con cristal. ZentryOS adopta la misma doctrina en su piso de hardware (Redmi 9, Helio G80):

*   **Baseline Profiles + Macrobenchmark** como protocolo permanente (arranque en frío, jank de scroll del launcher, apertura de microapps) — el protocolo se define en [calidad y despliegue](./calidad-y-despliegue.md) y las cifras viven solo en [04](../04-operaciones-y-roadmap/progreso-y-metricas.md).
*   **Presupuesto por efecto**: cada shader/blur del design system (incluidos Haze y la refracción AGSL) declara su coste y su Tier mínimo; el sistema degrada efectos antes que frames.
*   **Regla del primer segundo**: la percepción premium se decide en el arranque del launcher y la primera transición — prioridad absoluta de optimización.

---

## 🧬 Catálogo GitHub: capacidades creativas de IA para las microapps

Referencias curadas para el ejecutor. **Guardrail vinculante**: ninguna se adopta como dependencia sin gate HITL (regla 2 de `00-guardrails.md`); licencias y mantenimiento se verifican en ese gate. Uso primario: leer patrones e implementaciones, no importar librerías a ciegas.

| Repositorio | Qué aporta | Microapp destino | Vía de adopción |
|---|---|---|---|
| [google-ai-edge/mediapipe](https://github.com/google-ai-edge/mediapipe) | Visión on-device: segmentación, gestos, landmarks — base del patrón Lente Zentry | Cámara, NeuroArt, Creation | Dependencia candidata (HITL) |
| [googlesamples/mlkit → android/digitalink](https://github.com/googlesamples/mlkit/tree/master/android/digitalink) | Reconocimiento de tinta digital offline (escritura a mano, bocetos, 300+ idiomas) | Redactor, WorldGenerator, NeuroArt | Dependencia candidata (HITL) |
| [android/compose-samples](https://github.com/android/compose-samples) | Patrones oficiales de Compose premium (motion, theming, arquitectura) | Todo el design system | Solo lectura de patrones |
| [Androidify (blog oficial Android)](https://android-developers.googleblog.com/2025/05/androidify-building-ai-driven-experiences-jetpack-compose-gemini-camerax.html) | Referencia oficial del pipeline Compose + Gemini + CameraX para experiencias IA | Cámara, Creation | Solo lectura de patrones |
| [Mortd3kay/liquid-glass-android](https://github.com/Mortd3kay/liquid-glass-android) | Glassmorphism con shaders AGSL (blur, distorsión, sombras; Android 13+) | Zentry Glass 2.0 Tier A | Referencia de implementación (HITL si se importa) |
| [drinkthestars/shady](https://github.com/drinkthestars/shady) | Galería de shaders AGSL renderizados en Compose | Zentry Glass 2.0, fondos vivos | Solo lectura de patrones |
| [JumpingKeyCaps/DynamicVisualEffectsAGSL](https://github.com/JumpingKeyCaps/DynamicVisualEffectsAGSL) | Shaders reactivos a tacto y sensores de movimiento — el "cristal vivo" | Aura, fondos, Momento Zentry | Solo lectura de patrones |
| [VinayByte/GeminiAI-jetpack-compose-android-sample](https://github.com/VinayByte/GeminiAI-jetpack-compose-android-sample) | Patrones de UI de chat IA en Compose (⚠️ usa el SDK `generativeai` antiguo: se leen sus patrones de UI, **jamás** su stack — el nuestro es Firebase AI Logic) | Chat tutor | Solo lectura de patrones |
| [g-aggarwal/Pollinator](https://github.com/g-aggarwal/Pollinator) | UX de text-to-image en Compose (generación vía red) | Creation, Redactor (prompts de imagen) | Solo lectura de patrones |
| [magenta/magenta-js](https://github.com/magenta/magenta-js) · [magenta-realtime](https://github.com/magenta/magenta-realtime) | Música generativa (MusicVAE, MelodyRNN; modelo live open-weights) ejecutable en navegador | Creation (música) vía [paradigma web-first](./paradigma-web-first.md) (WebView) | Módulo web-first (HITL) |
| [ShiftHackZ/Stable-Diffusion-KMP](https://github.com/ShiftHackZ/Stable-Diffusion-KMP) · [xororz/local-dream](https://github.com/xororz/local-dream) | Difusión de imágenes **on-device** (NPU/CPU) | Creation — **⛔ hardware-gated**: inviable en Redmi 9 (misma razón canónica por la que se descartó el LLM local); referencia para F4+ con hardware superior. La generación de imagen de la demo es serverless vía Firebase AI Logic | Referencia futura |

---

## 📅 Backlog de UI heredado (banco de ideas)

*   **[TEC-01] Anillo de tiempo circadiano**: integrado arriba como "Anillo de gracia" — superficie viva persistente del launcher.
*   **[TEC-05] Onboarding de personalidad**: integrado en la "Ceremonia de nacimiento" — el menor configura gustos e intereses en el primer arranque.

---

## 🔗 Cableado con la vertical

| Contrato compartido | Documento propietario | IDs citados aquí |
|---|---|---|
| Paleta canónica, tokens y tipografía | [05/colorimetria-y-diseno.md](../05-mesa-de-trabajo/colorimetria-y-diseno.md) | — |
| Estado del confinamiento (GAP-01..03 cerradas), barra de navegación y frontera AccessibilityService | [analisis-de-brechas.md](./analisis-de-brechas.md) · [control-dispositivo-abm.md](./control-dispositivo-abm.md) | GAP-01..04 (el diseño viste su enforcement ya activo) |
| Estados de bloqueo, fail-safe y semántica del kill-switch | [telemetria-gcp-ai.md](./telemetria-gcp-ai.md) | `OFFLINE_ENFORCED`, `activePolicy.isLocked` |
| Allowlist `[COMMAND:{...}]` y contratos JSON de microapps | [modelo-de-datos-firestore.md](./modelo-de-datos-firestore.md) | THR-09 vía [seguridad](./seguridad-y-privacidad.md) |
| Protocolos de rendimiento y jank (cifras en 04) | [calidad-y-despliegue.md](./calidad-y-despliegue.md) | EVA-07, checklist no-regresión |
| Privacidad de voz, dictado y creaciones | [seguridad-y-privacidad.md](./seguridad-y-privacidad.md) | Tabla canónica |
| Receta operativa para el ejecutor | Skill `zentry-design-system` (workspace) + [06/skills-recomendadas.md](../06-arquitectura-agentica/skills-recomendadas.md) | — |
