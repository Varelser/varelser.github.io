import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['scripts/run-ts-entry.mjs', 'scripts/verify-future-native-expression-coverage-entry.ts', ...process.argv.slice(2)],
  { stdio: 'inherit' },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
