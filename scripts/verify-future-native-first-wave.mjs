import { spawnSync } from 'node:child_process';

const ids = ['pbd-rope', 'mpm-granular', 'fracture-lattice', 'volumetric-density-transport'];
for (const id of ids) {
  const result = spawnSync(process.execPath, ['scripts/verify-future-native-family.mjs', id], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
console.log(`PASS future-native-first-wave (${ids.join(', ')})`);
