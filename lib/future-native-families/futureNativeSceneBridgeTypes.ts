import type { FutureNativeSceneBinding, FutureNativeSceneBoundFamilyId } from "./futureNativeSceneBindings";
import type { SupportedLayerIndex, FutureNativeSceneSurfaceMeshDescriptor } from "./futureNativeSceneBridgeShared";
import type { FutureNativeRenderPayload } from "./starter-runtime/runtimeContracts";
import type { PbdClothInputConfig } from "./starter-runtime/pbd_clothAdapter";
import type { PbdClothRuntimeState } from "./starter-runtime/pbd_clothSolver";
import type { PbdMembraneInputConfig } from "./starter-runtime/pbd_membraneAdapter";
import type { PbdMembraneRuntimeState } from "./starter-runtime/pbd_membraneSolver";
import type { PbdSoftbodyInputConfig } from "./starter-runtime/pbd_softbodyAdapter";
import type { PbdSoftbodyRuntimeState } from "./starter-runtime/pbd_softbodySolver";
import type { PbdRopeInputConfig } from "./starter-runtime/pbd_ropeAdapter";
import type { PbdRopeRuntimeState } from "./starter-runtime/pbd_ropeSolver";
import type { MpmGranularInputConfig } from "./starter-runtime/mpm_granularAdapter";
import type { MpmGranularRuntimeState } from "./starter-runtime/mpm_granularSolver";
import type { FractureLatticeInputConfig } from "./starter-runtime/fracture_latticeAdapter";
import type { FractureLatticeRuntimeState } from "./starter-runtime/fracture_latticeSolver";
import type { VolumetricDensityTransportInputConfig } from "./starter-runtime/volumetric_density_transportAdapter";
import type { VolumetricDensityTransportRuntimeState } from "./starter-runtime/volumetric_density_transportSolver";

export type FutureNativeRopeDescriptorAugmentation = {
  payload: FutureNativeRenderPayload;
  derivedStats: Record<string, number>;
};

export type FutureNativeSceneBridgeCommon = {
  binding: FutureNativeSceneBinding;
  sceneScale: number;
};

export type FutureNativeSceneBridgeRuntime =
  | (FutureNativeSceneBridgeCommon & {
      familyId: "pbd-cloth";
      baseInput: PbdClothInputConfig;
      runtime: PbdClothRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "pbd-membrane";
      baseInput: PbdMembraneInputConfig;
      runtime: PbdMembraneRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "pbd-softbody";
      baseInput: PbdSoftbodyInputConfig;
      runtime: PbdSoftbodyRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "pbd-rope";
      baseInput: PbdRopeInputConfig;
      runtime: PbdRopeRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "mpm-granular";
      baseInput: MpmGranularInputConfig;
      runtime: MpmGranularRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "mpm-viscoplastic";
      baseInput: MpmGranularInputConfig;
      runtime: MpmGranularRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "mpm-snow";
      baseInput: MpmGranularInputConfig;
      runtime: MpmGranularRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "mpm-mud";
      baseInput: MpmGranularInputConfig;
      runtime: MpmGranularRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "mpm-paste";
      baseInput: MpmGranularInputConfig;
      runtime: MpmGranularRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "fracture-lattice";
      baseInput: FractureLatticeInputConfig;
      runtime: FractureLatticeRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "fracture-voxel";
      baseInput: FractureLatticeInputConfig;
      runtime: FractureLatticeRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "fracture-crack-propagation";
      baseInput: FractureLatticeInputConfig;
      runtime: FractureLatticeRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "fracture-debris-generation";
      baseInput: FractureLatticeInputConfig;
      runtime: FractureLatticeRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "volumetric-smoke";
      baseInput: VolumetricDensityTransportInputConfig;
      runtime: VolumetricDensityTransportRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "volumetric-advection";
      baseInput: VolumetricDensityTransportInputConfig;
      runtime: VolumetricDensityTransportRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "volumetric-pressure-coupling";
      baseInput: VolumetricDensityTransportInputConfig;
      runtime: VolumetricDensityTransportRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "volumetric-light-shadow-coupling";
      baseInput: VolumetricDensityTransportInputConfig;
      runtime: VolumetricDensityTransportRuntimeState;
    })
  | (FutureNativeSceneBridgeCommon & {
      familyId: "volumetric-density-transport";
      baseInput: VolumetricDensityTransportInputConfig;
      runtime: VolumetricDensityTransportRuntimeState;
    });

export interface FutureNativeSceneBridgeDescriptor {
  familyId: FutureNativeSceneBoundFamilyId;
  bindingMode: string;
  summary: string;
  pointCount: number;
  lineCount: number;
  stats: Record<string, number>;
  color: string;
  opacity: number;
  pointSize: number;
  sceneScale: number;
  payload: FutureNativeRenderPayload;
  surfaceMesh?: FutureNativeSceneSurfaceMeshDescriptor;
}

export type FutureNativeSceneAudioDriveInput = {
  bass: number;
  treble: number;
  pulse: number;
  bandA: number;
  bandB: number;
};

export type FutureNativeSceneLayerIndex = SupportedLayerIndex;
