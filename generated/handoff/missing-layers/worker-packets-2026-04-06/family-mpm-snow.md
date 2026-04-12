# MPM Snow

- packetId: family-mpm-snow
- packetType: family-evidence
- familyId: mpm-snow
- group: mpm
- currentStage: project-integrated
- progressPercent: 98
- ownershipClass: conditional
- officialStateCandidate: implemented
- closureCandidate: review-ready
- recommendedRole: family-mpm-worker
- recommendedReturnUnit: patch

## Worker return template

```md
- 対象: mpm-snow
- 種別: patch
- 触った範囲:
- 触っていない幹線:
- 実行 verify:
- 残件:
- mainline 判断が必要な点:
```

## Mode bindings

- ashfall / native-particles / source=video / minPoints=120

## Verify commands

- npm run verify:mpm-snow
- npm run verify:future-native-nonvolumetric-routes
- npm run verify:future-native-project-state-fast

## Evidence paths

- docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md
- lib/future-native-families/futureNativeFamiliesIntegrationShared.ts
- lib/future-native-families/futureNativeFamiliesMpm.ts
- lib/future-native-families/futureNativeFamiliesProgress.ts
- lib/future-native-families/futureNativeFamiliesRegistry.ts
- lib/future-native-families/futureNativeMpmDedicatedRoutePreview.ts
- lib/future-native-families/futureNativeMpmFamilyPreview.ts
- lib/future-native-families/futureNativeNonVolumetricBindingMetadataMpm.ts
- lib/future-native-families/futureNativeSceneBridgeMpmGranular.ts
- lib/future-native-families/futureNativeSceneBridgeMpmInputs.ts
- lib/future-native-families/futureNativeSceneBridgeMpmMudPaste.ts
- lib/future-native-families/futureNativeSceneBridgeMpmRuntime.ts
- lib/future-native-families/futureNativeSceneBridgeMpmSnowViscoplastic.ts
- lib/future-native-families/futureNativeScenePresetPatchesMpm.ts
- lib/future-native-families/futureNativeScenePresetPatchesMpmGranular.ts
- lib/future-native-families/futureNativeScenePresetPatchesMpmMudPaste.ts
- lib/future-native-families/futureNativeScenePresetPatchesMpmSnowViscoplastic.ts
- lib/future-native-families/starter-runtime/mpm_granularAdapter.js
- lib/future-native-families/starter-runtime/mpm_granularAdapter.ts
- lib/future-native-families/starter-runtime/mpm_granularConstraints.js
- lib/future-native-families/starter-runtime/mpm_granularConstraints.ts
- lib/future-native-families/starter-runtime/mpm_granularGrid.js
- lib/future-native-families/starter-runtime/mpm_granularGrid.ts
- lib/future-native-families/starter-runtime/mpm_granularRenderer.js

## Runtime / implementation focus

- lib/future-native-families/starter-runtime/mpm_granularAdapter.js
- lib/future-native-families/starter-runtime/mpm_granularAdapter.ts
- lib/future-native-families/starter-runtime/mpm_granularConstraints.js
- lib/future-native-families/starter-runtime/mpm_granularConstraints.ts
- lib/future-native-families/starter-runtime/mpm_granularGrid.js
- lib/future-native-families/starter-runtime/mpm_granularGrid.ts
- lib/future-native-families/starter-runtime/mpm_granularRenderer.js
- lib/future-native-families/starter-runtime/mpm_granularRenderer.ts
- lib/future-native-families/starter-runtime/mpm_granularRendererHelpers.js
- lib/future-native-families/starter-runtime/mpm_granularRendererHelpers.ts
- lib/future-native-families/starter-runtime/mpm_granularRendererShells.ts
- lib/future-native-families/starter-runtime/mpm_granularSchema.js
- lib/future-native-families/starter-runtime/mpm_granularSchema.ts
- lib/future-native-families/starter-runtime/mpm_granularShared.js
- lib/future-native-families/starter-runtime/mpm_granularShared.ts
- lib/future-native-families/starter-runtime/mpm_granularSolver.js

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

