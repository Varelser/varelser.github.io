# Future-native execution roadmap — 2026-04-08

## Goal
Mainline で MPM / PBD / fracture / volumetric を「実装済みだが見えない状態」から「starter preset と scene handoff を含めて再利用しやすい状態」に引き上げる。

## このパスで完了したこと
- scene handoff で future-native renderer を起動する修正
- runtime binding 一覧の差し替え
- layer3 の warm-frame 誤参照修正
- future-native starter preset augmentation 追加
- representative sequence 追加
- verify 追加

## 依然として残るもの
1. volumetric
   - pressure solve の重み最適化
   - light/shadow coupling の見た目最終化
   - live browser 実測
2. PBD
   - control panel 上の family ごとの露出整理
   - high-count 時の step budget 調整
3. fracture
   - debris / crack preset の product 名寄せ
   - preset browsing と export 導線の詰め

## 次の最短手
1. future-native family 別タブ表示を control panel に追加
2. representative preset を product pack として別束化
3. live browser 実測レポート固定
