/* ═══════════════════════════════════════════════════════════════
   92-patch-state-ui.js — 全ラップ還元・移設済み (2026-11-10)
   ───────────────────────────────────────────────────────────────
   このファイルにあった処理は、全て本体または 90 へ移った。
   経緯と対応表は docs/PATCH_LAYER.md。

   移設先:
   · StatePersist.save / load の patch 拡張 (ji / rc / compTuning /
     sectionLearnFocus / sectionPreviewFollow / midiCapturePolicy /
     conductorViz の保存・復元と load 後の patch UI 同期)
     → 29-state-persist.js (buildSnapshot / syncPatchAfterLoad)
   · StatePersist.exportAll / importAll の patchExtras 対応
     → 29-state-persist.js
   · window._updateABPreview のラップ (バリアント復元 + UI 同期)
     → 22-ui-functions.js
   · patch 機能の DOM 構築とイベント配線 (installDomFixes、
     MidiInputEngine.enable のハンドラ差し替えを含む)
     → 77-dom-init.js (2026-11-11 に 90 から分散。PATCH モジュール自身の初期化として)

   これで patch layer の「ラップ」は全て解消し、残るのは
   90-patch-shared.js (PATCH ライブラリ) のみになった。
   ※ 2026-11-11: 90 は機能ドメイン別に 72–77 の本体モジュールへ分散し、
     90 自体はコア (356 行) にスリム化した。対応表は docs/DISPERSION_PLAN.md。
   ═══════════════════════════════════════════════════════════════ */
