import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['scripts/run-ts-entry.mjs', 'scripts/verify-stored-auto-fix-preview-entry.ts', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
