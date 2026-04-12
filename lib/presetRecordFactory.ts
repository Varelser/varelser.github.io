import type { ParticleConfig, PresetRecord } from '../types';
import { createPresetId, normalizeConfig } from './appState';

export function createPresetRecord(
  config: ParticleConfig,
  name: string,
  presetCount: number,
  thumbnailDataUrl: string | null = null,
) {
  const trimmedName = name.trim() || `Preset ${presetCount + 1}`;
  const now = new Date().toISOString();

  const preset: PresetRecord = {
    id: createPresetId(),
    name: trimmedName,
    config: normalizeConfig(config),
    createdAt: now,
    updatedAt: now,
    thumbnailDataUrl,
  };

  return preset;
}

export function duplicatePresetRecord(sourcePreset: PresetRecord) {
  const now = new Date().toISOString();

  const duplicate: PresetRecord = {
    id: createPresetId(),
    name: `${sourcePreset.name} Copy`,
    config: normalizeConfig(sourcePreset.config),
    createdAt: now,
    updatedAt: now,
    thumbnailDataUrl: sourcePreset.thumbnailDataUrl ?? null,
  };

  return duplicate;
}
