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
  mode: 'ashfall' | 'frost_lattice' | 'avalanche_field',
  source: 'video' | 'cube' | 'plane',
  expectedPresetId: string,
) {
  const binding = getFutureNativeSceneBinding(mode);
  assert(binding, `${mode}: mpm-snow binding missing`);
  assert(binding.familyId === 'mpm-snow', `${mode}: mpm-snow family mismatch`);
  assert(binding.bindingMode === 'native-particles', `${mode}: mpm-snow binding mode mismatch`);
  assert(binding.primaryPresetId === expectedPresetId, `${mode}: mpm-snow preset mismatch`);

  const patch = buildFutureNativeScenePresetPatch(binding.primaryPresetId, 2);
  assert(patch, `${mode}: mpm-snow preset patch missing`);
  assert((patch as Record<string, unknown>).layer2Type === mode, `${mode}: preset should preserve mode`);

  const config = normalizeConfig({
    ...patch,
    layer2Enabled: true,
    layer2Type: mode,
    layer2Source: source,
    layer2Count: mode === 'ashfall' ? 9800 : mode === 'frost_lattice' ? 9200 : 10800,
    layer2RadiusScale: mode === 'avalanche_field' ? 1.1 : 1.02,
    layer2BaseSize: mode === 'ashfall' ? 0.78 : mode === 'frost_lattice' ? 0.84 : 0.72,
    layer2TemporalStrength: mode === 'frost_lattice' ? 0.22 : 0.3,
    layer2TemporalSpeed: mode === 'avalanche_field' ? 0.24 : 0.18,
  });

  const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
  assert(runtime, `${mode}: mpm-snow runtime missing`);
  assert(runtime.familyId === 'mpm-snow', `${mode}: runtime family mismatch`);

  const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
  assert(descriptor.familyId === 'mpm-snow', `${mode}: descriptor family mismatch`);
  assert(descriptor.bindingMode === 'native-particles', `${mode}: descriptor binding mode mismatch`);
  assert(descriptor.lineCount >= 80, `${mode}: line payload too small`);
  assert(descriptor.pointCount >= 120, `${mode}: point payload too small`);
  assert((descriptor.stats.meanHardeningState ?? 0) > 0.4, `${mode}: hardening state too small`);
  assert((descriptor.stats.hardeningOverlayCellCount ?? 0) >= 16, `${mode}: hardening overlay too small`);
  if (mode === 'frost_lattice') {
    assert((descriptor.stats.constitutiveShellSegmentCount ?? 0) >= 16, `${mode}: frost shell too small`);
  }
  if (mode === 'avalanche_field') {
    assert((descriptor.stats.packedRegionRemeshLineCount ?? 0) >= 16, `${mode}: avalanche remesh too small`);
    assert((descriptor.stats.packedRegionBandCount ?? 0) >= 2, `${mode}: avalanche packed bands missing`);
  }
  return {
    mode,
    presetId: binding.primaryPresetId,
    pointCount: descriptor.pointCount,
    lineCount: descriptor.lineCount,
    materialBranchScore: descriptor.stats.materialBranchScore,
    meanHardeningState: descriptor.stats.meanHardeningState,
    jammedSnowCrustCellCount: descriptor.stats.jammedSnowCrustCellCount,
  };
}

const routes = [
  runRoute('ashfall', 'video', 'future-native-mpm-snow-ashfall'),
  runRoute('frost_lattice', 'cube', 'future-native-mpm-snow-frost-lattice'),
  runRoute('avalanche_field', 'plane', 'future-native-mpm-snow-avalanche-field'),
];

const snapshot = buildIntegratedFamilySnapshot('mpm-snow');
assert(snapshot.currentStage === 'project-integrated', 'mpm-snow snapshot stage mismatch');
assert(snapshot.integrationReady, 'mpm-snow snapshot integrationReady mismatch');
assert(snapshot.uiControlCount >= 12, 'mpm-snow snapshot ui control coverage too low');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('material:snow')), 'mpm-snow runtime material missing');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('hardening:')), 'mpm-snow runtime hardening missing');

const projectSnapshot = buildProjectFutureNativeIntegrationSnapshot('mpm-snow');
assert(projectSnapshot.serializerBlockKey === 'mpmSnow', 'mpm-snow serializer block key mismatch');
assert(projectSnapshot.runtimeConfig.values.length >= 6, 'mpm-snow project runtimeConfig too small');
assert(projectSnapshot.runtimeState.values.length >= 4, 'mpm-snow project runtimeState too small');
assert(projectSnapshot.statsKeys.includes('meanHardeningState'), 'mpm-snow project stats keys missing meanHardeningState');

const report = buildFutureNativeProjectSnapshotReport();
assert(report.summary.baselineFamilyCount >= 15, 'mpm-snow baseline family count not expanded');
assert(report.baseline.firstWave.some((entry) => entry.familyId === 'mpm-snow'), 'mpm-snow baseline snapshot missing');

console.log('PASS mpm-snow');
console.log(JSON.stringify({
  routes,
  snapshot: {
    currentStage: snapshot.currentStage,
    progressPercent: snapshot.progressPercent,
    uiControlCount: snapshot.uiControlCount,
  },
}, null, 2));
