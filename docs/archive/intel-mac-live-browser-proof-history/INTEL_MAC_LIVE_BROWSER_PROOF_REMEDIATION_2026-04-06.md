# Intel Mac Live Browser Proof Remediation

- 目的: Intel Mac 実機で不足している proof artifact を exact path 単位で可視化する。
- 追加: `report:intel-mac-live-browser-proof-remediation`
- 出力:
  - `docs/archive/intel-mac-live-browser-proof-remediation.json`
  - `docs/archive/intel-mac-live-browser-proof-remediation.md`
- 補強点:
  - `real-export-capture-notes.md` の structured field を `draft:intel-mac-live-browser-proof-summary` が自動読込
  - browser executable path / browser version / export timestamp / source project slug を notes から summary へ反映可能
  - remediation report は不足ファイルの exact path と再実行コマンド列を固定
- 現時点の用途:
  - 実機証跡がまだ無い状態でも、次に置くべきファイルと実行順を機械的に出す
