import type { ParticleConfig } from '../../types';
import { buildVolumetricPresetPreview } from './futureNativeVolumetricAuthoringShared';
import {
  type VolumetricCurrentTuningKey,
  type VolumetricOverrideEnabledKey,
  type VolumetricPresetPreviewKey,
  getVolumetricFamilyUiSpecByFamilyId,
  getVolumetricFamilyUiSpecs,
  getVolumetricRouteHighlightSpec,
} from './futureNativeVolumetricFamilyMetadata';

export type FutureNativeVolumetricCurrentTuningSet = Record<VolumetricCurrentTuningKey, Record<string, number> | null>;

export type FutureNativeVolumetricPresetPreviewEntry = {
  presetId: string;
  values: string[];
  focusValues: string[];
};

export type FutureNativeVolumetricPresetPreviewSet = Record<VolumetricPresetPreviewKey, FutureNativeVolumetricPresetPreviewEntry[]>;

export type FutureNativeVolumetricOverrideEnabledSet = Record<VolumetricOverrideEnabledKey, boolean>;

function getLayerMode(config: ParticleConfig, layerIndex: 2 | 3): string {
  return layerIndex === 2 ? config.layer2Type : config.layer3Type;
}

export function buildVolumetricRuntimeTuningSnapshotFromSpec(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  familyId: 'volumetric-smoke' | 'volumetric-advection' | 'volumetric-pressure-coupling' | 'volumetric-light-shadow-coupling',
): Record<string, number> | null {
  const spec = getVolumetricFamilyUiSpecByFamilyId(familyId);
  if (!spec.modes.includes(getLayerMode(config, layerIndex))) return null;
  return getVolumetricRouteHighlightSpec(familyId).buildRuntimeConfig(config, layerIndex) as unknown as Record<string, number>;
}

export function buildVolumetricPresetPreviewFromSpec(
  presetId: string,
  layerIndex: 2 | 3,
  familyId: 'volumetric-smoke' | 'volumetric-advection' | 'volumetric-pressure-coupling' | 'volumetric-light-shadow-coupling',
) {
  const spec = getVolumetricFamilyUiSpecByFamilyId(familyId);
  return buildVolumetricPresetPreview(
    presetId,
    layerIndex,
    (config, nextLayerIndex) => buildVolumetricRuntimeTuningSnapshotFromSpec(config, nextLayerIndex, familyId),
    spec.runtimeValueFields,
    spec.runtimeFocusFields,
  );
}

export function buildEmptyFutureNativeVolumetricCurrentTuningSet(): FutureNativeVolumetricCurrentTuningSet {
  const empty = {} as FutureNativeVolumetricCurrentTuningSet;
  for (const spec of getVolumetricFamilyUiSpecs()) {
    empty[spec.currentTuningKey as VolumetricCurrentTuningKey] = null;
  }
  return empty;
}

export function buildEmptyFutureNativeVolumetricPresetPreviewSet(): FutureNativeVolumetricPresetPreviewSet {
  const empty = {} as FutureNativeVolumetricPresetPreviewSet;
  for (const spec of getVolumetricFamilyUiSpecs()) {
    empty[spec.presetPreviewKey as VolumetricPresetPreviewKey] = [];
  }
  return empty;
}

export function buildFutureNativeVolumetricOverrideEnabledSet(
  config: ParticleConfig,
  layerIndex: 2 | 3,
): FutureNativeVolumetricOverrideEnabledSet {
  const overrideSet = {} as FutureNativeVolumetricOverrideEnabledSet;
  for (const spec of getVolumetricFamilyUiSpecs()) {
    overrideSet[spec.overrideEnabledKey as VolumetricOverrideEnabledKey] = spec.isOverrideEnabled(config, layerIndex);
  }
  return overrideSet;
}

export function buildEmptyFutureNativeVolumetricOverrideEnabledSet(): FutureNativeVolumetricOverrideEnabledSet {
  const overrideSet = {} as FutureNativeVolumetricOverrideEnabledSet;
  for (const spec of getVolumetricFamilyUiSpecs()) {
    overrideSet[spec.overrideEnabledKey as VolumetricOverrideEnabledKey] = false;
  }
  return overrideSet;
}
