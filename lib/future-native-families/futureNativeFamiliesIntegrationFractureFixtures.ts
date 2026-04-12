import { normalizeFractureLatticeConfig } from './starter-runtime/fracture_latticeAdapter';
import type { FutureNativeProjectIntegratedId } from './futureNativeFamiliesIntegrationShared';

export function isIntegratedFractureFamilyId(familyId: FutureNativeProjectIntegratedId): boolean {
  return familyId === 'fracture-lattice'
    || familyId === 'fracture-voxel'
    || familyId === 'fracture-crack-propagation'
    || familyId === 'fracture-debris-generation';
}

export function getIntegratedFractureFixtureInput(familyId: FutureNativeProjectIntegratedId): Record<string, unknown> {
  switch (familyId) {
    case 'fracture-lattice':
      return {
        width: 8,
        height: 5,
        impulseThreshold: 0.7,
        debrisSpawnRate: 0.4,
        impactRadius: 0.28,
        impulseMagnitude: 1.8,
        propagationFalloff: 0.2,
        propagationDirectionX: 0.9,
        propagationDirectionY: -0.12,
        directionalBias: 0.35,
        debrisImpulseScale: 1.1,
        splitAffinity: 0.56,
        fragmentDetachThreshold: 0.09,
        seed: 5,
      };
    case 'fracture-voxel':
      return {
        width: 10,
        height: 6,
        impulseThreshold: 0.74,
        debrisSpawnRate: 0.44,
        impactRadius: 0.24,
        impulseMagnitude: 1.72,
        propagationFalloff: 0.24,
        propagationDirectionX: 0.62,
        propagationDirectionY: -0.38,
        directionalBias: 0.58,
        debrisImpulseScale: 1.16,
        splitAffinity: 0.62,
        fragmentDetachThreshold: 0.11,
        seed: 11,
      };
    case 'fracture-crack-propagation':
      return {
        width: 9,
        height: 5,
        impulseThreshold: 0.62,
        debrisSpawnRate: 0.16,
        impactRadius: 0.18,
        impulseMagnitude: 1.58,
        propagationFalloff: 0.12,
        propagationDirectionX: 0.96,
        propagationDirectionY: -0.22,
        directionalBias: 0.78,
        debrisImpulseScale: 0.88,
        splitAffinity: 0.68,
        fragmentDetachThreshold: 0.06,
        seed: 17,
      };
    case 'fracture-debris-generation':
      return {
        width: 9,
        height: 6,
        impulseThreshold: 0.58,
        debrisSpawnRate: 0.5,
        impactRadius: 0.22,
        impulseMagnitude: 1.68,
        propagationFalloff: 0.28,
        propagationDirectionX: 0.72,
        propagationDirectionY: -0.18,
        directionalBias: 0.42,
        debrisImpulseScale: 1.28,
        splitAffinity: 0.72,
        fragmentDetachThreshold: 0.06,
        seed: 23,
      };
    default:
      throw new Error(`Unsupported fracture fixture family: ${familyId}`);
  }
}

export function getIntegratedFractureRuntimeConfigValues(familyId: FutureNativeProjectIntegratedId): string[] {
  const config = normalizeFractureLatticeConfig(getIntegratedFractureFixtureInput(familyId));
  return [
    `width:${config.width}`,
    `height:${config.height}`,
    `impactRadius:${config.impactRadius}`,
    `impulse:${config.impulseMagnitude}`,
    `threshold:${config.impulseThreshold}`,
    `directionalBias:${config.directionalBias}`,
    `splitAffinity:${config.splitAffinity}`,
    `detachThreshold:${config.fragmentDetachThreshold}`,
    `debris:${config.debrisSpawnRate}`,
  ];
}
