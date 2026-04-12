# DOCS_INDEX

このリポジトリでは、文書を次の3層で扱います。

## 1. root に残す文書（現在の正本）

- `README.md`  
  起動・開発・配布の入口
- `CURRENT_STATUS.md`  
  現在の正本。まず最初に読む
- `REVIEW.md`  
  現物基準の精査結果
- `REFACTOR_PLAN_LARGE_FILES.md`  
  巨大ファイル分割の実行計画
- `PHASE0_COMPLETION_STATUS.md`  
  現在の package の位置づけ
- `SYSTEM_DESIGN_BLUEPRINT.md`  
  設計思想
- `UPGRADE_ROADMAP.md`  
  拡張ロードマップ
- `AUDIO_REACTIVE_ARCHITECTURE.md`  
  音反応機能を後付け拡張できるようにするための責務分離設計
- `AUDIO_REACTIVE_ROADMAP.md`  
  音反応基盤の段階導入ロードマップ
- `AUDIO_REACTIVE_AI_HANDOFF.md`  
  後続AI向けの前提・禁止事項・実装順

## 2. archive に移した文書（旧進捗・旧計画）

- `docs/archive/root-history/`  
  旧来 root に散在していた進捗記録、フェーズ記録、途中メモ
- `docs/archive/build-logs/`  
  退避した build / typecheck / verify のログ

## 3. 運用ルール

- **現在の判断**は root の文書を優先する
- archive 文書と build log は、履歴参照専用として扱う
- archive 文書に root の正本と矛盾がある場合、**root 側を優先**する
- 新規の進捗 md を増やす場合も、root に乱立させず、必要なら `docs/` 配下へ置く

## 推奨参照順

1. `CURRENT_STATUS.md`
2. `REVIEW.md`
3. `REFACTOR_PLAN_LARGE_FILES.md`
4. `SYSTEM_DESIGN_BLUEPRINT.md`
5. `AUDIO_REACTIVE_ARCHITECTURE.md`
6. `AUDIO_REACTIVE_ROADMAP.md`
7. `AUDIO_REACTIVE_AI_HANDOFF.md`
8. 必要時のみ `docs/archive/root-history/`

- `AUDIO_REACTIVE_COVERAGE_MATRIX.md`  
  音反応の live target / reserved target を一覧で把握するための coverage 正本
- `docs/GPGPU_TRANSFORM_FEEDBACK_NATIVE_CAPTURE_BINDING_2026-04-01.md`  
  WebGL2 native transform feedback capture binding の現行構成への手移植メモ
- `docs/ADDON_INTEGRATION_KALOKAGATHIA_FOUNDATION_TRACK_V26_2026-04-01.md`  
  追加アーカイブの精査結果と、現行本体への統合方針
- `docs/MERGE_REPORT_2026-04-01.md`  
  safe-cleanup-fixed と suite-dedup-resume の結合方針と反映一覧
- `docs/AUDIT_REVALIDATION_2026-04-01.md`  
  配布 ZIP の現物再検証結果。typecheck / build / project-state / export / phase5 の通過記録
- `docs/AUDIO_TAB_SPLIT_2026-04-01.md`  
  audio tab 巨大ファイルの初回分割内容と、再検証結果の記録

- `docs/CI_CLEANUP_REPORT_2026-04-01.md`  
  CI / lockfile / registry 正規化の実施記録
- `docs/NAMING_AND_ARCHIVE_CLEANUP_REPORT_2026-04-01.md`  
  Kalokagathia 命名統一と archive 整理の実施記録

- docs/VERIFIER_BUILD_FIX_2026-04-02.md — verifier/build compatibility fixes for split audio UI and read-only extracted archives.
- `docs/PACKAGING_EXEC_PERMISSION_FIX_2026-04-02.md` — ZIP再梱包時に欠けていた実行権の復旧内容と、新規展開後の再検証対象。

- 2026-04-02: Browser verifier tiering clarified (`docs/- `docs/PACKAGING_INTEGRITY_2026-04-05.md` — full zip / source-only zip の root files・critical node_modules・zip structure を機械検査する packaging safety。
- `docs/BROWSER_VERIFIER_TIERING_2026-04-02.md``).

- 2026-04-02: Verification suite tier reporting + runtime self-heal added (`docs/VERIFICATION_SUITE_TIER_REPORTING_2026-04-02.md`).

- docs/VERIFICATION_RUN_ID_ISOLATION_2026-04-02.md — verification-suite run-id scoped archive output; latest pointer retained.

- docs/REFACTOR_EXECUTION_PLAN_2026-04-05.md — 2026-04-05 時点の refactor 指示書の棚卸し、今回先行実施した項目、保留項目の整理。
- docs/archive/status-history.md — `CURRENT_STATUS.md` から分離した履歴ログの退避先。

- `docs/AUDIO_SEQUENCE_TRIGGER_SPLIT_2026-04-05.md` — Audio Sequence Trigger 帯域の分離記録。
- `docs/AUDIO_SEQUENCE_TRIGGER_HISTORY_2026-04-05.md` — sequence trigger debug の recent history 可視化。

- `docs/AUDIO_ROUTE_EDITOR_SPLIT_2026-04-05.md` — audio route editor 分離の実施記録

- docs/AUDIO_LEGACY_CONFLICT_SPLIT_2026-04-05.md — legacy conflict / retirement panel split.

- docs/AUDIO_TAB_STATE_CURATION_HOOKS_2026-04-05.md — audio tab state / curation history hook extraction.

- docs/AUDIO_SYNTH_AND_LEGACY_SLIDERS_SPLIT_2026-04-05.md — audio synth controls / legacy sliders split.

- docs/AUDIO_ROUTE_TRANSFER_UTILITIES_HOOK_2026-04-05.md — audio route transfer / bulk utility hook extraction.


- docs/AUDIO_ROUTE_EDITOR_CORE_HOOK_2026-04-05.md — route core actions hook化。


- docs/AUDIO_LEGACY_CONFLICT_MANAGER_HOOK_2026-04-05.md — audio legacy conflict manager hook extraction.

- `docs/DEAD_CODE_PRUNE_2026-04-05.md` — 低リスク dead code prune。

- `docs/PHASE5_CLOSEOUT_CONSOLIDATION_2026-04-05.md` — Phase 5 closeout / handoff レポート統合と retired 化。
- `docs/FUTURE_NATIVE_SUITE_RESUME_2026-04-06.md` — future-native long suite の resume 運用と summary 再開仕様。
- `docs/DEPENDENCY_DIRECTION_NORMALIZATION_2026-04-05.md` — motionCatalog/controlPanel shared type boundary cleanup.

- `docs/MANUAL_CHUNKS_SIMPLIFICATION_2026-04-05.md` — `vite.config.ts` の scene chunk 判定簡素化と build 比較結果。
- `docs/TAILWIND_PANEL_TOKENS_2026-04-05.md` — panel font-size token consolidation and inline style migration.
- `docs/TAILWIND_PANEL_TOKENS_2026-04-05.md` — centralized panel font tokens and moved inline body/scrollbar styles into `styles.css`.

- `docs/SCENE_EROSION_TRAIL_THREE_LAYER_SPLIT_2026-04-05.md` — `sceneErosionTrailSystem` の three-layer split。
- `docs/SCENE_VOXEL_LATTICE_THREE_LAYER_SPLIT_2026-04-05.md` — `sceneVoxelLatticeSystem` の three-layer split。
- `docs/SCENE_DEPOSITION_FIELD_THREE_LAYER_SPLIT_2026-04-05.md` — deposition field 系の三層分割メモ

- `docs/SCENE_CRYSTAL_DEPOSITION_THREE_LAYER_SPLIT_2026-04-05.md` — crystal deposition 系の三層分割メモ

- `docs/SCENE_VOLUMETRIC_FIELD_THREE_LAYER_SPLIT_2026-04-05.md` — volumetric field 系の三層分割メモ
- `docs/SCENE_SDF_SURFACE_SHELL_THREE_LAYER_SPLIT_2026-04-05.md` — sceneSdfSurfaceShellSystem.tsx の三層化メモ
- `docs/SCENE_GPGPU_THREE_LAYER_SPLIT_2026-04-05.md` — `sceneGpgpuSystem.tsx` の facade + Shared / Runtime / Render 分割
- `docs/SCENE_GLYPH_OUTLINE_THREE_LAYER_SPLIT_2026-04-05.md` — `sceneGlyphOutlineSystem.tsx` の facade + Shared / Runtime / Render 分割

- `docs/SCENE_HYBRID_SURFACE_PATCH_THREE_LAYER_SPLIT_2026-04-05.md` — `sceneHybridSurfacePatchSystem.tsx` の facade + Shared / Runtime / Render 分割

- `docs/SCENE_HYBRID_MEMBRANE_THREE_LAYER_SPLIT_2026-04-05.md`

- `docs/SCENE_HYBRID_GRANULAR_FIBER_METABALL_THREE_LAYER_COMPLETION_2026-04-05.md` — Task 6 完了（granular / fiber / metaball の三層化で 13/13 完了）。
- `docs/AUDIO_LEGACY_CONFLICT_DERIVED_CLIPBOARD_SPLIT_2026-04-05.md` — legacy conflict manager の derived-state / clipboard 再分割。

- `components/useAudioLegacyConflictFocusedActions.ts`: focused recommendation / keep route / stored keep route 専用 hook。

- `docs/DEAD_CODE_AUDIT_2026-04-05.md` — dead code static audit と未参照モジュール整理。

- `docs/PACKAGING_INTEGRITY_2026-04-05.md` — packaging integrity の strict gate / platform-specific-runtime-bundled / source-only manifest 運用。
- `docs/PACKAGE_CLASS_POLICY_2026-04-05.md` — full-local-dev / platform-specific-runtime-bundled / source-only の package class 定義。

- `docs/PACKAGING_INTEGRITY_2026-04-05.md`: package integrity / doctor / manifest schema の整理
- `docs/PACKAGE_CLASS_POLICY_2026-04-05.md`: full-local-dev / platform-specific-runtime-bundled / source-only の運用ルール
- `docs/PACKAGE_HANDOFF_DOCTOR_2026-04-05.md`: handoff 時の診断手順と recovery plan

- `docs/CLOSEOUT_REPORT_2026-04-05.md` — package integrity / dead code / manifest recovery plan を束ねた closeout summary。
- `scripts/generate-closeout-report.mjs`: closeout report generator。

- `docs/handoff/SESSION_CHECKPOINT_2026-04-06.md` — manifest / project state mainline 止血と future-native suite 再現性回復のチェックポイント。
- `docs/handoff/ai/KALOKAGATHIA_integrated_handoff_and_roadmap_2026-04-06.md` — 統合課題・優先順位・引き継ぎ基準。
- `docs/handoff/ai/KALOKAGATHIA_03_mainline_only_tasks_for_multi_ai_2026-04-06.md` — mainline owner AI が直接編集すべき幹線一覧。
- `docs/handoff/ai/KALOKAGATHIA_AI_HANDOFF_PRIORITY_PLAN_2026-04-06.md` — P0〜P5 の優先順位と完了条件。

## 2026-04-06 missing-layers overlay documents
- docs/handoff/ai/KALOKAGATHIA_00_missing_layers_split_guide_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_10_mainline_with_repo_only_missing_layers_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_11_delegatable_missing_layers_for_other_ai_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_16_patch_rollout_wave_plan_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_35_mainline_closeout_and_truth_sync_runbook_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_38_truth_sync_patch_suite_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_40_truth_sync_closeout_application_plan_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_42_closeout_patch_application_ready_suite_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_44_overall_progress_snapshot_rev5_2026-04-06.md

## 2026-04-06 generated handoff artifacts
- generated/handoff/missing-layers/official-ledger-seed-2026-04-06.json
- generated/handoff/missing-layers/worker-evidence-matrix-2026-04-06.json
- generated/handoff/missing-layers/low-risk-patch-bundles-2026-04-06.json
- generated/handoff/missing-layers/family-closure-patch-index-2026-04-06.json
- generated/handoff/missing-layers/direct-patch-candidate-index-2026-04-06.json
- generated/handoff/missing-layers/mainline-integration-order-2026-04-06.json
- generated/handoff/missing-layers/truth-sync-patch-index-2026-04-06.json
- generated/handoff/missing-layers/closeout-preview-index-2026-04-06.json

## 2026-04-06 mainline closeout runbook
- docs/handoff/ai/KALOKAGATHIA_35_mainline_closeout_and_truth_sync_runbook_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_38_truth_sync_patch_suite_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_40_truth_sync_closeout_application_plan_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_43_closeout_preview_generation_and_verify_commands_2026-04-06.md

## 2026-04-06 final signoff references
- docs/handoff/ai/KALOKAGATHIA_53_mainline_final_signoff_matrix_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_54_final_delivery_and_apply_order_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_55_overall_progress_snapshot_rev9_2026-04-06.md
- generated/handoff/missing-layers/mainline-final-signoff-2026-04-06.json
- generated/handoff/missing-layers/final-delivery-bundle-2026-04-06.json
