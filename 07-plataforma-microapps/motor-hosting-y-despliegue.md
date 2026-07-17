---
title: "Motor de Hosting y Despliegue: Distribución Server-Side del Contenido Propio, sin Tiendas"
date: 2026-07-14
status: "under-review"
progress: 90%
tags: ["zentryos", "ssot", "plataforma-microapps", "hosting"]
---

# 🚀 Motor de Hosting y Despliegue

Propietario de **dónde viven las microapps propias, cómo se cargan y cómo se actualizan**. Es la pieza que materializa la independencia de tiendas **para el contenido propio de valor único** (calculadora-chat, tutor socrático): el shell nativo se instala una vez en la venta directa, y esas microapps se sirven y se actualizan del lado del servidor, al instante, bajo el control de la allowlist del **Device Owner ya activo (~95%, testeado en Redmi 9)** ([CANON](../CANON.md) §2/§3.A).

> **Alcance (corrección canónica — [CANON](../CANON.md) §3.B)**: este motor hospeda **solo microapps propias**. Las apps de Google Workspace (Docs, Slides, Sheets, NotebookLM, Gemini) **no** se sirven desde aquí: se **instalan desde Google Play** y las **gobierna** el Device Owner ([arquitectura](./arquitectura-cascara-hibrida.md), Carril A). No se clona Workspace; este hosting es para lo diferencial.

---

## 🌐 Topología de hosting

```text
[Firebase Hosting / CDN — dominio Zentry]        (SOLO microapps propias)
   /apps/<microapp>/<version>/…        # cada microapp propia, versionada e inmutable
   /apps/manifest.json                 # catálogo: qué microapp, qué versión activa
        │
        │  (allowlist del Device Owner ~95% ACTIVO: SOLO este dominio carga en el host)
        ▼
[ZentryWebHost en el shell nativo] --carga--> microapp propia en foco

[Google Play]  --instala/gobierna-->  Docs · Slides · Sheets · NotebookLM · Gemini
   (Carril A: apps oficiales aprovisionadas por el Device Owner, NO por este hosting)
```

*   **Hosting**: Firebase Hosting (mismo ecosistema que Firebase AI Logic/Firestore) o CDN equivalente. Servir sobre **HTTPS/TLS 1.2+** obligatorio.
*   **Inmutabilidad por versión**: cada build de microapp propia se publica bajo `/<version>/`; nunca se sobrescribe una versión — se publica una nueva y se conmuta el puntero. Rollback = cambiar un puntero.
*   **Catálogo**: `manifest.json` declara, por microapp propia, la versión activa, el hash de integridad y el presupuesto de assets. El shell lo lee al iniciar y cachea.
*   **Fuera del catálogo**: Workspace no aparece en este `manifest.json`. Su disponibilidad la administra el Device Owner vía Google Play (whitelisteada en kiosk, [CANON](../CANON.md) §3.A).

---

## 📥 Carga desde el launcher (sin WebAPK, sin depender de Play Services para lo propio)

El punto que resuelve el supuesto frágil del "instalar PWA":

1. Cada microapp **propia** es un **tile** en el grid del launcher nativo (no un icono de PWA del navegador). Las apps de **Workspace** también son tiles, pero lanzan la app oficial instalada, no una URL de este hosting.
2. Al tocar el tile de una microapp propia, el shell le dice al `ZentryWebHost` qué URL cargar (`/apps/<microapp>/<version>/`) con los parámetros de tema (cohorte + fase circadiana).
3. El Service Worker de la microapp precachea sus assets en la primera carga; las siguientes arrancan desde caché local, sin red.
4. El menor **no puede desinstalar** una microapp propia porque no controla el launcher (Device Owner ~95% activo); tampoco hay icono removible de por medio.

Resultado: la experiencia "app instalada" para lo propio sin depender del minter de WebAPK ni de Google Play Services — frágiles en un kiosk. Y para las suites, la app oficial de Google, siempre actualizada.

---

## 🔄 Actualización server-side inmediata (solo contenido propio)

| Escenario | Mecanismo |
|---|---|
| Fix o feature en una microapp propia | Publicar `/<nueva-version>/`, conmutar el puntero en `manifest.json`; el shell sirve la nueva en el próximo arranque de la microapp (o vía `skipWaiting` del SW) |
| Rollback | Revertir el puntero del catálogo a la versión anterior (inmutable, sigue publicada) |
| Despliegue gradual | El catálogo puede segmentar por cohorte/anillo de piloto (canary) antes de promover a todos |
| Actualización del shell nativo | **Distinta ruta**: el shell se actualiza por sideload/OTA controlado (baja frecuencia); solo el contenido web propio se actualiza en el acto |
| Actualización de Workspace | **No es asunto de este motor**: las apps oficiales las actualiza Google Play bajo el gobierno del Device Owner |

**Ventaja comercial**: iterar el contenido propio diariamente sin re-publicar en tiendas ni pedir al usuario que actualice — el asesor demuestra mejoras "en vivo" entre visitas. Cifras de peso/latencia solo en [04/progreso-y-metricas.md](../04-operaciones-y-roadmap/progreso-y-metricas.md) y [CANON](../CANON.md) §2.

---

## 🔐 Allowlist y seguridad de distribución

*   **Allowlist del Device Owner (ya activo)**: la política de red/navegación permite **solo** el dominio de hosting Zentry en el `ZentryWebHost`; cualquier otro origen no carga ([control de dispositivo](../02-arquitectura-tecnica/control-dispositivo-abm.md) + [bridge](./contrato-js-bridge.md)). No se trata de *activar* el Device Owner —ya lo está— sino de **apoyarse en** su enforcement para gobernar qué carga el host.
*   **Integridad**: el shell valida el hash del catálogo/microapp antes de servir desde caché; assets firmados.
*   **CSP**: cada microapp propia declara Content-Security-Policy estricta (sin orígenes externos, sin `unsafe-eval`).
*   **Secretos y modelo**: ninguna credencial en el bundle web; **ningún literal de id de modelo** — el model id lo resuelve el nativo desde `BuildConfig.ZENTRY_MODEL_ID` (hoy `gemini-2.5-flash`) o la config remota, nunca hardcodeado ([CANON](../CANON.md) §3.C). Las llamadas privilegiadas pasan por el bridge o por Firebase con App Check.

---

## 🧪 Pipeline de despliegue (para el ejecutor)

```text
[build microapp propia] → [test: contrato JSON + lint + presupuesto de assets]
      → [publish /apps/<microapp>/<version>/ (inmutable)]
      → [smoke test contra la URL publicada]
      → [conmutar puntero en manifest.json]
      → [verificar en ZentryWebHost]
```

El pipeline se integra con el CI existente del repo y con la disciplina de build-verify del ejecutor (`assembleDebug` verde tras cada cambio, [CANON](../CANON.md) §5.2; guardrails de loop en [06/reglas-y-guardrails.md](../06-arquitectura-agentica/reglas-y-guardrails.md)). El despliegue no toca el shell nativo ni la config Device Owner: opera exclusivamente sobre el contenido web propio.

---

## 🔗 Cableado con la vertical

| Contrato compartido | Documento propietario |
|---|---|
| Anfitrión que consume las URLs y la caché | [arquitectura-cascara-hibrida.md](./arquitectura-cascara-hibrida.md) |
| Estructura de la microapp propia publicada | [plantilla-microapp-pwa.md](./plantilla-microapp-pwa.md) |
| Allowlist y validación de origen | [contrato-js-bridge.md](./contrato-js-bridge.md) |
| Enforcement de la allowlist por el Device Owner (~95% real) | [02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md) · [CANON §3.A](../CANON.md) |
| Gobierno de Workspace (instalado desde Play, no desde este hosting) | [CANON §3.B](../CANON.md) |
| Aprovisionamiento del shell en venta directa | [03/demo-venta-directa.md](../03-marketing-y-ventas/demo-venta-directa.md) |
| Orden en que nacen las microapps propias servidas | [migracion-y-coexistencia.md](./migracion-y-coexistencia.md) |
