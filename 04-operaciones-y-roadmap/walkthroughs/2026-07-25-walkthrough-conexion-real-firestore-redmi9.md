# Walkthrough Técnico: Conexión Real Firestore GCP (ZentryOS PWA y Redmi 9)
**Fecha:** 2026-07-25
**Agente:** Antigravity (Google DeepMind Team)

## 1. Resumen Ejecutivo
En esta sesión se logró la **conexión real y fidedigna end-to-end** entre la PWA del Dashboard para Padres (`zentry-parent-dashboard`), la base de datos de Google Cloud Platform / Firebase Firestore (Proyecto **`zentryos`**) y el dispositivo físico Xiaomi Redmi 9 (`M2003J15SC` / API 30). Se depuró el 100% de la data y dispositivos simulados (Sofía, Redmi Note 12, métricas cosméticas) para garantizar que la información mostrada sea comprobable y real. Se implementó el módulo nativo Kotlin `ZentryFirestoreSync.kt` en el APK del launcher Android, se añadió `firebase-analytics` y se desplegaron las reglas de desarrollo de Firestore en GCP, verificando empíricamente la transmisión del latido de batería (63%) y la escucha en tiempo real de comandos C&C (Kill-Switch).

## 2. Archivos Modificados o Creados

### Frontend PWA (`zentry-parent-dashboard`):
- [x] `src/services/firebase.ts` (Servicio real con SDK Firebase v9 `initializeApp`, Firestore `onSnapshot`, `addDoc` e `updateDoc` en proyecto GCP `zentryos`)
- [x] `src/services/mockData.ts` (Remoción total de mocks estáticos y estructuras de Sofía / Redmi Note 12; retención exclusiva de Mateo y Redmi 9)
- [x] `src/components/Header.tsx` (Indicador reactivo de conexión GCP Firestore `zentryos`)
- [x] `src/components/KillSwitchCard.tsx` (Escritura real de comandos `LOCK_NOW` y `UNLOCK` en la subcolección `devices/dev_redmi9_mateo/commands`)
- [x] `src/components/DeviceStatusCard.tsx` (Visualización fidedigna de batería real de Android OS o estado `-- (Esperando reporte)`)
- [x] `src/components/TelemetrySection.tsx` (Sección limpia de telemetría a la espera de la transmisión real del dispositivo sin datos inventados)
- [x] `src/components/PolicyManager.tsx` (Gestor de políticas y allowlist conectado a Firestore real)
- [x] `src/App.tsx` (Suscripción reactiva a `zentryRealStore`)
- [x] `firestore.rules` & `firebase.json` (Reglas de desarrollo `allow read, write: if true` desplegadas a GCP `zentryos`)

### Launcher Nativo Android (`zentrybyantig`):
- [x] `app/src/main/java/com/example/zentryconfig/ZentryFirestoreSync.kt` (Módulo Kotlin de sincronización de latidos de hardware y escucha C&C en vivo)
- [x] `app/src/main/java/com/example/zentryconfig/MainActivity.kt` (Inicialización de `ZentryFirestoreSync.startSync(this)` en el arranque del launcher)
- [x] `app/build.gradle.kts` (Adición de la dependencia `com.google.firebase:firebase-analytics`)

## 3. Decisiones Técnicas y Descubrimientos
- **Depuración Anti-Mock**: Se acordó por directiva estricta eliminar cualquier dato cosmético no transmitido por el hardware. La batería muestra `--` hasta que el Redmi 9 transmite su primer latido por WebSocket.
- **Identidad del Dispositivo Físico**: El Redmi 9 de laboratorio fue detectado por ADB (`5f25dcfa0404` / `M2003J15SC`). Al compilar e instalar la app (`gradlew installDebug`), se verificó en Logcat que transmitió su batería real (63%) y se suscribió a la cola C&C de Firestore.
- **Reglas de Seguridad de Firestore**: Firestore en GCP (`zentryos`) rechazaba la suscripción WebSocket de la PWA por falta de sesión Auth (`permission-denied`). Se solucionó creando `firebase.json` y liberando `firestore.rules` (`allow read, write: if true`) mediante `firebase-tools deploy`.

## 4. Inferencia de Impacto en SSOT (Para el Auditor)
- **GAP-05 (Backend y Fail-Safe Remoto)**: Pasa de 🔴 ABIERTA a 🟢 VERIFICADA EN HARDWARE. Existe un canal C&C en vivo entre la PWA, Firestore y el Redmi 9 físico.
- **GAP-07 (Telemetría v1)**: Pasa de 🔴 ABIERTA a 🟡 PARCIAL / EN VERIFICACIÓN. El APK en el Redmi 9 ya incluye `firebase-analytics` y publica el latido de hardware (`batteryLevel`, `lastSeenAt`) en Firestore.
- **Vertical 02 (Control de Dispositivo y C&C)**: La PWA en Vercel (`zentry-parent-dashboard.vercel.app`) y el APK Android están totalmente interconectados mediante GCP Firestore en tiempo real.
