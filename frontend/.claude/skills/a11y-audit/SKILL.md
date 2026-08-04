---
description: >
  Audita la accesibilidad (WCAG AA / axe-core) de las rutas del portfolio.
  Úsala cuando se termine una página o componente con UI nueva, antes de un
  deploy, o cuando pidan revisar/verificar accesibilidad, cumplimiento WCAG,
  o correr un chequeo AXE.
---

# Auditoría de accesibilidad

## Cuándo usar esto

- Se acaba de crear o modificar una página, formulario, o componente interactivo
- Antes de hacer un deploy
- Cuando se pide explícitamente revisar accesibilidad / WCAG / AXE

## Cómo correr el escaneo

1. Asegúrate de que el dev server esté corriendo (`npm start`, sirve en `http://localhost:4200` por defecto)
2. Corre `node ${CLAUDE_SKILL_DIR}/scripts/scan.mjs` (o `npm run a11y` desde `frontend/`)
3. El script visita cada ruta configurada, corre axe-core, y devuelve las violaciones agrupadas por severidad (critical / serious / moderate / minor), con el elemento afectado, el criterio WCAG incumplido y una descripción

**Nota**: `app.routes.ts` todavía no tiene páginas definidas. El script solo escanea `/` por defecto — agrega cada ruta nueva a la lista `ROUTES` en `scripts/scan.mjs` a medida que se creen páginas (home, projects, project-detail, contact, etc.).

## Al reportar resultados

- Agrupa por severidad, empezando por critical/serious
- Señala el componente probablemente responsable (según el selector del DOM)
- Propón el fix siguiendo las convenciones de CLAUDE.md (ej. `class` bindings, no `ngClass`; ARIA solo si no hay alternativa semántica nativa)

## Checklist manual (axe no lo detecta todo)

axe-core solo detecta ~30-50% de los problemas reales de accesibilidad. Complementa el escaneo con:

- Navegación completa por teclado — ¿todo es alcanzable? ¿el orden de foco tiene sentido?
- Estados de foco visibles en elementos interactivos
- Si hay animaciones GSAP: confirmar que respetan `prefers-reduced-motion` (ya es requisito en CLAUDE.md, pero axe no puede verificarlo)
- Contraste de color en estados hover/focus (axe solo evalúa el estado inicial)

## Al terminar

Si hay violaciones critical/serious, no des la tarea original por completada hasta corregirlas o confirmarlo explícitamente con quien pidió el trabajo.
