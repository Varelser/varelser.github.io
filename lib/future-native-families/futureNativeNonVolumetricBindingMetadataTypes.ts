import type { Layer2Type } from '../../types';

export type NonVolumetricBindingRegistrationFamilyId =
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
  | 'fracture-debris-generation';

export type NonVolumetricBindingRegistrationMode =
  | 'native-surface'
  | 'native-particles'
  | 'native-structure';

export interface NonVolumetricPresetRegistrationSpec {
  id: string;
  label: string;
  description: string;
}

export interface NonVolumetricBindingRegistrationSpec {
  modeId: Layer2Type;
  familyId: NonVolumetricBindingRegistrationFamilyId;
  bindingMode: NonVolumetricBindingRegistrationMode;
  routeTag: string;
  primaryPresetId: string;
  title: string;
  summary: string;
  presets: readonly NonVolumetricPresetRegistrationSpec[];
}
