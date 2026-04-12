import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getFutureNativePacketExecutionPlan } from '../../lib/futureNativePacketExecutionRoute';
import type { FutureNativeSceneBridgeDescriptor } from '../../lib/future-native-families/futureNativeSceneRendererBridge';

function buildDescriptor(overrides: Partial<FutureNativeSceneBridgeDescriptor> = {}): FutureNativeSceneBridgeDescriptor {
  return {
    familyId: 'pbd-softbody',
    bindingMode: 'native-surface',
    summary: 'test',
    pointCount: 0,
    lineCount: 0,
    stats: {},
    color: '#ffffff',
    opacity: 0.5,
    pointSize: 4,
    sceneScale: 1,
    payload: {},
    surfaceMesh: {
      positions: new Float32Array(30000),
      indices: new Uint32Array(12000),
      hullLines: new Float32Array(6000),
      triangleCount: 4000,
      hullSegmentCount: 1000,
      surfaceCenterX: 0,
      surfaceCenterY: 0,
      surfaceMaxRadius: 1,
      zMin: -1,
      zMax: 1,
      surfaceKind: 'softbody',
    },
    ...overrides,
  } as FutureNativeSceneBridgeDescriptor;
}

describe('getFutureNativePacketExecutionPlan', () => {
  it('prefers worker for heavy supported families', () => {
    const plan = getFutureNativePacketExecutionPlan(buildDescriptor(), true);
    assert.equal(plan.route, 'worker');
    assert.equal(plan.reason, 'worker-preferred');
  });

  it('keeps direct route for proxy preview', () => {
    const plan = getFutureNativePacketExecutionPlan(buildDescriptor({ bindingMode: 'proxy-preview' }), true);
    assert.equal(plan.route, 'direct');
    assert.equal(plan.reason, 'proxy-preview');
  });

  it('keeps direct route for unsupported families', () => {
    const plan = getFutureNativePacketExecutionPlan(buildDescriptor({ familyId: 'volumetric-smoke' }), true);
    assert.equal(plan.route, 'direct');
    assert.equal(plan.reason, 'family-not-supported');
  });

  it('keeps playback worker disabled for non-softbody families', () => {
    const plan = getFutureNativePacketExecutionPlan(buildDescriptor({ familyId: 'pbd-cloth' }), true, { isPlaying: true });
    assert.equal(plan.route, 'direct');
    assert.equal(plan.reason, 'playback-family-not-enabled');
  });

  it('allows heavy softbody playback packets to use worker', () => {
    const plan = getFutureNativePacketExecutionPlan(buildDescriptor(), true, { isPlaying: true });
    assert.equal(plan.route, 'worker');
    assert.equal(plan.reason, 'worker-preferred');
  });
});
