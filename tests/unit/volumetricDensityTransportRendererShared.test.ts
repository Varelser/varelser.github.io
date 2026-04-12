import assert from 'node:assert/strict';
import { normalizeVolumetricDensityTransportConfig } from '../../lib/future-native-families/starter-runtime/volumetric_density_transportAdapter';
import { createVolumetricDensityTransportRuntimeState } from '../../lib/future-native-families/starter-runtime/volumetric_density_transportSolver';
import {
  appendPooledBoundaryBridges,
  appendPooledPoint,
  collectObstacleBoundary,
} from '../../lib/future-native-families/starter-runtime/volumetric_density_transportRendererShared';

export async function main() {
  const runtime = createVolumetricDensityTransportRuntimeState(normalizeVolumetricDensityTransportConfig({
    resolutionX: 12,
    resolutionY: 12,
  }));

  const left: Array<{ x: number; y: number; z: number }> = [];
  const right: Array<{ x: number; y: number; z: number }> = [];
  const first = collectObstacleBoundary(runtime, runtime.primaryObstacleMask, 0.2, { left, right });
  assert.equal(first.left, left);
  assert.equal(first.right, right);
  assert.ok(first.left.length > 0);

  const firstLeftPoint = first.left[0];
  const second = collectObstacleBoundary(runtime, runtime.primaryObstacleMask, 0.2, { left, right });
  assert.equal(second.left[0], firstLeftPoint);

  const samplePoints: Array<{ x: number; y: number; z: number }> = [];
  const firstPoint = appendPooledPoint(samplePoints, 0, 1, 2, 3).point;
  const secondPoint = appendPooledPoint(samplePoints, 0, 4, 5, 6).point;
  assert.equal(firstPoint, secondPoint);
  assert.deepEqual(secondPoint, { x: 4, y: 5, z: 6 });

  const lines: Array<{ a: { x: number; y: number; z: number }; b: { x: number; y: number; z: number } }> = [];
  const firstBridge = appendPooledBoundaryBridges(lines, 0, first.left, first.right, second.left, second.right);
  assert.equal(firstBridge.count > 0, true);
  const firstLine = lines[0];
  const secondBridge = appendPooledBoundaryBridges(lines, 0, first.left, first.right, second.left, second.right);
  assert.equal(secondBridge.count, firstBridge.count);
  assert.equal(lines[0], firstLine);
}
