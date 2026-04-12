# Verifier / Build Fix 2026-04-02

## Summary
- Updated `scripts/verify-audio.mjs` static fallback to read legacy route labels from `components/controlPanelTabsAudioLegacy.ts`.
- Switched build/verification Vite entry points to `scripts/run-vite.mjs`.
- `scripts/run-vite.mjs` always uses `--configLoader runner` and falls back to a writable temp output directory when the archive root is read-only.
- `vite.config.ts` was updated to be ESM-safe and to honor `KALOKAGATHIA_OUT_DIR`.

## Result
- Split audio UI static verification follows the current file layout.
- Build no longer depends on write access to `node_modules/.vite-temp` or project-local `dist` when the extracted archive is owned by another user.
