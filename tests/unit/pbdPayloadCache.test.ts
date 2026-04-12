import assert from 'node:assert/strict';
import { buildPbdClothDebugRenderPayload } from '../../lib/future-native-families/starter-runtime/pbd_clothRenderer';

export async function main() {
  const config = {
    width: 2,
    height: 2,
    floorY: -10,
    collisionRadius: 0.1,
    circleColliderX: 100,
    circleColliderY: 100,
    circleColliderRadius: 0.1,
    capsuleColliderAx: 100,
    capsuleColliderAy: 100,
    capsuleColliderBx: 101,
    capsuleColliderBy: 100,
    capsuleColliderRadius: 0.1,
    pinGroupCount: 1,
  };

  const runtimeA = {
    config,
    particles: [
      { x: 0, y: 0, pinned: false },
      { x: 1, y: 0, pinned: false },
      { x: 0, y: 1, pinned: false },
      { x: 1, y: 1, pinned: false },
    ],
    links: [
      { a: 0, b: 1, active: true, restLength: 1, tearBias: 0 },
      { a: 1, b: 3, active: true, restLength: 1, tearBias: 0 },
    ],
    frame: 0,
    windImpulse: 0.2,
    pressureImpulse: 0.3,
    tornFrontLinks: 0,
    obstacleImpulse: 0.4,
    obstacleContacts: 2,
    choreographyDrift: 0,
    obstacleLayerCount: 0,
    tearBiasTextureScore: 0,
  } as any;

  const payloadA = buildPbdClothDebugRenderPayload(runtimeA);
  assert.equal(payloadA.points?.length, 4);
  assert.equal(payloadA.lines?.length, 2);
  assert.equal(payloadA.summary, 'cloth:2x2@0');

  const runtimeB = {
    ...runtimeA,
    frame: 1,
    particles: [
      { x: 10, y: 10, pinned: false },
      { x: 11, y: 10, pinned: false },
      { x: 10, y: 11, pinned: false },
      { x: 11, y: 11, pinned: false },
    ],
    links: [
      { a: 0, b: 1, active: true, restLength: 1, tearBias: 0 },
      { a: 1, b: 3, active: false, restLength: 1, tearBias: 0 },
    ],
  } as any;

  const payloadB = buildPbdClothDebugRenderPayload(runtimeB);
  assert.equal(payloadB, payloadA);
  assert.equal(payloadB.summary, 'cloth:2x2@1');
  assert.equal(payloadB.points?.[0]?.x, 10);
  assert.equal(payloadB.points?.[3]?.y, 11);
  assert.equal(payloadB.lines?.length, 1);
  assert.equal(payloadB.lines?.[0]?.a.x, 10);
  assert.equal(payloadB.lines?.[0]?.b.x, 11);
}
