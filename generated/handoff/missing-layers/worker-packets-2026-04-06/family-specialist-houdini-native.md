# Houdini-like Native Bundle

- packetId: family-specialist-houdini-native
- packetType: family-evidence
- familyId: specialist-houdini-native
- group: specialist-native
- currentStage: project-integrated
- progressPercent: 98
- ownershipClass: mainline-only
- officialStateCandidate: implemented
- closureCandidate: review-ready
- recommendedRole: specialist-mainline-review
- recommendedReturnUnit: patch-with-mainline-review

## Worker return template

```md
- 対象: specialist-houdini-native
- 種別: patch
- 触った範囲:
- 触っていない幹線:
- 実行 verify:
- 残件:
- mainline 判断が必要な点:
```

## Verify commands

- npm run verify:specialist-houdini-native
- npm run verify:future-native-nonvolumetric-routes
- npm run verify:future-native-project-state-fast

## Evidence paths

- docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md
- lib/future-native-families/futureNativeFamiliesAcceptance.ts
- lib/future-native-families/futureNativeFamiliesAiPackets.ts
- lib/future-native-families/futureNativeFamiliesBacklog.ts
- lib/future-native-families/futureNativeFamiliesDefaults.ts
- lib/future-native-families/futureNativeFamiliesFracture.ts
- lib/future-native-families/futureNativeFamiliesImplementationPackets.ts
- lib/future-native-families/futureNativeFamiliesIntegration.ts
- lib/future-native-families/futureNativeFamiliesIntegrationFixtures.ts
- lib/future-native-families/futureNativeFamiliesIntegrationFractureFixtures.ts
- lib/future-native-families/futureNativeFamiliesIntegrationProject.ts
- lib/future-native-families/futureNativeFamiliesIntegrationShared.ts
- lib/future-native-families/futureNativeFamiliesIntegrationSnapshots.ts
- lib/future-native-families/futureNativeFamiliesIntegrationVolumetricFixtures.ts
- lib/future-native-families/futureNativeFamiliesLookup.ts
- lib/future-native-families/futureNativeFamiliesMilestones.ts
- lib/future-native-families/futureNativeFamiliesMpm.ts
- lib/future-native-families/futureNativeFamiliesPacketCli.ts
- lib/future-native-families/futureNativeFamiliesPbd.ts
- lib/future-native-families/futureNativeFamiliesProgress.ts
- lib/future-native-families/futureNativeFamiliesProjectReport.ts
- lib/future-native-families/futureNativeFamiliesPrompts.ts
- lib/future-native-families/futureNativeFamiliesRegistry.ts
- lib/future-native-families/futureNativeFamiliesReleaseReport.ts

## Runtime / implementation focus

- lib/future-native-families/starter-runtime/fracture_latticeAdapter.js
- lib/future-native-families/starter-runtime/fracture_latticeAdapter.ts
- lib/future-native-families/starter-runtime/fracture_latticeRenderer.js
- lib/future-native-families/starter-runtime/fracture_latticeRenderer.ts
- lib/future-native-families/starter-runtime/fracture_latticeRendererDebris.ts
- lib/future-native-families/starter-runtime/fracture_latticeRendererPatterns.ts
- lib/future-native-families/starter-runtime/fracture_latticeRendererShared.ts
- lib/future-native-families/starter-runtime/fracture_latticeRendererShells.ts
- lib/future-native-families/starter-runtime/fracture_latticeSchema.js
- lib/future-native-families/starter-runtime/fracture_latticeSchema.ts
- lib/future-native-families/starter-runtime/fracture_latticeSolver.js
- lib/future-native-families/starter-runtime/fracture_latticeSolver.ts
- lib/future-native-families/starter-runtime/fracture_latticeUi.ts
- lib/future-native-families/starter-runtime/mpm_granularAdapter.js
- lib/future-native-families/starter-runtime/mpm_granularAdapter.ts
- lib/future-native-families/starter-runtime/mpm_granularConstraints.js

## Open checks

- registry entry が現物と一致するか
- progress entry と verify 結果が矛盾しないか
- mode binding 欠落が意図通りか確認すること
- scene bridge / preset patch の接続を確認すること
- specialist family のため final closure は mainline へ戻すこと

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

