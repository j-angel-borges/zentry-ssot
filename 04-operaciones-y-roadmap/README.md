---
title: "Operaciones y Roadmap: Índice y Metodología"
date: 2026-06-04
status: "approved"
progress: 20%
deadline: 2026-08-30
tags: ["operaciones", "roadmap", "gestion-proyecto"]
---

# 📅 Vertical 4: Operaciones y Roadmap

Esta vertical detalla el marco operativo, la planificación temporal por fases, los plazos de entrega (*deadlines*) y las métricas de progreso de **ZentryOS**.

---

## 📂 Contenido del Módulo

1.  **[Roadmap de Desarrollo](./roadmap.md)**: Hitos temporales divididos por fases desde el MVP (5%) hasta la versión comercial global (100%).
2.  **[Progreso y Métricas](./progreso-y-metricas.md)**: Indicadores clave de rendimiento (KPIs), estado de avance de cada módulo y velocidad del equipo de ingeniería.
3.  **[Banco de Ideas](./banco-de-ideas.md)**: Repositorio consolidado de notas y propuestas extraídas literalmente de Google Keep, con clasificaciones y tareas inferidas.
4.  **[Backlog de Tareas Semanales](./backlog-tareas.md)**: Flujo de trabajo activo con los to-dos y pendientes semanales inferidos de las ideas y necesidades operativas.
5.  **[Bitácora de Actividades Diarias](./bitacora-actividades.md)**: Historial y diario de progresos consolidados desde las carpetas de Google Drive.

---

## ⚙️ Metodología de Trabajo: Agile MDM

Dado que ZentryOS combina desarrollo de software móvil de bajo nivel con servicios de Inteligencia Artificial en la nube, el equipo opera bajo un marco ágil adaptado:

*   **Sprints Bisemanales**: Entregas funcionales testeadas en dispositivos físicos (Android / iOS).
*   **Validaciones en Campo**: Pruebas piloto presenciales con cohortes de familias seleccionadas para evaluar el nivel de elusión del Kiosk Mode y el engagement con el tutor de IA.
*   **Gobernanza del SSOT**: Asegurar que toda decisión de desarrollo que impacte en la arquitectura técnica esté documentada previamente en este manifiesto.

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
