import { normalizeConfig } from '../lib/appStateConfig';
import {
  buildFutureNativeProjectSnapshotReport,
} from '../lib/future-native-families/futureNativeFamiliesProjectReport';
import {
  buildIntegratedFamilySnapshot,
  buildProjectFutureNativeIntegrationSnapshot,
} from '../lib/future-native-families/futureNativeFamiliesIntegration';
import {
  buildFutureNativeSceneBridgeDescriptor,
  createFutureNativeSceneBridgeRuntime,
} from '../lib/future-native-families/futureNativeSceneRendererBridge';
import {
  buildFutureNativeScenePresetPatch,
  getFutureNativeSceneBinding,
} from '../lib/future-native-families/futureNativeSceneBindings';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function runRoute(
  mode: 'sediment_stack' | 'talus_heap' | 'liquid_smear',
  source: 'plane' | 'sphere',
  expectedPresetId: string,
) {
  const binding = getFutureNativeSceneBinding(mode);
  assert(binding, `${mode}: mpm-mud binding missing`);
  assert(binding.familyId === 'mpm-mud', `${mode}: mpm-mud family mismatch`);
  assert(binding.bindingMode === 'native-particles', `${mode}: mpm-mud binding mode mismatch`);
  assert(binding.primaryPresetId === expectedPresetId, `${mode}: mpm-mud preset mismatch`);

  const patch = buildFutureNativeScenePresetPatch(binding.primaryPresetId, 2);
  assert(patch, `${mode}: mpm-mud preset patch missing`);
  assert((patch as Record<string, unknown>).layer2Type === mode, `${mode}: preset should preserve mode`);

  const config = normalizeConfig({
    ...patch,
    layer2Enabled: true,
    layer2Type: mode,
    layer2Source: source,
    layer2Count: mode === 'sediment_stack' ? 10200 : mode === 'talus_heap' ? 9800 : 9400,
    layer2RadiusScale: mode === 'sediment_stack' ? 1.02 : mode === 'talus_heap' ? 1.08 : 1.06,
    layer2BaseSize: mode === 'sediment_stack' ? 0.82 : mode === 'talus_heap' ? 0.76 : 0.96,
    layer2TemporalStrength: mode === 'sediment_stack' ? 0.3 : 0.26,
    layer2TemporalSpeed: mode === 'liquid_smear' ? 0.22 : 0.18,
  });

  const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
  assert(runtime, `${mode}: mpm-mud runtime missing`);
  assert(runtime.familyId === 'mpm-mud', `${mode}: runtime family mismatch`);

  const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
  assert(descriptor.familyId === 'mpm-mud', `${mode}: descriptor family mismatch`);
  assert(descriptor.bindingMode === 'native-particles', `${mode}: descriptor binding mode mismatch`);
  assert(descriptor.lineCount >= 80, `${mode}: line payload too small`);
  assert(descriptor.pointCount >= 120, `${mode}: point payload too small`);
  assert((descriptor.stats.meanViscosityState ?? 0) > 0.42, `${mode}: viscosity state too small`);
  assert((descriptor.stats.viscosityOverlayCellCount ?? 0) >= 16, `${mode}: viscosity overlay too small`);
  if (mode === 'talus_heap') {
    assert((descriptor.stats.packedRegionRemeshLineCount ?? 0) >= 12, `${mode}: talus remesh too weak`);
  }
  if (mode === 'liquid_smear') {
    assert((descriptor.stats.meanYieldMemory ?? 0) > 0.1, `${mode}: yield memory too small`);
  }
  return {
    mode,
    presetId: binding.primaryPresetId,
    pointCount: descriptor.pointCount,
    lineCount: descriptor.lineCount,
    materialBranchScore: descriptor.stats.materialBranchScore,
    meanViscosityState: descriptor.stats.meanViscosityState,
    packedRegionRemeshLineCount: descriptor.stats.packedRegionRemeshLineCount,
  };
}

const routes = [
  runRoute('sediment_stack', 'plane', 'future-native-mpm-mud-sediment-stack'),
  runRoute('talus_heap', 'sphere', 'future-native-mpm-mud-talus-heap'),
  runRoute('liquid_smear', 'plane', 'future-native-mpm-mud-liquid-smear'),
];

const snapshot = buildIntegratedFamilySnapshot('mpm-mud');
assert(snapshot.currentStage === 'project-integrated', 'mpm-mud snapshot stage mismatch');
assert(snapshot.integrationReady, 'mpm-mud snapshot integrationReady mismatch');
assert(snapshot.uiControlCount >= 12, 'mpm-mud snapshot ui control coverage too low');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('material:mud')), 'mpm-mud runtime material missing');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('plasticity:')), 'mpm-mud runtime plasticity missing');

const projectSnapshot = buildProjectFutureNativeIntegrationSnapshot('mpm-mud');
assert(projectSnapshot.serializerBlockKey === 'mpmMud', 'mpm-mud serializer block key mismatch');
assert(projectSnapshot.runtimeConfig.values.length >= 6, 'mpm-mud project runtimeConfig too small');
assert(projectSnapshot.runtimeState.values.length >= 4, 'mpm-mud project runtimeState too small');
assert(projectSnapshot.statsKeys.includes('meanViscosityState'), 'mpm-mud project stats keys missing meanViscosityState');

const report = buildFutureNativeProjectSnapshotReport();
assert(report.summary.baselineFamilyCount >= 17, 'mpm-mud baseline family count not expanded');
assert(report.baseline.firstWave.some((entry) => entry.familyId === 'mpm-mud'), 'mpm-mud baseline snapshot missing');

console.log('PASS mpm-mud');
console.log(JSON.stringify({
  routes,
  snapshot: {
    currentStage: snapshot.currentStage,
    progressPercent: snapshot.progressPercent,
    uiControlCount: snapshot.uiControlCount,
  },
}, null, 2));
