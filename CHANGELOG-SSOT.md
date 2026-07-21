# CHANGELOG-SSOT

Registro append-only de las actualizaciones del SSOT de ZentryOS. Lo mantiene la skill `agent-auditor-ss`. Entrada más reciente arriba. Formato:
`- **YYYY-MM-DD** · <agente/plataforma> · <vertical> — <delta en una frase>.`

---

- **2026-07-21** · agent-auditor-ss · UI/UX / 02-arquitectura-tecnica / 04-operaciones-y-roadmap — Consolidación de rediseño de barra de navegación glass compacta (asa 18dp/completa 74dp), corrección de auto-expansión al abrir IME, tutor IA en Calculadora con memoria SQLite 24h, menú desplegable superior y retirada de Z-Slides. Sincronización a GitHub y reflejo plano a Google Drive.
- **2026-07-14** · Fable 5 (Claude) · gobernanza/multi-vertical — **Reestructuración Karpathy del SSOT (COMPLETADA).** CANON reconciliado (estado a la sesión Liquid Glass/Navegación 12-14 jul: UI/UX ~40%, Core ~35%, DO ~95%, comercial ~12-15%; AccessibilityService matizado como recurso de UI; Z-Slides eliminado; modelo vía `BuildConfig.ZENTRY_MODEL_ID`). Entrypoints universales `AGENTS.md`/`CLAUDE.md`; `llms.txt` a 7 verticales; skill `actualizar-ssot` + este changelog. **Cosecha del clon aislado COMPLETADA e integrada, corregida a la realidad (C1-C4)**: vertical 06 completa (7/7), vertical 07 completa (7/7), vertical 02 con 3 satélites nuevos (modelo-de-datos-firestore, seguridad-y-privacidad, calidad-y-despliegue) + reescritura de analisis-de-brechas e interfaz-compose, y 04/plan-maestro-por-capas creado. `SSOT-VIVO.md` (espejo Drive) generado; limpieza de Drive por archivado (`_archivo/`, nada borrado). Walkthrough: `AA. Zentry OS Updates/2026-07-14-walkthrough-reestructuracion-ssot.md`.
- **2026-07-11** · Owner (AGY/terminal) · 02-arquitectura-tecnica — Configuración de Kiosk: barra de estado, cajón de notificaciones y preservación de la app Ajustes durante las limpiezas de bloatware (commits `6b21072`, `d0a2c97`).
- **2026-07-10** · Owner (AGY/terminal) · 02-arquitectura-tecnica — Device Owner Kiosk jul-2026: gestos, Home por defecto, Matrix Mode cleaning; ZentryHub movido a repo propio (commits `7f4b4f0`, `46a4929`).
- **2026-07-09** · Owner · gobernanza — Nacimiento del método Karpathy: reestructura del SSOT a `llms.txt` + `CANON.md` (commit `f752fa1`).
