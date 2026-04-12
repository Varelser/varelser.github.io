import {
  getDefaultMpmGranularConfig,
  type MpmGranularMaterialKind,
  type MpmGranularNormalizedConfig,
} from './mpm_granularSchema';
import { createMpmGranularRuntimeState, type MpmGranularRuntimeState } from './mpm_granularSolver';

export type MpmGranularInputConfig = Partial<MpmGranularNormalizedConfig>;

const MATERIAL_PRESETS: Record<MpmGranularMaterialKind, Pick<MpmGranularNormalizedConfig, 'cohesion' | 'friction' | 'damping' | 'plasticity' | 'yieldRate' | 'kernelRadius' | 'apicBlend' | 'stressGain' | 'hardening'>> = {
  sand: { cohesion: 0.04, friction: 0.78, damping: 0.03, plasticity: 0.12, yieldRate: 0.18, kernelRadius: 1.5, apicBlend: 0.35, stressGain: 0.26, hardening: 0.12 },
  snow: { cohesion: 0.12, friction: 0.64, damping: 0.045, plasticity: 0.35, yieldRate: 0.32, kernelRadius: 1.8, apicBlend: 0.48, stressGain: 0.34, hardening: 0.28 },
  mud: { cohesion: 0.18, friction: 0.52, damping: 0.07, plasticity: 0.52, yieldRate: 0.44, kernelRadius: 1.9, apicBlend: 0.58, stressGain: 0.44, hardening: 0.36 },
  paste: { cohesion: 0.24, friction: 0.44, damping: 0.09, plasticity: 0.68, yieldRate: 0.58, kernelRadius: 2.1, apicBlend: 0.66, stressGain: 0.52, hardening: 0.42 },
};

export function normalizeMpmGranularConfig(input?: MpmGranularInputConfig): MpmGranularNormalizedConfig {
  const defaults = getDefaultMpmGranularConfig();
  const materialKind = input?.materialKind ?? defaults.materialKind;
  const preset = MATERIAL_PRESETS[materialKind];
  return {
    particleCount: Math.max(16, Math.floor(input?.particleCount ?? defaults.particleCount)),
    cellResolution: Math.max(8, Math.floor(input?.cellResolution ?? defaults.cellResolution)),
    gravity: Math.max(0, input?.gravity ?? defaults.gravity),
    cohesion: Math.min(1, Math.max(0, input?.cohesion ?? preset.cohesion ?? defaults.cohesion)),
    friction: Math.min(1, Math.max(0, input?.friction ?? preset.friction ?? defaults.friction)),
    damping: Math.min(1, Math.max(0, input?.damping ?? preset.damping ?? defaults.damping)),
    particleRadius: Math.max(0.002, input?.particleRadius ?? defaults.particleRadius),
    spawnWidth: Math.max(0.08, input?.spawnWidth ?? defaults.spawnWidth),
    spawnHeight: Math.max(0.04, input?.spawnHeight ?? defaults.spawnHeight),
    floorY: input?.floorY ?? defaults.floorY,
    wallHalfWidth: Math.max(0.1, input?.wallHalfWidth ?? defaults.wallHalfWidth),
    substeps: Math.max(1, Math.floor(input?.substeps ?? defaults.substeps)),
    materialKind,
    kernelRadius: Math.min(3, Math.max(1, input?.kernelRadius ?? preset.kernelRadius ?? defaults.kernelRadius)),
    plasticity: Math.min(1, Math.max(0, input?.plasticity ?? preset.plasticity ?? defaults.plasticity)),
    yieldRate: Math.min(1, Math.max(0, input?.yieldRate ?? preset.yieldRate ?? defaults.yieldRate)),
    apicBlend: Math.min(1, Math.max(0, input?.apicBlend ?? preset.apicBlend ?? defaults.apicBlend)),
    stressGain: Math.min(2, Math.max(0, input?.stressGain ?? preset.stressGain ?? defaults.stressGain)),
    hardening: Math.min(1, Math.max(0, input?.hardening ?? preset.hardening ?? defaults.hardening)),
  };
}

export function createMpmGranularRuntimeFromInput(input?: MpmGranularInputConfig): MpmGranularRuntimeState {
  return createMpmGranularRuntimeState(normalizeMpmGranularConfig(input));
}
