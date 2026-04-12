import type { VolumetricRouteHighlightFamilyId } from './futureNativeVolumetricFamilyMetadata';

export interface FutureNativeVolumetricBundleCoverageEntry {
  familyId: VolumetricRouteHighlightFamilyId | 'volumetric-density-transport';
  helperArtifacts: string[];
  bundleArtifacts: string[];
  coverageLabel: string;
}

const coverageEntries: FutureNativeVolumetricBundleCoverageEntry[] = [
  { familyId: 'volumetric-smoke', helperArtifacts: ['futureNativeSceneBridgeVolumetricSmokePayload.ts', 'futureNativeVolumetricSmokeAuthoring.ts'], bundleArtifacts: ['futureNativeScenePresetPatchesVolumetricSmoke.ts'], coverageLabel: 'smoke-authoring-split' },
  { familyId: 'volumetric-advection', helperArtifacts: ['futureNativeSceneBridgeVolumetricAdvection.ts'], bundleArtifacts: ['futureNativeScenePresetPatchesVolumetricAdvection.ts', 'futureNativeVolumetricAdvectionLightShadowAuthoring.ts', 'futureNativeVolumetricRouteTrend.ts'], coverageLabel: 'advection-helper-split' },
  { familyId: 'volumetric-density-transport', helperArtifacts: ['futureNativeSceneBridgeVolumetricDensityPressure.ts', 'futureNativeVolumetricDensityPressureAuthoring.ts'], bundleArtifacts: ['futureNativeScenePresetPatchesVolumetricDensityPressure.ts', 'futureNativeVolumetricRouteTrend.ts'], coverageLabel: 'density-authoring-split' },
  { familyId: 'volumetric-pressure-coupling', helperArtifacts: ['futureNativeSceneBridgeVolumetricDensityPressure.ts', 'futureNativeVolumetricDensityPressureAuthoring.ts'], bundleArtifacts: ['futureNativeScenePresetPatchesVolumetricDensityPressure.ts', 'futureNativeVolumetricRouteTrend.ts'], coverageLabel: 'pressure-authoring-split' },
  { familyId: 'volumetric-light-shadow-coupling', helperArtifacts: ['futureNativeSceneBridgeVolumetricLightShadow.ts'], bundleArtifacts: ['futureNativeScenePresetPatchesVolumetricLightShadow.ts', 'futureNativeVolumetricAdvectionLightShadowAuthoring.ts', 'futureNativeVolumetricRouteTrend.ts'], coverageLabel: 'light-shadow-helper-split' },
];

export function getFutureNativeVolumetricBundleCoverage(familyId: FutureNativeVolumetricBundleCoverageEntry['familyId']): FutureNativeVolumetricBundleCoverageEntry | null {
  return coverageEntries.find((entry) => entry.familyId === familyId) ?? null;
}
