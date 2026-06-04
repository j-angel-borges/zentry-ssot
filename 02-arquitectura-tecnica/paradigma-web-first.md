---
title: "Paradigma Web-First en ZentryOS"
date: 2026-06-04
status: "approved"
progress: 40%
deadline: 2026-08-30
tags: ["arquitectura", "webview", "hibrido"]
---

# 🌐 El Paradigma Web-First

Para lograr un ciclo de desarrollo ágil que permita desplegar minijuegos educativos, interfaces interactivas y herramientas de estudio dinámicas sin forzar al usuario a descargar actualizaciones pesadas de la app base, ZentryOS implementa una **arquitectura híbrida Web-First**.

---

## 🏗️ Estructura del Modelo Híbrido

El núcleo de seguridad (MDM, control de botones, geolocalización, servicio de persistencia y telemetría de red) se ejecuta de forma **100% nativa en Kotlin/Java**. Sin embargo, las pantallas de contenido educativo, los retos interactivos y el portal del estudiante se cargan mediante un **WebView optimizado**.

```text
+-------------------------------------------------------------+
|                     Jetpack Compose UI                      |
| (Pantalla de Bloqueo, Panel de Configuración, Avatar Nativo)|
+-------------------------------------------------------------+
|                       JS Bridge Interface                   |
|  [Kotlin Native API]  <=================>  [Web Application]|
+-------------------------------------------------------------+
|               WebView Contenedor (Chrome Engine)             |
|   - Caché local persistente (SQLite / Cache API)            |
|   - Ejecución sin conexión (Offline Mode via ServiceWorker) |
+-------------------------------------------------------------+
```

---

## 🛠️ Optimización y Seguridad de la WebView

Las implementaciones comunes de WebView sufren de lentitud de renderizado (*input lag*) y brechas de seguridad. ZentryOS implementa las siguientes directrices de ingeniería:

### 1. JavaScript Bridge Seguro
Se utiliza un puente bidireccional mediante `@JavascriptInterface` para permitir que el código web interactúe con el hardware del dispositivo (ej: vibración hágica al completar un reto, encender la cámara para análisis multimodal de IA).
```kotlin
// Android Native Bridge
class ZentryWebInterface(private val context: Context) {
    @JavascriptInterface
    fun triggerHapticFeedback(patternType: String) {
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        // Lógica de vibración personalizada
    }
}
```
*   **Regla de Seguridad**: Se restringen los dominios permitidos mediante `shouldOverrideUrlLoading` en `WebViewClient` para evitar ataques de redirección o Cross-Site Scripting (XSS).

### 2. Caché y Service Workers
Para garantizar que ZentryOS sea funcional sin conectividad a Internet (por ejemplo, en el colegio o en transporte público):
*   Se activa la base de datos interna `WebSettings.LOAD_CACHE_ELSE_NETWORK`.
*   La aplicación web utiliza un **Service Worker** que descarga previamente los recursos estáticos (HTML, JS, CSS, imágenes) y los sirve localmente desde el almacenamiento interno del dispositivo.

### 3. Viewport y Aceleración por Hardware
Se habilita la aceleración por hardware en la Activity contenedora para asegurar transiciones a 60 FPS. El viewport web está fijado a la escala nativa del dispositivo:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```
Esto elimina el retardo de 300ms al hacer clic y asegura que la web se comporte como una interfaz nativa premium.
