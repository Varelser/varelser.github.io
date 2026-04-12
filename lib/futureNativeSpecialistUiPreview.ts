import { getFutureNativeFamilySpec } from './future-native-families/futureNativeFamiliesRegistry';
import { buildRouteMetadata } from './future-native-families/futureNativeFamiliesSpecialistRouteMetadata';
import type { FutureNativeSpecialistPacketFamilyId } from './future-native-families/futureNativeFamiliesSpecialistPacketTypes';

const supportedFamilies = [
  'specialist-houdini-native',
  'specialist-niagara-native',
  'specialist-touchdesigner-native',
  'specialist-unity-vfx-native',
] as const satisfies readonly FutureNativeSpecialistPacketFamilyId[];

export type FutureNativeSpecialistUiPreviewFamilyId = (typeof supportedFamilies)[number];

export interface FutureNativeSpecialistUiPreview {
  familyId: FutureNativeSpecialistUiPreviewFamilyId;
  title: string;
  routeId: string;
  routeLabel: string;
  selectedAdapterId: string;
  executionTarget: string;
  comparisonSignature: string;
  warningValues: string[];
}

export function buildFutureNativeSpecialistUiPreview(
  familyId: FutureNativeSpecialistUiPreviewFamilyId,
): FutureNativeSpecialistUiPreview {
  const spec = getFutureNativeFamilySpec(familyId);
  const route = buildRouteMetadata(familyId);
  const primaryAdapter = route.adapterOptions[0];
  return {
    familyId,
    title: spec.title,
    routeId: route.routeId,
    routeLabel: route.routeLabel,
    selectedAdapterId: primaryAdapter?.id ?? 'unassigned',
    executionTarget: primaryAdapter?.executionTarget ?? 'report-only',
    comparisonSignature: [
      `route:${route.routeId}`,
      `default:${primaryAdapter?.id ?? 'none'}`,
      `fallbacks:${Math.max(route.adapterOptions.length - 1, 0)}`,
    ].join(' | '),
    warningValues: [],
  };
}

export function listFutureNativeSpecialistUiPreviews(): FutureNativeSpecialistUiPreview[] {
  return supportedFamilies.map((familyId) => buildFutureNativeSpecialistUiPreview(familyId));
}
