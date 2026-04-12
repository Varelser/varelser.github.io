import { buildProjectNonVolumetricRouteHighlights } from './futureNativeNonVolumetricRouteHighlights';

const supportedFamilies = ['mpm-granular', 'mpm-viscoplastic', 'mpm-snow', 'mpm-mud', 'mpm-paste'] as const;
export type FutureNativeMpmFamilyPreviewFamilyId = (typeof supportedFamilies)[number];

export interface FutureNativeMpmFamilyPreview {
  familyId: FutureNativeMpmFamilyPreviewFamilyId;
  routeCount: number;
  presetCount: number;
  bindingModes: string[];
  primaryPresetIds: string[];
  previewSignature: string;
}

export function buildFutureNativeMpmFamilyPreview(
  familyId: FutureNativeMpmFamilyPreviewFamilyId,
): FutureNativeMpmFamilyPreview {
  const family = buildProjectNonVolumetricRouteHighlights().find((entry) => entry.familyId === familyId);
  if (!family) throw new Error(`Future-native ${familyId} route highlight missing`);
  return {
    familyId,
    routeCount: family.routeCount,
    presetCount: family.presetCount,
    bindingModes: [...family.bindingModes],
    primaryPresetIds: family.profiles.map((profile) => profile.primaryPresetId),
    previewSignature: `${family.familyId}:${family.routeCount}:${family.presetCount}:${family.bindingModes.join('/')}:${family.coverageLabel ?? 'no-coverage'}`,
  };
}

export function listFutureNativeMpmFamilyPreviews(): FutureNativeMpmFamilyPreview[] {
  return supportedFamilies.map((familyId) => buildFutureNativeMpmFamilyPreview(familyId));
}
