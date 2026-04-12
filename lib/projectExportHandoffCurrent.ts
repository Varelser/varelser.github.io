import type { ProjectExportHandoffManifestSummary, ProjectFutureNativeSpecialistRouteEntry } from '../types';
import type { FutureNativeProjectRouteSummary } from './futureNativePanelSummaries';
import type { ProjectFutureNativeCapabilityMatrix } from './projectFutureNativeCapabilityMatrix';
import type { ProjectWebgpuCapabilityReport } from './projectWebgpuCapabilityCurrent';
import type { ProjectIntelMacProofReport } from './projectIntelMacProofCurrent';
import type { ProjectDistributionProofBundleReport } from './projectDistributionProofBundleCurrent';
import { buildProjectDistributionProofBundleManifestSummary } from './projectDistributionProofBundleCurrent';

export interface BuildProjectExportHandoffManifestSummaryArgs {
  summary: FutureNativeProjectRouteSummary;
  matrix: ProjectFutureNativeCapabilityMatrix;
  specialistRouteEntries: ProjectFutureNativeSpecialistRouteEntry[];
  specialistRouteControlDiffsByFamily: Map<string, string[]>;
  specialistManifestDiffsByFamily: Map<string, string[]>;
  distributionBundleManifestDriftCount: number;
  webgpuReport: ProjectWebgpuCapabilityReport;
  intelMacReport: ProjectIntelMacProofReport;
  distributionBundleReport: ProjectDistributionProofBundleReport;
}

export type ProjectExportHandoffManifestDeltaValue =
  | 'manifest:missing'
  | 'generatedAt'
  | 'routeCount'
  | 'warningFamilyCount'
  | 'specialistDriftCount'
  | 'specialistManifestDriftCount'
  | 'bundleManifestDriftCount'
  | 'webgpuDirectCount'
  | 'webgpuLimitedCount'
  | 'webgpuFallbackOnlyCount'
  | 'intelMacVerdict'
  | 'intelMacDropProgress'
  | 'intelMacTargetProgress'
  | 'intelMacBlockerCount'
  | 'bundleImmediateResume'
  | 'bundleLightweightHandoff'
  | 'bundleVerifyStatusOnly'
  | 'bundleIntelMacCloseoutOnly';

function formatProgress(passed: number, total: number): string {
  return `${passed}/${total}`;
}

function countSpecialistDrift(
  specialistRouteEntries: ProjectFutureNativeSpecialistRouteEntry[],
  diffsByFamily: Map<string, string[]>,
): number {
  return specialistRouteEntries.filter((entry) => (diffsByFamily.get(entry.familyId) ?? []).length > 0).length;
}

function countSpecialistManifestDrift(
  specialistRouteEntries: ProjectFutureNativeSpecialistRouteEntry[],
  diffsByFamily: Map<string, string[]>,
): number {
  return specialistRouteEntries.filter((entry) => (diffsByFamily.get(entry.familyId) ?? []).length > 0).length;
}

export function buildProjectExportHandoffManifestSummary(
  args: BuildProjectExportHandoffManifestSummaryArgs,
): ProjectExportHandoffManifestSummary {
  const bundleSummary = buildProjectDistributionProofBundleManifestSummary(args.distributionBundleReport);
  return {
    generatedAt: args.distributionBundleReport.generatedAt,
    routeCount: args.summary.currentRoutes.length,
    warningFamilyCount: args.matrix.rows.filter((row) => row.warnings.length > 0).length,
    specialistDriftCount: countSpecialistDrift(args.specialistRouteEntries, args.specialistRouteControlDiffsByFamily),
    specialistManifestDriftCount: countSpecialistManifestDrift(args.specialistRouteEntries, args.specialistManifestDiffsByFamily),
    bundleManifestDriftCount: args.distributionBundleManifestDriftCount,
    webgpuDirectCount: args.webgpuReport.summary.direct,
    webgpuLimitedCount: args.webgpuReport.summary.limited,
    webgpuFallbackOnlyCount: args.webgpuReport.summary.fallbackOnly,
    intelMacVerdict: args.intelMacReport.decision.verdict,
    intelMacDropProgress: formatProgress(args.intelMacReport.summary.dropPassed, args.intelMacReport.summary.dropTotal),
    intelMacTargetProgress: formatProgress(args.intelMacReport.summary.targetPassed, args.intelMacReport.summary.targetTotal),
    intelMacBlockerCount: args.intelMacReport.summary.blockerCount,
    bundleImmediateResume: bundleSummary.immediateResume,
    bundleLightweightHandoff: bundleSummary.lightweightHandoff,
    bundleVerifyStatusOnly: bundleSummary.verifyStatusOnly,
    bundleIntelMacCloseoutOnly: bundleSummary.intelMacCloseoutOnly,
  };
}

export function buildProjectExportHandoffPacket(summary: ProjectExportHandoffManifestSummary): string {
  return [
    'ProjectExportHandoffPacket',
    `generatedAt=${summary.generatedAt}`,
    `routeCount=${summary.routeCount}`,
    `warningFamilyCount=${summary.warningFamilyCount}`,
    `specialistDriftCount=${summary.specialistDriftCount}`,
    `specialistManifestDriftCount=${summary.specialistManifestDriftCount}`,
    `bundleManifestDriftCount=${summary.bundleManifestDriftCount}`,
    `webgpuDirectCount=${summary.webgpuDirectCount}`,
    `webgpuLimitedCount=${summary.webgpuLimitedCount}`,
    `webgpuFallbackOnlyCount=${summary.webgpuFallbackOnlyCount}`,
    `intelMacVerdict=${summary.intelMacVerdict}`,
    `intelMacDropProgress=${summary.intelMacDropProgress}`,
    `intelMacTargetProgress=${summary.intelMacTargetProgress}`,
    `intelMacBlockerCount=${summary.intelMacBlockerCount}`,
    `bundleImmediateResume=${summary.bundleImmediateResume}`,
    `bundleLightweightHandoff=${summary.bundleLightweightHandoff}`,
    `bundleVerifyStatusOnly=${summary.bundleVerifyStatusOnly}`,
    `bundleIntelMacCloseoutOnly=${summary.bundleIntelMacCloseoutOnly}`,
  ].join('\n');
}

export function buildProjectExportHandoffManifestDeltaValues(
  manifestSummary?: ProjectExportHandoffManifestSummary | null,
  currentSummary?: ProjectExportHandoffManifestSummary,
): ProjectExportHandoffManifestDeltaValue[] {
  if (!manifestSummary) return ['manifest:missing'];
  if (!currentSummary) return [];
  const deltas: ProjectExportHandoffManifestDeltaValue[] = [];
  if (manifestSummary.generatedAt !== currentSummary.generatedAt) deltas.push('generatedAt');
  if (manifestSummary.routeCount !== currentSummary.routeCount) deltas.push('routeCount');
  if (manifestSummary.warningFamilyCount !== currentSummary.warningFamilyCount) deltas.push('warningFamilyCount');
  if (manifestSummary.specialistDriftCount !== currentSummary.specialistDriftCount) deltas.push('specialistDriftCount');
  if (manifestSummary.specialistManifestDriftCount !== currentSummary.specialistManifestDriftCount) deltas.push('specialistManifestDriftCount');
  if (manifestSummary.bundleManifestDriftCount !== currentSummary.bundleManifestDriftCount) deltas.push('bundleManifestDriftCount');
  if (manifestSummary.webgpuDirectCount !== currentSummary.webgpuDirectCount) deltas.push('webgpuDirectCount');
  if (manifestSummary.webgpuLimitedCount !== currentSummary.webgpuLimitedCount) deltas.push('webgpuLimitedCount');
  if (manifestSummary.webgpuFallbackOnlyCount !== currentSummary.webgpuFallbackOnlyCount) deltas.push('webgpuFallbackOnlyCount');
  if (manifestSummary.intelMacVerdict !== currentSummary.intelMacVerdict) deltas.push('intelMacVerdict');
  if (manifestSummary.intelMacDropProgress !== currentSummary.intelMacDropProgress) deltas.push('intelMacDropProgress');
  if (manifestSummary.intelMacTargetProgress !== currentSummary.intelMacTargetProgress) deltas.push('intelMacTargetProgress');
  if (manifestSummary.intelMacBlockerCount !== currentSummary.intelMacBlockerCount) deltas.push('intelMacBlockerCount');
  if (manifestSummary.bundleImmediateResume !== currentSummary.bundleImmediateResume) deltas.push('bundleImmediateResume');
  if (manifestSummary.bundleLightweightHandoff !== currentSummary.bundleLightweightHandoff) deltas.push('bundleLightweightHandoff');
  if (manifestSummary.bundleVerifyStatusOnly !== currentSummary.bundleVerifyStatusOnly) deltas.push('bundleVerifyStatusOnly');
  if (manifestSummary.bundleIntelMacCloseoutOnly !== currentSummary.bundleIntelMacCloseoutOnly) deltas.push('bundleIntelMacCloseoutOnly');
  return deltas;
}
