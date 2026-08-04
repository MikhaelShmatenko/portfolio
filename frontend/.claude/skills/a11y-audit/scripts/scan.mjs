import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const BASE_URL = process.env.A11Y_BASE_URL ?? 'http://localhost:4200';

// Add each route here as pages get created (see src/app/app.routes.ts).
// e.g. ['/', '/projects', '/project-detail/1', '/contact']
const ROUTES = ['/'];

const SEVERITY_ORDER = ['critical', 'serious', 'moderate', 'minor'];

async function scanRoute(page, route) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
  return new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
}

function groupBySeverity(violations) {
  const groups = { critical: [], serious: [], moderate: [], minor: [], unknown: [] };
  for (const violation of violations) {
    const key = violation.impact ?? 'unknown';
    (groups[key] ?? groups.unknown).push(violation);
  }
  return groups;
}

function reportRoute(route, violations) {
  console.log(`\n=== ${route} ===`);

  if (violations.length === 0) {
    console.log('  Sin violaciones detectadas');
    return;
  }

  const bySeverity = groupBySeverity(violations);

  for (const severity of SEVERITY_ORDER) {
    const items = bySeverity[severity];
    if (!items.length) continue;

    console.log(`\n  ${severity.toUpperCase()} (${items.length})`);
    for (const violation of items) {
      const wcagTags = violation.tags.filter((tag) => tag.startsWith('wcag')).join(', ');
      console.log(`    [${violation.id}] ${violation.help}`);
      console.log(`    WCAG: ${wcagTags || 'n/a'}`);
      for (const node of violation.nodes) {
        console.log(`    Selector: ${node.target.join(' ')}`);
      }
    }
  }
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  let totalViolations = 0;
  let hadError = false;

  for (const route of ROUTES) {
    try {
      const results = await scanRoute(page, route);
      totalViolations += results.violations.length;
      reportRoute(route, results.violations);
    } catch (error) {
      hadError = true;
      console.error(`\n=== ${route} ===`);
      console.error(`  Error al escanear: ${error.message}`);
      if (error.message.includes('ECONNREFUSED') || error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        console.error(`  ¿Está corriendo el dev server en ${BASE_URL}? Corre "npm start" primero.`);
      }
    }
  }

  await browser.close();

  console.log('\n=== Resumen ===');
  console.log(`Rutas escaneadas: ${ROUTES.length}`);
  console.log(`Violaciones totales: ${totalViolations}`);

  if (hadError || totalViolations > 0) {
    process.exitCode = 1;
  }
}

main();
