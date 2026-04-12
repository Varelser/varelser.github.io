import path from 'node:path';
import {
  buildRepoChecks,
  buildZipChecks,
  loadPackageJson,
  summarizeChecks,
  writeJson,
} from './packageIntegrityShared.mjs';
import {
  buildHostRuntimeChecks,
  summarizeHostRuntimeChecks,
} from './hostRuntimeShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const hasFlag = (flag) => args.includes(flag);

const zipPath = getArgValue('--zip');
const strict = hasFlag('--strict');
const writePathArg = getArgValue('--write');
const writePath = writePathArg ? path.resolve(rootDir, writePathArg) : null;
const packageJson = loadPackageJson(rootDir);

const repoChecks = buildRepoChecks(rootDir, packageJson);
const repoSummary = summarizeChecks(repoChecks);
const zipReport = zipPath ? buildZipChecks(path.resolve(rootDir, zipPath), packageJson) : null;
const zipSummary = zipReport ? summarizeChecks(zipReport.checks) : null;

const hostRuntime = buildHostRuntimeChecks(rootDir, packageJson);
const hostRuntimeSummary = summarizeHostRuntimeChecks(hostRuntime.checks);

const report = {
  generatedAt: new Date().toISOString(),
  rootDir,
  repo: {
    summary: repoSummary,
    checks: repoChecks,
  },
  hostRuntime: {
    host: hostRuntime.host,
    summary: hostRuntimeSummary,
    checks: hostRuntime.checks,
  },
  zip: zipReport ? {
    path: zipReport.zipPath,
    rootPrefix: zipReport.rootPrefix,
    entryCount: zipReport.entryCount,
    structureOk: zipReport.structure.ok,
    structureStdoutTail: zipReport.structure.stdout.split(/\r?\n/).slice(-5),
    structureStderr: zipReport.structure.stderr,
    entryError: zipReport.entryError,
    summary: zipSummary,
    checks: zipReport.checks,
  } : null,
};

if (writePath) {
  writeJson(writePath, report);
}

const repoLine = `repo ${repoSummary.passed}/${repoSummary.total} ok`;
const zipLine = zipSummary
  ? `zip ${zipSummary.passed}/${zipSummary.total} ok${zipReport?.structure.ok ? '' : ' (structure failed)'}`
  : 'zip not checked';
const hostLine = `host-runtime ${hostRuntimeSummary.passed}/${hostRuntimeSummary.total} ok`;
console.log(`[verify-package-integrity] ${repoLine}; ${zipLine}; ${hostLine}`);
if (repoSummary.failed > 0) {
  console.log('[verify-package-integrity] missing in repo:');
  for (const item of repoSummary.missingTargets) console.log(`- ${item.kind}: ${item.target}`);
}
if (zipSummary?.failed) {
  console.log('[verify-package-integrity] missing in zip:');
  for (const item of zipSummary.missingTargets) console.log(`- ${item.kind}: ${item.target}`);
}
if (zipReport && !zipReport.structure.ok) {
  console.log('[verify-package-integrity] zip structure test failed.');
}
if (hostRuntimeSummary.failed > 0) {
  console.log('[verify-package-integrity] host runtime gaps:');
  for (const item of hostRuntimeSummary.missingTargets) console.log(`- ${item.runtime ?? item.kind}: ${item.target}`);
}

if (strict) {
  const hasFailure = repoSummary.failed > 0 || (zipReport && (!zipReport.structure.ok || (zipSummary?.failed ?? 0) > 0));
  if (hasFailure) process.exit(1);
}
