---
title: "Orquestación Sprint Microfactory: Dirigir a Antigravity a Construir el Motor de Microapps Propias"
date: 2026-07-14
status: "under-review"
progress: 85%
tags: ["zentryos", "ssot", "plataforma-microapps", "orquestacion"]
---

# 🎼 Orquestación del Sprint 1 — Microfactory

Este documento dirige a Antigravity 2.0 a construir la **infraestructura reutilizable** del paradigma híbrido: el contenedor `ZentryWebHost` + el JS Bridge + la plantilla de microapp propia + el pipeline de hosting, con **una microapp de referencia** (calculadora-chat) que demuestra el patrón de punta a punta. Objetivo: que a partir de este sprint, cada microapp **propia** posterior salga en horas, no en días.

> **Premisa canónica ([CANON](../CANON.md) §2)**: el sprint construye **sobre** una base ya real — la cáscara nativa con **Device Owner ~95% habilitado y testeado en Redmi 9**. El ejecutor **no activa** nada del Device Owner (ya lo está): lo **protege** y se apoya en su allowlist. Y **no clona Workspace**: las suites son apps oficiales gobernadas ([CANON](../CANON.md) §3.B).

Contiene: (1) el **mega-prompt** copiable a Antigravity, (2) la **dotación de capacidades** (skill + regla), (3) la **guía de validación humana**, (4) el **semáforo de salud** del sprint.

---

## 🎯 Entregable del sprint (Definition of Done)

1. `ZentryWebHost` — contenedor WebView único, endurecido, con `ZentryBridge` inyectado y allowlist de origen (evoluciona `ZentryBrowserScreen`).
2. SDK cliente del bridge (`zentry-bridge.js`) que las microapps propias importan.
3. Plantilla de microapp PWA conforme (estructura + `zentry-tokens.css` + Service Worker + wiring de IA).
4. **Calculadora-chat** de referencia, construida con la plantilla, cargando en `ZentryWebHost`, con al menos un flujo de IA por el bridge (`calc_chat`/`chat`).
5. Pipeline de despliegue a hosting (aunque sea a un entorno de staging) + smoke test.
6. Todo compila (`assembleDebug` verde, [CANON](../CANON.md) §5.2), pasa el checklist anti-regresión de 12 features, y entrega Walkthrough — **sin tocar la configuración Device Owner ya activa ni el AndroidManifest**.

---

## 🧠 Estrategia de ejecución: SDD + sub-agentes + loop engineering

El mega-prompt instruye a Antigravity a **desplegar sub-agentes especializados** vía su Agent Manager, coordinados por un plan SDD y gobernados por los guardrails ya instalados ([06/reglas-y-guardrails.md](../06-arquitectura-agentica/reglas-y-guardrails.md)). División de trabajo:

| Sub-agente | Responsabilidad | Insumo SSOT |
|---|---|---|
| **Arquitecto de contenedor** | `ZentryWebHost` + `ZentryBridge` nativo | [contrato-js-bridge.md](./contrato-js-bridge.md), [arquitectura](./arquitectura-cascara-hibrida.md) |
| **Ingeniero de plantilla** | Estructura PWA + `zentry-tokens.css` + SDK bridge + Service Worker | [plantilla-microapp-pwa.md](./plantilla-microapp-pwa.md) |
| **Integrador de IA** | Wiring de `requestAI` y/o Firebase AI Logic JS en la microapp de referencia (model id desde config, nunca literal) | [02/modelo-de-datos-firestore.md](../02-arquitectura-tecnica/modelo-de-datos-firestore.md) · [CANON §3.C](../CANON.md) |
| **Ingeniero de hosting** | Estructura de publicación versionada + smoke test | [motor-hosting-y-despliegue.md](./motor-hosting-y-despliegue.md) |
| **Crítico adversarial** | Intenta refutar seguridad/paridad de cada pieza antes de cerrarla; verifica que nada roce la config DO ni clone Workspace | [contrato-js-bridge.md](./contrato-js-bridge.md) (THR-09) |

---

## 📋 EL MEGA-PROMPT (copiar a Antigravity)

> Pégalo en una sesión limpia de Antigravity sobre el workspace `zentrybyantig`, con la skill `zentry-web-microapp` instalada y el modo de trabajo profundo activo (ver §Dotación). Modelo del ejecutor sugerido: un modelo **Pro (High)** para la arquitectura del `ZentryWebHost`/bridge; **Flash** para el boilerplate de la plantilla y CSS (política económica + escalada). *No confundir el modelo del ejecutor con el `ZENTRY_MODEL_ID` del producto.*

```text
ROL: Eres el ejecutor de ZentryOS. Vas a construir el MOTOR DE MICROAPPS PROPIAS del
paradigma híbrido (Cáscara Híbrida). Trabajarás largo, profundo y verificado, en modo
Spec-Driven Development, desplegando sub-agentes cuando aporte, y deteniéndote en los
gates HITL. Respetas SIEMPRE los guardrails instalados y CANON.md.

CONTEXTO (cárgalo, NO improvises arquitectura):
- Carga la vertical 07 (plataforma de microapps). Es tu especificación maestra.
- La cáscara nativa y el Device Owner YA ESTÁN ACTIVOS (~95%, testeados en Redmi 9). NO los
  tocas salvo para EVOLUCIONAR ZentryBrowserScreen → ZentryWebHost. NO modifiques el
  AndroidManifest ni la política Device Owner: está viva y es carga crítica. PROTÉGELA.
  Cualquier cambio al Manifest/DO es gate HITL humano (CANON §5).
- NO clones Google Workspace: Docs/Slides/Sheets/NotebookLM/Gemini son apps oficiales que
  el Device Owner instala y gobierna. No existe contrato z_slides ni verbo crear_slide.
- Reutiliza ZentryIntelligenceBridge y los contratos JSON existentes (study_assistant,
  calc_chat, chat). El id de modelo se lee de BuildConfig.ZENTRY_MODEL_ID / config remota,
  JAMÁS un literal en el cliente.

OBJETIVO DEL SPRINT (Definition of Done): construir, en este orden,
(1) ZentryWebHost + ZentryBridge (contrato en contrato-js-bridge.md),
(2) el SDK cliente zentry-bridge.js,
(3) la plantilla de microapp PWA conforme (plantilla-microapp-pwa.md),
(4) la microapp de referencia calculadora-chat con un flujo de IA por el bridge,
(5) el pipeline de publicación a staging + smoke test.

FASES (monohilo, build-verify tras cada archivo significativo):

FASE 0 — COMPRENSIÓN. Lee la vertical 07 completa y ESCRIBE en el Implementation Plan tu
entendimiento de: la frontera nativo/gobernado/web, el contrato del bridge, y la restricción
de memoria del Redmi 9. No toques código hasta que el plan esté aprobado (gate HITL).

FASE 1 — ANÁLISIS (sub-agente arquitecto). Mapea ZentryBrowserScreen/ZentrySafeBrowserScreen
reales y diseña ZentryWebHost como su evolución: WebSettings endurecidos, allowlist en
shouldOverrideUrlLoading, ZentryBridge con la superficie EXACTA de contrato-js-bridge.md
(ni un método de más; NINGUNO que toque la config Device Owner ya activa). Produce árbol de
decisión.

FASE 2 — PLAN ATÓMICO + GATE HITL. Implementation Plan archivo por archivo. Espera aprobación.

FASE 3 — IMPLEMENTACIÓN (monohilo, checkpoints frecuentes):
  3a. ZentryWebHost + ZentryBridge (nativo). Build. Test del bridge contra mock.
  3b. zentry-bridge.js (SDK cliente) + zentry-tokens.css (espejo del design system).
  3c. Plantilla PWA: index.html, manifest, sw.js (precache + offline), src/ scaffold.
  3d. Calculadora-chat de referencia sobre la plantilla; un flujo requestAI('calc_chat'|'chat').
  3e. Pipeline: publish a staging + smoke test contra la URL.

FASE 4 — AUTO-EVALUACIÓN ADVERSARIAL (sub-agente crítico). Por cada pieza, intenta REFUTAR:
  ¿el bridge expone algún método que toque la config Device Owner o el Manifest? ¿algún path
  clona una app de Workspace? ¿carga algún origen fuera del hosting Zentry? ¿la microapp
  arranca sin red? ¿hay credencial o model id literal en el cliente? Lo que no sobreviva la
  crítica, se corrige.

FASE 5 — AUTO-CORRECCIÓN + TESTS. Unit del bridge y del parser JSON; smoke de la microapp;
checklist anti-regresión de 12 features (ítem 10 = Google Workspace instalado, NO Z-Slides).
Si 10 builds fallan consecutivos o 3 tests fallan sobre el mismo criterio → HARD STOP y
reporte estructurado (NO "una vez más").

FASE 6 — WALKTHROUGH. Documenta: qué se construyó, cómo se verificó, el score de paridad de la
calculadora-chat, qué quedó pendiente, y la fecha-versión de los archivos operativos usados.

REGLAS DE LOOP: build-verify tras cada archivo significativo; checkpoints de guardado frecuentes
(resiliencia a cortes de cuota); poda de contexto entre fases; escalada inmediata si la spec es
ambigua, si rozas el Manifest/Device Owner, o si la cuota baja. Nunca releas el SSOT completo;
solo la vertical 07 y las referencias que ella enlaza.
```

---

## 🛠️ Dotación de capacidades (qué instalar antes de lanzar)

1. **Skill `zentry-web-microapp`** — instalar el bloque delimitado de [plantilla-microapp-pwa.md](./plantilla-microapp-pwa.md) en `zentrybyantig/.agents/skills/zentry-web-microapp/SKILL.md`. Es la receta que el "Ingeniero de plantilla" sigue. Su regla de alcance prohíbe clonar Workspace.
2. **Modo trabajo profundo** — activar la regla de trabajo profundo del workspace ([06/reglas-y-guardrails.md](../06-arquitectura-agentica/reglas-y-guardrails.md)): exige análisis escrito antes de código, obliga el sub-agente crítico de la Fase 4, y sube el umbral de auto-corrección.
3. **Superficie del workspace** — verificar `AGENTS.md`, reglas y skills activas antes de lanzar ([06/agents-md-workspace.md](../06-arquitectura-agentica/agents-md-workspace.md)); máx. 8 skills activas (incluidas `zentry-web-microapp` y `zentry-design-system`).
4. **MCP**: el de Firebase se activa cuando la microapp de referencia cablee IA real; antes, el "MCP Error" visible es benigno.
5. **Modelo del ejecutor**: Pro (High) para el `ZentryWebHost`/bridge (arquitectura); Flash para el boilerplate de la plantilla y CSS — política económica + escalada del canon. (El model id del **producto** es aparte: `BuildConfig.ZENTRY_MODEL_ID`, [CANON](../CANON.md) §3.C.)

---

## 👁️ Guía de validación humana (cómo saber que el trabajo es impecable, no "artificial")

Revisa en este orden; cada casilla es un veto:

1. **Frontera respetada**: ¿el `ZentryBridge` expone SOLO los métodos de [contrato-js-bridge.md](./contrato-js-bridge.md)? Busca cualquier método que huela a configuración Device Owner, políticas o secretos → debe NO existir (se protege por ausencia).
2. **Config Device Owner intacta**: la política DO ya activa (~95%, testeada) NO se modificó; `ZentryAdminReceiver` sigue **habilitado y funcional**, el `AndroidManifest` de permisos DO **sin cambios**. Si AGY tocó el Manifest o la política DO sin gate HITL → **rechazar** ([CANON](../CANON.md) §5.4).
3. **Sin clones de Workspace**: no se creó ninguna pantalla ni PWA que reimplemente Docs/Slides/Sheets/NotebookLM/Gemini; si la necesidad la cubre Workspace, se lanza la app oficial vía `openWorkspace`. Cero rastro de `z_slides`/`ZentrySlidesScreen`/`crear_slide`.
4. **Allowlist real**: fuerza en el `ZentryWebHost` una URL fuera del hosting Zentry → no debe cargar.
5. **Offline de verdad**: activa modo avión y abre la calculadora-chat → debe arrancar desde caché; la IA degrada con gracia, no crashea.
6. **Sin literales prohibidos**: grep del bundle web y del nativo por credenciales, `gemini-2.5` o cualquier model id hardcodeado → cero resultados; el model id viene de `BuildConfig.ZENTRY_MODEL_ID` / config remota.
7. **Continuidad visual**: la calculadora-chat se ve como ZentryOS (paleta, Zentry Glass, circadiano), no como una web genérica.
8. **Paridad y anti-regresión**: el Walkthrough reporta el checklist de 12 features completo (ítem 10 = Workspace instalado) y el score de paridad de la calculadora-chat.
9. **El "olfato de profundidad"**: ¿el Walkthrough explica *por qué* de las decisiones (memoria, seguridad del bridge, protección del DO) o solo *qué* cambió? Trabajo impecable razona; trabajo artificial solo enumera.

Si 1-3 fallan → es un problema de **seguridad/canon**, se detiene todo. Si 4-9 fallan → es de **calidad**, se itera con un prompt de corrección puntual.

---

## 🚦 Semáforo de salud del ciclo

| Señal | Verde | Ámbar | Rojo |
|---|---|---|---|
| Builds consecutivos fallidos | 0-2 | 3-6 | 7-10 → inminente HARD STOP |
| Cuota (límite de 5h) | <60% usada | 60-85% | >85% → cerrar checkpoint y pausar |
| Alcance | Solo la vertical 07 | Roza otra vertical | Toca Manifest/config Device Owner o clona Workspace → **detener** |
| Paridad de la microapp | Criterios pasando | Parcial | Regresión de demo → conmutar a fallback |

---

## 🔗 Cableado con la vertical

| Contrato compartido | Documento propietario |
|---|---|
| Contrato del bridge que el sprint implementa | [contrato-js-bridge.md](./contrato-js-bridge.md) |
| Patrón de la plantilla y skill física | [plantilla-microapp-pwa.md](./plantilla-microapp-pwa.md) |
| Contenedor y presupuesto de memoria | [arquitectura-cascara-hibrida.md](./arquitectura-cascara-hibrida.md) |
| Pipeline y hosting | [motor-hosting-y-despliegue.md](./motor-hosting-y-despliegue.md) |
| Guardrails, hard-stops, regla de trabajo profundo y workspace | [06/reglas-y-guardrails.md](../06-arquitectura-agentica/reglas-y-guardrails.md) · [06/agents-md-workspace.md](../06-arquitectura-agentica/agents-md-workspace.md) |
| Device Owner ~95% activo que el sprint protege | [02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md) · [CANON §2](../CANON.md) |
| Orden de migración (la calculadora-chat es Ola 1) | [migracion-y-coexistencia.md](./migracion-y-coexistencia.md) |
