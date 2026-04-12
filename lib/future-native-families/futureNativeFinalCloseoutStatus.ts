import { buildFutureNativeDedicatedCoreOwnershipReport } from './futureNativeDedicatedCoreOwnershipReport';
import { buildFutureNativeExpressionCoverageReport } from './futureNativeExpressionCoverage';

export interface FutureNativeFinalCloseoutStatus {
  generatedAt: string;
  summary: {
    totalFamilies: number;
    independentFamilies: number;
    dedicatedSharedCoreFamilies: number;
    closureProgressPercent: number;
    dedicatedCoreOwnershipFamilies: number;
    fullyOwnedKernelFamilies: number;
    remainingInternalTrackCount: number;
    externalBlockerCount: number;
    internalWorkComplete: boolean;
    intelMacTargetReadiness: string;
    intelMacDropIntake: string;
  };
  remainingInternalTracks: string[];
  externalBlockers: string[];
}

export function buildFutureNativeFinalCloseoutStatus(): FutureNativeFinalCloseoutStatus {
  const expression = buildFutureNativeExpressionCoverageReport();
  const ownership = buildFutureNativeDedicatedCoreOwnershipReport();

  const remainingInternalTracks: string[] = [];
  if (expression.summary.dedicatedSharedCoreCount > 0) {
    remainingInternalTracks.push('shared-core families still depend on shared substrate kernels');
  }
  if (ownership.summary.fullyOwnedKernelFamilyCount < ownership.summary.familyCount) {
    remainingInternalTracks.push('dedicated core ownership exists, but fully-owned kernel extraction is incomplete');
  }

  const externalBlockers = ['intel-mac live browser proof drop is still incomplete (4/11)'];

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalFamilies: expression.summary.totalFamilies,
      independentFamilies: expression.summary.independentCount,
      dedicatedSharedCoreFamilies: expression.summary.dedicatedSharedCoreCount,
      closureProgressPercent: expression.summary.closureProgressPercent,
      dedicatedCoreOwnershipFamilies: ownership.summary.familyCount,
      fullyOwnedKernelFamilies: ownership.summary.fullyOwnedKernelFamilyCount,
      remainingInternalTrackCount: remainingInternalTracks.length,
      externalBlockerCount: externalBlockers.length,
      internalWorkComplete: remainingInternalTracks.length === 0,
      intelMacTargetReadiness: '5/6',
      intelMacDropIntake: '4/11',
    },
    remainingInternalTracks,
    externalBlockers,
  };
}

export function renderFutureNativeFinalCloseoutStatusMarkdown(
  status = buildFutureNativeFinalCloseoutStatus(),
): string {
  const lines: string[] = [
    '# Future-Native Final Closeout Status',
    '',
    `- generatedAt: ${status.generatedAt}`,
    `- totalFamilies: ${status.summary.totalFamilies}`,
    `- independentFamilies: ${status.summary.independentFamilies}`,
    `- dedicatedSharedCoreFamilies: ${status.summary.dedicatedSharedCoreFamilies}`,
    `- closureProgressPercent: ${status.summary.closureProgressPercent.toFixed(2)}`,
    `- dedicatedCoreOwnershipFamilies: ${status.summary.dedicatedCoreOwnershipFamilies}`,
    `- fullyOwnedKernelFamilies: ${status.summary.fullyOwnedKernelFamilies}`,
    `- remainingInternalTrackCount: ${status.summary.remainingInternalTrackCount}`,
    `- externalBlockerCount: ${status.summary.externalBlockerCount}`,
    `- internalWorkComplete: ${status.summary.internalWorkComplete}`,
    `- intelMacTargetReadiness: ${status.summary.intelMacTargetReadiness}`,
    `- intelMacDropIntake: ${status.summary.intelMacDropIntake}`,
    '',
    '## Remaining internal tracks',
  ];

  if (status.remainingInternalTracks.length === 0) {
    lines.push('- none');
  } else {
    for (const item of status.remainingInternalTracks) lines.push(`- ${item}`);
  }

  lines.push('', '## External blockers');
  for (const item of status.externalBlockers) lines.push(`- ${item}`);
  return lines.join('\n');
}
