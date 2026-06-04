---
title: "Interfaz de Usuario Premium: Jetpack Compose y MVI"
date: 2026-06-04
status: "approved"
progress: 45%
deadline: 2026-08-30
tags: ["arquitectura", "compose", "mvi", "ui-ux"]
---

# 🎨 Interfaz de Usuario Premium en Jetpack Compose

Para ganarse la adopción de los niños y jóvenes, ZentryOS no puede verse como una aplicación aburrida de configuración del sistema. La interfaz debe transmitir una sensación visual fluida y viva.

---

## 🌀 Patrón Arquitectónico MVI (Model-View-Intent)

ZentryOS utiliza una arquitectura MVI para gestionar el estado de la interfaz de usuario en Compose de forma predecible e inmutable:

```text
[Compose View] --(Intent: User action/event)--> [ViewModel]
      ^                                              |
      |--------(State: Immutable UI State)-----------+
```

### Componentes MVI:
*   **UI State**: Objeto inmutable que define la representación visual exacta en un momento dado (ej: cargando respuesta de IA, mostrando error, bloqueado).
*   **UI Intent**: Acciones del usuario traducidas a eventos (ej: `SendMessage`, `SolveChallenge`, `RequestHelp`).
*   **ViewModel**: Procesa los Intents en corrutinas de Kotlin, interactúa con repositorios locales/remotos y emite un nuevo `UI State` a través de un `StateFlow`.

---

## ⚡ Gestión de Estado y Compose Compiler

Para evitar recomposiciones innecesarias que degraden el rendimiento de la batería del smartphone:
*   El estado del chat y el historial se gestiona mediante listas mutables optimizadas para Compose:
    ```kotlin
    val chatHistory = mutableStateListOf<ChatMessage>()
    ```
*   Se utiliza la anotación `@Stable` en los modelos de datos para indicarle al compilador de Compose que sus propiedades no cambiarán de forma impredecible fuera del ciclo reactivo.

---

## 🚀 Animaciones Premium e Interactividad

El "Factor WOW" de ZentryOS se logra a través de micro-interacciones suaves y físicas:

### 1. Transición de Pantalla Fluida
Se evita el salto brusco entre interfaces utilizando `AnimatedContent` con transiciones personalizadas de entrada/salida (*slide-in* y *fade-out*) que simulan capas tridimensionales:
```kotlin
AnimatedContent(
    targetState = currentScreen,
    transitionSpec = {
        slideInHorizontally { width -> width } + fadeIn() togetherWith
        slideOutHorizontally { width -> -width } + fadeOut()
    }
) { screen ->
    when(screen) {
        Screen.Launcher -> LauncherHome()
        Screen.TutorChat -> TutorChatView()
        Screen.Challenge -> LogicChallengeView()
    }
}
```

### 2. Avatar de IA Interactivo
El avatar del tutor Zentry (renderizado mediante Compose Vector Animations o Lottie) reacciona físicamente mientras el niño interactúa:
*   **Estado Idle**: Parpadeo ocasional y respiración suave.
*   **Estado Pensando**: El avatar mira hacia arriba y genera ondas de carga en colores pastel (efecto *shimmer*).
*   **Estado Explicando**: Sincronización labial básica basada en la amplitud del sintetizador de voz (TTS).

### 3. Glassmorphic Design (Efecto Cristal)
Se implementa un estilo visual moderno de "vidrio esmerilado" en los diálogos de retos lógicos y recompensas, utilizando filtros de desenfoque nativos en Android 12+ (`RenderEffect.createBlurEffect`) y degradados de color HSL curados para dar una estética limpia y sofisticada.

---

## 📅 Roadmap de UI y Componentes Inferred (Keep)

Para materializar las ideas y requerimientos operativos capturados en el banco de ideas, la interfaz Compose incorporará los siguientes elementos:

1. **Barra de Tiempo Circadiana (Timer UI Overlay) [TEC-01]**:
   - Una barra flotante o superpuesta persistente en la parte superior de la pantalla de entretenimiento que indica visualmente el tiempo restante de uso al menor.
   - El diseño debe adaptarse al ciclo circadiano (límites dinámicos mañana/tarde/noche) mediante sutiles transiciones de color (ej. tonos cálidos y ámbar para la noche y fríos/brillantes para el día).
2. **Formulario de Onboarding de Personalidad [TEC-05]**:
   - Una interfaz secuencial autoguiada durante la instalación donde el menor responde preguntas dinámicas para configurar el Launcher con sus gustos e intereses iniciales, permitiendo una experiencia ultrapersonalizada desde el primer inicio.

