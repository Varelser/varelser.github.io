import { HOUDINI_PRODUCT_PACK_BUNDLES } from '../productPackLibraryHoudini';

export type FutureNativeHoudiniStageKind = 'emit' | 'solve' | 'output';
export type FutureNativeHoudiniBridgeKind = 'native-volume' | 'native-surface' | 'native-particles' | 'hybrid-stack';

export interface FutureNativeHoudiniGraphNode {
  id: string;
  label: string;
  stageKind: FutureNativeHoudiniStageKind;
  bridgeKind: FutureNativeHoudiniBridgeKind;
  solverFamilies: readonly string[];
  emphasis: readonly string[];
}

export interface FutureNativeHoudiniGraphStage {
  id: string;
  label: string;
  kind: FutureNativeHoudiniStageKind;
  nodes: readonly FutureNativeHoudiniGraphNode[];
}

export interface FutureNativeHoudiniAdapterMapping {
  specialistFamily: string;
  nativeStageId: string;
  nativeNodeId: string;
  bridgeKind: FutureNativeHoudiniBridgeKind;
  solverFamilies: readonly string[];
}

export interface FutureNativeHoudiniGraphPacket {
  familyId: 'specialist-houdini-native';
  graphHint: 'node-chain';
  stages: readonly FutureNativeHoudiniGraphStage[];
  outputBridges: readonly FutureNativeHoudiniBridgeKind[];
}

export interface FutureNativeSerializedSpecialistGraphStage {
  id: string;
  label: string;
  values: readonly string[];
}

function getStageKind(bundleId: string): FutureNativeHoudiniStageKind {
  if (bundleId.includes('shell-metaball-volume')) return 'output';
  if (bundleId.includes('slurry-stack') || bundleId.includes('destruction-fracture-debris')) return 'solve';
  return 'emit';
}

function getBridgeKind(bundleId: string): FutureNativeHoudiniBridgeKind {
  if (bundleId.includes('pyro') || bundleId.includes('shell-metaball-volume')) return 'native-volume';
  if (bundleId.includes('slurry-stack')) return 'native-particles';
  return 'native-surface';
}

function toNativeNodeId(bundleId: string): string {
  return bundleId.replace(/^product-pack-/u, '').replace(/-/gu, '_');
}

function toNativeNode(bundle: (typeof HOUDINI_PRODUCT_PACK_BUNDLES)[number]): FutureNativeHoudiniGraphNode {
  return {
    id: toNativeNodeId(bundle.id),
    label: bundle.label,
    stageKind: getStageKind(bundle.id),
    bridgeKind: getBridgeKind(bundle.id),
    solverFamilies: bundle.solverFamilies,
    emphasis: bundle.emphasis,
  };
}

export function buildFutureNativeHoudiniGraphPacket(): FutureNativeHoudiniGraphPacket {
  const nodes = HOUDINI_PRODUCT_PACK_BUNDLES.map((bundle) => toNativeNode(bundle));
  const stages: FutureNativeHoudiniGraphStage[] = [
    { id: 'houdini-native-emit', label: 'Emit stage', kind: 'emit', nodes: nodes.filter((node) => node.stageKind === 'emit') },
    { id: 'houdini-native-solve', label: 'Solve stage', kind: 'solve', nodes: nodes.filter((node) => node.stageKind === 'solve') },
    { id: 'houdini-native-output', label: 'Output stage', kind: 'output', nodes: nodes.filter((node) => node.stageKind === 'output') },
  ];
  const outputBridges = [...new Set(stages.flatMap((stage) => stage.nodes.map((node) => node.bridgeKind)))] as FutureNativeHoudiniBridgeKind[];
  return {
    familyId: 'specialist-houdini-native',
    graphHint: 'node-chain',
    stages,
    outputBridges,
  };
}

export function buildFutureNativeHoudiniAdapterMappings(): FutureNativeHoudiniAdapterMapping[] {
  const packet = buildFutureNativeHoudiniGraphPacket();
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

export function serializeFutureNativeHoudiniGraphPacket(): FutureNativeSerializedSpecialistGraphStage {
  const packet = buildFutureNativeHoudiniGraphPacket();
  return {
    id: 'specialist-houdini-native-graph',
    label: 'Specialist Houdini graph',
    values: [
      `family:${packet.familyId}`,
      `graphHint:${packet.graphHint}`,
      `stageCount:${packet.stages.length}`,
      `nodeCount:${packet.stages.reduce((sum, stage) => sum + stage.nodes.length, 0)}`,
      `outputBridges:${packet.outputBridges.join('|')}`,
    ],
  };
}
