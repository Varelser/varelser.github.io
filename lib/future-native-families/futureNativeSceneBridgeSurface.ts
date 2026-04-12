import {
  clamp,
  type FutureNativeSceneSurfaceMeshDescriptor,
} from './futureNativeSceneBridgeShared';
import type { PbdClothRuntimeState } from './starter-runtime/pbd_clothSolver';
import type { PbdMembraneRuntimeState } from './starter-runtime/pbd_membraneSolver';
import type { PbdSoftbodyRuntimeState } from './starter-runtime/pbd_softbodySolver';

function buildGridBoundary(width: number, height: number): number[] {
  const boundary: number[] = [];
  for (let x = 0; x < width; x += 1) boundary.push(x);
  for (let y = 1; y < height; y += 1) boundary.push(y * width + (width - 1));
  for (let x = width - 2; x >= 0; x -= 1) boundary.push((height - 1) * width + x);
  for (let y = height - 2; y > 0; y -= 1) boundary.push(y * width);
  return boundary;
}

function buildGridHullLines(boundary: number[], positions: Float32Array): Float32Array {
  const hullLines = new Float32Array(boundary.length * 6);
  for (let i = 0; i < boundary.length; i += 1) {
    const a = boundary[i];
    const b = boundary[(i + 1) % boundary.length];
    hullLines[i * 6 + 0] = positions[a * 3 + 0];
    hullLines[i * 6 + 1] = positions[a * 3 + 1];
    hullLines[i * 6 + 2] = positions[a * 3 + 2];
    hullLines[i * 6 + 3] = positions[b * 3 + 0];
    hullLines[i * 6 + 4] = positions[b * 3 + 1];
    hullLines[i * 6 + 5] = positions[b * 3 + 2];
  }
  return hullLines;
}

function buildGridSurfaceIndices(width: number, height: number, vertexCount: number): Uint16Array | Uint32Array {
  const cellCount = Math.max(0, (width - 1) * (height - 1));
  const triangleIndexCount = cellCount * 6;
  const indices = vertexCount > 65535 ? new Uint32Array(triangleIndexCount) : new Uint16Array(triangleIndexCount);
  let cursor = 0;
  for (let y = 0; y < height - 1; y += 1) {
    for (let x = 0; x < width - 1; x += 1) {
      const a = y * width + x;
      const b = a + 1;
      const d = a + width;
      const c = d + 1;
      indices[cursor++] = a;
      indices[cursor++] = b;
      indices[cursor++] = d;
      indices[cursor++] = b;
      indices[cursor++] = c;
      indices[cursor++] = d;
    }
  }
  return indices;
}

function buildActiveGridSurfaceIndices(width: number, height: number, vertexCount: number, activeEdgeKeys: Set<string>): Uint16Array | Uint32Array {
  const values: number[] = [];
  for (let y = 0; y < height - 1; y += 1) {
    for (let x = 0; x < width - 1; x += 1) {
      const a = y * width + x;
      const b = a + 1;
      const d = a + width;
      const c = d + 1;
      const top = a < b ? `${a}:${b}` : `${b}:${a}`;
      const bottom = d < c ? `${d}:${c}` : `${c}:${d}`;
      const left = a < d ? `${a}:${d}` : `${d}:${a}`;
      const right = b < c ? `${b}:${c}` : `${c}:${b}`;
      if (!activeEdgeKeys.has(top) || !activeEdgeKeys.has(bottom) || !activeEdgeKeys.has(left) || !activeEdgeKeys.has(right)) continue;
      values.push(a, b, d, b, c, d);
    }
  }
  const typed = vertexCount > 65535 ? new Uint32Array(values.length) : new Uint16Array(values.length);
  typed.set(values);
  return typed;
}

function buildActiveHullLines(boundary: number[], positions: Float32Array, activeEdgeKeys: Set<string>): Float32Array {
  const values: number[] = [];
  for (let i = 0; i < boundary.length; i += 1) {
    const a = boundary[i];
    const b = boundary[(i + 1) % boundary.length];
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (!activeEdgeKeys.has(key)) continue;
    values.push(
      positions[a * 3 + 0], positions[a * 3 + 1], positions[a * 3 + 2],
      positions[b * 3 + 0], positions[b * 3 + 1], positions[b * 3 + 2],
    );
  }
  return new Float32Array(values);
}

export function buildClothSurfaceMesh(runtime: PbdClothRuntimeState): FutureNativeSceneSurfaceMeshDescriptor {
  const particleCount = runtime.particles.length;
  const positions = new Float32Array(particleCount * 3);
  let centerX = 0;
  let centerY = 0;
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const particle of runtime.particles) {
    centerX += particle.x;
    centerY += particle.y;
    minX = Math.min(minX, particle.x);
    maxX = Math.max(maxX, particle.x);
    minY = Math.min(minY, particle.y);
    maxY = Math.max(maxY, particle.y);
  }
  centerX /= Math.max(1, particleCount);
  centerY /= Math.max(1, particleCount);

  const spanY = Math.max(0.0001, maxY - minY);
  const width = runtime.config.width;
  const height = runtime.config.height;
  const sag = clamp((centerY - minY) / spanY, 0.12, 1.2);
  const drapeAmplitude = clamp(0.012 + sag * 0.05 + runtime.windImpulse * 0.09 + runtime.choreographyDrift * 0.11, 0.01, 0.16);
  const rippleAmplitude = clamp(0.006 + runtime.config.windPulse * 0.018 + runtime.pressureImpulse * 0.03, 0.004, 0.06);
  const tearOpening = clamp(runtime.tornFrontLinks / Math.max(1, runtime.links.length) * 0.38, 0, 0.08);
  const rimLift = clamp(runtime.obstacleImpulse * 0.08 + runtime.config.pinGroupStrength * 0.02, 0.002, 0.04);
  let maxRadius = 0.0001;
  let zMin = Number.POSITIVE_INFINITY;
  let zMax = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < particleCount; i += 1) {
    const particle = runtime.particles[i];
    const xIndex = i % width;
    const yIndex = Math.floor(i / width);
    const u = width <= 1 ? 0 : xIndex / (width - 1);
    const v = height <= 1 ? 0 : yIndex / (height - 1);
    const gridX = u * 2 - 1;
    const gridY = v * 2 - 1;
    const edgeWeight = Math.max(Math.abs(gridX), Math.abs(gridY));
    const drape = Math.max(0, 1 - Math.abs(gridX) * 0.72) * Math.pow(v, 1.15);
    const ripple = Math.sin((particle.x - centerX) * 10.5 + runtime.frame * 0.09 + v * 3.4) * Math.cos((particle.y - centerY) * 8.2 - runtime.frame * 0.05 + u * 2.6);
    const foldBias = Math.sin((u * Math.PI * 3.2) + runtime.frame * 0.04) * (0.35 + v * 0.65);
    const tearOffset = xIndex > Math.floor(width * 0.58) && yIndex > Math.floor(height * 0.44) ? tearOpening * (0.35 + v * 0.65) : 0;
    const edgeRim = Math.max(0, edgeWeight - 0.7) / 0.3;
    const z = drape * drapeAmplitude + ripple * rippleAmplitude * (0.4 + v * 0.9) + foldBias * rippleAmplitude * 0.36 + edgeRim * rimLift + tearOffset;
    maxRadius = Math.max(maxRadius, Math.hypot(particle.x - centerX, particle.y - centerY));
    positions[i * 3 + 0] = particle.x;
    positions[i * 3 + 1] = particle.y;
    positions[i * 3 + 2] = z;
    zMin = Math.min(zMin, z);
    zMax = Math.max(zMax, z);
  }

  const activeEdgeKeys = new Set<string>();
  for (const link of runtime.links) {
    if (link.active === false) continue;
    if (link.kind !== 'structural') continue;
    const key = link.a < link.b ? `${link.a}:${link.b}` : `${link.b}:${link.a}`;
    activeEdgeKeys.add(key);
  }

  const boundary = buildGridBoundary(width, height);
  const hullLines = buildActiveHullLines(boundary, positions, activeEdgeKeys);
  const indices = buildActiveGridSurfaceIndices(width, height, particleCount, activeEdgeKeys);

  return {
    positions,
    indices,
    hullLines,
    surfaceKind: 'cloth',
    triangleCount: Math.floor(indices.length / 3),
    hullSegmentCount: Math.floor(hullLines.length / 6),
    surfaceCenterX: centerX,
    surfaceCenterY: centerY,
    surfaceMaxRadius: maxRadius,
    zMin,
    zMax,
  };
}

export function buildMembraneSurfaceMesh(runtime: PbdMembraneRuntimeState): FutureNativeSceneSurfaceMeshDescriptor {
  const particleCount = runtime.particles.length;
  const positions = new Float32Array(particleCount * 3);
  let centerX = 0;
  let centerY = 0;
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const particle of runtime.particles) {
    centerX += particle.x;
    centerY += particle.y;
    minX = Math.min(minX, particle.x);
    maxX = Math.max(maxX, particle.x);
    minY = Math.min(minY, particle.y);
    maxY = Math.max(maxY, particle.y);
  }
  centerX /= Math.max(1, particleCount);
  centerY /= Math.max(1, particleCount);

  const spanX = Math.max(0.0001, maxX - minX);
  const spanY = Math.max(0.0001, maxY - minY);
  const width = runtime.config.width;
  const height = runtime.config.height;
  const bulgeAmplitude = clamp(
    0.02
      + runtime.config.inflation * 0.08
      + runtime.config.pressureStrength * 0.06
      + runtime.pressureImpulse * 0.16
      + runtime.windImpulse * 0.06,
    0.018,
    0.16,
  );
  const waveAmplitude = clamp(0.004 + runtime.config.windPulse * 0.018 + runtime.choreographyDrift * 0.04, 0.003, 0.035);
  const rimLift = clamp(runtime.config.boundaryTension * 0.032 + runtime.obstacleImpulse * 0.014, 0.002, 0.045);
  let maxRadius = 0.0001;
  let zMin = Number.POSITIVE_INFINITY;
  let zMax = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < particleCount; i += 1) {
    const particle = runtime.particles[i];
    const xIndex = i % width;
    const yIndex = Math.floor(i / width);
    const u = width <= 1 ? 0 : xIndex / (width - 1);
    const v = height <= 1 ? 0 : yIndex / (height - 1);
    const gridX = u * 2 - 1;
    const gridY = v * 2 - 1;
    const radial = Math.sqrt(gridX * gridX + gridY * gridY);
    const dome = Math.max(0, 1 - radial * radial * 0.68);
    const fold = Math.sin((particle.x - centerX) * 9.5 + runtime.frame * 0.08) * Math.cos((particle.y - centerY) * 7.5 - runtime.frame * 0.06);
    const edgeBias = Math.max(Math.abs((particle.x - centerX) / spanX), Math.abs((particle.y - centerY) / spanY));
    const rim = Math.max(0, 1 - Math.pow(Math.max(0, 1 - edgeBias), 2));
    const z = dome * bulgeAmplitude + fold * waveAmplitude * dome + rim * rimLift;
    maxRadius = Math.max(maxRadius, Math.hypot(particle.x - centerX, particle.y - centerY));
    positions[i * 3 + 0] = particle.x;
    positions[i * 3 + 1] = particle.y;
    positions[i * 3 + 2] = z;
    zMin = Math.min(zMin, z);
    zMax = Math.max(zMax, z);
  }

  const boundary = buildGridBoundary(width, height);
  const hullLines = buildGridHullLines(boundary, positions);
  const indices = buildGridSurfaceIndices(width, height, particleCount);

  return {
    positions,
    indices,
    hullLines,
    surfaceKind: 'membrane',
    triangleCount: Math.max(0, (width - 1) * (height - 1) * 2),
    hullSegmentCount: boundary.length,
    surfaceCenterX: centerX,
    surfaceCenterY: centerY,
    surfaceMaxRadius: maxRadius,
    zMin,
    zMax,
  };
}

export function buildSoftbodySurfaceMesh(runtime: PbdSoftbodyRuntimeState): FutureNativeSceneSurfaceMeshDescriptor {
  const particleCount = runtime.particles.length;
  const positions = new Float32Array(particleCount * 3);
  let centerX = 0;
  let centerY = 0;
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxRestRadius = 0.0001;
  let maxRadius = 0.0001;
  let zMin = Number.POSITIVE_INFINITY;
  let zMax = Number.NEGATIVE_INFINITY;

  for (const particle of runtime.particles) {
    centerX += particle.x;
    centerY += particle.y;
    minX = Math.min(minX, particle.x);
    maxX = Math.max(maxX, particle.x);
    minY = Math.min(minY, particle.y);
    maxY = Math.max(maxY, particle.y);
    maxRestRadius = Math.max(maxRestRadius, Math.hypot(particle.restOffsetX, particle.restOffsetY));
  }
  centerX /= Math.max(1, particleCount);
  centerY /= Math.max(1, particleCount);
  const spanX = Math.max(0.0001, maxX - minX);
  const spanY = Math.max(0.0001, maxY - minY);
  const domeAmplitude = clamp(
    0.03
      + runtime.config.pressureStrength * 0.18
      + runtime.config.volumePreservation * 0.07
      + runtime.pressureImpulse * 0.12
      + runtime.volumeConstraintError * 0.35,
    0.04,
    0.22,
  );
  const rimLift = clamp(runtime.config.shellTension * 0.03 + runtime.obstacleImpulse * 0.012, 0.002, 0.04);

  for (let i = 0; i < particleCount; i += 1) {
    const particle = runtime.particles[i];
    const radial = Math.hypot(particle.restOffsetX, particle.restOffsetY) / maxRestRadius;
    const dome = Math.max(0, 1 - radial * radial);
    const localX = (particle.x - centerX) / spanX;
    const localY = (particle.y - centerY) / spanY;
    const edgeBias = Math.max(Math.abs(localX), Math.abs(localY));
    const shellProfile = Math.max(0, 1 - edgeBias * edgeBias);
    const z = dome * domeAmplitude + shellProfile * rimLift;
    maxRadius = Math.max(maxRadius, Math.hypot(particle.x - centerX, particle.y - centerY));
    positions[i * 3 + 0] = particle.x;
    positions[i * 3 + 1] = particle.y;
    positions[i * 3 + 2] = z;
    zMin = Math.min(zMin, z);
    zMax = Math.max(zMax, z);
  }

  const triangleIndexCount = runtime.cells.length * 6;
  const indices = particleCount > 65535 ? new Uint32Array(triangleIndexCount) : new Uint16Array(triangleIndexCount);
  let cursor = 0;
  for (const cell of runtime.cells) {
    const [a, b, c, d] = cell.indices;
    indices[cursor++] = a;
    indices[cursor++] = b;
    indices[cursor++] = d;
    indices[cursor++] = b;
    indices[cursor++] = c;
    indices[cursor++] = d;
  }

  const { width, height } = runtime.config;
  const boundary = buildGridBoundary(width, height);
  const hullLines = buildGridHullLines(boundary, positions);

  return {
    positions,
    indices,
    hullLines,
    surfaceKind: 'softbody',
    triangleCount: runtime.cells.length * 2,
    hullSegmentCount: boundary.length,
    surfaceCenterX: centerX,
    surfaceCenterY: centerY,
    surfaceMaxRadius: maxRadius,
    zMin,
    zMax,
  };
}
