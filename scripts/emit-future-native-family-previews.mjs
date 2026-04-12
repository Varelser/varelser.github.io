import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['scripts/run-ts-entry.mjs', 'scripts/emit-future-native-family-previews-entry.ts', ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 1);
