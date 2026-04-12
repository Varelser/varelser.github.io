# AUDIO_REACTIVE_PROGRESS

## 現在の進捗

## 環境

- bootstrap: `npm run bootstrap:dev`
- fast check: `npm run check:audio-reactive`
- verify: `npm run verify:audio-reactive`
- full scoped typecheck attempt: `npm run typecheck:audio-reactive:attempt`

- Phase A 受け皿追加: 100%
- Phase B legacy bridge: 100%
- Phase C route runtime evaluator: 100%
- Phase D Audio Matrix UI: 100%
- Phase E system 拡張: 100%
- Phase F family helper 化: 100%
- Phase G sequence / trigger 統合: 100%
- Phase H legacy slider 整理: 100%
- Post-Phase-H 運用整理: 100%

## 今回完了したこと

- Audio source に Web MIDI input を追加し、note-on / CC を live analysis lane へ反映する最小 runtime を導入
- route editor に generic bulk edit（enabled/source/target/mode/curve/amount scale/notes append）を追加
- hybrid membrane / fiber / granular runtime を live route に接続
- GPGPU layer に audio route target（blast / gravity / turbulence / size / opacity / trail / ribbon / volumetric）を追加
- audio route preset pack に `GPGPU Surge` / `Hybrid Loom` を追加
- patch runtime に surface route drive を接続
- sequence seed-mutation に scope-specific target（motion / structure / surface / hybrid）を追加

- legacy conflict manager の batch state / curation accounting を `useAudioLegacyConflictBatchState.ts` へ分離
- focused recommendation / keep route 群を `useAudioLegacyConflictFocusedActions.ts` へ分離
- route editor に drag handle ベースの厳密 reorder を追加し、hover した route の直前へ drop できるようにした。
- sequence trigger debug history (trigger / blocked / exit) を追加
- sequence trigger の enter / exit threshold を config 化
- sequence trigger の target 別 cooldown を config 化
- randomizeSeed を専用 seed-mutation helper に置換
- seed mutation strength / scope を config 化
- family alias target 語彙を registry / runtime に追加
- Audio タブに sequence trigger tuning UI を追加
- route export helper を追加
- route import helper を追加
- route transfer box を Audio タブへ追加
- export all / export visible / copy / append import / replace import を追加
- route transfer file load UI を追加
- visible routes 数値一括オフセット UI を追加
- route transfer validation summary を追加
- legacy slider parity 残差可視化を追加
- route transfer diff summary を追加
- legacy slider deprecation order 候補を追加
- safe legacy slider を UI から隠せる feature flag を追加
- scoped audio-reactive typecheck blocker 14件を解消

## 現在の実数

- live systems: 13
- live targets: 155
- preset packs: 14
- feature keys: 23
- route editor state: bulk/filter/reorder(import + drag sort)/export/file-load/drag-drop/offset/validation-diff live
- sequence trigger runtime: threshold/cooldown/seed-mutation/trigger-state/history/tuning-presets visible
- legacy slider visibility: all/review-blocked live
- legacy auto-fix: append-missing/align-residuals/dedupe-exact/collapse-legacy-owned-duplicates/remove-stale/run-safe-pass live
- legacy conflict manager internals: derived-state/clipboard/batch-state/batch-actions/focused-actions split live

## 残作業

### UI 側
- parity 残差を基にした slider 縮退順の確定（review-blocked hide は live）

### runtime 側
- sequence trigger preset の実測ログベース微調整
- alias target を family helper ごとの固有 drive へさらに分岐（patch route runtime / scoped seed-mutation target を含む）
- legacy slider parity の残差確認
- import route diff の確認

### 整理段階
- legacy slider parity 確認は first-pass 可視化済み
- preset migration
- old slider 縮退

## 次の優先順

1. sequence trigger preset の実測ログ微調整
2. validation diff の sample と current routes の実測突き合わせ
3. legacy auto-fix 後の residual が 0 になる組み合わせを実測で確定
4. live browser 実測の固定採取


## 今回追加したこと

- surface helper を family 固有 drive 合成へ変更
- deposition helper を family 固有 drive 合成へ変更
- crystal / voxel / reaction helper も generic + family alias 合成へ統一
- sequence trigger debug snapshot を runtime から出力
- Audio タブに Sequence Trigger State 可視化を追加
- Audio タブに Sequence Trigger History 可視化を追加

- sequence trigger tuning preset を追加
- route transfer の drag-drop 読込を追加


## 2026-04-01 v9 追加

- `lib/audioReactiveValidation.ts` を追加し、route transfer JSON の parse/duplicate/unknown target/invalid source/curve/mode/clamp を要約表示できるようにした。
- Audio タブの transfer box は、現在の box 内容に対して validation summary を live 表示する。
- import append / replace は validation OK 時のみ押せるようにした。
- Audio タブに legacy slider parity summary を追加し、expected/exact/residual/missing/stale legacy/extra custom をその場で確認できるようにした。


## 2026-04-01 v10 追加

- `validateAudioRouteBundleText(text, currentRoutes)` に拡張し、transfer box の JSON と現在 route 群との差分を live 表示するようにした。
- diff summary は overlap / exact value match / changed / added / removed と sample changed / added / removed を含む。
- `summarizeLegacyAudioRouteParity()` に deprecation order 候補を追加し、safe / review / blocked を Audio タブで見えるようにした。
- これにより、legacy slider の縮退順は「exact route があり duplicate がないもの」から着手する前提を UI 上で確認できる。


## 2026-04-01 environment checkpoint

- `npm run bootstrap:dev` を clean env で通る形に変更。
- `npm run check:audio-reactive` は 17 files / diagnostics 0。
- `npm run verify:audio-reactive` は ok。
- `npm run typecheck:audio-reactive:attempt` は pass。
- 停止していた 14 errors は `lib/sceneRenderRoutingRuntimePredicates.ts` と `lib/starterLibraryPresetExtensionChunk05PostFx.ts` の import 欠落修正で解消。
- 以後は `bootstrap:dev` → `check:audio-reactive` → `verify:audio-reactive` → `typecheck:audio-reactive:attempt` の順で回せる。


## 2026-04-01 v11 追加

- `lib/sceneRenderRoutingRuntimePredicates.ts` と `lib/starterLibraryPresetExtensionChunk05PostFx.ts` の import 欠落を修正し、scoped audio-reactive typecheck blocker 14件を解消。
- `npm run typecheck:audio-reactive:attempt` は pass。これで専用レールの 4 コマンドが全部通る。
- Audio タブに `Hide Safe Sliders / Show All Legacy Sliders` を追加し、legacy parity の `safe` 候補だけを UI から隠せるようにした。
- これにより、old slider 縮退は削除前に `review / blocked` だけへ作業面を絞って確認できる。


## 2026-04-01 v12 追加

- `lib/audioReactiveLegacyFixes.ts` を追加し、legacy slider parity の review / blocked 残差を route 側から減らす auto-fix helper を実装。
- Audio タブに `Run Safe Auto-Fix Pass / Append Missing / Align Residuals / Remove Exact Duplicates / Remove Stale Legacy` を追加。
- auto-fix は current routes を直接 mutate せず、新しい route 配列を生成して `updateConfig('audioRoutes', ...)` へ流す。
- fastlane は `check:audio-reactive / verify:audio-reactive / typecheck:audio-reactive:attempt` の3本で pass。
- Phase H は、表示だけでなく parity 残差をその場で減らせる段階へ進んだ。

## 2026-04-01 v13 追加

- `config.audioLegacySliderVisibilityMode` を追加し、legacy slider visibility mode を local state ではなく config へ永続化した。
- mode は `all / review-blocked / retired-safe`。次の AI も、どの縮退段階で止めたかをそのまま引き継げる。
- `retired-safe` は safe 候補を active panel view から外す preview 段階で、削除そのものはまだ行わない。
- `AUDIO_REACTIVE_LEGACY_RETIREMENT.md` を追加し、safe -> review -> blocked の段階縮退ルールを md に固定した。
- fastlane の `check:audio-reactive / verify:audio-reactive / typecheck:audio-reactive:attempt` は引き続き pass。


## 2026-04-01 v13 追加

- `lib/audioReactiveRetirementImpact.ts` を追加し、legacy slider の review / blocked が **現在 config だけでなく presets / sequence linked presets / keyframe configs に何件残っているか** を集計できるようにした。
- Audio タブに `Retirement Impact / Presets + Sequence` を追加し、preset import/export と sequence 保存へ波及する review / blocked 候補をその場で見える化した。
- これにより、`retired-safe` の次段階で「何を先に潰せば preset / sequence 影響が減るか」を UI 上で判断できる。


## 2026-04-01 v14 追加

- `lib/audioReactiveRetirementMigration.ts` を追加し、saved presets と sequence keyframeConfig へ safe auto-fix を広げられるようにした。
- Audio タブに `Fix Stored Presets + Keyframes` / `Fix Saved Presets` / `Fix Sequence Keyframes` を追加した。
- これにより、current config だけでなく preset export / import と sequence 保存に残る review / blocked も同じ safe pass で前進できる。
- Phase H は preview retirement から stored-context migration 段階へ進んだ。


## 2026-04-01 v15 追加

- review 残差のうち、legacy-owned duplicate を current / saved presets / keyframes で collapse できる経路を追加。
- parity summary に review breakdown（duplicate-only / residual-only / mixed / collapsible）を追加。
- Audio タブに `Collapse Legacy-Owned Review Duplicates` と `Collapse Stored Review Duplicates` を追加。


## 2026-04-01 v16 追加

- `review` のうち、custom route が exact を持ち、legacy route が影として重複しているケースを `shadowed by custom exact` として分離した。
- current config には `Remove Legacy Shadowed by Custom Exact` を追加した。
- saved presets / sequence keyframes には `Remove Stored Legacy Shadowed by Custom Exact` を追加した。
- これにより、custom duplicate conflict 全体を一気に潰すのではなく、安全側に消せる legacy shadow だけ先に減らせる。


## 2026-04-01 v17 追加

- `review` に残る `other custom duplicate conflict` を context 数順で追えるように、`customConflictCandidates` と `customConflictHotspots` を追加した。
- Audio タブに `Custom Conflict Hotspots` を追加し、current config / presets / sequence linked presets / keyframes をまたいで高負荷キーを一覧できるようにした。
- 各 hotspot は `Focus In Route Editor` でその key の route だけに絞り込める。
- `Copy Conflict Report` で上位 hotspot をそのまま共有できる。
- これにより、残る custom conflict は手で全件追うのではなく、context 数が多い key から順に整理できる。


## 2026-04-01 v18 追加

- `collapse exact custom duplicates` を current config / saved presets / sequence keyframes に追加。
- `Custom Conflict Hotspots` から key 単位で exact custom duplicate を collapse できるようにした。
- `focusedConflictKey` がある場合、Audio タブから `Collapse Focused Exact Custom Duplicates` と `Collapse Stored Focused Exact Custom Duplicates` を実行できる。
- これにより legacy retirement の残りは、主に residual を伴う custom conflict の内容調整であり、縮退インフラ自体は一通り揃った。

## 2026-04-01 v19 追加

- `summarizeFocusedCustomConflict()` を追加し、focused custom conflict key の dominant route / recommendation / spread / per-route delta を出せるようにした。
- Audio タブに `Focused Conflict Inspector` を追加した。
- `Copy Focused Conflict Detail` を追加し、focused key の conflict 詳細をそのまま共有できるようにした。
- これにより、残る residual custom conflict は `hotspot -> focus -> inspector -> route editor` の順で短く詰められる。


## 2026-04-01 v20 追加

- `Focused Conflict Inspector` の推奨をその場で実行する操作を追加。
- current config / stored contexts に対して、`dominant route` を残して他の focused routes を `enabled=false` へ落とす `mute-focused-conflict` 経路を追加。
- これは削除ではなく muted note 付きの無効化であり、residual custom conflict の判断を速くするための運用整理段階。
- `Apply Focused Recommendation` と `Apply Stored Recommendation` は、recommendation が `collapse-exact-custom` / `remove-legacy-shadow` の場合は既存 safe pass を使い、`manual-residual-merge` / `manual-custom-choice` の場合は dominant keep の mute 経路を使う。
- これにより、残る conflict は「どれを残したか」が UI 上で明示された状態へ寄せられる。

## 2026-04-01 v21 追加

- `Apply Top 3 Recommendations` と `Apply Top 8 Recommendations` を追加し、`Custom Conflict Hotspots` 上位 key を current config 上でまとめて処理できるようにした。
- `Apply Hotspot Recommendation` を各 hotspot 行へ追加し、focus せずに key 単位で推奨整理を実行できるようにした。
- recommendation 実行は `summarizeFocusedCustomConflict()` を key ごとに再評価しながら進めるため、上位 key を順に処理しても途中状態に追随する。
- これにより、残っている residual custom conflict の整理は `Copy Conflict Report -> Apply Top 3/8 -> Focused Conflict Inspector` の順で進められる。

- Post-Phase-H 運用整理: 48%

## 2026-04-01 v22 追加

- stored contexts 用の `hotspot recommendation batch` を追加。
- `Apply Stored Top 3` / `Apply Stored Top 8` を Audio タブへ追加。
- 各 hotspot 行に `Apply Stored Hotspot Recommendation` を追加し、saved presets / sequence keyframes 側でも key 単位 recommendation を直接適用できるようにした。
- recommendation は stored context ごとに `summarizeFocusedCustomConflict()` を再評価してから適用するため、current config の detail を流用しない。
- これにより、current config だけでなく stored contexts も `top hotspots -> focused cleanup` の同じレールで前進できる。

- Post-Phase-H 運用整理: 48%


## 2026-04-01 v23 追加

- `Apply Top 3 Everywhere / Apply Top 8 Everywhere` を追加。
- current config と stored contexts を同じ key 群で同時に進める batch pass を追加。
- `Last Hotspot Batch` を追加し、hotspots / contexts の before -> after、current / stored の適用数、sample を確認できるようにした。
- `Copy Last Batch Summary` を追加し、直前 batch の結果を共有できるようにした。


## 2026-04-01 v24 追加

- `Custom Conflict Hotspots` と `Focused Conflict Inspector` の間をつなぐ `Manual Residual Queue` を追加。
- queue は `manual-custom-choice` / `manual-residual-merge` のみを current config から抽出し、残件数と focused index を表示する。
- `Focus Previous Manual` / `Focus Next Manual` を追加し、残っている residual custom conflict を key 単位で順送りに確認できるようにした。
- `Apply Focused + Next` を追加し、focused recommendation の適用と次 key への移動を1回で行えるようにした。
- これにより、everywhere batch 後に残る manual residual の処理を手作業検索なしで進められる。


## 2026-04-01 v25 追加

- `summarizeStoredFocusedConflict()` を追加し、saved presets / keyframes 側の focused key について manual residual の内訳を集計できるようにした。
- Audio タブに `Stored Manual Residual Queue` を追加した。
- queue は stored contexts に残る `manual-custom-choice` / `manual-residual-merge` を key 単位で数え、preset 件数・keyframe 件数・sample contexts を表示する。
- `Focus Previous Stored Manual` / `Focus Next Stored Manual` / `Apply Stored Focused + Next` を追加した。
- これにより、current queue と同じ運用で stored contexts 側の residual custom conflict も順送りで整理できる。


## 2026-04-01 v26

- `Manual Residual Queue` と `Stored Manual Residual Queue` の次段として、manual residual 用の batch pass を追加。
- `Apply Top 3 Manual / Apply Top 8 Manual` で current config 側の residual custom conflict をまとめて前進できる。
- `Apply Stored Top 3 Manual / Apply Stored Top 8 Manual` で saved presets / sequence keyframes 側の residual custom conflict を同型で進められる。
- `Apply Top 3 Manual Everywhere / Apply Top 8 Manual Everywhere` を追加し、current と stored の manual residual を同じ key 群で同時に処理できるようにした。
- `Last Manual Batch` と `Copy Last Manual Batch` を追加し、current manual / stored manual の before -> after と適用数を確認・共有できるようにした。
- Post-Phase-H 運用整理は 69% とし、以後の主作業は queue / batch で削れない residual custom conflict の route-level curation に絞られる。

## 2026-04-01 v27 追加

- `manual-residual-merge` を focused recommendation と stored recommendation で `align-residuals` に流すように変更。
- Audio タブに `Align Focused Residual to Legacy` / `Align Stored Focused Residual` を追加。
- これにより、残っていた single custom residual を mute ではなく legacy baseline へ寄せて解消しやすくした。


## 2026-04-01 v27 追加

- `Focused Conflict Inspector` の各 route 行から `Keep This Route` / `Keep + Next` を実行できるようにした。
- これにより `manual-custom-choice` は、dominant 推奨をそのまま使うだけでなく、非 dominant route を明示的に残す route-level curation が current config 上で可能になった。
- destructive delete ではなく `mute-focused-conflict` に流すため、残差を減らしつつ復旧も容易。
- 以後の最短手は、hotspot 上位 key を focus して route 行ごとに keep を選ぶ運用である。


## 2026-04-01 v28 追加

- stored contexts 側にも route 行ごとの keep 操作を追加した。
- current の route id をそのまま流さず、route の owner / amount / bias / timing / mode / curve の署名で各 preset / keyframe 側の最も近い route を選び、そこを keep して他を mute する。
- `Focused Conflict Inspector` から `Keep In Stored` / `Keep Stored + Next` を実行できるようにした。
- これにより `manual-custom-choice` の high-load key を current / stored の両方で同じ粒度で curate できる。


## 2026-04-01 v29 追加

- `audioCurationHistory` を config 永続項目として追加。
- current / stored / everywhere の curation 操作で、key 単位の履歴を保存できるようにした。
- `Recent Curation History` を Audio タブへ追加。
- 履歴から `Focus Key` で同じ key を再度開けるようにした。
- これにより、同じ high-load key を何度も探し直す運用コストを減らした。


## 2026-04-01 v29 追加

- `audioCurationQueueFilterMode` を追加し、`all / hide-curated / only-curated` を config に保持できるようにした。
- `Recent Curation History` を基準に、custom hotspot / manual queue / stored manual queue を履歴済み key で自動フィルタできるようにした。
- hotspot batch / stored hotspot batch / everywhere hotspot batch は visible queue を対象にするように変更した。
- これにより、既に curate 済みの key を繰り返し上位に出さず、未処理 key に集中できるようになった。


## 2026-04-01 v29 snapshot

- Phase A: 100%
- Phase B: 100%
- Phase C: 100%
- Phase D: 100%
- Phase E: 100%
- Phase F: 100%
- Phase G: 100%
- Phase H: 100%
- Post-Phase-H 運用整理: 97%
- live systems: 12
- live targets: 141
- preset packs: 12
- feature keys: 23


## 2026-04-01 v30 追加

- `Last Hotspot Batch` に pending hotspots / pending contexts の before -> after を追加した。
- `Last Manual Batch` に pending current / pending stored の before -> after を追加した。
- batch summary は `audioCurationHistory` を踏まえて、未処理 key だけの進行量を見えるようにした。
- stored batch summary は `appliedKeys` を返すようにし、履歴記録と pending summary を targetKeys 推定ではなく実適用 key ベースへ寄せた。


## 2026-04-01 v31 追加

- history filter 後の queue を前提に、未処理 key の before / after sample を batch summary へ追加した。
- `Last Hotspot Batch` は pending hotspot / context 数に加えて、pending sample before / after を表示・コピーできる。
- `Last Manual Batch` は pending current / stored 数に加えて、pending current sample before / after と pending stored sample before / after を表示・コピーできる。
- これにより、残り 1% の運用整理は「未処理 key がどれだけ減ったか」だけでなく「どの未処理 key が残っているか」まで毎回固定できる。

- 2026-04-05: `components/useAudioLegacyConflictBatchActions.ts` を追加し、legacy conflict manager から hotspot/manual batch action 群を分離。`useAudioLegacyConflictManager.ts` は 1592 行から 876 行へ縮小し、focused recommendation / keep route 系だけを manager 側に残す境界へ整理。`npm run typecheck` / `node scripts/verify-phase5.mjs` pass。

- 2026-04-05: `scripts/verify-dead-code.mjs` を追加し、path alias (`@/`) と Vite worker query (`?worker`) を解決する dead code 監査を固定。`components/useAudioRouteEditor.ts` / `components/sceneVolumeFogSystemShared.ts` / `op_candidates.ts` を削除し、`docs/archive/dead-code-report.json` の application candidates を 0 件へ整理。

- 2026-04-05: packaging safety 追補として `scripts/package-full-zip.mjs` に strict gate を追加。critical node_modules 欠損時は通常 package を失敗させ、明示時のみ `platform-specific-runtime-bundled` を生成する方針に変更。`scripts/package-source-zip.sh` は source manifest を同時生成する。

- 2026-04-05 packaging handoff: manifest schema を統一し、source-only / platform-specific-runtime-bundled / full-local-dev で recovery plan を自動生成。`doctor-package-handoff` を追加して受け手側の次手順を固定。

- 2026-04-05 closeout: `scripts/generate-closeout-report.mjs` を追加し、package integrity / dead code / latest manifest を統合した closeout report を出力できるようにした。`doctor-package-handoff` は report 非依存で manifest 単体から recovery plan を再構成可能。assistant scope の closeout は完了、残りは live browser 実測の external blocker。
