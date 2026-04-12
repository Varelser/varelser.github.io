import type { Layer2Type } from '../../types';
import {
  getFutureNativeSceneBinding as getFutureNativeSceneBindingMetadata,
  getFutureNativeScenePresetBindings,
} from './futureNativeSceneBindingData';

export type {
  FutureNativeSceneBinding,
  FutureNativeSceneBindingMode,
  FutureNativeSceneBoundFamilyId,
  FutureNativeScenePresetBinding,
} from './futureNativeSceneBindingData';

export { getFutureNativeScenePresetBindings } from './futureNativeSceneBindingData';

export { buildFutureNativeScenePresetPatch } from './futureNativeScenePresetPatches';
export { getFutureNativeRecommendedPresetIds } from './futureNativeSceneRecommendedPresetIds';
export { getFutureNativeSceneRuntimeBinding as getFutureNativeSceneBinding } from './futureNativeSceneBindingRuntime';

export function getFutureNativeSceneBindingSummary(mode: Layer2Type): string | null {
  const binding = getFutureNativeSceneBindingMetadata(mode);
  if (!binding) return null;
  return `${binding.familyId} (${binding.bindingMode})`;
}

