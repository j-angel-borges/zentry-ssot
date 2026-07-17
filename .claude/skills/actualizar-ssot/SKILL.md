---
name: actualizar-ssot
description: Actualiza el SSOT de ZentryOS al cerrar una sesión de trabajo. Edita quirúrgicamente el campo pertinente de CANON.md + el satélite afectado, registra el cambio en CHANGELOG-SSOT.md, hace commit (y push tras confirmación) en GitHub, y re-espeja el documento vivo de Drive (SSOT-VIVO.md). Invócala cuando termines una tarea que cambió el estado, una decisión o el progreso del proyecto.
---

# 🔄 Skill: actualizar-ssot

Mantiene el SSOT como fuente de verdad viva entre sesiones y plataformas (Claude, Antigravity/AGY, Gemini, Codex). Su principio rector es **edición quirúrgica, nunca regeneración**: solo se toca el campo que cambió. Regenerar archivos completos fue la causa histórica del ruido y la divergencia — está prohibido.

## Cuándo invocarla
Al terminar cualquier sesión que haya cambiado: el estado real del proyecto (%, features), una decisión técnica, el progreso de una vertical, o que deba quedar registrada en la bitácora. NO para ediciones triviales de redacción.

## Entrada que necesita (el "delta")
Un resumen breve de la sesión con: (a) **qué cambió** en una o dos frases; (b) **a qué vertical/campo pertenece**; (c) si cambió algún **número de estado** de CANON §2; (d) si hubo alguna **decisión nueva** para CANON §3.

Si el usuario no lo da explícito, infiérelo del trabajo de la sesión y **confírmalo con él antes de escribir**.

## Procedimiento (paso a paso)

1. **Leer el estado actual.** Abre `CANON.md` (§2 estado, §3 decisiones) y el `README.md`/satélite de la vertical afectada. Nunca cargues el SSOT completo.

2. **Editar quirúrgicamente — solo lo que cambió:**
   - **CANON.md §2** si cambió el estado real por capa (UI/UX, Core, Device Owner, Backend, Tests, Comercial). Actualiza el número y la descripción; conserva la nota de honestidad demo-readiness ≠ completitud.
   - **CANON.md §3** si hubo una decisión técnica nueva o reconciliación (añade/edita el pilar correspondiente; fecha la reconciliación).
   - **CANON.md §4** si cambió el checklist anti-regresión (features añadidas/retiradas).
   - **El satélite de la vertical** afectada: actualiza su cuerpo y su **frontmatter** (`date`, `status`, `progress`). Solo `CANON` declara el estado global; el satélite detalla, no duplica cifras globales.
   - Actualiza la marca **"Última consolidación: <fecha>"** al inicio de CANON.

3. **Registrar en `CHANGELOG-SSOT.md`** (append-only, al principio de la lista): una línea con el formato:
   `- **YYYY-MM-DD** · <agente/plataforma> · <vertical> — <delta en una frase>.`
   Nunca reescribas entradas anteriores; solo añade.

4. **Commit en GitHub** (working dir del repo `zentry-ssot`):
   ```bash
   git add -A
   git commit -m "ssot(<NN-vertical>): <delta corto>"
   ```
   Mensaje convencional. **El `git push` se hace solo tras confirmación explícita del owner** (publicar es irreversible). Muestra el `git status`/`git log -1` y pide el OK para `git push origin main`.

5. **Re-espejar el documento vivo de Drive** (`G:\Mi unidad\aa. QUARZ\A. ZentryOS\SSOT-VIVO.md`):
   Regenera ese único archivo concatenando, en este orden: (a) el `CANON.md` actualizado íntegro; (b) el índice de las 7 verticales (de `llms.txt`); (c) las **10 entradas más recientes** de `CHANGELOG-SSOT.md`. Encabézalo con "⚠️ ESPEJO DE SOLO-LECTURA — no editar a mano; se regenera con la skill actualizar-ssot. Fuente de verdad: GitHub." Así Drive queda idéntico a la verdad de GitHub sin volver a divergir.

## Reglas de oro
- **Edición quirúrgica**, nunca regeneración de archivos completos (salvo `SSOT-VIVO.md`, que por diseño es un espejo regenerado).
- **Solo `CANON.md` declara el estado**; los satélites enlazan.
- **`push` solo con OK del owner.** El commit local siempre; la publicación, confirmada.
- **`SSOT-VIVO.md` jamás se edita a mano** — se edita GitHub y se re-espeja.
- Mantén `AGENTS.md` y `CLAUDE.md` sincronizados entre sí si cambia el contrato de arranque.

## Checklist de cierre
- [ ] CANON §2/§3/§4 refleja el cambio (solo el campo pertinente).
- [ ] Frontmatter del satélite afectado actualizado (`date`/`status`/`progress`).
- [ ] Nueva línea en `CHANGELOG-SSOT.md` (append, no reescritura).
- [ ] Commit local hecho con mensaje convencional; push ofrecido al owner.
- [ ] `SSOT-VIVO.md` de Drive re-espejado.
