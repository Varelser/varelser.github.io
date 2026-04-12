import type { ParticleConfig, PresetRecord, PresetSequenceItem, ProjectData, ProjectUiState } from '../types';
import { normalizeConfig } from './appStateConfig';
import {
  DEFAULT_PROJECT_UI,
  PROJECT_DATA_VERSION,
  normalizePresetRecord,
  normalizeSequenceItem,
} from './projectStateShared';
import { buildProjectManifest } from './projectStateManifest';
import { buildProjectSerializationSnapshot } from './projectSerializationSnapshot';
import { buildProjectExportSchema } from './projectStateExportSchema';

export function buildProjectData(input: {
  name?: string;
  config: ParticleConfig;
  activePresetId: string | null;
  presetBlendDuration: number;
  sequenceLoopEnabled: boolean;
  presets: PresetRecord[];
  presetSequence: PresetSequenceItem[];
  ui?: Partial<ProjectUiState>;
}): ProjectData {
  const normalizedConfig = normalizeConfig(input.config);
  const normalizedPresets = input.presets.map(normalizePresetRecord);
  const normalizedSequence = input.presetSequence.map(normalizeSequenceItem);
  const normalizedUi: ProjectUiState = {
    ...DEFAULT_PROJECT_UI,
    ...input.ui,
  };
  const manifest = buildProjectManifest(normalizedConfig, normalizedPresets, normalizedSequence, normalizedUi);
  const schema = buildProjectExportSchema({
    projectDataVersion: PROJECT_DATA_VERSION,
    manifestSchemaVersion: manifest.schemaVersion,
    serializationSchemaVersion: manifest.serializationSchemaVersion,
    migrationState: 'native',
    migratedFromProjectDataVersion: null,
  });
  return {
    version: PROJECT_DATA_VERSION,
    schema,
    exportedAt: new Date().toISOString(),
    name: input.name?.trim() || 'Untitled Project',
    currentConfig: normalizedConfig,
    activePresetId: input.activePresetId,
    presetBlendDuration: Math.max(0.2, input.presetBlendDuration),
    sequenceLoopEnabled: input.sequenceLoopEnabled,
    presets: normalizedPresets,
    presetSequence: normalizedSequence,
    ui: normalizedUi,
    serialization: buildProjectSerializationSnapshot(normalizedConfig, schema.serializationSchemaVersion, normalizedUi),
    manifest,
  };
}
