import type { FutureNativeRenderPayload } from './runtimeContracts';
import { getMpmGranularStats, type MpmGranularRuntimeState } from './mpm_granularSolver';
import { buildConstitutiveOverlay, buildGranularStressLines, measureCellStress } from './mpm_granularRendererHelpers';

export function buildMpmGranularDebugRenderPayload(runtime: MpmGranularRuntimeState): FutureNativeRenderPayload {
  const stats = { ...getMpmGranularStats(runtime) };
  const occupiedCells = runtime.grid.cells
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => cell.mass > 0)
    .sort((a, b) => (b.cell.mass + b.cell.density * 0.35) - (a.cell.mass + a.cell.density * 0.35))
    .slice(0, 96);

  const overlayEntries = occupiedCells.map(({ cell, index }) => [index, measureCellStress(cell, runtime)] as const);
  const overlayMap = new Map(overlayEntries);
  const overlayPoints = overlayEntries.map(([, overlay]) => overlay.point);
  const stressThreshold = Math.max(0.02, stats.meanStress * 0.68);
  const stressLines = buildGranularStressLines(runtime, overlayMap, stressThreshold);
  const stressedCellCount = overlayEntries.filter(([, overlay]) => overlay.stress >= stressThreshold).length;
  const maxOverlayStress = overlayEntries.reduce((max, [, overlay]) => Math.max(max, overlay.stress), 0);
  const constitutiveOverlay = buildConstitutiveOverlay(runtime, overlayEntries);
  const allLines = stressLines.concat(constitutiveOverlay.lines).slice(0, 420);
  const granularSummaryTail = runtime.config.materialKind === 'paste'
    ? `:yieldDom=${constitutiveOverlay.yieldDominantOverlayCellCount}:split=${constitutiveOverlay.jammedMaterialSplitModeCount}:remesh=${constitutiveOverlay.packedRegionRemeshLineCount}`
    : runtime.config.materialKind === 'mud'
      ? `:yieldDom=${constitutiveOverlay.yieldDominantOverlayCellCount}`
      : '';

  return {
    familyId: 'mpm-granular',
    summary: `granular:${runtime.config.materialKind}:particles=${runtime.particles.length}:cells=${runtime.grid.occupiedCells}:stress=${stats.meanStress.toFixed(3)}:branch=${stats.materialBranchScore.toFixed(3)}:overlay=${stressLines.length}:constitutive=${constitutiveOverlay.constitutiveLineCount}${granularSummaryTail}:frame=${runtime.frame}`,
    points: runtime.particles.slice(0, 256).map((particle) => ({ x: particle.x, y: particle.y }))
      .concat(overlayPoints)
      .concat(constitutiveOverlay.points),
    lines: allLines,
    scalarSamples: [
      stats.centerOfMassY,
      stats.pileHeight,
      stats.meanStress,
      stats.meanHardeningState,
      stats.meanViscosityState,
      stats.meanYieldMemory,
      stats.materialBranchScore,
      constitutiveOverlay.maxConstitutiveResponse,
    ],
    stats: {
      ...stats,
      overlayCellCount: overlayPoints.length,
      stressedCellCount,
      stressLineCount: stressLines.length,
      maxOverlayStress,
      overlayStressThreshold: stressThreshold,
      constitutiveOverlayCellCount: constitutiveOverlay.constitutiveOverlayCellCount,
      constitutiveLineCount: constitutiveOverlay.constitutiveLineCount,
      hardeningOverlayCellCount: constitutiveOverlay.hardeningOverlayCellCount,
      viscosityOverlayCellCount: constitutiveOverlay.viscosityOverlayCellCount,
      yieldOverlayCellCount: constitutiveOverlay.yieldOverlayCellCount,
      hardeningLineCount: constitutiveOverlay.hardeningLineCount,
      viscosityLineCount: constitutiveOverlay.viscosityLineCount,
      yieldLineCount: constitutiveOverlay.yieldLineCount,
      maxConstitutiveResponse: constitutiveOverlay.maxConstitutiveResponse,
      materialSpecificStressFieldCount: constitutiveOverlay.materialSpecificStressFieldCount,
      hardeningCentroidCount: constitutiveOverlay.hardeningCentroidCount,
      viscosityCentroidCount: constitutiveOverlay.viscosityCentroidCount,
      yieldCentroidCount: constitutiveOverlay.yieldCentroidCount,
      yieldDominantOverlayCellCount: constitutiveOverlay.yieldDominantOverlayCellCount,
      yieldDominantLineCount: constitutiveOverlay.yieldDominantLineCount,
      yieldDominantCentroidCount: constitutiveOverlay.yieldDominantCentroidCount,
      yieldDominantPeak: constitutiveOverlay.yieldDominantPeak,
      jammedMaterialSplitCellCount: constitutiveOverlay.jammedMaterialSplitCellCount,
      jammedPasteCoreCellCount: constitutiveOverlay.jammedPasteCoreCellCount,
      jammedMudShearCellCount: constitutiveOverlay.jammedMudShearCellCount,
      jammedSnowCrustCellCount: constitutiveOverlay.jammedSnowCrustCellCount,
      jammedSplitLineCount: constitutiveOverlay.jammedSplitLineCount,
      jammedSplitCentroidCount: constitutiveOverlay.jammedSplitCentroidCount,
      jammedMaterialSplitModeCount: constitutiveOverlay.jammedMaterialSplitModeCount,
      packedRegionCellCount: constitutiveOverlay.packedRegionCellCount,
      packedRegionRemeshLineCount: constitutiveOverlay.packedRegionRemeshLineCount,
      packedRegionShellSegmentCount: constitutiveOverlay.packedRegionShellSegmentCount,
      packedRegionBandCount: constitutiveOverlay.packedRegionBandCount,
      constitutiveShellCellCount: constitutiveOverlay.constitutiveShellCellCount,
      constitutiveShellSegmentCount: constitutiveOverlay.constitutiveShellSegmentCount,
      hardeningShellSegmentCount: constitutiveOverlay.hardeningShellSegmentCount,
      viscosityShellSegmentCount: constitutiveOverlay.viscosityShellSegmentCount,
      yieldShellSegmentCount: constitutiveOverlay.yieldShellSegmentCount,
      constitutiveShellModeCount: constitutiveOverlay.constitutiveShellModeCount,
    },
  };
}
