# KALOKAGATHIA worker packet generation and verify commands

- 作成日: 2026-04-06
- 目的: worker packet suite を **機械で再生成 / 検証** するコマンドを固定する

---

## 1. 生成

```bash
node scripts/generate-missing-layers-worker-packets.mjs   --repo .   --seed generated/handoff/missing-layers/official-ledger-seed-2026-04-06.json   --out-json generated/handoff/missing-layers/worker-evidence-matrix-2026-04-06.json   --out-md generated/handoff/missing-layers/worker-evidence-matrix-2026-04-06.md   --out-dir generated/handoff/missing-layers/worker-packets-2026-04-06
```

---

## 2. 検証

```bash
node scripts/verify-missing-layers-worker-packets.mjs   --repo .   --matrix generated/handoff/missing-layers/worker-evidence-matrix-2026-04-06.json   --packets-dir generated/handoff/missing-layers/worker-packets-2026-04-06
```

---

## 3. 併用推奨

worker packet suite 単体で終わらず、次も併用する。

```bash
node scripts/generate-missing-layers-ledger-seed.mjs   --repo .   --out-json generated/handoff/missing-layers/official-ledger-seed-2026-04-06.json   --out-md generated/handoff/missing-layers/official-ledger-seed-2026-04-06.md

node scripts/verify-missing-layers-overlay.mjs --repo .
node scripts/verify-package-integrity.mjs --strict
npm run verify:future-native-project-state-fast
```

---

## 4. 注意

worker packet suite は **CURRENT_STATUS の代替ではない**。

- official ledger seed を材料として読む
- worker packet で evidence を回収する
- 最後に mainline が official truth を固める

この順番を崩さない。
