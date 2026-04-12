import type { FutureNativeProjectIntegratedId } from './futureNativeFamiliesIntegrationShared';
import { normalizeVolumetricDensityTransportConfig } from './starter-runtime/volumetric_density_transportAdapter';

export type FutureNativeIntegratedVolumetricId =
  | 'volumetric-density-transport'
  | 'volumetric-smoke'
  | 'volumetric-advection'
  | 'volumetric-pressure-coupling'
  | 'volumetric-light-shadow-coupling';

const volumetricIntegratedFixtureInputs: Record<FutureNativeIntegratedVolumetricId, Record<string, unknown>> = {
  'volumetric-density-transport': {
    resolutionX: 16, resolutionY: 18, injectionRate: 0.2, injectionRadius: 0.14, advectionStrength: 0.86, buoyancy: 0.18,
    swirlStrength: 0.4, pressureRelaxation: 0.25, pressureIterations: 5, boundaryFade: 0.1, dissipation: 0.018,
    lightAbsorption: 0.48, shadowStrength: 0.62,
  },
  'volumetric-smoke': {
    resolutionX: 18, resolutionY: 20, injectionRate: 0.22, injectionRadius: 0.18, advectionStrength: 0.82, buoyancy: 0.24,
    swirlStrength: 0.74, pressureRelaxation: 0.28, pressureIterations: 6, boundaryFade: 0.12, dissipation: 0.016,
    lightAbsorption: 0.42, shadowStrength: 0.56, obstacleX: 0.04, obstacleY: -0.02, obstacleRadius: 0.16,
    obstacleStrength: 0.38, obstacleSoftness: 0.18, lightMarchSteps: 8, depthLayers: 5, volumeDepthScale: 0.82,
    smokeInjectorBias: 0.72, smokePrismSeparation: 0.88, smokePersistence: 0.78, smokeDensityGain: 1.08,
    smokeLiftBias: 0.74, smokeLightScatter: 0.92, smokeScatterAnisotropy: 0.84, smokeRimBoost: 0.76,
  },
  'volumetric-advection': {
    resolutionX: 18, resolutionY: 16, injectionRate: 0.18, injectionRadius: 0.16, advectionStrength: 0.96, buoyancy: 0.22,
    swirlStrength: 0.68, pressureRelaxation: 0.2, pressureIterations: 4, boundaryFade: 0.08, dissipation: 0.014,
    lightAbsorption: 0.38, shadowStrength: 0.52, obstacleX: 0.02, obstacleY: -0.04, obstacleRadius: 0.14,
    obstacleStrength: 0.34, obstacleSoftness: 0.16, lightMarchSteps: 8, depthLayers: 5, volumeDepthScale: 0.84,
  },
  'volumetric-pressure-coupling': {
    resolutionX: 20, resolutionY: 18, injectionRate: 0.16, injectionRadius: 0.14, advectionStrength: 0.74, buoyancy: 0.14,
    swirlStrength: 0.84, pressureRelaxation: 0.62, pressureIterations: 8, boundaryFade: 0.16, dissipation: 0.012,
    lightAbsorption: 0.42, shadowStrength: 0.58, obstacleX: -0.06, obstacleY: -0.02, obstacleRadius: 0.18,
    obstacleStrength: 0.62, obstacleSoftness: 0.16, lightMarchSteps: 8, depthLayers: 5, volumeDepthScale: 0.78,
  },
  'volumetric-light-shadow-coupling': {
    resolutionX: 22, resolutionY: 20, injectionRate: 0.18, injectionRadius: 0.15, advectionStrength: 0.68, buoyancy: 0.2,
    swirlStrength: 0.76, pressureRelaxation: 0.38, pressureIterations: 7, boundaryFade: 0.14, dissipation: 0.011,
    lightAbsorption: 0.28, shadowStrength: 0.72, obstacleX: -0.04, obstacleY: -0.01, obstacleRadius: 0.17,
    obstacleStrength: 0.54, obstacleSoftness: 0.14, lightMarchSteps: 11, depthLayers: 6, volumeDepthScale: 0.94,
  },
};

const volumetricRuntimeProfiles: Record<Exclude<FutureNativeIntegratedVolumetricId, 'volumetric-density-transport'>, string> = {
  'volumetric-smoke': 'prism+static',
  'volumetric-advection': 'condense+sublimate',
  'volumetric-pressure-coupling': 'vortex+cells',
  'volumetric-light-shadow-coupling': 'charge+velvet',
};

export function isIntegratedVolumetricFamilyId(
  familyId: FutureNativeProjectIntegratedId,
): familyId is FutureNativeIntegratedVolumetricId {
  return familyId in volumetricIntegratedFixtureInputs;
}

export function getIntegratedVolumetricFixtureInput(
  familyId: FutureNativeIntegratedVolumetricId,
): Record<string, unknown> {
  return { ...volumetricIntegratedFixtureInputs[familyId] };
}

export function getIntegratedVolumetricRuntimeConfigValues(
  familyId: FutureNativeIntegratedVolumetricId,
  config: ReturnType<typeof normalizeVolumetricDensityTransportConfig>,
): string[] {
  if (familyId === 'volumetric-density-transport') {
    return [
      `resolution:${config.resolutionX}x${config.resolutionY}`,
      `inject:${config.injectionRate}`,
      `injectRadius:${config.injectionRadius}`,
      `advection:${config.advectionStrength}`,
      `buoyancy:${config.buoyancy}`,
      `swirl:${config.swirlStrength}`,
      `pressureRelax:${config.pressureRelaxation}`,
      `pressureIterations:${config.pressureIterations}`,
      `lightAbsorption:${config.lightAbsorption}`,
      `shadow:${config.shadowStrength}`,
    ];
  }
  const base = [
    `routeProfiles:${volumetricRuntimeProfiles[familyId]}`,
    `resolution:${config.resolutionX}x${config.resolutionY}`,
    `inject:${config.injectionRate}`,
    `injectRadius:${config.injectionRadius}`,
  ];
  switch (familyId) {
    case 'volumetric-smoke':
      return base.concat([
        `advection:${config.advectionStrength}`, `buoyancy:${config.buoyancy}`, `swirl:${config.swirlStrength}`,
        `injectorBias:${config.smokeInjectorBias}`, `densityGain:${config.smokeDensityGain}`, `liftBias:${config.smokeLiftBias}`,
        `lightScatter:${config.smokeLightScatter}`, `scatterAnisotropy:${config.smokeScatterAnisotropy}`, `rimBoost:${config.smokeRimBoost}`,
        `pressureRelax:${config.pressureRelaxation}`, `pressureIterations:${config.pressureIterations}`, `lightAbsorption:${config.lightAbsorption}`,
        `prismSeparation:${config.smokePrismSeparation}`, `shadow:${config.shadowStrength}`, `persistence:${config.smokePersistence}`,
        `obstacle:${config.obstacleX},${config.obstacleY},${config.obstacleRadius}`, `lightMarch:${config.lightMarchSteps}`,
      ]);
    case 'volumetric-advection':
      return base.concat([
        `advection:${config.advectionStrength}`, `buoyancy:${config.buoyancy}`, `swirl:${config.swirlStrength}`, `dissipation:${config.dissipation}`,
        `pressureRelax:${config.pressureRelaxation}`, `pressureIterations:${config.pressureIterations}`,
        `lightAbsorption:${config.lightAbsorption}`, `shadow:${config.shadowStrength}`,
        `obstacle:${config.obstacleX},${config.obstacleY},${config.obstacleRadius}`, `depthLayers:${config.depthLayers}`, `volumeDepth:${config.volumeDepthScale}`,
      ]);
    case 'volumetric-pressure-coupling':
      return base.concat([
        `pressureRelax:${config.pressureRelaxation}`, `pressureIterations:${config.pressureIterations}`, `boundaryFade:${config.boundaryFade}`, `swirl:${config.swirlStrength}`,
        `obstacle:${config.obstacleX},${config.obstacleY},${config.obstacleRadius}`, `obstacleStrength:${config.obstacleStrength}`, `obstacleSoftness:${config.obstacleSoftness}`,
        `lightAbsorption:${config.lightAbsorption}`, `shadow:${config.shadowStrength}`, `depthLayers:${config.depthLayers}`, `volumeDepth:${config.volumeDepthScale}`,
      ]);
    case 'volumetric-light-shadow-coupling':
      return base.concat([
        `lightAbsorption:${config.lightAbsorption}`, `shadow:${config.shadowStrength}`, `lightMarch:${config.lightMarchSteps}`,
        `obstacle:${config.obstacleX},${config.obstacleY},${config.obstacleRadius}`, `obstacleStrength:${config.obstacleStrength}`,
        `depthLayers:${config.depthLayers}`, `volumeDepth:${config.volumeDepthScale}`,
      ]);
  }
}
