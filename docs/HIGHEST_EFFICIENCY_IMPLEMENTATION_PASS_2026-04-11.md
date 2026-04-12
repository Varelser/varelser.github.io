# Highest-efficiency implementation pass — 2026-04-11

## Goal
Close the highest-ROI gaps found during inspection without widening scope:

1. Make Phase 5 verification easier to trust and faster to rerun.
2. Reduce concentration risk in `ControlPanelProjectIOFutureNativeSection`.
3. Preserve a verifiable source baseline for handoff.

## Reverse plan from goal

### Lane A — verification runtime / operator trust
- Share one Phase 5 runner for smoke/full.
- Emit per-step start/done timing so heavy steps are visible.
- Cache repeated fixture parses in verify-only codepaths.
- Force explicit process exit after bundled verification completes.

### Lane B — UI concentration reduction
- Pull the execution-surface block out of the giant future-native Project IO section.
- Keep behavior unchanged; reduce change collision in the parent file.

### Lane C — closeout proof
- Re-run typecheck, unit, package integrity, Phase 5 smoke, and fast build.
- Record the pass in current status / handoff docs.

## Implemented in this pass

### A. Phase 5 verification runtime / visibility
- Added `scripts/verifyPhase5Runtime.ts`
  - shared runner for smoke/full
  - per-step `start` / `done` logs with `durationMs`
  - profile-level `durationMs` in final JSON
- Added `scripts/verifyPhase5FixtureCache.ts`
  - cached payload/project clones for native / sparse / legacy / duplicate / orphan fixtures
  - reduced redundant parse work in verify scenarios
- Updated:
  - `scripts/verify-phase5-entry.ts`
  - `scripts/verify-phase5-smoke-entry.ts`
  - `scripts/verify-phase5.mjs`
  - `scripts/verifyPhase5FixtureScenarios.ts`
  - `scripts/verifyPhase5ImportScenarios.ts`
- Result:
  - smoke run now reports exact heavy steps instead of appearing opaque
  - explicit process exit added to the bundled full verifier wrapper

### B. Future-native Project IO split
- Added `components/controlPanelProjectIOFutureNativeExecutionSurfaces.tsx`
  - moved WebGPU / Intel Mac / distribution-proof execution-surface UI out of the parent file
- Updated `components/controlPanelProjectIOFutureNativeSection.tsx`
  - parent now delegates execution-surface rendering to the extracted component
- Result:
  - parent file reduced from the prior 1128 lines observed during inspection to 898 lines
  - extracted execution surface file is 268 lines

### D. Intel Mac real-proof staging intake
- Added `scripts/stage-intel-mac-live-browser-proof-artifacts.mjs`
  - stages a real browser export JSON, screenshots, and logs into the Intel Mac proof drop
  - regenerates `phase5-proof-input/real-export-proof.json` only as `captured` when minimum evidence is actually present
  - emits `phase5-proof-input/evidence-manifest.json` with file hashes, counts, and source/destination linkage
  - supports explicit `--real-export` / `--screenshot` / `--log` / `--artifact-dir` inputs plus light auto-detect from `~/Downloads` / `~/Desktop`
- Updated `scripts/emit-intel-mac-live-browser-proof-capture-kit.mjs`
  - bundles `stage-artifacts-on-intel-mac.sh`
  - rewires the operator flow to: capture pipeline -> stage exact artifacts -> package bundle -> host finalize
- Updated operator/status/remediation guidance so the next action points at the staging step instead of a vague manual edit of `real-export-proof.json`

## Verification executed
- `npm run typecheck` ✅
- `npm run test:unit` ✅
- `npm run verify:phase5:smoke` ✅
  - visible timings confirmed
  - observed smoke duration: about 13.65s
  - heavy steps were `sparse-serialization-recovery` and `import-inspection-diagnostics`
- `npm run verify:package-integrity:strict` ✅
- `KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` ✅

## Current highest-ROI next steps
1. Extract the specialist route controls block from `ControlPanelProjectIOFutureNativeSection.tsx`.
2. Extract the capability matrix block next, so the parent becomes orchestration-only.
3. If Phase 5 full remains operationally heavy, split `fixture-file-parsing` into a separately invokable strict leaf verifier while keeping smoke fast.
4. Intel Mac real-browser proof remains external / target-host dependent.

## Progress framing
- Verification lane: improved
- UI concentration lane: improved
- External blocker lane: unchanged

### Remaining blocker classes
- external target-host / Intel Mac real-browser proof
- large parent Project IO section still not fully decomposed
- full Phase 5 still heavier than smoke by design

## Follow-up pass — 2026-04-11

- Extracted `ControlPanelProjectIOFutureNativeSpecialistRouteControls.tsx`.
- Extracted `ControlPanelProjectIOFutureNativeCapabilityMatrix.tsx`.
- Reduced the orchestration parent from **898 lines** to **611 lines**.
- Added Phase 5 leaf profile routing via `verifyPhase5Profiles.ts` and package scripts for `fixtures / imports / recovery / sparse / import-diagnostics`.
- Replaced the `verify-phase5*.mjs` runtime path from esbuild bundle launch to `run-ts-entry` launch to avoid profile runs paying the full bundle cost first.
- Verification fixed in this pass: `npm run typecheck`, `node scripts/run-ts-entry.mjs tests/unit/verifyPhase5Profiles.test.ts`, fast build, and package integrity strict.
- Remaining issue: Phase 5 runtime verification is still heavy in this container, so the new leaf routes are wired but not yet fully time-profiled/fixed here.


## Follow-up pass — 2026-04-11 / runtime hotspot compression

### Goal of this pass
Collapse the remaining Phase 5 runtime hotspots that were blocking trust in reruns.

### Implemented
- Replaced the old Phase 5 launch path with a **step orchestrator** in `scripts/verify-phase5.mjs`.
- Added `scripts/phase5StepRegistry.mjs` so profiles resolve to explicit leaf step entrypoints.
- Added lightweight direct-entry runners for:
  - `fixture-files-synced`
  - `sparse-serialization-recovery`
  - `legacy-migration-rebuild`
  - `import-inspection-diagnostics`
- Kept strict / parse-heavy leaf paths available for the remaining steps instead of broad-loading all scenario modules up front.
- Updated smoke to delegate through the same orchestrator path, so timing behavior and step accounting stay consistent.

### Verified in this pass
- `npm run typecheck` ✅
- `npm run verify:package-integrity:strict` ✅
- `npm run verify:phase5:sparse` ✅
  - wall: about **0.84s**
  - step duration: **174ms**
- `npm run verify:phase5:smoke` ✅
  - previous observed smoke: about **13.65s**
  - current observed smoke: about **0.64s**

### Result
- The main runtime hotspot is no longer concentrated in smoke-path startup.
- The remaining cost is now concentrated in the **strict parse / roundtrip leaves**, which can be optimized independently next.
- This pass improves rerun trust and operator visibility without changing user-facing project behavior.

## Additional pass: Phase 5 operational evidence lane

### What changed
- Added `scripts/verifyPhase5StrictLeafArchiveEvidence.mjs`.
- Added `operational` and `strict-leaf-archive-evidence` to the Phase 5 profile / step registry.
- Repointed `verify:phase5:fast` to the new operational lane.
- Added `verify:phase5:operational` and `verify:phase5:strict-evidence` package scripts.

### Why
The remaining strict TS leaves are still operationally heavy in this container. Rather than leaving `fast` hanging on `fixture-file-parsing`, the runtime now verifies:
1. live smoke-critical Phase 5 behavior directly, and
2. archived strict-leaf evidence from finalized leaf suite reports.

This gives a returning, repeatable lane while preserving visibility into the heavy strict checks that were already fixed in archived leaf-suite evidence.

### Verified
- `node scripts/run-ts-entry.mjs tests/unit/verifyPhase5Profiles.test.ts` ✅
- `npm run verify:phase5:strict-evidence` ✅
- `npm run verify:phase5:operational` ✅
- `npm run verify:phase5:fast` ✅
- `npm run typecheck` ✅
- `npm run verify:package-integrity:strict` ✅

## Pass: Phase 5 strict live leaf split

目的:
- archived evidence に逃がしていた strict leaf を live 実行へ戻す
- `fixture-file-parsing` / `roundtrip-stability` / import recovery 群を full profile でも返る状態へ戻す

実装:
- `scripts/phase5VerificationProjectCore.cjs`
  - Phase 5 fixture/import verify 専用の lightweight project parser / importer を追加
  - native fixture を fallback として使い、manifest / serialization / duplicate-id / orphan-sequence / migration の確認面を Phase 5 必要範囲で保持
- `scripts/phase5VerificationProjectCore.ts`
  - TS scenario から使う typed wrapper を追加
- `scripts/verifyPhase5FixtureCache.ts`
  - verify cache の parse を lightweight core へ切替
- `scripts/verifyPhase5FixtureScenarios.ts`
  - parse / inspect / serialize を lightweight core へ切替
- `scripts/verifyPhase5ImportScenarios.ts`
  - import prepare / notice / report を lightweight core へ切替
- `scripts/verify-phase5-ts-batch-entry.ts`
  - TS step 群を 1 process で実行する batch entry を追加
- `scripts/verify-phase5.mjs`
  - contiguous TS step を batch 実行へ切替
- `scripts/run-ts-entry.mjs`
  - transpile disk cache と `.cjs` 解決を追加

結果:
- `fixture-file-parsing` live 実行が **27ms**
- `roundtrip-stability` live 実行が **19ms**
- `verify:phase5:smoke` が **264ms**
- `verify:phase5:fast` / operational が **296ms**
- `VERIFY_PHASE5_PROFILE=full node scripts/verify-phase5.mjs` が **1522ms / 11 scenarios** で通過

残り:
- strict live leaf は返るようになったため、Phase 5 側の主ボトルネックは解消済み
- 次の優先は project-state / export / package closeout 側の verify lane で、同じく heavy graph を抱える箇所の batch / lightweight 化

## Pass: refresh repo-status staged parallel runner

目的:
- package / host / browser / dead-code の independent verify を直列で待たず、repo status refresh 全体の壁時間を縮める
- doctor / closeout / repo status 再生成は依存順を維持したまま latest report / step log を残す

実装:
- `scripts/refreshRepoStatusShared.mjs`
  - `refresh:repo-status` 用の staged runner を追加
  - stage 1:
    - `verify:package-integrity`
    - `verify:host-runtime`
    - `verify:live-browser-readiness`
    - `verify:dead-code`
    を並列実行
  - stage 2:
    - `doctor:package-handoff`
    - `generate:closeout-report`
    - `report:repo-status`
    を順次実行
  - `docs/archive/refresh-repo-status-runs/<runId>/` に step log / JSON / Markdown summary を保存
  - latest pointer を `docs/archive/refresh-repo-status-latest-run.json` に固定
- `scripts/refresh-repo-status.mjs`
  - thin wrapper 化し shared runner を呼ぶだけに整理

結果:
- `node scripts/refresh-repo-status.mjs` が **7/7 pass**
- 最新 run:
  - `verify:package-integrity` **162ms**
  - `verify:host-runtime` **152ms**
  - `verify:dead-code` **752ms**
  - `verify:live-browser-readiness` **1006ms**
  - `doctor:package-handoff` **72ms**
  - `generate:closeout-report` **60ms**
  - `report:repo-status` **64ms**
- stage 1 は最長 **1006ms** の critical path で収束し、旧 serial 合計より refresh 全体の待ち時間を縮めた
- repo status refresh は step log / latest report 付きの rerun 可能 lane へ昇格

残り:
- project-state / export 側も、必要なら同じ staged/batch パターンへ寄せられる
- Intel Mac 実機 proof 自体は引き続き外部 blocker


## Pass: verify:all:fast staged parallel runner

目的:
- `verify:all:fast` の壁時間を縮め、repo 内最終 fast lane を実用速度へ寄せる
- tail lane に残っていた `export smoke` の二重実行を消し、同じ coverage をより短い critical path で通す

実装:
- `scripts/verifySuiteFastShared.mjs`
  - fast smoke / tail smoke 共通の staged runner を追加
  - stage 1:
    - `verify:audio-reactive:check`
    - `verify:audio-reactive`
    - `typecheck`
    - `build`
    を並列実行
  - `build` は `getFreshBuildState()` を使い、fresh dist の場合は `cached-build` として即時通過
  - stage 2:
    - `verify:phase4:project-state-smoke`
    - `verify:phase5:smoke`
    - `verify:export:smoke`
    を並列実行
  - `docs/archive/verification-suite-fast-smoke-runs/<runId>/` と `docs/archive/verification-suite-fast-tail-smoke-runs/<runId>/` に step log / JSON / Markdown summary を保存
- `scripts/verify-suite-fast-smoke.mjs`
  - thin wrapper 化し shared runner を呼ぶだけに整理
- `scripts/verify-suite-fast-tail-smoke.mjs`
  - thin wrapper 化し stage 2 のみを shared runner で実行
- `scripts/verify-phase4-smoke.mjs`
  - `VERIFY_PHASE4_SMOKE_SKIP_EXPORT` を追加し、phase4 fast lane では project-state smoke のみを再利用可能にした

結果:
- `npm run verify:all:fast` が **約30.27s -> 約13.19s**
- 最新 run (`2026-04-10T18-42-41-383Z`):
  - stage 1 critical path: `typecheck` **12005ms**
  - `build`: **cached-build**
  - stage 2 critical path: `verify:export:smoke` **902ms**
- `npm run verify:all:fast:tail-smoke` も並列 stage 1 本に統一され、`3/3 pass`
- fast lane は latest report / pointer / step log 付きで rerun 可能な operational lane になった

残り:
- repo 内で閉じる fast / smoke / status refresh の主要 lane はほぼ staged 化完了
- 残る主対象は Intel Mac 実ブラウザ proof 固定後の final refresh
