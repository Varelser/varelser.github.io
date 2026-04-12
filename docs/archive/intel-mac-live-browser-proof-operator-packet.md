# Intel Mac Live Browser Proof Operator Packet

- sourceDir: `exports/intel-mac-live-browser-proof-drop`
- drop: **6/11**
- target: **5/6**
- blockers: **6**
- proofReady: **false**

## Required files
- `real-export/kalokagathia-project-<slug>.json`
- `phase5-proof-input/real-export-proof.json`
- `phase5-proof-input/real-export-capture-notes.md`
- `phase5-proof-input/logs/*.log`
- `phase5-proof-input/screenshots/*.png`
- `incoming/kalokagathia-intel-mac-live-browser-proof-<slug>.zip`

## Priority actions
1. **capture-real-export** — real browser export JSON is still missing from the drop
   - command: `./capture-on-intel-mac.sh /path/to/repo <slug> /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome $PWD`
   - outputs: `phase5-proof-input/logs/pipeline.log`, `real browser UI export saved to ~/Downloads/kalokagathia-project-<slug>.json`
2. **stage-real-proof-artifacts** — copied export/screenshots/logs must be normalized into the drop before verify/finalize can pass
   - command: `npm run stage:intel-mac-live-browser-proof-artifacts -- --source-dir exports/intel-mac-live-browser-proof-drop --slug <slug> --browser-executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --real-export ~/Downloads/kalokagathia-project-<slug>.json --screenshot ~/Desktop/export-overview.png --log exports/intel-mac-live-browser-proof-drop/phase5-proof-input/logs/pipeline.log`
   - outputs: `real-export/kalokagathia-project-<slug>.json`, `phase5-proof-input/real-export-proof.json`, `phase5-proof-input/evidence-manifest.json`, `phase5-proof-input/screenshots/*.png`, `phase5-proof-input/logs/*.log`
3. **draft-proof-summary** — proof summary JSON is incomplete or still pending
   - command: `npm run draft:intel-mac-live-browser-proof-summary -- --source-dir exports/intel-mac-live-browser-proof-drop --browser-executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`
   - outputs: `phase5-proof-input/real-export-proof.json`
4. **host-finalize** — after the drop is populated, ingest/finalize must regenerate repo-side manifests and status
   - command: `./finalize-on-host.sh /path/to/repo exports/intel-mac-live-browser-proof-drop /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome`
   - outputs: `fixtures/project-state/real-export/manifest.json`, `docs/archive/phase5-real-export-readiness-report.json`, `docs/archive/intel-mac-live-browser-proof-status.json`

## Existing helper scripts
- capture: `exports/intel-mac-live-browser-proof-drop/capture-on-intel-mac.sh`
- stage: `exports/intel-mac-live-browser-proof-drop/stage-artifacts-on-intel-mac.sh`
- package: `exports/intel-mac-live-browser-proof-drop/package-proof-bundle.sh`
- finalize: `exports/intel-mac-live-browser-proof-drop/finalize-on-host.sh`

## Failed check kinds
- `fixture-json`
- `fixture-json-valid`
- `proof-summary-json`
- `proof-summary-artifact-paths`
- `proof-summary-project-linkage`

## Blockers
- [drop] `fixture-json` → `exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-*.json` — real-export fixture JSON を追加または修正する
- [drop] `fixture-json-valid` → `exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-*.json` — real-export fixture JSON を追加または修正する
- [drop] `proof-summary-json` → `exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-proof.json` — real-export-proof.json を captured 状態に更新する
- [drop] `proof-summary-artifact-paths` → `listed paths in real-export-proof.json` — drop scaffold を確認する
- [drop] `proof-summary-project-linkage` → `capture.sourceProjectSlug -> artifacts.exports` — drop scaffold を確認する
- [target] `browser-executable` → `/home/oai/Library/Caches/ms-playwright/chromium-1208/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing` — Playwright Chromium か Chrome 実体を用意し、必要なら executable path を渡す

