import type { ParticleConfig } from '../../types';
import type { FutureNativeSceneBinding } from './futureNativeSceneBindings';
import { buildMpmGranularInput } from './futureNativeSceneBridgeInputs';
import { buildMpmSnowInput, buildMpmViscoplasticInput, resolveMpmSnowWarmFrameCount, resolveMpmViscoplasticWarmFrameCount } from './futureNativeSceneBridgeMpmInputs';
import { buildMpmMudInput, buildMpmPasteInput, resolveMpmMudWarmFrameCount, resolveMpmPasteWarmFrameCount } from './futureNativeSceneBridgeMpmMudPaste';
import { getLayerTemporalStrength, type SupportedLayerIndex } from './futureNativeSceneBridgeShared';
import type { FutureNativeSceneBridgeRuntime } from './futureNativeSceneBridgeTypes';
import { createMpmGranularRuntimeFromInput } from './starter-runtime/mpm_granularAdapter';
import { stepMpmGranularRuntime } from './starter-runtime/mpm_granularSolver';

type FutureNativeMpmBridgeRuntime = Extract<
  FutureNativeSceneBridgeRuntime,
  { familyId: 'mpm-granular' | 'mpm-viscoplastic' | 'mpm-snow' | 'mpm-mud' | 'mpm-paste' }
>;

export function createFutureNativeSceneBridgeMpmRuntime(
  binding: FutureNativeSceneBinding,
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
  sceneScale: number,
): FutureNativeMpmBridgeRuntime | null {
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  if (binding.familyId === 'mpm-granular') {
    const baseInput = buildMpmGranularInput(config, layerIndex);
    const warmFrameCount = Math.max(8, Math.min(18, Math.round((binding.routeTag === 'future-native-mpm-granular-jammed' ? 14 : 10) + temporalStrength * 10)));
    let runtime = createMpmGranularRuntimeFromInput(baseInput);
    for (let frame = 0; frame < warmFrameCount; frame += 1) {
      runtime = stepMpmGranularRuntime(runtime, {
        substeps: Math.max(2, Math.floor(runtime.config.substeps)),
      });
    }
    return { binding, familyId: 'mpm-granular', baseInput, runtime, sceneScale };
  }
  if (binding.familyId === 'mpm-viscoplastic') {
    const baseInput = buildMpmViscoplasticInput(config, layerIndex);
    const warmFrameCount = resolveMpmViscoplasticWarmFrameCount(binding.routeTag, temporalStrength);
    let runtime = createMpmGranularRuntimeFromInput(baseInput);
    for (let frame = 0; frame < warmFrameCount; frame += 1) {
      runtime = stepMpmGranularRuntime(runtime, {
        substeps: Math.max(3, Math.floor(runtime.config.substeps)),
      });
    }
    return { binding, familyId: 'mpm-viscoplastic', baseInput, runtime, sceneScale };
  }
  if (binding.familyId === 'mpm-snow') {
    const baseInput = buildMpmSnowInput(config, layerIndex);
    const warmFrameCount = resolveMpmSnowWarmFrameCount(binding.routeTag, temporalStrength);
    let runtime = createMpmGranularRuntimeFromInput(baseInput);
    for (let frame = 0; frame < warmFrameCount; frame += 1) {
      runtime = stepMpmGranularRuntime(runtime, {
        substeps: Math.max(3, Math.floor(runtime.config.substeps)),
      });
    }
    return { binding, familyId: 'mpm-snow', baseInput, runtime, sceneScale };
  }
  if (binding.familyId === 'mpm-mud') {
    const baseInput = buildMpmMudInput(config, layerIndex);
    const warmFrameCount = resolveMpmMudWarmFrameCount(binding.routeTag, temporalStrength);
    let runtime = createMpmGranularRuntimeFromInput(baseInput);
    for (let frame = 0; frame < warmFrameCount; frame += 1) {
      runtime = stepMpmGranularRuntime(runtime, {
        substeps: Math.max(3, Math.floor(runtime.config.substeps)),
      });
    }
    return { binding, familyId: 'mpm-mud', baseInput, runtime, sceneScale };
  }
  if (binding.familyId === 'mpm-paste') {
    const baseInput = buildMpmPasteInput(config, layerIndex);
    const warmFrameCount = resolveMpmPasteWarmFrameCount(binding.routeTag, temporalStrength);
    let runtime = createMpmGranularRuntimeFromInput(baseInput);
    for (let frame = 0; frame < warmFrameCount; frame += 1) {
      runtime = stepMpmGranularRuntime(runtime, {
        substeps: Math.max(3, Math.floor(runtime.config.substeps)),
      });
    }
    return { binding, familyId: 'mpm-paste', baseInput, runtime, sceneScale };
  }
  return null;
}
