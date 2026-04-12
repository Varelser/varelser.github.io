import assert from 'node:assert/strict';
import { BufferGeometry } from 'three';
import { syncFloat32GeometryAttribute, syncGeometryIndex } from '../../lib/geometryBufferSync';

export async function main() {
  const geometry = new BufferGeometry();

  const firstPositions = new Float32Array([0, 1, 2, 3, 4, 5]);
  const firstAttribute = syncFloat32GeometryAttribute(geometry, 'position', firstPositions, 3);
  assert.equal(firstAttribute.array, firstPositions);

  const secondPositions = new Float32Array([5, 4, 3, 2, 1, 0]);
  const secondAttribute = syncFloat32GeometryAttribute(geometry, 'position', secondPositions, 3);
  assert.equal(secondAttribute, firstAttribute);
  assert.deepEqual(Array.from(secondAttribute.array as Float32Array), Array.from(secondPositions));

  const firstIndex = new Uint16Array([0, 1, 2, 2, 1, 3]);
  const firstIndexAttribute = syncGeometryIndex(geometry, firstIndex);
  assert.equal(firstIndexAttribute.array, firstIndex);

  const secondIndex = new Uint16Array([0, 2, 1, 1, 2, 3]);
  const secondIndexAttribute = syncGeometryIndex(geometry, secondIndex);
  assert.equal(secondIndexAttribute, firstIndexAttribute);
  assert.deepEqual(Array.from(secondIndexAttribute.array as Uint16Array), Array.from(secondIndex));
}
