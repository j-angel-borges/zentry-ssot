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
*   **Uso**: Color dominante de identidad. Utilizado en el texto de los botones primarios (sobre fondo lavanda), interruptores de selección activos (toggles), cabeceras destacadas y como tono oscuro del gradiente aurora.

### 2. Lavanda Zentry (`#D6C8FA`)
*   **Uso**: Color de acento e interactividad. Utilizado como fondo de botones primarios ("Get Started"), elementos de fondo de listas seleccionadas y detalles luminosos en la interfaz.

### 3. Verde Menta (`#C2F4E7`)
*   **Uso**: Color secundario y de estados positivos. Utilizado para representar progreso completado, logros lúdicos, estados activos de éxito y en gradientes de fondo con efecto aurora.

### 4. Blanco Glacial (`#EBF1F5`)
*   **Uso**: Color de texto principal y superficies claras. Proporciona una legibilidad óptima sobre fondos oscuros o translúcidos de cristal.

### 5. Gris Neutro Oscuro (`#4A5160`)
*   **Uso**: Color de contraste y legibilidad secundaria. Utilizado para subtítulos, etiquetas secundarias ("Secondary Labels"), bordes finos de tarjetas y textos informativos discretos.

---

## 🔮 Especificación Glassmorphism (Efecto Cristal)

La interfaz del Launcher y el Zentry Hub implementa paneles translúcidos que emulan cristal esmerilado para integrarse orgánicamente sobre el fondo aurora:

*   **Fondo de Panel**: `rgba(235, 241, 245, 0.08)` (Blanco Glacial translúcido) o `rgba(74, 81, 96, 0.15)` (Gris Neutro Oscuro para jerarquía secundaria).
*   **Filtro de Desenfoque (Blur)**: `backdrop-filter: blur(20px);`
*   **Bordes del Cristal**: `1px solid rgba(255, 255, 255, 0.08);`
*   **Sombra**: `box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);`

---

## 🌈 Fórmulas de Gradientes

Los degradados de ZentryOS son orgánicos y dinámicos:

*   **Gradiente Aurora de Fondo (Tablet UI)**:  
    `linear-gradient(135deg, #C2F4E7 0%, #D6C8FA 50%, #533B87 100%)`
*   **Gradiente de Barra de Progreso**:  
    `linear-gradient(90deg, #D6C8FA 0%, #533B87 100%)`
*   **Glow Radial de Acento (Fondo Oscuro)**:
    - *Esquina Superior Izquierda*: `radial-gradient(circle, rgba(194, 244, 231, 0.08) 0%, transparent 50%)`
    - *Esquina Inferior Derecha*: `radial-gradient(circle, rgba(214, 200, 250, 0.08) 0%, transparent 50%)`
