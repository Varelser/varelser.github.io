import assert from 'node:assert/strict';
import { buildFutureNativeDescriptorPacket, estimateFutureNativeDescriptorPacketBytes } from '../../lib/futureNativeDescriptorPacket';
import type { FutureNativeSceneBridgeDescriptor } from '../../lib/future-native-families/futureNativeSceneRendererBridge';

export async function main() {
  const descriptor: FutureNativeSceneBridgeDescriptor = {
    familyId: 'pbd-cloth',
    bindingMode: 'scene-bound',
    summary: 'cloth',
    pointCount: 2,
    lineCount: 1,
    stats: { vertices: 2 },
    color: '#88ccff',
    opacity: 0.6,
    pointSize: 7,
    sceneScale: 1.25,
    payload: {
      familyId: 'pbd-cloth',
      summary: 'cloth',
      points: [{ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 }],
      lines: [{ a: { x: 0, y: 0, z: 0 }, b: { x: 1, y: 1, z: 1 } }],
      stats: { constraints: 1 },
    },
    surfaceMesh: {
      positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
      indices: new Uint16Array([0, 1, 2]),
      triangleCount: 1,
      hullLines: new Float32Array([0, 0, 0, 1, 0, 0]),
      hullSegmentCount: 1,
      surfaceKind: 'cloth',
      surfaceCenterX: 0.5,
      surfaceCenterY: 0.5,
      surfaceMaxRadius: 1,
      zMin: 0,
      zMax: 0,
    },
  };

  const packet = buildFutureNativeDescriptorPacket(descriptor);
  assert.equal(packet.surfaceVisible, true);
  assert.equal(packet.pointsVisible, true);
  assert.equal(packet.linesVisible, true);
  assert.equal(packet.hullVisible, true);
  assert.equal(packet.pointPositions.length, 6);
  assert.equal(packet.linePositions.length, 6);
  assert.equal(packet.surfacePositions.length, 9);
  assert.ok(packet.surfaceColors.length === 9);
  assert.ok(packet.surfaceOpacity > 0);
  assert.ok(packet.pointOpacity > 0);
  assert.ok(estimateFutureNativeDescriptorPacketBytes(packet) > 0);
}
