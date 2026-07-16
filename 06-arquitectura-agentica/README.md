---
title: "Arquitectura Agéntica: Gobierno del Ejecutor de Código (Antigravity 2.0)"
date: 2026-07-14
status: "under-review"
progress: 100%
tags: ["zentryos", "ssot", "arquitectura-agentica"]
---

# 🤖 Vertical 6: Arquitectura Agéntica

Esta vertical define **cómo se gobierna al ejecutor de código**: Google Antigravity 2.0 (y agentes AGY equivalentes) operando sobre el workspace Android `zentrybyantig`. Es el puente entre el SSOT (qué construir) y el código Kotlin/Compose del prototipo (cómo se construye) — sin esta vertical, la arquitectura técnica es un plano sin constructor asignado.

> **Regla de arranque (no negociable):** antes de cualquier tarea, el ejecutor carga [`CANON.md`](../CANON.md) — la verdad del proyecto (estado real por capa, decisiones irrevocables, checklist anti-regresión, reglas duras). Ningún plan ni código puede contradecirla. Luego navega a la vertical relevante vía [`llms.txt`](../llms.txt); **nunca** carga todo el SSOT a la vez.

---

## 🧠 Modelo de dos niveles

```text
[NIVEL 1 — ORQUESTADOR: Claude Fable 5]
  Redacta y consolida especificaciones atómicas en el repo SSOT (zentry-ssot).
  No edita código nativo. Gobierna con CANON.md como verdad suprema.
      |
      |  (specs aprobadas: satélite de vertical + criterios Given/When/Then)
      v
[GATE HITL — OPERADOR HUMANO]
  Aprueba el Implementation Plan antes de cualquier edición de código.
  Autoriza acciones sensibles: alterar el AndroidManifest o los permisos de
  Device Owner (el DO YA está activo y aprovisionado — el gate lo PROTEGE),
  añadir dependencias Gradle, tocar secretos.
      |
      v
[NIVEL 2 — EJECUTOR: Antigravity 2.0 (workspace zentrybyantig)]
  Lee la spec → genera Task List + Implementation Plan → espera aprobación →
  edita código secuencialmente → compila y verifica → entrega Walkthrough.
```

Reglas del modelo: el orquestador nunca improvisa código; el ejecutor nunca improvisa arquitectura. Todo lo que el ejecutor necesita saber vive en tres capas: su identidad (`AGENTS.md`), sus límites (`.agents/rules/`) y sus procedimientos (`.agents/workflows/` + `.agents/skills/`).

---

## 🗂️ Mapa de archivos de configuración del workspace

| Archivo físico en `zentrybyantig` | Fuente canónica en esta vertical | Propósito |
|---|---|---|
| `AGENTS.md` | [agents-md-workspace.md](./agents-md-workspace.md) | Identidad, misión, mapa del codebase y estándares del ejecutor |
| `.agents/rules/00-guardrails.md` | [reglas-y-guardrails.md](./reglas-y-guardrails.md) | Reglas duras: hard-stops, acciones prohibidas, anti-regresión, DoD |
| `.agents/skills/zentry-design-system/SKILL.md` | [skills-recomendadas.md](./skills-recomendadas.md) | Sistema Liquid Glass (Haze) y tokens visuales |
| `.agents/skills/zentry-web-microapp/SKILL.md` | [skills-recomendadas.md](./skills-recomendadas.md) | Patrón microapp PWA (paradigma web-first) |
| `.agents/skills/zentry-device-owner/SKILL.md` | [skills-recomendadas.md](./skills-recomendadas.md) | Operación y **protección** del Device Owner ya activo |
| `.agents/skills/zentry-microapp-pattern/SKILL.md` | [skills-recomendadas.md](./skills-recomendadas.md) | Patrón microapp nativo (**legacy** — superado por web-first) |
| `.agents/workflows/spec-a-implementacion.md` | [roadmap-sdd.md](./roadmap-sdd.md) | Flujo SDD: spec → plan → aprobación → código → walkthrough |
| `.agents/workflows/poda-de-contexto.md` | [loop-engineering.md](./loop-engineering.md) | Rutina de compresión de contexto de sesión |
| `.agents/workflows/verificacion-build.md` | [loop-engineering.md](./loop-engineering.md) | Bucle build-verify con hard-stop a 10 fallos |
| `.agents/mcp_config.template.json` | [mcp-y-memoria.md](./mcp-y-memoria.md) | Plantilla de pasarela MCP (destino real: `~/.gemini/config/mcp_config.json`) |

Jerarquía efectiva de gobernanza (mayor a menor prioridad): **`CANON.md` del SSOT** (verdad del proyecto, se carga primero) → `GEMINI.md` del usuario (**no se toca**) → `AGENTS.md` del workspace → `.agents/rules/*.md` → defaults del sistema. Los detalles de superficie de Antigravity provienen de fuentes secundarias: toda plantilla queda marcada **«validar en AGY instalado»**.

---

## 🔄 Protocolo de sincronización (workspace sin git)

`zentrybyantig` **no tiene control de versiones propio**. Para evitar deriva entre el SSOT y los archivos operativos locales:

1. **El SSOT es el master**: los archivos físicos son copias de los bloques delimitados publicados en esta vertical. Nunca se editan directamente en el workspace; se edita el satélite (y, cuando cambia el estado del proyecto, CANON.md vía la skill `actualizar-ssot`) y se re-copia.
2. **Acuse de sincronización**: tras cada copia, el ejecutor confirma en su siguiente Walkthrough la versión (fecha del frontmatter del satélite fuente) de los archivos operativos con los que trabajó.
3. **Verificación por diff**: el operador puede validar en cualquier momento que la copia física es idéntica al bloque fuente (comparación textual directa).
4. **Fuente viva única**: prohibido tomar como verdad cualquier copia obsoleta del SSOT que haya quedado suelta en el workspace (p. ej. `*.bak` heredados). La verdad viva es `CANON.md` + la vertical relevante del repo `zentry-ssot`.

---

## 📂 Contenido del Módulo

1. **[Identidad del ejecutor (AGENTS.md)](./agents-md-workspace.md)**: rol, contexto de producto (estado real: Device Owner ~95% activo), mapa lógico de clases del prototipo y ciclo de artifacts.
2. **[Reglas y guardrails](./reglas-y-guardrails.md)**: contención técnica innegociable — hard-stop a 10 builds fallidos, HITL para el Manifest/DO (protege la config activa), checklist anti-regresión de 12 features (CANON §4).
3. **[Skills recomendadas](./skills-recomendadas.md)**: curación de habilidades instalables (máx. 8 activas) y diseño de las skills propias de ZentryOS (`zentry-design-system`, `zentry-web-microapp`, `zentry-device-owner`, `zentry-microapp-pattern` legacy).
4. **[MCP y memoria](./mcp-y-memoria.md)**: plantilla de pasarela de herramientas (Firebase/GitHub) y política de memoria a largo plazo entre sesiones.
5. **[Loop engineering](./loop-engineering.md)**: presupuesto de contexto, prompt de poda, política de modelos del ejecutor y condiciones de parada de emergencia.
6. **[Roadmap SDD](./roadmap-sdd.md)**: etapas E0-E6 del desarrollo guiado por especificaciones. **Device Owner ya está HECHO**; la frontera real es backend/telemetría/panel padre.

---

## 🔗 Cableado con el resto del SSOT

| Contrato compartido | Documento propietario | Uso en esta vertical |
|---|---|---|
| Estado real por capa (DO ~95%, Core ~35%, UI/UX ~40%, backend ~5%, tests 0%) | [CANON.md §2](../CANON.md) | Punto de partida del roadmap SDD; ninguna etapa lo contradice |
| Decisiones DO + AccessibilityService + Google Workspace + modelo-como-configuración | [CANON.md §3](../CANON.md) | Guardrails, skills e identidad derivan de aquí |
| Checklist anti-regresión de 12 features | [CANON.md §4](../CANON.md) | El DoD del ejecutor exige el checklist completo |
| Reglas duras de desarrollo (secretos, HITL Manifest, Gradle, build) | [CANON.md §5](../CANON.md) | Base vinculante de `reglas-y-guardrails.md` |
| Análisis de brechas | [02/analisis-de-brechas.md](../02-arquitectura-tecnica/analisis-de-brechas.md) | Las etapas E cierran brechas concretas |
| Confinamiento Device Owner / matriz iOS | [02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md) | Matriz de viabilidad referenciada por el roadmap SDD |
| Firestore, kill-switch y telemetría | [02/telemetria-gcp-ai.md](../02-arquitectura-tecnica/telemetria-gcp-ai.md) | Fuente única para las etapas E3/E5 |
| Paradigma híbrido web-first (cáscara + microapps PWA) | [02/paradigma-web-first.md](../02-arquitectura-tecnica/paradigma-web-first.md) | Base de la skill `zentry-web-microapp` |
| Fases F1-F4 y contingencias | [04/roadmap.md](../04-operaciones-y-roadmap/roadmap.md) | Cada etapa E traza a una fase F por criterios de salida |
