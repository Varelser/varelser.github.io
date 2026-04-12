import type { ProjectFutureNativeSpecialistRouteControlEntry } from '../../types';
import type { FutureNativeSpecialistRouteMetadata } from './futureNativeFamiliesSpecialistRouteMetadata';

type RouteOption = FutureNativeSpecialistRouteMetadata['adapterOptions'][number];

function joinCapabilities(values: string[]) {
  return values.join('|') || 'none';
}

export function buildAdapterCapabilityDiffValues(
  defaultOption: RouteOption,
  selectedOption: RouteOption,
) {
  const added = selectedOption.capabilityTags.filter((tag) => !defaultOption.capabilityTags.includes(tag));
  const removed = defaultOption.capabilityTags.filter((tag) => !selectedOption.capabilityTags.includes(tag));
  return [
    `defaultCapabilities:${defaultOption.capabilityTags.join('|')}`,
    `selectedCapabilities:${selectedOption.capabilityTags.join('|')}`,
    `addedCapabilities:${added.join('|') || 'none'}`,
    `removedCapabilities:${removed.join('|') || 'none'}`,
    `selectionDiff:${selectedOption.id === defaultOption.id ? 'default-route' : 'manual-delta'}`,
  ];
}

export function buildFallbackReasonValues(
  defaultOption: RouteOption,
  selectedOption: RouteOption,
  overrideMode: ProjectFutureNativeSpecialistRouteControlEntry['overrideMode'],
  overrideDisposition: ProjectFutureNativeSpecialistRouteControlEntry['overrideDisposition'],
) {
  return [
    `defaultAdapter:${defaultOption.id}`,
    `selectedAdapter:${selectedOption.id}`,
    `fallbackActive:${selectedOption.id === defaultOption.id ? 'false' : 'true'}`,
    `selectionMode:${overrideMode}`,
    `overrideDisposition:${overrideDisposition}`,
    `defaultReason:${defaultOption.fallbackReason}`,
    `selectedReason:${selectedOption.fallbackReason}`,
  ];
}


export function buildOverrideChangeHistoryValues(
  defaultOption: RouteOption,
  selectedOption: RouteOption,
  executionTarget: string,
  overrideMode: ProjectFutureNativeSpecialistRouteControlEntry['overrideMode'],
  overrideCandidateId: string,
  overrideDisposition: ProjectFutureNativeSpecialistRouteControlEntry['overrideDisposition'],
) {
  const changeLines = [
    overrideMode === 'manual' ? 'mode:auto->manual' : 'mode:none',
    selectedOption.id !== defaultOption.id ? `adapter:${defaultOption.id}->${selectedOption.id}` : 'adapter:none',
    executionTarget !== defaultOption.executionTarget ? `target:${defaultOption.executionTarget}->${executionTarget}` : 'target:none',
    overrideCandidateId !== defaultOption.overrideCandidate ? `overrideCandidate:${defaultOption.overrideCandidate}->${overrideCandidateId}` : 'overrideCandidate:none',
    overrideDisposition !== 'advisory' ? `overrideDisposition:advisory->${overrideDisposition}` : 'overrideDisposition:none',
  ];
  const changeCount = changeLines.filter((line) => !line.endsWith(':none')).length;
  return [
    `baselineAdapter:${defaultOption.id}`,
    `baselineTarget:${defaultOption.executionTarget}`,
    `baselineOverrideCandidate:${defaultOption.overrideCandidate}`,
    `requestedMode:${overrideMode}`,
    ...changeLines,
    `changeCount:${changeCount}`,
    `historyState:${changeCount > 0 ? 'override-updated' : 'baseline-stable'}`,
  ];
}

export function buildAdapterFallbackHistoryValues(
  defaultOption: RouteOption,
  selectedOption: RouteOption,
  executionTarget: string,
  overrideMode: ProjectFutureNativeSpecialistRouteControlEntry['overrideMode'],
) {
  const fallbackActive = selectedOption.id !== defaultOption.id;
  return [
    `defaultAdapter:${defaultOption.id}`,
    `defaultTarget:${defaultOption.executionTarget}`,
    `activeAdapter:${selectedOption.id}`,
    `activeTarget:${executionTarget}`,
    `fallbackTransition:${fallbackActive ? `${defaultOption.id}->${selectedOption.id}` : 'none'}`,
    `fallbackReasonChanged:${selectedOption.fallbackReason === defaultOption.fallbackReason ? 'false' : 'true'}`,
    `fallbackMode:${fallbackActive ? `${overrideMode}-fallback` : 'baseline-route'}`,
    `historyDepth:${fallbackActive ? '2' : '1'}`,
  ];
}

export function buildCapabilityTrendDeltaValues(
  defaultOption: RouteOption,
  selectedOption: RouteOption,
) {
  const added = selectedOption.capabilityTags.filter((tag) => !defaultOption.capabilityTags.includes(tag));
  const removed = defaultOption.capabilityTags.filter((tag) => !selectedOption.capabilityTags.includes(tag));
  return [
    `baselineCapabilities:${joinCapabilities(defaultOption.capabilityTags)}`,
    `activeCapabilities:${joinCapabilities(selectedOption.capabilityTags)}`,
    `capabilityTrend:${selectedOption.id === defaultOption.id ? 'stable' : 'manual-delta'}`,
    `addedTrend:${joinCapabilities(added)}`,
    `removedTrend:${joinCapabilities(removed)}`,
    `deltaCount:${added.length + removed.length}`,
  ];
}
