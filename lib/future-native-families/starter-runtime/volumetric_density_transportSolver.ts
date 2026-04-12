import type { VolumetricDensityTransportNormalizedConfig } from './volumetric_density_transportSchema';
import type {
  VolumetricDensityTransportDerivedFields,
  VolumetricDensityTransportRuntimeState,
  VolumetricDensityTransportStats,
} from './volumetric_density_transportState';
import { bilerp, cellIndex } from './volumetric_density_transportShared';
import { buildObstacleMasks, applyObstacleField } from './volumetric_density_transportObstacle';
import {
  computeLightingShadowAndMarch,
  computePressureField,
  computeRimLight,
  computeSecondaryLightMarch,
  computeVolumeDepth,
} from './volumetric_density_transportLighting';
import { applyInitialInjection, computeInjectorLayers, injectDensityAndVelocity } from './volumetric_density_transportInjector';
import {
  deriveVolumetricDensityTransportFields,
} from './volumetric_density_transportDerived';
export { deriveVolumetricDensityTransportFields } from './volumetric_density_transportDerived';
export { getVolumetricDensityTransportDerivedFieldsView } from './volumetric_density_transportDerived';
export { getVolumetricDensityTransportStats } from './volumetric_density_transportStats';
export type {
  VolumetricDensityTransportDerivedFields,
  VolumetricDensityTransportRuntimeState,
  VolumetricDensityTransportStats,
} from './volumetric_density_transportState';
function applyBoundaryFade(
  density: Float32Array,
  velocityX: Float32Array,
  velocityY: Float32Array,
  width: number,
  height: number,
  fade: number,
): void {
  for (let x = 0; x < width; x += 1) {
    const bottom = cellIndex(x, 0, width);
    const top = cellIndex(x, height - 1, width);
    density[bottom] *= 1 - fade;
    density[top] *= 1 - fade;
    velocityY[bottom] = Math.max(velocityY[bottom], 0);
    velocityY[top] = Math.min(velocityY[top], 0);
  }
  for (let y = 0; y < height; y += 1) {
    const left = cellIndex(0, y, width);
    const right = cellIndex(width - 1, y, width);
    density[left] *= 1 - fade;
    density[right] *= 1 - fade;
    velocityX[left] = Math.max(velocityX[left], 0);
    velocityX[right] = Math.min(velocityX[right], 0);
  }
}
export function createVolumetricDensityTransportRuntimeState(config: VolumetricDensityTransportNormalizedConfig): VolumetricDensityTransportRuntimeState {
  const cellCount = config.resolutionX * config.resolutionY;
  const density = new Float32Array(cellCount);
  const velocityX = new Float32Array(cellCount);
  const velocityY = new Float32Array(cellCount);
  const obstacleMasks = buildObstacleMasks(config);
  const injectorLayers = computeInjectorLayers(config, obstacleMasks.combined);
  applyInitialInjection(config, density, velocityX, velocityY, obstacleMasks.combined);
  const pressure = computePressureField(density, obstacleMasks.combined, config.resolutionX, config.resolutionY, config.pressureIterations, config.pressureRelaxation);
  const lightingAndShadow = computeLightingShadowAndMarch(
    density,
    obstacleMasks.combined,
    config.resolutionX,
    config.resolutionY,
    config.lightAbsorption,
    config.shadowStrength,
    config.lightMarchSteps,
    config.smokeLightScatter,
    config.smokeScatterAnisotropy,
  );
  const lightMarchSecondary = computeSecondaryLightMarch(
    density,
    obstacleMasks.combined,
    config.resolutionX,
    config.resolutionY,
    config.lightAbsorption,
    config.lightMarchSteps,
    config.smokeLightScatter,
    config.smokeScatterAnisotropy,
  );
  const rimLight = computeRimLight(
    lightingAndShadow.lighting,
    lightMarchSecondary,
    obstacleMasks.combined,
    config.resolutionX,
    config.resolutionY,
    config.smokeRimBoost,
  );
  const volumeDepth = computeVolumeDepth(
    density,
    lightingAndShadow.lighting,
    lightingAndShadow.shadow,
    lightMarchSecondary,
    rimLight,
    pressure,
    obstacleMasks.combined,
    config.volumeDepthScale,
  );
  const baseState: VolumetricDensityTransportRuntimeState = {
    config,
    frame: 0,
    density,
    velocityX,
    velocityY,
    pressure,
    lighting: lightingAndShadow.lighting,
    shadow: lightingAndShadow.shadow,
    primaryObstacleMask: obstacleMasks.primary,
    secondaryObstacleMask: obstacleMasks.secondary,
    obstacleMask: obstacleMasks.combined,
    lightMarch: lightingAndShadow.lightMarch,
    lightMarchSecondary,
    rimLight,
    plumeAnisotropy: new Float32Array(cellCount),
    plumeBranchLeft: new Float32Array(cellCount),
    plumeBranchRight: new Float32Array(cellCount),
    obstacleWake: new Float32Array(cellCount),
    primaryObstacleWake: new Float32Array(cellCount),
    secondaryObstacleWake: new Float32Array(cellCount),
    tripleLightInterference: new Float32Array(cellCount),
    lightTriadLayerNear: new Float32Array(cellCount),
    lightTriadLayerMid: new Float32Array(cellCount),
    lightTriadLayerFar: new Float32Array(cellCount),
    volumeDepth,
    injectorCoupling: injectorLayers.coupling,
    injectorSecondary: injectorLayers.secondary,
    injectorTertiary: injectorLayers.tertiary,
    wakeLayerNear: new Float32Array(cellCount),
    wakeLayerMid: new Float32Array(cellCount),
    wakeLayerFar: new Float32Array(cellCount),
    vorticityConfinement: new Float32Array(cellCount),
    wakeRecirculation: new Float32Array(cellCount),
    wakeRecirculationShellNear: new Float32Array(cellCount),
    wakeRecirculationShellFar: new Float32Array(cellCount),
    shearLayerRollup: new Float32Array(cellCount),
    vortexPacketLeft: new Float32Array(cellCount),
    vortexPacketRight: new Float32Array(cellCount),
    vortexPacketLayerNear: new Float32Array(cellCount),
    vortexPacketLayerMid: new Float32Array(cellCount),
    vortexPacketLayerFar: new Float32Array(cellCount),
    recirculationPocketLeft: new Float32Array(cellCount),
    recirculationPocketRight: new Float32Array(cellCount),
  };
  const derived = deriveVolumetricDensityTransportFields(baseState);
  return {
    ...baseState,
    plumeAnisotropy: derived.plumeAnisotropy,
    plumeBranchLeft: derived.plumeBranchLeft,
    plumeBranchRight: derived.plumeBranchRight,
    obstacleWake: derived.obstacleWake,
    primaryObstacleWake: derived.primaryObstacleWake,
    secondaryObstacleWake: derived.secondaryObstacleWake,
    tripleLightInterference: derived.tripleLightInterference,
    lightTriadLayerNear: derived.lightTriadLayerNear,
    lightTriadLayerMid: derived.lightTriadLayerMid,
    lightTriadLayerFar: derived.lightTriadLayerFar,
    injectorCoupling: derived.injectorCoupling,
    injectorSecondary: derived.injectorSecondary,
    injectorTertiary: derived.injectorTertiary,
    wakeLayerNear: derived.wakeLayerNear,
    wakeLayerMid: derived.wakeLayerMid,
    wakeLayerFar: derived.wakeLayerFar,
    vorticityConfinement: derived.vorticityConfinement,
    wakeRecirculation: derived.wakeRecirculation,
    wakeRecirculationShellNear: derived.wakeRecirculationShellNear,
    wakeRecirculationShellFar: derived.wakeRecirculationShellFar,
    shearLayerRollup: derived.shearLayerRollup,
    vortexPacketLeft: derived.vortexPacketLeft,
    vortexPacketRight: derived.vortexPacketRight,
    vortexPacketLayerNear: derived.vortexPacketLayerNear,
    vortexPacketLayerMid: derived.vortexPacketLayerMid,
    vortexPacketLayerFar: derived.vortexPacketLayerFar,
    recirculationPocketLeft: derived.recirculationPocketLeft,
    recirculationPocketRight: derived.recirculationPocketRight,
  };
}
export function stepVolumetricDensityTransportRuntime(state: VolumetricDensityTransportRuntimeState): VolumetricDensityTransportRuntimeState {
  const { config } = state;
  const width = config.resolutionX;
  const height = config.resolutionY;
  const nextDensity = new Float32Array(state.density.length);
  const nextVelocityX = new Float32Array(state.velocityX.length);
  const nextVelocityY = new Float32Array(state.velocityY.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = cellIndex(x, y, width);
      const vx = state.velocityX[index];
      const vy = state.velocityY[index];
      const backX = x - vx * config.advectionStrength;
      const backY = y - vy * config.advectionStrength;
      const advectedDensity = bilerp(state.density, width, height, backX, backY);
      const advectedVx = bilerp(state.velocityX, width, height, backX, backY);
      const advectedVy = bilerp(state.velocityY, width, height, backX, backY);
      const advectedPressure = bilerp(state.pressure, width, height, backX, backY);
      const advectedLighting = bilerp(state.lighting, width, height, backX, backY);
      const advectedMarch = bilerp(state.lightMarch, width, height, backX, backY);
      const advectedMarchSecondary = bilerp(state.lightMarchSecondary, width, height, backX, backY);
      const advectedRimLight = bilerp(state.rimLight, width, height, backX, backY);
      const obstacle = state.obstacleMask[index];
      const nx = width <= 1 ? 0 : x / (width - 1) - 0.5;
      const ny = height <= 1 ? 0 : y / (height - 1) - 0.5;
      const swirl = config.swirlStrength * 0.015;
      nextDensity[index] = advectedDensity * (1 - config.dissipation) * (1 - obstacle * 0.08);
      nextVelocityX[index] = advectedVx * 0.985 - ny * swirl;
      nextVelocityY[index] = advectedVy * 0.988 + nx * swirl + nextDensity[index] * config.buoyancy * 0.08;
      nextVelocityY[index] += advectedLighting * (0.004 + nextDensity[index] * 0.004) + advectedMarch * 0.002 + advectedMarchSecondary * 0.0014;
      nextVelocityX[index] -= advectedPressure * nx * 0.004 + obstacle * nx * 0.012 - advectedRimLight * ny * 0.002;
    }
  }

  const divergence = new Float32Array(nextDensity.length);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = cellIndex(x, y, width);
      divergence[index] =
        (nextVelocityX[cellIndex(x + 1, y, width)] - nextVelocityX[cellIndex(x - 1, y, width)] +
          nextVelocityY[cellIndex(x, y + 1, width)] - nextVelocityY[cellIndex(x, y - 1, width)]) *
        0.5;
    }
  }

  applyObstacleField(nextDensity, nextVelocityX, nextVelocityY, state.obstacleMask, width, height, config.obstacleStrength);
  const pressure = computePressureField(nextDensity, state.obstacleMask, width, height, config.pressureIterations, config.pressureRelaxation);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = cellIndex(x, y, width);
      const pressureGradientX = pressure[cellIndex(x + 1, y, width)] - pressure[cellIndex(x - 1, y, width)];
      const pressureGradientY = pressure[cellIndex(x, y + 1, width)] - pressure[cellIndex(x, y - 1, width)];
      nextVelocityX[index] -= pressureGradientX * config.pressureRelaxation * 0.12;
      nextVelocityY[index] -= pressureGradientY * config.pressureRelaxation * 0.12 + divergence[index] * config.pressureRelaxation * 0.1;
    }
  }

  applyBoundaryFade(nextDensity, nextVelocityX, nextVelocityY, width, height, config.boundaryFade);
  const lightingAndShadow = computeLightingShadowAndMarch(
    nextDensity,
    state.obstacleMask,
    width,
    height,
    config.lightAbsorption,
    config.shadowStrength,
    config.lightMarchSteps,
    config.smokeLightScatter,
    config.smokeScatterAnisotropy,
  );
  const lightMarchSecondary = computeSecondaryLightMarch(
    nextDensity,
    state.obstacleMask,
    width,
    height,
    config.lightAbsorption,
    config.lightMarchSteps,
    config.smokeLightScatter,
    config.smokeScatterAnisotropy,
  );
  const rimLight = computeRimLight(
    lightingAndShadow.lighting,
    lightMarchSecondary,
    state.obstacleMask,
    width,
    height,
    config.smokeRimBoost,
  );
  const volumeDepth = computeVolumeDepth(
    nextDensity,
    lightingAndShadow.lighting,
    lightingAndShadow.shadow,
    lightMarchSecondary,
    rimLight,
    pressure,
    state.obstacleMask,
    config.volumeDepthScale,
  );
  const derived = deriveVolumetricDensityTransportFields({
    ...state,
    frame: state.frame + 1,
    density: nextDensity,
    velocityX: nextVelocityX,
    velocityY: nextVelocityY,
    pressure,
    lighting: lightingAndShadow.lighting,
    shadow: lightingAndShadow.shadow,
    lightMarch: lightingAndShadow.lightMarch,
    lightMarchSecondary,
    rimLight,
    tripleLightInterference: state.tripleLightInterference,
    lightTriadLayerNear: state.lightTriadLayerNear,
    lightTriadLayerMid: state.lightTriadLayerMid,
    lightTriadLayerFar: state.lightTriadLayerFar,
    volumeDepth,
  } as VolumetricDensityTransportRuntimeState);
  const nextState: VolumetricDensityTransportRuntimeState = {
    config,
    frame: state.frame + 1,
    density: nextDensity,
    velocityX: nextVelocityX,
    velocityY: nextVelocityY,
    pressure,
    lighting: lightingAndShadow.lighting,
    shadow: lightingAndShadow.shadow,
    primaryObstacleMask: state.primaryObstacleMask,
    secondaryObstacleMask: state.secondaryObstacleMask,
    obstacleMask: state.obstacleMask,
    lightMarch: lightingAndShadow.lightMarch,
    lightMarchSecondary,
    rimLight,
    plumeAnisotropy: derived.plumeAnisotropy,
    plumeBranchLeft: derived.plumeBranchLeft,
    plumeBranchRight: derived.plumeBranchRight,
    obstacleWake: derived.obstacleWake,
    primaryObstacleWake: derived.primaryObstacleWake,
    secondaryObstacleWake: derived.secondaryObstacleWake,
    tripleLightInterference: derived.tripleLightInterference,
    lightTriadLayerNear: derived.lightTriadLayerNear,
    lightTriadLayerMid: derived.lightTriadLayerMid,
    lightTriadLayerFar: derived.lightTriadLayerFar,
    volumeDepth,
    injectorCoupling: derived.injectorCoupling,
    injectorSecondary: derived.injectorSecondary,
    injectorTertiary: derived.injectorTertiary,
    wakeLayerNear: derived.wakeLayerNear,
    wakeLayerMid: derived.wakeLayerMid,
    wakeLayerFar: derived.wakeLayerFar,
    vorticityConfinement: derived.vorticityConfinement,
    wakeRecirculation: derived.wakeRecirculation,
    wakeRecirculationShellNear: derived.wakeRecirculationShellNear,
    wakeRecirculationShellFar: derived.wakeRecirculationShellFar,
    shearLayerRollup: derived.shearLayerRollup,
    vortexPacketLeft: derived.vortexPacketLeft,
    vortexPacketRight: derived.vortexPacketRight,
    vortexPacketLayerNear: derived.vortexPacketLayerNear,
    vortexPacketLayerMid: derived.vortexPacketLayerMid,
    vortexPacketLayerFar: derived.vortexPacketLayerFar,
    recirculationPocketLeft: derived.recirculationPocketLeft,
    recirculationPocketRight: derived.recirculationPocketRight,
  };
  injectDensityAndVelocity(nextState);
  return nextState;
}
export function simulateVolumetricDensityTransportRuntime(state: VolumetricDensityTransportRuntimeState, frames: number): VolumetricDensityTransportRuntimeState {
  let runtime = state;
  for (let frame = 0; frame < frames; frame += 1) {
    runtime = stepVolumetricDensityTransportRuntime(runtime);
  }
  return runtime;
}
