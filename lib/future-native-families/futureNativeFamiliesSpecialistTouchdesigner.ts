import { TOUCHDESIGNER_PRODUCT_PACK_BUNDLES } from '../productPackLibraryTouchDesigner';

export type FutureNativeTouchdesignerStageKind = 'input' | 'process' | 'output';
export type FutureNativeTouchdesignerBridgeKind =
  | 'native-image-field'
  | 'native-particles'
  | 'native-surface'
  | 'hybrid-stack';

export interface FutureNativeTouchdesignerGraphNode {
  id: string;
  label: string;
  stageKind: FutureNativeTouchdesignerStageKind;
  bridgeKind: FutureNativeTouchdesignerBridgeKind;
  solverFamilies: readonly string[];
  emphasis: readonly string[];
}

export interface FutureNativeTouchdesignerGraphStage {
  id: string;
  label: string;
  kind: FutureNativeTouchdesignerStageKind;
  nodes: readonly FutureNativeTouchdesignerGraphNode[];
}

export interface FutureNativeTouchdesignerAdapterMapping {
  specialistFamily: string;
  nativeStageId: string;
  nativeNodeId: string;
  bridgeKind: FutureNativeTouchdesignerBridgeKind;
  solverFamilies: readonly string[];
}

export interface FutureNativeTouchdesignerGraphPacket {
  familyId: 'specialist-touchdesigner-native';
  graphHint: 'operator-pipe';
  stages: readonly FutureNativeTouchdesignerGraphStage[];
  outputBridges: readonly FutureNativeTouchdesignerBridgeKind[];
}

export interface FutureNativeSerializedSpecialistTouchdesignerGraphStage {
  id: string;
  label: string;
  values: readonly string[];
}

function getStageKind(bundleId: string): FutureNativeTouchdesignerStageKind {
  if (bundleId.includes('top-cop-signal-field')) return 'input';
  if (bundleId.includes('pop-force-cloud')) return 'output';
  return 'process';
}

function getBridgeKind(bundleId: string): FutureNativeTouchdesignerBridgeKind {
  if (bundleId.includes('top-cop-signal-field')) return 'native-image-field';
  if (bundleId.includes('pop-force-cloud')) return 'native-particles';
  if (bundleId.includes('curve-relief-feedback')) return 'native-surface';
  return 'hybrid-stack';
}

function toNativeNodeId(bundleId: string): string {
  return bundleId.replace(/^product-pack-/u, '').replace(/-/gu, '_');
}

function toNativeNode(bundle: (typeof TOUCHDESIGNER_PRODUCT_PACK_BUNDLES)[number]): FutureNativeTouchdesignerGraphNode {
  return {
    id: toNativeNodeId(bundle.id),
    label: bundle.label,
    stageKind: getStageKind(bundle.id),
    bridgeKind: getBridgeKind(bundle.id),
    solverFamilies: bundle.solverFamilies,
    emphasis: bundle.emphasis,
  };
}

export function buildFutureNativeTouchdesignerGraphPacket(): FutureNativeTouchdesignerGraphPacket {
  const nodes = TOUCHDESIGNER_PRODUCT_PACK_BUNDLES.map((bundle) => toNativeNode(bundle));
  const stages: FutureNativeTouchdesignerGraphStage[] = [
    {
      id: 'touchdesigner-native-input',
      label: 'Input stage',
      kind: 'input',
      nodes: nodes.filter((node) => node.stageKind === 'input'),
    },
    {
      id: 'touchdesigner-native-process',
      label: 'Process stage',
      kind: 'process',
      nodes: nodes.filter((node) => node.stageKind === 'process'),
    },
    {
      id: 'touchdesigner-native-output',
      label: 'Output stage',
      kind: 'output',
      nodes: nodes.filter((node) => node.stageKind === 'output'),
    },
  ];
  const outputBridges = [
    ...new Set(stages.flatMap((stage) => stage.nodes.map((node) => node.bridgeKind))),
  ] as FutureNativeTouchdesignerBridgeKind[];
  return {
    familyId: 'specialist-touchdesigner-native',
    graphHint: 'operator-pipe',
    stages,
    outputBridges,
  };
}

export function buildFutureNativeTouchdesignerAdapterMappings(): FutureNativeTouchdesignerAdapterMapping[] {
  const packet = buildFutureNativeTouchdesignerGraphPacket();
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

export function serializeFutureNativeTouchdesignerGraphPacket(): FutureNativeSerializedSpecialistTouchdesignerGraphStage {
  const packet = buildFutureNativeTouchdesignerGraphPacket();
  return {
    id: 'specialist-touchdesigner-native-graph',
    label: 'Specialist TouchDesigner graph',
    values: [
      `family:${packet.familyId}`,
      `graphHint:${packet.graphHint}`,
      `stageCount:${packet.stages.length}`,
      `nodeCount:${packet.stages.reduce((sum, stage) => sum + stage.nodes.length, 0)}`,
      `outputBridges:${packet.outputBridges.join('|')}`,
    ],
  };
}
