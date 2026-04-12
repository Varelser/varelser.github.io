import type { FutureNativeDebugLine, FutureNativeDebugPoint, FutureNativeRenderPayload } from './runtimeContracts';
import { profileRuntimeTask } from '../../runtimeProfiling';
import { getOrCreateCachedPayload, syncStatsObject, type MutableFutureNativeRenderPayload } from './pbdPayloadCache';
import {
  getVolumetricDensityTransportDerivedFieldsView,
  getVolumetricDensityTransportStats,
  type VolumetricDensityTransportRuntimeState,
} from './volumetric_density_transportSolver';
import {
  buildMeshRow,
  buildShadedPoint,
  type VolumetricMeshRow,
} from './volumetric_density_transportRendererShared';
import { buildVolumetricAdvancedRenderStats } from './volumetric_density_transportRendererAdvanced';

const volumetricPayloadCache = new WeakMap<object, MutableFutureNativeRenderPayload>();
const volumetricScratchPointCache = new WeakMap<object, Map<string, FutureNativeDebugPoint[]>>();

function ensurePooledLine(lines: FutureNativeDebugLine[], index: number) {
  if (!lines[index]) {
    lines[index] = {
      a: { x: 0, y: 0, z: 0 },
      b: { x: 0, y: 0, z: 0 },
    };
  }
  return lines[index];
}

function setPooledLine(
  lines: FutureNativeDebugLine[],
  cursor: number,
  a: FutureNativeDebugPoint,
  b: FutureNativeDebugPoint,
) {
  const line = ensurePooledLine(lines, cursor);
  line.a = a;
  line.b = b;
  return cursor + 1;
}

function setPooledLineCoords(
  lines: FutureNativeDebugLine[],
  cursor: number,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
) {
  const line = ensurePooledLine(lines, cursor);
  line.a.x = ax;
  line.a.y = ay;
  line.a.z = az;
  line.b.x = bx;
  line.b.y = by;
  line.b.z = bz;
  return cursor + 1;
}

export function buildVolumetricDensityTransportDebugRenderPayload(
  state: VolumetricDensityTransportRuntimeState,
  options?: { profilingKeyPrefix?: string },
): FutureNativeRenderPayload {
  const profilePayloadTask = <T,>(suffix: string, task: () => T) => (
    options?.profilingKeyPrefix
      ? profileRuntimeTask(`${options.profilingKeyPrefix}:${suffix}`, 'simulation', task)
      : task()
  );
  const stats = profilePayloadTask('stats', () => getVolumetricDensityTransportStats(state));
  const derived = profilePayloadTask('derived', () => getVolumetricDensityTransportDerivedFieldsView(state));
  const payload = getOrCreateCachedPayload(
    volumetricPayloadCache,
    state.config,
    'volumetric-density-transport',
    '',
  );
  let scratch = volumetricScratchPointCache.get(state.config);
  if (!scratch) {
    scratch = new Map<string, FutureNativeDebugPoint[]>();
    volumetricScratchPointCache.set(state.config, scratch);
  }
  const getScratchPoints = (key: string) => {
    const existing = scratch!.get(key);
    if (existing) return existing;
    const created: FutureNativeDebugPoint[] = [];
    scratch!.set(key, created);
    return created;
  };
  const samplePoints = profilePayloadTask('sample-points', () => {
    const points = payload.points;
    const sampleStepY = Math.max(1, Math.floor(state.config.resolutionY / 6));
    const sampleStepX = Math.max(1, Math.floor(state.config.resolutionX / 6));
    let cursor = 0;
    for (let y = 0; y < state.config.resolutionY; y += sampleStepY) {
      for (let x = 0; x < state.config.resolutionX; x += sampleStepX) {
        const target = points[cursor] ?? { x: 0, y: 0, z: 0 };
        points[cursor] = buildShadedPoint(state, x, y, target);
        cursor += 1;
      }
    }
    points.length = cursor;
    return points;
  });

  const lines = payload.lines;
  let lineCursor = 0;
  const sliceThreshold = Math.max(stats.maxDensity * 0.18, (stats.totalDensity / Math.max(1, stats.cells)) * 1.4);
  const sliceStepY = Math.max(1, Math.floor(state.config.resolutionY / 5));
  let sliceLineCount = 0;
  let sliceCount = 0;
  profilePayloadTask('slice-lines', () => {
    for (let y = 1; y < state.config.resolutionY - 1; y += sliceStepY) {
      let left = -1;
      let right = -1;
      let leftDensity = 0;
      let rightDensity = 0;
      for (let x = 0; x < state.config.resolutionX; x += 1) {
        const index = y * state.config.resolutionX + x;
        const density = state.density[index];
        if (density < sliceThreshold || state.obstacleMask[index] > 0.42) continue;
        if (left < 0) {
          left = x;
          leftDensity = density;
        }
        right = x;
        rightDensity = density;
      }
      if (left >= 0 && right > left) {
        lineCursor = setPooledLineCoords(lines, lineCursor, left, y, leftDensity, right, y, rightDensity);
        sliceLineCount += 1;
        sliceCount += 1;
      }
    }
  });

  const envelopeThreshold = Math.max(sliceThreshold * 0.36, stats.maxDensity * 0.04);

  profilePayloadTask('envelope-lines', () => {
    if (sliceLineCount < 2) {
      const fallbackRows = [0.22, 0.44, 0.68].map((ratio) => Math.min(state.config.resolutionY - 2, Math.max(1, Math.round((state.config.resolutionY - 1) * ratio))));
      for (const y of fallbackRows) {
        let weightedX = 0;
        let totalRowDensity = 0;
        for (let x = 0; x < state.config.resolutionX; x += 1) {
          const index = y * state.config.resolutionX + x;
          const density = state.density[index];
          if (density <= 0 || state.obstacleMask[index] > 0.5) continue;
          weightedX += x * density;
          totalRowDensity += density;
        }
        if (totalRowDensity <= 1e-6) continue;
        const centerX = weightedX / totalRowDensity;
        const halfSpan = Math.max(1.5, Math.min(state.config.resolutionX * 0.2, totalRowDensity * state.config.resolutionX * 0.12));
        lineCursor = setPooledLineCoords(
          lines,
          lineCursor,
          Math.max(0, centerX - halfSpan),
          y,
          totalRowDensity * 0.08,
          Math.min(state.config.resolutionX - 1, centerX + halfSpan),
          y,
          totalRowDensity * 0.08,
        );
        sliceLineCount += 1;
      }
      sliceCount = Math.max(sliceCount, sliceLineCount);
    }
  });

  const leftEnvelope: FutureNativeDebugPoint[] = [];
  const rightEnvelope: FutureNativeDebugPoint[] = [];
  let minEnvelopeX = state.config.resolutionX;
  let maxEnvelopeX = 0;
  let peakEnvelopeY = 0;
  let contourBridgeCount = 0;
  profilePayloadTask('contour-lines', () => {
    for (let y = 0; y < state.config.resolutionY; y += 2) {
      let left = -1;
      let right = -1;
      let leftLighting = 0;
      let rightLighting = 0;
      for (let x = 0; x < state.config.resolutionX; x += 1) {
        const index = y * state.config.resolutionX + x;
        if (state.density[index] < envelopeThreshold || state.obstacleMask[index] > 0.56) continue;
        if (left < 0) {
          left = x;
          leftLighting = state.lighting[index] + state.lightMarch[index] * 0.18 - state.shadow[index] * 0.1;
        }
        right = x;
        rightLighting = state.lighting[index] + state.lightMarch[index] * 0.18 - state.shadow[index] * 0.1;
      }
      if (left < 0 || right < left) continue;
      leftEnvelope.push({ x: left, y, z: leftLighting });
      rightEnvelope.push({ x: right, y, z: rightLighting });
      minEnvelopeX = Math.min(minEnvelopeX, left);
      maxEnvelopeX = Math.max(maxEnvelopeX, right);
      peakEnvelopeY = Math.max(peakEnvelopeY, y);
    }

    for (let index = 0; index < leftEnvelope.length - 1; index += 1) {
      lineCursor = setPooledLine(lines, lineCursor, leftEnvelope[index], leftEnvelope[index + 1]);
    }
    for (let index = 0; index < rightEnvelope.length - 1; index += 1) {
      lineCursor = setPooledLine(lines, lineCursor, rightEnvelope[index], rightEnvelope[index + 1]);
    }
    if (leftEnvelope.length > 1) {
      lineCursor = setPooledLine(lines, lineCursor, leftEnvelope[leftEnvelope.length - 1], rightEnvelope[rightEnvelope.length - 1]);
      lineCursor = setPooledLine(lines, lineCursor, leftEnvelope[0], rightEnvelope[0]);
      contourBridgeCount = 2;
    }

    if (sliceLineCount < 2 && leftEnvelope.length > 0 && rightEnvelope.length > 0) {
      const fallbackIndices = Array.from(new Set([
        0,
        Math.floor((leftEnvelope.length - 1) * 0.5),
        leftEnvelope.length - 1,
      ].filter((value) => value >= 0 && value < leftEnvelope.length)));
      for (const envelopeIndex of fallbackIndices) {
        if (sliceLineCount >= 2) break;
        lineCursor = setPooledLine(lines, lineCursor, leftEnvelope[envelopeIndex], rightEnvelope[envelopeIndex]);
        sliceLineCount += 1;
      }
      sliceCount = Math.max(sliceCount, sliceLineCount);
    }
  });

  const meshRows: VolumetricMeshRow[] = [];
  const meshThreshold = Math.max(sliceThreshold * 0.62, stats.maxDensity * 0.05);
  let meshBridgeLineCount = 0;
  let coreSpineSegments = 0;
  profilePayloadTask('mesh-lines', () => {
    for (let y = 1; y < state.config.resolutionY - 1; y += Math.max(1, Math.floor(state.config.resolutionY / 9))) {
      const row = buildMeshRow(state, y, meshThreshold);
      if (!row) continue;
      meshRows.push(row);
      lineCursor = setPooledLine(lines, lineCursor, row.left, row.innerLeft);
      lineCursor = setPooledLine(lines, lineCursor, row.innerLeft, row.center);
      lineCursor = setPooledLine(lines, lineCursor, row.center, row.innerRight);
      lineCursor = setPooledLine(lines, lineCursor, row.innerRight, row.right);
    }

    if (meshRows.length < 3) {
      for (let y = 1; y < state.config.resolutionY - 1 && meshRows.length < 3; y += 2) {
        const row = buildMeshRow(state, y, envelopeThreshold);
        if (!row) continue;
        meshRows.push(row);
        lineCursor = setPooledLine(lines, lineCursor, row.left, row.innerLeft);
        lineCursor = setPooledLine(lines, lineCursor, row.innerLeft, row.center);
        lineCursor = setPooledLine(lines, lineCursor, row.center, row.innerRight);
        lineCursor = setPooledLine(lines, lineCursor, row.innerRight, row.right);
      }
    }

    for (let index = 0; index < meshRows.length - 1; index += 1) {
      lineCursor = setPooledLine(lines, lineCursor, meshRows[index].left, meshRows[index + 1].left);
      lineCursor = setPooledLine(lines, lineCursor, meshRows[index].innerLeft, meshRows[index + 1].innerLeft);
      lineCursor = setPooledLine(lines, lineCursor, meshRows[index].center, meshRows[index + 1].center);
      lineCursor = setPooledLine(lines, lineCursor, meshRows[index].innerRight, meshRows[index + 1].innerRight);
      lineCursor = setPooledLine(lines, lineCursor, meshRows[index].right, meshRows[index + 1].right);
      lineCursor = setPooledLine(lines, lineCursor, meshRows[index].left, meshRows[index + 1].innerLeft);
      lineCursor = setPooledLine(lines, lineCursor, meshRows[index].innerLeft, meshRows[index + 1].center);
      lineCursor = setPooledLine(lines, lineCursor, meshRows[index].center, meshRows[index + 1].innerRight);
      lineCursor = setPooledLine(lines, lineCursor, meshRows[index].innerRight, meshRows[index + 1].right);
      meshBridgeLineCount += 9;
    }

    for (let index = 0; index < meshRows.length - 1; index += 1) {
      lineCursor = setPooledLine(lines, lineCursor, meshRows[index].center, meshRows[index + 1].center);
      coreSpineSegments += 1;
    }
  });
  const advancedStats = profilePayloadTask('advanced-stats', () => buildVolumetricAdvancedRenderStats({
    state,
    derived,
    stats,
    lines,
    lineCursor,
    samplePoints,
    pointCursor: samplePoints.length,
    meshRows,
    getScratchPoints,
  }));
  lines.length = advancedStats.lineCursor;
  samplePoints.length = advancedStats.pointCursor;

  const meshBandLineCount = meshRows.length * 4;
  const meshNodeCount = meshRows.length * 5;
  const meshLineCount = meshBandLineCount + meshBridgeLineCount + coreSpineSegments;
  const meshTriangleEstimate = Math.max(0, (meshRows.length - 1) * 8);
  const meshSpanMean = meshRows.length > 0 ? meshRows.reduce((sum, row) => sum + row.span, 0) / meshRows.length : 0;

  const enrichedStats: Record<string, number> = profilePayloadTask('enriched-stats', () => ({
    frame: state.frame,
    cells: stats.cells,
    totalDensity: stats.totalDensity,
    maxDensity: stats.maxDensity,
    centerOfMassX: stats.centerOfMassX,
    centerOfMassY: stats.centerOfMassY,
    meanSpeed: stats.meanSpeed,
    topBandDensity: stats.topBandDensity,
    bottomBandDensity: stats.bottomBandDensity,
    divergenceMean: stats.divergenceMean,
    edgeDensity: stats.edgeDensity,
    meanPressure: stats.meanPressure,
    maxPressure: stats.maxPressure,
    meanLighting: stats.meanLighting,
    litTopBand: stats.litTopBand,
    shadowMean: stats.shadowMean,
    meanObstacleMask: stats.meanObstacleMask,
    obstacleOccludedCells: stats.obstacleOccludedCells,
    primaryObstacleOccludedCells: stats.primaryObstacleOccludedCells,
    secondaryObstacleOccludedCells: stats.secondaryObstacleOccludedCells,
    multiObstacleCellCount: stats.multiObstacleCellCount,
    multiObstacleOverlapCells: stats.multiObstacleOverlapCells,
    lightMarchMean: stats.lightMarchMean,
    lightMarchPeak: stats.lightMarchPeak,
    lightMarchSecondaryMean: stats.lightMarchSecondaryMean,
    lightMarchSecondaryPeak: stats.lightMarchSecondaryPeak,
    rimLightMean: stats.rimLightMean,
    rimLightPeak: stats.rimLightPeak,
    smokeLightScatter: state.config.smokeLightScatter,
    smokeScatterAnisotropy: state.config.smokeScatterAnisotropy,
    smokeRimBoost: state.config.smokeRimBoost,
    multiLightActiveCells: stats.multiLightActiveCells,
    multiLightBalanceMean: stats.multiLightBalanceMean,
    volumeDepthMean: stats.volumeDepthMean,
    volumeDepthPeak: stats.volumeDepthPeak,
    injectorCouplingMean: stats.injectorCouplingMean,
    injectorCouplingPeak: stats.injectorCouplingPeak,
    injectorSecondaryCells: stats.injectorSecondaryCells,
    injectorTertiaryCells: stats.injectorTertiaryCells,
    injectorCoupledCells: stats.injectorCoupledCells,
    wakeTurbulenceMean: stats.wakeTurbulenceMean,
    wakeTurbulencePeak: stats.wakeTurbulencePeak,
    layeredWakeActiveCells: stats.layeredWakeActiveCells,
    wakeLayerNearCells: stats.wakeLayerNearCells,
    wakeLayerMidCells: stats.wakeLayerMidCells,
    wakeLayerFarCells: stats.wakeLayerFarCells,
    vorticityConfinementMean: stats.vorticityConfinementMean,
    vorticityConfinementPeak: stats.vorticityConfinementPeak,
    vorticityConfinementCells: stats.vorticityConfinementCells,
    wakeRecirculationMean: stats.wakeRecirculationMean,
    wakeRecirculationPeak: stats.wakeRecirculationPeak,
    wakeRecirculationCells: stats.wakeRecirculationCells,
    wakeRecirculationNearCells: stats.wakeRecirculationNearCells,
    wakeRecirculationFarCells: stats.wakeRecirculationFarCells,
    shearLayerRollupMean: stats.shearLayerRollupMean,
    shearLayerRollupPeak: stats.shearLayerRollupPeak,
    shearLayerRollupCells: stats.shearLayerRollupCells,
    recirculationPocketCells: stats.recirculationPocketCells,
    recirculationPocketLeftCells: stats.recirculationPocketLeftCells,
    recirculationPocketRightCells: stats.recirculationPocketRightCells,
    sliceCount,
    sliceLineCount,
    billowContourPoints: leftEnvelope.length + rightEnvelope.length,
    billowSpanX: Math.max(0, maxEnvelopeX - minEnvelopeX),
    billowHeightRange: peakEnvelopeY,
    densityThreshold: sliceThreshold,
    contourBridgeCount,
    meshRowCount: meshRows.length,
    meshNodeCount,
    meshLineCount,
    meshBandLineCount,
    meshBridgeLineCount,
    meshTriangleEstimate,
    coreSpineSegments,
    meshSpanMean,
    obstacleMaskCellCount: stats.obstacleOccludedCells,
    obstacleBoundaryLineCount: advancedStats.obstacleBoundaryLineCount,
    secondaryObstacleMaskCellCount: stats.secondaryObstacleOccludedCells,
    secondaryObstacleBoundaryLineCount: advancedStats.secondaryObstacleBoundaryLineCount,
    obstacleBridgeLineCount: advancedStats.obstacleBridgeLineCount,
    multiObstacleModeCount: 2,
    lightMarchLineCount: advancedStats.lightMarchLineCount,
    lightMarchSampleCount: advancedStats.lightMarchSampleCount,
    secondaryLightMarchLineCount: advancedStats.secondaryLightMarchLineCount,
    secondaryLightMarchSampleCount: advancedStats.secondaryLightMarchSampleCount,
    multiLightBridgeLineCount: advancedStats.multiLightBridgeLineCount,
    lightSplitModeCount: 2,
    tripleLightInterferenceMean: stats.tripleLightInterferenceMean,
    tripleLightInterferencePeak: stats.tripleLightInterferencePeak,
    tripleLightInterferenceCells: stats.tripleLightInterferenceCells,
    tripleLightInterferenceLineCount: advancedStats.tripleLightInterferenceLineCount,
    tripleLightBridgeLineCount: advancedStats.tripleLightBridgeLineCount,
    tripleLightModeCount: advancedStats.tripleLightModeCount,
    lightTriadLayerMean: stats.lightTriadLayerMean,
    lightTriadLayerPeak: stats.lightTriadLayerPeak,
    lightTriadLayerActiveCells: stats.lightTriadLayerActiveCells,
    lightTriadLayerNearCells: stats.lightTriadLayerNearCells,
    lightTriadLayerMidCells: stats.lightTriadLayerMidCells,
    lightTriadLayerFarCells: stats.lightTriadLayerFarCells,
    lightTriadLayerLineCount: advancedStats.lightTriadLayerLineCount,
    lightTriadLayerBridgeLineCount: advancedStats.lightTriadLayerBridgeLineCount,
    lightTriadLayerModeCount: advancedStats.lightTriadLayerModeCount,
    plumeAnisotropyMean: stats.plumeAnisotropyMean,
    plumeAnisotropyPeak: stats.plumeAnisotropyPeak,
    plumeBranchLeftCells: stats.plumeBranchLeftCells,
    plumeBranchRightCells: stats.plumeBranchRightCells,
    plumeBranchActiveCells: stats.plumeBranchActiveCells,
    plumeBranchBalanceMean: stats.plumeBranchBalanceMean,
    anisotropicPlumeLineCount: advancedStats.anisotropicPlumeLineCount,
    plumeBranchBridgeLineCount: advancedStats.plumeBranchBridgeLineCount,
    anisotropicPlumeCentroidCount: advancedStats.anisotropicPlumeCentroidCount,
    anisotropicPlumeModeCount: advancedStats.anisotropicPlumeModeCount,
    obstacleWakeMean: stats.obstacleWakeMean,
    obstacleWakePeak: stats.obstacleWakePeak,
    obstacleWakeCells: stats.obstacleWakeCells,
    primaryObstacleWakeMean: stats.primaryObstacleWakeMean,
    secondaryObstacleWakeMean: stats.secondaryObstacleWakeMean,
    primaryObstacleWakeCells: stats.primaryObstacleWakeCells,
    secondaryObstacleWakeCells: stats.secondaryObstacleWakeCells,
    obstacleWakeLineCount: advancedStats.obstacleWakeLineCount,
    obstacleWakeContourPoints: advancedStats.obstacleWakeContourPoints,
    obstacleWakeBridgeLineCount: advancedStats.obstacleWakeBridgeLineCount,
    obstacleWakeModeCount: advancedStats.obstacleWakeModeCount,
    injectorCouplingLineCount: advancedStats.injectorCouplingLineCount,
    injectorBridgeLineCount: advancedStats.injectorBridgeLineCount,
    injectorCentroidCount: advancedStats.injectorCentroidCount,
    injectorModeCount: advancedStats.injectorModeCount,
    layeredWakeLineCount: advancedStats.layeredWakeLineCount,
    layeredWakeBridgeLineCount: advancedStats.layeredWakeBridgeLineCount,
    layeredWakeContourPoints: advancedStats.layeredWakeContourPoints,
    layeredWakeModeCount: advancedStats.layeredWakeModeCount,
    vorticityConfinementLineCount: advancedStats.vorticityConfinementLineCount,
    vorticityBridgeLineCount: advancedStats.vorticityBridgeLineCount,
    vorticityConfinementCentroidCount: advancedStats.vorticityConfinementCentroidCount,
    shearLayerRollupLineCount: advancedStats.shearLayerRollupLineCount,
    shearLayerBridgeLineCount: advancedStats.shearLayerBridgeLineCount,
    shearLayerModeCount: advancedStats.shearLayerModeCount,
    vortexPacketCells: stats.vortexPacketCells,
    vortexPacketLeftCells: stats.vortexPacketLeftCells,
    vortexPacketRightCells: stats.vortexPacketRightCells,
    vortexPacketPeak: stats.vortexPacketPeak,
    vortexPacketLineCount: advancedStats.vortexPacketLineCount,
    vortexPacketBridgeLineCount: advancedStats.vortexPacketBridgeLineCount,
    vortexPacketModeCount: advancedStats.vortexPacketModeCount,
    vortexPacketLayerMean: stats.vortexPacketLayerMean,
    vortexPacketLayerPeak: stats.vortexPacketLayerPeak,
    vortexPacketLayerActiveCells: stats.vortexPacketLayerActiveCells,
    vortexPacketLayerNearCells: stats.vortexPacketLayerNearCells,
    vortexPacketLayerMidCells: stats.vortexPacketLayerMidCells,
    vortexPacketLayerFarCells: stats.vortexPacketLayerFarCells,
    vortexPacketLayerLineCount: advancedStats.vortexPacketLayerLineCount,
    vortexPacketLayerBridgeLineCount: advancedStats.vortexPacketLayerBridgeLineCount,
    vortexPacketLayerModeCount: advancedStats.vortexPacketLayerModeCount,
    wakeRecirculationShellLineCount: advancedStats.wakeRecirculationShellLineCount,
    wakeRecirculationBridgeLineCount: advancedStats.wakeRecirculationBridgeLineCount,
    wakeRecirculationContourPoints: advancedStats.wakeRecirculationContourPoints,
    wakeRecirculationModeCount: advancedStats.wakeRecirculationModeCount,
    recirculationPocketLineCount: advancedStats.recirculationPocketLineCount,
    recirculationPocketBridgeLineCount: advancedStats.recirculationPocketBridgeLineCount,
    recirculationPocketModeCount: advancedStats.recirculationPocketModeCount,
    volumeLayerPointCount: advancedStats.volumeLayerPointCount,
    volumeLayerLineCount: advancedStats.volumeLayerLineCount,
    volumeDepthLayerCount: advancedStats.volumeDepthLayerCount,
    volumeDepthRange: advancedStats.volumeDepthRange,
  }));

  payload.summary = `cells:${stats.cells} density:${stats.totalDensity.toFixed(3)} light:${stats.meanLighting.toFixed(3)} obstacle:${stats.primaryObstacleOccludedCells}/${stats.secondaryObstacleOccludedCells} split:${stats.multiLightActiveCells}/${advancedStats.tripleLightModeCount}/${advancedStats.lightTriadLayerModeCount} plume:${advancedStats.anisotropicPlumeModeCount} injector:${advancedStats.injectorModeCount} wake:${advancedStats.layeredWakeModeCount} vortex:${advancedStats.vorticityConfinementCentroidCount > 0 ? 1 : 0}/${advancedStats.vortexPacketModeCount}/${advancedStats.vortexPacketLayerModeCount} rollup:${advancedStats.shearLayerModeCount} recirc:${advancedStats.wakeRecirculationModeCount}/${advancedStats.recirculationPocketModeCount} mesh:${meshRows.length} volume:${advancedStats.volumeDepthLayerCount}`;
  payload.lines = lines;
  payload.scalarSamples[0] = stats.totalDensity;
  payload.scalarSamples[1] = stats.topBandDensity;
  payload.scalarSamples[2] = stats.divergenceMean;
  payload.scalarSamples[3] = stats.maxPressure;
  payload.scalarSamples[4] = stats.meanLighting;
  payload.scalarSamples[5] = stats.shadowMean;
  payload.scalarSamples[6] = stats.lightMarchMean;
  payload.scalarSamples[7] = stats.lightMarchSecondaryMean;
  payload.scalarSamples[8] = stats.plumeAnisotropyMean;
  payload.scalarSamples[9] = stats.obstacleWakeMean;
  payload.scalarSamples[10] = stats.plumeBranchActiveCells;
  payload.scalarSamples[11] = stats.injectorCoupledCells;
  payload.scalarSamples[12] = stats.wakeLayerFarCells;
  payload.scalarSamples[13] = stats.vorticityConfinementMean;
  payload.scalarSamples[14] = stats.wakeRecirculationMean;
  payload.scalarSamples[15] = stats.shearLayerRollupMean;
  payload.scalarSamples[16] = stats.tripleLightInterferenceMean;
  payload.scalarSamples[17] = stats.vortexPacketCells;
  payload.scalarSamples[18] = stats.recirculationPocketCells;
  payload.scalarSamples[19] = stats.obstacleOccludedCells;
  payload.scalarSamples[20] = advancedStats.volumeDepthRange;
  payload.scalarSamples.length = 21;
  syncStatsObject(payload.stats, enrichedStats);
  return payload;
}
