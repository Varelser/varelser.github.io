import type { Layer2Type, ParticleConfig, ProjectFutureNativeVolumetricAuthoringKey } from '../../types';
import { normalizeConfig } from '../appStateConfig';
import { buildFutureNativeScenePresetPatch } from './futureNativeScenePresetPatches';
import {
  getDefaultFutureNativeRecommendedPresetIds,
  getFutureNativeVolumetricRecommendedPresetIds,
} from './futureNativeVolumetricRouteResolvers';
import { getFutureNativeSceneBinding } from './futureNativeSceneBindingData';
import type {
  VolumetricAuthoringEntryBase,
  VolumetricNumericFieldDescriptor,
  VolumetricPresetPreviewBase,
  FutureNativeProjectRouteHighlight,
  VolumetricRouteDefinition,
} from './futureNativeVolumetricRouteTypes';


function getLayerKey(layerIndex: 2 | 3): ProjectFutureNativeVolumetricAuthoringKey {
  return layerIndex === 2 ? 'layer2' : 'layer3';
}

function getLayerMode(config: ParticleConfig, layerIndex: 2 | 3): Layer2Type {
  return layerIndex === 2 ? config.layer2Type : config.layer3Type;
}

function buildPresetConfig(presetId: string, layerIndex: 2 | 3): ParticleConfig {
  return normalizeConfig(buildFutureNativeScenePresetPatch(presetId, layerIndex) ?? {});
}

function getFutureNativeRecommendedPresetIds(
  mode: Layer2Type,
  config: ParticleConfig,
  layerIndex: 2 | 3,
): string[] {
  const volumetricRecommended = getFutureNativeVolumetricRecommendedPresetIds(mode, config, layerIndex);
  if (volumetricRecommended) return volumetricRecommended;
  return getDefaultFutureNativeRecommendedPresetIds(mode);
}

export function formatVolumetricNumericFields<T extends object>(
  snapshot: T,
  fields: readonly VolumetricNumericFieldDescriptor<T>[],
  separator: ':' | '=' = ':',
): string[] {
  return fields.map(({ label, key, digits = 3 }) => `${label}${separator}${Number(snapshot[key]).toFixed(digits)}`);
}

export function buildVolumetricPresetPreview<T extends object>(
  presetId: string,
  layerIndex: 2 | 3,
  snapshotBuilder: (config: ParticleConfig, layerIndex: 2 | 3) => T | null,
  valueFields: readonly VolumetricNumericFieldDescriptor<T>[],
  focusFields: readonly VolumetricNumericFieldDescriptor<T>[],
): VolumetricPresetPreviewBase | null {
  const snapshot = snapshotBuilder(buildPresetConfig(presetId, layerIndex), layerIndex);
  if (!snapshot) return null;
  return {
    presetId,
    values: formatVolumetricNumericFields(snapshot, valueFields),
    focusValues: formatVolumetricNumericFields(snapshot, focusFields),
  };
}

export function buildVolumetricAuthoringEntry<T extends object>(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  modes: readonly string[],
  familyId: string,
  snapshotBuilder: (config: ParticleConfig, layerIndex: 2 | 3) => T | null,
  valueFields: readonly VolumetricNumericFieldDescriptor<T>[],
): VolumetricAuthoringEntryBase | null {
  const mode = getLayerMode(config, layerIndex);
  if (!modes.includes(mode)) return null;
  const binding = getFutureNativeSceneBinding(mode);
  if (!binding || binding.familyId !== familyId) return null;
  const runtimeConfig = snapshotBuilder(config, layerIndex);
  if (!runtimeConfig) return null;
  return {
    key: getLayerKey(layerIndex),
    mode,
    familyId: binding.familyId,
    bindingMode: binding.bindingMode,
    primaryPresetId: binding.primaryPresetId ?? null,
    recommendedPresetIds: getFutureNativeRecommendedPresetIds(mode, config, layerIndex),
    runtimeConfigValues: formatVolumetricNumericFields(runtimeConfig, valueFields),
  };
}

export function buildVolumetricAuthoringState<T>(
  config: ParticleConfig,
  builder: (config: ParticleConfig, layerIndex: 2 | 3) => T | null,
): T[] {
  return [builder(config, 2), builder(config, 3)].filter((entry): entry is T => entry !== null);
}

export function buildVolumetricRouteHighlight<T extends object>(
  familyId: string,
  definitions: readonly VolumetricRouteDefinition[],
  runtimeBuilder: (config: ParticleConfig, layerIndex: 2 | 3) => T,
  fields: readonly VolumetricNumericFieldDescriptor<T>[],
  layerIndex: 2 | 3 = 2,
): FutureNativeProjectRouteHighlight {
  const runtimes = definitions.map((definition) => runtimeBuilder(buildPresetConfig(definition.presetId, layerIndex), layerIndex));
  const profiles = definitions.map((definition, index) => ({
    routeId: definition.routeId,
    presetId: definition.presetId,
    mode: definition.mode,
    valueLines: formatVolumetricNumericFields(runtimes[index], fields, '='),
  }));
  const [primaryRuntime, secondaryRuntime] = runtimes;
  return {
    familyId,
    profiles,
    deltaLines: fields.map(({ label, key, digits = 3 }) => `${label}=${Number((Number(primaryRuntime[key]) - Number(secondaryRuntime[key])).toFixed(digits))}`),
  };
}
