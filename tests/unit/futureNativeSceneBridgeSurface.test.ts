import assert from 'node:assert/strict';
import {
  buildClothSurfaceMesh,
  buildMembraneSurfaceMesh,
  buildSoftbodySurfaceMesh,
} from '../../lib/future-native-families/futureNativeSceneBridgeSurface';

export async function main() {
  const clothMesh = buildClothSurfaceMesh({
    particles: [
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: 1, y: 1 },
    ],
    config: {
      width: 2,
      height: 2,
      windPulse: 0,
      pinGroupStrength: 0,
    },
    windImpulse: 0,
    choreographyDrift: 0,
    pressureImpulse: 0,
    tornFrontLinks: 0,
    frame: 0,
    obstacleImpulse: 0,
    links: [
      { a: 0, b: 1, active: true, kind: 'structural' },
      { a: 0, b: 2, active: true, kind: 'structural' },
      { a: 1, b: 3, active: true, kind: 'structural' },
      { a: 2, b: 3, active: true, kind: 'structural' },
    ],
  } as any);
  assert.equal(clothMesh.surfaceCenterX, 0);
  assert.equal(clothMesh.surfaceCenterY, 0);
  assert.ok(clothMesh.surfaceMaxRadius > 1.4 && clothMesh.surfaceMaxRadius < 1.5);

  const membraneMesh = buildMembraneSurfaceMesh({
    particles: [
      { x: -2, y: 0 },
      { x: 2, y: 0 },
      { x: -2, y: 2 },
      { x: 2, y: 2 },
    ],
    config: {
      width: 2,
      height: 2,
      inflation: 0,
      pressureStrength: 0,
      windPulse: 0,
      boundaryTension: 0,
    },
    pressureImpulse: 0,
    windImpulse: 0,
    choreographyDrift: 0,
    obstacleImpulse: 0,
    frame: 0,
  } as any);
  assert.equal(membraneMesh.surfaceCenterX, 0);
  assert.equal(membraneMesh.surfaceCenterY, 1);
  assert.ok(membraneMesh.surfaceMaxRadius > 2.2 && membraneMesh.surfaceMaxRadius < 2.3);

  const softbodyMesh = buildSoftbodySurfaceMesh({
    particles: [
      { x: -1, y: -1, restOffsetX: -1, restOffsetY: -1 },
      { x: 1, y: -1, restOffsetX: 1, restOffsetY: -1 },
      { x: -1, y: 1, restOffsetX: -1, restOffsetY: 1 },
      { x: 1, y: 1, restOffsetX: 1, restOffsetY: 1 },
    ],
    config: {
      width: 2,
      height: 2,
      pressureStrength: 0,
      volumePreservation: 0,
      shellTension: 0,
    },
    pressureImpulse: 0,
    volumeConstraintError: 0,
    obstacleImpulse: 0,
    cells: [{ indices: [0, 1, 3, 2] }],
  } as any);
  assert.equal(softbodyMesh.surfaceCenterX, 0);
  assert.equal(softbodyMesh.surfaceCenterY, 0);
  assert.ok(softbodyMesh.surfaceMaxRadius > 1.4 && softbodyMesh.surfaceMaxRadius < 1.5);
}
