---
title: "Arquitectura de la Cáscara Híbrida: Gobierno de Workspace, Contenedor WebView, Ciclo de Vida y Rendimiento"
date: 2026-07-14
status: "under-review"
progress: 90%
tags: ["zentryos", "ssot", "plataforma-microapps", "arquitectura"]
---

# 🏗️ Arquitectura de la Cáscara Híbrida

Define cómo el shell nativo hace dos cosas distintas: **gobierna** las apps oficiales de Google Workspace (instaladas, no clonadas) y **hospeda** las microapps propias de valor único (PWAs). Cubre las capas, el contenedor WebView, el ciclo de vida de una microapp propia y — la restricción que lo condiciona todo — el presupuesto de memoria del Redmi 9.

---

## 🧅 Las capas (dos carriles de contenido)

```text
┌─────────────────────────────────────────────────────────────┐
│  CAPA 1 — SHELL NATIVO (Kotlin/Compose) — el OS real         │
│  MainActivity · Launcher · Device Owner (~95% real, Redmi 9) │
│  · Aura · gestos · timer circadiano · momentos MDM ·         │
│  barra de navegación de sistema · navegación AnimatedContent │
└──────────────┬───────────────────────────────┬──────────────┘
     gobierna   │  (instala / oculta / presenta) │  hospeda y gobierna
                ▼                                ▼
┌──────────────────────────────┐   ┌────────────────────────────────┐
│  CARRIL A — WORKSPACE OFICIAL │   │  CAPA 2 — ZentryWebHost (Kotlin)│
│  Docs · Slides · Sheets ·     │   │  WebView endurecida · JS Bridge │
│  NotebookLM · Gemini          │   │  · allowlist de orígenes ·      │
│  Apps de Google INSTALADAS,   │   │  gestor de ciclo de vida/memoria│
│  NO clonadas; controladas por │   │  · precarga de Service Worker · │
│  el Device Owner              │   │  puente de tema (cohorte/circad.)│
│  (setApplicationHidden con    │   └───────────────┬────────────────┘
│   exclusiones, tiles, allowlist)│           carga │ desde hosting propio
└──────────────────────────────┘                   ▼
                              ┌────────────────────────────────────────┐
                              │  CAPA 3 — MICROAPPS PROPIAS (PWA)       │
                              │  Calculadora-chat · Tutor socrático ·   │
                              │  (SOLO donde aportan valor único)       │
                              │  cada una: HTML/JS/CSS + Service Worker │
                              │  + SDK del bridge + Firebase AI Logic JS│
                              └────────────────────────────────────────┘
```

La Capa 1 es el sistema operativo de facto, **ya real** (Device Owner ~95%, testeado en Redmi 9 — [CANON](../CANON.md) §2). El **Carril A** es puro gobierno: las suites de oficina son apps oficiales de Google que el shell instala, presenta (tiles del launcher) y controla (Device Owner) — **no se reimplementan** ([CANON](../CANON.md) §3.B). La **Capa 2** es la innovación de esta vertical: un contenedor único, reutilizable y endurecido que cualquier microapp **propia** usa sin reimplementar seguridad ni ciclo de vida. La **Capa 3** es contenido propio, acotado a lo diferencial, desplegado server-side.

> **Frontera clave**: las apps de Workspace **no** viven en la Capa 3 ni cargan en el `ZentryWebHost` como PWAs propias. Son procesos oficiales de Google gobernados por la Capa 1. La Capa 3 es exclusivamente para microapps propias (calculadora-chat, tutor).

---

## 🏛️ Carril A — cómo se gobierna Workspace (sin clonarlo)

El shell nativo, como Device Owner, aplica sobre las apps oficiales:

| Acción de gobierno | Mecanismo |
|---|---|
| Instalación / disponibilidad | Aprovisionadas vía Google Play (whitelisteada en kiosk) por el Device Owner |
| Visibilidad selectiva | `setApplicationHidden(pkg, true/false)` — se ocultan bloatware y juegos; se **excluyen y protegen** Docs/Slides/Sheets/NotebookLM/Gemini y componentes core ([CANON](../CANON.md) §3.B) |
| Presentación | Tiles en el grid del launcher que lanzan la app oficial; nada de UI clonada |
| Encuadre de tareas del tutor | El cerebro agéntico (Function Calling) crea un Google Docs, agenda una alarma, etc. — opera **sobre** las apps oficiales, no sobre clones ([CANON](../CANON.md) §3.C) |

Resultado: cero mantenimiento de una suite propia, siempre a la última versión de Google, y todo el privilegio de control en manos del Device Owner ya activo.

---

## 📦 `ZentryWebHost`: el contenedor único de las microapps propias

Un solo Composable/Activity nativo que toda microapp **propia** reutiliza. Responsabilidades:

| Responsabilidad | Implementación |
|---|---|
| Renderizado web | `WebView` con `WebSettings` endurecidos (JS on, DOM storage on, file access off, `LOAD_CACHE_ELSE_NETWORK`) |
| Seguridad de navegación | `WebViewClient.shouldOverrideUrlLoading` con allowlist; nada fuera del hosting Zentry carga |
| Puente | Inyecta `ZentryBridge` (`@JavascriptInterface`) — contrato en [contrato-js-bridge.md](./contrato-js-bridge.md) |
| Tema | Pasa cohorte + fase circadiana a la microapp al cargar (para que el CSS espeje el design system) |
| Ciclo de vida | Pausa/reanuda/destruye la WebView según foco (ver abajo) |
| Aceleración | Hardware acceleration ON en la Activity anfitriona; viewport fijado a escala nativa |

**Regla arquitectónica**: hay **un** `ZentryWebHost`, no uno por microapp. El shell le indica qué microapp propia cargar (URL del hosting + parámetros de tema); el host reusa la instancia WebView cuando es seguro, o la recicla bajo presión de memoria.

---

## 🔁 Ciclo de vida de una microapp propia

```text
[tile en launcher] --tap--> [ZentryWebHost carga URL microapp propia]
                                      │
                          onPageFinished → inyecta tema + señala AURA_IDLE
                                      │
     [microapp en foco: WebView RESUMED, Service Worker activo]
                                      │
   usuario sale ──► [WebView PAUSED, estado serializado en sessionStorage]
                                      │
   presión de memoria ──► [WebView DESTROYED; se recrea al volver desde caché SW]
```

*   **Una sola microapp en foco**: el shell nunca mantiene dos WebViews activas. Al cambiar de microapp, la anterior se pausa o destruye.
*   **Persistencia de sesión**: antes de pausar, la microapp serializa su estado (borrador, posición) en `sessionStorage`/IndexedDB; al reanudar, rehidrata. El usuario percibe continuidad sin coste de memoria.
*   **Arranque en frío desde caché**: gracias al Service Worker precargado, recrear una WebView destruida sirve HTML/JS/CSS desde el almacenamiento local — sin depender de la red.

---

## 🧮 Presupuesto de memoria y rendimiento (Redmi 9, Helio G80, 3-4 GB)

La restricción que gobierna el diseño. Directrices duras (aplican a las microapps propias; las apps de Workspace son procesos oficiales que el sistema gestiona aparte):

| Directriz | Regla |
|---|---|
| WebViews concurrentes | **Máximo 1 activa**; las demás pausadas o destruidas |
| Precarga | Solo el Service Worker de la microapp en foco; nada de prefetch masivo |
| Assets | Presupuesto por microapp (HTML+JS+CSS+imágenes) declarado; imágenes en formatos ligeros (WebP/AVIF) y perezosas |
| Animación web | CSS/compositor GPU; nada de JS de layout en el hot path |
| Fallback de tier | Igual que el shell nativo: si el dispositivo no sostiene efectos, la microapp degrada glass/blur antes que perder frames |
| Convivencia con Workspace | No se mantiene una microapp propia en foco mientras el usuario opera una app de Workspace pesada; el launcher libera la WebView |
| Medición | Protocolo de jank y memoria por microapp en [02/calidad-y-despliegue.md](../02-arquitectura-tecnica/calidad-y-despliegue.md); cifras solo en [04/progreso-y-metricas.md](../04-operaciones-y-roadmap/progreso-y-metricas.md) |

**Regla del primer segundo (heredada del shell)**: la microapp debe pintar su primer frame útil desde caché antes de cualquier llamada de red. La IA (que sí necesita red) se resuelve después, señalizada por la Aura — nunca bloquea el arranque.

---

## 🎨 Continuidad visual shell ↔ microapp propia

El usuario no debe percibir la costura entre lo nativo y lo web (para el Carril A, Workspace conserva su propia identidad de Google, lanzado desde tiles del shell):

1. **Transición**: al abrir una microapp propia, el shell usa su transición de elemento compartido; el `ZentryWebHost` muestra un placeholder con el color de la microapp hasta `onPageFinished`, evitando el flash blanco del WebView.
2. **Tema espejado**: el host inyecta cohorte + fase circadiana; el CSS de la microapp aplica los mismos tokens (paleta canónica, glass, luminosidad circadiana) — detalle en [plantilla-microapp-pwa.md](./plantilla-microapp-pwa.md).
3. **Aura compartida**: los estados de IA de la microapp se pintan con el mismo lenguaje Aura del shell, coordinados por el bridge.

---

## 🔗 Cableado con la vertical

| Contrato compartido | Documento propietario |
|---|---|
| Superficie del bridge y seguridad de navegación | [contrato-js-bridge.md](./contrato-js-bridge.md) |
| Design system web y estructura de la microapp | [plantilla-microapp-pwa.md](./plantilla-microapp-pwa.md) |
| Origen de las URLs y allowlist | [motor-hosting-y-despliegue.md](./motor-hosting-y-despliegue.md) |
| Gobierno de Workspace y Device Owner (~95% real) | [02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md) · [CANON §3.B](../CANON.md) |
| Diseño del shell nativo que hospeda | [02/interfaz-compose.md](../02-arquitectura-tecnica/interfaz-compose.md) |
| Protocolos de rendimiento/memoria (cifras en 04) | [02/calidad-y-despliegue.md](../02-arquitectura-tecnica/calidad-y-despliegue.md) |
