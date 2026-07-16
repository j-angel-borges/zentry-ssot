---
title: "Plataforma Híbrida de Microapps: el Paradigma Web-First de ZentryOS"
date: 2026-07-14
status: "under-review"
progress: 90%
tags: ["zentryos", "ssot", "plataforma-microapps"]
---

# 🧬 Vertical 7: Plataforma Híbrida de Microapps

Esta vertical **eleva a eje operativo** el paradigma que `02/paradigma-web-first.md` ya había anticipado, pero lo hace con una corrección de rumbo canónica (ver [CANON](../CANON.md) §3.B): ZentryOS es una **cáscara de sistema nativa** — el OS real, con **Device Owner ~95% ya habilitado y testeado en Redmi 9 físico** — que hace dos cosas con el contenido:

1. **GOBIERNA y PRESENTA** las aplicaciones oficiales de **Google Workspace** (Docs, Slides, Sheets, NotebookLM, Gemini): las instala, las lanza desde el launcher y las controla como Device Owner. **No las reimplementa.**
2. **Hospeda un número acotado de microapps propias** construidas como PWAs, servidas desde hosting propio y cableadas al sistema por un JS Bridge — **solo donde aportan valor único** que Workspace no da (tutor socrático de IA, calculadora-chat).

Nace de una realidad medida: reimplementar suites de oficina — en Compose nativo **o** en PWAs propias — es tirar el tiempo cuando Google ya las regala y el Device Owner puede instalarlas y gobernarlas. El esfuerzo propio se reserva para lo diferencial; el stack web (ZentryHub/Vite) acelera esas piezas propias y la venta directa con Device Owner hace **innecesarias las tiendas para distribuir el contenido propio**.

No es un giro improvisado: es la consolidación disciplinada de una arquitectura ya bendecida por CANON, con la profundidad que el producto exige.

---

## 🎯 La tesis en una frase

**El sistema es nativo; las suites de oficina se gobiernan (Workspace oficial); lo diferencial se construye web.** Lo que exige control de hardware, seguridad y privilegios de OS vive en Kotlin. Lo que Google ya resuelve (Docs/Slides/Sheets/NotebookLM/Gemini) se instala y se controla, no se clona. Lo que exige iteración rápida e IA propia con valor único vive en la web, dentro de la cáscara.

---

## 🧱 La frontera nativo / gobernado / web (contrato fundacional)

| Responsabilidad | Capa | Por qué ahí |
|---|---|---|
| Launcher, home, grid, dock | **Nativo (Compose)** | Es el shell del OS; reemplaza la experiencia del dispositivo |
| Device Owner, LockTask, kiosk, `setApplicationHidden`, allowlist | **Nativo — ~95% real, testeado en Redmi 9** | Privilegio de sistema — **imposible desde una PWA**; **ya operativo** ([CANON](../CANON.md) §2/§3.A) |
| Barra de navegación de sistema (`ZentryNavAccessibilityService`) | **Nativo** | AccessibilityService **solo como recurso de UI** (dibuja la barra, `performGlobalAction`) — **nunca** como monitoreo/control parental ([CANON](../CANON.md) §3.A) |
| Gestos de 2 dedos, timer circadiano | **Nativo** | Acceso a sensores y ciclo de vida del sistema |
| Aura IA, momentos MDM, Zentry Glass del shell | **Nativo** | Diseño de sistema ([02/interfaz-compose.md](../02-arquitectura-tecnica/interfaz-compose.md)) — **sobrevive intacto** |
| Apps de **Google Workspace** (Docs/Slides/Sheets/NotebookLM/Gemini) | **Oficial de Google — instalada y GOBERNADA por el shell** | No se clonan: se **instalan, presentan y controlan** (Device Owner: `setApplicationHidden` con exclusiones, tiles del launcher, allowlist) ([CANON](../CANON.md) §3.B) |
| Contenedor WebView + JS Bridge | **Nativo** | Es el puente; el anfitrión de las **microapps propias** |
| Microapps **propias de valor único** (calculadora-chat, tutor socrático) | **Web (PWA)** | Contenido diferencial iterable; IA vía bridge/Firebase AI Logic JS; despliegue server-side |
| Cámara / Lente Zentry, háptica, persistencia | **Nativo, expuesto al web** vía bridge | El hardware es nativo; el web lo invoca por contrato |
| Telemetría v1, políticas, kill-switch | **Nativo** | Seguridad y fail-safe offline ([02/telemetria-gcp-ai.md](../02-arquitectura-tecnica/telemetria-gcp-ai.md)) |

Regla de oro: **ninguna microapp web toca el sistema directamente**; todo pasa por el [contrato JS Bridge](./contrato-js-bridge.md), con allowlist y validación de origen. Y **ninguna microapp reimplementa Workspace**: las suites se gobiernan como apps oficiales instaladas.

---

## 🔄 Qué conserva, qué gobierna y qué construye respecto al paradigma anterior

**Se conserva intacto** (la cáscara y su seguridad son la base real, no una aspiración):
- Toda la capa Device Owner/MDM ([02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md)) — **ya activa (~95%), testeada en Redmi 9 físico**; ahora es también quien **controla la allowlist del navegador**, gobierna qué Workspace se muestra (`setApplicationHidden` con exclusiones), impide desinstalar el shell y kioskea el contenido web. El paradigma web **se apoya en** un Device Owner fuerte que **ya existe**.
- El diseño premium del shell ([02/interfaz-compose.md](../02-arquitectura-tecnica/interfaz-compose.md)): Aura, Zentry Glass, fases circadianas, momentos MDM, barra de navegación de sistema — aplican a la cáscara nativa.
- El esquema Firestore, el fail-safe offline y la privacidad ([02](../02-arquitectura-tecnica/)) — sin cambios.

**Se gobierna, no se clona** (corrección canónica clave — [CANON](../CANON.md) §3.B):
- Docs, Slides, Sheets, NotebookLM y Gemini son **apps oficiales de Google** que el Device Owner instala y controla. **No hay PWA propia ni pantalla nativa que las reemplace.** `ZentrySlidesScreen` y el contrato `z_slides` quedan **ELIMINADOS** (ver [migración](./migracion-y-coexistencia.md)); se usan **Google Slides / NotebookLM reales**, presentados desde el launcher.

**Se construye web** (mapa completo en [migracion-y-coexistencia.md](./migracion-y-coexistencia.md)):
- El patrón "microapp propia = `Zentry<X>Screen` nativa" → **"microapp propia = PWA"**, pero **solo** para las piezas de valor único ([plantilla-microapp-pwa.md](./plantilla-microapp-pwa.md)).
- La skill `zentry-microapp-pattern` (nativa) → marcada **legacy**; nace `zentry-web-microapp`.
- Las microapps propias del prototipo con valor diferencial (calculadora-chat, tutor/Study Assistant) → migran a web por fases, con fallback nativo durante la transición.

---

## 🏪 Independencia de tiendas para el contenido propio (matiz comercial)

Porque el asesor aprovisiona el dispositivo con Device Owner en la venta directa, ZentryOS **no necesita tiendas para distribuir su contenido propio** (las microapps de valor único). El matiz importa para no contradecir a CANON §3.A/§3.B:

1. El shell nativo se instala **una vez** en el punto de venta (aprovisionamiento QR / sideload — [control de dispositivo](../02-arquitectura-tecnica/control-dispositivo-abm.md)).
2. Las **microapps propias** se cargan desde **hosting propio** y se actualizan **del lado del servidor**, al instante, sin re-publicar nada ([motor-hosting-y-despliegue.md](./motor-hosting-y-despliegue.md)).
3. Las **apps de Workspace**, en cambio, se **instalan desde Google Play** (aprovisionadas y gobernadas por el Device Owner) — Play Store está whitelisteada y alcanzable en kiosk por diseño ([CANON](../CANON.md) §3.A).
4. El Device Owner aplica la **allowlist de dominios**: para el contenido web propio, solo el hosting de Zentry carga.

Así, la restricción del canal se vuelve ventaja **donde importa**: iteración diaria del contenido propio sin fricción de revisión de tiendas — mientras Workspace se apoya en las apps oficiales, siempre actualizadas por Google.

---

## ⚖️ Realidades de ingeniería asumidas con honestidad

- **Memoria del Redmi 9 (3-4 GB)**: las WebViews pesan más que Compose. Disciplina obligatoria: una WebView activa a la vez, caché por Service Worker, sin PWAs en paralelo ([arquitectura-cascara-hibrida.md](./arquitectura-cascara-hibrida.md)).
- **Sin WebAPK / Play Services para lo propio**: no se usa el "instalar PWA" del navegador (frágil en kiosk). Las microapps propias son **tiles del launcher nativo** abiertas en WebView full-screen; las apps de Workspace son apps oficiales instaladas, no PWAs.
- **Superficie de seguridad WebView**: mitigada por allowlist de orígenes, `shouldOverrideUrlLoading` y validación de origen en el bridge ([contrato-js-bridge.md](./contrato-js-bridge.md)).
- **Alcance realista**: la completitud comercial y el backend siguen siendo bajos (cifras solo en [CANON](../CANON.md) §2 y [04/progreso-y-metricas.md](../04-operaciones-y-roadmap/progreso-y-metricas.md)); esta vertical acelera lo diferencial, no infla el estado del producto.
- **iOS**: las PWAs son más limitadas en iOS; irrelevante hoy (iOS está gated en fases posteriores).

---

## 📂 Contenido del Módulo

1. **[Arquitectura Cáscara Híbrida](./arquitectura-cascara-hibrida.md)**: capas, gobierno de Workspace, contenedor WebView, ciclo de vida de una microapp propia, gestión de memoria y rendimiento en Redmi 9.
2. **[Contrato JS Bridge](./contrato-js-bridge.md)**: superficie bidireccional web↔nativo (Aura, cámara, háptica, IA, sistema gated), esquema de mensajes y seguridad. *Propietario del contrato.*
3. **[Plantilla Microapp PWA](./plantilla-microapp-pwa.md)**: el patrón de una microapp propia — estructura, design system web, SDK del bridge, wiring de IA, offline. *Propietario del patrón.*
4. **[Motor de Hosting y Despliegue](./motor-hosting-y-despliegue.md)**: hosting, versionado, carga desde el launcher, actualización server-side, allowlist. *Propietario del hosting.*
5. **[Migración y Coexistencia](./migracion-y-coexistencia.md)**: mapa de supersesión native→gobernado/web, orden de migración, fallback y criterios de paridad.
6. **[Orquestación Sprint Microfactory](./orquestacion-sprint-microfactory.md)**: la macro-tarea de Antigravity para el Sprint 1 (motor de hosting + plantilla + primera microapp propia de referencia).

---

## 🔗 Cableado con el resto del SSOT

| Contrato compartido | Documento propietario | Uso en esta vertical |
|---|---|---|
| Paradigma web-first fundacional (JS Bridge, Service Workers) | [02/paradigma-web-first.md](../02-arquitectura-tecnica/paradigma-web-first.md) | Semilla arquitectónica; esta vertical es su desarrollo completo |
| Device Owner (~95% real) / allowlist / kiosk / gobierno de Workspace | [02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md) | Enforcement del contenido web y control de las apps oficiales |
| Diseño del shell (Aura, glass, circadiano) | [02/interfaz-compose.md](../02-arquitectura-tecnica/interfaz-compose.md) | La cáscara que hospeda las microapps |
| Contratos JSON de IA (`study_assistant`, `calc_chat`, `chat`) | [02/modelo-de-datos-firestore.md](../02-arquitectura-tecnica/modelo-de-datos-firestore.md) | Reutilizados por las microapps propias |
| Amenazas de superficie web y privacidad | [02/seguridad-y-privacidad.md](../02-arquitectura-tecnica/seguridad-y-privacidad.md) | THR-09 (bridge), tabla canónica de datos |
| Ejecución agéntica del sprint | [06/roadmap-sdd.md](../06-arquitectura-agentica/roadmap-sdd.md) | El sprint microfactory traza a las etapas E |
| Capas de desarrollo L1-L6 | [04/plan-maestro-por-capas.md](../04-operaciones-y-roadmap/plan-maestro-por-capas.md) | La plataforma reubica L1 (contenido propio) en web |
| Estado real, cifras y decisiones irrevocables | [CANON.md](../CANON.md) | Fuente única del estado; los demás docs enlazan |
