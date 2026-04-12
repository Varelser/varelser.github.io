import { normalizeConfig } from '../lib/appStateConfig';
import {
  loadCoreStarterPresetLibrary,
  loadStarterFutureNativeAugmentation,
  mergeStarterLibraryAugmentation,
} from '../lib/starterLibrary';
import { createFutureNativeSceneBridgeRuntime } from '../lib/future-native-families/futureNativeSceneBridgeRuntimeControl';
import { FUTURE_NATIVE_SCENE_PRESET_BINDINGS } from '../lib/future-native-families/futureNativeSceneBindingData';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const representativeIds = [
  'future-native-mpm-granular-sand-fall',
  'future-native-mpm-viscoplastic-viscous-flow',
  'future-native-mpm-snow-avalanche-field',
  'future-native-mpm-mud-liquid-smear',
  'future-native-mpm-paste-capillary-sheet',
  'future-native-pbd-cloth-drape',
  'future-native-pbd-rope-signal-braid',
  'future-native-pbd-softbody-shell',
  'future-native-fracture-voxel-lattice',
  'future-native-fracture-crack-propagation-seep',
  'future-native-fracture-debris-generation-shard',
  'future-native-volumetric-smoke-prism',
] as const;

function summarizeRuntime(controller: ReturnType<typeof createFutureNativeSceneBridgeRuntime>) {
  assert(controller, 'runtime missing');
  const runtime = controller.runtime as any;
  if (controller.familyId.startsWith('mpm-')) {
    return JSON.stringify({
      familyId: controller.familyId,
      frame: runtime.frame,
      first: runtime.particles.slice(0, 3).map((particle: any) => [particle.x.toFixed(4), particle.y.toFixed(4), particle.meanStress.toFixed(4)]),
      grid: [runtime.grid.totalMass.toFixed(4), runtime.grid.occupiedCells, runtime.grid.maxCellMass.toFixed(4)],
    });
  }
  if (controller.familyId.startsWith('volumetric-')) {
    const sum = (field: Float32Array) => Array.from(field.slice(0, 18)).reduce((total, value) => total + value, 0);
    return JSON.stringify({
      familyId: controller.familyId,
      frame: runtime.frame,
      density: sum(runtime.density).toFixed(4),
      shadow: sum(runtime.shadow).toFixed(4),
      pressure: sum(runtime.pressure).toFixed(4),
    });
  }
  if (controller.familyId.startsWith('fracture-')) {
    return JSON.stringify({
      familyId: controller.familyId,
      frame: runtime.frame,
      broken: runtime.brokenBondIds.slice(0, 8),
      debris: runtime.debris.slice(0, 3).map((item: any) => [item.x.toFixed(4), item.y.toFixed(4), item.energy.toFixed(4)]),
    });
  }
  return JSON.stringify({
    familyId: controller.familyId,
    frame: runtime.frame,
    summary: Object.keys(runtime).slice(0, 8),
  });
}

async function main() {
  const [coreLibrary, futureNativeAugmentation] = await Promise.all([
    loadCoreStarterPresetLibrary(),
    loadStarterFutureNativeAugmentation(),
  ]);
  const mergedLibrary = mergeStarterLibraryAugmentation(coreLibrary, futureNativeAugmentation);
  const presetIds = new Set(mergedLibrary.presets.map((preset) => preset.id));
  const sequenceIds = new Set(mergedLibrary.presetSequence.map((item) => item.presetId));
  const futureNativePresetBindings = FUTURE_NATIVE_SCENE_PRESET_BINDINGS
    .filter((binding) => binding.familyId.startsWith('mpm-') || binding.familyId.startsWith('pbd-') || binding.familyId.startsWith('fracture-') || binding.familyId.startsWith('volumetric-'));

  assert(futureNativeAugmentation.presets.length >= futureNativePresetBindings.length, 'future-native starter presets missing');
  futureNativePresetBindings.forEach((binding) => {
    assert(presetIds.has(binding.id), `${binding.id}: starter preset not exposed`);
  });
  representativeIds.forEach((presetId) => {
    assert(sequenceIds.has(presetId), `${presetId}: representative sequence entry missing`);
  });

  const layer3VolumetricA = normalizeConfig({
    layer3Enabled: true,
    layer3Type: 'prism_smoke',
    layer3Source: 'video',
    layer3TemporalSpeed: 0.82,
    layer3TemporalStrength: 0.44,
    layer2TemporalSpeed: 0.02,
    layer2TemporalStrength: 0.02,
  });
  const layer3VolumetricB = normalizeConfig({
    ...layer3VolumetricA,
    layer2TemporalSpeed: 0.98,
    layer2TemporalStrength: 0.98,
  });
  const layer3MpmA = normalizeConfig({
    layer3Enabled: true,
    layer3Type: 'granular_fall',
    layer3TemporalStrength: 0.68,
    layer2TemporalStrength: 0.02,
  });
  const layer3MpmB = normalizeConfig({
    ...layer3MpmA,
    layer2TemporalStrength: 0.98,
  });
  const layer3FractureA = normalizeConfig({
    layer3Enabled: true,
    layer3Type: 'voxel_lattice',
    layer3TemporalStrength: 0.58,
    layer2TemporalStrength: 0.02,
  });
  const layer3FractureB = normalizeConfig({
    ...layer3FractureA,
    layer2TemporalStrength: 0.98,
  });

  const volumetricSummaryA = summarizeRuntime(createFutureNativeSceneBridgeRuntime(layer3VolumetricA, 3));
  const volumetricSummaryB = summarizeRuntime(createFutureNativeSceneBridgeRuntime(layer3VolumetricB, 3));
  const mpmSummaryA = summarizeRuntime(createFutureNativeSceneBridgeRuntime(layer3MpmA, 3));
  const mpmSummaryB = summarizeRuntime(createFutureNativeSceneBridgeRuntime(layer3MpmB, 3));
  const fractureSummaryA = summarizeRuntime(createFutureNativeSceneBridgeRuntime(layer3FractureA, 3));
  const fractureSummaryB = summarizeRuntime(createFutureNativeSceneBridgeRuntime(layer3FractureB, 3));

  assert(volumetricSummaryA === volumetricSummaryB, 'layer3 volumetric warm frames still depend on layer2 temporal values');
  assert(mpmSummaryA === mpmSummaryB, 'layer3 mpm warm frames still depend on layer2 temporal values');
  assert(fractureSummaryA === fractureSummaryB, 'layer3 fracture warm frames still depend on layer2 temporal values');

  console.log(JSON.stringify({
    ok: true,
    futureNativeStarterPresetCount: futureNativeAugmentation.presets.length,
    futureNativeStarterSequenceCount: futureNativeAugmentation.presetSequence.length,
    exposedRepresentativeCount: representativeIds.length,
  }, null, 2));
}

void main();
