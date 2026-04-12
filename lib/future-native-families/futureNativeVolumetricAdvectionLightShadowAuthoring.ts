import type { ParticleConfig } from '../../types';
import {
  buildVolumetricAdvectionPresetPreview,
  buildVolumetricAdvectionRuntimeTuningSnapshot,
  buildVolumetricLightShadowPresetPreview,
  buildVolumetricLightShadowRuntimeTuningSnapshot,
  formatVolumetricAdvectionRuntimeFocusValues,
  formatVolumetricLightShadowRuntimeFocusValues,
} from './futureNativeSmokeAuthoring';

export function buildFutureNativeAdvectionPreviewSignature(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  presetId: string,
): string[] {
  const preview = buildVolumetricAdvectionPresetPreview(presetId, layerIndex);
  const runtime = buildVolumetricAdvectionRuntimeTuningSnapshot(config, layerIndex);
  if (!preview || !runtime) return [];
  return [`preset:${preview.presetId}`, ...formatVolumetricAdvectionRuntimeFocusValues(runtime)];
}

export function buildFutureNativeLightShadowPreviewSignature(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  presetId: string,
): string[] {
  const preview = buildVolumetricLightShadowPresetPreview(presetId, layerIndex);
  const runtime = buildVolumetricLightShadowRuntimeTuningSnapshot(config, layerIndex);
  if (!preview || !runtime) return [];
  return [`preset:${preview.presetId}`, ...formatVolumetricLightShadowRuntimeFocusValues(runtime)];
}
