---
title: "Reglas y Guardrails: Contención Técnica del Ejecutor"
date: 2026-07-14
status: "under-review"
progress: 100%
tags: ["zentryos", "ssot", "arquitectura-agentica", "guardrails"]
---

# 🛑 Reglas y Guardrails del Ejecutor

Fuente canónica del archivo `.agents/rules/00-guardrails.md` del workspace. Las reglas de Antigravity en `.agents/rules/` se cargan en todas las sesiones del workspace y **prevalecen sobre cualquier spec**: ante conflicto, gana el guardrail y se escala a humano. Esa inversión de prioridad es la esencia del diseño — una spec mal redactada nunca puede autorizar una acción peligrosa. La versión vinculante de las reglas duras de producto vive en [`CANON.md §5`](../CANON.md); este archivo es su proyección operativa para el ejecutor.

Decisiones de diseño:

*   **Hard-stops numéricos, no discrecionales**: 10 compilaciones fallidas consecutivas o 3 ciclos de test sobre el mismo criterio → parada total con reporte. Prohibido "intentar una vez más": esa frase es la puerta de los burnouts de cuota de varias horas.
*   **El guardrail del Device Owner PROTEGE, ya no impide**: el DO está activo y aprovisionado (testeado en Redmi 9). El guardrail ya no dice "nunca actives el DO"; dice "no toques el Manifest ni los permisos DO sin HITL", para blindar una configuración funcional que un cambio ciego podría romper.
*   **El checklist anti-regresión es parte del guardrail**, no de la spec: ninguna tarea puede darse por cerrada rompiendo la demo, aunque su spec no mencione la demo. Su fuente única es `CANON §4`.

---

## 📄 Bloque delimitado — archivo destino

```markdown
<!-- ═══ ARCHIVO DESTINO: zentrybyantig/.agents/rules/00-guardrails.md ═══ -->
<!-- Fuente canónica: zentry-ssot/06-arquitectura-agentica/reglas-y-guardrails.md (2026-07-14) -->

# 00-guardrails.md — Reglas duras del ejecutor ZentryOS

Estas reglas son innegociables. Ante conflicto entre una spec y este archivo, gana este archivo y se escala a humano. La verdad de producto está en `CANON.md §5` del repo SSOT; ante divergencia, gana `CANON`.

## 🔁 Bucle build-verify

- Compila tras cada cambio significativo: `.\gradlew.bat assembleDebug` (Windows) o `./gradlew assembleDebug` (POSIX).
- Un cambio "significativo" = cualquier edición que toque más de un archivo, una firma pública, la navegación o un contrato JSON.
- Procedimiento completo e interpretación de fallos: `.agents/workflows/verificacion-build.md`.

## 🛑 Condiciones de HARD STOP

| # | Condición | Acción |
|---|---|---|
| 1 | 10 compilaciones fallidas consecutivas | STOP total → reporte de fallo a humano (formato en `verificacion-build.md`) |
| 2 | 3 ciclos de test fallidos sobre el MISMO criterio de aceptación | STOP de la tarea → reporte con hipótesis de causa raíz |

Tras un HARD STOP está prohibido "intentar una vez más": se redacta el reporte y se espera instrucción humana.

## ⛔ Acciones prohibidas (sin excepción, sin HITL previo)

1. **Device Owner — proteger la configuración activa**: NO alterar el `AndroidManifest`, el registro de `ZentryAdminReceiver`, ni ningún permiso o política de Device Owner. El DO YA está activo y aprovisionado (LockTask, `setApplicationHidden`, `addPersistentPreferredActivity`, `WRITE_SECURE_SETTINGS`, supresión de barra MIUI vía `policy_control` immersive). Toda modificación de esa superficie requiere HITL: el riesgo es romper un kiosco funcional, no "activarlo".
2. Añadir dependencias Gradle o subir versiones (AGP, Kotlin, BOM de Firebase, cualquier librería).
3. Borrar o vaciar DbHelpers (`ZentryDbHelper`, `ZentryClockDbHelper`, `WorldGeneratorDbHelper`, `NeuroArtDbHelper`) o sus esquemas.
4. Tocar `local.properties`, keystores, claves API o `google-services.json`; escribir secretos en cualquier archivo del workspace.
5. Usar `AccessibilityService` para monitoreo o control parental. Solo se permite como recurso de interfaz de sistema (`ZentryNavAccessibilityService`: barra de navegación propia). El uso para observar/restringir al menor infringe políticas de Google Play y Android 17+.

## ✅ Checklist anti-regresión (features demo — NUNCA pueden romperse)

Fuente única: `CANON §4`. Antes de dar por terminada cualquier tarea, verificar en el Redmi 9 físico que siguen funcionando sin crashes:

1. Launcher Home (fondo iridiscente + widgets de reloj)
2. Gesto de dos dedos (pinch para personalización)
3. Temporizador circadiano (colores adaptativos según la hora)
4. Chat del Tutor IA (incluido el fallback offline)
5. Calculadora (operaciones básicas)
6. Cámara (captura foto/video con CameraX)
7. Reloj / Alarmas (guardado en SQLite local)
8. Calendario escolar (gestión básica de eventos)
9. Explorador de archivos (acceso seguro a fotos)
10. Google Workspace (Slides/Docs/Sheets instalados y lanzables desde el launcher — se controlan las apps oficiales, NO se clonan)
11. Study Assistant (chat socrático MINEDU)
12. Navegación fluida con `AnimatedContent` + barra de navegación de sistema global


Si una tarea rompe cualquiera de las 12: revertir el cambio y reportar. La regresión nunca se "arregla después".

## 🚨 Triggers de escalada inmediata a humano

- Spec ambigua o con criterios de aceptación incompletos o contradictorios.
- Cuota de modelo baja (no quemar el resto en reintentos).
- La tarea requiere tocar una superficie sensible: `AndroidManifest`/permisos Device Owner, dependencias Gradle, claves o secretos.

## 🏁 Definition of Done

Una tarea está terminada solo si: (1) el proyecto compila (`assembleDebug` verde), (2) existe Walkthrough del cambio, (3) todos los criterios de aceptación de la spec están verificados uno a uno, (4) el checklist anti-regresión de `CANON §4` pasó completo.
```

---

## 🔗 Cableado

| Contrato | Documento |
|---|---|
| Reglas duras de producto (secretos, HITL Manifest/DO, Gradle, build) | [CANON.md §5](../CANON.md) |
| Checklist anti-regresión de 12 features (fuente única) | [CANON.md §4](../CANON.md) |
| Device Owner activo + AccessibilityService acotado | [CANON.md §3A](../CANON.md) · [02/control-dispositivo-abm.md](../02-arquitectura-tecnica/control-dispositivo-abm.md) |
| Procedimiento del bucle de compilación y formato del reporte de HARD STOP | [loop-engineering.md](./loop-engineering.md) → `verificacion-build.md` |
| Ciclo de artifacts que envuelve estas reglas | [agents-md-workspace.md](./agents-md-workspace.md) |
