import { buildFutureNativeFamilyImplementationPacket } from '../lib/future-native-families/futureNativeFamiliesImplementationPackets';
import { getFutureNativeFamilyProgress } from '../lib/future-native-families/futureNativeFamiliesProgress';
import { mergeFutureNativeFamilySerializedBlock } from '../lib/future-native-families/futureNativeFamiliesSerialization';
import { getFutureNativeSpecialistRuntimeStub } from '../lib/future-native-families/futureNativeFamiliesSpecialist';
import {
  buildFutureNativeNiagaraAdapterMappings,
  buildFutureNativeNiagaraGraphPacket,
  serializeFutureNativeNiagaraGraphPacket,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistNiagara';
import { getFutureNativeVerificationScenario } from '../lib/future-native-families/futureNativeFamiliesVerificationScenarios';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const familyId = 'specialist-niagara-native' as const;
const stub = getFutureNativeSpecialistRuntimeStub(familyId);
const packet = buildFutureNativeFamilyImplementationPacket(familyId);
const serialized = mergeFutureNativeFamilySerializedBlock(familyId);
const progress = getFutureNativeFamilyProgress(familyId);
const verification = getFutureNativeVerificationScenario(familyId);
const graphPacket = buildFutureNativeNiagaraGraphPacket();
const graphSerialized = serializeFutureNativeNiagaraGraphPacket();
const adapterMappings = buildFutureNativeNiagaraAdapterMappings();

assert(stub.id === familyId, 'specialist-niagara-native stub id mismatch');
assert(stub.graphHint === 'emitter-stack', 'specialist-niagara-native graph hint mismatch');
assert(stub.outputHint === 'multi-output', 'specialist-niagara-native output hint mismatch');
assert(stub.config.familyId === familyId, 'specialist-niagara-native config family mismatch');
assert(stub.config.solverDepth === 'deep', 'specialist-niagara-native solver depth mismatch');
assert(stub.config.iterations === 1, 'specialist-niagara-native iterations mismatch');
assert(graphPacket.familyId === familyId, 'specialist-niagara-native graph packet family mismatch');
assert(graphPacket.stages.length === 3, 'specialist-niagara-native graph stage count mismatch');
assert(graphPacket.stages.every((stage) => stage.nodes.length >= 1), 'specialist-niagara-native graph stage nodes missing');
assert(graphPacket.outputBridges.includes('native-particles'), 'specialist-niagara-native native-particles bridge missing');
assert(graphPacket.outputBridges.includes('native-structure'), 'specialist-niagara-native native-structure bridge missing');
assert(graphSerialized.values.some((value) => value === 'stageCount:3'), 'specialist-niagara-native serialized graph stage count missing');
assert(adapterMappings.length >= 3, 'specialist-niagara-native adapter mappings too small');
assert(adapterMappings.every((mapping) => !mapping.nativeNodeId.startsWith('product-pack-')), 'specialist-niagara-native graph should serialize independently of pack ids');

assert(packet.entry.id === familyId, 'specialist-niagara-native packet entry mismatch');
assert(packet.entry.group === 'specialist-native', 'specialist-niagara-native packet group mismatch');
assert(packet.entry.stage === 'project-integrated', 'specialist-niagara-native registry stage mismatch');
assert(packet.starterRuntime.targetRuntime === 'hybrid', 'specialist-niagara-native target runtime mismatch');
assert(packet.acceptance.mustPass.includes('At least one engine-native graph stage runs independently of reference packs.'), 'specialist-niagara-native acceptance missing independent graph-stage check');

assert(serialized.familyId === familyId, 'specialist-niagara-native serialized family mismatch');
assert(serialized.serializerBlockKey === 'specialistNiagaraNative', 'specialist-niagara-native serializer key mismatch');
assert(serialized.stage === 'project-integrated', 'specialist-niagara-native serialized stage mismatch');

assert(progress.currentStage === 'project-integrated', 'specialist-niagara-native progress stage mismatch');
assert(progress.progressPercent >= 72, 'specialist-niagara-native progress percent too low');
assert(progress.verifierImplemented, 'specialist-niagara-native should count as verification-ready');

assert(verification.familyId === familyId, 'specialist-niagara-native verification scenario mismatch');
assert(verification.checks.includes('native graph stage instantiates'), 'specialist-niagara-native verification checks missing native graph stage');

console.log('PASS specialist-niagara-native');
console.log(JSON.stringify({
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
}, null, 2));
