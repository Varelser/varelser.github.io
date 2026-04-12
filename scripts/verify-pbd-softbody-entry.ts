import { createPbdSoftbodyRuntimeFromInput } from '../lib/future-native-families/starter-runtime/pbd_softbodyAdapter';
import { buildPbdSoftbodyDebugRenderPayload } from '../lib/future-native-families/starter-runtime/pbd_softbodyRenderer';
import { getPbdSoftbodyStats, stepPbdSoftbodyRuntime } from '../lib/future-native-families/starter-runtime/pbd_softbodySolver';
import { pbdSoftbodyUiSections } from '../lib/future-native-families/starter-runtime/pbd_softbodyUi';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

let runtime = createPbdSoftbodyRuntimeFromInput({
  width: 7,
  height: 7,
  spacing: 0.085,
  anchorMode: 'core',
  pinGroupCount: 2,
  pinGroupStrength: 0.2,
  pinChoreographyPreset: 'counter-orbit',
  volumePreservation: 0.82,
  clusterStiffness: 0.44,
  shellTension: 0.3,
  stiffness: 0.93,
  shearStiffness: 0.76,
  bendStiffness: 0.28,
  damping: 0.04,
  gravity: 9.0,
  pulseX: 0.18,
  pulseY: 0.09,
  collisionRadius: 0.02,
  floorY: -0.26,
  selfCollisionStiffness: 0.34,
  windX: 0.24,
  windY: 0.08,
  windPulse: 0.4,
  pressureStrength: 0.24,
  pressurePulse: 0.34,
  obstacleFieldX: -0.02,
  obstacleFieldY: -0.08,
  obstacleFieldRadius: 0.22,
  obstacleFieldStrength: 0.58,
  obstacleField2X: 0.14,
  obstacleField2Y: -0.16,
  obstacleField2Radius: 0.14,
  obstacleField2Strength: 0.32,
  obstaclePreset: 'staggered-arc',
  circleColliderX: 0.0,
  circleColliderY: -0.04,
  circleColliderRadius: 0.12,
  capsuleColliderAx: -0.14,
  capsuleColliderAy: -0.12,
  capsuleColliderBx: 0.18,
  capsuleColliderBy: -0.15,
  capsuleColliderRadius: 0.05,
});

for (let i = 0; i < 120; i += 1) runtime = stepPbdSoftbodyRuntime(runtime, { iterations: 12 });

const stats = getPbdSoftbodyStats(runtime);
const render = buildPbdSoftbodyDebugRenderPayload(runtime);

assert(stats.particleCount === 49, 'softbody particle count should remain stable');
assert(stats.pinnedCount >= 2, 'softbody core anchors should remain pinned');
assert(stats.centerY < 0.14, 'softbody should settle downward');
assert(stats.floorContacts > 0, 'softbody should touch the floor');
assert(stats.averageStretch > 0.85 && stats.averageStretch < 1.18, 'softbody stretch should stay bounded');
assert(stats.volumeRatio > 0.72 && stats.volumeRatio < 1.28, 'softbody volume ratio should stay bounded');
assert(stats.maxCellAreaError < 0.7, 'softbody cell area error should stay bounded');
assert(stats.shellSpanX > 0.3, 'softbody should keep lateral extent');
assert(stats.shellSpanY > 0.3, 'softbody should keep vertical extent');
assert(stats.impactResponse > 0, 'softbody should record collider impact response');
assert(stats.windImpulse > 0, 'softbody should receive wind impulse');
assert(stats.pressureImpulse > 0, 'softbody should receive pressure impulse');
assert(stats.obstacleImpulse > 0, 'softbody should receive obstacle impulse');
assert(stats.obstacleContacts > 0, 'softbody should touch obstacle field');
assert(stats.choreographyDrift > 0, 'softbody should use pin choreography');
assert(stats.obstacleLayerCount >= 4, 'softbody should use layered obstacles');
assert(stats.volumeConstraintError > 0, 'softbody should accumulate volume constraint activity');
assert(render.points && render.points.length === stats.particleCount, 'render payload should expose softbody points');
assert(render.lines && render.lines.length > 40, 'render payload should expose softbody links');
assert((render.scalarSamples?.length ?? 0) >= 8, 'scalar samples should be populated');
assert(pbdSoftbodyUiSections.length >= 4, 'softbody ui sections missing');

console.log(JSON.stringify({ ok: true, familyId: 'pbd-softbody', stats, renderSummary: render.summary }, null, 2));
