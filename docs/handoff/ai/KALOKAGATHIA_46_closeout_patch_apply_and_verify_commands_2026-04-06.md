# closeout patch apply / verify commands

```bash
node scripts/generate-missing-layers-closeout-apply-ready-patches.mjs   --repo .   --overlay .

node scripts/verify-missing-layers-closeout-apply-ready-patches.mjs   --repo .   --overlay .
```

```bash
node scripts/apply-missing-layers-closeout-patches.mjs   --repo .   --overlay .   --mode patch
```

直接置換したい場合:

```bash
node scripts/apply-missing-layers-closeout-patches.mjs   --repo .   --overlay .   --mode replace
```
