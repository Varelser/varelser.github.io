import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['scripts/run-ts-entry.mjs', 'scripts/verify-audio-legacy-closeout-defaults-entry.ts', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
