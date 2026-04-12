import type { ParticleConfig, PresetLibraryData, PresetRecord, PresetSequenceItem } from '../types';
import {
  normalizeConfig,
  normalizeSequenceDriveMode,
  normalizeSequenceDriveMultiplier,
  normalizeSequenceDriveStrengthMode,
  normalizeSequenceDriveStrengthOverride,
  normalizeSequenceTransitionEasing,
} from './appStateConfig';

declare const __LIBRARY_SCOPE__: string | undefined;

export const PRESET_STORAGE_KEY = 'kalokagathia-presets-v2';
const PRESET_STORAGE_KEY_LEGACY = 'monosphere-presets-v1';
export const PRESET_STORAGE_KEYS = [PRESET_STORAGE_KEY, PRESET_STORAGE_KEY_LEGACY] as const;
export const PRESET_SEQUENCE_STORAGE_KEY = 'kalokagathia-preset-sequence-v2';
const PRESET_SEQUENCE_STORAGE_KEY_LEGACY = 'monosphere-preset-sequence-v1';
export const PRESET_SEQUENCE_STORAGE_KEYS = [PRESET_SEQUENCE_STORAGE_KEY, PRESET_SEQUENCE_STORAGE_KEY_LEGACY] as const;
export const PRESET_LIBRARY_VERSION = 1;
export const QUERY_LIBRARY_SCOPE = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('libraryScope')
  : undefined;
export const LIBRARY_SCOPE = (QUERY_LIBRARY_SCOPE ?? __LIBRARY_SCOPE__) === 'public' ? 'public' : 'private';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}


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

function loadFirstLocalStorageValue(keys: readonly string[]) {
  if (typeof window === 'undefined') return null;
  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

export function loadPresetRecords(): PresetRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = loadFirstLocalStorageValue(PRESET_STORAGE_KEYS);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];

    return dedupePresetRecords(parsed
      .filter((item): item is Partial<PresetRecord> & { id: string; name: string } => Boolean(item && typeof item.id === 'string' && typeof item.name === 'string'))
      .map((item) => ({
        id: item.id,
        name: item.name,
        config: normalizeConfig(item.config),
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
        updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
        thumbnailDataUrl: typeof item.thumbnailDataUrl === 'string' ? item.thumbnailDataUrl : null,
      })));
  } catch (error) {
    console.warn('Failed to load presets:', error);
    return [];
  }
}

export function hasPersistedPresetRecords(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const raw = loadFirstLocalStorageValue(PRESET_STORAGE_KEYS);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

export function loadInitialPrivateConfig(): ParticleConfig {
  return normalizeConfig({});
}

export function createPresetId() {
  return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createSequenceItemId() {
  return `sequence-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadPresetSequence(validPresetIds: Set<string>): PresetSequenceItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = loadFirstLocalStorageValue(PRESET_SEQUENCE_STORAGE_KEYS);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }

    return dedupePresetSequence(parsed
      .filter((item): item is Partial<PresetSequenceItem> & { id: string; presetId: string } => (
        Boolean(item && typeof item.id === 'string' && typeof item.presetId === 'string')
      ))
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
      })));
  } catch (error) {
    console.warn('Failed to load preset sequence:', error);
    return [];
  }
}

export function parsePresetLibraryData(payload: unknown): PresetLibraryData | null {
  if (!isPlainObject(payload) || !Array.isArray(payload.presets) || !Array.isArray(payload.presetSequence)) {
    return null;
  }

  const presets = dedupePresetRecords(payload.presets
    .filter((item): item is Partial<PresetRecord> & { id: string; name: string } => Boolean(item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string'))
    .map((item) => ({
      id: item.id,
      name: item.name,
      config: normalizeConfig(item.config),
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
    })));

  const presetIds = new Set(presets.map((preset) => preset.id));
  const presetSequence = dedupePresetSequence(payload.presetSequence
    .filter((item): item is Partial<PresetSequenceItem> & { id: string; presetId: string } => Boolean(item && typeof item === 'object' && typeof item.id === 'string' && typeof item.presetId === 'string'))
    .filter((item) => presetIds.has(item.presetId))
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
    })));

  return {
    version: typeof payload.version === 'number' ? payload.version : PRESET_LIBRARY_VERSION,
    exportedAt: typeof payload.exportedAt === 'string' ? payload.exportedAt : new Date().toISOString(),
    currentConfig: normalizeConfig(payload.currentConfig as Partial<ParticleConfig> | undefined),
    activePresetId: typeof payload.activePresetId === 'string' ? payload.activePresetId : null,
    presetBlendDuration: typeof payload.presetBlendDuration === 'number' ? Math.max(0.2, payload.presetBlendDuration) : 1.5,
    sequenceLoopEnabled: typeof payload.sequenceLoopEnabled === 'boolean' ? payload.sequenceLoopEnabled : true,
    presets,
    presetSequence,
  };
}

export function getFallbackPresetLibraryData(): PresetLibraryData {
  return {
    version: PRESET_LIBRARY_VERSION,
    exportedAt: new Date().toISOString(),
    currentConfig: normalizeConfig({}),
    activePresetId: null,
    presetBlendDuration: 1.5,
    sequenceLoopEnabled: true,
    presets: [],
    presetSequence: [],
  };
}

export const EMPTY_PUBLIC_PRESET_LIBRARY = getFallbackPresetLibraryData();

let publicPresetLibraryPromise: Promise<PresetLibraryData> | null = null;

export async function loadPublicPresetLibraryData(): Promise<PresetLibraryData> {
  if (!publicPresetLibraryPromise) {
    publicPresetLibraryPromise = import('../public-library.json')
      .then((module) => parsePresetLibraryData(module.default) ?? getFallbackPresetLibraryData())
      .catch((error) => {
        console.warn('Failed to load bundled public preset library:', error);
        return getFallbackPresetLibraryData();
      });
  }
  return publicPresetLibraryPromise;
}
