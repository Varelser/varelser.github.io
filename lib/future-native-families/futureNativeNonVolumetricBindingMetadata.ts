import type { NonVolumetricBindingRegistrationSpec } from './futureNativeNonVolumetricBindingMetadataTypes';
import { mpmBindingRegistrationSpecs } from './futureNativeNonVolumetricBindingMetadataMpm';
export type {
  NonVolumetricBindingRegistrationFamilyId,
  NonVolumetricBindingRegistrationMode,
  NonVolumetricBindingRegistrationSpec,
  NonVolumetricPresetRegistrationSpec,
} from './futureNativeNonVolumetricBindingMetadataTypes';

export const nonVolumetricBindingRegistrationSpecs = [
  {
    modeId: 'cloth_membrane',
    familyId: 'pbd-cloth',
    bindingMode: 'native-surface',
    routeTag: 'future-native-cloth',
    primaryPresetId: 'future-native-pbd-cloth-drape',
    title: 'PBD Cloth binding',
    summary: 'cloth_membrane を future-native pbd-cloth starter の native cloth surface handoff として扱います。',
    presets: [
      {
        id: 'future-native-pbd-cloth-drape',
        label: 'Future-native cloth drape',
        description: 'plane source で布の垂れを見やすくする cloth starter の native cloth surface preset。',
      },
    ],
  },
  {
    modeId: 'elastic_sheet',
    familyId: 'pbd-membrane',
    bindingMode: 'native-surface',
    routeTag: 'future-native-membrane-elastic',
    primaryPresetId: 'future-native-pbd-membrane-elastic',
    title: 'PBD Membrane binding',
    summary: 'elastic_sheet を pbd-membrane の native sheet / rim surface handoff として扱います。',
    presets: [
      {
        id: 'future-native-pbd-membrane-elastic',
        label: 'Future-native membrane tension',
        description: 'elastic rebound を強めた membrane starter の native sheet preset。',
      },
    ],
  },
  {
    modeId: 'viscoelastic_membrane',
    familyId: 'pbd-membrane',
    bindingMode: 'native-surface',
    routeTag: 'future-native-membrane-memory',
    primaryPresetId: 'future-native-pbd-membrane-memory',
    title: 'PBD Membrane binding',
    summary: 'viscoelastic_membrane を pbd-membrane の native sheet / memory surface handoff として扱います。',
    presets: [
      {
        id: 'future-native-pbd-membrane-memory',
        label: 'Future-native membrane memory',
        description: 'memory lag を見やすくした membrane starter の native sheet preset。',
      },
    ],
  },
  {
    modeId: 'surface_shell',
    familyId: 'pbd-softbody',
    bindingMode: 'native-surface',
    routeTag: 'future-native-softbody-shell',
    primaryPresetId: 'future-native-pbd-softbody-shell',
    title: 'PBD Softbody native surface binding',
    summary: 'surface_shell を pbd-softbody の native hull / surface handoff として扱います。',
    presets: [
      {
        id: 'future-native-pbd-softbody-shell',
        label: 'Future-native softbody shell',
        description: 'outer hull を softbody の native surface handoff として使う preset。',
      },
    ],
  },
  {
    modeId: 'elastic_lattice',
    familyId: 'pbd-softbody',
    bindingMode: 'native-surface',
    routeTag: 'future-native-softbody-lattice',
    primaryPresetId: 'future-native-pbd-softbody-lattice',
    title: 'PBD Softbody native surface binding',
    summary: 'elastic_lattice を pbd-softbody の native shell / support handoff として扱います。',
    presets: [
      {
        id: 'future-native-pbd-softbody-lattice',
        label: 'Future-native softbody lattice',
        description: 'elastic lattice を softbody の native shell/support handoff として使う preset。',
      },
    ],
  },
  {
    modeId: 'plasma_thread',
    familyId: 'pbd-rope',
    bindingMode: 'native-structure',
    routeTag: 'future-native-rope-plasma-thread',
    primaryPresetId: 'future-native-pbd-rope-plasma-thread',
    title: 'PBD Rope native structure binding',
    summary: 'plasma_thread を pbd-rope の anchored filament / collider handoff として扱います。',
    presets: [
      {
        id: 'future-native-pbd-rope-plasma-thread',
        label: 'Future-native rope plasma thread',
        description: 'plasma_thread を pbd-rope の anchored filament handoff として使う preset。',
      },
    ],
  },
  {
    modeId: 'signal_braid',
    familyId: 'pbd-rope',
    bindingMode: 'native-structure',
    routeTag: 'future-native-rope-signal-braid',
    primaryPresetId: 'future-native-pbd-rope-signal-braid',
    title: 'PBD Rope native structure binding',
    summary: 'signal_braid を pbd-rope の braided / dual-anchor handoff として扱います。',
    presets: [
      {
        id: 'future-native-pbd-rope-signal-braid',
        label: 'Future-native rope signal braid',
        description: 'signal_braid を pbd-rope の dual-anchor / braided handoff として使う preset。',
      },
    ],
  },
  {
    modeId: 'aurora_threads',
    familyId: 'pbd-rope',
    bindingMode: 'native-structure',
    routeTag: 'future-native-rope-aurora-threads',
    primaryPresetId: 'future-native-pbd-rope-aurora-threads',
    title: 'PBD Rope native structure binding',
    summary: 'aurora_threads を pbd-rope の canopy / multi-collider handoff として扱います。',
    presets: [
      {
        id: 'future-native-pbd-rope-aurora-threads',
        label: 'Future-native rope aurora threads',
        description: 'aurora_threads を pbd-rope の canopy-like anchored thread handoff として使う preset。',
      },
    ],
  },
  ...mpmBindingRegistrationSpecs,
  {
    modeId: 'fracture_grammar',
    familyId: 'fracture-lattice',
    bindingMode: 'native-structure',
    routeTag: 'future-native-fracture-grammar',
    primaryPresetId: 'future-native-fracture-lattice-grammar',
    title: 'Fracture Lattice native structure binding',
    summary: 'fracture_grammar を fracture-lattice の intact bond / debris handoff として扱います。',
    presets: [
      {
        id: 'future-native-fracture-lattice-grammar',
        label: 'Future-native fracture grammar',
        description: 'fracture_grammar を fracture-lattice の structure/debris handoff で見る preset。',
      },
    ],
  },
  {
    modeId: 'collapse_fracture',
    familyId: 'fracture-lattice',
    bindingMode: 'native-structure',
    routeTag: 'future-native-fracture-collapse',
    primaryPresetId: 'future-native-fracture-lattice-collapse',
    title: 'Fracture Lattice native structure binding',
    summary: 'collapse_fracture を fracture-lattice の collapse / debris handoff として扱います。',
    presets: [
      {
        id: 'future-native-fracture-lattice-collapse',
        label: 'Future-native collapse fracture',
        description: 'collapse_fracture を fracture-lattice の collapse bias 付き handoff で見る preset。',
      },
    ],
  },
  {
    modeId: 'voxel_lattice',
    familyId: 'fracture-voxel',
    bindingMode: 'native-structure',
    routeTag: 'future-native-fracture-voxel-lattice',
    primaryPresetId: 'future-native-fracture-voxel-lattice',
    title: 'Fracture Voxel native structure binding',
    summary: 'voxel_lattice を fracture-voxel の chunked shell / debris handoff として扱います。',
    presets: [
      {
        id: 'future-native-fracture-voxel-lattice',
        label: 'Future-native fracture voxel lattice',
        description: 'voxel_lattice を fracture-voxel の chunked shell/debris handoff で見る preset。',
      },
    ],
  },
  {
    modeId: 'seep_fracture',
    familyId: 'fracture-crack-propagation',
    bindingMode: 'native-structure',
    routeTag: 'future-native-fracture-crack-propagation',
    primaryPresetId: 'future-native-fracture-crack-propagation-seep',
    title: 'Crack propagation native structure binding',
    summary: 'seep_fracture を fracture-crack-propagation の surface crack-front / branching handoff として扱います。',
    presets: [
      {
        id: 'future-native-fracture-crack-propagation-seep',
        label: 'Future-native crack propagation seep',
        description: 'seep_fracture を fracture-crack-propagation の surface crack-front handoff で見る preset。',
      },
    ],
  },
  {
    modeId: 'shard_debris',
    familyId: 'fracture-debris-generation',
    bindingMode: 'native-structure',
    routeTag: 'future-native-fracture-debris-shard',
    primaryPresetId: 'future-native-fracture-debris-generation-shard',
    title: 'Debris generation native structure binding',
    summary: 'shard_debris を fracture-debris-generation の shard fan / fragment trail handoff として扱います。',
    presets: [
      {
        id: 'future-native-fracture-debris-generation-shard',
        label: 'Future-native fracture shard debris',
        description: 'shard_debris を fracture-debris-generation の shard-heavy debris handoff で見る preset。',
      },
    ],
  },
  {
    modeId: 'orbit_fracture',
    familyId: 'fracture-debris-generation',
    bindingMode: 'native-structure',
    routeTag: 'future-native-fracture-debris-orbit',
    primaryPresetId: 'future-native-fracture-debris-generation-orbit',
    title: 'Debris generation native structure binding',
    summary: 'orbit_fracture を fracture-debris-generation の orbital debris wake / remesh handoff として扱います。',
    presets: [
      {
        id: 'future-native-fracture-debris-generation-orbit',
        label: 'Future-native fracture orbit debris',
        description: 'orbit_fracture を fracture-debris-generation の orbital debris wake handoff で見る preset。',
      },
    ],
  },
  {
    modeId: 'fracture_pollen',
    familyId: 'fracture-debris-generation',
    bindingMode: 'native-structure',
    routeTag: 'future-native-fracture-debris-pollen',
    primaryPresetId: 'future-native-fracture-debris-generation-pollen',
    title: 'Debris generation native structure binding',
    summary: 'fracture_pollen を fracture-debris-generation の dust cloud / splinter spray handoff として扱います。',
    presets: [
      {
        id: 'future-native-fracture-debris-generation-pollen',
        label: 'Future-native fracture pollen debris',
        description: 'fracture_pollen を fracture-debris-generation の dust/splinter debris handoff で見る preset。',
      },
    ],
  },
] as const satisfies readonly NonVolumetricBindingRegistrationSpec[];
