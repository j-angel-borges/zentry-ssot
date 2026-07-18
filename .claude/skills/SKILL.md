---
name: agent-execute-wt
description: Genera el Walkthrough Técnico al finalizar una sesión. El agente vuelca su memoria, archivos modificados e inferencias en un archivo Markdown limpio, preparándolo para el Auditor.
---

# 📝 Skill: agent-execute-wt (Generador de Walkthrough)

**Rol:** Obrero / Ejecutor. Esta skill debe ser ejecutada por el agente que acaba de realizar trabajo técnico (programar, diseñar, investigar) durante la sesión actual.

## Cuándo invocarla
Al terminar cualquier sesión de trabajo, **justo antes de despedirte y cerrar la sesión**. Es tu último deber.

## Reglas de Oro (Hard Stops)
- **PROHIBIDO MODIFICAR EL SSOT:** Tienes terminantemente prohibido editar `CANON.md`, editar archivos dentro de las carpetas `01` a `07` (salvo la carpeta de walkthroughs), o editar el `CHANGELOG-SSOT.md`. Tu único trabajo es escribir UN (1) archivo en la carpeta de walkthroughs.
- No asumas qué vas a hacer; **lee tu propio historial de chat** para recordar con precisión qué archivos tocaste y qué decisiones tomaste hoy.

## Procedimiento (Paso a Paso)

1. **Recolección de Memoria:** Revisa internamente tu historial de la sesión actual. ¿Qué problema resolviste? ¿Qué archivos creaste o editaste?
2. **Lectura Rápida de CANON:** Lee `CANON.md` por encima solo para entender en qué vertical general se ubica tu trabajo.
3. **Creación del Archivo:** Escribe un archivo nuevo en la ruta:
   `04-operaciones-y-roadmap/walkthroughs/YYYY-MM-DD-walkthrough-<tema-corto>.md`
4. **Estructura Obligatoria del Walkthrough:**
   El archivo que generes debe estar en Markdown y contener exactamente estas secciones:

   ```markdown
   # Walkthrough Técnico: [Tema]
   **Fecha:** YYYY-MM-DD
   **Agente:** [Tu Nombre / Plataforma]

   ## 1. Resumen Ejecutivo
   [3 a 5 líneas describiendo el logro o trabajo realizado en la sesión]

   ## 2. Archivos Modificados o Creados
   - [ ] `ruta/al/archivo1.ext` (Breve motivo)
   - [ ] `ruta/al/archivo2.ext` (Breve motivo)

   ## 3. Decisiones Técnicas y Descubrimientos
   [Cualquier regla nueva, dependencia instalada, o descubrimiento empírico que el SSOT deba recordar]

   ## 4. Inferencia de Impacto en SSOT (Para el Auditor)
   [Escribe aquí qué verticales crees que se ven afectadas por tu trabajo. Ej: "Creo que esto sube el progreso de Backend al 15% y afecta el satélite de telemetría de la Vertical 02". Dale las pistas al Auditor para que haga bien su trabajo.]
   ```

5. **Mensaje Final al Usuario:** Tras guardar el archivo, dile al usuario: *"He generado el Walkthrough. Ya puedes cerrar esta sesión y abrir una nueva sesión limpia para ejecutar el `agent-auditor-ss`."*
