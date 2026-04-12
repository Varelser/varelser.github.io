import type { ParticleConfig } from '../../types';
import type { FutureNativeSceneBinding } from './futureNativeSceneBindings';
import { buildMpmSnowInput, buildMpmViscoplasticInput, resolveMpmSnowWarmFrameCount, resolveMpmViscoplasticWarmFrameCount } from './futureNativeSceneBridgeMpmInputs';
import { buildMpmMudInput, buildMpmPasteInput, resolveMpmMudWarmFrameCount, resolveMpmPasteWarmFrameCount } from './futureNativeSceneBridgeMpmMudPaste';
import { getLayerTemporalStrength, type SupportedLayerIndex } from './futureNativeSceneBridgeShared';
import type { FutureNativeSceneBridgeRuntime } from './futureNativeSceneBridgeTypes';
import type { MpmGranularInputConfig } from './starter-runtime/mpm_granularAdapter';
import { createMpmMudOwnedKernelRuntime, stepMpmMudOwnedKernelRuntime } from './starter-runtime/mpm_mudOwnedKernel';
import { createMpmPasteOwnedKernelRuntime, stepMpmPasteOwnedKernelRuntime } from './starter-runtime/mpm_pasteOwnedKernel';
import { createMpmSnowOwnedKernelRuntime, stepMpmSnowOwnedKernelRuntime } from './starter-runtime/mpm_snowOwnedKernel';
import { createMpmViscoplasticOwnedKernelRuntime, stepMpmViscoplasticOwnedKernelRuntime } from './starter-runtime/mpm_viscoplasticOwnedKernel';
import { getFutureNativeOwnedKernelMetadata } from './futureNativeOwnedKernelModules';

export const futureNativeMpmDedicatedRuntimeFamilies = [
  'mpm-viscoplastic',
  'mpm-snow',
  'mpm-mud',
  'mpm-paste',
] as const;

export type FutureNativeMpmDedicatedRuntimeFamilyId = (typeof futureNativeMpmDedicatedRuntimeFamilies)[number];

export type FutureNativeMpmDedicatedBridgeRuntime = Extract<
  FutureNativeSceneBridgeRuntime,
  { familyId: FutureNativeMpmDedicatedRuntimeFamilyId }
>;

export interface FutureNativeMpmDedicatedRuntimePlan {
  familyId: FutureNativeMpmDedicatedRuntimeFamilyId;
  routeTag: string;
  warmFrameCount: number;
  minimumSubsteps: number;
  baseInput: MpmGranularInputConfig;
  runtimeFacadeId: string;
  routeSignature: string;
}

function isMpmDedicatedBinding(
  binding: FutureNativeSceneBinding,
): binding is FutureNativeSceneBinding & { familyId: FutureNativeMpmDedicatedRuntimeFamilyId } {
  return (futureNativeMpmDedicatedRuntimeFamilies as readonly string[]).includes(binding.familyId);
}

export function buildFutureNativeMpmDedicatedRuntimePlan(
  binding: FutureNativeSceneBinding,
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
): FutureNativeMpmDedicatedRuntimePlan | null {
  if (!isMpmDedicatedBinding(binding)) return null;
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);

  let baseInput: MpmGranularInputConfig;
  let warmFrameCount: number;

  switch (binding.familyId) {
    case 'mpm-viscoplastic':
      baseInput = buildMpmViscoplasticInput(config, layerIndex);
      warmFrameCount = resolveMpmViscoplasticWarmFrameCount(binding.routeTag, temporalStrength);
      break;
    case 'mpm-snow':
      baseInput = buildMpmSnowInput(config, layerIndex);
      warmFrameCount = resolveMpmSnowWarmFrameCount(binding.routeTag, temporalStrength);
      break;
    case 'mpm-mud':
      baseInput = buildMpmMudInput(config, layerIndex);
      warmFrameCount = resolveMpmMudWarmFrameCount(binding.routeTag, temporalStrength);
      break;
    case 'mpm-paste':
      baseInput = buildMpmPasteInput(config, layerIndex);
      warmFrameCount = resolveMpmPasteWarmFrameCount(binding.routeTag, temporalStrength);
      break;
  }

  return {
    familyId: binding.familyId,
    routeTag: binding.routeTag,
    warmFrameCount,
    minimumSubsteps: 3,
    baseInput,
    runtimeFacadeId: getFutureNativeOwnedKernelMetadata(binding.familyId)?.runtimeFacadeId ?? `dedicated-mpm-facade:${binding.familyId}`,
    routeSignature: `${binding.familyId}:${binding.routeTag}:${warmFrameCount}:${Math.max(3, Math.floor(baseInput.substeps ?? 3))}`,
  };
}

export function createFutureNativeSceneBridgeMpmDedicatedRuntime(
  binding: FutureNativeSceneBinding,
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
  sceneScale: number,
): FutureNativeMpmDedicatedBridgeRuntime | null {
  const plan = buildFutureNativeMpmDedicatedRuntimePlan(binding, config, layerIndex);
  if (!plan) return null;

  let runtime = (() => {
    switch (plan.familyId) {
      case 'mpm-viscoplastic': return createMpmViscoplasticOwnedKernelRuntime(plan.baseInput);
      case 'mpm-snow': return createMpmSnowOwnedKernelRuntime(plan.baseInput);
      case 'mpm-mud': return createMpmMudOwnedKernelRuntime(plan.baseInput);
      case 'mpm-paste': return createMpmPasteOwnedKernelRuntime(plan.baseInput);
    }
  })();

  for (let frame = 0; frame < plan.warmFrameCount; frame += 1) {
    runtime = (() => {
      const options = { substeps: Math.max(plan.minimumSubsteps, Math.floor(runtime.config.substeps)) };
      switch (plan.familyId) {
        case 'mpm-viscoplastic': return stepMpmViscoplasticOwnedKernelRuntime(runtime, options);
        case 'mpm-snow': return stepMpmSnowOwnedKernelRuntime(runtime, options);
        case 'mpm-mud': return stepMpmMudOwnedKernelRuntime(runtime, options);
        case 'mpm-paste': return stepMpmPasteOwnedKernelRuntime(runtime, options);
      }
    })();
  }

  return { binding, familyId: plan.familyId, baseInput: plan.baseInput, runtime, sceneScale };
}
