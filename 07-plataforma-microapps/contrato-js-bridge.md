---
title: "Contrato JS Bridge: Superficie Web↔Nativo, Mensajería y Seguridad"
date: 2026-07-14
status: "under-review"
progress: 92%
tags: ["zentryos", "ssot", "plataforma-microapps", "js-bridge"]
---

# 🌉 Contrato JS Bridge

Este documento es el **propietario único** del contrato entre las microapps propias y el sistema nativo. Ninguna microapp accede al hardware o al sistema directamente: todo pasa por `ZentryBridge`, inyectado por el `ZentryWebHost` ([arquitectura](./arquitectura-cascara-hibrida.md)). El bridge es la superficie de confianza — y por tanto el foco de la amenaza THR-09 ([seguridad](../02-arquitectura-tecnica/seguridad-y-privacidad.md)).

---

## 🧭 Principios del contrato

1. **Allowlist, no libertad**: la microapp solo puede invocar los métodos declarados aquí. No hay `eval` de acciones arbitrarias.
2. **Nativo decide, web pide**: la web *solicita* (mostrar cámara, vibrar, invocar IA); el nativo *decide* si procede según política y permisos. Un `no` del nativo es final.
3. **Asíncrono por defecto**: toda operación devuelve vía callback/promesa; nada bloquea el hilo de la WebView.
4. **Origen verificado**: el bridge solo responde si la WebView carga un origen de la allowlist ([hosting](./motor-hosting-y-despliegue.md)); si no, no se inyecta.
5. **La config Device Owner está fuera de la superficie**: el Device Owner ya está activo (~95%, [CANON](../CANON.md) §2) y es carga crítica del sistema; **el bridge no expone ningún control que lo toque**. Se protege por ausencia, no por permiso.

---

## 📡 Dirección Web → Nativo (lo que la microapp puede pedir)

Expuesto vía `@JavascriptInterface` en el objeto global `ZentryBridge`. Superficie **cerrada**:

| Método | Qué hace | Gate |
|---|---|---|
| `requestAI(contract, payloadJson, cb)` | Invoca `ZentryIntelligenceBridge` con un contrato (`study_assistant`, `calc_chat`, `chat`) y devuelve JSON estricto | App Check + presupuesto de tokens; **model id de `BuildConfig.ZENTRY_MODEL_ID`, nunca literal** |
| `openLens(mode, cb)` | Abre la Lente Zentry (cámara/ML Kit) y devuelve el resultado (foto, texto OCR, tinta) | Permiso de cámara nativo |
| `haptic(pattern)` | Dispara una firma háptica del design system | — |
| `setAura(state)` | Pide al shell pintar un estado de Aura (`listening`/`thinking`/`acting`/`idle`) | — |
| `persist(key, value)` | Guarda un dato local de la microapp (cuota acotada) | — |
| `getContext()` | Devuelve cohorte, fase circadiana, `childId` pseudónimo, capacidades del dispositivo | Solo lectura, sin PII |
| `openWorkspace(app, params)` | Pide al shell **lanzar** una app oficial de Workspace ya instalada (Docs/Slides/Sheets/NotebookLM/Gemini) — p. ej. abrir/crear un Google Docs | **Gated**: solo apps de la allowlist de Workspace; lanza la app oficial, **no** la clona |
| `requestSystem(action)` | Solicita una acción de sistema acotada (p. ej. salir a home) | **Gated**: solo acciones de la allowlist; **jamás** toca la configuración Device Owner ya activa |
| `emitTelemetry(event)` | Emite un contador/agregado a la telemetría v1 | Solo eventos de la allowlist; nunca texto libre |

**Prohibido por diseño**: no existe método que toque la configuración Device Owner ya activa, edite o descomente el `AndroidManifest`, modifique políticas MDM, escriba secretos ni exfiltre transcripciones. Esas capacidades **no están en la superficie** — lo que el contrato no expone, la web no puede hacer. Cualquier cambio al Manifest/DO es **exclusivamente humano bajo gate HITL** ([CANON](../CANON.md) §5), nunca alcanzable desde el bridge.

> Nota de gobierno de Workspace: `openWorkspace` **no** renderiza ni reimplementa la suite; solo pide al shell lanzar la app oficial instalada (que el Device Owner gobierna, [CANON](../CANON.md) §3.B). No hay contrato de IA `z_slides` ni verbo `crear_slide`: Slides se usa vía Google Slides / NotebookLM reales.

---

## 📨 Dirección Nativo → Web (lo que el shell notifica)

Vía `webView.evaluateJavascript(...)` sobre un manejador que la microapp registra (`window.ZentryHost.on(event, handler)`):

| Evento | Cuándo | Payload |
|---|---|---|
| `onThemeChanged` | Cambio de cohorte o fase circadiana | `{ cohort, circadianPhase }` |
| `onAIResult` | Respuesta de `requestAI` lista | `{ requestId, json }` |
| `onLensResult` | La Lente devolvió captura | `{ requestId, result }` |
| `onLifecycle` | El shell pausa/reanuda/va a destruir la WebView | `{ phase: 'pause'\|'resume'\|'willDestroy' }` |
| `onConnectivity` | Cambio online/offline (para modo fail-safe) | `{ online: bool }` |
| `onBack` | Gesto/botón de retroceso del shell (barra de navegación de sistema) | `{}` |

`onLifecycle: willDestroy` es la señal para que la microapp serialice su estado antes de que el host recicle la WebView por presión de memoria.

---

## 📄 Esquema de mensajes

Todo intercambio es JSON. Petición web→nativo:

```json
{
  "requestId": "uuid-generado-por-la-microapp",
  "method": "requestAI",
  "args": { "contract": "study_assistant", "payload": { "grade": "PRIMARIA_4", "prompt": "..." } }
}
```

Respuesta nativo→web (siempre asíncrona, correlacionada por `requestId`):

```json
{
  "requestId": "uuid-generado-por-la-microapp",
  "ok": true,
  "result": { "...": "JSON estricto validado" },
  "error": null
}
```

Ante error (permiso denegado, cuota, offline, contrato inválido): `ok: false` + `error` con código semántico. La microapp degrada con gracia (p. ej. modo offline), nunca crashea.

---

## 🔐 Seguridad del bridge (THR-09 y superficie web)

| Vector | Mitigación |
|---|---|
| Origen malicioso carga en la WebView | Allowlist en `shouldOverrideUrlLoading`; el bridge no se inyecta fuera del hosting Zentry |
| Inyección de contrato no permitido en `requestAI` | Allowlist cerrada de contratos + validación de esquema del payload (reusa la lógica de `ZentryIntelligenceBridge`, [02](../02-arquitectura-tecnica/modelo-de-datos-firestore.md)) |
| Intento de alcanzar la config Device Owner o el Manifest | Imposible por diseño: no hay método en la superficie que los toque; el DO activo se protege por ausencia, y todo cambio de Manifest es HITL humano |
| Escalada a acción de sistema | `requestSystem` con allowlist mínima; ningún control de la configuración Device Owner en la superficie |
| Exfiltración de datos del menor | `emitTelemetry` solo acepta eventos agregados; transcripciones nunca cruzan el bridge hacia la red ([tabla canónica](../02-arquitectura-tecnica/seguridad-y-privacidad.md)) |
| XSS dentro de la microapp | CSP estricta en cada PWA + Service Worker que solo sirve assets firmados del hosting |
| Suplantación de origen (spoofing) | El host valida el origen real de la WebView antes de responder cualquier método |

Prueba de cierre: la suite de evasión incluye un escenario de inyección de bridge (extensión de EVA-07) en [02/calidad-y-despliegue.md](../02-arquitectura-tecnica/calidad-y-despliegue.md).

---

## 🔗 Cableado con la vertical

| Contrato compartido | Documento propietario |
|---|---|
| Anfitrión que inyecta el bridge y su ciclo de vida | [arquitectura-cascara-hibrida.md](./arquitectura-cascara-hibrida.md) |
| SDK cliente del bridge que consume la microapp | [plantilla-microapp-pwa.md](./plantilla-microapp-pwa.md) |
| Allowlist de orígenes (qué carga) | [motor-hosting-y-despliegue.md](./motor-hosting-y-despliegue.md) |
| Contratos de IA (`study_assistant`, `calc_chat`, `chat`) y validación | [02/modelo-de-datos-firestore.md](../02-arquitectura-tecnica/modelo-de-datos-firestore.md) |
| Gobierno de Workspace y Device Owner (~95% real) que el bridge respeta | [02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md) · [CANON §3](../CANON.md) |
| Amenaza THR-09 y tabla canónica de privacidad | [02/seguridad-y-privacidad.md](../02-arquitectura-tecnica/seguridad-y-privacidad.md) |
