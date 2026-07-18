# ZentryOS - Single Source of Truth (SSOT)

Bienvenido al repositorio oficial del **Manifiesto Único de Contexto (SSOT)** de **ZentryOS**, el sistema operativo diseñado para transformar la relación de los niños y jóvenes (de 2 a 20 años) con la tecnología, mitigando la ludopatía y la estimulación algorítmica mediante un entorno seguro, controlado y potenciado por Inteligencia Artificial Generativa.

---

## 📌 Visión General del Proyecto

ZentryOS actúa como un **Launcher Kiosk** de seguridad de nivel industrial que bloquea la superficie de ataque de los dispositivos Android convencionales, reemplazando la experiencia de usuario nativa por un ecosistema gamificado y educativo. 

A través del uso de modelos avanzados de IA (Gemini vía Firebase AI Logic / Vertex AI; el id del modelo se lee de `BuildConfig.ZENTRY_MODEL_ID`, hoy `gemini-2.5-flash`, nunca hardcodeado), ZentryOS actúa como un tutor personalizado que acompaña al usuario en su desarrollo intelectual, bloqueando de raíz los incentivos de dopamina artificial (scroll infinito, videos cortos invasivos, ludopatía digital) y sustituyéndolos por retos educativos interactivos.

---

## 📂 Arquitectura de Documentación (SSOT)

Para facilitar la integración de agentes de Inteligencia Artificial (IA) en el desarrollo de ZentryOS, el repositorio cuenta con un mapa de entrada estructurado:

*   **[llms.txt](./llms.txt):** El mapa e índice de navegación optimizado para consumo de LLMs y agentes.
*   **[CANON.md](./CANON.md):** El pilar de gobernanza técnica, que establece el estado real del proyecto, las decisiones inmutables y la lista anti-regresión.
*   **[AGENTS.md](./AGENTS.md) / [CLAUDE.md](./CLAUDE.md):** Puntos de entrada por plataforma (Antigravity/AGY CLI y Claude, respectivamente). Ambos ordenan lo mismo: **cargar `CANON.md` antes de cualquier tarea**.
*   **[CHANGELOG-SSOT.md](./CHANGELOG-SSOT.md):** Registro append-only de cada actualización del SSOT (fecha · agente · vertical · delta). Lo escribe la skill `agent-auditor-ss`.

Adicionalmente, el repositorio está estructurado en siete (7) verticales de información clave para los equipos humanos de ingeniería, diseño, marketing, operaciones y para el ecosistema agéntico:

### [1. Visión y Producto](./01-vision-y-producto/README.md)
Analiza el problema de mercado, la adicción a las pantallas y el diseño de la solución bilateral (padres vs. hijos).
*   [Problema Algorítmico](./01-vision-y-producto/problema-algoritmico.md): Impacto neurológico del consumo digital temprano.
*   [Ludopatía y Adicción](./01-vision-y-producto/ludopatia-y-adiccion.md): Mecanismos del scroll infinito y loop de dopamina.
*   [Solución Bilateral](./01-vision-y-producto/solucion-bilateral.md): Cómo equilibramos la paz mental de los padres con el engagement del niño.
*   [Segmentación Etaria](./01-vision-y-producto/segmentacion-etaria.md): Adaptación de la UI y los prompts de IA de los 2 a los 20 años.

### [2. Arquitectura Técnica MVP](./02-arquitectura-tecnica/README.md)
Detalla el diseño de software, la configuración de hardware (MDM) y la infraestructura en la nube.
*   [Paradigma Web-First](./02-arquitectura-tecnica/paradigma-web-first.md): Integración híbrida para un desarrollo rápido y escalable.
*   [Control de Dispositivo & ABM](./02-arquitectura-tecnica/control-dispositivo-abm.md): Provisionamiento mediante Device Owner y Apple Business Manager.
*   [Telemetría y GCP/Vertex AI](./02-arquitectura-tecnica/telemetria-gcp-ai.md): Pipelines de datos de comportamiento, logs de interacción y control por Firestore.
*   [Interfaz Compose](./02-arquitectura-tecnica/interfaz-compose.md): Diseño premium con Jetpack Compose, Liquid Glass (Haze) y física de movimiento calibrada a iOS.
*   [Análisis de Brechas](./02-arquitectura-tecnica/analisis-de-brechas.md): El delta entre el estado real (~12-15% comercial, Device Owner ~95%) y el producto final, con criterios de aceptación.
*   [Modelo de Datos Firestore](./02-arquitectura-tecnica/modelo-de-datos-firestore.md): Esquema físico de colecciones, reglas de seguridad y contratos JSON del puente de inteligencia.
*   [Seguridad y Privacidad](./02-arquitectura-tecnica/seguridad-y-privacidad.md): Modelo de amenazas STRIDE y tabla canónica de datos de menores (COPPA-eq. + Ley 29733).
*   [Calidad y Despliegue](./02-arquitectura-tecnica/calidad-y-despliegue.md): Suite anti-evasión, matriz de hardware y ruta de despliegue.

### [3. Marketing y Ventas](./03-marketing-y-ventas/README.md)
Detalla la estrategia comercial, los recursos tecnológicos y el guion interactivo de venta consultiva en campo.
*   [Recursos del DemoBook](./03-marketing-y-ventas/demobook.md): Material de apoyo visual (Slides), carpetas de videos, imágenes y biblioteca de validación científica que acompañan y apoyan el pitch de ventas del asesor comercial.
*   [Zentry Prospect (Prospección)](./03-marketing-y-ventas/zentry-prospect.md): Infraestructura de la Web App en Google Apps Script, base de datos en Google Sheets y consola de administración para capturar leads en campo.
*   [Guion de Venta Directa](./03-marketing-y-ventas/demo-venta-directa.md): Estructura oficial del guion interactivo (Romper el Hielo, Autoridad, Miedo, Cierre).
*   [Precierres y Embudos](./03-marketing-y-ventas/precierres-y-embudos.md): Estrategia de go-to-market y embudos presenciales/digitales.
*   [Manejo de Objeciones](./03-marketing-y-ventas/manejo-de-objeciones.md): Respuestas lógicas y analogías del Doc Matriz.
*   [Factor WOW](./03-marketing-y-ventas/factor-wow.md): Dinámicas y micro-interacciones sensoriales para el cierre.

### [4. Operaciones y Roadmap](./04-operaciones-y-roadmap/README.md)
Define la planificación temporal, los hitos clave y la asignación de recursos.
*   [Roadmap de Producto](./04-operaciones-y-roadmap/roadmap.md): Fases de desarrollo, fechas críticas y entregables.
*   [Progreso y Métricas](./04-operaciones-y-roadmap/progreso-y-metricas.md): Estado del arte y KPIs operativos actuales.
*   [Banco de Ideas](./04-operaciones-y-roadmap/banco-de-ideas.md): Registro centralizado de ideas clasificadas por fecha y prioridad.
*   [Bitácora de Actividades](./04-operaciones-y-roadmap/bitacora-actividades.md): Historial de actividades diarias procesadas por el agente.

### [5. Mesa de Trabajo](./05-mesa-de-trabajo/README.md)
Consolida la identidad visual de marca, paletas de color, tipografía y recursos gráficos.
*   [Colorimetría y Diseño](./05-mesa-de-trabajo/colorimetria-y-diseno.md): Especificaciones de HSL/HEX, gradientes y temas.
*   [Tipografía y Fuentes](./05-mesa-de-trabajo/tipografia-y-fuentes.md): Jerarquía de tipografías y fuentes.
*   [Logotipos y Recursos](./05-mesa-de-trabajo/logotipos-y-recursos.md): Enlaces y directrices de logotipos y fondos.

### [6. Arquitectura Agéntica](./06-arquitectura-agentica/README.md)
Gobierna al ejecutor de código (Antigravity/AGY): identidad, guardrails, skills, MCP, loop engineering y roadmap SDD.

### [7. Plataforma Híbrida de Microapps](./07-plataforma-microapps/README.md)
El paradigma web-first: cáscara nativa + microapps de contenido como PWAs, contrato JS Bridge y motor de hosting.

---

## 🛠️ Contribución y Gobernanza del SSOT

Este repositorio se rige por políticas estrictas de control de cambios. La actualización operativa del día a día se hace con la **arquitectura de 2 etapas (Obrero/Auditor)**.

1.  Al terminar de programar, el obrero invoca `agent-execute-wt` para dejar un Walkthrough.
2.  Luego, en una sesión limpia, se invoca `agent-auditor-ss` para consolidar el SSOT quirúrgicamente.
2.  Actualiza el Frontmatter YAML de los archivos editados (`status`, `date`, `progress`).
3.  Para cambios estructurales: rama descriptiva + plantilla de PR justificando el impacto en las 7 verticales + aprobación de pares.
4.  Regla de oro: **solo `CANON.md` declara el estado real; los demás documentos enlazan, nunca lo duplican.**
