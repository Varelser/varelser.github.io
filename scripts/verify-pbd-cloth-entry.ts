import { createPbdClothRuntimeFromInput } from '../lib/future-native-families/starter-runtime/pbd_clothAdapter';
import { buildPbdClothDebugRenderPayload } from '../lib/future-native-families/starter-runtime/pbd_clothRenderer';
import { getPbdClothStats, stepPbdClothRuntime } from '../lib/future-native-families/starter-runtime/pbd_clothSolver';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

let runtime = createPbdClothRuntimeFromInput({
  width: 10,
  height: 8,
  spacing: 0.09,
  pinMode: 'top-band',
  pinGroupStrength: 0.22,
  pinGroupCount: 3,
  pinChoreographyPreset: 'breath-wave',
  tearThreshold: 1.16,
  tearPropagationBias: 0.34,
  stiffness: 0.95,
  shearStiffness: 0.78,
  bendStiffness: 0.26,
  damping: 0.035,
  gravity: 9.8,
  pulseX: 0.42,
  pulseY: 0.0,
  collisionRadius: 0.018,
  floorY: -0.30,
  selfCollisionStiffness: 0.4,
  windX: 0.34,
  windY: 0.08,
  windPulse: 0.46,
  pressureStrength: 0.1,
  pressurePulse: 0.24,
  obstacleFieldX: 0.01,
  obstacleFieldY: -0.05,
  obstacleFieldRadius: 0.26,
  obstacleFieldStrength: 0.62,
  obstacleField2X: -0.16,
  obstacleField2Y: -0.16,
  obstacleField2Radius: 0.14,
  obstacleField2Strength: 0.33,
  tearBiasMapPreset: 'warp-weft',
  tearBiasMapScale: 0.48,
  tearBiasMapFrequency: 2.8,
  tearBiasMapRotation: 0.52,
  tearBiasMapContrast: 0.76,
  tearDirectionX: 1.0,
  tearDirectionY: -0.12,
});

for (let i = 0; i < 128; i += 1) runtime = stepPbdClothRuntime(runtime, { iterations: 12 });

const stats = getPbdClothStats(runtime);
const render = buildPbdClothDebugRenderPayload(runtime);

assert(stats.particleCount === 80, 'particle count should remain stable');
assert(stats.pinnedCount === 2, 'top corners should remain pinned');
assert(stats.centerY < 0.12, 'cloth should sag below upper rest band');
assert(stats.floorContacts > 0, 'cloth should contact floor');
assert(stats.averageStretch < 1.18, 'cloth should remain near rest length');
assert(stats.brokenLinks > 0, 'cloth should tear under pulse load');
assert(stats.tornFrontLinks > 0, 'cloth should keep a tear front after propagation');
assert(stats.brokenLinks > stats.tornFrontLinks * 0.25, 'cloth should tear across multiple biased fronts');
assert(stats.pinGroupCount >= 3, 'cloth should use multiple pin groups');
assert(stats.pulseResponse >= 0, 'pulse metrics should remain defined');
assert(stats.windImpulse > 0, 'cloth should receive wind impulse');
assert(stats.pressureImpulse > 0, 'cloth should receive pressure impulse');
assert(stats.obstacleImpulse > 0, 'cloth should receive obstacle field impulse');
assert(stats.obstacleContacts > 0, 'cloth should touch obstacle field zone');
assert(stats.choreographyDrift > 0, 'cloth should use pin choreography');
assert(stats.obstacleLayerCount >= 4, 'cloth should use layered obstacle presets');
assert(stats.tearBiasTextureScore > 0.2, 'cloth should use tear bias texture preset');
assert(render.points && render.points.length === stats.particleCount, 'render payload should expose cloth points');
assert(render.lines && render.lines.length > 20, 'render payload should expose cloth links');
assert((render.scalarSamples?.length ?? 0) >= 5, 'scalar samples should be populated');

console.log(JSON.stringify({ ok: true, familyId: 'pbd-cloth', stats, renderSummary: render.summary }, null, 2));
