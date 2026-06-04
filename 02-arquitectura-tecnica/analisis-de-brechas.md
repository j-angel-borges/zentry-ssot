---
title: "Análisis de Brechas: Del Prototipo MVP (5%) al Producto Final (100%)"
date: 2026-06-04
status: "approved"
progress: 10%
deadline: 2026-08-30
tags: ["arquitectura", "seguridad", "roadmap-tecnico"]
---

# 📉 Análisis de Brechas (Gap Analysis)

El prototipo funcional actual de ZentryOS representa aproximadamente el **5% de la visión final del producto**. Si bien se han validado con éxito las bases de conectividad de IA, la interfaz reactiva en Compose y el registro básico de Launcher, existe una brecha considerable en términos de seguridad, robustez y profundidad funcional respecto a un producto listo para el mercado de consumo.

---

## 🔍 Matriz de Brechas y Ruta de Mitigación

| Hito Técnico | Estado del Prototipo (5%) | Requisito de Producción (100%) | Plan de Mitigación y Acción |
| :--- | :--- | :--- | :--- |
| **Aislamiento de Apps** | Inexistente. El menor puede abrir cualquier aplicación instalada si conoce los gestos. | **White-listing Dinámico**: Bloqueo absoluto de procesos no autorizados en segundo plano. | Implementar un servicio de monitoreo en ejecución (`UsageStatsManager` y `ActivityManager`) para interceptar y cerrar instantáneamente tareas de apps bloqueadas. |
| **Persistencia de Boot** | El sistema operativo Android por defecto puede demorar varios segundos en iniciar ZentryOS tras encender el móvil. | **Bloqueo Inmediato**: ZentryOS debe iniciarse antes de que la pantalla de bloqueo nativa sea interactiva. | Registrar un `BroadcastReceiver` de prioridad máxima para `ACTION_BOOT_COMPLETED` y `ACTION_LOCKED_BOOT_COMPLETED` (Direct Boot Mode). |
| **Memoria de la IA** | Sin memoria a largo plazo. Cada sesión de conversación con Gemini es aislada. | **Tutor con RAG**: Memoria persistente del perfil de aprendizaje del niño a lo largo de meses. | Implementar una base de datos vectorial local (como ObjectBox o Realm) e integraciones con Google Cloud Vertex AI Vector Search para inyectar contexto previo del estudiante al prompt. |
| **Seguridad de Nivel 2** | La barra de estado superior (notificaciones, ajustes rápidos) sigue siendo desplegable. | **Hard Lockdown**: Deshabilitación absoluta del panel de notificaciones y gestos del sistema. | Aprovechar privilegios de **Device Owner** para llamar a `setStatusBarDisabled()` y `setKeyguardDisabled()` de la API `DevicePolicyManager`. |
| **Optimización de Batería** | Lógica concentrada en una sola `Activity` monolítica que consume recursos activos. | **Ecosistema Modular**: Procesos optimizados mediante Servicios en segundo plano ligeros. | Migrar la escucha de telemetría y Firestore a un `WorkManager` y `Foreground Service` optimizados para bajo consumo energético. |

---

## 🛠️ Detalle Técnico de Acciones Inmediatas

### 1. Implementación de Direct Boot (Seguridad de Encendido)
Para evitar que el menor desinstale la app en el lapso entre el encendido del hardware y la carga de Android, el código de ZentryOS debe ser compatible con **Direct Boot**. 
*   **Acción**: Marcar la aplicación con `android:directBootAware="true"` en el `AndroidManifest.xml`.
*   **Impacto**: Permite que el sistema lea la base de datos de seguridad encriptada del dispositivo antes de que el usuario ingrese su contraseña de descifrado inicial.

### 2. Bloqueo de Barra de Estado mediante Device Owner
En la versión comercial, se inyectará el siguiente control en la inicialización de la pantalla principal para evitar fugas de interfaz:
```kotlin
val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
val adminComponent = ComponentName(context, ZentryDeviceAdminReceiver::class.java)

if (dpm.isDeviceOwnerApp(context.packageName)) {
    // Deshabilita la barra de estado superior
    dpm.setStatusBarDisabled(adminComponent, true)
    // Deshabilita la creación de nuevos usuarios en el terminal
    dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_ADD_USER)
    // Impide el restablecimiento de fábrica por hardware
    dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_FACTORY_RESET)
}
```
Esto eleva la seguridad de ZentryOS de un estándar puramente estético a una **capa de seguridad empresarial militarizada**.
