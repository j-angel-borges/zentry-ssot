---
title: "Skills Recomendadas: Curación de Habilidades y Skills Propias de ZentryOS"
date: 2026-07-14
status: "under-review"
progress: 100%
tags: ["zentryos", "ssot", "arquitectura-agentica", "skills"]
---

# 🧩 Skills Recomendadas

Las *skills* de Antigravity son playbooks reutilizables (`SKILL.md`) que el ejecutor invoca para tareas recurrentes. Este satélite cura el conjunto mínimo eficaz y especifica las **cuatro skills propias** de ZentryOS. Todo lo relativo al catálogo externo y a la instalación se marca **«validar en AGY instalado»** (fuente secundaria de superficie; la verdad de producto está en [`CANON.md`](../CANON.md)).

> **Cambio canónico**: el paradigma de microapps es **web-first** ([02/paradigma-web-first.md](../02-arquitectura-tecnica/paradigma-web-first.md), [Vertical 07](../07-plataforma-microapps/README.md)). Por eso la curación incorpora `zentry-web-microapp` (patrón PWA) y `zentry-device-owner` (operación y **protección** del Device Owner ya activo), y degrada `zentry-microapp-pattern` a **legacy**.

---

## ⚖️ Presupuesto de skills: máximo 8 activas

Cada skill activa consume ventana de contexto en cada turno del agente. Regla dura: **no más de 8 skills activas por proyecto** simultáneamente. Se prefiere un conjunto pequeño y de alta señal a un catálogo amplio que degrade la atención del modelo. Si una tarea necesita una skill fuera del conjunto activo, se activa temporalmente y se desactiva al cerrar.

## 📥 Instalación

```bash
# Explorador de skills de la comunidad (repo sickn33/antigravity-awesome-skills)
npx antigravity-awesome-skills
```

El comando lista e instala skills en el workspace («validar en AGY instalado»: confirmar ruta de instalación y sintaxis de `SKILL.md` contra la versión instalada de Antigravity antes de fijar el conjunto).

## 🎯 Conjunto curado (5 externas + 3 propias = 8 activas)

| Skill | Tipo | Estado | Para qué |
|---|---|---|---|
| `android-jetpack-compose-expert` | Externa | Activa | Cáscara nativa idiomática: Compose, recomposición, estado, Material 3, integración de Haze |
| `kotlin-coroutines-expert` | Externa | Activa | Corrutinas y `Flow` para el chat IA, listeners de Firestore y timers monotónicos |
| `firebase-integration` | Externa | Activa **desde E3** | Firebase AI Logic / Vertex AI, Firestore, Remote Config, App Check |
| `android-testing` | Externa | Activa | Unit + instrumented (JUnit, Espresso/UIAutomator) para la suite EVA |
| `gradle-build-doctor` | Externa | Activa | Diagnóstico de fallos de build **sin tocar dependencias** (respeta el guardrail Gradle) |
| **`zentry-design-system`** | **Propia** | Activa | Sistema **Liquid Glass** real (Haze) y tokens visuales de ZentryOS |
| **`zentry-web-microapp`** | **Propia** | Activa | Patrón de microapp **PWA web-first** (cableada por el JS Bridge) |
| **`zentry-device-owner`** | **Propia** | Activa | Operación y **protección** del Device Owner ya activo |
| `zentry-microapp-pattern` | Propia | **Legacy (instalada, inactiva)** | Patrón microapp **nativo** — superado por web-first; se activa solo para microapps de valor único |

> Externas **bajo demanda** (se activan puntualmente y se desactivan al cerrar, sin exceder el presupuesto de 8): `mobile-developer` (ciclo de vida, permisos, navegación). La lista externa es orientativa: los nombres exactos se confirman al ejecutar el explorador. Lo vinculante es el **presupuesto de 8**, la presencia de las **3 propias vigentes** y que `zentry-microapp-pattern` queda **legacy**.

---

## 🎨 Skill propia 1 — `zentry-design-system`

**Objetivo**: que toda UI nueva nazca con el sistema **Liquid Glass real (Haze)** y los tokens canónicos, sin recaer en la paleta índigo transitoria del prototipo.

Contenido conceptual del `SKILL.md` (contrato físico en `.agents/skills/zentry-design-system/SKILL.md`):

*   **Modificadores canónicos**: `zentryGlass(radius)` y `zentryVeil()` — implementación **real con la librería Haze** (blur nativo compositado), no simulaciones por alfa.
*   **Lienzo vivo**: fondo *mesh-gradient* iridiscente animado como superficie base de las pantallas.
*   **Fases circadianas**: mañana / tarde / noche modulan luminosidad y *motion*.
*   **Variantes por cohorte**: Infantil (2-6) lúdico y simplificado; Middle (7-12) intermedio; Teen/Juvenil (13-20) minimalista, con modo productividad oscuro permitido como variante.
*   **Tokens y paleta canónica** (hex, roles y contraste): **propiedad de** [05/colorimetria-y-diseno.md](../05-mesa-de-trabajo/colorimetria-y-diseno.md); la skill **referencia, no duplica** (disciplina de punteros del SSOT).
*   **Antipatrón bloqueado**: la paleta índigo transitoria del prototipo **no se propaga** a código nuevo; su migración se registra en el [backlog de tareas](../04-operaciones-y-roadmap/backlog-tareas.md), no la ejecuta la skill unilateralmente.

## 🌐 Skill propia 2 — `zentry-web-microapp`

**Objetivo**: crear una microapp de contenido como **PWA web-first**, embebida en la cáscara híbrida y cableada por el JS Bridge, sin reimplementar suites de oficina.

Receta conceptual (contrato físico en `.agents/skills/zentry-web-microapp/SKILL.md`; base en [Vertical 07](../07-plataforma-microapps/README.md)):

1. Partir de la [plantilla PWA](../07-plataforma-microapps/plantilla-microapp-pwa.md); aplicar los tokens Liquid Glass compartidos (paridad visual con `zentry-design-system`).
2. Declarar el contrato del [JS Bridge](../07-plataforma-microapps/contrato-js-bridge.md) (mensajes tipados hacia/desde la cáscara nativa); nada de acoplamientos ad-hoc.
3. Servir la microapp desde el hosting propio y registrarla en la [cáscara híbrida](../07-plataforma-microapps/arquitectura-cascara-hibrida.md).
4. **Google Workspace NO se clona, se gobierna**: para documentos/hojas/diapositivas se **instalan, embeben y controlan** las apps oficiales de Google (Docs, Slides, Sheets, NotebookLM, Gemini) y se lanzan desde el launcher. Las microapps propias solo se crean donde aportan **valor único** (tutor IA, calculadora-chat).
5. Si la microapp usa IA, el ID del modelo se lee **siempre** de `BuildConfig.ZENTRY_MODEL_ID` (hoy `gemini-2.5-flash`), **nunca** un literal en código.
6. Cierre: verificar en el Redmi 9, pasar el checklist anti-regresión de 12 features ([`CANON §4`](../CANON.md)) y entregar Walkthrough.

## 🔐 Skill propia 3 — `zentry-device-owner`

**Objetivo**: operar y **proteger** el Device Owner que **ya está activo y aprovisionado** — no «activarlo». El DO está habilitado y testeado en Redmi 9 físico (~95%): `LockTask`, `setApplicationHidden`, `addPersistentPreferredActivity`, `WRITE_SECURE_SETTINGS` y supresión de la barra MIUI vía `policy_control` *immersive*.

Contenido conceptual (contrato físico en `.agents/skills/zentry-device-owner/SKILL.md`):

*   **Superficie protegida**: `ZentryAdminReceiver` (registrado) y `ZentryPolicyManager` (aplica políticas **reales**, no stubs). GAP-01/02/03 están en gran parte **cerradas y verificadas**, no pendientes.
*   **Regla dura**: **NO** alterar el `AndroidManifest`, el registro del receiver ni ningún permiso/política DO sin **HITL** — el riesgo es romper un kiosco funcional, no reactivarlo.
*   **Cómo extender políticas** sin tocar la superficie sensible: usar la API de `DevicePolicyManager` ya cableada; verificar cada cambio contra la batería de evasión (EVA-01..03) en el Redmi 9.
*   **Frontera de compliance**: el confinamiento se apoya en Device Owner, **no** en `AccessibilityService`; este último queda **prohibido** para monitoreo/control y permitido **solo** como recurso de UI (`ZentryNavAccessibilityService`, barra de navegación propia).

## 🧱 Skill propia 4 (legacy) — `zentry-microapp-pattern`

**Estado**: **legacy**, superada por `zentry-web-microapp`. Se mantiene instalada pero **inactiva**; se activa puntualmente solo para las microapps **nativas de valor único** (tutor IA, calculadora-chat) que no migran a PWA.

Receta conceptual (patrón nativo `Zentry<X>Screen.kt`):

1. Crear `Zentry<X>Screen.kt` (Compose, tokens Liquid Glass del design system).
2. Añadir `<X>ViewModel` si hay estado; `<X>DbHelper` (SQLite) solo si hay persistencia — reutilizar helpers existentes primero.
3. Registrar el system prompt y el contrato JSON estricto en `ZentryIntelligenceBridge.kt` si la microapp usa IA (modelo vía `BuildConfig.ZENTRY_MODEL_ID`).
4. Añadir la entrada de navegación en `MainActivity.kt` (`AnimatedContent`).
5. Verificar compatibilidad con los gestos de sistema y la barra de navegación global.
6. Cierre: compilar, pasar el checklist anti-regresión, entregar Walkthrough.

> No se crean clones nativos de suites de oficina ni pantallas tipo `ZentrySlidesScreen`: esa función la cubren las apps oficiales de Google Workspace embebidas.

---

## 🔗 Cableado

| Contrato | Documento |
|---|---|
| Decisiones irrevocables (web-first, DO activo, Workspace se gobierna, AccessibilityService acotado) | [CANON.md §3](../CANON.md) |
| Tokens, paleta canónica y cohortes (fuente de negocio) | [05/colorimetria-y-diseno.md](../05-mesa-de-trabajo/colorimetria-y-diseno.md) |
| Paradigma híbrido web-first (base de `zentry-web-microapp`) | [02/paradigma-web-first.md](../02-arquitectura-tecnica/paradigma-web-first.md) · [07/README.md](../07-plataforma-microapps/README.md) |
| Contrato del JS Bridge y plantilla PWA | [07/contrato-js-bridge.md](../07-plataforma-microapps/contrato-js-bridge.md) · [07/plantilla-microapp-pwa.md](../07-plataforma-microapps/plantilla-microapp-pwa.md) |
| Device Owner activo + AccessibilityService como recurso de UI | [02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md) |
| Skill de testing → suite EVA | [02/calidad-y-despliegue.md](../02-arquitectura-tecnica/calidad-y-despliegue.md) |
| Migración de la paleta transitoria | [04/backlog-tareas.md](../04-operaciones-y-roadmap/backlog-tareas.md) |
| Guardrail que protege la superficie DO | [reglas-y-guardrails.md](./reglas-y-guardrails.md) |
