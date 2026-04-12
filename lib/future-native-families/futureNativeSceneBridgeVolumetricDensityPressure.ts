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

export function buildFutureNativeVolumetricDensityTransportInput(
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
  const drift = clamp((layerIndex === 2 ? config.layer2FogDrift : config.layer3FogDrift), 0, 1);
  const slices = layerIndex === 2 ? config.layer2FogSlices : config.layer3FogSlices;
  return {
    resolutionX: clamp(Math.round(30 + getLayerRadiusScale(config, layerIndex) * 10 + slices * 0.28), 28, 64),
    resolutionY: clamp(Math.round(28 + getLayerBaseSize(config, layerIndex) * 12 + slices * 0.2), 28, 64),
    dissipation: clamp(0.012 + temporalSpeed * 0.018, 0.008, 0.08),
    injectionRate: clamp(0.12 + densityBias * 0.18 + temporalStrength * 0.08, 0.08, 0.42),
    injectionRadius: clamp((mode === 'sublimate_cloud' ? 0.16 : 0.11) + getLayerRadiusScale(config, layerIndex) * 0.018, 0.08, 0.24),
    advectionStrength: clamp(0.74 + drift * 0.28 + flowAmplitude * 0.06, 0.48, 1.2),
    buoyancy: clamp((mode === 'sublimate_cloud' ? 0.26 : 0.12) + temporalStrength * 0.08, -0.1, 0.66),
    swirlStrength: clamp((source === 'ring' ? 0.72 : 0.42) + flowFrequency * 0.004, 0.24, 1.2),
    pressureRelaxation: clamp(0.2 + temporalStrength * 0.12, 0.12, 0.48),
    pressureIterations: clamp(Math.round(4 + temporalSpeed * 2), 3, 8),
    boundaryFade: clamp(0.08 + drift * 0.18, 0.04, 0.36),
    lightAbsorption: clamp((mode === 'sublimate_cloud' ? 0.3 : 0.46) + densityBias * 0.24, 0.18, 1.1),
    shadowStrength: clamp((mode === 'sublimate_cloud' ? 0.42 : 0.58) + temporalStrength * 0.16, 0.24, 1.1),
    obstacleX: clamp(source === 'ring' ? 0.1 : -0.04, -0.24, 0.24),
    obstacleY: clamp(mode === 'sublimate_cloud' ? 0.06 : -0.08, -0.24, 0.24),
    obstacleRadius: clamp((mode === 'sublimate_cloud' ? 0.13 : 0.17) + getLayerRadiusScale(config, layerIndex) * 0.012, 0.1, 0.26),
    obstacleStrength: clamp((mode === 'sublimate_cloud' ? 0.32 : 0.54) + temporalStrength * 0.1, 0.18, 0.82),
    obstacleSoftness: clamp(0.12 + drift * 0.14 + temporalSpeed * 0.06, 0.08, 0.32),
    lightMarchSteps: clamp(Math.round((mode === 'sublimate_cloud' ? 8 : 6) + temporalStrength * 4 + flowAmplitude * 2), 4, 12),
    depthLayers: clamp(Math.round((mode === 'sublimate_cloud' ? 5 : 4) + densityBias * 2), 3, 6),
    volumeDepthScale: clamp((mode === 'sublimate_cloud' ? 0.8 : 0.66) + densityBias * 0.22, 0.48, 1.2),
  };
}

export function buildFutureNativeVolumetricPressureCouplingInput(
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
  const vortexMode = mode === 'vortex_transport';
  return {
    resolutionX: clamp(Math.round(32 + getLayerRadiusScale(config, layerIndex) * 12 + slices * 0.3 + (vortexMode ? 2 : 0)), 30, 72),
    resolutionY: clamp(Math.round(30 + getLayerBaseSize(config, layerIndex) * 14 + slices * 0.22 + (vortexMode ? 4 : 1)), 28, 72),
    dissipation: clamp((vortexMode ? 0.012 : 0.01) + temporalSpeed * 0.012, 0.006, 0.05),
    injectionRate: clamp((vortexMode ? 0.16 : 0.13) + densityBias * 0.14 + temporalStrength * 0.08, 0.08, 0.42),
    injectionRadius: clamp((vortexMode ? 0.16 : 0.12) + getLayerRadiusScale(config, layerIndex) * 0.014, 0.08, 0.24),
    advectionStrength: clamp((vortexMode ? 0.88 : 0.62) + drift * 0.2 + flowAmplitude * 0.06, 0.42, 1.18),
    buoyancy: clamp((vortexMode ? 0.22 : 0.06) + temporalStrength * 0.08, -0.08, 0.62),
    swirlStrength: clamp((vortexMode ? 0.96 : 0.28) + fogAnisotropy * 0.24 + flowFrequency * 0.003, 0.16, 1.34),
    pressureRelaxation: clamp((vortexMode ? 0.42 : 0.58) + temporalStrength * 0.14, 0.24, 0.92),
    pressureIterations: clamp(Math.round((vortexMode ? 6 : 8) + temporalSpeed * 2 + densityBias * 2), 4, 12),
    boundaryFade: clamp((vortexMode ? 0.1 : 0.18) + drift * 0.12 + densityBias * 0.06, 0.06, 0.42),
    lightAbsorption: clamp((vortexMode ? 0.34 : 0.48) + densityBias * 0.2, 0.16, 1.1),
    shadowStrength: clamp((vortexMode ? 0.44 : 0.62) + temporalStrength * 0.16, 0.2, 1.18),
    obstacleX: clamp(vortexMode ? 0.08 : -0.1, -0.24, 0.24),
    obstacleY: clamp(vortexMode ? 0.08 : -0.04, -0.24, 0.24),
    obstacleRadius: clamp((vortexMode ? 0.12 : 0.18) + getLayerRadiusScale(config, layerIndex) * 0.012, 0.1, 0.28),
    obstacleStrength: clamp((vortexMode ? 0.28 : 0.66) + temporalStrength * 0.08, 0.16, 0.94),
    obstacleSoftness: clamp((vortexMode ? 0.12 : 0.18) + drift * 0.12 + temporalSpeed * 0.04, 0.06, 0.36),
    lightMarchSteps: clamp(Math.round((vortexMode ? 7 : 6) + fogGlow * 4 + temporalStrength * 2), 4, 12),
    depthLayers: clamp(Math.round((vortexMode ? 5 : 4) + densityBias * 2 + (fogGlow > 0.2 ? 1 : 0)), 3, 7),
    volumeDepthScale: clamp((vortexMode ? 0.9 : 0.68) + densityBias * 0.18 + fogGlow * 0.16, 0.44, 1.28),
  };
}

export function buildVolumetricDensityTransportDiagnosticValues(snapshot: {
  advectionStrength: number;
  buoyancy: number;
  shadowStrength: number;
  obstacleStrength: number;
  depthLayers: number;
  volumeDepthScale: number;
}): string[] {
  const transportLoad = snapshot.advectionStrength * Math.max(1, snapshot.depthLayers);
  const shadowOcclusion = snapshot.shadowStrength * snapshot.obstacleStrength;
  const densityLift = snapshot.buoyancy * snapshot.volumeDepthScale;
  return [
    `transportLoad:${transportLoad.toFixed(3)}`,
    `shadowOcclusion:${shadowOcclusion.toFixed(3)}`,
    `densityLift:${densityLift.toFixed(3)}`,
  ];
}

export function buildVolumetricPressureDiagnosticValues(snapshot: {
  pressureRelaxation: number;
  pressureIterations: number;
  boundaryFade: number;
  obstacleStrength: number;
  obstacleSoftness: number;
  depthLayers: number;
}): string[] {
  const pressureResidual = (1 - snapshot.pressureRelaxation) * snapshot.boundaryFade;
  const divergenceBudget = snapshot.pressureIterations / Math.max(1, snapshot.depthLayers);
  const projectionOcclusion = snapshot.obstacleStrength * snapshot.obstacleSoftness;
  return [
    `pressureResidual:${pressureResidual.toFixed(3)}`,
    `divergenceBudget:${divergenceBudget.toFixed(3)}`,
    `projectionOcclusion:${projectionOcclusion.toFixed(3)}`,
  ];
}
