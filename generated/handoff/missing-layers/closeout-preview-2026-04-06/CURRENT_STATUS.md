# Current Status

## 概要
- 2026-04-06: manifest / project state の mainline 止血を実施。`lib/projectStateManifest.ts` を新系 builder / normalizer export へ揃え、`projectSerializationSnapshot.ts` / `projectStateStorage.ts` の future-native specialist route / packet roundtrip を補強。`verify:future-native-project-state-fast` / specialist route / runtime export regression / artifact tail を現物で再通過した。
- 2026-04-06: `scripts/run-step-suite.mjs` に resume 対応を追加。`STEP_SUITE_RESUME=1` で summary から残り step のみ再開可能にし、`verify:future-native-safe-pipeline:resume` / `verify:future-native-artifact-suite:resume` を追加。future-native suite summary は resume 情報付きの現結果へ更新。
- Phase 4: 継続検証中
- Phase 5: 完了（`node scripts/verify-phase5.mjs` pass）
- Phase 5 closeout: completion-report を authority に統合、旧 closeout / handoff は `docs/archive/retired/` へ退役
- Source baseline: `npm run typecheck` / `node scripts/run-vite.mjs build` pass
- 最新進捗: Task 6 対象 13 系統の scene system を Shared / Runtime / Render の三層へ分割完了、audio legacy conflict manager を derived / clipboard / batch-state / batch-actions / focused-actions へ再整理、Audio Route Editor に drag sort を追加、sequence trigger debug に recent history を追加、dead code audit を機械化して `useAudioRouteEditor.ts` / `sceneVolumeFogSystemShared.ts` / `op_candidates.ts` を整理
- 残課題: live browser 実測の固定採取（external blocker）。audio tab hook の内部再整理は closeout report 生成まで完了。配布 zip は `scripts/verify-package-integrity.mjs` / `scripts/package-full-zip.mjs` / `scripts/doctor-package-handoff.mjs` / `scripts/generate-closeout-report.mjs` により root files / critical node_modules / zip structure / manifest recovery plan / handoff decision を機械検査できる。dead code report は継続監視。
- Audio tab split: route editor / sequence trigger / legacy conflict / synth / legacy sliders 分離 + state / curation / route-transfer / route-core / legacy-conflict-manager hook 化済み。manager 内も derived-state / clipboard / batch-state / batch-actions / focused-actions へ再分割。route editor は Up/Down に加えて drag sort に対応。sequence trigger は state snapshot に加えて trigger / blocked / exit の recent history を表示。

## 主要コマンド
- `npm run typecheck`
- `node scripts/run-vite.mjs build`
- `node scripts/verify-phase4.mjs`
- `node scripts/verify-phase5.mjs`
- `node scripts/verify-suite.mjs`
- `npm run verify:future-native-safe-pipeline:resume`
- `npm run verify:future-native-artifact-suite:resume`
- `node scripts/verify-dead-code.mjs`
- `node scripts/verify-package-integrity.mjs --strict`
- `node scripts/package-full-zip.mjs --allow-partial`
- `node scripts/doctor-package-handoff.mjs`
- `node scripts/generate-closeout-report.mjs`

## 既知の制約
- browser/live verifier は sandbox 側制約で fallback 経路に寄ることがある
- doctor は manifest 単体でも package class / recovery plan を判定できる
- 現在の worktree では `node_modules/skia-canvas` 欠損が package integrity report / doctor report で検出される。受領 zip ごとの差分は report を正として判断する
- `verify-phase4` はこの環境で待機不安定になることがある
- Tailwind panel font tokens centralized (`text-panel`, `text-panel-sm`, `text-panel-xs`, `text-panel-lg`).

## 変更履歴
- 詳細は `docs/archive/status-history.md` を参照
- Dead code prune: 低リスク unused export を整理済み
- 2026-04-05: `scripts/verify-dead-code.mjs` を追加し、path alias / worker query を含む静的監査を固定。`components/useAudioRouteEditor.ts` / `components/sceneVolumeFogSystemShared.ts` / `op_candidates.ts` を削除し、report 上の application candidates を 0 件にした。
- Task 2 dependency direction normalization: motionCatalog / controlPanel shared types migrated from components boundary
- Task 6: 13 系統すべての scene system を Shared / Runtime / Render + facade に三層化完了。
- Task 1: audio tab 本体は薄い合成コンポーネント化を維持しつつ、legacy conflict manager を derived-state / clipboard 層へ再整理。

- 2026-04-05: package manifest を `full-local-dev` / `platform-specific-runtime-bundled` / `source-only` に統一し、manifest に recovery plan（bootstrap 必要性 / 推奨コマンド）を埋め込むよう更新。`scripts/doctor-package-handoff.mjs` と `scripts/write-package-manifest.mjs` を追加。

- 2026-04-05: `scripts/generate-closeout-report.mjs` を追加し、package integrity / dead code / manifest recovery plan を統合した closeout report を生成可能にした。`doctor-package-handoff` は report 非依存で manifest 単体からも判定できるよう更新。

- 2026-04-06: package class の canonical 名を `source-only` / `full-local-dev` / `platform-specific-runtime-bundled` へ統一。scripts は旧 `source` / `full` / `partial-full` manifest も alias として読めるよう後方互換を維持。

### 2026-04-06 missing-layers patch overlay status
- patch overlay program: 100%
- mainline integration preparation: 100%
- end-to-end program: 95%
- future-native families: 22/22
- project-integrated families: 22/22
- render handoff mode bindings: 17
- worker packets: 26
- low-risk bundles: 9
- family closure blueprints: 22
- direct patch candidates: 18
- review-ready direct candidates: 17
- needs-review direct candidates: 1
- specialist review queue: 4
- archive duplicate relative paths: 188

### 2026-04-06 overlay verify matrix
- node scripts/verify-missing-layers-overlay.mjs --repo .
- node scripts/verify-missing-layers-worker-packets.mjs --repo .
- node scripts/verify-missing-layers-low-risk-patches.mjs --repo .
- node scripts/verify-missing-layers-family-closure-patches.mjs --repo .
- node scripts/verify-missing-layers-direct-patch-candidates.mjs --repo .
- node scripts/verify-missing-layers-mainline-integration-order.mjs --repo .
- node scripts/verify-missing-layers-truth-sync-patches.mjs --repo .
- npm run verify:future-native-project-state-fast
- npm run verify:future-native-safe-pipeline:core

### 2026-04-06 mainline truth sync gate
- 未完了: CURRENT_STATUS.md / REVIEW.md / DOCS_INDEX.md への正本同期
- 未完了: specialist-native 4件の最終 review
- 未完了: volumetric-smoke の最終判定
- 注意: runtime 本体は未変更。現時点では additive overlay のみ。
