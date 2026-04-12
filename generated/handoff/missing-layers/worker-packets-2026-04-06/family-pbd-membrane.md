# PBD Membrane

- packetId: family-pbd-membrane
- packetType: family-evidence
- familyId: pbd-membrane
- group: pbd
- currentStage: project-integrated
- progressPercent: 98
- ownershipClass: conditional
- officialStateCandidate: implemented
- closureCandidate: review-ready
- recommendedRole: family-pbd-worker
- recommendedReturnUnit: patch

## Worker return template

```md
- 対象: pbd-membrane
- 種別: patch
- 触った範囲:
- 触っていない幹線:
- 実行 verify:
- 残件:
- mainline 判断が必要な点:
```

## Mode bindings

- elastic_sheet / native-surface / source=plane / minPoints=24

## Verify commands

- npm run verify:pbd-membrane
- npm run verify:future-native-nonvolumetric-routes
- npm run verify:future-native-project-state-fast

## Evidence paths

- docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md
- lib/future-native-families/futureNativeFamiliesIntegrationShared.ts
- lib/future-native-families/futureNativeFamiliesPbd.ts
- lib/future-native-families/futureNativeFamiliesProgress.ts
- lib/future-native-families/futureNativeFamiliesRegistry.ts
- lib/future-native-families/futureNativePbdFamilyPreview.ts
- lib/future-native-families/futureNativePbdMembraneRoutePreview.ts
- lib/future-native-families/futureNativePbdRopeRoutePreview.ts
- lib/future-native-families/futureNativeSceneBridgePbdClothSoftbody.ts
- lib/future-native-families/futureNativeSceneBridgePbdMembrane.ts
- lib/future-native-families/futureNativeScenePresetPatchesPbdClothSoftbody.ts
- lib/future-native-families/futureNativeScenePresetPatchesPbdMembrane.ts
- lib/future-native-families/futureNativeScenePresetPatchesPbdRope.ts
- lib/future-native-families/starter-runtime/pbd_clothAdapter.js
- lib/future-native-families/starter-runtime/pbd_clothAdapter.ts
- lib/future-native-families/starter-runtime/pbd_clothRenderer.js
- lib/future-native-families/starter-runtime/pbd_clothRenderer.ts
- lib/future-native-families/starter-runtime/pbd_clothSchema.js
- lib/future-native-families/starter-runtime/pbd_clothSchema.ts
- lib/future-native-families/starter-runtime/pbd_clothSolver.js
- lib/future-native-families/starter-runtime/pbd_clothSolver.ts
- lib/future-native-families/starter-runtime/pbd_clothUi.ts
- lib/future-native-families/starter-runtime/pbd_collisionConstraints.js
- lib/future-native-families/starter-runtime/pbd_collisionConstraints.ts

## Runtime / implementation focus

- lib/future-native-families/starter-runtime/pbd_clothAdapter.js
- lib/future-native-families/starter-runtime/pbd_clothAdapter.ts
- lib/future-native-families/starter-runtime/pbd_clothRenderer.js
- lib/future-native-families/starter-runtime/pbd_clothRenderer.ts
- lib/future-native-families/starter-runtime/pbd_clothSchema.js
- lib/future-native-families/starter-runtime/pbd_clothSchema.ts
- lib/future-native-families/starter-runtime/pbd_clothSolver.js
- lib/future-native-families/starter-runtime/pbd_clothSolver.ts
- lib/future-native-families/starter-runtime/pbd_clothUi.ts
- lib/future-native-families/starter-runtime/pbd_collisionConstraints.js
- lib/future-native-families/starter-runtime/pbd_collisionConstraints.ts
- lib/future-native-families/starter-runtime/pbd_membraneAdapter.js
- lib/future-native-families/starter-runtime/pbd_membraneAdapter.ts
- lib/future-native-families/starter-runtime/pbd_membraneRenderer.js
- lib/future-native-families/starter-runtime/pbd_membraneRenderer.ts
- lib/future-native-families/starter-runtime/pbd_membraneSchema.js

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

