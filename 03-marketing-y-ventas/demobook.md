---
title: "Herramientas de Ventas: DemoBook y ZENTRYprospect"
date: 2026-06-04
status: "approved"
progress: 100%
deadline: 2026-08-30
tags: ["marketing", "ventas", "demobook", "zentryprospect", "herramientas"]
---

# 🛠️ Herramientas de Ventas: DemoBook y ZENTRYprospect

Este documento aclara y define conceptualmente las dos herramientas fundamentales utilizadas por el equipo de Marketing y Ventas de ZentryOS para expandir el ecosistema comercial:

1. **El DemoBook**: El material de apoyo visual y científico que utiliza el asesor comercial durante la **Venta Directa** para acompañar su presentación y facilitar el flujo de "La DEMO".
2. **ZENTRYprospect**: La aplicación web independiente desarrollada en **Google Apps Script** y conectada a **Google Sheets** que se utiliza específicamente en eventos masivos (como la *Expo Maternidad*) para calificar prospectos y capturar leads de forma digital.

---

## 📘 1. El DemoBook: Material de Apoyo para Venta Directa

El **DemoBook** es el maletín de herramientas físicas y digitales que el asesor de ventas utiliza de forma interactiva frente al cliente para guiarlo a través del guion comercial. Su estructura sigue y representa estratégicamente cada una de las fases de **La DEMO**:

### 🗂️ Componentes del DemoBook:

#### A. Slides (Presentación Comercial Estructurada)
Un set de diapositivas interactivas diseñadas con la identidad visual premium de ZentryOS que guían la conversación paso a paso:
*   **Fase de Romper el Hielo**: Diapositivas para mostrar la radiografía de consumo digital y calcular el gasto tecnológico familiar de los últimos 5 años.
*   **Fase de Autoridad**: Slides corporativos que validan a *QUARZ GROUP EIRL* como un holding tecnológico de confianza.
*   **Fases de Prevención y Miedo**: Diapositivas que visualizan el circuito neurológico del consumo digital compulsivo y exponen las consecuencias reales de la falta de acción.
*   **Fase de Valor y Plan**: Presentación visual de las dos vistas (Vista para Padres y Vista para Niños) y la arquitectura de ZentryOS.

#### B. Carpeta de Experiencias WOW (Videos y Recursos Multimedia)
Vídeos y demostraciones preparadas para asombrar al prospecto en tiempo real:
*   **Vídeo del Tutor IA Vocal**: Muestra del avatar interactivo con síntesis de voz Gemini TTS y animaciones reactivas en Compose.
*   **Vídeo del Desafío Lógico**: Animaciones que muestran al niño ganando energía tras resolver retos matemáticos o lógicos (apertura de portales tridimensionales).
*   **Demostración de Telemetría**: Pantallas que ilustran cómo se apaga el dispositivo de forma remota a través del *Kill-Switch* de Firestore.

#### C. Banco de Validación Científica y Enlaces de Investigación
El DemoBook contiene artículos científicos, investigaciones neurológicas y estadísticas reales que sirven para respaldar con evidencia científica la propuesta de ZentryOS:
*   **Impacto Cognitivo de la Estimulación Temprana**: Estudios sobre la atrofia del lóbulo frontal debido a la exposición a pantallas antes de los 5 años.
*   **Mecanismos de Adicción Digital**: Documentos de la OMS y del DSM-5 sobre el Trastorno por Videojuegos (Loot Boxes como puerta a la ludopatía).
*   **Estadísticas de Exposición a Riesgos**: Informes de ciberseguridad sobre el tiempo promedio en que un menor sin protección accede a contenido no apto en la red.

#### D. La Encuesta de Diagnóstico Familiar
Cuestionario inicial estructurado (aplicado de forma oral o en papel) para medir las horas de pantalla, el uso de control parental y la irritabilidad del menor cuando se le retira el celular.

---

## 📱 2. ZENTRYprospect: Web App de Prospección y Captura de Leads

**ZENTRYprospect** es el recurso tecnológico desarrollado específicamente para capturar leads fríos y pre-calificarlos en puntos de prospección directa de alto tráfico.

### 🏗️ Arquitectura de la Aplicación (Google Apps Script)
Implementado como una Web App SPA (*Single Page Application*) que se ejecuta en los dispositivos de los asesores en campo:

```text
[Dispositivo del Prospectador (Index.html)]
                    │
                    ▼ (google.script.run)
      [Google Apps Script (Code.gs)]
                    │
                    ├─► [Google Spreadsheet (Leads_ZentryOS_ExpoMaternidad_V3)]
                    └─► [Odoo CRM (Sincronización automática de leads)]
```

### 📋 Estructura de Pantallas de la Encuesta Digital SPA:
1.  **Slide 0 (Portada)**: Título comercial gancho: *"Protege la mente de tu hijo en la era digital"*. Botón *"Evaluar Riesgo"*.
2.  **Slide 1 (Calificación de Preocupación)**: Escala del 1 al 10 sobre qué tan preocupante considera el uso de pantallas.
3.  **Slide 2 (Conocimiento del Daño)**: Pregunta abierta sobre si el tutor conoce las consecuencias cognitivas de la sobreexposición digital.
4.  **Slide 3 (Segmentación por Cohortes)**: Clasificación de edad de los hijos:
    *   *Mayores (+)* ➔ Redirige a **Slide 4a** (Preguntas sobre aislamiento familiar).
    *   *Menores (-)* ➔ Redirige a **Slide 4b** (Preguntas sobre adopción tecnológica futura).
    *   *Ambas edades* ➔ Redirige a **Slide 4c** (Pregunta abierta sobre el sistema educativo convencional).
5.  **Slide 5 (Intencionalidad de Solución)**: Pregunta de filtro de cierre: *"¿Les interesaría conocer más?"* (Sí/No).
6.  **Slide 6 (Formulario de Captura)**: Campos para recolectar el Nombre de la Madre/Tutor, Distrito de Residencia y Celular (con validador estricto de números).
7.  **Slide 7 (vCard y Cierre)**: Genera dinámicamente un código QR (`qr-vcard`) para que el usuario guarde el contacto del asesor. Permite al prospectador ingresar observaciones internas antes de subir la información a la base de datos.

### 🗄️ Estructura de Columnas en Google Sheets:
Las respuestas se guardan estructuradas en la hoja de cálculo sincronizada:
`ID | Timestamp | Nivel_Preocupacion | Conocimiento_Dano | Edad_Hijos | Pregunta_Condicional | Respuesta_Condicional | Interes_Solucion | Nombre_Madre | Celular | Distrito | Observaciones`

### 🔒 Panel de Administración del Evento:
Acceso restringido para coordinadores comerciales:
*   **KPIs en Tiempo Real**: Barra que calcula la captación diaria contra la meta establecida (Meta base: **120 leads**).
*   **Buscador**: Filtrado instantáneo por distrito o nombre de los leads.
*   **Acciones**: Eliminación de datos inválidos y exportación en formato `.csv`.
