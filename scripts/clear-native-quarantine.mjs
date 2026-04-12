import path from 'node:path';
import { clearNativeQuarantine } from './nativeQuarantineShared.mjs';

const ROOT_DIR = process.cwd();
const result = clearNativeQuarantine(ROOT_DIR);

if (!result.supported) {
  process.stdout.write('[native-quarantine] unsupported on this host\n');
  process.exit(0);
}

if (result.quarantinedFiles.length === 0) {
  process.stdout.write('[native-quarantine] no quarantined native binaries found\n');
  process.exit(0);
}

for (const filePath of result.clearedFiles) {
  process.stdout.write(`[native-quarantine] cleared ${path.relative(ROOT_DIR, filePath)}\n`);
}
for (const failure of result.failedFiles) {
  process.stderr.write(`[native-quarantine] failed ${path.relative(ROOT_DIR, failure.filePath)}\n`);
  if (failure.stderr) {
    process.stderr.write(failure.stderr);
    if (!failure.stderr.endsWith('\n')) process.stderr.write('\n');
  }
}

process.stdout.write(`[native-quarantine] cleared ${result.clearedCount}/${result.quarantinedFiles.length}\n`);
if (result.failedCount > 0) {
  process.exit(1);
}
