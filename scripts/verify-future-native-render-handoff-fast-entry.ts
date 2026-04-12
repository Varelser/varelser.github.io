import { normalizeConfig } from '../lib/appStateConfig';
import { buildFutureNativeSceneBridgeDescriptor, createFutureNativeSceneBridgeRuntime } from '../lib/future-native-families/futureNativeSceneRendererBridge';
import { getLayerSceneRenderPlan } from '../lib/sceneRenderRouting';
import type { Layer2Type } from '../types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const cases: Array<{ mode: Layer2Type; familyId: string; source: string; minPoints: number; bindingMode: string }> = [
  { mode: 'cloth_membrane', familyId: 'pbd-cloth', source: 'plane', minPoints: 24, bindingMode: 'native-surface' },
  { mode: 'elastic_sheet', familyId: 'pbd-membrane', source: 'plane', minPoints: 24, bindingMode: 'native-surface' },
  { mode: 'surface_shell', familyId: 'pbd-softbody', source: 'sphere', minPoints: 24, bindingMode: 'native-surface' },
  { mode: 'signal_braid', familyId: 'pbd-rope', source: 'text', minPoints: 96, bindingMode: 'native-structure' },
  { mode: 'granular_fall', familyId: 'mpm-granular', source: 'sphere', minPoints: 120, bindingMode: 'native-particles' },
  { mode: 'viscous_flow', familyId: 'mpm-viscoplastic', source: 'plane', minPoints: 120, bindingMode: 'native-particles' },
  { mode: 'ashfall', familyId: 'mpm-snow', source: 'video', minPoints: 120, bindingMode: 'native-particles' },
  { mode: 'sediment_stack', familyId: 'mpm-mud', source: 'plane', minPoints: 120, bindingMode: 'native-particles' },
  { mode: 'capillary_sheet', familyId: 'mpm-paste', source: 'text', minPoints: 120, bindingMode: 'native-particles' },
  { mode: 'fracture_grammar', familyId: 'fracture-lattice', source: 'grid', minPoints: 24, bindingMode: 'native-structure' },
  { mode: 'voxel_lattice', familyId: 'fracture-voxel', source: 'cube', minPoints: 24, bindingMode: 'native-structure' },
  { mode: 'seep_fracture', familyId: 'fracture-crack-propagation', source: 'image', minPoints: 24, bindingMode: 'native-structure' },
  { mode: 'shard_debris', familyId: 'fracture-debris-generation', source: 'sphere', minPoints: 24, bindingMode: 'native-structure' },
  { mode: 'prism_smoke', familyId: 'volumetric-smoke', source: 'video', minPoints: 24, bindingMode: 'native-volume' },
  { mode: 'condense_field', familyId: 'volumetric-advection', source: 'plane', minPoints: 24, bindingMode: 'native-volume' },
  { mode: 'vortex_transport', familyId: 'volumetric-pressure-coupling', source: 'plane', minPoints: 24, bindingMode: 'native-volume' },
  { mode: 'charge_veil', familyId: 'volumetric-light-shadow-coupling', source: 'video', minPoints: 24, bindingMode: 'native-volume' },
];

const report = cases.map(({ mode, familyId, source, minPoints, bindingMode }) => {
  const config = normalizeConfig({
    layer2Enabled: true,
    layer2Type: mode,
    layer2Source: source as any,
    layer2Count: familyId.startsWith('mpm-') ? 9800 : 9600,
    layer2ConnectionEnabled: true,
    layer2GlyphOutlineEnabled: true,
    layer2AuxEnabled: true,
    layer2SparkEnabled: true,
  });
  const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
  assert(runtime, `${mode}: future-native runtime missing`);
  const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
  const plan = getLayerSceneRenderPlan(config, 2);
  assert(descriptor.familyId === familyId, `${mode}: family mismatch`);
  assert(descriptor.bindingMode === bindingMode, `${mode}: binding mode mismatch`);
  assert(descriptor.pointCount >= minPoints, `${mode}: point count too small`);
  assert(descriptor.lineCount >= 12, `${mode}: line count too small`);
  assert(descriptor.sceneScale >= 120, `${mode}: scene scale too small`);
  assert(plan.futureNativeRenderer, `${mode}: future-native renderer missing`);
  assert(plan.futureNativeFamilyId === familyId, `${mode}: plan family mismatch`);
  assert(plan.proceduralSystemId === null, `${mode}: procedural system should be suppressed`);
  assert(plan.hybridSystemId === null, `${mode}: hybrid system should be suppressed`);
  assert(plan.particleCore === false, `${mode}: particle core should be suppressed`);
  assert(plan.sceneBranches.includes(`future-native-renderer:${familyId}`), `${mode}: scene branch missing`);
  return {
    mode,
    familyId,
    bindingMode: descriptor.bindingMode,
    pointCount: descriptor.pointCount,
    lineCount: descriptor.lineCount,
    sceneScale: descriptor.sceneScale,
  };
});

console.log('PASS future-native-render-handoff-fast');
console.log(JSON.stringify({ ok: true, verifiedCases: report.length, report }, null, 2));
