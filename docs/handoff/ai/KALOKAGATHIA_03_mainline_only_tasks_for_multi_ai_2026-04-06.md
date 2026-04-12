# KALOKAGATHIA 複数AI並列開発でも 本体で直接編集した方がいい作業

- 作成日: 2026-04-06
- 目的: Kalokagathia を **複数の AI で同時並列に進める** 前提でも、branch へ分散させず **mainline owner AI が本体で直接編集・更新すべき作業** を明確化する
- 重要: この文書にある作業は、複数 AI が同時に触ると後で高確率で破綻する

---

## 1. 結論

Kalokagathia では、以下は **mainline owner AI の一元管理対象** にした方がよい。

1. manifest / project state
2. render registry / execution routing / capability routing
3. plugin contract / mode contract 定義
4. package class / handoff / closeout / doctor の定義
5. generated status の正規化
6. docs の最終 truth
7. build / export / import / verify の基準変更

理由は共通している。  
これらは **single source of truth** に触るからである。

---

## 2. mainline owner AI に限定すべき作業

## 2-1. manifest / project state 系

### 対象
- `projectStateManifest.ts`
- builder / normalizer
- `projectStateStorage.ts`
- project state schema
- migration / versioning
- manifest export surface

### mainline に限定する理由
- 保存互換性そのものに触る
- 旧新二重化が再発しやすい
- truth が分裂すると全 family が壊れる
- 後から合体しても schema conflict が起きやすい

### branch 側に許す範囲
- 読み取り
- 調査
- 問題点メモ
- 差分案の提案

### branch 側に許さない範囲
- 最終 schema 変更
- migration の確定
- export surface の決定
- truth としての docs 反映

---

## 2-2. render registry / execution routing / capability routing

### 対象
- renderModeRegistry
- projectExecutionRouting
- capability guard / matrix
- fallback policy
- runtime mode selection の本幹

### mainline に限定する理由
- 全 family の入口を握る
- 複数 AI が別々に追加すると mode id や routing 意味が衝突する
- merge conflict より meaning conflict が危険

### branch 側に許す範囲
- 新規 family の接続案
- capability 要件の下書き
- fallback 案
- proof 収集

### branch 側に許さない範囲
- registry truth の確定
- routing truth の確定
- fallback policy の独自確定

---

## 2-3. plugin contract / mode contract 定義

### 対象
- plugin contract 型
- mode contract 型
- support level
- settings schema の共通項
- manifest features の共通項
- performance classification の共通項

### mainline に限定する理由
- これ自体が全 branch 作業の前提
- 複数 AI が別解を作ると全 family を差し戻す必要が出る
- branch 側の成果物を受け入れる基準が揺れる

### branch 側に許す範囲
- contract 草案
- 不足項目の提案
- family ごとの要件列挙

### branch 側に許さない範囲
- 本採用の contract 確定
- 全 family への波及修正の開始

---

## 2-4. package class / handoff / closeout / doctor の定義

### 対象
- package taxonomy
- source-only / full-local-dev / platform-specific などの語彙
- bootstrap requirement
- doctor 判定基準
- closeout report 基準
- handoff class の定義

### mainline に限定する理由
- 配布物の意味そのものを決める
- docs / report / 実体の正を1本にする必要がある
- 複数 AI が別語彙を使うと handoff が壊れる

### branch 側に許す範囲
- doctor 出力の観察
- report 草案
- package 状態のメモ

### branch 側に許さない範囲
- package class の最終定義
- handoff quality の最終判定

---

## 2-5. generated status の正規化

### 対象
- generated/future-native-suite-status
- 過去成功記録との扱い
- 現ソース再実行結果との整合
- verify accept 判定に関わる status

### mainline に限定する理由
- 何を正とするかを決める部分
- 「過去の pass」と「現ソースの pass」がズレている時に、どちらを採用するかの判断が必要
- branch 側で更新すると証跡の信頼性が落ちる

### branch 側に許す範囲
- 失敗ログの収集
- 差分の可視化
- 状態比較レポート

### branch 側に許さない範囲
- 正規 status の確定
- pass 記録の上書き

---

## 2-6. docs の最終 truth

### 対象
- `CURRENT_STATUS.md`
- `REVIEW.md`
- handoff md
- closeout md
- archive index
- final roadmap summary

### mainline に限定する理由
- 複数 AI が都合よく更新すると truth が分裂する
- docs は最後に現物検証結果へ同期する必要がある
- 先に docs を確定すると実装とズレる

### branch 側に許す範囲
- 下書き
- 章ごとの草案
- usage guide
- proof report の草案

### branch 側に許さない範囲
- final status としての確定
- handoff 最終版の決定

---

## 2-7. build / export / import / verify の基準変更

### 対象
- build 完了条件
- export / import 互換条件
- verify accept 条件
- package integrity 判定
- closeout 判定

### mainline に限定する理由
- 成果物の意味を変える幹線変更
- merge 時に「何が完了か」が branch ごとにズレる
- quality gate が分裂する

### branch 側に許す範囲
- 補助 verifier の追加
- proof の収集
- エラー比較
- 提案

### branch 側に許さない範囲
- quality gate の確定変更
- build pass / fail 基準の最終変更

---

## 3. Kalokagathia で特に mainline 固定すべき理由

### 3-1. 現状の主要課題が「整合ズレ」だから
Kalokagathia の問題は単純な未実装だけではない。  
manifest、verify、package、docs の整合ズレが主要課題である。

この種の課題は、複数 AI が同時編集するとほぼ悪化する。

### 3-2. future-native や family product 化も、最後は幹線に入るから
future-native、PBD、volumetric、fracture、MPM は branch 化できる部分がある。  
しかし product 完了には最後に本体幹線への統合が必要になる。

そのため、幹線は最初から mainline owner AI が握っておく方がよい。

### 3-3. audio は巨大で相互依存が強いから
audio 系は葉の分離は branch 化できるが、state shape や bulk edit 本体は mainline 固定の方が安全である。

---

## 4. まとめ

複数 AI を使う場合でも、Kalokagathia では次を branch へ自由に解放してはいけない。

1. manifest / project state
2. registry / routing / capability matrix
3. plugin contract
4. package class / handoff / doctor
5. generated status
6. docs final truth
7. build / export / import / verify の基準

これらは **本体ごと編集・更新した方がよい作業** であり、  
mainline owner AI が一元管理するのが基本である。
