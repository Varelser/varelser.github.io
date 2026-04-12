import { buildFutureNativeFamilyImplementationPacket } from '../lib/future-native-families/futureNativeFamiliesImplementationPackets';
import { getFutureNativeFamilyProgress } from '../lib/future-native-families/futureNativeFamiliesProgress';
import { mergeFutureNativeFamilySerializedBlock } from '../lib/future-native-families/futureNativeFamiliesSerialization';
import { getFutureNativeSpecialistRuntimeStub } from '../lib/future-native-families/futureNativeFamiliesSpecialist';
import {
  buildFutureNativeUnityVfxAdapterMappings,
  buildFutureNativeUnityVfxGraphPacket,
  serializeFutureNativeUnityVfxGraphPacket,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistUnityVfx';
import { getFutureNativeVerificationScenario } from '../lib/future-native-families/futureNativeFamiliesVerificationScenarios';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const familyId = 'specialist-unity-vfx-native' as const;
const stub = getFutureNativeSpecialistRuntimeStub(familyId);
const packet = buildFutureNativeFamilyImplementationPacket(familyId);
const serialized = mergeFutureNativeFamilySerializedBlock(familyId);
const progress = getFutureNativeFamilyProgress(familyId);
const verification = getFutureNativeVerificationScenario(familyId);
const graphPacket = buildFutureNativeUnityVfxGraphPacket();
const graphSerialized = serializeFutureNativeUnityVfxGraphPacket();
const adapterMappings = buildFutureNativeUnityVfxAdapterMappings();

assert(stub.id === familyId, 'specialist-unity-vfx-native stub id mismatch');
assert(stub.graphHint === 'graph-stage', 'specialist-unity-vfx-native graph hint mismatch');
assert(stub.outputHint === 'multi-output', 'specialist-unity-vfx-native output hint mismatch');
assert(stub.config.familyId === familyId, 'specialist-unity-vfx-native config family mismatch');
assert(stub.config.solverDepth === 'deep', 'specialist-unity-vfx-native solver depth mismatch');
assert(stub.config.iterations === 1, 'specialist-unity-vfx-native iterations mismatch');
assert(graphPacket.familyId === familyId, 'specialist-unity-vfx-native graph packet family mismatch');
assert(graphPacket.stages.length === 3, 'specialist-unity-vfx-native graph stage count mismatch');
assert(graphPacket.stages.every((stage) => stage.nodes.length >= 1), 'specialist-unity-vfx-native graph stage nodes missing');
assert(graphPacket.outputBridges.includes('native-particles'), 'specialist-unity-vfx-native native-particles bridge missing');
assert(graphPacket.outputBridges.includes('native-surface'), 'specialist-unity-vfx-native native-surface bridge missing');
assert(graphSerialized.values.some((value) => value === 'stageCount:3'), 'specialist-unity-vfx-native serialized graph stage count missing');
assert(adapterMappings.length >= 3, 'specialist-unity-vfx-native adapter mappings too small');
assert(adapterMappings.every((mapping) => !mapping.nativeNodeId.startsWith('product-pack-')), 'specialist-unity-vfx-native graph should serialize independently of pack ids');

assert(packet.entry.id === familyId, 'specialist-unity-vfx-native packet entry mismatch');
assert(packet.entry.group === 'specialist-native', 'specialist-unity-vfx-native packet group mismatch');
assert(packet.entry.stage === 'project-integrated', 'specialist-unity-vfx-native registry stage mismatch');
assert(packet.starterRuntime.targetRuntime === 'hybrid', 'specialist-unity-vfx-native target runtime mismatch');
assert(packet.acceptance.mustPass.includes('At least one engine-native graph stage runs independently of reference packs.'), 'specialist-unity-vfx-native acceptance missing independent graph-stage check');

assert(serialized.familyId === familyId, 'specialist-unity-vfx-native serialized family mismatch');
assert(serialized.serializerBlockKey === 'specialistUnityVfxNative', 'specialist-unity-vfx-native serializer key mismatch');
assert(serialized.stage === 'project-integrated', 'specialist-unity-vfx-native serialized stage mismatch');

assert(progress.currentStage === 'project-integrated', 'specialist-unity-vfx-native progress stage mismatch');
assert(progress.progressPercent >= 72, 'specialist-unity-vfx-native progress percent too low');
assert(progress.verifierImplemented, 'specialist-unity-vfx-native should count as verification-ready');

assert(verification.familyId === familyId, 'specialist-unity-vfx-native verification scenario mismatch');
assert(verification.checks.includes('native graph stage instantiates'), 'specialist-unity-vfx-native verification checks missing native graph stage');

console.log('PASS specialist-unity-vfx-native');
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
