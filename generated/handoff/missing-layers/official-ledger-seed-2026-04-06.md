# KALOKAGATHIA official ledger seed

- createdAt: 2026-04-05T19:46:03.781Z
- repoPath: /mnt/data/workrepo/repo/kalokagathia
- doctorPackageClass: full-local-dev
- futureNativeFamilyCount: 22
- projectIntegratedFamilies: 22
- renderHandoffCases: 17
- archiveRelativePathDuplicates: 188
- largeImplementationFiles450Plus: 11

## subsystem counts

- components: 295 files
- lib: 590 files
- scripts: 194 files
- generated: 7 files
- types: 28 files
- docs-handoff: 46 files

## future-native families

| familyId | group | stage | progress | state candidate | closure candidate | verified modes | ownership |
|---|---|---|---:|---|---|---:|---|
| mpm-granular | mpm | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| mpm-viscoplastic | mpm | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| mpm-snow | mpm | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| mpm-mud | mpm | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| mpm-paste | mpm | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| pbd-cloth | pbd | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| pbd-membrane | pbd | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| pbd-rope | pbd | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| pbd-softbody | pbd | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| fracture-lattice | fracture | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| fracture-voxel | fracture | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| fracture-crack-propagation | fracture | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| fracture-debris-generation | fracture | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| volumetric-smoke | volumetric | project-integrated | 100 | implemented | needs-review | 1 | conditional |
| volumetric-density-transport | volumetric | project-integrated | 98 | implemented | review-ready | 0 | conditional |
| volumetric-advection | volumetric | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| volumetric-pressure-coupling | volumetric | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| volumetric-light-shadow-coupling | volumetric | project-integrated | 98 | implemented | review-ready | 1 | conditional |
| specialist-houdini-native | specialist-native | project-integrated | 98 | implemented | review-ready | 0 | mainline-only |
| specialist-niagara-native | specialist-native | project-integrated | 98 | implemented | review-ready | 0 | mainline-only |
| specialist-touchdesigner-native | specialist-native | project-integrated | 98 | implemented | review-ready | 0 | mainline-only |
| specialist-unity-vfx-native | specialist-native | project-integrated | 98 | implemented | review-ready | 0 | mainline-only |

## large implementation hotspots

- lib/future-native-families/futureNativeSceneBridgeRopePayload.js (1849 lines)
- components/controlPanelTabsAudioRouteEditor.tsx (1125 lines)
- components/controlPanelTabsAudioLegacyConflict.tsx (1059 lines)
- components/useAudioLegacyConflictBatchActions.ts (855 lines)
- lib/audioReactiveValidation.ts (775 lines)
- lib/future-native-families/starter-runtime/volumetric_density_transportRenderer.js (713 lines)
- lib/future-native-families/starter-runtime/fracture_latticeRenderer.js (694 lines)
- components/useAudioLegacyConflictManager.ts (580 lines)
- lib/audioReactiveRetirementMigration.ts (567 lines)
- components/useAudioLegacyConflictFocusedActions.ts (470 lines)
- lib/future-native-families/starter-runtime/mpm_granularRendererHelpers.js (462 lines)

## archive duplicate sample

- .gitignore
- .npmrc
- App.tsx
- components/AppComparePreview.tsx
- components/AppExecutionDiagnosticsOverlay.tsx
- components/AppSceneCameraRig.tsx
- components/AppSceneLayerContent.tsx
- components/canvasStreamWidget.tsx
- components/ControlPanel.tsx
- components/controlPanelChrome.tsx
- components/controlPanelGlobalDisplay.tsx
- components/controlPanelGlobalDisplayGpgpu.tsx
- components/controlPanelGlobalDisplayGpgpuAdvancedRender.tsx
- components/controlPanelGlobalDisplayGpgpuForces.tsx
- components/controlPanelGlobalDisplayGpgpuTrails.tsx
- components/controlPanelGlobalDisplayPostFx.tsx
- components/controlPanelGlobalDisplayProductPacks.tsx
- components/controlPanelGlobalDisplayScreenFx.tsx
- components/controlPanelGlobalExport.tsx
- components/controlPanelGlobalPresets.tsx
- components/controlPanelGlobalProject.tsx
- components/controlPanelGlobalSequence.tsx
- components/controlPanelPartsInputs.tsx
- components/controlPanelPartsMotion.tsx
- components/controlPanelPartsPreview.tsx

## render handoff mode bindings

- cloth_membrane -> pbd-cloth (native-surface)
- elastic_sheet -> pbd-membrane (native-surface)
- surface_shell -> pbd-softbody (native-surface)
- signal_braid -> pbd-rope (native-structure)
- granular_fall -> mpm-granular (native-particles)
- viscous_flow -> mpm-viscoplastic (native-particles)
- ashfall -> mpm-snow (native-particles)
- sediment_stack -> mpm-mud (native-particles)
- capillary_sheet -> mpm-paste (native-particles)
- fracture_grammar -> fracture-lattice (native-structure)
- voxel_lattice -> fracture-voxel (native-structure)
- seep_fracture -> fracture-crack-propagation (native-structure)
- shard_debris -> fracture-debris-generation (native-structure)
- prism_smoke -> volumetric-smoke (native-volume)
- condense_field -> volumetric-advection (native-volume)
- vortex_transport -> volumetric-pressure-coupling (native-volume)
- charge_veil -> volumetric-light-shadow-coupling (native-volume)

