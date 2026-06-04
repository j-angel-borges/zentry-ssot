---
title: "Telemetría y Conectividad AI: GCP y Vertex AI"
date: 2026-06-04
status: "approved"
progress: 35%
deadline: 2026-08-30
tags: ["arquitectura", "gcp", "vertex-ai", "firebase"]
---

# 📊 Telemetría Cloud e Integración de Inteligencia Artificial

ZentryOS requiere una infraestructura en la nube robusta para gestionar la lógica de Inteligencia Artificial, procesar los logs de comportamiento y responder a comandos remotos en milisegundos.

---

## 📡 Arquitectura de Conectividad Cloud

```text
[Dispositivo Cliente]
   |
   +---(Escucha en tiempo real)--------> [Firebase Firestore (Kill-Switch / Bloqueo)]
   |
   +---(Consultas de Texto / Audio)---> [Vertex AI / Gemini 2.5-flash-lite]
   |
   +---(Logs de Comportamiento)--------> [GCP Pub/Sub] ---> [BigQuery] ---> [Reporte Semanal Padres]
```

---

## 🤖 Integración de Inteligencia Artificial (Vertex AI / Gemini)

El tutor inteligente está integrado directamente en el ciclo de vida del Launcher. 

*   **SDK Utilizado**: `com.google.ai.client.generativeai:0.9.0`
*   **Modelo de Producción**: `gemini-2.5-flash-lite` (seleccionado por su bajísima latencia de respuesta y coste óptimo para flujos continuos de conversación).
*   **Contexto de Sistema (System Instructions)**:
    El modelo recibe instrucciones estrictas para actuar como un educador socrático adaptado a la edad del menor. Tiene terminantemente prohibido resolver tareas escolares de manera directa. En su lugar, guía al usuario planteando preguntas complementarias.
*   **Prompt de Sistema (Simplificado)**:
    ```text
    Actúa como Zentry, el tutor personal del menor. Tienes prohibido dar respuestas directas a problemas escolares. Guía al estudiante usando el método socrático. Adapta tu vocabulario a un niño de {Edad} años. Si el usuario muestra signos de tristeza o frustración digital, interviene con una actividad lúdica o de respiración.
    ```

---

## 🛰️ Control Remoto en Tiempo Real (Firebase Firestore)

Para garantizar que el bloqueo del dispositivo solicitado por el padre ocurra al instante, ZentryOS implementa un canal de Comando y Control (C&C) a través de Firebase Firestore con escuchas activas (`addSnapshotListener`).

### Estructura de Datos del Documento de Control (`/devices/{deviceId}`):
```json
{
  "isLocked": true,
  "lockReason": "Hora de cenar",
  "allowedApps": ["com.zentryos.launcher", "com.google.android.calculator"],
  "dailyLimitMinutes": 120,
  "timestamp": "2026-06-04T03:31:00Z"
}
```
*   **Comportamiento del Launcher**: Al cambiar `isLocked` a `true` en Firestore, la app cliente recibe la notificación de forma reactiva y ejecuta `startLockTask()` en la actividad nativa, bloqueando toda la UI de forma inmediata e ineludible.

---

## 📈 Pipeline de Telemetría (GCP BigQuery)

Para medir el rendimiento cognitivo del menor y generar los reportes para padres, ZentryOS transmite eventos cifrados de telemetría a través de GCP Pub/Sub:

1.  **Eventos Capturados**:
    *   `logic_challenge_resolved`: Tiempo empleado, intentos fallidos, nivel de dificultad del reto de lógica.
    *   `chat_sentiment_index`: Análisis sintáctico local en Compose para detectar frustración, cansancio o agresividad verbal.
    *   `screen_time_distribution`: Minutos exactos por categoría de aplicación permitida.
2.  **Procesamiento**: Pub/Sub envía los datos en streaming a **BigQuery**, donde modelos de datos agregados analizan las tendencias cognitivas del menor.
3.  **Entrega**: Vertex AI procesa semanalmente los datos consolidados en BigQuery y redacta de manera automatizada el **Reporte Semanal para Padres**, que se envía vía email o app móvil complementaria.

---

## 📅 Roadmap de Infraestructura AI Inferred (Keep)

De las propuestas capturadas en Google Keep, se derivan los siguientes componentes de arquitectura en la nube:

1. **Inteligencia Matriz de Coordinación Multi-dispositivo [TEC-04]**:
   - Una arquitectura en GCP que registra los estados y coordina dinámicamente las experiencias de juego creativo entre múltiples pantallas (TV conectada a Tablet y Móvil actuando como centro de control/mando).
   - Control centralizado del ciclo de vida de la sesión de juego a través de WebSockets en GCP.
2. **Motor de Reportes de Inteligencias Múltiples [TEC-06]**:
   - Agente de IA entrenado pedagógicamente que analiza las creaciones de rol del menor (mensajes de voz, fotos de creaciones o interacciones lógicas) y genera perfiles de inteligencias múltiples (musical, creativa, lógica, emocional) para reportar de forma constructiva a los padres.

