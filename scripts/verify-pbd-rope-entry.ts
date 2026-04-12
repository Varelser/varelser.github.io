import { buildFutureNativePbdRopeRoutePreview } from '../lib/future-native-families/futureNativePbdRopeRoutePreview';
import { createPbdRopeRuntimeFromInput } from '../lib/future-native-families/starter-runtime/pbd_ropeAdapter';
import { buildPbdRopeDebugRenderPayload } from '../lib/future-native-families/starter-runtime/pbd_ropeRenderer';
import { getPbdRopeStats, stepPbdRopeRuntime } from '../lib/future-native-families/starter-runtime/pbd_ropeSolver';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

let runtime = createPbdRopeRuntimeFromInput({
  segments: 22,
  restLength: 0.05,
  stiffness: 0.96,
  bendStiffness: 0.22,
  damping: 0.03,
  gravity: 9.8,
  anchorMode: 'start',
  collisionRadius: 0.015,
  floorY: -0.9,
  circleColliderX: 0.08,
  circleColliderY: -0.8,
  circleColliderRadius: 0.18,
  capsuleColliderAx: -0.18,
  capsuleColliderAy: -0.56,
  capsuleColliderBx: 0.22,
  capsuleColliderBy: -0.92,
  capsuleColliderRadius: 0.075,
  selfCollisionStiffness: 0.72,
});

for (let frame = 0; frame < 64; frame += 1) {
  runtime = stepPbdRopeRuntime(runtime, { iterations: 20 });
}

const stats = getPbdRopeStats(runtime);
const render = buildPbdRopeDebugRenderPayload(runtime);
const tip = runtime.particles[runtime.particles.length - 1];
const start = runtime.particles[0];
const colliderDistance = Math.hypot(tip.x - runtime.config.circleColliderX, tip.y - runtime.config.circleColliderY);
const colliderCombinedRadius = runtime.config.circleColliderRadius + runtime.config.collisionRadius;

assert(stats.segmentCount === 22, 'pbd-rope segment count mismatch');
assert(stats.anchorCount === 1, 'pbd-rope anchor count mismatch');
assert(stats.maxStretchRatio < 1.1, `pbd-rope stretch too high: ${stats.maxStretchRatio}`);
assert(stats.tipDisplacement > 0.01, 'pbd-rope tip should sag');
assert(Math.abs(start.x) < 1e-9 && Math.abs(start.y) < 1e-9, 'pbd-rope anchor drifted');
assert(render.lines?.length === 22, 'pbd-rope render segments mismatch');
assert(render.stats.frame === 64, 'pbd-rope render frame mismatch');
assert(stats.floorContacts >= 1, 'pbd-rope should contact floor');
assert(stats.circleContacts >= 1, 'pbd-rope should contact circle collider');
assert(stats.capsuleContacts >= 1, 'pbd-rope should contact capsule collider');
assert(stats.minNonAdjacentDistance >= runtime.config.collisionRadius * 2 - 5e-3, 'pbd-rope spacing guard too low');
assert(stats.averageBendDeviation < 0.03, `pbd-rope bend deviation too high: ${stats.averageBendDeviation}`);
assert(tip.y >= runtime.config.floorY + runtime.config.collisionRadius - 1e-6, 'pbd-rope tip penetrated floor');
assert(colliderDistance >= colliderCombinedRadius - 5e-3, 'pbd-rope tip penetrated circle collider');
assert(Array.isArray(render.scalarSamples) && render.scalarSamples.length === 5, 'pbd-rope scalar samples missing');
const preview = buildFutureNativePbdRopeRoutePreview();
assert(preview.routeCount >= 3, 'pbd-rope route preview count too small');
assert(preview.presetCount >= 3, 'pbd-rope route preview preset count too small');
assert(preview.previewSignature.includes('rope'), 'pbd-rope route preview signature missing rope label');

console.log('PASS pbd-rope-native-starter-bend-collision');
console.log(JSON.stringify({ stats, tip, summary: render.summary, preview }, null, 2));
