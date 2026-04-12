export type FutureNativeFamilyGroup =
  | 'mpm'
  | 'pbd'
  | 'fracture'
  | 'volumetric'
  | 'specialist-native';

export type FutureNativeFamilyStage =
  | 'research-scaffold'
  | 'schema-ready'
  | 'runtime-stub'
  | 'verification-ready'
  | 'native-integration'
  | 'project-integrated';

export type FutureNativeCapabilityFlag =
  | 'webgl-experimental'
  | 'webgpu-preferred'
  | 'export-safe'
  | 'mobile-risky';

export type FutureNativeSolverDepth = 'lite' | 'mid' | 'deep';

export type FutureNativeFamilyId =
  | 'mpm-granular'
  | 'mpm-viscoplastic'
  | 'mpm-snow'
  | 'mpm-mud'
  | 'mpm-paste'
  | 'pbd-cloth'
  | 'pbd-membrane'
  | 'pbd-rope'
  | 'pbd-softbody'
  | 'fracture-lattice'
  | 'fracture-voxel'
  | 'fracture-crack-propagation'
  | 'fracture-debris-generation'
  | 'volumetric-smoke'
  | 'volumetric-density-transport'
  | 'volumetric-advection'
  | 'volumetric-pressure-coupling'
  | 'volumetric-light-shadow-coupling'
  | 'specialist-houdini-native'
  | 'specialist-niagara-native'
  | 'specialist-touchdesigner-native'
  | 'specialist-unity-vfx-native';

export interface FutureNativeFamilySpec {
  id: FutureNativeFamilyId;
  group: FutureNativeFamilyGroup;
  title: string;
  summary: string;
  targetBehaviors: readonly string[];
  recommendedDepth: FutureNativeSolverDepth;
  stage: FutureNativeFamilyStage;
  capabilityFlags: readonly FutureNativeCapabilityFlag[];
  serializerBlockKey: string;
  verificationScenarioId: string;
  implementationNotes: readonly string[];
}

export interface FutureNativeFamilyStubConfig {
  enabled: boolean;
  familyId: FutureNativeFamilyId;
  solverDepth: FutureNativeSolverDepth;
  iterations: number;
  damping: number;
  coupling: number;
}

export interface FutureNativeRegistrySummary {
  totalFamilies: number;
  byGroup: Record<FutureNativeFamilyGroup, number>;
  byStage: Record<FutureNativeFamilyStage, number>;
}
