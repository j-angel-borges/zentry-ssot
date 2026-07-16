# CHANGELOG-SSOT

Registro append-only de las actualizaciones del SSOT de ZentryOS. Lo mantiene la skill `actualizar-ssot`. Entrada más reciente arriba. Formato:
`- **YYYY-MM-DD** · <agente/plataforma> · <vertical> — <delta en una frase>.`

---

- **2026-07-14** · Fable 5 (Claude) · gobernanza/multi-vertical — **Reestructuración Karpathy del SSOT.** CANON reconciliado (estado actualizado a la sesión Liquid Glass/Navegación 12-14 jul: UI/UX ~40%, Core ~35%; AccessibilityService matizado como recurso de UI; Z-Slides eliminado del checklist; modelo vía `BuildConfig.ZENTRY_MODEL_ID`). Creados los entrypoints universales `AGENTS.md`/`CLAUDE.md` y ampliado `llms.txt` a 7 verticales. Creada la skill `actualizar-ssot` y este changelog. **Cosecha PARCIAL** del clon aislado (interrumpida por límite de cuota de la cuenta): integrados corregidos a la realidad (DO ~95%) — 06 (3/7), 07 (4/7), 02 (3 satélites nuevos: modelo-de-datos-firestore, seguridad-y-privacidad, calidad-y-despliegue). **PENDIENTE**: resto de 06/07, reescritura de 02/analisis-de-brechas + interfaz-compose, y 04/plan-maestro-por-capas (ver §6 del walkthrough — re-ejecutar el workflow de cosecha tras el reset de cuota). Definido el documento vivo `SSOT-VIVO.md` en Drive; limpieza de Drive por archivado (`_archivo/`, nada borrado). Walkthrough: `AA. Zentry OS Updates/2026-07-14-walkthrough-reestructuracion-ssot.md`.
- **2026-07-11** · Owner (AGY/terminal) · 02-arquitectura-tecnica — Configuración de Kiosk: barra de estado, cajón de notificaciones y preservación de la app Ajustes durante las limpiezas de bloatware (commits `6b21072`, `d0a2c97`).
- **2026-07-10** · Owner (AGY/terminal) · 02-arquitectura-tecnica — Device Owner Kiosk jul-2026: gestos, Home por defecto, Matrix Mode cleaning; ZentryHub movido a repo propio (commits `7f4b4f0`, `46a4929`).
- **2026-07-09** · Owner · gobernanza — Nacimiento del método Karpathy: reestructura del SSOT a `llms.txt` + `CANON.md` (commit `f752fa1`).
