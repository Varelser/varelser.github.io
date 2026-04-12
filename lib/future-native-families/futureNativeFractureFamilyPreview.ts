import { buildProjectNonVolumetricRouteHighlights } from './futureNativeNonVolumetricRouteHighlights';

const supportedFamilies = ['fracture-lattice', 'fracture-voxel', 'fracture-crack-propagation', 'fracture-debris-generation'] as const;
export type FutureNativeFractureFamilyPreviewFamilyId = (typeof supportedFamilies)[number];

export interface FutureNativeFractureFamilyPreview {
  familyId: FutureNativeFractureFamilyPreviewFamilyId;
  routeCount: number;
  presetCount: number;
  bindingModes: string[];
  primaryPresetIds: string[];
  previewSignature: string;
}

export function buildFutureNativeFractureFamilyPreview(
  familyId: FutureNativeFractureFamilyPreviewFamilyId,
): FutureNativeFractureFamilyPreview {
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

export function listFutureNativeFractureFamilyPreviews(): FutureNativeFractureFamilyPreview[] {
  return supportedFamilies.map((familyId) => buildFutureNativeFractureFamilyPreview(familyId));
}
