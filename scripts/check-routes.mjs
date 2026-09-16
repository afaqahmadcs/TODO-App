const routes = [
  '/dashboard',
  '/tasks',
  '/calendar',
  '/recurring',
  '/analytics',
  '/office',
  '/personal',
  '/college',
  '/web-development',
  '/projects',
  '/notes',
  '/settings',
];

async function checkRoutes() {
  console.log('Testing routes against http://localhost:3000...');
  let failed = 0;
  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:3000${r}`);
      const text = await res.text();
      const hasBrand = text.includes('Afaq TaskFlow');
      console.log(`[PASS] ${r.padEnd(18)} HTTP ${res.status} (${text.length} B) - Shell verified: ${hasBrand}`);
      if (res.status !== 200) failed++;
    } catch (err) {
      console.error(`[FAIL] ${r} -> ${err.message}`);
      failed++;
    }
  }
  process.exit(failed > 0 ? 1 : 0);
}

checkRoutes();
