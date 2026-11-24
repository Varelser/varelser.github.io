/* ═══════════════════════════════════════════════════════════════
   105-studio-features.js — Preview Synth FX, A/B Tuning Compare,
   Seamless & A-B Loop, Section×Layer Arranger, and Layer Freeze
   (2026-11-25)
   Connects exclusively to MidiPreview extension APIs in js/104.
   ═══════════════════════════════════════════════════════════════ */
(() => {
'use strict';

if (typeof document === 'undefined' || typeof MidiPreview === 'undefined') return;
if (typeof MidiPreview.setAmbientFx !== 'function') return;

const CHANNELS = [
  { ch: 0, name: 'Drone'  },
  { ch: 1, name: 'Pad'    },
  { ch: 2, name: 'Arp'    },
  { ch: 3, name: 'Melody' },
  { ch: 4, name: 'Bass'   },
  { ch: 5, name: 'Over'   },
  { ch: 6, name: 'Tex'    },
  { ch: 7, name: 'Lead'   },
  { ch: 8, name: 'Markov' },
  { ch: 9, name: 'L-Sys'  },
];

const CSS = `
#sfToolbar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:7px 10px;margin-top:6px;background:var(--s2,rgba(20,20,25,.85));border:1px solid var(--border,#2d2d35);border-radius:6px;font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text,#e8e8ec);}
#sfToolbar .sf-group{display:inline-flex;align-items:center;gap:5px;padding-right:8px;border-right:1px solid var(--border,#2d2d35);}
#sfToolbar .sf-group:last-child{border-right:none;padding-right:0;}
#sfToolbar .sf-btn{background:transparent;color:var(--text-dim,#9a9aa4);border:1px solid var(--border,#383842);border-radius:4px;padding:3px 7px;font-family:inherit;font-size:10px;letter-spacing:.06em;cursor:pointer;transition:border-color .15s,color .15s,background .15s;}
#sfToolbar .sf-btn:hover{border-color:#777;color:var(--text,#fff);}
#sfToolbar .sf-btn.on{background:rgba(232,232,236,.12);border-color:rgba(232,232,236,.55);color:#fff;}
#sfToolbar .sf-btn.accent{background:rgba(0,229,255,.12);border-color:rgba(0,229,255,.55);color:#7ef4ff;}
#sfToolbar .sf-lbl{color:var(--text-dim,#8c8c96);font-size:9px;letter-spacing:.08em;}
#sfToolbar .sf-rng{width:64px;accent-color:#d8d8e0;cursor:pointer;}
#sfToolbar .sf-val{min-width:34px;color:var(--text,#d8d8e0);font-size:9px;}
#sfToolbar .sf-badge{font-size:9px;padding:2px 5px;border-radius:3px;background:rgba(255,255,255,.06);color:var(--text-dim,#aaa);}
#sfArranger{display:none;margin-top:6px;padding:10px;background:var(--s2,rgba(16,16,20,.92));border:1px solid var(--border,#2d2d35);border-radius:6px;font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text,#e8e8ec);}
#sfArranger.open{display:block;}
.sf-arr-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;margin-bottom:8px;}
.sf-arr-title{letter-spacing:.12em;font-size:10px;color:var(--text,#e8e8ec);}
.sf-arr-actions{display:flex;flex-wrap:wrap;gap:4px;}
.sf-grid{width:100%;border-collapse:collapse;table-layout:fixed;}
.sf-grid th,.sf-grid td{border:1px solid var(--border,#26262e);padding:3px 4px;text-align:center;}
.sf-grid th{font-size:9px;color:var(--text-dim,#8e8e98);font-weight:400;letter-spacing:.08em;}
.sf-grid th.cur{color:#7ef4ff;border-bottom-color:rgba(0,229,255,.6);background:rgba(0,229,255,.08);}
.sf-grid td.ch-name{text-align:left;padding-left:6px;width:72px;color:var(--text,#d8d8e0);font-size:9.5px;white-space:nowrap;}
.sf-grid td.ch-frz{width:46px;}
.sf-frz-btn{width:100%;background:transparent;color:var(--text-dim,#7e7e88);border:1px solid var(--border,#32323c);border-radius:3px;padding:2px 0;font-family:inherit;font-size:9px;cursor:pointer;}
.sf-frz-btn.on{background:rgba(0,229,255,.16);border-color:rgba(0,229,255,.65);color:#7ef4ff;}
.sf-cell{cursor:pointer;user-select:none;transition:background .12s;font-size:9px;}
.sf-cell.active{background:rgba(232,232,236,.16);color:#fff;}
.sf-cell.active.cur{background:rgba(0,229,255,.22);color:#fff;}
.sf-cell.muted{background:transparent;color:var(--text-dim,#55555f);}
.sf-cell.muted.cur{background:rgba(0,229,255,.05);}
.sf-arr-note{margin-top:6px;font-size:9px;color:var(--text-dim,#888892);line-height:1.5;}
`;

function fmtTime(sec) {
  if (sec == null || !isFinite(sec)) return '—';
  const s = Math.max(0, Math.floor(sec));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function fmtHz(hz) {
  return hz >= 1000 ? (hz / 1000).toFixed(1) + 'k' : Math.round(hz) + 'Hz';
}

function mount() {
  const panel = document.getElementById('midiPreviewPanel');
  if (!panel || document.getElementById('sfToolbar')) return;

  if (!document.getElementById('sfStudioStyle')) {
    const st = document.createElement('style');
    st.id = 'sfStudioStyle';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ── Toolbar ── */
  const bar = document.createElement('div');
  bar.id = 'sfToolbar';
  bar.innerHTML = ''
    + '<div class="sf-group">'
    + '  <button type="button" class="sf-btn on" id="sfFxToggle" title="Ambient IR Reverb + Warmth Filter + Unison">AMBIENT FX</button>'
    + '  <span class="sf-lbl">REV</span><input type="range" class="sf-rng" id="sfReverbWet" min="0" max="85" step="1" value="35"><span class="sf-val" id="sfReverbWetV">35%</span>'
    + '  <span class="sf-lbl">LPF</span><input type="range" class="sf-rng" id="sfFilterHz" min="400" max="18000" step="100" value="4200"><span class="sf-val" id="sfFilterHzV">4.2k</span>'
    + '  <button type="button" class="sf-btn on" id="sfUnisonToggle" title="Drone/Pad 微細デチューン・ユニゾン">UNI</button>'
    + '</div>'
    + '<div class="sf-group">'
    + '  <button type="button" class="sf-btn accent" id="sfTuningToggle" title="純正律 / Scala 微分音 と 12平均律 を再生中に聴き比べ">TUNING: MICRO</button>'
    + '  <span class="sf-badge" id="sfPbBadge">PB: 0</span>'
    + '</div>'
    + '<div class="sf-group">'
    + '  <button type="button" class="sf-btn" id="sfLoopToggle" title="シームレス・ループ再生">LOOP</button>'
    + '  <button type="button" class="sf-btn" id="sfLoopA" title="現在位置をループ開始点 A に設定">A</button>'
    + '  <button type="button" class="sf-btn" id="sfLoopB" title="現在位置をループ終了点 B に設定">B</button>'
    + '  <button type="button" class="sf-btn" id="sfLoopClr" title="A-B 区間をクリア">×AB</button>'
    + '  <span class="sf-badge" id="sfLoopBadge">FULL</span>'
    + '</div>'
    + '<div class="sf-group">'
    + '  <button type="button" class="sf-btn" id="sfArrToggle" title="小節別レイヤー Mute マトリクス & Layer Freeze">ARRANGER / FREEZE</button>'
    + '  <span class="sf-badge" id="sfFrzBadge" style="display:none;">❄ 0</span>'
    + '</div>';

  /* ── Arranger / Freeze Drawer ── */
  const arr = document.createElement('div');
  arr.id = 'sfArranger';
  arr.innerHTML = ''
    + '<div class="sf-arr-head">'
    + '  <span class="sf-arr-title">SECTION × LAYER ARRANGER &amp; LAYER FREEZE</span>'
    + '  <div class="sf-arr-actions">'
    + '    <button type="button" class="sf-btn" id="sfSec4">4 SEC</button>'
    + '    <button type="button" class="sf-btn" id="sfSec8">8 SEC</button>'
    + '    <button type="button" class="sf-btn" id="sfPresetBuildup">BUILD-UP</button>'
    + '    <button type="button" class="sf-btn" id="sfPresetSparse">SPARSE</button>'
    + '    <button type="button" class="sf-btn" id="sfPresetAllOn">ALL ON</button>'
    + '  </div>'
    + '</div>'
    + '<div id="sfGridWrap"></div>'
    + '<div class="sf-arr-note">セルをクリックでセクション別のミュート切替。❄ FREEZE を ON にしたレイヤーは、次回の GENERATE / おまかせ生成でも現在の演奏を維持します。</div>';

  const mixer = document.getElementById('prevMixer');
  if (mixer && mixer.parentNode === panel) {
    panel.insertBefore(bar, mixer);
    panel.insertBefore(arr, mixer);
  } else {
    panel.appendChild(bar);
    panel.appendChild(arr);
  }

  /* ── Bind Controls ── */
  const $ = id => document.getElementById(id);

  function syncToolbar() {
    const fx = MidiPreview.getAmbientFx();
    $('sfFxToggle').classList.toggle('on', !!fx.enabled);
    $('sfUnisonToggle').classList.toggle('on', !!fx.unison && !!fx.enabled);
    $('sfReverbWet').value = Math.round(fx.reverbWet * 100);
    $('sfReverbWetV').textContent = Math.round(fx.reverbWet * 100) + '%';
    $('sfFilterHz').value = Math.round(fx.filterHz);
    $('sfFilterHzV').textContent = fmtHz(fx.filterHz);

    const mode = MidiPreview.getTuningCompare();
    const tBtn = $('sfTuningToggle');
    tBtn.textContent = mode === '12tet' ? 'TUNING: 12-TET' : 'TUNING: MICRO';
    tBtn.classList.toggle('accent', mode === 'micro');
    tBtn.classList.toggle('on', mode === '12tet');

    const parsed = MidiPreview.getParsed ? MidiPreview.getParsed() : null;
    const pbCount = parsed && parsed.pitchBends ? parsed.pitchBends.length : 0;
    $('sfPbBadge').textContent = 'PB: ' + pbCount;

    const lp = MidiPreview.getLoop();
    $('sfLoopToggle').classList.toggle('on', !!lp.enabled);
    $('sfLoopA').classList.toggle('accent', lp.startSec != null);
    $('sfLoopB').classList.toggle('accent', lp.endSec != null);
    if (lp.startSec != null || lp.endSec != null) {
      $('sfLoopBadge').textContent = fmtTime(lp.startSec || 0) + '–' + (lp.endSec != null ? fmtTime(lp.endSec) : 'END');
    } else {
      $('sfLoopBadge').textContent = lp.enabled ? 'LOOP' : 'FULL';
    }

    const frz = MidiPreview.getFrozenLayers();
    const fb = $('sfFrzBadge');
    if (frz.length) {
      fb.style.display = '';
      fb.textContent = '❄ ' + frz.length;
    } else {
      fb.style.display = 'none';
    }
  }

  function renderGrid() {
    const wrap = $('sfGridWrap');
    if (!wrap) return;
    const st = MidiPreview.getArrangerState();
    const frozen = new Set(MidiPreview.getFrozenLayers());
    const n = st.sections;
    $('sfSec4').classList.toggle('on', n === 4);
    $('sfSec8').classList.toggle('on', n === 8);

    let html = '<table class="sf-grid"><thead><tr><th>LAYER</th><th>FRZ</th>';
    for (let s = 0; s < n; s++) {
      html += '<th data-sec="' + s + '"' + (s === st.currentSection ? ' class="cur"' : '') + '>S' + (s + 1) + '</th>';
    }
    html += '</tr></thead><tbody>';
    for (let i = 0; i < CHANNELS.length; i++) {
      const c = CHANNELS[i];
      const isF = frozen.has(c.ch);
      html += '<tr><td class="ch-name">' + c.name + '</td>';
      html += '<td class="ch-frz"><button type="button" class="sf-frz-btn' + (isF ? ' on' : '') + '" data-frz-ch="' + c.ch + '">' + (isF ? '❄ ON' : '❄') + '</button></td>';
      for (let s = 0; s < n; s++) {
        const muted = !!st.muted[s + ':' + c.ch];
        const cls = 'sf-cell ' + (muted ? 'muted' : 'active') + (s === st.currentSection ? ' cur' : '');
        html += '<td class="' + cls + '" data-sec="' + s + '" data-ch="' + c.ch + '">' + (muted ? '·' : '●') + '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    wrap.innerHTML = html;
  }

  function highlightCurrentSection() {
    if (!arr.classList.contains('open')) return;
    const st = MidiPreview.getArrangerState();
    arr.querySelectorAll('[data-sec]').forEach(el => {
      el.classList.toggle('cur', parseInt(el.dataset.sec, 10) === st.currentSection);
    });
  }

  $('sfFxToggle').addEventListener('click', () => {
    const fx = MidiPreview.getAmbientFx();
    MidiPreview.setAmbientFx({ enabled: !fx.enabled });
  });
  $('sfUnisonToggle').addEventListener('click', () => {
    const fx = MidiPreview.getAmbientFx();
    MidiPreview.setAmbientFx({ unison: !fx.unison });
  });
  $('sfReverbWet').addEventListener('input', e => {
    MidiPreview.setAmbientFx({ reverbWet: parseInt(e.target.value, 10) / 100 });
  });
  $('sfFilterHz').addEventListener('input', e => {
    MidiPreview.setAmbientFx({ filterHz: parseInt(e.target.value, 10) });
  });

  $('sfTuningToggle').addEventListener('click', () => {
    MidiPreview.setTuningCompare(MidiPreview.getTuningCompare() === 'micro' ? '12tet' : 'micro');
  });

  $('sfLoopToggle').addEventListener('click', () => {
    const lp = MidiPreview.getLoop();
    MidiPreview.setLoop({ enabled: !lp.enabled });
  });
  $('sfLoopA').addEventListener('click', () => {
    const cur = MidiPreview.getElapsed ? MidiPreview.getElapsed() : 0;
    MidiPreview.setLoop({ enabled: true, startSec: cur });
  });
  $('sfLoopB').addEventListener('click', () => {
    const cur = MidiPreview.getElapsed ? MidiPreview.getElapsed() : 0;
    const lp = MidiPreview.getLoop();
    if (lp.startSec != null && cur <= lp.startSec + 0.25) return;
    MidiPreview.setLoop({ enabled: true, endSec: cur });
  });
  $('sfLoopClr').addEventListener('click', () => {
    MidiPreview.setLoop({ startSec: null, endSec: null });
  });

  $('sfArrToggle').addEventListener('click', () => {
    const open = arr.classList.toggle('open');
    $('sfArrToggle').classList.toggle('on', open);
    if (open) renderGrid();
  });

  $('sfSec4').addEventListener('click', () => MidiPreview.setSectionCount(4));
  $('sfSec8').addEventListener('click', () => MidiPreview.setSectionCount(8));
  $('sfPresetAllOn').addEventListener('click', () => MidiPreview.clearSectionMutes());
  $('sfPresetBuildup').addEventListener('click', () => {
    MidiPreview.clearSectionMutes();
    const n = MidiPreview.getArrangerState().sections;
    /* Intro: Drone+Pad, Mid: +Bass+Arp, Climax: All, Outro: Drone+Pad */
    for (let s = 0; s < n; s++) {
      const ratio = s / Math.max(1, n - 1);
      for (let i = 0; i < CHANNELS.length; i++) {
        const ch = CHANNELS[i].ch;
        let mute = false;
        if (s === 0 && ch >= 2) mute = true;
        else if (ratio < 0.4 && ch >= 5) mute = true;
        else if (s === n - 1 && n >= 4 && ch >= 2 && ch !== 5) mute = true;
        if (mute) MidiPreview.setSectionMute(s, ch, true);
      }
    }
  });
  $('sfPresetSparse').addEventListener('click', () => {
    MidiPreview.clearSectionMutes();
    const n = MidiPreview.getArrangerState().sections;
    for (let s = 0; s < n; s++) {
      for (let i = 0; i < CHANNELS.length; i++) {
        const ch = CHANNELS[i].ch;
        if (ch >= 2 && ((s + ch) % 2 === 1)) MidiPreview.setSectionMute(s, ch, true);
      }
    }
  });

  arr.addEventListener('click', ev => {
    const frzBtn = ev.target.closest('[data-frz-ch]');
    if (frzBtn) {
      const ch = parseInt(frzBtn.dataset.frzCh, 10);
      const isF = MidiPreview.getFrozenLayers().includes(ch);
      MidiPreview.setLayerFreeze(ch, !isF);
      return;
    }
    const cell = ev.target.closest('.sf-cell');
    if (cell) {
      const s = parseInt(cell.dataset.sec, 10);
      const ch = parseInt(cell.dataset.ch, 10);
      const muted = !!MidiPreview.getArrangerState().muted[s + ':' + ch];
      MidiPreview.setSectionMute(s, ch, !muted);
    }
  });

  MidiPreview.onUpdate(kind => {
    if (kind === 'tick') {
      highlightCurrentSection();
      return;
    }
    syncToolbar();
    if (arr.classList.contains('open')) renderGrid();
  });

  syncToolbar();
  window.__MEIKY_STUDIO_FEATURES__ = { version: '1.0-20261125', syncToolbar, renderGrid };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mount, 80));
else setTimeout(mount, 80);
})();
