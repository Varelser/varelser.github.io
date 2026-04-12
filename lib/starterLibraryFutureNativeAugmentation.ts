import type { PresetRecord, PresetSequenceItem } from '../types';
import { createStarterPreset } from './starterLibraryCore';
import type { StarterLibraryAugmentation } from './starterLibrary';
import {
  FUTURE_NATIVE_SCENE_BINDINGS,
  FUTURE_NATIVE_SCENE_PRESET_BINDINGS,
  type FutureNativeScenePresetBinding,
} from './future-native-families/futureNativeSceneBindingData';
import { buildFutureNativeScenePresetPatch } from './future-native-families/futureNativeScenePresetPatches';

const REPRESENTATIVE_SEQUENCE_PRESET_IDS = [
  'future-native-mpm-granular-sand-fall',
  'future-native-mpm-viscoplastic-viscous-flow',
  'future-native-mpm-snow-avalanche-field',
  'future-native-mpm-mud-liquid-smear',
  'future-native-mpm-paste-capillary-sheet',
  'future-native-pbd-cloth-drape',
  'future-native-pbd-rope-signal-braid',
  'future-native-pbd-softbody-shell',
  'future-native-fracture-voxel-lattice',
  'future-native-fracture-crack-propagation-seep',
  'future-native-fracture-debris-generation-shard',
  'future-native-volumetric-smoke-prism',
] as const satisfies readonly string[];

function uniquePresetBindings(): FutureNativeScenePresetBinding[] {
  const byId = new Map<string, FutureNativeScenePresetBinding>();
  FUTURE_NATIVE_SCENE_PRESET_BINDINGS.forEach((binding) => {
    if (!byId.has(binding.id)) byId.set(binding.id, binding);
  });
  FUTURE_NATIVE_SCENE_BINDINGS.forEach((binding) => {
    if (byId.has(binding.primaryPresetId)) return;
    byId.set(binding.primaryPresetId, {
      id: binding.primaryPresetId,
      modeId: binding.modeId,
      familyId: binding.familyId,
      bindingMode: binding.bindingMode,
      label: binding.title,
      description: binding.summary,
    });
  });
  return Array.from(byId.values());
}

const FUTURE_NATIVE_STARTER_PRESETS: PresetRecord[] = uniquePresetBindings()
  .map((binding) => {
    const patch = buildFutureNativeScenePresetPatch(binding.id, 2);
    if (!patch) return null;
    return createStarterPreset(
      binding.id,
      `FN ${binding.label}`,
      patch,
    );
  })
  .filter((preset): preset is PresetRecord => preset !== null);

const starterPresetIdSet = new Set(FUTURE_NATIVE_STARTER_PRESETS.map((preset) => preset.id));
const presetBindingsById = new Map(uniquePresetBindings().map((binding) => [binding.id, binding]));

const FUTURE_NATIVE_STARTER_SEQUENCES: PresetSequenceItem[] = REPRESENTATIVE_SEQUENCE_PRESET_IDS
  .filter((presetId) => starterPresetIdSet.has(presetId))
  .map((presetId, index) => {
    const binding = presetBindingsById.get(presetId);
    return {
      id: `starter-sequence-${presetId}`,
      presetId,
      label: binding ? `FN ${binding.label}` : `FN ${presetId}`,
      holdSeconds: 3.6,
      transitionSeconds: 1.24,
      transitionEasing: 'ease-in-out',
      screenSequenceDriveMode: 'inherit',
      screenSequenceDriveStrengthMode: 'inherit',
      screenSequenceDriveStrengthOverride: null as number | null,
      screenSequenceDriveMultiplier: 1.04 + (index % 3) * 0.02,
      keyframeConfig: null as PresetSequenceItem['keyframeConfig'],
    };
  });

export const STARTER_FUTURE_NATIVE_AUGMENTATION: StarterLibraryAugmentation = {
  presets: FUTURE_NATIVE_STARTER_PRESETS,
  presetSequence: FUTURE_NATIVE_STARTER_SEQUENCES,
};
