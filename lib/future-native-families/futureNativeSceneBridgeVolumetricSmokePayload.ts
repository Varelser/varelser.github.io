import type { FutureNativeRenderPayload, FutureNativeDebugLine, FutureNativeDebugPoint } from './starter-runtime/runtimeContracts';
import { deriveVolumetricDensityTransportFields, getVolumetricDensityTransportStats, type VolumetricDensityTransportRuntimeState } from './starter-runtime/volumetric_density_transportSolver';
import { buildShadedPoint, centroidOfPoints, collectFieldPeakLine } from './starter-runtime/volumetric_density_transportRendererShared';

function clampControl(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function appendPolyline(lines: FutureNativeDebugLine[], points: readonly FutureNativeDebugPoint[]): number {
  let count = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    lines.push({ a: points[index], b: points[index + 1] });
    count += 1;
  }
  return count;
}

function appendPolylineBridges(
  lines: FutureNativeDebugLine[],
  aPoints: readonly FutureNativeDebugPoint[],
  bPoints: readonly FutureNativeDebugPoint[],
  maxBridges: number,
): number {
  const bridgeable = Math.min(aPoints.length, bPoints.length);
  if (bridgeable <= 0) return 0;
  const bridgeCount = Math.min(maxBridges, bridgeable);
  let count = 0;
  for (let step = 0; step < bridgeCount; step += 1) {
    const index = Math.min(bridgeable - 1, Math.round((bridgeable - 1) * (bridgeCount <= 1 ? 0 : step / (bridgeCount - 1))));
    lines.push({ a: aPoints[index], b: bPoints[index] });
    count += 1;
  }
  return count;
}

function buildInjectorRibbonPack(
  runtime: VolumetricDensityTransportRuntimeState,
  lines: FutureNativeDebugLine[],
  points: FutureNativeDebugPoint[],
) {
  const derived = deriveVolumetricDensityTransportFields(runtime);
  const stats = getVolumetricDensityTransportStats(runtime);
  const injectorBias = clampControl(runtime.config.smokeInjectorBias ?? 0.5, 0, 1.5);
  const injectorThreshold = Math.max(0.06, stats.injectorCouplingMean * (0.72 - injectorBias * 0.18), 0.04);
  const secondaryRibbon = collectFieldPeakLine(runtime, derived.injectorSecondary, injectorThreshold, 0, runtime.config.resolutionX - 1);
  const couplingRibbon = collectFieldPeakLine(runtime, derived.injectorCoupling, Math.max(0.12, stats.injectorCouplingMean * 1.05, 0.08), 0, runtime.config.resolutionX - 1);
  const tertiaryRibbon = collectFieldPeakLine(runtime, derived.injectorTertiary, injectorThreshold, 0, runtime.config.resolutionX - 1);
  let smokeInjectorRibbonLineCount = 0;
  smokeInjectorRibbonLineCount += appendPolyline(lines, secondaryRibbon);
  smokeInjectorRibbonLineCount += appendPolyline(lines, couplingRibbon);
  smokeInjectorRibbonLineCount += appendPolyline(lines, tertiaryRibbon);
  const bridgeBudget = Math.max(2, Math.min(5, Math.round(2 + injectorBias * 2)));
  let smokeInjectorBridgeLineCount = 0;
  smokeInjectorBridgeLineCount += appendPolylineBridges(lines, secondaryRibbon, couplingRibbon, bridgeBudget);
  smokeInjectorBridgeLineCount += appendPolylineBridges(lines, couplingRibbon, tertiaryRibbon, bridgeBudget);
  smokeInjectorRibbonLineCount += smokeInjectorBridgeLineCount;
  const centroids = [
    centroidOfPoints([...secondaryRibbon]),
    centroidOfPoints([...couplingRibbon]),
    centroidOfPoints([...tertiaryRibbon]),
  ].filter((point): point is FutureNativeDebugPoint => point !== null);
  points.push(...centroids);
  const smokeInjectorModeCount =
    Number(secondaryRibbon.length > 0) +
    Number(couplingRibbon.length > 0) +
    Number(tertiaryRibbon.length > 0);
  return {
    derived,
    stats,
    smokeInjectorRibbonLineCount,
    smokeInjectorBridgeLineCount,
    smokeInjectorCentroidCount: centroids.length,
    smokeInjectorModeCount,
  };
}

function buildPrismRefractionPack(
  runtime: VolumetricDensityTransportRuntimeState,
  derived: ReturnType<typeof deriveVolumetricDensityTransportFields>,
  stats: ReturnType<typeof getVolumetricDensityTransportStats>,
  lines: FutureNativeDebugLine[],
  points: FutureNativeDebugPoint[],
) {
  const prismSeparation = clampControl(runtime.config.smokePrismSeparation ?? 0.5, 0, 1.5);
  const threshold = Math.max(stats.lightTriadLayerMean * (0.96 - prismSeparation * 0.12), 0.008);
  const nearRibbon = collectFieldPeakLine(runtime, derived.lightTriadLayerNear, threshold, 0, runtime.config.resolutionX - 1);
  const midRibbon = collectFieldPeakLine(runtime, derived.lightTriadLayerMid, Math.max(threshold * (0.84 - prismSeparation * 0.04), 0.008), 0, runtime.config.resolutionX - 1);
  const farRibbon = collectFieldPeakLine(runtime, derived.lightTriadLayerFar, Math.max(threshold * (0.72 - prismSeparation * 0.05), 0.007), 0, runtime.config.resolutionX - 1);
  let prismRefractionLineCount = 0;
  prismRefractionLineCount += appendPolyline(lines, nearRibbon);
  prismRefractionLineCount += appendPolyline(lines, midRibbon);
  prismRefractionLineCount += appendPolyline(lines, farRibbon);
  let prismRefractionBridgeLineCount = 0;
  const bridgeBudget = Math.max(2, Math.min(5, Math.round(2 + prismSeparation * 2)));
  prismRefractionBridgeLineCount += appendPolylineBridges(lines, nearRibbon, midRibbon, bridgeBudget);
  prismRefractionBridgeLineCount += appendPolylineBridges(lines, midRibbon, farRibbon, bridgeBudget);
  prismRefractionLineCount += prismRefractionBridgeLineCount;
  const centroids = [
    centroidOfPoints([...nearRibbon]),
    centroidOfPoints([...midRibbon]),
    centroidOfPoints([...farRibbon]),
  ].filter((point): point is FutureNativeDebugPoint => point !== null);
  points.push(...centroids);
  return {
    prismRefractionLineCount,
    prismRefractionBridgeLineCount,
    prismRefractionCentroidCount: centroids.length,
    prismRefractionModeCount:
      Number(nearRibbon.length > 0) +
      Number(midRibbon.length > 0) +
      Number(farRibbon.length > 0),
  };
}

function buildStaticPersistencePack(
  runtime: VolumetricDensityTransportRuntimeState,
  lines: FutureNativeDebugLine[],
  points: FutureNativeDebugPoint[],
) {
  const width = runtime.config.resolutionX;
  const height = runtime.config.resolutionY;
  const persistence = clampControl(runtime.config.smokePersistence ?? 0.5, 0, 1.5);
  const startY = Math.max(1, Math.floor(height * (0.14 + persistence * 0.05)));
  const endY = Math.max(startY + 2, Math.floor(height * (0.52 + persistence * 0.08)));
  const persistenceBands: FutureNativeDebugPoint[][] = [];
  for (let y = startY; y <= endY; y += Math.max(2, Math.floor(height / 7))) {
    const band: FutureNativeDebugPoint[] = [];
    for (let x = 1; x < width - 1; x += Math.max(2, Math.floor(width / 10))) {
      const index = y * width + x;
      const density = runtime.density[index];
      const shadow = runtime.shadow[index];
      if (density < Math.max(0.035, 0.06 - persistence * 0.012) || shadow < Math.max(0.06, 0.09 - persistence * 0.01) || runtime.obstacleMask[index] > 0.52) continue;
      const point = buildShadedPoint(runtime, x, y);
      point.z = (point.z ?? 0) + density * (0.16 + persistence * 0.04) + shadow * (0.1 + persistence * 0.03);
      band.push(point);
    }
    if (band.length >= 2) persistenceBands.push(band);
  }
  if (persistenceBands.length < 2) {
    const fallbackRows = [Math.floor(height * (0.26 + persistence * 0.03)), Math.floor(height * (0.44 + persistence * 0.04))];
    for (const y of fallbackRows) {
      if (persistenceBands.length >= 2) break;
      const band: FutureNativeDebugPoint[] = [];
      for (const ratio of [0.18, 0.38, 0.62, 0.82]) {
        const x = Math.max(1, Math.min(width - 2, Math.round((width - 1) * ratio)));
        const point = buildShadedPoint(runtime, x, y);
        point.z = (point.z ?? 0) + 0.1 + persistence * 0.06;
        band.push(point);
      }
      persistenceBands.push(band);
    }
  }
  let settledSlabPersistenceLineCount = 0;
  for (const band of persistenceBands) {
    settledSlabPersistenceLineCount += appendPolyline(lines, band);
  }
  let settledSlabBridgeLineCount = 0;
  for (let index = 0; index < persistenceBands.length - 1; index += 1) {
    settledSlabBridgeLineCount += appendPolylineBridges(lines, persistenceBands[index], persistenceBands[index + 1], 3);
  }
  settledSlabPersistenceLineCount += settledSlabBridgeLineCount;
  const centroids = persistenceBands
    .map((band) => centroidOfPoints([...band]))
    .filter((point): point is FutureNativeDebugPoint => point !== null);
  points.push(...centroids);
  return {
    settledSlabBandCount: persistenceBands.length,
    settledSlabPersistenceLineCount,
    settledSlabBridgeLineCount,
    settledSlabCentroidCount: centroids.length,
    settledShadowShelfCount: persistenceBands.filter((band) => band.some((point) => (point.z ?? 0) > 0.16 + persistence * 0.04)).length,
  };
}

export type FutureNativeVolumetricSmokeDescriptorAugmentation = {
  payload: FutureNativeRenderPayload;
  derivedStats: Record<string, number>;
};

export function buildFutureNativeVolumetricSmokePayload(args: {
  runtime: VolumetricDensityTransportRuntimeState;
  routeTag: string;
  payload: FutureNativeRenderPayload;
}): FutureNativeVolumetricSmokeDescriptorAugmentation {
  const { runtime, routeTag, payload } = args;
  const lines = [...(payload.lines ?? [])];
  const points = [...(payload.points ?? [])];
  const injectorPack = buildInjectorRibbonPack(runtime, lines, points);

  let summarySuffix = `smokeInject:${injectorPack.smokeInjectorModeCount}/${injectorPack.smokeInjectorRibbonLineCount}`;
  let routeStats: Record<string, number> = {};

  if (routeTag === 'future-native-volumetric-smoke-prism') {
    const prismPack = buildPrismRefractionPack(runtime, injectorPack.derived, injectorPack.stats, lines, points);
    routeStats = prismPack;
    summarySuffix += ` prism:${prismPack.prismRefractionModeCount}/${prismPack.prismRefractionLineCount}`;
  } else if (routeTag === 'future-native-volumetric-smoke-static') {
    const staticPack = buildStaticPersistencePack(runtime, lines, points);
    routeStats = staticPack;
    summarySuffix += ` persist:${staticPack.settledSlabBandCount}/${staticPack.settledSlabPersistenceLineCount}`;
  }

  return {
    payload: {
      ...payload,
      summary: `${payload.summary} ${summarySuffix}`,
      points,
      lines,
      stats: {
        ...payload.stats,
        smokeInjectorRibbonLineCount: injectorPack.smokeInjectorRibbonLineCount,
        smokeInjectorBridgeLineCount: injectorPack.smokeInjectorBridgeLineCount,
        smokeInjectorCentroidCount: injectorPack.smokeInjectorCentroidCount,
        smokeInjectorModeCount: injectorPack.smokeInjectorModeCount,
        ...routeStats,
      },
    },
    derivedStats: {
      smokeInjectorRibbonLineCount: injectorPack.smokeInjectorRibbonLineCount,
      smokeInjectorBridgeLineCount: injectorPack.smokeInjectorBridgeLineCount,
      smokeInjectorCentroidCount: injectorPack.smokeInjectorCentroidCount,
      smokeInjectorModeCount: injectorPack.smokeInjectorModeCount,
      ...routeStats,
    },
  };
}
