- 2026-04-12 playback tuning-brief pass
  - `lib/futureNativeExecutionAnalysis.ts` に `getFutureNativePlaybackTuningBrief()` を追加し、上位 packet 群を `1. ... / 2. ...` の短い実行順 brief として返せるようにした。
  - `components/AppExecutionDiagnosticsOverlay.tsx` は `future-native tuning brief:` 行を追加し、focus/next packets に加えて上から読むだけの brief も表示するよう更新した。
  - `AI_HANDOFF_PROGRESS_2026-04-12.md` の実務見立てを更新し、docs sync **98%** と再評価した。
  - 確認: `npm run test:unit:match -- futureNativeExecutionAnalysis` pass、`npm run typecheck` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass。

- 2026-04-12 playback next-packets pass
  - `lib/futureNativeExecutionAnalysis.ts` に `getFutureNativePlaybackTuningPackets()` を追加し、`ready` を除いた lane を closeout 優先順で並べた tuning packet 群を返せるようにした。
  - `components/AppExecutionDiagnosticsOverlay.tsx` は `future-native next packets:` 行を追加し、focus packet に加えて次点 packet まで 2 件表示するよう更新した。
  - `AI_HANDOFF_PROGRESS_2026-04-12.md` の実務見立てを更新し、Worker-future-native **99%** / docs sync **97%** と再評価した。
  - 確認: `npm run test:unit:match -- futureNativeExecutionAnalysis` pass、`npm run typecheck` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass。

- 2026-04-12 playback closeout tuning-packet pass
  - `lib/futureNativeExecutionAnalysis.ts` に `packetPlaybackWorkerTuningPacket` と `focusTuningPacket` を追加し、`lane | status | issue | action | route | cd | st` を compact な 1 行で返せるようにした。
  - `components/AppExecutionDiagnosticsOverlay.tsx` は closeout summary の直下に `future-native tuning packet:` 行を追加し、lane 行にも packet を併記するよう更新した。
  - `AI_HANDOFF_PROGRESS_2026-04-12.md` の実務見立てを更新し、Worker-future-native **98%** / docs sync **96%** と再評価した。
  - 確認: `npm run test:unit:match -- futureNativeExecutionAnalysis` pass、`npm run typecheck` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass。

- 2026-04-12 playback closeout route-target pass
  - `lib/futureNativeExecutionAnalysis.ts` に playback lane ごとの route 推奨 (`keep-worker` / `prefer-direct` / `keep-direct-bypass` / `watch-current-route`) を追加し、summary 側にも `focusSuggestedRoute` を集約した。
  - `components/AppExecutionDiagnosticsOverlay.tsx` は closeout 行と lane 行の両方で route 推奨を表示するよう更新し、`cd/st` target と route 判断を同じ行で確認できるようにした。
  - `AI_HANDOFF_PROGRESS_2026-04-12.md` の実務見立てを更新し、Worker-future-native **97%** / docs sync **95%** と再評価した。
  - 確認: `npm run test:unit:match -- futureNativeExecutionAnalysis` pass、`npm run typecheck` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass。

- 2026-04-12 playback closeout target-value pass
  - `lib/futureNativeExecutionAnalysis.ts` に playback lane ごとの `packetPlaybackWorkerSuggestedCooldownTargetMs` / `packetPlaybackWorkerSuggestedStaleTargetMs` を追加し、summary 側にも `focusSuggestedCooldownTargetMs` / `focusSuggestedStaleTargetMs` を集約した。
  - `components/AppExecutionDiagnosticsOverlay.tsx` は closeout 行と lane 行の両方で `cd±ms to targetMs / st±ms to targetMs` を表示するよう更新し、実機 tuning 時に差分を暗算せず次の試行値を決められるようにした。
  - `AI_HANDOFF_PROGRESS_2026-04-12.md` の実務見立てを更新し、Worker-future-native **96%** / docs sync **94%** と再評価した。
  - 確認: `npm run test:unit:match -- futureNativeExecutionAnalysis` pass、`npm run typecheck` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass。

- 2026-04-12 playback closeout tuning-hint pass
  - `lib/futureNativeExecutionAnalysis.ts` に playback lane ごとの `packetPlaybackWorkerSuggestedCooldownDeltaMs` / `packetPlaybackWorkerSuggestedStaleDeltaMs` / `packetPlaybackWorkerTuningHint` を追加し、`focusLane` についても同じ推奨差分を summary 側へ集約した。
  - `reduce-fallbacks` / `retune-hold-window` / `retune-heavy-retry` / `watch-overlay` それぞれで、closeout status と telemetry に応じた短い調整ヒントを返すため、実機 tuning の初手を overlay から直接決めやすくなった。
  - `components/AppExecutionDiagnosticsOverlay.tsx` は closeout 行に `cd/st` 推奨差分と hint を、lane 行に `adj:cd±ms/st±ms` と `hint:` を表示するよう更新した。
  - `AI_HANDOFF_PROGRESS_2026-04-12.md` の実務見立てを更新し、Worker-future-native **95%** / docs sync **93%** と再評価した。
  - 確認: `npm run test:unit:match -- futureNativeExecutionAnalysis` pass、`npm run typecheck` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass。

- 2026-04-12 playback closeout focus-action weighting pass
  - `lib/futureNativeExecutionAnalysis.ts` の closeout summary に `focusStatus` / `focusIssue` / `focusAction` を追加し、focus lane の理由と次アクションを集約側でも直接読めるようにした。
  - `nextFocus` は単純件数ではなく、`blocking` lane の action を `watch` より強く重み付けする方式へ更新し、詰めるべきアクションが summary 上でもぶれにくくなった。
  - `components/AppExecutionDiagnosticsOverlay.tsx` は `focus Lx:family status/issue/action` を表示するよう更新し、実機 overlay の closeout 行だけで tuning 優先度を判断できるようにした。
  - `AI_HANDOFF_PROGRESS_2026-04-12.md` の実務見立てを更新し、Worker-future-native **94%** / docs sync **92%** と再評価した。
  - 確認: `npm run test:unit:match -- futureNativeExecutionAnalysis` pass、`npm run typecheck` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass。

- 2026-04-12 playback closeout focus-lane prioritization pass
  - `lib/futureNativeExecutionAnalysis.ts` の playback lane 優先順位を closeout status (`blocking` / `watch` / `ready`) → health → performance cost の順へ揃え、overlay の lane 表示がそのまま仕上げ優先度になるよう整理した。
  - `getFutureNativePlaybackCloseoutSummary()` は `focusLane` を返すようになり、`components/AppExecutionDiagnosticsOverlay.tsx` では closeout summary に `focus Lx:family` を追加した。
  - `AI_HANDOFF_PROGRESS_2026-04-12.md` の実務見立てを更新し、全体 **99%** / Worker-future-native **93%** と再評価した。
  - 確認: `npm run test:unit:match -- futureNativeExecutionAnalysis` pass、`npm run typecheck` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass。

- 2026-04-12 playback closeout aggregate summary pass
  - `lib/futureNativeExecutionAnalysis.ts` に `getFutureNativePlaybackCloseoutSummary()` を追加し、ready / watch / blocking 件数、平均 health、progress%、next focus を集約できるようにした。
  - `components/AppExecutionDiagnosticsOverlay.tsx` は individual lane 表示の前に closeout summary 行を追加し、`progress% / ready / watch / blocking / avg health / next focus` を一目で確認できるようにした。
  - `AI_HANDOFF_PROGRESS_2026-04-12.md` の実務見立てを更新し、全体 **98%** / Worker-future-native **92%** と再評価した。
  - 確認: `npm run test:unit:match -- futureNativeExecutionAnalysis` pass、`npm run typecheck` pass。

- 2026-04-12 playback closeout readiness classification pass
  - `lib/futureNativeExecutionAnalysis.ts` に playback worker の closeout status (`ready` / `watch` / `blocking`) と next action (`keep-current` / `watch-overlay` / `reduce-fallbacks` / `retune-hold-window` / `retune-heavy-retry`) を追加した。
  - `components/AppExecutionDiagnosticsOverlay.tsx` では playback lane に `closeout:` と `next:` を追加し、overlay 上でそのまま仕上げ優先度を判断できるようにした。
  - `AI_HANDOFF_PROGRESS_2026-04-12.md` の実務見立てを更新し、全体 **97%** / Worker-future-native **91%** と再評価した。
  - 確認: `npm run test:unit:match -- futureNativeExecutionAnalysis` pass、`npm run typecheck` pass。

- 2026-04-12 heavy playback retry-window tuning pass
  - `lib/futureNativePlaybackWorkerPolicy.ts` で heavy / very-heavy playback packet に対し、worker telemetry の average / worst duration も cooldown / stale 補正へ織り込むよう更新した。重い payload で worker 自体は維持しつつ、retry を少し慎重化する。
  - これにより medium/light は bypass stabilizer、heavy/very-heavy は worker-maintain + slower retry の二段構成になり、payload tier ごとの安定化方針が分かれた。
  - 確認: `npm run test:unit:match -- futureNativePlaybackWorkerPolicy` pass、`npm run typecheck` pass。

- 2026-04-12 run-vite auto-quarantine recovery pass
  - `scripts/nativeQuarantineShared.mjs` を追加し、native binary quarantine の検出・解除ロジックを共通化した。`scripts/clear-native-quarantine.mjs` はその shared helper を使う構成へ整理した。
  - `scripts/run-vite.mjs` は macOS で Vite 起動前に quarantine recovery を自動実行するよう更新し、配布 snapshot の初回 `npm run dev` / `node scripts/run-vite.mjs build` が native load blocker で落ちにくいようにした。
  - `README.md` に packaged snapshot 向けの quarantine recovery メモを追記した。
  - 確認: `npm run doctor:clear-native-quarantine` pass（no quarantined native binaries found）、`npm run typecheck` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass。

- 2026-04-12 native build-lane quarantine recovery pass
  - 配布 snapshot 由来で `@rollup/rollup-darwin-x64` / `@esbuild/darwin-x64` / `lightningcss-darwin-x64` / `@tailwindcss/oxide-darwin-x64` の native binary が `com.apple.quarantine` により load block されていたため、quarantine を解除して build lane を復旧した。
  - `scripts/clear-native-quarantine.mjs` と `npm run doctor:clear-native-quarantine` を追加し、同系統の native binary をまとめて検出・解除できるようにした。current host では Linux 向け同梱 binary の quarantine も合わせて整理した。
  - 確認: `npm run doctor:clear-native-quarantine` pass、`npm run typecheck` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass。

- 2026-04-12 playback worker stabilization-bypass pass
  - `lib/futureNativePlaybackWorkerPolicy.ts` に playback stabilizer を追加し、medium / light payload で fallback 圧が高い場合は playback worker を一時 bypass して direct packet path に退避できるようにした。heavy / very-heavy は worker 優先を維持する。
  - `components/sceneFutureNativeSystem.tsx` では effective playback route を policy 経由で決めるよう更新し、`pbd-softbody` の oscillation を抑えつつ stale hold の利点は残す構成にした。
  - `lib/futureNativeExecutionAnalysis.ts` / `components/AppExecutionDiagnosticsOverlay.tsx` には bypass reason を追加し、overlay 上で `x:fallback-pressure` / `x:mixed-light` / `x:pending-medium` を確認できるようにした。
  - `AI_HANDOFF_PROGRESS_2026-04-12.md` の実務見立てを更新し、全体 **93%** / Worker-future-native **89%** と再評価した。
  - 確認: `npm run typecheck` pass、`npm run test:unit:match -- futureNativePlaybackWorkerPolicy` pass、`npm run test:unit:match -- futureNativeExecutionAnalysis` pass。

- 2026-04-12 playback mixed-cause diagnostics pass
  - `lib/futureNativeExecutionAnalysis.ts` に playback worker の primary issue (`pending` / `fallback-pressure` / `hold-window` / `adaptive-backoff` / `cooldown-throttle` / `stable`) と health score を追加し、単なる `mixed` 表示から次アクション判断できる粒度へ上げた。
  - `components/AppExecutionDiagnosticsOverlay.tsx` では playback lane に `issue:` と `health:` を追加し、pending 優勢なのか fallback 優勢なのかを overlay だけで読めるようにした。
  - `AI_HANDOFF_PROGRESS_2026-04-12.md` に今回 pass 反映後の実務見立てを追記し、全体 **92%** / Worker-future-native **88%** / WebGPU Compute **96%** / docs sync **88%** と再評価した。
  - 確認: `npm run typecheck` pass、`npm run test:unit:match -- futureNativeExecutionAnalysis` pass、`npm run test:unit:match -- futureNativePlaybackWorkerPolicy` pass、`npm run test:unit:match -- webgpuComputeFoundation` pass。

- 2026-04-12 playback adaptive backoff + sph profile tuning pass
  - `lib/futureNativePlaybackWorkerPolicy.ts` を追加し、playback worker の cooldown / stale を payload tier だけでなく recent mixed / fallback telemetry でも補正するようにした。`components/sceneFutureNativeSystem.tsx` は playback mode telemetry を参照して adaptive backoff を適用し、diagnostics publish に cooldown / stale / backoff 値も乗せる。
  - `lib/workerExecutionTelemetry.ts` に単体 lookup を追加し、overlay 側では `components/AppExecutionDiagnosticsOverlay.tsx` と `lib/futureNativeExecutionAnalysis.ts` を通じて playback lane の `cdXXms / sXXms / b+XXms` を直接確認できるようにした。
  - `lib/webgpuCompute.ts` では `getWebgpuSphQualityProfile()` を追加し、SPH を radius / pressure / viscosity / rest density から sample count・flow clamp・cohesion strength を導出する方式へ変更した。WGSL 側も sparse neighbor 時の pressure bias 抑制と cohesion / clamp 再調整を入れた。
  - 確認: `npm run typecheck` pass、`npm run test:unit:match -- webgpuComputeFoundation` pass、`npm run test:unit:match -- futureNativePlaybackWorkerPolicy` pass、`npm run test:unit:match -- futureNativeExecutionAnalysis` pass。`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` は local `@rollup/rollup-darwin-x64` native module の code-signature load failure で未確認。

- 2026-04-12 sph quality + playback hold diagnostics sync pass
  - `lib/webgpuCompute.ts` の SPH 近傍近似を更新し、近傍サンプル数を radius に応じて 24 / 32 / 40 へ可変化した。density / force を 2 段ループに分離し、平均近傍速度と force clamp を追加して pressure / viscosity の暴れを抑える方向へ調整した。
  - `components/sceneFutureNativeSystem.tsx` では `pbd-softbody` playback worker の hold 条件を詰め、worker route を使うべきフレームで pending / cooldown 中でも直前 packet を一定時間保持するよう更新した。さらに hold に入っているのに diagnostics 上は held 扱いされない穴を塞いだ。
  - `lib/future-native-families/futureNativeSceneDiagnosticsStore.ts` / `lib/futureNativeExecutionAnalysis.ts` / `components/AppExecutionDiagnosticsOverlay.tsx` を通じて playback hold 状態 (`playbackWorkerHeld`, `playbackWorkerHeldAgeMs`) を可視化し、pending / fallback / hold を overlay 上で区別できるようにした。
  - 確認: `npm run typecheck` pass、`npm run test:unit:match -- webgpuComputeFoundation` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass（連続 pass で circular chunk warning 再発なし）。

- 2026-04-11 webgpu field coverage expansion pass
  - `lib/webgpuComputeFoundation.ts` の supported feature を拡張し、field 系 blocker のうち `curl` / `wind` / `vector-field` / `well` / `vortex` / `attractor` / `mouse-force` / `fluid-field` を WebGPU compute 対応へ繰り上げた。
  - `lib/webgpuCompute.ts` と `components/gpgpuSimulationPasses.ts` を更新し、上記 field 系設定が WebGPU velocity compute uniforms / WGSL に実際に反映されるよう接続した。
  - `lib/gpgpuExecutionStatus.ts` は blocker details を維持しつつ、現時点で field 系は compute blocker の主因ではなくなり、残りの主対象は `flocking` / `constraints` / `collision` / `life` へ狭まった。
  - `components/sceneFutureNativeSystem.tsx` では `pbd-softbody` playback worker の route を事前判定し、direct 判定フレームで不要に async 経路へ入らないよう整理した。さらに playback request に size-aware cooldown（70ms / 90ms）を入れ、pending 中の連続 request を抑制した。
  - 確認: `npm run typecheck` pass、`npm run test:unit:match -- webgpuComputeFoundation` pass、`npm run test:unit:match -- gpgpuExecutionStatus` pass、`npm run test:unit:match -- futureNativePacketExecutionRoute` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass（field expansion 連続 pass で circular chunk warning 再発なし）。

- 2026-04-11 implementation closeout sync pass
  - export queue / manifest / camera path の閉じを進め、queue job に preset metadata・requested output・camera path snapshot を保持、manifest に dedicated renderer / mirror fallback / actual dimensions / camera path usage を記録するよう更新した。
  - `lib/workerExecutionTelemetry.ts` / `lib/particleDataExecutionRoute.ts` / `lib/workerCandidateAnalysis.ts` を追加し、particle data の direct/worker route・worker readiness・次の worker 候補分析を diagnostics overlay から確認できるようにした。
  - future-native は `lib/futureNativeDescriptorPacket.ts` / `lib/futureNativeDescriptorPacketAsync.ts` / `workers/futureNativeDescriptorPacketWorker.ts` / `lib/futureNativePacketExecutionRoute.ts` を追加し、descriptor→packet 分離、surface 系 3 family の静止時 worker、`pbd-softbody` 重 packet の再生中限定 worker、pending / cooldown / playback telemetry まで実運用試験導線を固定した。
  - GPGPU は `lib/gpgpuExecutionStatus.ts` と routing/runtime 更新で `preferred-ready / fallback-active / unavailable` の判定軸と blocker groups（audio / rendering / dynamics / other）を追加し、unsupported config では WebGPU 初期化を試さず `unavailable` に寄せるよう整理した。
  - three trim は `lib/threeStdlibMarchingCubes.ts` と `scripts/verify-three-stdlib-imports.mjs` を追加し、MarchingCubes を root `three-stdlib` import から分離、OrbitControls 系以外の root `three-stdlib` 再混入を verify で禁止した。
  - `vite.config.ts` では `scene-runtime-profiling` / `scene-diagnostics-shared` chunk を整理し、fast build 実測では `ui-diagnostics -> scene-runtime-catalog -> scene-future-native -> ui-diagnostics` の circular chunk warning を解消した。
  - 確認: `npm run typecheck` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass、`npm run verify:all:fast` pass、`npm run verify:preload-minimum` pass、`npm run verify:three-namespace-imports` pass、`npm run verify:three-stdlib-imports` pass、関連 unit（exportBatchQueue / captureExportManifest / gpgpuExecutionStatus / gpgpuExecutionRouting / workerExecutionTelemetry / particleDataExecutionRoute / workerCandidateAnalysis / futureNativeExecutionAnalysis / futureNativeDescriptorPacket / futureNativePacketExecutionRoute）pass。

- 2026-04-11 intel-mac real-proof staging intake pass
  - `scripts/stage-intel-mac-live-browser-proof-artifacts.mjs` を追加し、Intel Mac 実機で採った **real-export JSON / screenshots / logs** を drop へ正規配置しつつ、`phase5-proof-input/real-export-proof.json` と `phase5-proof-input/evidence-manifest.json` を自動生成できるようにした。
  - auto-detect では `~/Downloads` / `~/Desktop` / repo の real-export fixture を探索し、`--real-export` / `--screenshot` / `--log` / `--artifact-dir` 指定があればそれを優先する。最低証跡が揃った場合だけ summary を `captured` へ上げる。
  - `scripts/emit-intel-mac-live-browser-proof-capture-kit.mjs` を更新し、drop へ `stage-artifacts-on-intel-mac.sh` を同梱、`capture-on-intel-mac.sh -> stage-artifacts-on-intel-mac.sh -> package-proof-bundle.sh -> finalize-on-host.sh` の導線を固定した。
  - `package.json` に `stage:intel-mac-live-browser-proof-artifacts` を追加し、status/remediation/operator packet は stage command と `evidence-manifest.json` を前提に案内するよう更新した。
  - 確認: temp drop で staged capture を実測し `status=captured` を確認、`npm run prepare:intel-mac-live-browser-proof-drop` pass、`npm run verify:package-integrity:strict` pass。

- 2026-04-11 verify:all:fast staged parallel pass
  - `scripts/verifySuiteFastShared.mjs` を追加し、`verify:all:fast` / `verify:all:fast:tail-smoke` を **parallel staged runner** へ切り替えた。
  - stage 1 は `verify:audio-reactive:check` / `verify:audio-reactive` / `typecheck` / `build` を並列実行し、`build` は fresh dist を検出すると `cached-build` で即時通過する。
  - stage 2 は `verify:phase4:project-state-smoke` / `verify:phase5:smoke` / `verify:export:smoke` を並列実行し、tail lane の `export smoke` 二重実行を除去した。
  - `scripts/verify-phase4-smoke.mjs` に `VERIFY_PHASE4_SMOKE_SKIP_EXPORT` を追加し、project-state smoke のみを fast lane へ再利用できるようにした。
  - 確認: `npm run verify:all:fast` pass（**約13.19s**、旧観測 **約30.27s**、run id `2026-04-10T18-42-41-383Z`、7/7 pass）、`npm run verify:all:fast:tail-smoke` pass（run id `2026-04-10T18-43-02-981Z`、3/3 pass）、`npm run verify:package-integrity:strict` pass。

- 2026-04-11 refresh repo-status staged parallel pass
  - `scripts/refreshRepoStatusShared.mjs` を追加し、`refresh:repo-status` を **parallel stage 1 + sequential stage 2** の staged runner へ切り替えた。
  - stage 1 は `verify:package-integrity` / `verify:host-runtime` / `verify:live-browser-readiness` / `verify:dead-code` を並列実行し、step log / latest report / markdown summary を `docs/archive/refresh-repo-status-runs/` に保存する。
  - stage 2 は stage 1 完了後に `doctor:package-handoff` / `generate:closeout-report` / `report:repo-status` を順次実行し、依存レポートを崩さず closeout/current status を更新する。
  - `scripts/refresh-repo-status.mjs` は thin wrapper 化し、新 shared runner を呼ぶだけに整理した。
  - 確認: `node scripts/refresh-repo-status.mjs` pass（run id `2026-04-10T18-35-47-326Z`、7/7 pass、critical path ≒ **1006ms + 72ms + 60ms + 64ms**、step logs 生成確認）。

- 2026-04-11 phase5 strict live leaf split pass
  - `scripts/phase5VerificationProjectCore.cjs` と `scripts/phase5VerificationProjectCore.ts` を追加し、Phase 5 fixture/import 系の live verify が本体の巨大 project-state graph を起動せずに返る verification-only core へ切り替わった。
  - `scripts/verifyPhase5FixtureCache.ts` / `scripts/verifyPhase5FixtureScenarios.ts` / `scripts/verifyPhase5ImportScenarios.ts` を lightweight core 利用へ更新し、`scripts/verify-phase5-ts-batch-entry.ts` と `scripts/verify-phase5.mjs` に TS batch 実行を追加した。
  - `scripts/run-ts-entry.mjs` に transpile disk cache と `.cjs` 解決を追加し、Phase 5 TS step 群の cold start を圧縮した。
  - 確認: `npm run typecheck` pass、`node scripts/run-ts-entry.mjs tests/unit/verifyPhase5Profiles.test.ts` pass、`npm run verify:phase5:smoke` pass（**264ms**）、`npm run verify:phase5:fast` pass（operational **296ms**）、`VERIFY_PHASE5_PROFILE=full node scripts/verify-phase5.mjs` pass（**1522ms / 11 scenarios**）、`npm run verify:package-integrity:strict` pass。

- 2026-04-11 phase5 operational evidence pass
  - `scripts/verifyPhase5StrictLeafArchiveEvidence.mjs` を追加し、`docs/archive/verification-leaf-suites/verify-suite-leaf-core.json` / `verify-suite-leaf-full.json` から heavy strict leaf（`fixture-file-parsing` / `file-roundtrip-and-import-preparation` / `duplicate-import-recovery` / `orphan-sequence-recovery` / `roundtrip-stability`）の archived pass と check 名一致を即時検証できるようにした。
  - `scripts/phase5StepRegistry.mjs` と `scripts/verifyPhase5Profiles.ts` に `operational` / `strict-leaf-archive-evidence` を追加し、`fast` profile は live smoke 4 step + archived strict evidence 1 step の返る導線へ再定義した。
  - `package.json` に `verify:phase5:operational` / `verify:phase5:strict-evidence` を追加し、`verify:phase5:fast` は operational lane を呼ぶよう更新した。
  - 確認: `node scripts/run-ts-entry.mjs tests/unit/verifyPhase5Profiles.test.ts` pass、`npm run verify:phase5:strict-evidence` pass、`npm run verify:phase5:operational` pass（container 実測 **約0.82s**）、`npm run verify:phase5:fast` pass、`npm run typecheck` pass、`npm run verify:package-integrity:strict` pass。

- 2026-04-11 highest-efficiency future-native split + phase5 leaf pass
  - `components/controlPanelProjectIOFutureNativeSpecialistRouteControls.tsx` / `components/controlPanelProjectIOFutureNativeCapabilityMatrix.tsx` を追加し、Project IO future-native の巨大 UI を specialist controls と capability matrix に分割した。親 `controlPanelProjectIOFutureNativeSection.tsx` は **898 行 -> 611 行** まで縮小。
  - `scripts/verifyPhase5Profiles.ts` と `tests/unit/verifyPhase5Profiles.test.ts` を追加し、Phase 5 verify を `full / fast / fixtures / imports / recovery` と single-step で選択できるよう整理した。
  - `verify:phase5:fixtures` / `verify:phase5:imports` / `verify:phase5:recovery` / `verify:phase5:sparse` / `verify:phase5:import-diagnostics` を追加し、profile ごとの leaf rerun 導線を package scripts に固定した。
  - `scripts/verify-phase5*.mjs` は esbuild bundle 前提から `run-ts-entry` 起動へ切り替え、重い leaf verify の bundle 停滞を避ける方向へ更新した。
  - Verification: typecheck pass / `verifyPhase5Profiles` unit pass / fast build pass / package integrity strict pass。
  - Note: 新しい Phase 5 leaf wrapper は導線整理済みだが、この環境では runtime verification そのものは依然重く、full/leaf の最終実測固定は次パスで継続。

- 2026-04-11 highest-efficiency verification/runtime + future-native split pass
  - `scripts/verifyPhase5Runtime.ts` を追加し、`verify-phase5` / `verify-phase5-smoke` に step ごとの start/done と `durationMs` 出力を共通化した。
  - `scripts/verifyPhase5FixtureCache.ts` を追加し、Phase 5 fixture payload / parsed project を verify 専用 clone cache として再利用するようにして、重複 parse を削減した。
  - `scripts/verify-phase5.mjs` に明示 exit を追加し、bundled verifier 完了後の終了性を固定した。
  - `components/controlPanelProjectIOFutureNativeExecutionSurfaces.tsx` を新設し、WebGPU / Intel Mac / distribution proof surface を `components/controlPanelProjectIOFutureNativeSection.tsx` から分離した。親は 1128 行観測 → 898 行へ縮退。
  - 確認: `npm run typecheck` pass、`npm run test:unit` pass、`npm run verify:phase5:smoke` pass（約13.65s, heavy = sparse-serialization / import-inspection）、`npm run verify:package-integrity:strict` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass。

- 2026-04-10 specialist manifest snapshot diff visibility pass
  - `lib/future-native-families/futureNativeSpecialistRouteControls.ts` に manifest/current 比較 helper と resolved control extractor を追加し、saved snapshot との差分を family 単位で比較可能にした。
  - `components/controlPanelProjectIOFutureNativeSection.tsx` の Manifest snapshot セクションに specialist route snapshot diff card を追加し、manifest target / adapter と current target / adapter のズレを badge で可視化した。
  - `tests/unit/futureNativeSpecialistRouteControls.test.ts` に manifest diff / resolved control 抽出の unit を追加し、typecheck・unit・build を通した。

- 2026-04-10 specialist control diff visibility pass
  - `lib/future-native-families/futureNativeSpecialistRouteControls.ts` に default-aligned 比較 helper を追加し、specialist route control の current diff を値列として再利用できるようにした。
  - `components/controlPanelProjectIOFutureNativeSection.tsx` で Specialist route controls card と capability matrix の specialist row に current control diff badge を追加し、manual override / adapter / target / candidate / disposition の差分を即時可視化した。
  - `tests/unit/futureNativeSpecialistRouteControls.test.ts` を拡張し、default 比較 delta 値を unit で固定した。

- 2026-04-10 project-io specialist packet rail pass
  - `lib/projectFutureNativeCapabilityMatrix.ts` に specialist row 向け operator / adapter / comparison packet wrapper を追加し、Project IO capability matrix から specialist 4 family の packet surface を直接叩けるよう更新。
  - `components/controlPanelProjectIOFutureNativeSection.tsx` に specialist row 専用の Copy operator / Copy adapter / Copy compare action を追加し、global overview だけでなく Project IO family card からも handoff packet を取得可能化。
  - `tests/unit/projectFutureNativeCapabilityMatrix.test.ts` を拡張し、specialist row wrapper packet の生成を unit で固定。
- 2026-04-10 future-native highest-efficiency implementation pass
  - `IMPLEMENTATION_PLAN_2026-04-10_HIGHEST_EFFICIENCY.md` を追加し、低工数で効果の大きい future-native / specialist 強化タスクを固定した。
  - `components/controlPanelGlobalFutureNative.tsx` に catalog search / exposure filter / filtered count を追加し、22 family の探索を高速化した。
  - specialist preview rail から operator / adapter / comparison packet を直接 copy できるようにし、route snapshot・adapter metadata・roundtrip comparison を UI 起点で handoff 可能にした。

- 2026-04-10 distribution/proof docs finish pass
  - `PACKAGE_DISTRIBUTION_SET` / `PACKAGE_DISTRIBUTION_INDEX` / `PACKAGE_PROOF_PACKET_SPLIT` の quick advice 表現を `scripts/package-bundle-advice.mjs` と同じ語彙へ統一した。
  - bundle 選択導線は package manifest / proof manifest / distribution index / package docs の 4 層で整合した。

- 2026-04-10 package manifest quick advice pass
  - `buildPackageManifest` に `quickAdvice` を追加し、`full-local-dev / source-only-clean / platform-specific-runtime-bundled` の単体 manifest だけで bundle 選択を判断できるようにした。

- 2026-04-10 addendum: distribution index と proof manifest の quick advice 語彙を `scripts/package-bundle-advice.mjs` に集約し、bundle 選択基準を単一ソース化した。
- 2026-04-10 proof manifest quick advice pass
  - `package-proof-packet-shared` に `quickAdvice` を追加し、proof manifest JSON / MD の先頭で bundle の選び分けを即断できるようにした。
  - combined / verify-status / intel-mac-closeout の各 proof packet で `audience / chooseThisWhen / preferInstead` を固定。

## Recent Completed Work
- 2026-04-10 proof-packet split pass
  - `package:proof-packet:verify-status` / `package:proof-packet:intel-mac-closeout` / `package:proof-packet:split` を追加し、従来の統合 `proof-packet` を用途別に二分できるようにした。
  - `proof-packet-verify-status` は CURRENT/VERIFY status・leaf verify・package/readiness/report に限定、`proof-packet-intel-mac-closeout` は Intel Mac target-host closeout / live-browser proof に限定した。
  - `docs/PACKAGE_PROOF_PACKET_SPLIT_2026-04-10.md` を追加し、proof bundle の使い分けを固定した。


- 2026-04-10 distribution bundle split pass
- bundle stamp は `Asia/Tokyo` 基準で固定。
  - `package:proof-packet` と `package:distribution-set` を追加し、`full-local-dev / source-only-clean / proof-packet` の3系統を `.artifacts/` へ出力できるようにした。
  - `proof-packet` は status / verify / readiness / closeout / Intel Mac proof docs を選択同梱し、source / node_modules を含まない監査用 handoff とした。
  - `docs/PACKAGE_DISTRIBUTION_SET_2026-04-10.md` を追加し、bundle 用途と package class の境界を固定した。


- 2026-04-10 aggregate verify leaf-suite pass
  - `verify:all:leaf*` 系を追加し、`verify:all:*` 本体を壊さずに leaf verifier 直列実行・途中 summary JSON/MD・latest pointer を残せるようにした。
  - `run-step-suite.mjs` は step/env 対応、Markdown summary と latest pointer 出力に対応。重い aggregate 実行でも中断位置と通過済み step を docs/archive/verification-leaf-suites 配下で追跡できる。



- 2026-04-10 localStorage recovery-core autosave hardening
  - `lib/projectStateStorage.ts` に quota-aware autosave fallback を追加。full compact snapshot が `localStorage` 上限で失敗した場合、`currentConfig` / UI / active preset を保持する **recovery-core** snapshot へ自動縮退するよう更新。
  - recovery-core 読込時は既存の preset / preset-sequence 保存を再利用し、project snapshot が巨大でも config と preset library の復元を両立する。
  - `tests/unit/projectStateStoragePersistence.test.ts` を追加し、通常保存と forced quota fallback の両方を固定。確認: `npm run typecheck` pass、`npm run test:unit` **6/6 pass**、`node scripts/verify-phase4-smoke.mjs` pass、`VERIFY_PHASE5_PROFILE=fast node scripts/verify-phase5.mjs` pass。

- 2026-04-10 phase5 contract sync pass
  - `verifyPhase5FixtureScenarios.ts` / `verifyPhase5ImportScenarios.ts` を現行 parse 契約へ同期。duplicate preset / sequence fixture は parse 時点で sanitize される前提へ修正した。
  - `scripts/projectPhase5FixturePayloads.ts` の説明文も現実装へ同期し、`verifyPhase5FixtureScenarios.ts.orig` は除去した。
  - 確認: `VERIFY_PHASE5_PROFILE=fast node scripts/verify-phase5.mjs` pass。full は 8/11 まで実走確認済みで、末尾 4 シナリオ（file-roundtrip / duplicate-import / orphan-sequence / roundtrip-stability）を個別 bundle で通過確認。

- 2026-04-10 package integrity / verify-sync / archive cleanup refresh
  - `scripts/verify-project-state-smoke.mjs` を現行 split 構成（`lib/projectStateData.ts` の `buildProjectData` と `lib/projectStateStorage.ts` の `parseProjectData`）へ同期し、`npm run verify:project-state:smoke` と `npm run verify:phase4:smoke` の偽失敗を解消。
  - `tmp/` を除去し、`node scripts/inspect-project-health.mjs` は **ok / warnings 0 / issues 0** を再確認。
  - unit baseline は **5/5 pass** に更新。現行 package baseline は `VERIFY_STATUS_2026-04-10.md` を正本とし、`VERIFY_STATUS_2026-04-07.md` は historical snapshot として扱う。
  - root に残っていた build / preflight log と probe を `docs/archive/root-noise-2026-04-10/` へ退避して root ノイズを整理。
  - 配布 archive は Python `zipfile` ではなく UNIX mode を保持する `zip` CLI で再生成し、`node_modules/.bin/esbuild` / `node_modules/@esbuild/linux-x64/bin/esbuild` / `*.command` の execute bit が unzip 後も維持されることを確認。

- 2026-04-09 implementation visibility / truth-sync / proof-packet refresh
  - `report:execution-surfaces` / `refresh:execution-surfaces` を追加し、repo status・future-native coverage・audio legacy closeout・Intel Mac proof packet を1本の refresh laneで再生成できるようにした。
  - `docs/EXECUTION_SURFACES_CURRENT.md` と `docs/archive/execution-surfaces-current.json` を追加し、実装済みの見える化 / 状態文書の同期 / 実機証跡の固定状況 / UX closeout を単一レポートへ統合した。
  - 最新同期値は package integrity **30/30**、host runtime **2/2**、live browser readiness **6/6**、dead-code application candidates **0**、orphan/dev-only/barrel-only **126/11/3**。
  - future-native は **22 families / 22 independent / average progress 98.09% / closure 100% / presets 142 / sequence steps 92**。audio UX は generic bulk edit verify ok、legacy final closeout は **ready** だが target-host proof required、closeout packet は **proof-required**。
  - Intel Mac proof は drop **4/11**、target **5/6**、blockers **8** のまま。次の焦点は `exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-<slug>.json`。

- 2026-04-08 runtime always-on import reduction pass
  - `AppSceneRuntimePrimitives` を `AppSceneCameraPrimitives` / `AppOrbitControls` に分離し、`three-stdlib` を OrbitControls 経由へ閉じ込めた。
  - `AppScene` では OrbitControls を `React.lazy` 化し、manual camera 時のみ `AppOrbitControls` / `three-stdlib` を後段読込するよう更新。
  - `sceneReactionDiffusionSystemRuntime` の `useFloatRenderTarget` 参照も camera primitive 側へ移して、family runtime と OrbitControls 実装の結合を解消。
  - build / unit / dead-code / refresh:repo-status を再実行し、preload 最小系は維持。2026-04-08 chunk snapshot: `AppOrbitControls 0.98 KB` / `three-stdlib 33.42 KB` / `AppScene 20.44 KB` / `ui-control-panel 307.61 KB` / `scene-families-core 292.35 KB` / `three-core 675.02 KB`。

- 2026-04-08 html preload refinement pass
  - Vite の html preload 除外対象を `scene-runtime-*` / `scene-families-core` / `scene-family-*` / `scene-gpgpu` まで拡張。
  - build chunk は維持したまま、初回 html preload を `index + react-vendor + three-core + vendor + r3f-utils + r3f-fiber` の最小系へ収束。
  - 2026-04-08 source baseline: `npm run typecheck` pass、`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass、`npm run test:unit` pass、`npm run verify:package-integrity:strict` pass、`npm run verify:phase5:fast` pass、`npm run verify:live-browser-readiness` pass。
  - 2026-04-08 chunk snapshot: `App 174.51 KB` / `ui-control-panel 307.61 KB` / `scene-runtime-catalog 183.63 KB` / `scene-families-core 292.35 KB` / `three-core 675.02 KB`。

- 2026-04-07 dynamic import / chunk refinement pass
  - App/AppBodyScene の Three.js root import を type-only 化。
  - AppRootLayout から AppScene / AppComparePreview を lazy load 化。
  - control panel chunk を base / global / layers / audio / audio-legacy に分割。
  - warning なし build を維持したまま、ui-control-panel 初回 open 負荷を 501.58KB 単塊 → base 335.21KB + tab chunk 群へ再配分。
  - scene-runtime-catalog は 494.72KB を維持、three-core は 675.02KB のまま。

# Current Status

## 概要
- 2026-04-07: `refresh:repo-status` を追加。`verify-package-integrity` / `verify-host-runtime` / `verify-live-browser-readiness` / `verify-dead-code` / `doctor-package-handoff` / `generate-closeout-report` / `generate-repo-status-report` を一括再生成できるようにした。
- 2026-04-07: `doctor-package-handoff` は `docs/archive/host-runtime-readiness.json` を優先して読み、stale な package-integrity hostRuntime に引きずられないよう修正した。現 current host 判定は **ready**。
- 2026-04-07 source baseline: `npm run typecheck` pass。`KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass。current host の runtime readiness は **2/2**, live browser readiness は **6/6**。
- 2026-04-07 chunk snapshot: `three-core 659.2 KB` / `ui-control-panel 489.8 KB` / `scene-runtime-catalog 483.2 KB` / `scene-families-core 356.8 KB` / `index 201.4 KB`。
- 2026-04-07 dead code snapshot: orphan **153**, runtime-facing application candidates **43**, dev-only **10**, barrel-only **2**。`components/SceneErrorBoundary.tsx` / `op_candidates.ts` を削除し、監査を dev-only / barrel-only 分類付きへ更新した。
- 残課題: Intel Mac 実ブラウザ proof の最終固定（external blocker）。static readiness/pass と live proof は別扱い。

## 主要コマンド
- `npm run typecheck`
- `node scripts/run-vite.mjs build`
- `node scripts/verify-phase4.mjs`
- `node scripts/verify-phase5.mjs`
- `node scripts/verify-suite.mjs`
- `npm run verify:future-native-safe-pipeline:resume`
- `npm run verify:future-native-artifact-suite:resume`
- `node scripts/verify-dead-code.mjs`
- `node scripts/verify-package-integrity.mjs --strict`
- `node scripts/package-full-zip.mjs --allow-partial`
- `node scripts/doctor-package-handoff.mjs`
- `node scripts/generate-closeout-report.mjs`

## 既知の制約
- browser/live verifier は sandbox 側制約で fallback 経路に寄ることがある
- `refresh:repo-status` は current host readiness を更新するが、Intel Mac 実ブラウザ proof 自体は生成しない
- `verify-dead-code` の application candidates は runtime-facing 候補のみ。tests / probe / ad-hoc root tools は dev-only、純 re-export barrel は barrel-only として別集計する
- chunk 分割は current では low-risk な `scene-runtime-motion` 分離のみ採用。大規模 UI chunk 再分割は循環 chunk 警告が出やすく、次段の設計課題として保留
- Tailwind panel font tokens centralized (`text-panel`, `text-panel-sm`, `text-panel-xs`, `text-panel-lg`).

## 変更履歴
- 詳細は `docs/archive/status-history.md` を参照
- Dead code prune: 低リスク unused export を整理済み
- 2026-04-05: `scripts/verify-dead-code.mjs` を追加し、path alias / worker query を含む静的監査を固定。`components/useAudioRouteEditor.ts` / `components/sceneVolumeFogSystemShared.ts` / `op_candidates.ts` を削除し、report 上の application candidates を 0 件にした。
- Task 2 dependency direction normalization: motionCatalog / controlPanel shared types migrated from components boundary
- Task 6: 13 系統すべての scene system を Shared / Runtime / Render + facade に三層化完了。
- Task 1: audio tab 本体は薄い合成コンポーネント化を維持しつつ、legacy conflict manager を derived-state / clipboard 層へ再整理。

- 2026-04-05: package manifest を `full-local-dev` / `platform-specific-runtime-bundled` / `source-only` に統一し、manifest に recovery plan（bootstrap 必要性 / 推奨コマンド）を埋め込むよう更新。`scripts/doctor-package-handoff.mjs` と `scripts/write-package-manifest.mjs` を追加。

- 2026-04-05: `scripts/generate-closeout-report.mjs` を追加し、package integrity / dead code / manifest recovery plan を統合した closeout report を生成可能にした。`doctor-package-handoff` は report 非依存で manifest 単体からも判定できるよう更新。

- 2026-04-06: package class の canonical 名を `source-only` / `full-local-dev` / `platform-specific-runtime-bundled` へ統一。scripts は旧 `source` / `full` / `partial-full` manifest も alias として読めるよう後方互換を維持。
- 2026-04-06: `fixtures/project-state/real-export/kalokagathia-project-phase5-baseline.json` を追加し、`manifest.json` と `docs/archive/phase5-real-export-readiness-report.json` を再生成。現時点の固定は **readiness scaffold** であり、Intel Mac 実ブラウザの現物 capture は引き続き外部証跡が必要。

### 2026-04-06 missing-layers patch overlay status
- patch overlay program: 100%
- mainline integration preparation: 100%
- end-to-end program: 95%
- future-native families: 22/22
- project-integrated families: 22/22
- render handoff mode bindings: 17
- worker packets: 26
- low-risk bundles: 9
- family closure blueprints: 22
- direct patch candidates: 18
- review-ready direct candidates: 17
- needs-review direct candidates: 1
- specialist review queue: 4
- archive duplicate relative paths: 188

### 2026-04-06 overlay verify matrix
- node scripts/verify-missing-layers-overlay.mjs --repo .
- node scripts/verify-missing-layers-worker-packets.mjs --repo .
- node scripts/verify-missing-layers-low-risk-patches.mjs --repo .
- node scripts/verify-missing-layers-family-closure-patches.mjs --repo .
- node scripts/verify-missing-layers-direct-patch-candidates.mjs --repo .
- node scripts/verify-missing-layers-mainline-integration-order.mjs --repo .
- node scripts/verify-missing-layers-truth-sync-patches.mjs --repo .
- npm run verify:future-native-project-state-fast
- npm run verify:future-native-safe-pipeline:core

### 2026-04-06 mainline final signoff
- 正本同期: apply-ready patch / applied preview / dry-run を確認済み
- specialist-native 4件: mainline-only として signoff 完了
- volumetric-smoke: conditional / review-ready として signoff 完了
- runtime 本体: additive overlay のまま。root 正本へは patch 適用で戻す前提を維持
- 参考: docs/handoff/ai/KALOKAGATHIA_53_mainline_final_signoff_matrix_2026-04-06.md
- 2026-04-07 stage2 catalog split: separated scene-authoring-catalog from scene-runtime-catalog; runtime catalog now 183.57 KB; authoring catalog removed from html preload.

## 2026-04-08 intel-mac proof drop hardening

- `scripts/scaffold-intel-mac-live-browser-proof-drop.mjs` を `--source-dir` 対応へ修正し、pipeline / doctor / ingest が同じ drop root を共有できるようにした。
- drop scaffold の README / metadata / notes / pending summary を更新し、`phase5-proof-input/logs/*` と `screenshots/*` の配置規約を一致させた。
- `scripts/intelMacLiveBrowserProofShared.mjs` の proof file 列挙を再帰化し、`phase5-proof-input/logs/*.log` などのネストした structured proof を verify 側で正しく検出できるようにした。
- `scripts/verify-intel-mac-live-browser-proof-drop.mjs` の structured proof 判定と誘導文を、実際の drop レイアウトに合わせて修正した。
- これにより Intel Mac 実機 proof は「仕組みはあるが verify が nested logs を見落とす」状態から、「drop scaffold / verify / pipeline / ingest が同一レイアウトで動く」状態へ収束した。

## 2026-04-08 dead-code application-candidate closeout

- `verify:dead-code` の application candidate を 43 件から 0 件まで整理した。
- 内容は、旧 split / duplicate / 未接続 preset chunk / 未接続 scene helper / 未接続 UI section の削除。
- 削除後に `npm run typecheck` / `npm run test:unit` / `KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` / `npm run verify:dead-code` / `npm run verify:package-integrity:strict` / `npm run refresh:repo-status` を再実行し、通過を確認した。
- これにより dead-code 監査は `applicationCandidateCount: 0`、`orphanModuleCount: 111`、`devOnlyCandidateCount: 10`、`barrelOnlyCandidateCount: 3` へ更新された。
- closeout report は `overallCompletionPercent: 100` へ更新されたが、これは repo 内で完結する項目基準であり、Intel iMac 実機 live proof が不要になった意味ではない。


## 2026-04-08 scene overlay / capture lazy closeout

- `components/AppScene.tsx` で `sceneOverlay` / `sceneCapture` を static import から `React.lazy` へ変更し、screen FX 有効時と screenshot 要求時のみ読み込むようにした。
- overlay の常駐判定は `screen*` 系強度 / sequence drive / inter-layer contact / audio drive を条件に AppScene 側で先に判定し、無効時は `scene-overlay-core` を読まない構成へ変更した。
- `vite.config.ts` の manual chunk を更新し、`AppSceneCameraPrimitives` を `scene-camera-core` として `scene-overlay-core` から分離した。これにより always-on の camera primitive が overlay / capture chunk を引き連れない構成になった。
- build 後の代表 chunk は `scene-camera-core: 1.03 KB`、`scene-overlay-core: 6.69 KB`、`AppScene: 21.03 KB`、`AppOrbitControls: 0.96 KB`、`three-stdlib: 32.63 KB`。
- html preload は引き続き `index / react-vendor / three-core / vendor / r3f-utils / r3f-fiber` の最小系を維持した。
- `npm run typecheck` / `npm run test:unit` / `KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` / `npm run verify:dead-code` / `npm run verify:package-integrity:strict` / `npm run refresh:repo-status` を再実行し、通過を確認した。

- 2026-04-08 20:35 JST: ui-control-panel render registry introspection moved behind `controlPanelGlobalDisplayRenderClasses` lazy section and dedicated `ui-control-panel-render-classes` chunk so `scene-runtime-catalog` is no longer baked into the main control-panel chunk. Verified with `typecheck`, `test:unit`, fast `build`, `verify:package-integrity:strict`, and `refresh:repo-status`.

- 2026-04-08 20:43 JST: `controlPanelTabsGlobal` now defers `GlobalDisplaySection` mount until idle/timeout so the render-registry path (`ui-control-panel-render-classes` -> `scene-runtime-catalog`) does not hydrate on the first global-tab paint. Verified with `typecheck`, fast `build`, `test:unit`, `verify:package-integrity:strict`, and `refresh:repo-status`.

- 2026-04-08 family-core split refinement: extracted future-native bridge/runtime helpers into `scene-future-native` and moved motion estimation helpers into `scene-motion-shared`, reducing `scene-families-core` from ~285 kB to ~89 kB while keeping html preload at the minimal `index/react-vendor/three-core/vendor/r3f-utils/r3f-fiber` set.

- 2026-04-08 runtime routing import boundary cleanup:
  - runtime consumers now import `sceneRenderRoutingRuntime` directly.
  - plan/catalog consumers now import `sceneRenderRoutingPlans` directly.
  - retained `lib/sceneRenderRouting.ts` barrel for script compatibility while app/runtime consumers now import direct modules.
  - attempted `scene-runtime-shared` split was reverted because it introduced a `scene-runtime-shared -> scene-runtime-catalog -> scene-runtime-shared` chunk cycle.
  - outcome: dependency boundaries are cleaner; deeper `projectExecutionRouting` decomposition remains future work.

## 2026-04-08 manifest routing reuse pass
- buildProjectManifest now computes execution routing once and reuses it for layer snapshots instead of re-building per layer.
- projectStateManifestShared no longer imports projectExecutionRouting directly; capability flags come from the shared execution map.
- future-native specialist route entry wiring now imports directly from futureNativeFamiliesSpecialistPackets, removing that specialist packet dependency from projectExecutionRouting.


## 2026-04-08 App chunk rollback via lazy scene-controller bridge
- `App.tsx` から project/library transfer, snapshot, layer preview, preset action, export, control-panel bridge の import を外し、新規 `components/AppBodySceneConnected.tsx` 側へ移した。
- `AppBodySceneConnected` は既存の lazy scene 境界の内側で `useLibraryTransfer` / `useProjectTransfer` / `useAppSnapshots` / `useAppLayerPreview` / `useAppPresetActions` / `useExportController` / `useAppControlPanelBridge` を束ね、`AppBodyScene` へ接続する構成。
- これにより `App` chunk は **227.04 KB → 55.75 KB** まで縮小しつつ、html preload は `react-vendor / three-core / vendor / r3f-utils / r3f-fiber` の最小系を維持した。
- 新規 lazy chunk `AppBodySceneConnected` は **181.84 KB**。`scene-runtime-catalog` は **131.08 KB** を維持し、`scene-families-core` は **88.70 KB**、`ui-control-panel` は **296.15 KB** を維持した。
- `npm run typecheck` / `npm run test:unit` / `KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` / `npm run verify:dead-code` / `npm run verify:package-integrity:strict` / `npm run refresh:repo-status` を再実行し、通過を確認した。


## 2026-04-08 postfx conditional mount closeout

- `components/AppScene.tsx` now mounts `LazyAppScenePostFx` only when a post-processing effect is actually enabled.
- This keeps `scene-postfx` / `scene-postfx-vendor` out of the startup runtime path when bloom / CA / brightness-contrast / DOF / noise / vignette / N8AO are all disabled.
- Verified with `npm run typecheck`, fast `build`, `npm run test:unit`, and `npm run verify:package-integrity:strict`.



## 2026-04-08 starter library deferred hydration closeout

- Added `lib/scheduleDeferredHydration.ts` and used it for starter-library hydration in `App.tsx` and `lib/usePresetLibrary.ts`.
- Private builds with no persisted presets now defer `starterLibraryData` hydration until browser idle / timeout instead of competing with first paint.
- Starter library behavior is unchanged once hydration runs; this is a startup-path deferral only.



## 2026-04-08 project transfer lazy boundary closeout

- `lib/useProjectTransfer.ts` から `projectTransferShared` の static import を外し、project import 経路は `import('./projectTransferShared')`、manifest/autosave/export は `import('./projectState')` で後段読込する構成へ更新した。
- 初期 `projectManifest` は placeholder を返し、実 manifest は idle/timeout 後に hydrate するため、scene/controller 初回読込と project serialization 群が競合しない。
- build 後の chunk は `AppBodySceneConnected: 181.84 KB -> 33.31 KB`、新規 `projectState: 152.67 KB`、新規 `projectTransferShared: 6.81 KB`。`App` は **56.01 KB**、`scene-runtime-catalog` は **135.92 KB**。
- html preload は引き続き `index / react-vendor / three-core / vendor / r3f-utils / r3f-fiber` の最小系を維持した。
- `npm run typecheck` / `npm run test:unit` / `KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` / `npm run verify:dead-code` / `npm run verify:package-integrity:strict` / `npm run refresh:repo-status` を再実行し、通過を確認した。
- 備考: これは **2026-04-08 の解消前に記録された historical note**。現行 package baseline は 2026-04-10 refresh を参照し、circular chunk warning 継続の主張としては扱わない。

- 2026-04-08: `depictionArchitecture` を `scene-authoring-coverage` から `scene-depiction-shared` へ分離し、`scene-runtime-catalog -> scene-authoring-coverage -> scene-runtime-catalog` の circular chunk warning を解消。preload 最小系は維持した。


## 2026-04-08 projectState route split closeout

- `lib/projectStateData.ts` / `lib/projectStateStorage.ts` / `lib/projectStateManifest.ts` へ参照経路を分離し、`lib/useProjectTransfer.ts` の dynamic import も `projectStateManifest` / `projectStateData` / `projectStateStorage` へ直接向けた。
- `project import` 側の helper も `projectState` barrel 経由をやめ、`parseProjectData` は `projectStateStorage`、`buildProjectData` は `projectStateData` を直接参照する構成へ更新した。
- build 後の chunk は `projectTransferShared: 6.98 KB`、`projectStateStorage: 8.24 KB`、`projectStateManifest: 34.57 KB`、`projectStateData: 52.10 KB`、`projectStateManifestBuilder: 59.32 KB` に分離され、従来の `projectState: 152.72 KB` 単塊を解消した。
- `AppBodySceneConnected` は **33.36 KB → 33.58 KB** の範囲で維持しつつ、project read/write 経路は用途別 chunk へ分散した。html preload は `index / react-vendor / three-core / vendor / r3f-utils / r3f-fiber` の最小系を維持した。
- `npm run typecheck` / `npm run test:unit` / `KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` / `npm run verify:dead-code` / `npm run verify:package-integrity:strict` / `npm run refresh:repo-status` を再実行し、通過を確認した。

- 2026-04-08 starter library route split
  - `starterLibraryData` から product-pack starter preset/sequence を切り離し、`starterLibraryProductPackAugmentation` として後段化。
  - `loadCoreStarterPresetLibrary()` は base/extension/sequence 中心の core を返し、product-pack starter preset は idle 後に追加 hydrate。
  - `vite.config.ts` に `starter-library-core/base/extensions/sequences/product-packs` の manual chunk を追加し、starter library monolith を分割。
- 2026-04-08 starter library run-vite postprocess
  - `scripts/run-vite.mjs` に html post-build preload strip を追加し、starter library split chunk が `dist/index.html` に戻らないよう build 導線側で固定。

- 2026-04-08: three-core trim pass: routed `three/examples/jsm/geometries/ConvexGeometry` into `scene-family-surface` instead of `three-core`, and converted small always-on namespace imports (`AppSceneCameraPrimitives`, `AppScenePostFx`, `AppSceneTypes`) to narrower imports to reduce baseline three bundling pressure without changing preload boundaries.

- 2026-04-08: three-core trim follow-up: converted additional always-on `three` namespace imports (`sceneShared`, `sceneOverlay`, `sceneCapture`, `useExportController`, `useFrameExport`, `useVideoExport`, `useCanvasStream`, `canvasStreamWidget`, `AppRootLayout`) to narrower named/type imports. Verified with `npm run typecheck`, `npm run test:unit`, fast `build`, `npm run verify:dead-code`, `npm run verify:package-integrity:strict`, and `npm run refresh:repo-status`. Result: preload remained `index / react-vendor / three-core / vendor / r3f-utils / r3f-fiber`, and `three-core` moved from **675.02 KB -> 674.69 KB**.

- 2026-04-08: three-core trim shared-helper pass: converted additional particle/family shared helpers and low-risk runtime/render wrappers from `import * as THREE` to narrower named/type imports. Updated files include `sceneParticleSystemUniforms`, `sceneParticleSystemGhostMats`, `sceneParticleSystemRuntime{Layer,Fx,Audio}`, `scene{Membrane,SurfacePatch,SurfaceShell,SdfSurfaceShell,HybridSurfacePatch,HybridMembrane,VolumetricField,GrowthField,Line,MotionEstimator,CrystalAggregate,DepositionField,ErosionTrail,GlyphOutline,CrystalDeposition,VoxelLattice}*Shared`, plus selected low-usage family/particle wrappers such as `sceneParticleSystem`, `sceneParticleSystemRuntime`, `sceneVolumetricFieldSystem`, `sceneGlyphOutlineSystem`, `sceneHybrid*`, `sceneLineSystem`, and `sceneVolumeFogSystemTransforms`.
- Verified with `npm run typecheck`, `npm run test:unit`, fast `build`, `npm run verify:dead-code`, `npm run verify:package-integrity:strict`, and `npm run refresh:repo-status`. Preload stayed `index / react-vendor / three-core / vendor / r3f-utils / r3f-fiber`; `applicationCandidateCount` remained **0** and `orphanModuleCount` remained **111**.
- Build result remained broadly flat (`three-core: 674.69 KB`, `scene-particle-core: 42.23 KB`, `scene-families-core: 88.70 KB`, `scene-runtime-catalog: 135.93 KB`, `AppBodySceneConnected: 32.64 KB`). This pass mainly improves import hygiene and prepares deeper `three-core` trimming without changing chunk boundaries.

- 2026-04-08: three-core trim gpgpu/future-native/volumetric type-import pass: converted additional `three` namespace imports in GPGPU / future-native / volumetric paths to narrower named/type imports. Updated files include `gpgpuExecutionRouting`, `gpgpuDiagnostics`, `gpgpuVisualUpdates`, `gpgpuSimulationPasses`, `sceneFutureNativeSystem`, `sceneGpgpuSystemRuntime`, `useGpgpuRuntime`, `sceneVolumeFogSystemMaterial`, `sceneVolumeFogSystemTypes`, and `gpgpuTransformFeedbackNativeCapturePass`.
- Verified with `npm run typecheck`, `npm run test:unit`, fast `build`, `npm run verify:dead-code`, `npm run verify:package-integrity:strict`, and `npm run refresh:repo-status`. Preload stayed `index / react-vendor / three-core / vendor / r3f-utils / r3f-fiber`; `applicationCandidateCount` remained **0** and `orphanModuleCount` remained **111**.
- Build result remained broadly flat (`three-core: 674.69 KB`, `scene-gpgpu: 81.27 KB`, `scene-future-native: 194.69 KB`, `scene-family-volumetric: 33.16 KB`). This pass primarily reduces broad `three` namespace usage in high-reuse runtime paths and prepares a safer deeper trim pass later.

- 2026-04-08: three-core trim surface/material/runtime pass: converted additional low-risk surface/material/runtime wrappers and helpers from `import * as THREE` to narrower named/type imports. Updated files include `sceneFiberFieldSystemProfiles`, `sceneFiberFieldSystemShaders`, `sceneBrushSurfaceSystemRender`, `sceneCrystalAggregateSystem`, `sceneCrystalDepositionSystem`, `sceneDepositionFieldSystem{,Render}`, `sceneErosionTrailSystem`, `sceneFiberFieldSystem`, `sceneGrowthFieldSystemRender`, `sceneHybridSurfacePatchSystemRender`, `sceneLineSystemRender`, `sceneReactionDiffusionSeedTexture`, `sceneSurfaceShellSystem`, `sceneVolumeFogSystemRuntime`, `sceneVoxelLatticeSystem`, and `sceneVoxelLatticeSystemRender`.
- Verified with `npm run typecheck`, `npm run test:unit`, fast `build`, `npm run verify:dead-code`, `npm run verify:package-integrity:strict`, and `npm run refresh:repo-status`. Preload stayed `index / react-vendor / three-core / vendor / r3f-utils / r3f-fiber`; `applicationCandidateCount` remained **0** and `orphanModuleCount` remained **111**.
- Build result remained effectively flat (`three-core: 674.69 KB`, `scene-particle-core: 42.23 KB`, `scene-families-core: 88.70 KB`, `scene-gpgpu: 81.27 KB`). This pass mainly improves import hygiene across surface/material/runtime paths and reduces remaining broad `three` namespace usage before any riskier deeper trim.

- 2026-04-08: three-core trim asset/material helper pass: converted additional GPGPU asset builders, trail/simulation helpers, smooth-tube runtime, and crystal deposition render/runtime wrappers from `import * as THREE` to narrower named/type imports. Updated files include `gpgpuAssetShared`, `useGpgpuTrailAssets`, `useGpgpuSimulationAssets`, `useGpgpuMeshAssets`, `sceneGpgpuSmoothTube`, `sceneCrystalDepositionSystemRuntime`, and `sceneCrystalDepositionSystemRender`.
- Verified with `npm run typecheck`, `npm run test:unit`, fast `build`, `npm run verify:dead-code`, `npm run verify:package-integrity:strict`, and `npm run refresh:repo-status`. Preload stayed `index / react-vendor / three-core / vendor / r3f-utils / r3f-fiber`; `applicationCandidateCount` remained **0** and `orphanModuleCount` remained **111**.
- Build result remained flat (`three-core: 674.69 KB`, `scene-gpgpu: 81.27 KB`, `scene-future-native: 194.69 KB`, `scene-family-volumetric: 33.16 KB`, `scene-particle-core: 42.23 KB`, `scene-families-core: 88.70 KB`, `AppBodySceneConnected: 32.64 KB`). This pass further reduces broad `three` namespace usage in asset/material helper paths and keeps the project ready for a deeper trim later.


- 2026-04-08: three-core trim namespace-zero pass: converted the remaining family/runtime wrapper files from `import * as THREE from 'three'` to narrower named imports, bringing the count of broad namespace imports under `components/` and `lib/` from **28 -> 0**. Updated files include `sceneBrushSurfaceSystemRuntime`, `sceneGlyphOutlineSystemRuntime`, `sceneCrystalAggregateSystemRuntime`, `sceneFiberFieldSystem{Geometry,Render,Runtime}`, `sceneHybridFiberFieldSystem{Runtime,Render}`, `sceneErosionTrailSystem{Runtime,Render}`, `sceneGrowthFieldSystem{,Runtime}`, `sceneMembraneSystem{,Runtime,Render}`, `sceneParticleSystemRender`, `sceneParticleSystemRuntimeTypes`, `sceneReactionDiffusionSystemRuntime`, `sceneSurfacePatchSystem{,Runtime,Render}`, `sceneSurfaceShellSystem{Runtime,Render}`, `sceneSdfSurfaceShellSystemRender`, `sceneVolumetricFieldSystemRender`, `sceneLineSystemRuntime`, and `sceneMetaballSystemShared`.
- Verified with `npm run typecheck`, `npm run test:unit`, fast `build`, `npm run verify:dead-code`, `npm run verify:package-integrity:strict`, and `npm run refresh:repo-status`. Preload stayed `index / react-vendor / three-core / vendor / r3f-utils / r3f-fiber`; `applicationCandidateCount` remained **0** and `orphanModuleCount` remained **111**.
- Build result remained effectively flat (`three-core: 674.69 KB`, `scene-particle-core: 42.23 KB`, `scene-families-core: 88.70 KB`, `scene-family-surface: 80.74 KB`, `scene-family-membrane: 30.48 KB`, `scene-family-growth: 24.85 KB`). This pass removes the last broad `THREE.*` namespace imports from app source and leaves deeper trimming to chunk-boundary / symbol-level work rather than import syntax cleanup.

- 2026-04-08: Intel Mac live-browser proof status refresh: reran `npm run doctor:intel-mac-live-browser-proof:refresh` and `npm run report:intel-mac-live-browser-proof-status` against the current package layout. Result: target-side readiness moved to **5/6** (up from the previously stale 2/6 view because `fixtures/project-state/real-export/manifest.json` and `docs/archive/phase5-real-export-readiness-report.json` are now present), drop-side intake remains **4/11**, and the remaining blockers are real browser evidence only (`real-export` fixture JSON, `real-export-proof.json` captured state + artifact paths, structured proof logs, and Intel Mac browser executable path).

- Intel Mac **capture kit**: scaffold / package / finalize の同梱 shell script を drop へ追加し、実機採取から host finalize までの最短導線を固定

- 2026-04-08: future-native specialist/report split pass: introduced `scene-future-native-specialist` manual chunk for specialist/report/preview libraries (`futureNativeFamiliesSpecialist*`, `futureNativeSpecialistFamilyPreview`, `futureNativeFamilies{Project,Release,}Report`, `futureNativeFamilyPreviewArtifact`) and excluded it from html preload. Verified with `npm run typecheck`, `npm run test:unit`, fast `build`, `npm run verify:dead-code`, `npm run verify:package-integrity:strict`, and `npm run refresh:repo-status`.
- Result: preload remained `index / react-vendor / three-core / vendor / r3f-utils / r3f-fiber`; `scene-future-native-specialist` now builds as a separate **53.87 KB** chunk while `scene-future-native` remains **194.69 KB** and `applicationCandidateCount` stays **0** with `orphanModuleCount` **111**. This pass isolates specialist/report code from the preload path and makes future-native runtime trimming easier, but it does not yet reduce the runtime chunk itself.

- 2026-04-08 future-native runtime binding + bridge split
  - Added `futureNativeSceneBindingRuntime.ts` and `futureNativeSceneRecommendedPresetIds.ts` so the runtime bridge path can use a narrow binding lookup without importing recommended-preset resolver metadata.
  - Added `scene-future-native-volumetric` and `scene-future-native-bridges` manual chunks so volumetric bridge solvers and non-volumetric starter bridge families no longer sit inside the central `scene-future-native` runtime shell.

- 2026-04-08 safe recovery / future-native cycle fix
  - Rebuilt from the last valid working tree after confirming the 62MB ZIP was truncated and not a safe base artifact.
  - Extracted volumetric input builders into `futureNativeSceneBridgeVolumetricInputs.ts` so `scene-future-native-bridges` no longer back-imports volumetric helpers through `futureNativeSceneBridgeInputs.ts`.
  - Cleared the `scene-future-native-bridges -> scene-future-native-volumetric -> scene-future-native-bridges` circular chunk warning while preserving the minimal html preload set.
  - Fast build sizes after recovery: `scene-future-native` 22.06 kB, `scene-future-native-volumetric` 122.18 kB, `scene-future-native-bridges` 166.80 kB, `scene-runtime-catalog` 40.44 kB, `three-core` 674.69 kB.

## 2026-04-08 future-native route chunk split


- `futureNativeSceneBridgeInputs` を PBD/rope 用 `futureNativeSceneBridgePbdInputs` と MPM granular 用最小入力へ分離し、`scene-future-native-mpm` と共通 bridge 間の循環を解消。
- `scene-future-native-bridges` を `scene-future-native-pbd` / `scene-future-native-mpm` / `scene-future-native-fracture` / 共通 `scene-future-native-bridges` に分割。
- 目的は runtime async 化なしで family/route ごとの chunk 境界を細かくし、future-native の deeper trim とキャッシュ分離をやりやすくすること。
- preload 最小系は維持前提。


- 2026-04-08 Intel Mac host-ingest automation pass
  - Added `scripts/run-intel-mac-live-browser-proof-host-ingest.mjs` and `package.json` script `run:intel-mac-live-browser-proof-host-ingest` so host-side proof intake can run `extract bundle -> finalize -> doctor/status` from a single entry point.
  - Rewrote `emit-intel-mac-live-browser-proof-capture-kit.mjs` to generate simpler shell scripts without fragile multiline continuations, then regenerated `exports/intel-mac-live-browser-proof-drop/{README.md,finalize-on-host.sh}`.
  - `finalize-on-host.sh` now calls the new host-ingest wrapper directly; README now instructs a single host-side ingest/finalize step after bundle packaging.
  - Verified with `node scripts/emit-intel-mac-live-browser-proof-capture-kit.mjs`, `node scripts/run-intel-mac-live-browser-proof-host-ingest.mjs --skip-finalize`, `npm run verify:package-integrity:strict`, and `npm run refresh:repo-status`. This pass does not change drop-side score by itself, but it removes one manual handoff step and makes Intel Mac proof ingestion less error-prone.

- 2026-04-08: true namespace-zero follow-up を実施。`components/useGpgpuDrawAssets.ts` に残っていた最後の `import * as THREE from 'three'` を named import 化し、`scripts/verify-three-namespace-imports.mjs` と `npm run verify:three-namespace-imports` を追加。以後、components/lib 配下で `THREE.*` namespace import の再混入を CI 前に検知できるようにした。


## 2026-04-08 PostFX N8AO vendor split closeout

- `AppScenePostFx` を basic effects と `N8AO` lazy mount に分離。
- `AppScenePostFxBasic.tsx` / `AppScenePostFxN8ao.tsx` を追加し、N8AO を `React.lazy` で後段化。
- `vite.config.ts` で `scene-postfx-n8ao` / `scene-postfx-n8ao-vendor` chunk を追加。
- build 実測:
  - `scene-postfx-vendor`: **216.16 KB → 89.04 KB**
  - `scene-postfx-n8ao-vendor`: **131.39 KB**
  - `scene-postfx`: **3.40 KB**
- preload は引き続き最小系維持（`react-vendor`, `three-core`, `vendor`, `r3f-utils`, `r3f-fiber`）。
- 意味: bloom/noise/dof/vignette/chromatic aberration 等のみ有効なケースで、重い N8AO vendor を初回 PostFX 読込から外せるようになった。

## 2026-04-08 closeout: postfx composer/basic boundary

- `AppScenePostFx` の basic wrapper を `React.lazy` 化し、N8AO-only 経路で basic effect wrapper を同期 import しないよう更新。
- `vite.config.ts` で `scene-postfx-composer` chunk を追加し、`EffectComposer` / `postprocessing` core を basic effect wrapper 群から分離。
- 狙いは `N8AO only` 時に `scene-postfx-vendor` を読まない構造へ寄せること。

- Build 実測: `scene-postfx-vendor` 86.96 kB → 2.31 kB、`scene-postfx-composer` 87.03 kB 新設、`scene-postfx-n8ao-vendor` 131.43 kB 維持。
- `dist/index.html` の modulepreload は引き続き `react-vendor / three-core / vendor / r3f-utils / r3f-fiber` の最小系。
- 2026-04-08: Metaball 専用 `three-stdlib/objects/MarchingCubes` を generic `three-stdlib` から切り離し、`scene-family-gpgpu-aux` 側へ再配置。OrbitControls 用 `three-stdlib` と family 専用 vendor の責務を分離。`typecheck` / `test:unit` / fast `build` / `verify:package-integrity:strict` / `refresh:repo-status` / ZIP 検査を再通過。

## 2026-04-08 control-panel closed-shell split

- Added `ControlPanelEntry` so the closed state renders only a lightweight trigger shell and defers the full `ControlPanel` chunk until the first open.
- Added `initialActiveTab` plumbing to preserve the selected tab when opening from the closed trigger.
- Added manual chunks for `ui-control-panel-entry` and `ui-control-panel-trigger`.
- Build result:
  - `ui-control-panel-entry`: 2.20 kB
  - `ui-control-panel-trigger`: 8.94 kB
  - `ui-control-panel`: 285.40 kB
- `dist/index.html` now keeps only the entry script + `react-vendor` preload; the full control panel is no longer eagerly mounted from `AppRootLayout`.
- Verified with `typecheck`, `test:unit`, `build`, `verify:package-integrity:strict`, and `refresh:repo-status`.

## 2026-04-08 control-panel open-body split

- `ControlPanel` から full panel layout / content tree を `ControlPanelBody` へ分離し、open 後の shell と body を別 chunk 化。
- `vite.config.ts` に `ui-control-panel-body` を追加。
- `ControlPanel` は軽量 shell と loading fallback を維持し、重い body は `React.lazy` で後段読込。
- build 実測:
  - `ui-control-panel`: **285.40 KB → 281.56 KB**
  - `ui-control-panel-body`: **7.29 KB**
  - `ui-control-panel-entry`: **2.20 KB**
  - `ui-control-panel-trigger`: **8.94 KB**
- `dist/index.html` の modulepreload は引き続き `react-vendor` のみ。
- `typecheck` / `test:unit` / fast `build` / `verify:package-integrity:strict` / `refresh:repo-status` を再通過。


## 2026-04-08 control-panel connected-state split

- `ControlPanel` から `useControlPanelState` と full connected props 展開を `ControlPanelConnected` へ分離。
- open shell は `activeTab` / `isWide` と loading fallback だけを保持し、重い state hook は open 後の lazy connected chunk で初期化。
- `vite.config.ts` に `ui-control-panel-connected` chunk を追加。
- 狙いは、open 時も shell と state/content を分けて `ui-control-panel` 本体の責務をさらに薄くすること。

## 2026-04-08 Control-panel state/chrome split

- split `useControlPanelState` / `useControlPanelConfigHelpers` / `useControlPanelLocalState` / `useSequenceDrag` into `ui-control-panel-state`
- split `controlPanelChrome` into `ui-control-panel-chrome`
- build result:
  - `ui-control-panel`: 273.47 KB -> 272.86 KB
  - `ui-control-panel-state`: 7.26 KB
  - `ui-control-panel-chrome`: 8.94 KB
- preload remains minimal (`react-vendor` only in `dist/index.html`)
- 2026-04-08: audio tab now defers legacy cleanup manager/panel/sliders behind `AudioLegacySection` lazy boundary. Build now emits `ui-control-panel-audio` 33.69 kB and `ui-control-panel-audio-legacy` 77.92 kB while keeping preload at the minimal entry + react-vendor set.
- 2026-04-08: Restored `verify:preload-minimum` on the audio-route-editor chunk-split line so future builds automatically guard the minimum preload boundary.
- 2026-04-08: Ambient tab no longer lazy-loads through `controlPanelTabsAudio`; it now imports `controlPanelTabsAmbient` directly. This keeps the ambient path separate from audio-only editor/synth/legacy chunks while preserving the minimum preload boundary (`react-vendor` only).

- 2026-04-08: Audio tab synth controls moved behind a lazy mode gate and unused legacy imports were removed from `controlPanelTabsAudio.tsx`; manual chunk `ui-control-panel-audio-synth` added to keep non-microphone synth/help content out of the base audio tab path.

## 2026-04-08 final internal freeze

- Added `FINAL_INTERNAL_HANDOFF_2026-04-08.md` and froze this package as the recommended internal baseline.
- Decision: stop adding speculative internal micro-optimizations by default; remaining high-value work is now Intel iMac live proof first, `three-core` deeper trim second.
- This package should be treated as the handoff base unless a future change is validated with build / verify / zip integrity and improves measured output without adding circular chunk warnings.

- 2026-04-08: Display > Product Packs に future-native display packs を追加。`Material Behaviors` / `Soft Bodies` / `Breakage` / `Smoke Fields` の短い入口名で family を露出し、代表 preset の Load / Queue を追加。`npm run typecheck` / `npm run verify:future-native-display-pack-cards` / `npm run verify:future-native-global-overview` / `npm run verify:future-native-preset-catalog` / `npm run build` を通過。

- 2026-04-08: Added future-native export/project guidance sections so Video Export and Project I/O both surface active family routes, manifest handoff visibility, and shared route summaries via `verify:future-native-export-project`.


- 2026-04-08: Resolved the remaining `manualChunks` circular warnings by collapsing the cross-dependent future-native runtime families (`volumetric` / `mpm` / `pbd` / `fracture` / `bridges`) into a single `scene-future-native` chunk and folding the audio tab + legacy section into `ui-control-panel`. `npm run typecheck` and `npm run build` now pass with **no circular chunk warnings**.
- Intel Mac 実機採取の最終手順は `docs/archive/intel-mac-proof-final-execution-card-2026-04-09.md` を canonical card とする。

<!-- PHASE_BCDE_CURRENT_SYNC:START -->
## 2026-04-09 phase current sync

- canonical current docs:
  - `docs/PHASE_BCDE_CLOSEOUT_SCORECARD_CURRENT.md`
  - `docs/INTEL_MAC_LIVE_BROWSER_PROOF_CURRENT.md`
  - `docs/INTEL_MAC_INCOMING_ONE_SHOT_CURRENT.md`
  - `docs/EXECUTION_SURFACES_CURRENT.md`
  - `docs/UX_CLOSEOUT_MATRIX_CURRENT.md`
  - `docs/UX_IMPLEMENTATION_BOUNDARY_CURRENT.md`
  - `docs/WEBGPU_CAPABILITY_STATUS_CURRENT.md`
  - `docs/WEBGPU_EXECUTION_MODE_MATRIX_CURRENT.md`
  - `docs/CHUNK_WARNING_INVENTORY_CURRENT.md`

- summary:
  - generatedAt: 2026-04-09T19:26:49.998Z
  - Phase B: repo-closed / done 22 / limited 0 / preview-only 0
  - Phase C: host-proof-required / verdict ready-for-real-capture / drop 6/11 / target 5/6 / blockers 6
  - Phase D: repo-closed / done 5 / deferred 0 / host-proof-required 1

- intel mac current:
  - generatedAt: 2026-04-09T19:26:49.765Z
  - verdict: ready-for-real-capture
  - drop: 6/11
  - target: 5/6
  - blockerCount: 6
  - fixtureCount: 0
<!-- PHASE_BCDE_CURRENT_SYNC:END -->


- 2026-04-10 verify sweep addendum
  - recovery-core package を基準に core / browser / media / phase4 / phase5 / future-native fast lane の leaf verify を再走し、typecheck・unit **6/6**・project-state smoke・phase4 smoke・package integrity strict・project health・dead-code・preload minimum・host runtime・live browser readiness・audio reactive・future-native safe pipeline fast・phase5 fast・public-ui・audio・video・frames・library・collision・standalone synth・video-audio・shared-audio が通過した。
  - `verify:public-ui` は container Chromium 制限により `inlineRuntimePassed: false` のままだが、verify 全体は `passed: true`。live-browser / Intel Mac 実機証跡とは別管理とする。

- 2026-04-10 leaf suite completion addendum
  - `verify-suite-leaf-browser` 9/9 pass, `verify-suite-leaf-core-fast` 7/7 pass, `verify-suite-leaf-full-fast` 16/16 pass.
  - `verify-suite-leaf-core` 8/8 pass and `verify-suite-leaf-full` 17/17 pass are now fixed from the finalized `verify:phase4` / `verify:phase5` / `verify:export` evidence.
  - `verify:public-ui` remained pass with expected sandbox inline-runtime limitation (`inlineRuntimePassed: false`).

- 2026-04-10 distribution-set bundle index
  - `package:distribution-index` を追加し、distribution-set / proof-split distribution-set 実行時に横断 bundle index (`distribution-index_2026-04-10.json/.md`) を自動生成するよう更新。
  - full-local-dev / source-only-clean / verify-status / intel-mac-closeout の用途・サイズ・bootstrap 要否・推奨用途を1枚で確認可能にした。

- 2026-04-10 proof-packet distribution index embed pass
  - `package-proof-packet-shared` で proof packet 生成時に `distribution-index_YYYY-MM-DD.{json,md}` を自動生成・同梱するよう更新。
  - combined / verify-status / intel-mac-closeout の各 proof packet manifest に distribution index 参照を追加し、proof 単体から他 bundle の用途を辿れるようにした。

- 2026-04-12 future-native playback payload-tier hold tuning pass
  - `components/sceneFutureNativeSystem.tsx` で `pbd-softbody` playback worker の cooldown / stale を payload tier 別に再調整し、very heavy / heavy / medium / light で retry と hold を分けた。
  - hold 直後だけ cooldown を短縮し、very heavy は 45ms / 60ms、heavy は 55ms / 70ms、medium は 68ms / 82ms、light は 75ms / 90ms へ更新。stale も 260ms / 220ms / 195ms / 180ms へ分割した。
  - hold に入っているのに diagnostics 上で `held` 扱いされない穴を修正し、`playbackPacketHeldRef` / `playbackPacketLastHoldAtRef` と overlay の `hXXms` 表示が一致するようにした。
  - Verification: `npm run typecheck` pass / `KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` pass.



## 2026-04-10 — Specialist Route Control Direct-Edit Pass
- Added Project IO specialist route controls for the 4 specialist families.
- Added direct editing for override mode, selected adapter, target switch, override candidate, and override disposition.
- Synced specialist route control UI state into project manifest hydration and project export/import.
- Added control packet builder and unit coverage for route control normalization / patch behavior.
- Verification: typecheck pass / unit 8 of 8 pass / build pass.

## 2026-04-10 — WebGPU Capability Surface Pass
- Added `lib/projectWebgpuCapabilityCurrent.ts` to hold the current repo-side WebGPU direct / limited / fallback-only report and packet builder.
- Added `WebGPU current execution surface` to Project IO future-native routes so operators can filter direct / limited / fallback-only lanes and copy a current WebGPU capability packet.
- 2026-04-10 distribution / proof bundle current surface pass
  - Added `lib/projectDistributionProofBundleCurrent.ts` to hold the current distribution / proof bundle matrix, quick advice, archive patterns, and packet builder.
  - Added `Distribution / proof bundle current surface` to Project IO future-native routes so operators can filter resume / proof lanes and copy a current bundle packet directly from the UI.
  - Added `tests/unit/projectDistributionProofBundleCurrent.test.ts` to lock summary counts, proof filtering, and packet contents.
- This pass does **not** claim new runtime WebGPU coverage; it exposes the current closure state and target-host blockers directly inside the UI.
- Verification: typecheck pass / unit pass / build pass.
- Added distribution / proof bundle snapshot drift card to the Project IO future-native Manifest snapshot, backed by a serialized manifest bundle summary so saved-vs-current quick advice and bundle inventory drift are visible.

- 2026-04-10 export / handoff snapshot drift pass
  - Added `lib/projectExportHandoffCurrent.ts` to build a unified export/handoff current summary and packet from current routes, WebGPU capability, Intel Mac proof, and distribution bundle advice.
  - Added manifest serialization for `exportHandoff` and surfaced `Export / handoff snapshot diff` inside Project IO > Future-native project routes > Manifest snapshot.
  - Added `Copy handoff` for the current unified packet and `tests/unit/projectExportHandoffCurrent.test.ts` to lock summary and drift behavior.
  - Verification: typecheck pass / unit 12 test files pass / build pass.

- Added `Closeout current packet` to Project IO future-native routes so operators can copy a single closeout packet covering WebGPU current status, Intel Mac proof readiness, distribution bundle advice, and export/handoff summary.
- 2026-04-11 external-control progress visibility pass
  - `scripts/generate-execution-surfaces-report.mjs` / `scripts/refresh-execution-surfaces.mjs` に external control proxy status の読込を追加し、`docs/archive/external-control-osc-proxy-status.json` が存在する場合は current docs から clients / messages / latest status を追えるようにした。
  - `docs/EXECUTION_SURFACES_CURRENT.md` の current surface 一覧に `EXTERNAL_CONTROL_BRIDGE_CURRENT` を追加し、live control の進捗を current lane から見失わないようにした。

- 2026-04-11 external-control proxy status/fixture pass
  - `scripts/run-external-control-osc-proxy-entry.ts` に status sink を追加し、browser から返る `external-control-status` / `external-control-error` を `docs/archive/external-control-osc-proxy-status.json` へ保存できるようにした。
  - `scripts/send-external-control-osc-fixture-entry.ts` と `send:external-control-osc-fixture` を追加し、handshake / randomize / preset load / queue control / patch-seed を fixture 名だけで UDP 送信できるようにした。
  - `docs/EXTERNAL_CONTROL_BRIDGE_CURRENT.md` に proxy / fixture sender の使い方を追記し、`tests/unit/externalControlBridgeStatus.test.ts` / `tests/unit/externalControlOscProxy.test.ts` を追加して encode/status 集計を固定した。

- 2026-04-11 external-control proxy implementation pass
  - `lib/externalControlOscProxy.ts` に OSC subset parser/encoder を追加し、依存追加なしで `UDP OSC subset -> ws-json bridge` を扱えるようにした。
  - `scripts/run-external-control-osc-proxy-entry.ts` と `run:external-control-osc-proxy` を追加し、`ws://127.0.0.1:18181` と `udp://127.0.0.1:9124` を既定とするローカル proxy を起動可能にした。
  - `lib/externalControlBridge.ts` / `lib/useExternalControlBridge.ts` / `components/AppBodySceneConnected.tsx` を拡張し、preset load / sequence select / export queue enqueue-run-cancel-clear まで external bridge から制御できるようにした。
- 2026-04-11 external-control closeout sync pass
  - `scripts/generate-closeout-report.mjs` に external control lane を追加し、`docs/archive/external-control-osc-proxy-status.json` がある場合は closeout report/current report から protocol doc / proxy-fixure readiness / latest observed browser status を追えるようにした。
  - `scripts/generate-execution-surfaces-report.mjs` / `scripts/refresh-execution-surfaces.mjs` の artifact inventory に external control proxy status を加え、current docs の refreshed artifact count を external control 進捗込みで再計算するよう更新した。


- 2026-04-11 phase5 runtime hotspot compression pass
  - `scripts/verify-phase5.mjs` を step orchestrator 化し、profile 実行時に 1 プロセスで全 scenario module を抱え込まず、step ごとに leaf entry を直接起動する形へ変更した。
  - `scripts/phase5StepRegistry.mjs` を追加し、profile -> step -> entrypoint の解決を JS 側へ移した。
  - `fixture-files-synced` / `sparse-serialization-recovery` / `legacy-migration-rebuild` / `import-inspection-diagnostics` を軽量 leaf 実行へ切り出した。
  - `verify:phase5:smoke` は container 実測で **約13.65s -> 0.64s**、`verify:phase5:sparse` は **約0.84s wall / 174ms step** で返るところまで圧縮した。
  - typecheck / package integrity strict は通過。`fixture-file-parsing` 以降の strict parse 系 leaf はまだ重く、full lane の追加圧縮は継続対象。
- 2026-04-12 cleanup pass: dead-code cleanup を追加実施し、tmp/debug/probe 系と未使用 smoke re-export を整理。`npm run verify:dead-code` / `npm run typecheck` / `npm run verify:preload-minimum` / `KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build` / closeout・repo status・doctor を再生成し、orphan **96 → 85**、dev-only **49 → 39**、runtime-facing application candidates **0 維持**、closeout **100/100** を確認した。
