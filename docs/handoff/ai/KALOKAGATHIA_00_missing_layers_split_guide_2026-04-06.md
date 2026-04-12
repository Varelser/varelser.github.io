# KALOKAGATHIA 未網羅層の分け方ガイド

- 作成日: 2026-04-06
- 目的: これまで「未網羅」として挙がっていた層を、**本体とセットで mainline owner AI が握るもの** と **他の AI へ委譲してよいもの** に分け直す。
- 想定体制: 1 体の mainline owner AI + 複数の worker AI

---

## 1. この3本の役割

この文書群は次の3本で使う。

1. **このファイル**
   - 入口
   - 何がどちらの md に入っているかだけを見る
2. `KALOKAGATHIA_10_mainline_with_repo_only_missing_layers_2026-04-06.md`
   - 本体とセットでやるもの
   - mainline owner AI が握るもの
3. `KALOKAGATHIA_11_delegatable_missing_layers_for_other_ai_2026-04-06.md`
   - 他 AI に任せてよいもの
   - 分岐ブランチ・パッチで返させるもの

---

## 2. 先に結論

### 本体とセットで mainline owner AI が握るもの

次は **本体の single source of truth** に直接触るため、原則として mainline owner AI が担当する。

- 全 family / 全 mode / 全 subsystem の **正本一覧**
- 各項目の **公式状態判定**
- parallel / conditional / mainline-only の **最終判定**
- 依存関係の **ゲート固定**
- patch と branch の **統合単位ルール**
- verify の **完了基準**
- conflict / meaning conflict の **危険幹線判定**

### 他 AI に任せてよいもの

次は **調査・棚卸し・局所実装・局所 docs・局所検証** として分解できるため、worker AI に委譲できる。

- subsystem 単位の棚卸し
- family 単位の実装状況レポート
- directory / file 単位の担当表の原案作成
- 依存関係の下書き
- verify 手順の subsystem 別作成
- conflict 危険箇所の監査
- 幹線に触れない範囲の product 化・UI 整理・分割

---

## 3. あなたが挙げた未網羅層の対応表

| 未網羅層 | まず読む md | 主担当 |
|---|---|---|
| 全 family / 全 mode / 全 subsystem の完全一覧 | 10 | mainline owner AI |
| 実装済み / 未完 / 未着手の公式状態 | 10 | mainline owner AI |
| parallel / conditional / mainline-only の個別判定 | 10 | mainline owner AI |
| directory / file 単位の担当表 | 11 | worker AI が原案、mainline が確定 |
| 依存関係 | 10 | mainline owner AI |
| contract 固定前提 / registry 固定前提 / manifest 接続前提 | 10 | mainline owner AI |
| merge 単位 | 10 | mainline owner AI |
| patch 返却か branch 統合か | 10 | mainline owner AI |
| verify 単位 | 10 と 11 | mainline が基準、worker が局所手順 |
| conflict 危険度 | 10 と 11 | mainline が最終判定、worker が監査補助 |
| meaning conflict が起きやすい幹線 | 10 | mainline owner AI |

---

## 4. 迷ったらどちらに入れるか

### 10 に入れる条件

次のいずれかに当てはまるなら、本体側に置く。

- manifest / registry / routing / storage / package class / docs truth に触る
- 正本の意味を変える
- 他 AI の作業前提を決める
- merge ルールや完了判定を決める
- 間違うと全ブランチの意味が崩れる

### 11 に入れる条件

次のいずれかに当てはまるなら、他 AI に委譲できる。

- 正本ではなく、原案・調査・棚卸し・監査である
- subsystem / family / directory ごとに閉じている
- 後から patch / branch で戻せる
- 幹線変更なしで検証できる
- 失敗しても mainline 全体が壊れない

---

## 5. 読む順番

1. この入口を見る
2. `10` を見る
3. `11` を見る
4. 実作業の割当を作る

---

## 6. 実務上の重要点

今回の分け方で最も重要なのは、**台帳の作成者** と **台帳の正本決定者** を分けること。

- worker AI は、棚卸し原案・監査原案・担当表原案を作ってよい
- ただし、
  - 何が公式一覧か
  - 何が未完か
  - 何が mainline-only か
  - 何を merge 単位にするか
  - 何で完了とするか
  は mainline owner AI が確定する

この線引きを曖昧にすると、文書量は増えても本体へ安全に合体できない。
