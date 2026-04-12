# Optimization Pass: Global Display Sections Lazy (2026-04-07)

- Split `GlobalDisplayEffectsSection` into `ui-control-panel-global-display-effects`
- Split Product Packs hook+section into `ui-control-panel-global-display-packs` via `controlPanelGlobalDisplayProductPacksLazy.tsx`
- Kept `GlobalDisplaySection` itself lightweight and warning-free
- Verified `ui-control-panel-global-display-effects` and `ui-control-panel-global-display-packs` are not present in `dist/index.html` modulepreload
- Verified typecheck, build, unit, and package integrity after change
- `ui-control-panel` reduced to 309.44 kB in this pass
