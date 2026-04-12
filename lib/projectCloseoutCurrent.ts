import type { ProjectCloseoutCurrentSummary, ProjectExportHandoffManifestSummary } from '../types';
import type { ProjectDistributionProofBundleReport } from './projectDistributionProofBundleCurrent';
import type { ProjectIntelMacProofReport } from './projectIntelMacProofCurrent';
import type { ProjectWebgpuCapabilityReport } from './projectWebgpuCapabilityCurrent';

export type ProjectCloseoutCurrentDeltaValue =
  | 'manifest:missing'
  | 'generatedAt'
  | 'repoReady'
  | 'overallCompletionPercent'
  | 'routeCount'
  | 'warningFamilyCount'
  | 'specialistDriftCount'
  | 'specialistManifestDriftCount'
  | 'bundleManifestDriftCount'
  | 'webgpuDirectCount'
  | 'webgpuLimitedCount'
  | 'webgpuFallbackOnlyCount'
  | 'intelMacVerdict'
  | 'intelMacReadyForRealCapture'
  | 'intelMacReadyForHostFinalize'
  | 'intelMacDropProgress'
  | 'intelMacTargetProgress'
  | 'intelMacBlockerCount'
  | 'recommendedResumeBundle'
  | 'recommendedProofBundle'
  | 'recommendedIntelMacBundle'
  | 'operatorCommand'
  | 'intakeCommand';

export interface BuildProjectCloseoutCurrentSummaryArgs {
  handoffSummary: ProjectExportHandoffManifestSummary;
  webgpuReport: ProjectWebgpuCapabilityReport;
  intelMacReport: ProjectIntelMacProofReport;
  distributionBundleReport: ProjectDistributionProofBundleReport;
}

function parseProgress(value: string): { passed: number; total: number } {
  const match = value.match(/^(\d+)\/(\d+)$/u);
  if (!match) return { passed: 0, total: 0 };
  return { passed: Number(match[1] ?? 0), total: Number(match[2] ?? 0) };
}

function computeOverallCompletionPercent(args: BuildProjectCloseoutCurrentSummaryArgs): number {
  const drop = parseProgress(args.handoffSummary.intelMacDropProgress);
  const target = parseProgress(args.handoffSummary.intelMacTargetProgress);
  const totalClosureUnits =
    args.handoffSummary.routeCount +
    args.webgpuReport.summary.direct +
    args.webgpuReport.summary.limited +
    args.webgpuReport.summary.fallbackOnly +
    drop.total +
    target.total;
  const closedUnits = args.handoffSummary.routeCount + args.webgpuReport.summary.direct + drop.passed + target.passed;
  if (totalClosureUnits <= 0) return 0;
  return Math.round((closedUnits / totalClosureUnits) * 100);
}

export function buildProjectCloseoutCurrentSummary(
  args: BuildProjectCloseoutCurrentSummaryArgs,
): ProjectCloseoutCurrentSummary {
  return {
    generatedAt: args.distributionBundleReport.generatedAt,
    repoReady: args.handoffSummary.warningFamilyCount === 0,
    overallCompletionPercent: computeOverallCompletionPercent(args),
    routeCount: args.handoffSummary.routeCount,
    warningFamilyCount: args.handoffSummary.warningFamilyCount,
    specialistDriftCount: args.handoffSummary.specialistDriftCount,
    specialistManifestDriftCount: args.handoffSummary.specialistManifestDriftCount,
    bundleManifestDriftCount: args.handoffSummary.bundleManifestDriftCount,
    webgpuDirectCount: args.handoffSummary.webgpuDirectCount,
    webgpuLimitedCount: args.handoffSummary.webgpuLimitedCount,
    webgpuFallbackOnlyCount: args.handoffSummary.webgpuFallbackOnlyCount,
    intelMacVerdict: args.handoffSummary.intelMacVerdict,
    intelMacReadyForRealCapture: args.intelMacReport.decision.readyForRealCapture,
    intelMacReadyForHostFinalize: args.intelMacReport.decision.readyForHostFinalize,
    intelMacDropProgress: args.handoffSummary.intelMacDropProgress,
    intelMacTargetProgress: args.handoffSummary.intelMacTargetProgress,
    intelMacBlockerCount: args.handoffSummary.intelMacBlockerCount,
    recommendedResumeBundle: args.distributionBundleReport.quickAdvice.immediateResume,
    recommendedProofBundle: args.distributionBundleReport.quickAdvice.verifyStatusOnly,
    recommendedIntelMacBundle: args.distributionBundleReport.quickAdvice.intelMacCloseoutOnly,
    operatorCommand: args.intelMacReport.commands.doctor,
    intakeCommand: args.intelMacReport.commands.oneShotIngest,
  };
}

export function buildProjectCloseoutCurrentPacket(summary: ProjectCloseoutCurrentSummary): string {
  return [
    'ProjectCloseoutCurrentPacket',
    `generatedAt=${summary.generatedAt}`,
    `repoReady=${summary.repoReady ? 'yes' : 'no'}`,
    `overallCompletionPercent=${summary.overallCompletionPercent}`,
    `routeCount=${summary.routeCount}`,
    `warningFamilyCount=${summary.warningFamilyCount}`,
    `specialistDriftCount=${summary.specialistDriftCount}`,
    `specialistManifestDriftCount=${summary.specialistManifestDriftCount}`,
    `bundleManifestDriftCount=${summary.bundleManifestDriftCount}`,
    `webgpu=${summary.webgpuDirectCount}/${summary.webgpuLimitedCount}/${summary.webgpuFallbackOnlyCount}`,
    `intelMacVerdict=${summary.intelMacVerdict}`,
    `intelMacReadyForRealCapture=${summary.intelMacReadyForRealCapture ? 'yes' : 'no'}`,
    `intelMacReadyForHostFinalize=${summary.intelMacReadyForHostFinalize ? 'yes' : 'no'}`,
    `intelMacDropProgress=${summary.intelMacDropProgress}`,
    `intelMacTargetProgress=${summary.intelMacTargetProgress}`,
    `intelMacBlockerCount=${summary.intelMacBlockerCount}`,
    `recommendedResumeBundle=${summary.recommendedResumeBundle}`,
    `recommendedProofBundle=${summary.recommendedProofBundle}`,
    `recommendedIntelMacBundle=${summary.recommendedIntelMacBundle}`,
    `operatorCommand=${summary.operatorCommand}`,
    `intakeCommand=${summary.intakeCommand}`,
  ].join('\n');
}

export function buildProjectCloseoutCurrentDeltaValues(
  manifestSummary?: ProjectCloseoutCurrentSummary | null,
  currentSummary?: ProjectCloseoutCurrentSummary,
): ProjectCloseoutCurrentDeltaValue[] {
  if (!manifestSummary) return ['manifest:missing'];
  if (!currentSummary) return [];
  const deltas: ProjectCloseoutCurrentDeltaValue[] = [];
  if (manifestSummary.generatedAt !== currentSummary.generatedAt) deltas.push('generatedAt');
  if (manifestSummary.repoReady !== currentSummary.repoReady) deltas.push('repoReady');
  if (manifestSummary.overallCompletionPercent !== currentSummary.overallCompletionPercent) deltas.push('overallCompletionPercent');
  if (manifestSummary.routeCount !== currentSummary.routeCount) deltas.push('routeCount');
  if (manifestSummary.warningFamilyCount !== currentSummary.warningFamilyCount) deltas.push('warningFamilyCount');
  if (manifestSummary.specialistDriftCount !== currentSummary.specialistDriftCount) deltas.push('specialistDriftCount');
  if (manifestSummary.specialistManifestDriftCount !== currentSummary.specialistManifestDriftCount) deltas.push('specialistManifestDriftCount');
  if (manifestSummary.bundleManifestDriftCount !== currentSummary.bundleManifestDriftCount) deltas.push('bundleManifestDriftCount');
  if (manifestSummary.webgpuDirectCount !== currentSummary.webgpuDirectCount) deltas.push('webgpuDirectCount');
  if (manifestSummary.webgpuLimitedCount !== currentSummary.webgpuLimitedCount) deltas.push('webgpuLimitedCount');
  if (manifestSummary.webgpuFallbackOnlyCount !== currentSummary.webgpuFallbackOnlyCount) deltas.push('webgpuFallbackOnlyCount');
  if (manifestSummary.intelMacVerdict !== currentSummary.intelMacVerdict) deltas.push('intelMacVerdict');
  if (manifestSummary.intelMacReadyForRealCapture !== currentSummary.intelMacReadyForRealCapture) deltas.push('intelMacReadyForRealCapture');
  if (manifestSummary.intelMacReadyForHostFinalize !== currentSummary.intelMacReadyForHostFinalize) deltas.push('intelMacReadyForHostFinalize');
  if (manifestSummary.intelMacDropProgress !== currentSummary.intelMacDropProgress) deltas.push('intelMacDropProgress');
  if (manifestSummary.intelMacTargetProgress !== currentSummary.intelMacTargetProgress) deltas.push('intelMacTargetProgress');
  if (manifestSummary.intelMacBlockerCount !== currentSummary.intelMacBlockerCount) deltas.push('intelMacBlockerCount');
  if (manifestSummary.recommendedResumeBundle !== currentSummary.recommendedResumeBundle) deltas.push('recommendedResumeBundle');
  if (manifestSummary.recommendedProofBundle !== currentSummary.recommendedProofBundle) deltas.push('recommendedProofBundle');
  if (manifestSummary.recommendedIntelMacBundle !== currentSummary.recommendedIntelMacBundle) deltas.push('recommendedIntelMacBundle');
  if (manifestSummary.operatorCommand !== currentSummary.operatorCommand) deltas.push('operatorCommand');
  if (manifestSummary.intakeCommand !== currentSummary.intakeCommand) deltas.push('intakeCommand');
  return deltas;
}
