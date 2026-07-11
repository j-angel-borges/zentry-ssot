# Walkthrough Técnico: Proyecto Zentry OS (Fase Inicial - 5%)

Este documento detalla la evolución técnica, decisiones de arquitectura y validaciones realizadas durante la fase de prototipado de **Zentry OS**, un entorno de Launcher/Kiosk controlado para el ámbito educativo infantil.

---

## 1. Visión y Estado Inicial
El proyecto nació con la premisa de crear un **Launcher Kiosk** que integrara inteligencia artificial generativa (Gemini) en un entorno seguro para niños de 8 a 12 años, operando bajo un modelo de bloqueo de dispositivo (Kiosk Mode).

### Hipótesis Iniciales:
1.  **H1 (Conectividad AI):** El SDK de Google AI (`generativeai`) permitiría integración directa sin necesidad de un backend intermediario en la fase de demo.
2.  **H2 (Persistencia de Bloqueo):** Las APIs estándar de `startLockTask()` serían suficientes para evitar la salida del usuario en dispositivos modernos.
3.  **H3 (Interoperabilidad):** La coexistencia de Firebase Firestore (para control remoto de bloqueo) y Gemini AI sería fluida dentro del ciclo de vida de una sola `Activity`.

---

## 2. Cronología del Desarrollo y Desafíos Técnicos

### Fase A: El Desafío de la Autenticación y SDKs Legacy
Iniciamos con una integración de Gemini 1.5 Flash. El primer gran obstáculo fue el **Error 404/401** de conectividad.
*   **Problema:** El usuario proporcionó una API Key con prefijo `AQ.Ab`. Nuestra hipótesis inicial falló al asumir que el SDK `0.9.0` (legacy) reconocería automáticamente el nuevo formato de claves de Google AI Studio.
*   **Solución Técnica:** Se validó que el SDK `0.9.0` tenía un conflicto de dependencias transitivas con el módulo `common`. Se aplicó una **alineación de dependencias forzada** en Gradle para permitir el procesamiento de claves con prefijos modernos.

### Fase B: Arquitectura de la Interfaz (Jetpack Compose)
Se implementó un patrón **MVI/MVVM** simplificado:
*   **State Management:** Uso de `mutableStateOf` para el estado de carga y `mutableStateListOf` para el historial de chat, garantizando recomposiciones eficientes en Compose.
*   **Navegación:** Se implementó una navegación basada en estados (`currentScreen`) envuelta en `AnimatedContent` para mitigar la tosquedad visual de las apps convencionales y elevar el UX a un estándar "Premium".

### Fase C: La Realidad del Modo Kiosk en Android Moderno
Validamos que el `LockTaskMode` básico es vulnerable a gestos de sistema (swipe up, double home) en capas de personalización como MagicOS (Honor) o MIUI.
*   **Desafío:** La app era "escapable".
*   **Iteración Técnica:** Se escaló la arquitectura hacia una solución de **Device Administration**.
    *   Implementación de `DeviceAdminReceiver`.
    *   Registro de categoría `HOME` y `DEFAULT` en el Manifest con prioridad `1000`.
    *   Configuración de `launchMode="singleInstance"` para prevenir la recreación de la pila de actividades durante intentos de salida.

---

## 3. Arquitectura Actual (Stack Tecnológico)

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **UI Framework** | Jetpack Compose | Interfaz reactiva y animaciones premium. |
| **Generative AI** | Google AI SDK (0.9.0) | Integración con `gemini-2.5-flash-lite`. |
| **Backend / C&C** | Firebase Firestore | Escucha en tiempo real para bloqueo remoto (Kill-switch). |
| **Security Layer** | DevicePolicyManager | Gestión de privilegios de administrador y Kiosk mode. |
| **Runtime** | Kotlin Coroutines | Gestión de concurrencia para llamadas a la API de AI. |

---

## 4. Conclusiones y Brecha de Desarrollo (Gap Analysis)

Currently, el proyecto se encuentra en un **estado funcional intermedio (10-12% de la visión final)**. Hemos progresado del simple prototipo estético a una integración real y profunda con el hardware bajo privilegios de administrador absoluto.

### Desafíos Pendientes (El 90% restante):
1.  **Persistencia de Boot:** Iniciar el servicio de bloqueo inmediatamente después del encendido del dispositivo (BroadcastReceiver para `ACTION_BOOT_COMPLETED`).
2.  **Profundidad de la IA:** Implementar RAG (Retrieval-Augmented Generation) para que Zentry tenga memoria a largo plazo del perfil educativo del niño.
3.  **Optimización de Recursos:** El consumo de memoria actual es aceptable para una demo, pero requiere una arquitectura de `Services` en lugar de una `Activity` monolítica.

---

## 5. Hitos del Sprint de Kiosco (Julio 2026)

Durante esta fase, se resolvieron y validaron en un dispositivo Redmi 9 físico los siguientes desafíos operativos críticos:

### A. Tránsito de Kiosk Mode "Simple" a "Supervisado" (Device Owner)
La desactivación pasiva de la barra de estado y de botones de sistema era evadible. Configuramos la app como Device Owner real mediante comandos ADB en desarrollo.
* **Lección Aprendida (Choques con el Selector de Android):** Al usar `startLockTask()` en modo Kiosco con privilegios Device Owner, si la app no está registrada como el lanzador por defecto a nivel de sistema, el botón "Home" gatilla una ventana de diálogo de selección del sistema (`ResolverActivity`). Como esta actividad no estaba en la lista blanca de paquetes permitidos, Android consideraba esto una violación de seguridad de Kiosco, forzando un bucle infinito y dejando la pantalla en negro.
* **Solución Definitiva:** Añadimos `dpm.addPersistentPreferredActivity` al arranque del Kiosco para forzar de forma nativa la preferencia de ZentryOS como Home preferido persistente del sistema, solucionando las pantallas negras de raíz.

### B. Gestos del Sistema Autorizados en Aplicaciones Permitidas
El menor quedaba atrapado en aplicaciones como Google Play Store o Twilight al deshabilitar por completo la barra de navegación.
* **Solución:** Se habilitaron `LOCK_TASK_FEATURE_HOME` y `LOCK_TASK_FEATURE_OVERVIEW` en `setLockTaskFeatures`. Esto permite la navegación por gestos nativa de Android, pero con la garantía de que al deslizar hacia arriba (Home) el usuario vuelve estrictamente a ZentryOS.

### C. Matrix Mode: Limpieza Dinámica y Segura de Bloatware
Para lograr que la interfaz de Zentry sea un entorno limpio ("matriz blanca"), implementamos un congelamiento masivo.
* **Algoritmo:** `cleanDeviceApps` busca todas las apps de usuario y sistema con launcher, y las congela (`setApplicationHidden = true`), protegiendo de forma explícita el launcher Zentry, la tienda Play Store, las APIs de Google Play Services, y todos los teclados instalados activos (para no inhabilitar el ingreso de PIN). También se añadió un botón de restauración instantánea del sistema (`restoreAllHiddenApps`).
