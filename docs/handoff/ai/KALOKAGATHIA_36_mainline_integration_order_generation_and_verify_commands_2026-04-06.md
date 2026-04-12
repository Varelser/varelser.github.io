# KALOKAGATHIA mainline integration order generation and verify commands

- 作成日: 2026-04-06
- 目的: mainline integration order index を再生成し、verify するためのコマンドを固定する。

## 1. 再生成

```bash
node scripts/generate-missing-layers-mainline-integration-order.mjs   --repo .   --out-json generated/handoff/missing-layers/mainline-integration-order-2026-04-06.json   --out-md generated/handoff/missing-layers/mainline-integration-order-2026-04-06.md
```

## 2. verify

```bash
node scripts/verify-missing-layers-mainline-integration-order.mjs --repo .
```

## 3. closeout 前の最小確認

```bash
node scripts/verify-missing-layers-overlay.mjs --repo .
node scripts/verify-missing-layers-worker-packets.mjs --repo .
node scripts/verify-missing-layers-low-risk-patches.mjs --repo .
node scripts/verify-missing-layers-family-closure-patches.mjs --repo .
node scripts/verify-missing-layers-direct-patch-candidates.mjs --repo .
node scripts/verify-missing-layers-mainline-integration-order.mjs --repo .
npm run verify:future-native-project-state-fast
npm run verify:future-native-safe-pipeline:core
```
