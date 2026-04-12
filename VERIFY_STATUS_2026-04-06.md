# VERIFY STATUS 2026-04-06

- scope: missing layers overlay反映後の verify 追随修正と build 系 host-runtime 失敗の明示化
- goal: 「統合済みだが verify 側が古い」状態を減らし、現環境で確認可能な pass 範囲を拡大する

## 実施内容

1. `scripts/verify-audio.mjs`
   - `audio-input-sliders` の static check 参照先を `components/controlPanelTabsAudioSynth.tsx` に同期
2. `scripts/verify-standalone-synth.mjs`
   - standalone synth guidance の static check 参照先を `components/controlPanelTabsAudioSynth.tsx` に同期
3. `scripts/verify-shared-audio.mjs`
   - shared audio guidance の static check 参照先を `components/controlPanelTabsAudioSynth.tsx` に同期
4. `scripts/check-audio-reactive.mjs`
   - required file list に `components/controlPanelTabsAudioSynth.tsx` を追加
5. `scripts/verify-audio-reactive.mjs`
   - required file list に `components/controlPanelTabsAudioSynth.tsx` を追加
6. `scripts/packageIntegrityShared.mjs`
   - root required path list に `components/controlPanelTabsAudioSynth.tsx` を追加
7. `scripts/verify-phase5.mjs`
   - host runtime preflight を追加し、esbuild native mismatch 時の生例外を構造化エラーへ置換
8. `scripts/verify-phase4.mjs`
   - host runtime preflight を追加し、Vite/Rollup build native mismatch を構造化エラーへ置換
9. `scripts/verify-suite.mjs`
   - build 系 step に `requiresHostRuntime` を付与
   - suite report に `blockedCount` / `blockedSteps` / `blockedHostRuntime` を追加
   - build / phase4 / phase5 を `blocked-host-runtime` として集計
10. `scripts/verify-step-runner.mjs`
   - `failedStep: host-runtime` を `blocked-host-runtime` として分類
   - step report 単位でも `blocked: true` を保持

## この環境での確認結果

### pass
- `npm run typecheck`
- `node scripts/verify-audio.mjs`
- `node scripts/verify-standalone-synth.mjs`
- `node scripts/verify-shared-audio.mjs`
- `npm run verify:audio-reactive`
- `npm run verify:export`
- `npm run verify:future-native-project-state-fast`
- `npm run verify:package-integrity`
- `npm run verify:dead-code`
- `npm run verify:all:browser`
  - result: **9/9 pass**
  - tier: **source-static-fallback**
  - note: live browser 実測ではなく static fallback 証明
- `VERIFY_SUITE_ONLY=build,verify:phase4,verify:phase5,verify:export node scripts/verify-suite.mjs`
  - result: **1 pass / 3 blocked / 0 fail**
  - build subset report: `docs/archive/verification-suite-runs/2026-04-06T11-07-08-628Z/verification-suite-report.json`

- `npm run verify:core-portable`
  - result: **portable core 5/5 pass / host-runtime 3 blocked / 0 fail**
  - report: `docs/archive/core-portable-verification.json`

### blocked-host-runtime
- `npm run build`
- `npm run verify:phase4`
- `npm run verify:phase5`
- suite 上でも同3件は `blocked-host-runtime` として記録される

### host mismatch で未証明
- `node scripts/verify-host-runtime.mjs --strict`
- live browser 実測を伴う export / browser 系 proof

## host mismatch の内容

- missing: `node_modules/@rollup/rollup-linux-x64-gnu`
- missing: `node_modules/@esbuild/linux-x64`
- interpretation: この zip の `node_modules` は Linux x64 glibc host 向けに再解決されていない

## export verify の現状

- `verify:export` は **pngjs-static-harness-fallback** で pass
- `dist` 未生成のため server-fallback は未使用
- inline-runtime は host runtime mismatch で未到達
- `skia-canvas` は現環境では未解決だが、pngjs fallback により判定自体は通っている

## portable core report

- portable core は `typecheck:audio-reactive:attempt / verify:audio-reactive:check / verify:audio-reactive / typecheck / verify:export` の5本で構成
- 現 Linux 検証環境では **5/5 pass = 100%** を確認
- 同時に build / verify:phase4 / verify:phase5 は **3 blocked** と分離して記録
- latest report: `docs/archive/core-portable-verification.md`

## 判断

- verify 追随漏れは今回の修正で解消した
- browser verify suite は static fallback で 9/9 pass まで回復した
- build / phase4 / phase5 は、現在では「壊れた build」ではなく「host runtime mismatch により blocked」として明示される
- 現在残る主問題は、実装本体より host native runtime mismatch である
- よって次の実機確認は target host 上の `npm install` 後に行うのが正しい
