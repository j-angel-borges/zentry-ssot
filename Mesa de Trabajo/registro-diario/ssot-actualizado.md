# 🌌 ZentryOS - MANIFIESTO DE CONTEXTO: 05. MESA DE TRABAJO (BRANDING)

Este documento contiene la recopilación unificada y específica para la vertical **05. Mesa de Trabajo (Branding)** de ZentryOS.
Diseñado para alimentar a agentes y asistentes de IA especializados en esta área.

---

## 📋 ÍNDICE DE LA VERTICAL
1. [05-mesa-de-trabajo/README.md](#-archivo-05-mesa-de-trabajo-README-md)
2. [05-mesa-de-trabajo/colorimetria-y-diseno.md](#-archivo-05-mesa-de-trabajo-colorimetria-y-diseno-md)
3. [05-mesa-de-trabajo/tipografia-y-fuentes.md](#-archivo-05-mesa-de-trabajo-tipografia-y-fuentes-md)
4. [05-mesa-de-trabajo/logotipos-y-recursos.md](#-archivo-05-mesa-de-trabajo-logotipos-y-recursos-md)

---


---

<a name="-archivo-05-mesa-de-trabajo-README-md"></a>
# 📂 ARCHIVO: `05-mesa-de-trabajo/README.md`

---
title: "Mesa de Trabajo: Identidad de Marca y Branding"
date: 2026-06-04
status: "approved"
progress: 100%
deadline: 2026-08-30
tags: ["branding", "diseno", "ui-ux", "marca"]
---

# 🎨 Vertical 5: Mesa de Trabajo

Esta vertical consolida las directrices visuales, filosofía de marca, sistemas de diseño, colorimetría, tipografías y recursos gráficos de **ZentryOS**. Sirve como el área de trabajo y referencia obligatoria para los diseñadores de producto y desarrolladores frontend.

---

## 📂 Contenido del Módulo

1.  **[Colorimetría y Diseño](./colorimetria-y-diseno.md)**: Paleta cromática HSL/HEX, esquemas de contraste, gradientes e identidades para los temas de interfaz (Claro y Cyberpunk).
2.  **[Tipografía y Fuentes](./tipografia-y-fuentes.md)**: Jerarquía visual de textos, pesos tipográficos, interlineados y fuentes oficiales de Google Fonts.
3.  **[Logotipos y Recursos](./logotipos-y-recursos.md)**: Rutas y enlaces de descarga de imágenes corporativas, iconos y fondos premium del proyecto.

---

## 👁️ Filosofía Visual ZentryOS: Premium & Delicada

El ecosistema visual de ZentryOS se construye bajo tres conceptos fundamentales de diseño:

*   **Aislamiento y Enfoque**: Las interfaces eliminan los marcos pesados y se basan en tarjetas suaves y redondeadas (esquinas de `24dp` a `32dp`) para dar una sensación de ligereza e inocuidad.
*   **Transparencia (Glassmorphism)**: El uso estratégico de desenfoques de fondo (blur de 25px) y opacidades (35% blanco) simula que el sistema operativo flota sobre el fondo del universo Zentry, eliminando la pesadez de los menús nativos convencionales.
*   **Micro-animaciones Hágicas**: Las recompensas visuales al superar un reto lógico utilizan colores brillantes y efectos de física fluida en Compose para transformar el esfuerzo escolar en placer interactivo.

---

## 🎨 Lineamientos de Diseño (Contexto Breve)

Para asegurar la consistencia estética en todas las iniciativas de ZentryOS, el diseño visual debe respetar estrictamente las siguientes pautas:

*   **Paleta Cromática Oficial**:
    *   **Púrpura Zentry (`#533B87`)**: Identidad de marca, toggles y títulos principales.
    *   **Lavanda Zentry (`#D6C8FA`)**: Fondo de botones primarios ("Get Started") e interactividad.
    *   **Verde Menta (`#C2F4E7`)**: Progreso, éxitos y estados activos.
    *   **Blanco Glacial (`#EBF1F5`)**: Base de fondo y contenedores translúcidos (glassmorphism).
    *   **Gris Neutro Oscuro (`#4A5160`)**: Texto principal, subtítulos y legibilidad general.
*   **Enfoque Visual**:
    *   **NO es una Dark Tech UI**: El fondo debe ser claro (Blanco Glacial) con marmoleados y degradados suaves de lila (Lavanda) y verde (Verde Menta). Se deben evitar creativos oscuros o diseños fuera de la línea visual.
    *   **Efecto Cristal (Glassmorphism)**: Tarjetas flotantes y paneles con fondo translúcido (`rgba(255, 255, 255, 0.4)`), bordes sutiles y desenfoque (`blur(25px)`).
*   **Tipografía**:
    *   **Outfit**: Para títulos y elementos destacados.
    *   **Inter**: Para cuerpo de lectura y textos explicativos.



---

<a name="-archivo-05-mesa-de-trabajo-colorimetria-y-diseno-md"></a>
# 📂 ARCHIVO: `05-mesa-de-trabajo/colorimetria-y-diseno.md`

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



---

<a name="-archivo-05-mesa-de-trabajo-tipografia-y-fuentes-md"></a>
# 📂 ARCHIVO: `05-mesa-de-trabajo/tipografia-y-fuentes.md`

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



---

<a name="-archivo-05-mesa-de-trabajo-logotipos-y-recursos-md"></a>
# 📂 ARCHIVO: `05-mesa-de-trabajo/logotipos-y-recursos.md`

---
title: "Mesa de Trabajo: Logotipos y Recursos de Marca"
date: 2026-06-04
status: "approved"
progress: 100%
deadline: 2026-08-30
tags: ["branding", "logos", "assets", "recursos"]
---

# 🖼️ Logotipos y Recursos Gráficos

Este documento centraliza los enlaces a los recursos estáticos del diseño de marca de ZentryOS, almacenados de forma segura en la nube para el consumo en aplicaciones móviles y web.

---

## 📂 Recursos de Logotipos e Iconografía

*   **Logotipo Líquido Oficial**:  
    `https://raw.githubusercontent.com/j-angel-borges/zentry-assets/main/zentry-icon-liquid.png`
    *   *Uso*: Icono de la aplicación en el launcher, favicon de la Web App de leads.
*   **Icono de Marca Circular**:  
    `https://raw.githubusercontent.com/j-angel-borges/zentry-assets/main/zentry-icon.png`
    *   *Uso*: Identidad secundaria en las pantallas de carga nativas.

---

## 🌌 Recursos de Fondos y Fondos Esmerilados

*   **Fondo de Interfaz (Zentry BG)**:  
    `https://raw.githubusercontent.com/j-angel-borges/zentry-assets/main/zentry-bg.png`
    *   *Uso*: Fondo de pantalla del Launcher Kiosk y background de la SPA del DemoBook.

---

## 📡 Recursos Comerciales y vCards

*   **Código QR de Contacto (Asesor)**:  
    `https://raw.githubusercontent.com/j-angel-borges/zentry-assets/main/qr-vcard`
    *   *Uso*: Escaneo en Slide 7 del DemoBook para registrar la tarjeta de contacto del vendedor en el teléfono de los padres.

---

## 🛠️ Directrices de Uso de Recursos
1.  **Resolución**: Las imágenes de producción deben servirse en formato vectorial `.svg` o en imágenes PNG optimizadas con resoluciones `@2x` y `@3x` para pantallas móviles de alta densidad (Retina / AMOLED).
2.  **CDN**: Todos los recursos deben almacenarse en repositorios con CDN activa (como GitHub Pages o Google Cloud Storage) para garantizar tiempos de carga inferiores a 200ms a nivel global.

