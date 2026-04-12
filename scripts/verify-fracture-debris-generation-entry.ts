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

const binding = getFutureNativeSceneBinding('shard_debris');
assert(binding, 'fracture-debris-generation binding missing');
assert(binding.familyId === 'fracture-debris-generation', 'fracture-debris-generation family mismatch');
assert(binding.bindingMode === 'native-structure', 'fracture-debris-generation binding mode mismatch');
assert(binding.primaryPresetId === 'future-native-fracture-debris-generation-shard', 'fracture-debris-generation preset mismatch');

const patch = buildFutureNativeScenePresetPatch(binding.primaryPresetId, 2);
assert(patch, 'fracture-debris-generation preset patch missing');
assert((patch as Record<string, unknown>).layer2Type === 'shard_debris', 'fracture-debris-generation preset should preserve mode');

const config = normalizeConfig({
  ...patch,
  layer2Enabled: true,
  layer2Type: 'shard_debris',
  layer2Source: 'sphere',
  layer2Count: 9600,
  layer2RadiusScale: 1.04,
  layer2BaseSize: 0.78,
  layer2TemporalStrength: 0.34,
  layer2TemporalSpeed: 0.2,
});

const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
assert(runtime, 'fracture-debris-generation runtime missing');
assert(runtime.familyId === 'fracture-debris-generation', 'fracture-debris-generation runtime family mismatch');

const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
assert(descriptor.familyId === 'fracture-debris-generation', 'fracture-debris-generation descriptor family mismatch');
assert(descriptor.bindingMode === 'native-structure', 'fracture-debris-generation descriptor binding mode mismatch');
assert(descriptor.lineCount >= 140, 'fracture-debris-generation line payload too small');
assert(descriptor.pointCount >= 20, 'fracture-debris-generation point payload too small');
assert((descriptor.stats.breakProgress ?? 0) > 0.03, 'fracture-debris-generation break progress too small');
assert((descriptor.stats.debris ?? 0) >= 2, 'fracture-debris-generation debris count too low');
assert((descriptor.stats.debrisTrailLineCount ?? 0) >= 4, 'fracture-debris-generation debris trails too low');
assert((descriptor.stats.dustDebrisCount ?? 0) >= 1, 'fracture-debris-generation dust branch missing');
assert((descriptor.stats.shardDebrisCount ?? 0) >= 1, 'fracture-debris-generation shard branch missing');
assert((descriptor.stats.splinterDebrisCount ?? 0) >= 1, 'fracture-debris-generation splinter branch missing');
assert((descriptor.stats.dustCloudPointCount ?? 0) >= 2, 'fracture-debris-generation dust cloud points too low');
assert((descriptor.stats.shardFacetLineCount ?? 0) >= 1, 'fracture-debris-generation shard facet lines too low');
assert((descriptor.stats.splinterBranchLineCount ?? 0) >= 3, 'fracture-debris-generation splinter branch lines too low');
assert((descriptor.stats.fragmentLinkLineCount ?? 0) >= 1, 'fracture-debris-generation fragment links missing');
assert((descriptor.stats.detachedFragments ?? 0) >= 1, 'fracture-debris-generation detached fragments missing');
assert((descriptor.stats.breakGrammarMaterialModes ?? 0) >= 1, 'fracture-debris-generation grammar modes missing');
assert((descriptor.stats.siblingFractureBandCount ?? 0) >= 2, 'fracture-debris-generation sibling bands too low');

const snapshot = buildIntegratedFamilySnapshot('fracture-debris-generation');
assert(snapshot.currentStage === 'project-integrated', 'fracture-debris-generation snapshot stage mismatch');
assert(snapshot.integrationReady, 'fracture-debris-generation snapshot integrationReady mismatch');
assert(snapshot.uiControlCount >= 12, 'fracture-debris-generation snapshot ui control coverage too low');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('width:')), 'fracture-debris-generation runtime width missing');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('debris:')), 'fracture-debris-generation runtime debris missing');

const projectSnapshot = buildProjectFutureNativeIntegrationSnapshot('fracture-debris-generation');
assert(projectSnapshot.serializerBlockKey === 'fractureDebrisGeneration', 'fracture-debris-generation serializer block key mismatch');
assert(projectSnapshot.runtimeConfig.values.length >= 4, 'fracture-debris-generation project runtimeConfig too small');
assert(projectSnapshot.runtimeState.values.length >= 4, 'fracture-debris-generation project runtimeState too small');
assert(projectSnapshot.statsKeys.includes('debris'), 'fracture-debris-generation project stats keys missing debris');

const report = buildFutureNativeProjectSnapshotReport();
assert(report.summary.baselineFamilyCount >= 16, 'fracture-debris-generation baseline family count not expanded');
assert(report.baseline.firstWave.some((entry) => entry.familyId === 'fracture-debris-generation'), 'fracture-debris-generation baseline snapshot missing');

console.log('PASS fracture-debris-generation');
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
    debris: descriptor.stats.debris,
    debrisTrailLineCount: descriptor.stats.debrisTrailLineCount,
  },
  snapshot: {
    currentStage: snapshot.currentStage,
    progressPercent: snapshot.progressPercent,
    uiControlCount: snapshot.uiControlCount,
  },
}, null, 2));
