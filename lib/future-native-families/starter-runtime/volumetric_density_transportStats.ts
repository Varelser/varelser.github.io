import type {
  VolumetricDensityTransportRuntimeState,
  VolumetricDensityTransportStats,
} from './volumetric_density_transportState';
import { getVolumetricDensityTransportDerivedFieldsView } from './volumetric_density_transportDerived';
import { cellIndex } from './volumetric_density_transportShared';

export function getVolumetricDensityTransportStats(
  state: VolumetricDensityTransportRuntimeState,
): VolumetricDensityTransportStats {
  const width = state.config.resolutionX;
  const height = state.config.resolutionY;
  let totalDensity = 0;
  let maxDensity = 0;
  let densityX = 0;
  let densityY = 0;
  let totalSpeed = 0;
  let topBandDensity = 0;
  let bottomBandDensity = 0;
  let edgeDensity = 0;
  let divergenceAccum = 0;
  let divergenceCount = 0;
  let totalPressure = 0;
  let maxPressure = 0;
  let totalLighting = 0;
  let litTopBand = 0;
  let totalShadow = 0;
  let totalObstacle = 0;
  let obstacleOccludedCells = 0;
  let primaryObstacleOccludedCells = 0;
  let secondaryObstacleOccludedCells = 0;
  let multiObstacleOverlapCells = 0;
  let totalLightMarch = 0;
  let lightMarchPeak = 0;
  let totalLightMarchSecondary = 0;
  let lightMarchSecondaryPeak = 0;
  let totalRimLight = 0;
  let rimLightPeak = 0;
  let multiLightActiveCells = 0;
  let multiLightBalance = 0;
  let totalPlumeAnisotropy = 0;
  let plumeAnisotropyPeak = 0;
  let plumeBranchLeftCells = 0;
  let plumeBranchRightCells = 0;
  let plumeBranchActiveCells = 0;
  let plumeBranchBalance = 0;
  let totalObstacleWake = 0;
  let obstacleWakePeak = 0;
  let obstacleWakeCells = 0;
  let totalPrimaryObstacleWake = 0;
  let totalSecondaryObstacleWake = 0;
  let primaryObstacleWakeCells = 0;
  let secondaryObstacleWakeCells = 0;
  let totalVolumeDepth = 0;
  let volumeDepthPeak = 0;
  let totalInjectorCoupling = 0;
  let injectorCouplingPeak = 0;
  let injectorSecondaryCells = 0;
  let injectorTertiaryCells = 0;
  let injectorCoupledCells = 0;
  let totalWakeTurbulence = 0;
  let wakeTurbulencePeak = 0;
  let layeredWakeActiveCells = 0;
  let wakeLayerNearCells = 0;
  let wakeLayerMidCells = 0;
  let wakeLayerFarCells = 0;
  let totalVorticityConfinement = 0;
  let vorticityConfinementPeak = 0;
  let vorticityConfinementCells = 0;
  let totalWakeRecirculation = 0;
  let wakeRecirculationPeak = 0;
  let wakeRecirculationCells = 0;
  let wakeRecirculationNearCells = 0;
  let wakeRecirculationFarCells = 0;
  let totalShearLayerRollup = 0;
  let shearLayerRollupPeak = 0;
  let shearLayerRollupCells = 0;
  let totalTripleLightInterference = 0;
  let tripleLightInterferencePeak = 0;
  let tripleLightInterferenceCells = 0;
  let totalLightTriadLayer = 0;
  let lightTriadLayerPeak = 0;
  let lightTriadLayerActiveCells = 0;
  let lightTriadLayerNearCells = 0;
  let lightTriadLayerMidCells = 0;
  let lightTriadLayerFarCells = 0;
  let vortexPacketCells = 0;
  let vortexPacketLeftCells = 0;
  let vortexPacketRightCells = 0;
  let vortexPacketPeak = 0;
  let totalVortexPacketLayer = 0;
  let vortexPacketLayerPeak = 0;
  let vortexPacketLayerActiveCells = 0;
  let vortexPacketLayerNearCells = 0;
  let vortexPacketLayerMidCells = 0;
  let vortexPacketLayerFarCells = 0;
  let recirculationPocketCells = 0;
  let recirculationPocketLeftCells = 0;
  let recirculationPocketRightCells = 0;
  const derived = getVolumetricDensityTransportDerivedFieldsView(state);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = cellIndex(x, y, width);
      const density = state.density[index];
      const speed = Math.hypot(state.velocityX[index], state.velocityY[index]);
      const obstacle = state.obstacleMask[index];
      const primaryObstacle = state.primaryObstacleMask[index];
      const secondaryObstacle = state.secondaryObstacleMask[index];
      const lightMarch = state.lightMarch[index];
      const lightMarchSecondary = state.lightMarchSecondary[index];
      const rimLight = state.rimLight[index];
      const plumeAnisotropy = derived.plumeAnisotropy[index];
      const plumeBranchLeft = derived.plumeBranchLeft[index];
      const plumeBranchRight = derived.plumeBranchRight[index];
      const obstacleWake = derived.obstacleWake[index];
      const primaryObstacleWake = derived.primaryObstacleWake[index];
      const secondaryObstacleWake = derived.secondaryObstacleWake[index];
      const volumeDepth = state.volumeDepth[index];
      const injectorCoupling = derived.injectorCoupling[index];
      const injectorSecondary = derived.injectorSecondary[index];
      const injectorTertiary = derived.injectorTertiary[index];
      const wakeLayerNear = derived.wakeLayerNear[index];
      const wakeLayerMid = derived.wakeLayerMid[index];
      const wakeLayerFar = derived.wakeLayerFar[index];
      const vorticityConfinement = derived.vorticityConfinement[index];
      const wakeRecirculation = derived.wakeRecirculation[index];
      const wakeRecirculationShellNear = derived.wakeRecirculationShellNear[index];
      const wakeRecirculationShellFar = derived.wakeRecirculationShellFar[index];
      const shearLayerRollup = derived.shearLayerRollup[index];
      const tripleLightInterference = derived.tripleLightInterference[index];
      const lightTriadLayerNear = derived.lightTriadLayerNear[index];
      const lightTriadLayerMid = derived.lightTriadLayerMid[index];
      const lightTriadLayerFar = derived.lightTriadLayerFar[index];
      const vortexPacketLeft = derived.vortexPacketLeft[index];
      const vortexPacketRight = derived.vortexPacketRight[index];
      const vortexPacketLayerNear = derived.vortexPacketLayerNear[index];
      const vortexPacketLayerMid = derived.vortexPacketLayerMid[index];
      const vortexPacketLayerFar = derived.vortexPacketLayerFar[index];
      const recirculationPocketLeft = derived.recirculationPocketLeft[index];
      const recirculationPocketRight = derived.recirculationPocketRight[index];
      totalDensity += density;
      maxDensity = Math.max(maxDensity, density);
      densityX += density * x;
      densityY += density * y;
      totalSpeed += speed;
      totalPressure += state.pressure[index];
      maxPressure = Math.max(maxPressure, Math.abs(state.pressure[index]));
      totalLighting += state.lighting[index];
      totalShadow += state.shadow[index];
      totalObstacle += obstacle;
      totalLightMarch += lightMarch;
      totalLightMarchSecondary += lightMarchSecondary;
      totalRimLight += rimLight;
      totalPlumeAnisotropy += plumeAnisotropy;
      totalObstacleWake += obstacleWake;
      totalPrimaryObstacleWake += primaryObstacleWake;
      totalSecondaryObstacleWake += secondaryObstacleWake;
      totalVolumeDepth += volumeDepth;
      totalInjectorCoupling += injectorCoupling;
      totalWakeTurbulence += wakeLayerNear + wakeLayerMid + wakeLayerFar;
      totalVorticityConfinement += vorticityConfinement;
      totalWakeRecirculation += wakeRecirculation;
      totalShearLayerRollup += shearLayerRollup;
      totalTripleLightInterference += tripleLightInterference;
      totalLightTriadLayer += lightTriadLayerNear + lightTriadLayerMid + lightTriadLayerFar;
      lightMarchPeak = Math.max(lightMarchPeak, lightMarch);
      lightMarchSecondaryPeak = Math.max(lightMarchSecondaryPeak, lightMarchSecondary);
      rimLightPeak = Math.max(rimLightPeak, rimLight);
      plumeAnisotropyPeak = Math.max(plumeAnisotropyPeak, plumeAnisotropy);
      obstacleWakePeak = Math.max(obstacleWakePeak, obstacleWake);
      volumeDepthPeak = Math.max(volumeDepthPeak, volumeDepth);
      injectorCouplingPeak = Math.max(injectorCouplingPeak, injectorCoupling);
      wakeTurbulencePeak = Math.max(wakeTurbulencePeak, wakeLayerNear, wakeLayerMid, wakeLayerFar);
      vorticityConfinementPeak = Math.max(vorticityConfinementPeak, vorticityConfinement);
      wakeRecirculationPeak = Math.max(wakeRecirculationPeak, wakeRecirculation, wakeRecirculationShellNear, wakeRecirculationShellFar);
      shearLayerRollupPeak = Math.max(shearLayerRollupPeak, shearLayerRollup);
      tripleLightInterferencePeak = Math.max(tripleLightInterferencePeak, tripleLightInterference);
      lightTriadLayerPeak = Math.max(lightTriadLayerPeak, lightTriadLayerNear, lightTriadLayerMid, lightTriadLayerFar);
      vortexPacketPeak = Math.max(vortexPacketPeak, vortexPacketLeft, vortexPacketRight);
      vortexPacketLayerPeak = Math.max(vortexPacketLayerPeak, vortexPacketLayerNear, vortexPacketLayerMid, vortexPacketLayerFar);
      if (obstacle >= 0.35) obstacleOccludedCells += 1;
      if (primaryObstacle >= 0.35) primaryObstacleOccludedCells += 1;
      if (secondaryObstacle >= 0.28) secondaryObstacleOccludedCells += 1;
      if (primaryObstacle >= 0.18 && secondaryObstacle >= 0.18) multiObstacleOverlapCells += 1;
      if (lightMarch >= 0.18 && lightMarchSecondary >= 0.14) multiLightActiveCells += 1;
      multiLightBalance += 1 - Math.min(1, Math.abs(lightMarch - lightMarchSecondary));
      if (plumeBranchLeft >= 0.08) plumeBranchLeftCells += 1;
      if (plumeBranchRight >= 0.08) plumeBranchRightCells += 1;
      if (plumeBranchLeft >= 0.08 || plumeBranchRight >= 0.08) plumeBranchActiveCells += 1;
      plumeBranchBalance += 1 - Math.min(1, Math.abs(plumeBranchLeft - plumeBranchRight));
      if (obstacleWake >= 0.012) obstacleWakeCells += 1;
      if (injectorSecondary >= 0.08) injectorSecondaryCells += 1;
      if (injectorTertiary >= 0.08) injectorTertiaryCells += 1;
      if (injectorCoupling >= 0.12) injectorCoupledCells += 1;
      if (wakeLayerNear >= 0.018) wakeLayerNearCells += 1;
      if (wakeLayerMid >= 0.018) wakeLayerMidCells += 1;
      if (wakeLayerFar >= 0.018) wakeLayerFarCells += 1;
      if (wakeLayerNear >= 0.018 || wakeLayerMid >= 0.018 || wakeLayerFar >= 0.018) layeredWakeActiveCells += 1;
      if (vorticityConfinement >= 0.02) vorticityConfinementCells += 1;
      if (wakeRecirculation >= 0.02) wakeRecirculationCells += 1;
      if (wakeRecirculationShellNear >= 0.02) wakeRecirculationNearCells += 1;
      if (wakeRecirculationShellFar >= 0.02) wakeRecirculationFarCells += 1;
      if (shearLayerRollup >= 0.012) shearLayerRollupCells += 1;
      if (tripleLightInterference >= 0.018) tripleLightInterferenceCells += 1;
      if (lightTriadLayerNear >= 0.012) lightTriadLayerNearCells += 1;
      if (lightTriadLayerMid >= 0.012) lightTriadLayerMidCells += 1;
      if (lightTriadLayerFar >= 0.012) lightTriadLayerFarCells += 1;
      if (lightTriadLayerNear >= 0.012 || lightTriadLayerMid >= 0.012 || lightTriadLayerFar >= 0.012) lightTriadLayerActiveCells += 1;
      if (vortexPacketLeft >= 0.012 || vortexPacketRight >= 0.012) vortexPacketCells += 1;
      if (vortexPacketLeft >= 0.012) vortexPacketLeftCells += 1;
      if (vortexPacketRight >= 0.012) vortexPacketRightCells += 1;
      totalVortexPacketLayer += vortexPacketLayerNear + vortexPacketLayerMid + vortexPacketLayerFar;
      if (vortexPacketLayerNear >= 0.01) vortexPacketLayerNearCells += 1;
      if (vortexPacketLayerMid >= 0.01) vortexPacketLayerMidCells += 1;
      if (vortexPacketLayerFar >= 0.01) vortexPacketLayerFarCells += 1;
      if (vortexPacketLayerNear >= 0.01 || vortexPacketLayerMid >= 0.01 || vortexPacketLayerFar >= 0.01) vortexPacketLayerActiveCells += 1;
      if (recirculationPocketLeft >= 0.005 || recirculationPocketRight >= 0.005) recirculationPocketCells += 1;
      if (recirculationPocketLeft >= 0.005) recirculationPocketLeftCells += 1;
      if (recirculationPocketRight >= 0.005) recirculationPocketRightCells += 1;
      if (primaryObstacleWake >= 0.01) primaryObstacleWakeCells += 1;
      if (secondaryObstacleWake >= 0.01) secondaryObstacleWakeCells += 1;
      if (y >= Math.floor(height * 0.7)) {
        topBandDensity += density;
        litTopBand += state.lighting[index];
      }
      if (y <= Math.floor(height * 0.2)) bottomBandDensity += density;
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) edgeDensity += density;
      if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        const divergence =
          (state.velocityX[cellIndex(x + 1, y, width)] - state.velocityX[cellIndex(x - 1, y, width)] +
            state.velocityY[cellIndex(x, y + 1, width)] - state.velocityY[cellIndex(x, y - 1, width)]) *
          0.5;
        divergenceAccum += Math.abs(divergence);
        divergenceCount += 1;
      }
    }
  }
  return {
    cells: width * height,
    totalDensity,
    maxDensity,
    centerOfMassX: totalDensity > 0 ? densityX / totalDensity : 0,
    centerOfMassY: totalDensity > 0 ? densityY / totalDensity : 0,
    meanSpeed: totalSpeed / (width * height),
    topBandDensity,
    bottomBandDensity,
    divergenceMean: divergenceCount > 0 ? divergenceAccum / divergenceCount : 0,
    edgeDensity,
    meanPressure: totalPressure / (width * height),
    maxPressure,
    meanLighting: totalLighting / (width * height),
    litTopBand: litTopBand / Math.max(1, width * Math.max(1, height - Math.floor(height * 0.7))),
    shadowMean: totalShadow / (width * height),
    meanObstacleMask: totalObstacle / (width * height),
    obstacleOccludedCells,
    primaryObstacleOccludedCells,
    secondaryObstacleOccludedCells,
    multiObstacleCellCount: obstacleOccludedCells,
    multiObstacleOverlapCells,
    lightMarchMean: totalLightMarch / (width * height),
    lightMarchPeak,
    lightMarchSecondaryMean: totalLightMarchSecondary / (width * height),
    lightMarchSecondaryPeak,
    rimLightMean: totalRimLight / (width * height),
    rimLightPeak,
    multiLightActiveCells,
    multiLightBalanceMean: multiLightBalance / (width * height),
    plumeAnisotropyMean: totalPlumeAnisotropy / (width * height),
    plumeAnisotropyPeak,
    plumeBranchLeftCells,
    plumeBranchRightCells,
    plumeBranchActiveCells,
    plumeBranchBalanceMean: plumeBranchBalance / (width * height),
    obstacleWakeMean: totalObstacleWake / (width * height),
    obstacleWakePeak,
    obstacleWakeCells,
    primaryObstacleWakeMean: totalPrimaryObstacleWake / (width * height),
    secondaryObstacleWakeMean: totalSecondaryObstacleWake / (width * height),
    primaryObstacleWakeCells,
    secondaryObstacleWakeCells,
    volumeDepthMean: totalVolumeDepth / (width * height),
    volumeDepthPeak,
    injectorCouplingMean: totalInjectorCoupling / (width * height),
    injectorCouplingPeak,
    injectorSecondaryCells,
    injectorTertiaryCells,
    injectorCoupledCells,
    wakeTurbulenceMean: totalWakeTurbulence / (width * height),
    wakeTurbulencePeak,
    layeredWakeActiveCells,
    wakeLayerNearCells,
    wakeLayerMidCells,
    wakeLayerFarCells,
    vorticityConfinementMean: totalVorticityConfinement / (width * height),
    vorticityConfinementPeak,
    vorticityConfinementCells,
    wakeRecirculationMean: totalWakeRecirculation / (width * height),
    wakeRecirculationPeak,
    wakeRecirculationCells,
    wakeRecirculationNearCells,
    wakeRecirculationFarCells,
    shearLayerRollupMean: totalShearLayerRollup / (width * height),
    shearLayerRollupPeak,
    shearLayerRollupCells,
    tripleLightInterferenceMean: totalTripleLightInterference / (width * height),
    tripleLightInterferencePeak,
    tripleLightInterferenceCells,
    lightTriadLayerMean: totalLightTriadLayer / (width * height),
    lightTriadLayerPeak,
    lightTriadLayerActiveCells,
    lightTriadLayerNearCells,
    lightTriadLayerMidCells,
    lightTriadLayerFarCells,
    vortexPacketCells,
    vortexPacketLeftCells,
    vortexPacketRightCells,
    vortexPacketPeak,
    vortexPacketLayerMean: totalVortexPacketLayer / (width * height),
    vortexPacketLayerPeak,
    vortexPacketLayerActiveCells,
    vortexPacketLayerNearCells,
    vortexPacketLayerMidCells,
    vortexPacketLayerFarCells,
    recirculationPocketCells,
    recirculationPocketLeftCells,
    recirculationPocketRightCells,
  };
}
