# AUDIO_REACTIVE_ROADMAP

## 方針

このロードマップは、音反応機能を**一気に全置換せず、段階的に移行する**ための実行順です。

## Phase A — 受け皿の追加
Status: 実施済み

目的:
- 型
- config
- route schema
- capability registry
- feature frame bridge

を先に入れ、後続 AI が作業を始められる状態にする。

## Phase B — Legacy bridge の明文化
Status: 実施済み

目的:
- 現在の slider 群を route 語彙へ翻訳できるようにする
- 後続 AI が「今の slider は route でどう表現するのか」を把握できるようにする

## Phase C — Route runtime evaluator の導入
Status: 実施済み（initial live）

実施内容:
- `sceneParticleSystemRuntimeAudio.ts` を route-aware 化
- `lib/audioReactiveRuntime.ts` を追加
- particle target の初期 live 化

## Phase D — Audio Matrix UI の初期導入
Status: 実施済み（editor first-pass live）

実施内容:
- route 有効/無効
- legacy → routes 同期
- preset pack 追加
- active route 数と documented target 数の表示

未完了:
- drag sort
- bulk apply / bulk disable / target filter

## Phase E — System 拡張
Status: 進行中

live 化済み:
1. particle
2. fog / volumetric
3. growth
4. camera
5. screen overlay
6. line
7. surface family（brush / patch / membrane / shell）
8. crystal
9. voxel
10. reaction
11. deposition / crystal deposition

今回の追加:
- `surface.displacement`
- `surface.opacity`
- `surface.relief`
- `surface.wireframe`
- `surface.sliceDepth`
- `surface-relief` preset pack
- `lib/audioReactiveTargetSets.ts`

未着手 / 部分着手:
- route の full CRUD editor
- sequence trigger の実測調整

## Phase F — Family helper 化
Status: 着手済み

目的:
- system 単位ではなく family 単位で target 解決を束ねる
- runtime 側の route 語彙重複を減らす

実施内容:
- `resolveSurfaceAudioDrives()` を追加
- `resolveCrystalAudioDrives()` を追加
- `resolveVoxelAudioDrives()` を追加
- `resolveReactionAudioDrives()` を追加
- `resolveDepositionAudioDrives()` を追加

次候補:
- `resolveSequenceAudioDrives()`
- volume / overlay 系 helper の再整理

## Phase G — Sequence / Trigger 統合
Status: 進行中（99%）

first-pass live:
- `sequence.stepAdvance`
- `sequence.crossfade`
- `sequence.randomizeSeed`

現実装:
- `lib/useSequenceAudioTriggers.ts` で rising-edge trigger + cooldown を処理
- `stepAdvance` は next sequence item へ通常遷移
- `crossfade` は next sequence item へ短時間 morph
- `randomizeSeed` は専用 seed mutation helper を短時間 morph で注入

残作業:
- threshold / cooldown の実測調整
- tuning preset は実装済み。次は実測ログを見ながら preset 数値を詰める
- route transfer file import / drag-drop は実装済み。次は validation 表示。

## Phase H — 旧 slider の整理
Status: 進行中（74%）

前提条件:
- route UI が完成している
- preset / import / export / sequence 保存が安定している
- parity が確認できている（summary / deprecation order / auto-fix first-pass は実装済み）

まだやってはいけないこと:
- slider を一括削除すること
- preset migration を省略して schema を飛ばすこと
- parity residual を見ずに削除順を決めること

## 後続 AI 向け作業順

1. `AUDIO_REACTIVE_COVERAGE_MATRIX.md` を読む
2. `lib/audioReactiveRegistry.ts` を読む
3. `lib/audioReactiveTargetSets.ts` を読む
4. `components/controlPanelTabsAudio.tsx` を読む
5. route editor を詰めるか、既存 family の target 語彙を細分化する

## 目安

- Phase A/B/C は完了
- UI 本命は Phase D の drag sort / trigger state 可視化 残り
- 機能網羅本命は Phase E/G
- legacy 整理は最後

## 2026-04-01 追加更新

- sequence trigger の enter / exit threshold は config 化済み
- sequence trigger の target 別 cooldown は config 化済み
- randomizeSeed は seed mutation helper 化済み
- seed mutation strength / scope は config 化済み
- Audio タブに route transfer box を追加済み
- route bundle の export / copy / append import / replace import は live
- route transfer file import と visible offset UI は live
- family alias target 語彙は registry / runtime に追加済み


## 2026-04-01 追加前進

- `surface.*` と `deposition.*` の generic target は、以後 helper 側で family 固有 alias と合成して解決する。
- これにより `brush.*` が patch / membrane / shell へ漏れる経路、`crystalDeposition.*` が depositionField 側へ漏れる経路を first-pass で遮断した。
- `sequence` は runtime から debug snapshot を出し、Audio タブで enter / exit / cooldown / ready 状態を live 可視化する。


## 2026-04-01 v8 追加

- `lib/audioSequenceTriggerPresets.ts` を追加し、balanced / percussive / cinematic / drift の tuning preset を導入。
- Audio タブで tuning preset を即適用可能にした。
- route transfer は drag-drop で JSON file / plain text を受けられるようにした。


## 2026-04-01 v9 追加

- route transfer は `lib/audioReactiveValidation.ts` で validation summary を出す。
- summary には parse error / duplicate IDs / unknown targets / invalid source / invalid curve / invalid mode / normalized-clamped counts を含める。
- legacy slider parity は Audio タブで live 表示する。次はこの residual を基に削除順を決める。


## 2026-04-01 v10 追加

- route transfer validation は current routes との差分も出す。以後、import 前に changed / added / removed を確認できることを前提にする。
- legacy slider parity は deprecation order を safe / review / blocked で並べる。safe から順に old slider 縮退候補とする。
- まだ不足しているのは、diff summary と実際の import 後状態の照合ログ、および trigger debug の履歴化。
- 2026-04-01 v11 で `review-blocked` hide は live。
- 2026-04-01 v12 で legacy auto-fix first-pass は live。次は auto-fix 後 residual と preset migration 影響を実測で確定する。

## 2026-04-01 v13 追加

- legacy slider visibility mode は config 永続化へ移行した。以後、次 AI は UI の一時 state を信用せず `config.audioLegacySliderVisibilityMode` を正本とする。
- mode は `all / review-blocked / retired-safe`。
- `retired-safe` は削除ではなく preview retirement。safe 候補を active panel view から外して作業面積を減らす段階。
- 次は `review` 候補の preset / import / sequence 保存影響を確認し、実削除条件を md へ固定する。


## 2026-04-01 update: retirement impact gating

Before actual legacy slider deletion, confirm the new `Retirement Impact / Presets + Sequence` panel is low-risk:

1. current config review / blocked is understood
2. preset review / blocked is reduced
3. sequence-linked preset blocked is reduced
4. keyframe blocked is reduced

Only then move from preview retirement toward actual removal.


## 2026-04-01 v14

- stored-context migration を追加。
- current config だけでなく saved presets / sequence keyframes の route parity も safe auto-fix で寄せられるようにした。
- 次は stored migration 後の residual 上位を route schema 側へ吸収し、Phase H を 90% 台後半へ進める。


## 2026-04-01 追加: Phase H review collapse

- safe pass の次段階として、legacy-owned duplicate review を current / stored contexts で collapse できるようにした。
- 次の残差は custom duplicate conflict と residual-only review を優先して詰める。


## 追加メモ 2026-04-01 v16

- `custom duplicate conflict` は一括自動解決しない。
- 先に `shadowed by custom exact` だけを safe pass で減らし、その後に残る custom conflict を手動またはより限定的な helper で扱う。


## 2026-04-01 追加（custom conflict finishing path）

- `shadowed by custom exact` の safe pass 後は、`Custom Conflict Hotspots` を基準に上位 key から整理する。
- 次の残り本命は `other custom duplicate conflict` の上位 key を順に減らすこと。
- 実削除の前に、`Focus In Route Editor` で当該 key だけへ絞り、current / presets / keyframes をまたぐ影響を確認する。


## 2026-04-01 v18 update

- done: exact custom duplicate collapse for current config
- done: exact custom duplicate collapse for saved presets / sequence keyframes
- done: hotspot-scoped collapse for focused conflict key
- remaining: residual-bearing custom conflicts are manual/editor-assisted cleanup, not legacy-retirement infrastructure work

## 2026-04-01 v19

- post-Phase-H として `Focused Conflict Inspector` を追加。
- 目的は residual custom conflict の manual cleanup を短くすること。
- 次段階は inspector を見ながら hotspot 上位 key の custom route を整理する運用フェーズ。


## 2026-04-01 v20 追記

- Post-Phase-H では、custom residual conflict を一括削除せず、focused key ごとに dominant route を確定して mute する運用整理段階へ入った。
- これにより、route 内容の意図差を残したまま active behavior だけを一本化できる。

## 2026-04-01 追加（Post-Phase-H）

- `Custom Conflict Hotspots` から current config 上位 key をまとめて進める batch pass を追加した。
- 次の残りは、stored contexts 向け recommendation batch を別 helper で入れるか、manual route curation を続けるかの判断になる。

## 2026-04-01 追加（stored hotspot batch）

- current config 用だけでなく、stored contexts 用の hotspot recommendation batch を追加した。
- 次の残りは、batch pass 後にも残る `manual-custom-choice` / `manual-residual-merge` を key 単位で整理する工程。
- ここからは `Apply Stored Top 3/8 -> Focus -> Inspector -> Route Editor` が最短導線。


## 2026-04-01 v23

- Post-Phase-H の最短導線として、`Apply Top 3 Everywhere / Apply Top 8 Everywhere` を追加。
- current / stored を別々に処理する手数を削減。
- `Last Hotspot Batch` で before / after の数値確認を行う。


## 2026-04-01 v24

- current / stored の everywhere batch 後に残る manual residual conflict を詰めるため、`Manual Residual Queue` を追加。
- ここでの目的は batch で削れない residual を key 単位で最短処理すること。
- 次は queue を回しながら route 内容の運用整理を進める。


## 2026-04-01 追加: Stored Manual Residual Queue

- current queue の次段として、stored contexts に残る manual residual を key 単位で順送り処理する `Stored Manual Residual Queue` を追加した。
- これにより、everywhere batch 後の残差整理は `current -> stored` の同型手順で進められる。


## 2026-04-01 v26

- Post-Phase-H の次段として、manual residual queue を batch pass 化した。
- current / stored / everywhere の 3 形態で manual residual をまとめて処理できる。
- 次の残りは、batch で減らない residual custom conflict を route-level curation で詰める工程。


## 2026-04-01 v27

- residual custom conflict の first-line action を `align-residuals` に更新。
- current / stored の focused residual を legacy baseline に寄せる経路を live 化。


## 2026-04-01 v27

- current config の `manual-custom-choice` について、`Focused Conflict Inspector` から route id 単位で keep を選べる route-level curation を追加した。
- これにより Post-Phase-H の重点は、`manual-custom-choice` の high-load key を hotspot 順に curate する段階へ移った。

## 2026-04-01 v28
- current route-level curation の次段として、stored contexts 側にも route 行ごとの keep を追加した。
- これで `manual-custom-choice` は current / stored の両方で同粒度の整理が可能。


## 2026-04-01 v29 追加

- `audioCurationHistory` を config 永続項目として追加。
- current / stored / everywhere の curation 操作で、key 単位の履歴を保存できるようにした。
- `Recent Curation History` を Audio タブへ追加。
- 履歴から `Focus Key` で同じ key を再度開けるようにした。
- これにより、同じ high-load key を何度も探し直す運用コストを減らした。


## 2026-04-01 v29

- history 永続化の次段として、queue filter を追加した。
- これにより `Current/Stored/Everywhere` の batch と manual queue は、履歴済み key を飛ばしながら未処理 key へ集中できる。
- 次の残作業は、history filter 済み queue の結果を batch summary に反映して、skip 率を明示すること。


## 2026-04-01 pending summary

- 履歴済み key を queue から薄めた後の次段として、未処理 key だけの before / after summary を追加した。
- これにより hotspot / manual batch の成果は total と pending の二層で監視する。


## 2026-04-01 v31 追加

- history filter 後の queue を前提に、未処理 key の before / after sample を batch summary へ追加した。
- `Last Hotspot Batch` は pending hotspot / context 数に加えて、pending sample before / after を表示・コピーできる。
- `Last Manual Batch` は pending current / stored 数に加えて、pending current sample before / after と pending stored sample before / after を表示・コピーできる。
- これにより、残り 1% の運用整理は「未処理 key がどれだけ減ったか」だけでなく「どの未処理 key が残っているか」まで毎回固定できる。
