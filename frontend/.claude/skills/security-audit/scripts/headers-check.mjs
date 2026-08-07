// Default port matches the SSR server started by "npm run serve:ssr:frontend"
// (dist/frontend/server/server.mjs), not the dev server (4200). Security
// headers are set in server.ts, which the Vite dev server never runs through.
const BASE_URL = process.env.SECURITY_BASE_URL ?? 'http://localhost:4000';

const EXPECTED_HEADERS = [
  'content-security-policy',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
];

async function main() {
  const url = `${BASE_URL}/`;
  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    console.error(`Error al conectar con ${url}: ${error.message}`);
    console.error(
      '¿Está corriendo el servidor SSR? Corre "npm run build:perf && npm run serve:ssr:frontend" primero.',
    );
    process.exitCode = 1;
    return;
  }

  console.log(`\n=== Cabeceras de seguridad — ${url} ===\n`);

  let missing = 0;
  for (const header of EXPECTED_HEADERS) {
    const value = response.headers.get(header);
    if (value) {
      console.log(`  OK     ${header}: ${value}`);
    } else {
      console.log(`  FALTA  ${header}`);
      missing++;
    }
  }

  console.log('\n=== Resumen ===');
  console.log(`Cabeceras presentes: ${EXPECTED_HEADERS.length - missing}/${EXPECTED_HEADERS.length}`);

  if (missing > 0) {
    process.exitCode = 1;
  }
}

main();
