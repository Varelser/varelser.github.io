import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { listIntelMacLiveBrowserProofBundles, readJsonSafe } from './intelMacLiveBrowserProofShared.mjs';
import { resolvePlaywrightExecutable } from './hostRuntimeShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const hasFlag = (flag) => args.includes(flag);

const sourceDirArg = getArgValue('--source-dir') || 'exports/intel-mac-live-browser-proof-drop';
const sourceDir = path.resolve(rootDir, sourceDirArg);
const writePath = path.resolve(rootDir, getArgValue('--write') || 'docs/archive/intel-mac-live-browser-proof-pipeline.json');
const writeMarkdownPath = path.resolve(rootDir, getArgValue('--write-markdown') || 'docs/archive/intel-mac-live-browser-proof-pipeline.md');
const homeDir = getArgValue('--home-dir') || process.env.HOME || '~';
const explicitBrowserPath = getArgValue('--browser-executable-path').trim();
const dryRun = hasFlag('--dry-run');

const runLog = [];
const run = (label, command, commandArgs, options = {}) => {
  const result = spawnSync(command, commandArgs, {
    cwd: rootDir,
    stdio: 'pipe',
    encoding: 'utf8',
    env: process.env,
    ...options,
  });
  runLog.push({
    label,
    command: [command, ...commandArgs].join(' '),
    status: result.status,
    ok: result.status === 0,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  });
  return result;
};

const detectBrowserPath = () => {
  if (explicitBrowserPath) return { path: explicitBrowserPath, source: 'override' };
  const notesPath = path.resolve(sourceDir, 'phase5-proof-input/real-export-capture-notes.md');
  if (fs.existsSync(notesPath)) {
    const raw = fs.readFileSync(notesPath, 'utf8');
    const match = raw.match(/^-\s*browser executable path:\s*(.+)$/im);
    const fromNotes = match?.[1]?.trim();
    if (fromNotes) return { path: fromNotes, source: 'notes' };
  }
  const summaryPath = path.resolve(sourceDir, 'phase5-proof-input/real-export-proof.json');
  const summary = readJsonSafe(summaryPath);
  const fromSummary = typeof summary?.browser?.executablePath === 'string' ? summary.browser.executablePath.trim() : '';
  if (fromSummary) return { path: fromSummary, source: 'summary' };
  const resolved = resolvePlaywrightExecutable(rootDir, { platform: 'darwin', arch: 'x64', libc: null }, homeDir, null);
  if (resolved.resolvedPath) return { path: resolved.resolvedPath, source: resolved.resolvedSource || 'detected' };
  return { path: '', source: 'missing' };
};

const runStep = (label, argsList) => run(label, process.execPath, argsList);

if (!dryRun) {
  runStep('scaffold:intel-mac-live-browser-proof-drop', ['scripts/scaffold-intel-mac-live-browser-proof-drop.mjs', '--source-dir', sourceDirArg]);
  const bundleNames = listIntelMacLiveBrowserProofBundles(rootDir, sourceDir);
  if (bundleNames.length > 0) {
    runStep('extract:intel-mac-live-browser-proof-bundle', ['scripts/extract-intel-mac-live-browser-proof-bundle.mjs', '--source-dir', sourceDirArg, '--write', 'docs/archive/intel-mac-live-browser-proof-bundle-extract.json']);
  }
}
runStep('draft:intel-mac-live-browser-proof-summary', ['scripts/draft-intel-mac-live-browser-proof-summary.mjs', '--source-dir', sourceDirArg]);
runStep('verify:intel-mac-live-browser-proof-drop', ['scripts/verify-intel-mac-live-browser-proof-drop.mjs', '--source-dir', sourceDirArg, '--write', 'docs/archive/intel-mac-live-browser-proof-drop-check.json']);
runStep('report:intel-mac-live-browser-proof-remediation', ['scripts/generate-intel-mac-live-browser-proof-remediation-report.mjs', '--write-json', 'docs/archive/intel-mac-live-browser-proof-remediation.json', '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-remediation.md']);
runStep('report:intel-mac-live-browser-proof-projection', ['scripts/generate-intel-mac-live-browser-proof-projection-report.mjs', '--write-json', 'docs/archive/intel-mac-live-browser-proof-projection.json', '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-projection.md']);

const dropCheck = readJsonSafe(path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-drop-check.json')) ?? {};
const failedKinds = new Set((dropCheck.checks ?? []).filter((item) => !item.ok).map((item) => item.kind));
const proofReadyKinds = ['fixture-json', 'fixture-json-valid', 'proof-summary-json', 'proof-summary-artifact-paths', 'proof-summary-project-linkage', 'structured-proof-files'];
const proofReady = proofReadyKinds.every((kind) => !failedKinds.has(kind));

const browser = detectBrowserPath();
let finalizeAttempted = false;
let finalizeSucceeded = false;

if (!dryRun && proofReady) {
  finalizeAttempted = true;
  const finalizeArgs = ['scripts/finalize-intel-mac-live-browser-proof.mjs', '--source-dir', sourceDirArg, '--write', 'docs/archive/intel-mac-live-browser-proof-finalize.json'];
  if (browser.path) finalizeArgs.push('--browser-executable-path', browser.path);
  const finalizeResult = runStep('finalize:intel-mac-live-browser-proof', finalizeArgs);
  finalizeSucceeded = finalizeResult.status === 0;
}

runStep('doctor:intel-mac-live-browser-proof', ['scripts/doctor-intel-mac-live-browser-proof.mjs', '--write', 'docs/archive/intel-mac-live-browser-proof-doctor.json']);
runStep('report:intel-mac-live-browser-proof-status', ['scripts/generate-intel-mac-live-browser-proof-status-report.mjs', '--write-json', 'docs/archive/intel-mac-live-browser-proof-status.json', '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-status.md']);
runStep('report:intel-mac-live-browser-proof-blockers', ['scripts/generate-intel-mac-live-browser-proof-blocker-report.mjs', '--write-json', 'docs/archive/intel-mac-live-browser-proof-blockers.json', '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-blockers.md']);

const doctor = readJsonSafe(path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-doctor.json')) ?? {};
const remediation = readJsonSafe(path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-remediation.json')) ?? {};
const projection = readJsonSafe(path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-projection.json')) ?? {};
const status = readJsonSafe(path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-status.json')) ?? {};

const report = {
  generatedAt: new Date().toISOString(),
  sourceDir: path.relative(rootDir, sourceDir),
  dryRun,
  browserExecutable: browser,
  proofReady,
  finalizeAttempted,
  finalizeSucceeded,
  summary: {
    dropPassed: dropCheck.summary?.passed ?? 0,
    dropTotal: dropCheck.summary?.total ?? 0,
    projectedAfterFinalizePassed: projection.summary?.projectedAfterFinalizePassed ?? 0,
    projectedAfterFinalizeTotal: projection.summary?.projectedAfterFinalizeTotal ?? 0,
    doctorBlockers: doctor.summary?.statusBlockerCount ?? 0,
    remediationExactFileCount: remediation.exactFiles?.length ?? 0,
    statusBlockerCount: status.summary?.blockerCount ?? 0,
  },
  missingProofKinds: [...failedKinds],
  commands: runLog,
  nextAction: proofReady
    ? (finalizeSucceeded ? 'intel-mac live browser proof finalized; review doctor/status reports' : 'proof ready but finalize failed; inspect finalize stderr and rerun with explicit browser path if needed')
    : (remediation.nextFocus || 'add missing live browser proof artifacts and rerun pipeline'),
};

fs.mkdirSync(path.dirname(writePath), { recursive: true });
fs.writeFileSync(writePath, JSON.stringify(report, null, 2) + '\n', 'utf8');

const lines = [
  '# Intel Mac Live Browser Proof Pipeline',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- sourceDir: ${report.sourceDir}`,
  `- dryRun: ${report.dryRun}`,
  `- browserExecutable: ${browser.path || 'missing'} (${browser.source})`,
  `- proofReady: ${report.proofReady}`,
  `- finalizeAttempted: ${report.finalizeAttempted}`,
  `- finalizeSucceeded: ${report.finalizeSucceeded}`,
  `- drop: ${report.summary.dropPassed}/${report.summary.dropTotal}`,
  `- projectedAfterFinalize: ${report.summary.projectedAfterFinalizePassed}/${report.summary.projectedAfterFinalizeTotal}`,
  `- doctorBlockers: ${report.summary.doctorBlockers}`,
  `- remediationExactFileCount: ${report.summary.remediationExactFileCount}`,
  '',
  '## Missing Proof Kinds',
  ...(report.missingProofKinds.length ? report.missingProofKinds.map((item) => `- ${item}`) : ['- none']),
  '',
  '## Commands',
  ...report.commands.map((item) => `- [${item.ok ? 'ok' : 'fail'}] ${item.label}`),
  '',
  `## Next Action\n- ${report.nextAction}`,
  '',
];
fs.mkdirSync(path.dirname(writeMarkdownPath), { recursive: true });
fs.writeFileSync(writeMarkdownPath, lines.join('\n'), 'utf8');
console.log(`[run-intel-mac-live-browser-proof-pipeline] proofReady=${proofReady} finalize=${finalizeAttempted ? (finalizeSucceeded ? 'ok' : 'fail') : 'skipped'} drop=${report.summary.dropPassed}/${report.summary.dropTotal} projected=${report.summary.projectedAfterFinalizePassed}/${report.summary.projectedAfterFinalizeTotal}`);
