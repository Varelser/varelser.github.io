import { buildFutureNativeFamilyImplementationPacket } from '../lib/future-native-families/futureNativeFamiliesImplementationPackets';
import { getFutureNativeFamilyProgress } from '../lib/future-native-families/futureNativeFamiliesProgress';
import { mergeFutureNativeFamilySerializedBlock } from '../lib/future-native-families/futureNativeFamiliesSerialization';
import { getFutureNativeSpecialistRuntimeStub } from '../lib/future-native-families/futureNativeFamiliesSpecialist';
import {
  buildFutureNativeTouchdesignerAdapterMappings,
  buildFutureNativeTouchdesignerGraphPacket,
  serializeFutureNativeTouchdesignerGraphPacket,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistTouchdesigner';
import { getFutureNativeVerificationScenario } from '../lib/future-native-families/futureNativeFamiliesVerificationScenarios';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const familyId = 'specialist-touchdesigner-native' as const;
const stub = getFutureNativeSpecialistRuntimeStub(familyId);
const packet = buildFutureNativeFamilyImplementationPacket(familyId);
const serialized = mergeFutureNativeFamilySerializedBlock(familyId);
const progress = getFutureNativeFamilyProgress(familyId);
const verification = getFutureNativeVerificationScenario(familyId);
const graphPacket = buildFutureNativeTouchdesignerGraphPacket();
const graphSerialized = serializeFutureNativeTouchdesignerGraphPacket();
const adapterMappings = buildFutureNativeTouchdesignerAdapterMappings();

assert(stub.id === familyId, 'specialist-touchdesigner-native stub id mismatch');
assert(stub.graphHint === 'operator-pipe', 'specialist-touchdesigner-native graph hint mismatch');
assert(stub.outputHint === 'multi-output', 'specialist-touchdesigner-native output hint mismatch');
assert(stub.config.familyId === familyId, 'specialist-touchdesigner-native config family mismatch');
assert(stub.config.solverDepth === 'deep', 'specialist-touchdesigner-native solver depth mismatch');
assert(stub.config.iterations === 1, 'specialist-touchdesigner-native iterations mismatch');
assert(graphPacket.familyId === familyId, 'specialist-touchdesigner-native graph packet family mismatch');
assert(graphPacket.stages.length === 3, 'specialist-touchdesigner-native graph stage count mismatch');
assert(graphPacket.stages.every((stage) => stage.nodes.length >= 1), 'specialist-touchdesigner-native graph stage nodes missing');
assert(graphPacket.outputBridges.includes('native-image-field'), 'specialist-touchdesigner-native native-image-field bridge missing');
assert(graphPacket.outputBridges.includes('native-particles'), 'specialist-touchdesigner-native native-particles bridge missing');
assert(graphSerialized.values.some((value) => value === 'stageCount:3'), 'specialist-touchdesigner-native serialized graph stage count missing');
assert(adapterMappings.length >= 4, 'specialist-touchdesigner-native adapter mappings too small');
assert(adapterMappings.every((mapping) => !mapping.nativeNodeId.startsWith('product-pack-')), 'specialist-touchdesigner-native graph should serialize independently of pack ids');

assert(packet.entry.id === familyId, 'specialist-touchdesigner-native packet entry mismatch');
assert(packet.entry.group === 'specialist-native', 'specialist-touchdesigner-native packet group mismatch');
assert(packet.entry.stage === 'project-integrated', 'specialist-touchdesigner-native registry stage mismatch');
assert(packet.starterRuntime.targetRuntime === 'hybrid', 'specialist-touchdesigner-native target runtime mismatch');
assert(packet.acceptance.mustPass.includes('At least one engine-native graph stage runs independently of reference packs.'), 'specialist-touchdesigner-native acceptance missing independent graph-stage check');

assert(serialized.familyId === familyId, 'specialist-touchdesigner-native serialized family mismatch');
assert(serialized.serializerBlockKey === 'specialistTouchdesignerNative', 'specialist-touchdesigner-native serializer key mismatch');
assert(serialized.stage === 'project-integrated', 'specialist-touchdesigner-native serialized stage mismatch');

assert(progress.currentStage === 'project-integrated', 'specialist-touchdesigner-native progress stage mismatch');
assert(progress.progressPercent >= 72, 'specialist-touchdesigner-native progress percent too low');
assert(progress.verifierImplemented, 'specialist-touchdesigner-native should count as verification-ready');

assert(verification.familyId === familyId, 'specialist-touchdesigner-native verification scenario mismatch');
assert(verification.checks.includes('native graph stage instantiates'), 'specialist-touchdesigner-native verification checks missing native graph stage');

console.log('PASS specialist-touchdesigner-native');
console.log(
  JSON.stringify(
    {
      stub: {
        graphHint: stub.graphHint,
        outputHint: stub.outputHint,
      },
      graph: {
        stageCount: graphPacket.stages.length,
        outputBridges: graphPacket.outputBridges,
        adapterMappings: adapterMappings.length,
      },
      progress: {
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
      },
    },
    null,
    2,
  ),
);
