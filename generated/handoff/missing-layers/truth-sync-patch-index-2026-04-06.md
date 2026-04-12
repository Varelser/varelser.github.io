# truth-sync patch index

- date: 2026-04-06
- target files: 3
- overlay program percent: 100%
- mainline preparation percent: 100%
- end-to-end percent: 95%

## CURRENT_STATUS.md
- purpose: 現時点の実証済み verify 結果と patch overlay program 完了状態の反映
- apply mode: append-under-変更履歴-or-create-new-section
- key facts:
  - futureNativeFamilies: 22
  - projectIntegratedFamilies: 22
  - modeBindings: 17
  - workerPackets: 26
  - lowRiskBundles: 9
  - familyClosureBlueprints: 22
  - directPatchCandidates: 18
  - reviewReadyDirectCandidates: 17
  - needsReviewDirectCandidates: 1
  - specialistReviewQueue: 4
  - archiveDuplicateRelativePathCount: 188

## REVIEW.md
- purpose: 2026-04-06 時点の overlay program 達成内容、残件、mainline review 必須項目をレビューとして追加
- apply mode: append-new-dated-review-block
- key facts:
  - reviewReadyDirectCandidates: 17
  - needsReviewDirectCandidates: undefined
  - specialistReviewQueue: 4
  - mainlineIntegrationStages: 8
  - overlayProgramPercent: 100
  - mainlinePreparationPercent: 100

## DOCS_INDEX.md
- purpose: 新規 handoff/ai 群と generated/handoff/missing-layers 群の位置づけ追加
- apply mode: insert-under-root-docs-section-or-append
- key facts:
  - handoffAiDocumentCount: 36
  - generatedMissingLayersFileCount: 92

## remaining final work items
- CURRENT_STATUS.md / REVIEW.md / DOCS_INDEX.md への正本同期
- specialist-native 4件の mainline review
- volumetric-smoke の最終判定
- closeout 実行後の final docs truth 一本化
