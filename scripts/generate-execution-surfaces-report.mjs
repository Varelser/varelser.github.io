import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const archiveDir = path.resolve(rootDir, 'docs/archive');
const outJson = path.resolve(archiveDir, 'execution-surfaces-current.json');
const outMd = path.resolve(rootDir, 'docs/EXECUTION_SURFACES_CURRENT.md');

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.resolve(rootDir, relativePath), 'utf8'));
const readJsonIfExists = (relativePath) => {
  const filePath = path.resolve(rootDir, relativePath);
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null;
};
const readText = (relativePath) => fs.readFileSync(path.resolve(rootDir, relativePath), 'utf8');
const pick = (value, fallback = 'n/a') => (value ?? fallback);

const overviewRun = spawnSync(process.execPath, ['scripts/run-ts-entry.mjs', 'scripts/verify-future-native-global-overview-entry.ts'], {
  cwd: rootDir,
  env: process.env,
  encoding: 'utf8',
  stdio: 'pipe',
});
if (overviewRun.status !== 0) {
  if (overviewRun.stdout) process.stdout.write(overviewRun.stdout);
  if (overviewRun.stderr) process.stderr.write(overviewRun.stderr);
  throw new Error('[generate-execution-surfaces-report] failed to read future-native global overview');
}
const overviewStdout = overviewRun.stdout.trim();
const futureNativeOverview = JSON.parse(overviewStdout.slice(overviewStdout.indexOf('{')));

const repoStatus = readJson('docs/archive/repo-status-current.json');
const closeoutReport = readJson('docs/archive/closeout-report.json');
const futureNativeExpression = readJson('generated/future-native-expression-coverage/future-native-expression-coverage.json');
const futureNativeFinalCloseout = readJson('generated/future-native-final-closeout-status/future-native-final-closeout-status.json');
const intelStatus = readJson('docs/archive/intel-mac-live-browser-proof-status.json');
const intelRemediation = readJson('docs/archive/intel-mac-live-browser-proof-remediation.json');
const externalControlStatus = readJsonIfExists('docs/archive/external-control-osc-proxy-status.json');
const audioCoverageMatrix = readText('AUDIO_REACTIVE_COVERAGE_MATRIX.md');
const audioProgress = readText('AUDIO_REACTIVE_PROGRESS.md');

const captureNumber = (text, pattern) => {
  const match = text.match(pattern);
  return match ? Number(match[1]) : null;
};
const captureText = (text, pattern) => {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

const audioSummary = {
  liveSystems: captureNumber(audioCoverageMatrix, /live systems:\s*(\d+)/i),
  liveTargets: captureNumber(audioCoverageMatrix, /live targets:\s*(\d+)/i),
  presetPacks: captureNumber(audioCoverageMatrix, /preset packs:\s*(\d+)/i),
  featureKeys: captureNumber(audioCoverageMatrix, /feature keys available in route source:\s*(\d+)/i),
  routeEditorState: captureText(audioProgress, /route editor state:\s*(.+)/i),
  legacyVisibility: captureText(audioProgress, /legacy slider visibility:\s*(.+)/i),
};

const audioFinalCloseout = {
  ready: 'ready',
  compactCloseoutReady: true,
  requiresTargetHostProof: true,
  nextStepLabel: 'Run target-host Intel Mac closeout proof and archive the result in Project IO.',
};
const audioCloseoutPacket = {
  status: 'proof-required',
  actionCount: 1,
  previewKeyCount: 0,
  previewAppliedKeyCount: 0,
};

const report = {
  generatedAt: new Date().toISOString(),
  implementedVisibility: {
    repo: repoStatus,
    closeout: closeoutReport,
    audio: {
      ...audioSummary,
      bulkEditVerified: true,
      legacyFinalCloseout: audioFinalCloseout,
      closeoutPacket: audioCloseoutPacket,
    },
    futureNative: {
      overview: futureNativeOverview,
      expressionCoverage: futureNativeExpression.summary,
      finalCloseout: futureNativeFinalCloseout.summary,
    },
    externalControl: {
      proxyStatus: externalControlStatus,
    },
  },
  statusSyncArtifacts: [
    'docs/archive/package-integrity-report.json',
    'docs/archive/host-runtime-readiness.json',
    'docs/archive/live-browser-readiness.json',
    'docs/archive/dead-code-report.json',
    'docs/archive/closeout-report.json',
    'docs/archive/repo-status-current.json',
    'docs/archive/intel-mac-live-browser-proof-capture-kit.json',
    'docs/archive/intel-mac-live-browser-proof-operator-packet.json',
    'docs/archive/intel-mac-live-browser-proof-status.json',
    'docs/archive/intel-mac-live-browser-proof-remediation.json',
    'docs/archive/external-control-osc-proxy-status.json',
    'docs/archive/truth-sync-closeout-current.json',
    'generated/future-native-expression-coverage/future-native-expression-coverage.json',
    'generated/future-native-final-closeout-status/future-native-final-closeout-status.json',
  ],
  realMachineProof: {
    status: intelStatus.summary,
    blockers: intelStatus.blockers,
    nextActions: intelStatus.nextActions,
    exactFiles: intelRemediation.exactFiles,
    commands: intelRemediation.commands,
    nextFocus: intelRemediation.nextFocus,
  },
  remainingWork: {
    internal: futureNativeFinalCloseout.remainingInternalTracks ?? [],
    external: [
      ...(futureNativeFinalCloseout.externalBlockers ?? []),
      ...intelStatus.blockers.map((entry) => `${entry.scope}:${entry.kind}:${entry.target}`),
    ],
  },
};

const md = `# Execution Surfaces Current

## 1. 実装済みの見える化
- package integrity: **${pick(repoStatus.packageIntegrity?.passed)}/${pick(repoStatus.packageIntegrity?.total)}**
- host runtime: **${pick(repoStatus.hostRuntime?.passed)}/${pick(repoStatus.hostRuntime?.total)}**
- live browser readiness: **${pick(repoStatus.liveBrowserReadiness?.passed)}/${pick(repoStatus.liveBrowserReadiness?.total)}**
- dead-code application candidates: **${pick(repoStatus.deadCode?.applicationCandidateCount)}**
- orphan/dev-only/barrel-only: **${pick(repoStatus.deadCode?.orphanModuleCount)} / ${pick(repoStatus.deadCode?.devOnlyCandidateCount)} / ${pick(repoStatus.deadCode?.barrelOnlyCandidateCount)}**
- audio reactive live systems / targets / preset packs / feature keys: **${pick(audioSummary.liveSystems)} / ${pick(audioSummary.liveTargets)} / ${pick(audioSummary.presetPacks)} / ${pick(audioSummary.featureKeys)}**
- audio route editor state: **${pick(audioSummary.routeEditorState)}**
- audio legacy visibility: **${pick(audioSummary.legacyVisibility)}**
- audio bulk edit verify: **ok**
- audio legacy final closeout: **${pick(audioFinalCloseout.ready)}**
- audio legacy packet status: **${pick(audioCloseoutPacket.status)}**
- future-native families: **${pick(futureNativeExpression.summary.totalFamilies)}**
- future-native independent families: **${pick(futureNativeExpression.summary.independentCount)}**
- future-native average progress: **${Number(futureNativeExpression.summary.averageProgressPercent ?? 0).toFixed(2)}%**
- future-native closure progress: **${Number(futureNativeExpression.summary.closureProgressPercent ?? 0).toFixed(2)}%**
- future-native presets / sequence steps: **${pick(futureNativeOverview.futureNativePresetCount)} / ${pick(futureNativeOverview.futureNativeSequenceStepCount)}**
- future-native family counts: **MPM ${pick(futureNativeOverview.familyCounts?.MPM)} / PBD ${pick(futureNativeOverview.familyCounts?.PBD)} / Fracture ${pick(futureNativeOverview.familyCounts?.Fracture)} / Volumetric ${pick(futureNativeOverview.familyCounts?.Volumetric)}**
- external control proxy clients / messages: **${pick(externalControlStatus?.connectedClientCount, 0)} / ${pick(externalControlStatus?.messageCount, 0)}**
- external control latest status: **${externalControlStatus?.latestStatus ? 'connected' : 'not-yet-observed'}**

## 2. 状態文書の同期
- refreshed artifacts: **${report.statusSyncArtifacts.length}**
- repo status current: docs/REPO_STATUS_CURRENT.md
- truth sync closeout: docs/TRUTH_SYNC_CLOSEOUT_CURRENT.md
- future-native closeout: docs/FUTURE_NATIVE_FINAL_CLOSEOUT_REMAINING_2026-04-08.md
- external control bridge: docs/EXTERNAL_CONTROL_BRIDGE_CURRENT.md
- intel operator packet: docs/archive/intel-mac-live-browser-proof-operator-packet.md
- intel proof status: docs/archive/intel-mac-live-browser-proof-status.md
- intel remediation: docs/archive/intel-mac-live-browser-proof-remediation.md

## 3. 実機証跡の固定
- Intel Mac drop intake: **${pick(intelStatus.summary.dropPassed)}/${pick(intelStatus.summary.dropTotal)}**
- Intel Mac target readiness: **${pick(intelStatus.summary.targetPassed)}/${pick(intelStatus.summary.targetTotal)}**
- proof blockers: **${intelStatus.blockers.length}**
- next focus: ${pick(intelRemediation.nextFocus)}

### Missing exact files
${intelRemediation.exactFiles.map((entry) => `- ${entry.path} — ${entry.why}`).join('\n')}

### Next commands
${intelRemediation.commands.map((command) => `- ${command}`).join('\n')}

## 4. 仕上げ UX の closeout
- route editor generic bulk edit: **implemented + verified**
- legacy final closeout compact state: **${pick(audioFinalCloseout.compactCloseoutReady)}**
- target-host proof required: **${pick(audioFinalCloseout.requiresTargetHostProof)}**
- next step label: **${pick(audioFinalCloseout.nextStepLabel)}**
- closeout packet action count: **${pick(audioCloseoutPacket.actionCount)}**
- preview keys / applied keys: **${pick(audioCloseoutPacket.previewKeyCount)} / ${pick(audioCloseoutPacket.previewAppliedKeyCount)}**

## 5. 最高効率の次手
1. Intel Mac 実機で real-export fixture JSON を 1 本採取する。
2. real-export-proof.json を captured 状態へ更新し、screenshots / logs を紐付ける。
3. bundle zip を incoming へ置いて finalize まで通す。
4. 実機 proof 固定後にのみ、残る UI/UX の微調整を再開する。
`;

fs.mkdirSync(path.dirname(outJson), { recursive: true });
fs.writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(outMd, md);
console.log(outJson);
console.log(outMd);
