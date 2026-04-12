import path from 'node:path';
import { loadPackageJson, writeJson } from './packageIntegrityShared.mjs';
import {
  buildHostRuntimeChecks,
  formatHostDescriptor,
  printHostRuntimeSummary,
  summarizeHostRuntimeChecks,
} from './hostRuntimeShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};

const strict = hasFlag('--strict');
const writeArg = getArgValue('--write');
const writePath = writeArg ? path.resolve(rootDir, writeArg) : null;
const targetHost = {
  platform: getArgValue('--platform') || process.platform,
  arch: getArgValue('--arch') || process.arch,
  libc: getArgValue('--libc') || null,
};
if (targetHost.platform !== 'linux') targetHost.libc = null;

const packageJson = loadPackageJson(rootDir);
const runtime = buildHostRuntimeChecks(rootDir, packageJson, targetHost);
const summary = summarizeHostRuntimeChecks(runtime.checks);
const report = {
  generatedAt: new Date().toISOString(),
  rootDir,
  targetHost,
  targetHostLabel: formatHostDescriptor(targetHost),
  summary,
  checks: runtime.checks,
};

if (writePath) writeJson(writePath, report);
printHostRuntimeSummary('[verify-target-host-runtime]', targetHost, summary);
if (summary.failed > 0) {
  console.log('[verify-target-host-runtime] recommended next steps:');
  console.log('- on the target host, run npm install --include=optional');
  console.log('- rerun npm run build and npm run verify:host-runtime on the target host');
}
if (strict && summary.failed > 0) process.exit(1);
