import type { ParticleConfig } from '../../types';
import { buildFutureNativeVolumetricAdvectionPresetPatch } from './futureNativeScenePresetPatchesVolumetricAdvection';
import { buildFutureNativeVolumetricDensityPressurePresetPatch } from './futureNativeScenePresetPatchesVolumetricDensityPressure';
import { buildFutureNativeVolumetricLightShadowPresetPatch } from './futureNativeScenePresetPatchesVolumetricLightShadow';
import { buildFutureNativeVolumetricSmokePresetPatch } from './futureNativeScenePresetPatchesVolumetricSmoke';

export function buildFutureNativeVolumetricPresetPatch(id: string, layerIndex: 2 | 3): Partial<ParticleConfig> | null {
  const densityPressurePatch = buildFutureNativeVolumetricDensityPressurePresetPatch(id, layerIndex);
  if (densityPressurePatch) return densityPressurePatch;
  const advectionPatch = buildFutureNativeVolumetricAdvectionPresetPatch(id, layerIndex);
  if (advectionPatch) return advectionPatch;
  const lightShadowPatch = buildFutureNativeVolumetricLightShadowPresetPatch(id, layerIndex);
  if (lightShadowPatch) return lightShadowPatch;
  return buildFutureNativeVolumetricSmokePresetPatch(id, layerIndex);
}
