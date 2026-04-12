# Kalokagathia

Kalokagathia is a local Vite + React + Three.js particle generator focused on monochrome motion graphics.

It supports a split workflow:

- Private workspace mode: your own editable presets and library live in browser `localStorage`
- Optional public exhibition mode: a bundled read-only library is loaded from [public-library.json](./public-library.json)

It supports:

- Multi-layer particle systems
- Per-source particle counts and motion parameters
- Nearby connection lines / plexus rendering
- Audio-reactive motion using microphone input or shared tab/system audio
- A standalone synth companion window that drives the visuals from a separate browser window without relying on screen-share capture
- Global look controls for softness, glow halo, and depth fog
- Camera control modes for auto, hybrid, or fully manual orbit behavior
- Viewport render-quality profiles for draft, balanced, or cinematic editing
- Motion search in the layer editor plus quick performance presets for heavy scenes
- Screen-space FX including scanlines, grain, vignette, radial pulse, contact flash, interference bands, persistence ghosts, signal split, sweep glow, and sequence-driven modulation during preset playback with per-step drive scaling, enable overrides, and absolute strength overrides
- Approximate inter-layer collision fields with layer-volume or per-source modes, optional audio-linked repulsion, and contact-driven glow/screen FX
- High-resolution PNG export with optional transparent background
- Browser-side WebM video export for the current scene or one full sequence pass
- ZIP export of PNG frame sequences for the current scene or one full sequence pass
- Local preset management for saving and reloading scene configurations
- Preset browsing with search, derived category chips, and lightweight/heavy complexity badges
- Preset sequence playback with per-step hold time, transition curve, keyframes, looping, and audio-triggered step advance / crossfade / randomize-surrogate routing
- Starter preset packs for fluid, chaos, orbital, lattice, broadcast, noir, toroidal, symmetry, nebula, and monolith-focused looks when no private library has been saved yet

Motion coverage includes:

- Noise and fluid-field families such as `flow`, `curl`, `smoke`, `liquid`, `noise`, `ridged_mf`
- Attractor and chaos families such as `lorenz`, `aizawa`, `rossler`, `thomas`, `euler`
- Orbital and geometric families such as `orbit`, `spiral_motion`, `helix`, `phyllotaxis`, `rose_curve`, `lissajous`, `toroidal`, `pendulum`, `lattice`, `epicycle`, `gyre`, `crystal`, `ripple_ring`, `fold`, `kaleidoscope`, `braid`, `arc_wave`, `web`, `pulse_shell`, `mandala`, `ribbon`, `shear`, `spokes`, `breathing`, `torus_knot`, `clifford`, `hopalong`, `cellular`, `cyclone`, `petals`, `sheet`, `flare`, `moebius`, `harmonic`, `starburst`, `grid_wave`, `helio`, `zigzag`, `shockwave`, `filament`, `mirror_fold`, `radial_steps`, `coil`, `labyrinth`, `gyro`, `echo_ring`, `braidshell`, `crosscurrent`, `prism`, `tessellate`, `pulse_grid`, `tidal`, `beacon`, `caustic`, `pinwheel`, `nebula`, `fronds`, `gyroflower`, `monolith`, `runes`, `fanout`, `eddy`, `nova`

## Requirements

- Node.js 18+

## Canonical Project Docs

- `CURRENT_STATUS.md`: current canonical project state
- `DOCS_INDEX.md`: document routing and archive rules
- `REVIEW.md`: current code review aligned to the actual source tree
- `REFACTOR_PLAN_LARGE_FILES.md`: concrete split plan for oversized files

Historical phase notes and older progress logs were moved to `docs/archive/root-history/`.


## Development

1. Install dependencies:
    `npm install`
2. Start the development server:
    `npm run dev`
3. Open the local URL shown by Vite

If this packaged snapshot was downloaded via a browser on macOS and native toolchain binaries are blocked by Gatekeeper quarantine, run:
`npm run doctor:clear-native-quarantine`

`scripts/run-vite.mjs` now attempts that recovery automatically on macOS before launching Vite, but the doctor command remains available when you want to clear the binaries explicitly first.

## Project Layout

- [App.tsx](./App.tsx): top-level orchestration and controller wiring
- [components](./components): control panel UI, scene primitives, shader chunks, and scene wrappers
- [lib](./lib): state normalization, preset/library IO, audio/export/sequence controllers, and helper hooks
- [types](./types): split domain type definitions with [types.ts](./types.ts) as the public barrel
- [scripts](./scripts): public-library sync and verification scripts

Key scene files:

- [components/sceneParticleSystem.tsx](./components/sceneParticleSystem.tsx): particle instancing and uniforms
- [components/sceneLineSystem.tsx](./components/sceneLineSystem.tsx): nearby connection line rendering
- [components/scenePhysicsLogic.ts](./components/scenePhysicsLogic.ts): assembled GLSL physics chunk
- [components/sceneShaderParticlePoint.ts](./components/sceneShaderParticlePoint.ts): particle point shaders
- [components/sceneShaderParticleLine.ts](./components/sceneShaderParticleLine.ts): line shaders

Key app/controller files:

- [lib/usePresetLibrary.ts](./lib/usePresetLibrary.ts): preset CRUD and dirty-state tracking
- [lib/useSequenceController.ts](./lib/useSequenceController.ts): sequence orchestration
- [lib/useSequenceAudioTriggers.ts](./lib/useSequenceAudioTriggers.ts): audio-triggered sequence driver
- [lib/useAudioController.ts](./lib/useAudioController.ts): microphone/shared-audio/internal-synth control
- [lib/useExportController.ts](./lib/useExportController.ts): WebM and frame export orchestration

### macOS One-Click Launch

- Double-click [launch-kalokagathia.command](./launch-kalokagathia.command)
- The launcher checks dependencies, starts Vite, and opens the correct browser URL automatically
- Keep the terminal window open while the app is running

## Production Build

- Build the app:
   `npm run build`
- Preview the build locally:
   `npm run preview`

## GitHub Pages Deployment

This project can be published to GitHub Pages at a fixed file URL such as:

`https://varelserjp-code.github.io/hp/kalokagathia.html`

Recommended flow:

1. Create or use the repository `varelserjp-code.github.io`.
2. Push this project to the `main` branch of that repository.
3. In GitHub, open `Settings -> Pages` and set the source to `GitHub Actions`.
4. The included workflow will run on every push to `main`.

Build details:

- `npm run build:github-pages` builds the full-featured Pages version.
- `npm run build:github-pages-public` builds the read-only exhibition version with `VITE_LIBRARY_SCOPE=public`.
- It then copies `dist/index.html` to `dist/hp/kalokagathia.html`.
- The final published URL becomes `https://varelserjp-code.github.io/hp/kalokagathia.html`.

If you want to test the same output locally:

1. Run `npm run build:github-pages`
2. Open `dist/hp/kalokagathia.html` with a local static server, or deploy the generated `dist` folder to Pages.

## Netlify Deployment

This app can be deployed to Netlify as a static Vite site.

- Build command:
   `npm run build`
- Publish directory:
   `dist`
- Node version:
   `20`

The repository includes [netlify.toml](./netlify.toml), so Netlify should detect the correct settings automatically.

If you want Netlify to behave like the read-only exhibition build, set `VITE_LIBRARY_SCOPE=public`. Otherwise it will run in the default full-featured mode.

Recommended flow:

1. Push this project to GitHub.
2. Create a new site in Netlify and import that repository.
3. Confirm the build command is `npm run build` and the publish directory is `dist`.
4. Deploy.

Notes for production hosting:

- Netlify serves over HTTPS by default, which is required for microphone access in browsers.
- Shared tab/system audio capture still depends on browser support and the browser share dialog. Deployment does not remove that limitation.
- Browser downloads such as PNG, ZIP, and WebM exports continue to run client-side after deployment.
- Private/local authoring data stays in browser `localStorage` in private mode only.
- Public deployment presets are sourced from [public-library.json](./public-library.json).

## Private/Public Split

Recommended workflow:

1. Work locally in the default private mode.
2. Start from the bundled starter presets, or keep your own editable presets in browser `localStorage`.
3. Export the library JSON from the private build when you want to publish.
4. Run `npm run sync:public-library -- path/to/exported-library.json`.
5. Deploy to Netlify. Use `VITE_LIBRARY_SCOPE=public` only when you want the read-only exhibition variant.

The sync command normalizes the exported payload and writes it into [public-library.json](./public-library.json) by default. You can pass a second path if you want to generate a different target file.

Example:

`npm run sync:public-library -- ./exports/kalokagathia-library-2026-03-07.json`

To test the public exhibition build locally, run `npm run dev:public` and open the Vite URL it prints.

The public build now behaves as an exhibition mode: scene parameters, randomize/reset actions, and sequence editing are locked, while preset loading, morphing, playback, and exports remain available.

## Verification Scripts

Core verification flow:

- Verify project-state manifest / execution routing / serialization consistency without a browser:
   `npm run verify:project-state`
- Verify Phase 4 end-to-end checks (`build` + `verify:project-state` + `verify:export`):
   `npm run verify:phase4`
- Verify Phase 5 import/export hardening, sparse serialization recovery, real fixture-file parity, temp-file export/import round-trip, duplicate-ID repair, and import-ID remap stability:
   `npm run verify:phase5`
- Regenerate the committed Phase 5 JSON fixtures under `fixtures/project-state/` after changing project payload expectations:
   `npm run generate:phase5-fixtures`

Browser / media / export checks:

- Verify transparent PNG export:
   `npm run verify:export`
- Verify audio reactivity with a deterministic fake analyzer:
   `npm run verify:audio`
- Verify inter-layer collision contact, impact FX, and audio-linked repulsion:
   `npm run verify:collision`
- Verify shared-audio mode with a mocked browser share stream:
   `npm run verify:shared-audio`
- Verify preset library export/import and sequence persistence:
   `npm run verify:library`
- Verify the bundled public library is normalized and internally consistent:
   `npm run verify:public-library`
- Verify the public exhibition UI is locked while playback/export actions remain available:
   `APP_URL=http://127.0.0.1:3000/ npm run verify:public-ui`
- Verify browser-side WebM export for current and sequence modes:
   `npm run verify:video`
- Verify PNG frame zip export for current and sequence modes:
   `npm run verify:frames`

Notes:

- `verify:project-state` and `verify:phase5`, `generate:phase5-completion-report` do not require a browser runtime. They are the first checks to run after project-serialization changes.
- `verify:phase5` now reads the committed fixture files in `fixtures/project-state/`, fails if they drift from the current expected payloads, writes temp exported JSON files to exercise disk round-trip plus preset/sequence ID remap preparation, and also checks duplicate-ID repair, orphan-sequence dropping, precise import-inspection errors, and import diagnostics reporting.
- `prepareImportedProjectData()` now supports explicit import modes: `replace` for full workspace replacement and `merge` for collision-aware intake. The UI import path uses `replace`, so stable preset/sequence IDs are preserved instead of being remapped against the outgoing workspace.
- `fixtures/project-state/real-export/` is reserved for browser UI export captures. When `.json` files are present there, `verify:phase5` inspects them, enforces the export file-name pattern, and checks serialize→parse stability without requiring the browser path in this environment.
- `npm run generate:phase5-real-export-manifest` rebuilds `fixtures/project-state/real-export/manifest.json`, storing a SHA-256 hash and summary counts for each committed browser export so `verify:phase5` can detect stale or drifted captures.
- `verify:export` still prefers the real app UI path first. If Chromium navigation is policy-blocked in the current sandbox, it falls back to the node canvas harness and keeps the PNG alpha assertions alive.
- Browser-driven scripts expect the app to be running locally. If your dev server is not on the default URL, set `APP_URL`.

Examples:

`npm run verify:phase5`

`APP_URL=http://127.0.0.1:3000/ npm run verify:export`

## Notes

- Microphone input requires browser permission when using real audio input.
- Transparent export is available from the control panel via `Transparent BG`.
- Video export is available from the `Main` tab and downloads a `.webm` capture from the browser.
- When `FX -> Audio Source` is set to `Shared Tab / System`, the browser can analyze the shared synth/app audio directly.
- When `FX -> Audio Source` is set to `Internal Synth`, WebM export includes that synth audio track.
- PNG frame export is available from the `Main` tab and downloads a `.zip` archive of numbered frames.
- Audio controls are available under the `FX` tab.
- The `FX` tab can use microphone input, shared tab/system audio, or the optional built-in browser synth.
- The `FX` tab also includes `Standalone Synth`, which opens a separate synth window and feeds audio analysis back into the main scene.
- On macOS, shared-audio capture depends on browser support. Chromium browsers generally work best for tab audio or screen audio with the browser share dialog.
- If a shared app window or system surface does not expose an audio track, prefer the `Standalone Synth` mode instead of relying on screen-share capture.
- Microphone and shared-audio capture can be embedded into WebM exports when those inputs are active.
- `Standalone Synth` keeps live playback in its companion window, and WebM export mirrors the synth settings into an internal capture track when that mode is active.
- Shared audio mode surfaces connection errors directly in the `FX` tab and includes a short 4-step YouTube Live workflow.
- Presets are managed from the `Main` tab and are stored in browser `localStorage`.
- The preset browser supports free-text search plus derived categories such as `Fluid`, `Chaos`, `Orbit`, `Pulse`, `Plexus`, and `Heavy`.
- The motion selector supports free-text search in addition to category grouping.
- Sequence playback is configured from the `Main` tab, including a clickable and draggable compact timeline view, a live playback position marker, drag reordering, step duplication, per-step easing curves, a live curve preview, and captured keyframes, and is also stored in browser `localStorage`.
- The display tab exposes camera mode and render-quality controls, while layer tabs surface a simple load estimate to help during heavy look development.
- The display tab also includes `Optimize Edit`, `Balanced`, and `Cinematic` shortcuts to quickly shift the viewport budget while exploring dense looks.

## Extending Motion Types

To add a new particle motion mode, update these four places together:

1. [types/scene.ts](./types/scene.ts) `Layer2Type`
2. [components/sceneMotionMap.ts](./components/sceneMotionMap.ts) numeric shader mapping
3. [components/scenePhysicsMotionChunk.ts](./components/scenePhysicsMotionChunk.ts) GLSL behavior in `applyMotion`
4. [components/controlPanelPartsMotion.tsx](./components/controlPanelPartsMotion.tsx) UI labels and icons

That path keeps the UI, CPU-side particle data generation, randomizer, and shader behavior aligned.


- Phase 5 drift report: `npm run generate:phase5-drift-report`
- Phase 5 now checks project fingerprint stability across parse/serialize/parse round-trips, not only counts.


## Phase 5 completion report

- `npm run generate:phase5-completion-report` writes `docs/archive/phase5-completion-report.json`.
- This report marks core Phase 5 completion criteria as done and treats browser-captured real-export fixtures as an optional follow-through rather than a gate. The evidence list now also points at the real-export readiness report.


- Phase 5 追補: `docs/archive/phase5-import-report.json` を追加し、replace / merge 両モードでの exact preset / sequence ID change、duplicate source ID の可視化、orphan drop を fixture ごとに固定した。

- `npm run generate:phase5-import-report` now writes `compareSummary` and `aggregateSummary`, so fixture-by-fixture retain/remap/drop counts can be compared without reading the full exact-ID tables.
- `npm run generate:phase5-real-export-readiness-report` writes `docs/archive/phase5-real-export-readiness-report.json`, classifying optional real-export fixtures by failure reason (`invalid-json`, `invalid-project-payload`, `manifest-entry-missing`, `manifest-sha256-drift`, `manifest-metadata-drift`, `roundtrip-drift`) and recording `statusCounts`, metadata drift fields, and round-trip drift fields per file.
- Phase 5 execution readiness: `npm run generate:phase5-execution-readiness-report` writes `docs/archive/phase5-execution-readiness-report.json`, separating repo-level readiness (lockfile sync) from environment blockers (`node_modules`, real-export fixture presence).
- Phase 5 evidence index: `npm run generate:phase5-evidence-index` writes `docs/archive/phase5-evidence-index.json`, centralizing completion criteria, import/drift coverage, readiness blockers, and remaining closure steps in one file.

- Phase 5 closeout は統合済みで、権威的な完了判定は `docs/archive/phase5-completion-report.json` を参照する。
- 旧 closeout / handoff レポートは `docs/archive/retired/` に退役済み。

## Phase 5 proof intake

- `docs/archive/phase5-proof-intake.json` tracks whether the four execution-proof logs (`npm-ci.log`, `verify-project-state.log`, `verify-phase5.log`, `build.log`) have been captured under `docs/archive/phase5-proof-input/`.
- This keeps execution-proven closeout separate from repo-level completion and makes the remaining closeout work mechanically checkable.
- Refresh the authority reports with:
  - `npm run generate:phase5-completion-report`
  - `npm run generate:phase5-evidence-index`
  - `npm run generate:phase5-drift-report`

## Audio reactive expansion docs

- `AUDIO_REACTIVE_ARCHITECTURE.md` — current design authority for future audio-reactive expansion
- `AUDIO_REACTIVE_ROADMAP.md` — staged implementation order
- `AUDIO_REACTIVE_AI_HANDOFF.md` — concise handoff for later AI passes
- `AUDIO_REACTIVE_COVERAGE_MATRIX.md` — live / reserved audio-reactive target coverage matrix
- `AUDIO_REACTIVE_VERIFICATION.md` — syntax verification scope for the latest pass

Current live families: particle / line / fog / growth / camera / screen overlay / surface.


## audio route editor supports

- route CRUD
- family / source / state / search filter
- visible routes bulk enable / disable / invert
- visible routes bulk mode / curve apply
- visible routes numeric offset apply
- route Up / Down reorder
- all routes source / target / family sort

## Audio Reactive route transfer

- Audio タブから route bundle を export / copy / append import / replace import できます。
- route bundle は file load / drag-drop で box / append / replace に流し込めます。
- sequence trigger の threshold / cooldown は Audio タブで調整できます。
- legacy slider は `Hide Safe Sliders` で parity 上 safe な候補だけ一時的に隠せます。
- Legacy Slider Parity には `Run Safe Auto-Fix Pass` があり、missing route 追加 / residual 整列 / exact duplicate 除去 / stale legacy 除去をまとめて走らせられます。

## Audio Reactive Routing Status

- route editor: bulk/filter/reorder/import/export/file-load/drag-drop/offset/validation-diff live
- sequence trigger: threshold/cooldown/seed-mutation/trigger-state/tuning-presets configurable
- target vocabulary: family alias targets enabled (`brush.*`, `patch.*`, `membrane.*`, `shell.*`, `crystalAggregate.*`, `voxelLattice.*`, `reactionField.*`, `depositionField.*`, `crystalDeposition.*`, `overlay.*`, `camera.impulse`, `camera.zoom`, `sequence.seedMutation`)


## Audio reactive status (2026-04-01 v7)

- route editor: bulk / filter / reorder / import / export / file-load / offset live
- sequence trigger: threshold / cooldown / seed-mutation / trigger-state visible
- family drive resolve: surface / deposition first-pass live


### Audio reactive sequence tuning

- Audio タブには sequence trigger tuning preset がある。
- `balanced / percussive / cinematic / drift` を押すと、enter / exit threshold、target 別 cooldown、seed mutation strength / scope がまとめて切り替わる。
- route transfer box は JSON の paste、file load、drag-drop を受ける。


## Audio Route Validation / Legacy Parity

- Audio タブの Route Transfer は、現在の JSON に対して validation summary を live 表示します。
- duplicate IDs / unknown targets / invalid source / invalid curve / invalid mode / clamp 正規化件数に加え、current routes との差分 changed / added / removed も確認できます。
- Legacy Slider Parity は、旧 slider 群から期待される route と現在 route の差分を first-pass で可視化します。
- Legacy Slider Parity には deprecation order があり、safe / review / blocked を見ながら old slider 縮退順を決められます。
- legacy slider visibility mode は config 永続化済みで、`Show All / Hide Safe / Retire Safe` を跨いで保存できます。
- `Retire Safe Sliders` は safe 候補を panel view から外す preview 段階で、旧 slider をまだ削除しません。
- `AUDIO_REACTIVE_LEGACY_RETIREMENT.md` に safe / review / blocked の段階縮退ルールを記載しています.


## Audio Reactive Legacy Retirement

Audio tab now includes a `Retirement Impact / Presets + Sequence` summary.

This reports how many `review` / `blocked` legacy slider candidates still remain in:

- current config
- saved presets
- sequence-linked presets
- sequence keyframe configs

Use this before moving from `retired-safe` preview retirement toward actual legacy slider removal.


## Audio Reactive Legacy Retirement

- current config の legacy slider parity は Audio タブで live 表示される。
- `Run Safe Auto-Fix Pass` は current config の `audioRoutes` を safe 規則で補正する。
- `Fix Stored Presets + Keyframes` は saved presets / custom sequence keyframes に同じ safe 規則を適用する。
- いずれも legacy slider の即時削除ではなく、段階縮退のための migration 補助である。


### Audio Reactive Legacy Retirement

- Safe auto-fix pass
- Stored preset / keyframe migration
- Review breakdown
- Legacy-owned duplicate collapse for current + stored contexts


### Audio Reactive Legacy Retirement

- `Remove Legacy Shadowed by Custom Exact` は、custom route が exact を持つ key に重なった legacy shadow route だけを current config から除去します。
- `Remove Stored Legacy Shadowed by Custom Exact` は、saved presets と custom sequence keyframes に対して同じ safe pass を適用します。


## 2026-04-01 custom conflict workflow

Audio tab now includes `Custom Conflict Hotspots` under `Retirement Impact / Presets + Sequence`.

- It ranks unresolved custom conflicts by cross-context impact.
- `Focus In Route Editor` narrows the route list to a single `source -> target` key.
- `Copy Conflict Report` copies the top hotspot summary for handoff or review.


## Audio Reactive Legacy Retirement Update (2026-04-01 v18)

- Custom Conflict Hotspots can now trigger exact custom duplicate collapse directly.
- Both current config and stored contexts (saved presets / sequence keyframes) support exact custom duplicate cleanup.
- Remaining custom conflicts that still need review are residual-bearing conflicts rather than duplicate-only cleanup cases.

## 2026-04-01 audio-reactive update

- `Focused Conflict Inspector` を追加しました。
- `Custom Conflict Hotspots` で key を選び、`Focus In Route Editor` すると、dominant route / recommendation / per-route delta を確認できます。
- `Copy Focused Conflict Detail` で focused key の競合内容をそのまま共有できます。


## 2026-04-01 audio reactive update v20

- Focused Conflict Inspector can now apply its own recommendation.
- For residual custom conflicts, the current/stored recommendation path keeps the dominant route and mutes non-dominant focused routes instead of deleting them.

## Audio-reactive retirement tooling

The Audio tab now includes post-migration cleanup tools for:

- legacy parity / deprecation order
- retirement impact across presets and sequence keyframes
- custom conflict hotspots
- focused conflict inspection
- hotspot recommendation pass for the top 3 or top 8 current conflicts

## Audio Reactive Conflict Cleanup Status

- current config: hotspot recommendation batch available (`Apply Top 3` / `Apply Top 8`)
- stored contexts: hotspot recommendation batch available (`Apply Stored Top 3` / `Apply Stored Top 8`)
- focused cleanup: `Focused Conflict Inspector` + per-key recommendation actions
- remaining work: residual custom conflicts that still require route-level curation


## Audio Reactive Conflict Batch

- `Apply Top 3 Everywhere` / `Apply Top 8 Everywhere` で current config と stored contexts を同時に整理できます。
- 実行後は `Last Hotspot Batch` に hotspots / contexts の before -> after が出ます。
- `Copy Last Batch Summary` で直前 batch の結果を共有できます。


## Audio route residual queue

- `Custom Conflict Hotspots` で重い key を見る
- `Focused Conflict Inspector` で差分と推奨を確認する
- `Manual Residual Queue` で `manual-custom-choice` / `manual-residual-merge` を順送りに処理する
- `Apply Focused + Next` で recommendation 適用と次 key への移動をまとめて行う


## Audio Reactive 追記: Stored Manual Residual Queue

- Audio タブには `Stored Manual Residual Queue` があり、saved presets / sequence keyframes に残る manual residual custom conflict を key 単位で順送りに整理できます。
- `Apply Stored Focused + Next` を使うと、stored recommendation の適用と次 key への移動を1回で進められます。


## 2026-04-01 v26

- Added manual residual batch controls for current, stored, and everywhere scopes.
- Added `Last Manual Batch` summary and clipboard copy helper.
- Residual conflict cleanup can now be driven by queue-first batch passes before route-level curation.


### Residual custom conflict

- `manual-residual-merge` は `Align Focused Residual to Legacy` で legacy baseline に合わせられます。
- stored presets / keyframes には `Align Stored Focused Residual` を使います。


## Audio Reactive Update 2026-04-01 v27

- `Focused Conflict Inspector` の各 route 行から current config に対して `Keep This Route` / `Keep + Next` を実行できる。
- `manual-custom-choice` を route-level で curate しやすくした。


### 2026-04-01 v28
- `Focused Conflict Inspector` は current route keep だけでなく、stored contexts へ同系統の keep を実行できます。
- stored 側は route 署名ベースで最も近い route を keep します。


## 2026-04-01 v29 追加

- `audioCurationHistory` を config 永続項目として追加。
- current / stored / everywhere の curation 操作で、key 単位の履歴を保存できるようにした。
- `Recent Curation History` を Audio タブへ追加。
- 履歴から `Focus Key` で同じ key を再度開けるようにした。
- これにより、同じ high-load key を何度も探し直す運用コストを減らした。


## Audio reactive curation queue

- `Recent Curation History` は履歴確認だけでなく、queue filter の元データとして使われます。
- Queue filter:
  - `all`
  - `hide-curated`
  - `only-curated`
- `hide-curated` では、既に curate 済みの key を hotspot / manual queue から隠し、未処理 key を優先できます。


## Audio Reactive 追記: Pending Batch Summary

- `Last Hotspot Batch` は hotspots / contexts に加えて pending hotspots / pending contexts を表示します。
- `Last Manual Batch` は current / stored manual に加えて pending current / pending stored を表示します。
- ここでの pending は、まだ history に入っていない未処理 key です。


## 2026-04-01 v31 追加

- history filter 後の queue を前提に、未処理 key の before / after sample を batch summary へ追加した。
- `Last Hotspot Batch` は pending hotspot / context 数に加えて、pending sample before / after を表示・コピーできる。
- `Last Manual Batch` は pending current / stored 数に加えて、pending current sample before / after と pending stored sample before / after を表示・コピーできる。
- これにより、残り 1% の運用整理は「未処理 key がどれだけ減ったか」だけでなく「どの未処理 key が残っているか」まで毎回固定できる。
