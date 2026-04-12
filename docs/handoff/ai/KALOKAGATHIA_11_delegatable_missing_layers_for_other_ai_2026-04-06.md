# KALOKAGATHIA 他の AI に任せる未網羅層

- 作成日: 2026-04-06
- 目的: これまで未網羅だった層のうち、**worker AI に委譲してよいもの** を具体化する。
- 想定: worker AI は branch または patch 単位で返却する。mainline owner AI は最後に統合する。

---

## 1. 前提

worker AI に渡してよいのは、**正本の意味を変えない仕事** である。

つまり、以下は委譲してよい。

- 調査
- 棚卸し
- 監査
- subsystem 単位の実装詰め
- family 単位の product 化補助
- docs の局所整備
- verify checklist の作成
- file split の局所作業

一方、manifest / registry / routing / package class / docs truth の正本決定は委譲しない。

---

## 2. 他 AI に任せてよい未網羅層

### 2-1. subsystem / family 単位の完全一覧の原案作成

#### 委譲できる理由

一覧の「正本決定」は mainline 側だが、材料集め自体は分割できる。

#### 具体的に任せてよい内容

- audio 系ファイル一覧の抽出
- future-native 関連ファイル一覧の抽出
- volumetric / PBD / fracture / MPM の関連ファイル一覧の抽出
- `components` / `lib` / `scripts` / `generated` / `workers` / `types` の subsystem ごとの整理

#### worker AI の返却形式

- md 台帳
- file list
- subsystem map

#### 完了扱い

- 抽出根拠がある
- 重複ファイル・旧名・ archive 混入が注記されている

---

### 2-2. 実装済み / 未完 / 未着手の evidence 収集

#### 委譲できる理由

公式 state 判定は mainline だが、evidence 集めは並列化できる。

#### 任せてよい内容

- feature ごとのコード存在確認
- UI 導線の有無確認
- preset / export / import / manifest / routing の接続有無確認
- verify script の有無確認
- docs 記述の引用整理

#### 返却形式

- `item / observed evidence / suspected state / notes` の表

#### 注意

worker AI は `implemented` を断定しない。`
suspected implemented` / `suspected partial` のように返す。

---

### 2-3. parallel / conditional / mainline-only の候補判定

#### 委譲できる理由

最終判定ではなく、候補判定なら並列化できる。

#### 任せてよい内容

- file 単位の危険度ラベル付け
- subsystem 単位の委譲可否ラベル付け
- branch 返却向きか patch 返却向きかの原案作成

#### 返却形式

- `target / proposed class / reason / risk` 表

#### mainline で確定すべきこと

- final class
- 禁止対象
- 例外条件

---

### 2-4. directory / file 単位の担当表の原案作成

#### これは他 AI に任せてよい

これはまさに worker AI 向き。

#### 任せてよい内容

- `components/` の担当分割案
- `lib/` の subsystem 分割案
- `scripts/` の verify / emit / doctor の担当分割案
- `docs/` / `generated/` の更新担当案

#### 返却形式

- `AI名 / 対象 directory / 対象 file / 触ってよい範囲 / 禁止範囲 / verify` 表

#### 注意

担当表は原案。正式な割当は mainline owner AI が確定する。

---

### 2-5. 依存関係図の下書き

#### 委譲できる理由

依存の最終ゲート固定は mainline だが、図の下書きは並列化しやすい。

#### 任せてよい内容

- future-native product 化前提の prerequisite 抽出
- audio 整理前提の prerequisite 抽出
- volumetric / PBD / fracture / MPM product 化前提の prerequisite 抽出
- registry / manifest / routing 参照経路の観察メモ

#### 返却形式

- 依存矢印の md
- `A が終わらないと B に入れない` リスト

#### 禁止

worker AI が dependency gate を勝手に確定しない。

---

### 2-6. merge 単位の候補提案

#### 委譲できる理由

統合ルールの正本は mainline 側だが、局所作業の返却粒度提案は worker 側でできる。

#### 任せてよい内容

- この修正は patch 向きか branch 向きかの提案
- subsystem 別の最小 merge 単位提案
- file split 作業の返却粒度提案

#### 返却形式

- `task / recommended return unit / why / verify scope` 表

---

### 2-7. verify checklist の subsystem 別作成

#### これは強く委譲してよい

worker AI が担当物に対して、自分の verify checklist を持つのは有効。

#### 任せてよい内容

- audio 用 verify checklist
- future-native 用 verify checklist
- family product 化用 checklist
- docs 更新 checklist
- import / export roundtrip checklist

#### 返却形式

- 作業ごとの完了条件 md
- 実行コマンド一覧
- 手動確認項目一覧

#### mainline 側で必要なこと

- global criteria への適合確認

---

### 2-8. conflict 危険箇所の監査

#### 委譲できる理由

hot spot の洗い出しは worker AI に向いている。

#### 任せてよい内容

- 長大ファイルの衝突リスク診断
- 共通型の多重依存診断
- 同一 UI 領域を複数 task が触る危険性の監査
- archive と現行本体の取り違えリスクの監査

#### 実例として優先監査対象

- `components/controlPanelTabsAudioRouteEditor.tsx`
- `components/controlPanelTabsAudioLegacyConflict.tsx`
- `components/useAudioLegacyConflictBatchActions.ts`
- `lib/audioReactiveValidation.ts`
- `docs/archive/` と現行 root の同名ファイル群

#### 返却形式

- `file / conflict risk / meaning risk / suggested handling` 表

---

## 3. 他 AI に任せやすい具体作業

### A. 調査専任 AI

任せるもの

- subsystem inventory
- state evidence 収集
- conflict hot spot 監査
- archive 混入監査

返却物

- 台帳 md
- 危険箇所 md

### B. audio 専任 AI

任せるもの

- audio 巨大ファイルの局所棚卸し
- bulk edit 周辺の docs / checklist
- 分割候補の提案

禁止

- global routing の意味変更
- manifest 正本変更

### C. family 専任 AI

任せるもの

- PBD / volumetric / fracture / MPM の各 family の現状監査
- product 未閉鎖箇所の列挙
- preset / UI / export / import / routing 接続不足の洗い出し

### D. verification 専任 AI

任せるもの

- verify checklist 作成
- subsystem 別の proof 整理
- fixture 候補整理

### E. docs / package 監査 AI

任せるもの

- docs 間矛盾の洗い出し
- package class 表記揺れの洗い出し
- handoff 文書の証拠整理

禁止

- package class の最終確定

---

## 4. worker AI が返すべき単位

### patch で返しやすいもの

- 棚卸し md
- checklist md
- conflict 監査 md
- 局所 docs 修正
- 1 directory 内の file split 提案

### branch で返しやすいもの

- 1 subsystem の整理一式
- 1 family の product 化補助一式
- 1 UI 領域の局所再編

### 返してはいけないもの

- manifest 正本の意味変更を含むパッチ
- registry / routing / package class を勝手に変えた branch
- `CURRENT_STATUS.md` だけ先に直した branch

---

## 5. worker AI の完了条件

worker AI は、少なくとも以下を返す。

1. 対象範囲
2. 触った file
3. 触っていないが関連する file
4. 実行した verify
5. 未解決点
6. mainline 側に判断を戻す点

これがないと、mainline owner AI が統合できない。

---

## 6. mainline 側へ戻す時の書き方

返却テンプレートは以下で統一する。

```md
- 対象: 
- 種別: patch / branch
- 触った範囲: 
- 触っていない幹線: 
- 実行 verify: 
- 残件: 
- mainline 判断が必要な点: 
```

---

## 7. まとめ

他 AI に任せてよい未網羅層は、**一覧の材料集め・状態の evidence 収集・候補判定・担当表原案・依存図下書き・merge 粒度提案・verify checklist・ conflict 監査** である。

要するに、**正本決定ではなく、正本決定を支える材料作成** を worker AI に任せる。

この切り方なら、複数 AI を同時に使っても最後に本体へ戻しやすい。
