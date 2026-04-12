# KALOKAGATHIA additive patch rollout wave plan

- 作成日: 2026-04-06
- 目的: 本体に直接大規模変更を入れず、**後から patch で安全に加える順序** を波状投入で固定する
- 前提: 現本体は build / typecheck / project state fast verify の基線があるため、まずそれを壊さない

---

## 1. 今回の基本方針

- 本体を先に書き換えない
- まず docs overlay と台帳を足す
- 次に worker AI へ evidence 収集を並列委譲する
- 幹線変更は mainline owner AI が最後に吸収する
- `CURRENT_STATUS.md` の最終同期は一番最後に行う

---

## 2. Wave 0: docs overlay only

### 入れるもの
- `00`
- `10`
- `11`
- `12`
- `13`
- `14`
- `15`
- `16`

### 目的
- 交通整理
- 役割分担の固定
- 本体へ additive に入る最小 patch

### verify
- path check
- docs presence check
- 参照リンクの整合確認

### 期待効果
- 次の AI が archive を誤って正本扱いする事故を減らす
- worker AI へ無駄な質問なく割当できる

---

## 3. Wave 1: official ledger 受け皿の固定

### mainline でやること
- family / mode / subsystem の official ledger の枠を作る
- `implemented / partial / not-started` の判定語彙を固定する
- `parallel / conditional / mainline-only` の判定語彙を固定する
- product closure 判定語彙を固定する

### まだやらないこと
- 各 family の最終判定を全部埋めること
- docs final truth の更新

### verify
- 表記揺れがないこと
- worker 返却テンプレートに当てはまること

---

## 4. Wave 2: worker AI の材料回収

### 並列に回すもの
- subsystem inventory
- state evidence 収集
- conflict audit
- verify checklist
- package / docs evidence 収集

### 推奨 worker 分割
- 調査専任
- audio 専任
- family 専任
- verification 専任
- docs-package 専任

### verify
- 各 worker 返却に以下があること

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

## 5. Wave 3: 低リスク patch 統合

### 統合してよいもの
- md inventory
- checklist
- conflict report
- verify note
- file split proposal
- package evidence note

### まだ mainline へ入れないもの
- manifest 変更
- render registry 変更
- routing 変更
- CURRENT_STATUS final update

### verify
- `npm run typecheck`
- `npm run verify:future-native-project-state-fast`
- `npm run verify:future-native-safe-pipeline:core`
- `node scripts/verify-package-integrity.mjs --strict`

---

## 6. Wave 4: family product closure patch

### 対象
- PBD
- MPM
- fracture
- volumetric
- audio 周辺の局所 closure

### 先に mainline で確認すること
- 接続不足が registry 起因か、scene binding 起因か、preset patch 起因か、UI 導線起因か
- family patch が manifest / routing truth を暗黙変更していないか

### verify
- family 個別 verify
- safe pipeline core
- artifact tail / artifact suite 必要範囲
- package integrity

---

## 7. Wave 5: docs truth と closeout 同期

### 最後にやること
- `CURRENT_STATUS.md`
- `REVIEW.md`
- `DOCS_INDEX.md`
- closeout report
- package handoff summary

### 最後にやる理由
- docs を先に確定すると実装とズレる
- package class / doctor / closeout は現物の最終状態で書く必要がある

---

## 8. 今すぐ mainline で回してよい推奨コマンド

```bash
npm run typecheck
node scripts/run-vite.mjs build
npm run verify:future-native-project-state-fast
npm run verify:future-native-safe-pipeline:core
node scripts/verify-package-integrity.mjs --strict
node scripts/doctor-package-handoff.mjs
node scripts/inspect-project-health.mjs
```

---

## 9. 現時点の判断

現本体は、次の段階に入っている。

- もう「壊れた本体の救急修理」ではない
- しかし「全 family の official closure が確定した状態」でもない

したがって最適解は、**additive patch で台帳と材料回収系を先に入れ、その後に family closure patch を統合する段取り** である。

---

## 10. この wave plan の終着点

最終的に mainline owner AI が得るべきものは以下。

1. official ledger
2. official state
3. official verify criteria
4. official merge unit
5. family closure の残件表
6. docs truth
7. closeout / handoff truth

この順番を守れば、後から patch を多数足しても破綻しにくい。
