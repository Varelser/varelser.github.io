import type { FutureNativeDebugLine, FutureNativeDebugPoint } from './runtimeContracts';
import type { VolumetricDensityTransportRuntimeState } from './volumetric_density_transportState';


export interface VolumetricMeshRow {
  left: FutureNativeDebugPoint;
  innerLeft: FutureNativeDebugPoint;
  center: FutureNativeDebugPoint;
  innerRight: FutureNativeDebugPoint;
  right: FutureNativeDebugPoint;
  span: number;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function sampleField(field: Float32Array, width: number, height: number, x: number, y: number) {
  const sx = clamp(x, 0, width - 1);
  const sy = clamp(y, 0, height - 1);
  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const tx = sx - x0;
  const ty = sy - y0;
  const v00 = field[y0 * width + x0];
  const v10 = field[y0 * width + x1];
  const v01 = field[y1 * width + x0];
  const v11 = field[y1 * width + x1];
  const top = v00 * (1 - tx) + v10 * tx;
  const bottom = v01 * (1 - tx) + v11 * tx;
  return top * (1 - ty) + bottom * ty;
}

export function buildShadedPoint(
  state: VolumetricDensityTransportRuntimeState,
  x: number,
  y: number,
  target?: FutureNativeDebugPoint,
): FutureNativeDebugPoint {
  const density = sampleField(state.density, state.config.resolutionX, state.config.resolutionY, x, y);
  const lighting = sampleField(state.lighting, state.config.resolutionX, state.config.resolutionY, x, y);
  const shadow = sampleField(state.shadow, state.config.resolutionX, state.config.resolutionY, x, y);
  const lightMarch = sampleField(state.lightMarch, state.config.resolutionX, state.config.resolutionY, x, y);
  const lightMarchSecondary = sampleField(state.lightMarchSecondary, state.config.resolutionX, state.config.resolutionY, x, y);
  const rimLight = sampleField(state.rimLight, state.config.resolutionX, state.config.resolutionY, x, y);
  const depth = sampleField(state.volumeDepth, state.config.resolutionX, state.config.resolutionY, x, y);
  const obstacle = sampleField(state.obstacleMask, state.config.resolutionX, state.config.resolutionY, x, y);
  const point = target ?? { x: 0, y: 0, z: 0 };
  point.x = x;
  point.y = y;
  point.z = density * 0.68 + lighting * 0.24 + lightMarch * 0.2 + lightMarchSecondary * 0.16 + rimLight * 0.22 + depth * 0.58 - shadow * 0.16 - obstacle * 0.18;
  return point;
}

function ensurePooledPoint(points: FutureNativeDebugPoint[], index: number) {
  if (!points[index]) {
    points[index] = { x: 0, y: 0, z: 0 };
  }
  return points[index];
}

export function appendPooledPoint(
  points: FutureNativeDebugPoint[],
  cursor: number,
  x: number,
  y: number,
  z: number,
) {
  const point = ensurePooledPoint(points, cursor);
  point.x = x;
  point.y = y;
  point.z = z;
  return { point, cursor: cursor + 1 };
}

export function buildMeshRow(
  state: VolumetricDensityTransportRuntimeState,
  y: number,
  densityThreshold: number,
): VolumetricMeshRow | null {
  let left = -1;
  let right = -1;
  let totalRowDensity = 0;
  let weightedX = 0;
  for (let x = 0; x < state.config.resolutionX; x += 1) {
    const index = y * state.config.resolutionX + x;
    const density = state.density[index];
    if (density < densityThreshold || state.obstacleMask[index] > 0.42) continue;
    if (left < 0) left = x;
    right = x;
    totalRowDensity += density;
    weightedX += x * density;
  }
  if (left < 0 || right - left < 2 || totalRowDensity <= 1e-6) return null;
  const centerX = clamp(weightedX / totalRowDensity, left + 0.75, right - 0.75);
  const span = right - left;
  const innerLeftX = clamp(left + span * 0.28, left + 0.35, centerX - 0.15);
  const innerRightX = clamp(right - span * 0.28, centerX + 0.15, right - 0.35);
  return {
    left: buildShadedPoint(state, left, y),
    innerLeft: buildShadedPoint(state, innerLeftX, y),
    center: buildShadedPoint(state, centerX, y),
    innerRight: buildShadedPoint(state, innerRightX, y),
    right: buildShadedPoint(state, right, y),
    span,
  };
}

export function appendMeshRowBands(lines: FutureNativeDebugLine[], row: VolumetricMeshRow) {
  lines.push({ a: row.left, b: row.innerLeft });
  lines.push({ a: row.innerLeft, b: row.center });
  lines.push({ a: row.center, b: row.innerRight });
  lines.push({ a: row.innerRight, b: row.right });
}

export function appendMeshRowBridge(lines: FutureNativeDebugLine[], a: VolumetricMeshRow, b: VolumetricMeshRow) {
  lines.push({ a: a.left, b: b.left });
  lines.push({ a: a.innerLeft, b: b.innerLeft });
  lines.push({ a: a.center, b: b.center });
  lines.push({ a: a.innerRight, b: b.innerRight });
  lines.push({ a: a.right, b: b.right });
  lines.push({ a: a.left, b: b.innerLeft });
  lines.push({ a: a.innerLeft, b: b.center });
  lines.push({ a: a.center, b: b.innerRight });
  lines.push({ a: a.innerRight, b: b.right });
}

export function collectObstacleBoundary(
  state: VolumetricDensityTransportRuntimeState,
  mask: Float32Array,
  threshold: number,
  targets?: { left?: FutureNativeDebugPoint[]; right?: FutureNativeDebugPoint[] },
): { left: FutureNativeDebugPoint[]; right: FutureNativeDebugPoint[] } {
  const left = targets?.left ?? [];
  const right = targets?.right ?? [];
  let cursor = 0;
  for (let y = 1; y < state.config.resolutionY - 1; y += 2) {
    let minX = -1;
    let maxX = -1;
    for (let x = 0; x < state.config.resolutionX; x += 1) {
      const index = y * state.config.resolutionX + x;
      if (mask[index] < threshold) continue;
      if (minX < 0) minX = x;
      maxX = x;
    }
    if (minX >= 0) {
      const leftPoint = ensurePooledPoint(left, cursor);
      leftPoint.x = minX;
      leftPoint.y = y;
      leftPoint.z = mask[y * state.config.resolutionX + minX];
      const rightPoint = ensurePooledPoint(right, cursor);
      rightPoint.x = maxX;
      rightPoint.y = y;
      rightPoint.z = mask[y * state.config.resolutionX + maxX];
      cursor += 1;
    }
  }
  left.length = cursor;
  right.length = cursor;
  return { left, right };
}

export function appendBoundaryLines(lines: FutureNativeDebugLine[], left: FutureNativeDebugPoint[], right: FutureNativeDebugPoint[]): number {
  let count = 0;
  for (let index = 0; index < left.length - 1; index += 1) {
    lines.push({ a: left[index], b: left[index + 1] });
    lines.push({ a: right[index], b: right[index + 1] });
    count += 2;
  }
  if (left.length > 0) {
    lines.push({ a: left[0], b: right[0] });
    lines.push({ a: left[left.length - 1], b: right[right.length - 1] });
    count += 2;
  }
  return count;
}

export function appendBoundaryBridges(
  lines: FutureNativeDebugLine[],
  primaryLeft: FutureNativeDebugPoint[],
  primaryRight: FutureNativeDebugPoint[],
  secondaryLeft: FutureNativeDebugPoint[],
  secondaryRight: FutureNativeDebugPoint[],
): number {
  const bridgeable = Math.min(primaryLeft.length, secondaryLeft.length);
  if (bridgeable <= 0) return 0;
  const bridgeCount = Math.min(4, bridgeable);
  let count = 0;
  for (let step = 0; step < bridgeCount; step += 1) {
    const index = Math.min(bridgeable - 1, Math.round((bridgeable - 1) * (bridgeCount <= 1 ? 0 : step / (bridgeCount - 1))));
    const primaryCenter = {
      x: ((primaryLeft[index] ?? primaryLeft[0]).x + (primaryRight[index] ?? primaryRight[0]).x) * 0.5,
      y: ((primaryLeft[index] ?? primaryLeft[0]).y + (primaryRight[index] ?? primaryRight[0]).y) * 0.5,
      z: (((primaryLeft[index] ?? primaryLeft[0]).z ?? 0) + ((primaryRight[index] ?? primaryRight[0]).z ?? 0)) * 0.5,
    };
    const secondaryCenter = {
      x: ((secondaryLeft[index] ?? secondaryLeft[0]).x + (secondaryRight[index] ?? secondaryRight[0]).x) * 0.5,
      y: ((secondaryLeft[index] ?? secondaryLeft[0]).y + (secondaryRight[index] ?? secondaryRight[0]).y) * 0.5,
      z: (((secondaryLeft[index] ?? secondaryLeft[0]).z ?? 0) + ((secondaryRight[index] ?? secondaryRight[0]).z ?? 0)) * 0.5,
    };
    lines.push({ a: primaryCenter, b: secondaryCenter });
    count += 1;
  }
  return count;
}


export function collectFieldPeakLine(
  state: VolumetricDensityTransportRuntimeState,
  field: Float32Array,
  threshold: number,
  xStart: number,
  xEnd: number,
  target?: FutureNativeDebugPoint[],
): FutureNativeDebugPoint[] {
  const points = target ?? [];
  const minX = Math.max(0, Math.min(xStart, xEnd));
  const maxX = Math.min(state.config.resolutionX - 1, Math.max(xStart, xEnd));
  let cursor = 0;
  for (let y = 1; y < state.config.resolutionY - 1; y += 2) {
    let bestX = -1;
    let bestValue = 0;
    for (let x = minX; x <= maxX; x += 1) {
      const index = y * state.config.resolutionX + x;
      if (field[index] < threshold || state.obstacleMask[index] > 0.54) continue;
      if (field[index] > bestValue) {
        bestValue = field[index];
        bestX = x;
      }
    }
    if (bestX >= 0) {
      const point = buildShadedPoint(state, bestX, y, points[cursor] ?? { x: 0, y: 0, z: 0 });
      point.z = (point.z ?? 0) + bestValue * 0.26;
      points[cursor] = point;
      cursor += 1;
    }
  }
  points.length = cursor;
  return points;
}

export function centroidOfPoints(points: FutureNativeDebugPoint[], target?: FutureNativeDebugPoint): FutureNativeDebugPoint | null {
  if (points.length === 0) return null;
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumZ += point.z ?? 0;
  }
  const centroid = target ?? { x: 0, y: 0, z: 0 };
  centroid.x = sumX / points.length;
  centroid.y = sumY / points.length;
  centroid.z = sumZ / points.length;
  return centroid;
}


export function collectCentroidSamples(
  state: VolumetricDensityTransportRuntimeState,
  field: Float32Array,
  threshold: number,
  yStep: number,
  target?: FutureNativeDebugPoint[],
): FutureNativeDebugPoint[] {
  const points = target ?? [];
  let cursor = 0;
  for (let y = 1; y < state.config.resolutionY - 1; y += Math.max(1, yStep)) {
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    let count = 0;
    for (let x = 1; x < state.config.resolutionX - 1; x += 1) {
      const index = y * state.config.resolutionX + x;
      if (field[index] < threshold || state.obstacleMask[index] > 0.58) continue;
      const point = buildShadedPoint(state, x, y);
      point.z = (point.z ?? 0) + field[index] * 0.18;
      sumX += point.x;
      sumY += point.y;
      sumZ += point.z ?? 0;
      count += 1;
    }
    if (count > 0) {
      const point = points[cursor] ?? { x: 0, y: 0, z: 0 };
      point.x = sumX / count;
      point.y = sumY / count;
      point.z = sumZ / count;
      points[cursor] = point;
      cursor += 1;
    }
  }
  points.length = cursor;
  return points;
}
export function appendPolyline(lines: FutureNativeDebugLine[], points: FutureNativeDebugPoint[]): number {
  let count = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    lines.push({ a: points[index], b: points[index + 1] });
    count += 1;
  }
  return count;
}

function ensurePooledLine(lines: FutureNativeDebugLine[], index: number) {
  if (!lines[index]) {
    lines[index] = {
      a: { x: 0, y: 0, z: 0 },
      b: { x: 0, y: 0, z: 0 },
    };
  }
  return lines[index];
}

export function appendPooledLine(
  lines: FutureNativeDebugLine[],
  cursor: number,
  a: FutureNativeDebugPoint,
  b: FutureNativeDebugPoint,
) {
  const line = ensurePooledLine(lines, cursor);
  line.a = a;
  line.b = b;
  return cursor + 1;
}

export function appendPooledLineCoords(
  lines: FutureNativeDebugLine[],
  cursor: number,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
) {
  const line = ensurePooledLine(lines, cursor);
  line.a.x = ax;
  line.a.y = ay;
  line.a.z = az;
  line.b.x = bx;
  line.b.y = by;
  line.b.z = bz;
  return cursor + 1;
}

export function appendPooledPolyline(
  lines: FutureNativeDebugLine[],
  cursor: number,
  points: FutureNativeDebugPoint[],
) {
  let nextCursor = cursor;
  let count = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    nextCursor = appendPooledLine(lines, nextCursor, points[index], points[index + 1]);
    count += 1;
  }
  return { cursor: nextCursor, count };
}

export function appendPooledBoundaryLines(
  lines: FutureNativeDebugLine[],
  cursor: number,
  left: FutureNativeDebugPoint[],
  right: FutureNativeDebugPoint[],
) {
  let nextCursor = cursor;
  let count = 0;
  for (let index = 0; index < left.length - 1; index += 1) {
    nextCursor = appendPooledLine(lines, nextCursor, left[index], left[index + 1]);
    nextCursor = appendPooledLine(lines, nextCursor, right[index], right[index + 1]);
    count += 2;
  }
  if (left.length > 0) {
    nextCursor = appendPooledLine(lines, nextCursor, left[0], right[0]);
    nextCursor = appendPooledLine(lines, nextCursor, left[left.length - 1], right[right.length - 1]);
    count += 2;
  }
  return { cursor: nextCursor, count };
}

export function appendPooledBoundaryBridges(
  lines: FutureNativeDebugLine[],
  cursor: number,
  primaryLeft: FutureNativeDebugPoint[],
  primaryRight: FutureNativeDebugPoint[],
  secondaryLeft: FutureNativeDebugPoint[],
  secondaryRight: FutureNativeDebugPoint[],
) {
  const bridgeable = Math.min(primaryLeft.length, secondaryLeft.length);
  if (bridgeable <= 0) return { cursor, count: 0 };
  const bridgeCount = Math.min(4, bridgeable);
  let nextCursor = cursor;
  let count = 0;
  for (let step = 0; step < bridgeCount; step += 1) {
    const index = Math.min(bridgeable - 1, Math.round((bridgeable - 1) * (bridgeCount <= 1 ? 0 : step / (bridgeCount - 1))));
    const primaryLeftPoint = primaryLeft[index] ?? primaryLeft[0];
    const primaryRightPoint = primaryRight[index] ?? primaryRight[0];
    const secondaryLeftPoint = secondaryLeft[index] ?? secondaryLeft[0];
    const secondaryRightPoint = secondaryRight[index] ?? secondaryRight[0];
    nextCursor = appendPooledLineCoords(
      lines,
      nextCursor,
      (primaryLeftPoint.x + primaryRightPoint.x) * 0.5,
      (primaryLeftPoint.y + primaryRightPoint.y) * 0.5,
      ((primaryLeftPoint.z ?? 0) + (primaryRightPoint.z ?? 0)) * 0.5,
      (secondaryLeftPoint.x + secondaryRightPoint.x) * 0.5,
      (secondaryLeftPoint.y + secondaryRightPoint.y) * 0.5,
      ((secondaryLeftPoint.z ?? 0) + (secondaryRightPoint.z ?? 0)) * 0.5,
    );
    count += 1;
  }
  return { cursor: nextCursor, count };
}
