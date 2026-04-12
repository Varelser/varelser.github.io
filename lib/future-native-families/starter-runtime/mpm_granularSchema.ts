export type MpmGranularMaterialKind = 'sand' | 'snow' | 'mud' | 'paste';

export interface MpmGranularNormalizedConfig {
  particleCount: number;
  cellResolution: number;
  gravity: number;
  cohesion: number;
  friction: number;
  damping: number;
  particleRadius: number;
  spawnWidth: number;
  spawnHeight: number;
  floorY: number;
  wallHalfWidth: number;
  substeps: number;
  materialKind: MpmGranularMaterialKind;
  kernelRadius: number;
  plasticity: number;
  yieldRate: number;
  apicBlend: number;
  stressGain: number;
  hardening: number;
}

export function getDefaultMpmGranularConfig(): MpmGranularNormalizedConfig {
  return {
    particleCount: 2048,
    cellResolution: 48,
    gravity: 9.8,
    cohesion: 0.04,
    friction: 0.78,
    damping: 0.03,
    particleRadius: 0.014,
    spawnWidth: 0.72,
    spawnHeight: 0.38,
    floorY: -1.04,
    wallHalfWidth: 0.82,
    substeps: 4,
    materialKind: 'sand',
    kernelRadius: 1.6,
    plasticity: 0.18,
    yieldRate: 0.22,
    apicBlend: 0.42,
    stressGain: 0.36,
    hardening: 0.18,
  };
}
