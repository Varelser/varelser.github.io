# KALOKAGATHIA low-risk patch bundle generation and verify commands

- 作成日: 2026-04-06
- 目的: Wave 3 の bundle index と bundle files を再生成・検証する手順を固定する

---

## 1. 生成

```bash
node scripts/generate-missing-layers-low-risk-patches.mjs   --repo .   --seed generated/handoff/missing-layers/official-ledger-seed-2026-04-06.json   --matrix generated/handoff/missing-layers/worker-evidence-matrix-2026-04-06.json   --out-json generated/handoff/missing-layers/low-risk-patch-bundles-2026-04-06.json   --out-md generated/handoff/missing-layers/low-risk-patch-bundles-2026-04-06.md   --out-dir generated/handoff/missing-layers/low-risk-patches-2026-04-06
```

---

## 2. 検証

```bash
node scripts/verify-missing-layers-low-risk-patches.mjs   --repo .   --index generated/handoff/missing-layers/low-risk-patch-bundles-2026-04-06.json   --bundles-dir generated/handoff/missing-layers/low-risk-patches-2026-04-06
```

---

## 3. 追加で回す基線 verify

```bash
npm run typecheck
npm run verify:future-native-project-state-fast
npm run verify:future-native-safe-pipeline:core
node scripts/verify-package-integrity.mjs --strict
```

---

## 4. この段階で見るもの

- bundleCount
- totalIncludedPackets
- roleBundles / familyBundles
- specialist bundle が mainline review 付きになっていること
- bundle file に Worker return template が入っていること
