import {
  getDefaultVolumetricDensityTransportConfig,
  type VolumetricDensityTransportNormalizedConfig,
} from './volumetric_density_transportSchema';
import {
  createVolumetricDensityTransportRuntimeState,
  type VolumetricDensityTransportRuntimeState,
} from './volumetric_density_transportSolver';

export type VolumetricDensityTransportInputConfig = Partial<VolumetricDensityTransportNormalizedConfig>;

export function normalizeVolumetricDensityTransportConfig(
  input?: VolumetricDensityTransportInputConfig,
): VolumetricDensityTransportNormalizedConfig {
  const defaults = getDefaultVolumetricDensityTransportConfig();
  return {
    resolutionX: Math.max(8, Math.floor(input?.resolutionX ?? defaults.resolutionX)),
    resolutionY: Math.max(8, Math.floor(input?.resolutionY ?? defaults.resolutionY)),
    dissipation: Math.min(0.25, Math.max(0, input?.dissipation ?? defaults.dissipation)),
    injectionRate: Math.max(0.01, input?.injectionRate ?? defaults.injectionRate),
    injectionRadius: Math.min(0.35, Math.max(0.03, input?.injectionRadius ?? defaults.injectionRadius)),
    advectionStrength: Math.min(1.25, Math.max(0, input?.advectionStrength ?? defaults.advectionStrength)),
    buoyancy: Math.min(0.75, Math.max(-0.25, input?.buoyancy ?? defaults.buoyancy)),
    swirlStrength: Math.min(1.5, Math.max(0, input?.swirlStrength ?? defaults.swirlStrength)),
    pressureRelaxation: Math.min(1, Math.max(0, input?.pressureRelaxation ?? defaults.pressureRelaxation)),
    pressureIterations: Math.max(1, Math.min(12, Math.floor(input?.pressureIterations ?? defaults.pressureIterations))),
    boundaryFade: Math.min(1, Math.max(0, input?.boundaryFade ?? defaults.boundaryFade)),
    lightAbsorption: Math.min(1.5, Math.max(0, input?.lightAbsorption ?? defaults.lightAbsorption)),
    shadowStrength: Math.min(1.5, Math.max(0, input?.shadowStrength ?? defaults.shadowStrength)),
    obstacleX: Math.min(0.45, Math.max(-0.45, input?.obstacleX ?? defaults.obstacleX)),
    obstacleY: Math.min(0.45, Math.max(-0.45, input?.obstacleY ?? defaults.obstacleY)),
    obstacleRadius: Math.min(0.4, Math.max(0.04, input?.obstacleRadius ?? defaults.obstacleRadius)),
    obstacleStrength: Math.min(1, Math.max(0, input?.obstacleStrength ?? defaults.obstacleStrength)),
    obstacleSoftness: Math.min(0.6, Math.max(0.02, input?.obstacleSoftness ?? defaults.obstacleSoftness)),
    lightMarchSteps: Math.max(2, Math.min(16, Math.floor(input?.lightMarchSteps ?? defaults.lightMarchSteps))),
    depthLayers: Math.max(2, Math.min(8, Math.floor(input?.depthLayers ?? defaults.depthLayers))),
    volumeDepthScale: Math.min(1.6, Math.max(0.1, input?.volumeDepthScale ?? defaults.volumeDepthScale)),
    smokeInjectorBias: Math.min(1.5, Math.max(0, input?.smokeInjectorBias ?? defaults.smokeInjectorBias)),
    smokePrismSeparation: Math.min(1.5, Math.max(0, input?.smokePrismSeparation ?? defaults.smokePrismSeparation)),
    smokePersistence: Math.min(1.5, Math.max(0, input?.smokePersistence ?? defaults.smokePersistence)),
    smokeDensityGain: Math.min(2.5, Math.max(0.2, input?.smokeDensityGain ?? defaults.smokeDensityGain)),
    smokeLiftBias: Math.min(1.5, Math.max(0, input?.smokeLiftBias ?? defaults.smokeLiftBias)),
    smokeLightScatter: Math.min(1.5, Math.max(0, input?.smokeLightScatter ?? defaults.smokeLightScatter)),
    smokeScatterAnisotropy: Math.min(1.5, Math.max(0, input?.smokeScatterAnisotropy ?? defaults.smokeScatterAnisotropy)),
    smokeRimBoost: Math.min(1.5, Math.max(0, input?.smokeRimBoost ?? defaults.smokeRimBoost)),
  };
}

export function createVolumetricDensityTransportRuntimeFromInput(
  input?: VolumetricDensityTransportInputConfig,
): VolumetricDensityTransportRuntimeState {
  return createVolumetricDensityTransportRuntimeState(normalizeVolumetricDensityTransportConfig(input));
}
