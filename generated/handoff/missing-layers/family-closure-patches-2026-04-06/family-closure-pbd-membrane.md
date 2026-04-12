# PBD Membrane family closure patch blueprint

- patchId: family-closure-pbd-membrane
- familyId: pbd-membrane
- group: pbd
- progressPercent: 98
- officialStateCandidate: implemented
- closureCandidate: review-ready
- ownershipClass: conditional
- recommendedReturnUnit: patch
- lowRiskBundleId: bundle-pbd-family-closure-evidence
- overlayPath: family-closure-patches-2026-04-06/family-closure-pbd-membrane.md

## Evidence coverage

- declaredEvidencePaths: 24
- existingEvidencePaths: 24
- declaredRuntimeFiles: 16
- existingRuntimeFiles: 16

## Verify commands

- `npm run verify:pbd-membrane`
- `npm run verify:future-native-nonvolumetric-routes`
- `npm run verify:future-native-project-state-fast`

## Touchable zones

- docs/handoff
- lib/future-native-families

## Key evidence paths

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

## Key runtime files

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

## Candidate outputs

- pbd-membrane evidence note md
- pbd-membrane verify checklist md
- pbd-membrane closure gap memo md

## Exit criteria

- family evidence note が現物パスと矛盾しない
- verify 実行結果と officialState 候補が矛盾しない
- scene bridge / preset patch / runtime の接続確認結果が記録される
- manifest / registry / routing の正本意味変更を含めない
- mainline 判断点が返却 bundle に明記される

## Risk notes

- evidence 24/24 paths exist
- runtime 16/16 files exist
- 98% progress candidate / project-integrated
- implemented / review-ready / conditional
- surface integration / rope payload の取り違えに注意

## Return template

```md
- 対象: pbd-membrane
- 種別: patch
- 触った範囲: 
- 触っていない幹線: 
- 実行 verify: 
- 残件: 
- mainline 判断が必要な点: 
```
