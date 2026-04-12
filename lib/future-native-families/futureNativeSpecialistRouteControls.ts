import type {
  ProjectFutureNativeSpecialistRouteControlEntry,
  ProjectFutureNativeSpecialistRouteEntry,
} from '../../types';
import { buildRouteMetadata } from './futureNativeFamiliesSpecialistRouteMetadata';
import type { FutureNativeSpecialistPacketFamilyId } from './futureNativeFamiliesSpecialistPacketTypes';

const FUTURE_NATIVE_SPECIALIST_ROUTE_FAMILY_IDS: readonly FutureNativeSpecialistPacketFamilyId[] = [
  'specialist-houdini-native',
  'specialist-niagara-native',
  'specialist-touchdesigner-native',
  'specialist-unity-vfx-native',
];

function isKnownFamilyId(familyId: string): familyId is FutureNativeSpecialistPacketFamilyId {
  return FUTURE_NATIVE_SPECIALIST_ROUTE_FAMILY_IDS.includes(familyId as FutureNativeSpecialistPacketFamilyId);
}

export function buildDefaultProjectFutureNativeSpecialistRouteControls(): ProjectFutureNativeSpecialistRouteControlEntry[] {
  return FUTURE_NATIVE_SPECIALIST_ROUTE_FAMILY_IDS.map((familyId) => {
    const selected = buildRouteMetadata(familyId).adapterOptions[0];
    return {
      familyId,
      selectedAdapterId: selected.id,
      selectedExecutionTarget: selected.executionTarget,
      overrideMode: 'auto',
      overrideCandidateId: selected.overrideCandidate,
      overrideDisposition: 'advisory',
    } satisfies ProjectFutureNativeSpecialistRouteControlEntry;
  });
}

function coerceRouteControlEntry(
  baseEntry: ProjectFutureNativeSpecialistRouteControlEntry,
  patch: Partial<ProjectFutureNativeSpecialistRouteControlEntry> = {},
): ProjectFutureNativeSpecialistRouteControlEntry {
  if (!isKnownFamilyId(baseEntry.familyId)) {
    return {
      ...baseEntry,
      ...patch,
      overrideMode: patch.overrideMode === 'manual' ? 'manual' : 'auto',
      overrideDisposition: patch.overrideDisposition === 'pinned' ? 'pinned' : 'advisory',
    };
  }

  const metadata = buildRouteMetadata(baseEntry.familyId);
  const nextMode = patch.overrideMode === 'manual'
    ? 'manual'
    : patch.overrideMode === 'auto'
      ? 'auto'
      : baseEntry.overrideMode === 'manual'
        ? 'manual'
        : 'auto';
  const nextDisposition = patch.overrideDisposition === 'pinned'
    ? 'pinned'
    : patch.overrideDisposition === 'advisory'
      ? 'advisory'
      : baseEntry.overrideDisposition === 'pinned'
        ? 'pinned'
        : 'advisory';

  const defaultOption = metadata.adapterOptions[0];
  if (nextMode === 'auto') {
    return {
      familyId: baseEntry.familyId,
      selectedAdapterId: defaultOption.id,
      selectedExecutionTarget: defaultOption.executionTarget,
      overrideMode: 'auto',
      overrideCandidateId: defaultOption.overrideCandidate,
      overrideDisposition: nextDisposition,
    };
  }

  const requestedAdapterId = typeof patch.selectedAdapterId === 'string' && patch.selectedAdapterId.length > 0
    ? patch.selectedAdapterId
    : baseEntry.selectedAdapterId;
  const selectedOption = metadata.adapterOptions.find((option) => option.id === requestedAdapterId) ?? defaultOption;

  const requestedExecutionTarget = typeof patch.selectedExecutionTarget === 'string' && patch.selectedExecutionTarget.length > 0
    ? patch.selectedExecutionTarget
    : ('selectedAdapterId' in patch ? selectedOption.executionTarget : baseEntry.selectedExecutionTarget);
  const selectedExecutionTarget = metadata.adapterOptions.some((option) => option.executionTarget === requestedExecutionTarget)
    ? requestedExecutionTarget
    : selectedOption.executionTarget;

  const requestedOverrideCandidateId = typeof patch.overrideCandidateId === 'string' && patch.overrideCandidateId.length > 0
    ? patch.overrideCandidateId
    : ('selectedAdapterId' in patch ? selectedOption.overrideCandidate : baseEntry.overrideCandidateId);
  const overrideCandidateId = metadata.adapterOptions.some((option) => option.overrideCandidate === requestedOverrideCandidateId)
    ? requestedOverrideCandidateId
    : selectedOption.overrideCandidate;

  return {
    familyId: baseEntry.familyId,
    selectedAdapterId: selectedOption.id,
    selectedExecutionTarget,
    overrideMode: 'manual',
    overrideCandidateId,
    overrideDisposition: nextDisposition,
  };
}

export function normalizeProjectFutureNativeSpecialistRouteControls(
  entries?: ProjectFutureNativeSpecialistRouteControlEntry[],
): ProjectFutureNativeSpecialistRouteControlEntry[] {
  const byFamily = new Map((entries ?? []).map((entry) => [entry.familyId, entry]));
  return buildDefaultProjectFutureNativeSpecialistRouteControls().map((defaultEntry) => {
    const existing = byFamily.get(defaultEntry.familyId);
    return existing ? coerceRouteControlEntry(defaultEntry, existing) : defaultEntry;
  });
}

export function patchProjectFutureNativeSpecialistRouteControls(
  entries: ProjectFutureNativeSpecialistRouteControlEntry[],
  familyId: FutureNativeSpecialistPacketFamilyId,
  patch: Partial<ProjectFutureNativeSpecialistRouteControlEntry>,
): ProjectFutureNativeSpecialistRouteControlEntry[] {
  return normalizeProjectFutureNativeSpecialistRouteControls(entries).map((entry) => (
    entry.familyId === familyId ? coerceRouteControlEntry(entry, patch) : entry
  ));
}


export function buildFutureNativeSpecialistRouteControlDeltaValues(
  control: ProjectFutureNativeSpecialistRouteControlEntry,
  baselineControls: ProjectFutureNativeSpecialistRouteControlEntry[] = buildDefaultProjectFutureNativeSpecialistRouteControls(),
): string[] {
  const baseline = normalizeProjectFutureNativeSpecialistRouteControls(baselineControls).find((entry) => entry.familyId === control.familyId);
  if (!baseline) return [];
  const deltaValues: string[] = [];
  if (baseline.overrideMode !== control.overrideMode) deltaValues.push(`mode:${baseline.overrideMode}->${control.overrideMode}`);
  if (baseline.selectedAdapterId !== control.selectedAdapterId) deltaValues.push(`adapter:${baseline.selectedAdapterId}->${control.selectedAdapterId}`);
  if (baseline.selectedExecutionTarget !== control.selectedExecutionTarget) deltaValues.push(`target:${baseline.selectedExecutionTarget}->${control.selectedExecutionTarget}`);
  if (baseline.overrideCandidateId !== control.overrideCandidateId) deltaValues.push(`candidate:${baseline.overrideCandidateId}->${control.overrideCandidateId}`);
  if (baseline.overrideDisposition !== control.overrideDisposition) deltaValues.push(`disposition:${baseline.overrideDisposition}->${control.overrideDisposition}`);
  return deltaValues;
}

function readRouteValue(values: string[], prefix: string, fallback = 'unknown') {
  return values.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

export interface FutureNativeSpecialistRouteResolvedControlValues {
  selectedAdapterId: string;
  selectedExecutionTarget: string;
  overrideMode: string;
  overrideCandidateId: string;
  overrideDisposition: string;
}

export function extractFutureNativeSpecialistRouteResolvedControlValues(
  route: ProjectFutureNativeSpecialistRouteEntry,
): FutureNativeSpecialistRouteResolvedControlValues {
  return {
    selectedAdapterId: route.selectedAdapterId,
    selectedExecutionTarget: route.executionTarget,
    overrideMode: readRouteValue(route.adapterOverrideStateValues, 'overrideMode:'),
    overrideCandidateId: readRouteValue(route.adapterOverrideStateValues, 'activeOverrideCandidate:'),
    overrideDisposition: readRouteValue(route.adapterOverrideStateValues, 'overrideDisposition:'),
  };
}

export function buildFutureNativeSpecialistRouteManifestDeltaValues(
  currentRoute: ProjectFutureNativeSpecialistRouteEntry,
  manifestRoute?: ProjectFutureNativeSpecialistRouteEntry | null,
): string[] {
  if (!manifestRoute || manifestRoute.familyId !== currentRoute.familyId) {
    return ['manifest:missing'];
  }
  const currentValues = extractFutureNativeSpecialistRouteResolvedControlValues(currentRoute);
  const manifestValues = extractFutureNativeSpecialistRouteResolvedControlValues(manifestRoute);
  const deltaValues: string[] = [];
  if (manifestValues.overrideMode != currentValues.overrideMode) deltaValues.push(`mode:${manifestValues.overrideMode}->${currentValues.overrideMode}`);
  if (manifestValues.selectedAdapterId != currentValues.selectedAdapterId) deltaValues.push(`adapter:${manifestValues.selectedAdapterId}->${currentValues.selectedAdapterId}`);
  if (manifestValues.selectedExecutionTarget != currentValues.selectedExecutionTarget) deltaValues.push(`target:${manifestValues.selectedExecutionTarget}->${currentValues.selectedExecutionTarget}`);
  if (manifestValues.overrideCandidateId != currentValues.overrideCandidateId) deltaValues.push(`candidate:${manifestValues.overrideCandidateId}->${currentValues.overrideCandidateId}`);
  if (manifestValues.overrideDisposition != currentValues.overrideDisposition) deltaValues.push(`disposition:${manifestValues.overrideDisposition}->${currentValues.overrideDisposition}`);
  return deltaValues;
}

export function buildFutureNativeSpecialistRouteControlPacket(route: ProjectFutureNativeSpecialistRouteEntry): string {
  const resolved = extractFutureNativeSpecialistRouteResolvedControlValues(route);
  return [
    'ProjectFutureNativeSpecialistRouteControlPacket',
    `familyId=${route.familyId}`,
    `title=${route.title}`,
    `routeId=${route.routeId}`,
    `routeLabel=${route.routeLabel}`,
    `executionTarget=${route.executionTarget}`,
    `selectedAdapterId=${route.selectedAdapterId}`,
    `selectedAdapterLabel=${route.selectedAdapterLabel}`,
    `selectionMode=${route.adapterSelectionValues.find((value) => value.startsWith('selection:'))?.replace('selection:', '') ?? 'unknown'}`,
    `overrideMode=${resolved.overrideMode}`,
    `overrideDisposition=${resolved.overrideDisposition}`,
    `overrideCandidate=${resolved.overrideCandidateId}`,
    `fallbackActive=${route.fallbackReasonValues.find((value) => value.startsWith('fallbackActive:'))?.replace('fallbackActive:', '') ?? 'unknown'}`,
    `switchMode=${route.adapterTargetSwitchValues.find((value) => value.startsWith('switchMode:'))?.replace('switchMode:', '') ?? 'unknown'}`,
    ...route.adapterSelectionValues.map((value) => `selection::${value}`),
    ...route.adapterTargetSwitchValues.map((value) => `switch::${value}`),
    ...route.adapterOverrideStateValues.map((value) => `override::${value}`),
  ].join('\n');
}
