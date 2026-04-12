import { resolveEvaluatedAudioTargetValue, type EvaluatedAudioRoute } from './audioReactiveRuntime';

export interface SurfaceAudioDrives {
  displacement: number;
  opacity: number;
  relief: number;
  wireframe: number;
  sliceDepth: number;
}

export interface CrystalAudioDrives {
  opacity: number;
  scale: number;
  spread: number;
  wireframe: number;
  glow: number;
}

export interface GranularAudioDrives {
  opacity: number;
  scale: number;
  spread: number;
}

export interface VoxelAudioDrives {
  opacity: number;
  scale: number;
  snap: number;
  jitter: number;
  wireframe: number;
}

export interface FiberAudioDrives {
  opacity: number;
  length: number;
  density: number;
  spread: number;
}

export interface ReactionAudioDrives {
  opacity: number;
  warp: number;
  feed: number;
  kill: number;
  relief: number;
}

export interface DepositionAudioDrives {
  opacity: number;
  relief: number;
  erosion: number;
  bands: number;
  scale: number;
  wireframe: number;
}

export interface GpgpuAudioDrives {
  audioBlast: number;
  gravity: number;
  turbulence: number;
  size: number;
  opacity: number;
  trailLength: number;
  ribbonWidth: number;
  volumetricDensity: number;
}

type DriveResolveOptions = {
  additiveScale?: number;
  multiplicativeScale?: number;
  clampMin?: number;
  clampMax?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolveFamilyDrive(
  evaluatedRoutes: EvaluatedAudioRoute[],
  genericTarget: string,
  specificTargets: string[],
  options?: DriveResolveOptions,
) {
  const additiveScale = options?.additiveScale ?? 1;
  const multiplicativeScale = options?.multiplicativeScale ?? additiveScale;

  let result = resolveEvaluatedAudioTargetValue(evaluatedRoutes, genericTarget, 0, {
    additiveScale,
    multiplicativeScale,
  });

  for (const target of specificTargets) {
    result += resolveEvaluatedAudioTargetValue(evaluatedRoutes, target, 0, {
      additiveScale,
      multiplicativeScale,
    });
  }

  if (typeof options?.clampMin === 'number' || typeof options?.clampMax === 'number') {
    return clamp(
      result,
      options?.clampMin ?? Number.NEGATIVE_INFINITY,
      options?.clampMax ?? Number.POSITIVE_INFINITY,
    );
  }

  return result;
}

export type SurfaceAudioFamily = 'brush' | 'patch' | 'membrane' | 'shell';
export type CrystalAudioFamily = 'crystalAggregate';
export type GranularAudioFamily = 'granular';
export type VoxelAudioFamily = 'voxelLattice';
export type FiberAudioFamily = 'fiber';
export type ReactionAudioFamily = 'reactionField';
export type DepositionAudioFamily = 'depositionField' | 'crystalDeposition';

function resolveSurfaceSpecificTargets(family: SurfaceAudioFamily, key: keyof SurfaceAudioDrives) {
  if (key === 'wireframe' && family === 'brush') {
    return [];
  }
  return [`${family}.${key}`];
}

export function resolveSurfaceAudioDrives(
  evaluatedRoutes: EvaluatedAudioRoute[],
  family: SurfaceAudioFamily,
): SurfaceAudioDrives {
  return {
    displacement: resolveFamilyDrive(evaluatedRoutes, 'surface.displacement', resolveSurfaceSpecificTargets(family, 'displacement'), { additiveScale: 1, clampMin: 0, clampMax: 2 }),
    opacity: resolveFamilyDrive(evaluatedRoutes, 'surface.opacity', resolveSurfaceSpecificTargets(family, 'opacity'), { additiveScale: 1, clampMin: -1, clampMax: 2 }),
    relief: resolveFamilyDrive(evaluatedRoutes, 'surface.relief', resolveSurfaceSpecificTargets(family, 'relief'), { additiveScale: 1, clampMin: 0, clampMax: 2 }),
    wireframe: resolveFamilyDrive(evaluatedRoutes, 'surface.wireframe', resolveSurfaceSpecificTargets(family, 'wireframe'), { additiveScale: 1, clampMin: 0, clampMax: 2 }),
    sliceDepth: resolveFamilyDrive(evaluatedRoutes, 'surface.sliceDepth', resolveSurfaceSpecificTargets(family, 'sliceDepth'), { additiveScale: 1, clampMin: -1, clampMax: 2 }),
  };
}

export function resolveCrystalAudioDrives(
  evaluatedRoutes: EvaluatedAudioRoute[],
  family: CrystalAudioFamily = 'crystalAggregate',
): CrystalAudioDrives {
  return {
    opacity: resolveFamilyDrive(evaluatedRoutes, 'crystal.opacity', [`${family}.opacity`], { additiveScale: 0.35, clampMin: -1, clampMax: 2 }),
    scale: resolveFamilyDrive(evaluatedRoutes, 'crystal.scale', [`${family}.scale`], { additiveScale: 0.45, clampMin: 0, clampMax: 2.5 }),
    spread: resolveFamilyDrive(evaluatedRoutes, 'crystal.spread', [`${family}.spread`], { additiveScale: 0.35, clampMin: -1, clampMax: 2 }),
    wireframe: resolveFamilyDrive(evaluatedRoutes, 'crystal.wireframe', [`${family}.wireframe`], { additiveScale: 1, clampMin: 0, clampMax: 2 }),
    glow: resolveFamilyDrive(evaluatedRoutes, 'crystal.glow', [`${family}.glow`], { additiveScale: 0.6, clampMin: 0, clampMax: 2.5 }),
  };
}

export function resolveGranularAudioDrives(
  evaluatedRoutes: EvaluatedAudioRoute[],
  family: GranularAudioFamily = 'granular',
): GranularAudioDrives {
  return {
    opacity: resolveFamilyDrive(evaluatedRoutes, 'crystal.opacity', [`${family}.opacity`], { additiveScale: 0.35, clampMin: -1, clampMax: 2 }),
    scale: resolveFamilyDrive(evaluatedRoutes, 'crystal.scale', [`${family}.scale`], { additiveScale: 0.45, clampMin: 0, clampMax: 2.5 }),
    spread: resolveFamilyDrive(evaluatedRoutes, 'crystal.spread', [`${family}.spread`], { additiveScale: 0.35, clampMin: -1, clampMax: 2 }),
  };
}

export function resolveVoxelAudioDrives(
  evaluatedRoutes: EvaluatedAudioRoute[],
  family: VoxelAudioFamily = 'voxelLattice',
): VoxelAudioDrives {
  return {
    opacity: resolveFamilyDrive(evaluatedRoutes, 'voxel.opacity', [`${family}.opacity`], { additiveScale: 0.35, clampMin: -1, clampMax: 2 }),
    scale: resolveFamilyDrive(evaluatedRoutes, 'voxel.scale', [`${family}.scale`], { additiveScale: 0.45, clampMin: 0, clampMax: 2.5 }),
    snap: resolveFamilyDrive(evaluatedRoutes, 'voxel.snap', [`${family}.snap`], { additiveScale: 0.5, clampMin: -1, clampMax: 2 }),
    jitter: resolveFamilyDrive(evaluatedRoutes, 'voxel.jitter', [`${family}.jitter`], { additiveScale: 0.5, clampMin: 0, clampMax: 2 }),
    wireframe: resolveFamilyDrive(evaluatedRoutes, 'voxel.wireframe', [`${family}.wireframe`], { additiveScale: 1, clampMin: 0, clampMax: 2 }),
  };
}

export function resolveFiberAudioDrives(
  evaluatedRoutes: EvaluatedAudioRoute[],
  family: FiberAudioFamily = 'fiber',
): FiberAudioDrives {
  return {
    opacity: resolveFamilyDrive(evaluatedRoutes, 'growth.opacity', [`${family}.opacity`], { additiveScale: 0.3, clampMin: -1, clampMax: 2 }),
    length: resolveFamilyDrive(evaluatedRoutes, 'growth.length', [`${family}.length`], { additiveScale: 0.45, clampMin: 0, clampMax: 2.5 }),
    density: resolveFamilyDrive(evaluatedRoutes, 'growth.branches', [`${family}.density`], { additiveScale: 0.45, clampMin: -1, clampMax: 2.5 }),
    spread: resolveFamilyDrive(evaluatedRoutes, 'growth.spread', [`${family}.spread`], { additiveScale: 0.35, clampMin: -1, clampMax: 2 }),
  };
}

export function resolveReactionAudioDrives(
  evaluatedRoutes: EvaluatedAudioRoute[],
  family: ReactionAudioFamily = 'reactionField',
): ReactionAudioDrives {
  return {
    opacity: resolveFamilyDrive(evaluatedRoutes, 'reaction.opacity', [`${family}.opacity`], { additiveScale: 0.3, clampMin: -1, clampMax: 2 }),
    warp: resolveFamilyDrive(evaluatedRoutes, 'reaction.warp', [`${family}.warp`, 'reaction.seedWarp'], { additiveScale: 0.45, clampMin: -1, clampMax: 2 }),
    feed: resolveFamilyDrive(evaluatedRoutes, 'reaction.feed', [`${family}.feed`], { additiveScale: 0.02, clampMin: -0.08, clampMax: 0.08 }),
    kill: resolveFamilyDrive(evaluatedRoutes, 'reaction.kill', [`${family}.kill`], { additiveScale: 0.02, clampMin: -0.08, clampMax: 0.08 }),
    relief: resolveFamilyDrive(evaluatedRoutes, 'reaction.relief', [`${family}.relief`], { additiveScale: 0.5, clampMin: 0, clampMax: 2 }),
  };
}

export function resolveDepositionAudioDrives(
  evaluatedRoutes: EvaluatedAudioRoute[],
  family: DepositionAudioFamily,
): DepositionAudioDrives {
  const specificTargets = {
    opacity: [`${family}.opacity`],
    relief: [`${family}.relief`],
    erosion: family === 'depositionField' ? ['depositionField.erosion'] : [],
    bands: family === 'depositionField' ? ['depositionField.bands'] : [],
    scale: [`${family}.scale`],
    wireframe: [`${family}.wireframe`],
  };

  return {
    opacity: resolveFamilyDrive(evaluatedRoutes, 'deposition.opacity', specificTargets.opacity, { additiveScale: 0.3, clampMin: -1, clampMax: 2 }),
    relief: resolveFamilyDrive(evaluatedRoutes, 'deposition.relief', specificTargets.relief, { additiveScale: 0.45, clampMin: 0, clampMax: 2 }),
    erosion: resolveFamilyDrive(evaluatedRoutes, 'deposition.erosion', specificTargets.erosion, { additiveScale: 0.45, clampMin: -1, clampMax: 2 }),
    bands: resolveFamilyDrive(evaluatedRoutes, 'deposition.bands', specificTargets.bands, { additiveScale: 2.5, clampMin: -4, clampMax: 8 }),
    scale: resolveFamilyDrive(evaluatedRoutes, 'deposition.scale', specificTargets.scale, { additiveScale: 0.45, clampMin: -1, clampMax: 2 }),
    wireframe: resolveFamilyDrive(evaluatedRoutes, 'deposition.wireframe', specificTargets.wireframe, { additiveScale: 1, clampMin: 0, clampMax: 2 }),
  };
}

export function resolveGpgpuAudioDrives(
  evaluatedRoutes: EvaluatedAudioRoute[],
): GpgpuAudioDrives {
  return {
    audioBlast: resolveFamilyDrive(evaluatedRoutes, 'gpgpu.audioBlast', [], { additiveScale: 1, clampMin: 0, clampMax: 4 }),
    gravity: resolveFamilyDrive(evaluatedRoutes, 'gpgpu.gravity', [], { additiveScale: 0.45, clampMin: -4, clampMax: 4 }),
    turbulence: resolveFamilyDrive(evaluatedRoutes, 'gpgpu.turbulence', [], { additiveScale: 0.45, clampMin: 0, clampMax: 4 }),
    size: resolveFamilyDrive(evaluatedRoutes, 'gpgpu.size', [], { additiveScale: 0.35, clampMin: -1, clampMax: 2 }),
    opacity: resolveFamilyDrive(evaluatedRoutes, 'gpgpu.opacity', [], { additiveScale: 0.35, clampMin: -1, clampMax: 2 }),
    trailLength: resolveFamilyDrive(evaluatedRoutes, 'gpgpu.trailLength', [], { additiveScale: 8, clampMin: -16, clampMax: 24 }),
    ribbonWidth: resolveFamilyDrive(evaluatedRoutes, 'gpgpu.ribbonWidth', [], { additiveScale: 0.45, clampMin: -1, clampMax: 2 }),
    volumetricDensity: resolveFamilyDrive(evaluatedRoutes, 'gpgpu.volumetricDensity', [], { additiveScale: 0.45, clampMin: -1, clampMax: 3 }),
  };
}
