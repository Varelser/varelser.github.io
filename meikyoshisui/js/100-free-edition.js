/* ═══════════════════════════════════════════════════════════════
   MEIKYOSHISUI — FREE EDITION layer (js/100)
   GitHub (free) build only. The mother source and the Gumroad
   edition do NOT include this file.
   - File downloads are blocked at the shared choke points
     (anchor[download] clicks, showSaveFilePicker, file sharing),
     so every export path (MIDI / stems / MusicXML / WAV / Opus /
     visualizer PNG・REC / bulk ZIP / state JSON) stops here.
   - Live data-out buttons (DAW live send, OSC send) are blocked.
   - PWA install is suppressed (no manifest in this build +
     beforeinstallprompt is swallowed).
   - Screenshot deterrents: canvas context menu / drag disabled,
     PrintScreen shows a cover overlay, print output is blank.
     (OS-level capture cannot be fully prevented in a browser;
     these are deterrents against casual copying.)
   Generation, preview playback and all panels work exactly as
   in the full edition; only data leaving the app is restricted.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var GUMROAD = 'https://varelser.gumroad.com/l/kzpxqd';
  var MSG = '無料版では書き出し・保存はできません。完全版（Gumroad）でご利用いただけます。';

  /* ── toast + badge ─────────────────────────────────────────── */
  function ensureStyle() {
    if (document.getElementById('freeEdStyle')) return;
    var st = document.createElement('style');
    st.id = 'freeEdStyle';
    st.textContent =
      '#freeToast{position:fixed;left:50%;bottom:96px;transform:translateX(-50%) translateY(16px);' +
      'background:#17181c;color:#f2f2f4;border:1px solid #3a3a41;border-radius:10px;padding:12px 18px;' +
      'font-size:13px;line-height:1.6;letter-spacing:.04em;z-index:99990;opacity:0;pointer-events:none;' +
      'transition:opacity .25s,transform .25s;max-width:min(92vw,560px);text-align:center}' +
      '#freeToast.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}' +
      '#freeToast a{color:#fff;text-decoration:underline}' +
      '#freeBadge{position:fixed;right:14px;bottom:84px;z-index:99989;background:rgba(20,20,24,.88);' +
      'color:#e8e8ec;border:1px solid #3a3a41;border-radius:999px;padding:6px 14px;font-size:11px;' +
      'letter-spacing:.12em;text-decoration:none;backdrop-filter:blur(6px)}' +
      '#freeBadge:hover{background:#26262c}' +
      '#freeVeil{position:fixed;inset:0;background:#0a0a0c;z-index:99999;display:none;' +
      'align-items:center;justify-content:center;color:#d8d8de;font-size:14px;letter-spacing:.14em}' +
      '@media print{body{display:none !important}}';
    document.head.appendChild(st);
  }
  var toastTimer = null;
  function toast() {
    ensureStyle();
    var t = document.getElementById('freeToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'freeToast';
      document.body.appendChild(t);
    }
    t.innerHTML = MSG + '<br><a href="' + GUMROAD + '" target="_blank" rel="noopener">完全版はこちら（Gumroad）</a>';
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 4200);
  }
  function badge() {
    ensureStyle();
    if (document.getElementById('freeBadge')) return;
    var a = document.createElement('a');
    a.id = 'freeBadge';
    a.href = GUMROAD;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'FREE EDITION — 完全版はGumroad';
    document.body.appendChild(a);
  }

  /* ── 1) anchor downloads (all export paths funnel here) ────── */
  var origAnchorClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    var href = this.href || '';
    if (this.download && (href.indexOf('blob:') === 0 || href.indexOf('data:') === 0)) {
      toast();
      return;
    }
    return origAnchorClick.apply(this, arguments);
  };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[download]') : null;
    if (a) {
      var href = a.href || '';
      if (href.indexOf('blob:') === 0 || href.indexOf('data:') === 0) {
        e.preventDefault();
        e.stopPropagation();
        toast();
      }
    }
  }, true);

  /* ── 2) File System Access save dialog ─────────────────────── */
  if ('showSaveFilePicker' in window) {
    window.showSaveFilePicker = function () {
      toast();
      return Promise.reject(new DOMException('Save is disabled in the free edition.', 'AbortError'));
    };
  }

  /* ── 3) file sharing (URL / text sharing stays allowed) ────── */
  if (navigator.share) {
    var origShare = navigator.share.bind(navigator);
    navigator.share = function (data) {
      if (data && data.files && data.files.length) {
        toast();
        return Promise.reject(new DOMException('Share of files is disabled in the free edition.', 'AbortError'));
      }
      return origShare(data);
    };
  }

  /* ── 4) live data-out buttons (DAW send / OSC send / state) ── */
  var BLOCK_IDS = {
    btnOscSend: 1,   // OSC send
    dawPlayBtn: 1,   // DAW live send (WebMIDI)
    dawDlBtn: 1,     // DAW MIDI download
    spBtnExport: 1   // state JSON export (also covered by (1), belt & braces)
  };
  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== document) {
      if (el.id && BLOCK_IDS[el.id]) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toast();
        return;
      }
      el = el.parentElement;
    }
  }, true);

  /* ── 5) PWA install suppression ────────────────────────────── */
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); });

  /* ── 6) screenshot / capture deterrents ────────────────────── */
  document.addEventListener('contextmenu', function (e) {
    if (e.target && e.target.tagName === 'CANVAS') e.preventDefault();
  }, true);
  document.addEventListener('dragstart', function (e) {
    if (e.target && (e.target.tagName === 'CANVAS' || e.target.tagName === 'IMG')) e.preventDefault();
  }, true);
  function veil() {
    ensureStyle();
    var v = document.getElementById('freeVeil');
    if (!v) {
      v = document.createElement('div');
      v.id = 'freeVeil';
      v.textContent = '画面の保存はご遠慮ください — MEIKYOSHISUI FREE EDITION';
      document.body.appendChild(v);
    }
    v.style.display = 'flex';
    setTimeout(function () { v.style.display = 'none'; }, 2600);
    try { if (navigator.clipboard && navigator.clipboard.writeText) { var p = navigator.clipboard.writeText(''); if (p && p.catch) p.catch(function () {}); } } catch (err) {}
  }
  document.addEventListener('keyup', function (e) { if (e.key === 'PrintScreen') veil(); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'PrintScreen') veil(); }, true);

  /* ── 7) honest log lines: export functions still log "success"
        after their (blocked) download click; rewrite those lines ── */
  if (typeof window.log === 'function') {
    var origLog = window.log;
    window.log = function (msg, type) {
      if (typeof msg === 'string' && /(DOWNLOADED|MULTI EXPORT|MUSICXML EXPORTED|OSC EXPORT|PRESETS EXPORTED)/.test(msg)) {
        return origLog('// 書き出しは無料版では無効です（完全版はGumroad）', 'warn');
      }
      return origLog(msg, type);
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', badge);
  else badge();
})();
