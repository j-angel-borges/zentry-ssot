---
title: "Mesa de Trabajo: Tipografía y Fuentes"
date: 2026-06-04
status: "approved"
progress: 100%
deadline: 2026-08-30
tags: ["diseno", "tipografia", "fuentes", "ui-ux"]
---

# ✍️ Tipografía y Fuentes del Sistema

La legibilidad es la máxima prioridad del diseño visual de ZentryOS. La tipografía seleccionada debe ser clara, geométrica y amigable para el menor, evitando tipografías con serifa o demasiado corporativas.

---

## 🅰️ Tipografías Oficiales

### 1. Outfit (Google Fonts) - Primaria
*   **Propósito**: Títulos, portadas, H1 y elementos destacados de gamificación.
*   **Características**: Fuente sans-serif geométrica inspirada en formas circulares perfectas, ideal para una UI lúdica y moderna.

### 2. Inter (Google Fonts) - Lectura y Cuerpo
*   **Propósito**: Respuestas de la IA (Tutor), reportes de telemetría de padres y texto general.
*   **Características**: Diseñada específicamente para pantallas móviles, garantizando una excelente legibilidad incluso en tamaños de texto muy reducidos.

---

## 📏 Escala Tipográfica (Hierarchy)

Para mantener la uniformidad en Android (Compose `TextStyle`) y Web (CSS):

| Nivel de Jerarquía | Peso (Weight) | Tamaño (CSS) | Tamaño (Android SP) | Espaciado (Line-Height) |
| :--- | :---: | :---: | :---: | :---: |
| **H1 - Títulos Grandes** | `Bold` (700) | `2.2rem` | `32sp` | `1.2` |
| **H2 - Secciones / Retos** | `SemiBold` (600) | `1.5rem` | `24sp` | `1.3` |
| **Preguntas / Botones** | `Medium` (500) | `1.2rem` | `18sp` | `1.4` |
| **Cuerpo de Texto** | `Regular` (400) | `1.0rem` | `16sp` | `1.5` |
| **Captions / Micro-datos** | `Regular` (400) | `0.8rem` | `12sp` | `1.3` |

---

## 💻 Configuración de Código (Ejemplo en Compose)

En el módulo de UI de Jetpack Compose (`theme/Type.kt`), la tipografía se inicializa de la siguiente manera:

```kotlin
val OutfitFontFamily = FontFamily(
    Font(R.font.outfit_bold, FontWeight.Bold),
    Font(R.font.outfit_semibold, FontWeight.SemiBold),
    Font(R.font.outfit_medium, FontWeight.Medium)
)

val ZentryTypography = Typography(
    h1 = TextStyle(
        fontFamily = OutfitFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        lineHeight = 38.sp
    ),
    body1 = TextStyle(
        fontFamily = FontFamily(Font(R.font.inter_regular)),
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp
    )
)
```
