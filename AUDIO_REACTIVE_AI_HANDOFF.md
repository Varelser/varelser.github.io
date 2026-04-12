# AUDIO_REACTIVE_AI_HANDOFF

## この文書の目的

後から別の AI がこの repo を読んでも、音反応拡張の本筋を誤解しないようにするための handoff です。

## 結論

この repo の音反応は、**既存経路を壊さずに新経路を横に増やす**のが正しいです。

いきなり全面置換してはいけません。

## まず読むファイル

1. `CURRENT_STATUS.md`
2. `AUDIO_REACTIVE_ARCHITECTURE.md`
3. `AUDIO_REACTIVE_ROADMAP.md`
4. `AUDIO_REACTIVE_COVERAGE_MATRIX.md`
5. `types/audioReactive.ts`
6. `lib/audioReactiveConfig.ts`
7. `lib/audioReactiveRuntime.ts`
8. `lib/audioReactiveRegistry.ts`
9. `lib/audioReactiveTargetSets.ts`
10. `lib/useAudioController.ts`
11. `components/controlPanelTabsAudio.tsx`
12. `components/sceneParticleSystemRuntimeAudio.ts`

## 現在の状態

### 既存の正本
- `audioRef` (`AudioLevels`)
- legacy slider 群
- particle uniform 直接更新
- 各 subsystem の `audioReactive` 単一値

### route 基盤として追加済み
- `AudioFeatureFrame`
- `AudioModulationRoute`
- capability registry
- `audioFeatureFrameRef`
- config 保存欄 (`audioRoutes`)
- legacy slider → route bridge helper
- route evaluator
- target set helper

### live runtime 化済み
- particle
- line
- fog
- growth
- camera
- screen overlay
- surface family（brush / patch / membrane / shell）
- crystal
- voxel
- reaction
- deposition / crystal deposition

### UI でできること
- audioRoutes の有効化
- legacy slider 群から route 同期
- preset pack の追加
- route 数 / documented target 数の確認
- route の個別 CRUD
- family / source / state / search filter
- visible routes の bulk enable / disable / invert
- visible routes の bulk mode / curve 適用
- route の Up / Down 並び替え
- all routes の source / target / family sort
- route transfer bundle の export / import / file load
- visible routes 数値一括オフセット
- route の追加 / 複製 / 削除
- source / target / mode / curve / amount / bias / clamp / smoothing / attack / release / notes 編集

### まだ不足していること
- drag sort
- legacy slider parity の残差確認
- route transfer の validation 表示強化
- manual residual custom conflict の queue 導線

## 重要な意図

route は、**いま使うためだけのものではなく、今後の移行先を固定するための schema** です。

したがって、今後も以下を守ること。

- registry に無い target 名を勝手に使わない
- legacy slider を先に削除しない
- subsystem ごとに attack / release を再実装しない
- family 単位の helper を作り、target 解決を散らさない

## 推奨実装パターン

### よい例
- `evaluateAudioRoutes(config, audioRef.current, stateMap)`
- `resolveSurfaceAudioDrives(evaluatedRoutes)`
- `resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'line.opacity', ...)`
- `AUDIO_REACTIVE_CAPABILITY_REGISTRY` から UI 候補を出す

### 悪い例
- component 内で route 名を大量直書きする
- system ごとに別々の smoothing 方式を持つ
- UI だけ先に作って runtime 語彙を固定しない
- reserved target を live と誤記する

## 次の優先順

1. sequence trigger の threshold / cooldown を実測調整する
2. alias target を family helper ごとの固有 drive へ分岐する
3. trigger state 可視化を追加する
4. crystal / voxel / reaction / deposition の alias 語彙を必要に応じてさらに分解する
5. parity が十分に取れた target から legacy を縮退する

## 2026-04-01 状態更新

この repo は、もう「route schema だけ」の段階ではない。

### live coverage 正本
- `AUDIO_REACTIVE_COVERAGE_MATRIX.md`

### 本日の追加
- `crystal` / `voxel` / `reaction` / `deposition` 系 target を first-pass live 化
- `crystal-bloom` / `voxel-grid` / `reaction-pulse` / `deposition-etch` preset pack を追加
- `lib/audioReactiveTargetSets.ts` を family helper へ拡張
- deposition field / crystal deposition を同一 deposition 語彙で束ねた
- `sequence.stepAdvance` / `sequence.crossfade` / `sequence.randomizeSeed` を first-pass live 化
- `sequence-gates` preset pack を追加

### 今回 live 化した runtime
- `components/sceneCrystalAggregateSystemRuntime.ts`
- `components/sceneVoxelLatticeSystem.tsx`
- `components/sceneReactionDiffusionSystemRuntime.ts`
- `components/sceneDepositionFieldSystem.tsx`
- `components/sceneCrystalDepositionSystem.tsx`

### 次の本命
- sequence runtime: `lib/useSequenceAudioTriggers.ts` で first-pass live
- route editor の drag sort / bulk edit


## 2026-04-01 追記（route editor first-pass live）

### 今回の追加
- `types/audioReactive.ts` に runtime 用の列挙定数を追加
- `lib/audioReactiveConfig.ts` に `createAudioRouteSeed()` を追加
- `components/controlPanelTabsAudio.tsx` で route editor を first-pass live 化

### route editor で今できること
- route の追加
- route の複製
- route の削除
- source / target / mode / curve の選択
- amount / bias / clamp / smoothing / attack / release の編集
- notes の記録

### 残り
- drag sort
- family filter
- bulk duplicate / bulk disable


### 今回の UI 追加
- `components/controlPanelTabsAudio.tsx` に route editor の family filter / source filter / state filter / search を追加。
- visible routes 向け bulk actions と、route 単位の Up / Down reorder を追加。
- all routes へ source / target / family sort を追加。

## 最新 handoff 補足

- sequence trigger の tuning は `config.audioSequenceEnterThreshold` / `config.audioSequenceExitThreshold` / `config.audioSequence*CooldownMs` を見る。
- route transfer は `lib/audioReactiveIO.ts` を正本として使う。
- Audio タブの transfer box は JSON 配列または bundle object の両方を受ける。

- route transfer は text box だけでなく file load でも append / replace できる。
- visible routes には amount / bias / clampMin / clampMax / smoothing / attack / release の一括オフセット UI がある。


## 2026-04-01 v7 handoff

- `lib/audioReactiveTargetSets.ts` は second-stage family drive へ移行済み。generic target だけで family alias を拾う設計ではなく、helper が `generic + family-specific` を合成する。
- `lib/audioReactiveRuntime.ts` では true alias のみを残した。surface / crystal / voxel / reaction / deposition の family alias は helper で扱う。
- `lib/useSequenceAudioTriggers.ts` は `lib/audioReactiveDebug.ts` へ debug snapshot を出す。Audio タブは polling でこれを表示する。
- 次 AI は drag-drop import と sequence tuning preset を優先。


## 2026-04-01 v8 handoff

- `lib/audioSequenceTriggerPresets.ts` を追加し、sequence tuning を UI 直書きではなく preset 定義で管理する形にした。
- `components/controlPanelTabsAudio.tsx` は route transfer box で file picker だけでなく drag-drop も受ける。drop mode は box / append / replace を共有する。
- 次 AI は、drag-drop 後の validation summary と legacy slider parity 残差確認を優先。


## 2026-04-01 v9 handoff

- `lib/audioReactiveValidation.ts` を追加。transfer box の JSON validation と legacy parity summary の正本はここ。
- `components/controlPanelTabsAudio.tsx` は transfer box の現在値を `validateAudioRouteBundleText()` へ通し、summary を live 表示する。
- import append / replace は validation OK のときだけ有効。
- parity summary は `summarizeLegacyAudioRouteParity(config, config.audioRoutes)` を使う。残差が 0 になるまで old slider 縮退は始めない。


## 2026-04-01 v10 handoff

- `validateAudioRouteBundleText()` は第2引数に current routes を受け、transfer box の JSON と現在 route 群の diff summary を返す。
- `components/controlPanelTabsAudio.tsx` は validation summary 内で changed / added / removed sample まで表示する。
- `summarizeLegacyAudioRouteParity()` は `deprecationOrder` を返す。status は `safe / review / blocked`。
- 次 AI は、review-blocked hide 状態で残っている slider だけを優先確認し、safe 候補を既定で隠すかどうかを md に固定する。


## 2026-04-01 v11 handoff

- `lib/sceneRenderRoutingRuntimePredicates.ts` と `lib/starterLibraryPresetExtensionChunk05PostFx.ts` の import 欠落を修正し、`npm run typecheck:audio-reactive:attempt` は pass した。
- 専用レールは `bootstrap:dev` → `check:audio-reactive` → `verify:audio-reactive` → `typecheck:audio-reactive:attempt` の順で回す。
- `components/controlPanelTabsAudio.tsx` は legacy slider visibility mode `all / review-blocked` を持つ。review-blocked では parity の `safe` 候補だけを隠す。
- 次 AI は、review / blocked に残る slider の residual を優先し、削除そのものはまだ行わない。


## 2026-04-01 v12 handoff

- `lib/audioReactiveLegacyFixes.ts` を追加。legacy slider parity を見ながら route 側へ `appendMissing / alignResiduals / dedupeExact / removeStaleLegacy` を適用できる。
- `components/controlPanelTabsAudio.tsx` は `Run Safe Auto-Fix Pass` を持つ。これは上記4操作を一度に走らせる first-pass 用。
- auto-fix は route id を可能な限り維持し、best match route の値だけを legacy expected へ揃える。
- 次 AI は、auto-fix 後の residual が preset / import / sequence 保存に影響しないかを優先確認する。

## 2026-04-01 v13 handoff

- `types/configAudio.ts` に `audioLegacySliderVisibilityMode` を追加した。次 AI は local state ではなく config 値を正本として扱う。
- `types/audioReactive.ts` に `AudioLegacySliderVisibilityMode` と `AUDIO_LEGACY_SLIDER_VISIBILITY_MODES` を追加した。
- `components/controlPanelTabsAudio.tsx` は `all / review-blocked / retired-safe` を切り替える。`retired-safe` は safe slider を active panel view から外す preview 段階。
- `AUDIO_REACTIVE_LEGACY_RETIREMENT.md` が段階縮退の正本。次 AI は safe 削除へ進む前にこの md を更新する。


## 2026-04-01 追記（retirement impact）

- `lib/audioReactiveRetirementImpact.ts` を追加。
- これは `summarizeLegacyAudioRouteParity()` を presets / presetSequence / keyframeConfig に横展開し、review / blocked が保存物へどれだけ残っているかを要約する。
- Audio タブの `Retirement Impact / Presets + Sequence` は、legacy slider 実削除前の判断材料として使う。
- `current config が safe` でも、preset library や sequence keyframe に review / blocked が残っていれば、まだ preview retirement 段階に留める。


## 2026-04-01 追記（stored context migration）

- `lib/audioReactiveRetirementMigration.ts` を追加した。
- 目的は current config だけでなく、saved presets と sequence item の custom keyframeConfig に残る review / blocked を safe pass で減らすこと。
- Audio タブには `Fix Stored Presets + Keyframes` / `Fix Saved Presets` / `Fix Sequence Keyframes` がある。
- これは UI 上の preview retirement より一段深いが、まだ legacy slider 実削除ではない。


## 2026-04-01 追記（review collapse）

- parity summary は `reviewDuplicateOnly / reviewResidualOnly / reviewMixed / reviewCollapsibleDuplicateCount` を返す。
- `Collapse Legacy-Owned Review Duplicates` は、legacy-owned extra route だけを collapse する。
- custom duplicate が混ざる review は自動 collapse しない。


## 2026-04-01 追記（custom duplicate conflict の一部整理）

- `review` はさらに `shadowed by custom exact` と `other custom duplicate conflict` を見分ける。
- `shadowed by custom exact` は、custom route が exact を持っているため、legacy 影ルートだけ安全側に除去できる。
- current config は `Remove Legacy Shadowed by Custom Exact`、stored contexts は `Remove Stored Legacy Shadowed by Custom Exact` で進める。


## 2026-04-01 追記（custom conflict hotspot workflow）

- `other custom duplicate conflict` は一括自動解決しない。
- 代わりに `customConflictHotspots` を使い、context 数が多い key から順に手で整理する。
- Audio タブの `Custom Conflict Hotspots` は `current / presets / sequence linked presets / keyframes` をまたいで hotspot を並べる。
- `Focus In Route Editor` で当該 key だけに route editor を絞り込み、どの custom route が不要かを判断する。


## 2026-04-01 追記（v18 exact custom duplicate collapse）

- `lib/audioReactiveLegacyFixes.ts` に `collapseExactCustomDuplicates` と `onlyKey` を追加した。
- `components/controlPanelTabsAudio.tsx` から current / stored contexts へ exact custom duplicate collapse を実行できる。
- `Custom Conflict Hotspots` の各 key から、focus だけでなく key 単位 collapse を直接実行できる。
- この helper は `routesAreExactValueMatch()` で完全一致する custom routes のみを対象にする。
- residual を持つ custom conflict は対象外。

## 2026-04-01 追記（focused conflict inspector）

- `lib/audioReactiveValidation.ts` に `summarizeFocusedCustomConflict()` を追加。
- `components/controlPanelTabsAudio.tsx` で focused conflict key に対する `Focused Conflict Inspector` を live 表示する。
- Inspector は dominant route / recommendation / amount spread / bias spread / timing spread / route detail を返す。
- 残る conflict は route schema の不足よりも route 内容の運用整理なので、今後は `hotspot -> focus -> inspector` を基準導線にする。


## 2026-04-01 v20 追記（focused recommendation actions）

- `Focused Conflict Inspector` は表示だけでなく、focused key に対する recommendation action を持つ。
- `Apply Focused Recommendation`:
  - `collapse-exact-custom` → exact custom duplicate collapse
  - `remove-legacy-shadow` → legacy shadow removal
  - `manual-residual-merge` / `manual-custom-choice` → dominant keep + non-dominant mute
- `Mute To Dominant` は destructive delete ではなく `enabled=false` + note 追記である。
- stored contexts には `Apply Stored Recommendation` / `Mute Stored To Dominant` がある。
- これ以後の manual cleanup は、hotspot を focus → inspector recommendation を適用 → route editor で差分確認、の順が最短。

## 2026-04-01 追記（hotspot batch pass）

### 今回の追加
- `Apply Hotspot Recommendation`
- `Apply Top 3 Recommendations`
- `Apply Top 8 Recommendations`

### 意図
- `Focused Conflict Inspector` を毎回 1 key ずつ押す負担を減らす
- 上位 hotspot を current config 上で recommendation 順にまとめて処理する

### 注意
- これは current config 用の batch pass であり、stored contexts の recommendation を current detail で流用してはいけない
- stored contexts は config ごとに detail が異なり得るため、今後入れるとしても別 helper に分けること

## 2026-04-01 追記（stored hotspot batch）

- `applyHotspotRecommendationsToStoredContexts()` を追加した。
- Audio タブから `Apply Stored Top 3` / `Apply Stored Top 8` を実行できる。
- 各 hotspot 行には `Apply Stored Hotspot Recommendation` があり、saved presets / sequence keyframes 側でも key 単位 recommendation を適用できる。
- stored contexts は config ごとに detail が異なるため、current の focused detail を使い回さず、context ごとに `summarizeFocusedCustomConflict()` を再評価する実装にしている。
- 以後の最短導線は `Apply Top 3/8` で current を前進 → `Apply Stored Top 3/8` で presets / keyframes を追従 → 残差だけ focus して詰める、である。


## 2026-04-01 追記（everywhere batch）

- `Custom Conflict Hotspots` には `Apply Top 3 Everywhere / Apply Top 8 Everywhere` がある。
- これは current config と stored contexts を同じ key 群で同時に進める batch pass。
- 実行後は `Last Hotspot Batch` を見て、hotspots / contexts がどれだけ減ったかを確認する。
- 次の key 選定は `Last Hotspot Batch` 後の残り hotspot を基準に行う。


## 2026-04-01 追記（manual residual queue）

- `components/controlPanelTabsAudio.tsx` に `Manual Residual Queue` を追加。
- queue は `legacyRetirementImpact.customConflictHotspots` を起点に、`summarizeFocusedCustomConflict()` の recommendation が `manual-custom-choice` / `manual-residual-merge` の key だけを current config から抽出する。
- `Focus Previous Manual` / `Focus Next Manual` で queue を順送りできる。
- `Apply Focused + Next` は recommendation 適用と次 key focus を一度に行う。
- これにより、everywhere batch 後の residual conflict は hotspot 一覧へ戻らずに連続処理できる。


## 2026-04-01 追記（stored manual queue）

- `summarizeStoredFocusedConflict()` を追加し、stored contexts に残る manual residual を key 単位で集計できるようにした。
- Audio タブには `Stored Manual Residual Queue` があり、saved presets / sequence keyframes 側の `manual-custom-choice` / `manual-residual-merge` を順送りに処理できる。
- current queue と stored queue は別物として扱うこと。current config の focused detail を stored contexts の正本だとみなしてはいけない。


## 2026-04-01 v26

- current queue / stored queue の次段として、manual residual batch pass を追加した。
- Audio タブには `Apply Top 3 Manual / Apply Top 8 Manual`、`Apply Stored Top 3 Manual / Apply Stored Top 8 Manual`、`Apply Top 3 Manual Everywhere / Apply Top 8 Manual Everywhere` がある。
- `Last Manual Batch` は current manual / stored manual の before -> after と適用数を返す。
- 以後の最短導線は、`Manual Everywhere` を先に回してから、残る key だけを `Focused Conflict Inspector` で詰めること。


## 2026-04-01 追記（residual merge path）

- `manual-residual-merge` は `align-residuals` を key 限定で使うのが新しい第一選択です。
- current は `Apply Focused Recommendation` または `Align Focused Residual to Legacy`、stored は対応する stored 操作で進めます。
- mute は `manual-custom-choice` のように意図差が残る conflict に限定します。


## 2026-04-01 v27 追加: current route-level curation

- `Focused Conflict Inspector` の各 route 行に `Keep This Route` / `Keep + Next` を追加した。
- これは current config の `manual-custom-choice` を key 単位ではなく route id 単位で curate するための操作である。
- 実装は削除ではなく `mute-focused-conflict` を使うため、復旧しやすい。
- 以後、dominant 推奨が意図と合わない key はこの操作で先に current を整理し、その後 stored contexts へ波及させる。

### 2026-04-01 v28
- `Focused Conflict Inspector` から stored contexts 側にも route 行ごとの keep を実行できる。
- stored 側は route id を直接使わず、route 署名で最も近い route を keep する。


## 2026-04-01 v29 追加

- `audioCurationHistory` を config 永続項目として追加。
- current / stored / everywhere の curation 操作で、key 単位の履歴を保存できるようにした。
- `Recent Curation History` を Audio タブへ追加。
- 履歴から `Focus Key` で同じ key を再度開けるようにした。
- これにより、同じ high-load key を何度も探し直す運用コストを減らした。


## 2026-04-01 追記（curation queue filter）

- `audioCurationHistory` は履歴表示だけでなく、queue filter の入力にも使う。
- `config.audioCurationQueueFilterMode` は `all / hide-curated / only-curated`。
- `hide-curated` は current/stored hotspot と manual queue を履歴済み key で自動的に薄める通常運用モード。
- `Apply Top N` 系 batch は visible queue を対象にするため、filter mode がそのまま実行対象の絞り込みになる。


## 2026-04-01 追記（pending summary）

- `Last Hotspot Batch` は total に加えて pending hotspots / pending contexts を返す。
- `Last Manual Batch` は pending current / pending stored を返す。
- pending は `audioCurationHistory` 未登録 key を意味する。
- 以後、queue filter を使っているときの進行判断は total より pending を優先する。


## 2026-04-01 v31 追加

- history filter 後の queue を前提に、未処理 key の before / after sample を batch summary へ追加した。
- `Last Hotspot Batch` は pending hotspot / context 数に加えて、pending sample before / after を表示・コピーできる。
- `Last Manual Batch` は pending current / stored 数に加えて、pending current sample before / after と pending stored sample before / after を表示・コピーできる。
- これにより、残り 1% の運用整理は「未処理 key がどれだけ減ったか」だけでなく「どの未処理 key が残っているか」まで毎回固定できる。
