# 2026-04-11 Editor UX upgrades

## Scope selected from requested md

This pass implemented the highest-efficiency items that could be integrated safely into the current app architecture without destabilizing the runtime:

1. Undo / Redo for config edits
2. Keyboard shortcut system
3. Preset thumbnail capture and visual preset cards
4. Light touch/mobile assist
5. Verified that live performance diagnostics already existed before this pass

The following large-scope items were intentionally not implemented in this pass because they require deeper subsystem work or risk heavy regressions:

- Solver Web Worker migration
- WebGPU compute becoming the primary runtime path
- Three.js deep trim / custom build
- GIF export
- Camera path system
- Plugin architecture migration
- Physics numerical test suite
- OSC/MIDI expansion

## Implemented files

### New
- `lib/useConfigHistory.ts`
- `lib/useGlobalEditorShortcuts.ts`
- `lib/useViewportTouchAssists.ts`
- `lib/presetThumbnailCapture.ts`

### Updated
- `App.tsx`
- `styles.css`
- `types/presets.ts`
- `types/controlPanel.ts`
- `lib/appStateLibrary.ts`
- `lib/presetRecordFactory.ts`
- `lib/usePresetLibrary.ts`
- `components/AppScene.tsx`
- `components/AppBodySceneConnected.tsx`
- `components/controlPanelPresetCard.tsx`
- `components/controlPanelGlobalPresets.tsx`
- `components/controlPanelChrome.tsx`
- `components/ControlPanelBody.tsx`

## Behavior added

### Undo / Redo
- Config-only history stack
- `Cmd/Ctrl+Z` undo
- `Cmd/Ctrl+Shift+Z` redo
- `Ctrl+Y` redo
- History depth shown in the control panel
- Undo/Redo buttons added to panel chrome
- Preset transition periods excluded from history recording
- Initial hydration noise excluded from history recording

### Keyboard shortcuts
- `Space` play / pause
- `P` panel open / close
- `R` randomize
- `S` save trigger / screenshot path already used by app
- `1`, `2`, `3` layer focus toggle
- `←`, `→` previous / next sequence step load
- Editable inputs are excluded from shortcut interception

### Preset thumbnails
- Preset create / overwrite now captures renderer preview
- Thumbnails stored on preset records as `thumbnailDataUrl`
- Preset card now renders preview image when available
- Preset grid switched to a more visual multi-column layout
- Thumbnail data survives library parse/load paths

### Touch/mobile assist
- Detects coarse pointer / hover-none / narrow viewport
- Auto-collapses the control panel once on touch-ish viewports
- Canvas touch action tightened to reduce gesture conflicts
- Global overscroll suppression added

## Verification

- `npm run typecheck` ✅
- `npm run build` ✅

## Notes

- This pass targeted the highest ROI UX/editor improvements first.
- Heavy runtime/compute items remain separate and should be done as dedicated passes with profiling and regression verification.
