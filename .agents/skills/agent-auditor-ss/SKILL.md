---
name: agent-auditor-ss
description: Lee el Walkthrough generado por el agente anterior, cruza los datos con CANON.md, audita conflictos y ejecuta ediciones quirúrgicas para mantener la pureza del SSOT.
---

# 🔎 Skill: agent-auditor-ss (Auditor Stateless de SSOT)

**Rol:** Auditor / Ingeniero Agéntico. Esta skill **solo** debe invocarse en una sesión completamente nueva y limpia (0 tokens de fatiga). Eres la barrera de seguridad de la documentación.
**Entorno de Trabajo Local:** La raíz oficial del repositorio Git activo es `C:\Users\jange\Documents\GitHub\zentry-ssot`.

## Cuándo invocarla
Inmediatamente después de que una sesión de desarrollo ha terminado y ha dejado un archivo `Walkthrough` en `04-operaciones-y-roadmap/walkthroughs/`.

## Entrada que necesitas
La ruta o el contenido del `Walkthrough` recién generado por el agente obrero.

## Procedimiento (Paso a Paso)

1. **Carga Limpia de Contexto:** 
   - Lee `CANON.md` para entender la Verdad Absoluta actual del proyecto.
   - Lee el `Walkthrough` que dejó el agente anterior.

2. **Auditoría de Conflictos (Análisis Crítico):**
   - Compara las Decisiones e Impacto Inferido del obrero con el `CANON.md`. 
   - *¿Introdujo una dependencia prohibida? ¿Tocó una vertical que afecta a otra (ej. un cambio en UI afecta la arquitectura de Compose)?*

3. **Edición Quirúrgica de GitHub:** 
   Utiliza tus herramientas para modificar archivos (nunca regeneración completa, solo edición quirúrgica o `multi_replace_file_content`):
   - **En `CANON.md`**: Actualiza el porcentaje de progreso en §2 si amerita. Añade reglas nuevas a §3 si hubo decisiones irrevocables. Actualiza la fecha "Última consolidación".
   - **En Satélites (Verticales 01 a 07)**: Abre **solo** los README o satélites afectados. Actualiza su `date` y `progress` en el frontmatter, e inyecta la documentación técnica nueva.
   
4. **Registro en Changelog:**
   Añade una sola línea al principio de `CHANGELOG-SSOT.md` con este formato:
   `- **YYYY-MM-DD** · <agente-auditor> · <Vertical Afectada> — <Resumen del logro consolidado>.`

5. **Espejo Automático a Drive (Para Gemini / Google Workspace):**
   Sincroniza la estructura de documentación viva hacia la carpeta espejo en Google Drive:
   - Copia/actualiza los archivos `.md` de las verticales a `G:\Mi unidad\aa. QUARZ\A. ZentryOS\zentry-ssot` (sin incluir `.git`).
   - Regenera además el archivo `G:\Mi unidad\aa. QUARZ\A. ZentryOS\SSOT-VIVO.md` concatenando:
     `(1) CANON.md + (2) Índice de verticales + (3) Las últimas 10 líneas de CHANGELOG-SSOT.md`.
     *(Asegúrate de agregar el aviso: "⚠️ ESPEJO DE SOLO-LECTURA...")*.

6. **Protocolo de Publicación (HITL):**
   - Ejecuta en la terminal: `git add .` y `git commit -m "ssot: consolidacion de <tema> via auditor stateless"`.
   - Muestra el `git status` y el `git log -1` al usuario.
   - **Pregunta explícitamente:** *"He completado la auditoría y preparado el commit. ¿Tienes observaciones o me das permiso para ejecutar `git push origin main`?"*
   - Ejecuta el push solo cuando el humano te dé el 'OK'.

7. **Despedida Efímera:** Una vez hecho el push, recomienda al usuario cerrar la sesión para liberar la RAM. Tu trabajo ha concluido.
