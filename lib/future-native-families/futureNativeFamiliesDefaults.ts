import type {
  FutureNativeFamilyId,
  FutureNativeFamilyStubConfig,
} from './futureNativeFamiliesTypes';

export const futureNativeFamilyDefaultConfigs: Record<FutureNativeFamilyId, FutureNativeFamilyStubConfig> = {
  'mpm-granular': { enabled: false, familyId: 'mpm-granular', solverDepth: 'mid', iterations: 12, damping: 0.08, coupling: 0.3 },
  'mpm-viscoplastic': { enabled: false, familyId: 'mpm-viscoplastic', solverDepth: 'deep', iterations: 18, damping: 0.12, coupling: 0.5 },
  'mpm-snow': { enabled: false, familyId: 'mpm-snow', solverDepth: 'deep', iterations: 16, damping: 0.1, coupling: 0.35 },
  'mpm-mud': { enabled: false, familyId: 'mpm-mud', solverDepth: 'mid', iterations: 14, damping: 0.14, coupling: 0.45 },
  'mpm-paste': { enabled: false, familyId: 'mpm-paste', solverDepth: 'mid', iterations: 14, damping: 0.16, coupling: 0.55 },
  'pbd-cloth': { enabled: false, familyId: 'pbd-cloth', solverDepth: 'mid', iterations: 10, damping: 0.04, coupling: 0.2 },
  'pbd-membrane': { enabled: false, familyId: 'pbd-membrane', solverDepth: 'mid', iterations: 10, damping: 0.05, coupling: 0.3 },
  'pbd-rope': { enabled: false, familyId: 'pbd-rope', solverDepth: 'lite', iterations: 8, damping: 0.06, coupling: 0.25 },
  'pbd-softbody': { enabled: false, familyId: 'pbd-softbody', solverDepth: 'deep', iterations: 16, damping: 0.07, coupling: 0.4 },
  'fracture-lattice': { enabled: false, familyId: 'fracture-lattice', solverDepth: 'mid', iterations: 6, damping: 0.03, coupling: 0.35 },
  'fracture-voxel': { enabled: false, familyId: 'fracture-voxel', solverDepth: 'mid', iterations: 6, damping: 0.03, coupling: 0.35 },
  'fracture-crack-propagation': { enabled: false, familyId: 'fracture-crack-propagation', solverDepth: 'deep', iterations: 10, damping: 0.02, coupling: 0.45 },
  'fracture-debris-generation': { enabled: false, familyId: 'fracture-debris-generation', solverDepth: 'lite', iterations: 4, damping: 0.08, coupling: 0.2 },
  'volumetric-smoke': { enabled: false, familyId: 'volumetric-smoke', solverDepth: 'mid', iterations: 12, damping: 0.05, coupling: 0.5 },
  'volumetric-density-transport': { enabled: false, familyId: 'volumetric-density-transport', solverDepth: 'mid', iterations: 10, damping: 0.04, coupling: 0.45 },
  'volumetric-advection': { enabled: false, familyId: 'volumetric-advection', solverDepth: 'mid', iterations: 10, damping: 0.04, coupling: 0.45 },
  'volumetric-pressure-coupling': { enabled: false, familyId: 'volumetric-pressure-coupling', solverDepth: 'deep', iterations: 18, damping: 0.02, coupling: 0.6 },
  'volumetric-light-shadow-coupling': { enabled: false, familyId: 'volumetric-light-shadow-coupling', solverDepth: 'deep', iterations: 8, damping: 0.01, coupling: 0.5 },
  'specialist-houdini-native': { enabled: false, familyId: 'specialist-houdini-native', solverDepth: 'deep', iterations: 1, damping: 0, coupling: 0.7 },
  'specialist-niagara-native': { enabled: false, familyId: 'specialist-niagara-native', solverDepth: 'deep', iterations: 1, damping: 0, coupling: 0.7 },
  'specialist-touchdesigner-native': { enabled: false, familyId: 'specialist-touchdesigner-native', solverDepth: 'deep', iterations: 1, damping: 0, coupling: 0.7 },
  'specialist-unity-vfx-native': { enabled: false, familyId: 'specialist-unity-vfx-native', solverDepth: 'deep', iterations: 1, damping: 0, coupling: 0.7 },
};

export function getFutureNativeFamilyDefaultConfig(id: FutureNativeFamilyId): FutureNativeFamilyStubConfig {
  return futureNativeFamilyDefaultConfigs[id];
}
