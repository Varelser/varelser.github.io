import type { Layer2Type } from '../../types';
import type { VolumetricRouteHighlightFamilyId } from './futureNativeVolumetricFamilyMetadata';

export type VolumetricRecommendationMetric =
  | { kind: 'runtime'; key: string; weight: number; invert?: boolean }
  | { kind: 'fog'; key: 'fogDensity' | 'fogGlow' | 'fogAnisotropy'; weight: number; invert?: boolean }
  | { kind: 'source'; matches: readonly string[]; weight: number };

export interface VolumetricRecommendationOptionSpec {
  presetId: string;
  metrics: readonly VolumetricRecommendationMetric[];
}

export interface VolumetricModeRecommendationSpec {
  familyId: VolumetricRouteHighlightFamilyId;
  mode: Layer2Type;
  secondaryOptions: readonly [VolumetricRecommendationOptionSpec, VolumetricRecommendationOptionSpec];
}

export const volumetricRecommendationSpecs = {
  prism_smoke: {
    familyId: 'volumetric-smoke',
    mode: 'prism_smoke',
    secondaryOptions: [
      { presetId: 'future-native-volumetric-smoke-prism-light-fan', metrics: [
        { kind: 'fog', key: 'fogGlow', weight: 1.15 },
        { kind: 'fog', key: 'fogAnisotropy', weight: 0.72 },
        { kind: 'runtime', key: 'smokePrismSeparation', weight: 0.84 },
        { kind: 'runtime', key: 'smokeLiftBias', weight: 0.6 },
      ] },
      { presetId: 'future-native-volumetric-smoke-prism-obstacle-gate', metrics: [
        { kind: 'runtime', key: 'obstacleStrength', weight: 1.18 },
        { kind: 'fog', key: 'fogDensity', weight: 0.88 },
        { kind: 'runtime', key: 'smokeDensityGain', weight: 0.36 },
        { kind: 'runtime', key: 'smokePersistence', weight: 0.28 },
      ] },
    ],
  } satisfies VolumetricModeRecommendationSpec,
  static_smoke: {
    familyId: 'volumetric-smoke',
    mode: 'static_smoke',
    secondaryOptions: [
      { presetId: 'future-native-volumetric-smoke-static-lantern-slab', metrics: [
        { kind: 'fog', key: 'fogGlow', weight: 1.22 },
        { kind: 'runtime', key: 'smokeLiftBias', weight: 0.96 },
        { kind: 'runtime', key: 'smokeInjectorBias', weight: 0.54 },
        { kind: 'fog', key: 'fogAnisotropy', weight: 0.24 },
      ] },
      { presetId: 'future-native-volumetric-smoke-static-shadow-wall', metrics: [
        { kind: 'runtime', key: 'obstacleStrength', weight: 1.24 },
        { kind: 'runtime', key: 'smokePersistence', weight: 0.92 },
        { kind: 'fog', key: 'fogDensity', weight: 0.86 },
        { kind: 'runtime', key: 'smokeDensityGain', weight: 0.32 },
      ] },
    ],
  } satisfies VolumetricModeRecommendationSpec,
  condense_field: {
    familyId: 'volumetric-advection',
    mode: 'condense_field',
    secondaryOptions: [
      { presetId: 'future-native-volumetric-condense-flow-lattice', metrics: [
        { kind: 'runtime', key: 'advectionStrength', weight: 0.96 },
        { kind: 'runtime', key: 'swirlStrength', weight: 0.64 },
        { kind: 'fog', key: 'fogAnisotropy', weight: 0.72 },
        { kind: 'fog', key: 'fogGlow', weight: 0.28 },
      ] },
      { presetId: 'future-native-volumetric-condense-obstacle-basin', metrics: [
        { kind: 'runtime', key: 'obstacleStrength', weight: 1.14 },
        { kind: 'fog', key: 'fogDensity', weight: 0.94 },
        { kind: 'runtime', key: 'shadowStrength', weight: 0.52 },
        { kind: 'runtime', key: 'lightAbsorption', weight: 0.24 },
      ] },
    ],
  } satisfies VolumetricModeRecommendationSpec,
  sublimate_cloud: {
    familyId: 'volumetric-advection',
    mode: 'sublimate_cloud',
    secondaryOptions: [
      { presetId: 'future-native-volumetric-sublimate-lift-veil', metrics: [
        { kind: 'runtime', key: 'buoyancy', weight: 1.02 },
        { kind: 'runtime', key: 'volumeDepthScale', weight: 0.86 },
        { kind: 'fog', key: 'fogGlow', weight: 0.44 },
        { kind: 'fog', key: 'fogAnisotropy', weight: 0.38 },
      ] },
      { presetId: 'future-native-volumetric-sublimate-shadow-ring', metrics: [
        { kind: 'runtime', key: 'shadowStrength', weight: 0.94 },
        { kind: 'runtime', key: 'obstacleStrength', weight: 0.84 },
        { kind: 'fog', key: 'fogDensity', weight: 0.72 },
        { kind: 'runtime', key: 'lightAbsorption', weight: 0.56 },
      ] },
    ],
  } satisfies VolumetricModeRecommendationSpec,
  vortex_transport: {
    familyId: 'volumetric-pressure-coupling',
    mode: 'vortex_transport',
    secondaryOptions: [
      { presetId: 'future-native-volumetric-pressure-vortex-lift', metrics: [
        { kind: 'runtime', key: 'swirlStrength', weight: 0.96 },
        { kind: 'runtime', key: 'volumeDepthScale', weight: 0.78 },
        { kind: 'fog', key: 'fogAnisotropy', weight: 0.72 },
        { kind: 'fog', key: 'fogGlow', weight: 0.24 },
        { kind: 'source', matches: ['ring'], weight: 0.28 },
      ] },
      { presetId: 'future-native-volumetric-pressure-vortex-shear', metrics: [
        { kind: 'runtime', key: 'pressureRelaxation', weight: 0.94 },
        { kind: 'runtime', key: 'boundaryFade', weight: 0.84 },
        { kind: 'runtime', key: 'obstacleStrength', weight: 0.48 },
        { kind: 'fog', key: 'fogDensity', weight: 0.42 },
        { kind: 'fog', key: 'fogAnisotropy', weight: 0.88, invert: true },
        { kind: 'fog', key: 'fogGlow', weight: 0.42, invert: true },
        { kind: 'source', matches: ['sphere'], weight: 0.32 },
      ] },
    ],
  } satisfies VolumetricModeRecommendationSpec,
  pressure_cells: {
    familyId: 'volumetric-pressure-coupling',
    mode: 'pressure_cells',
    secondaryOptions: [
      { presetId: 'future-native-volumetric-pressure-cells-lantern', metrics: [
        { kind: 'fog', key: 'fogGlow', weight: 1.08 },
        { kind: 'runtime', key: 'volumeDepthScale', weight: 0.72 },
        { kind: 'runtime', key: 'shadowStrength', weight: 0.18 },
        { kind: 'runtime', key: 'depthLayers', weight: 0.06 },
        { kind: 'fog', key: 'fogDensity', weight: 0.64, invert: true },
        { kind: 'source', matches: ['video'], weight: 0.36 },
      ] },
      { presetId: 'future-native-volumetric-pressure-cells-wall', metrics: [
        { kind: 'runtime', key: 'obstacleStrength', weight: 1.12 },
        { kind: 'runtime', key: 'pressureRelaxation', weight: 0.82 },
        { kind: 'runtime', key: 'boundaryFade', weight: 0.76 },
        { kind: 'fog', key: 'fogDensity', weight: 0.64 },
        { kind: 'fog', key: 'fogGlow', weight: 0.44, invert: true },
        { kind: 'source', matches: ['grid'], weight: 0.24 },
      ] },
    ],
  } satisfies VolumetricModeRecommendationSpec,
  charge_veil: {
    familyId: 'volumetric-light-shadow-coupling',
    mode: 'charge_veil',
    secondaryOptions: [
      { presetId: 'future-native-volumetric-light-charge-radiant', metrics: [
        { kind: 'fog', key: 'fogGlow', weight: 1.18 },
        { kind: 'fog', key: 'fogAnisotropy', weight: 0.94 },
        { kind: 'runtime', key: 'lightMarchSteps', weight: 0.06 },
        { kind: 'runtime', key: 'volumeDepthScale', weight: 0.52 },
        { kind: 'source', matches: ['text', 'video'], weight: 0.34 },
      ] },
      { presetId: 'future-native-volumetric-light-charge-occluded', metrics: [
        { kind: 'runtime', key: 'shadowStrength', weight: 0.88 },
        { kind: 'runtime', key: 'obstacleStrength', weight: 0.96 },
        { kind: 'fog', key: 'fogDensity', weight: 0.72 },
        { kind: 'runtime', key: 'lightAbsorption', weight: 0.62 },
        { kind: 'source', matches: ['plane'], weight: 0.22 },
      ] },
    ],
  } satisfies VolumetricModeRecommendationSpec,
  velvet_ash: {
    familyId: 'volumetric-light-shadow-coupling',
    mode: 'velvet_ash',
    secondaryOptions: [
      { presetId: 'future-native-volumetric-shadow-velvet-lantern', metrics: [
        { kind: 'fog', key: 'fogGlow', weight: 1.6 },
        { kind: 'runtime', key: 'volumeDepthScale', weight: 0.72 },
        { kind: 'runtime', key: 'lightMarchSteps', weight: 0.08 },
        { kind: 'fog', key: 'fogDensity', weight: 0.92, invert: true },
        { kind: 'source', matches: ['image'], weight: 0.48 },
      ] },
      { presetId: 'future-native-volumetric-shadow-velvet-wall', metrics: [
        { kind: 'runtime', key: 'shadowStrength', weight: 0.98 },
        { kind: 'runtime', key: 'obstacleStrength', weight: 1.04 },
        { kind: 'runtime', key: 'lightAbsorption', weight: 0.82 },
        { kind: 'fog', key: 'fogDensity', weight: 0.96 },
        { kind: 'source', matches: ['plane'], weight: 0.24 },
        { kind: 'fog', key: 'fogGlow', weight: -0.18 },
      ] },
    ],
  } satisfies VolumetricModeRecommendationSpec,
} as const satisfies Record<string, VolumetricModeRecommendationSpec>;

export function getVolumetricRecommendationSpec(mode: string): VolumetricModeRecommendationSpec | null {
  return volumetricRecommendationSpecs[mode as keyof typeof volumetricRecommendationSpecs] ?? null;
}
