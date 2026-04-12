# KALOKAGATHIA Wave 5 direct patch generation and verify commands

- 作成日: 2026-04-06
- 目的: direct patch candidate suite の再生成と検証コマンドを固定する。

## 1. 再生成

```bash
node scripts/generate-missing-layers-direct-patch-candidates.mjs   --repo .   --family-index generated/handoff/missing-layers/family-closure-patch-index-2026-04-06.json   --out-json generated/handoff/missing-layers/direct-patch-candidate-index-2026-04-06.json   --out-md generated/handoff/missing-layers/direct-patch-candidate-index-2026-04-06.md   --out-dir generated/handoff/missing-layers/direct-patch-candidates-2026-04-06
```

## 2. 検証

```bash
node scripts/verify-missing-layers-direct-patch-candidates.mjs --repo .
```

## 3. 推奨併走 verify

```bash
node scripts/verify-missing-layers-family-closure-patches.mjs --repo .
node scripts/verify-missing-layers-low-risk-patches.mjs --repo .
node scripts/verify-missing-layers-worker-packets.mjs --repo .
node scripts/verify-missing-layers-overlay.mjs --repo .
```
