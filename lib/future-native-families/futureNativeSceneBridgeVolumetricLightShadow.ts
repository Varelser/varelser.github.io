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

export interface FutureNativeVolumetricLightShadowDiagnosticSnapshot {
  lightAbsorption: number;
  shadowStrength: number;
  lightMarchSteps: number;
  obstacleStrength: number;
  depthLayers: number;
  volumeDepthScale: number;
}

export function buildVolumetricLightShadowCouplingInput(
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
): VolumetricDensityTransportInputConfig {
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
  const chargeMode = mode === 'charge_veil';
  return {
    resolutionX: clamp(Math.round(32 + getLayerRadiusScale(config, layerIndex) * 10 + slices * 0.32 + (chargeMode ? 4 : 2)), 30, 72),
    resolutionY: clamp(Math.round(30 + getLayerBaseSize(config, layerIndex) * 12 + slices * 0.26 + (chargeMode ? 6 : 2)), 28, 72),
    dissipation: clamp((chargeMode ? 0.01 : 0.012) + temporalSpeed * 0.012, 0.006, 0.05),
    injectionRate: clamp((chargeMode ? 0.18 : 0.14) + densityBias * 0.16 + temporalStrength * 0.08, 0.08, 0.46),
    injectionRadius: clamp((chargeMode ? 0.15 : 0.17) + getLayerRadiusScale(config, layerIndex) * 0.016, 0.08, 0.28),
    advectionStrength: clamp((chargeMode ? 0.78 : 0.56) + drift * 0.18 + flowAmplitude * 0.06, 0.38, 1.08),
    buoyancy: clamp((chargeMode ? 0.24 : 0.04) + temporalStrength * 0.08 + (source === 'text' ? 0.06 : 0), -0.08, 0.68),
    swirlStrength: clamp((chargeMode ? 0.82 : 0.24) + fogAnisotropy * 0.28 + flowFrequency * 0.003, 0.14, 1.32),
    pressureRelaxation: clamp((chargeMode ? 0.32 : 0.46) + temporalStrength * 0.12, 0.18, 0.82),
    pressureIterations: clamp(Math.round((chargeMode ? 6 : 7) + temporalSpeed * 2 + fogGlow * 2), 4, 12),
    boundaryFade: clamp((chargeMode ? 0.12 : 0.18) + drift * 0.12, 0.06, 0.42),
    lightAbsorption: clamp((chargeMode ? 0.26 : 0.62) + densityBias * 0.22 + (chargeMode ? -fogGlow * 0.08 : 0), 0.12, 1.18),
    shadowStrength: clamp((chargeMode ? 0.34 : 0.78) + temporalStrength * 0.14 + (chargeMode ? 0 : densityBias * 0.08), 0.16, 1.24),
    obstacleX: clamp(chargeMode ? 0.06 : -0.08, -0.24, 0.24),
    obstacleY: clamp(chargeMode ? 0.04 : -0.06, -0.24, 0.24),
    obstacleRadius: clamp((chargeMode ? 0.13 : 0.19) + getLayerRadiusScale(config, layerIndex) * 0.012, 0.08, 0.3),
    obstacleStrength: clamp((chargeMode ? 0.24 : 0.72) + temporalStrength * 0.08 + (chargeMode ? 0 : densityBias * 0.08), 0.12, 0.96),
    obstacleSoftness: clamp((chargeMode ? 0.12 : 0.18) + drift * 0.12 + temporalSpeed * 0.04, 0.06, 0.36),
    lightMarchSteps: clamp(Math.round((chargeMode ? 10 : 7) + fogGlow * 4 + fogAnisotropy * 2), 4, 14),
    depthLayers: clamp(Math.round((chargeMode ? 6 : 4) + densityBias * 2 + (fogGlow > 0.24 ? 1 : 0)), 3, 8),
    volumeDepthScale: clamp((chargeMode ? 0.96 : 0.64) + densityBias * 0.16 + fogGlow * 0.18, 0.44, 1.34),
  };
}

export function buildVolumetricLightShadowDiagnosticValues(snapshot: FutureNativeVolumetricLightShadowDiagnosticSnapshot): string[] {
  const lightExtinction = snapshot.lightAbsorption * snapshot.volumeDepthScale;
  const occlusion = snapshot.shadowStrength * snapshot.obstacleStrength;
  const marchDensity = snapshot.lightMarchSteps / Math.max(1, snapshot.depthLayers);
  return [
    `lightExtinction:${lightExtinction.toFixed(3)}`,
    `occlusion:${occlusion.toFixed(3)}`,
    `marchDensity:${marchDensity.toFixed(3)}`,
  ];
}
