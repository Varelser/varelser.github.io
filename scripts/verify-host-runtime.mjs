import path from 'node:path';
import { loadPackageJson, writeJson } from './packageIntegrityShared.mjs';
import {
  buildHostRuntimeChecks,
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

const packageJson = loadPackageJson(rootDir);
const hostRuntime = buildHostRuntimeChecks(rootDir, packageJson);
const summary = summarizeHostRuntimeChecks(hostRuntime.checks);
const report = {
  generatedAt: new Date().toISOString(),
  rootDir,
  host: hostRuntime.host,
  summary,
  checks: hostRuntime.checks,
};

if (writePath) writeJson(writePath, report);
printHostRuntimeSummary('[verify-host-runtime]', hostRuntime.host, summary);

if (summary.failed > 0) {
  console.log('[verify-host-runtime] recommended next steps:');
  console.log('- run npm install on the target host to refresh host-native optional packages');
  console.log('- rerun npm run verify:host-runtime and npm run build');
}

if (strict && summary.failed > 0) process.exit(1);
