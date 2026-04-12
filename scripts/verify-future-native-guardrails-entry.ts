import { normalizeConfig } from '../lib/appStateConfig';
import {
  buildFutureNativeSceneBridgeDescriptor,
  createFutureNativeSceneBridgeRuntime,
  stepFutureNativeSceneBridgeRuntime,
} from '../lib/future-native-families/futureNativeSceneRendererBridge';
import { futureNativePayloadHasOnlyFiniteValues } from '../lib/future-native-families/starter-runtime/runtimeContracts';
import type { Layer2Type } from '../types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const cases: Array<{ mode: Layer2Type; source: string; layer2Count: number; steps?: number }> = [
  { mode: 'cloth_membrane', source: 'plane', layer2Count: 120 },
  { mode: 'elastic_sheet', source: 'plane', layer2Count: 120 },
  { mode: 'surface_shell', source: 'sphere', layer2Count: 120 },
  { mode: 'signal_braid', source: 'text', layer2Count: 96 },
  { mode: 'granular_fall', source: 'sphere', layer2Count: 24 },
  { mode: 'viscous_flow', source: 'plane', layer2Count: 24 },
  { mode: 'ashfall', source: 'video', layer2Count: 24 },
  { mode: 'sediment_stack', source: 'plane', layer2Count: 24 },
  { mode: 'capillary_sheet', source: 'text', layer2Count: 24 },
  { mode: 'fracture_grammar', source: 'grid', layer2Count: 72 },
  { mode: 'voxel_lattice', source: 'cube', layer2Count: 72 },
  { mode: 'seep_fracture', source: 'image', layer2Count: 72 },
  { mode: 'shard_debris', source: 'sphere', layer2Count: 72 },
  { mode: 'prism_smoke', source: 'plane', layer2Count: 96 },
  { mode: 'condense_field', source: 'plane', layer2Count: 96 },
  { mode: 'vortex_transport', source: 'ring', layer2Count: 96 },
  { mode: 'charge_veil', source: 'video', layer2Count: 96 },
];

function arrayIsFinite(values: ArrayLike<number>): boolean {
  for (let i = 0; i < values.length; i += 1) {
    if (!Number.isFinite(values[i])) return false;
  }
  return true;
}

const report = cases.map(({ mode, source, layer2Count, steps = 1 }) => {
  const config = normalizeConfig({
    layer2Enabled: true,
    layer2Type: mode,
    layer2Source: source as never,
    layer2Count,
    layer2RadiusScale: 1.04,
    layer2BaseSize: mode === 'granular_fall' ? 0.76 : 0.92,
    layer2TemporalStrength: 0.24,
    layer2TemporalSpeed: 0.18,
    layer2WindX: 0.16,
    layer2WindY: 0.05,
    layer2ConnectionEnabled: true,
    layer2GlyphOutlineEnabled: true,
    layer2AuxEnabled: true,
    layer2SparkEnabled: true,
  });
  const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
  assert(runtime, `${mode}: runtime missing`);
  stepFutureNativeSceneBridgeRuntime(runtime, { steps, dt: 1 / 60 });
  const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
  assert(futureNativePayloadHasOnlyFiniteValues(descriptor.payload), `${mode}: payload has non-finite values`);
  assert(Number.isFinite(descriptor.sceneScale), `${mode}: sceneScale invalid`);
  assert(descriptor.pointCount <= 12000, `${mode}: point payload too large`);
  assert(descriptor.lineCount <= 24000, `${mode}: line payload too large`);
  assert(arrayIsFinite(Object.values(descriptor.stats)), `${mode}: stats contain non-finite values`);
  if (descriptor.surfaceMesh) {
    assert(arrayIsFinite(descriptor.surfaceMesh.positions), `${mode}: surface positions contain non-finite values`);
    assert(arrayIsFinite(descriptor.surfaceMesh.indices), `${mode}: surface indices contain non-finite values`);
    if (descriptor.surfaceMesh.hullLines) {
      assert(arrayIsFinite(descriptor.surfaceMesh.hullLines), `${mode}: hull lines contain non-finite values`);
    }
  }
  return {
    mode,
    familyId: descriptor.familyId,
    pointCount: descriptor.pointCount,
    lineCount: descriptor.lineCount,
    statsKeys: Object.keys(descriptor.stats).length,
  };
});

console.log(JSON.stringify({ ok: true, verifiedCases: report.length, report }, null, 2));
