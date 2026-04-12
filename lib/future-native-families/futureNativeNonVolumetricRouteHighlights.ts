import {
  nonVolumetricBindingRegistrationSpecs,
  type NonVolumetricBindingRegistrationFamilyId,
  type NonVolumetricBindingRegistrationMode,
} from './futureNativeNonVolumetricBindingMetadata';
import { getFutureNativeFamilySpecById } from './futureNativeFamiliesLookup';
import { getFutureNativeNonVolumetricFamilyUiSpecByFamilyId } from './futureNativeNonVolumetricFamilyMetadata';
import { getFutureNativeNonVolumetricBundleCoverage } from './futureNativeNonVolumetricBundleCoverage';

export interface FutureNativeNonVolumetricRouteProfile {
  routeId: string;
  modeId: string;
  bindingMode: NonVolumetricBindingRegistrationMode;
  primaryPresetId: string;
  title: string;
  summary: string;
  presetIds: string[];
  presetLabels: string[];
  descriptionLines: string[];
}

export interface FutureNativeProjectNonVolumetricRouteHighlight {
  familyId: NonVolumetricBindingRegistrationFamilyId;
  title: string;
  projectIoTitle: string;
  authoringDescription: string;
  projectIoDerivedLabel: string;
  routeCount: number;
  presetCount: number;
  bindingModes: NonVolumetricBindingRegistrationMode[];
  deltaLines: string[];
  profiles: FutureNativeNonVolumetricRouteProfile[];
  helperArtifacts: string[];
  bundleArtifacts: string[];
  coverageLabel: string | null;
}

function unique<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

export function buildProjectNonVolumetricRouteHighlights(): FutureNativeProjectNonVolumetricRouteHighlight[] {
  const grouped = new Map<NonVolumetricBindingRegistrationFamilyId, Array<(typeof nonVolumetricBindingRegistrationSpecs)[number]>>();

  for (const entry of nonVolumetricBindingRegistrationSpecs) {
    const existing = grouped.get(entry.familyId) ?? [];
    grouped.set(entry.familyId, [...existing, entry]);
  }

  return [...grouped.entries()].map(([familyId, entries]) => {
    const familySpec = getFutureNativeFamilySpecById(familyId);
    const uiSpec = getFutureNativeNonVolumetricFamilyUiSpecByFamilyId(familyId);
    const profiles = [...entries]
      .sort((a, b) => a.modeId.localeCompare(b.modeId))
      .map((entry) => ({
        routeId: entry.routeTag,
        modeId: entry.modeId,
        bindingMode: entry.bindingMode,
        primaryPresetId: entry.primaryPresetId,
        title: entry.title,
        summary: entry.summary,
        presetIds: entry.presets.map((preset) => preset.id),
        presetLabels: entry.presets.map((preset) => preset.label),
        descriptionLines: entry.presets.map((preset) => preset.description),
      }));

    const presetIds = unique(profiles.flatMap((profile) => profile.presetIds));
    const bindingModes = unique(profiles.map((profile) => profile.bindingMode));
    const coverage = getFutureNativeNonVolumetricBundleCoverage(familyId);

    return {
      familyId,
      title: familySpec.title,
      projectIoTitle: uiSpec.projectIoTitle,
      authoringDescription: uiSpec.authoringDescription,
      projectIoDerivedLabel: uiSpec.projectIoDerivedLabel,
      routeCount: profiles.length,
      presetCount: presetIds.length,
      bindingModes,
      deltaLines: [
        `routes=${profiles.length}`,
        `presets=${presetIds.length}`,
        `binding=${bindingModes.join('/')}`,
      ],
      profiles,
      helperArtifacts: coverage?.helperArtifacts ?? [],
      bundleArtifacts: coverage?.bundleArtifacts ?? [],
      coverageLabel: coverage?.coverageLabel ?? null,
    };
  });
}
