---
title: "Recursos y Herramientas del DemoBook"
date: 2026-06-04
status: "approved"
progress: 100%
deadline: 2026-08-30
tags: ["marketing", "ventas", "demobook", "herramientas", "web-app"]
---

# 🛠️ Recursos y Herramientas del DemoBook

Este documento detalla la infraestructura tecnológica y las herramientas digitales que soportan al **DemoBook**, la aplicación web interactiva que los asesores de ventas utilizan en campo (como en la *Expo Maternidad*) para capturar y calificar leads.

---

## 🏗️ Arquitectura de la Aplicación Web (Google Apps Script)

El DemoBook está implementado como una **Web App de Google Apps Script (GAS)**, lo que permite un despliegue gratuito, sin mantenimiento de servidor y con integración nativa al ecosistema de Google Sheets.

```text
[Dispositivo Asesor (Index.html / WebView)]
                  │
                  ▼ (Javascript google.script.run)
      [Google Apps Script (Code.gs)]
                  │
                  ├─► [Google Spreadsheet (Leads_ZentryOS_ExpoMaternidad_V3)]
                  └─► [Odoo CRM (Sincronización de Leads)]
```

---

## 📋 Especificación de Pantallas (Slides HTML)

El archivo [Index.html](file:///C:/Users/jange/.gemini/antigravity/scratch/ZentryOS_App/Index.html) utiliza un sistema de navegación SPA (*Single Page Application*) animado con transiciones de Compose. Las pantallas están diseñadas de la siguiente manera:

*   **Slide 0 (Portada)**: Título llamativo: *"Protege la mente de tu hijo en la era digital"*. Botón de acción principal *"Evaluar Riesgo"*.
*   **Slide 1 (Calificación 1-10)**: Recopila el *Nivel de Preocupación* del padre mediante botones circulares del 1 al 10.
*   **Slide 2 (Conocimiento del Daño)**: Caja de texto abierta para que el padre escriba si ha oído hablar del impacto cognitivo y ludopatía digital.
*   **Slide 3 (Segmentación de Edad)**: Clasificación de cohortes:
    *   `Mayores (+)` ➔ Redirige a **Slide 4a** (Preguntas sobre reducción de conversaciones familiares).
    *   `Menores (-)` ➔ Redirige a **Slide 4b** (Preguntas sobre necesidad de dominar tecnologías futuras).
    *   `Ambas` ➔ Redirige a **Slide 4c** (Pregunta abierta sobre el sistema educativo tradicional).
*   **Slide 5 (Intencionalidad de Solución)**: Pregunta directa de precierre de interés: *"¿Les interesaría conocer más?"* (Sí/No).
*   **Slide 6 (Formulario de Contacto)**: Captura de datos básicos del tutor:
    *   *Nombre Completo* (Nombre_Madre)
    *   *Número de Celular* (Filtro numérico estricto)
    *   *Distrito*
*   **Slide 7 (Cierre y vCard)**: Muestra un código QR interactivo (`qr-vcard`) para que el cliente guarde el contacto del asesor. Incluye un campo de *Observaciones Adicionales* para notas internas del vendedor antes de subir el lead.

---

## 🗄️ Esquema de Base de Datos (Google Sheets)

Las respuestas del formulario se guardan de forma estructurada en la hoja `Leads` del archivo `Leads_ZentryOS_ExpoMaternidad_V3.gsheet`.

### Definición de Columnas de la Tabla:
1.  **ID**: Identificador único UUID de 8 caracteres generado localmente (`generateUUID()`).
2.  **Timestamp**: Marca de tiempo del registro.
3.  **Nivel_Preocupacion**: Valor del 1 al 10 (Slide 1).
4.  **Conocimiento_Dano**: Comentario abierto (Slide 2).
5.  **Edad_Hijos**: Cohorte etario seleccionado (Slide 3).
6.  **Pregunta_Condicional**: Título de la pregunta condicional mostrada.
7.  **Respuesta_Condicional**: Respuesta a la pregunta condicional (Slide 4a/b/c).
8.  **Interes_Solucion**: Nivel de interés (Slide 5).
9.  **Nombre_Madre**: Nombre del lead (Slide 6).
10. **Celular**: Teléfono de contacto (Slide 6).
11. **Distrito**: Distrito de residencia (Slide 6).
12. **Observaciones**: Comentarios del asesor comercial (Slide 7).

---

## 🔒 Consola de Administración (Admin Panel)

El DemoBook incluye un panel interno protegido (`openAdmin()`) visible para coordinadores de ventas:
*   **Visualización de Métricas**: Muestra una barra de progreso que compara la captación del día contra la meta del evento (Meta base: **120 leads**).
*   **Buscador en Tiempo Real**: Filtro de leads registrados por nombre o distrito.
*   **Acciones Directas**: Permite eliminar registros obsoletos y exportar la base de datos completa como archivo `.csv` estructurado con un solo clic.

---

## 🔗 Repositorio de Recursos Estáticos (Github)
Los assets visuales y de marca utilizados por la aplicación web se sirven desde el repositorio público:
`https://raw.githubusercontent.com/j-angel-borges/zentry-assets/main/`
*   *Fondo premium esmerilado*: `zentry-bg.png`
*   *Icono líquido*: `zentry-icon-liquid.png`
*   *Código QR vCard*: `qr-vcard`
