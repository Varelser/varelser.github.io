import type { Layer2Type, PresetRecord } from '../types';
import { getMotionGroupName } from './motionCatalog';
import { getConfigPerformanceTier } from './performanceHints';
import {
  FUTURE_NATIVE_SCENE_PRESET_BINDINGS,
  getFutureNativeSceneBinding,
  type FutureNativeSceneBoundFamilyId,
  type FutureNativeScenePresetBinding,
} from './future-native-families/futureNativeSceneBindingData';

export const PRESET_CATEGORY_OPTIONS = [
  'All',
  'Future Native',
  'MPM',
  'PBD',
  'Fracture',
  'Volumetric',
  'Fluid',
  'Chaos',
  'Orbit',
  'Pattern',
  'Structure',
  'Pulse',
  'Transform',
  'Audio',
  'Plexus',
  'Burst',
  'Heavy',
] as const;

export const FUTURE_NATIVE_FAMILY_LABELS = ['MPM', 'PBD', 'Fracture', 'Volumetric'] as const;

export const FUTURE_NATIVE_LIBRARY_FILTER_OPTIONS = ['All', 'Future Native', ...FUTURE_NATIVE_FAMILY_LABELS] as const;

export type FutureNativeFamilyLabel = (typeof FUTURE_NATIVE_FAMILY_LABELS)[number];
export type FutureNativeLibraryFilterOption = (typeof FUTURE_NATIVE_LIBRARY_FILTER_OPTIONS)[number];

export type PresetFutureNativeInfo = {
  familyId: FutureNativeSceneBoundFamilyId;
  familyLabel: FutureNativeFamilyLabel;
  layerIndex: 2 | 3;
  modeId: Layer2Type;
  presetBinding: FutureNativeScenePresetBinding | null;
  summary: string;
  title: string;
};

const futureNativePresetBindingById = new Map<string, FutureNativeScenePresetBinding>(
  FUTURE_NATIVE_SCENE_PRESET_BINDINGS.map((binding) => [binding.id, binding]),
);

function getMotionIds(preset: PresetRecord): Layer2Type[] {
  const motions = new Set<Layer2Type>();
  motions.add(preset.config.layer2Type);
  motions.add(preset.config.layer3Type);
  preset.config.layer2Motions.forEach((motion) => motions.add(motion));
  preset.config.layer3Motions.forEach((motion) => motions.add(motion));
  return [...motions];
}

export function getFutureNativeFamilyLabel(familyId: FutureNativeSceneBoundFamilyId): FutureNativeFamilyLabel {
  if (familyId.startsWith('mpm-')) return 'MPM';
  if (familyId.startsWith('pbd-')) return 'PBD';
  if (familyId.startsWith('fracture-')) return 'Fracture';
  return 'Volumetric';
}

function getFutureNativeInfoForLayer(preset: PresetRecord, layerIndex: 2 | 3): PresetFutureNativeInfo | null {
  const modeId = layerIndex === 2 ? preset.config.layer2Type : preset.config.layer3Type;
  const binding = getFutureNativeSceneBinding(modeId);
  if (!binding) return null;

  const presetBinding = futureNativePresetBindingById.get(preset.id) ?? null;
  return {
    familyId: binding.familyId,
    familyLabel: getFutureNativeFamilyLabel(binding.familyId),
    layerIndex,
    modeId,
    presetBinding,
    summary: presetBinding?.description ?? binding.summary,
    title: presetBinding?.label ?? binding.title,
  };
}

export function getPresetFutureNativeInfo(preset: PresetRecord): PresetFutureNativeInfo | null {
  const layer3Info = getFutureNativeInfoForLayer(preset, 3);
  if (layer3Info) return layer3Info;
  return getFutureNativeInfoForLayer(preset, 2);
}

export type FutureNativeRepresentativePreset = {
  familyLabel: FutureNativeFamilyLabel;
  preset: PresetRecord | null;
  title: string;
  summary: string;
};

export function getRepresentativePresetForFutureNativeFamily(
  familyLabel: FutureNativeFamilyLabel,
  presets: PresetRecord[],
): FutureNativeRepresentativePreset {
  const presetById = new Map(presets.map((preset) => [preset.id, preset]));
  const preferredBinding = FUTURE_NATIVE_SCENE_PRESET_BINDINGS.find((binding) => (
    getFutureNativeFamilyLabel(binding.familyId) === familyLabel && presetById.has(binding.id)
  ));

  const preferredPreset = preferredBinding ? presetById.get(preferredBinding.id) ?? null : null;
  if (preferredPreset) {
    const preferredInfo = getPresetFutureNativeInfo(preferredPreset);
    const sceneBinding = getFutureNativeSceneBinding(preferredInfo?.modeId ?? preferredPreset.config.layer3Type)
      ?? getFutureNativeSceneBinding(preferredPreset.config.layer2Type);
    return {
      familyLabel,
      preset: preferredPreset,
      title: preferredInfo?.title ?? sceneBinding?.title ?? preferredPreset.name,
      summary: preferredInfo?.summary ?? sceneBinding?.summary ?? preferredPreset.name,
    };
  }

  const fallbackPreset = presets.find((preset) => getPresetFutureNativeInfo(preset)?.familyLabel === familyLabel) ?? null;
  const fallbackInfo = fallbackPreset ? getPresetFutureNativeInfo(fallbackPreset) : null;
  const fallbackBinding = fallbackInfo ? getFutureNativeSceneBinding(fallbackInfo.modeId) : null;

  return {
    familyLabel,
    preset: fallbackPreset,
    title: fallbackInfo?.title ?? fallbackBinding?.title ?? `${familyLabel} representative`,
    summary: fallbackInfo?.summary ?? fallbackBinding?.summary ?? `${familyLabel} family representative preset`,
  };
}

export function matchesPresetFutureNativeFilter(
  preset: PresetRecord,
  filter: FutureNativeLibraryFilterOption,
) {
  if (filter === 'All') return true;
  const info = getPresetFutureNativeInfo(preset);
  if (!info) return false;
  if (filter === 'Future Native') return true;
  return info.familyLabel === filter;
}

export interface FutureNativeFamilyCounts {
  allPresetCount: number;
  futureNativePresetCount: number;
  familyCounts: Record<FutureNativeFamilyLabel, number>;
}

function createFutureNativeFamilyCounts(): Record<FutureNativeFamilyLabel, number> {
  return {
    MPM: 0,
    PBD: 0,
    Fracture: 0,
    Volumetric: 0,
  };
}

export function getFutureNativeLibraryCounts(presets: PresetRecord[]): FutureNativeFamilyCounts {
  const familyCounts = createFutureNativeFamilyCounts();
  let futureNativePresetCount = 0;

  presets.forEach((preset) => {
    const info = getPresetFutureNativeInfo(preset);
    if (!info) return;
    futureNativePresetCount += 1;
    familyCounts[info.familyLabel] += 1;
  });

  return {
    allPresetCount: presets.length,
    futureNativePresetCount,
    familyCounts,
  };
}

export interface FutureNativeSequenceCounts {
  totalSteps: number;
  futureNativeStepCount: number;
  familyCounts: Record<FutureNativeFamilyLabel, number>;
}

export function getFutureNativeSequenceCounts(
  presetSequence: { presetId: string }[],
  presets: PresetRecord[],
): FutureNativeSequenceCounts {
  const familyCounts = createFutureNativeFamilyCounts();
  let futureNativeStepCount = 0;
  const presetInfoById = new Map(presets.map((preset) => [preset.id, getPresetFutureNativeInfo(preset)]));

  presetSequence.forEach((item) => {
    const info = presetInfoById.get(item.presetId);
    if (!info) return;
    futureNativeStepCount += 1;
    familyCounts[info.familyLabel] += 1;
  });

  return {
    totalSteps: presetSequence.length,
    futureNativeStepCount,
    familyCounts,
  };
}

export function getPresetCategories(preset: PresetRecord) {
  const categories = new Set<string>();
  const futureNativeInfo = getPresetFutureNativeInfo(preset);

  if (futureNativeInfo) {
    categories.add('Future Native');
    categories.add(futureNativeInfo.familyLabel);
  }

  getMotionIds(preset).forEach((motion) => {
    categories.add(getMotionGroupName(motion));
  });

  if (preset.config.audioEnabled) categories.add('Audio');
  if (preset.config.layer2ConnectionEnabled || preset.config.layer3ConnectionEnabled) categories.add('Plexus');
  if (
    preset.config.layer2Burst > 0.4 ||
    preset.config.layer3Burst > 0.4 ||
    preset.config.layer2SparkEnabled ||
    preset.config.layer3SparkEnabled
  ) {
    categories.add('Burst');
  }
  if (getConfigPerformanceTier(preset.config) === 'heavy') categories.add('Heavy');

  return [...categories];
}

export function getPresetPerformanceTier(preset: PresetRecord) {
  return getConfigPerformanceTier(preset.config);
}

export function getPresetSearchText(preset: PresetRecord) {
  const futureNativeInfo = getPresetFutureNativeInfo(preset);
  return [
    preset.name,
    preset.config.layer2Type,
    preset.config.layer3Type,
    ...preset.config.layer2Motions,
    ...preset.config.layer3Motions,
    ...getPresetCategories(preset),
    futureNativeInfo?.familyId,
    futureNativeInfo?.title,
    futureNativeInfo?.summary,
  ].filter(Boolean).join(' ').toLowerCase();
}
