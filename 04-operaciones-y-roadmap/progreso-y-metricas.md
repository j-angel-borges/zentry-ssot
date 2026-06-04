---
title: "Progreso y Métricas: KPIs del Proyecto"
date: 2026-06-04
status: "approved"
progress: 25%
deadline: 2026-08-30
tags: ["operaciones", "metricas", "kpis", "velocidad"]
---

# 📊 Progreso y Métricas de ZentryOS

Para garantizar la viabilidad comercial y la excelencia técnica, ZentryOS define indicadores clave de rendimiento (KPIs) en sus tres dimensiones principales: Ingeniería, Marketing/Ventas y Operación.

---

## 📈 KPIs de Ingeniería y Software

Estos indicadores miden la estabilidad y seguridad del sistema operativo en los dispositivos del usuario:

*   **Tasa de Elusión (Evasion Rate)**: % de menores que logran saltarse el Kiosk Mode (mediante depuración USB, combinación de botones o cierres forzados). 
    *   *Meta Comercial*: **0.00%**.
    *   *Estado Actual (MVP)*: **65.00%** (debido al uso de LockTaskMode básico sin privilegios de Device Owner).
*   **Latencia del Tutor IA (AI Latency)**: Tiempo transcurrido entre el fin del comando de voz del niño y el inicio de la respuesta sintetizada del tutor Zentry.
    *   *Meta Comercial*: **< 1,000ms**.
    *   *Estado Actual (MVP)*: **1,200ms** (usando Gemini 2.5 Flash Lite sobre HTTP directo).
*   **Consumo de Batería Excedente (Battery Overhead)**: Incremento en el consumo diario de batería atribuible a ZentryOS frente a un dispositivo Android de stock.
    *   *Meta Comercial*: **< 8.00%** extra en 24 horas.
    *   *Estado Actual (MVP)*: **14.00%** (debido a consultas en segundo plano no optimizadas).

---

## 🎯 KPIs de Marketing y Conversión Comercial

Miden la efectividad del equipo de asesores de ventas y los embudos de captación:

*   **Tasa de Asistencia al DemoBook**: % de leads que asisten a la demostración en vivo programada tras registrarse en el Quiz digital o la Expo Maternidad.
    *   *Meta Comercial*: **> 70.00%**.
*   **Conversión de Demostración a Cierre**: % de familias que adquieren la suscripción anual de ZentryOS inmediatamente después de finalizar la demostración interactiva.
    *   *Meta Comercial*: **> 35.00%**.
*   **Costo de Adquisición de Cliente (CAC)**: Costo total de marketing y comisión del asesor para captar una suscripción de pago.
    *   *Meta Comercial*: **< $45 USD**.

---

## 🏆 KPIs de Retención y Valor de Vida (LTV)

Miden el éxito a largo plazo del producto e impacto educativo:

*   **Tasa de Uso Diario Activo (DAU/MAU)**: % de menores que interactúan con el tutor Zentry o resuelven acertijos diariamente.
    *   *Meta Comercial*: **> 80.00%**.
*   **Retención Mensual (Parent Retention)**: % de padres que no cancelan la suscripción o solicitan la remoción del MDM al final del mes.
    *   *Meta Comercial*: **> 92.00%**.
*   **Tasa de Resolución de Retos (Challenge Success Rate)**: % de retos de matemáticas y lógica resueltos con éxito frente a los presentados. Sirve para evaluar si la dificultad dinámica de la IA se adapta correctamente al niño.
    *   *Meta Comercial*: **60.00% - 75.00%** (un valor menor indica frustración, un valor mayor indica aburrimiento).
*   **Churn de Suscripción (Anual)**: % de licencias anuales que no se renuevan al cumplir los 12 meses.
    *   *Meta Comercial*: **< 15.00%**.
