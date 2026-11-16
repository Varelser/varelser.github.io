/* 99-varelser-link.js — Varelser Link for MEIKYOSHISUI (2026-11-14)
   ═══════════════════════════════════════════════════════════════════
   Opt-in cross-app sync with Noise / Kalokagathia on the same origin
   via BroadcastChannel('varelser-link-v1') (the channel name already
   used by Kalokagathia's Noise link).

   DEFAULT OFF. While OFF this file creates NO BroadcastChannel,
   starts NO polling and changes NO behaviour — it only renders the
   small toggle UI below so the user can opt in. The toggle persists
   in localStorage 'meikyoshisui.varelserLink.v1' ('1' = on, '0' = off).

   Real Meikyoshisui state used here (verified in the live sources):
     · Global state object `S` — const S = { chord:{root,rootName,
       quality,iv,name}|null, genre:'ambient', scale:'Dorian', bpm:58,
       seed:0, seedLocked:false, ... }   (js/17-ui-state.js:2,8)
     · Seed RNG — rngSeed(n) (L18) / rngState() (L28) (xorshift32)
       (js/17-ui-state.js, "SEEDED RNG" block)
     · generate seeding — doGenerateCore: locked → rngSeed(S.seed),
       unlocked → rngSeed(0); S.seed = rngState()
       (js/22-ui-functions.js:231-237, inside doGenerateCore:213)
     · GENERATE entry — function doGenerate(abSlot, onDone)
       (js/22-ui-functions.js:1023), bound to the button once as
       document.getElementById('btnGen').addEventListener('click', doGenerate)
       (js/23-init.js:58) — i.e. the click handler captured the ORIGINAL
       function reference, so reassigning window.doGenerate would NOT
       intercept clicks. This file therefore does NOT wrap doGenerate;
       it only adds its own extra click listener on #btnGen / #btnGenAB
       and waits for the button's 'busy' class (added by doGenerateCore,
       removed when generation finishes) to clear before syncing.
     · Preview / playing — const MidiPreview, MidiPreview.isPlaying()
       (js/28-midi-preview.js:8,393,411)
     · Seed UI — #seedInput (change → S.seed = (parseInt(v)>>>0)||1),
       #seedVal, #seedLockBtn / S.seedLocked (js/46-init-seed-ui.js)
     · DAW Link section — #dawLinkSec, created by js/80-daw-link.js
       (its init is registered before this file's, so the section
       already exists when this file initialises on DOMContentLoaded).

   Seed application on a received seed-sync: there is no dedicated
   seed setter function in Meikyoshisui, so this file applies a seed
   exactly the way the app's own code does — set S.seed, call
   rngSeed(seed), and update #seedInput / #seedVal / #seedLockBtn.
   It also sets S.seedLocked = true, mirroring the SeedWorks shared
   snapshot { seed, seedLocked:true }: with seedLocked=false the next
   GENERATE would randomise S.seed away (see generate seeding above),
   so locking is what makes a synced seed actually take effect.
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const CHANNEL_NAME = 'varelser-link-v1';
  const LS_KEY = 'meikyoshisui.varelserLink.v1';
  const APP = 'meikyoshisui';

  /* ── SeedWorks derivation — copied verbatim in behaviour ──────────
     base/seedworks/index.html:
       splitmix32    L144, mulberry32 L145, hashSeedString L147,
       parseMasterSeed L148-153, streamFor L155,
       music seed    L209-211: const rm = streamFor(h,'music');
                     seed:(1+Math.floor(rm()*4294967294))>>>0          */
  function splitmix32(a) { return function () { a |= 0; a = (a + 0x9E3779B9) | 0; let t = (a ^ (a >>> 16)) >>> 0; t = Math.imul(t, 0x21F0AAAD); t = (t ^ (t >>> 15)) >>> 0; t = Math.imul(t, 0x735A2D97); t = (t ^ (t >>> 15)) >>> 0; return t >>> 0; }; }
  function mulberry32(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hashSeedString(s) { let h = 0x811C9DC5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; }
  /* SeedWorks parseMasterSeed: numeric -> (Number>>>0)||1, else FNV-1a||1 */
  function masterHash(raw) {
    const t = String(raw == null ? '' : raw).trim();
    if (/^-?\d+$/.test(t)) return (Number(t) >>> 0) || 1;
    return hashSeedString(t) || 1;
  }
  function streamFor(hash, tag) { const th = hashSeedString(tag); const sm = splitmix32((hash ^ th) >>> 0); return mulberry32(sm()); }
  /* SeedWorks derive() 'music' block EXACTLY: it first consumes one value
     for the genre pick (genre=MEIKYO_GENRES[ri(rm,8)]), THEN draws the seed.
     Consuming the genre value first is required so a live seed-sync yields
     the SAME seed as the SeedWorks Meikyoshisui link for the same master
     (verified: master '20261114' -> 2064461919 in both). */
  function deriveMeikyoshisuiSeed(master) {
    const r = streamFor(masterHash(master), 'music');
    r(); /* genre pick consumption, mirrors SeedWorks derive() */
    return (1 + Math.floor(r() * 4294967294)) >>> 0;
  }

  if (typeof window !== 'undefined') {
    window.__varelserLinkDerive = deriveMeikyoshisuiSeed;
  }
  /* Node / non-DOM context (syntax + derivation checks): stop here. */
  if (typeof document === 'undefined') return;

  /* ── Real-state accessors (all guarded; S etc. are global lexical
        bindings from the earlier classic scripts, not window props) ── */
  function getS() { try { return (typeof S !== 'undefined' && S) ? S : null; } catch (_) { return null; } }
  function chordLabel(s) {
    if (s && s.chord) return (s.chord.rootName || '') + (s.chord.quality || '') || null;
    const ci = document.getElementById('chordInput');
    return (ci && ci.value && ci.value.trim()) ? ci.value.trim() : null;
  }
  function isPlaying() {
    try { return (typeof MidiPreview !== 'undefined' && MidiPreview && typeof MidiPreview.isPlaying === 'function') ? !!MidiPreview.isPlaying() : false; }
    catch (_) { return false; }
  }
  function readState() {
    const s = getS();
    return {
      app: APP,
      type: 'state',
      ts: Date.now(),
      bpm: s ? (s.bpm != null ? s.bpm : null) : null,
      genre: s ? (s.genre != null ? s.genre : null) : null,
      scale: s ? (s.scale != null ? s.scale : null) : null,
      chord: chordLabel(s),
      seed: s ? ((s.seed >>> 0) || 0) : 0,
      seedLocked: s ? !!s.seedLocked : false,
      playing: isPlaying(),
    };
  }

  /* ── Seed application (see header: no dedicated setter exists) ─── */
  function applySeed(derived) {
    const seed = (derived >>> 0) || 1;
    const s = getS();
    if (s) {
      s.seed = seed;
      s.seedLocked = true; // SeedWorks snapshot semantics; see header
    }
    try { if (typeof rngSeed === 'function') rngSeed(seed); } catch (_) {}
    const seedInp = document.getElementById('seedInput');
    const seedVal = document.getElementById('seedVal');
    const lockBtn = document.getElementById('seedLockBtn');
    if (seedInp) {
      seedInp.value = seed;
      /* The app's own change handler (46-init-seed-ui.js) re-sets
         S.seed from the input; re-assert the lock state afterwards. */
      try { seedInp.dispatchEvent(new Event('change')); } catch (_) {}
      if (s) { s.seed = seed; s.seedLocked = true; }
      seedInp.style.display = 'inline-block';
    }
    if (seedVal) seedVal.textContent = seed;
    if (lockBtn) { lockBtn.classList.add('locked'); lockBtn.textContent = 'UNLOCK'; }
    return seed;
  }

  /* If GENERATE / sync is requested before any seed exists, mirror the
     app's own seed-lock button (46-init-seed-ui.js): rngSeed(0) then
     S.seed = rngState(). Only ever called from an explicit user action
     (the sync button, or a GENERATE click while Link is ON). */
  function ensureSeed() {
    const s = getS();
    if (s && (s.seed >>> 0)) return s.seed >>> 0;
    try {
      if (typeof rngSeed === 'function' && typeof rngState === 'function') {
        rngSeed(0);
        const v = rngState() >>> 0;
        if (s && v) {
          s.seed = v;
          const seedVal = document.getElementById('seedVal');
          if (seedVal) seedVal.textContent = v;
        }
        return v;
      }
    } catch (_) {}
    return s ? (s.seed >>> 0) : 0;
  }

  /* ── UI ─────────────────────────────────────────────────────────── */
  let els = null;
  function injectStyle() {
    if (document.getElementById('varelserLinkStyle')) return;
    const st = document.createElement('style');
    st.id = 'varelserLinkStyle';
    st.textContent =
      '#varelserLinkSec{font-family:\'Share Tech Mono\',monospace;margin:14px 0}' +
      '#varelserLinkSec.vl-fixed{position:fixed;right:12px;bottom:12px;z-index:9999;width:280px;max-width:calc(100vw - 24px);background:var(--panel2,#1a1a1f);border:1px solid var(--border,#333);border-radius:6px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,.5)}' +
      '.vl-head{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px}' +
      '.vl-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}' +
      '.vl-btn{background:transparent;color:var(--text,#e8e8e8);border:1px solid var(--border,#444);border-radius:6px;font-size:11px;padding:6px 10px;cursor:pointer;font-family:inherit}' +
      '.vl-btn:hover{border-color:#888}' +
      '.vl-status{font-size:10px;color:var(--text-dim,#888);line-height:1.7;white-space:pre-wrap;word-break:break-all}';
    document.head.appendChild(st);
  }

  function findHost() {
    /* 1) The DAW Link section created by 80-daw-link.js */
    const daw = document.getElementById('dawLinkSec');
    if (daw) return { host: daw, fixed: false };
    /* 2) Any small heading/section identifiable by id or text */
    const byId = document.querySelector('[id*="link" i], [id*="Link"]');
    if (byId) return { host: byId, fixed: false };
    const heads = document.querySelectorAll('h1,h2,h3,h4,div,span');
    for (const h of heads) {
      const t = (h.textContent || '').trim();
      if (t && t.length < 60 && /DAW Link|Varelser Link|Link/i.test(t)) {
        const sec = h.closest('section,div') || h.parentElement;
        if (sec) return { host: sec, fixed: false };
      }
    }
    return { host: document.body, fixed: true };
  }

  function buildUI() {
    injectStyle();
    const sec = document.createElement('div');
    sec.id = 'varelserLinkSec';
    sec.innerHTML =
      '<div class="vl-head">Varelser Link <span style="opacity:.6">SYNC</span></div>' +
      '<div class="vl-row"><label class="vl-status" style="color:var(--text,#e8e8e8)">' +
      '<input type="checkbox" id="varelserLinkToggle"> Varelser Link 送受信</label>' +
      '<button class="vl-btn" id="varelserLinkSyncBtn" type="button">シードを全アプリに同期</button></div>' +
      '<div class="vl-status" id="varelserLinkOwnStatus">Meikyoshisui: —</div>' +
      '<div class="vl-status" id="varelserLinkNoiseStatus">Noise: —</div>' +
      '<div class="vl-status" id="varelserLinkStatus"></div>';
    const found = findHost();
    if (found.fixed) sec.classList.add('vl-fixed');
    found.host.appendChild(sec);
    els = {
      sec,
      toggle: sec.querySelector('#varelserLinkToggle'),
      syncBtn: sec.querySelector('#varelserLinkSyncBtn'),
      own: sec.querySelector('#varelserLinkOwnStatus'),
      noise: sec.querySelector('#varelserLinkNoiseStatus'),
      status: sec.querySelector('#varelserLinkStatus'),
    };
    return els;
  }

  function setStatus(msg) { if (els && els.status) els.status.textContent = msg || ''; }
  function renderOwn(st) {
    if (!els || !els.own) return;
    els.own.textContent = 'Meikyoshisui: seed ' + (st.seed || '—') + (st.seedLocked ? ' (locked)' : '') +
      ' / ' + (st.genre || '—') + ' / ' + (st.scale || '—') + ' / ' + (st.chord || '—') +
      ' / ' + (st.bpm != null ? st.bpm + ' BPM' : '—') + ' / ' + (st.playing ? '再生中' : '停止中');
  }
  function renderNoise(msg) {
    if (!els || !els.noise) return;
    const master = (msg.master != null ? msg.master : (msg.master_seed != null ? msg.master_seed : (msg.seed != null ? msg.seed : '—')));
    let type = msg.noiseType || msg.typeA || msg.currentType || msg.presetName || msg.preset || null;
    if (!type && Array.isArray(msg.types) && msg.types.length) type = msg.types.join(' / ');
    if (!type && msg.layers && typeof msg.layers === 'object') {
      const a = msg.layers.A || msg.layers.a;
      if (a && a.type) type = a.type;
    }
    const playing = !!(msg.playing != null ? msg.playing : msg.isPlaying);
    els.noise.textContent = 'Noise: master ' + master + ' / ' + (type || '—') + ' / ' + (playing ? '再生中' : '停止中');
  }

  /* ── Link core ──────────────────────────────────────────────────── */
  let bc = null;
  let pollTimer = null;
  let lastFingerprint = '';
  let lastAppliedMaster = null;
  let lastAppliedSeed = 0;
  let lastAppliedAt = 0;
  let applying = false;
  let genSyncPending = false;

  function enabled() {
    try { return localStorage.getItem(LS_KEY) === '1'; } catch (_) { return false; }
  }
  function post(msg) {
    if (!bc) return;
    try { bc.postMessage(msg); } catch (_) {}
  }
  function sendState(force) {
    const st = readState();
    renderOwn(st);
    const fp = JSON.stringify([st.bpm, st.genre, st.scale, st.chord, st.seed, st.seedLocked, st.playing]);
    if (force || fp !== lastFingerprint || st.playing) {
      lastFingerprint = fp;
      post(st);
    }
  }
  function sendSeedSync(reason) {
    if (!bc) return false;
    const seed = ensureSeed();
    if (!seed) { setStatus('シード未生成 — 先に GENERATE してください'); return false; }
    post({ app: APP, type: 'seed-sync', ts: Date.now(), master: String(seed) });
    setStatus('シードを全アプリに同期しました: master ' + seed + (reason ? ' (' + reason + ')' : ''));
    return true;
  }


  /* ── Studio Console receiver (2026-11-16) ─────────────────────
     {app:'studio', type:'console', version:2, transport, bpm,
      targets:{meikyoshisui:{amount, bpm}}} を実パラメータに写像する:
       transport 'play'  -> MidiPreview.play() (GENERATE 済みで
                            ロードされている場合のみ鳴る)
       transport 'stop'  -> MidiPreview.stop()
       bpm               -> S.bpm + #bpm スライダー + 表示。ロード済み
                            プレビューは新 BPM で再ロードし、再生中
                            だった場合は再開する (範囲は本体仕様 18..140)
       amount (0..1)     -> MidiPreview.setChVol を全 16 チャンネルへ
                            (プレビュー音量として即時反映) */
  function getMP() { try { return (typeof MidiPreview !== 'undefined' && MidiPreview) ? MidiPreview : null; } catch (_) { return null; } }
  function applyStudioBpm(raw) {
    const s = getS(); if (!s) return;
    let v = Math.round(Number(raw));
    if (!Number.isFinite(v)) return;
    v = Math.max(18, Math.min(140, v));
    if (v === s.bpm) return;
    const mp = getMP();
    const wasPlaying = mp ? isPlaying() : false;
    s.bpm = v;
    const slider = document.getElementById('bpm');
    if (slider) slider.value = v;
    try { if (typeof refreshBpmDisplay === 'function') refreshBpmDisplay(); } catch (_) {}
    if (mp && s.midiData) {
      try { mp.load(s.midiData, v); if (wasPlaying) mp.play(); } catch (_) {}
    }
    lastFingerprint = ''; /* force the next poll to broadcast the new state */
  }
  function applyStudioConsole(msg) {
    const mp = getMP();
    const tgt = (msg.targets && msg.targets.meikyoshisui) || {};
    const bpm = (typeof tgt.bpm === 'number') ? tgt.bpm : (typeof msg.bpm === 'number' ? msg.bpm : null);
    if (bpm != null) applyStudioBpm(bpm);
    if (typeof tgt.amount === 'number' && Number.isFinite(tgt.amount) && mp && typeof mp.setChVol === 'function') {
      const a = Math.max(0, Math.min(1, tgt.amount));
      try { for (let ch = 0; ch < 16; ch++) mp.setChVol(ch, a); } catch (_) {}
    }
    if (msg.transport === 'play' && mp) {
      if (mp.getParsed && mp.getParsed()) { try { mp.play(); } catch (_) {} setStatus('Studio Console: ▶ 再生'); }
      else setStatus('Studio Console: ▶ — 先に GENERATE すると再生できます');
    } else if (msg.transport === 'stop' && mp) {
      try { mp.stop(); } catch (_) {}
      setStatus('Studio Console: ■ 停止');
    } else if (msg.transport) {
      setStatus('Studio Console: ' + msg.transport + ' (bpm ' + (bpm != null ? bpm : '—') + ')');
    }
    sendState(true);
  }

  function onMessage(ev) {
    const msg = ev && ev.data;
    if (!msg || typeof msg !== 'object') return;
    if (msg.app === APP) return; /* ignore own */
    if (msg.type === 'seed-sync' && msg.master != null) {
      const master = String(msg.master);
      const derived = deriveMeikyoshisuiSeed(master);
      /* Loop guard: applying never sends a seed-sync (sendState only
         sends type:'state'), and an identical master re-delivered
         within 1s — or one that resolves to the seed already held —
         is not re-applied. */
      if (applying) return;
      if (master === lastAppliedMaster && derived === lastAppliedSeed && (Date.now() - lastAppliedAt) < 1000) return;
      const s = getS();
      if (s && derived === (s.seed >>> 0) && master === lastAppliedMaster) return;
      applying = true;
      try {
        applySeed(derived);
        lastAppliedMaster = master;
        lastAppliedSeed = derived;
        lastAppliedAt = Date.now();
        setStatus('seed-sync 受信 (' + (msg.app || '?') + '): master ' + master + ' → Meikyoshisui seed ' + derived + ' (locked)');
        lastFingerprint = ''; /* force the next poll to broadcast the new state */
        sendState(true);
      } finally { applying = false; }
      return;
    }
    if (msg.app === 'studio' && msg.type === 'console') { applyStudioConsole(msg); return; }
    if (msg.type === 'state' && (msg.app === 'noise' || msg.app === 'Noise')) {
      renderNoise(msg);
    }
  }

  function start() {
    if (bc || typeof BroadcastChannel === 'undefined') {
      if (typeof BroadcastChannel === 'undefined') setStatus('BroadcastChannel 未対応ブラウザです');
      return;
    }
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.addEventListener('message', onMessage);
    lastFingerprint = '';
    sendState(true);
    pollTimer = setInterval(() => sendState(false), 500);
    setStatus('Varelser Link ON — varelser-link-v1 に接続');
  }
  function stop() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (bc) { try { bc.removeEventListener('message', onMessage); } catch (_) {} try { bc.close(); } catch (_) {} bc = null; }
    setStatus('Varelser Link OFF');
  }

  /* GENERATE hook — click listener only (see header for why
     window.doGenerate is NOT wrapped). Waits until #btnGen loses its
     'busy' class (doGenerateCore removes it when generation ends),
     then syncs the resulting — or, when locked, the locked — seed. */
  function hookGenerate() {
    const hook = (btn) => {
      if (!btn || btn.dataset.varelserLinkHooked) return;
      btn.dataset.varelserLinkHooked = '1';
      btn.addEventListener('click', () => {
        if (!bc || genSyncPending) return;
        genSyncPending = true;
        const started = Date.now();
        const watcher = setInterval(() => {
          const busy = btn.classList && btn.classList.contains('busy');
          if ((!busy && Date.now() - started > 400) || Date.now() - started > 10000) {
            clearInterval(watcher);
            genSyncPending = false;
            if (bc) sendSeedSync('GENERATE');
          }
        }, 250);
      });
    };
    hook(document.getElementById('btnGen'));
    hook(document.getElementById('btnGenAB'));
  }

  function init() {
    buildUI();
    if (!els) return;
    renderOwn(readState());
    els.toggle.checked = enabled();
    els.toggle.addEventListener('change', () => {
      try { localStorage.setItem(LS_KEY, els.toggle.checked ? '1' : '0'); } catch (_) {}
      if (els.toggle.checked) start(); else stop();
    });
    els.syncBtn.addEventListener('click', () => {
      if (!bc) { setStatus('先に「Varelser Link 送受信」を ON にしてください'); return; }
      sendSeedSync('button');
    });
    hookGenerate();
    if (els.toggle.checked) start();
    if (typeof window !== 'undefined') {
      window.__varelserLink = {
        derive: deriveMeikyoshisuiSeed,
        readState, sendState, sendSeedSync, applySeed,
        start, stop,
        get channel() { return bc; },
      };
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
