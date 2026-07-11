---
title: "Control del Dispositivo: Device Owner y Apple Business Manager (ABM)"
date: 2026-06-04
status: "approved"
progress: 25%
deadline: 2026-08-30
tags: ["arquitectura", "seguridad", "mdm", "android-enterprise"]
---

# 🔒 Control de Dispositivo e Integración MDM

Para evitar que el menor evada el sistema operativo mediante gestos de navegación, menús de depuración de hardware o reinicios en Modo Seguro, ZentryOS requiere el máximo nivel de privilegios del sistema.

---

## 🤖 Capa Android: Arquitectura Device Owner

En el sistema operativo Android, la aplicación base de ZentryOS debe ser aprovisionada como **Device Owner (Propietario del Dispositivo)** durante el primer inicio de fábrica del hardware. Esto permite omitir las APIs de control parental estándar y acceder a controles de bajo nivel mediante `DevicePolicyManager`.

```text
[Hardware Android (Samsung, Honor, Xiaomi)]
    |
[System ROM / Android Framework]
    |
[ZentryOS (Device Owner Privileges)] <====== Habilitado vía ADB o NFC Provisioning
    |
    +--> Deshabilita Barra de Estado (System UI Status Bar)
    +--> Deshabilita Depuración USB (ADB Debugging)
    +--> Controla Barra de Navegación y Botones Físicos (Volumen/Encendido)
    +--> Habilita Kiosk Mode Persistente (LockTaskMode)
```

### Mecanismos de Aprovisionamiento (Fase de Fábrica/Distribución):
1.  **ADB (Android Debug Bridge)**: Utilizado para pruebas de laboratorio y el MVP inicial:
    ```bash
    adb shell dpm set-device-owner com.zentryos.launcher/.receiver.ZentryDeviceAdminReceiver
    ```
2.  **QR Code Provisioning (Android Enterprise)**: Para la fase de producción comercial. Al encender un dispositivo nuevo de fábrica, golpear 6 veces la pantalla inicial activa la cámara para escanear un código QR con la configuración de aprovisionamiento de ZentryOS, instalando la app como propietaria de forma automática.
3.  **Samsung Knox / OEM Config**: Integración con SDKs específicos de fabricantes (Samsung Knox, OEMConfig de Honor) para deshabilitar físicamente el botón de encendido (Power Off Menu) y bloquear el acceso al cargador de arranque (Bootloader).

---

## 🍏 Capa iOS: Integración Apple Business Manager (ABM)

Para el nicho ampliado de adolescentes (12 a 20 años) que utilizan iPhones, el control parental estándar de Apple es sumamente limitado. ZentryOS define una arquitectura de aprovisionamiento empresarial a través de la infraestructura de Apple:

```text
[Apple Business Manager (ABM)] <---> [ZentryOS MDM Server (GCP)] <---> [iPhone (Supervised Mode)]
```

### Proceso de Bloqueo en iOS:
1.  **Modo Supervisado**: El iPhone debe estar marcado como "Supervisado" en ABM (adquirido directamente de distribuidores autorizados o registrado con Apple Configurator 2 en Mac).
2.  **Perfil MDM (Mobile Device Management)**: ZentryOS actúa como un servidor MDM. Al registrarse en ABM, el iPhone descarga un perfil de configuración encriptado e ineliminable por el usuario.
3.  **Restricciones de Perfil**:
    *   **Single App Mode**: Configura el iPhone para ejecutar exclusivamente la aplicación ZentryOS sin posibilidad de salir a la pantalla de inicio (equivalente a LockTaskMode).
    *   **Content Filtering**: Fuerza el tráfico DNS/HTTP del dispositivo a pasar por los túneles seguros de ZentryOS alojados en GCP.
    *   **Bloqueo de Restablecimiento**: Impide que el menor formatee el iPhone de fábrica desde los ajustes del sistema.

---

## 🛠️ Detalles de Implementación en Android (Julio 2026)

Se han integrado y validado en hardware real (Redmi 9, Android 10/11) los siguientes controles de sistema avanzados mediante `ZentryPolicyManager` y privilegios de **Device Owner**:

### 1. Sincronización de Navegación y Notificaciones
Para permitir el uso de aplicaciones permitidas (como la Google Play Store) sin comprometer la seguridad del launcher, y permitir al usuario configurar el sistema, se habilitaron los controles nativos de navegación y el panel de notificaciones en Kiosco:
- **Banderas de LockTask:**
  ```kotlin
  val flags = DevicePolicyManager.LOCK_TASK_FEATURE_HOME or
              DevicePolicyManager.LOCK_TASK_FEATURE_OVERVIEW or
              DevicePolicyManager.LOCK_TASK_FEATURE_SYSTEM_INFO or
              DevicePolicyManager.LOCK_TASK_FEATURE_NOTIFICATIONS
  dpm.setLockTaskFeatures(adminComponent, flags)
  ```
- **Configuración rápida de Gestos:** Se añadió un atajo directo a `"android.settings.GESTURE_SETTINGS"` para que el usuario pueda cambiar a navegación gestual rápidamente.
- **Lista Blanca de Sistema:** Se autorizaron los paquetes `"com.android.settings"`, `"android"` (ResolverActivity) y `"com.android.systemui"` en `setLockTaskPackages` para evitar pantallas negras durante las solicitudes de diálogos del sistema.

### 2. Vinculación Persistente de ZentryOS (Launcher por Defecto)
Para evitar que el botón Home lance la pantalla de selección o cause excepciones de seguridad en LockTask, el gestor de políticas vincula a ZentryOS automáticamente en la inicialización:
```kotlin
val filter = IntentFilter(Intent.ACTION_MAIN).apply {
    addCategory(Intent.CATEGORY_HOME)
    addCategory(Intent.CATEGORY_DEFAULT)
}
val component = ComponentName(activity, MainActivity::class.java)
dpm.addPersistentPreferredActivity(adminComponent, filter, component)
```
Al desactivar el Kiosco, la preferencia se limpia mediante `clearPackagePersistentPreferredActivities`.

### 3. Congelación Masiva de Bloatware ("Matrix Mode")
- **Ocultamiento de Sistema:** A través del comando `setApplicationHidden(adminComponent, packageName, true)`, ZentryOS oculta y suspende por completo toda aplicación de terceros, juegos MIUI preinstalados y utilidades no esenciales del operador.
- **Protección de Componentes:** La limpieza excluye automáticamente:
  - ZentryOS (`com.example.zentryvisuals`)
  - Google Play Store (`com.android.vending`)
  - Servicios Core de Google (`com.google.android.gms`, `com.google.android.gsf`)
  - Interfaz de Sistema (`com.android.systemui`)
  - Ajustes de Android (`com.android.settings`, `com.android.settings.intelligence`, `com.xiaomi.misettings`) para no bloquear el acceso al menú de configuración física.
  - Motores de Teclado Activos (para que el usuario siempre pueda ingresar el PIN parental).
- **Restauración:** Se implementó una función reversa `restoreAllHiddenApps` para reactivar y visibilizar todas las apps previamente congeladas.
