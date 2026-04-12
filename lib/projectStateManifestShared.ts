import type {
  ParticleConfig,
  PresetRecord,
  PresetSequenceItem,
  ProjectExecutionRoutingSnapshot,
  ProjectLayerSnapshot,
  ProjectLayerSnapshotKey,
  ProjectManifestStats,
} from '../types';
import { getHybridFeatureIds } from './hybridExpressions';
import { getProceduralFeatureTag } from './proceduralModeRegistry';
import { getHybridTemporalFeatureIds } from './hybridTemporalVariants';
import { getCoverageProfile, getActiveGpgpuFeatures } from './depictionCoverage';
import { getReferencedPostFxStackBundleIds } from './postFxLibrary';
import { getReferencedProductPackBundleIds, getReferencedProductPackFamilies, inferProductPackBundleId } from './productPackLibrary';
import { getCurrentCoverageProgress, getProductPackAugmentationSuggestions } from './productPackAugmentation';
import {
  buildProductPackCoverageRollup,
  getAllProductPackCoverageScorecards,
  getProductPackCoverageScorecardById,
} from './productPackScorecards';
import { uniqueNonEmpty } from './projectStateShared';

function buildLayerProceduralFeatures(mode: ParticleConfig['layer2Type'], temporalProfile: ParticleConfig['layer2TemporalProfile']) {
  return uniqueNonEmpty([
    getProceduralFeatureTag(mode),
    temporalProfile !== 'steady' ? `temporal-${temporalProfile}` : null,
  ]);
}

function getLayerCapabilityFlags(
  executionByKey: Partial<Record<ProjectLayerSnapshotKey, ProjectExecutionRoutingSnapshot>> | undefined,
  key: ProjectLayerSnapshotKey,
) {
  return executionByKey?.[key]?.capabilityFlags ?? [];
}

function buildLayerSnapshot(
  config: ParticleConfig,
  key: 'layer1' | 'layer2' | 'layer3' | 'gpgpu',
  executionByKey?: Partial<Record<ProjectLayerSnapshotKey, ProjectExecutionRoutingSnapshot>>,
): ProjectLayerSnapshot {
  if (key === 'layer1') {
    const features = uniqueNonEmpty([
      ...getHybridFeatureIds(config),
      ...getHybridTemporalFeatureIds(config),
      config.layer1SdfEnabled ? 'sdf-lighting' : null,
      config.layer1SourceCount > 1 ? 'multi-source' : null,
      config.layer1Count > 1200 ? 'dense' : null,
      config.pulseAmplitude > 0.05 ? 'pulse' : null,
    ]);
    return {
      key,
      label: 'Layer 1',
      enabled: config.layer1Enabled,
      mode: 'spheres',
      source: 'builtin',
      material: 'classic',
      geometry: 'sphere-cloud',
      features,
      capabilityFlags: getLayerCapabilityFlags(executionByKey, key),
    };
  }

  if (key === 'layer2') {
    const features = uniqueNonEmpty([
      config.layer2ConnectionEnabled ? 'connections' : null,
      config.layer2GlyphOutlineEnabled ? 'glyph-outline' : null,
      config.layer2AuxEnabled ? 'aux-particles' : null,
      config.layer2SparkEnabled ? 'sparks' : null,
      config.layer2SdfEnabled ? 'sdf-lighting' : null,
      config.layer2GhostTrailEnabled ? 'ghost-trail' : null,
      ...buildLayerProceduralFeatures(config.layer2Type, config.layer2TemporalProfile),
    ]);
    return {
      key,
      label: 'Layer 2',
      enabled: config.layer2Enabled,
      mode: config.layer2Type,
      source: config.layer2Source,
      material: config.layer2MaterialStyle,
      geometry: config.layer2GeomMode3D,
      connectionStyle: config.layer2ConnectionStyle,
      features,
      capabilityFlags: getLayerCapabilityFlags(executionByKey, key),
    };
  }

  if (key === 'layer3') {
    const features = uniqueNonEmpty([
      config.layer3ConnectionEnabled ? 'connections' : null,
      config.layer3GlyphOutlineEnabled ? 'glyph-outline' : null,
      config.layer3AuxEnabled ? 'aux-particles' : null,
      config.layer3SparkEnabled ? 'sparks' : null,
      config.layer3SdfEnabled ? 'sdf-lighting' : null,
      config.layer3GhostTrailEnabled ? 'ghost-trail' : null,
      ...buildLayerProceduralFeatures(config.layer3Type, config.layer3TemporalProfile),
    ]);
    return {
      key,
      label: 'Layer 3',
      enabled: config.layer3Enabled,
      mode: config.layer3Type,
      source: config.layer3Source,
      material: config.layer3MaterialStyle,
      geometry: config.layer3GeomMode3D,
      connectionStyle: config.layer3ConnectionStyle,
      features,
      capabilityFlags: getLayerCapabilityFlags(executionByKey, key),
    };
  }

  const gpgpuFeatures = getActiveGpgpuFeatures(config);
  return {
    key,
    label: 'GPGPU',
    enabled: config.gpgpuEnabled,
    mode: config.gpgpuMetaballEnabled ? 'metaball' : (config.gpgpuVolumetricEnabled ? 'volumetric' : 'particles'),
    source: config.gpgpuEmitShape,
    material: config.gpgpuMetaballStyle,
    geometry: config.gpgpuGeomMode,
    features: gpgpuFeatures,
    capabilityFlags: getLayerCapabilityFlags(executionByKey, key),
  };
}

function buildProjectManifestStats(config: ParticleConfig, layers: ProjectLayerSnapshot[], presets: PresetRecord[], presetSequence: PresetSequenceItem[]): ProjectManifestStats {
  const enabledLayers = layers.filter((layer) => layer.enabled);
  const materials = uniqueNonEmpty(enabledLayers.map((layer) => layer.material));
  const mediaSources = enabledLayers.filter((layer) => layer.source === 'image' || layer.source === 'video').length;
  const textSources = enabledLayers.filter((layer) => layer.source === 'text').length;
  const proceduralModes = enabledLayers.filter((layer) => getProceduralFeatureTag(layer.mode as ParticleConfig['layer2Type']) || ['metaball', 'volumetric'].includes(layer.mode)).length;
  const coverage = getCoverageProfile(config);
  const configs = [config, ...presets.map((preset) => preset.config)];
  const postStackTemplates = getReferencedPostFxStackBundleIds(configs);
  const productPacks = getReferencedProductPackBundleIds(configs);
  const productPackFamilies = getReferencedProductPackFamilies(configs);
  const productPackScorecards = getAllProductPackCoverageScorecards();
  const coverageRollup = buildProductPackCoverageRollup(productPackScorecards);
  const currentCoverageProgress = getCurrentCoverageProgress(config);
  const augmentationSuggestions = getProductPackAugmentationSuggestions(config, {
    excludeIds: inferProductPackBundleId(config) ? [inferProductPackBundleId(config) as string] : [],
    limit: 4,
  });
  const activeProductPackCoverageScore = getProductPackCoverageScorecardById(inferProductPackBundleId(config))?.coverageScore ?? 0;

  return {
    presetCount: presets.length,
    sequenceCount: presetSequence.length,
    enabledLayerCount: enabledLayers.length,
    mediaSourceCount: mediaSources,
    textSourceCount: textSources,
    proceduralModeCount: proceduralModes,
    distinctMaterialCount: materials.length,
    depictionMethodCount: coverage.depictionMethods.length,
    motionFamilyCount: coverage.motionFamilies.length,
    computeBackendCount: coverage.computeBackends.length,
    sourceFamilyCount: coverage.sourceFamilies.length,
    renderFamilyCount: coverage.renderFamilies.length,
    postFamilyCount: coverage.postFamilies.length,
    solverFamilyCount: coverage.solverFamilies.length,
    specialistFamilyCount: coverage.specialistFamilies.length,
    physicalFamilyCount: coverage.physicalFamilies.length,
    geometryFamilyCount: coverage.geometryFamilies.length,
    temporalFamilyCount: coverage.temporalFamilies.length,
    productPackFamilyCount: productPackFamilies.length,
    productPackCount: productPacks.length,
    postStackTemplateCount: postStackTemplates.length,
    gpgpuFeatureCount: coverage.gpgpuFeatures.length,
    coverageGapCount: coverage.gapTargets.length,
    productPackScorecardCount: productPackScorecards.length,
    activeProductPackCoverageScore,
    currentCoverageScore: currentCoverageProgress.coverageScore,
    currentTargetHitCount: currentCoverageProgress.targetHitCount,
    currentTargetTotal: currentCoverageProgress.targetTotal,
    overallCoverageScore: coverageRollup.coverageScore,
    overallTargetHitCount: coverageRollup.targetHitCount,
    overallTargetTotal: coverageRollup.targetTotal,
    averagePackCoverageScore: coverageRollup.averagePackCoverageScore,
    bestPackCoverageScore: coverageRollup.bestPackCoverageScore,
    augmentationSuggestionCount: augmentationSuggestions.length,
  };
}

export { buildLayerSnapshot, buildProjectManifestStats };
