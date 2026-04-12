import type { ParticleConfig } from '../../types';
import { type SupportedLayerIndex } from './futureNativeSceneBridgeShared';
import {
  buildFutureNativeVolumetricDensityTransportInput,
  buildVolumetricDensityTransportDiagnosticValues,
} from './futureNativeSceneBridgeVolumetricDensityPressure';
import type { VolumetricDensityTransportInputConfig } from './starter-runtime/volumetric_density_transportAdapter';

export function buildFutureNativeVolumetricAdvectionInput(
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
): VolumetricDensityTransportInputConfig {
  return buildFutureNativeVolumetricDensityTransportInput(config, layerIndex);
}

export function buildFutureNativeVolumetricAdvectionDiagnosticValues(snapshot: {
  advectionStrength: number;
  buoyancy: number;
  shadowStrength: number;
  obstacleStrength: number;
  depthLayers: number;
  volumeDepthScale: number;
}): string[] {
  return buildVolumetricDensityTransportDiagnosticValues(snapshot);
}
