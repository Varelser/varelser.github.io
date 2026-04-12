# Intel Mac Live Browser Proof Bundle

- incoming bundle path: `exports/intel-mac-live-browser-proof-drop/incoming/kalokagathia-intel-mac-live-browser-proof-<slug>.zip`
- pipeline behavior: `run:intel-mac-live-browser-proof-pipeline` は `incoming/*.zip` を見つけたら先に自動展開します
- accepted layout:
  - `real-export/kalokagathia-project-<slug>.json`
  - `phase5-proof-input/real-export-capture-notes.md`
  - `phase5-proof-input/real-export-proof.json`
  - optional `phase5-proof-input/screenshots/*`
  - optional `phase5-proof-input/logs/*`
- if the bundle has a single top-level directory, extraction flattens it into the drop root automatically
- multiple bundle zips require `--bundle-path` to disambiguate
