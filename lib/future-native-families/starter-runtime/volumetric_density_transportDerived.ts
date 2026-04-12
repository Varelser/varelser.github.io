import type {
  VolumetricDensityTransportDerivedFields,
  VolumetricDensityTransportRuntimeState,
} from './volumetric_density_transportState';
import { cellIndex, clamp } from './volumetric_density_transportShared';

interface VolumetricDerivedMutableFields extends VolumetricDensityTransportDerivedFields {
  vortexPacketLayerNear: Float32Array;
  vortexPacketLayerMid: Float32Array;
  vortexPacketLayerFar: Float32Array;
}

interface VolumetricDerivedSeed {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  density: number;
  verticalRatio: number;
  nx: number;
  vx: number;
  vy: number;
  secondaryInjector: number;
  tertiaryInjector: number;
  couplingSeed: number;
}

function createDerivedFields(length: number): VolumetricDerivedMutableFields {
  return {
    plumeAnisotropy: new Float32Array(length),
    plumeBranchLeft: new Float32Array(length),
    plumeBranchRight: new Float32Array(length),
    obstacleWake: new Float32Array(length),
    primaryObstacleWake: new Float32Array(length),
    secondaryObstacleWake: new Float32Array(length),
    injectorCoupling: new Float32Array(length),
    injectorSecondary: new Float32Array(length),
    injectorTertiary: new Float32Array(length),
    wakeLayerNear: new Float32Array(length),
    wakeLayerMid: new Float32Array(length),
    wakeLayerFar: new Float32Array(length),
    vorticityConfinement: new Float32Array(length),
    wakeRecirculation: new Float32Array(length),
    wakeRecirculationShellNear: new Float32Array(length),
    wakeRecirculationShellFar: new Float32Array(length),
    shearLayerRollup: new Float32Array(length),
    tripleLightInterference: new Float32Array(length),
    lightTriadLayerNear: new Float32Array(length),
    lightTriadLayerMid: new Float32Array(length),
    lightTriadLayerFar: new Float32Array(length),
    vortexPacketLeft: new Float32Array(length),
    vortexPacketRight: new Float32Array(length),
    vortexPacketLayerNear: new Float32Array(length),
    vortexPacketLayerMid: new Float32Array(length),
    vortexPacketLayerFar: new Float32Array(length),
    recirculationPocketLeft: new Float32Array(length),
    recirculationPocketRight: new Float32Array(length),
  };
}

function applyLightPack(
  state: VolumetricDensityTransportRuntimeState,
  fields: VolumetricDerivedMutableFields,
  seed: VolumetricDerivedSeed,
): void {
  const { index, density, verticalRatio, nx, vx, vy, secondaryInjector, tertiaryInjector, couplingSeed } = seed;
  const plumeCore = clamp(
    density * (10 + state.volumeDepth[index] * 2.4 + state.lightMarch[index] * 1.8 + state.lightMarchSecondary[index] * 1.2 + state.rimLight[index] * 1.1),
    0,
    4,
  );
  const lateralResponse = clamp(Math.abs(vx) * 4.8 + Math.abs(nx) * 0.9 + Math.abs(state.pressure[index]) * 1.3 + state.shadow[index] * 0.14, 0, 2.8);
  const verticalCarry = clamp(0.45 + verticalRatio * 0.9 + Math.abs(vy) * 0.8, 0.35, 2.4);
  const anisotropy = clamp(plumeCore * lateralResponse * verticalCarry * 0.55, 0, 4.8);
  const branchBias = clamp(0.5 + vx * 5.4 + nx * 0.95 + (state.lightMarch[index] - state.lightMarchSecondary[index]) * 0.24, 0, 1);
  const injectorLift = clamp((secondaryInjector + tertiaryInjector) * (0.9 + verticalRatio * 0.6) + couplingSeed * (0.7 + Math.abs(vx) * 0.4), 0, 2.8);
  fields.injectorCoupling[index] = clamp(injectorLift * (0.35 + density * 6 + state.lightMarch[index] * 0.25 + state.lightMarchSecondary[index] * 0.2), 0, 4.8);
  fields.plumeAnisotropy[index] = clamp(anisotropy + fields.injectorCoupling[index] * 0.22, 0, 5.4);
  fields.plumeBranchLeft[index] = anisotropy * (0.18 + 0.82 * (1 - branchBias)) * clamp(0.55 + state.rimLight[index] * 0.45 + state.shadow[index] * 0.18, 0.4, 1.5);
  fields.plumeBranchRight[index] = anisotropy * (0.18 + 0.82 * branchBias) * clamp(0.55 + state.lighting[index] * 0.32 + state.lightMarchSecondary[index] * 0.22, 0.4, 1.5);
  const lightBlend = Math.min(state.lightMarch[index], state.lightMarchSecondary[index]);
  const thirdLight = clamp(state.rimLight[index] * (0.7 + state.lighting[index] * 0.22 + fields.plumeAnisotropy[index] * 0.04), 0, 2.4);
  fields.tripleLightInterference[index] = clamp(
    (lightBlend * (0.9 + thirdLight * 0.3) + thirdLight * (0.6 + fields.injectorCoupling[index] * 0.08)) *
      (0.24 + density * 4.2 + Math.abs(vx) * 0.16 + verticalRatio * 0.2),
    0,
    6.4,
  );
  fields.lightTriadLayerNear[index] = clamp(
    fields.tripleLightInterference[index] * (0.52 + state.lightMarch[index] * 0.42 + density * 0.9),
    0,
    6.8,
  );
  fields.lightTriadLayerMid[index] = clamp(
    fields.tripleLightInterference[index] * (0.42 + lightBlend * 0.38 + state.lightMarchSecondary[index] * 0.24 + fields.injectorCoupling[index] * 0.06),
    0,
    6.8,
  );
  fields.lightTriadLayerFar[index] = clamp(
    fields.tripleLightInterference[index] * (0.28 + thirdLight * 0.44 + state.rimLight[index] * 0.22 + state.volumeDepth[index] * 0.08),
    0,
    6.8,
  );
}

function applyWakePack(
  state: VolumetricDensityTransportRuntimeState,
  fields: VolumetricDerivedMutableFields,
  seed: VolumetricDerivedSeed,
): void {
  const { index, x, y, width, height, density, verticalRatio, nx, vx, vy, couplingSeed } = seed;
  const leftX = Math.max(0, x - 1);
  const rightX = Math.min(width - 1, x + 1);
  const upstreamY1 = Math.max(0, y - 1);
  const upstreamY2 = Math.max(0, y - 2);
  const upstreamY3 = Math.max(0, y - 3);
  const primaryInfluence = Math.max(
    state.primaryObstacleMask[cellIndex(x, upstreamY1, width)],
    state.primaryObstacleMask[cellIndex(leftX, upstreamY2, width)],
    state.primaryObstacleMask[cellIndex(rightX, upstreamY2, width)],
    state.primaryObstacleMask[cellIndex(x, upstreamY3, width)],
  );
  const secondaryInfluence = Math.max(
    state.secondaryObstacleMask[cellIndex(x, upstreamY1, width)],
    state.secondaryObstacleMask[cellIndex(leftX, upstreamY2, width)],
    state.secondaryObstacleMask[cellIndex(rightX, upstreamY2, width)],
    state.secondaryObstacleMask[cellIndex(x, upstreamY3, width)],
  );
  const wakeOpen = 1 - state.obstacleMask[index] * 0.82;
  const wakeBase = clamp(density * (9 + Math.abs(vx) * 3.0 + state.shadow[index] * 1.1 + state.volumeDepth[index] * 0.8 + state.rimLight[index] * 0.6), 0, 5);
  const primaryWakeValue = clamp(Math.max(primaryInfluence, secondaryInfluence * 0.24) * wakeBase * wakeOpen * (0.78 + verticalRatio * 0.32 + Math.abs(nx) * 0.14), 0, 5.4);
  const secondaryWakeValue = clamp(Math.max(secondaryInfluence, primaryInfluence * 0.42) * wakeBase * wakeOpen * (0.68 + verticalRatio * 0.28 + state.rimLight[index] * 0.14), 0, 5.4);
  fields.primaryObstacleWake[index] = primaryWakeValue;
  fields.secondaryObstacleWake[index] = secondaryWakeValue;
  fields.obstacleWake[index] = Math.max(primaryWakeValue, secondaryWakeValue);
  const combinedWake = fields.obstacleWake[index];
  const turbulenceSeed = clamp(combinedWake * (0.4 + Math.abs(vx) * 0.6 + Math.abs(vy) * 0.35 + state.shadow[index] * 0.12 + state.rimLight[index] * 0.1), 0, 6.2);
  fields.wakeLayerNear[index] = clamp(turbulenceSeed * (0.85 + state.primaryObstacleMask[index] * 0.4), 0, 6.4);
  fields.wakeLayerMid[index] = clamp(turbulenceSeed * (0.62 + verticalRatio * 0.34 + state.secondaryObstacleMask[index] * 0.22), 0, 6.4);
  fields.wakeLayerFar[index] = clamp(turbulenceSeed * (0.38 + verticalRatio * 0.48 + couplingSeed * 0.22), 0, 6.4);
}

function applyVortexPack(
  state: VolumetricDensityTransportRuntimeState,
  fields: VolumetricDerivedMutableFields,
  seed: VolumetricDerivedSeed,
): void {
  const { index, x, y, width, height, verticalRatio, nx, vx, vy } = seed;
  const leftWake = fields.obstacleWake[cellIndex(Math.max(0, x - 1), y, width)];
  const rightWake = fields.obstacleWake[cellIndex(Math.min(width - 1, x + 1), y, width)];
  const downWake = fields.obstacleWake[cellIndex(x, Math.max(0, y - 1), width)];
  const upWake = fields.obstacleWake[cellIndex(x, Math.min(height - 1, y + 1), width)];
  const curl = (rightWake - leftWake) - (upWake - downWake);
  const confinement = clamp(Math.abs(curl) * (0.9 + fields.obstacleWake[index] * 0.35 + fields.injectorCoupling[index] * 0.08), 0, 6.2);
  fields.vorticityConfinement[index] = confinement;
  const rollupSeed = clamp(confinement * (0.68 + fields.plumeAnisotropy[index] * 0.09 + fields.wakeLayerMid[index] * 0.05 + Math.abs(vx - vy) * 0.3), 0, 6.6);
  fields.shearLayerRollup[index] = rollupSeed;
  const recirculationSeed = clamp((fields.wakeLayerNear[index] * 0.58 + fields.wakeLayerMid[index] * 0.34 + fields.wakeLayerFar[index] * 0.22) * (0.72 + Math.abs(vx) * 0.55 + Math.max(0, -vy) * 0.4), 0, 6.4);
  fields.wakeRecirculation[index] = recirculationSeed;
  fields.wakeRecirculationShellNear[index] = clamp(recirculationSeed * (0.88 + state.primaryObstacleMask[index] * 0.34 + confinement * 0.06), 0, 6.8);
  fields.wakeRecirculationShellFar[index] = clamp(recirculationSeed * (0.54 + verticalRatio * 0.42 + seed.couplingSeed * 0.18), 0, 6.8);
  const pocketBase = clamp(recirculationSeed * (0.42 + rollupSeed * 0.08 + fields.obstacleWake[index] * 0.06), 0, 6.4);
  fields.recirculationPocketLeft[index] = nx <= 0 ? pocketBase * clamp(0.6 + (0.5 - Math.abs(nx)) * 0.7 + state.primaryObstacleMask[index] * 0.16, 0.45, 1.55) : 0;
  fields.recirculationPocketRight[index] = nx >= 0 ? pocketBase * clamp(0.6 + (0.5 - Math.abs(nx)) * 0.7 + state.secondaryObstacleMask[index] * 0.16, 0.45, 1.55) : 0;
  const packetSeed = clamp(
    (confinement * 0.34 + rollupSeed * 0.44 + recirculationSeed * 0.22 + fields.tripleLightInterference[index] * 0.09) *
      (0.75 + Math.abs(vx) * 0.35 + Math.max(0, -vy) * 0.2),
    0,
    6.8,
  );
  fields.vortexPacketLeft[index] = nx <= 0 ? packetSeed * clamp(0.68 + (0.5 - Math.abs(nx)) * 0.58 + fields.recirculationPocketLeft[index] * 0.04, 0.45, 1.7) : 0;
  fields.vortexPacketRight[index] = nx >= 0 ? packetSeed * clamp(0.68 + (0.5 - Math.abs(nx)) * 0.58 + fields.recirculationPocketRight[index] * 0.04, 0.45, 1.7) : 0;
  const packetCombined = Math.max(fields.vortexPacketLeft[index], fields.vortexPacketRight[index]);
  fields.vortexPacketLayerNear[index] = clamp(packetCombined * (0.62 + fields.wakeRecirculationShellNear[index] * 0.08 + recirculationSeed * 0.05), 0, 7.0);
  fields.vortexPacketLayerMid[index] = clamp(packetCombined * (0.44 + confinement * 0.1 + rollupSeed * 0.06 + Math.abs(vx) * 0.18), 0, 7.0);
  fields.vortexPacketLayerFar[index] = clamp(packetCombined * (0.28 + fields.wakeRecirculationShellFar[index] * 0.08 + state.volumeDepth[index] * 0.1), 0, 7.0);
}

export function deriveVolumetricDensityTransportFields(
  state: VolumetricDensityTransportRuntimeState,
): VolumetricDensityTransportDerivedFields {
  const width = state.config.resolutionX;
  const height = state.config.resolutionY;
  const fields = createDerivedFields(state.density.length);
  for (let y = 0; y < height; y += 1) {
    const verticalRatio = height <= 1 ? 0 : y / (height - 1);
    for (let x = 0; x < width; x += 1) {
      const index = cellIndex(x, y, width);
      const secondaryInjector = state.injectorSecondary[index];
      const tertiaryInjector = state.injectorTertiary[index];
      const couplingSeed = state.injectorCoupling[index];
      fields.injectorSecondary[index] = secondaryInjector;
      fields.injectorTertiary[index] = tertiaryInjector;
      const density = state.density[index];
      if (density <= 1e-6 && couplingSeed <= 1e-6 && secondaryInjector <= 1e-6 && tertiaryInjector <= 1e-6) continue;
      const seed: VolumetricDerivedSeed = {
        index,
        x,
        y,
        width,
        height,
        density,
        verticalRatio,
        nx: width <= 1 ? 0 : x / (width - 1) - 0.5,
        vx: state.velocityX[index],
        vy: state.velocityY[index],
        secondaryInjector,
        tertiaryInjector,
        couplingSeed,
      };
      applyLightPack(state, fields, seed);
      applyWakePack(state, fields, seed);
      applyVortexPack(state, fields, seed);
    }
  }
  return {
    plumeAnisotropy: fields.plumeAnisotropy,
    plumeBranchLeft: fields.plumeBranchLeft,
    plumeBranchRight: fields.plumeBranchRight,
    obstacleWake: fields.obstacleWake,
    primaryObstacleWake: fields.primaryObstacleWake,
    secondaryObstacleWake: fields.secondaryObstacleWake,
    injectorCoupling: fields.injectorCoupling,
    injectorSecondary: fields.injectorSecondary,
    injectorTertiary: fields.injectorTertiary,
    wakeLayerNear: fields.wakeLayerNear,
    wakeLayerMid: fields.wakeLayerMid,
    wakeLayerFar: fields.wakeLayerFar,
    vorticityConfinement: fields.vorticityConfinement,
    wakeRecirculation: fields.wakeRecirculation,
    wakeRecirculationShellNear: fields.wakeRecirculationShellNear,
    wakeRecirculationShellFar: fields.wakeRecirculationShellFar,
    shearLayerRollup: fields.shearLayerRollup,
    tripleLightInterference: fields.tripleLightInterference,
    lightTriadLayerNear: fields.lightTriadLayerNear,
    lightTriadLayerMid: fields.lightTriadLayerMid,
    lightTriadLayerFar: fields.lightTriadLayerFar,
    vortexPacketLeft: fields.vortexPacketLeft,
    vortexPacketRight: fields.vortexPacketRight,
    vortexPacketLayerNear: fields.vortexPacketLayerNear,
    vortexPacketLayerMid: fields.vortexPacketLayerMid,
    vortexPacketLayerFar: fields.vortexPacketLayerFar,
    recirculationPocketLeft: fields.recirculationPocketLeft,
    recirculationPocketRight: fields.recirculationPocketRight,
  };
}

export function getVolumetricDensityTransportDerivedFieldsView(
  state: VolumetricDensityTransportRuntimeState,
): VolumetricDensityTransportDerivedFields {
  if (
    state.plumeAnisotropy &&
    state.obstacleWake &&
    state.vortexPacketLayerNear &&
    state.vortexPacketLayerMid &&
    state.vortexPacketLayerFar
  ) {
    return {
      plumeAnisotropy: state.plumeAnisotropy,
      plumeBranchLeft: state.plumeBranchLeft,
      plumeBranchRight: state.plumeBranchRight,
      obstacleWake: state.obstacleWake,
      primaryObstacleWake: state.primaryObstacleWake,
      secondaryObstacleWake: state.secondaryObstacleWake,
      injectorCoupling: state.injectorCoupling,
      injectorSecondary: state.injectorSecondary,
      injectorTertiary: state.injectorTertiary,
      wakeLayerNear: state.wakeLayerNear,
      wakeLayerMid: state.wakeLayerMid,
      wakeLayerFar: state.wakeLayerFar,
      vorticityConfinement: state.vorticityConfinement,
      wakeRecirculation: state.wakeRecirculation,
      wakeRecirculationShellNear: state.wakeRecirculationShellNear,
      wakeRecirculationShellFar: state.wakeRecirculationShellFar,
      shearLayerRollup: state.shearLayerRollup,
      tripleLightInterference: state.tripleLightInterference,
      lightTriadLayerNear: state.lightTriadLayerNear,
      lightTriadLayerMid: state.lightTriadLayerMid,
      lightTriadLayerFar: state.lightTriadLayerFar,
      vortexPacketLeft: state.vortexPacketLeft,
      vortexPacketRight: state.vortexPacketRight,
      vortexPacketLayerNear: state.vortexPacketLayerNear,
      vortexPacketLayerMid: state.vortexPacketLayerMid,
      vortexPacketLayerFar: state.vortexPacketLayerFar,
      recirculationPocketLeft: state.recirculationPocketLeft,
      recirculationPocketRight: state.recirculationPocketRight,
    };
  }

  return deriveVolumetricDensityTransportFields(state);
}
