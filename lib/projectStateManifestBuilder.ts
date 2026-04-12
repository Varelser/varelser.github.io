import type { ParticleConfig, PresetRecord, PresetSequenceItem, ProjectLayerSnapshot, ProjectManifest, ProjectUiState } from '../types';
import { getCoverageProfile } from './depictionCoverage';
import { getReferencedPostFxStackBundleIds, inferPostFxStackBundleId } from './postFxLibrary';
import { getReferencedProductPackBundleIds, getReferencedProductPackFamilies, inferProductPackBundleId } from './productPackLibrary';
import { getProductPackAugmentationSuggestions } from './productPackAugmentation';
import { buildProductPackCoverageRollup, getAllProductPackCoverageScorecards } from './productPackScorecards';
import { PROJECT_MANIFEST_SCHEMA_VERSION, PROJECT_SERIALIZATION_SCHEMA_VERSION } from './projectStateShared';
import { buildProjectExecutionRouting } from './projectExecutionRouting';
import {
  buildProjectFutureNativeSpecialistPacketEntries,
  buildProjectFutureNativeSpecialistRouteEntries,
} from './future-native-families/futureNativeFamiliesSpecialistPackets';
import { buildLayerSnapshot, buildProjectManifestStats } from './projectStateManifestShared';
import { buildProjectAudioLegacyRetirementSummary } from './projectAudioLegacyRetirementSummary';
import { buildProjectAudioLegacyStoredQueuePreviewSummary } from './projectAudioLegacyStoredQueuePreviewSummary';
import { buildProjectAudioLegacyCloseoutSummary } from './projectAudioLegacyCloseoutSummary';
import { buildProjectAudioLegacyManualQueueSummary } from './projectAudioLegacyManualQueueSummary';
import { buildProjectDistributionProofBundleManifestSummary, CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT, buildProjectDistributionProofBundleManifestDeltaValues } from './projectDistributionProofBundleCurrent';
import { CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT } from './projectWebgpuCapabilityCurrent';
import { CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT } from './projectIntelMacProofCurrent';
import { getFutureNativeProjectRouteSummary } from './futureNativePanelSummaries';
import { buildProjectFutureNativeCapabilityMatrix } from './projectFutureNativeCapabilityMatrix';
import { normalizeProjectFutureNativeSpecialistRouteControls, buildDefaultProjectFutureNativeSpecialistRouteControls, buildFutureNativeSpecialistRouteControlDeltaValues, buildFutureNativeSpecialistRouteManifestDeltaValues } from './future-native-families/futureNativeSpecialistRouteControls';
import { buildProjectExportHandoffManifestSummary } from './projectExportHandoffCurrent';
import { buildProjectCloseoutCurrentSummary } from './projectCloseoutCurrent';
import { buildProjectSeedReplaySummary } from './projectSeedSummary';

export function buildProjectManifest(
  config: ParticleConfig,
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
  ui?: Partial<ProjectUiState>,
): ProjectManifest {
  const execution = buildProjectExecutionRouting(config);
  const executionByKey = Object.fromEntries(
    execution.map((entry) => [entry.key, entry]),
  ) as Record<ProjectLayerSnapshot['key'], typeof execution[number]>;
  const layers: ProjectLayerSnapshot[] = [
    buildLayerSnapshot(config, 'layer1', executionByKey),
    buildLayerSnapshot(config, 'layer2', executionByKey),
    buildLayerSnapshot(config, 'layer3', executionByKey),
    buildLayerSnapshot(config, 'gpgpu', executionByKey),
  ];

  const coverage = getCoverageProfile(config);
  const productPackScorecards = getAllProductPackCoverageScorecards();
  const coverageRollup = buildProductPackCoverageRollup(productPackScorecards);
  const augmentationSuggestions = getProductPackAugmentationSuggestions(config, {
    excludeIds: inferProductPackBundleId(config) ? [inferProductPackBundleId(config) as string] : [],
    limit: 4,
  });
  const normalizedSpecialistRouteControls = normalizeProjectFutureNativeSpecialistRouteControls(ui?.futureNativeSpecialistRouteControls);
  const specialistRouteEntries = buildProjectFutureNativeSpecialistRouteEntries(normalizedSpecialistRouteControls);
  const defaultSpecialistRouteControls = buildDefaultProjectFutureNativeSpecialistRouteControls();
  const specialistRouteControlDiffsByFamily = new Map(
    normalizedSpecialistRouteControls.map((entry) => [
      entry.familyId,
      buildFutureNativeSpecialistRouteControlDeltaValues(entry, defaultSpecialistRouteControls),
    ]),
  );
  const specialistManifestDiffsByFamily = new Map(
    specialistRouteEntries.map((entry) => [
      entry.familyId,
      buildFutureNativeSpecialistRouteManifestDeltaValues(entry, undefined),
    ]),
  );
  const routeSummary = getFutureNativeProjectRouteSummary(config, { execution, layers, coverage: undefined as any, stats: undefined as any, schemaVersion: PROJECT_MANIFEST_SCHEMA_VERSION, serializationSchemaVersion: PROJECT_SERIALIZATION_SCHEMA_VERSION } as ProjectManifest);
  const capabilityMatrix = buildProjectFutureNativeCapabilityMatrix(config, { execution, layers, coverage: undefined as any, stats: undefined as any, schemaVersion: PROJECT_MANIFEST_SCHEMA_VERSION, serializationSchemaVersion: PROJECT_SERIALIZATION_SCHEMA_VERSION } as ProjectManifest, presets);
  const distributionManifestDriftCount = buildProjectDistributionProofBundleManifestDeltaValues(undefined, CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT).length;
  const exportHandoffSummary = buildProjectExportHandoffManifestSummary({
    summary: routeSummary,
    matrix: capabilityMatrix,
    specialistRouteEntries,
    specialistRouteControlDiffsByFamily,
    specialistManifestDiffsByFamily,
    distributionBundleManifestDriftCount: distributionManifestDriftCount,
    webgpuReport: CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT,
    intelMacReport: CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT,
    distributionBundleReport: CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
  });
  const closeoutCurrentSummary = buildProjectCloseoutCurrentSummary({
    handoffSummary: exportHandoffSummary,
    webgpuReport: CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT,
    intelMacReport: CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT,
    distributionBundleReport: CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
  });

  return {
    schemaVersion: PROJECT_MANIFEST_SCHEMA_VERSION,
    serializationSchemaVersion: PROJECT_SERIALIZATION_SCHEMA_VERSION,
    layers,
    execution,
    futureNativeSpecialistPackets: buildProjectFutureNativeSpecialistPacketEntries(),
    futureNativeSpecialistRoutes: specialistRouteEntries,
    distributionProofBundles: buildProjectDistributionProofBundleManifestSummary(),
    exportHandoff: exportHandoffSummary,
    closeoutCurrent: closeoutCurrentSummary,
    seedReplay: buildProjectSeedReplaySummary(config),
    audioLegacyRetirement: buildProjectAudioLegacyRetirementSummary(config, presets, presetSequence),
    audioLegacyCloseout: buildProjectAudioLegacyCloseoutSummary(config, presets, presetSequence),
    audioLegacyStoredQueuePreview: buildProjectAudioLegacyStoredQueuePreviewSummary(config, presets, presetSequence),
    audioLegacyManualQueue: buildProjectAudioLegacyManualQueueSummary(config, presets, presetSequence),
    coverage: {
      ...coverage,
      productPackFamilies: getReferencedProductPackFamilies([config, ...presets.map((preset) => preset.config)]),
      productPacks: getReferencedProductPackBundleIds([config, ...presets.map((preset) => preset.config)]),
      postStackTemplates: getReferencedPostFxStackBundleIds([config, ...presets.map((preset) => preset.config)]),
      activePostStackId: inferPostFxStackBundleId(config),
      activeProductPackId: inferProductPackBundleId(config),
      productPackScorecards: productPackScorecards.map((scorecard) => ({
        id: scorecard.id,
        label: scorecard.label,
        family: scorecard.family,
        coverageScore: scorecard.coverageScore,
        targetHitCount: scorecard.targetHitCount,
        targetTotal: scorecard.targetTotal,
        emphasis: scorecard.emphasis,
        solverFamilies: scorecard.solverFamilies,
        specialistFamilies: scorecard.specialistFamilies,
        physicalFamilies: scorecard.physicalFamilies,
        geometryFamilies: scorecard.geometryFamilies,
        temporalFamilies: scorecard.temporalFamilies,
        missingTargets: scorecard.missingTargets,
      })),
      coverageRollup: {
        coverageScore: coverageRollup.coverageScore,
        targetHitCount: coverageRollup.targetHitCount,
        targetTotal: coverageRollup.targetTotal,
        averagePackCoverageScore: coverageRollup.averagePackCoverageScore,
        bestPackId: coverageRollup.bestPackId,
        bestPackLabel: coverageRollup.bestPackLabel,
        bestPackCoverageScore: coverageRollup.bestPackCoverageScore,
        sourceAxis: coverageRollup.sourceAxis,
        renderAxis: coverageRollup.renderAxis,
        postAxis: coverageRollup.postAxis,
        computeAxis: coverageRollup.computeAxis,
        motionAxis: coverageRollup.motionAxis,
        solverAxis: coverageRollup.solverAxis,
        specialistAxis: coverageRollup.specialistAxis,
        physicalAxis: coverageRollup.physicalAxis,
        geometryAxis: coverageRollup.geometryAxis,
        temporalAxis: coverageRollup.temporalAxis,
        missingTargets: coverageRollup.missingTargets,
      },
      augmentationSuggestions: augmentationSuggestions.map((suggestion) => ({
        id: suggestion.id,
        label: suggestion.label,
        family: suggestion.family,
        coverageGain: suggestion.coverageGain,
        resultCoverageScore: suggestion.resultCoverageScore,
        resultTargetHitCount: suggestion.resultTargetHitCount,
        coveredGapTargets: suggestion.coveredGapTargets,
      })),
    },
    stats: buildProjectManifestStats(config, layers, presets, presetSequence),
  };
}
