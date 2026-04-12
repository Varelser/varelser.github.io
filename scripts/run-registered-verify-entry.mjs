import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getVerifyEntryPath } from './verify-entry-registry.mjs';

function normalizeRegistryId(input) {
  return path.basename(input).replace(/\.mjs$/i, '');
}

export function runRegisteredVerifyEntry(rawId, forwardedArgs = []) {
  const registryId = normalizeRegistryId(rawId);
  const entryPath = getVerifyEntryPath(registryId);
  if (!entryPath) {
    console.error(`[verify-entry-registry] Unknown verify entry: ${rawId}`);
    process.exit(1);
  }
  const result = spawnSync(
    process.execPath,
    ['scripts/run-ts-entry.mjs', entryPath, ...forwardedArgs],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const registryId = process.argv[2];
  if (!registryId) {
    console.error('Usage: node scripts/run-registered-verify-entry.mjs <verify-id> [args...]');
    process.exit(1);
  }
  runRegisteredVerifyEntry(registryId, process.argv.slice(3));
}
