import type { ParticleConfig } from "../../types";
import {
  clamp,
  getLayerColor,
  getLayerHullOpacity,
  getLayerSheetOpacity,
  type SupportedLayerIndex,
} from "./futureNativeSceneBridgeShared";
import {
  buildClothSurfaceMesh,
  buildMembraneSurfaceMesh,
  buildSoftbodySurfaceMesh,
} from "./futureNativeSceneBridgeSurface";
import {
  sanitizeFutureNativeRenderPayload,
} from "./starter-runtime/runtimeContracts";
import {
  buildFutureNativeRenderPayload,
  buildFutureNativeRuntimeStats,
} from "./futureNativeSceneBridgeRuntimeHelpers";
import { buildFutureNativeRopePayload } from "./futureNativeSceneBridgeRopePayload";
import { buildFutureNativeVolumetricSmokePayload } from "./futureNativeSceneBridgeVolumetricSmokePayload";
import { profileRuntimeTask } from "../runtimeProfiling";
import type {
  FutureNativeSceneBridgeDescriptor,
  FutureNativeSceneBridgeRuntime,
} from "./futureNativeSceneBridgeTypes";

export type {
  FutureNativeRopeDescriptorAugmentation,
  FutureNativeSceneAudioDriveInput,
  FutureNativeSceneBridgeCommon,
  FutureNativeSceneBridgeDescriptor,
  FutureNativeSceneBridgeRuntime,
} from "./futureNativeSceneBridgeTypes";
export {
  applyFutureNativeSceneAudioDrive,
  buildFutureNativeSceneBridgeRuntimeKey,
  createFutureNativeSceneBridgeRuntime,
  stepFutureNativeSceneBridgeRuntime,
} from "./futureNativeSceneBridgeRuntimeControl";

export function buildFutureNativeSceneBridgeDescriptor(
  controller: FutureNativeSceneBridgeRuntime,
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
  options?: { profilingKeyPrefix?: string },
): FutureNativeSceneBridgeDescriptor {
  const profileDescriptorTask = <T,>(suffix: string, task: () => T) => (
    options?.profilingKeyPrefix
      ? profileRuntimeTask(`${options.profilingKeyPrefix}:${suffix}`, 'simulation', task)
      : task()
  );
  const payloadProfilingOptions = options?.profilingKeyPrefix
    ? { profilingKeyPrefix: `${options.profilingKeyPrefix}:payload` }
    : undefined;
  const basePayload = (
    controller.familyId === "pbd-rope" || controller.familyId === "volumetric-smoke"
      ? profileDescriptorTask("payload-base", () => buildFutureNativeRenderPayload(controller, payloadProfilingOptions))
      : null
  );
  const ropeAugmentation = (
    controller.familyId === "pbd-rope"
      ? profileDescriptorTask("augment-rope", () => buildFutureNativeRopePayload({
          runtime: controller.runtime,
          routeTag: controller.binding.routeTag,
        }))
      : null
  );
  const smokeAugmentation = (
    controller.familyId === "volumetric-smoke"
      ? profileDescriptorTask("augment-smoke", () => buildFutureNativeVolumetricSmokePayload({
          runtime: controller.runtime,
          routeTag: controller.binding.routeTag,
          payload: basePayload ?? buildFutureNativeRenderPayload(controller),
        }))
      : null
  );
  const isVolumetricFamily =
    controller.familyId === "volumetric-density-transport" ||
    controller.familyId === "volumetric-pressure-coupling" ||
    controller.familyId === "volumetric-light-shadow-coupling" ||
    controller.familyId === "volumetric-advection" ||
    controller.familyId === "volumetric-smoke";
  const rawPayload = profileDescriptorTask("payload", () => (
    smokeAugmentation?.payload
      ?? ropeAugmentation?.payload
      ?? basePayload
      ?? buildFutureNativeRenderPayload(controller, payloadProfilingOptions)
  ));
  const payload = profileDescriptorTask("sanitize", () => sanitizeFutureNativeRenderPayload(
    rawPayload,
    {
      maxPoints: isVolumetricFamily ? 12000 : 8192,
      maxLines:
        controller.familyId === "fracture-lattice" || controller.familyId === "fracture-voxel" || controller.familyId === "fracture-crack-propagation" || controller.familyId === "fracture-debris-generation"
          ? 24000
          : controller.familyId === "pbd-rope"
            ? 8192
            : 16384,
      maxScalarSamples: 32,
      maxStatsEntries: isVolumetricFamily
        ? 224
        : controller.familyId === "pbd-rope"
          ? 112
          : 64,
    },
  ));
  const color = getLayerColor(config, layerIndex);
  const opacity =
    controller.familyId === "pbd-softbody"
      ? clamp(getLayerHullOpacity(config, layerIndex), 0.16, 0.92)
      : clamp(getLayerSheetOpacity(config, layerIndex), 0.18, 0.92);
  const pointSize =
    controller.familyId === "pbd-softbody"
      ? 6
      : controller.familyId === "pbd-rope"
        ? 6.5
        : 7;
  const surfaceMesh = profileDescriptorTask("surface", () => (
    controller.familyId === "pbd-softbody"
      ? buildSoftbodySurfaceMesh(controller.runtime)
      : controller.familyId === "pbd-membrane"
        ? buildMembraneSurfaceMesh(controller.runtime)
        : controller.familyId === "pbd-cloth"
          ? buildClothSurfaceMesh(controller.runtime)
          : undefined
  ));
  const stats = profileDescriptorTask("stats", () => ({
    ...buildFutureNativeRuntimeStats(controller),
    ...(payload.stats ?? {}),
    ...(ropeAugmentation?.derivedStats ?? {}),
    ...(smokeAugmentation?.derivedStats ?? {}),
  }));
  if (surfaceMesh) {
    stats.surfaceTriangleCount = surfaceMesh.triangleCount;
    stats.hullSegmentCount = surfaceMesh.hullSegmentCount;
    stats.surfaceDepthRange = surfaceMesh.zMax - surfaceMesh.zMin;
  }
  return {
    familyId: controller.familyId,
    bindingMode: controller.binding.bindingMode,
    summary: payload.summary,
    pointCount: payload.points?.length ?? 0,
    lineCount: payload.lines?.length ?? 0,
    stats,
    color,
    opacity,
    pointSize,
    sceneScale: controller.sceneScale,
    payload,
    surfaceMesh,
  };
}
