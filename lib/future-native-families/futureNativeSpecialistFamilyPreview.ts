import { buildAllFutureNativeSpecialistRouteSnapshots, type FutureNativeSpecialistPacketFamilyId } from './futureNativeFamiliesSpecialistPackets';
import { buildFutureNativeSpecialistRouteExportImportComparison } from './futureNativeFamiliesSpecialistRouteComparison';

const supportedFamilies = [
  'specialist-houdini-native',
  'specialist-niagara-native',
  'specialist-touchdesigner-native',
  'specialist-unity-vfx-native',
] as const satisfies readonly FutureNativeSpecialistPacketFamilyId[];

export type FutureNativeSpecialistFamilyPreviewFamilyId = (typeof supportedFamilies)[number];

export interface FutureNativeSpecialistFamilyPreview {
  familyId: FutureNativeSpecialistFamilyPreviewFamilyId;
  routeId: string;
  routeLabel: string;
  selectedAdapterId: string;
  executionTarget: string;
  previewSignature: string;
  comparisonSignature: string;
  warningValues: string[];
}

export function buildFutureNativeSpecialistFamilyPreview(
  familyId: FutureNativeSpecialistFamilyPreviewFamilyId,
  args: {
    routesByFamilyId?: Map<string, ReturnType<typeof buildAllFutureNativeSpecialistRouteSnapshots>[number]>;
    comparisonsByFamilyId?: Map<string, ReturnType<typeof buildFutureNativeSpecialistRouteExportImportComparison>['routes'][number]>;
  } = {},
): FutureNativeSpecialistFamilyPreview {
  const route = args.routesByFamilyId?.get(familyId) ?? buildAllFutureNativeSpecialistRouteSnapshots().find((entry) => entry.familyId === familyId);
  if (!route) throw new Error(`Unknown specialist family preview: ${familyId}`);
  const comparison = args.comparisonsByFamilyId?.get(familyId) ?? buildFutureNativeSpecialistRouteExportImportComparison().routes.find((entry) => entry.familyId === familyId);
  const warningValues = comparison?.warningValues ?? [];
  return {
    familyId,
    routeId: route.routeId,
    routeLabel: route.routeLabel,
    selectedAdapterId: route.selectedAdapterId,
    executionTarget: route.executionTarget,
    previewSignature: [familyId, route.routeId, route.selectedAdapterId, route.executionTarget].join('|'),
    comparisonSignature: [
      familyId,
      comparison?.changedSections.join('+') || 'stable',
      comparison?.manifestRoundtripStable ? 'manifest-stable' : 'manifest-drift',
      comparison?.serializationRoundtripStable ? 'serialization-stable' : 'serialization-drift',
      comparison?.controlRoundtripStable ? 'control-stable' : 'control-drift',
    ].join('|'),
    warningValues,
  };
}

export function listFutureNativeSpecialistFamilyPreviews(): FutureNativeSpecialistFamilyPreview[] {
  const routesByFamilyId = new Map(buildAllFutureNativeSpecialistRouteSnapshots().map((entry) => [entry.familyId, entry]));
  const comparisonsByFamilyId = new Map(buildFutureNativeSpecialistRouteExportImportComparison().routes.map((entry) => [entry.familyId, entry]));
  return supportedFamilies.map((familyId) => buildFutureNativeSpecialistFamilyPreview(familyId, { routesByFamilyId, comparisonsByFamilyId }));
}

export function renderFutureNativeSpecialistFamilyPreviewsMarkdown(
  previews = listFutureNativeSpecialistFamilyPreviews(),
): string {
  const lines = ['# Future-Native Specialist Family Previews', ''];
  for (const preview of previews) {
    lines.push(`## ${preview.familyId}`);
    lines.push(`- routeId: ${preview.routeId}`);
    lines.push(`- routeLabel: ${preview.routeLabel}`);
    lines.push(`- selectedAdapterId: ${preview.selectedAdapterId}`);
    lines.push(`- executionTarget: ${preview.executionTarget}`);
    lines.push(`- previewSignature: ${preview.previewSignature}`);
    lines.push(`- comparisonSignature: ${preview.comparisonSignature}`);
    lines.push(`- warningValues: ${preview.warningValues.join(', ') || 'none'}`);
    lines.push('');
  }
  return lines.join('\n');
}
