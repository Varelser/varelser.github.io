# KALOKAGATHIA overlay generation and verify commands

- 作成日: 2026-04-06
- 目的: この overlay を本体へ重ねたあと、**seed 再生成** と **presence / schema verify** を機械で回せるようにする

---

## 1. 追加した script

- `scripts/generate-missing-layers-ledger-seed.mjs`
- `scripts/verify-missing-layers-overlay.mjs`

---

## 2. seed 再生成コマンド

repo root で実行する。

```bash
node scripts/generate-missing-layers-ledger-seed.mjs \
  --repo . \
  --out-json generated/handoff/missing-layers/official-ledger-seed-2026-04-06.json \
  --out-md generated/handoff/missing-layers/official-ledger-seed-2026-04-06.md
```

### 期待出力
- familyCount: **22**
- projectIntegratedFamilies: **22**
- renderHandoffCases: **17**

---

## 3. overlay verify コマンド

```bash
node scripts/verify-missing-layers-overlay.mjs --repo .
```

### 何を確認するか

- `00` `10` `11` `12` `13` `14` `15` `16` `17` `18` `19` が揃っているか
- generated seed の json / md があるか
- familyId が重複していないか
- mode binding の familyId が seed family 一覧に存在するか

---

## 4. 推奨の実行順

1. overlay files を本体へ patch 適用
2. `node scripts/generate-missing-layers-ledger-seed.mjs ...`
3. `node scripts/verify-missing-layers-overlay.mjs --repo .`
4. その後で worker AI へ担当を切る
5. 最後に mainline が official ledger へ昇格させる

---

## 5. この overlay を入れてもまだやらないこと

- manifest 正本変更
- registry 正本変更
- routing 正本変更
- `CURRENT_STATUS.md` の final update

---

## 6. ここまでの位置づけ

Wave 0 は docs overlay。  
今回の追加で Wave 1 のうち、**official ledger の seed と機械再生成基盤** まで進んだ。

つまり現状態は、

- docs only ではない
- まだ mainline truth 確定でもない
- しかし次の AI が現物から seed を再生成し直せる

という段階である。

---

## 7. 直後に着手しやすい対象

### mainline owner AI
- official ledger の正本化
- specialist-native の route evidence 補完
- `volumetric-density-transport` の closure 判定

### worker AI
- audio hotspot 監査
- future-native large renderer/payload 分割案
- archive duplicate 監査
- family ごとの verify checklist 補強
