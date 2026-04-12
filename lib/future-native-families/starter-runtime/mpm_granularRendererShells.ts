import type { FutureNativeDebugLine, FutureNativeDebugPoint } from './runtimeContracts';
import type { MpmGranularRuntimeState } from './mpm_granularSolver';

type ShellOverlayEntry = readonly [number, { point: FutureNativeDebugPoint }];

function buildOverlayShell(
  runtime: MpmGranularRuntimeState,
  entries: ShellOverlayEntry[],
  options?: {
    zOffset?: number;
    maxSegments?: number;
  },
): {
  lines: FutureNativeDebugLine[];
  cellCount: number;
  segmentCount: number;
  bandCount: number;
} {
  if (entries.length <= 0) return { lines: [], cellCount: 0, segmentCount: 0, bandCount: 0 };
  const zOffset = options?.zOffset ?? 0.012;
  const maxSegments = Math.max(8, options?.maxSegments ?? 160);
  const halfWidth = runtime.grid.cellWidth * 0.5;
  const halfHeight = runtime.grid.cellHeight * 0.5;
  const selectedIndices = new Set<number>();
  const bands = new Set<number>();
  for (const [index] of entries) {
    selectedIndices.add(index);
    bands.add(Math.floor(index / runtime.grid.resolution));
  }

  const lines: FutureNativeDebugLine[] = [];
  const directions = [
    { dc: 0, dr: 1, ax: -halfWidth, ay: halfHeight, bx: halfWidth, by: halfHeight },
    { dc: 1, dr: 0, ax: halfWidth, ay: -halfHeight, bx: halfWidth, by: halfHeight },
    { dc: 0, dr: -1, ax: -halfWidth, ay: -halfHeight, bx: halfWidth, by: -halfHeight },
    { dc: -1, dr: 0, ax: -halfWidth, ay: -halfHeight, bx: -halfWidth, by: halfHeight },
  ];

  for (const [index, overlay] of entries) {
    const row = Math.floor(index / runtime.grid.resolution);
    const col = index % runtime.grid.resolution;
    for (const direction of directions) {
      const neighborCol = col + direction.dc;
      const neighborRow = row + direction.dr;
      if (neighborCol >= 0 && neighborCol < runtime.grid.resolution && neighborRow >= 0 && neighborRow < runtime.grid.resolution) {
        const neighborIndex = neighborRow * runtime.grid.resolution + neighborCol;
        if (selectedIndices.has(neighborIndex)) continue;
      }
      const z = (overlay.point.z ?? 0) + zOffset;
      lines.push({
        a: { x: overlay.point.x + direction.ax, y: overlay.point.y + direction.ay, z },
        b: { x: overlay.point.x + direction.bx, y: overlay.point.y + direction.by, z },
      });
      if (lines.length >= maxSegments) return { lines, cellCount: entries.length, segmentCount: lines.length, bandCount: bands.size };
    }
  }

  return { lines, cellCount: entries.length, segmentCount: lines.length, bandCount: bands.size };
}

export function buildPackedRegionRemesh(
  runtime: MpmGranularRuntimeState,
  entries: ShellOverlayEntry[],
): {
  lines: FutureNativeDebugLine[];
  cellCount: number;
  remeshLineCount: number;
  shellSegmentCount: number;
  bandCount: number;
} {
  if (entries.length <= 0) return { lines: [], cellCount: 0, remeshLineCount: 0, shellSegmentCount: 0, bandCount: 0 };
  const shell = buildOverlayShell(runtime, entries, { zOffset: 0.018, maxSegments: 132 });
  const selectedIndices = new Set(entries.map(([index]) => index));
  const overlayByIndex = new Map(entries);
  const lines = [...shell.lines];
  const neighborOffsets: Array<[number, number]> = [[1, 0], [0, 1], [1, 1], [-1, 1]];
  let remeshLineCount = 0;

  for (const [index, overlay] of entries) {
    const row = Math.floor(index / runtime.grid.resolution);
    const col = index % runtime.grid.resolution;
    for (const [dc, dr] of neighborOffsets) {
      const neighborCol = col + dc;
      const neighborRow = row + dr;
      if (neighborCol < 0 || neighborCol >= runtime.grid.resolution || neighborRow < 0 || neighborRow >= runtime.grid.resolution) continue;
      const neighborIndex = neighborRow * runtime.grid.resolution + neighborCol;
      if (!selectedIndices.has(neighborIndex)) continue;
      const other = overlayByIndex.get(neighborIndex);
      if (!other) continue;
      lines.push({
        a: { x: overlay.point.x, y: overlay.point.y, z: (overlay.point.z ?? 0) + 0.022 },
        b: { x: other.point.x, y: other.point.y, z: (other.point.z ?? 0) + 0.022 },
      });
      remeshLineCount += 1;
      if (remeshLineCount >= 96) return { lines, cellCount: entries.length, remeshLineCount, shellSegmentCount: shell.segmentCount, bandCount: shell.bandCount };
    }
  }

  return { lines, cellCount: entries.length, remeshLineCount, shellSegmentCount: shell.segmentCount, bandCount: shell.bandCount };
}

export function buildConstitutiveShells(
  runtime: MpmGranularRuntimeState,
  constitutiveEntries: ShellOverlayEntry[],
  hardeningEntries: ShellOverlayEntry[],
  viscosityEntries: ShellOverlayEntry[],
  yieldEntries: ShellOverlayEntry[],
) {
  return {
    constitutiveShell: buildOverlayShell(runtime, constitutiveEntries, { zOffset: 0.024, maxSegments: 148 }),
    hardeningShell: buildOverlayShell(runtime, hardeningEntries, { zOffset: 0.026, maxSegments: 72 }),
    viscosityShell: buildOverlayShell(runtime, viscosityEntries, { zOffset: 0.028, maxSegments: 72 }),
    yieldShell: buildOverlayShell(runtime, yieldEntries, { zOffset: 0.03, maxSegments: 84 }),
  };
}
