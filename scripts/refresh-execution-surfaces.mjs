import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const archiveDir = path.resolve(rootDir, 'docs/archive');
const outJson = path.resolve(archiveDir, 'execution-surfaces-current.json');
const outMd = path.resolve(rootDir, 'docs/EXECUTION_SURFACES_CURRENT.md');

const run = (label, args, { inherit = true } = {}) => {
  const result = spawnSync(process.execPath, args, {
    cwd: rootDir,
    env: process.env,
    encoding: 'utf8',
    stdio: inherit ? 'inherit' : 'pipe',
  });
  if (result.status !== 0) {
    if (!inherit) {
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
    }
    throw new Error(`[refresh-execution-surfaces] failed at ${label}`);
  }
  return result.stdout ?? '';
};

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.resolve(rootDir, relativePath), 'utf8'));
const readText = (relativePath) => fs.readFileSync(path.resolve(rootDir, relativePath), 'utf8');
const parseJsonStdout = (stdout, label) => {
  const trimmed = stdout.trim();
  if (!trimmed) throw new Error(`[refresh-execution-surfaces] empty stdout for ${label}`);
  const jsonStart = trimmed.indexOf('{');
  if (jsonStart < 0) throw new Error(`[refresh-execution-surfaces] no json payload for ${label}`);
  return JSON.parse(trimmed.slice(jsonStart));
};
const pick = (value, fallback = 'n/a') => (value ?? fallback);
const readJsonIfExists = (relativePath) => {
  const filePath = path.resolve(rootDir, relativePath);
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null;
};

run('refresh-repo-status', ['scripts/refresh-repo-status.mjs']);
const futureNativeOverview = parseJsonStdout(run('verify-future-native-global-overview', ['scripts/run-ts-entry.mjs', 'scripts/verify-future-native-global-overview-entry.ts'], { inherit: false }), 'future-native-global-overview');
run('verify-future-native-expression-coverage', ['scripts/verify-future-native-expression-coverage.mjs']);
run('emit-future-native-expression-coverage', ['scripts/emit-future-native-expression-coverage.mjs']);
run('emit-future-native-final-closeout-status', ['scripts/emit-future-native-final-closeout-status.mjs']);
const audioBulkVerify = run('verify-audio-midi-bulk', ['scripts/run-ts-entry.mjs', 'scripts/verify-audio-midi-bulk-entry.ts'], { inherit: false }).includes('ok');
const audioFinalCloseout = parseJsonStdout(run('verify-audio-legacy-final-closeout', ['scripts/run-ts-entry.mjs', 'scripts/verify-audio-legacy-final-closeout-entry.ts'], { inherit: false }), 'audio-legacy-final-closeout');
const audioCloseoutPacket = parseJsonStdout(run('verify-audio-legacy-closeout-packet', ['scripts/run-ts-entry.mjs', 'scripts/verify-audio-legacy-closeout-packet-entry.ts'], { inherit: false }), 'audio-legacy-closeout-packet');
run('prepare-intel-mac-live-browser-proof-drop', ['scripts/prepare-intel-mac-live-browser-proof-drop.mjs', '--source-dir', 'exports/intel-mac-live-browser-proof-drop']);
run('doctor-intel-mac-live-browser-proof:refresh', ['scripts/doctor-intel-mac-live-browser-proof.mjs', '--refresh', '--write', 'docs/archive/intel-mac-live-browser-proof-doctor.json']);
run('report-intel-mac-live-browser-proof-status', ['scripts/generate-intel-mac-live-browser-proof-status-report.mjs', '--write-json', 'docs/archive/intel-mac-live-browser-proof-status.json', '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-status.md']);
run('report-intel-mac-live-browser-proof-remediation', ['scripts/generate-intel-mac-live-browser-proof-remediation-report.mjs', '--write-json', 'docs/archive/intel-mac-live-browser-proof-remediation.json', '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-remediation.md']);

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

const report = {
  generatedAt: new Date().toISOString(),
  implementedVisibility: {
    repo: repoStatus,
    closeout: closeoutReport,
    audio: {
      ...audioSummary,
      bulkEditVerified: audioBulkVerify,
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
    internal: [
      ...(futureNativeFinalCloseout.remainingInternalTracks ?? []),
    ],
    external: [
      ...(futureNativeFinalCloseout.externalBlockers ?? []),
      ...intelStatus.blockers.map((entry) => `${entry.scope}:${entry.kind}:${entry.target}`),
    ],
  },
};

const md = `# Execution Surfaces Current\n\n## 1. 実装済みの見える化\n- package integrity: **${pick(repoStatus.packageIntegrity?.passed)}/${pick(repoStatus.packageIntegrity?.total)}**\n- host runtime: **${pick(repoStatus.hostRuntime?.passed)}/${pick(repoStatus.hostRuntime?.total)}**\n- live browser readiness: **${pick(repoStatus.liveBrowserReadiness?.passed)}/${pick(repoStatus.liveBrowserReadiness?.total)}**\n- dead-code application candidates: **${pick(repoStatus.deadCode?.applicationCandidateCount)}**\n- orphan/dev-only/barrel-only: **${pick(repoStatus.deadCode?.orphanModuleCount)} / ${pick(repoStatus.deadCode?.devOnlyCandidateCount)} / ${pick(repoStatus.deadCode?.barrelOnlyCandidateCount)}**\n- audio reactive live systems / targets / preset packs / feature keys: **${pick(audioSummary.liveSystems)} / ${pick(audioSummary.liveTargets)} / ${pick(audioSummary.presetPacks)} / ${pick(audioSummary.featureKeys)}**\n- audio route editor state: **${pick(audioSummary.routeEditorState)}**\n- audio legacy visibility: **${pick(audioSummary.legacyVisibility)}**\n- audio bulk edit verify: **${audioBulkVerify ? 'ok' : 'not-confirmed'}**\n- audio legacy final closeout: **${pick(audioFinalCloseout.ready)}**\n- audio legacy packet status: **${pick(audioCloseoutPacket.status)}**\n- future-native families: **${pick(futureNativeExpression.summary.totalFamilies)}**\n- future-native independent families: **${pick(futureNativeExpression.summary.independentCount)}**\n- future-native average progress: **${Number(futureNativeExpression.summary.averageProgressPercent ?? 0).toFixed(2)}%**\n- future-native closure progress: **${Number(futureNativeExpression.summary.closureProgressPercent ?? 0).toFixed(2)}%**\n- future-native presets / sequence steps: **${pick(futureNativeOverview.futureNativePresetCount)} / ${pick(futureNativeOverview.futureNativeSequenceStepCount)}**\n- future-native family counts: **MPM ${pick(futureNativeOverview.familyCounts?.MPM)} / PBD ${pick(futureNativeOverview.familyCounts?.PBD)} / Fracture ${pick(futureNativeOverview.familyCounts?.Fracture)} / Volumetric ${pick(futureNativeOverview.familyCounts?.Volumetric)}**\n- external control proxy clients / messages: **${pick(externalControlStatus?.connectedClientCount, 0)} / ${pick(externalControlStatus?.messageCount, 0)}**\n- external control latest status: **${externalControlStatus?.latestStatus ? 'connected' : 'not-yet-observed'}**\n\n## 2. 状態文書の同期\n- refreshed artifacts: **${report.statusSyncArtifacts.length}**\n- repo status current: docs/REPO_STATUS_CURRENT.md\n- truth sync closeout: docs/TRUTH_SYNC_CLOSEOUT_CURRENT.md\n- future-native closeout: docs/FUTURE_NATIVE_FINAL_CLOSEOUT_REMAINING_2026-04-08.md\n- external control bridge: docs/EXTERNAL_CONTROL_BRIDGE_CURRENT.md\n- intel operator packet: docs/archive/intel-mac-live-browser-proof-operator-packet.md\n- intel proof status: docs/archive/intel-mac-live-browser-proof-status.md\n- intel remediation: docs/archive/intel-mac-live-browser-proof-remediation.md\n\n## 3. 実機証跡の固定\n- Intel Mac drop intake: **${pick(intelStatus.summary.dropPassed)}/${pick(intelStatus.summary.dropTotal)}**\n- Intel Mac target readiness: **${pick(intelStatus.summary.targetPassed)}/${pick(intelStatus.summary.targetTotal)}**\n- proof blockers: **${intelStatus.blockers.length}**\n- next focus: ${pick(intelRemediation.nextFocus)}\n\n### Missing exact files\n${intelRemediation.exactFiles.map((entry) => `- ${entry.path} — ${entry.why}`).join('\n')}\n\n### Next commands\n${intelRemediation.commands.map((command) => `- ${command}`).join('\n')}\n\n## 4. 仕上げ UX の closeout\n- route editor generic bulk edit: **implemented + verified**\n- legacy final closeout compact state: **${pick(audioFinalCloseout.compactCloseoutReady)}**\n- target-host proof required: **${pick(audioFinalCloseout.requiresTargetHostProof)}**\n- next step label: **${pick(audioFinalCloseout.nextStepLabel)}**\n- closeout packet action count: **${pick(audioCloseoutPacket.actionCount)}**\n- preview keys / applied keys: **${pick(audioCloseoutPacket.previewKeyCount)} / ${pick(audioCloseoutPacket.previewAppliedKeyCount)}**\n\n## 5. 最高効率の次手\n1. Intel Mac 実機で real-export fixture JSON を 1 本採取する。\n2. real-export-proof.json を captured 状態へ更新し、screenshots / logs を紐付ける。\n3. bundle zip を incoming へ置いて finalize まで通す。\n4. 実機 proof 固定後にのみ、残る UI/UX の微調整を再開する。\n`;

fs.mkdirSync(path.dirname(outJson), { recursive: true });
fs.writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(outMd, md);
run('report-truth-sync-closeout', ['scripts/run-ts-entry.mjs', 'scripts/generate-current-doc-truth-sync-entry.ts']);
console.log(outJson);
console.log(outMd);
