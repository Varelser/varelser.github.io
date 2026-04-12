import type { ParticleConfig, PresetRecord, PresetSequenceItem, ProjectData, ProjectUiState } from '../types';
import {
  normalizeConfig,
  normalizeSequenceDriveMode,
  normalizeSequenceDriveMultiplier,
  normalizeSequenceDriveStrengthMode,
  normalizeSequenceDriveStrengthOverride,
  normalizeSequenceTransitionEasing,
} from './appStateConfig';
import {
  DEFAULT_PROJECT_UI,
  PROJECT_DATA_VERSION,
  PROJECT_FORMAT_ID,
  PROJECT_SERIALIZATION_SCHEMA_VERSION,
  PROJECT_STORAGE_KEY,
  PROJECT_STORAGE_KEY_FALLBACKS,
  isPlainObject,
  normalizePresetRecord,
  normalizeSequenceItem,
  dedupePresetRecords,
  dedupePresetSequenceItems,
} from './projectStateShared';
import { normalizeProjectManifest } from './projectStateManifest';
import { buildProjectSerializationSnapshot, normalizeProjectSerializationSnapshot } from './projectSerializationSnapshot';
import {
  parseProjectFutureNativeSpecialistPackets,
  parseProjectFutureNativeSpecialistRouteControls,
} from './future-native-families/futureNativeFamiliesSpecialistProjectState';
import { buildProjectExportSchema, isKnownProjectFormatId } from './projectStateExportSchema';
import { buildProjectData } from './projectStateData';
import {
  buildProjectFutureNativeVolumetricAuthoringStateSet,
} from './future-native-families/futureNativeSmokeAuthoring';
import {
  buildEmptyProjectFutureNativeSpecialistRouteControls,
  buildProjectFutureNativeSpecialistPacketEntries,
} from './future-native-families/futureNativeFamiliesSpecialistPackets';


const PRESET_STORAGE_KEY = 'kalokagathia-presets-v2';
const PRESET_STORAGE_KEY_FALLBACKS = [PRESET_STORAGE_KEY, 'monosphere-presets-v1'] as const;
const PRESET_SEQUENCE_STORAGE_KEY = 'kalokagathia-preset-sequence-v2';
const PRESET_SEQUENCE_STORAGE_KEY_FALLBACKS = [PRESET_SEQUENCE_STORAGE_KEY, 'monosphere-preset-sequence-v1'] as const;
const PROJECT_STORAGE_MODE_RECOVERY_CORE = 'recovery-core';

interface RecoveryCoreProjectPayload {
  storageMode: typeof PROJECT_STORAGE_MODE_RECOVERY_CORE;
  exportedAt?: string;
  name?: string;
  currentConfig?: Partial<ParticleConfig>;
  activePresetId?: string | null;
  presetBlendDuration?: number;
  sequenceLoopEnabled?: boolean;
  ui?: Partial<ProjectUiState>;
}

function loadFirstLocalStorageValue(keys: readonly string[]) {
  if (typeof window === 'undefined') return null;
  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}


function loadPersistedPresetRecords(): PresetRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = loadFirstLocalStorageValue(PRESET_STORAGE_KEY_FALLBACKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return dedupePresetRecords(
      parsed
        .filter((item): item is Partial<PresetRecord> & { id: string; name: string } => Boolean(item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string'))
        .map(normalizePresetRecord),
    );
  } catch (error) {
    console.warn('Failed to load presets for project recovery:', error);
    return [];
  }
}

function loadPersistedPresetSequence(validPresetIds: Set<string>): PresetSequenceItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = loadFirstLocalStorageValue(PRESET_SEQUENCE_STORAGE_KEY_FALLBACKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return dedupePresetSequenceItems(
      parsed
        .filter((item): item is Partial<PresetSequenceItem> & { id: string; presetId: string } => Boolean(item && typeof item === 'object' && typeof item.id === 'string' && typeof item.presetId === 'string'))
        .filter((item) => validPresetIds.has(item.presetId))
        .map((item) => ({
          id: item.id,
          presetId: item.presetId,
          label: typeof item.label === 'string' && item.label.trim().length > 0 ? item.label : 'Keyframe',
          holdSeconds: typeof item.holdSeconds === 'number' ? Math.max(0.2, item.holdSeconds) : 2,
          transitionSeconds: typeof item.transitionSeconds === 'number' ? Math.max(0.05, item.transitionSeconds) : 1.5,
          transitionEasing: normalizeSequenceTransitionEasing(item.transitionEasing),
          screenSequenceDriveMode: normalizeSequenceDriveMode(item.screenSequenceDriveMode),
          screenSequenceDriveStrengthMode: normalizeSequenceDriveStrengthMode(item.screenSequenceDriveStrengthMode),
          screenSequenceDriveStrengthOverride: normalizeSequenceDriveStrengthOverride(item.screenSequenceDriveStrengthOverride),
          screenSequenceDriveMultiplier: normalizeSequenceDriveMultiplier(item.screenSequenceDriveMultiplier),
          keyframeConfig: item.keyframeConfig ? normalizeConfig(item.keyframeConfig) : null,
        })),
    );
  } catch (error) {
    console.warn('Failed to load preset sequence for project recovery:', error);
    return [];
  }
}

function normalizeProjectFutureNativeVolumetricAuthoringEntries(
  value: unknown,
  fallback: ProjectUiState[keyof Pick<ProjectUiState, 'futureNativeSmokeAuthoring' | 'futureNativeAdvectionAuthoring' | 'futureNativePressureAuthoring' | 'futureNativeLightShadowAuthoring'>],
) {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .filter((item) => (item.key === 'layer2' || item.key === 'layer3')
      && typeof item.mode === 'string'
      && typeof item.familyId === 'string'
      && typeof item.bindingMode === 'string')
    .map((item) => ({
      key: item.key as 'layer2' | 'layer3',
      mode: item.mode as string,
      familyId: item.familyId as string,
      bindingMode: item.bindingMode as string,
      primaryPresetId: typeof item.primaryPresetId === 'string' ? item.primaryPresetId : null,
      recommendedPresetIds: Array.isArray(item.recommendedPresetIds) ? item.recommendedPresetIds.filter((entry): entry is string => typeof entry === 'string') : [],
      runtimeConfigValues: Array.isArray(item.runtimeConfigValues) ? item.runtimeConfigValues.filter((entry): entry is string => typeof entry === 'string') : [],
    }));
}

function isQuotaExceededError(error: unknown) {
  if (!(error instanceof DOMException)) return false;
  return error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code == 22 || error.code == 1014;
}

function buildRecoveryCoreProjectData(project: ProjectData): RecoveryCoreProjectPayload {
  return {
    storageMode: PROJECT_STORAGE_MODE_RECOVERY_CORE,
    exportedAt: project.exportedAt,
    name: project.name,
    currentConfig: project.currentConfig,
    activePresetId: project.activePresetId,
    presetBlendDuration: project.presetBlendDuration,
    sequenceLoopEnabled: project.sequenceLoopEnabled,
    ui: {
      isPlaying: project.ui.isPlaying,
      isPanelOpen: project.ui.isPanelOpen,
      videoExportMode: project.ui.videoExportMode,
      videoDurationSeconds: project.ui.videoDurationSeconds,
      videoFps: project.ui.videoFps,
      futureNativeSmokeAuthoring: project.ui.futureNativeSmokeAuthoring,
      futureNativeAdvectionAuthoring: project.ui.futureNativeAdvectionAuthoring,
      futureNativePressureAuthoring: project.ui.futureNativePressureAuthoring,
      futureNativeLightShadowAuthoring: project.ui.futureNativeLightShadowAuthoring,
      futureNativeSpecialistRouteControls: project.ui.futureNativeSpecialistRouteControls,
      futureNativeSpecialistPackets: project.ui.futureNativeSpecialistPackets,
    },
  };
}

function parseStoredProjectData(payload: unknown): ProjectData | null {
  if (isPlainObject(payload) && payload.storageMode === PROJECT_STORAGE_MODE_RECOVERY_CORE) {
    const recoveryPayload = payload as unknown as RecoveryCoreProjectPayload;
    const presets = loadPersistedPresetRecords();
    const presetIds = new Set(presets.map((preset) => preset.id));
    const presetSequence = loadPersistedPresetSequence(presetIds);
    const activePresetId = typeof recoveryPayload.activePresetId === 'string' && presetIds.has(recoveryPayload.activePresetId)
      ? recoveryPayload.activePresetId
      : null;
    return buildProjectData({
      name: typeof recoveryPayload.name === 'string' ? recoveryPayload.name : 'Recovered Project',
      config: normalizeConfig(recoveryPayload.currentConfig),
      activePresetId,
      presetBlendDuration: typeof recoveryPayload.presetBlendDuration === 'number' ? recoveryPayload.presetBlendDuration : 1.5,
      sequenceLoopEnabled: typeof recoveryPayload.sequenceLoopEnabled === 'boolean' ? recoveryPayload.sequenceLoopEnabled : true,
      presets,
      presetSequence,
      ui: isPlainObject(recoveryPayload.ui) ? recoveryPayload.ui : DEFAULT_PROJECT_UI,
    });
  }

  return parseProjectData(payload);
}

export function parseProjectData(payload: unknown): ProjectData | null {
  if (!isPlainObject(payload) || !Array.isArray(payload.presets) || !Array.isArray(payload.presetSequence)) {
    return null;
  }

  const projectPayload = payload as Record<string, unknown>;

  const presets = dedupePresetRecords((projectPayload.presets as unknown[])
    .filter((item): item is Partial<PresetRecord> & { id: string; name: string } => Boolean(item && typeof item === 'object' && typeof (item as any).id === 'string' && typeof (item as any).name === 'string'))
    .map(normalizePresetRecord));

  const presetIds = new Set(presets.map((preset) => preset.id));
  const presetSequence = dedupePresetSequenceItems((projectPayload.presetSequence as unknown[])
    .filter((item): item is Partial<PresetSequenceItem> & { id: string; presetId: string } => Boolean(item && typeof item === 'object' && typeof (item as any).presetId === 'string'))
    .map(normalizeSequenceItem)
    .filter((item) => presetIds.has(item.presetId)));

  const currentConfig = normalizeConfig(projectPayload.currentConfig as Partial<ParticleConfig> | undefined);
  const uiPayload = isPlainObject(projectPayload.ui) ? projectPayload.ui : {};
  const fallbackVolumetricAuthoring = buildProjectFutureNativeVolumetricAuthoringStateSet(currentConfig);
  const fallbackSpecialistPackets = buildProjectFutureNativeSpecialistPacketEntries();
  const fallbackSpecialistRouteControls = buildEmptyProjectFutureNativeSpecialistRouteControls();
  const ui: ProjectUiState = {
    isPlaying: typeof uiPayload.isPlaying === 'boolean' ? uiPayload.isPlaying : DEFAULT_PROJECT_UI.isPlaying,
    isPanelOpen: typeof uiPayload.isPanelOpen === 'boolean' ? uiPayload.isPanelOpen : DEFAULT_PROJECT_UI.isPanelOpen,
    videoExportMode: uiPayload.videoExportMode === 'current' ? 'current' : DEFAULT_PROJECT_UI.videoExportMode,
    videoDurationSeconds: typeof uiPayload.videoDurationSeconds === 'number' ? Math.max(1, uiPayload.videoDurationSeconds) : DEFAULT_PROJECT_UI.videoDurationSeconds,
    videoFps: typeof uiPayload.videoFps === 'number' ? Math.max(12, Math.min(60, uiPayload.videoFps)) : DEFAULT_PROJECT_UI.videoFps,
    futureNativeSmokeAuthoring: normalizeProjectFutureNativeVolumetricAuthoringEntries(uiPayload.futureNativeSmokeAuthoring, fallbackVolumetricAuthoring.futureNativeSmokeAuthoring),
    futureNativeAdvectionAuthoring: normalizeProjectFutureNativeVolumetricAuthoringEntries(uiPayload.futureNativeAdvectionAuthoring, fallbackVolumetricAuthoring.futureNativeAdvectionAuthoring),
    futureNativePressureAuthoring: normalizeProjectFutureNativeVolumetricAuthoringEntries(uiPayload.futureNativePressureAuthoring, fallbackVolumetricAuthoring.futureNativePressureAuthoring),
    futureNativeLightShadowAuthoring: normalizeProjectFutureNativeVolumetricAuthoringEntries(uiPayload.futureNativeLightShadowAuthoring, fallbackVolumetricAuthoring.futureNativeLightShadowAuthoring),
    futureNativeSpecialistPackets: parseProjectFutureNativeSpecialistPackets(
      uiPayload.futureNativeSpecialistPackets,
      fallbackSpecialistPackets,
    ),
    futureNativeSpecialistRouteControls: parseProjectFutureNativeSpecialistRouteControls(
      uiPayload.futureNativeSpecialistRouteControls,
      fallbackSpecialistRouteControls,
    ),
  };
  const manifest = normalizeProjectManifest(projectPayload.manifest, currentConfig, presets, presetSequence, ui);
  const existingVersion = typeof projectPayload.version === 'number' ? projectPayload.version : null;
  const schemaPayload = isPlainObject(projectPayload.schema) ? projectPayload.schema : null;
  const schemaFormat = isKnownProjectFormatId(schemaPayload?.format) ? schemaPayload.format : null;
  const schema = buildProjectExportSchema({
    projectDataVersion: typeof schemaPayload?.projectDataVersion === 'number' ? schemaPayload.projectDataVersion : (existingVersion ?? PROJECT_DATA_VERSION),
    manifestSchemaVersion: typeof schemaPayload?.manifestSchemaVersion === 'number' ? schemaPayload.manifestSchemaVersion : manifest.schemaVersion,
    serializationSchemaVersion: typeof schemaPayload?.serializationSchemaVersion === 'number' ? schemaPayload.serializationSchemaVersion : (typeof manifest.serializationSchemaVersion === 'number' ? manifest.serializationSchemaVersion : PROJECT_SERIALIZATION_SCHEMA_VERSION),
    migrationState: schemaFormat === PROJECT_FORMAT_ID && existingVersion === PROJECT_DATA_VERSION ? 'native' : 'migrated',
    migratedFromProjectDataVersion: schemaFormat === PROJECT_FORMAT_ID && existingVersion === PROJECT_DATA_VERSION ? null : existingVersion,
  });

  const serialization = normalizeProjectSerializationSnapshot(
    projectPayload.serialization,
    currentConfig,
    schema.serializationSchemaVersion,
    ui,
  );

  return {
    version: schema.projectDataVersion,
    schema,
    exportedAt: typeof projectPayload.exportedAt === 'string' ? projectPayload.exportedAt : new Date().toISOString(),
    name: typeof projectPayload.name === 'string' && projectPayload.name.trim().length > 0 ? projectPayload.name.trim() : 'Untitled Project',
    currentConfig,
    activePresetId: typeof projectPayload.activePresetId === 'string' ? projectPayload.activePresetId : null,
    presetBlendDuration: typeof projectPayload.presetBlendDuration === 'number' ? Math.max(0.2, projectPayload.presetBlendDuration) : 1.5,
    sequenceLoopEnabled: typeof projectPayload.sequenceLoopEnabled === 'boolean' ? projectPayload.sequenceLoopEnabled : true,
    presets,
    presetSequence,
    ui,
    serialization,
    manifest,
  };
}

export function loadProjectData(): ProjectData | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = loadFirstLocalStorageValue(PROJECT_STORAGE_KEY_FALLBACKS);
    if (raw) {
      const parsed = parseStoredProjectData(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch (error) {
    console.warn('Failed to load project snapshot:', error);
  }

  try {
    const presets = loadPersistedPresetRecords();
    const presetIds = new Set(presets.map((preset) => preset.id));
    const presetSequence = loadPersistedPresetSequence(presetIds);
    return buildProjectData({
      name: 'Recovered Project',
      config: normalizeConfig({}),
      activePresetId: null,
      presetBlendDuration: 1.5,
      sequenceLoopEnabled: true,
      presets,
      presetSequence,
      ui: DEFAULT_PROJECT_UI,
    });
  } catch (error) {
    console.warn('Failed to build legacy project snapshot:', error);
    return null;
  }
}

function buildPersistableProjectData(project: ProjectData): Record<string, unknown> {
  return {
    version: project.version,
    schema: project.schema,
    exportedAt: project.exportedAt,
    name: project.name,
    currentConfig: project.currentConfig,
    activePresetId: project.activePresetId,
    presetBlendDuration: project.presetBlendDuration,
    sequenceLoopEnabled: project.sequenceLoopEnabled,
    presets: dedupePresetRecords(project.presets),
    presetSequence: dedupePresetSequenceItems(project.presetSequence),
    ui: {
      isPlaying: project.ui.isPlaying,
      isPanelOpen: project.ui.isPanelOpen,
      videoExportMode: project.ui.videoExportMode,
      videoDurationSeconds: project.ui.videoDurationSeconds,
      videoFps: project.ui.videoFps,
      futureNativeSmokeAuthoring: project.ui.futureNativeSmokeAuthoring,
      futureNativeAdvectionAuthoring: project.ui.futureNativeAdvectionAuthoring,
      futureNativePressureAuthoring: project.ui.futureNativePressureAuthoring,
      futureNativeLightShadowAuthoring: project.ui.futureNativeLightShadowAuthoring,
      futureNativeSpecialistRouteControls: project.ui.futureNativeSpecialistRouteControls,
    },
  };
}

export function saveProjectData(project: ProjectData) {
  if (typeof window === 'undefined') return;
  const storage = window.localStorage;
  const payload = JSON.stringify(buildPersistableProjectData(project));

  try {
    storage.setItem(PROJECT_STORAGE_KEY, payload);
    return;
  } catch (error) {
    if (!isQuotaExceededError(error)) {
      console.warn('Failed to persist project snapshot:', error);
      return;
    }

    try {
      const recoveryPayload = JSON.stringify(buildRecoveryCoreProjectData(project));
      storage.setItem(PROJECT_STORAGE_KEY, recoveryPayload);
      console.warn('Project snapshot exceeded localStorage quota; saved recovery-core snapshot instead.', {
        fullBytes: payload.length,
        recoveryBytes: recoveryPayload.length,
      });
      return;
    } catch (recoveryError) {
      console.warn('Failed to persist project snapshot after recovery-core fallback:', {
        error,
        recoveryError,
      });
    }
  }
}
