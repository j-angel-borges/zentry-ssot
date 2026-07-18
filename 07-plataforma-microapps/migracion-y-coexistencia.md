---
title: "Migración y Coexistencia: del Prototipo Nativo al Híbrido Gobernado + Web-First"
date: 2026-07-14
status: "under-review"
progress: 88%
tags: ["zentryos", "ssot", "plataforma-microapps", "migracion"]
---

# 🔀 Migración y Coexistencia

Documenta con precisión **qué se conserva, qué se gobierna y qué se construye web** al elevar el paradigma híbrido, el **orden de trabajo** y cómo conviven los mundos durante la transición sin romper la demo. Es el documento que evita la deriva doctrinal entre el prototipo ya existente y el nuevo eje.

> **Base de partida (corrección canónica — [CANON](../CANON.md) §2)**: el punto de partida **no** es un native-first frágil, sino una **cáscara nativa real con Device Owner ~95% habilitado y testeado en Redmi 9 físico** (LockTask, `addPersistentPreferredActivity`, `setApplicationHidden`, `WRITE_SECURE_SETTINGS`, supresión de la barra MIUI vía `policy_control` immersive). Esa base **ya existe y se conserva**: la plataforma web **se apoya en** ella, no la reemplaza ni la "activa en el futuro".

---

## 🗺️ Mapa de supersesión (conservar / gobernar / construir)

| Elemento del prototipo | Destino | Justificación |
|---|---|---|
| Shell: `MainActivity`, launcher, `AnimatedContent`, gestos de 2 dedos, timer circadiano | **CONSERVAR nativo** | Es la cáscara/OS; no migra |
| `ZentryPolicyManager`, `ZentryAdminReceiver`, LockTask, Device Owner | **CONSERVAR nativo — ~95% ACTIVO y testeado; PROTEGER** | Privilegio de sistema, **ya operativo** en Redmi 9; ahora además gobierna la allowlist del navegador ([CANON](../CANON.md) §2/§3.A) |
| Barra de navegación de sistema (`ZentryNavAccessibilityService`) | **CONSERVAR nativo** | AccessibilityService **solo como recurso de UI** (dibuja la barra, `performGlobalAction`), **nunca** monitoreo/control ([CANON](../CANON.md) §3.A) |
| `ZentryBrowserScreen` / `ZentrySafeBrowserScreen` | **EVOLUCIONAR → `ZentryWebHost`** | Ya son WebView; se endurecen y se vuelven el contenedor único de microapps propias |
| `ZentryIntelligenceBridge` (Function Calling Gemini) | **CONSERVAR + exponer al web** | Router de contratos; el bridge JS lo invoca ([contrato](./contrato-js-bridge.md)) |
| `ZentryCalculatorScreen` (+ViewModel) | **MIGRAR → PWA propia (calculadora-chat)** | Valor único (cálculo + chat IA); gana iteración rápida |
| `ZentryStudyAssistantScreen` (+ViewModel) | **MIGRAR → PWA propia (tutor socrático)** | Valor único MINEDU; IA vía bridge; es la pieza estrella propia |
| `ZentrySlidesScreen` (contrato `z_slides`, verbo `crear_slide`) | **❌ ELIMINADO** | Se usan **Google Slides / NotebookLM reales**; nada de clon ([CANON](../CANON.md) §3.B, §4) |
| `ZentryResearchScreen`, `ZentryRedactorScreen`, `ZentryCreationScreen` | **GOBERNAR vía Workspace (no clonar)** | Solapan con Docs/NotebookLM/Gemini oficiales; se lanzan las apps de Google, no se reimplementan |
| PDF, hojas de cálculo | **GOBERNAR, no nacer PWA** | Sheets = **Google Sheets** oficial; PDF = crear **Google Doc** y exportar ([CANON](../CANON.md) §3.C) — nunca render local |
| **Apps de Google Workspace** (Docs/Slides/Sheets/NotebookLM/Gemini) | **INSTALAR + GOBERNAR (Carril A)** | El Device Owner las instala, presenta (tiles) y controla (`setApplicationHidden` con exclusiones, allowlist) — no se clonan |
| `ZentryCameraScreen` (CameraX) | **CONSERVAR nativo, exponer vía `openLens`** | El hardware es nativo; el web lo invoca |
| `ZentryClockScreen`, `ZentryCalendarScreen`, `ZentryFilesScreen` | **CONSERVAR nativo** | Dependen de APIs de sistema (alarmas, MediaStore, SQLite); no se migran a web |
| DbHelpers SQLite | **CONSERVAR** | Persistencia local del shell y de las apps nativas de sistema |
| Diseño de [02/interfaz-compose.md](../02-arquitectura-tecnica/interfaz-compose.md) (Aura, Zentry Glass, momentos MDM) | **CONSERVAR** en la cáscara; **espejado** en `zentry-tokens.css` para las microapps propias | Continuidad visual shell↔web |
| Skill `zentry-microapp-pattern` (nativa) | **LEGACY** | Superada por `zentry-web-microapp` para toda microapp **propia** nueva ([plantilla](./plantilla-microapp-pwa.md)) |

**Regla de tres carriles**: lo que exige privilegio de OS o hardware **se conserva nativo** (y el Device Owner ya está activo); lo que Google ya resuelve **se gobierna** (Workspace oficial instalado); solo lo diferencial **se construye web**. Nada se clona por clonar.

---

## 📶 Orden de trabajo (por valor de demo y riesgo)

El Device Owner y la cáscara **ya están** — no son una ola de migración; son el cimiento. Las olas ordenan el trabajo **web** y el **gobierno** de Workspace:

1. **Ola 0 — Contenedor**: evolucionar `ZentryBrowserScreen` → `ZentryWebHost` con bridge y allowlist. Sin esto no hay plataforma web ([orquestación](./orquestacion-sprint-microfactory.md), Sprint 1).
2. **Ola 1 — Microapp de referencia**: **calculadora-chat** como PWA con la plantilla, cableada de punta a punta. Valida el patrón completo.
3. **Ola 2 — Microapp estrella**: **tutor socrático** (Study Assistant) como PWA — el mayor "wow" propio de la demo, con IA por el bridge.
4. **Carril paralelo — Gobierno de Workspace** (no es migración): verificar que Docs/Slides/Sheets/NotebookLM/Gemini estén instalados, protegidos (exclusiones de `setApplicationHidden`) y lanzables como tiles. Es trabajo del Device Owner ya activo, no del stack web.

No hay olas para "clonar" Research/Redactor/Creation/PDF/hojas: esas necesidades se cubren **gobernando** las apps oficiales (Carril A), no reimplementándolas.

Cada ola web: la microapp propia nace **junto** a la nativa; se conmuta el tile cuando la web alcanza paridad (criterios abajo); la nativa queda como fallback hasta retirarse.

---

## 🤝 Coexistencia y fallback

*   **Conmutación por tile**: el launcher decide, por microapp propia, si el tile abre la versión web (`ZentryWebHost`) o la nativa (fallback). Un flag por microapp en config remota gobierna la conmutación — reversible al instante.
*   **Paridad antes de conmutar**: una microapp web reemplaza a la nativa solo cuando pasa sus criterios Given/When/Then de paridad.
*   **Anti-regresión**: el checklist de 12 features ([CANON](../CANON.md) §4; [02/calidad-y-despliegue.md](../02-arquitectura-tecnica/calidad-y-despliegue.md)) sigue vigente. Su ítem 10 es **"Google Workspace instalado y lanzable"**. Una microapp migrada debe cumplir su casilla igual que la nativa; si la web regresiona, se conmuta de vuelta a nativo sin drama.

---

## ✅ Criterios de paridad (Given/When/Then)

Plantilla que cada microapp propia migrada debe satisfacer para conmutar:

*   **Funcional** — *Given* la microapp web en `ZentryWebHost` / *When* el usuario ejecuta el flujo principal / *Then* produce el mismo resultado que la nativa, con su contrato JSON validado (`calc_chat`, `study_assistant`, `chat`).
*   **Offline** — *Given* el dispositivo sin red / *When* se abre la microapp / *Then* arranca desde caché del Service Worker y degrada la IA con gracia (`onConnectivity`), fiel al fail-safe canónico.
*   **Rendimiento** — *Given* el Redmi 9 (Helio G80, 3-4 GB) / *When* se abre y opera la microapp / *Then* el primer frame útil llega desde caché y el jank se mantiene dentro del protocolo ([02/calidad-y-despliegue.md](../02-arquitectura-tecnica/calidad-y-despliegue.md); cifras solo en [04](../04-operaciones-y-roadmap/progreso-y-metricas.md)).
*   **Seguridad** — *Given* la microapp cargada / *When* intenta una acción fuera de la allowlist del bridge (o que roce la config Device Owner ya activa) / *Then* es rechazada y registrada (extensión EVA-07). La config DO se protege por ausencia de superficie, no por permiso.
*   **Visual** — *Given* cualquier cohorte y fase circadiana / *When* se renderiza / *Then* espeja el design system del shell sin costura perceptible.

---

## 🔗 Cableado con la vertical

| Contrato compartido | Documento propietario |
|---|---|
| Contenedor `ZentryWebHost` (Ola 0) | [arquitectura-cascara-hibrida.md](./arquitectura-cascara-hibrida.md) |
| Patrón de la microapp propia que reemplaza a la nativa | [plantilla-microapp-pwa.md](./plantilla-microapp-pwa.md) |
| Conmutación por config remota y hosting | [motor-hosting-y-despliegue.md](./motor-hosting-y-despliegue.md) |
| Superficie del bridge y protección de la config DO | [contrato-js-bridge.md](./contrato-js-bridge.md) |
| Checklist anti-regresión de 12 features y EVA | [02/calidad-y-despliegue.md](../02-arquitectura-tecnica/calidad-y-despliegue.md) · [CANON §4](../CANON.md) |
| Estado real del prototipo y Device Owner ~95% | [02/analisis-de-brechas.md](../02-arquitectura-tecnica/analisis-de-brechas.md) · [CANON §2](../CANON.md) |
| Gobierno de Workspace (instalar/controlar, no clonar) | [02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md) · [CANON §3.B](../CANON.md) |
| Reubicación de la capa de contenido propio en web | [04/plan-maestro-por-capas.md](../04-operaciones-y-roadmap/plan-maestro-por-capas.md) |
