import type { FutureNativeDebugLine, FutureNativeDebugPoint, FutureNativeRenderPayload } from './runtimeContracts';
import {
  getFractureLatticeFragments,
  getFractureLatticeStats,
  type FractureLatticeRuntimeState,
} from './fracture_latticeSolver';
import { buildDebrisMaterialBranches, buildDebrisTrailLines } from './fracture_latticeRendererDebris';
import {
  buildCollapseEnvelopePoints,
  buildCrackRemeshLines,
  buildDetachedFragmentVoxelRemesh,
  buildFragmentBondMidpointPoints,
  buildFragmentLinkLines,
  buildFractureVoxelShell,
} from './fracture_latticeRendererShells';
import { buildMultiMaterialBreakGrammar, buildSiblingFractureDensity } from './fracture_latticeRendererPatterns';
import { buildScalarSamples } from './fracture_latticeRendererShared';

export function buildFractureLatticeDebugRenderPayload(state: FractureLatticeRuntimeState): FutureNativeRenderPayload {
  const stats = getFractureLatticeStats(state);
  const lines: FutureNativeDebugLine[] = [];
  const crackFrontPoints: FutureNativeDebugPoint[] = [];
  const fragments = getFractureLatticeFragments(state);
  const detachedFragments = fragments.filter((fragment) => fragment.detached);
  const fragmentPoints = detachedFragments.map((fragment) => ({ x: fragment.centroidX, y: fragment.centroidY, z: 0.012 }));
  const fragmentBondMidpoints = buildFragmentBondMidpointPoints(state, detachedFragments);
  const debrisPoints = state.debris.map((piece) => ({ x: piece.x, y: piece.y, z: piece.energy * 0.02 }));

  const recentFrameWindow = 3;
  let crackFrontLineCount = 0;
  for (const bond of state.bonds) {
    const a = state.nodes[bond.a];
    const b = state.nodes[bond.b];
    if (bond.intact) {
      lines.push({ a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y } });
      continue;
    }

    if (bond.breakFrame === null) continue;
    const age = Math.max(0, state.frame - bond.breakFrame);
    const freshness = Math.max(0, 1 - age / Math.max(1, recentFrameWindow));
    if (freshness <= 0.16) continue;
    const normalX = bond.orientation === 'horizontal' ? 0 : 1;
    const normalY = bond.orientation === 'horizontal' ? 1 : 0;
    const crackHalfWidth = 0.01 + freshness * 0.02;
    const crackDepth = freshness * 0.035;
    lines.push({
      a: { x: bond.midpointX - normalX * crackHalfWidth, y: bond.midpointY - normalY * crackHalfWidth, z: crackDepth },
      b: { x: bond.midpointX + normalX * crackHalfWidth, y: bond.midpointY + normalY * crackHalfWidth, z: -crackDepth },
    });
    crackFrontPoints.push({ x: bond.midpointX, y: bond.midpointY, z: crackDepth });
    crackFrontLineCount += 1;
  }

  const collapseRingSegmentCount = Math.max(12, Math.min(28, Math.round(12 + stats.breakProgress * 24)));
  const collapseEnvelopeRadius = Math.max(
    state.config.impactRadius * 0.72,
    Number((stats.collapseEnvelopeRadius ?? stats.fractureRadius).toFixed(4)),
  );
  const collapseRingPoints = buildCollapseEnvelopePoints(
    state.config.impactX,
    state.config.impactY,
    collapseEnvelopeRadius,
    collapseRingSegmentCount,
    state.frame,
  );
  for (let index = 0; index < collapseRingPoints.length; index += 1) {
    const next = (index + 1) % collapseRingPoints.length;
    lines.push({ a: collapseRingPoints[index], b: collapseRingPoints[next] });
  }

  const debrisTrail = buildDebrisTrailLines(state);
  const debrisMaterial = buildDebrisMaterialBranches(state);
  const fragmentLinks = buildFragmentLinkLines(state, fragmentPoints, crackFrontPoints);
  const crackRemesh = buildCrackRemeshLines(state, crackFrontPoints);
  const voxelShell = buildFractureVoxelShell(state, crackFrontPoints, fragmentPoints, debrisPoints);
  const detachedVoxelRemesh = buildDetachedFragmentVoxelRemesh(state, detachedFragments);
  const breakGrammar = buildMultiMaterialBreakGrammar(state, detachedFragments);
  const siblingDensity = buildSiblingFractureDensity(state, crackFrontPoints, fragmentPoints, debrisPoints);

  lines.push(
    ...debrisTrail.lines,
    ...debrisMaterial.lines,
    ...fragmentLinks.lines,
    ...crackRemesh.lines,
    ...voxelShell.lines,
    ...detachedVoxelRemesh.lines,
    ...breakGrammar.lines,
    ...siblingDensity.lines,
  );

  const points = [
    ...debrisPoints,
    ...debrisMaterial.points,
    ...breakGrammar.points,
    ...siblingDensity.points,
    ...fragmentPoints,
    ...fragmentBondMidpoints,
    ...crackFrontPoints,
    { x: state.config.impactX, y: state.config.impactY, z: Math.max(0.01, collapseEnvelopeRadius * 0.1) },
  ];
  const enrichedStats = {
    ...stats,
    crackFrontCount: crackFrontPoints.length,
    crackFrontLineCount,
    collapseRingSegmentCount,
    collapseEnvelopeRadius,
    debrisTrailLineCount: debrisTrail.debrisTrailLineCount,
    fragmentLinkLineCount: fragmentLinks.fragmentLinkLineCount,
    remeshChordCount: crackRemesh.remeshChordCount,
    voxelCellCount: voxelShell.voxelCellCount,
    voxelShellSegmentCount: voxelShell.voxelShellSegmentCount,
    detachedVoxelCellCount: detachedVoxelRemesh.detachedVoxelCellCount,
    detachedVoxelShellSegmentCount: detachedVoxelRemesh.detachedVoxelShellSegmentCount,
    detachedRemeshBondCount: detachedVoxelRemesh.detachedRemeshBondCount,
    detachedChordCount: detachedVoxelRemesh.detachedChordCount,
    dustDebrisCount: debrisMaterial.dustDebrisCount,
    shardDebrisCount: debrisMaterial.shardDebrisCount,
    splinterDebrisCount: debrisMaterial.splinterDebrisCount,
    dustCloudPointCount: debrisMaterial.dustCloudPointCount,
    shardFacetLineCount: debrisMaterial.shardFacetLineCount,
    splinterBranchLineCount: debrisMaterial.splinterBranchLineCount,
    brittleBreakCount: breakGrammar.brittleBreakCount,
    shearBreakCount: breakGrammar.shearBreakCount,
    ductileBreakCount: breakGrammar.ductileBreakCount,
    brittleFacetLineCount: breakGrammar.brittleFacetLineCount,
    shearSlipLineCount: breakGrammar.shearSlipLineCount,
    ductileBridgeLineCount: breakGrammar.ductileBridgeLineCount,
    breakGrammarMaterialModes: breakGrammar.breakGrammarMaterialModes,
    siblingDensityCellCount: siblingDensity.siblingDensityCellCount,
    siblingDensityLineCount: siblingDensity.siblingDensityLineCount,
    siblingFractureBandCount: siblingDensity.siblingFractureBandCount,
    siblingCoreCellCount: siblingDensity.siblingCoreCellCount,
    siblingHaloCellCount: siblingDensity.siblingHaloCellCount,
    siblingWakeCellCount: siblingDensity.siblingWakeCellCount,
    siblingDensityPeak: siblingDensity.siblingDensityPeak,
    siblingCentroidCount: siblingDensity.siblingCentroidCount,
    siblingBridgeLineCount: siblingDensity.siblingBridgeLineCount,
  };

  return {
    familyId: 'fracture-lattice',
    summary: `bonds:${stats.intact}/${stats.bonds} break:${Number(stats.breakProgress.toFixed(3))} crackFront:${crackFrontPoints.length} voxel:${voxelShell.voxelCellCount}+${detachedVoxelRemesh.detachedVoxelCellCount} grammar:${breakGrammar.breakGrammarMaterialModes} sibling:${siblingDensity.siblingFractureBandCount} debris:${state.debris.length}`,
    points,
    lines,
    scalarSamples: buildScalarSamples(state, stats),
    stats: enrichedStats,
  };
}
