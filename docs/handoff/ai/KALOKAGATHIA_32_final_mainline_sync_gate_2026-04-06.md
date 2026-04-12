# KALOKAGATHIA final mainline sync gate

- 作成日: 2026-04-06
- 目的: Wave 5 完了後に、本体 truth 文書へ同期する前の gate を固定する。

## mainline sync 前提

次のすべてが満たされるまで、`CURRENT_STATUS.md` / `REVIEW.md` / `DOCS_INDEX.md` を final truth として更新しない。

1. direct patch candidate 18本の返却 bundle が揃う
2. specialist-native 4本の mainline review 結果が揃う
3. overlay verify / worker packet verify / low-risk verify / family closure verify / direct patch verify が通る
4. future-native の project-state fast verify が通る
5. safe pipeline core verify が exit 0 で通る
6. archive duplicate 監査結果が mainline 側で確定する

## mainline sync でやること

- official state の最終確定
- closureCandidate の最終確定
- parallel / conditional / mainline-only の最終確定
- merge unit の最終確定
- truth docs の一括同期

## mainline sync でやってはいけないこと

- worker packet の途中状態だけで truth docs を上書きする
- specialist-native を direct patch と同列に扱う
- manifest / registry / routing の意味変更を patch 群のついでに混ぜる
