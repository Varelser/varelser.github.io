import type { Layer2Type, ParticleConfig } from '../../types';
import {
  getFutureNativeSceneBinding,
  getFutureNativeScenePresetBindings,
  type FutureNativeSceneBinding,
} from './futureNativeSceneBindingData';
import {
  getVolumetricRouteHighlightSpec,
  type VolumetricRouteHighlightFamilyId,
} from './futureNativeVolumetricFamilyMetadata';
import {
  getVolumetricRecommendationSpec,
  type VolumetricRecommendationMetric,
} from './futureNativeVolumetricRecommendationMetadata';

function uniquePresetIds(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.length > 0)));
}

function buildDefaultRecommendedPresetIds(mode: Layer2Type): string[] {
  const binding = getFutureNativeSceneBinding(mode);
  const presets = getFutureNativeScenePresetBindings(mode).map((preset) => preset.id);
  if (!binding) return presets;
  return uniquePresetIds([binding.primaryPresetId, ...presets]);
}

type RecommendationFogContext = {
  fogDensity: number;
  fogGlow: number;
  fogAnisotropy: number;
};

function getRecommendationRuntimeConfig(
  familyId: VolumetricRouteHighlightFamilyId,
  config: ParticleConfig,
  layerIndex: 2 | 3,
): Record<string, number> {
  return getVolumetricRouteHighlightSpec(familyId).buildRuntimeConfig(config, layerIndex) as unknown as Record<string, number>;
}

function getRecommendationFogContext(config: ParticleConfig, layerIndex: 2 | 3): RecommendationFogContext {
  return {
    fogDensity: layerIndex === 2 ? config.layer2FogDensity : config.layer3FogDensity,
    fogGlow: layerIndex === 2 ? config.layer2FogGlow : config.layer3FogGlow,
    fogAnisotropy: layerIndex === 2 ? config.layer2FogAnisotropy : config.layer3FogAnisotropy,
  };
}

function evaluateRecommendationMetric(
  metric: VolumetricRecommendationMetric,
  runtimeConfig: Record<string, number>,
  fog: RecommendationFogContext,
  source: string,
): number {
  if (metric.kind === 'source') {
    return metric.matches.includes(source) ? metric.weight : 0;
  }
  const rawValue = metric.kind === 'runtime'
    ? (runtimeConfig[metric.key] ?? 0)
    : fog[metric.key];
  const value = metric.invert ? 1 - rawValue : rawValue;
  return value * metric.weight;
}

function buildVolumetricRecommendedPresetIds(
  binding: FutureNativeSceneBinding,
  presets: string[],
  config: ParticleConfig,
  layerIndex: 2 | 3,
): string[] {
  const recommendationSpec = getVolumetricRecommendationSpec(binding.modeId);
  if (!recommendationSpec || recommendationSpec.familyId !== binding.familyId) {
    return uniquePresetIds([binding.primaryPresetId, ...presets]);
  }
  const runtimeConfig = getRecommendationRuntimeConfig(binding.familyId, config, layerIndex);
  const fog = getRecommendationFogContext(config, layerIndex);
  const source = layerIndex === 2 ? config.layer2Source : config.layer3Source;
  const secondaryIds = recommendationSpec.secondaryOptions
    .map((option, index) => ({
      presetId: option.presetId,
      score: option.metrics.reduce((sum, metric) => sum + evaluateRecommendationMetric(metric, runtimeConfig, fog, source), 0),
      index,
    }))
    .sort((left, right) => (right.score - left.score) || (left.index - right.index))
    .map((option) => option.presetId)
    .filter((presetId) => presets.includes(presetId));
  return uniquePresetIds([binding.primaryPresetId, ...secondaryIds]);
}

export function getFutureNativeVolumetricRecommendedPresetIds(
  mode: Layer2Type,
  config: ParticleConfig,
  layerIndex: 2 | 3,
): string[] | null {
  const binding = getFutureNativeSceneBinding(mode);
  if (!binding) return null;
  if (!getVolumetricRecommendationSpec(mode)) return null;
  const presets = getFutureNativeScenePresetBindings(mode).map((preset) => preset.id);
  return buildVolumetricRecommendedPresetIds(binding, presets, config, layerIndex);
}

export function getDefaultFutureNativeRecommendedPresetIds(mode: Layer2Type): string[] {
  return buildDefaultRecommendedPresetIds(mode);
}
