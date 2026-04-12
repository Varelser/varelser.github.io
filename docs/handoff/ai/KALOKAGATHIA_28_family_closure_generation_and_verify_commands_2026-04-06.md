# KALOKAGATHIA family closure patch 生成 / 検証コマンド

- 作成日: 2026-04-06
- 目的: Wave 4 の family closure blueprint を再生成し、整合確認する。

---

## 1. 生成

```bash
node scripts/generate-missing-layers-family-closure-patches.mjs \
  --repo . \
  --matrix generated/handoff/missing-layers/worker-evidence-matrix-2026-04-06.json \
  --low-risk generated/handoff/missing-layers/low-risk-patch-bundles-2026-04-06.json \
  --out-json generated/handoff/missing-layers/family-closure-patch-index-2026-04-06.json \
  --out-md generated/handoff/missing-layers/family-closure-patch-index-2026-04-06.md \
  --out-dir generated/handoff/missing-layers/family-closure-patches-2026-04-06
```

## 2. 検証

```bash
node scripts/verify-missing-layers-family-closure-patches.mjs \
  --repo . \
  --matrix generated/handoff/missing-layers/worker-evidence-matrix-2026-04-06.json \
  --index generated/handoff/missing-layers/family-closure-patch-index-2026-04-06.json \
  --dir generated/handoff/missing-layers/family-closure-patches-2026-04-06
```

## 3. 本体側 verify 併用

```bash
npm run verify:future-native-project-state-fast
npm run verify:future-native-safe-pipeline:core
```

## 4. 期待値

- familyPatchCount = 22
- directPatchCandidates = 18
- mainlineReviewCandidates = 4
- issues = []

