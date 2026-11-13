/* ═══════════════════════════════════════════════════════════════
   PLATFORM  v1.0 (js/94) — 最新プラットフォーム技術の後付け統合
   既存モジュールには触れず、公開APIとポーリングだけで接続する。
   ─────────────────────────────────────────────────────────────
   - Media Session : プレビュー再生をロック画面/イヤホンから操作
   - Wake Lock     : 再生中・ビジュアライザー没入中は画面を消さない
   - 出力先選択    : AudioContext.setSinkId（対応時のみボタン表示）
   - 保存/共有     : .mid を保存先ピッカー or OS共有で（従来DLは不変）
   - View Transition: デザイン切替ボタンの切替をクロスフェードで包む
   - 共有ヘルパー  : window.__MEIKY_SAVE__（93 の PNG 保存が利用）
   すべて feature-detect 済み。非対応環境では従来動作のまま。
   ═══════════════════════════════════════════════════════════════ */
(() => {
'use strict';
if (typeof MidiPreview === 'undefined') return;
const MP = MidiPreview;

/* ── 保存 / 共有ヘルパー ─────────────────────── */
async function saveBlob(blob, filename){
  if (window.showSaveFilePicker){
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: filename });
      const w = await handle.createWritable();
      await w.write(blob); await w.close();
      return 'picker';
    } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'download';
}
async function shareBlob(blob, filename, title){
  const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
  if (navigator.canShare && navigator.canShare({ files: [file] })){
    try { await navigator.share({ files: [file], title: title || filename }); return true; }
    catch (e) { if (e && e.name === 'AbortError') return true; }
  }
  return false;
}
window.__MEIKY_SAVE__ = { saveBlob, shareBlob };

/* ── Media Session ──────────────────────────── */
const MS_OK = 'mediaSession' in navigator;
let msParsed = null, msPlaying = null;
if (MS_OK){
  const set = (action, fn) => { try { navigator.mediaSession.setActionHandler(action, fn); } catch (e) {} };
  set('play', () => MP.play());
  set('pause', () => MP.pause());
  set('stop', () => MP.stop());
  set('seekto', d => { const dur = MP.getDuration ? MP.getDuration() : 0; if (dur > 0 && d.seekTime != null) MP.seek(Math.min(0.999, Math.max(0, d.seekTime / dur))); });
  set('seekbackward', d => { const dur = MP.getDuration() || 0, cur = MP.getElapsed ? MP.getElapsed() : 0; if (dur > 0) MP.seek(Math.max(0, (cur - (d.seekOffset || 10)) / dur)); });
  set('seekforward', d => { const dur = MP.getDuration() || 0, cur = MP.getElapsed ? MP.getElapsed() : 0; if (dur > 0) MP.seek(Math.min(0.999, (cur + (d.seekOffset || 10)) / dur)); });
}
function msMetadata(){
  const seedEl = document.getElementById('seedVal');
  const seed = seedEl && seedEl.textContent.trim() && seedEl.textContent.trim() !== '—' ? 'SEED ' + seedEl.textContent.trim() : '';
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'MEIKYOSHISUI — Preview',
      artist: seed || 'MEIKYOSHISUI',
      album: 'MEIKYOSHISUI',
      artwork: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
    });
  } catch (e) {}
}

/* ── Wake Lock ──────────────────────────────── */
let wakeLock = null, wlWant = false;
async function wlSync(want){
  wlWant = want;
  try {
    if (want && 'wakeLock' in navigator && document.visibilityState === 'visible'){
      if (!wakeLock){ wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
    } else if (!want && wakeLock){ await wakeLock.release(); wakeLock = null; }
  } catch (e) { wakeLock = null; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && wlWant) wlSync(true); });

/* ── ポーリング（再生状態・データ差し替えの検出） ── */
setInterval(() => {
  const playing = MP.isPlaying();
  const parsed = MP.getParsed ? MP.getParsed() : null;
  if (MS_OK){
    if (parsed && parsed !== msParsed){ msParsed = parsed; msMetadata(); }
    if (playing !== msPlaying){
      msPlaying = playing;
      try { navigator.mediaSession.playbackState = playing ? 'playing' : (parsed ? 'paused' : 'none'); } catch (e) {}
    }
    if (playing && MP.getDuration && MP.getElapsed){
      const dur = MP.getDuration();
      if (dur > 0){ try { navigator.mediaSession.setPositionState({ duration: dur, position: Math.min(dur, MP.getElapsed()), playbackRate: 1 }); } catch (e) {} }
    }
  }
  const vizFs = document.fullscreenElement && document.fullscreenElement.id === 'vizPanel';
  wlSync(playing || !!vizFs);
  applyPendingSink();
}, 500);

/* ── 出力先選択（setSinkId） ─────────────────── */
let pendingSinkId = '';
function applyPendingSink(){
  if (!pendingSinkId) return;
  const ac = MP.getContext ? MP.getContext() : null;
  if (ac && typeof ac.setSinkId === 'function'){
    ac.setSinkId(pendingSinkId).catch(() => {});
    pendingSinkId = '';
  }
}
function initSinkButton(){
  const toggle = document.getElementById('prevMixerToggle');
  if (!toggle || !navigator.mediaDevices || typeof navigator.mediaDevices.selectAudioOutput !== 'function') return;
  if (!window.AudioContext || !('setSinkId' in AudioContext.prototype)) return;
  const btn = document.createElement('button');
  btn.className = 'prev-mixer-toggle'; btn.id = 'prevSinkBtn'; btn.title = 'プレビューの出力先（スピーカー/イヤホン）を選択';
  btn.textContent = '🔊'; btn.style.marginLeft = '6px';
  btn.addEventListener('click', async () => {
    try {
      const dev = await navigator.mediaDevices.selectAudioOutput();
      if (!dev || !dev.deviceId) return;
      pendingSinkId = dev.deviceId;
      applyPendingSink();
      btn.title = '出力先: ' + (dev.label || '選択済み');
    } catch (e) { /* キャンセル等は無視 */ }
  });
  toggle.after(btn);
}

/* ── .mid の保存先/共有ボタン（従来の DL はそのまま） ── */
function initMidShareButton(){
  const dl = document.getElementById('btnDl');
  if (!dl || document.getElementById('btnMidSave')) return;
  const btn = document.createElement('button');
  btn.id = 'btnMidSave'; btn.className = 'btn-dl'; btn.textContent = '⇪ SAVE / SHARE';
  btn.style.cssText = 'font-size:10px;padding:14px 16px;letter-spacing:2px;margin-left:8px';
  btn.title = '生成済み MIDI を保存先を選んで保存、または OS の共有で送る';
  btn.addEventListener('click', async () => {
    if (typeof S === 'undefined' || !S.midiData) return;
    const blob = new Blob([S.midiData], { type: 'audio/midi' });
    const name = 'meikyoshisui_' + (S.bpm || 60) + 'bpm.mid';
    if (navigator.share && navigator.canShare){ if (await shareBlob(blob, name, 'MEIKYOSHISUI MIDI')) return; }
    await saveBlob(blob, name);
  });
  dl.after(btn);
}

/* ── デザイン切替を View Transition で包む ──── */
const VT_OK = typeof document.startViewTransition === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let vtBusy = false;
document.addEventListener('click', e => {
  if (!VT_OK || vtBusy) return;
  const b = e.target && e.target.closest ? e.target.closest('#designToggle') : null;
  if (!b) return;
  e.stopPropagation(); e.preventDefault();
  vtBusy = true;
  const t = document.startViewTransition(() => { b.click(); });
  if (t && t.finished) t.finished.finally(() => { vtBusy = false; }); else vtBusy = false;
}, true);

/* ── View Transition の共通スタイル ─────────── */
const st = document.createElement('style');
st.textContent = '::view-transition-old(root),::view-transition-new(root){animation-duration:.28s}';
document.head.appendChild(st);

function init(){ initSinkButton(); initMidShareButton(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
