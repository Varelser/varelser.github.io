import { Color } from 'three';
import type { FutureNativeSceneBridgeDescriptor } from './future-native-families/futureNativeSceneRendererBridge';

const EMPTY_FLOAT32 = new Float32Array(0);
const EMPTY_INDEX = new Uint16Array(0);

export interface FutureNativeDescriptorPacket {
  familyId: string;
  bindingMode: string;
  summary: string;
  pointCount: number;
  lineCount: number;
  stats: Record<string, number>;
  sceneScale: number;
  surfaceVisible: boolean;
  surfacePositions: Float32Array;
  surfaceColors: Float32Array;
  surfaceIndices: Uint16Array | Uint32Array;
  surfaceOpacity: number;
  pointsVisible: boolean;
  pointPositions: Float32Array;
  pointColor: string;
  pointOpacity: number;
  pointSize: number;
  linesVisible: boolean;
  linePositions: Float32Array;
  lineColor: string;
  lineOpacity: number;
  hullVisible: boolean;
  hullPositions: Float32Array;
  hullColor: string;
  hullOpacity: number;
}

function buildPointArray(descriptor: FutureNativeSceneBridgeDescriptor, target?: Float32Array): Float32Array {
  const points = descriptor.payload.points ?? [];
  const expectedLength = points.length * 3;
  const result = target && target.length === expectedLength ? target : new Float32Array(expectedLength);
  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    result[i * 3 + 0] = point.x;
    result[i * 3 + 1] = point.y;
    result[i * 3 + 2] = point.z ?? 0;
  }
  return result;
}

function buildLineArray(descriptor: FutureNativeSceneBridgeDescriptor, target?: Float32Array): Float32Array {
  const lines = descriptor.payload.lines ?? [];
  const expectedLength = lines.length * 6;
  const result = target && target.length === expectedLength ? target : new Float32Array(expectedLength);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    result[i * 6 + 0] = line.a.x;
    result[i * 6 + 1] = line.a.y;
    result[i * 6 + 2] = line.a.z ?? 0;
    result[i * 6 + 3] = line.b.x;
    result[i * 6 + 4] = line.b.y;
    result[i * 6 + 5] = line.b.z ?? 0;
  }
  return result;
}

function buildSurfaceColorArray(descriptor: FutureNativeSceneBridgeDescriptor, target?: Float32Array): Float32Array {
  const mesh = descriptor.surfaceMesh;
  if (!mesh) return EMPTY_FLOAT32;
  const colors = target && target.length === mesh.positions.length ? target : new Float32Array(mesh.positions.length);
  const base = new Color(descriptor.color);
  const highlight = new Color('#ffffff');
  const cool = new Color('#9ddcff');
  const warm = new Color('#ffe4cf');
  const centerX = mesh.surfaceCenterX;
  const centerY = mesh.surfaceCenterY;
  const maxRadius = Math.max(0.0001, mesh.surfaceMaxRadius);
  const depthRange = Math.max(0.0001, mesh.zMax - mesh.zMin);
  const membraneBias = mesh.surfaceKind === 'membrane' ? 0.12 : mesh.surfaceKind === 'cloth' ? 0.09 : 0.04;
  for (let i = 0; i < mesh.positions.length; i += 3) {
    const x = mesh.positions[i + 0];
    const y = mesh.positions[i + 1];
    const z = mesh.positions[i + 2];
    const zNorm = (z - mesh.zMin) / depthRange;
    const radial = Math.min(1, Math.hypot(x - centerX, y - centerY) / maxRadius);
    const shellFocus = 1 - radial;
    const highlightMix = Math.min(0.55, zNorm * 0.38 + shellFocus * 0.14 + membraneBias);
    const coolMix = Math.min(0.22, (1 - zNorm) * 0.12 + radial * 0.1 + membraneBias * 0.5);
    const warmMix = mesh.surfaceKind === 'cloth' ? Math.min(0.2, shellFocus * 0.12 + zNorm * 0.08) : 0;
    const brightness = 0.72 + zNorm * 0.2 + shellFocus * (mesh.surfaceKind === 'softbody' ? 0.16 : mesh.surfaceKind === 'cloth' ? 0.12 : 0.08);

    const highlightedR = base.r * (1 - highlightMix) + highlight.r * highlightMix;
    const highlightedG = base.g * (1 - highlightMix) + highlight.g * highlightMix;
    const highlightedB = base.b * (1 - highlightMix) + highlight.b * highlightMix;
    const cooledR = highlightedR * (1 - coolMix) + cool.r * coolMix;
    const cooledG = highlightedG * (1 - coolMix) + cool.g * coolMix;
    const cooledB = highlightedB * (1 - coolMix) + cool.b * coolMix;
    const mixedR = cooledR * (1 - warmMix) + warm.r * warmMix;
    const mixedG = cooledG * (1 - warmMix) + warm.g * warmMix;
    const mixedB = cooledB * (1 - warmMix) + warm.b * warmMix;

    colors[i + 0] = Math.min(1, mixedR * brightness);
    colors[i + 1] = Math.min(1, mixedG * brightness);
    colors[i + 2] = Math.min(1, mixedB * brightness);
  }
  return colors;
}

export interface FutureNativeDescriptorPacketReuse {
  surfaceColors?: Float32Array;
  pointPositions?: Float32Array;
  linePositions?: Float32Array;
}

export function buildFutureNativeDescriptorPacket(
  descriptor: FutureNativeSceneBridgeDescriptor,
  reuse?: FutureNativeDescriptorPacketReuse,
): FutureNativeDescriptorPacket {
  const surfaceVisible = Boolean(descriptor.surfaceMesh?.triangleCount);
  const pointsVisible = descriptor.pointCount > 0;
  const linesVisible = descriptor.lineCount > 0;
  const hullVisible = Boolean(descriptor.surfaceMesh?.hullSegmentCount);
  return {
    familyId: descriptor.familyId,
    bindingMode: descriptor.bindingMode,
    summary: descriptor.summary,
    pointCount: descriptor.pointCount,
    lineCount: descriptor.lineCount,
    stats: { ...descriptor.stats },
    sceneScale: descriptor.sceneScale,
    surfaceVisible,
    surfacePositions: descriptor.surfaceMesh?.positions ?? EMPTY_FLOAT32,
    surfaceColors: buildSurfaceColorArray(descriptor, reuse?.surfaceColors),
    surfaceIndices: descriptor.surfaceMesh?.indices ?? EMPTY_INDEX,
    surfaceOpacity: descriptor.surfaceMesh
      ? descriptor.surfaceMesh.surfaceKind === 'softbody'
        ? Math.min(0.66, Math.max(0.22, descriptor.opacity * 0.58))
        : descriptor.surfaceMesh.surfaceKind === 'cloth'
          ? Math.min(0.54, Math.max(0.18, descriptor.opacity * 0.48))
          : Math.min(0.58, Math.max(0.2, descriptor.opacity * 0.54))
      : 0,
    pointsVisible,
    pointPositions: buildPointArray(descriptor, reuse?.pointPositions),
    pointColor: descriptor.color,
    pointOpacity: descriptor.surfaceMesh ? Math.min(0.22, descriptor.opacity * 0.22) : Math.min(1, descriptor.opacity * 0.9),
    pointSize: descriptor.surfaceMesh ? Math.max(3.5, descriptor.pointSize - 2) : descriptor.pointSize,
    linesVisible,
    linePositions: buildLineArray(descriptor, reuse?.linePositions),
    lineColor: descriptor.color,
    lineOpacity: descriptor.bindingMode === 'proxy-preview'
      ? Math.min(0.48, descriptor.opacity * 0.56)
      : descriptor.surfaceMesh
        ? Math.min(0.2, descriptor.opacity * 0.18)
        : Math.min(0.72, descriptor.opacity * 0.74),
    hullVisible,
    hullPositions: descriptor.surfaceMesh?.hullLines ?? EMPTY_FLOAT32,
    hullColor: descriptor.color,
    hullOpacity: descriptor.surfaceMesh
      ? descriptor.surfaceMesh.surfaceKind === 'softbody'
        ? Math.min(0.84, Math.max(0.28, descriptor.opacity * 0.8))
        : descriptor.surfaceMesh.surfaceKind === 'cloth'
          ? Math.min(0.68, Math.max(0.2, descriptor.opacity * 0.6))
          : Math.min(0.74, Math.max(0.22, descriptor.opacity * 0.66))
      : 0,
  };
}

export function estimateFutureNativeDescriptorPacketBytes(packet: FutureNativeDescriptorPacket): number {
  return packet.surfacePositions.byteLength
    + packet.surfaceColors.byteLength
    + packet.surfaceIndices.byteLength
    + packet.pointPositions.byteLength
    + packet.linePositions.byteLength
    + packet.hullPositions.byteLength;
}
