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
