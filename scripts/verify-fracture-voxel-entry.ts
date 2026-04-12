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

const binding = getFutureNativeSceneBinding('voxel_lattice');
assert(binding, 'fracture-voxel binding missing');
assert(binding.familyId === 'fracture-voxel', 'fracture-voxel family mismatch');
assert(binding.bindingMode === 'native-structure', 'fracture-voxel binding mode mismatch');
assert(binding.primaryPresetId === 'future-native-fracture-voxel-lattice', 'fracture-voxel preset mismatch');

const patch = buildFutureNativeScenePresetPatch(binding.primaryPresetId, 2);
assert(patch, 'fracture-voxel preset patch missing');
assert((patch as Record<string, unknown>).layer2Type === 'voxel_lattice', 'fracture-voxel preset should preserve mode');

const config = normalizeConfig({
  ...patch,
  layer2Enabled: true,
  layer2Type: 'voxel_lattice',
  layer2Source: 'cube',
  layer2Count: 9800,
  layer2RadiusScale: 1.08,
  layer2BaseSize: 0.84,
  layer2TemporalStrength: 0.28,
  layer2TemporalSpeed: 0.2,
});

const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
assert(runtime, 'fracture-voxel runtime missing');
assert(runtime.familyId === 'fracture-voxel', 'fracture-voxel runtime family mismatch');

const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
assert(descriptor.familyId === 'fracture-voxel', 'fracture-voxel descriptor family mismatch');
assert(descriptor.bindingMode === 'native-structure', 'fracture-voxel descriptor binding mode mismatch');
assert(descriptor.lineCount >= 120, 'fracture-voxel line payload too small');
assert(descriptor.pointCount >= 20, 'fracture-voxel point payload too small');
assert((descriptor.stats.breakProgress ?? 0) > 0.03, 'fracture-voxel break progress too small');
assert((descriptor.stats.voxelCellCount ?? 0) >= 12, 'fracture-voxel voxel cell count too low');
assert((descriptor.stats.voxelShellSegmentCount ?? 0) >= 16, 'fracture-voxel voxel shell too small');
assert((descriptor.stats.detachedVoxelCellCount ?? 0) >= 16, 'fracture-voxel detached voxel cells too low');
assert((descriptor.stats.detachedVoxelShellSegmentCount ?? 0) >= 16, 'fracture-voxel detached voxel shell too small');
assert((descriptor.stats.siblingFractureBandCount ?? 0) >= 2, 'fracture-voxel sibling fracture bands too low');

const snapshot = buildIntegratedFamilySnapshot('fracture-voxel');
assert(snapshot.currentStage === 'project-integrated', 'fracture-voxel snapshot stage mismatch');
assert(snapshot.integrationReady, 'fracture-voxel snapshot integrationReady mismatch');
assert(snapshot.uiControlCount >= 12, 'fracture-voxel snapshot ui control coverage too low');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('width:')), 'fracture-voxel runtime width missing');
assert(snapshot.runtimeConfigBlock.values.some((value) => value.startsWith('debris:')), 'fracture-voxel runtime debris missing');

const projectSnapshot = buildProjectFutureNativeIntegrationSnapshot('fracture-voxel');
assert(projectSnapshot.serializerBlockKey === 'fractureVoxel', 'fracture-voxel serializer block key mismatch');
assert(projectSnapshot.runtimeConfig.values.length >= 4, 'fracture-voxel project runtimeConfig too small');
assert(projectSnapshot.runtimeState.values.length >= 4, 'fracture-voxel project runtimeState too small');
assert(projectSnapshot.statsKeys.includes('broken'), 'fracture-voxel project stats keys missing broken');

const report = buildFutureNativeProjectSnapshotReport();
assert(report.summary.baselineFamilyCount >= 12, 'fracture-voxel baseline family count not expanded');
assert(report.baseline.firstWave.some((entry) => entry.familyId === 'fracture-voxel'), 'fracture-voxel baseline snapshot missing');

console.log('PASS fracture-voxel');
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
    voxelCellCount: descriptor.stats.voxelCellCount,
    detachedVoxelCellCount: descriptor.stats.detachedVoxelCellCount,
  },
  snapshot: {
    currentStage: snapshot.currentStage,
    progressPercent: snapshot.progressPercent,
    uiControlCount: snapshot.uiControlCount,
  },
}, null, 2));
