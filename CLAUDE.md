# CLAUDE.md — Punto de Entrada para Claude (terminal · desktop · Code)

> Este archivo lo carga Claude al abrir el repo `zentry-ssot`. Es el contrato de arranque. Su gemelo para Antigravity/AGY es `AGENTS.md` (contenido equivalente — mantener ambos sincronizados).

## ⛳ Regla de arranque (no negociable)

**Antes de cualquier tarea, carga [`CANON.md`](CANON.md).** Es la verdad del proyecto: estado real por capa, decisiones irrevocables, checklist anti-regresión y reglas duras. Ningún plan ni código puede contradecirlo. Luego usa [`llms.txt`](llms.txt) para navegar a la vertical relevante — **nunca cargues todo el SSOT a la vez**; carga solo el capítulo que tu tarea necesita (protege la ventana de contexto).

## 🧭 Qué es ZentryOS (en 4 líneas)

Launcher kiosk Android para menores (2-20 años), enfocado en Gobernanza Activa de la Atención. Device Owner real (~95%, testeado en Redmi 9), Liquid Glass premium (Haze), tutor de IA vía Firebase AI Logic. El código vive en el workspace Android `zentrybyantig` (repo aparte); este repo es el **SSOT documental** que lo gobierna.

## 🗺️ Mapa de navegación por tipo de tarea

| Si tu tarea es sobre… | Carga (además de CANON) |
|---|---|
| Kiosk, Device Owner, launcher, seguridad de sistema | `02-arquitectura-tecnica/control-dispositivo-abm.md`, `seguridad-y-privacidad.md` |
| UI, Liquid Glass, física de movimiento, microapps visuales | `02-arquitectura-tecnica/interfaz-compose.md`, `05-mesa-de-trabajo/`, `07-plataforma-microapps/` |
| Backend, Firestore, IA, telemetría, kill-switch | `02-arquitectura-tecnica/modelo-de-datos-firestore.md`, `telemetria-gcp-ai.md` |
| Testing, build, calidad, despliegue | `02-arquitectura-tecnica/calidad-y-despliegue.md` |
| Planificación, roadmap, capas de desarrollo | `04-operaciones-y-roadmap/roadmap.md`, `plan-maestro-por-capas.md` |
| Configuración agéntica / skills / MCP | `06-arquitectura-agentica/` |

## 🔒 Reglas duras (resumen — la versión vinculante está en CANON §5)

1. **No secretos en git** (API keys, keystores, `local.properties`, `google-services.json`).
2. **HITL para el Manifest / Device Owner:** toda alteración de permisos DO requiere aprobación humana antes de compilar.
3. **No dependencias Gradle nuevas** sin aprobación explícita.
4. **Compila tras cada cambio significativo** (`./gradlew assembleDebug`) y respeta el checklist anti-regresión de 12 features (CANON §4).

## 🔄 AL FINALIZAR LA SESIÓN:
Invoca la skill [`agent-execute-wt`](.agents/skills/agent-execute-wt/SKILL.md) antes de despedirte. Esta skill generará un Walkthrough limpio con tus avances sin tocar el SSOT, para que luego un Agente Auditor actualice el proyecto en una sesión nueva. **No dejes tu trabajo sin documentar: es el pegamento entre sesiones.**
