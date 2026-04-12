# GPGPU Transform Feedback Native Capture Binding (2026-04-01)

## 目的

追加アーカイブ `monosphere_foundation_track_v26_addon_2026-04-01.zip` に含まれていた
WebGL2 transform feedback native capture binding を、現行 Kalokagathia 構成へ
破壊的変更なしで手移植する。

## 背景

元アドオンは v25 系の patch lineage 前提で、現行 Kalokagathia 本体とは以下が一致しなかった。

- `lib/gpgpuTransformFeedbackNativeCapturePass.ts` が本体側に未存在
- `routing.trueTransformFeedbackCaptureStart` などの詳細 routing 状態が未実装
- diagnostics snapshot の構造が簡略化されている

このため、patch の直接適用ではなく、現行構成向けの独立 helper として移植した。

## 今回の実装

- `lib/gpgpuTransformFeedbackNativeCapturePass.ts` を新設
- WebGL2 専用 Program を lazy compile / link
- `transformFeedbackVaryings` に `tfPosition` / `tfVelocity` を登録
- active ping-pong の position / velocity texture を sampler として参照
- `gl_VertexID` から texel を読む capture-only vertex pass を発行
- capture buffer へ `SEPARATE_ATTRIBS` で書き込む
- `components/sceneGpgpuSystem.tsx` から毎 frame の simulation 後に実行
- `components/gpgpuDiagnostics.ts` へ capture snapshot を追加

## 既知の差分

元アドオンの次の要素は、現行 Kalokagathia 本体に同名概念がないため未移植。

- `routing.trueTransformFeedbackCaptureStart.*` に依存する判定
- native capture 用のより細かい readiness score
- v25 系 patch line 固有の状態名の一部

## 現在の状態

capture snapshot の `execution` は以下を返す。

- `inactive`
- `unavailable`
- `allocation-failed`
- `program-link-failed`
- `source-textures-unavailable`
- `native-capture-issued`

## 注意

この実装は native transform feedback capture の最小接続であり、
three.js の表示経路そのものの置換、captured vertex count query、
render-to-screen 経路の差し替えまでは行っていない。
