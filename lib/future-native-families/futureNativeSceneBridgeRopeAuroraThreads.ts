import { buildRopeAugmentation, clampRopeBundleOffset, type RopeMetricMap, type RopePoint, type RopeRouteContext } from "./futureNativeSceneBridgeRopeShared";
import { buildRopeExtendedRefinements, type RopeRefinementProfile } from "./futureNativeSceneBridgeRopeRefinements";
import type { FutureNativeRopeDescriptorAugmentation } from "./futureNativeSceneBridgeTypes";

const AURORA_THREADS_PROFILE: RopeRefinementProfile = {
  knotShellClusterX: 1.1,
  knotShellClusterY: 1.1,
  knotShellClusterZ: 0.25,
  looseEndTurbulenceY: 1.2,
  snapPhaseShellY: 1,
  tensionFieldBraidY: 0.45,
  breakShellRefinementY: 0.9,
  breakShellRefinementZ: 0.3,
  entanglementSplitX: 0.9,
  entanglementSplitY: 0.35,
  entanglementSplitZ: 0.55,
  knotTurbulenceY: 0.92,
  knotTurbulenceZ: 0.34,
  breakFieldBraidY: 0.54,
  breakFieldBraidZ: 0.42,
  shellFieldCouplingY: 0.7,
  looseEndWakeX: 0.85,
  looseEndWakeY: 0.44,
  looseEndWakeZ: 0.52,
  knotWakeY: 0.5,
  breakShellFieldY: 0.46,
  shellWakeBraidY: 0.34,
  shellWakeBraidZ: 0.24,
  breakFieldTurbulenceY: 0.3,
  knotShellWakeY: 0.35,
  knotShellWakeZ: 0.2,
  breakFieldShellY: 0.29,
  wakeShellTurbulenceY: 0.26,
  wakeShellTurbulenceZ: 0.16,
  breakFieldWakeY: 0.24,
  knotWakeShellY: 0.22,
  knotWakeShellZ: 0.14,
  breakFieldWakeTurbulenceY: 0.2,
  shellWakeFieldY: 0.16,
  shellWakeFieldZ: 0.1,
  breakFieldWakeShellY: 0.14,
  knotShellWakeFieldY: 0.12,
  knotShellWakeFieldZ: 0.1,
  breakFieldWakeShellTurbulenceY: 0.1,
  shellWakeFieldBraidY: 0.08,
  shellWakeFieldBraidZ: 0.08,
  breakFieldWakeShellFieldY: 0.06,
  knotShellWakeFieldBraidY: 0.08,
  knotShellWakeFieldBraidZ: 0.06,
  breakFieldWakeShellFieldTurbulenceY: 0.06,
  shellWakeFieldBraidTurbulenceY: 0.05,
  shellWakeFieldBraidTurbulenceZ: 0.04,
  breakFieldWakeShellFieldTurbulenceSplitY: 0.04,
  knotShellWakeFieldBraidTurbulenceY: 0.03,
  knotShellWakeFieldBraidTurbulenceZ: 0.025,
  breakFieldWakeShellFieldTurbulenceFieldY: 0.025,
};

export function buildAuroraThreadsRopePayload(
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
  const strandCount = 4;
  const spread = clampRopeBundleOffset(restLength * 1.8, 0.05, 0.14);
  const waveAmplitude = clampRopeBundleOffset(restLength * 0.6, 0.02, 0.08);
  const canopyLift = clampRopeBundleOffset(restLength * 2.2, 0.08, 0.18);
  const depthSpacing = clampRopeBundleOffset(restLength * 0.72, 0.02, 0.07);
  const strandPointSets: RopePoint[][] = Array.from({ length: strandCount }, (): RopePoint[] => []);
  for (let index = 0; index < basePoints.length; index += 1) {
    const point = basePoints[index];
    const { nx, ny } = buildTangentFrame(index);
    const progress = index / segmentCount;
    const arch = Math.sin(progress * Math.PI) * canopyLift;
    for (let strandIndex = 0; strandIndex < strandCount; strandIndex += 1) {
      const strandNorm = strandIndex / (strandCount - 1) - 0.5;
      const lateralOffset = strandNorm * spread * 2;
      const wave =
        Math.sin(progress * Math.PI * 2.2 + framePhase * 0.8 + strandIndex * 0.7) *
        waveAmplitude;
      const liftBias = 0.78 + (0.22 - Math.abs(strandNorm) * 0.18);
      strandPointSets[strandIndex].push({
        x: point.x + nx * (lateralOffset + wave),
        y: point.y + ny * (lateralOffset + wave) + arch * liftBias,
        z:
          strandNorm * depthSpacing * 2 +
          Math.cos(progress * Math.PI * 1.6 + strandIndex * 0.45 + framePhase * 0.5) *
            depthSpacing,
      });
    }
  }

  const lines: Array<{ a: RopePoint; b: RopePoint }> = [];
  for (const strand of strandPointSets) {
    for (let index = 0; index < strand.length - 1; index += 1) {
      lines.push({ a: strand[index], b: strand[index + 1] });
    }
  }
  let canopyBridges = 0;
  for (let strandIndex = 0; strandIndex < strandPointSets.length - 1; strandIndex += 1) {
    for (let index = 0; index < basePoints.length; index += 5) {
      lines.push({
        a: strandPointSets[strandIndex][index],
        b: strandPointSets[strandIndex + 1][index],
      });
      canopyBridges += 1;
    }
  }

  const hierarchySpine: RopePoint[] = [];
  const hierarchyHalo: RopePoint[] = [];
  const sagPoints: RopePoint[] = [];
  const tensionFieldPoints: RopePoint[] = [];
  const snapPoints: RopePoint[] = [];
  const snapClusterPoints: RopePoint[] = [];
  const breakClusterPoints: RopePoint[] = [];
  const looseEndFieldPoints: RopePoint[] = [];
  const entanglementShellPoints: RopePoint[] = [];
  let hierarchyLinkCount = 0;
  let curtainRibCount = 0;
  let tensionStrandCount = 0;
  let sagArcCount = 0;
  let snapMarkerCount = 0;
  let tensionFieldLayerCount = 0;
  let snapStateClusterCount = 0;
  let breakClusterLayerCount = 0;
  let looseEndFieldSplitCount = 0;
  let entanglementShellLayerCount = 0;

  for (let index = 0; index < basePoints.length; index += 1) {
    const outerA = strandPointSets[0][index];
    const innerA = strandPointSets[1][index];
    const innerB = strandPointSets[2][index];
    const outerB = strandPointSets[3][index];
    hierarchySpine.push({
      x: (innerA.x + innerB.x) * 0.5,
      y: (innerA.y + innerB.y) * 0.5 + canopyLift * 0.12,
      z: (innerA.z + innerB.z) * 0.5,
    });
    hierarchyHalo.push({
      x: (outerA.x + outerB.x) * 0.5,
      y: (outerA.y + outerB.y) * 0.5 + canopyLift * 0.06,
      z: (outerA.z + outerB.z) * 0.5,
    });
  }
  for (let index = 0; index < hierarchySpine.length - 1; index += 1) {
    lines.push({ a: hierarchySpine[index], b: hierarchySpine[index + 1] });
    lines.push({ a: hierarchyHalo[index], b: hierarchyHalo[index + 1] });
    hierarchyLinkCount += 2;
  }
  for (let index = 0; index < basePoints.length; index += 4) {
    lines.push({ a: hierarchySpine[index], b: hierarchyHalo[index] });
    lines.push({ a: strandPointSets[0][index], b: hierarchyHalo[index] });
    lines.push({ a: strandPointSets[3][index], b: hierarchyHalo[index] });
    curtainRibCount += 3;
  }

  for (let index = 2; index < basePoints.length - 2; index += 5) {
    const spine = hierarchySpine[index];
    const halo = hierarchyHalo[index];
    const sag = {
      x: (spine.x + halo.x) * 0.5,
      y: Math.min(spine.y, halo.y) - canopyLift * 0.18,
      z: (spine.z + halo.z) * 0.5,
    };
    sagPoints.push(sag);
    lines.push({ a: spine, b: sag });
    lines.push({ a: sag, b: halo });
    tensionStrandCount += 2;
    sagArcCount += 1;
  }

  for (let index = 0; index < sagPoints.length; index += 1) {
    const sag = sagPoints[index];
    const sourceIndex = Math.min(basePoints.length - 2, 2 + index * 5);
    const { nx } = buildTangentFrame(sourceIndex);
    let previousLayerPoint: RopePoint | null = null;
    for (const offset of [canopyLift * 0.12, canopyLift * 0.2, canopyLift * 0.28]) {
      const layerPoint = {
        x: sag.x + nx * offset * 0.45,
        y: sag.y - offset * 0.36,
        z: sag.z + offset * 0.25,
      };
      tensionFieldPoints.push(layerPoint);
      lines.push({ a: sag, b: layerPoint });
      if (previousLayerPoint) lines.push({ a: previousLayerPoint, b: layerPoint });
      previousLayerPoint = layerPoint;
    }
    tensionFieldLayerCount += 3;
  }

  const snapSize = clampRopeBundleOffset(depthSpacing * 0.8, 0.006, 0.02);
  for (let index = 3; index < basePoints.length - 1; index += 6) {
    const halo = hierarchyHalo[index];
    const markerA = { x: halo.x - snapSize, y: halo.y, z: halo.z - snapSize };
    const markerB = { x: halo.x + snapSize, y: halo.y, z: halo.z + snapSize };
    const markerC = { x: halo.x - snapSize, y: halo.y, z: halo.z + snapSize };
    const markerD = { x: halo.x + snapSize, y: halo.y, z: halo.z - snapSize };
    snapPoints.push(markerA, markerB, markerC, markerD);
    lines.push({ a: markerA, b: markerB });
    lines.push({ a: markerC, b: markerD });
    const cluster = { x: halo.x, y: halo.y + snapSize * 1.4, z: halo.z };
    snapClusterPoints.push(cluster);
    lines.push({ a: cluster, b: markerA });
    lines.push({ a: cluster, b: markerB });
    lines.push({ a: cluster, b: markerC });
    lines.push({ a: cluster, b: markerD });
    snapMarkerCount += 1;
    snapStateClusterCount += 1;
    let previousBreakPoint: RopePoint | null = null;
    for (const breakOffset of [snapSize * 1.7, snapSize * 2.4]) {
      const breakPoint = {
        x: halo.x,
        y: halo.y + breakOffset,
        z: halo.z + breakOffset * 0.3,
      };
      breakClusterPoints.push(breakPoint);
      lines.push({ a: cluster, b: breakPoint });
      if (previousBreakPoint) lines.push({ a: previousBreakPoint, b: breakPoint });
      previousBreakPoint = breakPoint;
    }
    breakClusterLayerCount += 2;
    const looseLeft = {
      x: markerA.x - snapSize * 1.3,
      y: markerA.y - snapSize,
      z: markerA.z,
    };
    const looseRight = {
      x: markerB.x + snapSize * 1.3,
      y: markerB.y - snapSize,
      z: markerB.z,
    };
    looseEndFieldPoints.push(looseLeft, looseRight);
    lines.push({ a: markerA, b: looseLeft });
    lines.push({ a: markerB, b: looseRight });
    lines.push({ a: looseLeft, b: cluster });
    lines.push({ a: looseRight, b: cluster });
    looseEndFieldSplitCount += 2;
  }

  for (let index = 0; index < hierarchyHalo.length; index += 4) {
    const shellA = hierarchyHalo[index];
    const shellB = hierarchySpine[index];
    if (!shellA || !shellB) continue;
    const shellPeak = {
      x: (shellA.x + shellB.x) * 0.5,
      y: Math.max(shellA.y, shellB.y) + canopyLift * 0.16,
      z: (shellA.z + shellB.z) * 0.5,
    };
    entanglementShellPoints.push(shellPeak);
    lines.push({ a: shellA, b: shellPeak });
    lines.push({ a: shellB, b: shellPeak });
    entanglementShellLayerCount += 1;
  }

  const cyclic = <T,>(items: T[], index: number): T | null =>
    items.length > 0 ? items[index % items.length] : null;
  const spaced = <T,>(items: T[], index: number): T | null =>
    items[Math.min(index * 4, Math.max(0, items.length - 1))] ?? null;

  const refinements = buildRopeExtendedRefinements({
    snapSize,
    lines,
    tensionFieldPoints,
    snapClusterPoints,
    breakClusterPoints,
    looseEndFieldPoints,
    entanglementShellPoints,
    profile: AURORA_THREADS_PROFILE,
    resolvers: {
      resolveShellField: (index) =>
        tensionFieldPoints[index] ?? spaced(hierarchyHalo, index) ?? spaced(hierarchySpine, index),
      resolveShellWakeField: (index, state) =>
        state.shellFieldCouplingPoints[index] ?? cyclic(hierarchyHalo, index) ?? cyclic(hierarchySpine, index),
      resolveBreakFieldWakeShellSource: (index) =>
        entanglementShellPoints[index] ?? cyclic(hierarchyHalo, index) ?? cyclic(hierarchySpine, index),
      resolveKnotShellWakeFieldSource: (index, state) =>
        state.shellWakeFieldRefinementPoints[index] ??
        state.shellFieldCouplingPoints[index] ??
        cyclic(hierarchyHalo, index) ??
        cyclic(hierarchySpine, index),
      resolveWakeShellTurbulenceSource: (index, state) =>
        state.wakeShellTurbulenceRefinementPoints[index] ??
        state.looseEndTurbulencePoints[index] ??
        cyclic(hierarchyHalo, index),
      resolveShellWakeFieldBraidSource: (index, state) =>
        state.tensionFieldBraidPoints[index] ?? cyclic(hierarchyHalo, index) ?? cyclic(hierarchySpine, index),
      resolveBreakFieldWakeShellFieldSource: (index, state) =>
        state.shellWakeFieldRefinementPoints[index] ??
        state.shellFieldCouplingPoints[index] ??
        cyclic(hierarchyHalo, index) ??
        cyclic(hierarchySpine, index),
      resolveKnotShellWakeFieldBraidSource: (index, state) =>
        state.shellWakeFieldBraidRefinementPoints[index] ??
        state.shellWakeFieldRefinementPoints[index] ??
        state.shellFieldCouplingPoints[index] ??
        cyclic(hierarchyHalo, index) ??
        cyclic(hierarchySpine, index),
      resolveBreakFieldWakeShellFieldTurbulenceSource: (index, state) =>
        state.wakeShellTurbulenceRefinementPoints[index] ??
        state.looseEndTurbulencePoints[index] ??
        cyclic(hierarchyHalo, index),
    },
  });

  const points = [
    ...strandPointSets.flat(),
    ...hierarchySpine,
    ...hierarchyHalo,
    ...sagPoints,
    ...tensionFieldPoints,
    ...snapPoints,
    ...snapClusterPoints,
    ...breakClusterPoints,
    ...looseEndFieldPoints,
    ...entanglementShellPoints,
    ...refinements.state.snapPhaseFieldPoints,
    ...refinements.state.knotShellClusterPoints,
    ...refinements.state.looseEndTurbulencePoints,
    ...refinements.state.snapPhaseShellPoints,
    ...refinements.state.tensionFieldBraidPoints,
    ...refinements.state.breakShellRefinementPoints,
    ...refinements.state.entanglementTurbulenceSplitPoints,
    ...refinements.state.knotTurbulenceRefinementPoints,
    ...refinements.state.breakFieldBraidSplitPoints,
    ...refinements.state.shellFieldCouplingPoints,
    ...refinements.state.looseEndWakeSplitPoints,
    ...refinements.state.knotWakeClusterPoints,
    ...refinements.state.breakShellFieldSplitPoints,
    ...refinements.state.shellWakeBraidRefinementPoints,
    ...refinements.state.breakFieldTurbulenceClusterPoints,
    ...refinements.state.knotShellWakeRefinementPoints,
    ...refinements.state.breakFieldShellClusterPoints,
    ...refinements.state.wakeShellTurbulenceRefinementPoints,
    ...refinements.state.breakFieldWakeClusterPoints,
    ...refinements.state.knotWakeShellRefinementPoints,
    ...refinements.state.breakFieldWakeTurbulenceSplitPoints,
    ...refinements.state.shellWakeFieldRefinementPoints,
    ...refinements.state.breakFieldWakeShellClusterPoints,
    ...refinements.state.knotShellWakeFieldRefinementPoints,
    ...refinements.state.breakFieldWakeShellTurbulenceSplitPoints,
  ];
  const statsRefinementMetrics = { ...refinements.metrics };
  delete statsRefinementMetrics.knotShellWakeFieldBraidTurbulenceRefinementCount;
  delete statsRefinementMetrics.breakFieldWakeShellFieldTurbulenceFieldClusterCount;
  const routeMetrics: RopeMetricMap = {
    strandCount,
    bundlePointCount: points.length,
    bundleLineCount: lines.length,
    canopyBridgeCount: canopyBridges,
    canopyLift,
    bundleSpread: spread * 2,
    bundleDepthRange: depthSpacing * 3,
    hierarchyBundleCount: 2,
    hierarchyLinkCount,
    curtainRibCount,
    tensionStrandCount,
    sagArcCount,
    snapMarkerCount,
    tensionFieldLayerCount,
    snapStateClusterCount,
    breakClusterLayerCount,
    looseEndFieldSplitCount,
    entanglementShellLayerCount,
  };

  return buildRopeAugmentation({
    basePayload,
    points,
    lines,
    routeSummaryTokens: [
      `canopy${strandCount}`,
      "hier2",
      `ribs${curtainRibCount}`,
      `sag${sagArcCount}`,
      `snap${snapMarkerCount}`,
      `field${tensionFieldLayerCount}`,
      `cluster${snapStateClusterCount}`,
      `break${breakClusterLayerCount}`,
      `loose${looseEndFieldSplitCount}`,
      `shell${entanglementShellLayerCount}`,
    ],
    routeMetrics,
    refinementMetrics: statsRefinementMetrics,
    summaryMetrics: refinements.metrics,
  });
}
