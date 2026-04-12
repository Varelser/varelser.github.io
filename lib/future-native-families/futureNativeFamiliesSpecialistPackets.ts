import { getFutureNativeFamilyProgress } from './futureNativeFamiliesProgress';
import { mergeFutureNativeFamilySerializedBlock } from './futureNativeFamiliesSerialization';
import { getFutureNativeSpecialistRuntimeStub } from './futureNativeFamiliesSpecialist';
import {
  buildFutureNativeHoudiniAdapterMappings,
  buildFutureNativeHoudiniGraphPacket,
} from './futureNativeFamiliesSpecialistHoudini';
import {
  buildFutureNativeNiagaraAdapterMappings,
  buildFutureNativeNiagaraGraphPacket,
} from './futureNativeFamiliesSpecialistNiagara';
import {
  buildFutureNativeTouchdesignerAdapterMappings,
  buildFutureNativeTouchdesignerGraphPacket,
} from './futureNativeFamiliesSpecialistTouchdesigner';
import {
  buildFutureNativeUnityVfxAdapterMappings,
  buildFutureNativeUnityVfxGraphPacket,
} from './futureNativeFamiliesSpecialistUnityVfx';
import type { FutureNativeFamilyId } from './futureNativeFamiliesTypes';
import type { ProjectFutureNativeSpecialistRouteControlEntry } from '../../types';
import {
  buildRouteMetadata,
  type FutureNativeSpecialistRouteMetadata,
} from './futureNativeFamiliesSpecialistRouteMetadata';
import type {
  FutureNativeSpecialistPacketFamilyId,
  FutureNativeSpecialistPacketSnapshot,
  FutureNativeSpecialistRouteSnapshot,
} from './futureNativeFamiliesSpecialistPacketTypes';
import {
  buildAdapterCapabilityDiffValues,
  buildAdapterFallbackHistoryValues,
  buildCapabilityTrendDeltaValues,
  buildFallbackReasonValues,
  buildOverrideChangeHistoryValues,
} from './futureNativeFamiliesSpecialistRouteAnalysis';
import {
  buildAdapterBridgeSchemaValues,
  buildAdapterOverrideStateValues,
  buildAdapterSelectionValues,
  buildAdapterTargetSwitchValues,
  buildRouteTargetDeltaValues,
  resolveRouteControl,
} from './futureNativeFamiliesSpecialistRouteBuilders';

export type {
  FutureNativeSpecialistPacketFamilyId,
  FutureNativeSpecialistPacketSnapshot,
  FutureNativeSpecialistRouteSnapshot,
} from './futureNativeFamiliesSpecialistPacketTypes';

export function buildProjectFutureNativeSpecialistPacketEntries() {
  return buildAllFutureNativeSpecialistPacketSnapshots().map((packet) => ({
    familyId: packet.familyId,
    title: packet.title,
    currentStage: packet.currentStage,
    progressPercent: packet.progressPercent,
    graphHint: packet.graphHint,
    outputHint: packet.outputHint,
    serializerBlockKey: packet.serializerBlockKey,
    stageLabels: [...packet.stageLabels],
    outputBridges: [...packet.outputBridges],
    adapterMappingCount: packet.adapterMappingCount,
    runtimeConfigValues: [...packet.runtimeConfigValues],
    nextTargets: [...packet.nextTargets],
  }));
}

export function buildProjectFutureNativeSpecialistRouteEntries(
  routeControls: ProjectFutureNativeSpecialistRouteControlEntry[] = buildEmptyProjectFutureNativeSpecialistRouteControls(),
) {
  return buildAllFutureNativeSpecialistRouteSnapshots(routeControls).map((route) => ({
    familyId: route.familyId,
    title: route.title,
    currentStage: route.currentStage,
    progressPercent: route.progressPercent,
    routeId: route.routeId,
    routeLabel: route.routeLabel,
    executionTarget: route.executionTarget,
    selectedAdapterId: route.selectedAdapterId,
    selectedAdapterLabel: route.selectedAdapterLabel,
    graphHint: route.graphHint,
    outputHint: route.outputHint,
    serializerBlockKey: route.serializerBlockKey,
    stageLabels: [...route.stageLabels],
    outputBridges: [...route.outputBridges],
    routingValues: [...route.routingValues],
    adapterHandshakeValues: [...route.adapterHandshakeValues],
    adapterBridgeSchemaValues: [...route.adapterBridgeSchemaValues],
    adapterSelectionValues: [...route.adapterSelectionValues],
    adapterTargetSwitchValues: [...route.adapterTargetSwitchValues],
    routeTargetDeltaValues: [...route.routeTargetDeltaValues],
    adapterCapabilityDiffValues: [...route.adapterCapabilityDiffValues],
    adapterOverrideCandidates: [...route.adapterOverrideCandidates],
    adapterOverrideStateValues: [...route.adapterOverrideStateValues],
    fallbackReasonValues: [...route.fallbackReasonValues],
    overrideChangeHistoryValues: [...route.overrideChangeHistoryValues],
    adapterFallbackHistoryValues: [...route.adapterFallbackHistoryValues],
    capabilityTrendDeltaValues: [...route.capabilityTrendDeltaValues],
    nextTargets: [...route.nextTargets],
  }));
}

export function buildEmptyProjectFutureNativeSpecialistRouteControls(): ProjectFutureNativeSpecialistRouteControlEntry[] {
  return SPECIALIST_PACKET_FAMILY_IDS.map((familyId) => {
    const selected = buildRouteMetadata(familyId).adapterOptions[0];
    return {
      familyId,
      selectedAdapterId: selected.id,
      selectedExecutionTarget: selected.executionTarget,
      overrideMode: 'auto',
      overrideCandidateId: selected.overrideCandidate,
      overrideDisposition: 'advisory',
    };
  });
}

const SPECIALIST_PACKET_FAMILY_IDS: readonly FutureNativeSpecialistPacketFamilyId[] = [
  'specialist-houdini-native',
  'specialist-niagara-native',
  'specialist-touchdesigner-native',
  'specialist-unity-vfx-native',
];

function buildGraphPacket(
  familyId: FutureNativeSpecialistPacketFamilyId,
): {
  title: string;
  stageLabels: string[];
  outputBridges: string[];
  adapterMappingCount: number;
  runtimeConfigValues: string[];
} {
  switch (familyId) {
    case 'specialist-houdini-native': {
      const packet = buildFutureNativeHoudiniGraphPacket();
      const mappings = buildFutureNativeHoudiniAdapterMappings();
      return {
        title: 'Houdini-like Native Bundle',
        stageLabels: packet.stages.map((stage) => `${stage.kind}:${stage.nodes.length}`),
        outputBridges: [...packet.outputBridges],
        adapterMappingCount: mappings.length,
        runtimeConfigValues: [
          `graphHint:${packet.graphHint}`,
          `stageCount:${packet.stages.length}`,
          `outputBridges:${packet.outputBridges.join('|')}`,
          `adapterMappings:${mappings.length}`,
        ],
      };
    }
    case 'specialist-niagara-native': {
      const packet = buildFutureNativeNiagaraGraphPacket();
      const mappings = buildFutureNativeNiagaraAdapterMappings();
      return {
        title: 'Niagara-like Native Bundle',
        stageLabels: packet.stages.map((stage) => `${stage.kind}:${stage.nodes.length}`),
        outputBridges: [...packet.outputBridges],
        adapterMappingCount: mappings.length,
        runtimeConfigValues: [
          `graphHint:${packet.graphHint}`,
          `stageCount:${packet.stages.length}`,
          `outputBridges:${packet.outputBridges.join('|')}`,
          `adapterMappings:${mappings.length}`,
        ],
      };
    }
    case 'specialist-touchdesigner-native': {
      const packet = buildFutureNativeTouchdesignerGraphPacket();
      const mappings = buildFutureNativeTouchdesignerAdapterMappings();
      return {
        title: 'TouchDesigner-like Native Bundle',
        stageLabels: packet.stages.map((stage) => `${stage.kind}:${stage.nodes.length}`),
        outputBridges: [...packet.outputBridges],
        adapterMappingCount: mappings.length,
        runtimeConfigValues: [
          `graphHint:${packet.graphHint}`,
          `stageCount:${packet.stages.length}`,
          `outputBridges:${packet.outputBridges.join('|')}`,
          `adapterMappings:${mappings.length}`,
        ],
      };
    }
    case 'specialist-unity-vfx-native': {
      const packet = buildFutureNativeUnityVfxGraphPacket();
      const mappings = buildFutureNativeUnityVfxAdapterMappings();
      return {
        title: 'Unity VFX-like Native Bundle',
        stageLabels: packet.stages.map((stage) => `${stage.kind}:${stage.nodes.length}`),
        outputBridges: [...packet.outputBridges],
        adapterMappingCount: mappings.length,
        runtimeConfigValues: [
          `graphHint:${packet.graphHint}`,
          `stageCount:${packet.stages.length}`,
          `outputBridges:${packet.outputBridges.join('|')}`,
          `adapterMappings:${mappings.length}`,
        ],
      };
    }
  }
}

export function buildFutureNativeSpecialistPacketSnapshot(
  familyId: FutureNativeSpecialistPacketFamilyId,
): FutureNativeSpecialistPacketSnapshot {
  const progress = getFutureNativeFamilyProgress(familyId);
  const stub = getFutureNativeSpecialistRuntimeStub(familyId as FutureNativeFamilyId);
  const serialized = mergeFutureNativeFamilySerializedBlock(familyId);
  const graphPacket = buildGraphPacket(familyId);
  return {
    familyId,
    title: graphPacket.title,
    currentStage: progress.currentStage,
    progressPercent: progress.progressPercent,
    graphHint: stub.graphHint,
    outputHint: stub.outputHint,
    serializerBlockKey: serialized.serializerBlockKey,
    stageLabels: graphPacket.stageLabels,
    outputBridges: graphPacket.outputBridges,
    adapterMappingCount: graphPacket.adapterMappingCount,
    runtimeConfigValues: graphPacket.runtimeConfigValues,
    nextTargets: [...progress.nextTargets],
  };
}

export function buildAllFutureNativeSpecialistPacketSnapshots(): FutureNativeSpecialistPacketSnapshot[] {
  return SPECIALIST_PACKET_FAMILY_IDS.map((familyId) => buildFutureNativeSpecialistPacketSnapshot(familyId));
}

export function buildFutureNativeSpecialistRouteSnapshot(
  familyId: FutureNativeSpecialistPacketFamilyId,
  routeControl?: ProjectFutureNativeSpecialistRouteControlEntry,
): FutureNativeSpecialistRouteSnapshot {
  const packet = buildFutureNativeSpecialistPacketSnapshot(familyId);
  const route = buildRouteMetadata(familyId);
  const resolved = resolveRouteControl(route, routeControl);
  return {
    familyId,
    title: packet.title,
    currentStage: packet.currentStage,
    progressPercent: packet.progressPercent,
    routeId: route.routeId,
    routeLabel: route.routeLabel,
    executionTarget: resolved.executionTarget,
    selectedAdapterId: resolved.selectedAdapterId,
    selectedAdapterLabel: resolved.selectedAdapterLabel,
    graphHint: packet.graphHint,
    outputHint: packet.outputHint,
    serializerBlockKey: packet.serializerBlockKey,
    stageLabels: [...packet.stageLabels],
    outputBridges: [...packet.outputBridges],
    routingValues: [
      `route:${route.routeId}`,
      `stage:${packet.currentStage}`,
      `graphHint:${packet.graphHint}`,
      `executionTarget:${resolved.executionTarget}`,
      `selectedAdapter:${resolved.selectedAdapterId}`,
      `overrideMode:${resolved.overrideMode}`,
      `serializer:${packet.serializerBlockKey}`,
      `outputBridges:${packet.outputBridges.join('|')}`,
      `next:${packet.nextTargets[0] ?? 'n/a'}`,
    ],
    adapterHandshakeValues: [
      ...route.handshakeValues,
      `executionTarget:${resolved.executionTarget}`,
      `serializer:${packet.serializerBlockKey}`,
      `bridges:${packet.outputBridges.join('|')}`,
    ],
    adapterBridgeSchemaValues: buildAdapterBridgeSchemaValues(familyId, resolved.executionTarget, packet.graphHint, packet.serializerBlockKey, packet.stageLabels, packet.outputBridges),
    adapterSelectionValues: buildAdapterSelectionValues(
      resolved.selectedAdapterId,
      resolved.executionTarget,
      resolved.adapterOverrideCandidates,
      resolved.overrideMode,
    ),
    adapterTargetSwitchValues: buildAdapterTargetSwitchValues(
      resolved.executionTarget,
      resolved.selectedAdapterId,
      resolved.adapterOverrideCandidates,
      resolved.adapterTargets,
      resolved.overrideMode,
    ),
    routeTargetDeltaValues: buildRouteTargetDeltaValues(resolved.executionTarget, packet.outputBridges, packet.graphHint),
    adapterCapabilityDiffValues: buildAdapterCapabilityDiffValues(resolved.defaultOption, resolved.selectedOption),
    adapterOverrideCandidates: [...resolved.adapterOverrideCandidates],
    adapterOverrideStateValues: buildAdapterOverrideStateValues(
      resolved.selectedAdapterId,
      resolved.adapterOverrideCandidates,
      resolved.overrideMode,
      resolved.executionTarget,
      resolved.overrideCandidateId,
      resolved.overrideDisposition,
    ),
    fallbackReasonValues: buildFallbackReasonValues(
      resolved.defaultOption,
      resolved.selectedOption,
      resolved.overrideMode,
      resolved.overrideDisposition,
    ),
    overrideChangeHistoryValues: buildOverrideChangeHistoryValues(
      resolved.defaultOption,
      resolved.selectedOption,
      resolved.executionTarget,
      resolved.overrideMode,
      resolved.overrideCandidateId,
      resolved.overrideDisposition,
    ),
    adapterFallbackHistoryValues: buildAdapterFallbackHistoryValues(
      resolved.defaultOption,
      resolved.selectedOption,
      resolved.executionTarget,
      resolved.overrideMode,
    ),
    capabilityTrendDeltaValues: buildCapabilityTrendDeltaValues(
      resolved.defaultOption,
      resolved.selectedOption,
    ),
    nextTargets: [...packet.nextTargets],
  };
}

export function buildAllFutureNativeSpecialistRouteSnapshots(
  routeControls: ProjectFutureNativeSpecialistRouteControlEntry[] = buildEmptyProjectFutureNativeSpecialistRouteControls(),
): FutureNativeSpecialistRouteSnapshot[] {
  return SPECIALIST_PACKET_FAMILY_IDS.map((familyId) => buildFutureNativeSpecialistRouteSnapshot(familyId, routeControls.find((entry) => entry.familyId === familyId)));
}
