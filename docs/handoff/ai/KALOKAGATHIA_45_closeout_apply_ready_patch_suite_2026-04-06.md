# KALOKAGATHIA closeout apply-ready patch suite

- 作成日: 2026-04-06
- 目的: root 正本 `CURRENT_STATUS.md` / `REVIEW.md` / `DOCS_INDEX.md` へ、missing-layers overlay の結果を **実際に戻せる unified patch** と replacement file を固定する。

## 1. 今回の位置づけ

これは preview ではない。

- `closeout-preview-2026-04-06/` は適用後の見本
- `closeout-apply-ready-patches-2026-04-06/` は実際に戻す patch 本体

今回の patch は docs truth sync 専用であり、runtime / manifest / routing / registry は変更しない。

## 2. 含まれるもの

- `CURRENT_STATUS.patch`
- `REVIEW.patch`
- `DOCS_INDEX.patch`
- 同内容の replacement file
- apply / verify script
- apply-ready patch index

## 3. 適用方法

patch 方式と replacement 方式の両方を用意する。

- 標準: `patch -p1` で適用
- 代替: replacement file を直接上書き

## 4. 適用前提

- 対象 root は overlay 作成時と同等であること
- 3ファイルが既に大きく変更されていないこと
- patch dry-run が通ること

## 5. 適用後にやること

1. `CURRENT_STATUS.md` / `REVIEW.md` / `DOCS_INDEX.md` を保存
2. overlay 側 preview と一致するか確認
3. specialist-native 4件と `volumetric-smoke` の最終判断を mainline owner AI が記録
4. docs truth を root 正本へ一本化
