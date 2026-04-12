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

const strict = hasFlag('--strict');
const browserExecutablePath = getArgValue('--browser-executable-path');
const sourceDirArg = getArgValue('--source-dir') || 'exports/intel-mac-live-browser-proof-drop';
const writeArg = getArgValue('--write') || 'docs/archive/intel-mac-live-browser-proof-finalize.json';
const writePath = path.resolve(rootDir, writeArg);

const commandLog = [];
const run = (label, command, commandArgs, allowFailure = false) => {
  const result = spawnSync(command, commandArgs, { cwd: rootDir, stdio: 'inherit' });
  const status = result.status ?? 1;
  commandLog.push({ label, command, args: commandArgs, status });
  if (!allowFailure && status !== 0) {
    console.error(`[finalize-intel-mac-live-browser-proof] failed: ${label}`);
    process.exit(status);
  }
  return status;
};

run('draft:intel-mac-live-browser-proof-summary', process.execPath, [
  'scripts/draft-intel-mac-live-browser-proof-summary.mjs',
  '--source-dir', sourceDirArg,
  ...(browserExecutablePath ? ['--browser-executable-path', browserExecutablePath] : []),
]);

run('verify:intel-mac-live-browser-proof-drop', process.execPath, [
  'scripts/verify-intel-mac-live-browser-proof-drop.mjs',
  '--source-dir', sourceDirArg,
  '--strict',
  '--write', 'docs/archive/intel-mac-live-browser-proof-drop-check.json',
]);

const ingestArgs = [
  'scripts/ingest-intel-mac-live-browser-proof.mjs',
  '--source-dir', sourceDirArg,
  '--write', 'docs/archive/intel-mac-live-browser-proof-ingest.json',
];
if (browserExecutablePath) ingestArgs.push('--browser-executable-path', browserExecutablePath);
if (strict) ingestArgs.push('--strict');
run('ingest:intel-mac-live-browser-proof', process.execPath, ingestArgs);

run('inspect:intel-mac-live-browser-readiness', process.execPath, [
  'scripts/verify-target-live-browser-readiness.mjs',
  '--platform', 'darwin',
  '--arch', 'x64',
  '--home-dir', process.env.HOME || '~',
  '--write', 'docs/archive/target-live-browser-readiness-intel-mac.json',
  ...(browserExecutablePath ? ['--browser-executable-path', browserExecutablePath] : []),
  ...(strict ? ['--strict'] : []),
]);

run('doctor-package-handoff', process.execPath, [
  'scripts/doctor-package-handoff.mjs',
  '--write', 'docs/archive/package-handoff-doctor.json',
]);
run('doctor:intel-mac-live-browser-proof', process.execPath, [
  'scripts/doctor-intel-mac-live-browser-proof.mjs',
  '--write', 'docs/archive/intel-mac-live-browser-proof-doctor.json',
]);
run('generate:intel-mac-live-browser-proof-projection-report', process.execPath, [
  'scripts/generate-intel-mac-live-browser-proof-projection-report.mjs',
  '--write-json', 'docs/archive/intel-mac-live-browser-proof-projection.json',
  '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-projection.md',
]);
run('generate:intel-mac-live-browser-proof-status-report', process.execPath, [
  'scripts/generate-intel-mac-live-browser-proof-status-report.mjs',
  '--write-json', 'docs/archive/intel-mac-live-browser-proof-status.json',
  '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-status.md',
]);
run('generate:intel-mac-live-browser-proof-blocker-report', process.execPath, [
  'scripts/generate-intel-mac-live-browser-proof-blocker-report.mjs',
  '--write-json', 'docs/archive/intel-mac-live-browser-proof-blockers.json',
  '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-blockers.md',
]);
run('generate:intel-mac-live-browser-proof-remediation-report', process.execPath, [
  'scripts/generate-intel-mac-live-browser-proof-remediation-report.mjs',
  '--write-json', 'docs/archive/intel-mac-live-browser-proof-remediation.json',
  '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-remediation.md',
]);

const dropCheck = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-drop-check.json'), 'utf8'));
const ingestReport = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-ingest.json'), 'utf8'));
const readinessReport = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'docs/archive/target-live-browser-readiness-intel-mac.json'), 'utf8'));
const doctor = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'docs/archive/package-handoff-doctor.json'), 'utf8'));
const statusReport = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-status.json'), 'utf8'));
const projectionReport = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-projection.json'), 'utf8'));
const remediationReport = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-remediation.json'), 'utf8'));

const summary = {
  dropCheckPassed: dropCheck.summary?.passed ?? 0,
  dropCheckTotal: dropCheck.summary?.total ?? 0,
  invalidFixtureCount: dropCheck.summary?.invalidFixtureCount ?? 0,
  ingestedFixtures: ingestReport.summary?.fixtureCount ?? 0,
  ingestedProofFiles: ingestReport.summary?.proofFileCount ?? 0,
  targetLiveBrowserPassed: readinessReport.summary?.passed ?? 0,
  targetLiveBrowserTotal: readinessReport.summary?.total ?? 0,
  doctorEffectiveStatus: doctor.effectiveStatus ?? null,
  browserExecutablePath: browserExecutablePath || null,
  blockerCount: statusReport.blockers?.length ?? 0,
  projectedAfterFinalizePassed: projectionReport.summary?.projectedAfterFinalizePassed ?? 0,
  projectedAfterFinalizeTotal: projectionReport.summary?.projectedAfterFinalizeTotal ?? 0,
  remediationExactFileCount: remediationReport.exactFiles?.length ?? 0,
};

const report = {
  generatedAt: new Date().toISOString(),
  sourceDir: sourceDirArg,
  summary,
  commands: commandLog,
  nextStep: summary.targetLiveBrowserPassed === summary.targetLiveBrowserTotal
    ? 'intel-mac live browser readiness is fully green'
    : 'add the remaining browser proof artifacts or browser executable path, then rerun finalize',
};

fs.mkdirSync(path.dirname(writePath), { recursive: true });
fs.writeFileSync(writePath, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(`[finalize-intel-mac-live-browser-proof] drop=${summary.dropCheckPassed}/${summary.dropCheckTotal} target=${summary.targetLiveBrowserPassed}/${summary.targetLiveBrowserTotal} invalid=${summary.invalidFixtureCount} blockers=${summary.blockerCount} doctor=${summary.doctorEffectiveStatus}`);
