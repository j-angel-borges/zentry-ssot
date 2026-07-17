---
title: "MCP y Memoria: Pasarela de Herramientas y Persistencia entre Sesiones"
date: 2026-07-14
status: "under-review"
progress: 100%
tags: ["zentryos", "ssot", "arquitectura-agentica", "mcp"]
---

# 🔌 MCP y Memoria a Largo Plazo

Dos mecanismos que extienden al ejecutor más allá de una sola sesión: el **Model Context Protocol (MCP)**, que le da herramientas (Firebase, GitHub), y la **memoria a largo plazo**, que preserva decisiones y aprendizajes entre sesiones. Ambos se documentan como plantilla: la ubicación exacta y el formato se marcan **«validar en AGY instalado»**.

---

## 🧰 Pasarela MCP

El archivo de configuración MCP **no vive en el repo del workspace**: reside en el directorio de usuario del sistema local (`~/.gemini/config/mcp_config.json` — «validar en AGY instalado»). En el repo solo publicamos una **plantilla sin credenciales**.

### 📄 Plantilla física — archivo destino

```json
<!-- ARCHIVO DESTINO: zentrybyantig/.agents/mcp_config.template.json  (copiar a ~/.gemini/config/mcp_config.json) -->
{
  "_instrucciones": "copiar a ~/.gemini/config/mcp_config.json y completar placeholders; NO poner credenciales aquí; validar formato en la instalación local de Antigravity",
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "firebase-tools@latest", "mcp", "--dir", "<RUTA_ABSOLUTA_DEL_PROYECTO_FIREBASE>"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<COMPLETAR_SOLO_EN_LOCAL_NUNCA_EN_REPO>"
      }
    }
  }
}
```

### ⏳ Política de activación por etapa

| Servidor MCP | Presente desde | Activo desde | Motivo |
|---|---|---|---|
| `firebase` | E0 (plantilla en el workspace) | **E3** (backend) | El aprovisionamiento Device Owner ya está **hecho**; la frontera real es backend/telemetría. No cargar la pasarela de Firestore/AI Logic mientras el trabajo es cáscara/launcher: protege ventana de contexto y evita herramientas ociosas en el prompt |
| `github` | E0 | Bajo demanda | Solo si la tarea toca CI o el repo SSOT; el token se completa exclusivamente en local |

Decisión ratificada por el operador: **MCP Firebase presente desde E0 pero con activación diferida a E3**. Antes de E3, el ejecutor trabaja sin herramientas de backend (la cáscara y las microapps PWA no las necesitan).

---

## 📖 Qué cargar según el tipo de tarea

Regla de arranque (no negociable): se carga **siempre** [`CANON.md`](../CANON.md) primero, y luego **una sola** vertical/satélite relevante navegando por [`llms.txt`](../llms.txt). **Nunca** el monolito agregado (`ssot-actual.md`): es histórico y agota contexto y cuota.

| Tipo de tarea | Qué cargar (además de `CANON.md`) |
|---|---|
| Cáscara nativa, launcher, navegación, gestos, Liquid Glass | [02/interfaz-compose.md](../02-arquitectura-tecnica/interfaz-compose.md) + [05/colorimetria-y-diseno.md](../05-mesa-de-trabajo/colorimetria-y-diseno.md) |
| Microapp de contenido (PWA web-first) | [07-plataforma-microapps](../07-plataforma-microapps/README.md) + [02/paradigma-web-first.md](../02-arquitectura-tecnica/paradigma-web-first.md) |
| Backend, Firestore, kill-switch, telemetría, IA | [02/telemetria-gcp-ai.md](../02-arquitectura-tecnica/telemetria-gcp-ai.md) + [02/modelo-de-datos-firestore.md](../02-arquitectura-tecnica/modelo-de-datos-firestore.md) |
| Seguridad, Device Owner (**proteger la config activa**), privacidad | [02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md) + [02/seguridad-y-privacidad.md](../02-arquitectura-tecnica/seguridad-y-privacidad.md) |
| Testing, build, despliegue | [02/calidad-y-despliegue.md](../02-arquitectura-tecnica/calidad-y-despliegue.md) |
| Planificación, backlog, criterios de etapa | [04/roadmap.md](../04-operaciones-y-roadmap/roadmap.md) + [04/backlog-tareas.md](../04-operaciones-y-roadmap/backlog-tareas.md) |
| Configuración del propio agente | `06-arquitectura-agentica` (esta vertical) |

---

## 🧠 Memoria a largo plazo

El ejecutor mantiene una memoria persistente entre sesiones para no repetir errores ni redescubrir decisiones. Qué se registra:

*   **Decisiones técnicas clave**: por qué se eligió un enfoque sobre otro (con enlace a la spec o al criterio de aceptación que lo motivó).
*   **Enfoques de código fallidos**: variantes que no compilaron o rompieron la demo, para no reintentarlas — el antídoto directo contra los bucles de compilación.
*   **Estado de sincronización**: fecha-versión de los archivos operativos (`AGENTS.md`, guardrails, skills) con los que se trabajó por última vez.

La memoria **referencia** los IDs de los registros GAP/THR/EVA, pero **nunca los reescribe ni los duplica**: esos registros tienen *single-writer* en la [Vertical 02](../02-arquitectura-tecnica/analisis-de-brechas.md) y la memoria del agente no es su fuente de verdad.

Qué **NUNCA** entra en memoria: secretos, credenciales, transcripciones de menores, o cualquier dato de la [tabla canónica de privacidad](../02-arquitectura-tecnica/seguridad-y-privacidad.md). La ubicación física del store de memoria se marca «validar en AGY instalado».

---

## 🔗 Cableado

| Contrato | Documento |
|---|---|
| Regla de arranque (CANON primero, una vertical por tarea) | [CANON.md](../CANON.md) · [llms.txt](../llms.txt) |
| Prohibición de secretos y datos sensibles en memoria | [02/seguridad-y-privacidad.md](../02-arquitectura-tecnica/seguridad-y-privacidad.md) |
| Registros GAP/THR/EVA con single-writer (la memoria solo referencia) | [02/analisis-de-brechas.md](../02-arquitectura-tecnica/analisis-de-brechas.md) |
| Activación E3 del backend (etapa que enciende Firebase) | [roadmap-sdd.md](./roadmap-sdd.md) |
| Rutina de poda que complementa la memoria | [loop-engineering.md](./loop-engineering.md) |
| Guardrail de secretos (refuerza la exclusión de memoria) | [reglas-y-guardrails.md](./reglas-y-guardrails.md) |
