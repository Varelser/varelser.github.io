# Optimization pass: particle barrier split

- AppSceneLayerContent now imports `SceneGroup` directly from `sceneGroup` instead of the `scenePrimitives` barrel.
- `ParticleSystem` is now lazy-loaded at the layer-content boundary.
- `scenePrimitives` barrel was pruned to avoid accidental eager pulls of particle/overlay modules.
- Added `scene-particle-core` and `scene-overlay-core` preload exclusions so deferred chunks are not eagerly preloaded by `index.html`.
