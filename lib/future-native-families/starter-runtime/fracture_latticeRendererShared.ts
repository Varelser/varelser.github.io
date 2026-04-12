import type { FutureNativeDebugLine } from './runtimeContracts';
import type { FractureLatticeRuntimeState } from './fracture_latticeSolver';

export function clampIndex(value: number, maxExclusive: number): number {
  return Math.max(0, Math.min(maxExclusive - 1, value));
}

export type VoxelShellBuildResult = {
  lines: FutureNativeDebugLine[];
  voxelCellCount: number;
  voxelShellSegmentCount: number;
};

export function finalizeVoxelShell(
  occupied: ReadonlySet<string>,
  resolution: number,
  z = 0.004,
): VoxelShellBuildResult {
  const cellSize = 1 / resolution;
  const shellLines: FutureNativeDebugLine[] = [];
  const offsets = [
    { dx: -1, dy: 0, edge: 'left' as const },
    { dx: 1, dy: 0, edge: 'right' as const },
    { dx: 0, dy: -1, edge: 'bottom' as const },
    { dx: 0, dy: 1, edge: 'top' as const },
  ];

  for (const key of occupied) {
    const [gridXText, gridYText] = key.split(',');
    const gridX = Number(gridXText);
    const gridY = Number(gridYText);
    for (const offset of offsets) {
      const neighborKey = `${gridX + offset.dx},${gridY + offset.dy}`;
      if (occupied.has(neighborKey)) continue;
      const minX = gridX * cellSize;
      const maxX = minX + cellSize;
      const minY = gridY * cellSize;
      const maxY = minY + cellSize;
      if (offset.edge === 'left') {
        shellLines.push({ a: { x: minX, y: minY, z }, b: { x: minX, y: maxY, z } });
      } else if (offset.edge === 'right') {
        shellLines.push({ a: { x: maxX, y: minY, z }, b: { x: maxX, y: maxY, z } });
      } else if (offset.edge === 'bottom') {
        shellLines.push({ a: { x: minX, y: minY, z }, b: { x: maxX, y: minY, z } });
      } else {
        shellLines.push({ a: { x: minX, y: maxY, z }, b: { x: maxX, y: maxY, z } });
      }
    }
  }

  return {
    lines: shellLines,
    voxelCellCount: occupied.size,
    voxelShellSegmentCount: shellLines.length,
  };
}

export function sampleSegmentToOccupied(
  occupied: Set<string>,
  resolution: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): void {
  const length = Math.hypot(bx - ax, by - ay);
  const steps = Math.max(1, Math.ceil(length * resolution * 2.4));
  for (let index = 0; index <= steps; index += 1) {
    const t = steps === 0 ? 0 : index / steps;
    const x = ax + (bx - ax) * t;
    const y = ay + (by - ay) * t;
    const gridX = clampIndex(Math.floor(x * resolution), resolution);
    const gridY = clampIndex(Math.floor(y * resolution), resolution);
    occupied.add(`${gridX},${gridY}`);
  }
}

export function buildPropagationUnitVector(state: FractureLatticeRuntimeState): { x: number; y: number } {
  const length = Math.hypot(state.config.propagationDirectionX, state.config.propagationDirectionY);
  if (length <= 1e-6) return { x: 1, y: 0 };
  return {
    x: state.config.propagationDirectionX / length,
    y: state.config.propagationDirectionY / length,
  };
}

export function buildScalarSamples(state: FractureLatticeRuntimeState, stats: Record<string, number>): number[] {
  const finite = (value: number): number => (Number.isFinite(value) ? value : 0);
  const breakRatio = finite(stats.breakProgress ?? 0);
  const fractureRadius = finite(stats.fractureRadius ?? 0);
  const crackFrontRadius = finite(stats.crackFrontRadius ?? 0);
  const collapseEnvelopeRadius = finite(stats.collapseEnvelopeRadius ?? 0);
  const largestBrokenCluster = finite(stats.largestBrokenCluster ?? 0);
  const detachedFragments = finite(stats.detachedFragments ?? 0);
  const detachedFragmentNodes = finite(stats.detachedFragmentNodes ?? 0);
  const meanDamage = finite(stats.meanDamage ?? 0);
  const propagationAdvance = finite(stats.propagationAdvance ?? 0);
  const recentBreaks = finite(stats.recentBreaks ?? 0);
  const debris = finite(stats.debris ?? 0);
  const width = finite(state.config.width);
  const height = finite(state.config.height);
  const impactRadius = finite(state.config.impactRadius);
  const impulseMagnitude = finite(state.config.impulseMagnitude);
  const threshold = finite(state.config.impulseThreshold);
  const debrisRate = finite(state.config.debrisSpawnRate);
  return [
    breakRatio,
    fractureRadius,
    crackFrontRadius,
    collapseEnvelopeRadius,
    largestBrokenCluster,
    detachedFragments,
    detachedFragmentNodes,
    meanDamage,
    propagationAdvance,
    recentBreaks,
    debris,
    width,
    height,
    impactRadius,
    impulseMagnitude,
    threshold,
    debrisRate,
  ];
}
