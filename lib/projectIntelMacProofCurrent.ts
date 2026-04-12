export type ProjectIntelMacProofScope = 'all' | 'drop' | 'target';

export interface ProjectIntelMacProofSummary {
  dropPassed: number;
  dropTotal: number;
  targetPassed: number;
  targetTotal: number;
  blockerCount: number;
  fixtureCount: number;
  structuredProofFileCount: number;
  bundleCountBeforeRun: number;
}

export interface ProjectIntelMacProofDecision {
  verdict: string;
  readyForRealCapture: boolean;
  readyForHostFinalize: boolean;
  effectivelyClosable: boolean;
  recommendedMode: string;
  nextStep: string;
}

export interface ProjectIntelMacProofBlocker {
  scope: Exclude<ProjectIntelMacProofScope, 'all'>;
  kind: string;
  target: string;
  action: string;
}

export interface ProjectIntelMacProofPrioritizedAction {
  id: string;
  reason: string;
  command: string;
  outputs: string[];
}

export interface ProjectIntelMacProofReport {
  generatedAt: string;
  sourceDir: string;
  incomingDir: string;
  summary: ProjectIntelMacProofSummary;
  decision: ProjectIntelMacProofDecision;
  blockers: ProjectIntelMacProofBlocker[];
  nextActions: string[];
  commands: {
    scaffold: string;
    draft: string;
    verify: string;
    pipeline: string;
    finalize: string;
    doctor: string;
    oneShotIngest: string;
  };
  outputs: {
    captureScript: string;
    packageScript: string;
    finalizeScript: string;
    readme: string;
    notes: string;
    summary: string;
    operatorPacketJson: string;
    operatorPacketMarkdown: string;
  };
  prioritizedActions: ProjectIntelMacProofPrioritizedAction[];
}

export const CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT: ProjectIntelMacProofReport = {
  generatedAt: '2026-04-09T19:26:49.765Z',
  sourceDir: 'exports/intel-mac-live-browser-proof-drop',
  incomingDir: 'exports/intel-mac-live-browser-proof-drop/incoming',
  summary: {
    dropPassed: 6,
    dropTotal: 11,
    targetPassed: 5,
    targetTotal: 6,
    blockerCount: 6,
    fixtureCount: 0,
    structuredProofFileCount: 1,
    bundleCountBeforeRun: 0,
  },
  decision: {
    verdict: 'ready-for-real-capture',
    readyForRealCapture: true,
    readyForHostFinalize: false,
    effectivelyClosable: false,
    recommendedMode: 'capture-missing-evidence',
    nextStep: 'run capture on the Intel Mac target and return the bundle/fixtures',
  },
  blockers: [
    {
      scope: 'drop',
      kind: 'fixture-json',
      target: 'exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-*.json',
      action: 'real-export fixture JSON を追加または修正する',
    },
    {
      scope: 'drop',
      kind: 'fixture-json-valid',
      target: 'exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-*.json',
      action: 'real-export fixture JSON を追加または修正する',
    },
    {
      scope: 'drop',
      kind: 'proof-summary-json',
      target: 'exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-proof.json',
      action: 'real-export-proof.json を captured 状態に更新する',
    },
    {
      scope: 'drop',
      kind: 'proof-summary-artifact-paths',
      target: 'listed paths in real-export-proof.json',
      action: 'drop scaffold を確認する',
    },
    {
      scope: 'drop',
      kind: 'proof-summary-project-linkage',
      target: 'capture.sourceProjectSlug -> artifacts.exports',
      action: 'drop scaffold を確認する',
    },
    {
      scope: 'target',
      kind: 'browser-executable',
      target: '/home/oai/Library/Caches/ms-playwright/chromium-1208/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
      action: 'Playwright Chromium か Chrome 実体を用意し、必要なら executable path を渡す',
    },
  ],
  nextActions: [
    'Intel Mac 実機で real-export JSON を 1 本採取する',
    'real-export-proof.json を captured 状態に更新し、browser path / screenshots / logs / exports を埋める',
    'browser executable / manifest / readiness report の欠損を埋めて finalize を再実行する',
    'projection after finalize is 2/6; close remaining blockers before rerun',
  ],
  commands: {
    scaffold: 'npm run scaffold:intel-mac-live-browser-proof-drop -- --source-dir exports/intel-mac-live-browser-proof-drop',
    draft: 'npm run draft:intel-mac-live-browser-proof-summary -- --source-dir exports/intel-mac-live-browser-proof-drop --browser-executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"',
    verify: 'npm run verify:intel-mac-live-browser-proof-drop -- --source-dir exports/intel-mac-live-browser-proof-drop',
    pipeline: 'npm run run:intel-mac-live-browser-proof-pipeline -- --source-dir exports/intel-mac-live-browser-proof-drop --browser-executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"',
    finalize: 'npm run finalize:intel-mac-live-browser-proof -- --source-dir exports/intel-mac-live-browser-proof-drop --browser-executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"',
    doctor: 'npm run doctor:intel-mac-live-browser-proof:refresh',
    oneShotIngest: 'npm run run:intel-mac-live-browser-proof-incoming-one-shot -- --source-dir exports/intel-mac-live-browser-proof-drop',
  },
  outputs: {
    captureScript: 'exports/intel-mac-live-browser-proof-drop/capture-on-intel-mac.sh',
    packageScript: 'exports/intel-mac-live-browser-proof-drop/package-proof-bundle.sh',
    finalizeScript: 'exports/intel-mac-live-browser-proof-drop/finalize-on-host.sh',
    readme: 'exports/intel-mac-live-browser-proof-drop/README.md',
    notes: 'exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-capture-notes.md',
    summary: 'exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-proof.json',
    operatorPacketJson: 'docs/archive/intel-mac-live-browser-proof-operator-packet.json',
    operatorPacketMarkdown: 'docs/archive/intel-mac-live-browser-proof-operator-packet.md',
  },
  prioritizedActions: [
    {
      id: 'capture-real-export',
      reason: 'real browser export JSON is still missing from the drop',
      command: './capture-on-intel-mac.sh /path/to/repo <slug> /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome $PWD',
      outputs: [
        'real-export/kalokagathia-project-<slug>.json',
        'phase5-proof-input/logs/pipeline.log',
        'phase5-proof-input/logs/verify-drop.log',
      ],
    },
    {
      id: 'draft-proof-summary',
      reason: 'proof summary JSON is incomplete or still pending',
      command: 'npm run draft:intel-mac-live-browser-proof-summary -- --source-dir exports/intel-mac-live-browser-proof-drop --browser-executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"',
      outputs: ['phase5-proof-input/real-export-proof.json'],
    },
    {
      id: 'attach-structured-logs',
      reason: 'structured proof logs are missing from the drop',
      command: 'copy build / verify / browser-console logs into phase5-proof-input/logs/',
      outputs: ['phase5-proof-input/logs/*.log'],
    },
    {
      id: 'package-bundle',
      reason: 'bundle zip is absent, so host-side ingest has no portable handoff artifact',
      command: './package-proof-bundle.sh $PWD <slug>',
      outputs: ['incoming/kalokagathia-intel-mac-live-browser-proof-<slug>.zip'],
    },
    {
      id: 'host-finalize',
      reason: 'after the drop is populated, ingest/finalize must regenerate repo-side manifests and status',
      command: './finalize-on-host.sh /path/to/repo exports/intel-mac-live-browser-proof-drop /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome',
      outputs: [
        'fixtures/project-state/real-export/manifest.json',
        'docs/archive/phase5-real-export-readiness-report.json',
        'docs/archive/intel-mac-live-browser-proof-status.json',
      ],
    },
  ],
};

export function filterProjectIntelMacProofBlockers(
  blockers: ProjectIntelMacProofBlocker[],
  scope: ProjectIntelMacProofScope,
): ProjectIntelMacProofBlocker[] {
  if (scope === 'all') return blockers;
  return blockers.filter((blocker) => blocker.scope === scope);
}

export function buildProjectIntelMacProofOperatorPacket(
  scope: ProjectIntelMacProofScope,
  report: ProjectIntelMacProofReport = CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT,
): string {
  const blockers = filterProjectIntelMacProofBlockers(report.blockers, scope);
  return [
    'ProjectIntelMacProofOperatorPacket',
    `generatedAt=${report.generatedAt}`,
    `scope=${scope}`,
    `verdict=${report.decision.verdict}`,
    `recommendedMode=${report.decision.recommendedMode}`,
    `nextStep=${report.decision.nextStep}`,
    `drop=${report.summary.dropPassed}/${report.summary.dropTotal}`,
    `target=${report.summary.targetPassed}/${report.summary.targetTotal}`,
    `blockerCount=${report.summary.blockerCount}`,
    `fixtureCount=${report.summary.fixtureCount}`,
    `structuredProofFileCount=${report.summary.structuredProofFileCount}`,
    `bundleCountBeforeRun=${report.summary.bundleCountBeforeRun}`,
    `sourceDir=${report.sourceDir}`,
    `incomingDir=${report.incomingDir}`,
    ...Object.entries(report.commands).map(([key, value]) => `command:${key}=${value}`),
    ...Object.entries(report.outputs).map(([key, value]) => `output:${key}=${value}`),
    ...blockers.flatMap((blocker) => [
      `blocker:${blocker.scope}:${blocker.kind}=${blocker.target}`,
      `blockerAction:${blocker.scope}:${blocker.kind}=${blocker.action}`,
    ]),
    ...report.prioritizedActions.flatMap((action) => [
      `priority:${action.id}:reason=${action.reason}`,
      `priority:${action.id}:command=${action.command}`,
      ...action.outputs.map((output) => `priority:${action.id}:output=${output}`),
    ]),
    ...report.nextActions.map((action, index) => `next:${index + 1}=${action}`),
  ].join('\n');
}

export function buildProjectIntelMacProofIntakePacket(
  report: ProjectIntelMacProofReport = CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT,
): string {
  return [
    'ProjectIntelMacProofIntakePacket',
    `generatedAt=${report.generatedAt}`,
    `verdict=${report.decision.verdict}`,
    `readyForRealCapture=${report.decision.readyForRealCapture ? 'yes' : 'no'}`,
    `readyForHostFinalize=${report.decision.readyForHostFinalize ? 'yes' : 'no'}`,
    `effectivelyClosable=${report.decision.effectivelyClosable ? 'yes' : 'no'}`,
    `nextStep=${report.decision.nextStep}`,
    `sourceDir=${report.sourceDir}`,
    `incomingDir=${report.incomingDir}`,
    `bundleCountBeforeRun=${report.summary.bundleCountBeforeRun}`,
    `captureScript=${report.outputs.captureScript}`,
    `packageScript=${report.outputs.packageScript}`,
    `finalizeScript=${report.outputs.finalizeScript}`,
    `readme=${report.outputs.readme}`,
    `notes=${report.outputs.notes}`,
    `summary=${report.outputs.summary}`,
    `oneShotIngest=${report.commands.oneShotIngest}`,
    ...report.prioritizedActions.slice(0, 3).flatMap((action) => [
      `intake:${action.id}:command=${action.command}`,
      ...action.outputs.map((output) => `intake:${action.id}:output=${output}`),
    ]),
  ].join('\n');
}
