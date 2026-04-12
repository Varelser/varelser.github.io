import type { Layer2Type, ParticleConfig } from '../../types';
import { getDefaultFutureNativeRecommendedPresetIds, getFutureNativeVolumetricRecommendedPresetIds } from './futureNativeVolumetricRouteResolvers';

function getDefaultRecommendedPresetIds(mode: Layer2Type): string[] {
  return getDefaultFutureNativeRecommendedPresetIds(mode);
}

export function getFutureNativeRecommendedPresetIds(
  mode: Layer2Type,
  config?: ParticleConfig,
  layerIndex: 2 | 3 = 2,
): string[] {
  if (!config) return getDefaultRecommendedPresetIds(mode);
  const volumetricRecommended = getFutureNativeVolumetricRecommendedPresetIds(mode, config, layerIndex);
  if (volumetricRecommended) return volumetricRecommended;
  return getDefaultRecommendedPresetIds(mode);
}
