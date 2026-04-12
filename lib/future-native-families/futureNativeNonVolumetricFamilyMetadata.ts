import { nonVolumetricBindingRegistrationSpecs, type NonVolumetricBindingRegistrationFamilyId } from './futureNativeNonVolumetricBindingMetadata';
import { getFutureNativeFamilySpecById } from './futureNativeFamiliesLookup';

export interface FutureNativeNonVolumetricFamilyUiSpec {
  familyId: NonVolumetricBindingRegistrationFamilyId;
  projectIoTitle: string;
  authoringDescription: string;
  projectIoDerivedLabel: string;
}

const defaultDerivedLabel = 'route-aware derived values';

const nonVolumetricFamilyUiSpecOverrides: Record<NonVolumetricBindingRegistrationFamilyId, Omit<FutureNativeNonVolumetricFamilyUiSpec, 'familyId'>> = {
  'pbd-cloth': {
    projectIoTitle: 'Future-native cloth authoring',
    authoringDescription: 'route-aware cloth obstacle and tear-bias presets remain inspectable as reusable native-surface bundles.',
    projectIoDerivedLabel: 'route-aware cloth values',
  },
  'pbd-membrane': {
    projectIoTitle: 'Future-native membrane authoring',
    authoringDescription: 'route-aware membrane tension and memory presets remain inspectable as reusable native-surface bundles.',
    projectIoDerivedLabel: 'route-aware membrane values',
  },
  'pbd-softbody': {
    projectIoTitle: 'Future-native softbody authoring',
    authoringDescription: 'route-aware shell and lattice presets remain inspectable as reusable native-surface bundles.',
    projectIoDerivedLabel: 'route-aware softbody values',
  },
  'pbd-rope': {
    projectIoTitle: 'Future-native rope authoring',
    authoringDescription: 'route-aware braid, canopy, and anchored-thread presets remain inspectable as reusable native-structure bundles.',
    projectIoDerivedLabel: 'route-aware rope values',
  },
  'mpm-granular': {
    projectIoTitle: 'Future-native granular authoring',
    authoringDescription: 'route-aware granular and jammed material presets remain inspectable as reusable native-particle bundles.',
    projectIoDerivedLabel: 'route-aware granular values',
  },
  'mpm-viscoplastic': {
    projectIoTitle: 'Future-native viscoplastic authoring',
    authoringDescription: 'route-aware mud, melt-front, and evaporative-sheet presets remain inspectable as reusable native-particle bundles.',
    projectIoDerivedLabel: 'route-aware viscoplastic values',
  },
  'mpm-snow': {
    projectIoTitle: 'Future-native snow authoring',
    authoringDescription: 'route-aware powder, crust, and avalanche presets remain inspectable as reusable native-particle bundles.',
    projectIoDerivedLabel: 'route-aware snow values',
  },
  'mpm-mud': {
    projectIoTitle: 'Future-native mud authoring',
    authoringDescription: 'route-aware sediment, heap, and slurry presets remain inspectable as reusable native-particle bundles.',
    projectIoDerivedLabel: 'route-aware mud values',
  },
  'mpm-paste': {
    projectIoTitle: 'Future-native paste authoring',
    authoringDescription: 'route-aware capillary, percolation, and crawl presets remain inspectable as reusable native-particle bundles.',
    projectIoDerivedLabel: 'route-aware paste values',
  },
  'fracture-lattice': {
    projectIoTitle: 'Future-native lattice fracture authoring',
    authoringDescription: 'route-aware collapse and grammar presets remain inspectable as reusable native-structure bundles.',
    projectIoDerivedLabel: 'route-aware fracture values',
  },
  'fracture-voxel': {
    projectIoTitle: 'Future-native voxel fracture authoring',
    authoringDescription: 'route-aware voxel shell and chunk presets remain inspectable as reusable native-structure bundles.',
    projectIoDerivedLabel: 'route-aware voxel values',
  },
  'fracture-crack-propagation': {
    projectIoTitle: 'Future-native crack-front authoring',
    authoringDescription: 'route-aware crack-front and seep presets remain inspectable as reusable native-structure bundles.',
    projectIoDerivedLabel: 'route-aware crack values',
  },
  'fracture-debris-generation': {
    projectIoTitle: 'Future-native debris authoring',
    authoringDescription: 'route-aware shard, orbit, and pollen debris presets remain inspectable as reusable native-structure bundles.',
    projectIoDerivedLabel: 'route-aware debris values',
  },
};

const orderedNonVolumetricFamilyIds = Array.from(
  new Set(nonVolumetricBindingRegistrationSpecs.map((entry) => entry.familyId)),
) as NonVolumetricBindingRegistrationFamilyId[];

export const futureNativeNonVolumetricFamilyUiSpecs = orderedNonVolumetricFamilyIds.map((familyId) => ({
  familyId,
  projectIoTitle: nonVolumetricFamilyUiSpecOverrides[familyId]?.projectIoTitle ?? `${getFutureNativeFamilySpecById(familyId).title} authoring`,
  authoringDescription: nonVolumetricFamilyUiSpecOverrides[familyId]?.authoringDescription
    ?? `${getFutureNativeFamilySpecById(familyId).title} keeps route-aware preset bundles visible in Project IO and project reports.`,
  projectIoDerivedLabel: nonVolumetricFamilyUiSpecOverrides[familyId]?.projectIoDerivedLabel ?? defaultDerivedLabel,
}));

const futureNativeNonVolumetricFamilyUiSpecMap = Object.fromEntries(
  futureNativeNonVolumetricFamilyUiSpecs.map((entry) => [entry.familyId, entry]),
) as Record<NonVolumetricBindingRegistrationFamilyId, FutureNativeNonVolumetricFamilyUiSpec>;

export function getFutureNativeNonVolumetricFamilyUiSpecs(): FutureNativeNonVolumetricFamilyUiSpec[] {
  return futureNativeNonVolumetricFamilyUiSpecs;
}

export function getFutureNativeNonVolumetricFamilyUiSpecByFamilyId(
  familyId: NonVolumetricBindingRegistrationFamilyId,
): FutureNativeNonVolumetricFamilyUiSpec {
  return futureNativeNonVolumetricFamilyUiSpecMap[familyId];
}

export function isNonVolumetricBindingRegistrationFamilyId(value: string): value is NonVolumetricBindingRegistrationFamilyId {
  return value in futureNativeNonVolumetricFamilyUiSpecMap;
}
