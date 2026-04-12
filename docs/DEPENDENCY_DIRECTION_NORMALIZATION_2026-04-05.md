# Dependency Direction Normalization — 2026-04-05

- Added `lib/motionCatalog.ts` and switched remaining `lib/*` imports away from `components/motionCatalog`.
- Moved `ControlPanelProps` and related shared control panel types into `types/controlPanel.ts`.
- Kept `components/motionCatalog.ts` and `components/controlPanelTypes.ts` as compatibility re-export shims.
