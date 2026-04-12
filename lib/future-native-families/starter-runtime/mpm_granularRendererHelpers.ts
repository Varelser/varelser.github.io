import type { FutureNativeDebugLine, FutureNativeDebugPoint, FutureNativeRenderPayload } from './runtimeContracts';
import { getMpmGranularStats, type MpmGranularGridCell, type MpmGranularRuntimeState } from './mpm_granularSolver';
import { getMaterialStateProfile } from './mpm_granularShared';
import { buildConstitutiveShells, buildPackedRegionRemesh } from './mpm_granularRendererShells';
type OverlayEntry = readonly [number, OccupiedCellOverlay];
type OccupiedCellOverlay = {
  point: FutureNativeDebugPoint;
  stress: number;
  density: number;
  mass: number;
  hardening: number;
  viscosity: number;
  yieldMemory: number;
  shear: number;
  constitutiveResponse: number;
};
type JammedSplitBuckets = {
  pasteCore: OverlayEntry[];
  mudShear: OverlayEntry[];
  snowCrust: OverlayEntry[];
};
type ConstitutiveOverlaySummary = {
  points: FutureNativeDebugPoint[];
  lines: FutureNativeDebugLine[];
  constitutiveOverlayCellCount: number;
  constitutiveLineCount: number;
  hardeningOverlayCellCount: number;
  viscosityOverlayCellCount: number;
  yieldOverlayCellCount: number;
  hardeningLineCount: number;
  viscosityLineCount: number;
  yieldLineCount: number;
  maxConstitutiveResponse: number;
  materialSpecificStressFieldCount: number;
  hardeningCentroidCount: number;
  viscosityCentroidCount: number;
  yieldCentroidCount: number;
  yieldDominantOverlayCellCount: number;
  yieldDominantLineCount: number;
  yieldDominantCentroidCount: number;
  yieldDominantPeak: number;
  jammedMaterialSplitCellCount: number;
  jammedPasteCoreCellCount: number;
  jammedMudShearCellCount: number;
  jammedSnowCrustCellCount: number;
  jammedSplitLineCount: number;
  jammedSplitCentroidCount: number;
  jammedMaterialSplitModeCount: number;
  packedRegionCellCount: number;
  packedRegionRemeshLineCount: number;
  packedRegionShellSegmentCount: number;
  packedRegionBandCount: number;
  constitutiveShellCellCount: number;
  constitutiveShellSegmentCount: number;
  hardeningShellSegmentCount: number;
  viscosityShellSegmentCount: number;
  yieldShellSegmentCount: number;
  constitutiveShellModeCount: number;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function measureCellStress(
  cell: MpmGranularGridCell,
  runtime: MpmGranularRuntimeState,
): OccupiedCellOverlay {
  const supportRadius = Math.max(runtime.grid.cellWidth, runtime.grid.cellHeight) * 1.75;
  const supportRadiusSq = supportRadius * supportRadius;
  const materialProfile = getMaterialStateProfile(runtime.config.materialKind);
  let weightedStress = 0;
  let weightedDensity = 0;
  let weightedHardening = 0;
  let weightedViscosity = 0;
  let weightedYieldMemory = 0;
  let weightedShear = 0;
  let weightSum = 0;
  for (const particle of runtime.particles) {
    const dx = particle.x - cell.x;
    const dy = particle.y - cell.y;
    const distSq = dx * dx + dy * dy;
    if (distSq > supportRadiusSq) continue;
    const weight = Math.max(0.0001, 1 - distSq / Math.max(supportRadiusSq, 1e-6));
    const particleStress = particle.meanStress + particle.shearStress * 0.6 + particle.compactness * 0.18 + particle.hardeningState * 0.08;
    weightedStress += particleStress * weight;
    weightedDensity += (particle.compactness + particle.viscosityState * 0.35 + particle.yieldMemory * 0.25) * weight;
    weightedHardening += particle.hardeningState * weight;
    weightedViscosity += particle.viscosityState * weight;
    weightedYieldMemory += particle.yieldMemory * weight;
    weightedShear += particle.shearStress * weight;
    weightSum += weight;
  }
  const stress = weightSum > 0 ? weightedStress / weightSum : 0;
  const density = weightSum > 0 ? weightedDensity / weightSum : 0;
  const hardening = weightSum > 0 ? weightedHardening / weightSum : 0;
  const viscosity = weightSum > 0 ? weightedViscosity / weightSum : 0;
  const yieldMemory = weightSum > 0 ? weightedYieldMemory / weightSum : 0;
  const shear = weightSum > 0 ? weightedShear / weightSum : 0;
  const constitutiveResponse = hardening * materialProfile.hardeningGain + viscosity * materialProfile.viscosityGain + yieldMemory * materialProfile.yieldGain + Math.abs(shear) * 0.08;
  return {
    point: {
      x: cell.x,
      y: cell.y,
      z: Math.min(0.32, stress * 0.06 + density * 0.028 + constitutiveResponse * 0.09 + cell.density * 0.01),
    },
    stress,
    density,
    mass: cell.mass,
    hardening,
    viscosity,
    yieldMemory,
    shear,
    constitutiveResponse,
  };
}

export function buildGranularStressLines(
  runtime: MpmGranularRuntimeState,
  overlays: Map<number, OccupiedCellOverlay>,
  stressThreshold: number,
): FutureNativeDebugLine[] {
  const lines: FutureNativeDebugLine[] = [];
  const neighborOffsets: Array<[number, number]> = [[1, 0], [0, 1], [1, 1], [-1, 1]];
  for (const [index, overlay] of overlays) {
    const row = Math.floor(index / runtime.grid.resolution);
    const col = index % runtime.grid.resolution;
    for (const [dc, dr] of neighborOffsets) {
      const nextCol = col + dc;
      const nextRow = row + dr;
      if (nextCol < 0 || nextCol >= runtime.grid.resolution || nextRow < 0 || nextRow >= runtime.grid.resolution) continue;
      const nextIndex = nextRow * runtime.grid.resolution + nextCol;
      const other = overlays.get(nextIndex);
      if (!other) continue;
      const combinedStress = (overlay.stress + other.stress) * 0.5;
      const combinedDensity = (overlay.density + other.density) * 0.5;
      const combinedMass = overlay.mass + other.mass;
      if (combinedStress < stressThreshold && combinedDensity < 0.22 && combinedMass < 1.4) continue;
      lines.push({ a: overlay.point, b: other.point });
      if (lines.length >= 192) return lines;
    }
  }
  return lines;
}

export function buildConstitutiveOverlay(
  runtime: MpmGranularRuntimeState,
  overlayEntries: OverlayEntry[],
): ConstitutiveOverlaySummary {
  const cellWidth = runtime.grid.cellWidth;
  const cellHeight = runtime.grid.cellHeight;
  const diagonal = Math.hypot(cellWidth, cellHeight) * 0.46;
  const thresholds = {
    hardening: Math.max(0.08, runtime.config.hardening * 0.82),
    viscosity: Math.max(0.06, getMaterialStateProfile(runtime.config.materialKind).viscosityGain * 2.4),
    yieldMemory: Math.max(0.05, runtime.config.yieldRate * 0.28),
    constitutive: Math.max(0.06, runtime.config.hardening * 0.18 + runtime.config.yieldRate * 0.08),
  };
  const lines: FutureNativeDebugLine[] = [];
  const points: FutureNativeDebugPoint[] = [];
  const centroidAccum = {
    hardening: { x: 0, y: 0, z: 0, count: 0 },
    viscosity: { x: 0, y: 0, z: 0, count: 0 },
    yieldMemory: { x: 0, y: 0, z: 0, count: 0 },
  };
  const jammedBuckets: JammedSplitBuckets = {
    pasteCore: [],
    mudShear: [],
    snowCrust: [],
  };
  const constitutiveEntries: OverlayEntry[] = [];
  const hardeningEntries: OverlayEntry[] = [];
  const viscosityEntries: OverlayEntry[] = [];
  const yieldEntries: OverlayEntry[] = [];
  const yieldDominantOverlays: OccupiedCellOverlay[] = [];

  const minX = overlayEntries.reduce((acc, [, overlay]) => Math.min(acc, overlay.point.x), Number.POSITIVE_INFINITY);
  const maxX = overlayEntries.reduce((acc, [, overlay]) => Math.max(acc, overlay.point.x), Number.NEGATIVE_INFINITY);
  const minY = overlayEntries.reduce((acc, [, overlay]) => Math.min(acc, overlay.point.y), Number.POSITIVE_INFINITY);
  const maxY = overlayEntries.reduce((acc, [, overlay]) => Math.max(acc, overlay.point.y), Number.NEGATIVE_INFINITY);
  const spanX = Math.max(cellWidth, maxX - minX);
  const spanY = Math.max(cellHeight, maxY - minY);
  const centerX = (minX + maxX) * 0.5;

  let constitutiveOverlayCellCount = 0;
  let hardeningOverlayCellCount = 0;
  let viscosityOverlayCellCount = 0;
  let yieldOverlayCellCount = 0;
  let hardeningLineCount = 0;
  let viscosityLineCount = 0;
  let yieldLineCount = 0;
  let maxConstitutiveResponse = 0;

  for (const entry of overlayEntries) {
    const [index, overlay] = entry;
    const qualifies =
      overlay.constitutiveResponse >= thresholds.constitutive ||
      overlay.hardening >= thresholds.hardening ||
      overlay.viscosity >= thresholds.viscosity ||
      overlay.yieldMemory >= thresholds.yieldMemory;
    if (!qualifies) continue;
    constitutiveEntries.push(entry);
    constitutiveOverlayCellCount += 1;
    maxConstitutiveResponse = Math.max(maxConstitutiveResponse, overlay.constitutiveResponse);
    points.push({ x: overlay.point.x, y: overlay.point.y, z: (overlay.point.z ?? 0) + 0.018 + overlay.constitutiveResponse * 0.05 });

    const dominant = Math.max(overlay.hardening, overlay.viscosity, overlay.yieldMemory);
    const branchDominanceFactor = runtime.config.materialKind === 'paste'
      ? 0.68
      : runtime.config.materialKind === 'mud'
        ? 0.78
        : 0.88;
    let hasHardening = overlay.hardening >= thresholds.hardening && overlay.hardening >= dominant * 0.88;
    let hasViscosity = overlay.viscosity >= thresholds.viscosity && overlay.viscosity >= dominant * 0.88;
    let hasYield = overlay.yieldMemory >= thresholds.yieldMemory && overlay.yieldMemory >= dominant * branchDominanceFactor;
    const pasteYieldAssist = runtime.config.materialKind === 'paste'
      && overlay.yieldMemory >= thresholds.yieldMemory * 1.5
      && overlay.yieldMemory + overlay.density * 0.12 >= overlay.viscosity * 0.48
      && overlay.yieldMemory + overlay.stress * 0.9 >= overlay.hardening * 0.62;
    if (pasteYieldAssist) hasYield = true;

    if (!hasHardening && !hasViscosity && !hasYield && dominant > 0) {
      if (dominant === overlay.hardening) hasHardening = true;
      else if (dominant === overlay.viscosity) hasViscosity = true;
      else hasYield = true;
    }

    if (hasHardening) {
      hardeningEntries.push(entry);
      hardeningOverlayCellCount += 1;
      centroidAccum.hardening.x += overlay.point.x;
      centroidAccum.hardening.y += overlay.point.y;
      centroidAccum.hardening.z += overlay.point.z ?? 0;
      centroidAccum.hardening.count += 1;
      const half = cellHeight * (0.34 + Math.min(0.5, overlay.hardening * 0.18));
      lines.push({
        a: { x: overlay.point.x, y: overlay.point.y - half, z: overlay.point.z },
        b: { x: overlay.point.x, y: overlay.point.y + half, z: overlay.point.z },
      });
      hardeningLineCount += 1;
    }

    if (hasViscosity) {
      viscosityEntries.push(entry);
      viscosityOverlayCellCount += 1;
      centroidAccum.viscosity.x += overlay.point.x;
      centroidAccum.viscosity.y += overlay.point.y;
      centroidAccum.viscosity.z += overlay.point.z ?? 0;
      centroidAccum.viscosity.count += 1;
      const half = cellWidth * (0.34 + Math.min(0.5, overlay.viscosity * 0.15));
      lines.push({
        a: { x: overlay.point.x - half, y: overlay.point.y, z: overlay.point.z },
        b: { x: overlay.point.x + half, y: overlay.point.y, z: overlay.point.z },
      });
      viscosityLineCount += 1;
    }

    if (hasYield) {
      yieldEntries.push(entry);
      yieldOverlayCellCount += 1;
      centroidAccum.yieldMemory.x += overlay.point.x;
      centroidAccum.yieldMemory.y += overlay.point.y;
      centroidAccum.yieldMemory.z += overlay.point.z ?? 0;
      centroidAccum.yieldMemory.count += 1;
      const half = diagonal * (0.42 + Math.min(0.45, overlay.yieldMemory * 0.12));
      lines.push({
        a: { x: overlay.point.x - half, y: overlay.point.y - half * 0.85, z: overlay.point.z },
        b: { x: overlay.point.x + half, y: overlay.point.y + half * 0.85, z: overlay.point.z },
      });
      yieldLineCount += 1;
    }

    const yieldDominantFactor = runtime.config.materialKind === 'paste' ? 0.96 : 1.02;
    const pasteYieldDominant = runtime.config.materialKind === 'paste'
      && overlay.yieldMemory >= thresholds.yieldMemory * 1.5
      && overlay.yieldMemory + overlay.stress * 1.1 >= overlay.hardening * 0.72
      && overlay.yieldMemory + overlay.density * 0.16 >= overlay.viscosity * 0.58;
    const isYieldDominant = pasteYieldDominant || (hasYield
      && overlay.yieldMemory >= thresholds.yieldMemory
      && overlay.yieldMemory >= overlay.hardening * yieldDominantFactor
      && overlay.yieldMemory >= overlay.viscosity * yieldDominantFactor);
    if (isYieldDominant) yieldDominantOverlays.push(overlay);

    if (runtime.config.materialKind === 'paste') {
      const normalizedY = clamp01((overlay.point.y - minY) / Math.max(spanY, 1e-6));
      const lateral = clamp01(Math.abs(overlay.point.x - centerX) / Math.max(spanX * 0.5, cellWidth));
      const centerBias = 1 - lateral;
      const highShear = Math.abs(overlay.shear) >= Math.max(0.006, thresholds.constitutive * 0.06);
      const isSnowCrust = normalizedY >= 0.58 || (normalizedY >= 0.44 && overlay.hardening >= overlay.viscosity * 0.98);
      const isMudShear = !isSnowCrust && (lateral >= 0.36 || highShear);
      const isPasteCore = !isSnowCrust && !isMudShear;
      if (isPasteCore || centerBias >= 0.52 && normalizedY <= 0.62) jammedBuckets.pasteCore.push(entry);
      else if (isMudShear) jammedBuckets.mudShear.push(entry);
      else jammedBuckets.snowCrust.push(entry);
    }

    if (lines.length >= 160) break;
  }

  let hardeningCentroidCount = 0;
  let viscosityCentroidCount = 0;
  let yieldCentroidCount = 0;
  for (const [kind, accum] of Object.entries(centroidAccum) as Array<[keyof typeof centroidAccum, typeof centroidAccum.hardening]>) {
    if (accum.count <= 0) continue;
    const centroid = {
      x: accum.x / accum.count,
      y: accum.y / accum.count,
      z: accum.z / accum.count + 0.028,
    };
    points.push(centroid);
    if (kind === 'hardening') hardeningCentroidCount = 1;
    if (kind === 'viscosity') viscosityCentroidCount = 1;
    if (kind === 'yieldMemory') yieldCentroidCount = 1;
  }

  const yieldSorted = [...yieldDominantOverlays].sort((a, b) => {
    if (Math.abs(a.point.y - b.point.y) > cellHeight * 0.32) return a.point.y - b.point.y;
    return a.point.x - b.point.x;
  });
  let yieldDominantLineCount = 0;
  let yieldDominantPeak = 0;
  for (let index = 1; index < yieldSorted.length; index += 1) {
    const previous = yieldSorted[index - 1];
    const current = yieldSorted[index];
    yieldDominantPeak = Math.max(yieldDominantPeak, previous.yieldMemory, current.yieldMemory);
    const dx = current.point.x - previous.point.x;
    const dy = current.point.y - previous.point.y;
    const distance = Math.hypot(dx, dy);
    if (distance > Math.max(cellWidth, cellHeight) * 3.1) continue;
    lines.push({
      a: { x: previous.point.x, y: previous.point.y, z: (previous.point.z ?? 0) + 0.01 },
      b: { x: current.point.x, y: current.point.y, z: (current.point.z ?? 0) + 0.01 },
    });
    yieldDominantLineCount += 1;
    if (yieldDominantLineCount >= 48) break;
  }

  let yieldDominantCentroidCount = 0;
  if (yieldDominantOverlays.length > 0) {
    const accum = yieldDominantOverlays.reduce((state, overlay) => ({
      x: state.x + overlay.point.x,
      y: state.y + overlay.point.y,
      z: state.z + (overlay.point.z ?? 0),
    }), { x: 0, y: 0, z: 0 });
    points.push({
      x: accum.x / yieldDominantOverlays.length,
      y: accum.y / yieldDominantOverlays.length,
      z: accum.z / yieldDominantOverlays.length + 0.045,
    });
    yieldDominantCentroidCount = 1;
    yieldDominantPeak = Math.max(yieldDominantPeak, ...yieldDominantOverlays.map((overlay) => overlay.yieldMemory));
  }

  let jammedSplitLineCount = 0;
  let jammedSplitCentroidCount = 0;
  let jammedMaterialSplitModeCount = 0;
  for (const [bucketName, bucket] of Object.entries(jammedBuckets) as Array<[keyof JammedSplitBuckets, OverlayEntry[]]>) {
    if (bucket.length <= 0) continue;
    jammedMaterialSplitModeCount += 1;
    const accum = bucket.reduce((state, [, overlay]) => ({
      x: state.x + overlay.point.x,
      y: state.y + overlay.point.y,
      z: state.z + (overlay.point.z ?? 0),
    }), { x: 0, y: 0, z: 0 });
    const centroid = {
      x: accum.x / bucket.length,
      y: accum.y / bucket.length,
      z: accum.z / bucket.length + 0.036,
    };
    points.push(centroid);
    jammedSplitCentroidCount += 1;
    const branchCap = Math.min(10, bucket.length);
    const stride = Math.max(1, Math.floor(bucket.length / branchCap));
    let emitted = 0;
    for (let index = 0; index < bucket.length && emitted < branchCap; index += stride) {
      const [, overlay] = bucket[index];
      const offset = bucketName === 'pasteCore'
        ? { x: 0, y: -cellHeight * 0.16 }
        : bucketName === 'mudShear'
          ? { x: cellWidth * 0.12, y: 0 }
          : { x: 0, y: cellHeight * 0.16 };
      lines.push({
        a: centroid,
        b: { x: overlay.point.x + offset.x, y: overlay.point.y + offset.y, z: (overlay.point.z ?? 0) + 0.006 },
      });
      jammedSplitLineCount += 1;
      emitted += 1;
      if (jammedSplitLineCount >= 42) break;
    }
    if (jammedSplitLineCount >= 42) break;
  }

  const { constitutiveShell, hardeningShell, viscosityShell, yieldShell } = buildConstitutiveShells(
    runtime,
    constitutiveEntries,
    hardeningEntries,
    viscosityEntries,
    yieldEntries,
  );
  const packedRegionEntries = runtime.config.materialKind === 'paste'
    ? ([] as OverlayEntry[]).concat(jammedBuckets.pasteCore, jammedBuckets.mudShear, jammedBuckets.snowCrust)
    : constitutiveEntries.filter(([, overlay]) => overlay.density >= Math.max(0.2, thresholds.constitutive * 0.9) || overlay.mass >= 1.6);
  const packedRegionRemesh = buildPackedRegionRemesh(runtime, packedRegionEntries);
  lines.push(...constitutiveShell.lines);
  lines.push(...hardeningShell.lines);
  lines.push(...viscosityShell.lines);
  lines.push(...yieldShell.lines);
  lines.push(...packedRegionRemesh.lines);

  return {
    points,
    lines,
    constitutiveOverlayCellCount,
    constitutiveLineCount: lines.length,
    hardeningOverlayCellCount,
    viscosityOverlayCellCount,
    yieldOverlayCellCount,
    hardeningLineCount,
    viscosityLineCount,
    yieldLineCount,
    maxConstitutiveResponse,
    materialSpecificStressFieldCount: hardeningOverlayCellCount + viscosityOverlayCellCount + yieldOverlayCellCount,
    hardeningCentroidCount,
    viscosityCentroidCount,
    yieldCentroidCount,
    yieldDominantOverlayCellCount: yieldDominantOverlays.length,
    yieldDominantLineCount,
    yieldDominantCentroidCount,
    yieldDominantPeak,
    jammedMaterialSplitCellCount: jammedBuckets.pasteCore.length + jammedBuckets.mudShear.length + jammedBuckets.snowCrust.length,
    jammedPasteCoreCellCount: jammedBuckets.pasteCore.length,
    jammedMudShearCellCount: jammedBuckets.mudShear.length,
    jammedSnowCrustCellCount: jammedBuckets.snowCrust.length,
    jammedSplitLineCount,
    jammedSplitCentroidCount,
    jammedMaterialSplitModeCount,
    packedRegionCellCount: packedRegionRemesh.cellCount,
    packedRegionRemeshLineCount: packedRegionRemesh.remeshLineCount,
    packedRegionShellSegmentCount: packedRegionRemesh.shellSegmentCount,
    packedRegionBandCount: packedRegionRemesh.bandCount,
    constitutiveShellCellCount: constitutiveShell.cellCount,
    constitutiveShellSegmentCount: constitutiveShell.segmentCount,
    hardeningShellSegmentCount: hardeningShell.segmentCount,
    viscosityShellSegmentCount: viscosityShell.segmentCount,
    yieldShellSegmentCount: yieldShell.segmentCount,
    constitutiveShellModeCount: [hardeningShell, viscosityShell, yieldShell].filter((shell) => shell.segmentCount > 0).length,
  };
}
