import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from 'playwright';

// Default port matches the SSR server started by "npm run serve:ssr:frontend"
// (dist/frontend/server/server.mjs), not the dev server (4200).
const BASE_URL = process.env.PERF_BASE_URL ?? 'http://localhost:4000';

// Add each route here as pages get created (see src/app/app.routes.ts).
// e.g. ['/', '/projects', '/project-detail/1', '/contact']
const ROUTES = ['/'];

const CATEGORIES = ['performance', 'seo', 'best-practices'];
const PERFORMANCE_THRESHOLD = 90;

async function launchChrome() {
  // Reuse the Chromium binary Playwright already downloaded for a11y-audit
  // instead of requiring a second browser install.
  return chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new'],
  });
}

async function auditRoute(port, route) {
  const url = `${BASE_URL}${route}`;
  const result = await lighthouse(url, { port, onlyCategories: CATEGORIES });
  if (!result) {
    throw new Error('Lighthouse no devolvió resultado (¿la URL es alcanzable?)');
  }
  return result.lhr;
}

function reportRoute(route, lhr) {
  console.log(`\n=== ${route} ===`);

  const scores = {
    Performance: Math.round(lhr.categories.performance.score * 100),
    SEO: Math.round(lhr.categories.seo.score * 100),
    'Best Practices': Math.round(lhr.categories['best-practices'].score * 100),
  };

  for (const [name, score] of Object.entries(scores)) {
    console.log(`  ${name}: ${score}`);
  }

  const audits = lhr.audits;
  console.log(`  LCP: ${audits['largest-contentful-paint']?.displayValue ?? 'n/a'}`);
  console.log(`  CLS: ${audits['cumulative-layout-shift']?.displayValue ?? 'n/a'}`);
  console.log(`  TBT: ${audits['total-blocking-time']?.displayValue ?? 'n/a'}`);

  const opportunities = Object.values(audits).filter(
    (audit) => audit.details?.type === 'opportunity' && typeof audit.score === 'number' && audit.score < 1,
  );

  if (opportunities.length > 0) {
    console.log('\n  Oportunidades de mejora:');
    for (const audit of opportunities) {
      console.log(`    - ${audit.title}`);
    }
  }

  return scores.Performance;
}

async function main() {
  const chrome = await launchChrome();

  let belowThreshold = false;
  let hadError = false;

  try {
    for (const route of ROUTES) {
      try {
        const lhr = await auditRoute(chrome.port, route);
        const performanceScore = reportRoute(route, lhr);
        if (performanceScore < PERFORMANCE_THRESHOLD) {
          belowThreshold = true;
        }
      } catch (error) {
        hadError = true;
        console.error(`\n=== ${route} ===`);
        console.error(`  Error al escanear: ${error.message}`);
        if (error.message.includes('ECONNREFUSED') || error.message.includes('net::ERR_CONNECTION_REFUSED')) {
          console.error(
            `  ¿Está corriendo el build de producción en ${BASE_URL}? Corre "npm run build && npm run serve:ssr:frontend" primero.`,
          );
        }
      }
    }
  } finally {
    // chrome-launcher's temp-dir cleanup can EPERM on Windows if the OS hasn't
    // released the file handle yet — the audit result is already collected by
    // this point, so a cleanup failure shouldn't fail the whole run.
    try {
      await chrome.kill();
    } catch (error) {
      console.error(`\n(aviso: no se pudo limpiar el proceso de Chrome: ${error.message})`);
    }
  }

  console.log('\n=== Resumen ===');
  console.log(`Rutas escaneadas: ${ROUTES.length}`);
  console.log(`Umbral de Performance: ${PERFORMANCE_THRESHOLD}`);

  if (hadError || belowThreshold) {
    process.exitCode = 1;
  }
}

main();
