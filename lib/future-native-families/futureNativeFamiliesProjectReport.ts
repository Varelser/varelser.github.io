import type { ParticleConfig, ProjectFutureNativeSerializationSnapshot } from '../../types';
import { normalizeConfig } from '../appStateConfig';
import { buildProjectData } from '../projectStateData';
import {
  type FutureNativeProjectRouteHighlight,
  type FutureNativeProjectRouteProfile,
} from './futureNativeVolumetricRouteTypes';
import {
  buildAllProjectFutureNativeIntegrationSnapshots,
  buildProjectFutureNativeIntegrationSummary,
  type ProjectFutureNativeIntegrationSnapshot,
} from './futureNativeFamiliesIntegration';
import {
  assertFutureNativeVerificationReport,
  verifyAllProjectFutureNativeIntegrationSnapshots,
  type FutureNativeVerificationReport,
} from './futureNativeFamiliesVerifier';
import {
  buildProjectVolumetricRouteHighlights,
} from './futureNativeVolumetricRouteHighlights';
import { isVolumetricRouteHighlightFamilyId } from './futureNativeVolumetricFamilyMetadata';
import { getFutureNativeVolumetricBundleCoverage } from './futureNativeVolumetricBundleCoverage';
import {
  buildProjectNonVolumetricRouteHighlights,
  type FutureNativeProjectNonVolumetricRouteHighlight,
} from './futureNativeNonVolumetricRouteHighlights';
import { buildFutureNativeExpressionCoverageReport } from './futureNativeExpressionCoverage';
import { buildFutureNativeDedicatedRuntimeFacadeReport } from './futureNativeDedicatedRuntimeFacadeReport';
import { isNonVolumetricBindingRegistrationFamilyId } from './futureNativeNonVolumetricFamilyMetadata';
import {
  buildAllFutureNativeSpecialistPacketSnapshots,
  buildAllFutureNativeSpecialistRouteSnapshots,
  type FutureNativeSpecialistPacketSnapshot,
  type FutureNativeSpecialistRouteSnapshot,
} from './futureNativeFamiliesSpecialistPackets';
import { buildFutureNativeSpecialistRouteAggregateSummary } from './futureNativeFamiliesSpecialistRouteSummary';
import {
  buildFutureNativeSpecialistRouteFixtureDiffs,
  buildFutureNativeSpecialistRouteFixtureSummary,
  type FutureNativeSpecialistRouteFixtureDiff,
  type FutureNativeSpecialistRouteFixtureSummary,
} from './futureNativeFamiliesSpecialistRouteFixtures';

export interface FutureNativeProjectSnapshotScenario {
  id: string;
  title: string;
  config: ParticleConfig;
}

export interface FutureNativeProjectSnapshotReport {
  generatedAt: string;
  summary: {
    scenarioCount: number;
    baselineFamilyCount: number;
    averageProgressPercent: number;
    totalUiControls: number;
    topProgressFamilyId: string;
    routeHighlightCount: number;
    specialistPacketCount: number;
    specialistRouteCount: number;
    specialistManualSelectionCount: number;
    specialistFallbackActiveCount: number;
    specialistPinnedOverrideCount: number;
    specialistCapabilityDeltaCount: number;
    specialistOverrideHistoryCount: number;
    specialistFallbackHistoryCount: number;
    specialistCapabilityTrendCount: number;
    specialistWarningRouteCount: number;
    specialistRouteFixtureDiffCount: number;
    specialistRouteFixtureWarningCount: number;
    nonVolumetricRouteHighlightCount: number;
    nonVolumetricCoverageHighlightCount: number;
    volumetricCoverageHighlightCount: number;
    expressionIndependentCount: number;
    expressionDedicatedSharedCoreCount: number;
    expressionDerivedOnSubstrateCount: number;
    expressionSurfaceThinCount: number;
    expressionStageMismatchCount: number;
    expressionClosureProgressPercent: number;
    dedicatedRuntimeFacadeFamilyCount: number;
    dedicatedRuntimeFacadeRouteCount: number;
    dedicatedRuntimeFacadeCoverageCount: number;
    dedicatedRuntimeFacadeAverageWarmFrameCount: number;
  };
  baseline: {
    summary: ReturnType<typeof buildProjectFutureNativeIntegrationSummary>;
    verification: FutureNativeVerificationReport['summary'];
    firstWave: ProjectFutureNativeIntegrationSnapshot[];
    routeHighlights: FutureNativeProjectRouteHighlight[];
    nonVolumetricRouteHighlights: FutureNativeProjectNonVolumetricRouteHighlight[];
    specialistPackets: FutureNativeSpecialistPacketSnapshot[];
    specialistRoutes: FutureNativeSpecialistRouteSnapshot[];
  };
  fixtureComparison: {
    summary: FutureNativeSpecialistRouteFixtureSummary;
    routes: FutureNativeSpecialistRouteFixtureDiff[];
  };
  scenarios: Array<{
    id: string;
    title: string;
    familyCount: number;
    averageProgressPercent: number;
    totalRuntimeConfigValues: number;
    totalRuntimeStateValues: number;
    specialistRouteCount: number;
    families: ProjectFutureNativeSerializationSnapshot['firstWave'];
  }>;
}

export type { FutureNativeProjectRouteHighlight, FutureNativeProjectRouteProfile };

export const futureNativeProjectSnapshotScenarios: FutureNativeProjectSnapshotScenario[] = [
  { id: 'baseline-project-json', title: 'Baseline project JSON', config: normalizeConfig({}) },
  {
    id: 'hybrid-video-project-json',
    title: 'Hybrid/video project JSON',
    config: normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'surface_shell',
      layer2Source: 'video',
      layer2ConnectionEnabled: true,
      layer2GhostTrailEnabled: true,
      layer2MaterialStyle: 'glass',
      postFxStackProfile: 'dream-smear',
      postBloomEnabled: true,
    }),
  },
  {
    id: 'text-fiber-gpgpu-project-json',
    title: 'Text/fiber + GPGPU project JSON',
    config: normalizeConfig({
      layer3Enabled: true,
      layer3Type: 'fiber_field',
      layer3Source: 'text',
      layer3MaterialStyle: 'hologram',
      gpgpuEnabled: true,
      gpgpuExecutionPreference: 'webgpu',
      gpgpuWebGPUEnabled: true,
      gpgpuRibbonEnabled: true,
      gpgpuMetaballEnabled: true,
    }),
  },
];

let futureNativeProjectSnapshotReportCache: FutureNativeProjectSnapshotReport | null = null;

export function invalidateFutureNativeProjectSnapshotReportCache(): void {
  futureNativeProjectSnapshotReportCache = null;
}

function createProjectFutureNativeSnapshot(config: ParticleConfig): ProjectFutureNativeSerializationSnapshot {
  const snapshot = buildProjectData({
    name: 'Future native project snapshot',
    config,
    activePresetId: null,
    presetBlendDuration: 1.5,
    sequenceLoopEnabled: true,
    presets: [],
    presetSequence: [],
    ui: {
      isPlaying: false,
      isPanelOpen: true,
      videoExportMode: 'current',
      videoDurationSeconds: 8,
      videoFps: 30,
    },
  }).serialization.futureNative;
  if (!snapshot) {
    throw new Error('future-native project snapshot missing serialization.futureNative');
  }
  return snapshot;
}

export function buildFutureNativeProjectSnapshotReport(options: { refresh?: boolean } = {}): FutureNativeProjectSnapshotReport {
  if (!options.refresh && futureNativeProjectSnapshotReportCache) return futureNativeProjectSnapshotReportCache;

  const baselineSnapshots = buildAllProjectFutureNativeIntegrationSnapshots();
  const baselineSummary = buildProjectFutureNativeIntegrationSummary(baselineSnapshots);
  const baselineVerification = verifyAllProjectFutureNativeIntegrationSnapshots(baselineSnapshots);
  assertFutureNativeVerificationReport(baselineVerification, 'future-native-project-report-baseline');
  const routeHighlights = buildProjectVolumetricRouteHighlights();
  const nonVolumetricRouteHighlights = buildProjectNonVolumetricRouteHighlights();
  const specialistPackets = buildAllFutureNativeSpecialistPacketSnapshots();
  const specialistRoutes = buildAllFutureNativeSpecialistRouteSnapshots();
  const specialistRouteSummary = buildFutureNativeSpecialistRouteAggregateSummary(specialistRoutes);
  const expressionCoverage = buildFutureNativeExpressionCoverageReport();
  const dedicatedRuntimeFacades = buildFutureNativeDedicatedRuntimeFacadeReport();
  const fixtureDiffs = buildFutureNativeSpecialistRouteFixtureDiffs();
  const fixtureSummary = buildFutureNativeSpecialistRouteFixtureSummary(fixtureDiffs);
  const scenarios = futureNativeProjectSnapshotScenarios.map((scenario) => {
    const snapshot = createProjectFutureNativeSnapshot(scenario.config);
    return {
      id: scenario.id,
      title: scenario.title,
      familyCount: snapshot.firstWave.length,
      averageProgressPercent: snapshot.summary.averageProgressPercent,
      totalRuntimeConfigValues: snapshot.firstWave.reduce((sum, family) => sum + family.runtimeConfig.values.length, 0),
      totalRuntimeStateValues: snapshot.firstWave.reduce((sum, family) => sum + family.runtimeState.values.length, 0),
      specialistRouteCount: snapshot.specialistRoutes.length,
      families: snapshot.firstWave,
    };
  });

  const report: FutureNativeProjectSnapshotReport = {
    generatedAt: new Date().toISOString(),
    summary: {
      scenarioCount: scenarios.length,
      baselineFamilyCount: baselineSummary.firstWaveFamilyCount,
      averageProgressPercent: baselineSummary.averageProgressPercent,
      totalUiControls: baselineSummary.totalUiControls,
      topProgressFamilyId: baselineSummary.topProgressFamilyId,
      routeHighlightCount: routeHighlights.length,
      specialistPacketCount: specialistPackets.length,
      specialistRouteCount: specialistRoutes.length,
      specialistManualSelectionCount: specialistRouteSummary.manualSelectionCount,
      specialistFallbackActiveCount: specialistRouteSummary.fallbackActiveCount,
      specialistPinnedOverrideCount: specialistRouteSummary.pinnedOverrideCount,
      specialistCapabilityDeltaCount: specialistRouteSummary.capabilityDeltaCount,
      specialistOverrideHistoryCount: specialistRouteSummary.overrideHistoryChangeCount,
      specialistFallbackHistoryCount: specialistRouteSummary.fallbackHistoryTransitionCount,
      specialistCapabilityTrendCount: specialistRouteSummary.capabilityTrendDeltaCount,
      specialistWarningRouteCount: specialistRouteSummary.warningRouteCount,
      specialistRouteFixtureDiffCount: fixtureSummary.changedRouteCount,
      specialistRouteFixtureWarningCount: fixtureSummary.warningRouteCount,
      nonVolumetricRouteHighlightCount: nonVolumetricRouteHighlights.length,
      nonVolumetricCoverageHighlightCount: nonVolumetricRouteHighlights.filter((entry) => entry.coverageLabel).length,
      volumetricCoverageHighlightCount: routeHighlights.filter((entry) => getFutureNativeVolumetricBundleCoverage(entry.familyId as Parameters<typeof getFutureNativeVolumetricBundleCoverage>[0])).length,
      expressionIndependentCount: expressionCoverage.summary.independentCount,
      expressionDedicatedSharedCoreCount: expressionCoverage.summary.dedicatedSharedCoreCount,
      expressionDerivedOnSubstrateCount: expressionCoverage.summary.derivedOnSubstrateCount,
      expressionSurfaceThinCount: expressionCoverage.summary.surfaceThinCount,
      expressionStageMismatchCount: expressionCoverage.summary.stageMismatchCount,
      expressionClosureProgressPercent: expressionCoverage.summary.closureProgressPercent,
      dedicatedRuntimeFacadeFamilyCount: dedicatedRuntimeFacades.summary.familyCount,
      dedicatedRuntimeFacadeRouteCount: dedicatedRuntimeFacades.summary.routeCount,
      dedicatedRuntimeFacadeCoverageCount: dedicatedRuntimeFacades.summary.coverageCount,
      dedicatedRuntimeFacadeAverageWarmFrameCount: dedicatedRuntimeFacades.summary.averageWarmFrameCount,
    },
    baseline: {
      summary: baselineSummary,
      verification: baselineVerification.summary,
      firstWave: baselineSnapshots,
      routeHighlights,
      nonVolumetricRouteHighlights,
      specialistPackets,
      specialistRoutes,
    },
    fixtureComparison: {
      summary: fixtureSummary,
      routes: fixtureDiffs,
    },
    scenarios,
  };

  futureNativeProjectSnapshotReportCache = report;
  return report;
}

export function renderFutureNativeProjectSnapshotMarkdown(
  report = buildFutureNativeProjectSnapshotReport(),
): string {
  const lines: string[] = [
    '# Future Native Project Snapshot Report',
    '',
    `- generatedAt: ${report.generatedAt}`,
    `- scenarioCount: ${report.summary.scenarioCount}`,
    `- baselineFamilyCount: ${report.summary.baselineFamilyCount}`,
    `- averageProgressPercent: ${report.summary.averageProgressPercent.toFixed(1)}`,
    `- totalUiControls: ${report.summary.totalUiControls}`,
    `- topProgressFamilyId: ${report.summary.topProgressFamilyId}`,
    `- routeHighlightCount: ${report.summary.routeHighlightCount}`,
    `- specialistPacketCount: ${report.summary.specialistPacketCount}`,
    `- specialistRouteCount: ${report.summary.specialistRouteCount}`,
    `- specialistManualSelectionCount: ${report.summary.specialistManualSelectionCount}`,
    `- specialistFallbackActiveCount: ${report.summary.specialistFallbackActiveCount}`,
    `- specialistPinnedOverrideCount: ${report.summary.specialistPinnedOverrideCount}`,
    `- specialistCapabilityDeltaCount: ${report.summary.specialistCapabilityDeltaCount}`,
    `- specialistOverrideHistoryCount: ${report.summary.specialistOverrideHistoryCount}`,
    `- specialistFallbackHistoryCount: ${report.summary.specialistFallbackHistoryCount}`,
    `- specialistCapabilityTrendCount: ${report.summary.specialistCapabilityTrendCount}`,
    `- specialistWarningRouteCount: ${report.summary.specialistWarningRouteCount}`,
    `- specialistRouteFixtureDiffCount: ${report.summary.specialistRouteFixtureDiffCount}`,
    `- specialistRouteFixtureWarningCount: ${report.summary.specialistRouteFixtureWarningCount}`,
    `- nonVolumetricRouteHighlightCount: ${report.summary.nonVolumetricRouteHighlightCount}`,
    `- expressionIndependentCount: ${report.summary.expressionIndependentCount}`,
    `- expressionDedicatedSharedCoreCount: ${report.summary.expressionDedicatedSharedCoreCount}`,
    `- expressionDerivedOnSubstrateCount: ${report.summary.expressionDerivedOnSubstrateCount}`,
    `- expressionSurfaceThinCount: ${report.summary.expressionSurfaceThinCount}`,
    `- expressionStageMismatchCount: ${report.summary.expressionStageMismatchCount}`,
    `- expressionClosureProgressPercent: ${report.summary.expressionClosureProgressPercent.toFixed(1)}`,
    `- dedicatedRuntimeFacadeFamilyCount: ${report.summary.dedicatedRuntimeFacadeFamilyCount}`,
    `- dedicatedRuntimeFacadeRouteCount: ${report.summary.dedicatedRuntimeFacadeRouteCount}`,
    `- dedicatedRuntimeFacadeCoverageCount: ${report.summary.dedicatedRuntimeFacadeCoverageCount}`,
    `- dedicatedRuntimeFacadeAverageWarmFrameCount: ${report.summary.dedicatedRuntimeFacadeAverageWarmFrameCount.toFixed(1)}`,
    `- nonVolumetricCoverageHighlightCount: ${report.summary.nonVolumetricCoverageHighlightCount}`,
    `- volumetricCoverageHighlightCount: ${report.summary.volumetricCoverageHighlightCount}`,
    `- verification: ${report.baseline.verification.passedChecks}/${report.baseline.verification.totalChecks}`,
    '',
    '## Baseline integrated families',
    '',
  ];

  for (const family of report.baseline.firstWave) {
    lines.push(`### ${family.title} (${family.familyId})`);
    lines.push(`- stage: ${family.stage}`);
    lines.push(`- progressPercent: ${family.progressPercent}`);
    lines.push(`- uiControlCount: ${family.uiControlCount}`);
    lines.push(`- serializerBlockKey: ${family.serializerBlockKey}`);
    lines.push(`- runtimeConfigValues: ${family.runtimeConfig.values.length}`);
    lines.push(`- runtimeStateValues: ${family.runtimeState.values.length}`);
    lines.push(`- statsKeys: ${family.statsKeys.join(', ')}`);
    lines.push(`- nextTargets: ${family.nextTargets.join('; ')}`);
    if (isVolumetricRouteHighlightFamilyId(family.familyId)) {
      const routeHighlight = report.baseline.routeHighlights.find((entry) => entry.familyId === family.familyId);
      if (routeHighlight) {
        const coverage = getFutureNativeVolumetricBundleCoverage(routeHighlight.familyId as Parameters<typeof getFutureNativeVolumetricBundleCoverage>[0]);
        lines.push(`- routeDelta: ${routeHighlight.deltaLines.join(', ')}`);
        lines.push(`- helperArtifacts: ${coverage?.helperArtifacts.join(', ') || 'none'}`);
        lines.push(`- bundleArtifacts: ${coverage?.bundleArtifacts.join(', ') || 'none'}`);
        lines.push(`- coverageLabel: ${coverage?.coverageLabel ?? 'none'}`);
        for (const profile of routeHighlight.profiles) {
          lines.push(`- route:${profile.routeId} (${profile.mode}) ${profile.valueLines.join(', ')}`);
        }
      }
    }
    if (isNonVolumetricBindingRegistrationFamilyId(family.familyId)) {
      const routeHighlight = report.baseline.nonVolumetricRouteHighlights.find((entry) => entry.familyId === family.familyId);
      if (routeHighlight) {
        lines.push(`- routeDelta: ${routeHighlight.deltaLines.join(', ')}`);
        lines.push(`- authoring: ${routeHighlight.authoringDescription}`);
        lines.push(`- helperArtifacts: ${routeHighlight.helperArtifacts.join(', ') || 'none'}`);
        lines.push(`- bundleArtifacts: ${routeHighlight.bundleArtifacts.join(', ') || 'none'}`);
        lines.push(`- coverageLabel: ${routeHighlight.coverageLabel ?? 'none'}`);
        for (const profile of routeHighlight.profiles) {
          lines.push(`- route:${profile.routeId} (${profile.bindingMode}) mode=${profile.modeId}, primaryPreset=${profile.primaryPresetId}, presets=${profile.presetIds.join(', ')}`);
        }
      }
    }
    lines.push('');
  }

  lines.push('## Specialist packets', '');
  for (const packet of report.baseline.specialistPackets) {
    lines.push(`### ${packet.title} (${packet.familyId})`);
    lines.push(`- stage: ${packet.currentStage}`);
    lines.push(`- progressPercent: ${packet.progressPercent}`);
    lines.push(`- graphHint: ${packet.graphHint}`);
    lines.push(`- outputHint: ${packet.outputHint}`);
    lines.push(`- serializerBlockKey: ${packet.serializerBlockKey}`);
    lines.push(`- stages: ${packet.stageLabels.join(', ')}`);
    lines.push(`- outputBridges: ${packet.outputBridges.join(', ')}`);
    lines.push(`- adapterMappingCount: ${packet.adapterMappingCount}`);
    lines.push(`- packetValues: ${packet.runtimeConfigValues.join(', ')}`);
    lines.push('');
  }

  lines.push('## Specialist routes', '');
  for (const route of report.baseline.specialistRoutes) {
    lines.push(`### ${route.title} (${route.familyId})`);
    lines.push(`- stage: ${route.currentStage}`);
    lines.push(`- progressPercent: ${route.progressPercent}`);
    lines.push(`- routeId: ${route.routeId}`);
    lines.push(`- routeLabel: ${route.routeLabel}`);
    lines.push(`- executionTarget: ${route.executionTarget}`);
    lines.push(`- selectedAdapter: ${route.selectedAdapterId} (${route.selectedAdapterLabel})`);
    lines.push(`- serializerBlockKey: ${route.serializerBlockKey}`);
    lines.push(`- stageLabels: ${route.stageLabels.join(', ')}`);
    lines.push(`- outputBridges: ${route.outputBridges.join(', ')}`);
    lines.push(`- routingValues: ${route.routingValues.join(', ')}`);
    lines.push(`- adapterHandshake: ${route.adapterHandshakeValues.join(', ')}`);
    lines.push(`- adapterBridgeSchema: ${route.adapterBridgeSchemaValues.join(', ')}`);
    lines.push(`- adapterSelection: ${route.adapterSelectionValues.join(', ')}`);
    lines.push(`- adapterTargetSwitch: ${route.adapterTargetSwitchValues.join(', ')}`);
    lines.push(`- routeTargetDelta: ${route.routeTargetDeltaValues.join(', ')}`);
    lines.push(`- adapterCapabilityDiff: ${route.adapterCapabilityDiffValues.join(', ')}`);
    lines.push(`- overrideChangeHistory: ${route.overrideChangeHistoryValues.join(', ')}`);
    lines.push(`- adapterFallbackHistory: ${route.adapterFallbackHistoryValues.join(', ')}`);
    lines.push(`- capabilityTrendDelta: ${route.capabilityTrendDeltaValues.join(', ')}`);
    lines.push(`- adapterOverrideCandidates: ${route.adapterOverrideCandidates.join(', ')}`);
    lines.push(`- adapterOverrideState: ${route.adapterOverrideStateValues.join(', ')}`);
    lines.push(`- fallbackReason: ${route.fallbackReasonValues.join(', ')}`);
    lines.push('');
  }

  lines.push('## Specialist route fixture diffs', '');
  lines.push(`- routeCount: ${report.fixtureComparison.summary.routeCount}`);
  lines.push(`- changedRouteCount: ${report.fixtureComparison.summary.changedRouteCount}`);
  lines.push(`- overrideHistoryChangedCount: ${report.fixtureComparison.summary.overrideHistoryChangedCount}`);
  lines.push(`- fallbackHistoryChangedCount: ${report.fixtureComparison.summary.fallbackHistoryChangedCount}`);
  lines.push(`- capabilityTrendChangedCount: ${report.fixtureComparison.summary.capabilityTrendChangedCount}`);
  lines.push(`- warningRouteCount: ${report.fixtureComparison.summary.warningRouteCount}`);
  lines.push('');
  for (const diff of report.fixtureComparison.routes) {
    lines.push(`### ${diff.routeLabel} (${diff.familyId})`);
    lines.push(`- executionTarget: ${diff.baselineExecutionTarget} -> ${diff.comparisonExecutionTarget}`);
    lines.push(`- selectedAdapter: ${diff.selectedAdapterId}`);
    lines.push(`- changedSections: ${diff.changedSections.join(', ') || 'none'}`);
    lines.push(`- overrideHistoryDiff: ${diff.overrideHistoryDeltaValues.join(', ') || 'none'}`);
    lines.push(`- fallbackHistoryDiff: ${diff.fallbackHistoryDeltaValues.join(', ') || 'none'}`);
    lines.push(`- capabilityTrendDiff: ${diff.capabilityTrendDeltaValues.join(', ') || 'none'}`);
    lines.push(`- warnings: ${diff.warningValues.join(', ') || 'none'}`);
    lines.push('');
  }

  lines.push('## Project JSON scenarios', '');
  for (const scenario of report.scenarios) {
    lines.push(`### ${scenario.title} (${scenario.id})`);
    lines.push(`- familyCount: ${scenario.familyCount}`);
    lines.push(`- averageProgressPercent: ${scenario.averageProgressPercent.toFixed(1)}`);
    lines.push(`- totalRuntimeConfigValues: ${scenario.totalRuntimeConfigValues}`);
    lines.push(`- totalRuntimeStateValues: ${scenario.totalRuntimeStateValues}`);
    lines.push(`- specialistRouteCount: ${scenario.specialistRouteCount}`);
    lines.push('');
    for (const family of scenario.families) {
      lines.push(`- ${family.familyId}: config=${family.runtimeConfig.values.length}, state=${family.runtimeState.values.length}, stats=${family.statsKeys.length}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
