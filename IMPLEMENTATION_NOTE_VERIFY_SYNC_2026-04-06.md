# IMPLEMENTATION NOTE VERIFY SYNC 2026-04-06

- overlay 反映後、audio / standalone synth / shared audio の verify 参照先を分割後構成へ同期した。
- `components/controlPanelTabsAudioSynth.tsx` を required file 群へ追加した。
- `scripts/verify-phase5.mjs` に host runtime preflight を追加し、生の esbuild 例外を構造化エラーへ置換した。
- `scripts/verify-phase4.mjs` にも同様の host runtime preflight を追加し、build 系失敗の理由を明示化した。
- `scripts/verify-suite.mjs` を host-runtime aware にし、build / phase4 / phase5 を suite 上で `blocked-host-runtime` として集計できるようにした。
- `scripts/verify-step-runner.mjs` に `host-runtime-blocked` の分類を追加し、step report 単位でも build 系未証明を fail と区別できるようにした。
- browser 系 verify suite は static fallback で 9/9 pass を確認した。
- core build subset は `build / verify:phase4 / verify:phase5 = 3 blocked`、`verify:export = 1 pass` を確認した。
- `scripts/verify-core-portable.mjs` と `npm run verify:core-portable` を追加し、host-runtime mismatch 下でも core pass 範囲と blocked 範囲を一枚で固定できるようにした。
- portable core manual rerun で `typecheck:audio-reactive:attempt / verify:audio-reactive:check / verify:audio-reactive / typecheck / verify:export = 5/5 pass`、`build / verify:phase4 / verify:phase5 = 3 blocked` を確認した。
