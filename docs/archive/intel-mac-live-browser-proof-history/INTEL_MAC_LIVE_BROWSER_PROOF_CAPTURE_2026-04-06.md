# Intel Mac Live Browser Proof Capture (2026-04-06)

## 目的
- Intel Mac 実機で Playwright Chromium と real-export fixture を固定する。
- その結果を repo 常設の readiness / proof intake / handoff doctor に反映する。

## 事前条件
- host: darwin/x64 (Intel Mac)
- node_modules 同梱 bundle を展開済み

## 実行順
1. `npm install --include=optional`
2. `npx playwright install chromium`
3. 実 UI から project export を 1 本以上保存し、`fixtures/project-state/real-export/kalokagathia-project-<slug>.json` に置く
4. `npm run generate:phase5-real-export-manifest`
5. `npm run generate:phase5-real-export-readiness-report`
6. proof logs を `docs/archive/phase5-proof-input/` に置く
7. `npm run generate:phase5-proof-intake`
8. `npm run inspect:intel-mac-live-browser-readiness`
9. `node scripts/doctor-package-handoff.mjs --write docs/archive/package-handoff-doctor.json`

## 保存先
- fixture: `fixtures/project-state/real-export/`
- manifest: `fixtures/project-state/real-export/manifest.json`
- readiness: `docs/archive/phase5-real-export-readiness-report.json`
- proof intake: `docs/archive/phase5-proof-intake.json`
- notes template: `docs/archive/phase5-proof-input/real-export-capture-notes.md`

## 完了条件
- Intel Mac live browser readiness が **5 / 5 ok**
- handoff doctor の Intel Mac live browser readiness が ready
