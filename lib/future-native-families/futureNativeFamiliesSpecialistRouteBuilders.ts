import type { ProjectFutureNativeSpecialistRouteControlEntry } from '../../types';
import type {
  FutureNativeSpecialistRouteMetadata,
  FutureNativeSpecialistRouteOption,
} from './futureNativeFamiliesSpecialistRouteMetadata';

export interface ResolvedFutureNativeSpecialistRouteControl {
  executionTarget: string;
  defaultOption: FutureNativeSpecialistRouteOption;
  selectedAdapterId: string;
  selectedAdapterLabel: string;
  selectedOption: FutureNativeSpecialistRouteOption;
  overrideMode: ProjectFutureNativeSpecialistRouteControlEntry['overrideMode'];
  overrideCandidateId: string;
  overrideDisposition: ProjectFutureNativeSpecialistRouteControlEntry['overrideDisposition'];
  adapterOverrideCandidates: string[];
  adapterTargets: string[];
}

export function buildRouteTargetDeltaValues(executionTarget: string, outputBridges: string[], graphHint: string) {
  const targetFamily = executionTarget.replace(/^hybrid:/u, '');
  return [
    `targetFamily:${targetFamily}`,
    `bridgeSpan:${outputBridges.join('|')}`,
    `graphToTarget:${graphHint}->${targetFamily}`,
    `bridgeCountDelta:${Math.max(0, outputBridges.length - 1)}`,
  ];
}

export function buildAdapterBridgeSchemaValues(
  familyId: string,
  executionTarget: string,
  graphHint: string,
  serializerBlockKey: string,
  stageLabels: string[],
  outputBridges: string[],
) {
  return [
    `schemaId:${familyId}-bridge-v1`,
    `ingress:${graphHint}`,
    `egress:${executionTarget.replace(/^hybrid:/u, '')}`,
    `stageLayout:${stageLabels.join('|')}`,
    `bridgeKinds:${outputBridges.join('|')}`,
    `serializer:${serializerBlockKey}`,
  ];
}

export function buildAdapterSelectionValues(
  selectedAdapterId: string,
  executionTarget: string,
  adapterOverrideCandidates: string[],
  overrideMode: ProjectFutureNativeSpecialistRouteControlEntry['overrideMode'],
) {
  return [
    `selection:${overrideMode}`,
    `selectedAdapter:${selectedAdapterId}`,
    `executionTarget:${executionTarget}`,
    `fallbackAdapter:${adapterOverrideCandidates[1] ?? adapterOverrideCandidates[0] ?? 'none'}`,
    `selectionPool:${adapterOverrideCandidates.join('|')}`,
  ];
}

export function buildAdapterOverrideStateValues(
  selectedAdapterId: string,
  adapterOverrideCandidates: string[],
  overrideMode: ProjectFutureNativeSpecialistRouteControlEntry['overrideMode'],
  selectedExecutionTarget: string,
  overrideCandidateId: string,
  overrideDisposition: ProjectFutureNativeSpecialistRouteControlEntry['overrideDisposition'],
) {
  return [
    `overrideMode:${overrideMode}`,
    `defaultOverride:${selectedAdapterId}`,
    `selectedExecutionTarget:${selectedExecutionTarget}`,
    `activeOverrideCandidate:${overrideCandidateId}`,
    `overrideDisposition:${overrideDisposition}`,
    `editableOverrideTargets:${adapterOverrideCandidates.join('|')}`,
    `overrideCount:${adapterOverrideCandidates.length}`,
  ];
}

export function buildAdapterTargetSwitchValues(
  executionTarget: string,
  selectedAdapterId: string,
  adapterOverrideCandidates: string[],
  adapterTargets: string[],
  overrideMode: ProjectFutureNativeSpecialistRouteControlEntry['overrideMode'],
) {
  const pairs = adapterOverrideCandidates.map((candidate, index) => `${candidate.replace(/^override:/u, '')}->${adapterTargets[index] ?? executionTarget}`);
  return [
    `switchMode:${overrideMode === 'manual' ? 'manual-live' : 'live-ready'}`,
    `activeExecutionTarget:${executionTarget}`,
    `selectedAdapter:${selectedAdapterId}`,
    `switchTargets:${adapterTargets.join('|')}`,
    `adapterTargetPairs:${pairs.join('|')}`,
  ];
}

export function resolveRouteControl(
  route: FutureNativeSpecialistRouteMetadata,
  routeControl?: ProjectFutureNativeSpecialistRouteControlEntry,
): ResolvedFutureNativeSpecialistRouteControl {
  const defaultOption = route.adapterOptions[0];
  const overrideMode: ProjectFutureNativeSpecialistRouteControlEntry['overrideMode'] = routeControl?.overrideMode === 'manual' ? 'manual' : 'auto';
  const selectedOption = overrideMode === 'manual'
    ? route.adapterOptions.find((option) => option.id === routeControl?.selectedAdapterId) ?? defaultOption
    : defaultOption;
  const requestedExecutionTarget = overrideMode === 'manual' && routeControl?.selectedExecutionTarget
    ? routeControl.selectedExecutionTarget
    : defaultOption.executionTarget;
  const knownExecutionTarget = route.adapterOptions.some((option) => option.executionTarget === requestedExecutionTarget)
    ? requestedExecutionTarget
    : selectedOption.executionTarget;
  const defaultOverrideCandidate = selectedOption.overrideCandidate;
  const overrideCandidateId = route.adapterOptions.some((option) => option.overrideCandidate === routeControl?.overrideCandidateId)
    ? routeControl?.overrideCandidateId ?? defaultOverrideCandidate
    : defaultOverrideCandidate;
  const overrideDisposition: ProjectFutureNativeSpecialistRouteControlEntry['overrideDisposition'] = routeControl?.overrideDisposition === 'pinned'
    ? 'pinned'
    : 'advisory';
  return {
    executionTarget: knownExecutionTarget,
    defaultOption,
    selectedAdapterId: selectedOption.id,
    selectedAdapterLabel: selectedOption.label,
    selectedOption,
    overrideMode,
    overrideCandidateId,
    overrideDisposition,
    adapterOverrideCandidates: route.adapterOptions.map((option) => option.overrideCandidate),
    adapterTargets: route.adapterOptions.map((option) => option.executionTarget),
  };
}
