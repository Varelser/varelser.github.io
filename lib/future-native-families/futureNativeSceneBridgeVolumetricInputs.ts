import type { ParticleConfig } from '../../types';
import {
  clamp,
  getLayerBaseSize,
  getLayerFlowAmplitude,
  getLayerFlowFrequency,
  getLayerMode,
  getLayerRadiusScale,
  getLayerSource,
  getLayerTemporalSpeed,
  getLayerTemporalStrength,
  type SupportedLayerIndex,
} from './futureNativeSceneBridgeShared';
import type { VolumetricDensityTransportInputConfig } from './starter-runtime/volumetric_density_transportAdapter';
import {
  buildFutureNativeVolumetricDensityTransportInput,
  buildFutureNativeVolumetricPressureCouplingInput,
} from './futureNativeSceneBridgeVolumetricDensityPressure';
export { buildVolumetricLightShadowCouplingInput } from './futureNativeSceneBridgeVolumetricLightShadow';

export function buildVolumetricDensityTransportInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): VolumetricDensityTransportInputConfig {
  return buildFutureNativeVolumetricDensityTransportInput(config, layerIndex);
}

export function buildVolumetricSmokeInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): VolumetricDensityTransportInputConfig {
  const mode = getLayerMode(config, layerIndex);
  const source = getLayerSource(config, layerIndex);
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const temporalSpeed = getLayerTemporalSpeed(config, layerIndex);
  const flowAmplitude = getLayerFlowAmplitude(config, layerIndex);
  const flowFrequency = getLayerFlowFrequency(config, layerIndex);
  const densityBias = clamp((layerIndex === 2 ? config.layer2FogDensity : config.layer3FogDensity), 0, 1);
  const fogGlow = clamp((layerIndex === 2 ? config.layer2FogGlow : config.layer3FogGlow), 0, 1);
  const fogAnisotropy = clamp((layerIndex === 2 ? config.layer2FogAnisotropy : config.layer3FogAnisotropy), 0, 1);
  const drift = clamp((layerIndex === 2 ? config.layer2FogDrift : config.layer3FogDrift), 0, 1);
  const slices = layerIndex === 2 ? config.layer2FogSlices : config.layer3FogSlices;
  const staticMode = mode === 'static_smoke';
  return {
    resolutionX: clamp(Math.round(34 + getLayerRadiusScale(config, layerIndex) * 12 + slices * 0.32 + (staticMode ? 2 : 0)), 30, 72),
    resolutionY: clamp(Math.round(32 + getLayerBaseSize(config, layerIndex) * 14 + slices * 0.24 + (staticMode ? 4 : 0)), 30, 72),
    dissipation: clamp((staticMode ? 0.01 : 0.015) + temporalSpeed * 0.014, 0.006, 0.06),
    injectionRate: clamp((staticMode ? 0.16 : 0.18) + densityBias * 0.22 + temporalStrength * 0.08, 0.1, 0.48),
    injectionRadius: clamp((mode === 'prism_smoke' ? 0.18 : 0.14) + getLayerRadiusScale(config, layerIndex) * 0.018, 0.1, 0.28),
    advectionStrength: clamp((staticMode ? 0.68 : 0.82) + drift * 0.24 + flowAmplitude * 0.06, 0.44, 1.18),
    buoyancy: clamp((staticMode ? 0.08 : 0.22) + temporalStrength * 0.08, -0.04, 0.72),
    swirlStrength: clamp((source === 'video' || mode === 'prism_smoke' ? 0.82 : 0.54) + flowFrequency * 0.004, 0.28, 1.3),
    pressureRelaxation: clamp(0.22 + temporalStrength * 0.12, 0.14, 0.54),
    pressureIterations: clamp(Math.round((staticMode ? 6 : 5) + temporalSpeed * 2), 4, 9),
    boundaryFade: clamp(0.1 + drift * 0.16, 0.06, 0.34),
    lightAbsorption: clamp((staticMode ? 0.52 : 0.4) + densityBias * 0.22, 0.18, 1.2),
    shadowStrength: clamp((staticMode ? 0.68 : 0.52) + temporalStrength * 0.16, 0.24, 1.2),
    obstacleX: clamp(source === 'grid' ? -0.08 : 0.06, -0.24, 0.24),
    obstacleY: clamp(staticMode ? -0.12 : 0.02, -0.24, 0.24),
    obstacleRadius: clamp((staticMode ? 0.19 : 0.14) + getLayerRadiusScale(config, layerIndex) * 0.014, 0.1, 0.28),
    obstacleStrength: clamp((staticMode ? 0.58 : 0.38) + temporalStrength * 0.1, 0.18, 0.86),
    obstacleSoftness: clamp(0.14 + drift * 0.14 + temporalSpeed * 0.05, 0.08, 0.32),
    lightMarchSteps: clamp(Math.round((mode === 'prism_smoke' ? 8 : 7) + temporalStrength * 3 + flowAmplitude * 2), 4, 12),
    depthLayers: clamp(Math.round((staticMode ? 5 : 4) + densityBias * 2), 3, 6),
    volumeDepthScale: clamp((staticMode ? 0.88 : 0.76) + densityBias * 0.22, 0.5, 1.28),
    smokeInjectorBias: clamp((staticMode ? 0.46 : 0.68) + densityBias * 0.24 + flowAmplitude * 0.1, 0.18, 1.2),
    smokePrismSeparation: clamp((mode === 'prism_smoke' ? 0.86 : 0.28) + temporalStrength * 0.2 + flowFrequency * 0.001, 0.12, 1.24),
    smokePersistence: clamp((staticMode ? 0.82 : 0.34) + densityBias * 0.22 + (source === 'grid' ? 0.08 : 0), 0.14, 1.26),
    smokeDensityGain: clamp((staticMode ? 0.92 : 1.18) + densityBias * 0.24 + (source === 'video' ? 0.08 : 0), 0.6, 1.8),
    smokeLiftBias: clamp((staticMode ? 0.28 : 0.92) + temporalStrength * 0.22 + (source === 'video' ? 0.08 : 0), 0.12, 1.34),
    smokeLightScatter: clamp((staticMode ? 0.44 : 0.82) + fogGlow * 0.48 + (source === 'video' ? 0.08 : 0), 0.18, 1.42),
    smokeScatterAnisotropy: clamp((mode === 'prism_smoke' ? 0.88 : 0.34) + fogAnisotropy * 0.72 + flowFrequency * 0.001, 0.1, 1.48),
    smokeRimBoost: clamp((staticMode ? 0.58 : 0.74) + fogGlow * 0.26 + densityBias * 0.16, 0.18, 1.36),
  };
}

export function buildVolumetricPressureCouplingInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): VolumetricDensityTransportInputConfig {
  return buildFutureNativeVolumetricPressureCouplingInput(config, layerIndex);
}
