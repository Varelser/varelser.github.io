import { buildProjectNonVolumetricRouteHighlights } from './futureNativeNonVolumetricRouteHighlights';

const supportedFamilies = ['pbd-rope', 'pbd-cloth', 'pbd-membrane', 'pbd-softbody'] as const;
export type FutureNativePbdFamilyPreviewFamilyId = (typeof supportedFamilies)[number];

export interface FutureNativePbdFamilyPreview {
  familyId: FutureNativePbdFamilyPreviewFamilyId;
  routeCount: number;
  presetCount: number;
  bindingModes: string[];
  primaryPresetIds: string[];
  previewSignature: string;
}

export function buildFutureNativePbdFamilyPreview(
  familyId: FutureNativePbdFamilyPreviewFamilyId,
): FutureNativePbdFamilyPreview {
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

export function listFutureNativePbdFamilyPreviews(): FutureNativePbdFamilyPreview[] {
  return supportedFamilies.map((familyId) => buildFutureNativePbdFamilyPreview(familyId));
}
