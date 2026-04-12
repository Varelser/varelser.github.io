# Intel Mac Live Browser Proof Ingest (2026-04-06)

## 目的
- Intel Mac 実機で採取した real-export fixture と proof logs を、repo 常設の archive へ最短で取り込む。
- 取り込み後に manifest / readiness / proof intake / handoff doctor を自動再生成する。

## 追加スクリプト
- `npm run scaffold:intel-mac-live-browser-proof-drop`
- `npm run ingest:intel-mac-live-browser-proof -- --source-dir exports/intel-mac-live-browser-proof-drop --browser-executable-path <Chromium実体>`

## drop 先の構造
- `exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-<slug>.json`
- `exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-capture-notes.md`
- 任意: `build.log` / `verify-project-state.log` / `verify-phase5.log`

## ingest 後に再生成されるもの
- `fixtures/project-state/real-export/manifest.json`
- `docs/archive/phase5-real-export-readiness-report.json`
- `docs/archive/phase5-proof-intake.json`
- `docs/archive/target-live-browser-readiness-intel-mac.json`
- `docs/archive/package-handoff-doctor.json`
- `docs/archive/intel-mac-live-browser-proof-ingest.json`

## 注意
- browser executable 実体が無いまま ingest しても、readiness は green にならない。
- fixture JSON が 0 本なら ingest は失敗扱いにする。
