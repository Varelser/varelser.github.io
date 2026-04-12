import { buildProjectNonVolumetricRouteHighlights } from './futureNativeNonVolumetricRouteHighlights';

export interface FutureNativeFractureLatticeReportPreview {
  familyId: 'fracture-lattice';
  routeCount: number;
  presetCount: number;
  primaryPresetIds: string[];
  previewSignature: string;
}

export function buildFutureNativeFractureLatticeReportPreview(): FutureNativeFractureLatticeReportPreview {
  const lattice = buildProjectNonVolumetricRouteHighlights().find((entry) => entry.familyId === 'fracture-lattice');
  if (!lattice) {
    throw new Error('Future-native fracture-lattice route highlight missing');
  }

  return {
    familyId: 'fracture-lattice',
    routeCount: lattice.routeCount,
    presetCount: lattice.presetCount,
    primaryPresetIds: lattice.profiles.map((profile) => profile.primaryPresetId),
    previewSignature: `${lattice.projectIoTitle}:${lattice.routeCount}:${lattice.presetCount}:${lattice.bindingModes.join('/')}`,
  };
}
