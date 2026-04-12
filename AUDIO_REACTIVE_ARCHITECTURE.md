# AUDIO_REACTIVE_ARCHITECTURE

## 目的

この文書は、このソフトへ**音に反応する機能を後から大量に付け加えられるようにするための設計正本**です。

目的は 2 つです。

1. 既存の音反応を壊さないこと
2. 後続 AI が repo を読んだとき、どこに何を足すべきか迷わないこと

## 現状認識

現状の音反応はすでに存在します。

- 入力源
  - microphone
  - shared-audio
  - standalone-synth
  - internal-synth
- 解析値
  - bass
  - treble
  - pulse
  - bandA
  - bandB
- 反映先
  - particle uniform 群
  - 一部 system の `audioReactive`
  - camera / screen / burst などの一部 global パラメータ

ただし現状は、**反映先ごとに値の持ち方がばらけている**ため、このまま音反応を増やすと管理が破綻します。

## 今回導入した分割

### 1. 解析結果の互換層と拡張層を分離

互換層:
- `AudioLevels`
- 既存 runtime が参照する簡易 5ch 値

拡張層:
- `AudioFeatureFrame`
- 将来追加する feature を受ける共通フレーム

配置:
- `lib/audioControllerTypes.ts`
- `types/audioReactive.ts`
- `lib/audioFeatureFrame.ts`
- `lib/useAudioController.ts`

重要:
- **既存 runtime は引き続き `audioRef` を使う**
- 新規 runtime は段階的に `audioFeatureFrameRef` を参照できる

### 2. 直接配線ではなく route を保存できるようにした

追加した型:
- `AudioModulationRoute`

役割:
- source: どの音特徴量を使うか
- target: どこへ反映するか
- amount / bias / curve / attack / release / clamp / mode: どう反映するか

配置:
- `types/audioReactive.ts`
- `lib/audioReactiveConfig.ts`

重要:
- 今回は **保存・正規化・clone・legacy bridge まで**
- まだ runtime の正本は legacy slider / uniform 経路

### 3. system ごとの受け口を registry 化した

追加:
- `lib/audioReactiveRegistry.ts`

役割:
- particle は何を受けられるか
- fog は何を受けられるか
- growth / surface / camera / postfx / sequence は何を受けられるか

この registry は今後、
- UI の routing matrix
- runtime の target 解決
- docs の正本

の共通語彙になります。

## 追加した config 項目

`ParticleConfigAudio` に次を追加しました。

- `audioArchitectureVersion`
- `audioFeatureFrameVersion`
- `audioRoutesEnabled`
- `audioRoutes`

意味:
- **旧 preset / 旧 project を壊さず**、新経路を共存させるための予約領域です。

## 実装上の大前提

### 正本

現時点の正本は次です。

1. 既存の slider 群
2. 既存の `audioRef`
3. 既存の shader uniform / subsystem `audioReactive`

### 移行先

移行先は次です。

1. `audioFeatureFrameRef`
2. `audioRoutes`
3. capability registry を通した target 解決

### 禁止事項

後続 AI は、次をやってはいけません。

- `audioBassXxxScale` 系を無秩序に増やし続ける
- system ごとに勝手な feature 名を増やす
- registry に書かずに target 名を増やす
- 旧 slider を route parity 確認前に削除する
- いきなり全 system を route runtime へ置換する

## 今後の推奨順

### 第1段階
- particle runtime を route 受け取り可能にする
- ただし legacy uniform 更新は残す
- route と legacy の差分を比較可能にする

### 第2段階
- Audio tab に route 編集 UI を追加する
- 旧 slider を消さず、`Legacy` と `Matrix` を並走させる

### 第3段階
- fog / growth / surface / camera / postfx を順次 route 化する
- 各 subsystem の `audioReactive` 単一値を、target 単位の modulation へ分離する

### 第4段階
- trigger 系（beat / onset / stepAdvance）を sequence 側へ拡張する。現在は first-pass live。

## 参照すべきコード

- `types/audioReactive.ts`
- `lib/audioFeatureFrame.ts`
- `lib/audioReactiveConfig.ts`
- `lib/audioReactiveRegistry.ts`
- `lib/useAudioController.ts`
- `lib/audioAnalysis.ts`
- `types/configAudio.ts`
- `components/controlPanelTabsAudio.tsx`
- `components/sceneParticleSystemRuntimeAudio.ts`

## 一言で言うと

この pass の意味は、**音反応の実装を増やしたことではなく、音反応を後から増やしても崩れない受け皿を repo に入れたこと**です。


## 2026-04-01 追加実装

今回の pass では、受け皿だけでなく **live runtime** も拡張した。

live 化した系統:
- particle
- line
- fog
- growth
- camera
- screen overlay

追加した中核:
- `lib/audioReactiveRuntime.ts`
  - route 評価
  - curve / smoothing / attack / release
  - target 別解決
- `lib/audioReactivePresets.ts`
  - preset pack 群
- `components/controlPanelTabsAudio.tsx`
  - route 有効化
  - legacy → routes 同期
  - preset pack 追加
  - route 数と coverage 可視化

重要:
- line / fog も毎フレーム route を再評価するよう修正済み。
- growth は live だが、branch 数は layout ceiling を超えない。
- surface / crystal / voxel / reaction / deposition family と sequence trigger は first-pass live。

参照:
- `AUDIO_REACTIVE_COVERAGE_MATRIX.md`
