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
  mode: 'viscous_flow' | 'melt_front' | 'evaporative_sheet',
  source: 'plane' | 'sphere',
  expectedPresetId: string,
) {
  const binding = getFutureNativeSceneBinding(mode);
  assert(binding, `${mode}: mpm-viscoplastic binding missing`);
  assert(binding.familyId === 'mpm-viscoplastic', `${mode}: mpm-viscoplastic family mismatch`);
  assert(binding.bindingMode === 'native-particles', `${mode}: mpm-viscoplastic binding mode mismatch`);
  assert(binding.primaryPresetId === expectedPresetId, `${mode}: mpm-viscoplastic preset mismatch`);

  const patch = buildFutureNativeScenePresetPatch(binding.primaryPresetId, 2);
  assert(patch, `${mode}: mpm-viscoplastic preset patch missing`);
  assert((patch as Record<string, unknown>).layer2Type === mode, `${mode}: preset should preserve mode`);

  const config = normalizeConfig({
    ...patch,
    layer2Enabled: true,
    layer2Type: mode,
    layer2Source: source,
    layer2Count: mode === 'viscous_flow' ? 10100 : mode === 'melt_front' ? 9400 : 9200,
    layer2RadiusScale: mode === 'melt_front' ? 1.08 : 1.04,
    layer2BaseSize: mode === 'viscous_flow' ? 0.88 : mode === 'melt_front' ? 0.92 : 1.02,
    layer2TemporalStrength: mode === 'melt_front' ? 0.34 : 0.28,
    layer2TemporalSpeed: mode === 'evaporative_sheet' ? 0.24 : 0.2,
  });

  const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
  assert(runtime, `${mode}: mpm-viscoplastic runtime missing`);
  assert(runtime.familyId === 'mpm-viscoplastic', `${mode}: runtime family mismatch`);

  const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
  assert(descriptor.familyId === 'mpm-viscoplastic', `${mode}: descriptor family mismatch`);
  assert(descriptor.bindingMode === 'native-particles', `${mode}: descriptor binding mode mismatch`);
  assert(descriptor.lineCount >= 80, `${mode}: line payload too small`);
  assert(descriptor.pointCount >= 120, `${mode}: point payload too small`);
  assert((descriptor.stats.meanViscosityState ?? 0) > 0.45, `${mode}: viscosity state too small`);
  assert((descriptor.stats.viscosityOverlayCellCount ?? 0) >= 16, `${mode}: viscosity overlay too small`);
  if (mode === 'melt_front') {
    assert((descriptor.stats.meanYieldMemory ?? 0) > 0.14, `${mode}: yield memory too small`);
    assert((descriptor.stats.yieldOverlayCellCount ?? 0) >= 16, `${mode}: yield overlay too small`);
    assert((descriptor.stats.jammedMaterialSplitModeCount ?? 0) >= 1, `${mode}: jammed split modes missing`);
    assert((descriptor.stats.packedRegionCellCount ?? 0) >= 16, `${mode}: packed region too small`);
  }
  return {
    mode,
    presetId: binding.primaryPresetId,
    pointCount: descriptor.pointCount,
    lineCount: descriptor.lineCount,
    materialBranchScore: descriptor.stats.materialBranchScore,
    meanViscosityState: descriptor.stats.meanViscosityState,
    meanYieldMemory: descriptor.stats.meanYieldMemory,
  };
}

const routes = [
  runRoute('viscous_flow', 'plane', 'future-native-mpm-viscoplastic-viscous-flow'),
  runRoute('melt_front', 'sphere', 'future-native-mpm-viscoplastic-melt-front'),
  runRoute('evaporative_sheet', 'plane', 'future-native-mpm-viscoplastic-evaporative-sheet'),
];

const snapshot = buildIntegratedFamilySnapshot('mpm-viscoplastic');
assert(snapshot.currentStage === 'project-integrated', 'mpm-viscoplastic snapshot stage mismatch');
assert(snapshot.integrationReady, 'mpm-viscoplastic snapshot integrationReady mismatch');
assert(snapshot.uiControlCount >= 12, 'mpm-viscoplastic snapshot ui control coverage too low');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('material:paste')), 'mpm-viscoplastic runtime material missing');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('plasticity:')), 'mpm-viscoplastic runtime plasticity missing');

const projectSnapshot = buildProjectFutureNativeIntegrationSnapshot('mpm-viscoplastic');
assert(projectSnapshot.serializerBlockKey === 'mpmViscoplastic', 'mpm-viscoplastic serializer block key mismatch');
assert(projectSnapshot.runtimeConfig.values.length >= 6, 'mpm-viscoplastic project runtimeConfig too small');
assert(projectSnapshot.runtimeState.values.length >= 4, 'mpm-viscoplastic project runtimeState too small');
assert(projectSnapshot.statsKeys.includes('meanYieldMemory'), 'mpm-viscoplastic project stats keys missing meanYieldMemory');

const report = buildFutureNativeProjectSnapshotReport();
assert(report.summary.baselineFamilyCount >= 13, 'mpm-viscoplastic baseline family count not expanded');
assert(report.baseline.firstWave.some((entry) => entry.familyId === 'mpm-viscoplastic'), 'mpm-viscoplastic baseline snapshot missing');

console.log('PASS mpm-viscoplastic');
console.log(JSON.stringify({
  routes,
  snapshot: {
    currentStage: snapshot.currentStage,
    progressPercent: snapshot.progressPercent,
    uiControlCount: snapshot.uiControlCount,
  },
}, null, 2));
