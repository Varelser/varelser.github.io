import type {
  ProjectFutureNativeSpecialistPacketEntry,
  ProjectFutureNativeSpecialistRouteControlEntry,
} from '../../types';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function parseProjectFutureNativeSpecialistPackets(
  value: unknown,
  fallbackEntries: ProjectFutureNativeSpecialistPacketEntry[],
): ProjectFutureNativeSpecialistPacketEntry[] {
  if (!Array.isArray(value)) return fallbackEntries;
  const parsed = value
    .filter((entry): entry is Record<string, unknown> => isPlainObject(entry))
    .map((entry) => ({
      familyId: typeof entry.familyId === 'string' ? entry.familyId : '',
      title: typeof entry.title === 'string' ? entry.title : '',
      currentStage: typeof entry.currentStage === 'string' ? entry.currentStage : '',
      progressPercent: typeof entry.progressPercent === 'number' ? entry.progressPercent : 0,
      graphHint: typeof entry.graphHint === 'string' ? entry.graphHint : '',
      outputHint: typeof entry.outputHint === 'string' ? entry.outputHint : '',
      serializerBlockKey: typeof entry.serializerBlockKey === 'string' ? entry.serializerBlockKey : '',
      stageLabels: parseStringArray(entry.stageLabels),
      outputBridges: parseStringArray(entry.outputBridges),
      adapterMappingCount: typeof entry.adapterMappingCount === 'number' ? entry.adapterMappingCount : 0,
      runtimeConfigValues: parseStringArray(entry.runtimeConfigValues),
      nextTargets: parseStringArray(entry.nextTargets),
    }))
    .filter((entry) => entry.familyId.length > 0);
  return parsed.length > 0 ? parsed : fallbackEntries;
}

export function parseProjectFutureNativeSpecialistRouteControls(
  value: unknown,
  fallbackEntries: ProjectFutureNativeSpecialistRouteControlEntry[],
): ProjectFutureNativeSpecialistRouteControlEntry[] {
  if (!Array.isArray(value)) return fallbackEntries;
  const parsed = value
    .filter((entry): entry is Record<string, unknown> => isPlainObject(entry))
    .map((entry): ProjectFutureNativeSpecialistRouteControlEntry => ({
      familyId: typeof entry.familyId === 'string' ? entry.familyId : '',
      selectedAdapterId: typeof entry.selectedAdapterId === 'string' ? entry.selectedAdapterId : '',
      selectedExecutionTarget: typeof entry.selectedExecutionTarget === 'string' ? entry.selectedExecutionTarget : '',
      overrideMode: entry.overrideMode === 'manual' ? 'manual' : 'auto',
      overrideCandidateId: typeof entry.overrideCandidateId === 'string' ? entry.overrideCandidateId : '',
      overrideDisposition: entry.overrideDisposition === 'pinned' ? 'pinned' : 'advisory',
    }))
    .filter((entry) => entry.familyId.length > 0);
  return parsed.length > 0 ? parsed : fallbackEntries;
}
