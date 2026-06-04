---
title: "Mesa de Trabajo: Colorimetría y Diseño"
date: 2026-06-04
status: "approved"
progress: 100%
deadline: 2026-08-30
tags: ["diseno", "colores", "colorimetria", "ui-ux"]
---

# 🎨 Colorimetría y Diseño del Sistema

ZentryOS utiliza una paleta cromática basada en gradientes HSL y transparencias para transmitir modernidad, fluidez y tranquilidad cognitiva.

---

## 🎨 Paleta de Colores Oficiales (HEX y HSL)

### 1. Colores Primarios y de Acento
*   **Azul Digital (Primary Blue)**: `#4A90E2` | `hsl(211, 74%, 59%)`
    *   *Uso*: Color dominante en botones principales, avatares del tutor en estado activo y marcos clave.
*   **Celeste Líquido (Sky Accent)**: `#64C8FF` | `hsl(201, 100%, 70%)`
    *   *Uso*: Color secundario para barras de progreso, iconos interactivos y destellos de recompensa.

### 2. Superficies y Fondos (Surfaces & Backgrounds)
*   **Fondo Claro de Sistema (Light Canvas)**: `#F5F7FA` | `hsl(210, 38%, 97%)`
    *   *Uso*: Fondo base de la aplicación de control de padres y del panel de leads.
*   **Gris Neutro (Primary Dark Text)**: `#333333` | `hsl(0, 0%, 20%)`
    *   *Uso*: Texto principal en títulos y cuerpo de texto para asegurar un contraste óptimo `4.5:1` según estándares WCAG.

### 3. Especificación Glassmorphism (Efecto Cristal)
Para diálogos flotantes y menús interactivos del niño:
*   *Color de Fondo*: `rgba(255, 255, 255, 0.35)`
*   *Desenfoque (Blur)*: `backdrop-filter: blur(25px);`
*   *Borde*: `1px solid rgba(255, 255, 255, 0.5);`

---

## 🌈 Fórmulas de Gradientes

ZentryOS utiliza gradientes lineales para representar flujos dinámicos e incentivos:

*   **Gradiente de Progreso (Progress Bar)**:  
    `linear-gradient(90deg, #4A90E2 0%, #64C8FF 100%)`
*   **Gradiente de Fondo Interactivo**:  
    `radial-gradient(circle at top left, rgba(74, 144, 226, 0.5) 0%, rgba(100, 200, 255, 0.4) 100%)`

---

## 🌓 Temas y Cohortes

### Tema 1: Light & Playful (2 a 12 Años)
*   **Enfoque**: Colores de alto contraste, fondos claros y formas sumamente redondeadas.
*   **Propósito**: Estimular el reconocimiento de botones y minimizar el estrés cognitivo del menor.

### Tema 2: Cyberpunk Focus (13 a 20 Años)
*   **Enfoque**: Fondo ultra-oscuro (`#0D1117`), acentos en cian neón (`#00F2FE`) e índigo profundo (`#1A1F38`).
*   **Propósito**: Ajustarse a las expectativas estéticas de los adolescentes, convirtiendo el Kiosk en un panel de productividad estilizado.
