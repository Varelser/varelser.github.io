export type FutureNativeSpecialistPacketFamilyId =
  | 'specialist-houdini-native'
  | 'specialist-niagara-native'
  | 'specialist-touchdesigner-native'
  | 'specialist-unity-vfx-native';

export interface FutureNativeSpecialistPacketSnapshot {
  familyId: FutureNativeSpecialistPacketFamilyId;
  title: string;
  currentStage: string;
  progressPercent: number;
  graphHint: string;
  outputHint: string;
  serializerBlockKey: string;
  stageLabels: string[];
  outputBridges: string[];
  adapterMappingCount: number;
  runtimeConfigValues: string[];
  nextTargets: string[];
}

export interface FutureNativeSpecialistRouteSnapshot {
  familyId: FutureNativeSpecialistPacketFamilyId;
  title: string;
  currentStage: string;
  progressPercent: number;
  routeId: string;
  routeLabel: string;
  executionTarget: string;
  selectedAdapterId: string;
  selectedAdapterLabel: string;
  graphHint: string;
  outputHint: string;
  serializerBlockKey: string;
  stageLabels: string[];
  outputBridges: string[];
  routingValues: string[];
  adapterHandshakeValues: string[];
  adapterBridgeSchemaValues: string[];
  adapterSelectionValues: string[];
  adapterTargetSwitchValues: string[];
  routeTargetDeltaValues: string[];
  adapterCapabilityDiffValues: string[];
  adapterOverrideCandidates: string[];
  adapterOverrideStateValues: string[];
  fallbackReasonValues: string[];
  overrideChangeHistoryValues: string[];
  adapterFallbackHistoryValues: string[];
  capabilityTrendDeltaValues: string[];
  nextTargets: string[];
}
