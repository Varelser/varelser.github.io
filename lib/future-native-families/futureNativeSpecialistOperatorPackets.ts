import { buildRouteMetadata } from './futureNativeFamiliesSpecialistRouteMetadata';
import type { FutureNativeSpecialistPacketFamilyId } from './futureNativeFamiliesSpecialistPacketTypes';
import { buildFutureNativeSpecialistRouteSnapshot } from './futureNativeFamiliesSpecialistPackets';

export type { FutureNativeSpecialistPacketFamilyId } from './futureNativeFamiliesSpecialistPacketTypes';

function diffCapabilityTags(defaultTags: string[], comparisonTags: string[]) {
  const added = comparisonTags.filter((value) => !defaultTags.includes(value));
  const removed = defaultTags.filter((value) => !comparisonTags.includes(value));
  return {
    added: added.join(',') || 'none',
    removed: removed.join(',') || 'none',
  };
}

export function buildFutureNativeSpecialistOperatorPacket(
  familyId: FutureNativeSpecialistPacketFamilyId,
): string {
  const route = buildFutureNativeSpecialistRouteSnapshot(familyId);

  return [
    'FutureNativeSpecialistOperatorPacket',
    `familyId=${route.familyId}`,
    `title=${route.title}`,
    `routeId=${route.routeId}`,
    `routeLabel=${route.routeLabel}`,
    `selectedAdapterId=${route.selectedAdapterId}`,
    `selectedAdapterLabel=${route.selectedAdapterLabel}`,
    `executionTarget=${route.executionTarget}`,
    `graphHint=${route.graphHint}`,
    `outputHint=${route.outputHint}`,
    `serializerBlockKey=${route.serializerBlockKey}`,
    ...route.routingValues.map((value) => `routing::${value}`),
    ...route.adapterHandshakeValues.map((value) => `handshake::${value}`),
    ...route.adapterSelectionValues.map((value) => `selection::${value}`),
    ...route.adapterTargetSwitchValues.map((value) => `targetSwitch::${value}`),
    ...route.adapterOverrideStateValues.map((value) => `override::${value}`),
    ...route.adapterFallbackHistoryValues.map((value) => `fallback::${value}`),
    ...route.capabilityTrendDeltaValues.map((value) => `trend::${value}`),
    ...route.nextTargets.map((value) => `next::${value}`),
  ].join('\n');
}

export function buildFutureNativeSpecialistAdapterPacket(
  familyId: FutureNativeSpecialistPacketFamilyId,
): string {
  const metadata = buildRouteMetadata(familyId);
  const route = buildFutureNativeSpecialistRouteSnapshot(familyId);

  return [
    'FutureNativeSpecialistAdapterPacket',
    `familyId=${route.familyId}`,
    `routeId=${metadata.routeId}`,
    `routeLabel=${metadata.routeLabel}`,
    `selectedAdapterId=${route.selectedAdapterId}`,
    `selectedAdapterLabel=${route.selectedAdapterLabel}`,
    `executionTarget=${route.executionTarget}`,
    `adapterCount=${metadata.adapterOptions.length}`,
    `handshakeCount=${metadata.handshakeValues.length}`,
    ...metadata.handshakeValues.map((value) => `handshake::${value}`),
    ...metadata.adapterOptions.map((option) => [
      'adapter',
      option.id,
      option.label,
      option.executionTarget,
      option.overrideCandidate,
      option.capabilityTags.join(','),
      option.fallbackReason,
    ].join('::')),
  ].join('\n');
}

export function buildFutureNativeSpecialistComparisonPacket(
  familyId: FutureNativeSpecialistPacketFamilyId,
): string {
  const metadata = buildRouteMetadata(familyId);
  const route = buildFutureNativeSpecialistRouteSnapshot(familyId);
  const defaultAdapter = metadata.adapterOptions[0];

  return [
    'FutureNativeSpecialistComparisonPacket',
    `familyId=${familyId}`,
    `routeId=${metadata.routeId}`,
    `routeLabel=${metadata.routeLabel}`,
    `selectedAdapterId=${route.selectedAdapterId}`,
    `defaultAdapterId=${defaultAdapter?.id ?? 'none'}`,
    `adapterCount=${metadata.adapterOptions.length}`,
    ...metadata.adapterOptions.map((option) => {
      const diff = defaultAdapter ? diffCapabilityTags(defaultAdapter.capabilityTags, option.capabilityTags) : { added: 'none', removed: 'none' };
      return [
        'compare',
        option.id,
        option.executionTarget,
        `added=${diff.added}`,
        `removed=${diff.removed}`,
        `fallback=${option.fallbackReason}`,
      ].join('::');
    }),
  ].join('\n');
}
