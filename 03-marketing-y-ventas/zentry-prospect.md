---
title: "Zentry Prospect - Herramienta de Prospección de Clientes"
date: 2026-06-04
status: "approved"
progress: 100%
deadline: 2026-08-30
tags: ["marketing", "ventas", "prospeccion", "apps-script", "sheets"]
---

# 📊 Zentry Prospect (Zentry Prospecc)

Este documento detalla la infraestructura tecnológica y las especificaciones de la aplicación web de prospección **Zentry Prospect** (diseñada bajo Google Apps Script y Google Sheets). Su propósito es capturar, calificar y centralizar leads en campo de forma rápida y automatizada (e.g. en eventos presenciales como la *Expo Maternidad*).

---

## 🏗️ Arquitectura de la Aplicación Web (Google Apps Script)

La herramienta de prospección está construida sobre una **Web App de Google Apps Script (GAS)**, lo que permite un despliegue gratuito, escalable y con base de datos nativa en Google Sheets.

```text
[Dispositivo del Asesor (Interface HTML/JS)]
                  │
                  ▼ (Javascript: google.script.run)
      [Google Apps Script (Code.gs)]
                  │
                  ├─► [Google Spreadsheet (Leads_ZentryOS_ExpoMaternidad_V3)]
                  └─► [Sincronización con CRM / Odoo (Opcional)]
```

---

## 📋 Flujo de Pantallas de Captación (Slides HTML)

La interfaz es una Single Page Application (SPA) responsiva que guía al asesor y al padre durante la conversación rápida en eventos:

*   **Slide 0 (Portada)**: Título comercial llamativo: *"Protege la mente de tu hijo en la era digital"*. Botón de acción principal: *"Iniciar Evaluación"*.
*   **Slide 1 (Calificación 1-10)**: El padre califica su *Nivel de Preocupación* sobre el abuso de pantallas de sus hijos en un selector del 1 al 10.
*   **Slide 2 (Conocimiento del Daño)**: Pregunta abierta sobre si ha oído hablar del impacto cognitivo y la ludopatía digital temprana.
*   **Slide 3 (Cohorte Etario)**: Clasificación de edad de los hijos:
    *   `Mayores (+)` ➔ Redirige a **Slide 4a** (Preguntas sobre desconexión familiar/conversación).
    *   `Menores (-)` ➔ Redirige a **Slide 4b** (Preguntas sobre el dominio de tecnologías futuras).
    *   `Ambas` ➔ Redirige a **Slide 4c** (Pregunta sobre rigidez del sistema educativo tradicional).
*   **Slide 5 (Intencionalidad de Solución)**: Filtro de interés: *"¿Les interesaría conocer una solución de supervisión inteligente?"* (Sí/No).
*   **Slide 6 (Formulario de Contacto)**: Captura de datos básicos:
    *   *Nombre del Padre/Madre* (`Nombre_Madre`)
    *   *Número de Celular* (`Celular`)
    *   *Distrito de residencia* (`Distrito`)
*   **Slide 7 (Cierre y vCard)**: Muestra un código QR interactivo (`qr-vcard`) para guardar el contacto del asesor comercial en el teléfono del cliente. Incluye el campo de *Observaciones* del asesor para calificar manualmente la temperatura del lead.

---

## 🗄️ Esquema de Base de Datos (Google Sheets)

Los registros del formulario se escriben en tiempo real en la hoja `Leads` del libro de trabajo `Leads_ZentryOS_ExpoMaternidad_V3.gsheet`.

### Mapeo de Columnas:
1.  **ID**: Identificador único generado por el frontend (UUID de 8 dígitos).
2.  **Timestamp**: Fecha y hora exacta de la captura.
3.  **Nivel_Preocupacion**: Calificación numérica 1-10.
4.  **Conocimiento_Dano**: Comentario cualitativo del daño.
5.  **Edad_Hijos**: Segmentación etaria seleccionada.
6.  **Pregunta_Condicional**: Título de la pregunta de control mostrada.
7.  **Respuesta_Condicional**: Respuesta del padre.
8.  **Interes_Solucion**: Nivel de aceptación del pitch (Sí/No).
9.  **Nombre_Madre**: Nombre del lead capturado.
10. **Celular**: Teléfono (con validaciones de longitud).
11. **Distrito**: Ubicación para la segmentación física de ventas.
12. **Observaciones**: Comentarios del cerrador sobre el interés del lead.

---

## 🔒 Panel de Administración y Métricas

El script de Google Apps Script sirve una ruta protegida (`openAdmin()`) para el coordinador del evento:
*   **Barra de Progreso de Leads**: Visualizador dinámico que compara las capturas del día frente a la meta (Meta diaria: **120 leads**).
*   **Buscador**: Filtro de registros por nombre o distrito en tiempo real.
*   **Exportación**: Descarga directa de los leads consolidados en formato `.csv` estructurado.

---

## 🔗 Assets de Prospección en Github
Los recursos de branding para la web app se sirven desde el repositorio público de assets:
`https://raw.githubusercontent.com/j-angel-borges/zentry-assets/main/`
*   Fondo de pantalla Aurora: `zentry-bg.png`
*   Logotipo de prospección: `zentry-icon-liquid.png`
*   QR dinámico: `qr-vcard`
