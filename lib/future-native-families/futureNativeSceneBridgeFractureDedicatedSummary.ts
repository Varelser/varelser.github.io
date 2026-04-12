import { getIntegratedFractureFixtureInput } from './futureNativeFamiliesIntegrationFractureFixtures';
import {
  createFractureLatticeRuntimeState,
  getFractureLatticeStats,
  simulateFractureLatticeRuntime,
} from './starter-runtime/fracture_latticeSolver';
import { normalizeFractureLatticeConfig } from './starter-runtime/fracture_latticeAdapter';

const supportedFamilies = ['fracture-crack-propagation', 'fracture-debris-generation'] as const;
export type FutureNativeFractureDedicatedSurfaceFamilyId = (typeof supportedFamilies)[number];

export interface FutureNativeFractureDedicatedRouteInputSummary {
  familyId: FutureNativeFractureDedicatedSurfaceFamilyId;
  routeTag: string;
  modeId: string;
  width: number;
  height: number;
  impulseThreshold: number;
  debrisSpawnRate: number;
  impactRadius: number;
  impulseMagnitude: number;
  propagationFalloff: number;
  directionalBias: number;
  splitAffinity: number;
  fragmentDetachThreshold: number;
  brokenBondCount: number;
  debrisCount: number;
  detachedFragmentCount: number;
  fractureRadius: number;
  crackFrontRadius: number;
  simulationSteps: number;
  previewSignature: string;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function buildVariantInput(
  familyId: FutureNativeFractureDedicatedSurfaceFamilyId,
  routeTag: string,
  modeId: string,
): Record<string, unknown> {
  const base = { ...getIntegratedFractureFixtureInput(familyId) };
  if (familyId === 'fracture-crack-propagation') {
    return {
      ...base,
      width: 10,
      height: 5,
      impactRadius: 0.17,
      directionalBias: 0.84,
      propagationFalloff: 0.1,
      debrisSpawnRate: 0.12,
      splitAffinity: 0.7,
      seed: 29,
    };
  }

  switch (routeTag) {
    case 'future-native-fracture-debris-shard':
      return {
        ...base,
        debrisSpawnRate: 0.56,
        impulseMagnitude: 1.74,
        directionalBias: 0.38,
        splitAffinity: 0.76,
        fragmentDetachThreshold: 0.055,
        seed: 31,
      };
    case 'future-native-fracture-debris-orbit':
      return {
        ...base,
        impactRadius: 0.25,
        propagationDirectionX: 0.44,
        propagationDirectionY: -0.62,
        directionalBias: 0.51,
        debrisImpulseScale: 1.34,
        splitAffinity: 0.66,
        seed: 37,
      };
    case 'future-native-fracture-debris-pollen':
      return {
        ...base,
        debrisSpawnRate: 0.62,
        impactRadius: 0.28,
        impulseMagnitude: 1.48,
        propagationFalloff: 0.34,
        directionalBias: 0.32,
        fragmentDetachThreshold: 0.05,
        seed: 41,
      };
    default:
      return {
        ...base,
        modeId,
      };
  }
}

function getSimulationSteps(familyId: FutureNativeFractureDedicatedSurfaceFamilyId, routeTag: string): number {
  if (familyId === 'fracture-crack-propagation') return 9;
  if (routeTag === 'future-native-fracture-debris-orbit') return 8;
  if (routeTag === 'future-native-fracture-debris-pollen') return 7;
  return 6;
}

export function buildFractureDedicatedRouteInputSummary(
  familyId: FutureNativeFractureDedicatedSurfaceFamilyId,
  routeTag: string,
  modeId: string,
): FutureNativeFractureDedicatedRouteInputSummary {
  const config = normalizeFractureLatticeConfig(buildVariantInput(familyId, routeTag, modeId));
  const simulationSteps = getSimulationSteps(familyId, routeTag);
  const runtime = simulateFractureLatticeRuntime(createFractureLatticeRuntimeState(config), simulationSteps);
  const stats = getFractureLatticeStats(runtime);
  return {
    familyId,
    routeTag,
    modeId,
    width: config.width,
    height: config.height,
    impulseThreshold: round3(config.impulseThreshold),
    debrisSpawnRate: round3(config.debrisSpawnRate),
    impactRadius: round3(config.impactRadius),
    impulseMagnitude: round3(config.impulseMagnitude),
    propagationFalloff: round3(config.propagationFalloff),
    directionalBias: round3(config.directionalBias),
    splitAffinity: round3(config.splitAffinity),
    fragmentDetachThreshold: round3(config.fragmentDetachThreshold),
    brokenBondCount: stats.broken,
    debrisCount: stats.debris,
    detachedFragmentCount: stats.detachedFragments,
    fractureRadius: round3(stats.fractureRadius),
    crackFrontRadius: round3(stats.crackFrontRadius),
    simulationSteps,
    previewSignature: [
      familyId,
      routeTag,
      `${config.width}x${config.height}`,
      `broken${stats.broken}`,
      `debris${stats.debris}`,
      `front${round3(stats.crackFrontRadius)}`,
      `bias${round3(config.directionalBias)}`,
    ].join(':'),
  };
}
