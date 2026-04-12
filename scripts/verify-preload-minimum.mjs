import fs from 'node:fs';
import { collectBuildOutputPaths } from './buildOutputShared.mjs';

const { outDir, indexHtmlPath: indexPath } = collectBuildOutputPaths(process.cwd(), { fallback: 'dist' });
if (!fs.existsSync(indexPath)) {
  console.error(`[verify-preload-minimum] ${indexPath} not found (resolved outDir: ${outDir})`);
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');
const hrefs = [...html.matchAll(/modulepreload" href="([^"]+)"/g)].map((m) => m[1]);
const allowed = [/react-vendor-/];
const forbidden = [
  /starter-library-/, /scene-runtime-/, /scene-families-core/, /scene-family-/, /scene-gpgpu/,
  /ui-control-panel/, /scene-postfx/, /projectState/, /scene-future-native/
];
const bad = hrefs.filter((href) => !allowed.some((re) => re.test(href)) || forbidden.some((re) => re.test(href)));
if (bad.length > 0) {
  console.error('[verify-preload-minimum] unexpected preload entries:');
  for (const entry of bad) console.error(` - ${entry}`);
  process.exit(1);
}
console.log(`[verify-preload-minimum] ok (${hrefs.length} entries)`);
for (const entry of hrefs) console.log(` - ${entry}`);
