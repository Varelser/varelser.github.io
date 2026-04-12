# Intel Mac Live Browser Proof Status

## 目的
Intel Mac 実機で採取した browser proof を drop へ置いた後、
- fixture JSON の妥当性
- proof artifact の最低構成
- target readiness の欠損
- handoff effective status
を 1 つの status report に集約する。

## 今回追加したもの
- `scripts/intelMacLiveBrowserProofShared.mjs`
- `scripts/generate-intel-mac-live-browser-proof-status-report.mjs`
- `report:intel-mac-live-browser-proof-status`

## 強化点
- drop 側の fixture JSON は「存在」だけでなく「schema / presets / manifest.execution / serialization.layers」を検査する。
- ingest 時に invalid fixture をそのまま repo へ取り込まない。
- `capture-metadata.json` を archive へコピーし、後から採取環境を追跡できる。
- status report で blocker と next action を機械的に列挙する。

## 実行順
1. `npm run verify:intel-mac-live-browser-proof-drop`
2. `npm run ingest:intel-mac-live-browser-proof`
3. `npm run finalize:intel-mac-live-browser-proof`
4. `npm run doctor:intel-mac-live-browser-proof:refresh`
5. `npm run report:intel-mac-live-browser-proof-status`
