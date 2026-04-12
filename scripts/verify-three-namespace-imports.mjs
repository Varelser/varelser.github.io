import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const targets = ['components', 'lib'];
const offenders = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(absolute);
      continue;
    }
    if (!/\.(ts|tsx|mts|cts)$/.test(entry.name)) continue;
    const raw = fs.readFileSync(absolute, 'utf8');
    const regex = /import\s+\*\s+as\s+THREE\s+from\s+['"]three['"]/g;
    if (regex.test(raw)) offenders.push(path.relative(rootDir, absolute));
  }
}

for (const target of targets) {
  const absolute = path.resolve(rootDir, target);
  if (fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()) walk(absolute);
}

if (offenders.length > 0) {
  console.log(`[verify-three-namespace-imports] offenders=${offenders.length}`);
  for (const offender of offenders) console.log(`- ${offender}`);
  process.exit(1);
}

console.log('[verify-three-namespace-imports] 0 offenders');
