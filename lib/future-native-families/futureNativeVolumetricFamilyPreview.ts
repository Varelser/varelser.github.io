import { normalizeConfig } from '../appStateConfig';
import { buildFutureNativeAdvectionPreviewSignature, buildFutureNativeLightShadowPreviewSignature } from './futureNativeVolumetricAdvectionLightShadowAuthoring';
import { buildFutureNativeDensityPreviewSignature, buildFutureNativePressurePreviewSignature } from './futureNativeVolumetricDensityPressureAuthoring';
import { buildProjectVolumetricRouteHighlights } from './futureNativeVolumetricRouteHighlights';
import { getFutureNativeVolumetricBundleCoverage } from './futureNativeVolumetricBundleCoverage';

const supportedFamilies = [
  'volumetric-advection',
  'volumetric-density-transport',
  'volumetric-pressure-coupling',
  'volumetric-light-shadow-coupling',
] as const;
export type FutureNativeVolumetricFamilyPreviewFamilyId = (typeof supportedFamilies)[number];

export interface FutureNativeVolumetricFamilyPreview {
  familyId: FutureNativeVolumetricFamilyPreviewFamilyId;
  routeCount: number;
  presetCount: number;
  helperArtifacts: string[];
  bundleArtifacts: string[];
  coverageLabel: string;
  previewSignature: string[];
}

const sampleConfigByFamily: Record<FutureNativeVolumetricFamilyPreviewFamilyId, Record<string, unknown>> = {
  'volumetric-advection': {
    layer2Enabled: true,
    layer2Type: 'condense_field',
    layer2Source: 'plane',
    layer2FogDensity: 0.48,
    layer2FogDrift: 0.22,
    layer2TemporalStrength: 0.28,
    layer2TemporalSpeed: 0.18,
  },
  'volumetric-density-transport': {
    layer2Enabled: true,
    layer2Type: 'condense_field',
    layer2Source: 'plane',
    layer2FogDensity: 0.48,
    layer2FogDrift: 0.22,
    layer2TemporalStrength: 0.28,
    layer2TemporalSpeed: 0.18,
  },
  'volumetric-pressure-coupling': {
    layer2Enabled: true,
    layer2Type: 'pressure_cells',
    layer2Source: 'grid',
    layer2FogDensity: 0.52,
    layer2FogGlow: 0.12,
    layer2FogDrift: 0.18,
    layer2TemporalStrength: 0.24,
    layer2TemporalSpeed: 0.18,
  },
  'volumetric-light-shadow-coupling': {
    layer2Enabled: true,
    layer2Type: 'charge_veil',
    layer2Source: 'video',
    layer2FogDensity: 0.28,
    layer2FogGlow: 0.32,
    layer2FogAnisotropy: 0.86,
    layer2TemporalStrength: 0.24,
    layer2TemporalSpeed: 0.18,
  },
};

function buildPreviewSignature(familyId: FutureNativeVolumetricFamilyPreviewFamilyId, presetId: string): string[] {
  const config = normalizeConfig(sampleConfigByFamily[familyId]);
  switch (familyId) {
    case 'volumetric-advection':
      return buildFutureNativeAdvectionPreviewSignature(config, 2, presetId);
    case 'volumetric-density-transport':
      return buildFutureNativeDensityPreviewSignature(config, 2, presetId);
    case 'volumetric-pressure-coupling':
      return buildFutureNativePressurePreviewSignature(config, 2, presetId);
    case 'volumetric-light-shadow-coupling':
      return buildFutureNativeLightShadowPreviewSignature(config, 2, presetId);
  }
}

export function buildFutureNativeVolumetricFamilyPreview(
  familyId: FutureNativeVolumetricFamilyPreviewFamilyId,
): FutureNativeVolumetricFamilyPreview {
  const family = buildProjectVolumetricRouteHighlights().find((entry) => entry.familyId === familyId);
  const coverage = getFutureNativeVolumetricBundleCoverage(familyId);
  if (!coverage) throw new Error(`Future-native ${familyId} volumetric coverage missing`);
  const primaryPresetId = family?.profiles[0]?.presetId ?? (familyId === 'volumetric-density-transport' ? 'future-native-volumetric-density-plume-weave' : familyId === 'volumetric-pressure-coupling' ? 'future-native-volumetric-pressure-cells-basin' : familyId === 'volumetric-advection' ? 'future-native-volumetric-condense-field' : 'future-native-volumetric-light-charge-veil');
  return {
    familyId,
    routeCount: family?.profiles.length ?? 1,
    presetCount: family?.profiles.length ?? 1,
    helperArtifacts: [...coverage.helperArtifacts],
    bundleArtifacts: [...coverage.bundleArtifacts],
    coverageLabel: coverage.coverageLabel,
    previewSignature: buildPreviewSignature(familyId, primaryPresetId),
  };
}

export function listFutureNativeVolumetricFamilyPreviews(): FutureNativeVolumetricFamilyPreview[] {
  return supportedFamilies.map((familyId) => buildFutureNativeVolumetricFamilyPreview(familyId));
}
