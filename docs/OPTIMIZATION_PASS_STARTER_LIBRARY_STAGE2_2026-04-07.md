# Starter library stage 2

- Split operator-generated starters away from core starter library.
- Keep core private starter presets synchronous for initial state.
- Load operator starter presets and sequence lazily after app mount.
- Emit `operator-starter-data` as a separate non-preloaded chunk.
