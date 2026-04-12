import { buildProjectVolumetricRouteHighlights } from './futureNativeVolumetricRouteHighlights';

export interface FutureNativeVolumetricSmokeAuthoringSummary {
  familyId: 'volumetric-smoke';
  routeCount: number;
  presetCount: number;
  primaryPresetIds: string[];
  previewSignature: string;
}

export function buildFutureNativeVolumetricSmokeAuthoringSummary(): FutureNativeVolumetricSmokeAuthoringSummary {
  const smoke = buildProjectVolumetricRouteHighlights().find((entry) => entry.familyId === 'volumetric-smoke');
  if (!smoke) {
    throw new Error('Future-native volumetric smoke route highlight missing');
  }

  return {
    familyId: 'volumetric-smoke',
    routeCount: smoke.profiles.length,
    presetCount: smoke.profiles.length,
    primaryPresetIds: smoke.profiles.map((profile) => profile.presetId),
    previewSignature: `volumetric-smoke:${smoke.profiles.length}:${smoke.profiles.length}`,
  };
}
