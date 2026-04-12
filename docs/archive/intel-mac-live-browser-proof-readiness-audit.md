# Intel Mac Live Browser Proof Readiness Audit

- generatedAt: 2026-04-10T19:03:16.719Z
- drop: 6/11
- target readiness: 5/6
- projected after finalize: 2/6
- recommendedMode: capture-missing-evidence

## Gate Checklist
- [x] drop scaffolded
- [ ] valid real-export fixture present
- [ ] proof summary captured and artifact paths valid
- [x] structured proof log present
- [ ] host ingest already executed
- [ ] finalize already executed
- [x] doctor report present
- [x] operator packet present

## Decision
- readyForRealCapture: true
- readyForHostFinalize: false
- effectivelyClosable: false

## Remaining Blockers
- [drop] fixture-json: exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-*.json
- [drop] fixture-json-valid: exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-*.json
- [drop] proof-summary-json: exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-proof.json
- [drop] proof-summary-artifact-paths: listed paths in real-export-proof.json
- [drop] proof-summary-project-linkage: capture.sourceProjectSlug -> artifacts.exports
- [target] browser-executable: /home/oai/Library/Caches/ms-playwright/chromium-1208/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing

## Next Actions
- Intel Mac 実機で real-export JSON を 1 本採取し、stage-artifacts-on-intel-mac.sh か npm run stage:intel-mac-live-browser-proof-artifacts で drop へ正規配置する
- stage-artifacts-on-intel-mac.sh か npm run stage:intel-mac-live-browser-proof-artifacts で real-export-proof.json と evidence-manifest.json を再生成する
- browser executable / manifest / readiness report の欠損を埋めて finalize を再実行する
- projection after finalize is 2/6; close remaining blockers before rerun
- Intel Mac target can start capture immediately using the bundled .command wrapper
