---
title: "Plan Maestro de Desarrollo por Capas: la Mente Maestra de ZentryOS"
date: 2026-07-14
status: "under-review"
progress: 92%
tags: ["zentryos", "ssot", "plan-maestro"]
---

# 🧠 Plan Maestro de Desarrollo por Capas

Este documento es la **mente maestra** del proyecto: la visión estructural de largo plazo que ordena todo lo que Antigravity 2.0 debe construir — confinamiento MDM/Device Owner (hoy **~95% real y testeado**), cerebro de IA, dashboard parental, operación comercial — y que el **operador humano lidera** decidiendo en cada checkpoint. No sustituye al [roadmap temporal](./roadmap.md) (fases F1-F4, el *cuándo*) ni al [roadmap agéntico](../06-arquitectura-agentica/roadmap-sdd.md) (etapas E0-E6, el *cómo ejecuta el agente*): define el ***qué* se consolida y en qué orden estructural** — las capas.

**Regla de lectura**: el trabajo diario puede tocar varias capas a la vez; la **consolidación es estrictamente ascendente**. Ninguna capa se declara consolidada sin pasar su checkpoint (CP-Lx) con el operador humano — y ningún checkpoint contiene cifras de KPI: esos viven solo en [progreso y métricas](./progreso-y-metricas.md), y el estado real del producto es el de [CANON](../CANON.md) §2.

---

## 🗺️ El stack de capas

```text
L6  ESCALA MULTIPLATAFORMA     gate iOS · Play Store · consola MDM · pagos
L5  OPERACIÓN COMERCIAL        ritual de venta · piloto 100 familias · CRM · soporte
L4  SUPERFICIE PARENTAL        dashboard padres · control remoto · reportes
L3  CEREBRO CONECTADO          Firestore · kill-switch fail-safe · IA blindada · telemetría v1
L2  CONFINAMIENTO INDUSTRIAL   Device Owner ~95% ✅ · LockTask · suite anti-evasión
L1  EXPERIENCIA NÚCLEO         launcher premium · microapps · Aura IA · demo repetible
L0  FUNDACIÓN AGÉNTICA         SSOT · gobernanza · workspace Antigravity · guardrails
─────────────────────────────────────────────────────────────────────────────
        Cada capa se apoya en la inferior. Consolidación de abajo hacia arriba.
```

### 📊 Tabla de consolidación (estado, no KPI)

| Capa | Consolidación (estado) | Fases/Etapas | Checkpoint |
|---|---|---|---|
| **L0** | ✅ **Consolidada** | F1 / E0 | CP-L0 ✅ superado (SSOT + gobernanza operando) |
| **L1** | ✅ **Consolidada (demo)** | F1 / E1-E2 | CP-L1 ✅ demo repetible verificada en Redmi 9 (Liquid Glass + navegación de sistema, 12-14 jul) |
| **L2** | ✅ **~95% — Device Owner habilitado y testeado** | F2 / E4 | CP-L2 ✅ en dispositivo; resta endurecimiento marginal (no bloqueante) |
| **L3** | ⏳ **~5% — CAPA MÁS BAJA NO CONSOLIDADA** | F1→F3 / E3+E5 | CP-L3 pendiente ← **foco de inversión actual** |
| **L4** | ⏳ 0% | F2→F3 / E5 | CP-L4 pendiente |
| **L5** | ⏳ ~20% (materiales de venta existen) | F3 / E6 | CP-L5 pendiente |
| **L6** | ⏳ 0% (por diseño: espera datos) | F4 | CP-L6 pendiente |

> **Nota de honestidad ([CANON](../CANON.md) §2)**: "consolidación de capa" (checkpoint superado) ≠ "completitud de producto comercial (~12-15%)". La cáscara y el Device Owner son reales y verificados en dispositivo (demo-readiness **alta**); la **brecha principal reconocida es el backend/telemetría (L3, ~5%) y los tests (0%)**. Las cifras de UI/UX (~40%) y Core (~35%) son de completitud de producto, distintas de la consolidación de la demo (L1).

---

## 🧱 L0 — Fundación agéntica y de gobernanza

**Misión**: que exista una única verdad (SSOT), un ejecutor gobernado (Antigravity + guardrails) y un humano con gates reales de decisión. Sin L0, todo lo demás es improvisación cara.

*   **Alcance**: repo SSOT con CI de regeneración, [CANON.md](../CANON.md), Verticales 02, 06 y **07** (plataforma de microapps), archivos operativos del workspace (`AGENTS.md`, reglas, skills, workflows, plantilla MCP), memoria del orquestador.
*   **Entregables**: ✅ escritos y regenerados; workspace `zentrybyantig` operando con reglas y skills cargadas.
*   **Checkpoint CP-L0 (✅ superado)**: Antigravity 2.0 sobre `zentrybyantig` carga `AGENTS.md`, cita sus reglas, genera Task List + Implementation Plan y **espera aprobación** antes de tocar código; compila y entrega Walkthrough; el checklist anti-regresión pasa. La calibración práctica está hecha (las sesiones de ingeniería de julio lo demuestran).
*   **Puntos de escala**: actualización periódica de skills del catálogo comunitario; segundo workspace (dashboard L4) reutilizando la misma plantilla de gobernanza.
*   **Contingencias**: churn de la plataforma Antigravity (releases que cambian rutas de config) → señal: plantillas fallan al cargar → respuesta: re-validar la superficie del workspace ([06/agents-md-workspace.md](../06-arquitectura-agentica/agents-md-workspace.md)) y re-emitir archivos operativos (cambio barato: todo es copia desde el SSOT).

## 🎨 L1 — Experiencia núcleo del launcher

**Misión**: que un niño prefiera ZentryOS a un launcher normal, y que un padre lo perciba como producto de lujo en los 60 primeros segundos de demo.

*   **Alcance**: launcher home + 12 features del checklist, sistema sensorial completo ([interfaz premium](../02-arquitectura-tecnica/interfaz-compose.md): Zentry Glass 2.0 real vía Haze por tiers, springs interrumpibles con física calibrada a iOS, Aura IA, patrón phygital, momentos MDM con dignidad, barra de navegación de sistema global), tokens, tipografía Outfit/Inter.
*   **Entregables**: ✅ UI del prototipo verificada en Redmi 9 físico (12-14 jul), navegación con `AnimatedContent`, kill-switch demo con fail-safe básico. *La completitud de producto de UI/UX (~40%, [CANON](../CANON.md) §2) sigue por encima de la barra de demo; la demo está consolidada, el producto no.*
*   **Checkpoint CP-L1 (✅ demo)**: demo end-to-end repetible en Redmi 9 sin crashes, guion de venta ejecutable, checklist 12/12, protocolo de jank corrido (cifras → [04](./progreso-y-metricas.md)). *Coincide con el cierre de F1 a nivel de demo.*
*   **Puntos de escala**: Tier A de cristal (AGSL) para hardware de gama superior; **nuevas microapps propias vía la skill `zentry-web-microapp`** (vertical 07) — la nativa `zentry-microapp-pattern` queda **legacy** ([07/migracion-y-coexistencia.md](../07-plataforma-microapps/migracion-y-coexistencia.md)).
*   **Contingencias**: jank en Redmi 9 con efectos nuevos → señal: protocolo de rendimiento en rojo → respuesta: degradar a Tier C (la regla "frames antes que reflejos" ya es canónica). Regresión de demo → revertir, nunca "arreglar después" (guardrail).

## 🔒 L2 — Confinamiento industrial (Device Owner / MDM) — ~95% consolidado

**Misión**: pasar de launcher bonito a **sistema de control real** que resiste a su adversario principal: el propio menor con tiempo ilimitado y acceso físico. **Estado: logrado y verificado en dispositivo** ([CANON](../CANON.md) §2/§3.A).

*   **Alcance conseguido (habilitado y testeado en Redmi 9 físico)**: `ZentryAdminReceiver` **activo** (GAP-01 cerrada), `ZentryPolicyManager` **real** con políticas de bloqueo y personalización 100% operativas (GAP-02 cerrada), **LockTask** + `setStatusBarDisabled` + restricciones de usuario + `LOCK_TASK_FEATURE_HOME/OVERVIEW` (GAP-03 verificada), `addPersistentPreferredActivity` (launcher forzado sin `ResolverActivity`), `setApplicationHidden` masivo de bloatware con exclusiones protegidas, `WRITE_SECURE_SETTINGS` aprovisionado, y **supresión de la barra de MIUI vía `policy_control` immersive** con watchdog. La `ZentryNavAccessibilityService` provee la barra de navegación **solo como recurso de UI** (nunca monitoreo, [CANON](../CANON.md) §3.A).
*   **Endurecimiento marginal restante (no bloqueante)**: pulido de Direct Boot (GAP-04), aprovisionamiento QR Android Enterprise a escala de producción y flavors `lab`/`prod` con applicationId comercial (GAP-09). Es hardening continuo dentro de una capa ya consolidada, no un pendiente que frene el ascenso a L3.
*   **Guardrail canónico**: la config Device Owner **ya activa se PROTEGE**, no se re-activa. Toda alteración al `AndroidManifest` referente a permisos DO es **gate HITL humano** ([CANON](../CANON.md) §5.4); ningún agente la toca sin aprobación.
*   **Checkpoint CP-L2 (✅ en dispositivo)**: score de evasión de la suite EVA en verde sobre build DO ([calidad y despliegue](../02-arquitectura-tecnica/calidad-y-despliegue.md)) sin regresión de demo, con el DO activo; un dispositivo aprovisionado end-to-end. La formalización documental de la suite EVA es la última pieza de rigor, ya sin riesgo estructural.
*   **Puntos de escala**: partnership OEM (Knox/OEMConfig) — trigger: el volumen de venta justifica negociar hardware con blindaje de bootloader; hoy es hipótesis explícita, no plan.
*   **Contingencias**: (a) política de Google/Android 18 endurece Device Owner para no-empresas → señal: release notes de Android Enterprise → respuesta: la venta directa sin Play Store ya nos aísla parcialmente; evaluar EMM registrado. (b) Factory reset por recovery físico → se detecta (el DO no reaparece) y se gestiona por contrato comercial, no por software — el límite honesto ya está documentado (THR-02).

## 🧠 L3 — Cerebro conectado (backend + IA blindada) — ⬅ la capa más baja NO consolidada

**Misión**: que la inteligencia y las políticas fluyan con un contrato honesto — y que el bloqueo **jamás dependa de la red**. **Es la brecha principal del proyecto ([CANON](../CANON.md) §2, Backend ~5%) y, por tanto, el foco de inversión actual.**

*   **Estado real**: Firebase AI Logic / Vertex AI **conectado** con `gemini-2.5-flash`; pero las colecciones Firestore, la telemetría v1, la memoria del tutor y la calculadora-chat con persistencia siguen **PLANIFICADAS, no implementadas**. Tests: 0%.
*   **Alcance**: colecciones y reglas Firestore completas ([modelo de datos](../02-arquitectura-tecnica/modelo-de-datos-firestore.md)), listener + máquina fail-safe offline (`OFFLINE_GRACE`/`OFFLINE_ENFORCED`), cola `commands` auditable, Remote Config (`ai_model_id` **espejo de `BuildConfig.ZENTRY_MODEL_ID`, nunca literal**; `ai_prompt_version`; `kill_switch_grace_seconds`), App Check, parser `[COMMAND:]` con allowlist (THR-09), telemetría v1 de agregados, RAG/memoria local del tutor, verbos de IA por microapp propia (Aura) consumidos vía el JS Bridge ([07/contrato-js-bridge.md](../07-plataforma-microapps/contrato-js-bridge.md)).
*   **Checkpoint CP-L3**: EVA-04/05/06/07 en verde + auditoría de payloads confirmando que **ningún** texto libre del menor sale del dispositivo + reglas validadas en emulador + activación del MCP Firebase del ejecutor (decisión ya ratificada: E3).
*   **Puntos de escala**: (a) pipeline Pub/Sub → BigQuery → reporte semanal IA — trigger: piloto F3 operando y consumiendo solo `telemetry_daily`; (b) routing multi-modelo del tutor por complejidad; (c) inferencia on-device (AICore/Gemini Nano) — trigger: hardware con NPU capaz; hoy **descartado** en Redmi 9.
*   **Contingencias**: (a) breaking changes de Firebase AI Logic / BOM → todo bump es HITL por guardrail; el id de modelo en config (`BuildConfig.ZENTRY_MODEL_ID`) nos aísla de renombres. (b) Cuota/costes de Gemini → fallback offline del chat ya es feature demo + presupuesto de tokens por sesión (GAP-06). (c) Model Armor u obligaciones de seguridad de contenido → evaluación F3+ anotada; no bloquea demo.

## 👨‍👩‍👧 L4 — Superficie parental (dashboard y control remoto)

**Misión**: darle al padre el poder con elegancia: ver, entender y actuar en segundos, con la misma estética premium que ve el hijo.

*   **Alcance**: autenticación parental (Firebase Auth: `parentUids`), panel de estado por hijo/dispositivo, acciones remotas (bloquear/desbloquear con motivo cálido, editar política, ver cola `commands` con acuses), visualización de agregados diarios (nunca contenido), gestión multi-hijo/multi-dispositivo, notificaciones push (FCM) para eventos de seguridad.
*   **Decisión arquitectónica propuesta (a ratificar en CP-L3)**: **v1 web-first (PWA)** sobre el stack ya dominado (paradigma web-first + hosting de la vertical 07), consumiendo Firestore directo con las reglas ya diseñadas — cero fricción de tienda, iteración diaria, y el padre no instala nada en su teléfono personal. App nativa parental queda como punto de escala L6.
*   **Checkpoint CP-L4**: un padre real (no el desarrollador) ejecuta el ciclo completo — ver estado → bloquear con motivo → el dispositivo del hijo muestra el Momento Zentry → desbloquear — y cada paso queda auditado en `commands`. Privacidad verificada: el dashboard es incapaz de mostrar transcripciones (no existen en el esquema).
*   **Puntos de escala**: reporte semanal narrativo generado por IA (depende del pipeline L3-F3+); modo asesor (vista de flota para el canal de venta) como germen de la consola MDM de L6.
*   **Contingencias**: sobre-promesa de vigilancia ("quiero leer sus chats") → la respuesta es doctrinal, no técnica: la [tabla canónica de privacidad](../02-arquitectura-tecnica/seguridad-y-privacidad.md) es el argumento de venta, no una limitación que esconder.

## 🛍️ L5 — Operación comercial y piloto

**Misión**: convertir el sistema en negocio repetible: vender, aprovisionar, acompañar y medir 100 familias sin que el fundador sea el cuello de botella de cada paso.

*   **Alcance**: ritual de aprovisionamiento en punto de venta (guion + checklist del asesor + consentimiento parental verificable Ley 29733), materiales de venta alineados al canon honesto ([factor wow](../03-marketing-y-ventas/factor-wow.md) — promesas de latencia en rangos reales), sincronización Odoo CRM (hito F3), soporte y migración de equipo (DO no transferible), telemetría de piloto.
*   **Checkpoint CP-L5**: piloto de 100 familias operando; KPIs de retención/evasión/soporte **medidos** y registrados en [progreso y métricas](./progreso-y-metricas.md); decisión iterar/escalar tomada con datos. *Cierre de F3.*
*   **Puntos de escala**: hardware pre-aprovisionado como paquete ("nacido Zentry") cuando el ritual sobre dispositivo del cliente sature al canal; segundo asesor certificado (el checklist es el instrumento de certificación).
*   **Contingencias**: (a) logística de dispositivos (garantías, reemplazos) → política de migración documentada (`devices/{deviceId}`, sin re-parenting). (b) Fricción del factory-reset en la venta → la Opción B (hardware incluido) ya es parte del modelo. (c) Datos del piloto contradicen la promesa → el gate de F3 existe exactamente para eso: iterar antes de escalar.

## 🚀 L6 — Escala y multiplataforma

**Misión**: decidir con datos — no con fe — dónde crece ZentryOS: iOS, Play Store, consola MDM propia, pagos.

*   **Alcance**: gate go/no-go iOS (rutas FamilyControls/entitlement discrecional vs MDM+ABM supervisado con TLS 1.2+; [control de dispositivo](../02-arquitectura-tecnica/control-dispositivo-abm.md)), publicación Play Store (revisión de política parental), consola MDM multi-flota, pasarela de pagos y suscripciones.
*   **Checkpoint CP-L6**: decisión iOS documentada con datos del piloto + al menos un canal de distribución escalable validado. *Es el contenido de F4; deliberadamente sin compromisos hoy.*
*   **Contingencias**: (a) Apple deniega el entitlement `family-controls` → la ruta compuesta ABM+MDM sigue viva; si ambas fallan, iOS se difiere sin arrastrar al negocio Android. (b) Play Store rechaza → la venta directa sigue siendo el canal primario; Play es amplificador, no dependencia.

---

## 📡 Radar de tendencias y previsiones

| Tendencia (2026→) | Impacto en Zentry | Capa | Previsión ya tomada |
|---|---|---|---|
| **Liquid Glass** como estándar visual de la industria (OS 27) | La expectativa de "premium" sube para todos | L1 | Zentry Glass 2.0 real vía Haze por tiers — paridad estética ya verificada en Redmi 9 |
| **Android Advanced Protection** endureciéndose (17→18) | Mata a los competidores basados en AccessibilityService **para monitoreo/control** | L2 | Nuestro control es **Device Owner** (ya activo); nuestra única AccessibilityService es la barra de navegación (recurso de UI, no monitoreo) — la tendencia nos **favorece** ([CANON](../CANON.md) §3.A) |
| **IA on-device en gama media** (AICore/Gemini Nano, 2027+) | Tutor sin latencia de red ni coste por token | L3 | Punto de escala declarado; hoy serverless por hardware. El id de modelo como config (`BuildConfig.ZENTRY_MODEL_ID`) hace el swap barato |
| **Foundation Models abiertos de Apple** (protocolo `LanguageModel`) | Tutor on-device en iPhone si el gate iOS abre | L6 | Insumo del gate F4; no compromete nada hoy |
| **Regulación de menores en LATAM** (Ley 29733 y sucesoras) | Barrera de entrada para competidores descuidados | L4/L5 | Privacidad por diseño ya canónica: ventaja competitiva, no deuda |
| **Madurez del tooling agéntico** (Antigravity 2.x, ecosistema de skills) | El costo de desarrollo baja cada trimestre | L0 | Plantillas versionadas «validar en AGY instalado» + skills re-curables |
| **Endurecimiento MDM de Apple** (TLS 1.2+ en iOS 27) | El listón de infraestructura del canal supervisado sube | L6 | Documentado como requisito del gate; sin infraestructura propia hasta F4 |

## 🧯 Matriz de contingencias transversales

| Riesgo | Señal temprana | Respuesta preparada |
|---|---|---|
| Burnout de cuota del orquestador/ejecutor | Consumo anómalo por sesión | Loop engineering ya canónico: monohilo, poda de contexto, hard-stops 10/3, modelo económico + escalada manual ([06/reglas-y-guardrails.md](../06-arquitectura-agentica/reglas-y-guardrails.md)) |
| Deriva doctrinal entre documentos | Un satélite contradice a [CANON](../CANON.md) o a un propietario de IDs | CI `ssot-regen-check` + contratos single-writer (GAP/THR/EVA) + este plan como árbitro estructural |
| Factor bus del fundador (proyecto unipersonal) | — (estructural) | El SSOT **es** la mitigación: cualquier orquestador nuevo se re-hidrata desde el repo + CANON en una sesión |
| Cambio de plataforma que invalida una plantilla | Build o carga de config falla tras update | Todo artefacto agéntico es copia regenerable desde el SSOT; nada vive solo en el workspace |
| Presión por prometer vigilancia invasiva | Objeciones de venta pidiendo leer chats | Doctrina de privacidad canónica + guion de objeciones en la vertical 03 |
| Regresión que roce la config Device Owner ya activa | Un cambio toca el Manifest/DO sin gate | La config DO se **protege** por HITL ([CANON](../CANON.md) §5.4); el guardrail bloquea el cambio antes de compilar |

---

## 🎛️ Modelo de liderazgo humano (cómo se conduce esta mente maestra)

1.  **Cadencia**: cada bloque de trabajo del orquestador termina en un checkpoint con tabla de consolidación + cuestionario de dilemas (máx. 3, con recomendación). El humano decide; la decisión se registra en la [bitácora](./bitacora-actividades.md) y, si altera el canon, se enmienda [CANON.md](../CANON.md) con gate HITL.
2.  **Artefactos que el humano revisa** (y nada más): Implementation Plans del ejecutor (antes del código), Walkthroughs (después), checkpoints CP-Lx (consolidación de capa), y la tabla KPI de [progreso y métricas](./progreso-y-metricas.md).
3.  **Gates HITL permanentes**: **modificar el `AndroidManifest` o la política Device Owner ya activa** ([CANON](../CANON.md) §5.4) · dependencias Gradle · enmiendas a [CANON](../CANON.md) · adopción de repos del catálogo creativo · publicación en tiendas · todo lo que toque datos de menores.
4.  **Iteración del plan**: este documento es vivo. Cada CP-Lx superado actualiza la tabla de estados; cada tendencia nueva entra al radar con su previsión. Lo que no cambia sin decisión explícita del humano: el orden de consolidación de las capas y la doctrina de privacidad.
5.  **Anticipación estratégica**: la regla de oro de secuenciación — **invertir siempre en la capa más baja no consolidada**. Hoy, con L0 y L1 consolidadas y L2 (Device Owner) **habilitado y testeado (~95%)**, esa capa es **L3 — el cerebro conectado (backend + telemetría + IA blindada, ~5%)**, la brecha principal reconocida por [CANON](../CANON.md) §2. Es la acción con mayor desbloqueo del stack completo.

---

## 🔗 Cableado

| Contrato compartido | Documento propietario |
|---|---|
| Fases F1-F4, fechas y contingencias temporales | [roadmap.md](./roadmap.md) *(pendiente de enmienda F1 con gate HITL)* |
| Etapas E0-E6 de ejecución agéntica | [06/roadmap-sdd.md](../06-arquitectura-agentica/roadmap-sdd.md) |
| Estado real, cifras del proyecto y decisiones irrevocables | [CANON.md](../CANON.md) |
| Registros GAP / THR / EVA citados por las capas | [02/analisis-de-brechas.md](../02-arquitectura-tecnica/analisis-de-brechas.md) · [02/seguridad-y-privacidad.md](../02-arquitectura-tecnica/seguridad-y-privacidad.md) · [02/calidad-y-despliegue.md](../02-arquitectura-tecnica/calidad-y-despliegue.md) |
| Sistema sensorial y momentos MDM de L1 | [02/interfaz-compose.md](../02-arquitectura-tecnica/interfaz-compose.md) |
| Esquema de datos y fail-safe de L3/L4 | [02/modelo-de-datos-firestore.md](../02-arquitectura-tecnica/modelo-de-datos-firestore.md) · [02/telemetria-gcp-ai.md](../02-arquitectura-tecnica/telemetria-gcp-ai.md) |
| Plataforma de microapps propias (reubica el contenido propio en web) | [07/plataforma-microapps/README.md](../07-plataforma-microapps/README.md) |
| Toda cifra KPI mencionable por este plan | [progreso-y-metricas.md](./progreso-y-metricas.md) |
