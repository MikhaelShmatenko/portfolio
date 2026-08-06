---
description: >
  Audita el rendimiento (Core Web Vitals / Lighthouse) y el tamaño del bundle
  del portfolio. Úsala antes de un deploy, después de agregar una dependencia
  o asset pesado, o cuando pidan revisar/medir performance, correr Lighthouse,
  o revisar el tamaño del bundle.
---

# Auditoría de performance

## Cuándo usar esto

- Antes de hacer un deploy
- Después de agregar una dependencia nueva o un asset pesado (imágenes, fuentes, librerías)
- Cuando se pide explícitamente medir rendimiento / correr Lighthouse / revisar el bundle

## Tamaño del bundle (ya cubierto por Angular)

Corre el build de producción y revisa los warnings:

```
npm run build
```

Los budgets ya están configurados en `angular.json` (bundle inicial: 500kB warning / 1MB error;
estilos por componente: 4kB warning / 8kB error). Si el build reporta un warning o error de
budget, repórtalo — no hace falta ninguna herramienta adicional para esto.

## Core Web Vitals (Lighthouse)

Lighthouse debe correr contra el **build de producción servido**, no el dev server — el dev
server no está optimizado y daría números artificialmente malos.

1. Build para pruebas locales: `npm run build:perf` (**no** uses `npm run build` a secas para
   esto — ver nota de seguridad abajo)
2. Sirve el build: `npm run serve:ssr:frontend` (queda en `http://localhost:4000`)
3. Corre `node ${CLAUDE_SKILL_DIR}/scripts/scan.mjs` (o `npm run perf` desde `frontend/`)
4. El script reutiliza el Chromium ya instalado por Playwright (`a11y-audit`) para lanzar
   Lighthouse, visita cada ruta configurada, y devuelve: LCP, CLS, TBT, y los scores de
   Performance/SEO/Best Practices
5. Apaga el servidor de producción al terminar

**Nota de seguridad — por qué existe `build:perf`**: el servidor SSR rechaza (400) cualquier
`Host` header no listado en `security.allowedHosts` de `angular.json` (protección contra Host
header injection / DNS rebinding). La configuración `production` real mantiene esa lista vacía
(o con el dominio real, cuando se defina) — nunca se le agregó `localhost` ahí para no
debilitar lo que se despliega. En su lugar, `angular.json` tiene una configuración adicional
`local-test` que solo agrega `localhost` al allowlist, y `npm run build:perf` la compone junto
con `production` (`ng build --configuration production,local-test`). El build que realmente se
despliega (`npm run build`, sin `local-test`) nunca incluye `localhost`.

**Nota**: igual que en `a11y-audit`, `app.routes.ts` todavía no tiene páginas definidas. El
script solo escanea `/` por defecto — agrega cada ruta nueva a la lista `ROUTES` en
`scripts/scan.mjs` a medida que se creen páginas.

## Al reportar resultados

- Muestra LCP, CLS y TBT por ruta, y el score general de Performance
- Señala las oportunidades que Lighthouse identifique (imágenes sin optimizar, JS sin usar,
  etc.) con el componente probablemente responsable
- Si el bundle superó el budget, indica qué build lo reportó y por cuánto

## Al terminar

Si Performance cae por debajo de un umbral razonable (ej. score < 90) o hay un error de
budget, no des la tarea original por completada hasta corregirlo o confirmarlo explícitamente
con quien pidió el trabajo.
