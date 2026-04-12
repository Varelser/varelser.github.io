import type { ParticleConfig } from '../../types';
import {
  clamp,
  getLayerBaseSize,
  getLayerCount,
  getLayerFlowAmplitude,
  getLayerFlowFrequency,
  getLayerGravity,
  getLayerMode,
  getLayerRadiusScale,
  getLayerTemporalSpeed,
  getLayerTemporalStrength,
  type SupportedLayerIndex,
} from './futureNativeSceneBridgeShared';
import type { MpmGranularInputConfig } from './starter-runtime/mpm_granularAdapter';

export function buildFutureNativeMpmGranularInput(
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
): MpmGranularInputConfig {
  const mode = getLayerMode(config, layerIndex);
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const temporalSpeed = getLayerTemporalSpeed(config, layerIndex);
  const flowAmplitude = getLayerFlowAmplitude(config, layerIndex);
  return {
    particleCount: clamp(Math.round(getLayerCount(config, layerIndex) * 0.18), 768, 4096),
    cellResolution: clamp(Math.round(34 + getLayerRadiusScale(config, layerIndex) * 12 + getLayerFlowFrequency(config, layerIndex) * 0.04), 28, 64),
    gravity: clamp(7.8 + getLayerGravity(config, layerIndex) * 0.42, 4.8, 12.8),
    particleRadius: clamp(0.009 + getLayerBaseSize(config, layerIndex) * 0.008, 0.01, 0.022),
    spawnWidth: clamp(0.44 + getLayerRadiusScale(config, layerIndex) * 0.16, 0.36, 0.78),
    spawnHeight: clamp(0.18 + temporalStrength * 0.18, 0.14, 0.46),
    floorY: -1.04,
    wallHalfWidth: clamp(0.62 + getLayerRadiusScale(config, layerIndex) * 0.14, 0.56, 0.92),
    substeps: clamp(Math.round(3 + temporalSpeed * 4), 3, 6),
    materialKind: mode === 'jammed_pack' ? 'paste' : 'sand',
    kernelRadius: clamp(1.45 + getLayerFlowFrequency(config, layerIndex) * 0.01, 1.25, 2.2),
    plasticity: clamp((mode === 'jammed_pack' ? 0.54 : 0.12) + temporalStrength * 0.18, 0.08, 0.82),
    yieldRate: clamp((mode === 'jammed_pack' ? 0.42 : 0.2) + temporalSpeed * 0.12, 0.12, 0.8),
    apicBlend: clamp(0.38 + flowAmplitude * 0.14, 0.28, 0.82),
    stressGain: clamp((mode === 'jammed_pack' ? 0.52 : 0.32) + temporalStrength * 0.18, 0.2, 1.2),
    hardening: clamp((mode === 'jammed_pack' ? 0.34 : 0.14) + flowAmplitude * 0.18, 0.1, 0.72),
  };
}
