---
title: "Seguridad y Privacidad: Modelo de Amenazas STRIDE y Compliance de Menores"
date: 2026-07-14
status: "under-review"
progress: 30%
tags: ["zentryos", "ssot", "seguridad-privacidad"]
---

# 🛡️ Seguridad y Privacidad

Postura de este documento: **cero promesas absolutas**. El confinamiento reduce y verifica vectores de evasión; no los "elimina". A diferencia de versiones anteriores, la capa de confinamiento **ya no es incipiente**: el Device Owner está **activo y verificado en Redmi 9 físico (~95%)**; lo que sigue incipiente es el **backend** (kill-switch remoto, telemetría, App Check) y la **automatización de pruebas** (0%). El desglose honesto es propiedad del [análisis de brechas](./analisis-de-brechas.md). Este satélite es el **propietario único** del registro de amenazas (THR) y de la tabla canónica de datos: todo el SSOT difiere a estas tablas, nunca las duplica.

---

## 🎯 Modelo de amenazas (STRIDE-lite)

Adversario principal del análisis: **el propio menor** con acceso físico total al dispositivo — el atacante más motivado, con más tiempo y con más conocimiento del equipo que cualquier actor remoto. Adversarios secundarios: terceros en la red local y actores remotos oportunistas.

| ID | Cat. | Amenaza | Vector | Mitigación | Verificación | Brecha | Estado |
|---|---|---|---|---|---|---|---|
| THR-01 | E | El menor evade el kiosk | Gestos del sistema, barra de estado, Ajustes, Modo Seguro, reinicio | **Device Owner ACTIVO**: LockTaskMode, `setStatusBarDisabled`, `setLockTaskFeatures`, `DISALLOW_SAFE_BOOT`, supresión de barra MIUI (`policy_control` immersive), Launcher forzado (`addPersistentPreferredActivity`) | Verificado empíricamente en Redmi 9; falta automatizar EVA-01/02/03 | GAP-08 | **Mitigado (DO activo); suite EVA por automatizar** |
| THR-02 | T | Desinstalación, downgrade o factory-reset físico | Ajustes, recovery, botones de hardware | `setUninstallBlocked`, `setApplicationHidden`, `DISALLOW_FACTORY_RESET`; límite honesto: recovery de fábrica fuera del alcance de una app — se detecta (el DO no re-aparece) y se gestiona por canal comercial | Verificado en Redmi 9 (bloqueo software); recovery físico = límite documentado | GAP-08 | **Mitigado (DO activo); límite físico honesto** |
| THR-03 | S | Suplantación del padre en el canal C&C | Escrituras no autorizadas en `families/*` o `commands` | Reglas Firestore (padre autenticado, `issuedBy == auth.uid`) + Firebase Auth + App Check | Pruebas de reglas en emulador (etapa backend) | GAP-05, GAP-06 | Abierto (backend ~5%) |
| THR-04 | T | Manipulación de la política cacheada o del reloj local en offline | Cambio de hora del sistema, edición de almacenamiento local | Timers **monotónicos** (`elapsedRealtime`, inmunes a la hora del sistema) + copia local de política con verificación de integridad | EVA-04, EVA-05 | GAP-05 | Abierto (backend) |
| THR-05 | I | Exfiltración de transcripciones o contenido del menor | Telemetría, logs, backups | **Cerrado por esquema**: no existe colección capaz de transportar texto libre ([modelo de datos](./modelo-de-datos-firestore.md)); transcripciones solo en almacenamiento local | Auditoría de payloads de red (etapa backend) | GAP-07 | Mitigado por diseño |
| THR-06 | I | Telemetría re-identificable o sobre-recolección | Eventos de red excesivos o granulares | v1 = contadores/agregados diarios; minimización en esquema (año, alias, cohorte) | Auditoría de payloads de red | GAP-07 | Mitigado por diseño |
| THR-07 | D | Offline prolongado deja el kill-switch inoperante | Modo avión, retirar SIM, salir de cobertura | Confinamiento local DO **ya opera sin red** (no depende de Firestore); fail-safe de política cacheada + timers locales para el kill-switch remoto ([máquina de estados](./telemetria-gcp-ai.md)); desconectarse **nunca relaja** restricciones | EVA-04 | GAP-05 | Parcial: DO offline OK; fail-safe remoto pendiente |
| THR-08 | R | Repudio: comandos parentales sin rastro | Disputas "yo no lo bloqueé" / "no llegó" | Cola `devices/{deviceId}/commands` con `issuedBy` y timestamps por transición | EVA-06 | GAP-05 | Abierto (backend) |
| THR-09 | E/I | Inyección de prompt al tutor o spoofing de `[COMMAND:{...}]` | El menor induce al modelo a emitir comandos o contenido fuera de política | Allowlist cerrada de comandos + validación de esquema en `ZentryIntelligenceBridge` + prompts versionados por Remote Config | EVA-07 | GAP-06 | Abierto (parser sin allowlist endurecida) |

### 🔓 Los tres vectores físicos que definen el diseño

*   **Modo Seguro**: arrancar en Safe Mode deshabilita apps de terceros — un launcher "normal" muere ahí. Con Device Owner (activo), `DISALLOW_SAFE_BOOT` elimina la opción del menú de apagado (THR-01 / EVA-02).
*   **Depuración USB**: `adb` permitiría desinstalar o congelar el launcher. `DISALLOW_DEBUGGING_FEATURES` bloquea las opciones de desarrollador en el perfil gestionado (THR-01 / EVA-03).
*   **Cambio de hora**: adelantar o atrasar el reloj para burlar ventanas horarias y límites diarios. Los presupuestos de tiempo se contabilizan con reloj **monotónico de hardware**, no con la hora de pared (THR-04 / EVA-05) — depende del backend fail-safe (GAP-05).

---

## ♿ AccessibilityService: rechazado como vigilancia, permitido como interfaz

Distinción de compliance **reconciliada 2026-07-14** (canon §3A). No es un matiz menor: es lo que mantiene a ZentryOS fuera de las infracciones de Google Play y de los bloqueos de **Android 17+ Advanced Protection**.

*   **RECHAZADO** como mecanismo de **monitoreo o control parental**: ZentryOS **no** usa AccessibilityService para observar, registrar ni restringir la conducta del menor. Toda la autoridad de control vive en **Device Owner** (canal único de bloqueo).
*   **PERMITIDO** como recurso de **interfaz de sistema**: `ZentryNavAccessibilityService` **dibuja la barra de navegación glass propia** de ZentryOS, ejecuta `performGlobalAction(BACK/HOME/RECENTS)` sobre apps de terceros y hospeda el **watchdog** que reafirma la supresión de la barra de MIUI. No observa contenido; solo provee navegación.

La regla de compliance: *no observamos ni restringimos comportamiento del menor por accesibilidad; solo proveemos navegación*. Esta es una ventaja estratégica frente a competidores basados en Accessibility para vigilancia — ver [plan maestro](../04-operaciones-y-roadmap/plan-maestro-por-capas.md) (radar de tendencias, L2).

---

## 🧒 Tabla canónica: qué recolectamos y qué no

Esta es **LA tabla** de datos del proyecto. Los satélites de visión (01) y marketing (03) enlazan aquí; ningún documento redeclara filas por su cuenta.

| Dato | ¿Se recolecta? | ¿Sale del dispositivo? | Forma | Base de consentimiento | Retención |
|---|---|---|---|---|---|
| Minutos de uso por app | Sí | Sí | Agregado diario (`telemetry_daily`) | Consentimiento parental verificable (contrato de venta) | Ciclo de vida de la cuenta |
| Conteo de turnos de chat con el tutor | Sí | Sí | Contador diario | Consentimiento parental | Ciclo de vida de la cuenta |
| **Transcripciones del chat (texto/voz)** | Se procesan on-device | **NUNCA** | Solo almacenamiento local del dispositivo | — | Local; borrable desde el dispositivo |
| Índice de sentimiento | Solo con **opt-in** parental (OFF por defecto) | Solo el índice agregado diario | Número agregado; jamás el texto origen | Opt-in explícito y revocable | Mientras el opt-in esté activo |
| Retos completados | Sí | Sí | Contadores por tipo | Consentimiento parental | Ciclo de vida de la cuenta |
| Intentos de evasión de política | Sí | Sí | Contador diario | Consentimiento parental (dato de seguridad) | Ciclo de vida de la cuenta |
| Fotos, dibujos y creaciones del menor | Se procesan on-device (microapps) | **No en v1** | Local | — | Local |
| Identidad del menor | Alias + año de nacimiento + cohorte + grado MINEDU | Sí (mínimo indispensable) | Campos acotados del esquema | Consentimiento parental | Supresión bajo demanda |
| Nombre legal completo / DNI del menor | **No** | No | — | — | — |
| Ubicación / GPS | **No en v1** | No | — | Requeriría opt-in específico si algún día se propone | — |
| Identificadores publicitarios | **No** | No | Sin SDKs de publicidad en el cliente | — | — |
| Contactos, SMS, historial de llamadas | **No** | No | — | — | — |

---

## ⚖️ Marco legal: COPPA-equivalente + Ley 29733 (Perú)

ZentryOS opera en Perú bajo la **Ley 29733 de Protección de Datos Personales** (datos de menores = datos sensibles, consentimiento por los titulares de la patria potestad) y adopta los principios de **COPPA** como estándar de diseño aunque no venda en EE.UU. — es el listón más exigente y prepara la escala F4.

| Principio | Exigencia | Implementación ZentryOS | Dónde se verifica |
|---|---|---|---|
| Consentimiento parental verificable | Autorización previa, informada y demostrable | El consentimiento se firma en el **ritual de venta presencial** ([control de dispositivo](./control-dispositivo-abm.md)): identidad del padre verificada cara a cara por el asesor | Checklist de entrega del asesor (F1→F3) |
| Minimización | Recolectar solo lo indispensable | Esquema incapaz de almacenar más de lo declarado (alias, año, cohorte, agregados) | Tabla canónica ↑ + auditoría de payloads |
| Finalidad | Uso solo para la función declarada | Telemetría exclusivamente para reportes parentales y seguridad; **sin SDKs de publicidad** | Revisión de dependencias Gradle en CI |
| Derecho de supresión | Borrado bajo demanda del titular | Borrado en cascada: `children/{childId}`, `telemetry_daily` del dispositivo y desvinculación de `devices` | Procedimiento operativo (F3) |
| Seguridad de los datos | Protección proporcional a la sensibilidad | Reglas Firestore + Auth + App Check; datos sensibles (transcripciones) jamás salen del dispositivo | THR-03/05/06 + auditoría |
| Transferencia transfronteriza (Ley 29733) | Informar el flujo de datos al exterior | Contrato de servicio declara procesamiento en GCP; solo agregados cruzan la frontera | Documento contractual (F3) |

---

## 🤖 Seguridad de la capa IA

*   **Parser de comandos endurecido** (THR-09): el `[COMMAND: {...}]` del chat se valida contra una **allowlist cerrada** de tipos y esquemas de payload ([modelo de datos](./modelo-de-datos-firestore.md)); todo comando fuera de allowlist se descarta y se cuenta como `policy_violation_attempts`. Hoy el parser existe pero **sin allowlist endurecida** (GAP-06).
*   **Modelo como configuración** (canon §C): el ID se lee de `BuildConfig.ZENTRY_MODEL_ID` (hoy `gemini-2.5-flash`, vía Firebase AI Logic / Vertex AI) y puede rotarse por Remote Config; **jamás** literal en código. Un modelo comprometido o deprecado se cambia sin release.
*   **Prompts de sistema versionados** por `ai_prompt_version` (Remote Config): un prompt comprometido se rota sin release de app.
*   **App Check** para atestación del cliente frente a los servicios Firebase (pendiente — GAP-06).
*   **Model Armor** (`modelarmor.googleapis.com`: shields de entrada/salida, filtros RAI por umbral, detección de datos sensibles, CSAM siempre activo) queda anotado como **evaluación F3+** para la escala del piloto — no es dependencia de la demo.

---

## 🔐 Seguridad de plataforma

*   **Reglas Firestore**: bosquejo normativo y su validación en emulador — propiedad del [modelo de datos](./modelo-de-datos-firestore.md) (no se duplican aquí).
*   **Secretos**: ninguna clave en el repo ni en el SSOT; configuración local del ejecutor vía plantillas. `google-services.json`, keystores y `local.properties` se tratan como artefactos locales **no versionados** (canon §5.1).
*   **Configuración Device Owner (protección, no activación)**: el DO **ya está activo y provisionado**. La postura cambió de "nunca activar" a **"proteger la configuración DO vigente"**: toda alteración del `AndroidManifest` referente a permisos de Device Owner (receiver, restricciones, LockTask) es una **acción HITL** — requiere validación humana explícita antes de compilar (canon §5.4). Degradar o romper el DO en un cambio es una regresión de máxima severidad.
*   **Identidad de release** (GAP-09): migrar de `com.example.zentryconfig` a applicationId comercial con firma de release gestionada; el applicationId forma parte del payload QR de aprovisionamiento, así que este cambio precede a cualquier piloto (F2).

---

## 🍏 Consideraciones iOS (exploratorio, gate F4)

*   El entitlement `com.apple.developer.family-controls` es **discrecional**: Apple puede denegarlo o revocarlo; ninguna promesa comercial puede asumirlo concedido.
*   Los perfiles MDM/ABM son revocables por Apple; iOS 27 exige **TLS 1.2+** para MDM, DDM, DEP e instalación de perfiles ([control de dispositivo](./control-dispositivo-abm.md)).
*   Las garantías de privacidad de esta página (transcripciones locales, telemetría agregada) aplican **idénticas** a cualquier cliente iOS futuro: son de arquitectura, no de plataforma.

---

## 🔗 Cableado con la vertical

| Contrato compartido | Documento propietario | IDs citados aquí |
|---|---|---|
| Capacidades Device Owner que mitigan THR-01/02 y ritual de consentimiento | [control-dispositivo-abm.md](./control-dispositivo-abm.md) | THR-01, THR-02 |
| Máquina fail-safe offline y semántica del kill-switch | [telemetria-gcp-ai.md](./telemetria-gcp-ai.md) | THR-04, THR-07 |
| Esquema físico, reglas y allowlist de comandos | [modelo-de-datos-firestore.md](./modelo-de-datos-firestore.md) | THR-03, THR-05, THR-08, THR-09 |
| Pruebas de cierre de cada amenaza | [calidad-y-despliegue.md](./calidad-y-despliegue.md) | EVA-01..EVA-07 |
| Brechas que mantienen amenazas abiertas | [analisis-de-brechas.md](./analisis-de-brechas.md) | GAP-05, GAP-06, GAP-07, GAP-08, GAP-09 |
| Cifras de evasión y KPIs | [progreso-y-metricas.md](../04-operaciones-y-roadmap/progreso-y-metricas.md) | — |
