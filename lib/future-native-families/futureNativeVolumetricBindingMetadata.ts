import type { Layer2Type } from '../../types';

export type VolumetricBindingRegistrationFamilyId =
  | 'volumetric-smoke'
  | 'volumetric-density-transport'
  | 'volumetric-advection'
  | 'volumetric-pressure-coupling'
  | 'volumetric-light-shadow-coupling';

export interface VolumetricPresetRegistrationSpec {
  id: string;
  label: string;
  description: string;
}

export interface VolumetricBindingRegistrationSpec {
  modeId: Layer2Type;
  familyId: VolumetricBindingRegistrationFamilyId;
  bindingMode: 'native-volume';
  routeTag: string;
  primaryPresetId: string;
  title: string;
  summary: string;
  presets: readonly VolumetricPresetRegistrationSpec[];
}

export const volumetricBindingRegistrationSpecs = [

  {
    modeId: 'volume_fog',
    familyId: 'volumetric-density-transport',
    bindingMode: 'native-volume',
    routeTag: 'future-native-volumetric-density-transport',
    primaryPresetId: 'future-native-volumetric-density-plume-weave',
    title: 'Volumetric Density Transport native volume binding',
    summary: 'volume_fog を volumetric-density-transport の plume / wake / bounded scalar field handoff として扱います。',
    presets: [
      {
        id: 'future-native-volumetric-density-plume-weave',
        label: 'Future-native density plume weave',
        description: 'volume_fog を volumetric-density-transport の woven plume / coupled density field として見る native volume preset。',
      },
      {
        id: 'future-native-volumetric-density-shadow-wake',
        label: 'Future-native density shadow wake',
        description: 'volume_fog を obstacle wake 側へ寄せ、shadow / recirculation / wake persistence を強めた authoring preset。',
      },
      {
        id: 'future-native-volumetric-density-vortex-pocket',
        label: 'Future-native density vortex pocket',
        description: 'volume_fog を plume pocket 側へ寄せ、swirl / lift / layered packet concentration を強めた authoring preset。',
      },
    ],
  },
  {
    modeId: 'prism_smoke',
    familyId: 'volumetric-smoke',
    bindingMode: 'native-volume',
    routeTag: 'future-native-volumetric-smoke-prism',
    primaryPresetId: 'future-native-volumetric-smoke-prism',
    title: 'Volumetric Smoke native volume binding',
    summary: 'prism_smoke を volumetric-smoke の lit plume / refracted smoke handoff として扱います。',
    presets: [
      {
        id: 'future-native-volumetric-smoke-prism',
        label: 'Future-native prism smoke',
        description: 'prism_smoke を volumetric-smoke の lit plume / refracted smoke handoff として使う preset。',
      },
      {
        id: 'future-native-volumetric-smoke-prism-light-fan',
        label: 'Future-native prism light fan',
        description: 'prism_smoke を light-fan 側へ寄せ、glow / anisotropy を強めた authoring preset。',
      },
      {
        id: 'future-native-volumetric-smoke-prism-obstacle-gate',
        label: 'Future-native prism obstacle gate',
        description: 'prism_smoke を obstacle gate 側へ寄せ、occlusion と slice 密度を強めた authoring preset。',
      },
    ],
  },
  {
    modeId: 'static_smoke',
    familyId: 'volumetric-smoke',
    bindingMode: 'native-volume',
    routeTag: 'future-native-volumetric-smoke-static',
    primaryPresetId: 'future-native-volumetric-smoke-static-slab',
    title: 'Volumetric Smoke native volume binding',
    summary: 'static_smoke を volumetric-smoke の slab / settled smoke handoff として扱います。',
    presets: [
      {
        id: 'future-native-volumetric-smoke-static-slab',
        label: 'Future-native static smoke slab',
        description: 'static_smoke を volumetric-smoke の settled slab / occluded smoke handoff として使う preset。',
      },
      {
        id: 'future-native-volumetric-smoke-static-shadow-wall',
        label: 'Future-native static shadow wall',
        description: 'static_smoke を shadow wall 側へ寄せ、occlusion と dense slab を強めた authoring preset。',
      },
      {
        id: 'future-native-volumetric-smoke-static-lantern-slab',
        label: 'Future-native static lantern slab',
        description: 'static_smoke を lantern light 側へ寄せ、glow と lift を少し戻した authoring preset。',
      },
    ],
  },
  {
    modeId: 'condense_field',
    familyId: 'volumetric-advection',
    bindingMode: 'native-volume',
    routeTag: 'future-native-volumetric-condense',
    primaryPresetId: 'future-native-volumetric-condense-field',
    title: 'Volumetric Advection native volume binding',
    summary: 'condense_field を volumetric-advection の condensing / guided transport handoff として扱います。',
    presets: [
      {
        id: 'future-native-volumetric-condense-field',
        label: 'Future-native advection condense field',
        description: 'condense_field を volumetric-advection の condensing transport field として見る native volume preset。',
      },
      {
        id: 'future-native-volumetric-condense-flow-lattice',
        label: 'Future-native condense flow lattice',
        description: 'condense_field を flow lattice 側へ寄せ、advection と swirl を強めた authoring preset。',
      },
      {
        id: 'future-native-volumetric-condense-obstacle-basin',
        label: 'Future-native condense obstacle basin',
        description: 'condense_field を obstacle basin 側へ寄せ、density と occlusion を強めた authoring preset。',
      },
    ],
  },
  {
    modeId: 'sublimate_cloud',
    familyId: 'volumetric-advection',
    bindingMode: 'native-volume',
    routeTag: 'future-native-volumetric-sublimate',
    primaryPresetId: 'future-native-volumetric-sublimate-cloud',
    title: 'Volumetric Advection native volume binding',
    summary: 'sublimate_cloud を volumetric-advection の hollow / lift-biased transport handoff として扱います。',
    presets: [
      {
        id: 'future-native-volumetric-sublimate-cloud',
        label: 'Future-native advection sublimate cloud',
        description: 'sublimate_cloud を volumetric-advection の hollow / lift transport field として見る native volume preset。',
      },
      {
        id: 'future-native-volumetric-sublimate-lift-veil',
        label: 'Future-native sublimate lift veil',
        description: 'sublimate_cloud を lift veil 側へ寄せ、buoyancy と depth layering を強めた authoring preset。',
      },
      {
        id: 'future-native-volumetric-sublimate-shadow-ring',
        label: 'Future-native sublimate shadow ring',
        description: 'sublimate_cloud を shadow ring 側へ寄せ、shadow と obstacle coupling を強めた authoring preset。',
      },
    ],
  },
  {
    modeId: 'vortex_transport',
    familyId: 'volumetric-pressure-coupling',
    bindingMode: 'native-volume',
    routeTag: 'future-native-volumetric-pressure-vortex',
    primaryPresetId: 'future-native-volumetric-pressure-vortex-column',
    title: 'Volumetric Pressure native volume binding',
    summary: 'vortex_transport を volumetric-pressure-coupling の spiral projection / vortex column handoff として扱います。',
    presets: [
      {
        id: 'future-native-volumetric-pressure-vortex-column',
        label: 'Future-native pressure vortex column',
        description: 'vortex_transport を volumetric-pressure-coupling の spiral projection column として見る native volume preset。',
      },
      {
        id: 'future-native-volumetric-pressure-vortex-lift',
        label: 'Future-native pressure vortex lift',
        description: 'vortex_transport を lift-biased 側へ寄せ、swirl と depth layering を強めた authoring preset。',
      },
      {
        id: 'future-native-volumetric-pressure-vortex-shear',
        label: 'Future-native pressure vortex shear',
        description: 'vortex_transport を shear / projection 側へ寄せ、pressure relaxation と boundary shaping を強めた authoring preset。',
      },
    ],
  },
  {
    modeId: 'pressure_cells',
    familyId: 'volumetric-pressure-coupling',
    bindingMode: 'native-volume',
    routeTag: 'future-native-volumetric-pressure-cells',
    primaryPresetId: 'future-native-volumetric-pressure-cells-basin',
    title: 'Volumetric Pressure native volume binding',
    summary: 'pressure_cells を volumetric-pressure-coupling の basin / compartment pressure handoff として扱います。',
    presets: [
      {
        id: 'future-native-volumetric-pressure-cells-basin',
        label: 'Future-native pressure cells basin',
        description: 'pressure_cells を volumetric-pressure-coupling の compartment basin として見る native volume preset。',
      },
      {
        id: 'future-native-volumetric-pressure-cells-lantern',
        label: 'Future-native pressure cells lantern',
        description: 'pressure_cells を lit basin 側へ寄せ、depth と lighting を少し戻した authoring preset。',
      },
      {
        id: 'future-native-volumetric-pressure-cells-wall',
        label: 'Future-native pressure cells wall',
        description: 'pressure_cells を pressure wall 側へ寄せ、boundary fade と obstacle coupling を強めた authoring preset。',
      },
    ],
  },
  {
    modeId: 'charge_veil',
    familyId: 'volumetric-light-shadow-coupling',
    bindingMode: 'native-volume',
    routeTag: 'future-native-volumetric-light-charge',
    primaryPresetId: 'future-native-volumetric-light-charge-veil',
    title: 'Volumetric Light/Shadow native volume binding',
    summary: 'charge_veil を volumetric-light-shadow-coupling の radiant charge curtain handoff として扱います。',
    presets: [
      {
        id: 'future-native-volumetric-light-charge-veil',
        label: 'Future-native charge veil',
        description: 'charge_veil を volumetric-light-shadow-coupling の radiant light curtain として見る native volume preset。',
      },
      {
        id: 'future-native-volumetric-light-charge-radiant',
        label: 'Future-native charge radiant fan',
        description: 'charge_veil を radiant 側へ寄せ、glow / anisotropy / light marching を強めた authoring preset。',
      },
      {
        id: 'future-native-volumetric-light-charge-occluded',
        label: 'Future-native charge occluded gate',
        description: 'charge_veil を occluded 側へ寄せ、shadow / obstacle / density shaping を強めた authoring preset。',
      },
    ],
  },
  {
    modeId: 'velvet_ash',
    familyId: 'volumetric-light-shadow-coupling',
    bindingMode: 'native-volume',
    routeTag: 'future-native-volumetric-shadow-velvet',
    primaryPresetId: 'future-native-volumetric-shadow-velvet-ash',
    title: 'Volumetric Light/Shadow native volume binding',
    summary: 'velvet_ash を volumetric-light-shadow-coupling の dense ash / shadow mantle handoff として扱います。',
    presets: [
      {
        id: 'future-native-volumetric-shadow-velvet-ash',
        label: 'Future-native velvet ash',
        description: 'velvet_ash を volumetric-light-shadow-coupling の dense soot mantle として見る native volume preset。',
      },
      {
        id: 'future-native-volumetric-shadow-velvet-lantern',
        label: 'Future-native velvet lantern',
        description: 'velvet_ash を lantern 側へ寄せ、lift を抑えつつ glow と depth lighting を戻した authoring preset。',
      },
      {
        id: 'future-native-volumetric-shadow-velvet-wall',
        label: 'Future-native velvet wall',
        description: 'velvet_ash を wall 側へ寄せ、shadow / absorption / obstacle coupling を強めた authoring preset。',
      },
    ],
  },
] as const satisfies readonly VolumetricBindingRegistrationSpec[];
