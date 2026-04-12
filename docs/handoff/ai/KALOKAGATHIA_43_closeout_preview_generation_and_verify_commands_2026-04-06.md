# closeout preview generation and verify commands

```bash
node scripts/generate-missing-layers-truth-sync-patches.mjs --repo . --overlay .
node scripts/verify-missing-layers-truth-sync-patches.mjs --repo .
node scripts/generate-missing-layers-closeout-preview.mjs --repo /path/to/base-repo --overlay .
node scripts/verify-missing-layers-closeout-preview.mjs --repo .
```

## 実行順

1. truth-sync patch index / patch 本文を再生成
2. truth-sync verify を通す
3. base repo を入力に closeout preview を生成
4. preview verify を通す

## 注意

- `--repo` は base repo root を指す
- `--overlay` は patch overlay 側 root を指す
- preview は overlay 側 `generated/` にのみ出る
- base repo の root 正本はこの手順では変更しない
