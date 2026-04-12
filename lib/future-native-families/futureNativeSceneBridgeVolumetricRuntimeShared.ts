import type { VolumetricDensityTransportInputConfig } from './starter-runtime/volumetric_density_transportAdapter';
import { createVolumetricDensityTransportRuntimeFromInput } from './starter-runtime/volumetric_density_transportAdapter';
import { simulateVolumetricDensityTransportRuntime } from './starter-runtime/volumetric_density_transportSolver';
import type { FutureNativeSceneBinding } from './futureNativeSceneBindings';
import type { FutureNativeSceneBridgeRuntime } from './futureNativeSceneBridgeTypes';

type VolumetricBridgeFamilyId =
  | 'volumetric-smoke'
  | 'volumetric-advection'
  | 'volumetric-pressure-coupling'
  | 'volumetric-light-shadow-coupling'
  | 'volumetric-density-transport';

export function getVolumetricWarmFrameCount(
  routeTag: string,
  temporalSpeed: number,
  baseFrames: number,
  minFrames: number,
  maxFrames: number,
  alternate?: { routeTag: string; frames: number },
): number {
  const routeBase = alternate && routeTag === alternate.routeTag ? alternate.frames : baseFrames;
  return Math.max(minFrames, Math.min(maxFrames, Math.round(routeBase + temporalSpeed * 8)));
}

export function createVolumetricBridgeRuntime(
  binding: FutureNativeSceneBinding,
  familyId: VolumetricBridgeFamilyId,
  baseInput: VolumetricDensityTransportInputConfig,
  sceneScale: number,
  warmFrameCount: number,
): FutureNativeSceneBridgeRuntime {
  return {
    binding,
    familyId,
    baseInput,
    runtime: simulateVolumetricDensityTransportRuntime(
      createVolumetricDensityTransportRuntimeFromInput(baseInput),
      warmFrameCount,
    ),
    sceneScale,
  };
}
