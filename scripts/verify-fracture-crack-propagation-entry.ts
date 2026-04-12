import { normalizeConfig } from '../lib/appStateConfig';
import { buildFutureNativeProjectSnapshotReport } from '../lib/future-native-families/futureNativeFamiliesProjectReport';
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

const binding = getFutureNativeSceneBinding('seep_fracture');
assert(binding, 'fracture-crack-propagation binding missing');
assert(binding.familyId === 'fracture-crack-propagation', 'fracture-crack-propagation family mismatch');
assert(binding.bindingMode === 'native-structure', 'fracture-crack-propagation binding mode mismatch');
assert(binding.primaryPresetId === 'future-native-fracture-crack-propagation-seep', 'fracture-crack-propagation preset mismatch');

const patch = buildFutureNativeScenePresetPatch(binding.primaryPresetId, 2);
assert(patch, 'fracture-crack-propagation preset patch missing');
assert((patch as Record<string, unknown>).layer2Type === 'seep_fracture', 'fracture-crack-propagation preset should preserve mode');

const config = normalizeConfig({
  ...patch,
  layer2Enabled: true,
  layer2Type: 'seep_fracture',
  layer2Source: 'image',
  layer2Count: 9200,
  layer2RadiusScale: 0.98,
  layer2BaseSize: 0.8,
  layer2TemporalStrength: 0.32,
  layer2TemporalSpeed: 0.24,
});

const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
assert(runtime, 'fracture-crack-propagation runtime missing');
assert(runtime.familyId === 'fracture-crack-propagation', 'fracture-crack-propagation runtime family mismatch');

const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
assert(descriptor.familyId === 'fracture-crack-propagation', 'fracture-crack-propagation descriptor family mismatch');
assert(descriptor.bindingMode === 'native-structure', 'fracture-crack-propagation descriptor binding mode mismatch');
assert(descriptor.lineCount >= 120, 'fracture-crack-propagation line payload too small');
assert(descriptor.pointCount >= 16, 'fracture-crack-propagation point payload too small');
assert((descriptor.stats.breakProgress ?? 0) > 0.03, 'fracture-crack-propagation break progress too small');
assert((descriptor.stats.crackFrontCount ?? 0) >= 2, 'fracture-crack-propagation crack front count too low');
assert((descriptor.stats.crackFrontLineCount ?? 0) >= 2, 'fracture-crack-propagation crack front lines too low');
assert((descriptor.stats.crackFrontRadius ?? 0) > 0.08, 'fracture-crack-propagation crack front radius too small');
assert((descriptor.stats.propagationAdvance ?? 0) > 0.04, 'fracture-crack-propagation advance too small');
assert((descriptor.stats.detachedFragments ?? 0) >= 1, 'fracture-crack-propagation detached fragments missing');
assert((descriptor.stats.breakGrammarMaterialModes ?? 0) >= 3, 'fracture-crack-propagation grammar modes too low');
assert((descriptor.stats.siblingFractureBandCount ?? 0) >= 2, 'fracture-crack-propagation sibling bands too low');

const snapshot = buildIntegratedFamilySnapshot('fracture-crack-propagation');
assert(snapshot.currentStage === 'project-integrated', 'fracture-crack-propagation snapshot stage mismatch');
assert(snapshot.integrationReady, 'fracture-crack-propagation snapshot integrationReady mismatch');
assert(snapshot.uiControlCount >= 12, 'fracture-crack-propagation snapshot ui control coverage too low');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('width:')), 'fracture-crack-propagation runtime width missing');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('directionalBias:')), 'fracture-crack-propagation runtime directionalBias missing');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('debris:')), 'fracture-crack-propagation runtime debris missing');

const projectSnapshot = buildProjectFutureNativeIntegrationSnapshot('fracture-crack-propagation');
assert(projectSnapshot.serializerBlockKey === 'fractureCrackPropagation', 'fracture-crack-propagation serializer block key mismatch');
assert(projectSnapshot.runtimeConfig.values.length >= 4, 'fracture-crack-propagation project runtimeConfig too small');
assert(projectSnapshot.runtimeState.values.length >= 4, 'fracture-crack-propagation project runtimeState too small');
assert(projectSnapshot.statsKeys.includes('crackFrontRadius'), 'fracture-crack-propagation project stats keys missing crackFrontRadius');

const report = buildFutureNativeProjectSnapshotReport();
assert(report.summary.baselineFamilyCount >= 14, 'fracture-crack-propagation baseline family count not expanded');
assert(report.baseline.firstWave.some((entry) => entry.familyId === 'fracture-crack-propagation'), 'fracture-crack-propagation baseline snapshot missing');

console.log('PASS fracture-crack-propagation');
console.log(JSON.stringify({
  binding: {
    mode: binding.modeId,
    familyId: binding.familyId,
    bindingMode: binding.bindingMode,
    presetId: binding.primaryPresetId,
  },
  descriptor: {
    pointCount: descriptor.pointCount,
    lineCount: descriptor.lineCount,
    crackFrontCount: descriptor.stats.crackFrontCount,
    crackFrontRadius: descriptor.stats.crackFrontRadius,
  },
  snapshot: {
    currentStage: snapshot.currentStage,
    progressPercent: snapshot.progressPercent,
    uiControlCount: snapshot.uiControlCount,
  },
}, null, 2));
