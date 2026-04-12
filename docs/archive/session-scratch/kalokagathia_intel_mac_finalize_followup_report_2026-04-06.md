# Kalokagathia Intel Mac Finalize Follow-up Report (2026-04-06)

## 進捗
- MD2 patch readiness: 6 / 6 = 100.00%
- mainline runtime migration: 6 / 6 = 100.00%
- large implementation files unresolved: 0 / 0 = 100.00%
- repo package integrity: 29 / 29 ok = 100.00%
- target host runtime readiness (darwin/x64): 2 / 2 ok = 100.00%
- target host live browser readiness (darwin/x64): 2 / 6 ok = 33.33%
- Intel Mac live-proof automation coverage: 6 / 6 = 100.00%
- Intel Mac live-proof drop check: 4 / 5 ok = 80.00%

## 今回追加したもの
- `scripts/verify-intel-mac-live-browser-proof-drop.mjs`
- `scripts/finalize-intel-mac-live-browser-proof.mjs`
- `docs/INTEL_MAC_LIVE_BROWSER_PROOF_FINALIZE_2026-04-06.md`

## 今回の意味
- Intel Mac 実機で採取した証跡を、drop 検査 -> ingest -> readiness 再生成 -> handoff doctor 更新まで一発で流せるようになった。
- 現時点で drop check の不足は fixture JSON だけ。
- つまり、Intel Mac 実機で `kalokagathia-project-*.json` を 1 本置けば、finalize 導線を即実行できる。

## 通過確認
- `npm run scaffold:intel-mac-live-browser-proof-drop`
- `npm run verify:intel-mac-live-browser-proof-drop`
- `npm run typecheck`
- `npm run inspect:project-health --silent`
- `npm run verify:package-integrity --silent`
- `npm run inspect:intel-mac-live-browser-readiness --silent`
- `node scripts/doctor-package-handoff.mjs --write docs/archive/package-handoff-doctor.json`

## 現在の blocker
- Playwright Chromium executable
- `exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-*.json`
- `fixtures/project-state/real-export/manifest.json`（fixture ingest 後に再生成される）
- `docs/archive/phase5-real-export-readiness-report.json`（fixture ingest 後に再生成される）

## 次の実行対象
```bash
npm run finalize:intel-mac-live-browser-proof -- \
  --browser-executable-path "$HOME/Library/Caches/ms-playwright/chromium-1208/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
```
