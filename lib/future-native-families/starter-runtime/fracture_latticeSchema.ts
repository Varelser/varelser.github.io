export interface FractureLatticeNormalizedConfig {
  width: number;
  height: number;
  bondStrength: number;
  impulseThreshold: number;
  debrisSpawnRate: number;
  impactX: number;
  impactY: number;
  impactRadius: number;
  impulseMagnitude: number;
  propagationFalloff: number;
  propagationDirectionX: number;
  propagationDirectionY: number;
  directionalBias: number;
  debrisImpulseScale: number;
  splitAffinity: number;
  fragmentDetachThreshold: number;
  seed: number;
}

export function getDefaultFractureLatticeConfig(): FractureLatticeNormalizedConfig {
  return {
    width: 24,
    height: 24,
    bondStrength: 1,
    impulseThreshold: 0.55,
    debrisSpawnRate: 0.18,
    impactX: 0.52,
    impactY: 0.58,
    impactRadius: 0.16,
    impulseMagnitude: 1.4,
    propagationFalloff: 0.82,
    propagationDirectionX: 0.85,
    propagationDirectionY: -0.15,
    directionalBias: 0.42,
    debrisImpulseScale: 1,
    splitAffinity: 0.36,
    fragmentDetachThreshold: 0.12,
    seed: 17,
  };
}
