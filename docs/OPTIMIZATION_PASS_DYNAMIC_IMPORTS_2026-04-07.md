# Optimization pass: dynamic imports and control panel chunk refinement

- Converted App/AppBodyScene Three.js imports to type-only imports.
- Replaced namespace Three.js imports with named imports in AppScene/AppSceneCameraRig/appStateCollision.
- Lazy-loaded AppScene and AppComparePreview from AppRootLayout.
- Split control-panel build output into base/global/layers/audio/audio-legacy chunks.
- Kept manual chunking conservative to avoid circular-chunk warnings.
