---
title: "Loop Engineering: Presupuesto de Contexto, Poda y Política de Modelos"
date: 2026-07-14
status: "under-review"
progress: 100%
tags: ["zentryos", "ssot", "arquitectura-agentica", "loop-engineering"]
---

# ♻️ Loop Engineering

Mecanismos de mitigación de consumo de tokens y de control del bucle de trabajo. Esta vertical existe porque una sesión de orquestación anterior **colapsó por saturación de cuota** (consumo acumulado ~221.8k tokens con ejecución concurrente descontrolada). Loop engineering es la disciplina que evita repetirlo: presupuesto de contexto explícito, poda periódica y paradas de emergencia.

---

## 🧮 Presupuesto de contexto

Principios de economía de tokens del ejecutor:

*   **`CANON.md` + una vertical por tarea, nunca el monolito**: cargar el agregado `ssot-actual.md` (histórico) agota la ventana; se carga [`CANON.md`](../CANON.md) y solo la vertical relevante ([tabla en mcp-y-memoria](./mcp-y-memoria.md)).
*   **Poda al entrar en un milestone nuevo**: al cerrar una etapa E o cambiar de spec, ejecutar `/poda-de-contexto` antes de continuar.
*   **No re-leer archivos grandes** para redactar resúmenes de estado: usar solo lo que ya está en contexto.
*   **Descartar hilos resueltos**: errores de compilación ya corregidos e hipótesis descartadas salen del contexto activo (viven en memoria a largo plazo si aportan aprendizaje).

## ✂️ Prompt literal de poda de contexto

Este es el texto exacto que ejecuta el workflow `.agents/workflows/poda-de-contexto.md`:

```text
Resume el estado actual de la sesión para continuar con contexto mínimo. Reglas:

1. ESTADO: describe en máximo 5 líneas qué tarea ejecutas, contra qué spec y en qué paso del Implementation Plan estás.
2. HECHO: lista los archivos ya modificados, 1 línea por archivo (qué cambió y por qué).
3. DESCARTA: elimina del contexto todo hilo ya resuelto — errores de compilación corregidos, hipótesis descartadas, contenido de archivos que ya no vas a tocar. No vuelvas a mencionarlos.
4. PENDIENTE: lista cada paso restante del plan con su criterio de aceptación textual (Given/When/Then) tal como aparece en la spec.
5. BLOQUEOS: si algo espera decisión humana, decláralo en 1 línea citando el trigger de escalada que aplica.
6. NO re-leas archivos grandes para redactar este resumen: usa solo lo que ya está en contexto.

El resumen sustituye TODO el historial anterior: lo que no incluyas se pierde. Sé exhaustivo en PENDIENTE y brutal en DESCARTA.
```

---

## 💰 Política de modelos (económico por defecto + escalada manual)

Decisión ratificada por el operador. El pool de Antigravity comparte cuota entre modelos, así que la asignación es deliberada:

| Tipo de trabajo | Modelo del ejecutor | Racional |
|---|---|---|
| Boilerplate, refactors mecánicos, renombrados, formato | **Modelo económico (tier Flash)** | Alto volumen, bajo riesgo interpretativo; no justifica cuota premium |
| Interpretación de spec, decisiones de arquitectura, resolución de fallos no triviales | **Modelo top (tier Pro / Claude), por escalada manual del operador** | Requiere razonamiento profundo; el humano decide cuándo subir de tier |

Regla: el ejecutor **no auto-escala** a modelo top; propone la escalada y el operador la concede. Esto evita agotar el pool compartido sin control.

> Nota de deslinde: esta política gobierna el **modelo del propio ejecutor** en Antigravity, no el modelo de IA del producto. El ID del modelo que consume la app se lee **siempre** de `BuildConfig.ZENTRY_MODEL_ID` (hoy `gemini-2.5-flash`), nunca un literal en código.

---

## 🚨 Condiciones de parada de emergencia

| Disparador | Umbral | Acción |
|---|---|---|
| Compilaciones fallidas consecutivas | 10 | HARD STOP + reporte estructurado ([reglas-y-guardrails](./reglas-y-guardrails.md)) |
| Ciclos de test fallidos sobre el mismo criterio | 3 | STOP de la tarea + hipótesis de causa raíz |
| Cuota de modelo baja | señal del pool | Detener; no quemar el resto en reintentos; escalar a humano |
| Spec ambigua o criterios contradictorios | detección | Escalada inmediata; no improvisar |
| Contexto saturado | entrada a milestone | Ejecutar `/poda-de-contexto` antes de continuar |
| Riesgo sobre la superficie Device Owner activa | cualquier toque al Manifest/permisos DO | STOP + HITL: se **protege** la config DO ya activa, no se modifica sin aprobación |

El reporte estructurado de HARD STOP por build incluye: (a) el stack trace exacto del compilador, (b) las últimas 3 variantes de código intentadas y descartadas, (c) una hipótesis puntual sobre el bloqueo estructural.

---

## 🔗 Cableado

| Contrato | Documento |
|---|---|
| Formato completo del reporte de HARD STOP y bucle build-verify | [reglas-y-guardrails.md](./reglas-y-guardrails.md) → `verificacion-build.md` |
| Memoria a largo plazo (destino de los aprendizajes podados) | [mcp-y-memoria.md](./mcp-y-memoria.md) |
| Etapas E donde aplica la poda entre milestones | [roadmap-sdd.md](./roadmap-sdd.md) |
| Reglas duras de desarrollo (base vinculante) | [CANON.md §5](../CANON.md) |
