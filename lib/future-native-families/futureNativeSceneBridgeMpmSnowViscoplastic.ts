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

export function buildMpmViscoplasticInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): MpmGranularInputConfig {
  const mode = getLayerMode(config, layerIndex);
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const temporalSpeed = getLayerTemporalSpeed(config, layerIndex);
  const flowAmplitude = getLayerFlowAmplitude(config, layerIndex);
  const flowFrequency = getLayerFlowFrequency(config, layerIndex);
  const meltFront = mode === 'melt_front';
  const evaporativeSheet = mode === 'evaporative_sheet';
  return {
    particleCount: clamp(Math.round(getLayerCount(config, layerIndex) * (evaporativeSheet ? 0.19 : 0.18)), 896, 4608),
    cellResolution: clamp(Math.round(36 + getLayerRadiusScale(config, layerIndex) * 12 + flowFrequency * 0.04), 30, 68),
    gravity: clamp((meltFront ? 6.6 : evaporativeSheet ? 6.2 : 7) + getLayerGravity(config, layerIndex) * 0.34, 3.8, 10.8),
    particleRadius: clamp(0.01 + getLayerBaseSize(config, layerIndex) * 0.008, 0.011, 0.024),
    spawnWidth: clamp((evaporativeSheet ? 0.56 : 0.48) + getLayerRadiusScale(config, layerIndex) * 0.14, 0.4, 0.84),
    spawnHeight: clamp((meltFront ? 0.2 : evaporativeSheet ? 0.14 : 0.24) + temporalStrength * 0.14, 0.12, 0.44),
    floorY: evaporativeSheet ? -0.96 : -1.02,
    wallHalfWidth: clamp((evaporativeSheet ? 0.72 : 0.66) + getLayerRadiusScale(config, layerIndex) * 0.14, 0.58, 0.96),
    substeps: clamp(Math.round((meltFront ? 5 : 4) + temporalSpeed * 4), 4, 7),
    materialKind: meltFront ? 'paste' : 'mud',
    cohesion: clamp((meltFront ? 0.24 : evaporativeSheet ? 0.17 : 0.2) + flowAmplitude * 0.08, 0.1, 0.42),
    friction: clamp((meltFront ? 0.48 : 0.54) + flowAmplitude * 0.04, 0.34, 0.72),
    damping: clamp((meltFront ? 0.08 : evaporativeSheet ? 0.065 : 0.072) + temporalSpeed * 0.04, 0.04, 0.2),
    kernelRadius: clamp((meltFront ? 2.1 : evaporativeSheet ? 1.86 : 1.94) + flowFrequency * 0.008, 1.55, 2.5),
    plasticity: clamp((meltFront ? 0.7 : evaporativeSheet ? 0.54 : 0.6) + temporalStrength * 0.16, 0.34, 0.92),
    yieldRate: clamp((meltFront ? 0.58 : evaporativeSheet ? 0.42 : 0.48) + temporalSpeed * 0.1, 0.24, 0.86),
    apicBlend: clamp((meltFront ? 0.66 : evaporativeSheet ? 0.52 : 0.58) + flowAmplitude * 0.1, 0.34, 0.88),
    stressGain: clamp((meltFront ? 0.56 : evaporativeSheet ? 0.4 : 0.48) + temporalStrength * 0.16, 0.28, 1.3),
    hardening: clamp((meltFront ? 0.42 : evaporativeSheet ? 0.22 : 0.32) + flowAmplitude * 0.16, 0.14, 0.78),
  };
}

export function buildMpmSnowInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): MpmGranularInputConfig {
  const mode = getLayerMode(config, layerIndex);
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const temporalSpeed = getLayerTemporalSpeed(config, layerIndex);
  const flowAmplitude = getLayerFlowAmplitude(config, layerIndex);
  const flowFrequency = getLayerFlowFrequency(config, layerIndex);
  const frostLattice = mode === 'frost_lattice';
  const avalancheField = mode === 'avalanche_field';
  return {
    particleCount: clamp(Math.round(getLayerCount(config, layerIndex) * (avalancheField ? 0.19 : frostLattice ? 0.16 : 0.17)), 960, 4800),
    cellResolution: clamp(Math.round(34 + getLayerRadiusScale(config, layerIndex) * 12 + flowFrequency * 0.05 + (frostLattice ? 2 : 0)), 30, 70),
    gravity: clamp((avalancheField ? 10.8 : frostLattice ? 8.4 : 9.3) + getLayerGravity(config, layerIndex) * 0.3, 5.2, 13.2),
    particleRadius: clamp(0.01 + getLayerBaseSize(config, layerIndex) * 0.008, 0.011, 0.024),
    spawnWidth: clamp((avalancheField ? 0.58 : frostLattice ? 0.46 : 0.5) + getLayerRadiusScale(config, layerIndex) * 0.12, 0.4, 0.86),
    spawnHeight: clamp((avalancheField ? 0.26 : frostLattice ? 0.18 : 0.32) + temporalStrength * 0.12, 0.12, 0.46),
    floorY: avalancheField ? -0.94 : frostLattice ? -0.82 : -0.88,
    wallHalfWidth: clamp((avalancheField ? 0.74 : 0.64) + getLayerRadiusScale(config, layerIndex) * 0.12, 0.56, 0.98),
    substeps: clamp(Math.round((avalancheField ? 5 : 4) + temporalSpeed * 4), 4, 7),
    materialKind: 'snow',
    cohesion: clamp((frostLattice ? 0.16 : avalancheField ? 0.1 : 0.12) + flowAmplitude * 0.06, 0.06, 0.28),
    friction: clamp((frostLattice ? 0.76 : avalancheField ? 0.66 : 0.72) + flowAmplitude * 0.04, 0.48, 0.88),
    damping: clamp((frostLattice ? 0.065 : avalancheField ? 0.05 : 0.058) + temporalSpeed * 0.04, 0.03, 0.16),
    kernelRadius: clamp((frostLattice ? 2.0 : avalancheField ? 1.84 : 1.9) + flowFrequency * 0.008, 1.5, 2.4),
    plasticity: clamp((frostLattice ? 0.66 : avalancheField ? 0.54 : 0.6) + temporalStrength * 0.14, 0.28, 0.84),
    yieldRate: clamp((frostLattice ? 0.42 : avalancheField ? 0.36 : 0.4) + temporalSpeed * 0.1, 0.2, 0.78),
    apicBlend: clamp((frostLattice ? 0.68 : avalancheField ? 0.56 : 0.62) + flowAmplitude * 0.08, 0.34, 0.88),
    stressGain: clamp((frostLattice ? 0.62 : avalancheField ? 0.52 : 0.58) + temporalStrength * 0.14, 0.24, 1.2),
    hardening: clamp((frostLattice ? 0.46 : avalancheField ? 0.34 : 0.4) + flowAmplitude * 0.14, 0.12, 0.82),
  };
}

export function resolveMpmSnowWarmFrameCount(routeTag: string, temporalStrength: number): number {
  return Math.max(
    10,
    Math.min(
      20,
      Math.round(
        (routeTag === 'future-native-mpm-snow-avalanche-field'
          ? 16
          : routeTag === 'future-native-mpm-snow-frost-lattice'
            ? 14
            : 12) + temporalStrength * 10,
      ),
    ),
  );
}

export function resolveMpmViscoplasticWarmFrameCount(routeTag: string, temporalStrength: number): number {
  return Math.max(
    10,
    Math.min(
      20,
      Math.round(
        (routeTag === 'future-native-mpm-viscoplastic-melt-front'
          ? 16
          : routeTag === 'future-native-mpm-viscoplastic-evaporative-sheet'
            ? 14
            : 12) + temporalStrength * 10,
      ),
    ),
  );
}
