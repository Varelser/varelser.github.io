import { buildFutureNativeFamilyImplementationPacket } from '../lib/future-native-families/futureNativeFamiliesImplementationPackets';
import { getFutureNativeFamilyProgress } from '../lib/future-native-families/futureNativeFamiliesProgress';
import { mergeFutureNativeFamilySerializedBlock } from '../lib/future-native-families/futureNativeFamiliesSerialization';
import { getFutureNativeSpecialistRuntimeStub } from '../lib/future-native-families/futureNativeFamiliesSpecialist';
import {
  buildFutureNativeHoudiniAdapterMappings,
  buildFutureNativeHoudiniGraphPacket,
  serializeFutureNativeHoudiniGraphPacket,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistHoudini';
import { getFutureNativeVerificationScenario } from '../lib/future-native-families/futureNativeFamiliesVerificationScenarios';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const familyId = 'specialist-houdini-native' as const;
const stub = getFutureNativeSpecialistRuntimeStub(familyId);
const packet = buildFutureNativeFamilyImplementationPacket(familyId);
const serialized = mergeFutureNativeFamilySerializedBlock(familyId);
const progress = getFutureNativeFamilyProgress(familyId);
const verification = getFutureNativeVerificationScenario(familyId);
const graphPacket = buildFutureNativeHoudiniGraphPacket();
const graphSerialized = serializeFutureNativeHoudiniGraphPacket();
const adapterMappings = buildFutureNativeHoudiniAdapterMappings();

assert(stub.id === familyId, 'specialist-houdini-native stub id mismatch');
assert(stub.graphHint === 'node-chain', 'specialist-houdini-native graph hint mismatch');
assert(stub.outputHint === 'multi-output', 'specialist-houdini-native output hint mismatch');
assert(stub.config.familyId === familyId, 'specialist-houdini-native config family mismatch');
assert(stub.config.solverDepth === 'deep', 'specialist-houdini-native solver depth mismatch');
assert(stub.config.iterations === 1, 'specialist-houdini-native iterations mismatch');
assert(stub.nextImplementationStep.length > 0, 'specialist-houdini-native next step missing');
assert(graphPacket.familyId === familyId, 'specialist-houdini-native graph packet family mismatch');
assert(graphPacket.stages.length === 3, 'specialist-houdini-native graph stage count mismatch');
assert(graphPacket.stages.every((stage) => stage.nodes.length >= 1), 'specialist-houdini-native graph stage nodes missing');
assert(graphPacket.outputBridges.includes('native-volume'), 'specialist-houdini-native native-volume bridge missing');
assert(graphPacket.outputBridges.includes('native-surface'), 'specialist-houdini-native native-surface bridge missing');
assert(graphSerialized.values.some((value) => value === 'stageCount:3'), 'specialist-houdini-native serialized graph stage count missing');
assert(adapterMappings.length >= 6, 'specialist-houdini-native adapter mappings too small');
assert(adapterMappings.every((mapping) => !mapping.nativeNodeId.startsWith('product-pack-')), 'specialist-houdini-native graph should serialize independently of pack ids');

assert(packet.entry.id === familyId, 'specialist-houdini-native packet entry mismatch');
assert(packet.entry.group === 'specialist-native', 'specialist-houdini-native packet group mismatch');
assert(packet.entry.stage === 'project-integrated', 'specialist-houdini-native registry stage mismatch');
assert(packet.starterRuntime.targetRuntime === 'hybrid', 'specialist-houdini-native target runtime mismatch');
assert(packet.starterRuntime.files.length >= 6, 'specialist-houdini-native starter runtime files missing');
assert(packet.acceptance.mustPass.includes('Graph/operator stage is represented in the UI without collapsing into preset-only mode.'), 'specialist-houdini-native acceptance missing graph-stage check');
assert(packet.acceptance.mustPass.includes('At least one engine-native graph stage runs independently of reference packs.'), 'specialist-houdini-native acceptance missing independent graph-stage check');

assert(serialized.familyId === familyId, 'specialist-houdini-native serialized family mismatch');
assert(serialized.serializerBlockKey === 'specialistHoudiniNative', 'specialist-houdini-native serializer key mismatch');
assert(serialized.stage === 'project-integrated', 'specialist-houdini-native serialized stage mismatch');
assert(serialized.coupling === 0.7, 'specialist-houdini-native serialized coupling mismatch');

assert(progress.currentStage === 'project-integrated', 'specialist-houdini-native progress stage mismatch');
assert(progress.progressPercent >= 72, 'specialist-houdini-native progress percent too low');
assert(progress.starterImplemented, 'specialist-houdini-native should count as starter-implemented');
assert(progress.verifierImplemented, 'specialist-houdini-native should count as verification-ready');
assert(progress.nextTargets.length >= 3, 'specialist-houdini-native next targets missing');

assert(verification.familyId === familyId, 'specialist-houdini-native verification scenario mismatch');
assert(verification.checks.includes('native graph stage instantiates'), 'specialist-houdini-native verification checks missing native graph stage');
assert(verification.fixtureHint.length > 0, 'specialist-houdini-native fixture hint missing');

console.log('PASS specialist-houdini-native');
console.log(JSON.stringify({
  stub: {
    graphHint: stub.graphHint,
    outputHint: stub.outputHint,
    nextImplementationStep: stub.nextImplementationStep,
  },
  graph: {
    stageCount: graphPacket.stages.length,
    outputBridges: graphPacket.outputBridges,
    adapterMappings: adapterMappings.length,
  },
  packet: {
    targetRuntime: packet.starterRuntime.targetRuntime,
    fileCount: packet.starterRuntime.files.length,
    acceptanceCount: packet.acceptance.mustPass.length,
  },
  progress: {
    currentStage: progress.currentStage,
    progressPercent: progress.progressPercent,
  },
}, null, 2));
