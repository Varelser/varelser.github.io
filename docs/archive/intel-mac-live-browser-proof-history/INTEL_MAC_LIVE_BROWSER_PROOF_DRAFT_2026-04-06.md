# Intel Mac Live Browser Proof Draft

- 目的: drop ディレクトリ内の実在ファイルから `real-export-proof.json` を自動下書きする。
- 実行: `npm run draft:intel-mac-live-browser-proof-summary`
- 効果:
  - `real-export/*.json` を `artifacts.exports` に反映
  - `phase5-proof-input/screenshots/*` などの画像を `artifacts.screenshots` に反映
  - `phase5-proof-input/*.log|*.txt|*.json` を `artifacts.logs` に反映
  - fixture が 1 本なら `capture.sourceProjectSlug` を推定
  - `--browser-executable-path` 指定時は browser path も反映
- 注意: browser 実体や証跡が不足している場合、status は `pending` のままにする。
