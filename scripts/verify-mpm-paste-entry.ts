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
  mode: 'capillary_sheet' | 'percolation_sheet' | 'crawl_seep',
  source: 'text' | 'image' | 'plane',
  expectedPresetId: string,
) {
  const binding = getFutureNativeSceneBinding(mode);
  assert(binding, `${mode}: mpm-paste binding missing`);
  assert(binding.familyId === 'mpm-paste', `${mode}: mpm-paste family mismatch`);
  assert(binding.bindingMode === 'native-particles', `${mode}: mpm-paste binding mode mismatch`);
  assert(binding.primaryPresetId === expectedPresetId, `${mode}: mpm-paste preset mismatch`);

  const patch = buildFutureNativeScenePresetPatch(binding.primaryPresetId, 2);
  assert(patch, `${mode}: mpm-paste preset patch missing`);
  assert((patch as Record<string, unknown>).layer2Type === mode, `${mode}: preset should preserve mode`);

  const config = normalizeConfig({
    ...patch,
    layer2Enabled: true,
    layer2Type: mode,
    layer2Source: source,
    layer2Count: mode === 'capillary_sheet' ? 9800 : mode === 'percolation_sheet' ? 9600 : 9200,
    layer2RadiusScale: mode === 'capillary_sheet' ? 1.04 : mode === 'percolation_sheet' ? 1.08 : 1.06,
    layer2BaseSize: mode === 'capillary_sheet' ? 0.9 : mode === 'percolation_sheet' ? 0.94 : 1.02,
    layer2TemporalStrength: mode === 'capillary_sheet' ? 0.3 : 0.26,
    layer2TemporalSpeed: mode === 'crawl_seep' ? 0.24 : 0.18,
  });

  const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
  assert(runtime, `${mode}: mpm-paste runtime missing`);
  assert(runtime.familyId === 'mpm-paste', `${mode}: runtime family mismatch`);

  const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
  assert(descriptor.familyId === 'mpm-paste', `${mode}: descriptor family mismatch`);
  assert(descriptor.bindingMode === 'native-particles', `${mode}: descriptor binding mode mismatch`);
  assert(descriptor.lineCount >= 80, `${mode}: line payload too small`);
  assert(descriptor.pointCount >= 120, `${mode}: point payload too small`);
  assert((descriptor.stats.meanViscosityState ?? 0) > 0.48, `${mode}: viscosity state too small`);
  assert((descriptor.stats.meanYieldMemory ?? 0) > 0.12, `${mode}: yield memory too small`);
  assert((descriptor.stats.yieldOverlayCellCount ?? 0) >= 16, `${mode}: yield overlay too small`);
  if (mode === 'crawl_seep') {
    assert((descriptor.stats.yieldDominantLineCount ?? 0) >= 8, `${mode}: yield-dominant line count too low`);
  }
  return {
    mode,
    presetId: binding.primaryPresetId,
    pointCount: descriptor.pointCount,
    lineCount: descriptor.lineCount,
    materialBranchScore: descriptor.stats.materialBranchScore,
    meanViscosityState: descriptor.stats.meanViscosityState,
    jammedPasteCoreCellCount: descriptor.stats.jammedPasteCoreCellCount,
  };
}

const routes = [
  runRoute('capillary_sheet', 'text', 'future-native-mpm-paste-capillary-sheet'),
  runRoute('percolation_sheet', 'image', 'future-native-mpm-paste-percolation-sheet'),
  runRoute('crawl_seep', 'plane', 'future-native-mpm-paste-crawl-seep'),
];

const snapshot = buildIntegratedFamilySnapshot('mpm-paste');
assert(snapshot.currentStage === 'project-integrated', 'mpm-paste snapshot stage mismatch');
assert(snapshot.integrationReady, 'mpm-paste snapshot integrationReady mismatch');
assert(snapshot.uiControlCount >= 12, 'mpm-paste snapshot ui control coverage too low');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('material:paste')), 'mpm-paste runtime material missing');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('plasticity:')), 'mpm-paste runtime plasticity missing');

const projectSnapshot = buildProjectFutureNativeIntegrationSnapshot('mpm-paste');
assert(projectSnapshot.serializerBlockKey === 'mpmPaste', 'mpm-paste serializer block key mismatch');
assert(projectSnapshot.runtimeConfig.values.length >= 6, 'mpm-paste project runtimeConfig too small');
assert(projectSnapshot.runtimeState.values.length >= 4, 'mpm-paste project runtimeState too small');
assert(projectSnapshot.statsKeys.includes('meanYieldMemory'), 'mpm-paste project stats keys missing meanYieldMemory');

const report = buildFutureNativeProjectSnapshotReport();
assert(report.summary.baselineFamilyCount >= 18, 'mpm-paste baseline family count not expanded');
assert(report.baseline.firstWave.some((entry) => entry.familyId === 'mpm-paste'), 'mpm-paste baseline snapshot missing');

console.log('PASS mpm-paste');
console.log(JSON.stringify({
  routes,
  snapshot: {
    currentStage: snapshot.currentStage,
    progressPercent: snapshot.progressPercent,
    uiControlCount: snapshot.uiControlCount,
  },
}, null, 2));
