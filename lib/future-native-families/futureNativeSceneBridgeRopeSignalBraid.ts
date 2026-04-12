import { buildRopeAugmentation, clampRopeBundleOffset, type RopeMetricMap, type RopePoint, type RopeRouteContext } from "./futureNativeSceneBridgeRopeShared";
import { buildRopeExtendedRefinements, collectRopeRefinementPoints, type RopeRefinementProfile } from "./futureNativeSceneBridgeRopeRefinements";
import type { FutureNativeRopeDescriptorAugmentation } from "./futureNativeSceneBridgeTypes";

const SIGNAL_BRAID_PROFILE: RopeRefinementProfile = {
  knotShellClusterX: 0.7,
  knotShellClusterY: 0.5,
  knotShellClusterZ: 0,
  looseEndTurbulenceY: 1.25,
  snapPhaseShellY: 0.9,
  tensionFieldBraidY: 0.22,
  breakShellRefinementY: 0.95,
  breakShellRefinementZ: 0.35,
  entanglementSplitX: 0.8,
  entanglementSplitY: 0.4,
  entanglementSplitZ: 0.6,
  knotTurbulenceY: 0.52,
  knotTurbulenceZ: 0.28,
  breakFieldBraidY: 0.46,
  breakFieldBraidZ: 0.45,
  shellFieldCouplingY: 0.28,
  looseEndWakeX: 0.72,
  looseEndWakeY: 0.52,
  looseEndWakeZ: 0.48,
  knotWakeY: 0.42,
  breakShellFieldY: 0.38,
  shellWakeBraidY: 0.34,
  shellWakeBraidZ: 0.26,
  breakFieldTurbulenceY: 0.31,
  knotShellWakeY: 0.29,
  knotShellWakeZ: 0.18,
  breakFieldShellY: 0.27,
  wakeShellTurbulenceY: 0.24,
  wakeShellTurbulenceZ: 0.16,
  breakFieldWakeY: 0.23,
  knotWakeShellY: 0.21,
  knotWakeShellZ: 0.14,
  breakFieldWakeTurbulenceY: 0.19,
  shellWakeFieldY: 0.17,
  shellWakeFieldZ: 0.12,
  breakFieldWakeShellY: 0.15,
  knotShellWakeFieldY: 0.13,
  knotShellWakeFieldZ: 0.1,
  breakFieldWakeShellTurbulenceY: 0.11,
  shellWakeFieldBraidY: 0.09,
  shellWakeFieldBraidZ: 0.08,
  breakFieldWakeShellFieldY: 0.07,
  knotShellWakeFieldBraidY: 0.08,
  knotShellWakeFieldBraidZ: 0.06,
  breakFieldWakeShellFieldTurbulenceY: 0.06,
  shellWakeFieldBraidTurbulenceY: 0.05,
  shellWakeFieldBraidTurbulenceZ: 0.04,
  breakFieldWakeShellFieldTurbulenceSplitY: 0.04,
  knotShellWakeFieldBraidTurbulenceY: 0.035,
  knotShellWakeFieldBraidTurbulenceZ: 0.03,
  breakFieldWakeShellFieldTurbulenceFieldY: 0.03,
};

export function buildSignalBraidRopePayload(
  context: RopeRouteContext,
): FutureNativeRopeDescriptorAugmentation {
  const {
    basePayload,
    basePoints,
    restLength,
    segmentCount,
    framePhase,
    buildTangentFrame,
  } = context;
  const amplitude = clampRopeBundleOffset(restLength * 0.44, 0.014, 0.048);
  const depthAmplitude = amplitude * 0.9;
  const twistCount = Math.max(3, Math.round(segmentCount / 7));
  const strandPointSets: [RopePoint[], RopePoint[]] = [[], []];
  for (let index = 0; index < basePoints.length; index += 1) {
    const point = basePoints[index];
    const { nx, ny } = buildTangentFrame(index);
    const progress = index / segmentCount;
    const phase = progress * Math.PI * twistCount * 2 + framePhase;
    const braidOffset = Math.sin(phase) * amplitude;
    const depth = Math.cos(phase) * depthAmplitude;
    strandPointSets[0].push({
      x: point.x + nx * braidOffset,
      y: point.y + ny * braidOffset,
      z: depth,
    });
    strandPointSets[1].push({
      x: point.x - nx * braidOffset,
      y: point.y - ny * braidOffset,
      z: -depth,
    });
  }

  const lines = [];
  for (const strand of strandPointSets) {
    for (let index = 0; index < strand.length - 1; index += 1) {
      lines.push({ a: strand[index], b: strand[index + 1] });
    }
  }
  let braidCrossLinks = 0;
  for (let index = 0; index < basePoints.length; index += 3) {
    lines.push({ a: strandPointSets[0][index], b: strandPointSets[1][index] });
    braidCrossLinks += 1;
  }

  const knotRadius = clampRopeBundleOffset(amplitude * 0.72, 0.008, 0.028);
  const knotSegments = 8;
  const knotPoints: RopePoint[] = [];
  const tensionPoints: RopePoint[] = [];
  const tensionFieldPoints: RopePoint[] = [];
  const snapPoints: RopePoint[] = [];
  const snapClusterPoints: RopePoint[] = [];
  const breakClusterPoints: RopePoint[] = [];
  const looseEndFieldPoints: RopePoint[] = [];
  const entanglementShellPoints: RopePoint[] = [];
  let knotLoopCount = 0;
  let tangleLinkCount = 0;
  let tensionBandCount = 0;
  let tensionStrandCount = 0;
  let sagArcCount = 0;
  let snapMarkerCount = 0;
  let tensionFieldLayerCount = 0;
  let snapStateClusterCount = 0;
  let breakClusterLayerCount = 0;
  let looseEndFieldSplitCount = 0;
  let entanglementShellLayerCount = 0;

  for (let index = 2; index < basePoints.length - 2; index += 6) {
    const a = strandPointSets[0][index];
    const b = strandPointSets[1][index];
    const center = {
      x: (a.x + b.x) * 0.5,
      y: (a.y + b.y) * 0.5,
      z: (a.z + b.z) * 0.5,
    };
    const { tx, ty, nx, ny } = buildTangentFrame(index);
    const loopStart = knotPoints.length;
    for (let segment = 0; segment < knotSegments; segment += 1) {
      const angle = (segment / knotSegments) * Math.PI * 2;
      const radial = Math.cos(angle) * knotRadius;
      const tangential = Math.sin(angle) * knotRadius * 0.7;
      knotPoints.push({
        x: center.x + nx * radial + tx * tangential,
        y: center.y + ny * radial + ty * tangential,
        z: center.z + Math.sin(angle * 2 + framePhase * 0.5) * knotRadius * 0.55,
      });
    }
    for (let segment = 0; segment < knotSegments; segment += 1) {
      lines.push({
        a: knotPoints[loopStart + segment],
        b: knotPoints[loopStart + ((segment + 1) % knotSegments)],
      });
    }
    lines.push({ a, b: knotPoints[loopStart] });
    lines.push({ a: b, b: knotPoints[loopStart + Math.floor(knotSegments / 2)] });
    knotLoopCount += 1;
    tangleLinkCount += 2;
    tensionBandCount += 1;
  }

  for (let index = 3; index < basePoints.length - 1; index += 4) {
    lines.push({ a: strandPointSets[0][index], b: strandPointSets[1][index + 1] });
    lines.push({ a: strandPointSets[1][index], b: strandPointSets[0][index + 1] });
    tangleLinkCount += 2;
    tensionBandCount += 1;
  }

  for (let index = 1; index < basePoints.length - 1; index += 5) {
    const left = strandPointSets[0][index];
    const right = strandPointSets[1][index];
    const center = {
      x: (left.x + right.x) * 0.5,
      y: (left.y + right.y) * 0.5 - amplitude * 0.7,
      z: (left.z + right.z) * 0.5,
    };
    tensionPoints.push(center);
    lines.push({ a: left, b: center });
    lines.push({ a: center, b: right });
    tensionStrandCount += 2;
    sagArcCount += 1;
  }

  for (let index = 0; index < tensionPoints.length; index += 1) {
    const center = tensionPoints[index];
    const sourceIndex = Math.min(basePoints.length - 2, 1 + index * 5);
    const { tx } = buildTangentFrame(sourceIndex);
    let previousLayerPoint: RopePoint | null = null;
    for (const offset of [amplitude * 0.35, amplitude * 0.65, amplitude * 0.95]) {
      const layerPoint = {
        x: center.x + tx * offset,
        y: center.y - offset * 0.42,
        z: center.z + offset * 0.35,
      };
      tensionFieldPoints.push(layerPoint);
      lines.push({ a: center, b: layerPoint });
      if (previousLayerPoint) lines.push({ a: previousLayerPoint, b: layerPoint });
      previousLayerPoint = layerPoint;
    }
    tensionFieldLayerCount += 3;
  }

  const snapSize = clampRopeBundleOffset(amplitude * 0.44, 0.005, 0.018);
  for (let index = 4; index < basePoints.length - 2; index += 7) {
    const a = strandPointSets[0][index];
    const b = strandPointSets[1][index];
    const center = {
      x: (a.x + b.x) * 0.5,
      y: (a.y + b.y) * 0.5,
      z: (a.z + b.z) * 0.5,
    };
    const markerA = { x: center.x - snapSize, y: center.y - snapSize, z: center.z };
    const markerB = { x: center.x + snapSize, y: center.y + snapSize, z: center.z };
    const markerC = { x: center.x - snapSize, y: center.y + snapSize, z: center.z };
    const markerD = { x: center.x + snapSize, y: center.y - snapSize, z: center.z };
    snapPoints.push(markerA, markerB, markerC, markerD);
    lines.push({ a: markerA, b: markerB });
    lines.push({ a: markerC, b: markerD });
    const cluster = { x: center.x, y: center.y + snapSize * 1.4, z: center.z };
    snapClusterPoints.push(cluster);
    lines.push({ a: cluster, b: markerA });
    lines.push({ a: cluster, b: markerB });
    lines.push({ a: cluster, b: markerC });
    lines.push({ a: cluster, b: markerD });
    snapMarkerCount += 1;
    snapStateClusterCount += 1;
    let previousBreakPoint: RopePoint | null = null;
    for (const breakOffset of [snapSize * 1.6, snapSize * 2.2]) {
      const breakPoint = {
        x: center.x,
        y: center.y + breakOffset,
        z: center.z + breakOffset * 0.35,
      };
      breakClusterPoints.push(breakPoint);
      lines.push({ a: cluster, b: breakPoint });
      if (previousBreakPoint) lines.push({ a: previousBreakPoint, b: breakPoint });
      previousBreakPoint = breakPoint;
    }
    breakClusterLayerCount += 2;
    const looseLeft = {
      x: a.x - snapSize * 1.5,
      y: a.y - snapSize * 1.2,
      z: a.z + snapSize * 0.4,
    };
    const looseRight = {
      x: b.x + snapSize * 1.5,
      y: b.y - snapSize * 1.2,
      z: b.z - snapSize * 0.4,
    };
    looseEndFieldPoints.push(looseLeft, looseRight);
    lines.push({ a: markerA, b: looseLeft });
    lines.push({ a: markerB, b: looseRight });
    lines.push({ a: looseLeft, b: cluster });
    lines.push({ a: looseRight, b: cluster });
    looseEndFieldSplitCount += 2;
  }

  for (let index = 0; index < knotPoints.length; index += knotSegments) {
    const shellA = knotPoints[index];
    const shellB = knotPoints[index + Math.floor(knotSegments / 2)];
    if (!shellA || !shellB) continue;
    const shellPeak = {
      x: (shellA.x + shellB.x) * 0.5,
      y: (shellA.y + shellB.y) * 0.5 + knotRadius * 0.9,
      z: (shellA.z + shellB.z) * 0.5,
    };
    entanglementShellPoints.push(shellPeak);
    lines.push({ a: shellA, b: shellPeak });
    lines.push({ a: shellB, b: shellPeak });
    entanglementShellLayerCount += 1;
  }

  const refinements = buildRopeExtendedRefinements({
    snapSize,
    lines,
    tensionFieldPoints,
    snapClusterPoints,
    breakClusterPoints,
    looseEndFieldPoints,
    entanglementShellPoints,
    profile: SIGNAL_BRAID_PROFILE,
    resolvers: {
      resolveShellField: (index) =>
        tensionFieldPoints[index] ?? tensionPoints[index] ?? knotPoints[index * knotSegments] ?? null,
      resolveShellWakeField: (index) => tensionFieldPoints[index] ?? null,
      resolveBreakFieldWakeShellSource: (index) => entanglementShellPoints[index] ?? null,
      resolveKnotShellWakeFieldSource: (index, state) =>
        state.shellWakeFieldRefinementPoints[index] ?? null,
      resolveWakeShellTurbulenceSource: (index, state) =>
        state.wakeShellTurbulenceRefinementPoints[index] ?? null,
      resolveShellWakeFieldBraidSource: (index, state) =>
        state.tensionFieldBraidPoints[index] ?? null,
      resolveBreakFieldWakeShellFieldSource: (index, state) =>
        state.shellWakeFieldRefinementPoints[index] ?? null,
      resolveKnotShellWakeFieldBraidSource: (index, state) =>
        state.shellWakeFieldBraidRefinementPoints[index] ?? null,
      resolveBreakFieldWakeShellFieldTurbulenceSource: (index, state) =>
        state.wakeShellTurbulenceRefinementPoints[index] ?? null,
    },
  });

  const routeMetrics: RopeMetricMap = {
    strandCount: 2,
    bundlePointCount:
      strandPointSets.flat().length +
      knotPoints.length +
      tensionPoints.length +
      tensionFieldPoints.length +
      snapPoints.length +
      snapClusterPoints.length +
      breakClusterPoints.length +
      looseEndFieldPoints.length +
      entanglementShellPoints.length +
      collectRopeRefinementPoints(refinements.state).length,
    bundleLineCount: lines.length,
    braidCrossLinks,
    knotLoopCount,
    tangleLinkCount,
    tensionBandCount,
    tensionStrandCount,
    sagArcCount,
    snapMarkerCount,
    tensionFieldLayerCount,
    snapStateClusterCount,
    breakClusterLayerCount,
    looseEndFieldSplitCount,
    entanglementShellLayerCount,
  };
  const points = [
    ...strandPointSets.flat(),
    ...knotPoints,
    ...tensionPoints,
    ...tensionFieldPoints,
    ...snapPoints,
    ...snapClusterPoints,
    ...breakClusterPoints,
    ...looseEndFieldPoints,
    ...entanglementShellPoints,
    ...collectRopeRefinementPoints(refinements.state),
  ];
  routeMetrics.bundlePointCount = points.length;

  return buildRopeAugmentation({
    basePayload,
    points,
    lines,
    routeSummaryTokens: [
      "braid2",
      `knot${knotLoopCount}`,
      `tangle${tangleLinkCount}`,
      `sag${sagArcCount}`,
      `snap${snapMarkerCount}`,
      `field${tensionFieldLayerCount}`,
      `cluster${snapStateClusterCount}`,
      `break${breakClusterLayerCount}`,
      `loose${looseEndFieldSplitCount}`,
      `shell${entanglementShellLayerCount}`,
    ],
    routeMetrics,
    refinementMetrics: refinements.metrics,
    extraMetrics: { bundleDepthRange: depthAmplitude * 2 },
  });
}
