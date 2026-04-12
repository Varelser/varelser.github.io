import type { PresetLibraryData, PresetRecord, PresetSequenceItem } from '../types';
import { DEFAULT_CONFIG, normalizeConfig } from './appStateConfig';

export const EMPTY_STARTER_PRESET_LIBRARY: PresetLibraryData = {
  version: 1,
  exportedAt: new Date(0).toISOString(),
  currentConfig: normalizeConfig(DEFAULT_CONFIG),
  activePresetId: null,
  presetBlendDuration: 1.4,
  sequenceLoopEnabled: true,
  presets: [],
  presetSequence: [],
};

export type StarterLibraryAugmentation = Pick<PresetLibraryData, 'presets' | 'presetSequence'>;

let coreStarterPresetLibraryPromise: Promise<PresetLibraryData> | null = null;
let starterProductPackAugmentationPromise: Promise<StarterLibraryAugmentation> | null = null;
let starterFutureNativeAugmentationPromise: Promise<StarterLibraryAugmentation> | null = null;
let operatorStarterLibraryAugmentationPromise: Promise<StarterLibraryAugmentation> | null = null;

function mergePresetRecords(base: PresetRecord[], augmentation: PresetRecord[]): PresetRecord[] {
  if (augmentation.length === 0) return base;
  const seen = new Set(base.map((preset) => preset.id));
  return [...base, ...augmentation.filter((preset) => !seen.has(preset.id) && !!seen.add(preset.id))];
}

function mergePresetSequence(base: PresetSequenceItem[], augmentation: PresetSequenceItem[]): PresetSequenceItem[] {
  if (augmentation.length === 0) return base;
  const seen = new Set(base.map((item) => item.id));
  return [...base, ...augmentation.filter((item) => !seen.has(item.id) && !!seen.add(item.id))];
}

function filterSequenceItemsByKnownPresetIds(sequence: PresetSequenceItem[], presets: PresetRecord[]): PresetSequenceItem[] {
  if (sequence.length === 0) return sequence;
  const knownPresetIds = new Set(presets.map((preset) => preset.id));
  return sequence.filter((item) => knownPresetIds.has(item.presetId));
}

export function mergeStarterLibraryAugmentation(library: PresetLibraryData, augmentation: StarterLibraryAugmentation): PresetLibraryData {
  const presets = mergePresetRecords(library.presets, augmentation.presets);
  const presetSequence = filterSequenceItemsByKnownPresetIds(
    mergePresetSequence(library.presetSequence, augmentation.presetSequence),
    presets,
  );

  return {
    ...library,
    presets,
    presetSequence,
  };
}

export async function loadCoreStarterPresetLibrary(): Promise<PresetLibraryData> {
  if (!coreStarterPresetLibraryPromise) {
    coreStarterPresetLibraryPromise = import('./starterLibraryData').then((module) => module.CORE_STARTER_PRESET_LIBRARY);
  }
  return coreStarterPresetLibraryPromise;
}

export async function loadStarterProductPackAugmentation(): Promise<StarterLibraryAugmentation> {
  if (!starterProductPackAugmentationPromise) {
    starterProductPackAugmentationPromise = import('./starterLibraryProductPackAugmentation').then((module) => module.STARTER_PRODUCT_PACK_AUGMENTATION);
  }
  return starterProductPackAugmentationPromise;
}

export async function loadStarterFutureNativeAugmentation(): Promise<StarterLibraryAugmentation> {
  if (!starterFutureNativeAugmentationPromise) {
    starterFutureNativeAugmentationPromise = import('./starterLibraryFutureNativeAugmentation').then((module) => module.STARTER_FUTURE_NATIVE_AUGMENTATION);
  }
  return starterFutureNativeAugmentationPromise;
}

export async function loadOperatorStarterLibraryAugmentation(): Promise<StarterLibraryAugmentation> {
  if (!operatorStarterLibraryAugmentationPromise) {
    operatorStarterLibraryAugmentationPromise = import('./operatorGeneratedStarters').then((module) => ({
      presets: [
        ...module.OPERATOR_STARTER_PRESETS,
        ...module.OPERATOR_COMBO_PRESETS,
        ...module.OPERATOR_DEDICATED_AXIS_PRESETS,
        ...module.OPERATOR_DEDICATED_SUBAXIS_PRESETS,
        ...module.OPERATOR_COLLISION_REVIEW_PRESETS,
        ...module.OPERATOR_ATLAS_STACK_PRESETS,
      ],
      presetSequence: [
        ...module.OPERATOR_STARTER_SEQUENCES,
        ...module.OPERATOR_COMBO_SEQUENCES,
        ...module.OPERATOR_DEDICATED_AXIS_SEQUENCES,
        ...module.OPERATOR_DEDICATED_SUBAXIS_SEQUENCES,
        ...module.OPERATOR_COLLISION_REVIEW_SEQUENCES,
        ...module.OPERATOR_ATLAS_STACK_SEQUENCES,
      ],
    }));
  }
  return operatorStarterLibraryAugmentationPromise;
}

export async function loadFullStarterPresetLibrary(): Promise<PresetLibraryData> {
  const [coreLibrary, productPackAugmentation, futureNativeAugmentation, operatorAugmentation] = await Promise.all([
    loadCoreStarterPresetLibrary(),
    loadStarterProductPackAugmentation(),
    loadStarterFutureNativeAugmentation(),
    loadOperatorStarterLibraryAugmentation(),
  ]);
  return mergeStarterLibraryAugmentation(
    mergeStarterLibraryAugmentation(
      mergeStarterLibraryAugmentation(coreLibrary, productPackAugmentation),
      futureNativeAugmentation,
    ),
    operatorAugmentation,
  );
}
