import { buildProjectNonVolumetricRouteHighlights } from './futureNativeNonVolumetricRouteHighlights';

const supportedFamilies = ['mpm-viscoplastic', 'mpm-snow', 'mpm-mud', 'mpm-paste'] as const;
export type FutureNativeMpmDedicatedRoutePreviewFamilyId = (typeof supportedFamilies)[number];

export interface FutureNativeMpmDedicatedRoutePreview {
  familyId: FutureNativeMpmDedicatedRoutePreviewFamilyId;
  routeCount: number;
  presetCount: number;
  primaryPresetIds: string[];
  previewSignature: string;
}

export function buildFutureNativeMpmDedicatedRoutePreview(
  familyId: FutureNativeMpmDedicatedRoutePreviewFamilyId,
): FutureNativeMpmDedicatedRoutePreview {
  const family = buildProjectNonVolumetricRouteHighlights().find((entry) => entry.familyId === familyId);
  if (!family) {
    throw new Error(`Future-native ${familyId} route highlight missing`);
  }

  return {
    familyId,
    routeCount: family.routeCount,
    presetCount: family.presetCount,
    primaryPresetIds: family.profiles.map((profile) => profile.primaryPresetId),
    previewSignature: `${family.projectIoTitle}:${family.routeCount}:${family.presetCount}:${family.bindingModes.join('/')}`,
  };
}

export function listFutureNativeMpmDedicatedRoutePreviews(): FutureNativeMpmDedicatedRoutePreview[] {
  return supportedFamilies.map((familyId) => buildFutureNativeMpmDedicatedRoutePreview(familyId));
}
