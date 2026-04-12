import type { MpmGranularNormalizedConfig } from './mpm_granularSchema';

export interface MpmGranularParticle {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  mass: number;
  plasticStrain: number;
  compactness: number;
  affineXX: number;
  affineXY: number;
  affineYX: number;
  affineYY: number;
  meanStress: number;
  shearStress: number;
  hardeningState: number;
  viscosityState: number;
  yieldMemory: number;
}

export interface MpmGranularGridCell {
  x: number;
  y: number;
  mass: number;
  vx: number;
  vy: number;
  occupancy: number;
  density: number;
}

export interface MpmGranularGridState {
  resolution: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  cellWidth: number;
  cellHeight: number;
  cells: MpmGranularGridCell[];
  totalMass: number;
  occupiedCells: number;
  maxCellMass: number;
  transferResidual: number;
}

export interface MpmGranularRuntimeState {
  config: MpmGranularNormalizedConfig;
  particles: MpmGranularParticle[];
  grid: MpmGranularGridState;
  frame: number;
}

export interface MpmGranularStats {
  frame: number;
  particles: number;
  centerOfMassY: number;
  minY: number;
  maxY: number;
  pileHeight: number;
  floorContacts: number;
  wallContacts: number;
  pairContacts: number;
  spillCount: number;
  meanSpeed: number;
  occupiedCells: number;
  gridTotalMass: number;
  maxCellMass: number;
  transferResidual: number;
  meanPlasticStrain: number;
  maxPlasticStrain: number;
  meanCompactness: number;
  denseCells: number;
  meanStress: number;
  maxStress: number;
  meanShearStress: number;
  apicEnergy: number;
  meanHardeningState: number;
  meanViscosityState: number;
  meanYieldMemory: number;
  materialBranchScore: number;
}

export function cloneParticle(particle: MpmGranularParticle): MpmGranularParticle {
  return { ...particle };
}

export function getMaterialStateProfile(kind: MpmGranularNormalizedConfig['materialKind']): {
  stressScale: number;
  hardeningGain: number;
  viscosityGain: number;
  yieldGain: number;
  velocityDrag: number;
  affineRetention: number;
  compactionBias: number;
  shearRetention: number;
} {
  switch (kind) {
    case 'sand':
      return { stressScale: 0.82, hardeningGain: 0.08, viscosityGain: 0.04, yieldGain: 0.06, velocityDrag: 0.01, affineRetention: 0.88, compactionBias: -0.03, shearRetention: 1.08 };
    case 'snow':
      return { stressScale: 1.0, hardeningGain: 0.34, viscosityGain: 0.12, yieldGain: 0.18, velocityDrag: 0.018, affineRetention: 0.92, compactionBias: 0.04, shearRetention: 0.96 };
    case 'mud':
      return { stressScale: 1.22, hardeningGain: 0.16, viscosityGain: 0.42, yieldGain: 0.26, velocityDrag: 0.04, affineRetention: 0.84, compactionBias: 0.08, shearRetention: 0.82 };
    case 'paste':
      return { stressScale: 1.34, hardeningGain: 0.22, viscosityGain: 0.52, yieldGain: 0.44, velocityDrag: 0.055, affineRetention: 0.8, compactionBias: 0.12, shearRetention: 0.74 };
  }
}
