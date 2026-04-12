import type { FutureNativeDebugLine, FutureNativeDebugPoint } from './runtimeContracts';
import type { FractureLatticeRuntimeState } from './fracture_latticeSolver';

export function buildDebrisTrailLines(
  state: FractureLatticeRuntimeState,
): { lines: FutureNativeDebugLine[]; debrisTrailLineCount: number } {
  const lines = state.debris.map((piece) => {
    const trailScale = 0.45 + piece.energy * 0.35;
    return {
      a: { x: piece.x, y: piece.y, z: piece.energy * 0.018 },
      b: { x: piece.x - piece.vx * trailScale * 9, y: piece.y - piece.vy * trailScale * 9, z: 0.002 },
    };
  });
  return { lines, debrisTrailLineCount: lines.length };
}

export function buildDebrisMaterialBranches(
  state: FractureLatticeRuntimeState,
): {
  points: FutureNativeDebugPoint[];
  lines: FutureNativeDebugLine[];
  dustDebrisCount: number;
  shardDebrisCount: number;
  splinterDebrisCount: number;
  dustCloudPointCount: number;
  shardFacetLineCount: number;
  splinterBranchLineCount: number;
} {
  const points: FutureNativeDebugPoint[] = [];
  const lines: FutureNativeDebugLine[] = [];
  let dustDebrisCount = 0;
  let shardDebrisCount = 0;
  let splinterDebrisCount = 0;
  let dustCloudPointCount = 0;
  let shardFacetLineCount = 0;
  let splinterBranchLineCount = 0;

  for (const piece of state.debris) {
    const speed = Math.max(0.0001, Math.hypot(piece.vx, piece.vy));
    const dirX = piece.vx / speed;
    const dirY = piece.vy / speed;
    const normalX = -dirY;
    const normalY = dirX;
    if (piece.energy < 0.42) {
      dustDebrisCount += 1;
      const spread = 0.007 + piece.energy * 0.02;
      points.push(
        { x: piece.x + normalX * spread, y: piece.y + normalY * spread, z: 0.004 },
        { x: piece.x - normalX * spread, y: piece.y - normalY * spread, z: 0.004 },
      );
      dustCloudPointCount += 2;
      continue;
    }
    if (piece.energy < 0.74) {
      shardDebrisCount += 1;
      const halfWidth = 0.004 + piece.energy * 0.006;
      lines.push({
        a: { x: piece.x - normalX * halfWidth, y: piece.y - normalY * halfWidth, z: 0.009 },
        b: { x: piece.x + normalX * halfWidth, y: piece.y + normalY * halfWidth, z: 0.009 },
      });
      shardFacetLineCount += 1;
      continue;
    }
    splinterDebrisCount += 1;
    const tipScale = 0.035 + piece.energy * 0.03;
    const branchScale = 0.012 + piece.energy * 0.008;
    const tip = { x: piece.x + dirX * tipScale, y: piece.y + dirY * tipScale, z: 0.014 };
    lines.push(
      { a: { x: piece.x, y: piece.y, z: 0.012 }, b: tip },
      {
        a: tip,
        b: { x: tip.x + normalX * branchScale, y: tip.y + normalY * branchScale, z: 0.008 },
      },
      {
        a: tip,
        b: { x: tip.x - normalX * branchScale, y: tip.y - normalY * branchScale, z: 0.008 },
      },
    );
    splinterBranchLineCount += 3;
  }

  return {
    points,
    lines,
    dustDebrisCount,
    shardDebrisCount,
    splinterDebrisCount,
    dustCloudPointCount,
    shardFacetLineCount,
    splinterBranchLineCount,
  };
}
