import { NIAGARA_PRODUCT_PACK_BUNDLES } from '../productPackLibraryNiagara';

export type FutureNativeNiagaraStageKind = 'emit' | 'update' | 'output';
export type FutureNativeNiagaraBridgeKind = 'native-particles' | 'native-structure' | 'hybrid-stack';

export interface FutureNativeNiagaraGraphNode {
  id: string;
  label: string;
  stageKind: FutureNativeNiagaraStageKind;
  bridgeKind: FutureNativeNiagaraBridgeKind;
  solverFamilies: readonly string[];
  emphasis: readonly string[];
}

export interface FutureNativeNiagaraGraphStage {
  id: string;
  label: string;
  kind: FutureNativeNiagaraStageKind;
  nodes: readonly FutureNativeNiagaraGraphNode[];
}

export interface FutureNativeNiagaraAdapterMapping {
  specialistFamily: string;
  nativeStageId: string;
  nativeNodeId: string;
  bridgeKind: FutureNativeNiagaraBridgeKind;
  solverFamilies: readonly string[];
}

export interface FutureNativeNiagaraGraphPacket {
  familyId: 'specialist-niagara-native';
  graphHint: 'emitter-stack';
  stages: readonly FutureNativeNiagaraGraphStage[];
  outputBridges: readonly FutureNativeNiagaraBridgeKind[];
}

export interface FutureNativeSerializedSpecialistNiagaraGraphStage {
  id: string;
  label: string;
  values: readonly string[];
}

function getStageKind(bundleId: string): FutureNativeNiagaraStageKind {
  if (bundleId.includes('chaos-magnetic-tubes')) return 'output';
  if (bundleId.includes('collision-burst-field')) return 'update';
  return 'emit';
}

function getBridgeKind(bundleId: string): FutureNativeNiagaraBridgeKind {
  if (bundleId.includes('collision-burst-field')) return 'native-structure';
  if (bundleId.includes('chaos-magnetic-tubes')) return 'hybrid-stack';
  return 'native-particles';
}

function toNativeNodeId(bundleId: string): string {
  return bundleId.replace(/^product-pack-/u, '').replace(/-/gu, '_');
}

function toNativeNode(bundle: (typeof NIAGARA_PRODUCT_PACK_BUNDLES)[number]): FutureNativeNiagaraGraphNode {
  return {
    id: toNativeNodeId(bundle.id),
    label: bundle.label,
    stageKind: getStageKind(bundle.id),
    bridgeKind: getBridgeKind(bundle.id),
    solverFamilies: bundle.solverFamilies,
    emphasis: bundle.emphasis,
  };
}

export function buildFutureNativeNiagaraGraphPacket(): FutureNativeNiagaraGraphPacket {
  const nodes = NIAGARA_PRODUCT_PACK_BUNDLES.map((bundle) => toNativeNode(bundle));
  const stages: FutureNativeNiagaraGraphStage[] = [
    { id: 'niagara-native-emit', label: 'Emit stage', kind: 'emit', nodes: nodes.filter((node) => node.stageKind === 'emit') },
    { id: 'niagara-native-update', label: 'Update stage', kind: 'update', nodes: nodes.filter((node) => node.stageKind === 'update') },
    { id: 'niagara-native-output', label: 'Output stage', kind: 'output', nodes: nodes.filter((node) => node.stageKind === 'output') },
  ];
  const outputBridges = [...new Set(stages.flatMap((stage) => stage.nodes.map((node) => node.bridgeKind)))] as FutureNativeNiagaraBridgeKind[];
  return {
    familyId: 'specialist-niagara-native',
    graphHint: 'emitter-stack',
    stages,
    outputBridges,
  };
}

export function buildFutureNativeNiagaraAdapterMappings(): FutureNativeNiagaraAdapterMapping[] {
  const packet = buildFutureNativeNiagaraGraphPacket();
  return packet.stages.flatMap((stage) =>
    stage.nodes.map((node) => ({
      specialistFamily: node.id.replace(/_/gu, '-'),
      nativeStageId: stage.id,
      nativeNodeId: node.id,
      bridgeKind: node.bridgeKind,
      solverFamilies: node.solverFamilies,
    })),
  );
}

export function serializeFutureNativeNiagaraGraphPacket(): FutureNativeSerializedSpecialistNiagaraGraphStage {
  const packet = buildFutureNativeNiagaraGraphPacket();
  return {
    id: 'specialist-niagara-native-graph',
    label: 'Specialist Niagara graph',
    values: [
      `family:${packet.familyId}`,
      `graphHint:${packet.graphHint}`,
      `stageCount:${packet.stages.length}`,
      `nodeCount:${packet.stages.reduce((sum, stage) => sum + stage.nodes.length, 0)}`,
      `outputBridges:${packet.outputBridges.join('|')}`,
    ],
  };
}
