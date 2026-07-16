---
title: "Plantilla de Microapp PWA: Estructura, Design System Web e Integración de IA"
date: 2026-07-14
status: "under-review"
progress: 88%
tags: ["zentryos", "ssot", "plataforma-microapps", "plantilla"]
---

# 🧩 Plantilla de Microapp PWA

Propietario del **patrón de una microapp propia**. Toda microapp **de valor único** (calculadora-chat, tutor socrático / Study Assistant) nace de esta plantilla — el equivalente web de lo que `zentry-microapp-pattern` era para el nativo, ahora superado ([migración](./migracion-y-coexistencia.md)). El objetivo del [Sprint 1](./orquestacion-sprint-microfactory.md): que esta plantilla exista y sea tan sólida que cada microapp propia posterior salga en horas.

> **Alcance (corrección canónica — [CANON](../CANON.md) §3.B)**: esta plantilla es **solo para piezas propias diferenciales**. Las suites de oficina (Docs, Slides, Sheets, NotebookLM, Gemini) **no** se construyen aquí: son apps oficiales de Google que el shell gobierna ([arquitectura](./arquitectura-cascara-hibrida.md), Carril A). No se clona Workspace; se reserva el esfuerzo web para lo que Google no da.

---

## 🗂️ Estructura de una microapp propia

```text
microapp-<nombre>/
├── index.html            # shell mínimo; monta el runtime Zentry
├── manifest.webmanifest  # nombre, iconos, display: standalone, theme_color
├── sw.js                 # Service Worker: precache de assets + estrategia offline
├── src/
│   ├── main.js           # entrypoint; registra SW, inicializa bridge SDK y tema
│   ├── ui/               # componentes de la microapp (web components o framework ligero)
│   ├── ai/               # wiring de IA vía Firebase AI Logic JS + contratos JSON
│   └── styles/
│       └── zentry-tokens.css  # design system web (paleta, glass, circadiano)
└── assets/               # imágenes WebP/AVIF, fuentes Outfit/Inter (subset)
```

Cada microapp propia es una PWA autocontenida servida desde el hosting Zentry ([motor](./motor-hosting-y-despliegue.md)).

---

## 🎨 Design System web (espejo del nativo)

`zentry-tokens.css` reproduce la identidad del shell para que la costura sea invisible:

```css
:root {
  --zentry-glacial: #EBF1F5;  --zentry-lavanda: #D6C8FA;
  --zentry-purpura: #533B87;  --zentry-menta:   #C2F4E7;
  --zentry-gris:    #4A5160;
  /* gradiente iridiscente del glass */
  --zentry-iris: linear-gradient(135deg, #E6D4FF, #D4FFEA, #D4E8FF);
}
.zentry-glass {                     /* espejo web de zentryGlass() */
  border-radius: 32px;
  background: rgba(255,255,255,0.45);
  border: 1px solid rgba(255,255,255,0.55);
  backdrop-filter: blur(25px);      /* degrada con gracia si no hay soporte */
}
```

*   **Cohorte y circadiano**: `main.js` recibe `{ cohort, circadianPhase }` de `getContext()` / `onThemeChanged` ([bridge](./contrato-js-bridge.md)) y aplica clases (`.cohort-infantil`, `.circadian-noche`) que modulan escala tipográfica, luminosidad y motion — misma matriz que el shell ([02/interfaz-compose.md](../02-arquitectura-tecnica/interfaz-compose.md)).
*   **Tipografía**: Outfit (títulos) + Inter (cuerpo), servidas como subset local (sin CDN externa; respeta la allowlist).
*   **Aura web**: los estados de IA se pintan con el lenguaje Aura, coordinados vía `setAura()`.

---

## 🤖 Integración de IA (el corazón del valor propio)

La IA se cablea por **dos vías**, según necesidad:

1. **Vía bridge (preferida para contratos de sistema)**: `ZentryBridge.requestAI(contract, payload, cb)` — el nativo ejecuta contra `ZentryIntelligenceBridge`, aplica App Check y presupuesto, devuelve JSON estricto. La microapp no maneja credenciales. El **model id lo resuelve el nativo desde `BuildConfig.ZENTRY_MODEL_ID`** (hoy `gemini-2.5-flash`), nunca un literal.
2. **Vía Firebase AI Logic JS (para IA propia de la microapp)**: SDK web de `firebase-vertexai` para generación libre dentro de la microapp; el **model id se lee de config remota** (espejo de `BuildConfig.ZENTRY_MODEL_ID`, **nunca literal en el bundle**), App Check obligatorio.

```js
// src/ai/tutor.js — ejemplo vía bridge (JSON estricto garantizado por el nativo)
export function pedirGuia(grade, prompt) {
  return new Promise((resolve) => {
    ZentryBridge.setAura('thinking');
    ZentryBridge.requestAI('study_assistant', JSON.stringify({ grade, prompt }),
      (res) => { ZentryBridge.setAura('idle'); resolve(JSON.parse(res).result); });
  });
}
```

**Regla de honestidad**: la Aura absorbe la latencia real (streaming + render progresivo); ninguna microapp promete respuesta instantánea. Sin red, degrada al fallback definido por la microapp (`onConnectivity`).

---

## 📴 Offline (Service Worker)

*   **Precache**: `sw.js` cachea el shell (HTML/JS/CSS) y assets críticos en `install` — la microapp arranca sin red desde la caché.
*   **Estrategia**: cache-first para assets, network-first con fallback a caché para datos; la IA requiere red y lo señala.
*   **Estado**: se serializa en `sessionStorage`/IndexedDB ante `onLifecycle: willDestroy` y se rehidrata al reabrir.

---

## ✅ Contrato de una microapp conforme

Una microapp propia está "conforme a plantilla" si: (1) usa `zentry-tokens.css` y responde a cohorte/circadiano; (2) toda IA pasa por el bridge o por Firebase AI Logic con model id desde config (nunca literal); (3) registra Service Worker y arranca offline desde caché; (4) serializa/rehidrata estado en el ciclo de vida; (5) respeta la CSP y la allowlist; (6) emite solo telemetría agregada; (7) **no clona Workspace** — si la necesidad la cubre Docs/Slides/Sheets/NotebookLM/Gemini, se lanza la app oficial vía `openWorkspace`, no se reimplementa.

---

## 📄 Bloque delimitado — skill física del ejecutor

```markdown
<!-- ═══ ARCHIVO DESTINO: zentrybyantig/.agents/skills/zentry-web-microapp/SKILL.md ═══ -->
<!-- Fuente canónica: zentry-ssot/07-plataforma-microapps/plantilla-microapp-pwa.md (2026-07-14) -->
---
name: zentry-web-microapp
description: Receta para crear una microapp PROPIA de valor único como PWA dentro de la Cáscara Híbrida de ZentryOS — estructura, design system web, SDK del bridge, wiring de IA y offline. Invócala solo para piezas diferenciales (calculadora-chat, tutor); NO para clonar Google Workspace.
---

# 🧩 zentry-web-microapp

Crea una microapp PROPIA de valor único como PWA servida desde el hosting Zentry, integrada al shell nativo por el JS Bridge. Supera a la skill nativa `zentry-microapp-pattern` (legacy) para todo contenido propio nuevo.

## Regla de alcance (primero)
NO crees clones de Google Workspace (Docs, Slides, Sheets, NotebookLM, Gemini): esas son apps oficiales que el Device Owner instala y gobierna. Esta plantilla es SOLO para piezas propias diferenciales (calculadora-chat, tutor socrático). No existe contrato `z_slides` ni verbo `crear_slide`.

## Estructura obligatoria
microapp-<nombre>/ con: index.html, manifest.webmanifest, sw.js (Service Worker), src/{main.js, ui/, ai/, styles/zentry-tokens.css}, assets/ (WebP/AVIF).

## Reglas
1. Diseño con `zentry-tokens.css` (paleta canónica, .zentry-glass, cohorte, circadiano). Cero colores fuera de la paleta.
2. IA por el bridge (`ZentryBridge.requestAI`) o Firebase AI Logic JS con model id desde config (espejo de `BuildConfig.ZENTRY_MODEL_ID`) + App Check. Nunca credenciales en el cliente ni literales de modelo.
3. Aura para todo estado de IA (`setAura`); la Aura absorbe la latencia, nada de "instantáneo".
4. Service Worker con precache; arranque offline desde caché; estado serializado en el ciclo de vida (`onLifecycle`).
5. Solo métodos de la allowlist del bridge; solo telemetría agregada; CSP estricta; nada carga fuera del hosting Zentry. Nunca un método que toque la config Device Owner o el Manifest.
6. Una WebView activa a la vez: presupuesto de assets acotado; imágenes perezosas.

## Checklist de la skill
- [ ] Es una pieza propia de valor único (no un clon de Workspace).
- [ ] Usa zentry-tokens.css y responde a cohorte/fase circadiana.
- [ ] Toda IA pasa por el bridge o Firebase AI Logic con model id desde config.
- [ ] Registra Service Worker y arranca offline desde caché.
- [ ] Serializa y rehidrata estado en willDestroy/resume.
- [ ] Respeta CSP, allowlist y telemetría agregada.
- [ ] Primer frame útil desde caché antes de cualquier llamada de red.
```

---

## 🔗 Cableado con la vertical

| Contrato compartido | Documento propietario |
|---|---|
| Superficie del bridge que consume el SDK | [contrato-js-bridge.md](./contrato-js-bridge.md) |
| Anfitrión, ciclo de vida y presupuesto de memoria | [arquitectura-cascara-hibrida.md](./arquitectura-cascara-hibrida.md) |
| Hosting, versionado y allowlist | [motor-hosting-y-despliegue.md](./motor-hosting-y-despliegue.md) |
| Tokens, cohortes y circadiano (fuente de diseño) | [05/colorimetria-y-diseno.md](../05-mesa-de-trabajo/colorimetria-y-diseno.md) · [02/interfaz-compose.md](../02-arquitectura-tecnica/interfaz-compose.md) |
| Contratos JSON de IA | [02/modelo-de-datos-firestore.md](../02-arquitectura-tecnica/modelo-de-datos-firestore.md) |
