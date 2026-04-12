import type { ParticleConfig } from '../../types';
import type { FutureNativeSceneBinding } from './futureNativeSceneBindings';
import {
  buildFractureCrackPropagationInput,
  buildFractureDebrisGenerationInput,
  buildFractureVoxelInput,
  resolveFractureDedicatedWarmFrameCount,
} from './futureNativeSceneBridgeFractureDedicated';
import { getLayerTemporalStrength, type SupportedLayerIndex } from './futureNativeSceneBridgeShared';
import type { FutureNativeSceneBridgeRuntime } from './futureNativeSceneBridgeTypes';
import type { FractureLatticeInputConfig } from './starter-runtime/fracture_latticeAdapter';
import { createFractureCrackPropagationOwnedKernelRuntime } from './starter-runtime/fracture_crack_propagationOwnedKernel';
import { createFractureDebrisGenerationOwnedKernelRuntime } from './starter-runtime/fracture_debris_generationOwnedKernel';
import { normalizeFractureLatticeConfig } from './starter-runtime/fracture_latticeAdapter';
import { createFractureLatticeRuntimeState, simulateFractureLatticeRuntime } from './starter-runtime/fracture_latticeSolver';
import { getFutureNativeOwnedKernelMetadata } from './futureNativeOwnedKernelModules';

export const futureNativeFractureDedicatedRuntimeFamilies = [
  'fracture-voxel',
  'fracture-crack-propagation',
  'fracture-debris-generation',
] as const;

export type FutureNativeFractureDedicatedRuntimeFamilyId = (typeof futureNativeFractureDedicatedRuntimeFamilies)[number];

export type FutureNativeFractureDedicatedBridgeRuntime = Extract<
  FutureNativeSceneBridgeRuntime,
  { familyId: FutureNativeFractureDedicatedRuntimeFamilyId }
>;

export interface FutureNativeFractureDedicatedRuntimePlan {
  familyId: FutureNativeFractureDedicatedRuntimeFamilyId;
  routeTag: string;
  warmFrameCount: number;
  baseInput: FractureLatticeInputConfig;
  runtimeFacadeId: string;
  routeSignature: string;
}

function isFractureDedicatedBinding(
  binding: FutureNativeSceneBinding,
): binding is FutureNativeSceneBinding & { familyId: FutureNativeFractureDedicatedRuntimeFamilyId } {
  return (futureNativeFractureDedicatedRuntimeFamilies as readonly string[]).includes(binding.familyId);
}

export function buildFutureNativeFractureDedicatedRuntimePlan(
  binding: FutureNativeSceneBinding,
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
): FutureNativeFractureDedicatedRuntimePlan | null {
  if (!isFractureDedicatedBinding(binding)) return null;
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);

  let baseInput: FractureLatticeInputConfig;
  switch (binding.familyId) {
    case 'fracture-voxel':
      baseInput = buildFractureVoxelInput(config, layerIndex);
      break;
    case 'fracture-crack-propagation':
      baseInput = buildFractureCrackPropagationInput(config, layerIndex);
      break;
    case 'fracture-debris-generation':
      baseInput = buildFractureDebrisGenerationInput(config, layerIndex);
      break;
  }

  const warmFrameCount = resolveFractureDedicatedWarmFrameCount(binding.routeTag, temporalStrength);
  return {
    familyId: binding.familyId,
    routeTag: binding.routeTag,
    warmFrameCount,
    baseInput,
    runtimeFacadeId: getFutureNativeOwnedKernelMetadata(binding.familyId)?.runtimeFacadeId ?? `dedicated-fracture-facade:${binding.familyId}`,
    routeSignature: `${binding.familyId}:${binding.routeTag}:${warmFrameCount}:${baseInput.width}x${baseInput.height}`,
  };
}

export function createFutureNativeSceneBridgeFractureDedicatedRuntime(
  binding: FutureNativeSceneBinding,
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
  sceneScale: number,
): FutureNativeFractureDedicatedBridgeRuntime | null {
  const plan = buildFutureNativeFractureDedicatedRuntimePlan(binding, config, layerIndex);
  if (!plan) return null;

  const runtime = plan.familyId === 'fracture-crack-propagation'
    ? createFractureCrackPropagationOwnedKernelRuntime(plan.baseInput, plan.warmFrameCount)
    : plan.familyId === 'fracture-debris-generation'
      ? createFractureDebrisGenerationOwnedKernelRuntime(plan.baseInput, plan.warmFrameCount)
      : simulateFractureLatticeRuntime(createFractureLatticeRuntimeState(normalizeFractureLatticeConfig(plan.baseInput)), plan.warmFrameCount);

  return { binding, familyId: plan.familyId, baseInput: plan.baseInput, runtime, sceneScale };
}
