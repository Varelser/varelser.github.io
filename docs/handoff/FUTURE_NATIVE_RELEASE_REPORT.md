# FUTURE_NATIVE_RELEASE_REPORT

- generatedAt: 2026-04-08T15:37:36.458Z
- dateLabel: 2026-04-05

## 全体進捗
- totalFamilies: **22**
- projectIntegratedFamilies: **22 / 22**
- nativeStarterFamilies: **22 / 22**
- verificationReadyFamilies: **22 / 22**
- averageProgressPercent: **98.09%**
- firstWaveAverage: **98.00%**
- averageNextTargetsPerFamily: **0.14**

## stage counts
- project-integrated: **22**

## group summaries
### fracture
- familyCount: **4**
- projectIntegratedFamilies: **4 / 4**
- averageProgressPercent: **98.00%**
- lowest: **fracture-crack-propagation (98%)**
- highest: **fracture-crack-propagation (98%)**

### mpm
- familyCount: **5**
- projectIntegratedFamilies: **5 / 5**
- averageProgressPercent: **98.00%**
- lowest: **mpm-granular (98%)**
- highest: **mpm-granular (98%)**

### pbd
- familyCount: **4**
- projectIntegratedFamilies: **4 / 4**
- averageProgressPercent: **98.00%**
- lowest: **pbd-cloth (98%)**
- highest: **pbd-cloth (98%)**

### specialist-native
- familyCount: **4**
- projectIntegratedFamilies: **4 / 4**
- averageProgressPercent: **98.00%**
- lowest: **specialist-houdini-native (98%)**
- highest: **specialist-houdini-native (98%)**

### volumetric
- familyCount: **5**
- projectIntegratedFamilies: **5 / 5**
- averageProgressPercent: **98.40%**
- lowest: **volumetric-advection (98%)**
- highest: **volumetric-smoke (100%)**

## 進捗が低い family
### Crack Propagation (fracture-crack-propagation)
- group: **fracture**
- progressPercent: **98%**
- currentStage: **project-integrated**
- nextTargets: 

### Debris Generation (fracture-debris-generation)
- group: **fracture**
- progressPercent: **98%**
- currentStage: **project-integrated**
- nextTargets: 

### Lattice Fracture (fracture-lattice)
- group: **fracture**
- progressPercent: **98%**
- currentStage: **project-integrated**
- nextTargets: 

### Voxel Fracture (fracture-voxel)
- group: **fracture**
- progressPercent: **98%**
- currentStage: **project-integrated**
- nextTargets: 

### MPM Granular (mpm-granular)
- group: **mpm**
- progressPercent: **98%**
- currentStage: **project-integrated**
- nextTargets: 

### MPM Mud (mpm-mud)
- group: **mpm**
- progressPercent: **98%**
- currentStage: **project-integrated**
- nextTargets: 

## fracture / mpm route trend summaries
### mpm
- familyCount: **5**
- averageProgressPercent: **98.00%**
- totalRouteCount: **14**
- totalPresetCount: **14**
- totalNextTargetCount: **0**
- mpm-granular: progress=98% nextTargets=0 routes=2 presets=2 binding=native-particles delta=routes=2, presets=2, binding=native-particles primary=future-native-mpm-granular-sand-fall, future-native-mpm-granular-jammed-pack helper=futureNativeSceneBridgeMpmGranular.ts+futureNativeMpmFamilyPreview.ts bundle=futureNativeScenePresetPatchesMpmGranular.ts+futureNativeSceneBridgeMpmRuntime.ts coverage=granular-family-preview-split
- mpm-mud: progress=98% nextTargets=0 routes=3 presets=3 binding=native-particles delta=routes=3, presets=3, binding=native-particles primary=future-native-mpm-mud-liquid-smear, future-native-mpm-mud-sediment-stack, future-native-mpm-mud-talus-heap helper=futureNativeSceneBridgeMpmMudPaste.ts+futureNativeMpmDedicatedRoutePreview.ts+futureNativeSceneBridgeMpmDedicatedRuntime.ts bundle=futureNativeScenePresetPatchesMpmMudPaste.ts+futureNativeSceneBridgeMpmRuntime.ts coverage=mud-family-preview-split
- mpm-paste: progress=98% nextTargets=0 routes=3 presets=3 binding=native-particles delta=routes=3, presets=3, binding=native-particles primary=future-native-mpm-paste-capillary-sheet, future-native-mpm-paste-crawl-seep, future-native-mpm-paste-percolation-sheet helper=futureNativeSceneBridgeMpmMudPaste.ts+futureNativeMpmDedicatedRoutePreview.ts+futureNativeSceneBridgeMpmDedicatedRuntime.ts bundle=futureNativeScenePresetPatchesMpmMudPaste.ts+futureNativeSceneBridgeMpmRuntime.ts coverage=paste-family-preview-split
- mpm-snow: progress=98% nextTargets=0 routes=3 presets=3 binding=native-particles delta=routes=3, presets=3, binding=native-particles primary=future-native-mpm-snow-ashfall, future-native-mpm-snow-avalanche-field, future-native-mpm-snow-frost-lattice helper=futureNativeSceneBridgeMpmSnowViscoplastic.ts+futureNativeMpmDedicatedRoutePreview.ts+futureNativeSceneBridgeMpmDedicatedRuntime.ts bundle=futureNativeScenePresetPatchesMpmSnowViscoplastic.ts+futureNativeSceneBridgeMpmRuntime.ts coverage=snow-family-preview-split
- mpm-viscoplastic: progress=98% nextTargets=0 routes=3 presets=3 binding=native-particles delta=routes=3, presets=3, binding=native-particles primary=future-native-mpm-viscoplastic-evaporative-sheet, future-native-mpm-viscoplastic-melt-front, future-native-mpm-viscoplastic-viscous-flow helper=futureNativeSceneBridgeMpmSnowViscoplastic.ts+futureNativeMpmDedicatedRoutePreview.ts+futureNativeSceneBridgeMpmDedicatedRuntime.ts bundle=futureNativeScenePresetPatchesMpmSnowViscoplastic.ts+futureNativeSceneBridgeMpmRuntime.ts coverage=viscoplastic-family-preview-split

### fracture
- familyCount: **4**
- averageProgressPercent: **98.00%**
- totalRouteCount: **7**
- totalPresetCount: **7**
- totalNextTargetCount: **0**
- fracture-crack-propagation: progress=98% nextTargets=0 routes=1 presets=1 binding=native-structure delta=routes=1, presets=1, binding=native-structure primary=future-native-fracture-crack-propagation-seep helper=futureNativeSceneBridgeFractureDedicated.ts+futureNativeSceneBridgeFractureDedicatedRuntime.ts+futureNativeSceneBridgeRuntimeControl.ts+futureNativeFractureDedicatedReportPreview.ts bundle=futureNativeScenePresetPatchesFractureDedicated.ts coverage=crack-family-preview-split
- fracture-debris-generation: progress=98% nextTargets=0 routes=3 presets=3 binding=native-structure delta=routes=3, presets=3, binding=native-structure primary=future-native-fracture-debris-generation-pollen, future-native-fracture-debris-generation-orbit, future-native-fracture-debris-generation-shard helper=futureNativeSceneBridgeFractureDedicated.ts+futureNativeSceneBridgeFractureDedicatedRuntime.ts+futureNativeSceneBridgeRuntimeControl.ts+futureNativeFractureDedicatedReportPreview.ts bundle=futureNativeScenePresetPatchesFractureDedicated.ts coverage=debris-family-preview-split
- fracture-lattice: progress=98% nextTargets=0 routes=2 presets=2 binding=native-structure delta=routes=2, presets=2, binding=native-structure primary=future-native-fracture-lattice-collapse, future-native-fracture-lattice-grammar helper=futureNativeSceneBridgeFractureInputs.ts+futureNativeFractureLatticeReportPreview.ts bundle=futureNativeScenePresetPatchesFracture.ts coverage=lattice-preview-split
- fracture-voxel: progress=98% nextTargets=0 routes=1 presets=1 binding=native-structure delta=routes=1, presets=1, binding=native-structure primary=future-native-fracture-voxel-lattice helper=futureNativeSceneBridgeFractureDedicated.ts+futureNativeSceneBridgeFractureDedicatedRuntime.ts+futureNativeSceneBridgeRuntimeControl.ts+futureNativeFractureDedicatedReportPreview.ts bundle=futureNativeScenePresetPatchesFractureDedicated.ts coverage=voxel-family-preview-split

## volumetric route trend summary
- familyCount: **4**
- averageProgressPercent: **98.50%**
- totalRouteCount: **8**
- totalPresetCount: **8**
- totalNextTargetCount: **3**
- volumetric-advection: progress=98% nextTargets=0 routes=2 presets=2 binding=native-volume delta=advection=0, buoyancy=-0.14, swirl=-0.3, absorption=0.194, shadow=0.16, obstacle=0.22, depthLayers=-1, volumeDepth=-0.109 primary=future-native-volumetric-condense-field, future-native-volumetric-sublimate-cloud helper=futureNativeSceneBridgeVolumetricAdvection.ts bundle=futureNativeScenePresetPatchesVolumetricAdvection.ts+futureNativeVolumetricAdvectionLightShadowAuthoring.ts+futureNativeVolumetricRouteTrend.ts coverage=advection-helper-split authoring=route-aware advection bundle selection and runtime transport values persist into project session state for condense/sublimate routes.
- volumetric-light-shadow-coupling: progress=98% nextTargets=0 routes=2 presets=2 binding=native-volume delta=lightAbsorption=-0.44, shadow=-0.481, lightMarch=5, obstacle=-0.523, depthLayers=3, volumeDepth=0.318 primary=future-native-volumetric-light-charge-veil, future-native-volumetric-shadow-velvet-ash helper=futureNativeSceneBridgeVolumetricLightShadow.ts bundle=futureNativeScenePresetPatchesVolumetricLightShadow.ts+futureNativeVolumetricAdvectionLightShadowAuthoring.ts+futureNativeVolumetricRouteTrend.ts coverage=light-shadow-helper-split authoring=route-aware lighting bundles and attenuation values persist into project session state for charge/shadow routes.
- volumetric-pressure-coupling: progress=98% nextTargets=0 routes=2 presets=2 binding=native-volume delta=pressureRelax=-0.16, pressureIterations=-2, boundaryFade=-0.057, swirl=0.771, obstacle=-0.38, softness=-0.031, depthLayers=1, volumeDepth=0.228 primary=future-native-volumetric-pressure-vortex-column, future-native-volumetric-pressure-cells-basin helper=futureNativeSceneBridgeVolumetricDensityPressure.ts+futureNativeVolumetricDensityPressureAuthoring.ts bundle=futureNativeScenePresetPatchesVolumetricDensityPressure.ts+futureNativeVolumetricRouteTrend.ts coverage=pressure-authoring-split authoring=route-aware projection bundle selection and pressure-centric runtime values persist into project session state for vortex/cells routes.

## 進捗が高い family
### Volumetric Smoke (volumetric-smoke)
- group: **volumetric**
- progressPercent: **100%**
- currentStage: **project-integrated**

### Crack Propagation (fracture-crack-propagation)
- group: **fracture**
- progressPercent: **98%**
- currentStage: **project-integrated**

### Debris Generation (fracture-debris-generation)
- group: **fracture**
- progressPercent: **98%**
- currentStage: **project-integrated**

### Lattice Fracture (fracture-lattice)
- group: **fracture**
- progressPercent: **98%**
- currentStage: **project-integrated**

### Voxel Fracture (fracture-voxel)
- group: **fracture**
- progressPercent: **98%**
- currentStage: **project-integrated**

### MPM Granular (mpm-granular)
- group: **mpm**
- progressPercent: **98%**
- currentStage: **project-integrated**

## specialist route 併記
- specialistFamilyCount: **4**
- specialistAverageProgressPercent: **98.00%**
- specialistFixtureWarningRouteCount: **4**
- specialistExportImportWarningRouteCount: **4**
- specialistControlRoundtripStableCount: **4**

## release 手順
1. `npm run typecheck`
2. `npm run inspect:project-health`
3. `npm run verify:future-native-safe-pipeline`
4. `npm run emit:future-native-report`
5. `npm run emit:future-native-specialist-handoff`

## 参照先
1. `CURRENT_STATUS.md`
2. `docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md`
3. `docs/handoff/SESSION_CHECKPOINT_2026-04-05.md`
4. `docs/handoff/FUTURE_NATIVE_RELEASE_CHECKLIST.md`
5. `docs/handoff/archive/INDEX.md`