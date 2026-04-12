import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['scripts/run-ts-entry.mjs', 'scripts/verify-audio-legacy-runtime-retirement-entry.ts', ...process.argv.slice(2)],
  { stdio: 'inherit' },
);

if (typeof result.status === 'number' && result.status !== 0) {
  process.exit(result.status);
}
if (result.error) {
  throw result.error;
}
