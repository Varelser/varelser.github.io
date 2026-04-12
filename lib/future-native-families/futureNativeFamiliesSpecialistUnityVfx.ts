import { UNITY_VFX_PRODUCT_PACK_BUNDLES } from '../productPackLibraryUnityVfx';

export type FutureNativeUnityVfxStageKind = 'spawn' | 'update' | 'output';
export type FutureNativeUnityVfxBridgeKind = 'native-particles' | 'native-surface' | 'hybrid-stack';

export interface FutureNativeUnityVfxGraphNode {
  id: string;
  label: string;
  stageKind: FutureNativeUnityVfxStageKind;
  bridgeKind: FutureNativeUnityVfxBridgeKind;
  solverFamilies: readonly string[];
  emphasis: readonly string[];
}

export interface FutureNativeUnityVfxGraphStage {
  id: string;
  label: string;
  kind: FutureNativeUnityVfxStageKind;
  nodes: readonly FutureNativeUnityVfxGraphNode[];
}

export interface FutureNativeUnityVfxAdapterMapping {
  specialistFamily: string;
  nativeStageId: string;
  nativeNodeId: string;
  bridgeKind: FutureNativeUnityVfxBridgeKind;
  solverFamilies: readonly string[];
}

export interface FutureNativeUnityVfxGraphPacket {
  familyId: 'specialist-unity-vfx-native';
  graphHint: 'graph-stage';
  stages: readonly FutureNativeUnityVfxGraphStage[];
  outputBridges: readonly FutureNativeUnityVfxBridgeKind[];
}

export interface FutureNativeSerializedSpecialistUnityVfxGraphStage {
  id: string;
  label: string;
  values: readonly string[];
}

function toNativeNodeId(bundleId: string, stageKind: FutureNativeUnityVfxStageKind): string {
  return `${bundleId.replace(/^product-pack-/u, '').replace(/-/gu, '_')}_${stageKind}`;
}

function toStageNode(
  bundle: (typeof UNITY_VFX_PRODUCT_PACK_BUNDLES)[number],
  stageKind: FutureNativeUnityVfxStageKind,
  bridgeKind: FutureNativeUnityVfxBridgeKind,
): FutureNativeUnityVfxGraphNode {
  return {
    id: toNativeNodeId(bundle.id, stageKind),
    label: `${bundle.label} ${stageKind}`,
    stageKind,
    bridgeKind,
    solverFamilies: bundle.solverFamilies,
    emphasis: [...bundle.emphasis, stageKind],
  };
}

export function buildFutureNativeUnityVfxGraphPacket(): FutureNativeUnityVfxGraphPacket {
  const seedBundle = UNITY_VFX_PRODUCT_PACK_BUNDLES[0];
  if (!seedBundle) {
    throw new Error('Missing Unity VFX product pack bundle.');
  }
  const stages: FutureNativeUnityVfxGraphStage[] = [
    {
      id: 'unity-vfx-native-spawn',
      label: 'Spawn stage',
      kind: 'spawn',
      nodes: [toStageNode(seedBundle, 'spawn', 'native-particles')],
    },
    {
      id: 'unity-vfx-native-update',
      label: 'Update stage',
      kind: 'update',
      nodes: [toStageNode(seedBundle, 'update', 'hybrid-stack')],
    },
    {
      id: 'unity-vfx-native-output',
      label: 'Output stage',
      kind: 'output',
      nodes: [toStageNode(seedBundle, 'output', 'native-surface')],
    },
  ];
  return {
    familyId: 'specialist-unity-vfx-native',
    graphHint: 'graph-stage',
    stages,
    outputBridges: ['native-particles', 'hybrid-stack', 'native-surface'],
  };
}

export function buildFutureNativeUnityVfxAdapterMappings(): FutureNativeUnityVfxAdapterMapping[] {
  const packet = buildFutureNativeUnityVfxGraphPacket();
  return packet.stages.flatMap((stage) =>
    stage.nodes.map((node) => ({
      specialistFamily: node.id.replace(/_(spawn|update|output)$/u, '').replace(/_/gu, '-'),
      nativeStageId: stage.id,
      nativeNodeId: node.id,
      bridgeKind: node.bridgeKind,
      solverFamilies: node.solverFamilies,
    })),
  );
}

export function serializeFutureNativeUnityVfxGraphPacket(): FutureNativeSerializedSpecialistUnityVfxGraphStage {
  const packet = buildFutureNativeUnityVfxGraphPacket();
  return {
    id: 'specialist-unity-vfx-native-graph',
    label: 'Specialist Unity VFX graph',
    values: [
      `family:${packet.familyId}`,
      `graphHint:${packet.graphHint}`,
      `stageCount:${packet.stages.length}`,
      `nodeCount:${packet.stages.reduce((sum, stage) => sum + stage.nodes.length, 0)}`,
      `outputBridges:${packet.outputBridges.join('|')}`,
    ],
  };
}
