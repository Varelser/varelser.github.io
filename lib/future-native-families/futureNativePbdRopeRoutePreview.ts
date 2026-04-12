import { buildProjectNonVolumetricRouteHighlights } from './futureNativeNonVolumetricRouteHighlights';

export interface FutureNativePbdRopeRoutePreview {
  familyId: 'pbd-rope';
  routeCount: number;
  presetCount: number;
  primaryPresetIds: string[];
  previewSignature: string;
}

export function buildFutureNativePbdRopeRoutePreview(): FutureNativePbdRopeRoutePreview {
  const rope = buildProjectNonVolumetricRouteHighlights().find((entry) => entry.familyId === 'pbd-rope');
  if (!rope) {
    throw new Error('Future-native rope route highlight missing');
  }

  return {
    familyId: 'pbd-rope',
    routeCount: rope.routeCount,
    presetCount: rope.presetCount,
    primaryPresetIds: rope.profiles.map((profile) => profile.primaryPresetId),
    previewSignature: `${rope.projectIoTitle}:${rope.routeCount}:${rope.presetCount}:${rope.bindingModes.join('/')}`,
  };
}
