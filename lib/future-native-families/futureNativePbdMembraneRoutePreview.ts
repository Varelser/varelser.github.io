import { buildProjectNonVolumetricRouteHighlights } from './futureNativeNonVolumetricRouteHighlights';

export interface FutureNativePbdMembraneRoutePreview {
  familyId: 'pbd-membrane';
  routeCount: number;
  presetCount: number;
  primaryPresetIds: string[];
  previewSignature: string;
}

export function buildFutureNativePbdMembraneRoutePreview(): FutureNativePbdMembraneRoutePreview {
  const membrane = buildProjectNonVolumetricRouteHighlights().find((entry) => entry.familyId === 'pbd-membrane');
  if (!membrane) {
    throw new Error('Future-native membrane route highlight missing');
  }

  return {
    familyId: 'pbd-membrane',
    routeCount: membrane.routeCount,
    presetCount: membrane.presetCount,
    primaryPresetIds: membrane.profiles.map((profile) => profile.primaryPresetId),
    previewSignature: `${membrane.projectIoTitle}:${membrane.routeCount}:${membrane.presetCount}:${membrane.bindingModes.join('/')}`,
  };
}
