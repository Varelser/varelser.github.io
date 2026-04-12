# Density Transport family closure patch blueprint

- patchId: family-closure-volumetric-density-transport
- familyId: volumetric-density-transport
- group: volumetric
- progressPercent: 98
- officialStateCandidate: implemented
- closureCandidate: review-ready
- ownershipClass: conditional
- recommendedReturnUnit: patch
- lowRiskBundleId: bundle-volumetric-family-closure-evidence
- overlayPath: family-closure-patches-2026-04-06/family-closure-volumetric-density-transport.md

## Evidence coverage

- declaredEvidencePaths: 24
- existingEvidencePaths: 24
- declaredRuntimeFiles: 16
- existingRuntimeFiles: 16

## Verify commands

- `npm run verify:volumetric-density-transport`
- `npm run verify:future-native-volumetric-routes`
- `npm run verify:future-native-project-state-fast`

## Touchable zones

- docs/handoff
- lib/future-native-families

## Key evidence paths

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

## Key runtime files

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

- volumetric-density-transport evidence note md
- volumetric-density-transport verify checklist md
- volumetric-density-transport closure gap memo md

## Exit criteria

- volumetric route verify の結果を添付する
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
- route verify と density / pressure / lighting coupling の組み合わせ確認が必要

## Return template

```md
- 対象: volumetric-density-transport
- 種別: patch
- 触った範囲: 
- 触っていない幹線: 
- 実行 verify: 
- 残件: 
- mainline 判断が必要な点: 
```
