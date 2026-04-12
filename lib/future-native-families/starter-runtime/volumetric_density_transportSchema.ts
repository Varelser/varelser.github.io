export interface VolumetricDensityTransportNormalizedConfig {
  resolutionX: number;
  resolutionY: number;
  dissipation: number;
  injectionRate: number;
  injectionRadius: number;
  advectionStrength: number;
  buoyancy: number;
  swirlStrength: number;
  pressureRelaxation: number;
  pressureIterations: number;
  boundaryFade: number;
  lightAbsorption: number;
  shadowStrength: number;
  obstacleX: number;
  obstacleY: number;
  obstacleRadius: number;
  obstacleStrength: number;
  obstacleSoftness: number;
  lightMarchSteps: number;
  depthLayers: number;
  volumeDepthScale: number;
  smokeInjectorBias: number;
  smokePrismSeparation: number;
  smokePersistence: number;
  smokeDensityGain: number;
  smokeLiftBias: number;
  smokeLightScatter: number;
  smokeScatterAnisotropy: number;
  smokeRimBoost: number;
}

export function getDefaultVolumetricDensityTransportConfig(): VolumetricDensityTransportNormalizedConfig {
  return {
    resolutionX: 48,
    resolutionY: 48,
    dissipation: 0.02,
    injectionRate: 0.16,
    injectionRadius: 0.12,
    advectionStrength: 0.82,
    buoyancy: 0.18,
    swirlStrength: 0.42,
    pressureRelaxation: 0.22,
    pressureIterations: 4,
    boundaryFade: 0.12,
    lightAbsorption: 0.42,
    shadowStrength: 0.55,
    obstacleX: 0.0,
    obstacleY: -0.08,
    obstacleRadius: 0.16,
    obstacleStrength: 0.42,
    obstacleSoftness: 0.22,
    lightMarchSteps: 7,
    depthLayers: 4,
    volumeDepthScale: 0.68,
    smokeInjectorBias: 0.5,
    smokePrismSeparation: 0.5,
    smokePersistence: 0.5,
    smokeDensityGain: 1.0,
    smokeLiftBias: 0.5,
    smokeLightScatter: 0,
    smokeScatterAnisotropy: 0,
    smokeRimBoost: 0,
  };
}
