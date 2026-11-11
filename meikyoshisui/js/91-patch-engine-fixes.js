/* ═══════════════════════════════════════════════════════════════
   91-patch-engine-fixes.js — 全ラップ還元済み (2026-11-10)
   ───────────────────────────────────────────────────────────────
   このファイルにあった patch layer の差し替え・ラップは、全て
   本体ファイルへ還元された。経緯と対応表は docs/PATCH_LAYER.md。

   還元先:
   · parseMidiTrackData / buildMPEConductor / pbRange 優先解決 /
     applyCompensationTuningToMidi の二重適用ガード → 15-midi-core.js
   · generateForChord / doGenerate の編成処理 → 22-ui-functions.js
     (本体は generateForChordCore / doGenerateCore、公開名は編成側が持つ)
   · MidiPreview 差し替え → 28-midi-preview.js
   · NREngine トライアド正規化 → 30-neo-riemannian.js
   · RhythmicCanons 総ステップ数ヒント → 33-rhythmic-canons.js
   · Solfeggio / Binaural / SpectralHarmony のコンサートピッチ伝播
     → 18-solfeggio.js / 19-binaural.js / 66-spectral-harmony.js
   · CompTuningEngine.getSummary の Scala 追記 → 20-comp-tuning.js

   残る patch layer は 90 (PATCH ライブラリ: 機能の実体) と
   92 (StatePersist 拡張 + patch 機能の DOM 構築) のみ。
   ═══════════════════════════════════════════════════════════════ */
