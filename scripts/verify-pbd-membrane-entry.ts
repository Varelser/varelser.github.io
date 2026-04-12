import { buildFutureNativePbdMembraneRoutePreview } from '../lib/future-native-families/futureNativePbdMembraneRoutePreview';
import { createPbdMembraneRuntimeFromInput } from '../lib/future-native-families/starter-runtime/pbd_membraneAdapter';
import { buildPbdMembraneDebugRenderPayload } from '../lib/future-native-families/starter-runtime/pbd_membraneRenderer';
import { getPbdMembraneStats, stepPbdMembraneRuntime } from '../lib/future-native-families/starter-runtime/pbd_membraneSolver';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

let runtime = createPbdMembraneRuntimeFromInput({
  width: 9,
  height: 9,
  spacing: 0.08,
  anchorMode: 'rim-quadrants',
  pinGroupCount: 4,
  pinChoreographyPreset: 'counter-orbit',
  pinGroupStrength: 0.2,
  tearThreshold: 1.14,
  tearPropagationBias: 0.42,
  stiffness: 0.94,
  shearStiffness: 0.74,
  bendStiffness: 0.22,
  damping: 0.04,
  gravity: 7.4,
  pulseX: 0.08,
  pulseY: 0.14,
  collisionRadius: 0.018,
  floorY: -0.26,
  selfCollisionStiffness: 0.36,
  inflation: 0.34,
  boundaryTension: 0.28,
  windX: 0.18,
  windY: 0.1,
  windPulse: 0.36,
  pressureStrength: 0.26,
  pressurePulse: 0.42,
  obstacleFieldX: 0.0,
  obstacleFieldY: -0.02,
  obstacleFieldRadius: 0.24,
  obstacleFieldStrength: 0.56,
  obstacleField2X: 0.16,
  obstacleField2Y: -0.12,
  obstacleField2Radius: 0.16,
  obstacleField2Strength: 0.31,
  tearBiasMapPreset: 'radial-flare',
  tearBiasMapScale: 0.42,
  tearBiasMapFrequency: 2.2,
  tearBiasMapRotation: 1.08,
  tearBiasMapContrast: 0.72,
  tearDirectionX: 0.14,
  tearDirectionY: -1.0,
});
for (let i = 0; i < 120; i += 1) runtime = stepPbdMembraneRuntime(runtime, { iterations: 12 });
const stats = getPbdMembraneStats(runtime);
const render = buildPbdMembraneDebugRenderPayload(runtime);
assert(stats.particleCount === 81, 'particle count should remain stable');
assert(stats.pinnedCount >= 8, 'membrane should keep multiple rim anchors');
assert(stats.centerY > -0.05, 'membrane should keep lifted center');
assert(stats.inflationLift > 0.16, 'inflation should create dome lift');
assert(stats.rimSpanX > 1.0, 'boundary tension should maintain membrane span');
assert(stats.averageStretch < 1.2, 'membrane should stay close to rest');
assert(stats.brokenLinks > 0, 'membrane should tear under inflated pulse');
assert(stats.tornFrontLinks > 0, 'membrane should keep a tear front after propagation');
assert(stats.brokenLinks > stats.tornFrontLinks * 0.4, 'membrane should tear across multiple biased fronts');
assert(stats.pinGroupCount >= 4, 'membrane should use multiple pin groups');
assert(stats.pulseResponse > 0, 'pulse should move membrane');
assert(stats.windImpulse > 0, 'membrane should receive wind impulse');
assert(stats.pressureImpulse > stats.windImpulse * 0.2, 'membrane should receive pressure impulse');
assert(stats.obstacleImpulse > 0, 'membrane should receive obstacle field impulse');
assert(stats.obstacleContacts > 0, 'membrane should touch obstacle field zone');
assert(stats.tearBiasTextureScore > 0.2, 'membrane should use tear bias texture preset');
assert(render.points && render.points.length === stats.particleCount, 'render payload should expose membrane points');
assert(render.lines && render.lines.length > 40, 'render payload should expose membrane links');
assert((render.scalarSamples?.length ?? 0) >= 5, 'scalar samples should be populated');
const preview = buildFutureNativePbdMembraneRoutePreview();
assert(preview.routeCount >= 2, 'pbd-membrane route preview count too small');
assert(preview.presetCount >= 2, 'pbd-membrane route preview preset count too small');
assert(preview.previewSignature.includes('membrane'), 'pbd-membrane preview signature missing membrane label');
console.log(JSON.stringify({ ok: true, familyId: 'pbd-membrane', stats, renderSummary: render.summary, preview }, null, 2));
