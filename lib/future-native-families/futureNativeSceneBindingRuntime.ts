import type { Layer2Type } from '../../types';
import {
  FUTURE_NATIVE_SCENE_BINDINGS,
  type FutureNativeSceneBinding,
} from './futureNativeSceneBindingData';

export type {
  FutureNativeSceneBinding,
  FutureNativeSceneBindingMode,
  FutureNativeSceneBoundFamilyId,
} from './futureNativeSceneBindingData';

export const FUTURE_NATIVE_SCENE_RUNTIME_BINDINGS = [
  ...FUTURE_NATIVE_SCENE_BINDINGS,
] as const satisfies readonly FutureNativeSceneBinding[];

export function getFutureNativeSceneRuntimeBinding(mode: Layer2Type): FutureNativeSceneBinding | null {
  return FUTURE_NATIVE_SCENE_RUNTIME_BINDINGS.find((binding) => binding.modeId === mode) ?? null;
}
