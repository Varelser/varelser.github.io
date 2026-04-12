import type { FutureNativeDebugLine, FutureNativeDebugPoint } from './runtimeContracts';
import type { FractureLatticeFragment, FractureLatticeRuntimeState } from './fracture_latticeSolver';
import { clampIndex, finalizeVoxelShell, sampleSegmentToOccupied, type VoxelShellBuildResult } from './fracture_latticeRendererShared';

export function buildCollapseEnvelopePoints(
  centerX: number,
  centerY: number,
  radius: number,
  segmentCount: number,
  frame: number,
): FutureNativeDebugPoint[] {
  const safeRadius = Math.max(0.01, radius);
  const wobble = Math.min(0.04, safeRadius * 0.12);
  const points: FutureNativeDebugPoint[] = [];
  for (let index = 0; index < segmentCount; index += 1) {
    const progress = index / segmentCount;
    const angle = progress * Math.PI * 2;
    const localRadius = safeRadius + Math.sin(angle * 3 + frame * 0.22) * wobble;
    points.push({
      x: centerX + Math.cos(angle) * localRadius,
      y: centerY + Math.sin(angle) * localRadius,
      z: Math.cos(angle * 2 - frame * 0.18) * wobble,
    });
  }
  return points;
}

export function buildFractureVoxelShell(
  state: FractureLatticeRuntimeState,
  crackFrontPoints: readonly FutureNativeDebugPoint[],
  fragmentPoints: readonly FutureNativeDebugPoint[],
  debrisPoints: readonly FutureNativeDebugPoint[],
): VoxelShellBuildResult {
  const resolution = Math.max(8, Math.min(18, Math.round(Math.max(state.config.width, state.config.height) * 1.35)));
  const occupied = new Set<string>();
  const occupancyPoints: Array<{ x: number; y: number }> = [];
  for (const bond of state.bonds) {
    if (bond.intact) continue;
    occupancyPoints.push({ x: bond.midpointX, y: bond.midpointY });
  }
  for (const point of crackFrontPoints) occupancyPoints.push({ x: point.x, y: point.y });
  for (const point of fragmentPoints) occupancyPoints.push({ x: point.x, y: point.y });
  for (const point of debrisPoints) occupancyPoints.push({ x: point.x, y: point.y });

  for (const point of occupancyPoints) {
    const gridX = clampIndex(Math.floor(point.x * resolution), resolution);
    const gridY = clampIndex(Math.floor(point.y * resolution), resolution);
    occupied.add(`${gridX},${gridY}`);
  }

  return finalizeVoxelShell(occupied, resolution, 0.004);
}

export function buildDetachedFragmentVoxelRemesh(
  state: FractureLatticeRuntimeState,
  detachedFragments: readonly FractureLatticeFragment[],
): {
  lines: FutureNativeDebugLine[];
  detachedVoxelCellCount: number;
  detachedVoxelShellSegmentCount: number;
  detachedRemeshBondCount: number;
  detachedChordCount: number;
} {
  if (detachedFragments.length === 0) {
    return {
      lines: [],
      detachedVoxelCellCount: 0,
      detachedVoxelShellSegmentCount: 0,
      detachedRemeshBondCount: 0,
      detachedChordCount: 0,
    };
  }

  const resolution = Math.max(14, Math.min(28, Math.round(Math.max(state.config.width, state.config.height) * 2.1)));
  const occupied = new Set<string>();
  const detachedNodeIds = new Set<number>();
  for (const fragment of detachedFragments) {
    for (const nodeId of fragment.nodeIds) detachedNodeIds.add(nodeId);
  }

  const remeshLines: FutureNativeDebugLine[] = [];
  let detachedRemeshBondCount = 0;
  for (const bond of state.bonds) {
    if (!bond.intact || !detachedNodeIds.has(bond.a) || !detachedNodeIds.has(bond.b)) continue;
    const a = state.nodes[bond.a];
    const b = state.nodes[bond.b];
    sampleSegmentToOccupied(occupied, resolution, a.x, a.y, b.x, b.y);
    remeshLines.push({ a: { x: a.x, y: a.y, z: 0.008 }, b: { x: b.x, y: b.y, z: 0.008 } });
    detachedRemeshBondCount += 1;
  }

  let detachedChordCount = 0;
  for (const fragment of detachedFragments) {
    const nodes = fragment.nodeIds.map((nodeId) => state.nodes[nodeId]);
    if (nodes.length === 0) continue;

    for (const node of nodes) {
      const gridX = clampIndex(Math.floor(node.x * resolution), resolution);
      const gridY = clampIndex(Math.floor(node.y * resolution), resolution);
      occupied.add(`${gridX},${gridY}`);
    }

    const sorted = [...nodes].sort((left, right) => {
      const leftAngle = Math.atan2(left.y - fragment.centroidY, left.x - fragment.centroidX);
      const rightAngle = Math.atan2(right.y - fragment.centroidY, right.x - fragment.centroidX);
      return leftAngle - rightAngle;
    });
    const bboxWidth = Math.max(...nodes.map((node) => node.x)) - Math.min(...nodes.map((node) => node.x));
    const bboxHeight = Math.max(...nodes.map((node) => node.y)) - Math.min(...nodes.map((node) => node.y));
    const maxChordDistance = Math.max(0.045, Math.hypot(bboxWidth, bboxHeight) * 0.55);
    for (let index = 0; index < sorted.length; index += 1) {
      const current = sorted[index];
      const next = sorted[(index + 1) % sorted.length];
      const distance = Math.hypot(current.x - next.x, current.y - next.y);
      if (distance > maxChordDistance) continue;
      sampleSegmentToOccupied(occupied, resolution, current.x, current.y, next.x, next.y);
      remeshLines.push({
        a: { x: current.x, y: current.y, z: 0.011 },
        b: { x: next.x, y: next.y, z: 0.011 },
      });
      detachedChordCount += 1;
    }
  }

  const shell = finalizeVoxelShell(occupied, resolution, 0.006);
  return {
    lines: [...remeshLines, ...shell.lines],
    detachedVoxelCellCount: shell.voxelCellCount,
    detachedVoxelShellSegmentCount: shell.voxelShellSegmentCount,
    detachedRemeshBondCount,
    detachedChordCount,
  };
}

export function buildFragmentLinkLines(
  state: FractureLatticeRuntimeState,
  fragmentPoints: readonly FutureNativeDebugPoint[],
  crackFrontPoints: readonly FutureNativeDebugPoint[],
): { lines: FutureNativeDebugLine[]; fragmentLinkLineCount: number } {
  const lines: FutureNativeDebugLine[] = [];
  const maxDistance = Math.max(0.12, state.config.impactRadius * 1.6);
  for (const fragment of fragmentPoints) {
    let bestIndex = -1;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < crackFrontPoints.length; index += 1) {
      const crack = crackFrontPoints[index];
      const dx = fragment.x - crack.x;
      const dy = fragment.y - crack.y;
      const distance = Math.hypot(dx, dy);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    }
    if (bestIndex === -1 || bestDistance > maxDistance) continue;
    lines.push({
      a: { x: fragment.x, y: fragment.y, z: 0.01 },
      b: { x: crackFrontPoints[bestIndex].x, y: crackFrontPoints[bestIndex].y, z: 0.02 },
    });
  }
  return { lines, fragmentLinkLineCount: lines.length };
}

export function buildCrackRemeshLines(
  state: FractureLatticeRuntimeState,
  crackFrontPoints: readonly FutureNativeDebugPoint[],
): { lines: FutureNativeDebugLine[]; remeshChordCount: number } {
  if (crackFrontPoints.length < 3) return { lines: [], remeshChordCount: 0 };
  const sorted = [...crackFrontPoints].sort((left, right) => {
    const leftAngle = Math.atan2(left.y - state.config.impactY, left.x - state.config.impactX);
    const rightAngle = Math.atan2(right.y - state.config.impactY, right.x - state.config.impactX);
    return leftAngle - rightAngle;
  });
  const lines: FutureNativeDebugLine[] = [];
  const maxDistance = Math.max(0.08, state.config.impactRadius * 1.35);
  for (let index = 0; index < sorted.length; index += 1) {
    const current = sorted[index];
    const next = sorted[(index + 1) % sorted.length];
    const distance = Math.hypot(current.x - next.x, current.y - next.y);
    if (distance > maxDistance) continue;
    lines.push({ a: current, b: next });
  }
  return { lines, remeshChordCount: lines.length };
}

export function buildFragmentBondMidpointPoints(
  state: FractureLatticeRuntimeState,
  detachedFragments: readonly FractureLatticeFragment[],
): FutureNativeDebugPoint[] {
  if (detachedFragments.length === 0) return [];
  const detachedNodeIds = new Set<number>();
  for (const fragment of detachedFragments) {
    for (const nodeId of fragment.nodeIds) detachedNodeIds.add(nodeId);
  }
  const points: FutureNativeDebugPoint[] = [];
  for (const bond of state.bonds) {
    if (!bond.intact || !detachedNodeIds.has(bond.a) || !detachedNodeIds.has(bond.b)) continue;
    points.push({ x: bond.midpointX, y: bond.midpointY, z: 0.009 });
  }
  return points;
}
