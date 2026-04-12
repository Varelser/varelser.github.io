# Intel Mac Live Browser Proof Blockers

- generatedAt: 2026-04-10T19:03:16.060Z
- blockerCount: 6
- drop: 6/11
- target: 5/6

## Blockers
- [drop] fixture-json: exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-*.json -> real-export fixture JSON を追加または修正する
- [drop] fixture-json-valid: exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-*.json -> real-export fixture JSON を追加または修正する
- [drop] proof-summary-json: exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-proof.json -> real-export-proof.json を captured 状態に更新する
- [drop] proof-summary-artifact-paths: listed paths in real-export-proof.json -> drop scaffold を確認する
- [drop] proof-summary-project-linkage: capture.sourceProjectSlug -> artifacts.exports -> drop scaffold を確認する
- [target] browser-executable: /home/oai/Library/Caches/ms-playwright/chromium-1208/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing -> Playwright Chromium か Chrome 実体を用意し、必要なら executable path を渡す
