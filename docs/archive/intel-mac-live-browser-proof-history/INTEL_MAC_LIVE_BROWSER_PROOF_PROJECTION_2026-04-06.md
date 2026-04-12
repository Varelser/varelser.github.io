# Intel Mac Live Browser Proof Projection

- purpose: 実機で drop へ証跡を置いたあと、finalize 再実行で target live-browser readiness がどこまで上がるかを事前に数値化する
- source inputs:
  - `docs/archive/intel-mac-live-browser-proof-drop-check.json`
  - `docs/archive/target-live-browser-readiness-intel-mac.json`
- output:
  - `docs/archive/intel-mac-live-browser-proof-projection.json`
  - `docs/archive/intel-mac-live-browser-proof-projection.md`
- main checks:
  - dropped fixture が valid か
  - proof summary が captured か
  - proof summary 内 artifact path が実在するか
  - `capture.sourceProjectSlug` が export JSON と一致するか
  - structured proof artifact があるか
  - target host で browser executable が見つかるか
- meaning:
  - current target readiness は「今の repo 状態」
  - projected after finalize は「いま drop にある証跡を ingest/finalize した場合の到達見込み」
