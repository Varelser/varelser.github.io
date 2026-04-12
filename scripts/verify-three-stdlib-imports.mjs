import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const targets = ['components', 'lib'];
const offenders = [];

const allowedRootImportFiles = new Set([
  'components/AppOrbitControls.tsx',
  'components/AppScene.tsx',
  'components/AppSceneCameraPathController.tsx',
  'components/AppSceneCameraRig.tsx',
]);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(absolute);
      continue;
    }
    if (!/\.(ts|tsx|mts|cts)$/.test(entry.name)) continue;
    const relative = path.relative(rootDir, absolute).replaceAll('\\', '/');
    const raw = fs.readFileSync(absolute, 'utf8');
    const matches = raw.match(/from\s+['"]three-stdlib['"]/g) || [];
    if (matches.length === 0) continue;
    if (!allowedRootImportFiles.has(relative)) {
      offenders.push(`${relative} :: root three-stdlib import not allowed`);
    }
  }
}

for (const target of targets) {
  const absolute = path.resolve(rootDir, target);
  if (fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()) walk(absolute);
}

if (offenders.length > 0) {
  console.log(`[verify-three-stdlib-imports] offenders=${offenders.length}`);
  for (const offender of offenders) console.log(`- ${offender}`);
  process.exit(1);
}

console.log('[verify-three-stdlib-imports] 0 offenders');
