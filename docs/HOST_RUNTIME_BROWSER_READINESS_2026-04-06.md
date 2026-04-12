# Host runtime / browser readiness (2026-04-06)

## 目的
- `package-integrity` が pass でも、現在の host で `build` や live browser verify が実行できない false green を防ぐ。
- package class と host readiness を分離して扱う。

## 追加したもの
- `scripts/hostRuntimeShared.mjs`
- `scripts/verify-host-runtime.mjs`
- `scripts/verify-live-browser-readiness.mjs`
- `scripts/liveBrowserReadinessShared.mjs`
- `scripts/scaffold-intel-mac-live-browser-proof.mjs`
- `package.json`
  - `inspect:host-runtime`
  - `verify:host-runtime`
  - `inspect:live-browser-readiness`
  - `verify:live-browser-readiness`

## 現在の host で確認できたこと
- host: `linux/x64/gnu`
- host runtime: `0 / 2 ok`
  - missing `node_modules/@rollup/rollup-linux-x64-gnu`
  - missing `node_modules/@esbuild/linux-x64`
- live browser readiness: `2 / 6 ok`
  - ok: `node_modules/playwright`
  - ok: `docs/archive/phase5-proof-input/real-export-capture-notes.md`
  - missing Playwright Chromium executable
  - missing committed real-export JSON under `fixtures/project-state/real-export/`
  - missing `fixtures/project-state/real-export/manifest.json`
  - missing `docs/archive/phase5-real-export-readiness-report.json`

## 振る舞い変更
- `scripts/run-vite.mjs` は build 前に host runtime を preflight し、Rollup / esbuild の host-native package 欠損を明示して停止する。
- `scripts/doctor-package-handoff.mjs` は `effectiveStatus` を出力し、`host-runtime-mismatch` / `live-browser-blocked` を区別する。
- `scripts/verify-package-integrity.mjs` は package integrity に加えて host runtime summary も出力する。

## 解釈
- package class が `full-local-dev` でも、現在 host が `ready` とは限らない。
- handoff 判定では `packageClass` と `effectiveStatus` をセットで見る。

## 追加の運用
- `npm run scaffold:intel-mac-live-browser-proof` で `fixtures/project-state/real-export/` と `docs/archive/phase5-proof-input/real-export-capture-notes.md` を先に作れる。
- live browser readiness は README 的な md ではなく、**実 browser export JSON + manifest + readiness report** が揃うまで green にしない。
