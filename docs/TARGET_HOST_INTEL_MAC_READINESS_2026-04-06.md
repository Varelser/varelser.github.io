# Target Host Intel Mac Readiness (2026-04-06)

## 要点
- 対象 host: **darwin/x64**（Intel Mac）
- native runtime readiness: **2 / 2 ok**
  - `@rollup/rollup-darwin-x64`
  - `@esbuild/darwin-x64`
- live browser readiness: **2 / 6 ok**
  - ok: `node_modules/playwright`
  - ok: `docs/archive/phase5-proof-input/real-export-capture-notes.md`
  - pending: Playwright Chromium 実体
  - pending: `fixtures/project-state/real-export/kalokagathia-project-*.json`
  - pending: `fixtures/project-state/real-export/manifest.json`
  - pending: `docs/archive/phase5-real-export-readiness-report.json`

## 実行コマンド
### 1. Intel Mac 向け native runtime bundle 確認
```bash
npm run inspect:intel-mac-runtime
```

### 2. Intel Mac 向け live browser readiness 確認
```bash
npm run inspect:intel-mac-live-browser-readiness
```

### 3. Intel Mac 実機で browser executable を入れる
```bash
npm install --include=optional
npx playwright install chromium
```

### 4. Intel Mac 実機で browser executable を明示して再確認
```bash
node scripts/verify-target-live-browser-readiness.mjs \
  --platform darwin \
  --arch x64 \
  --home-dir '$HOME' \
  --browser-executable-path "$HOME/Library/Caches/ms-playwright/chromium-1208/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing" \
  --write docs/archive/target-live-browser-readiness-intel-mac.json
```

### 5. scaffold を先に作る
```bash
npm run scaffold:intel-mac-live-browser-proof
```

### 6. real-export fixture を足した後に再生成
```bash
node scripts/generate-phase5-real-export-manifest.mjs
node scripts/generate-phase5-real-export-readiness-report.mjs
node scripts/generate-phase5-proof-intake.mjs
node scripts/doctor-package-handoff.mjs --write docs/archive/package-handoff-doctor.json
```

## fixture 側の条件
- `fixtures/project-state/real-export/` 配下に、**実 UI / 実 browser export 由来** の JSON を最低 1 本置く
- 単なる説明 md や placeholder ではなく、`verifyPhase5FixtureScenarios.ts` が期待する naming / manifest / schema を満たす export を置く

## この branch での意味
- Linux sandbox では `host-runtime-mismatch` のままでも、**Intel Mac target runtime bundle は既に揃っている**
- したがって、Intel Mac 実機で必要なのは主に
  1. Playwright Chromium 導入
  2. 実 browser export fixture 採取
  の 2 点です
