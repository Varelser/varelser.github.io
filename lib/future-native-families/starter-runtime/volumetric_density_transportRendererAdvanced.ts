import type { FutureNativeDebugLine, FutureNativeDebugPoint } from './runtimeContracts';
import type {
  VolumetricDensityTransportDerivedFields,
  VolumetricDensityTransportRuntimeState,
  VolumetricDensityTransportStats,
} from './volumetric_density_transportSolver';
import {
  appendPooledBoundaryBridges,
  appendPooledBoundaryLines,
  appendPooledLine,
  appendPooledLineCoords,
  appendPooledPolyline,
  clamp,
  centroidOfPoints,
  collectCentroidSamples,
  collectFieldPeakLine,
  collectObstacleBoundary,
  type VolumetricMeshRow,
} from './volumetric_density_transportRendererShared';
import { buildVolumetricVortexVolumeStats } from './volumetric_density_transportRendererVortexVolume';

function appendPolylineBridges(
  lines: FutureNativeDebugLine[],
  cursor: number,
  aPoints: FutureNativeDebugPoint[],
  bPoints: FutureNativeDebugPoint[],
  maxBridges: number,
): { cursor: number; count: number } {
  const bridgeable = Math.min(aPoints.length, bPoints.length);
  if (bridgeable <= 0) return { cursor, count: 0 };
  const bridgeCount = Math.min(maxBridges, bridgeable);
  let nextCursor = cursor;
  let count = 0;
  for (let step = 0; step < bridgeCount; step += 1) {
    const index = Math.min(bridgeable - 1, Math.round((bridgeable - 1) * (bridgeCount <= 1 ? 0 : step / (bridgeCount - 1))));
    nextCursor = appendPooledLine(lines, nextCursor, aPoints[index], bPoints[index]);
    count += 1;
  }
  return { cursor: nextCursor, count };
}

export type VolumetricAdvancedRenderStats = {
  lineCursor: number;
  pointCursor: number;
  obstacleBoundaryLineCount: number;
  secondaryObstacleBoundaryLineCount: number;
  obstacleBridgeLineCount: number;
  lightMarchLineCount: number;
  lightMarchSampleCount: number;
  secondaryLightMarchLineCount: number;
  secondaryLightMarchSampleCount: number;
  multiLightBridgeLineCount: number;
  tripleLightInterferenceLineCount: number;
  tripleLightBridgeLineCount: number;
  tripleLightModeCount: number;
  lightTriadLayerLineCount: number;
  lightTriadLayerBridgeLineCount: number;
  lightTriadLayerModeCount: number;
  anisotropicPlumeLineCount: number;
  plumeBranchBridgeLineCount: number;
  anisotropicPlumeCentroidCount: number;
  anisotropicPlumeModeCount: number;
  obstacleWakeLineCount: number;
  obstacleWakeContourPoints: number;
  obstacleWakeBridgeLineCount: number;
  obstacleWakeModeCount: number;
  injectorCouplingLineCount: number;
  injectorBridgeLineCount: number;
  injectorCentroidCount: number;
  injectorModeCount: number;
  layeredWakeLineCount: number;
  layeredWakeBridgeLineCount: number;
  layeredWakeContourPoints: number;
  layeredWakeModeCount: number;
  vorticityConfinementLineCount: number;
  vorticityBridgeLineCount: number;
  vorticityConfinementCentroidCount: number;
  shearLayerRollupLineCount: number;
  shearLayerBridgeLineCount: number;
  shearLayerModeCount: number;
  wakeRecirculationShellLineCount: number;
  wakeRecirculationBridgeLineCount: number;
  wakeRecirculationContourPoints: number;
  wakeRecirculationModeCount: number;
  recirculationPocketLineCount: number;
  recirculationPocketBridgeLineCount: number;
  recirculationPocketModeCount: number;
  vortexPacketLineCount: number;
  vortexPacketBridgeLineCount: number;
  vortexPacketModeCount: number;
  vortexPacketLayerLineCount: number;
  vortexPacketLayerBridgeLineCount: number;
  vortexPacketLayerModeCount: number;
  volumeLayerPointCount: number;
  volumeLayerLineCount: number;
  volumeDepthLayerCount: number;
  volumeDepthRange: number;
};

type BuildVolumetricAdvancedRenderArgs = {
  state: VolumetricDensityTransportRuntimeState;
  derived: VolumetricDensityTransportDerivedFields;
  stats: VolumetricDensityTransportStats;
  lines: FutureNativeDebugLine[];
  lineCursor: number;
  samplePoints: FutureNativeDebugPoint[];
  pointCursor: number;
  meshRows: readonly VolumetricMeshRow[];
  getScratchPoints: (key: string) => FutureNativeDebugPoint[];
};

export function buildVolumetricAdvancedRenderStats({
  state,
  derived,
  stats,
  lines,
  lineCursor,
  samplePoints,
  pointCursor,
  meshRows,
  getScratchPoints,
}: BuildVolumetricAdvancedRenderArgs): VolumetricAdvancedRenderStats {
  const obstacleThreshold = Math.max(0.26, state.config.obstacleStrength * 0.4);
  const primaryBoundary = collectObstacleBoundary(state, state.primaryObstacleMask, obstacleThreshold, {
    left: getScratchPoints('primary-obstacle-left'),
    right: getScratchPoints('primary-obstacle-right'),
  });
  const secondaryBoundary = collectObstacleBoundary(state, state.secondaryObstacleMask, Math.max(0.22, obstacleThreshold * 0.86), {
    left: getScratchPoints('secondary-obstacle-left'),
    right: getScratchPoints('secondary-obstacle-right'),
  });
  let cursor = lineCursor;
  const primaryBoundaryResult = appendPooledBoundaryLines(lines, cursor, primaryBoundary.left, primaryBoundary.right);
  cursor = primaryBoundaryResult.cursor;
  const obstacleBoundaryLineCount = primaryBoundaryResult.count;
  const secondaryBoundaryResult = appendPooledBoundaryLines(lines, cursor, secondaryBoundary.left, secondaryBoundary.right);
  cursor = secondaryBoundaryResult.cursor;
  const secondaryObstacleBoundaryLineCount = secondaryBoundaryResult.count;
  const obstacleBridgeResult = appendPooledBoundaryBridges(
    lines,
    cursor,
    primaryBoundary.left,
    primaryBoundary.right,
    secondaryBoundary.left,
    secondaryBoundary.right,
  );
  cursor = obstacleBridgeResult.cursor;
  const obstacleBridgeLineCount = obstacleBridgeResult.count;

  const shaftStepX = Math.max(2, Math.floor(state.config.resolutionX / 5));
  const shaftThreshold = Math.max(stats.lightMarchMean * 1.02, 0.32);
  let lightMarchLineCount = 0;
  let lightMarchSampleCount = 0;
  const primaryShaftCenters: FutureNativeDebugPoint[] = [];
  for (let x = 1; x < state.config.resolutionX - 1; x += shaftStepX) {
    let firstY = -1;
    let lastY = -1;
    let peak = 0;
    for (let y = 0; y < state.config.resolutionY; y += 1) {
      const index = y * state.config.resolutionX + x;
      if (state.lightMarch[index] < shaftThreshold || state.obstacleMask[index] > 0.42) continue;
      if (firstY < 0) firstY = y;
      lastY = y;
      peak = Math.max(peak, state.lightMarch[index]);
      lightMarchSampleCount += 1;
    }
    if (firstY >= 0 && lastY > firstY) {
      cursor = appendPooledLineCoords(lines, cursor, x, firstY, peak * 0.32, x, lastY, peak * 0.82);
      primaryShaftCenters.push({ x, y: (firstY + lastY) * 0.5, z: peak * 0.56 });
      lightMarchLineCount += 1;
    }
  }

  const secondaryShaftThreshold = Math.max(stats.lightMarchSecondaryMean * 1.02, 0.24);
  let secondaryLightMarchLineCount = 0;
  let secondaryLightMarchSampleCount = 0;
  const secondaryShaftCenters: FutureNativeDebugPoint[] = [];
  for (let x = 1; x < state.config.resolutionX - 1; x += shaftStepX) {
    let firstY = -1;
    let lastY = -1;
    let peak = 0;
    for (let y = 0; y < state.config.resolutionY; y += 1) {
      const index = y * state.config.resolutionX + x;
      if (state.lightMarchSecondary[index] < secondaryShaftThreshold || state.secondaryObstacleMask[index] > 0.46) continue;
      if (firstY < 0) firstY = y;
      lastY = y;
      peak = Math.max(peak, state.lightMarchSecondary[index]);
      secondaryLightMarchSampleCount += 1;
    }
    if (firstY >= 0 && lastY > firstY) {
      const startX = clamp(x - peak * 1.4, 0, state.config.resolutionX - 1);
      const endX = clamp(x + peak * 0.9, 0, state.config.resolutionX - 1);
      cursor = appendPooledLineCoords(lines, cursor, startX, firstY, peak * 0.24, endX, lastY, peak * 0.72);
      secondaryShaftCenters.push({ x: (startX + endX) * 0.5, y: (firstY + lastY) * 0.5, z: peak * 0.48 });
      secondaryLightMarchLineCount += 1;
    }
  }

  let multiLightBridgeLineCount = 0;
  const shaftBridgeCount = Math.min(primaryShaftCenters.length, secondaryShaftCenters.length, 4);
  for (let step = 0; step < shaftBridgeCount; step += 1) {
    const primaryIndex = Math.min(primaryShaftCenters.length - 1, Math.round((primaryShaftCenters.length - 1) * (shaftBridgeCount <= 1 ? 0 : step / (shaftBridgeCount - 1))));
    const secondaryIndex = Math.min(secondaryShaftCenters.length - 1, Math.round((secondaryShaftCenters.length - 1) * (shaftBridgeCount <= 1 ? 0 : step / (shaftBridgeCount - 1))));
    cursor = appendPooledLine(lines, cursor, primaryShaftCenters[primaryIndex], secondaryShaftCenters[secondaryIndex]);
    multiLightBridgeLineCount += 1;
  }

  const tripleLightThreshold = Math.max(stats.tripleLightInterferenceMean * 0.88, 0.008);
  const leftThird = Math.floor((state.config.resolutionX - 1) * 0.34);
  const rightThird = Math.floor((state.config.resolutionX - 1) * 0.66);
  const tripleLightPrimary = collectFieldPeakLine(state, derived.tripleLightInterference, tripleLightThreshold, 0, leftThird, getScratchPoints('triple-light-primary'));
  const tripleLightCenter = collectFieldPeakLine(state, derived.tripleLightInterference, tripleLightThreshold, leftThird, rightThird, getScratchPoints('triple-light-center'));
  const tripleLightSecondary = collectFieldPeakLine(state, derived.tripleLightInterference, tripleLightThreshold, rightThird, state.config.resolutionX - 1, getScratchPoints('triple-light-secondary'));
  let tripleLightInterferenceLineCount = 0;
  const tripleLightPrimaryResult = appendPooledPolyline(lines, cursor, tripleLightPrimary);
  cursor = tripleLightPrimaryResult.cursor;
  tripleLightInterferenceLineCount += tripleLightPrimaryResult.count;
  const tripleLightCenterResult = appendPooledPolyline(lines, cursor, tripleLightCenter);
  cursor = tripleLightCenterResult.cursor;
  tripleLightInterferenceLineCount += tripleLightCenterResult.count;
  const tripleLightSecondaryResult = appendPooledPolyline(lines, cursor, tripleLightSecondary);
  cursor = tripleLightSecondaryResult.cursor;
  tripleLightInterferenceLineCount += tripleLightSecondaryResult.count;
  let tripleLightBridgeLineCount = 0;
  const tripleBridgeLeft = appendPolylineBridges(lines, cursor, tripleLightPrimary, tripleLightCenter, 2);
  cursor = tripleBridgeLeft.cursor;
  tripleLightBridgeLineCount += tripleBridgeLeft.count;
  const tripleBridgeRight = appendPolylineBridges(lines, cursor, tripleLightCenter, tripleLightSecondary, 2);
  cursor = tripleBridgeRight.cursor;
  tripleLightBridgeLineCount += tripleBridgeRight.count;
  tripleLightInterferenceLineCount += tripleLightBridgeLineCount;
  if (tripleLightInterferenceLineCount < 2 && primaryShaftCenters.length > 0 && secondaryShaftCenters.length > 0) {
    cursor = appendPooledLine(lines, cursor, primaryShaftCenters[0], secondaryShaftCenters[Math.max(0, secondaryShaftCenters.length - 1)]);
    tripleLightInterferenceLineCount += 1;
  }
  const tripleLightModeCount = Number(tripleLightPrimary.length > 0) + Number(tripleLightCenter.length > 0) + Number(tripleLightSecondary.length > 0);

  const triadLayerThreshold = Math.max(stats.lightTriadLayerMean * 0.92, 0.01);
  const triadLayerNear = collectFieldPeakLine(state, derived.lightTriadLayerNear, triadLayerThreshold, 0, state.config.resolutionX - 1, getScratchPoints('triad-layer-near'));
  const triadLayerMid = collectFieldPeakLine(state, derived.lightTriadLayerMid, triadLayerThreshold, 0, state.config.resolutionX - 1, getScratchPoints('triad-layer-mid'));
  const triadLayerFar = collectFieldPeakLine(state, derived.lightTriadLayerFar, triadLayerThreshold, 0, state.config.resolutionX - 1, getScratchPoints('triad-layer-far'));
  let lightTriadLayerLineCount = 0;
  const triadNearResult = appendPooledPolyline(lines, cursor, triadLayerNear);
  cursor = triadNearResult.cursor;
  lightTriadLayerLineCount += triadNearResult.count;
  const triadMidResult = appendPooledPolyline(lines, cursor, triadLayerMid);
  cursor = triadMidResult.cursor;
  lightTriadLayerLineCount += triadMidResult.count;
  const triadFarResult = appendPooledPolyline(lines, cursor, triadLayerFar);
  cursor = triadFarResult.cursor;
  lightTriadLayerLineCount += triadFarResult.count;
  let lightTriadLayerBridgeLineCount = 0;
  const triadBridgeNear = appendPolylineBridges(lines, cursor, triadLayerNear, triadLayerMid, 2);
  cursor = triadBridgeNear.cursor;
  lightTriadLayerBridgeLineCount += triadBridgeNear.count;
  const triadBridgeFar = appendPolylineBridges(lines, cursor, triadLayerMid, triadLayerFar, 2);
  cursor = triadBridgeFar.cursor;
  lightTriadLayerBridgeLineCount += triadBridgeFar.count;
  lightTriadLayerLineCount += lightTriadLayerBridgeLineCount;
  if (lightTriadLayerLineCount < 2 && primaryShaftCenters.length > 0) {
    const anchor = primaryShaftCenters[Math.floor(primaryShaftCenters.length / 2)];
    const fallback = { x: anchor.x, y: anchor.y + 1.2, z: (anchor.z ?? 0) + 0.18 };
    cursor = appendPooledLine(lines, cursor, anchor, fallback);
    lightTriadLayerLineCount += 1;
  }
  const lightTriadLayerModeCount = Number(triadLayerNear.length > 0) + Number(triadLayerMid.length > 0) + Number(triadLayerFar.length > 0);

  const plumeThreshold = Math.max(stats.plumeAnisotropyMean * 0.45, 0.008);
  const plumeMidX = Math.floor((state.config.resolutionX - 1) * 0.5);
  const leftBranchPoints = collectFieldPeakLine(state, derived.plumeBranchLeft, plumeThreshold, 0, plumeMidX, getScratchPoints('plume-branch-left'));
  const rightBranchPoints = collectFieldPeakLine(state, derived.plumeBranchRight, plumeThreshold, plumeMidX, state.config.resolutionX - 1, getScratchPoints('plume-branch-right'));
  let anisotropicPlumeLineCount = 0;
  const plumeLeftResult = appendPooledPolyline(lines, cursor, leftBranchPoints);
  cursor = plumeLeftResult.cursor;
  anisotropicPlumeLineCount += plumeLeftResult.count;
  const plumeRightResult = appendPooledPolyline(lines, cursor, rightBranchPoints);
  cursor = plumeRightResult.cursor;
  anisotropicPlumeLineCount += plumeRightResult.count;
  let plumeBranchBridgeLineCount = 0;
  const plumeBridgeResult = appendPolylineBridges(lines, cursor, leftBranchPoints, rightBranchPoints, 4);
  cursor = plumeBridgeResult.cursor;
  plumeBranchBridgeLineCount += plumeBridgeResult.count;
  anisotropicPlumeLineCount += plumeBranchBridgeLineCount;
  let anisotropicPlumeCentroidCount = Number(leftBranchPoints.length > 0) + Number(rightBranchPoints.length > 0);
  let anisotropicPlumeModeCount = Number(leftBranchPoints.length > 0) + Number(rightBranchPoints.length > 0);
  if (anisotropicPlumeLineCount < 1 && meshRows.length >= 2) {
    const fallbackLeft = meshRows.map((row) => row.innerLeft);
    const fallbackRight = meshRows.map((row) => row.innerRight);
    const fallbackLeftResult = appendPooledPolyline(lines, cursor, fallbackLeft);
    cursor = fallbackLeftResult.cursor;
    anisotropicPlumeLineCount += fallbackLeftResult.count;
    const fallbackRightResult = appendPooledPolyline(lines, cursor, fallbackRight);
    cursor = fallbackRightResult.cursor;
    anisotropicPlumeLineCount += fallbackRightResult.count;
    const fallbackBridgeResult = appendPolylineBridges(lines, cursor, fallbackLeft, fallbackRight, 2);
    cursor = fallbackBridgeResult.cursor;
    plumeBranchBridgeLineCount += fallbackBridgeResult.count;
    anisotropicPlumeLineCount += plumeBranchBridgeLineCount;
    anisotropicPlumeCentroidCount = Math.max(anisotropicPlumeCentroidCount, 2);
    anisotropicPlumeModeCount = Math.max(anisotropicPlumeModeCount, 2);
  }

  const primaryWakeThreshold = Math.max(stats.primaryObstacleWakeMean * 0.45, 0.006);
  const secondaryWakeThreshold = Math.max(stats.secondaryObstacleWakeMean * 0.45, 0.006);
  const primaryWakeBoundary = collectObstacleBoundary(state, derived.primaryObstacleWake, primaryWakeThreshold, {
    left: getScratchPoints('primary-wake-left'),
    right: getScratchPoints('primary-wake-right'),
  });
  const secondaryWakeBoundary = collectObstacleBoundary(state, derived.secondaryObstacleWake, secondaryWakeThreshold, {
    left: getScratchPoints('secondary-wake-left'),
    right: getScratchPoints('secondary-wake-right'),
  });
  let obstacleWakeLineCount = 0;
  const primaryWakeResult = appendPooledBoundaryLines(lines, cursor, primaryWakeBoundary.left, primaryWakeBoundary.right);
  cursor = primaryWakeResult.cursor;
  obstacleWakeLineCount += primaryWakeResult.count;
  const secondaryWakeResult = appendPooledBoundaryLines(lines, cursor, secondaryWakeBoundary.left, secondaryWakeBoundary.right);
  cursor = secondaryWakeResult.cursor;
  obstacleWakeLineCount += secondaryWakeResult.count;
  const obstacleWakeBridgeResult = appendPooledBoundaryBridges(
    lines,
    cursor,
    primaryWakeBoundary.left,
    primaryWakeBoundary.right,
    secondaryWakeBoundary.left,
    secondaryWakeBoundary.right,
  );
  cursor = obstacleWakeBridgeResult.cursor;
  const obstacleWakeBridgeLineCount = obstacleWakeBridgeResult.count;
  obstacleWakeLineCount += obstacleWakeBridgeLineCount;
  const obstacleWakeContourPoints =
    primaryWakeBoundary.left.length +
    primaryWakeBoundary.right.length +
    secondaryWakeBoundary.left.length +
    secondaryWakeBoundary.right.length;
  const obstacleWakeModeCount = Number(primaryWakeBoundary.left.length > 0) + Number(secondaryWakeBoundary.left.length > 0);

  const injectorSecondaryThreshold = Math.max(0.08, stats.injectorCouplingMean * 0.55, 0.06);
  const injectorTertiaryThreshold = Math.max(0.08, stats.injectorCouplingMean * 0.55, 0.06);
  const injectorCouplingThreshold = Math.max(0.12, stats.injectorCouplingMean * 1.15, 0.08);
  const injectorSecondaryBoundary = collectObstacleBoundary(state, derived.injectorSecondary, injectorSecondaryThreshold, {
    left: getScratchPoints('injector-secondary-left'),
    right: getScratchPoints('injector-secondary-right'),
  });
  const injectorTertiaryBoundary = collectObstacleBoundary(state, derived.injectorTertiary, injectorTertiaryThreshold, {
    left: getScratchPoints('injector-tertiary-left'),
    right: getScratchPoints('injector-tertiary-right'),
  });
  const injectorCouplingBoundary = collectObstacleBoundary(state, derived.injectorCoupling, injectorCouplingThreshold, {
    left: getScratchPoints('injector-coupling-left'),
    right: getScratchPoints('injector-coupling-right'),
  });
  let injectorCouplingLineCount = 0;
  const injectorSecondaryResult = appendPooledBoundaryLines(lines, cursor, injectorSecondaryBoundary.left, injectorSecondaryBoundary.right);
  cursor = injectorSecondaryResult.cursor;
  injectorCouplingLineCount += injectorSecondaryResult.count;
  const injectorTertiaryResult = appendPooledBoundaryLines(lines, cursor, injectorTertiaryBoundary.left, injectorTertiaryBoundary.right);
  cursor = injectorTertiaryResult.cursor;
  injectorCouplingLineCount += injectorTertiaryResult.count;
  const injectorCouplingResult = appendPooledBoundaryLines(lines, cursor, injectorCouplingBoundary.left, injectorCouplingBoundary.right);
  cursor = injectorCouplingResult.cursor;
  injectorCouplingLineCount += injectorCouplingResult.count;
  let injectorBridgeLineCount = 0;
  const injectorBridgeSecondary = appendPooledBoundaryBridges(
    lines,
    cursor,
    injectorSecondaryBoundary.left,
    injectorSecondaryBoundary.right,
    injectorCouplingBoundary.left,
    injectorCouplingBoundary.right,
  );
  cursor = injectorBridgeSecondary.cursor;
  injectorBridgeLineCount += injectorBridgeSecondary.count;
  const injectorBridgeTertiary = appendPooledBoundaryBridges(
    lines,
    cursor,
    injectorTertiaryBoundary.left,
    injectorTertiaryBoundary.right,
    injectorCouplingBoundary.left,
    injectorCouplingBoundary.right,
  );
  cursor = injectorBridgeTertiary.cursor;
  injectorBridgeLineCount += injectorBridgeTertiary.count;
  injectorCouplingLineCount += injectorBridgeLineCount;
  let nextPointCursor = pointCursor;
  const injectorSecondaryCentroid = centroidOfPoints(
    injectorSecondaryBoundary.left.concat(injectorSecondaryBoundary.right),
    samplePoints[nextPointCursor],
  );
  if (injectorSecondaryCentroid) {
    samplePoints[nextPointCursor] = injectorSecondaryCentroid;
    nextPointCursor += 1;
  }
  const injectorCouplingCentroid = centroidOfPoints(
    injectorCouplingBoundary.left.concat(injectorCouplingBoundary.right),
    samplePoints[nextPointCursor],
  );
  if (injectorCouplingCentroid) {
    samplePoints[nextPointCursor] = injectorCouplingCentroid;
    nextPointCursor += 1;
  }
  const injectorTertiaryCentroid = centroidOfPoints(
    injectorTertiaryBoundary.left.concat(injectorTertiaryBoundary.right),
    samplePoints[nextPointCursor],
  );
  if (injectorTertiaryCentroid) {
    samplePoints[nextPointCursor] = injectorTertiaryCentroid;
    nextPointCursor += 1;
  }
  const injectorCentroidCount = nextPointCursor - pointCursor;
  let injectorModeCount = 0;
  if (injectorSecondaryBoundary.left.length + injectorSecondaryBoundary.right.length > 0) injectorModeCount += 1;
  if (injectorCouplingBoundary.left.length + injectorCouplingBoundary.right.length > 0) injectorModeCount += 1;
  if (injectorTertiaryBoundary.left.length + injectorTertiaryBoundary.right.length > 0) injectorModeCount += 1;

  const wakeNearThreshold = Math.max(0.016, stats.wakeTurbulenceMean * 0.66);
  const wakeMidThreshold = Math.max(0.014, stats.wakeTurbulenceMean * 0.54);
  const wakeFarThreshold = Math.max(0.012, stats.wakeTurbulenceMean * 0.44);
  const wakeNearBoundary = collectObstacleBoundary(state, derived.wakeLayerNear, wakeNearThreshold, {
    left: getScratchPoints('wake-near-left'),
    right: getScratchPoints('wake-near-right'),
  });
  const wakeMidBoundary = collectObstacleBoundary(state, derived.wakeLayerMid, wakeMidThreshold, {
    left: getScratchPoints('wake-mid-left'),
    right: getScratchPoints('wake-mid-right'),
  });
  const wakeFarBoundary = collectObstacleBoundary(state, derived.wakeLayerFar, wakeFarThreshold, {
    left: getScratchPoints('wake-far-left'),
    right: getScratchPoints('wake-far-right'),
  });
  let layeredWakeLineCount = 0;
  const wakeNearResult = appendPooledBoundaryLines(lines, cursor, wakeNearBoundary.left, wakeNearBoundary.right);
  cursor = wakeNearResult.cursor;
  layeredWakeLineCount += wakeNearResult.count;
  const wakeMidResult = appendPooledBoundaryLines(lines, cursor, wakeMidBoundary.left, wakeMidBoundary.right);
  cursor = wakeMidResult.cursor;
  layeredWakeLineCount += wakeMidResult.count;
  const wakeFarResult = appendPooledBoundaryLines(lines, cursor, wakeFarBoundary.left, wakeFarBoundary.right);
  cursor = wakeFarResult.cursor;
  layeredWakeLineCount += wakeFarResult.count;
  let layeredWakeBridgeLineCount = 0;
  const wakeBridgeNear = appendPooledBoundaryBridges(lines, cursor, wakeNearBoundary.left, wakeNearBoundary.right, wakeMidBoundary.left, wakeMidBoundary.right);
  cursor = wakeBridgeNear.cursor;
  layeredWakeBridgeLineCount += wakeBridgeNear.count;
  const wakeBridgeFar = appendPooledBoundaryBridges(lines, cursor, wakeMidBoundary.left, wakeMidBoundary.right, wakeFarBoundary.left, wakeFarBoundary.right);
  cursor = wakeBridgeFar.cursor;
  layeredWakeBridgeLineCount += wakeBridgeFar.count;
  if (layeredWakeBridgeLineCount < 1) {
    const wakeNearCentroid = centroidOfPoints(wakeNearBoundary.left.concat(wakeNearBoundary.right), getScratchPoints('wake-near-centroid')[0]);
    const wakeMidCentroid = centroidOfPoints(wakeMidBoundary.left.concat(wakeMidBoundary.right), getScratchPoints('wake-mid-centroid')[0]);
    const wakeFarCentroid = centroidOfPoints(wakeFarBoundary.left.concat(wakeFarBoundary.right), getScratchPoints('wake-far-centroid')[0]);
    if (wakeNearCentroid && wakeMidCentroid) {
      cursor = appendPooledLine(lines, cursor, wakeNearCentroid, wakeMidCentroid);
      layeredWakeBridgeLineCount += 1;
    }
    if (layeredWakeBridgeLineCount < 1 && wakeMidCentroid && wakeFarCentroid) {
      cursor = appendPooledLine(lines, cursor, wakeMidCentroid, wakeFarCentroid);
      layeredWakeBridgeLineCount += 1;
    }
    if (layeredWakeBridgeLineCount < 1 && meshRows.length >= 2) {
      cursor = appendPooledLine(lines, cursor, meshRows[0].center, meshRows[meshRows.length - 1].center);
      layeredWakeBridgeLineCount += 1;
    }
  }
  layeredWakeLineCount += layeredWakeBridgeLineCount;
  const layeredWakeContourPoints =
    wakeNearBoundary.left.length + wakeNearBoundary.right.length +
    wakeMidBoundary.left.length + wakeMidBoundary.right.length +
    wakeFarBoundary.left.length + wakeFarBoundary.right.length;
  const layeredWakeModeCount = Number(wakeNearBoundary.left.length > 0) + Number(wakeMidBoundary.left.length > 0) + Number(wakeFarBoundary.left.length > 0);

  const vortexVolumeStats = buildVolumetricVortexVolumeStats({
    state,
    derived,
    stats,
    lines,
    lineCursor: cursor,
    samplePoints,
    pointCursor: nextPointCursor,
    meshRows,
    getScratchPoints,
  });
  cursor = vortexVolumeStats.lineCursor;

  return {
    obstacleBoundaryLineCount,
    secondaryObstacleBoundaryLineCount,
    obstacleBridgeLineCount,
    lightMarchLineCount,
    lightMarchSampleCount,
    secondaryLightMarchLineCount,
    secondaryLightMarchSampleCount,
    multiLightBridgeLineCount,
    tripleLightInterferenceLineCount,
    tripleLightBridgeLineCount,
    tripleLightModeCount,
    lightTriadLayerLineCount,
    lightTriadLayerBridgeLineCount,
    lightTriadLayerModeCount,
    anisotropicPlumeLineCount,
    plumeBranchBridgeLineCount,
    anisotropicPlumeCentroidCount,
    anisotropicPlumeModeCount,
    obstacleWakeLineCount,
    obstacleWakeContourPoints,
    obstacleWakeBridgeLineCount,
    obstacleWakeModeCount,
    injectorCouplingLineCount,
    injectorBridgeLineCount,
    injectorCentroidCount,
    injectorModeCount,
    layeredWakeLineCount,
    layeredWakeBridgeLineCount,
    layeredWakeContourPoints,
    layeredWakeModeCount,
    ...vortexVolumeStats,
  };
}
