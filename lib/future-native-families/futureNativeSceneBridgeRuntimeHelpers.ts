import type { FutureNativeRenderPayload } from "./starter-runtime/runtimeContracts";
import { buildPbdClothDebugRenderPayload } from "./starter-runtime/pbd_clothRenderer";
import { getPbdClothStats, type PbdClothRuntimeState } from "./starter-runtime/pbd_clothSolver";
import { buildPbdMembraneDebugRenderPayload } from "./starter-runtime/pbd_membraneRenderer";
import { getPbdMembraneStats, type PbdMembraneRuntimeState } from "./starter-runtime/pbd_membraneSolver";
import { buildPbdSoftbodyDebugRenderPayload } from "./starter-runtime/pbd_softbodyRenderer";
import { getPbdSoftbodyStats, type PbdSoftbodyRuntimeState } from "./starter-runtime/pbd_softbodySolver";
import { buildPbdRopeDebugRenderPayload } from "./starter-runtime/pbd_ropeRenderer";
import { getPbdRopeStats, type PbdRopeRuntimeState } from "./starter-runtime/pbd_ropeSolver";
import { buildMpmGranularDebugRenderPayload } from "./starter-runtime/mpm_granularRenderer";
import { getMpmGranularStats, type MpmGranularRuntimeState } from "./starter-runtime/mpm_granularSolver";
import { buildFractureLatticeDebugRenderPayload } from "./starter-runtime/fracture_latticeRenderer";
import { getFractureLatticeStats, type FractureLatticeRuntimeState } from "./starter-runtime/fracture_latticeSolver";
import { buildVolumetricDensityTransportDebugRenderPayload } from "./starter-runtime/volumetric_density_transportRenderer";
import { getVolumetricDensityTransportStats, type VolumetricDensityTransportRuntimeState } from "./starter-runtime/volumetric_density_transportSolver";

export type FutureNativeSceneBridgeRuntimeForHelpers =
  | { familyId: "pbd-cloth"; runtime: PbdClothRuntimeState }
  | { familyId: "pbd-membrane"; runtime: PbdMembraneRuntimeState }
  | { familyId: "pbd-softbody"; runtime: PbdSoftbodyRuntimeState }
  | { familyId: "pbd-rope"; runtime: PbdRopeRuntimeState }
  | { familyId: "mpm-granular"; runtime: MpmGranularRuntimeState }
  | { familyId: "mpm-viscoplastic"; runtime: MpmGranularRuntimeState }
  | { familyId: "mpm-snow"; runtime: MpmGranularRuntimeState }
  | { familyId: "mpm-mud"; runtime: MpmGranularRuntimeState }
  | { familyId: "mpm-paste"; runtime: MpmGranularRuntimeState }
  | { familyId: "fracture-lattice"; runtime: FractureLatticeRuntimeState }
  | { familyId: "fracture-voxel"; runtime: FractureLatticeRuntimeState }
  | { familyId: "fracture-crack-propagation"; runtime: FractureLatticeRuntimeState }
  | { familyId: "fracture-debris-generation"; runtime: FractureLatticeRuntimeState }
  | { familyId: "volumetric-smoke"; runtime: VolumetricDensityTransportRuntimeState }
  | { familyId: "volumetric-advection"; runtime: VolumetricDensityTransportRuntimeState }
  | { familyId: "volumetric-pressure-coupling"; runtime: VolumetricDensityTransportRuntimeState }
  | { familyId: "volumetric-light-shadow-coupling"; runtime: VolumetricDensityTransportRuntimeState }
  | { familyId: "volumetric-density-transport"; runtime: VolumetricDensityTransportRuntimeState };

export function buildFutureNativeRenderPayload(
  controller: FutureNativeSceneBridgeRuntimeForHelpers,
  options?: { profilingKeyPrefix?: string },
): FutureNativeRenderPayload {
  if (controller.familyId === "pbd-cloth") return buildPbdClothDebugRenderPayload(controller.runtime);
  if (controller.familyId === "pbd-membrane") return buildPbdMembraneDebugRenderPayload(controller.runtime);
  if (controller.familyId === "pbd-softbody") return buildPbdSoftbodyDebugRenderPayload(controller.runtime);
  if (controller.familyId === "pbd-rope") return buildPbdRopeDebugRenderPayload(controller.runtime);
  if (controller.familyId === "mpm-granular") return buildMpmGranularDebugRenderPayload(controller.runtime);
  if (controller.familyId === "mpm-viscoplastic") {
    return {
      ...buildMpmGranularDebugRenderPayload(controller.runtime),
      familyId: "mpm-viscoplastic",
    };
  }
  if (controller.familyId === "mpm-snow") {
    return {
      ...buildMpmGranularDebugRenderPayload(controller.runtime),
      familyId: "mpm-snow",
    };
  }
  if (controller.familyId === "mpm-mud") {
    return {
      ...buildMpmGranularDebugRenderPayload(controller.runtime),
      familyId: "mpm-mud",
    };
  }
  if (controller.familyId === "mpm-paste") {
    return {
      ...buildMpmGranularDebugRenderPayload(controller.runtime),
      familyId: "mpm-paste",
    };
  }
  if (controller.familyId === "fracture-lattice") return buildFractureLatticeDebugRenderPayload(controller.runtime);
  if (controller.familyId === "fracture-voxel") {
    return {
      ...buildFractureLatticeDebugRenderPayload(controller.runtime),
      familyId: "fracture-voxel",
    };
  }
  if (controller.familyId === "fracture-crack-propagation") {
    return {
      ...buildFractureLatticeDebugRenderPayload(controller.runtime),
      familyId: "fracture-crack-propagation",
    };
  }
  if (controller.familyId === "fracture-debris-generation") {
    return {
      ...buildFractureLatticeDebugRenderPayload(controller.runtime),
      familyId: "fracture-debris-generation",
    };
  }
  return buildVolumetricDensityTransportDebugRenderPayload(controller.runtime, {
    profilingKeyPrefix: options?.profilingKeyPrefix,
  });
}

export function buildFutureNativeRuntimeStats(controller: FutureNativeSceneBridgeRuntimeForHelpers): Record<string, number> {
  if (controller.familyId === "pbd-cloth") return { ...getPbdClothStats(controller.runtime) };
  if (controller.familyId === "pbd-membrane") return { ...getPbdMembraneStats(controller.runtime) };
  if (controller.familyId === "pbd-softbody") return { ...getPbdSoftbodyStats(controller.runtime) };
  if (controller.familyId === "pbd-rope") return { ...getPbdRopeStats(controller.runtime) };
  if (controller.familyId === "mpm-granular") return { ...getMpmGranularStats(controller.runtime) };
  if (controller.familyId === "mpm-viscoplastic") return { ...getMpmGranularStats(controller.runtime) };
  if (controller.familyId === "mpm-snow") return { ...getMpmGranularStats(controller.runtime) };
  if (controller.familyId === "mpm-mud") return { ...getMpmGranularStats(controller.runtime) };
  if (controller.familyId === "mpm-paste") return { ...getMpmGranularStats(controller.runtime) };
  if (controller.familyId === "fracture-lattice") return { ...getFractureLatticeStats(controller.runtime) };
  if (controller.familyId === "fracture-voxel") return { ...getFractureLatticeStats(controller.runtime) };
  if (controller.familyId === "fracture-crack-propagation") return { ...getFractureLatticeStats(controller.runtime) };
  if (controller.familyId === "fracture-debris-generation") return { ...getFractureLatticeStats(controller.runtime) };
  return { ...getVolumetricDensityTransportStats(controller.runtime) };
}
