---
description: >
  Audita la seguridad del frontend: dependencias vulnerables (npm audit),
  cabeceras HTTP de seguridad, patrones de riesgo XSS, y secretos filtrados
  en el código. Úsala antes de un deploy, después de agregar una dependencia
  nueva, al modificar server.ts, cuando el código maneje input de usuario o
  use bypassSecurityTrust*/innerHTML, o cuando pidan revisar/auditar
  seguridad, buscar vulnerabilidades, o revisar secretos filtrados.
---

# Auditoría de seguridad (frontend)

## Cuándo usar esto

- Antes de hacer un deploy
- Después de agregar una dependencia nueva (`npm install ...`)
- Al modificar `server.ts` (servidor SSR)
- Al escribir código que use `[innerHTML]`, `bypassSecurityTrust*`, o maneje input de usuario
- Cuando se pide explícitamente revisar seguridad / vulnerabilidades / secretos

## 1. Dependencias vulnerables

```
npm audit
```

Agrupa por severidad. Para cada hallazgo:

- Si `npm audit fix` lo resuelve sin romper nada → repórtalo como "seguro de arreglar"
- Si necesita `--force` (cambio de versión mayor) → repórtalo aparte, indicando qué versión
  instalaría y qué podría romper. **No lo apliques sin confirmar** con quien pidió el trabajo.

## 2. Cabeceras de seguridad HTTP

Solo se puede probar contra el servidor SSR real — el dev server no pasa por `server.ts`:

1. `npm run build:perf` (build con la configuración `local-test`, ver skill `perf-audit`)
2. `npm run serve:ssr:frontend`
3. `node ${CLAUDE_SKILL_DIR}/scripts/headers-check.mjs` (o `npm run headers` desde `frontend/`)
4. Apaga el servidor al terminar

El script verifica la presencia de: `Content-Security-Policy`, `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. Hoy no hay ninguna configurada, así
que un primer reporte con todas "FALTA" es el resultado esperado — no es un bug del script.

## 3. Patrones de riesgo XSS

Búsqueda de código, sin script — usa Grep directamente sobre `src/`:

- `[innerHTML]` en templates
- `bypassSecurityTrustHtml`, `bypassSecurityTrustScript`, `bypassSecurityTrustStyle`,
  `bypassSecurityTrustUrl`, `bypassSecurityTrustResourceUrl`

Para cada resultado, evalúa si el contenido marcado como "seguro" realmente viene de una fuente
confiable (nunca de input de usuario sin sanitizar antes).

## 4. Secretos filtrados en el código

```
npm run secrets
```

(equivalente a `npx secretlint "**/*"`, usando `frontend/.secretlintrc.json`). Respeta
`.gitignore` automáticamente — no escanea `node_modules/` ni `dist/`. Los valores encontrados
se enmascaran en el reporte por defecto.

Si encuentra algo, **no lo repares automáticamente** — podría ser necesario rotar la
credencial además de borrarla del código. Repórtalo y confirma con quien pidió el trabajo.

## Al reportar resultados

Agrupa por las 4 categorías. Para cada hallazgo indica severidad/riesgo real y si aplica una
corrección segura o requiere una decisión explícita antes de tocar nada.

## Al terminar

Si hay vulnerabilidades altas sin arreglo seguro, secretos reales encontrados, o patrones XSS
sin justificar, no des la tarea original por completada sin corregirlo o confirmarlo
explícitamente con quien pidió el trabajo.
