import type { ParticleConfig } from '../../types';
import { buildFutureNativeMpmGranularPresetPatch } from './futureNativeScenePresetPatchesMpmGranular';
import { buildFutureNativeMpmMudPastePresetPatch } from './futureNativeScenePresetPatchesMpmMudPaste';
import { buildFutureNativeMpmSnowViscoplasticPresetPatch } from './futureNativeScenePresetPatchesMpmSnowViscoplastic';

export function buildFutureNativeMpmPresetPatch(id: string, layerIndex: 2 | 3): Partial<ParticleConfig> | null {
  const granularPatch = buildFutureNativeMpmGranularPresetPatch(id, layerIndex);
  if (granularPatch) return granularPatch;
  const snowOrViscoplasticPatch = buildFutureNativeMpmSnowViscoplasticPresetPatch(id, layerIndex);
  if (snowOrViscoplasticPatch) return snowOrViscoplasticPatch;
  return buildFutureNativeMpmMudPastePresetPatch(id, layerIndex);
}
