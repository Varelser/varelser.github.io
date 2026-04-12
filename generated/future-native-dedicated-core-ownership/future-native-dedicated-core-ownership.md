# Future-Native Dedicated Core Ownership

- generatedAt: 2026-04-08T16:28:23.815Z
- familyCount: 6
- routeCount: 16
- coverageCount: 6
- mpmFamilyCount: 4
- fractureFamilyCount: 2
- fullyOwnedKernelFamilyCount: 6
- sharedBaseKernelFamilyCount: 0

## mpm-viscoplastic
- group: mpm
- routeCount: 3
- configOwnerId: config-owner:mpm-viscoplastic
- stateOwnerId: state-owner:mpm-viscoplastic
- kernelFacadeId: kernel-facade:mpm-viscoplastic
- sharedKernelBaseId: shared-kernel:mpm-granular
- ownedKernelModuleId: owned-kernel:mpm-viscoplastic
- fullyOwnedKernel: true

### future-native-mpm-viscoplastic-flow
- modeId: viscous_flow
- runtimeFacadeId: owned-kernel-runtime:mpm-viscoplastic
- routeSignature: mpm-viscoplastic:future-native-mpm-viscoplastic-flow:15:5
- warmFrameCount: 15

### future-native-mpm-viscoplastic-melt-front
- modeId: melt_front
- runtimeFacadeId: owned-kernel-runtime:mpm-viscoplastic
- routeSignature: mpm-viscoplastic:future-native-mpm-viscoplastic-melt-front:19:6
- warmFrameCount: 19

### future-native-mpm-viscoplastic-evaporative-sheet
- modeId: evaporative_sheet
- runtimeFacadeId: owned-kernel-runtime:mpm-viscoplastic
- routeSignature: mpm-viscoplastic:future-native-mpm-viscoplastic-evaporative-sheet:17:5
- warmFrameCount: 17

## mpm-snow
- group: mpm
- routeCount: 3
- configOwnerId: config-owner:mpm-snow
- stateOwnerId: state-owner:mpm-snow
- kernelFacadeId: kernel-facade:mpm-snow
- sharedKernelBaseId: shared-kernel:mpm-granular
- ownedKernelModuleId: owned-kernel:mpm-snow
- fullyOwnedKernel: true

### future-native-mpm-snow-ashfall
- modeId: ashfall
- runtimeFacadeId: owned-kernel-runtime:mpm-snow
- routeSignature: mpm-snow:future-native-mpm-snow-ashfall:15:5
- warmFrameCount: 15

### future-native-mpm-snow-frost-lattice
- modeId: frost_lattice
- runtimeFacadeId: owned-kernel-runtime:mpm-snow
- routeSignature: mpm-snow:future-native-mpm-snow-frost-lattice:17:5
- warmFrameCount: 17

### future-native-mpm-snow-avalanche-field
- modeId: avalanche_field
- runtimeFacadeId: owned-kernel-runtime:mpm-snow
- routeSignature: mpm-snow:future-native-mpm-snow-avalanche-field:19:6
- warmFrameCount: 19

## mpm-mud
- group: mpm
- routeCount: 3
- configOwnerId: config-owner:mpm-mud
- stateOwnerId: state-owner:mpm-mud
- kernelFacadeId: kernel-facade:mpm-mud
- sharedKernelBaseId: shared-kernel:mpm-granular
- ownedKernelModuleId: owned-kernel:mpm-mud
- fullyOwnedKernel: true

### future-native-mpm-mud-sediment-stack
- modeId: sediment_stack
- runtimeFacadeId: owned-kernel-runtime:mpm-mud
- routeSignature: mpm-mud:future-native-mpm-mud-sediment-stack:15:5
- warmFrameCount: 15

### future-native-mpm-mud-talus-heap
- modeId: talus_heap
- runtimeFacadeId: owned-kernel-runtime:mpm-mud
- routeSignature: mpm-mud:future-native-mpm-mud-talus-heap:18:6
- warmFrameCount: 18

### future-native-mpm-mud-liquid-smear
- modeId: liquid_smear
- runtimeFacadeId: owned-kernel-runtime:mpm-mud
- routeSignature: mpm-mud:future-native-mpm-mud-liquid-smear:16:5
- warmFrameCount: 16

## mpm-paste
- group: mpm
- routeCount: 3
- configOwnerId: config-owner:mpm-paste
- stateOwnerId: state-owner:mpm-paste
- kernelFacadeId: kernel-facade:mpm-paste
- sharedKernelBaseId: shared-kernel:mpm-granular
- ownedKernelModuleId: owned-kernel:mpm-paste
- fullyOwnedKernel: true

### future-native-mpm-paste-capillary-sheet
- modeId: capillary_sheet
- runtimeFacadeId: owned-kernel-runtime:mpm-paste
- routeSignature: mpm-paste:future-native-mpm-paste-capillary-sheet:16:5
- warmFrameCount: 16

### future-native-mpm-paste-percolation-sheet
- modeId: percolation_sheet
- runtimeFacadeId: owned-kernel-runtime:mpm-paste
- routeSignature: mpm-paste:future-native-mpm-paste-percolation-sheet:17:5
- warmFrameCount: 17

### future-native-mpm-paste-crawl-seep
- modeId: crawl_seep
- runtimeFacadeId: owned-kernel-runtime:mpm-paste
- routeSignature: mpm-paste:future-native-mpm-paste-crawl-seep:18:6
- warmFrameCount: 18

## fracture-crack-propagation
- group: fracture
- routeCount: 1
- configOwnerId: config-owner:fracture-crack-propagation
- stateOwnerId: state-owner:fracture-crack-propagation
- kernelFacadeId: kernel-facade:fracture-crack-propagation
- sharedKernelBaseId: shared-kernel:fracture-lattice
- ownedKernelModuleId: owned-kernel:fracture-crack-propagation
- fullyOwnedKernel: true

### future-native-fracture-crack-propagation
- modeId: seep_fracture
- runtimeFacadeId: owned-kernel-runtime:fracture-crack-propagation
- routeSignature: fracture-crack-propagation:future-native-fracture-crack-propagation:5:18x14
- warmFrameCount: 5

## fracture-debris-generation
- group: fracture
- routeCount: 3
- configOwnerId: config-owner:fracture-debris-generation
- stateOwnerId: state-owner:fracture-debris-generation
- kernelFacadeId: kernel-facade:fracture-debris-generation
- sharedKernelBaseId: shared-kernel:fracture-lattice
- ownedKernelModuleId: owned-kernel:fracture-debris-generation
- fullyOwnedKernel: true

### future-native-fracture-debris-shard
- modeId: shard_debris
- runtimeFacadeId: owned-kernel-runtime:fracture-debris-generation
- routeSignature: fracture-debris-generation:future-native-fracture-debris-shard:5:18x14
- warmFrameCount: 5

### future-native-fracture-debris-orbit
- modeId: orbit_fracture
- runtimeFacadeId: owned-kernel-runtime:fracture-debris-generation
- routeSignature: fracture-debris-generation:future-native-fracture-debris-orbit:7:18x14
- warmFrameCount: 7

### future-native-fracture-debris-pollen
- modeId: fracture_pollen
- runtimeFacadeId: owned-kernel-runtime:fracture-debris-generation
- routeSignature: fracture-debris-generation:future-native-fracture-debris-pollen:6:18x16
- warmFrameCount: 6
