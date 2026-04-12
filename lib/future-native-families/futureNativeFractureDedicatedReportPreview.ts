import { buildProjectNonVolumetricRouteHighlights } from './futureNativeNonVolumetricRouteHighlights';

const supportedFamilies = ['fracture-voxel', 'fracture-crack-propagation', 'fracture-debris-generation'] as const;
export type FutureNativeFractureDedicatedReportPreviewFamilyId = (typeof supportedFamilies)[number];

export interface FutureNativeFractureDedicatedReportPreview {
  familyId: FutureNativeFractureDedicatedReportPreviewFamilyId;
  routeCount: number;
  presetCount: number;
  primaryPresetIds: string[];
  previewSignature: string;
}

export function buildFutureNativeFractureDedicatedReportPreview(
  familyId: FutureNativeFractureDedicatedReportPreviewFamilyId,
): FutureNativeFractureDedicatedReportPreview {
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

export function listFutureNativeFractureDedicatedReportPreviews(): FutureNativeFractureDedicatedReportPreview[] {
  return supportedFamilies.map((familyId) => buildFutureNativeFractureDedicatedReportPreview(familyId));
}
