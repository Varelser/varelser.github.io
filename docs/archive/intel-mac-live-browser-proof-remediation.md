# Intel Mac Live Browser Proof Remediation

- generatedAt: 2026-04-10T19:03:16.523Z
- drop: 6/11
- target: 5/6
- projectedAfterFinalize: 2/6
- blockerCount: 6

## Exact Files
- [real-export-fixture] exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-<slug>.json — real browser export JSON がまだ無い
- [bundle-drop] exports/intel-mac-live-browser-proof-drop/incoming/kalokagathia-intel-mac-live-browser-proof-<slug>.zip — 個別ファイルの代わりに bundle zip を 1 本置くこともできる
- [proof-summary] exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-proof.json — captured 状態へ更新されていない
- [evidence-manifest] exports/intel-mac-live-browser-proof-drop/phase5-proof-input/evidence-manifest.json — stage script が生成する intake manifest。screenshots / logs / exports の実在確認に使う
- [summary-artifacts] exports/intel-mac-live-browser-proof-drop/phase5-proof-input/screenshots/* — summary に書いた artifact path が実在する必要がある
- [summary-artifacts] exports/intel-mac-live-browser-proof-drop/phase5-proof-input/logs/* — summary に書いた artifact path が実在する必要がある
- [browser-executable] /Applications/Google Chrome.app/Contents/MacOS/Google Chrome — Intel Mac 実機の browser executable が必要

## Commands
- npm run scaffold:intel-mac-live-browser-proof-drop
- npm run run:intel-mac-live-browser-proof-pipeline
- npm run stage:intel-mac-live-browser-proof-artifacts -- --source-dir exports/intel-mac-live-browser-proof-drop --slug <slug> --browser-executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --real-export ~/Downloads/kalokagathia-project-<slug>.json --screenshot ~/Desktop/export-overview.png --log exports/intel-mac-live-browser-proof-drop/phase5-proof-input/logs/pipeline.log
- npm run draft:intel-mac-live-browser-proof-summary
- npm run verify:intel-mac-live-browser-proof-drop
- npm run finalize:intel-mac-live-browser-proof -- --browser-executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
- npm run doctor:intel-mac-live-browser-proof:refresh

## Next Focus
- exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-<slug>.json
