# KALOKAGATHIA official ledger vocabulary and schema

- 作成日: 2026-04-06
- 目的: Wave 1 で必要になる **official ledger の語彙** と **初版 schema** を固定する
- 前提: これは final truth ではなく、mainline owner AI が後から state を確定するための受け皿である

---

## 1. 固定する語彙

### 1-1. official state

official state は次の3値だけを使う。

- `implemented`
- `partial`
- `not-started`

#### 意味
- `implemented`
  - コード経路・verify 経路・routing/manifest 接続の evidence があり、
  - mainline owner AI が「公式に実装済み」と認めた状態
- `partial`
  - コードや verify はあるが、product closure / routing / manifest / docs truth のどこかが未閉鎖
- `not-started`
  - 実装 evidence がない、または scaffold 以前

#### 禁止
- `almost-done`
- `near-complete`
- `mostly-implemented`
- `done-ish`

これらは進捗メモには使ってもよいが、official state には使わない。

---

### 1-2. ownership class

ownership class は次の3値だけを使う。

- `parallel`
- `conditional`
- `mainline-only`

#### 意味
- `parallel`
  - worker AI が幹線に触れず patch 返却しやすい
- `conditional`
  - worker AI が触れてよいが、mainline 側の gate / review が前提
- `mainline-only`
  - manifest / registry / routing / package class / docs truth に近く、
    mainline owner AI が握るべき

---

### 1-3. closure candidate

closure candidate は次の3値だけを使う。

- `review-ready`
- `needs-review`
- `blocked`

#### 意味
- `review-ready`
  - state candidate は高いが、mainline の最終 closure review がまだ必要
- `needs-review`
  - 実装 evidence はあるが、closure の穴や route 欠落が疑われる
- `blocked`
  - 前提 gate 未固定または evidence 不足

---

## 2. official ledger の最小 schema

各 item は最低限次を持つ。

```json
{
  "itemType": "family | mode | subsystem",
  "id": "string",
  "title": "string",
  "group": "string | null",
  "officialState": "implemented | partial | not-started",
  "ownershipClass": "parallel | conditional | mainline-only",
  "closureCandidate": "review-ready | needs-review | blocked",
  "evidence": ["string"],
  "verify": ["string"],
  "notes": ["string"]
}
```

---

## 3. family 用の追加フィールド

family はさらに次を持つ。

- `serializerBlockKey`
- `declaredStage`
- `currentStage`
- `progressPercent`
- `verifiedModes`
- `bindingModes`
- `projectIntegrated`
- `nextTargets`

---

## 4. mode 用の追加フィールド

mode はさらに次を持つ。

- `familyId`
- `bindingMode`
- `source`
- `minPoints`
- `routingEvidence`

---

## 5. subsystem 用の追加フィールド

subsystem はさらに次を持つ。

- `path`
- `fileCount`
- `riskNotes`
- `hotspots`

---

## 6. 初版 seed で確定した入力源

今回の overlay では、seed 作成の根拠を次で固定した。

- `lib/future-native-families/futureNativeFamiliesRegistry.ts`
- `lib/future-native-families/futureNativeFamiliesProgress.ts`
- `lib/future-native-families/futureNativeFamiliesIntegrationShared.ts`
- `scripts/verify-future-native-render-handoff-fast-entry.ts`
- `docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md`
- 現 repo の directory / file 走査
- archive duplicate 走査
- large implementation file 走査

---

## 7. seed と final truth の違い

今回の generated seed で `implemented` が入っていても、それは **mainline 確定前の初版候補** である。

つまり、

- seed は材料
- official ledger は正本
- CURRENT_STATUS は最後の同期先

という順番を守る。

---

## 8. mainline owner AI が次にやること

1. family / mode / subsystem の正本台帳を作る
2. `implemented / partial / not-started` を最終確定する
3. `parallel / conditional / mainline-only` を最終確定する
4. `review-ready / needs-review / blocked` を最終確定する
5. その後にだけ `CURRENT_STATUS.md` へ反映する
