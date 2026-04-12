# Intel Mac Live Browser Proof Pipeline

- 目的: Intel Mac 実機で drop に証跡を置いた後、draft / verify / finalize / doctor / report を 1 回の起動で連結する。
- 追加 script: `run:intel-mac-live-browser-proof-pipeline`
- finalize 実行条件:
  - valid fixture JSON
  - captured `real-export-proof.json`
  - summary artifact path 実在
  - sourceProjectSlug と export artifact の一致
  - structured proof files あり
- finalize 条件を満たさない場合:
  - finalize は自動で skip
  - remediation / doctor / blocker report を更新して next action を返す
- browser executable path の優先順位:
  1. `--browser-executable-path`
  2. capture notes
  3. proof summary
  4. darwin/x64 向け標準候補の自動検出
