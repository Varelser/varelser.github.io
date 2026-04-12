import type { PresetRecord } from '../types';
import {
  FUTURE_NATIVE_SCENE_BINDINGS,
  FUTURE_NATIVE_SCENE_PRESET_BINDINGS,
  type FutureNativeSceneBinding,
  type FutureNativeScenePresetBinding,
} from './future-native-families/futureNativeSceneBindingData';
import {
  futureNativeFamilySpecs,
  getFutureNativeFamilySpec,
} from './future-native-families/futureNativeFamiliesRegistry';
import type { FutureNativeFamilyId, FutureNativeFamilyGroup } from './future-native-families/futureNativeFamiliesTypes';
import { buildFutureNativeMpmFamilyPreview } from './future-native-families/futureNativeMpmFamilyPreview';
import { buildFutureNativePbdFamilyPreview } from './future-native-families/futureNativePbdFamilyPreview';
import { buildFutureNativeFractureFamilyPreview } from './future-native-families/futureNativeFractureFamilyPreview';
import { buildFutureNativeVolumetricFamilyPreview } from './future-native-families/futureNativeVolumetricFamilyPreview';
import { buildFutureNativeSpecialistUiPreview } from './futureNativeSpecialistUiPreview';

export type FutureNativeUiExposureStatus =
  | 'scene-bound'
  | 'preset-only'
  | 'specialist-preview'
  | 'report-only';

export interface FutureNativeFamilyCatalogEntry {
  familyId: FutureNativeFamilyId;
  group: FutureNativeFamilyGroup;
  title: string;
  summary: string;
  stage: string;
  targetBehaviors: string[];
  sceneBindings: FutureNativeSceneBinding[];
  presetBindings: FutureNativeScenePresetBinding[];
  bindingModes: string[];
  routeCount: number;
  presetCount: number;
  representativePresetId: string | null;
  representativePreset: PresetRecord | null;
  uiExposureStatus: FutureNativeUiExposureStatus;
  uiExposureLabel: string;
  supportsDirectSceneActivation: boolean;
}

function unique<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}


function isMpmFamilyId(familyId: FutureNativeFamilyId): familyId is Parameters<typeof buildFutureNativeMpmFamilyPreview>[0] {
  return familyId.startsWith('mpm-');
}

function isPbdFamilyId(familyId: FutureNativeFamilyId): familyId is Parameters<typeof buildFutureNativePbdFamilyPreview>[0] {
  return familyId.startsWith('pbd-');
}

function isFractureFamilyId(familyId: FutureNativeFamilyId): familyId is Parameters<typeof buildFutureNativeFractureFamilyPreview>[0] {
  return familyId.startsWith('fracture-');
}

function isVolumetricFamilyId(familyId: FutureNativeFamilyId): familyId is Parameters<typeof buildFutureNativeVolumetricFamilyPreview>[0] {
  return familyId.startsWith('volumetric-');
}

function isSpecialistFamilyId(familyId: FutureNativeFamilyId): familyId is Parameters<typeof buildFutureNativeSpecialistUiPreview>[0] {
  return familyId.startsWith('specialist-');
}

function buildSceneBindingsByFamilyId() {
  return FUTURE_NATIVE_SCENE_BINDINGS.reduce<Record<string, FutureNativeSceneBinding[]>>((acc, binding) => {
    (acc[binding.familyId] ??= []).push(binding);
    return acc;
  }, {});
}

function buildPresetBindingsByFamilyId() {
  return FUTURE_NATIVE_SCENE_PRESET_BINDINGS.reduce<Record<string, FutureNativeScenePresetBinding[]>>((acc, binding) => {
    (acc[binding.familyId] ??= []).push(binding);
    return acc;
  }, {});
}

function getRepresentativePresetIdFromPreview(familyId: FutureNativeFamilyId): string | null {
  if (isMpmFamilyId(familyId)) {
    return buildFutureNativeMpmFamilyPreview(familyId).primaryPresetIds[0] ?? null;
  }
  if (isPbdFamilyId(familyId)) {
    return buildFutureNativePbdFamilyPreview(familyId).primaryPresetIds[0] ?? null;
  }
  if (isFractureFamilyId(familyId)) {
    return buildFutureNativeFractureFamilyPreview(familyId).primaryPresetIds[0] ?? null;
  }
  if (isVolumetricFamilyId(familyId)) {
    const preview = buildFutureNativeVolumetricFamilyPreview(familyId);
    const previewPreset = preview.previewSignature.find((value) => value.startsWith('preset:'));
    return previewPreset ? previewPreset.replace(/^preset:/, '') : null;
  }
  return null;
}

function getRouteAndPresetCounts(familyId: FutureNativeFamilyId) {
  if (isMpmFamilyId(familyId)) {
    const preview = buildFutureNativeMpmFamilyPreview(familyId);
    return {
      routeCount: preview.routeCount,
      presetCount: preview.presetCount,
      bindingModes: preview.bindingModes,
    };
  }
  if (isPbdFamilyId(familyId)) {
    const preview = buildFutureNativePbdFamilyPreview(familyId);
    return {
      routeCount: preview.routeCount,
      presetCount: preview.presetCount,
      bindingModes: preview.bindingModes,
    };
  }
  if (isFractureFamilyId(familyId)) {
    const preview = buildFutureNativeFractureFamilyPreview(familyId);
    return {
      routeCount: preview.routeCount,
      presetCount: preview.presetCount,
      bindingModes: preview.bindingModes,
    };
  }
  if (isVolumetricFamilyId(familyId)) {
    const preview = buildFutureNativeVolumetricFamilyPreview(familyId);
    return {
      routeCount: preview.routeCount,
      presetCount: preview.presetCount,
      bindingModes: ['native-volume'],
    };
  }
  if (!isSpecialistFamilyId(familyId)) {
    return { routeCount: 0, presetCount: 0, bindingModes: [] };
  }
  const specialistPreview = buildFutureNativeSpecialistUiPreview(familyId);
  return {
    routeCount: 1,
    presetCount: 0,
    bindingModes: [specialistPreview.executionTarget],
  };
}

function getUiExposureStatus(
  familyId: FutureNativeFamilyId,
  sceneBindings: FutureNativeSceneBinding[],
  representativePresetId: string | null,
): { status: FutureNativeUiExposureStatus; label: string } {
  if (sceneBindings.length > 0) {
    return { status: 'scene-bound', label: 'Scene + preset' };
  }
  if (familyId.startsWith('specialist-')) {
    return { status: 'specialist-preview', label: 'Specialist preview' };
  }
  if (representativePresetId) {
    return { status: 'preset-only', label: 'Preset / preview only' };
  }
  return { status: 'report-only', label: 'Report only' };
}

export function buildFutureNativeFamilyCatalog(presets: PresetRecord[]): FutureNativeFamilyCatalogEntry[] {
  const presetById = new Map(presets.map((preset) => [preset.id, preset]));
  const sceneBindingsByFamilyId = buildSceneBindingsByFamilyId();
  const presetBindingsByFamilyId = buildPresetBindingsByFamilyId();

  return futureNativeFamilySpecs.map((spec) => {
    const sceneBindings = sceneBindingsByFamilyId[spec.id] ?? [];
    const presetBindings = presetBindingsByFamilyId[spec.id] ?? [];
    const representativePresetId = presetBindings[0]?.id ?? getRepresentativePresetIdFromPreview(spec.id);
    const { routeCount, presetCount, bindingModes } = getRouteAndPresetCounts(spec.id);
    const exposure = getUiExposureStatus(spec.id, sceneBindings, representativePresetId);
    return {
      familyId: spec.id,
      group: spec.group,
      title: spec.title,
      summary: spec.summary,
      stage: spec.stage,
      targetBehaviors: [...spec.targetBehaviors],
      sceneBindings,
      presetBindings,
      bindingModes: unique([...sceneBindings.map((binding) => binding.bindingMode), ...bindingModes]),
      routeCount,
      presetCount,
      representativePresetId,
      representativePreset: representativePresetId ? presetById.get(representativePresetId) ?? null : null,
      uiExposureStatus: exposure.status,
      uiExposureLabel: exposure.label,
      supportsDirectSceneActivation: sceneBindings.length > 0,
    };
  });
}

export function getFutureNativeFamilyCatalogEntry(
  familyId: FutureNativeFamilyId,
  presets: PresetRecord[],
): FutureNativeFamilyCatalogEntry {
  return buildFutureNativeFamilyCatalog(presets).find((entry) => entry.familyId === familyId)
    ?? (() => {
      const spec = getFutureNativeFamilySpec(familyId);
      throw new Error(`Future-native family catalog entry missing: ${spec.id}`);
    })();
}
