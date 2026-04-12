import type { ParticleConfig } from '../../types';
import {
  buildFutureNativeVolumetricDensityTransportInput,
  buildFutureNativeVolumetricPressureCouplingInput,
  buildVolumetricDensityTransportDiagnosticValues,
  buildVolumetricPressureDiagnosticValues,
} from './futureNativeSceneBridgeVolumetricDensityPressure';
import { buildProjectVolumetricRouteHighlights } from './futureNativeVolumetricRouteHighlights';

export function buildFutureNativeDensityPreviewSignature(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  presetId: string,
): string[] {
  const runtime = buildFutureNativeVolumetricDensityTransportInput(config, layerIndex);
  const highlight = buildProjectVolumetricRouteHighlights().find((entry) => entry.familyId === 'volumetric-density-transport');
  const resolvedPresetId = highlight?.profiles.find((profile) => profile.presetId === presetId)?.presetId ?? presetId;
  if (!resolvedPresetId) return [];
  return [
    `preset:${resolvedPresetId}`,
    ...buildVolumetricDensityTransportDiagnosticValues({
      advectionStrength: runtime.advectionStrength ?? 0,
      buoyancy: runtime.buoyancy ?? 0,
      shadowStrength: runtime.shadowStrength ?? 0,
      obstacleStrength: runtime.obstacleStrength ?? 0,
      depthLayers: runtime.depthLayers ?? 0,
      volumeDepthScale: runtime.volumeDepthScale ?? 0,
    }),
  ];
}

export function buildFutureNativePressurePreviewSignature(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  presetId: string,
): string[] {
  const runtime = buildFutureNativeVolumetricPressureCouplingInput(config, layerIndex);
  const highlight = buildProjectVolumetricRouteHighlights().find((entry) => entry.familyId === 'volumetric-pressure-coupling');
  const preset = highlight?.profiles.find((profile) => profile.presetId === presetId) ?? highlight?.profiles[0] ?? null;
  if (!preset) return [];
  return [
    `preset:${preset.presetId}`,
    ...buildVolumetricPressureDiagnosticValues({
      pressureRelaxation: runtime.pressureRelaxation ?? 0,
      pressureIterations: runtime.pressureIterations ?? 0,
      boundaryFade: runtime.boundaryFade ?? 0,
      obstacleStrength: runtime.obstacleStrength ?? 0,
      obstacleSoftness: runtime.obstacleSoftness ?? 0,
      depthLayers: runtime.depthLayers ?? 0,
    }),
  ];
}
