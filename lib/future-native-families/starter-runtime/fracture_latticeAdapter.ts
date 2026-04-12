import { getDefaultFractureLatticeConfig, type FractureLatticeNormalizedConfig } from './fracture_latticeSchema';

export type FractureLatticeInputConfig = Partial<FractureLatticeNormalizedConfig>;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function normalizeSignedUnit(value: number | undefined, fallback: number): number {
  const resolved = Number.isFinite(value) ? Number(value) : fallback;
  return Math.min(1, Math.max(-1, resolved));
}

export function normalizeFractureLatticeConfig(input?: FractureLatticeInputConfig): FractureLatticeNormalizedConfig {
  const defaults = getDefaultFractureLatticeConfig();
  return {
    width: Math.max(2, Math.floor(input?.width ?? defaults.width)),
    height: Math.max(2, Math.floor(input?.height ?? defaults.height)),
    bondStrength: Math.max(0.001, input?.bondStrength ?? defaults.bondStrength),
    impulseThreshold: Math.max(0.001, input?.impulseThreshold ?? defaults.impulseThreshold),
    debrisSpawnRate: clamp01(input?.debrisSpawnRate ?? defaults.debrisSpawnRate),
    impactX: clamp01(input?.impactX ?? defaults.impactX),
    impactY: clamp01(input?.impactY ?? defaults.impactY),
    impactRadius: Math.max(0.01, clamp01(input?.impactRadius ?? defaults.impactRadius)),
    impulseMagnitude: Math.max(0.01, input?.impulseMagnitude ?? defaults.impulseMagnitude),
    propagationFalloff: clamp01(input?.propagationFalloff ?? defaults.propagationFalloff),
    propagationDirectionX: normalizeSignedUnit(input?.propagationDirectionX, defaults.propagationDirectionX),
    propagationDirectionY: normalizeSignedUnit(input?.propagationDirectionY, defaults.propagationDirectionY),
    directionalBias: clamp01(input?.directionalBias ?? defaults.directionalBias),
    debrisImpulseScale: Math.max(0, input?.debrisImpulseScale ?? defaults.debrisImpulseScale),
    splitAffinity: clamp01(input?.splitAffinity ?? defaults.splitAffinity),
    fragmentDetachThreshold: Math.max(0.001, clamp01(input?.fragmentDetachThreshold ?? defaults.fragmentDetachThreshold)),
    seed: Math.max(0, Math.floor(input?.seed ?? defaults.seed)),
  };
}
