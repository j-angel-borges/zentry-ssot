---
title: "Modelo de Datos Firestore: Esquema Físico, Reglas y Contratos JSON"
date: 2026-07-25
status: "under-review"
progress: 35%
tags: ["zentryos", "ssot", "modelo-datos"]
---

# 🗃️ Modelo de Datos Firestore

Este documento es el **propietario único** de los nombres de colecciones, esquemas de campos, reglas de seguridad, claves de Remote Config y contratos JSON del puente de inteligencia. Ningún otro satélite redefine estas estructuras: las cita.

> **Estado verificado (2026-07-25)**: el backend Firestore está al **~35%**. Se ha implementado y verificado en hardware la **conexión real end-to-end con GCP Firestore (`zentryos`)**: la PWA Vercel (`zentry-parent-dashboard`) escribe comandos C&C (`LOCK_NOW`/`UNLOCK`) en `devices/dev_redmi9_mateo/commands` y el APK nativo en el Redmi 9 físico procesa la orden en tiempo real mediante `ZentryFirestoreSync.kt`, enviando además el latido de batería (63%) y `lastSeenAt` (**GAP-05 CERRADA**). Queda pendiente el blindaje de producción (App Check y reglas de producción endurecidas).

---

## 🧭 Principios de modelado

1. **El dispositivo lee barato**: un solo `addSnapshotListener` sobre un solo documento (`devices/{deviceId}`) con la política activa desnormalizada. Cero joins, cero consultas en el camino crítico del kill-switch.
2. **El padre escribe auditablemente**: todo cambio de bloqueo o política viaja como documento en la cola `commands`, con ciclo de vida y timestamps. El estado final se refleja en `activePolicy`, pero la orden siempre deja rastro (mitiga THR-08).
3. **La privacidad se aplica en el esquema**: no existe ninguna colección capaz de almacenar transcripciones, audio o texto libre del menor. Lo que el esquema no puede representar, no se puede filtrar (THR-05). Minimización desde el diseño: año de nacimiento y cohorte, nunca fecha completa ni datos innecesarios (Ley 29733 / COPPA-equivalente — ver [seguridad y privacidad](./seguridad-y-privacidad.md)).

---

## 🌳 Árbol de colecciones

```text
families/{familyId}                          # cuenta parental
 ├── children/{childId}                      # perfil del menor (por cohorte etaria)
 └── policies/{policyId}                     # políticas maestras editables por el padre

devices/{deviceId}                           # TOP-LEVEL: estado del dispositivo + política activa
 └── commands/{commandId}                    # cola C&C auditable con ack

telemetry_daily/{deviceId}_{yyyyMMdd}        # TOP-LEVEL: solo contadores y agregados v1
```

**Por qué `devices` es top-level y no subcolección de `families`**: el vínculo Device Owner es por dispositivo y **no transferible** (ver [control de dispositivo](./control-dispositivo-abm.md)). El dispositivo es un recurso reemplazable que *referencia* a `familyId` y `childId`; la migración de equipo es un documento `devices/{deviceId}` nuevo apuntando al mismo `childId`, sin re-parenting de árboles ni migración de subcolecciones. Además, el listener del launcher autentica como dispositivo, no como padre: separar el árbol simplifica las reglas.

---

## 📄 Esquemas por colección

### `families/{familyId}`

```json
{
  "parentUids": ["uid_padre", "uid_madre"],
  "displayName": "Familia Quispe",
  "advisorId": "adv_042",
  "plan": "premium",
  "createdAt": "<timestamp>"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `parentUids` | array\<string\> | Sí | UIDs de Firebase Auth con derecho de escritura |
| `displayName` | string | Sí | Nombre de cortesía de la cuenta |
| `advisorId` | string | No | Asesor del canal de venta directa |
| `plan` | string | Sí | Nivel comercial contratado |
| `createdAt` | timestamp | Sí | Servidor (`serverTimestamp()`) |

### `families/{familyId}/children/{childId}`

```json
{
  "alias": "Mateo",
  "birthYear": 2016,
  "cohort": "middle",
  "gradeMinedu": "PRIMARIA_4",
  "activeDeviceId": "dev_a1b2c3",
  "createdAt": "<timestamp>"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `alias` | string | Sí | Nombre de pila o alias — nunca nombre legal completo |
| `birthYear` | number | Sí | Solo año (minimización); la edad exacta se calcula en el dispositivo |
| `cohort` | string | Sí | `infantil` (2-6) \| `middle` (7-12) \| `teen` (13-20) — gobierna tema visual y prompts |
| `gradeMinedu` | string | Sí | Nivel del currículo MINEDU para `study_assistant` |
| `activeDeviceId` | string | No | Referencia inversa al dispositivo vigente |

### `families/{familyId}/policies/{policyId}`

```json
{
  "childId": "child_01",
  "name": "Semana escolar",
  "allowedApps": ["com.example.zentryconfig"],
  "dailyLimitMinutes": 120,
  "schedule": [
    { "days": ["MON", "TUE", "WED", "THU", "FRI"], "start": "07:00", "end": "20:30" }
  ],
  "version": 12,
  "updatedAt": "<timestamp>"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `childId` | string | Sí | Menor al que aplica |
| `allowedApps` | array\<string\> | Sí | Allowlist de paquetes (LockTask + suspensión del resto vía `setApplicationHidden`) |
| `dailyLimitMinutes` | number | Sí | Presupuesto diario; lo aplica el timer local |
| `schedule` | array\<map\> | Sí | Ventanas horarias permitidas |
| `version` | number | Sí | Monótona creciente; resuelve conflictos de sincronización |

### `devices/{deviceId}` — el documento del kill-switch

```json
{
  "familyId": "fam_123",
  "childId": "child_01",
  "model": "Redmi 9",
  "osApiLevel": 30,
  "provisioningMode": "adb_lab",
  "appVersion": "1.4.0",
  "policyVersion": 12,
  "activePolicy": {
    "isLocked": false,
    "lockReason": null,
    "allowedApps": ["com.example.zentryconfig"],
    "dailyLimitMinutes": 120,
    "schedule": [ { "days": ["MON","TUE","WED","THU","FRI"], "start": "07:00", "end": "20:30" } ]
  },
  "lastSeenAt": "<timestamp>"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `familyId` / `childId` | string | Sí | Referencias; la migración de equipo crea un documento nuevo |
| `provisioningMode` | string | Sí | `qr` (producción) \| `adb_lab` (laboratorio, **modo actual**) — ver [control de dispositivo](./control-dispositivo-abm.md) |
| `policyVersion` | number | Sí | Copia de `policies.version` aplicada; detecta desfase |
| `activePolicy` | map | Sí | **Copia desnormalizada** de la política vigente: el launcher solo escucha este documento |
| `activePolicy.isLocked` | boolean | Sí | Kill-switch; su semántica temporal honesta la define [telemetría e IA](./telemetria-gcp-ai.md) |
| `lastSeenAt` | timestamp | Sí | Único campo del documento que el dispositivo puede escribir |

### `devices/{deviceId}/commands/{commandId}`

```json
{
  "type": "LOCK_NOW",
  "payload": { "lockReason": "Hora de cenar" },
  "issuedBy": "uid_padre",
  "issuedAt": "<timestamp>",
  "deliveredAt": null,
  "appliedAt": null,
  "status": "pending",
  "errorReason": null
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `type` | string | Sí | Allowlist: `LOCK_NOW` \| `UNLOCK` \| `UPDATE_POLICY` \| `SYNC_REQUEST` |
| `payload` | map | No | Parámetros del comando; validado contra el esquema del `type` |
| `issuedBy` | string | Sí | UID del padre emisor (no-repudio, THR-08) |
| `issuedAt` / `deliveredAt` / `appliedAt` | timestamp | Sí / al transitar | Fuente del protocolo de medición EVA-06 |
| `status` | string | Sí | `pending` → `delivered` → `applied` \| `failed` |

### `telemetry_daily/{deviceId}_{yyyyMMdd}`

```json
{
  "deviceId": "dev_a1b2c3",
  "date": "2026-07-14",
  "appUsageMinutes": { "com.example.zentryconfig": 96 },
  "aiTurnCount": 41,
  "challengeCompletedCount": { "logic": 3, "creative": 1 },
  "policyViolationAttempts": 0,
  "sentimentIndex": null,
  "updatedAt": "<timestamp>"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `appUsageMinutes` | map\<string,number\> | Sí | Agregado diario por paquete — nunca eventos individuales |
| `aiTurnCount` | number | Sí | Contador de turnos; jamás contenido |
| `sentimentIndex` | number \| null | No | Solo si el opt-in on-device está activo; índice agregado diario (OFF por defecto) |

El ID compuesto `{deviceId}_{yyyyMMdd}` hace la escritura **idempotente** (merge del día) y la lectura por rango trivial.

---

## 🔁 Ciclo de vida del comando

```text
[padre escribe] --> pending --(listener del dispositivo recibe)--> delivered
                                        |
                        aplica vía ZentryPolicyManager
                                        |
                          éxito --> applied  (appliedAt = ahora)
                          fallo --> failed   (errorReason poblado)
```

Los timestamps de transición son la **fuente única** del protocolo de medición de latencia del kill-switch (EVA-06, definido en [calidad y despliegue](./calidad-y-despliegue.md)). Este documento no promete tiempos: las cifras viven en [progreso y métricas](../04-operaciones-y-roadmap/progreso-y-metricas.md). El ejecutor `ZentryPolicyManager` **ya existe y aplica políticas reales de Device Owner** (ver [análisis de brechas](./analisis-de-brechas.md), GAP-02 cerrada); lo que falta es el listener Firestore que alimente esta cola (GAP-05).

---

## 📴 Persistencia offline y política cacheada

*   **Persistencia offline de Firestore: activada** en el cliente launcher (caché del último snapshot de `devices/{deviceId}`).
*   Adicionalmente, el launcher persiste su **propia copia de `activePolicy`** en almacenamiento local (fuera del sandbox de la caché de Firestore) para sobrevivir a limpiezas de caché y arranques Direct Boot; la integridad de esa copia está cubierta por THR-04.
*   La semántica de aplicación sin red (estados `OFFLINE_GRACE` / `OFFLINE_ENFORCED`, timers monotónicos, umbral `kill_switch_grace_seconds`) es propiedad de la [máquina de estados fail-safe](./telemetria-gcp-ai.md); las pruebas de cierre son EVA-04 y EVA-05.
*   **Nota de realidad**: el confinamiento de Device Owner (LockTask, `setApplicationHidden`, restricciones de usuario, supresión de la barra MIUI) **ya opera sin red** por naturaleza — no espera a Firestore. Lo que este documento diseña es el canal remoto de kill-switch y sincronización de políticas, todavía pendiente (GAP-05).

---

## 🔐 Reglas de seguridad (bosquejo normativo)

```text
families/{familyId}            lectura/escritura: request.auth.uid in parentUids
  children/*, policies/*       ídem (herencia del padre autenticado)

devices/{deviceId}             lectura: dispositivo autenticado dueño del doc, o padre de la familia
                               escritura: SOLO campo lastSeenAt (dispositivo); resto vía backend/comandos
  commands/{commandId}         creación: padre de la familia (issuedBy == request.auth.uid)
                               actualización: dispositivo, SOLO transiciones de status y sus timestamps

telemetry_daily/{id}           escritura: dispositivo dueño (merge idempotente del día)
                               lectura: padres de la familia; nadie lee telemetría ajena
```

*   Toda identidad de dispositivo se refuerza con **App Check** (atestación del cliente; hoy pendiente — GAP-06) además de Firebase Auth.
*   Suplantación del padre en el canal C&C = THR-03; estas reglas son su mitigación primaria.
*   **Nota honesta**: la documentación GCP disponible localmente no cubre la sintaxis vigente de Security Rules; este bosquejo es normativo (qué debe cumplirse), y su traducción exacta a `firestore.rules` se valida contra la referencia oficial en la etapa de backend con pruebas del emulador.

---

## ⚙️ Configuración remota (Firebase Remote Config)

Aquí se materializa el canon: **el ID del modelo de IA es configuración, nunca una afirmación de especificación**.

| Clave | Tipo | Default (fallback local) | Quién la modifica | Consumidor |
|---|---|---|---|---|
| `ai_model_id` | string | `BuildConfig.ZENTRY_MODEL_ID` (hoy `gemini-2.5-flash`) | Ingeniería (consola Firebase) | `ZentryIntelligenceBridge` |
| `ai_prompt_version` | string | `v1` | Ingeniería | Set de system prompts del bridge |
| `kill_switch_grace_seconds` | number | valor conservador local | Ingeniería | Máquina fail-safe offline |
| `policy_defaults_version` | string | `v1` | Ingeniería | Plantillas de política del onboarding |

> **Canon del modelo**: el identificador se lee de `BuildConfig.ZENTRY_MODEL_ID` (hoy `gemini-2.5-flash`, vía Firebase AI Logic / Vertex AI) y puede sobreescribirse por Remote Config. **PROHIBIDO** hardcodear una versión de modelo en las microapps o citarla como decisión permanente. El swap de modelo es barato precisamente por esto.

---

## 🤖 Contratos JSON del puente de inteligencia (microapps propias)

El `ZentryIntelligenceBridge` exige **JSON estricto** como formato de respuesta de las microapps **propias**: sin fences de markdown, sin texto fuera del objeto raíz, validación de esquema previa al render y descarte con reintento único ante mismatch. Los contratos vigentes:

| Contrato | Microapp | Estructura normativa | Regla de validación |
|---|---|---|---|
| `study_assistant` | Study Assistant | Respuesta socrática estructurada por `gradeMinedu` y asignatura (currículo MINEDU Perú); nunca solución directa | Campo de pregunta-guía obligatorio; respuesta con solución literal = rechazada |
| `[COMMAND: {...}]` | Chat tutor | Comando embebido en la conversación para alarmas, calendario y **creación de documentos en Google Workspace vía Function Calling** | **Allowlist cerrada** de tipos + validación de esquema del payload; cualquier otro comando se descarta y se registra (THR-09 / EVA-07) |

> **Workspace se gobierna, no se clona (canon §3B)**: ZentryOS **no** define un contrato para "generar diapositivas propias". Las suites de oficina son las **apps oficiales de Google** (Docs, Slides, Sheets, NotebookLM) que el launcher **instala, presenta y controla** como Device Owner. Cuando el tutor necesita producir un entregable (p. ej. la tarea del menor), emite un `[COMMAND]` que **crea un Google Docs real** por Function Calling de Gemini y luego lo exporta — nunca renderiza PDFs ni "slides" por código local (canon §C: *No PDF generation on-device*). El contrato `z_slides` y la pantalla `ZentrySlidesScreen` quedan **eliminados** del producto.

Los nombres de campo exactos de `study_assistant` y de la allowlist de `[COMMAND:{...}]` tienen como fuente de verdad `ZentryIntelligenceBridge.kt`; el ejecutor local los reconfirma antes de endurecer el parser (GAP-06).

---

## 🧮 Índices y costes (cualitativo)

*   **Camino crítico sin índices compuestos**: el listener lee un documento por ID; las cifras de coste no viven aquí.
*   Índice compuesto previsible: `commands` por (`status`, `issuedAt`) para el panel parental (F3).
*   Presupuesto de lecturas del launcher: 1 listener persistente + lecturas de arranque; la telemetría escribe 1 documento/día/dispositivo (merge). Cualquier métrica de coste real se registra en [progreso y métricas](../04-operaciones-y-roadmap/progreso-y-metricas.md).

---

## 🔗 Cableado con la vertical

| Contrato compartido | Documento propietario | IDs citados aquí |
|---|---|---|
| Justificación de `devices` top-level (DO no transferible, migración de equipo) | [control-dispositivo-abm.md](./control-dispositivo-abm.md) | — |
| Semántica temporal del kill-switch y máquina fail-safe offline | [telemetria-gcp-ai.md](./telemetria-gcp-ai.md) | Estados `OFFLINE_GRACE` / `OFFLINE_ENFORCED` |
| Amenazas de suplantación, integridad de caché y repudio | [seguridad-y-privacidad.md](./seguridad-y-privacidad.md) | THR-03, THR-04, THR-05, THR-08, THR-09 |
| Protocolos de prueba y medición | [calidad-y-despliegue.md](./calidad-y-despliegue.md) | EVA-04, EVA-05, EVA-06, EVA-07 |
| Brechas de backend y blindaje del cliente | [analisis-de-brechas.md](./analisis-de-brechas.md) | GAP-02, GAP-05, GAP-06 |
