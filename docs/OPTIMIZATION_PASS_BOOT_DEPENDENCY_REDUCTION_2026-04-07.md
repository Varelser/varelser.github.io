# Optimization Pass — Boot Dependency Reduction (2026-04-07)

- Deferred auxiliary UI imports in `AppRootLayout` so compare preview, diagnostics overlay, and canvas stream widget do not load on first paint unless needed.
- Split core starter payload into `starterLibraryData.ts` and converted `starterLibrary.ts` to async loaders.
- Removed manual `starter-library-data` chunk pinning that created circular warnings with `scene-authoring-catalog`.
- Result: `starterLibraryData` is now a natural async chunk (~200.72 KB) and is no longer in `index.html` modulepreload.
- Final build is warning-free; unit tests and package integrity pass.
