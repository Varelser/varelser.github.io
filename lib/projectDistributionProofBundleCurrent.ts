import type { ProjectDistributionProofBundleId, ProjectDistributionProofBundleManifestSummary } from '../types';

export type ProjectDistributionProofBundleScope = 'all' | 'resume' | 'proof';

export interface ProjectDistributionProofBundleEntry {
  id: ProjectDistributionProofBundleId;
  category: Exclude<ProjectDistributionProofBundleScope, 'all'>;
  classId: 'full-local-dev' | 'source-only' | 'proof-combined' | 'verify-status' | 'intel-mac-closeout' | 'partial-full';
  audience: string;
  chooseThisWhen: string;
  preferInstead: string;
  recommendedUse: string;
  command: string;
  archivePattern: string;
  manifestPattern: string;
  requiresBootstrap: boolean;
  includesSource: boolean;
  includesNodeModules: boolean;
  intelMacFocused: boolean;
}

export interface ProjectDistributionProofBundleReport {
  generatedAt: string;
  stampTimeZone: string;
  outputDir: string;
  quickAdvice: {
    immediateResume: ProjectDistributionProofBundleEntry['id'];
    lightweightHandoff: ProjectDistributionProofBundleEntry['id'];
    verifyStatusOnly: ProjectDistributionProofBundleEntry['id'];
    intelMacCloseoutOnly: ProjectDistributionProofBundleEntry['id'];
  };
  bundles: ProjectDistributionProofBundleEntry[];
}

export interface ProjectDistributionProofBundleSummary {
  total: number;
  resume: number;
  proof: number;
  bootstrapRequired: number;
  intelMacFocused: number;
}

export type ProjectDistributionProofBundleManifestDeltaValue =
  | 'manifest:missing'
  | 'generatedAt'
  | 'outputDir'
  | 'quickAdvice:immediateResume'
  | 'quickAdvice:lightweightHandoff'
  | 'quickAdvice:verifyStatusOnly'
  | 'quickAdvice:intelMacCloseoutOnly'
  | 'summary:total'
  | 'summary:resume'
  | 'summary:proof'
  | 'summary:bootstrapRequired'
  | 'summary:intelMacFocused'
  | 'bundles';

export const CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT: ProjectDistributionProofBundleReport = {
  generatedAt: '2026-04-10T03:00:00.000Z',
  stampTimeZone: 'Asia/Tokyo',
  outputDir: '.artifacts',
  quickAdvice: {
    immediateResume: 'full-local-dev',
    lightweightHandoff: 'source-only-clean',
    verifyStatusOnly: 'proof-packet-verify-status',
    intelMacCloseoutOnly: 'proof-packet-intel-mac-closeout',
  },
  bundles: [
    {
      id: 'full-local-dev',
      category: 'resume',
      classId: 'full-local-dev',
      audience: 'すぐにローカル開発を再開したい人',
      chooseThisWhen: '依存込みの完全な作業環境をそのまま引き継ぎたいとき',
      preferInstead: '軽量引き継ぎだけなら source-only-clean、検証結果だけなら proof-packet-verify-status',
      recommendedUse: 'そのまま再開する local-dev complete handoff',
      command: 'npm run package:full-zip',
      archivePattern: '.artifacts/*_full-local-dev_YYYY-MM-DD.zip',
      manifestPattern: '.artifacts/*_full-local-dev_YYYY-MM-DD.manifest.json',
      requiresBootstrap: false,
      includesSource: true,
      includesNodeModules: true,
      intelMacFocused: false,
    },
    {
      id: 'source-only-clean',
      category: 'resume',
      classId: 'source-only',
      audience: '軽量なソース引き継ぎをしたい人',
      chooseThisWhen: '容量を抑えてコードと文書を渡したいとき',
      preferInstead: '即再開したいなら full-local-dev、検証だけ見たいなら proof-packet-verify-status',
      recommendedUse: '軽量なソース引き継ぎ。再開前に bootstrap が必要',
      command: 'npm run package:source-only-clean',
      archivePattern: '.artifacts/*_source-only_YYYY-MM-DD.zip',
      manifestPattern: '.artifacts/*_source-only_YYYY-MM-DD.manifest.json',
      requiresBootstrap: true,
      includesSource: true,
      includesNodeModules: false,
      intelMacFocused: false,
    },
    {
      id: 'proof-packet-verify-status',
      category: 'proof',
      classId: 'verify-status',
      audience: 'verify / status / readiness の確認だけしたい人',
      chooseThisWhen: 'コード本体ではなく、現在の検証結果と状態文書を確認したいとき',
      preferInstead: 'Intel Mac 証跡が必要なら proof-packet-intel-mac-closeout、全体監査なら proof-packet',
      recommendedUse: 'verify / status / readiness の共有',
      command: 'npm run package:proof-packet:verify-status',
      archivePattern: '.artifacts/*_proof-packet-verify-status_YYYY-MM-DD.zip',
      manifestPattern: '.artifacts/*_proof-packet-verify-status_YYYY-MM-DD.manifest.json',
      requiresBootstrap: false,
      includesSource: false,
      includesNodeModules: false,
      intelMacFocused: false,
    },
    {
      id: 'proof-packet-intel-mac-closeout',
      category: 'proof',
      classId: 'intel-mac-closeout',
      audience: 'Intel Mac target-host closeout と live-browser proof の担当者',
      chooseThisWhen: 'Intel Mac 実機側の証跡確認と handoff だけを軽く渡したいとき',
      preferInstead: 'verify/status 全般を見るなら proof-packet-verify-status、全体監査なら proof-packet',
      recommendedUse: 'Intel Mac target-host closeout と live-browser proof の引き継ぎ',
      command: 'npm run package:proof-packet:intel-mac-closeout',
      archivePattern: '.artifacts/*_proof-packet-intel-mac-closeout_YYYY-MM-DD.zip',
      manifestPattern: '.artifacts/*_proof-packet-intel-mac-closeout_YYYY-MM-DD.manifest.json',
      requiresBootstrap: false,
      includesSource: false,
      includesNodeModules: false,
      intelMacFocused: true,
    },
    {
      id: 'proof-packet',
      category: 'proof',
      classId: 'proof-combined',
      audience: 'status / verify / closeout をまとめて見たい人',
      chooseThisWhen: 'どの bundle を取るべきか未確定で、まず全体像を見たいとき',
      preferInstead: 'verify/status だけ見たいなら proof-packet-verify-status、Intel Mac 証跡だけなら proof-packet-intel-mac-closeout',
      recommendedUse: 'status / verify / closeout をまとめて参照する監査用 handoff',
      command: 'npm run package:proof-packet',
      archivePattern: '.artifacts/*_proof-packet_YYYY-MM-DD.zip',
      manifestPattern: '.artifacts/*_proof-packet_YYYY-MM-DD.manifest.json',
      requiresBootstrap: false,
      includesSource: false,
      includesNodeModules: false,
      intelMacFocused: false,
    },
    {
      id: 'platform-specific-runtime-bundled',
      category: 'resume',
      classId: 'partial-full',
      audience: 'host 依存 runtime を含む partial full handoff が必要な人',
      chooseThisWhen: '対象 host 向けの runtime 同梱 bundle を扱いたいとき',
      preferInstead: '一般的な再開なら full-local-dev、軽量引き継ぎなら source-only-clean',
      recommendedUse: 'host 依存 runtime を含む partial full handoff',
      command: 'npm run package:full-zip:partial',
      archivePattern: '.artifacts/*_platform-specific-runtime-bundled_YYYY-MM-DD.zip',
      manifestPattern: '.artifacts/*_platform-specific-runtime-bundled_YYYY-MM-DD.manifest.json',
      requiresBootstrap: false,
      includesSource: true,
      includesNodeModules: true,
      intelMacFocused: false,
    },
  ],
};

export function summarizeProjectDistributionProofBundles(
  report: ProjectDistributionProofBundleReport = CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
): ProjectDistributionProofBundleSummary {
  return {
    total: report.bundles.length,
    resume: report.bundles.filter((bundle) => bundle.category === 'resume').length,
    proof: report.bundles.filter((bundle) => bundle.category === 'proof').length,
    bootstrapRequired: report.bundles.filter((bundle) => bundle.requiresBootstrap).length,
    intelMacFocused: report.bundles.filter((bundle) => bundle.intelMacFocused).length,
  };
}

export function buildProjectDistributionProofBundleManifestSummary(
  report: ProjectDistributionProofBundleReport = CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
): ProjectDistributionProofBundleManifestSummary {
  const summary = summarizeProjectDistributionProofBundles(report);
  return {
    generatedAt: report.generatedAt,
    outputDir: report.outputDir,
    immediateResume: report.quickAdvice.immediateResume,
    lightweightHandoff: report.quickAdvice.lightweightHandoff,
    verifyStatusOnly: report.quickAdvice.verifyStatusOnly,
    intelMacCloseoutOnly: report.quickAdvice.intelMacCloseoutOnly,
    total: summary.total,
    resume: summary.resume,
    proof: summary.proof,
    bootstrapRequired: summary.bootstrapRequired,
    intelMacFocused: summary.intelMacFocused,
    bundleIds: report.bundles.map((bundle) => bundle.id),
  };
}

export function buildProjectDistributionProofBundleManifestDeltaValues(
  manifestSummary?: ProjectDistributionProofBundleManifestSummary | null,
  report: ProjectDistributionProofBundleReport = CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
): ProjectDistributionProofBundleManifestDeltaValue[] {
  if (!manifestSummary) return ['manifest:missing'];
  const current = buildProjectDistributionProofBundleManifestSummary(report);
  const deltas: ProjectDistributionProofBundleManifestDeltaValue[] = [];
  if (manifestSummary.generatedAt !== current.generatedAt) deltas.push('generatedAt');
  if (manifestSummary.outputDir !== current.outputDir) deltas.push('outputDir');
  if (manifestSummary.immediateResume !== current.immediateResume) deltas.push('quickAdvice:immediateResume');
  if (manifestSummary.lightweightHandoff !== current.lightweightHandoff) deltas.push('quickAdvice:lightweightHandoff');
  if (manifestSummary.verifyStatusOnly !== current.verifyStatusOnly) deltas.push('quickAdvice:verifyStatusOnly');
  if (manifestSummary.intelMacCloseoutOnly !== current.intelMacCloseoutOnly) deltas.push('quickAdvice:intelMacCloseoutOnly');
  if (manifestSummary.total !== current.total) deltas.push('summary:total');
  if (manifestSummary.resume !== current.resume) deltas.push('summary:resume');
  if (manifestSummary.proof !== current.proof) deltas.push('summary:proof');
  if (manifestSummary.bootstrapRequired !== current.bootstrapRequired) deltas.push('summary:bootstrapRequired');
  if (manifestSummary.intelMacFocused !== current.intelMacFocused) deltas.push('summary:intelMacFocused');
  if (manifestSummary.bundleIds.join('|') !== current.bundleIds.join('|')) deltas.push('bundles');
  return deltas;
}

export function filterProjectDistributionProofBundles(
  bundles: ProjectDistributionProofBundleEntry[],
  scope: ProjectDistributionProofBundleScope,
): ProjectDistributionProofBundleEntry[] {
  if (scope === 'all') return bundles;
  return bundles.filter((bundle) => bundle.category === scope);
}

export function buildProjectDistributionProofBundlePacket(
  scope: ProjectDistributionProofBundleScope,
  report: ProjectDistributionProofBundleReport = CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
): string {
  const bundles = filterProjectDistributionProofBundles(report.bundles, scope);
  const summary = summarizeProjectDistributionProofBundles(report);
  return [
    'ProjectDistributionProofBundlePacket',
    `generatedAt=${report.generatedAt}`,
    `stampTimeZone=${report.stampTimeZone}`,
    `outputDir=${report.outputDir}`,
    `scope=${scope}`,
    `total=${summary.total}`,
    `resume=${summary.resume}`,
    `proof=${summary.proof}`,
    `bootstrapRequired=${summary.bootstrapRequired}`,
    `intelMacFocused=${summary.intelMacFocused}`,
    `immediateResume=${report.quickAdvice.immediateResume}`,
    `lightweightHandoff=${report.quickAdvice.lightweightHandoff}`,
    `verifyStatusOnly=${report.quickAdvice.verifyStatusOnly}`,
    `intelMacCloseoutOnly=${report.quickAdvice.intelMacCloseoutOnly}`,
    ...bundles.flatMap((bundle) => [
      `[bundle:${bundle.id}]`,
      `category=${bundle.category}`,
      `classId=${bundle.classId}`,
      `audience=${bundle.audience}`,
      `chooseThisWhen=${bundle.chooseThisWhen}`,
      `preferInstead=${bundle.preferInstead}`,
      `recommendedUse=${bundle.recommendedUse}`,
      `command=${bundle.command}`,
      `archivePattern=${bundle.archivePattern}`,
      `manifestPattern=${bundle.manifestPattern}`,
      `requiresBootstrap=${bundle.requiresBootstrap ? 'yes' : 'no'}`,
      `includesSource=${bundle.includesSource ? 'yes' : 'no'}`,
      `includesNodeModules=${bundle.includesNodeModules ? 'yes' : 'no'}`,
      `intelMacFocused=${bundle.intelMacFocused ? 'yes' : 'no'}`,
    ]),
  ].join('\n');
}
