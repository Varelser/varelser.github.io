import type { PresetLibraryData, PresetRecord, PresetSequenceItem } from '../types';
import { DEFAULT_CONFIG, normalizeConfig } from './appStateConfig';
import { STARTER_TIMESTAMP } from './starterLibraryCore';
import { STARTER_PRESET_BASE } from './starterLibraryPresetBase';
import { STARTER_PRESET_EXTENSIONS } from './starterLibraryPresetExtensions';
import { STARTER_PRESET_SEQUENCE_BASE } from './starterLibrarySequenceBase';
import { STARTER_PRESET_SEQUENCE_EXTENSIONS } from './starterLibrarySequenceExtensions';

function dedupePresetRecords(presets: PresetRecord[]): PresetRecord[] {
  const seen = new Set<string>();
  const deduped: PresetRecord[] = [];
  for (const preset of presets) {
    if (seen.has(preset.id)) continue;
    seen.add(preset.id);
    deduped.push(preset);
  }
  return deduped;
}

function dedupePresetSequence(items: PresetSequenceItem[]): PresetSequenceItem[] {
  const seen = new Set<string>();
  const deduped: PresetSequenceItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }
  return deduped;
}

export const CORE_STARTER_PRESETS = dedupePresetRecords([
  ...STARTER_PRESET_BASE,
  ...STARTER_PRESET_EXTENSIONS,
]);

export const CORE_STARTER_PRESET_SEQUENCE = dedupePresetSequence([
  ...STARTER_PRESET_SEQUENCE_BASE,
  ...STARTER_PRESET_SEQUENCE_EXTENSIONS,
]);

export const CORE_STARTER_PRESET_LIBRARY: PresetLibraryData = {
  version: 1,
  exportedAt: STARTER_TIMESTAMP,
  currentConfig: CORE_STARTER_PRESETS[0]?.config ?? normalizeConfig(DEFAULT_CONFIG),
  activePresetId: CORE_STARTER_PRESETS[0]?.id ?? null,
  presetBlendDuration: 1.4,
  sequenceLoopEnabled: true,
  presets: CORE_STARTER_PRESETS,
  presetSequence: CORE_STARTER_PRESET_SEQUENCE,
};
