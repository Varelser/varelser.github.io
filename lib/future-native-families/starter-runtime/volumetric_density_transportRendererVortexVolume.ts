import type { FutureNativeDebugLine, FutureNativeDebugPoint } from './runtimeContracts';
import type {
  VolumetricDensityTransportDerivedFields,
  VolumetricDensityTransportRuntimeState,
  VolumetricDensityTransportStats,
} from './volumetric_density_transportSolver';
import {
  appendPooledPoint,
  appendPooledBoundaryBridges,
  appendPooledBoundaryLines,
  appendPooledLine,
  appendPooledPolyline,
  collectCentroidSamples,
  collectFieldPeakLine,
  collectObstacleBoundary,
  type VolumetricMeshRow,
} from './volumetric_density_transportRendererShared';

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

export type VolumetricVortexVolumeStats = {
  lineCursor: number;
  pointCursor: number;
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

type BuildVolumetricVortexVolumeArgs = {
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

export function buildVolumetricVortexVolumeStats({
  state,
  derived,
  stats,
  lines,
  lineCursor,
  samplePoints,
  pointCursor,
  meshRows,
  getScratchPoints,
}: BuildVolumetricVortexVolumeArgs): VolumetricVortexVolumeStats {
  let cursor = lineCursor;
  let nextPointCursor = pointCursor;
  const vorticityThreshold = Math.max(stats.vorticityConfinementMean * 1.04, 0.012);
  const shearRollupThreshold = Math.max(stats.shearLayerRollupMean * 1.04, 0.012);
  const vorticityLeft = collectFieldPeakLine(state, derived.vorticityConfinement, vorticityThreshold, 0, Math.floor((state.config.resolutionX - 1) * 0.48), getScratchPoints('vorticity-left'));
  const vorticityRight = collectFieldPeakLine(state, derived.vorticityConfinement, vorticityThreshold, Math.floor((state.config.resolutionX - 1) * 0.52), state.config.resolutionX - 1, getScratchPoints('vorticity-right'));
  let vorticityConfinementLineCount = 0;
  const vorticityLeftResult = appendPooledPolyline(lines, cursor, vorticityLeft);
  cursor = vorticityLeftResult.cursor;
  vorticityConfinementLineCount += vorticityLeftResult.count;
  const vorticityRightResult = appendPooledPolyline(lines, cursor, vorticityRight);
  cursor = vorticityRightResult.cursor;
  vorticityConfinementLineCount += vorticityRightResult.count;
  let vorticityBridgeLineCount = 0;
  const vorticityBridgeResult = appendPolylineBridges(lines, cursor, vorticityLeft, vorticityRight, 3);
  cursor = vorticityBridgeResult.cursor;
  vorticityBridgeLineCount += vorticityBridgeResult.count;
  if (vorticityConfinementLineCount < 1 && meshRows.length >= 2) {
    cursor = appendPooledLine(lines, cursor, meshRows[0].innerLeft, meshRows[meshRows.length - 1].innerRight);
    vorticityConfinementLineCount += 1;
  }
  const vorticityCentroids = collectCentroidSamples(state, derived.vorticityConfinement, vorticityThreshold, Math.floor(state.config.resolutionY / 5), getScratchPoints('vorticity-centroids'));
  for (let index = 0; index < vorticityCentroids.length - 1; index += 1) {
    cursor = appendPooledLine(lines, cursor, vorticityCentroids[index], vorticityCentroids[index + 1]);
    vorticityBridgeLineCount += 1;
  }
  const vorticityConfinementCentroidCount = vorticityCentroids.length;

  const shearRollLeft = collectFieldPeakLine(state, derived.shearLayerRollup, shearRollupThreshold, 0, Math.floor((state.config.resolutionX - 1) * 0.48), getScratchPoints('shear-roll-left'));
  const shearRollRight = collectFieldPeakLine(state, derived.shearLayerRollup, shearRollupThreshold, Math.floor((state.config.resolutionX - 1) * 0.52), state.config.resolutionX - 1, getScratchPoints('shear-roll-right'));
  let shearLayerRollupLineCount = 0;
  const shearLeftResult = appendPooledPolyline(lines, cursor, shearRollLeft);
  cursor = shearLeftResult.cursor;
  shearLayerRollupLineCount += shearLeftResult.count;
  const shearRightResult = appendPooledPolyline(lines, cursor, shearRollRight);
  cursor = shearRightResult.cursor;
  shearLayerRollupLineCount += shearRightResult.count;
  let shearLayerBridgeLineCount = 0;
  const shearBridgeResult = appendPolylineBridges(lines, cursor, shearRollLeft, shearRollRight, 3);
  cursor = shearBridgeResult.cursor;
  shearLayerBridgeLineCount += shearBridgeResult.count;
  if (shearLayerRollupLineCount < 1 && vorticityCentroids.length >= 2) {
    cursor = appendPooledLine(lines, cursor, vorticityCentroids[0], vorticityCentroids[vorticityCentroids.length - 1]);
    shearLayerRollupLineCount += 1;
  }
  if (shearLayerRollupLineCount < 1 && meshRows.length >= 1) {
    cursor = appendPooledLine(lines, cursor, meshRows[0].innerLeft, meshRows[0].innerRight);
    shearLayerRollupLineCount += 1;
  }
  const shearLayerModeCount = Number(shearRollLeft.length > 0) + Number(shearRollRight.length > 0);

  const recirculationThreshold = Math.max(stats.wakeRecirculationMean * 1.06, 0.011);
  const recircNearBoundary = collectObstacleBoundary(state, derived.wakeRecirculationShellNear, recirculationThreshold, {
    left: getScratchPoints('recirc-near-left'),
    right: getScratchPoints('recirc-near-right'),
  });
  const recircFarBoundary = collectObstacleBoundary(state, derived.wakeRecirculationShellFar, Math.max(recirculationThreshold * 0.82, 0.009), {
    left: getScratchPoints('recirc-far-left'),
    right: getScratchPoints('recirc-far-right'),
  });
  const recircNearResult = appendPooledBoundaryLines(lines, cursor, recircNearBoundary.left, recircNearBoundary.right);
  cursor = recircNearResult.cursor;
  let wakeRecirculationShellLineCount = recircNearResult.count;
  const recircFarResult = appendPooledBoundaryLines(lines, cursor, recircFarBoundary.left, recircFarBoundary.right);
  cursor = recircFarResult.cursor;
  wakeRecirculationShellLineCount += recircFarResult.count;
  const recircBridgeResult = appendPooledBoundaryBridges(lines, cursor, recircNearBoundary.left, recircNearBoundary.right, recircFarBoundary.left, recircFarBoundary.right);
  cursor = recircBridgeResult.cursor;
  let wakeRecirculationBridgeLineCount = recircBridgeResult.count;
  if (wakeRecirculationShellLineCount < 2 && meshRows.length >= 2) {
    cursor = appendPooledLine(lines, cursor, meshRows[0].left, meshRows[meshRows.length - 1].right);
    wakeRecirculationShellLineCount += 1;
  }
  const wakeRecirculationContourPoints =
    recircNearBoundary.left.length + recircNearBoundary.right.length + recircFarBoundary.left.length + recircFarBoundary.right.length;
  const wakeRecirculationModeCount = Number(recircNearBoundary.left.length > 0) + Number(recircFarBoundary.left.length > 0);

  const pocketThreshold = Math.max(stats.wakeRecirculationMean * 0.88, 0.01);
  const pocketLeftBoundary = collectObstacleBoundary(state, derived.recirculationPocketLeft, pocketThreshold, {
    left: getScratchPoints('pocket-left-left'),
    right: getScratchPoints('pocket-left-right'),
  });
  const pocketRightBoundary = collectObstacleBoundary(state, derived.recirculationPocketRight, pocketThreshold, {
    left: getScratchPoints('pocket-right-left'),
    right: getScratchPoints('pocket-right-right'),
  });
  const pocketLeftResult = appendPooledBoundaryLines(lines, cursor, pocketLeftBoundary.left, pocketLeftBoundary.right);
  cursor = pocketLeftResult.cursor;
  let recirculationPocketLineCount = pocketLeftResult.count;
  const pocketRightResult = appendPooledBoundaryLines(lines, cursor, pocketRightBoundary.left, pocketRightBoundary.right);
  cursor = pocketRightResult.cursor;
  recirculationPocketLineCount += pocketRightResult.count;
  const pocketBridgeResult = appendPooledBoundaryBridges(lines, cursor, pocketLeftBoundary.left, pocketLeftBoundary.right, pocketRightBoundary.left, pocketRightBoundary.right);
  cursor = pocketBridgeResult.cursor;
  let recirculationPocketBridgeLineCount = pocketBridgeResult.count;
  if (recirculationPocketLineCount < 1 && meshRows.length >= 1) {
    cursor = appendPooledLine(lines, cursor, meshRows[0].innerLeft, meshRows[0].innerRight);
    recirculationPocketLineCount += 1;
  }
  const recirculationPocketModeCount = Number(pocketLeftBoundary.left.length > 0) + Number(pocketRightBoundary.left.length > 0);

  const vortexPacketThreshold = Math.max(stats.vortexPacketPeak * 0.22, 0.012);
  const vortexPacketLeftBoundary = collectObstacleBoundary(state, derived.vortexPacketLeft, vortexPacketThreshold, {
    left: getScratchPoints('vortex-packet-left-left'),
    right: getScratchPoints('vortex-packet-left-right'),
  });
  const vortexPacketRightBoundary = collectObstacleBoundary(state, derived.vortexPacketRight, vortexPacketThreshold, {
    left: getScratchPoints('vortex-packet-right-left'),
    right: getScratchPoints('vortex-packet-right-right'),
  });
  const vortexLeftResult = appendPooledBoundaryLines(lines, cursor, vortexPacketLeftBoundary.left, vortexPacketLeftBoundary.right);
  cursor = vortexLeftResult.cursor;
  let vortexPacketLineCount = vortexLeftResult.count;
  const vortexRightResult = appendPooledBoundaryLines(lines, cursor, vortexPacketRightBoundary.left, vortexPacketRightBoundary.right);
  cursor = vortexRightResult.cursor;
  vortexPacketLineCount += vortexRightResult.count;
  const vortexBridgeResult = appendPooledBoundaryBridges(lines, cursor, vortexPacketLeftBoundary.left, vortexPacketLeftBoundary.right, vortexPacketRightBoundary.left, vortexPacketRightBoundary.right);
  cursor = vortexBridgeResult.cursor;
  let vortexPacketBridgeLineCount = vortexBridgeResult.count;
  if (vortexPacketLineCount < 1 && vorticityCentroids.length >= 2) {
    cursor = appendPooledLine(lines, cursor, vorticityCentroids[0], vorticityCentroids[vorticityCentroids.length - 1]);
    vortexPacketLineCount += 1;
  }
  const vortexPacketModeCount = Number(vortexPacketLeftBoundary.left.length > 0) + Number(vortexPacketRightBoundary.left.length > 0);

  const vortexPacketLayerThreshold = Math.max(stats.vortexPacketLayerMean * 0.9, 0.01);
  const vortexPacketLayerNearBoundary = collectObstacleBoundary(state, derived.vortexPacketLayerNear, vortexPacketLayerThreshold, {
    left: getScratchPoints('vortex-layer-near-left'),
    right: getScratchPoints('vortex-layer-near-right'),
  });
  const vortexPacketLayerMidBoundary = collectObstacleBoundary(state, derived.vortexPacketLayerMid, Math.max(vortexPacketLayerThreshold * 0.9, 0.009), {
    left: getScratchPoints('vortex-layer-mid-left'),
    right: getScratchPoints('vortex-layer-mid-right'),
  });
  const vortexPacketLayerFarBoundary = collectObstacleBoundary(state, derived.vortexPacketLayerFar, Math.max(vortexPacketLayerThreshold * 0.8, 0.008), {
    left: getScratchPoints('vortex-layer-far-left'),
    right: getScratchPoints('vortex-layer-far-right'),
  });
  let vortexPacketLayerLineCount = 0;
  const vortexLayerNearResult = appendPooledBoundaryLines(lines, cursor, vortexPacketLayerNearBoundary.left, vortexPacketLayerNearBoundary.right);
  cursor = vortexLayerNearResult.cursor;
  vortexPacketLayerLineCount += vortexLayerNearResult.count;
  const vortexLayerMidResult = appendPooledBoundaryLines(lines, cursor, vortexPacketLayerMidBoundary.left, vortexPacketLayerMidBoundary.right);
  cursor = vortexLayerMidResult.cursor;
  vortexPacketLayerLineCount += vortexLayerMidResult.count;
  const vortexLayerFarResult = appendPooledBoundaryLines(lines, cursor, vortexPacketLayerFarBoundary.left, vortexPacketLayerFarBoundary.right);
  cursor = vortexLayerFarResult.cursor;
  vortexPacketLayerLineCount += vortexLayerFarResult.count;
  let vortexPacketLayerBridgeLineCount = 0;
  const vortexLayerBridgeNearResult = appendPooledBoundaryBridges(lines, cursor, vortexPacketLayerNearBoundary.left, vortexPacketLayerNearBoundary.right, vortexPacketLayerMidBoundary.left, vortexPacketLayerMidBoundary.right);
  cursor = vortexLayerBridgeNearResult.cursor;
  vortexPacketLayerBridgeLineCount += vortexLayerBridgeNearResult.count;
  const vortexLayerBridgeFarResult = appendPooledBoundaryBridges(lines, cursor, vortexPacketLayerMidBoundary.left, vortexPacketLayerMidBoundary.right, vortexPacketLayerFarBoundary.left, vortexPacketLayerFarBoundary.right);
  cursor = vortexLayerBridgeFarResult.cursor;
  vortexPacketLayerBridgeLineCount += vortexLayerBridgeFarResult.count;
  if (vortexPacketLayerLineCount < 2 && vorticityCentroids.length >= 2) {
    cursor = appendPooledLine(lines, cursor, vorticityCentroids[0], vorticityCentroids[vorticityCentroids.length - 1]);
    vortexPacketLayerLineCount += 1;
  }
  vortexPacketLayerLineCount += vortexPacketLayerBridgeLineCount;
  const vortexPacketLayerModeCount = Number(vortexPacketLayerNearBoundary.left.length > 0) + Number(vortexPacketLayerMidBoundary.left.length > 0) + Number(vortexPacketLayerFarBoundary.left.length > 0);

  const depthThreshold = Math.max(stats.volumeDepthMean * 0.72, stats.maxDensity * 0.08, 0.015);
  const volumeDepthLayerCount = Math.max(2, Math.min(5, state.config.depthLayers));
  const depthSampleStepX = Math.max(2, Math.floor(state.config.resolutionX / 8));
  const depthSampleStepY = Math.max(2, Math.floor(state.config.resolutionY / 8));
  let volumeLayerPointCount = 0;
  let volumeLayerLineCount = 0;
  let volumeDepthRange = 0;
  const previousByLayer = Array.from({ length: volumeDepthLayerCount }, () => new Map<number, FutureNativeDebugPoint>());
  for (let y = 1; y < state.config.resolutionY - 1; y += depthSampleStepY) {
    let prevColumnPoint: FutureNativeDebugPoint | null = null;
    for (let x = 1; x < state.config.resolutionX - 1; x += depthSampleStepX) {
      const index = y * state.config.resolutionX + x;
      if (state.volumeDepth[index] < depthThreshold || state.obstacleMask[index] > 0.48) continue;
      const depth = state.volumeDepth[index];
      volumeDepthRange = Math.max(volumeDepthRange, depth);
      let stackPrev: FutureNativeDebugPoint | null = null;
      for (let layer = 0; layer < volumeDepthLayerCount; layer += 1) {
        const centered = volumeDepthLayerCount <= 1 ? 0 : layer / (volumeDepthLayerCount - 1) - 0.5;
        const appendedPoint = appendPooledPoint(
          samplePoints,
          nextPointCursor,
          x,
          y,
          depth * centered * 2 + state.lightMarch[index] * 0.12 + state.lightMarchSecondary[index] * 0.08 + state.rimLight[index] * 0.06 + state.lighting[index] * 0.08,
        );
        const point = appendedPoint.point;
        nextPointCursor = appendedPoint.cursor;
        volumeLayerPointCount += 1;
        if (stackPrev) {
          cursor = appendPooledLine(lines, cursor, stackPrev, point);
          volumeLayerLineCount += 1;
        }
        const prevRowPoint = previousByLayer[layer].get(x);
        if (prevRowPoint) {
          cursor = appendPooledLine(lines, cursor, prevRowPoint, point);
          volumeLayerLineCount += 1;
        }
        previousByLayer[layer].set(x, point);
        stackPrev = point;
        if (layer === Math.floor(volumeDepthLayerCount / 2) && prevColumnPoint) {
          cursor = appendPooledLine(lines, cursor, prevColumnPoint, point);
          volumeLayerLineCount += 1;
        }
        if (layer === Math.floor(volumeDepthLayerCount / 2)) prevColumnPoint = point;
      }
    }
  }

  if (volumeLayerPointCount < 12 && meshRows.length > 0) {
    const fallbackDepth = Math.max(stats.volumeDepthMean * 3.2, depthThreshold * 1.6, 0.03);
    const fallbackRow = meshRows[Math.floor(meshRows.length / 2)] ?? meshRows[0];
    let stackPrev: FutureNativeDebugPoint | null = null;
    for (let layer = 0; layer < volumeDepthLayerCount; layer += 1) {
      const centered = volumeDepthLayerCount <= 1 ? 0 : layer / (volumeDepthLayerCount - 1) - 0.5;
      const appendedPoint = appendPooledPoint(
        samplePoints,
        nextPointCursor,
        fallbackRow.center.x,
        fallbackRow.center.y,
        (fallbackRow.center.z ?? 0) + fallbackDepth * centered * 2,
      );
      const point = appendedPoint.point;
      nextPointCursor = appendedPoint.cursor;
      volumeLayerPointCount += 1;
      volumeDepthRange = Math.max(volumeDepthRange, Math.abs(fallbackDepth * centered * 2));
      if (stackPrev) {
        cursor = appendPooledLine(lines, cursor, stackPrev, point);
        volumeLayerLineCount += 1;
      }
      stackPrev = point;
    }
  }

  return {
    lineCursor: cursor,
    pointCursor: nextPointCursor,
    vorticityConfinementLineCount,
    vorticityBridgeLineCount,
    vorticityConfinementCentroidCount,
    shearLayerRollupLineCount,
    shearLayerBridgeLineCount,
    shearLayerModeCount,
    wakeRecirculationShellLineCount,
    wakeRecirculationBridgeLineCount,
    wakeRecirculationContourPoints,
    wakeRecirculationModeCount,
    recirculationPocketLineCount,
    recirculationPocketBridgeLineCount,
    recirculationPocketModeCount,
    vortexPacketLineCount,
    vortexPacketBridgeLineCount,
    vortexPacketModeCount,
    vortexPacketLayerLineCount,
    vortexPacketLayerBridgeLineCount,
    vortexPacketLayerModeCount,
    volumeLayerPointCount,
    volumeLayerLineCount,
    volumeDepthLayerCount,
    volumeDepthRange,
  };
}
