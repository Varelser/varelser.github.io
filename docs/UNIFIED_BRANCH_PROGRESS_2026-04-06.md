# Unified Branch Progress 2026-04-06

## Scope

This branch starts from the package / handoff / host-readiness line and folds in the next audio cleanup pass.

Included in this branch:
- MD2 6-wave mainline migration lineage
- package / handoff / host-readiness checks
- audio cleanup pass for route editor and validation / retirement libraries

Not yet folded in from the earlier cleanup line:
- AudioLegacyConflict UI section split
- useAudioLegacyConflictBatchActions split
- useAudioLegacyConflictManager split
- useAudioLegacyConflictFocusedActions split

## Verified state

- `npm run typecheck` pass
- `npm run inspect:project-health` pass
- `npm run verify:package-integrity` pass
- `npm run inspect:host-runtime` pass
- `npm run inspect:live-browser-readiness` pass

## Progress numbers

- large implementation files: **7 -> 4**
- host runtime readiness: **0 / 2 ok** on this Linux host
- live browser readiness: **1 / 3 ok** on this Linux host
- repo package integrity: **29 / 29 ok**

## Remaining large files

1. `components/controlPanelTabsAudioLegacyConflict.tsx`
2. `components/useAudioLegacyConflictBatchActions.ts`
3. `components/useAudioLegacyConflictManager.ts`
4. `components/useAudioLegacyConflictFocusedActions.ts`

## Main changes in this pass

### audioReactiveValidation split
- `lib/audioReactiveValidation.ts` -> barrel only
- `lib/audioReactiveValidationTypes.ts`
- `lib/audioReactiveValidationShared.ts`
- `lib/audioReactiveFocusedCustomConflict.ts`
- `lib/audioReactiveBundleValidation.ts`
- `lib/audioReactiveLegacyParity.ts`

### audioReactiveRetirementMigration split
- `lib/audioReactiveRetirementMigration.ts` -> barrel only
- `lib/audioReactiveRetirementMigrationTypes.ts`
- `lib/audioReactiveRetirementMigrationShared.ts`
- `lib/audioReactiveRetirementStoredConflict.ts`
- `lib/audioReactiveRetirementStoredFixes.ts`

### Audio Route Editor split
- `components/controlPanelTabsAudioRouteEditor.tsx` -> shell only
- `components/controlPanelTabsAudioRouteEditorShared.ts`
- `components/controlPanelTabsAudioRouteTransferSection.tsx`
- `components/controlPanelTabsAudioRouteEditorWorkspace.tsx`
- `components/controlPanelTabsAudioRouteCard.tsx`

## Host constraints still visible

Current host audit remains intentionally red for native optional runtime pieces:
- `node_modules/@rollup/rollup-linux-x64-gnu`
- `node_modules/@esbuild/linux-x64`

Live browser readiness also remains intentionally incomplete on this host:
- Playwright Chromium executable missing
- `fixtures/project-state/real-export/` missing

- 2026-04-06 follow-up: patch runtime now consumes surface-family route drives; sequence trigger now accepts scope-specific seed-mutation targets (`sequence.seedMutation.motion|structure|surface|hybrid`).
