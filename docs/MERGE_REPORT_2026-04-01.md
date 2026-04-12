# Merge report — 2026-04-01

## Source archives
- monosphere_complete_fixed_clean_plus_addon_2026-04-01_safe_cleanup_fixed.zip
- monosphere_suite_dedup_resume_2026-04-01.zip

## Merge policy
- Base: `monosphere_suite_dedup_resume_2026-04-01.zip`
- Selective forward-port from `safe_cleanup_fixed`
- Audio-reactive expansion, lockfile, dist, and node_modules from suite are preserved
- Native transform feedback capture integration and safe cleanup fixes are re-applied on top
- Known-problem duplicate fixture subtree `fixtures/project-state/phase5/` was intentionally not reintroduced

## Files added
- `lib/gpgpuTransformFeedbackNativeCapturePass.ts`
- `docs/GPGPU_TRANSFORM_FEEDBACK_NATIVE_CAPTURE_BINDING_2026-04-01.md`
- `docs/ADDON_INTEGRATION_KALOKAGATHIA_FOUNDATION_TRACK_V26_2026-04-01.md`
- `docs/MERGE_REPORT_2026-04-01.md`

## Files merged
- `components/sceneGpgpuSystem.tsx`
- `components/gpgpuDiagnostics.ts`
- `DOCS_INDEX.md`

## Conflict resolution notes
- `package.json` / `package-lock.json`: kept suite versions to preserve lockfile consistency
- `README.md` / `CURRENT_STATUS.md`: kept suite versions to preserve newer audio-reactive status and verification notes
- `components/sceneGpgpuSystem.tsx`: merged manually so suite behavior stays while native TF capture + cleanup are added
