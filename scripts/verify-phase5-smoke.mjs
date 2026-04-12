import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['scripts/verify-phase5.mjs'],
  { cwd: process.cwd(), stdio: 'inherit', env: { ...process.env, VERIFY_PHASE5_PROFILE: 'smoke' } },
);

process.exit(result.status ?? (result.error ? 1 : 0));
