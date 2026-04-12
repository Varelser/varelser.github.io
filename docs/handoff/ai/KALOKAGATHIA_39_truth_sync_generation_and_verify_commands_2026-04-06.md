# KALOKAGATHIA truth sync generation and verify commands

```bash
node scripts/generate-missing-layers-truth-sync-patches.mjs   --repo .   --overlay .

node scripts/verify-missing-layers-truth-sync-patches.mjs --repo .
```

## 併走確認

```bash
node scripts/verify-missing-layers-overlay.mjs --repo .
node scripts/verify-missing-layers-worker-packets.mjs --repo .
node scripts/verify-missing-layers-low-risk-patches.mjs --repo .
node scripts/verify-missing-layers-family-closure-patches.mjs --repo .
node scripts/verify-missing-layers-direct-patch-candidates.mjs --repo .
node scripts/verify-missing-layers-mainline-integration-order.mjs --repo .
node scripts/verify-missing-layers-truth-sync-patches.mjs --repo .
npm run verify:future-native-project-state-fast
npm run verify:future-native-safe-pipeline:core
```
