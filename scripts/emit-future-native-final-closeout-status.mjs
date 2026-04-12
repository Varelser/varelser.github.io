import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['scripts/run-ts-entry.mjs', 'scripts/emit-future-native-final-closeout-status-entry.ts', ...process.argv.slice(2)],
  { stdio: 'inherit' },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
