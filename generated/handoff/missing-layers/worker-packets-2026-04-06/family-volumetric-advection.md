# Volumetric Advection

- packetId: family-volumetric-advection
- packetType: family-evidence
- familyId: volumetric-advection
- group: volumetric
- currentStage: project-integrated
- progressPercent: 98
- ownershipClass: conditional
- officialStateCandidate: implemented
- closureCandidate: review-ready
- recommendedRole: family-volumetric-worker
- recommendedReturnUnit: patch

## Worker return template

```md
- 対象: volumetric-advection
- 種別: patch
- 触った範囲:
- 触っていない幹線:
- 実行 verify:
- 残件:
- mainline 判断が必要な点:
```

## Mode bindings

- condense_field / native-volume / source=plane / minPoints=24

## Verify commands

- npm run verify:volumetric-advection
- npm run verify:future-native-volumetric-routes
- npm run verify:future-native-project-state-fast

## Evidence paths

- docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md
- lib/future-native-families/futureNativeFamiliesIntegrationShared.ts
- lib/future-native-families/futureNativeFamiliesIntegrationVolumetricFixtures.ts
- lib/future-native-families/futureNativeFamiliesProgress.ts
- lib/future-native-families/futureNativeFamiliesRegistry.ts
- lib/future-native-families/futureNativeFamiliesVolumetric.ts
- lib/future-native-families/futureNativeNonVolumetricBindingMetadata.ts
- lib/future-native-families/futureNativeNonVolumetricBindingMetadataMpm.ts
- lib/future-native-families/futureNativeNonVolumetricBundleCoverage.ts
- lib/future-native-families/futureNativeNonVolumetricFamilyMetadata.ts
- lib/future-native-families/futureNativeNonVolumetricRouteGroupTrend.ts
- lib/future-native-families/futureNativeNonVolumetricRouteHighlights.ts
- lib/future-native-families/futureNativeSceneBridgeVolumetricAdvection.ts
- lib/future-native-families/futureNativeSceneBridgeVolumetricDensityPressure.ts
- lib/future-native-families/futureNativeSceneBridgeVolumetricLightShadow.ts
- lib/future-native-families/futureNativeSceneBridgeVolumetricOverrides.ts
- lib/future-native-families/futureNativeSceneBridgeVolumetricRuntimeShared.ts
- lib/future-native-families/futureNativeSceneBridgeVolumetricSmokePayload.ts
- lib/future-native-families/futureNativeScenePresetPatchesVolumetric.ts
- lib/future-native-families/futureNativeScenePresetPatchesVolumetricAdvection.ts
- lib/future-native-families/futureNativeScenePresetPatchesVolumetricDensityPressure.ts
- lib/future-native-families/futureNativeScenePresetPatchesVolumetricLightShadow.ts
- lib/future-native-families/futureNativeScenePresetPatchesVolumetricSmoke.ts
- lib/future-native-families/futureNativeVolumetricAdvectionLightShadowAuthoring.ts

## Runtime / implementation focus

- lib/future-native-families/starter-runtime/volumetric_density_transportAdapter.js
- lib/future-native-families/starter-runtime/volumetric_density_transportAdapter.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportDerived.js
- lib/future-native-families/starter-runtime/volumetric_density_transportDerived.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportInjector.js
- lib/future-native-families/starter-runtime/volumetric_density_transportInjector.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportLighting.js
- lib/future-native-families/starter-runtime/volumetric_density_transportLighting.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportObstacle.js
- lib/future-native-families/starter-runtime/volumetric_density_transportObstacle.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportRenderer.js
- lib/future-native-families/starter-runtime/volumetric_density_transportRenderer.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportRendererAdvanced.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportRendererShared.js
- lib/future-native-families/starter-runtime/volumetric_density_transportRendererShared.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportRendererVortexVolume.ts

## Open checks

- registry entry が現物と一致するか
- progress entry と verify 結果が矛盾しないか
- mode binding の source / bindingMode を再確認すること
- scene bridge / preset patch の接続を確認すること
- manifest / routing truth を変更していないことを確認すること

## Untouched trunks

- manifest 正本の意味変更
- registry 正本の意味変更
- routing 正本の意味変更
- package class の最終決定
- CURRENT_STATUS.md の最終同期
- REVIEW.md / DOCS_INDEX.md の最終 truth 化

## Mainline decision points

- officialState の最終確定
- closureCandidate の最終確定
- parallel / conditional / mainline-only の最終確定
- merge unit を patch のまま保持するか branch 化するか

