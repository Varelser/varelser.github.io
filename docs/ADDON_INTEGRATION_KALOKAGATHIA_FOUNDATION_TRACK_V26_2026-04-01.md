# Add-on Integration Note (2026-04-01)

対象 add-on:
`monosphere_foundation_track_v26_addon_2026-04-01.zip`

## 精査結果

含まれていた実体は次の 2 点のみ。

- `patches/0033-gpgpu-transform-feedback-native-capture-binding.patch`
- `docs/GPGPU_TRANSFORM_FEEDBACK_NATIVE_CAPTURE_BINDING_2026-04-01.md`

## 判定

patch は現行 Kalokagathia 本体へそのままは適用不可。
理由は、patch 前提の v25 系ファイル/状態と現行構成が一致しないため。

## 実施内容

- patch の狙いを抽出
- 現行構成へ合わせて手移植
- 補足文書を `docs/` に追加

## 非実施

- add-on patch ファイルそのものの同梱
- v25 系 routing 構造の全面再現
