# Instalación y ubicaciones de la skill `actualizar-ssot`

> **Para cualquier agente que analice esto:** este documento mapea DÓNDE vive físicamente la skill `actualizar-ssot` en la máquina de José Ángel (Windows, usuario `jange`), y cómo mantenerla. Verificado empíricamente el 2026-07-15.

## 1. Fuente canónica (la que se edita)

```
G:\Mi unidad\aa. QUARZ\A. ZentryOS\zentry-ssot\.agents\skills\actualizar-ssot\SKILL.md
```
Versionada en GitHub: `github.com/j-angel-borges/zentry-ssot`. **Si se edita la skill, se edita AQUÍ** y luego se re-copia a las demás ubicaciones (ver §4).

## 2. Copias instaladas (todas idénticas a la fuente)

| Ruta | Plataforma / alcance | Estado |
|---|---|---|
| `C:\Users\jange\.claude\skills\actualizar-ssot\SKILL.md` | **Claude** — skill personal global; visible desde cualquier carpeta y cualquier sesión | ✅ verificada funcionando |
| `C:\Users\jange\.agents\skills\actualizar-ssot\SKILL.md` | **Estándar cross-tool** (`.agents/`, convención AGENTS.md). Convive con 12 skills preexistentes (genkit, firebase) | ✅ instalada |
| `C:\Users\jange\.gemini\config\skills\actualizar-ssot\SKILL.md` | **Antigravity — config global** (pool más grande: 22 skills preexistentes) | ✅ instalada |
| `C:\Users\jange\.gemini\antigravity\skills\actualizar-ssot\SKILL.md` | **Antigravity — app desktop** (15 skills preexistentes) | ✅ instalada |
| `zentry-ssot\.claude\skills\actualizar-ssot\SKILL.md` | Del proyecto (si se abre Claude dentro del repo); va en GitHub | ✅ versionada |

## 3. Topología real de Antigravity (verificada, no supuesta)

Antigravity tiene 3 superficies. Hallazgo empírico:

```
C:\Users\jange\.gemini\
├── config\skills\        → 22 skills   (pool global)
├── antigravity\skills\   → 15 skills   (app desktop)
├── antigravity-cli\      → SIN carpeta skills  (tiene: bin, brain, builtin, cache)
└── antigravity-ide\      → SIN carpeta skills  (tiene: bin, brain, implicit)
```

**Conclusión honesta:** CLI e IDE **no tienen carpeta `skills` propia**, por lo que necesariamente leen de una compartida (`config/skills` y/o `.agents/skills`). **No se ha determinado con certeza cuál lee cada superficie** — por eso se aplicó *cobertura total*: la skill está en las 3 ubicaciones posibles. Si se confirma cuál es la correcta, se pueden eliminar las redundantes.

También hay **dos** `mcp_config.json` distintos (`.gemini\antigravity\mcp_config.json` y `.gemini\config\mcp_config.json`) → los MCPs **no** parecen compartirse entre superficies. Validar caso por caso.

## 4. Mantenimiento (evitar deriva entre copias)

Windows + Google Drive no llevan bien los enlaces simbólicos, por eso son **copias físicas**. Al editar la skill:

```bash
SRC="G:/Mi unidad/aa. QUARZ/A. ZentryOS/zentry-ssot/.agents/skills/actualizar-ssot/SKILL.md"
for D in "C:/Users/jange/.claude/skills/actualizar-ssot" \
         "C:/Users/jange/.agents/skills/actualizar-ssot" \
         "C:/Users/jange/.gemini/config/skills/actualizar-ssot" \
         "C:/Users/jange/.gemini/antigravity/skills/actualizar-ssot" \
         "G:/Mi unidad/aa. QUARZ/A. ZentryOS/zentry-ssot/.claude/skills/actualizar-ssot"; do
  mkdir -p "$D" && cp "$SRC" "$D/SKILL.md"
done
```

Verificar que no hay deriva:
```bash
for f in $(find "C:/Users/jange/.agents" "C:/Users/jange/.gemini" "C:/Users/jange/.claude" -path "*actualizar-ssot/SKILL.md"); do diff -q "$SRC" "$f"; done
```

## 5. Cómo se invoca

- **Claude:** `/actualizar-ssot`, o en lenguaje natural ("actualiza el SSOT: el backend pasó de 5% a 12%") — se auto-detecta por su `description`. Las skills se cargan **al iniciar la sesión**: si se acaba de instalar, reiniciar.
- **Antigravity (cualquier superficie):** invocar por nombre o describir la tarea. **Pendiente de validar en cada superficie** (marcar «validado en AGY» cuando se confirme).

## 6. Qué hace (resumen; el contrato completo está en `SKILL.md`)

Lee el estado → recibe el delta de la sesión → **edita quirúrgicamente** solo el campo que cambió (`CANON.md` §2/§3/§4 + el satélite) → append en `CHANGELOG-SSOT.md` → commit (push tras OK del owner) → re-espeja `SSOT-VIVO.md` en Drive.

Reglas de oro: **edición quirúrgica, nunca regeneración**; **solo CANON declara el estado**; **`SSOT-VIVO.md` no se edita a mano**.
