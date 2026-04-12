# AUDIO_REACTIVE_LEGACY_RETIREMENT

## 目的

legacy slider 群を一気に削除せず、`safe -> review -> blocked` の順で段階縮退するための正本です。

## 現在の前提

- parity summary は Audio タブで live 表示される
- deprecation order は `safe / review / blocked` を返す
- auto-fix first-pass は live
- fastlane (`check:audio-reactive / verify:audio-reactive / typecheck:audio-reactive:attempt`) は pass

## visibility mode

`config.audioLegacySliderVisibilityMode`

- `all`
  - 全 legacy slider を表示
  - 監査や復旧のときに使う
- `review-blocked`
  - `safe` 候補だけを隠す
  - review / blocked に確認対象を絞る通常運用モード
- `retired-safe`
  - `safe` 候補を active panel view から外す
  - ただし削除はしていない
  - 監査時は `all` に戻せる

## 段階縮退ルール

1. まず `Run Safe Auto-Fix Pass` を走らせる
2. parity residual を再確認する
3. `safe` が崩れていないことを確認したら `retired-safe` へ切り替える
4. `review` は route / preset / import 影響を確認してから進める
5. `blocked` は runtime / schema / preset migration の理由を解消するまで残す

## 次の AI への指示

- `retired-safe` は UI 面積を減らすための段階であり、削除完了ではない
- 実削除を始める前に、preset import/export と sequence 保存への影響を確認する
- safe 候補が再び residual を持つなら `all` へ戻して原因を追う


## 2026-04-01 追加: Retirement Impact

Audio タブの `Retirement Impact / Presets + Sequence` は、次を集計する。

- current config に残る review / blocked
- saved presets に残る review / blocked
- sequence item が参照する preset 由来の review / blocked
- keyframeConfig に残る review / blocked
- context 数が多い legacy candidate の上位

これを見れば、単に current config が safe でも、preset export / import や sequence 保存がまだ review / blocked を抱えているかを判断できる。

### 次の縮退基準

- `retired-safe` の次に進む前に、preset review / blocked と keyframe review / blocked がどの程度残るかを確認する
- context 数が多い candidate から先に route 側を揃える
- sequence linked preset に blocked が残る間は、実削除ではなく preview retirement を維持する


## 2026-04-01 追加: Stored Context Migration

Audio タブから、次の safe pass を保存済み文脈にも適用できる。

- `Fix Stored Presets + Keyframes`
- `Fix Saved Presets`
- `Fix Sequence Keyframes`

これは legacy slider の削除ではなく、saved presets / custom keyframeConfig 内の `audioRoutes` を current safe pass と同じ規則で補正する段階である。

### 運用順

1. current config で `Run Safe Auto-Fix Pass`
2. `Retirement Impact` で presets / keyframes の review / blocked を確認
3. 必要なら stored context migration を実行
4. もう一度 impact を確認し、`retired-safe` 維持か次段階へ進むか判断


## 2026-04-01 追加: Review collapse

`review` のうち、extra match が legacy-owned route のみで構成されるものは `Collapse Legacy-Owned Review Duplicates` で current config 側を前へ進められる。

保存済み preset / keyframe 側は `Collapse Stored Review Duplicates` で同じ規則を適用する。

これは custom duplicate を勝手に消さないため、extra custom route が残る review は引き続き manual review 扱いとする。


## custom duplicate conflict の扱い

- `shadowed by custom exact` は、custom route が exact で存在し、legacy route が同じ key に重なっている状態を指す。
- これは `Remove Legacy Shadowed by Custom Exact` で current config から先に減らせる。
- saved presets / keyframes 側は `Remove Stored Legacy Shadowed by Custom Exact` を使う。
- custom route 同士の競合や residual を伴う conflict は自動削除しない。


## 2026-04-01 追加: Custom Conflict Hotspots

- `Retirement Impact / Presets + Sequence` には `Custom Conflict Hotspots` が追加されている。
- これは `other custom duplicate conflict` と `mixed custom conflict` を current / presets / sequence / keyframes 横断で context 数順に並べる。
- `Focus In Route Editor` を押すと、その `source -> target` key だけに route editor を絞り込める。
- 以後の手順は「hotspot 上位 key を focus → custom routes を整理 → parity 再確認」の順に進める。


## 2026-04-01 v6 追加

- `other custom duplicate conflict` のうち、値が完全一致している custom route 重複は safe pass で collapse できる。
- current config では `Collapse Exact Custom Duplicates` を使う。
- focused hotspot がある場合は `Collapse Focused Exact Custom Duplicates` を使う。
- saved presets / keyframes では `Collapse Stored Exact Custom Duplicates` または focused 版を使う。
- residual を伴う custom conflict は自動 collapse しない。Route Editor で内容確認してから整理する。

## 2026-04-01 v8 追記

- `retired-safe` の次段階では、自動修正よりも `Focused Conflict Inspector` を使った key 単位の整理を優先する。
- 手順は `Custom Conflict Hotspots -> Focus In Route Editor -> Focused Conflict Inspector -> route editor`。
- Inspector は dominant route / recommendation / per-route delta を返すので、residual を伴う custom conflict の手動整理を短くできる。


## 2026-04-01 v20 追記

- `Focused Conflict Inspector` には `Apply Focused Recommendation` と `Mute To Dominant` が追加された。
- `Copy Retirement Impact` は current / presets / sequence linked presets / keyframes 横断の review / blocked 要約を clipboard に出す。
- `Copy Handoff Snapshot` は上記 impact に focused key の detail と visible hotspots を足した handoff 用 snapshot を clipboard に出す。
- この操作は route を削除せず、non-dominant routes を `enabled=false` と注記付き notes に落とす。
- custom residual conflict を完全自動解決するのではなく、dominant route を先に確定し、残差確認を速くするための段階である。
- stored contexts にも同じ操作があり、saved presets / keyframes に同じ focused mute を適用できる。

## 2026-04-01 追加: Hotspot batch pass

Audio タブの `Custom Conflict Hotspots` には次を追加した。

- `Apply Hotspot Recommendation`
- `Apply Top 3 Recommendations`
- `Apply Top 8 Recommendations`

これは current config 上の hotspot を、`summarizeFocusedCustomConflict()` の recommendation に従って順に処理する current-only batch pass である。

- `collapse-exact-custom`
- `remove-legacy-shadow`
- `mute-focused-conflict`

の 3 種だけを安全側に実行する。stored contexts への一括 recommendation pass はまだ入れていない。



## 2026-04-01 v23 追記

- hotspot 整理は、まず `Apply Top 3 Everywhere` を優先する。
- 直前 batch の進行量は `Last Hotspot Batch` の hotspots / contexts before -> after で確認する。
- current と stored を別々に押すのは、everywhere batch で進まない key を個別追跡するときだけにする。


## residual custom conflict の扱い

- everywhere batch 後に残る `manual-custom-choice` / `manual-residual-merge` は `Manual Residual Queue` で順送りに処理する。
- queue は current config 上の manual residual だけを対象にし、残件数と focused index を表示する。
- `Apply Focused + Next` は destructive delete ではなく、既存の recommendation 適用後に次 key へ進む補助である。
- queue が 0 になれば、current config 上の manual residual は一巡したとみなせる。


## 2026-04-01 追加: Stored Manual Residual Queue

- everywhere batch 後に stored contexts 側へ残る `manual-custom-choice` / `manual-residual-merge` は `Stored Manual Residual Queue` で順送りに処理する。
- `Apply Stored Focused + Next` は、focused key に対して stored recommendation を適用し、そのまま次の stored manual key へ進む補助である。
- current queue と stored queue を分けることで、current config と保存済み文脈を混同せずに残差を詰められる。


## 2026-04-01 v26

- current queue / stored queue を一件ずつ進めるだけでなく、manual residual 用の batch pass を使う。
- `Apply Top 3 Manual / Top 8 Manual` は current config 用。
- `Apply Stored Top 3 Manual / Top 8 Manual` は saved presets / sequence keyframes 用。
- `Apply Top 3 Manual Everywhere / Top 8 Manual Everywhere` は current と stored を同じ key 群で同時に進める。
- 実行後は `Last Manual Batch` を見て、current manual / stored manual の before -> after が下がっていることを確認する。
- ここで下がらない key だけを `Focused Conflict Inspector` と Route Editor で手動整理する。


## 2026-04-01 v9 追記

- `manual-custom-choice` は、`Focused Conflict Inspector` の route 行から current config に対して直接 curate できる。
- `Keep This Route` は、その route を残して他を `muted-focused-conflict` として無効化する。
- `Keep + Next` は同じ処理を行った後に manual residual queue の次候補へ進む。
- したがって、dominant 推奨が意図に合わない場合でも、route id 単位で安全側に整理できる。


## 2026-04-01 v17 追加

- `manual-custom-choice` については、current だけでなく stored contexts でも route 行ごとの keep が可能。
- stored 側は route id が一致しない可能性があるため、id ではなく route 署名で最も近い route を選んで keep する。
- `Keep In Stored` / `Keep Stored + Next` は destructive delete ではなく non-dominant mute として扱う。


## 2026-04-01 v29 追加

- `audioCurationHistory` を config 永続項目として追加。
- current / stored / everywhere の curation 操作で、key 単位の履歴を保存できるようにした。
- `Recent Curation History` を Audio タブへ追加。
- 履歴から `Focus Key` で同じ key を再度開けるようにした。
- これにより、同じ high-load key を何度も探し直す運用コストを減らした。


## 2026-04-01 v18 追記

- `config.audioCurationQueueFilterMode` で queue の既定表示を制御する。
- `hide-curated` は、history に残っている key を hotspot / manual queue から隠す通常運用モード。
- `only-curated` は、既に触った key だけを再点検したいときの監査モード。
- batch 実行は visible queue を対象にするため、`hide-curated` のままでも未処理 key に集中できる。


## 2026-04-01 v18 snapshot

- queue filter default: `hide-curated`
- current/stored hotspot batch は visible queue 対象
- current/stored manual queue も visible queue 対象
- 履歴済み key を自動で飛ばし、未処理 key に集中する段階へ移行済み


## 2026-04-01 追加: Pending Queue Summary

- `Last Hotspot Batch` は total だけでなく `pending hotspots / pending contexts` の before -> after を返す。
- `Last Manual Batch` は total だけでなく `pending current / pending stored` の before -> after を返す。
- ここでの pending は `audioCurationHistory` にまだ入っていない key を指す。
- 以後の運用では、total よりも pending の減り方を優先して確認する。


## 2026-04-01 v31 追加

- history filter 後の queue を前提に、未処理 key の before / after sample を batch summary へ追加した。
- `Last Hotspot Batch` は pending hotspot / context 数に加えて、pending sample before / after を表示・コピーできる。
- `Last Manual Batch` は pending current / stored 数に加えて、pending current sample before / after と pending stored sample before / after を表示・コピーできる。
- これにより、残り 1% の運用整理は「未処理 key がどれだけ減ったか」だけでなく「どの未処理 key が残っているか」まで毎回固定できる。
