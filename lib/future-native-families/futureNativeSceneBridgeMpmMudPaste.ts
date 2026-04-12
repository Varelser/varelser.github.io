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

export function buildMpmMudInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): MpmGranularInputConfig {
  const mode = getLayerMode(config, layerIndex);
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const temporalSpeed = getLayerTemporalSpeed(config, layerIndex);
  const flowAmplitude = getLayerFlowAmplitude(config, layerIndex);
  const flowFrequency = getLayerFlowFrequency(config, layerIndex);
  const sedimentStack = mode === 'sediment_stack';
  const talusHeap = mode === 'talus_heap';
  const liquidSmear = mode === 'liquid_smear';
  return {
    particleCount: clamp(Math.round(getLayerCount(config, layerIndex) * (liquidSmear ? 0.17 : talusHeap ? 0.18 : 0.16)), 896, 4608),
    cellResolution: clamp(Math.round(34 + getLayerRadiusScale(config, layerIndex) * 12 + flowFrequency * 0.04 + (sedimentStack ? 2 : 0)), 28, 68),
    gravity: clamp((talusHeap ? 9.7 : liquidSmear ? 6.6 : 8.2) + getLayerGravity(config, layerIndex) * 0.34, 4.2, 11.8),
    particleRadius: clamp(0.01 + getLayerBaseSize(config, layerIndex) * 0.008, 0.011, 0.024),
    spawnWidth: clamp((talusHeap ? 0.58 : liquidSmear ? 0.62 : 0.5) + getLayerRadiusScale(config, layerIndex) * 0.14, 0.42, 0.88),
    spawnHeight: clamp((talusHeap ? 0.28 : liquidSmear ? 0.14 : 0.24) + temporalStrength * 0.14, 0.12, 0.42),
    floorY: liquidSmear ? -0.94 : talusHeap ? -1.02 : -0.98,
    wallHalfWidth: clamp((liquidSmear ? 0.8 : talusHeap ? 0.74 : 0.68) + getLayerRadiusScale(config, layerIndex) * 0.14, 0.58, 1),
    substeps: clamp(Math.round((talusHeap ? 5 : 4) + temporalSpeed * 4), 4, 7),
    materialKind: 'mud',
    cohesion: clamp((sedimentStack ? 0.22 : liquidSmear ? 0.18 : 0.2) + flowAmplitude * 0.08, 0.1, 0.4),
    friction: clamp((talusHeap ? 0.6 : liquidSmear ? 0.48 : 0.56) + flowAmplitude * 0.04, 0.34, 0.76),
    damping: clamp((liquidSmear ? 0.082 : talusHeap ? 0.068 : 0.074) + temporalSpeed * 0.04, 0.04, 0.2),
    kernelRadius: clamp((liquidSmear ? 2.04 : talusHeap ? 1.9 : 1.96) + flowFrequency * 0.008, 1.55, 2.5),
    plasticity: clamp((liquidSmear ? 0.62 : talusHeap ? 0.54 : 0.58) + temporalStrength * 0.16, 0.3, 0.88),
    yieldRate: clamp((liquidSmear ? 0.5 : talusHeap ? 0.42 : 0.46) + temporalSpeed * 0.1, 0.22, 0.82),
    apicBlend: clamp((liquidSmear ? 0.64 : talusHeap ? 0.56 : 0.6) + flowAmplitude * 0.1, 0.34, 0.86),
    stressGain: clamp((liquidSmear ? 0.52 : talusHeap ? 0.44 : 0.48) + temporalStrength * 0.16, 0.24, 1.2),
    hardening: clamp((liquidSmear ? 0.34 : talusHeap ? 0.26 : 0.3) + flowAmplitude * 0.14, 0.12, 0.72),
  };
}

export function buildMpmPasteInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): MpmGranularInputConfig {
  const mode = getLayerMode(config, layerIndex);
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const temporalSpeed = getLayerTemporalSpeed(config, layerIndex);
  const flowAmplitude = getLayerFlowAmplitude(config, layerIndex);
  const flowFrequency = getLayerFlowFrequency(config, layerIndex);
  const capillarySheet = mode === 'capillary_sheet';
  const percolationSheet = mode === 'percolation_sheet';
  const crawlSeep = mode === 'crawl_seep';
  return {
    particleCount: clamp(Math.round(getLayerCount(config, layerIndex) * (crawlSeep ? 0.15 : percolationSheet ? 0.16 : 0.17)), 896, 4608),
    cellResolution: clamp(Math.round(36 + getLayerRadiusScale(config, layerIndex) * 12 + flowFrequency * 0.05 + (capillarySheet ? 2 : 0)), 30, 70),
    gravity: clamp((crawlSeep ? 5.6 : percolationSheet ? 6.4 : 6.1) + getLayerGravity(config, layerIndex) * 0.28, 3.2, 9.8),
    particleRadius: clamp(0.01 + getLayerBaseSize(config, layerIndex) * 0.008, 0.011, 0.024),
    spawnWidth: clamp((crawlSeep ? 0.6 : percolationSheet ? 0.58 : 0.54) + getLayerRadiusScale(config, layerIndex) * 0.14, 0.42, 0.9),
    spawnHeight: clamp((crawlSeep ? 0.14 : percolationSheet ? 0.18 : 0.16) + temporalStrength * 0.12, 0.1, 0.36),
    floorY: crawlSeep ? -0.94 : -0.98,
    wallHalfWidth: clamp((crawlSeep ? 0.8 : 0.74) + getLayerRadiusScale(config, layerIndex) * 0.14, 0.62, 1),
    substeps: clamp(Math.round((crawlSeep ? 5 : 4) + temporalSpeed * 4), 4, 7),
    materialKind: 'paste',
    cohesion: clamp((capillarySheet ? 0.24 : crawlSeep ? 0.28 : 0.26) + flowAmplitude * 0.08, 0.14, 0.46),
    friction: clamp((capillarySheet ? 0.44 : crawlSeep ? 0.5 : 0.46) + flowAmplitude * 0.04, 0.28, 0.72),
    damping: clamp((capillarySheet ? 0.088 : crawlSeep ? 0.1 : 0.094) + temporalSpeed * 0.04, 0.04, 0.22),
    kernelRadius: clamp((capillarySheet ? 2.04 : crawlSeep ? 2.12 : 2.08) + flowFrequency * 0.008, 1.6, 2.6),
    plasticity: clamp((capillarySheet ? 0.74 : crawlSeep ? 0.8 : 0.76) + temporalStrength * 0.16, 0.38, 0.96),
    yieldRate: clamp((capillarySheet ? 0.54 : crawlSeep ? 0.62 : 0.58) + temporalSpeed * 0.1, 0.3, 0.9),
    apicBlend: clamp((capillarySheet ? 0.66 : crawlSeep ? 0.72 : 0.68) + flowAmplitude * 0.08, 0.42, 0.92),
    stressGain: clamp((capillarySheet ? 0.58 : crawlSeep ? 0.64 : 0.6) + temporalStrength * 0.16, 0.34, 1.34),
    hardening: clamp((capillarySheet ? 0.42 : crawlSeep ? 0.48 : 0.44) + flowAmplitude * 0.14, 0.18, 0.84),
  };
}

export function resolveMpmMudWarmFrameCount(routeTag: string, temporalStrength: number): number {
  return Math.max(
    10,
    Math.min(
      20,
      Math.round(
        (routeTag === 'future-native-mpm-mud-talus-heap'
          ? 15
          : routeTag === 'future-native-mpm-mud-liquid-smear'
            ? 13
            : 12) + temporalStrength * 10,
      ),
    ),
  );
}

export function resolveMpmPasteWarmFrameCount(routeTag: string, temporalStrength: number): number {
  return Math.max(
    10,
    Math.min(
      20,
      Math.round(
        (routeTag === 'future-native-mpm-paste-crawl-seep'
          ? 15
          : routeTag === 'future-native-mpm-paste-percolation-sheet'
            ? 14
            : 13) + temporalStrength * 10,
      ),
    ),
  );
}
