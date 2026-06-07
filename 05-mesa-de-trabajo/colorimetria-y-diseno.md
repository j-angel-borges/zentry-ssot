---
title: "Mesa de Trabajo: Colorimetría y Diseño"
date: 2026-06-04
status: "approved"
progress: 100%
deadline: 2026-08-30
tags: ["diseno", "colores", "colorimetria", "ui-ux"]
---

# 🎨 Colorimetría y Diseño del Sistema ZentryOS

ZentryOS utiliza una paleta cromática basada en gradientes esmerilados (glassmorphism) y tonos "Aurora" para transmitir modernidad, fluidez y una sensación de calma y tranquilidad cognitiva.

---

## 🎨 Paleta de Colores Oficiales (HEX)

De acuerdo con las guías de interfaz oficiales de la marca, los colores autorizados para el sistema y recursos de diseño son los siguientes:

### 1. Púrpura Zentry (`#533B87`)
*   **Uso**: Color dominante de marca y títulos destacados. Utilizado para textos y títulos principales (grandes encabezados), interruptores de selección activos (toggles), y el texto de los botones primarios (sobre fondo lavanda). Nunca se utiliza como color de fondo principal o en áreas grandes para evitar una estética oscura.

### 2. Lavanda Zentry (`#D6C8FA`)
*   **Uso**: Color de acento e interactividad. Utilizado como fondo de botones primarios ("Get Started"), elementos de fondo de listas seleccionadas y detalles luminosos en la interfaz.

### 3. Verde Menta (`#C2F4E7`)
*   **Uso**: Color secundario y de estados positivos. Utilizado para representar progreso completado, logros lúdicos, estados activos de éxito y mezclado orgánicamente en los gradientes de fondo.

### 4. Blanco Glacial (`#EBF1F5`)
*   **Uso**: Superficies, contenedores translúcidos y fondo. Proporciona la base de la interfaz y la estructura de cristal (glassmorphism) que flota sobre el fondo aurora, aportando ligereza y brillo.

### 5. Gris Neutro Oscuro (`#4A5160`)
*   **Uso**: Color de texto principal y legibilidad general. Utilizado para todo el cuerpo de texto, subtítulos, etiquetas secundarias ("Secondary Labels"), bordes finos de tarjetas y descripciones, asegurando un óptimo contraste y descanso visual en fondos claros y esmerilados.

> [!IMPORTANT]
> **Dirección Visual de Marca - Evitar Temas Oscuros**:
> ZentryOS **NO es una Dark Tech UI** ni utiliza fondos negros o púrpuras oscuros. La identidad visual es super minimalista, limpia e iluminada. Se basa exclusivamente en fondos claros (Blanco Glacial) combinados con degradados marmoleados y orgánicos de lila (Lavanda) y verde (Verde Menta).

---

## 🔮 Especificación Glassmorphism (Efecto Cristal)

La interfaz del Launcher y el Zentry Hub implementa paneles translúcidos que emulan cristal esmerilado ligero, optimizados para fondos claros:

*   **Fondo de Panel**: `rgba(255, 255, 255, 0.4)` (Blanco Glacial translúcido / frosted glass) o `rgba(235, 241, 245, 0.45)`.
*   **Filtro de Desenfoque (Blur)**: `backdrop-filter: blur(25px);`
*   **Bordes del Cristal**: `1px solid rgba(255, 255, 255, 0.4);`
*   **Sombra**: `box-shadow: 0 8px 32px 0 rgba(74, 81, 96, 0.08);` (Sombra gris muy suave para dar profundidad sin oscurecer).

---

## 🌈 Fórmulas de Gradientes

Los degradados de ZentryOS son claros, orgánicos y fluidos:

*   **Gradiente Aurora de Fondo (Tablet UI / Mobile)**:  
    `linear-gradient(135deg, #EBF1F5 0%, #C2F4E7 45%, #D6C8FA 90%, #EBF1F5 100%)` (Un marmoleado suave de Verde Menta y Lavanda sobre una base de Blanco Glacial).
*   **Gradiente de Barra de Progreso**:  
    `linear-gradient(90deg, #D6C8FA 0%, #533B87 100%)`
*   **Glow Radial de Acento (Fondo Claro)**:
    - *Esquina Superior Izquierda*: `radial-gradient(circle, rgba(194, 244, 231, 0.25) 0%, transparent 60%)`
    - *Esquina Inferior Derecha*: `radial-gradient(circle, rgba(214, 200, 250, 0.25) 0%, transparent 60%)`
