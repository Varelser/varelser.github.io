import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};

const sourceDirArg = getArgValue('--source-dir') || 'exports/intel-mac-live-browser-proof-drop';
const browserExecutablePath = getArgValue('--browser-executable-path');
const bundlePathArg = getArgValue('--bundle-path');
const writeArg = getArgValue('--write') || 'docs/archive/intel-mac-live-browser-proof-host-ingest.json';
const writePath = path.resolve(rootDir, writeArg);
const keepBundle = hasFlag('--keep-bundle');
const strict = hasFlag('--strict');
const skipExtract = hasFlag('--skip-extract');
const skipFinalize = hasFlag('--skip-finalize');

const commandLog = [];
const run = (label, command, commandArgs, allowFailure = false) => {
  const result = spawnSync(command, commandArgs, { cwd: rootDir, stdio: 'inherit' });
  const status = result.status ?? 1;
  commandLog.push({ label, command, args: commandArgs, status });
  if (!allowFailure && status !== 0) {
    console.error(`[run-intel-mac-live-browser-proof-host-ingest] failed: ${label}`);
    process.exit(status);
  }
  return status;
};

if (!skipExtract) {
  const extractArgs = [
    'scripts/extract-intel-mac-live-browser-proof-bundle.mjs',
    '--source-dir', sourceDirArg,
    '--write', 'docs/archive/intel-mac-live-browser-proof-bundle-extract.json',
  ];
  if (bundlePathArg) extractArgs.push('--bundle-path', bundlePathArg);
  if (keepBundle) extractArgs.push('--keep-bundle');
  run('extract:intel-mac-live-browser-proof-bundle', process.execPath, extractArgs);
}

if (!skipFinalize) {
  const finalizeArgs = [
    'scripts/finalize-intel-mac-live-browser-proof.mjs',
    '--source-dir', sourceDirArg,
    '--write', 'docs/archive/intel-mac-live-browser-proof-finalize.json',
  ];
  if (browserExecutablePath) finalizeArgs.push('--browser-executable-path', browserExecutablePath);
  if (strict) finalizeArgs.push('--strict');
  run('finalize:intel-mac-live-browser-proof', process.execPath, finalizeArgs);
}

const report = {
  generatedAt: new Date().toISOString(),
  sourceDir: sourceDirArg,
  bundlePath: bundlePathArg || null,
  browserExecutablePath: browserExecutablePath || null,
  skipExtract,
  skipFinalize,
  keepBundle,
  strict,
  commands: commandLog,
  nextStep: skipFinalize
    ? 'bundle extraction completed or skipped; run finalize when proof artifacts are ready'
    : 'host ingest completed; review docs/archive/intel-mac-live-browser-proof-status.md',
};

fs.mkdirSync(path.dirname(writePath), { recursive: true });
fs.writeFileSync(writePath, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(`[run-intel-mac-live-browser-proof-host-ingest] steps=${commandLog.length} skipExtract=${skipExtract} skipFinalize=${skipFinalize}`);
