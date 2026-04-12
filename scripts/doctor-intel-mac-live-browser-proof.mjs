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

const writeArg = getArgValue('--write') || 'docs/archive/intel-mac-live-browser-proof-doctor.json';
const writePath = path.resolve(rootDir, writeArg);
const refresh = hasFlag('--refresh');
const browserExecutablePath = getArgValue('--browser-executable-path') || null;

const readJsonSafe = (relativePath) => {
  const absolutePath = path.resolve(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  } catch {
    return null;
  }
};

const commands = [];
const run = (label, commandArgs) => {
  const result = spawnSync(process.execPath, commandArgs, { cwd: rootDir, stdio: 'inherit' });
  commands.push({ label, command: process.execPath, args: commandArgs, status: result.status ?? 1 });
  if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);
};

if (refresh) {
  run('draft-intel-mac-live-browser-proof-summary', [
    'scripts/draft-intel-mac-live-browser-proof-summary.mjs',
    ...(browserExecutablePath ? ['--browser-executable-path', browserExecutablePath] : []),
  ]);
  run('verify-intel-mac-live-browser-proof-drop', [
    'scripts/verify-intel-mac-live-browser-proof-drop.mjs',
    '--write', 'docs/archive/intel-mac-live-browser-proof-drop-check.json',
  ]);
  run('verify-target-live-browser-readiness', [
    'scripts/verify-target-live-browser-readiness.mjs',
    '--platform', 'darwin',
    '--arch', 'x64',
    '--home-dir', process.env.HOME || '~',
    '--write', 'docs/archive/target-live-browser-readiness-intel-mac.json',
    ...(browserExecutablePath ? ['--browser-executable-path', browserExecutablePath] : []),
  ]);
  run('doctor-package-handoff', [
    'scripts/doctor-package-handoff.mjs',
    '--write', 'docs/archive/package-handoff-doctor.json',
  ]);
  run('generate-intel-mac-live-browser-proof-status-report', [
    'scripts/generate-intel-mac-live-browser-proof-status-report.mjs',
    '--write-json', 'docs/archive/intel-mac-live-browser-proof-status.json',
    '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-status.md',
  ]);
  run('generate-intel-mac-live-browser-proof-blocker-report', [
    'scripts/generate-intel-mac-live-browser-proof-blocker-report.mjs',
    '--write-json', 'docs/archive/intel-mac-live-browser-proof-blockers.json',
    '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-blockers.md',
  ]);
  run('generate-intel-mac-live-browser-proof-remediation-report', [
    'scripts/generate-intel-mac-live-browser-proof-remediation-report.mjs',
    '--write-json', 'docs/archive/intel-mac-live-browser-proof-remediation.json',
    '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-remediation.md',
  ]);
}

const dropCheck = readJsonSafe('docs/archive/intel-mac-live-browser-proof-drop-check.json');
const targetReadiness = readJsonSafe('docs/archive/target-live-browser-readiness-intel-mac.json');
const handoffDoctor = readJsonSafe('docs/archive/package-handoff-doctor.json');
const ingestReport = readJsonSafe('docs/archive/intel-mac-live-browser-proof-ingest.json');
const finalizeReport = readJsonSafe('docs/archive/intel-mac-live-browser-proof-finalize.json');
const currentReadiness = readJsonSafe('docs/archive/live-browser-readiness.json');
const statusReport = readJsonSafe('docs/archive/intel-mac-live-browser-proof-status.json');
const projectionReport = readJsonSafe('docs/archive/intel-mac-live-browser-proof-projection.json');
const remediationReport = readJsonSafe('docs/archive/intel-mac-live-browser-proof-remediation.json');

const dropFixtureCheck = dropCheck?.checks?.find((item) => item.kind === 'fixture-json') ?? null;
const dropFixtureValidCheck = dropCheck?.checks?.find((item) => item.kind === 'fixture-json-valid') ?? null;
const dropProofSummaryCheck = dropCheck?.checks?.find((item) => item.kind === 'proof-summary-json') ?? null;
const dropStructuredProofCheck = dropCheck?.checks?.find((item) => item.kind === 'structured-proof-files') ?? null;
const targetBrowserCheck = targetReadiness?.checks?.find((item) => item.kind === 'browser-executable') ?? null;
const targetManifestCheck = targetReadiness?.checks?.find((item) => item.kind === 'real-export-manifest') ?? null;
const targetReadinessReportCheck = targetReadiness?.checks?.find((item) => item.kind === 'real-export-readiness-report') ?? null;

const nextSteps = [];
if (!dropFixtureCheck?.ok) {
  nextSteps.push('Intel Mac 実機で real-export JSON を 1 本採取し、exports/intel-mac-live-browser-proof-drop/real-export/ へ置く');
  nextSteps.push('または Intel Mac 実機で採った proof 一式を bundle zip にして exports/intel-mac-live-browser-proof-drop/incoming/ へ置く');
}
if (dropFixtureCheck?.ok && !dropFixtureValidCheck?.ok) {
  nextSteps.push('drop へ置いた real-export JSON の壊れたファイルを修正または削除する');
}
if (!dropProofSummaryCheck?.ok) {
  nextSteps.push('npm run draft:intel-mac-live-browser-proof-summary を実行して proof summary を自動下書きし、その後 captured 状態へ仕上げる');
}
if (!dropStructuredProofCheck?.ok) {
  nextSteps.push('build log / verify log / console dump のいずれかを phase5-proof-input へ追加する');
}
if (!targetBrowserCheck?.ok) {
  nextSteps.push('Intel Mac 実機で npx playwright install chromium を実行し、必要なら --browser-executable-path を付けて再監査する');
}
if (dropFixtureValidCheck?.ok && (!targetManifestCheck?.ok || !targetReadinessReportCheck?.ok)) {
  nextSteps.push('npm run finalize:intel-mac-live-browser-proof を実行して manifest / readiness / handoff doctor を再生成する');
}
if ((targetReadiness?.summary?.failed ?? 1) === 0) {
  nextSteps.push('Intel Mac live browser readiness は green。handoff 用の実測証跡を保存して closeout へ進める');
}
if (nextSteps.length === 0) {
  nextSteps.push('必要な live browser proof アーカイブは揃っている。closeout と最終 handoff を更新する');
}

const report = {
  generatedAt: new Date().toISOString(),
  commands,
  summary: {
    dropPassed: dropCheck?.summary?.passed ?? 0,
    dropTotal: dropCheck?.summary?.total ?? 0,
    dropFixtureCount: dropFixtureCheck?.fixtureCount ?? 0,
    invalidFixtureCount: dropCheck?.summary?.invalidFixtureCount ?? 0,
    structuredProofFileCount: dropCheck?.summary?.structuredProofFileCount ?? 0,
    proofSummaryOk: dropProofSummaryCheck?.ok ?? false,
    targetPassed: targetReadiness?.summary?.passed ?? 0,
    targetTotal: targetReadiness?.summary?.total ?? 0,
    currentPassed: currentReadiness?.summary?.passed ?? 0,
    currentTotal: currentReadiness?.summary?.total ?? 0,
    ingestedFixtures: ingestReport?.summary?.fixtureCount ?? 0,
    ingestedProofFiles: ingestReport?.summary?.proofFileCount ?? 0,
    finalizedTargetPassed: finalizeReport?.summary?.targetLiveBrowserPassed ?? null,
    finalizedTargetTotal: finalizeReport?.summary?.targetLiveBrowserTotal ?? null,
    handoffEffectiveStatus: handoffDoctor?.effectiveStatus ?? null,
    statusBlockerCount: statusReport?.blockers?.length ?? 0,
    projectedPassed: projectionReport?.summary?.projectedAfterFinalizePassed ?? 0,
    projectedTotal: projectionReport?.summary?.projectedAfterFinalizeTotal ?? 0,
    projectedBlockerCount: projectionReport?.summary?.blockerCount ?? 0,
    remediationExactFileCount: remediationReport?.exactFiles?.length ?? 0,
  },
  dropFixtureCheck,
  dropFixtureValidCheck,
  dropProofSummaryCheck,
  dropStructuredProofCheck,
  targetBrowserCheck,
  targetManifestCheck,
  targetReadinessReportCheck,
  projectionReport,
  remediationReport,
  nextSteps,
};

fs.mkdirSync(path.dirname(writePath), { recursive: true });
fs.writeFileSync(writePath, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(`[doctor-intel-mac-live-browser-proof] drop=${report.summary.dropPassed}/${report.summary.dropTotal} target=${report.summary.targetPassed}/${report.summary.targetTotal} projected=${report.summary.projectedPassed}/${report.summary.projectedTotal} invalid=${report.summary.invalidFixtureCount} blockers=${report.summary.statusBlockerCount} handoff=${report.summary.handoffEffectiveStatus}`);
for (const step of nextSteps) console.log(`- ${step}`);
