import type { FutureNativeUiSectionSpec } from './runtimeContracts';

export const volumetricSmokeUiSections: readonly FutureNativeUiSectionSpec[] = [
  {
    id: 'grid',
    title: 'Grid',
    controls: [
      { key: 'resolutionX', label: 'Resolution X', kind: 'slider', min: 8, max: 256, step: 1 },
      { key: 'resolutionY', label: 'Resolution Y', kind: 'slider', min: 8, max: 256, step: 1 },
      { key: 'boundaryFade', label: 'Boundary fade', kind: 'slider', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: 'transport',
    title: 'Transport',
    controls: [
      { key: 'dissipation', label: 'Dissipation', kind: 'slider', min: 0, max: 0.25, step: 0.005 },
      { key: 'advectionStrength', label: 'Advection', kind: 'slider', min: 0, max: 1.25, step: 0.01 },
      { key: 'pressureRelaxation', label: 'Pressure relax', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'pressureIterations', label: 'Pressure iterations', kind: 'slider', min: 1, max: 12, step: 1 },
    ],
  },
  {
    id: 'injector-plume',
    title: 'Injector / Plume',
    controls: [
      { key: 'injectionRate', label: 'Injection rate', kind: 'slider', min: 0.01, max: 1.5, step: 0.01 },
      { key: 'injectionRadius', label: 'Injection radius', kind: 'slider', min: 0.03, max: 0.35, step: 0.01 },
      { key: 'buoyancy', label: 'Buoyancy', kind: 'slider', min: -0.25, max: 0.75, step: 0.01 },
      { key: 'swirlStrength', label: 'Swirl', kind: 'slider', min: 0, max: 1.5, step: 0.01 },
      { key: 'smokeInjectorBias', label: 'Injector bias', kind: 'slider', min: 0, max: 1.5, step: 0.01 },
      { key: 'smokeDensityGain', label: 'Density gain', kind: 'slider', min: 0.2, max: 2.5, step: 0.01 },
      { key: 'smokeLiftBias', label: 'Lift bias', kind: 'slider', min: 0, max: 1.5, step: 0.01 },
    ],
  },
  {
    id: 'prism-lighting',
    title: 'Prism / Lighting',
    controls: [
      { key: 'lightAbsorption', label: 'Light absorption', kind: 'slider', min: 0, max: 1.5, step: 0.01 },
      { key: 'shadowStrength', label: 'Shadow strength', kind: 'slider', min: 0, max: 1.5, step: 0.01 },
      { key: 'lightMarchSteps', label: 'Light march steps', kind: 'slider', min: 2, max: 16, step: 1 },
      { key: 'smokeLightScatter', label: 'Light scatter', kind: 'slider', min: 0, max: 1.5, step: 0.01 },
      { key: 'smokeScatterAnisotropy', label: 'Scatter anisotropy', kind: 'slider', min: 0, max: 1.5, step: 0.01 },
      { key: 'smokeRimBoost', label: 'Rim boost', kind: 'slider', min: 0, max: 1.5, step: 0.01 },
      { key: 'smokePrismSeparation', label: 'Prism separation', kind: 'slider', min: 0, max: 1.5, step: 0.01 },
    ],
  },
  {
    id: 'slab-obstacle',
    title: 'Slab / Obstacle',
    controls: [
      { key: 'obstacleX', label: 'Obstacle X', kind: 'slider', min: -0.45, max: 0.45, step: 0.01 },
      { key: 'obstacleY', label: 'Obstacle Y', kind: 'slider', min: -0.45, max: 0.45, step: 0.01 },
      { key: 'obstacleRadius', label: 'Obstacle radius', kind: 'slider', min: 0.04, max: 0.4, step: 0.01 },
      { key: 'obstacleStrength', label: 'Obstacle strength', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'obstacleSoftness', label: 'Obstacle softness', kind: 'slider', min: 0.02, max: 0.6, step: 0.01 },
      { key: 'smokePersistence', label: 'Smoke persistence', kind: 'slider', min: 0, max: 1.5, step: 0.01 },
    ],
  },
  {
    id: 'volume',
    title: 'Volume layers',
    controls: [
      { key: 'depthLayers', label: 'Depth layers', kind: 'slider', min: 2, max: 8, step: 1 },
      { key: 'volumeDepthScale', label: 'Depth scale', kind: 'slider', min: 0.1, max: 1.6, step: 0.01 },
    ],
  },
];
