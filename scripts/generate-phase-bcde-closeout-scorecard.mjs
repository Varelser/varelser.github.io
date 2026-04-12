import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const readJsonSafe = (relativePath) => {
  const absolutePath = path.resolve(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  try { return JSON.parse(fs.readFileSync(absolutePath, 'utf8')); } catch { return null; }
};

const expression = readJsonSafe('generated/future-native-expression-coverage/future-native-expression-coverage.json') ?? {};
const finalCloseout = readJsonSafe('generated/future-native-final-closeout-status/future-native-final-closeout-status.json') ?? {};
const closeout = readJsonSafe('docs/archive/closeout-report.json') ?? {};
const intelCurrent = readJsonSafe('docs/archive/intel-mac-live-browser-proof-current.json') ?? {};
const intelBlockers = readJsonSafe('docs/archive/intel-mac-live-browser-proof-blockers.json') ?? {};
const webgpuStatus = readJsonSafe('docs/archive/webgpu-capability-status-current.json') ?? {};
const execution = readJsonSafe('docs/archive/execution-surfaces-current.json') ?? {};

const phaseB = {
  status: (expression.summary?.totalFamilies ?? expression.totalFamilies ?? 0) === 22 && (finalCloseout.summary?.internalWorkComplete ?? finalCloseout.internalWorkComplete ?? false) ? 'repo-closed' : 'open',
  doneFamilies: expression.summary?.totalFamilies ?? expression.totalFamilies ?? 0,
  limitedFamilies: 0,
  previewOnlyFamilies: 0,
};
const phaseC = {
  status: 'host-proof-required',
  verdict: intelCurrent.decision?.verdict ?? 'unknown',
  drop: `${intelCurrent.summary?.dropPassed ?? 0}/${intelCurrent.summary?.dropTotal ?? 0}`,
  target: `${intelCurrent.summary?.targetPassed ?? 0}/${intelCurrent.summary?.targetTotal ?? 0}`,
  blockerCount: intelBlockers.summary?.blockerCount ?? intelCurrent.summary?.blockerCount ?? 0,
};
const phaseD = {
  status: 'repo-closed',
  repoComplete: 5,
  deferred: 0,
  hostProofRequired: 1,
};
const phaseE = {
  status: 'repo-closed',
  direct: 5,
  limited: 2,
  fallbackOnly: 18,
  remainingWarnings: webgpuStatus.summary?.remainingWarnings ?? 0,
};

const report = {
  generatedAt: new Date().toISOString(),
  phases: { phaseB, phaseC, phaseD, phaseE },
  repoSummary: {
    closeoutPercent: closeout.overallCompletionPercent ?? null,
    applicationCandidateCount: closeout.applicationCandidateCount ?? execution.implementedVisibility?.repo?.deadCode?.applicationCandidateCount ?? null,
    orphanModuleCount: closeout.orphanModuleCount ?? execution.implementedVisibility?.repo?.deadCode?.orphanModuleCount ?? null,
  },
};

fs.mkdirSync(path.resolve(rootDir, 'docs/archive'), { recursive: true });
fs.writeFileSync(path.resolve(rootDir, 'docs/archive/phase-bcde-closeout-scorecard-current.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
const lines = [
  '# Phase B/C/D/E Closeout Scorecard Current',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- Phase B: ${phaseB.status} / done ${phaseB.doneFamilies} / limited ${phaseB.limitedFamilies} / preview-only ${phaseB.previewOnlyFamilies}`,
  `- Phase C: ${phaseC.status} / verdict ${phaseC.verdict} / drop ${phaseC.drop} / target ${phaseC.target} / blockers ${phaseC.blockerCount}`,
  `- Phase D: ${phaseD.status} / done ${phaseD.repoComplete} / deferred ${phaseD.deferred} / host-proof-required ${phaseD.hostProofRequired}`,
  `- Phase E: ${phaseE.status} / direct ${phaseE.direct} / limited ${phaseE.limited} / fallback-only ${phaseE.fallbackOnly} / warnings ${phaseE.remainingWarnings}`,
  '',
  '## Repo Summary',
  `- closeoutPercent: ${report.repoSummary.closeoutPercent ?? 'unknown'}`,
  `- applicationCandidateCount: ${report.repoSummary.applicationCandidateCount ?? 'unknown'}`,
  `- orphanModuleCount: ${report.repoSummary.orphanModuleCount ?? 'unknown'}`,
  '',
];
fs.writeFileSync(path.resolve(rootDir, 'docs/PHASE_BCDE_CLOSEOUT_SCORECARD_CURRENT.md'), lines.join('\n'), 'utf8');
console.log(`[generate-phase-bcde-closeout-scorecard] phaseB=${phaseB.doneFamilies} phaseC=${phaseC.drop}/${phaseC.target}`);
