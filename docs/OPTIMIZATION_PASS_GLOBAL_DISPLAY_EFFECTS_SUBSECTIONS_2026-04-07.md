# Optimization Pass — Global Display Effects Subsections (2026-04-07)

- Split `controlPanelGlobalDisplayEffects` into lazy-loaded `PostFx`, `GPGPU`, and `ScreenFx` subsections.
- Added dedicated chunks for `ui-control-panel-global-display-postfx`, `ui-control-panel-global-display-gpgpu`, and `ui-control-panel-global-display-screenfx`.
- Excluded these subsection chunks from HTML modulepreload so they load only when Global Display effects are opened.
- Preserved warning-free build and package-integrity coverage.
