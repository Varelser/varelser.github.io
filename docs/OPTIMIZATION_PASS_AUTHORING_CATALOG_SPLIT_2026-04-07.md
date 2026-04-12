# Optimization Pass — Authoring Catalog Split (2026-04-07)

- Split `scene-authoring-catalog` into four async chunks:
  - `scene-authoring-coverage`
  - `scene-authoring-atlas`
  - `scene-authoring-hybrid`
  - `scene-authoring-product`
- Moved `productPackScorecards*` and `productPackAugmentation*` into the coverage chunk to avoid `coverage <-> product` circular chunk warnings.
- Kept all `scene-authoring-*` chunks out of initial HTML modulepreload.
- Verified: `typecheck`, `build` (warning-free), `test:unit`, `verify-package-integrity --strict`.
