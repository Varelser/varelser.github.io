# Intel Mac Live Browser Proof Closeout Verdict

- generatedAt: 2026-04-10T19:03:16.918Z
- verdict: ready-for-real-capture
- target: 5/6
- projectedAfterFinalize: 2/6
- blockerCount: 6
- doctorStatus: unknown
- finalizeRan: false

## Next Step
- run capture on the Intel Mac target and return the bundle/fixtures

## Blockers
- [drop] fixture-json: exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-*.json
- [drop] fixture-json-valid: exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-*.json
- [drop] proof-summary-json: exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-proof.json
- [drop] proof-summary-artifact-paths: listed paths in real-export-proof.json
- [drop] proof-summary-project-linkage: capture.sourceProjectSlug -> artifacts.exports
- [target] browser-executable: /home/oai/Library/Caches/ms-playwright/chromium-1208/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing
