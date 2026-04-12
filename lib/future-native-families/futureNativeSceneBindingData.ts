import type { Layer2Type } from '../../types';
import { nonVolumetricBindingRegistrationSpecs } from './futureNativeNonVolumetricBindingMetadata';
import { volumetricBindingRegistrationSpecs } from './futureNativeVolumetricBindingMetadata';

export type FutureNativeSceneBoundFamilyId =
  | 'pbd-cloth'
  | 'pbd-membrane'
  | 'pbd-softbody'
  | 'pbd-rope'
  | 'mpm-granular'
  | 'mpm-viscoplastic'
  | 'mpm-snow'
  | 'mpm-mud'
  | 'mpm-paste'
  | 'fracture-lattice'
  | 'fracture-voxel'
  | 'fracture-crack-propagation'
  | 'fracture-debris-generation'
  | 'volumetric-smoke'
  | 'volumetric-advection'
  | 'volumetric-pressure-coupling'
  | 'volumetric-light-shadow-coupling'
  | 'volumetric-density-transport';

export type FutureNativeSceneBindingMode =
  | 'direct-preview'
  | 'proxy-preview'
  | 'native-surface'
  | 'native-particles'
  | 'native-structure'
  | 'native-volume';

export interface FutureNativeSceneBinding {
  modeId: Layer2Type;
  familyId: FutureNativeSceneBoundFamilyId;
  bindingMode: FutureNativeSceneBindingMode;
  routeTag: string;
  primaryPresetId: string;
  title: string;
  summary: string;
}

export interface FutureNativeScenePresetBinding {
  id: string;
  modeId: Layer2Type;
  familyId: FutureNativeSceneBoundFamilyId;
  bindingMode: FutureNativeSceneBindingMode;
  label: string;
  description: string;
}

const binding = (
  modeId: Layer2Type,
  familyId: FutureNativeSceneBoundFamilyId,
  bindingMode: FutureNativeSceneBindingMode,
  routeTag: string,
  primaryPresetId: string,
  title: string,
  summary: string,
): FutureNativeSceneBinding => ({ modeId, familyId, bindingMode, routeTag, primaryPresetId, title, summary });

const preset = (
  id: string,
  modeId: Layer2Type,
  familyId: FutureNativeSceneBoundFamilyId,
  bindingMode: FutureNativeSceneBindingMode,
  label: string,
  description: string,
): FutureNativeScenePresetBinding => ({ id, modeId, familyId, bindingMode, label, description });

function buildSceneBindings<
  TRegistration extends {
    modeId: Layer2Type;
    familyId: FutureNativeSceneBoundFamilyId;
    bindingMode: FutureNativeSceneBindingMode;
    routeTag: string;
    primaryPresetId: string;
    title: string;
    summary: string;
  },
>(registrations: readonly TRegistration[]): FutureNativeSceneBinding[] {
  return registrations.map((registration) =>
    binding(
      registration.modeId,
      registration.familyId,
      registration.bindingMode,
      registration.routeTag,
      registration.primaryPresetId,
      registration.title,
      registration.summary,
    ),
  );
}

function buildScenePresetBindings<
  TRegistration extends {
    modeId: Layer2Type;
    familyId: FutureNativeSceneBoundFamilyId;
    bindingMode: FutureNativeSceneBindingMode;
    presets: readonly {
      id: string;
      label: string;
      description: string;
    }[];
  },
>(registrations: readonly TRegistration[]): FutureNativeScenePresetBinding[] {
  return registrations.flatMap((registration) =>
    registration.presets.map((presetEntry) =>
      preset(
        presetEntry.id,
        registration.modeId,
        registration.familyId,
        registration.bindingMode,
        presetEntry.label,
        presetEntry.description,
      ),
    ),
  );
}

export const FUTURE_NATIVE_SCENE_BINDINGS = [
  ...buildSceneBindings(nonVolumetricBindingRegistrationSpecs),
  ...buildSceneBindings(volumetricBindingRegistrationSpecs),
] as const satisfies readonly FutureNativeSceneBinding[];

export const FUTURE_NATIVE_SCENE_PRESET_BINDINGS = [
  ...buildScenePresetBindings(nonVolumetricBindingRegistrationSpecs),
  ...buildScenePresetBindings(volumetricBindingRegistrationSpecs),
] as const satisfies readonly FutureNativeScenePresetBinding[];

export function getFutureNativeSceneBinding(mode: Layer2Type): FutureNativeSceneBinding | null {
  return FUTURE_NATIVE_SCENE_BINDINGS.find((binding) => binding.modeId === mode) ?? null;
}

export function getFutureNativeScenePresetBindings(mode: Layer2Type): FutureNativeScenePresetBinding[] {
  return FUTURE_NATIVE_SCENE_PRESET_BINDINGS.filter((binding) => binding.modeId === mode);
}
