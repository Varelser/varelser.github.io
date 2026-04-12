import type { NonVolumetricBindingRegistrationSpec } from './futureNativeNonVolumetricBindingMetadataTypes';

export const mpmBindingRegistrationSpecs = [
  {
    modeId: 'granular_fall',
    familyId: 'mpm-granular',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-granular-fall',
    primaryPresetId: 'future-native-mpm-granular-sand-fall',
    title: 'MPM Granular native particle binding',
    summary: 'granular_fall を mpm-granular の native particle / grid occupancy handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-granular-sand-fall',
        label: 'Future-native granular sand fall',
        description: 'granular_fall を mpm-granular の sand branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'jammed_pack',
    familyId: 'mpm-granular',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-granular-jammed',
    primaryPresetId: 'future-native-mpm-granular-jammed-pack',
    title: 'MPM Granular native particle binding',
    summary: 'jammed_pack を mpm-granular の jammed / paste寄り native particle handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-granular-jammed-pack',
        label: 'Future-native jammed pack',
        description: 'jammed_pack を mpm-granular の paste / compaction branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'viscous_flow',
    familyId: 'mpm-viscoplastic',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-viscoplastic-flow',
    primaryPresetId: 'future-native-mpm-viscoplastic-viscous-flow',
    title: 'MPM Viscoplastic native particle binding',
    summary: 'viscous_flow を mpm-viscoplastic の mud / yielding flow handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-viscoplastic-viscous-flow',
        label: 'Future-native viscoplastic flow',
        description: 'viscous_flow を mpm-viscoplastic の mud branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'melt_front',
    familyId: 'mpm-viscoplastic',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-viscoplastic-melt-front',
    primaryPresetId: 'future-native-mpm-viscoplastic-melt-front',
    title: 'MPM Viscoplastic native particle binding',
    summary: 'melt_front を mpm-viscoplastic の paste / heated slump handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-viscoplastic-melt-front',
        label: 'Future-native melt front',
        description: 'melt_front を mpm-viscoplastic の paste-heavy yielding branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'evaporative_sheet',
    familyId: 'mpm-viscoplastic',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-viscoplastic-evaporative-sheet',
    primaryPresetId: 'future-native-mpm-viscoplastic-evaporative-sheet',
    title: 'MPM Viscoplastic native particle binding',
    summary: 'evaporative_sheet を mpm-viscoplastic の thin slurry / shedding handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-viscoplastic-evaporative-sheet',
        label: 'Future-native evaporative sheet',
        description: 'evaporative_sheet を mpm-viscoplastic の thin mud/slurry branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'ashfall',
    familyId: 'mpm-snow',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-snow-ashfall',
    primaryPresetId: 'future-native-mpm-snow-ashfall',
    title: 'MPM Snow native particle binding',
    summary: 'ashfall を mpm-snow の powder fall / brittle accumulation handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-snow-ashfall',
        label: 'Future-native snow ashfall',
        description: 'ashfall を mpm-snow の powder fall branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'sediment_stack',
    familyId: 'mpm-mud',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-mud-sediment-stack',
    primaryPresetId: 'future-native-mpm-mud-sediment-stack',
    title: 'MPM Mud native particle binding',
    summary: 'sediment_stack を mpm-mud の wet accumulation / stratified settling handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-mud-sediment-stack',
        label: 'Future-native mud sediment stack',
        description: 'sediment_stack を mpm-mud の layered wet settling branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'capillary_sheet',
    familyId: 'mpm-paste',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-paste-capillary-sheet',
    primaryPresetId: 'future-native-mpm-paste-capillary-sheet',
    title: 'MPM Paste native particle binding',
    summary: 'capillary_sheet を mpm-paste の cohesive deposition / plate extrusion handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-paste-capillary-sheet',
        label: 'Future-native paste capillary sheet',
        description: 'capillary_sheet を mpm-paste の cohesive deposition branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'percolation_sheet',
    familyId: 'mpm-paste',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-paste-percolation-sheet',
    primaryPresetId: 'future-native-mpm-paste-percolation-sheet',
    title: 'MPM Paste native particle binding',
    summary: 'percolation_sheet を mpm-paste の channelized extrusion / retained smear handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-paste-percolation-sheet',
        label: 'Future-native paste percolation sheet',
        description: 'percolation_sheet を mpm-paste の channelized paste branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'crawl_seep',
    familyId: 'mpm-paste',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-paste-crawl-seep',
    primaryPresetId: 'future-native-mpm-paste-crawl-seep',
    title: 'MPM Paste native particle binding',
    summary: 'crawl_seep を mpm-paste の slow creep / sticky seep handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-paste-crawl-seep',
        label: 'Future-native paste crawl seep',
        description: 'crawl_seep を mpm-paste の sticky creep / seep branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'talus_heap',
    familyId: 'mpm-mud',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-mud-talus-heap',
    primaryPresetId: 'future-native-mpm-mud-talus-heap',
    title: 'MPM Mud native particle binding',
    summary: 'talus_heap を mpm-mud の collapsing heap / shear drag handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-mud-talus-heap',
        label: 'Future-native mud talus heap',
        description: 'talus_heap を mpm-mud の slope-heavy settling branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'liquid_smear',
    familyId: 'mpm-mud',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-mud-liquid-smear',
    primaryPresetId: 'future-native-mpm-mud-liquid-smear',
    title: 'MPM Mud native particle binding',
    summary: 'liquid_smear を mpm-mud の thin slurry / wet drag handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-mud-liquid-smear',
        label: 'Future-native mud liquid smear',
        description: 'liquid_smear を mpm-mud の thin slurry / smear branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'frost_lattice',
    familyId: 'mpm-snow',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-snow-frost-lattice',
    primaryPresetId: 'future-native-mpm-snow-frost-lattice',
    title: 'MPM Snow native particle binding',
    summary: 'frost_lattice を mpm-snow の crust / lattice compaction handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-snow-frost-lattice',
        label: 'Future-native snow frost lattice',
        description: 'frost_lattice を mpm-snow の crusted lattice branch で見る native particle preset。',
      },
    ],
  },
  {
    modeId: 'avalanche_field',
    familyId: 'mpm-snow',
    bindingMode: 'native-particles',
    routeTag: 'future-native-mpm-snow-avalanche-field',
    primaryPresetId: 'future-native-mpm-snow-avalanche-field',
    title: 'MPM Snow native particle binding',
    summary: 'avalanche_field を mpm-snow の packed slide / break-up handoff として扱います。',
    presets: [
      {
        id: 'future-native-mpm-snow-avalanche-field',
        label: 'Future-native snow avalanche field',
        description: 'avalanche_field を mpm-snow の packed slide / break-up branch で見る native particle preset。',
      },
    ],
  },
] as const satisfies readonly NonVolumetricBindingRegistrationSpec[];
