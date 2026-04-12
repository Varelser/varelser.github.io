import type { PresetRecord, PresetSequenceItem } from '../types';
import { PRODUCT_PACK_BUNDLES, buildProductPackPatch } from './productPackLibrary';
import { createStarterPreset } from './starterLibraryCore';
import type { StarterLibraryAugmentation } from './starterLibrary';

const PRODUCT_PACK_STARTER_PRESETS: PresetRecord[] = PRODUCT_PACK_BUNDLES.map((bundle) => createStarterPreset(
  `starter-${bundle.id.replace(/^product-pack-/, 'pack-')}`,
  `Pack ${bundle.label}`,
  buildProductPackPatch(bundle.id),
));

const PRODUCT_PACK_STARTER_SEQUENCES: PresetSequenceItem[] = PRODUCT_PACK_BUNDLES.map((bundle) => ({
  id: `starter-sequence-${bundle.id.replace(/^product-pack-/, 'pack-')}`,
  presetId: `starter-${bundle.id.replace(/^product-pack-/, 'pack-')}`,
  label: `Pack ${bundle.label}`,
  holdSeconds: 3.28,
  transitionSeconds: 1.18,
  transitionEasing: 'ease-in-out',
  screenSequenceDriveMode: 'inherit',
  screenSequenceDriveStrengthMode: 'inherit',
  screenSequenceDriveStrengthOverride: null as number | null,
  screenSequenceDriveMultiplier: 1.06,
  keyframeConfig: null as PresetSequenceItem['keyframeConfig'],
}));

export const STARTER_PRODUCT_PACK_AUGMENTATION: StarterLibraryAugmentation = {
  presets: PRODUCT_PACK_STARTER_PRESETS,
  presetSequence: PRODUCT_PACK_STARTER_SEQUENCES,
};
