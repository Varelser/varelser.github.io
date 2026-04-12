# Future-Native Family Preview Artifact

- generatedAt: 2026-04-08T12:12:45.645Z
- mpmFamilyCount: 5
- fractureFamilyCount: 4
- mpmDedicatedFamilyCount: 4
- fractureDedicatedFamilyCount: 2
- pbdFamilyCount: 4
- volumetricFamilyCount: 4
- specialistFamilyCount: 4

## MPM
- mpm-granular: routes=2 presets=2 signature=mpm-granular:2:2:native-particles:granular-family-preview-split
- mpm-viscoplastic: routes=3 presets=3 signature=mpm-viscoplastic:3:3:native-particles:viscoplastic-family-preview-split
- mpm-snow: routes=3 presets=3 signature=mpm-snow:3:3:native-particles:snow-family-preview-split
- mpm-mud: routes=3 presets=3 signature=mpm-mud:3:3:native-particles:mud-family-preview-split
- mpm-paste: routes=3 presets=3 signature=mpm-paste:3:3:native-particles:paste-family-preview-split

## MPM Dedicated Shared-Core
- mpm-viscoplastic: routes=3 presets=3 coverage=viscoplastic-family-preview-split avgWarm=17 maxWarm=20 signature=mpm-viscoplastic:3:3:mud/paste:viscoplastic-family-preview-split
- mpm-snow: routes=3 presets=3 coverage=snow-family-preview-split avgWarm=17 maxWarm=20 signature=mpm-snow:3:3:snow:snow-family-preview-split
- mpm-mud: routes=3 presets=3 coverage=mud-family-preview-split avgWarm=16.667 maxWarm=20 signature=mpm-mud:3:3:mud:mud-family-preview-split
- mpm-paste: routes=3 presets=3 coverage=paste-family-preview-split avgWarm=17 maxWarm=20 signature=mpm-paste:3:3:paste:paste-family-preview-split

## Fracture
- fracture-lattice: routes=2 presets=2 signature=fracture-lattice:2:2:native-structure:lattice-preview-split
- fracture-voxel: routes=1 presets=1 signature=fracture-voxel:1:1:native-structure:voxel-family-preview-split
- fracture-crack-propagation: routes=1 presets=1 signature=fracture-crack-propagation:1:1:native-structure:crack-family-preview-split
- fracture-debris-generation: routes=3 presets=3 signature=fracture-debris-generation:3:3:native-structure:debris-family-preview-split

## Fracture Dedicated Shared-Core
- fracture-crack-propagation: routes=1 presets=1 coverage=crack-family-preview-split avgBroken=85 avgDebris=23 maxFront=0.691 signature=fracture-crack-propagation:1:1:broken85:debris23:crack-family-preview-split
- fracture-debris-generation: routes=3 presets=3 coverage=debris-family-preview-split avgBroken=87.667 avgDebris=60 maxFront=0.739 signature=fracture-debris-generation:3:3:broken87.667:debris60:debris-family-preview-split

## PBD
- pbd-rope: routes=3 presets=3 signature=pbd-rope:3:3:native-structure:rope-authoring-split
- pbd-cloth: routes=1 presets=1 signature=pbd-cloth:1:1:native-surface:cloth-family-preview-split
- pbd-membrane: routes=2 presets=2 signature=pbd-membrane:2:2:native-surface:membrane-family-preview-split
- pbd-softbody: routes=2 presets=2 signature=pbd-softbody:2:2:native-surface:softbody-family-preview-split

## Volumetric
- volumetric-advection: routes=2 presets=2 signature=preset:future-native-volumetric-condense-field | advection:1.200 | buoyancy:0.142 | obstacle:0.568 | depth:0.766
- volumetric-density-transport: routes=1 presets=1 signature=preset:future-native-volumetric-density-plume-weave | transportLoad:6.000 | shadowOcclusion:0.355 | densityLift:0.109
- volumetric-pressure-coupling: routes=2 presets=2 signature=preset:future-native-volumetric-pressure-vortex-column | pressureResidual:0.090 | divergenceBudget:1.800 | projectionOcclusion:0.142
- volumetric-light-shadow-coupling: routes=2 presets=2 signature=preset:future-native-volumetric-light-charge-veil | absorption:0.296 | shadow:0.374 | march:13.000 | depth:1.062

## Specialist
- specialist-houdini-native: route=native-node-chain-route adapter=surface-volume-primary target=hybrid:surface-volume-stack preview=specialist-houdini-native|native-node-chain-route|surface-volume-primary|hybrid:surface-volume-stack comparison=specialist-houdini-native|override-history+fallback-history+capability-trend|manifest-stable|serialization-stable|control-stable
- specialist-niagara-native: route=native-emitter-stack-route adapter=emitter-primary target=hybrid:emitter-event-stack preview=specialist-niagara-native|native-emitter-stack-route|emitter-primary|hybrid:emitter-event-stack comparison=specialist-niagara-native|override-history+fallback-history+capability-trend|manifest-stable|serialization-stable|control-stable
- specialist-touchdesigner-native: route=native-operator-pipe-route adapter=image-field-primary target=hybrid:image-field-pipe preview=specialist-touchdesigner-native|native-operator-pipe-route|image-field-primary|hybrid:image-field-pipe comparison=specialist-touchdesigner-native|override-history+fallback-history+capability-trend|manifest-stable|serialization-stable|control-stable
- specialist-unity-vfx-native: route=native-gpu-event-route adapter=gpu-event-primary target=hybrid:gpu-event-graph preview=specialist-unity-vfx-native|native-gpu-event-route|gpu-event-primary|hybrid:gpu-event-graph comparison=specialist-unity-vfx-native|override-history+fallback-history+capability-trend|manifest-stable|serialization-stable|control-stable

