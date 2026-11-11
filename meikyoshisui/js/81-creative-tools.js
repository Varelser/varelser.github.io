/* 81-creative-tools.js — 創作支援 (2026-11-11)
   · おまかせ生成 / 突然変異: パラメータを妥当な範囲で振り直して生成する。
     操作は本物の input イベント経由なので、状態は通常の操作と同一に保たれる。
   · 生成ヒストリー: 生成ごとに (StatePersist スナップショット + シード) を
     最大8件保持し、ワンクリックで設定を復元して再生成する (シード再現性で
     同じ曲が戻る)。スナップショットは一時スロット経由で抜き取り、ユーザーの
     スロット一覧には残さない。
   · MIDIドロップ解析: .mid を落とすと小節ごとにコードを推定し、コード進行
     として取り込む。推定キーも表示する。
   生成ロジックには触れない。 */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  function status(msg, ok) {
    const el = $('createStatus');
    if (el) { el.textContent = msg; el.style.color = ok === false ? '#f87171' : ''; }
  }
  let rngState = (Date.now() % 2147483646) + 1;
  function rnd() { rngState = (rngState * 48271) % 2147483647; return rngState / 2147483647; }
  function setSlider(el, v) {
    el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function allSliders() { return [...document.querySelectorAll('input[type="range"]')]; }

  const CHORD_POOL = ['Cmaj7', 'Dm9', 'G7', 'Am7', 'Fmaj7', 'Em7', 'Bm7b5', 'C#dim7', 'Ebmaj9', 'A7sus4', 'Bbmaj7', 'D7', 'Gmaj9', 'Cm9', 'F#m7b5', 'E7'];

  function randomize() {
    rngState = (Date.now() % 2147483646) + 1;
    for (const el of allSliders()) {
      if (rnd() < 0.5) continue;
      const min = parseFloat(el.min || 0), max = parseFloat(el.max || 100);
      if (!(max > min)) continue;
      const pad = (max - min) * 0.12;
      setSlider(el, min + pad + rnd() * (max - min - pad * 2));
    }
    const chord = CHORD_POOL[Math.floor(rnd() * CHORD_POOL.length)];
    const ci = $('chordInput');
    if (ci) { ci.value = chord; ci.dispatchEvent(new Event('input', { bubbles: true })); }
    if (typeof S !== 'undefined' && !S.seedLocked) S.seed = 100000 + Math.floor(rnd() * 899999);
    status('おまかせ設定を適用しました (コード: ' + chord + ') — 生成します');
    if (typeof doGenerate === 'function') doGenerate();
  }
  function mutate() {
    rngState = (Date.now() % 2147483646) + 1;
    let n = 0;
    for (const el of allSliders()) {
      if (rnd() >= 0.25) continue;
      const min = parseFloat(el.min || 0), max = parseFloat(el.max || 100);
      const cur = parseFloat(el.value || 0);
      if (!(max > min) || isNaN(cur)) continue;
      const nv = Math.max(min, Math.min(max, cur + (rnd() * 2 - 1) * (max - min) * 0.12));
      setSlider(el, nv); n++;
    }
    if (typeof S !== 'undefined' && !S.seedLocked) S.seed = 100000 + Math.floor(rnd() * 899999);
    status(n + ' 個のパラメータを変異させました — 生成します');
    if (typeof doGenerate === 'function') doGenerate();
  }

  /* ── 生成ヒストリー ── */
  const HIST_KEY = 'meikyoshisui_gen_history';
  const TMP_SLOT = '__histmp__';
  const RAW_KEY = 'meikyoshisui_v25_' + TMP_SLOT;
  let hist = [];
  try { hist = JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); } catch (_) { hist = []; }
  function persistHist() { try { localStorage.setItem(HIST_KEY, JSON.stringify(hist)); } catch (_) {} }
  function captureHistory() {
    if (typeof StatePersist === 'undefined' || typeof S === 'undefined' || !S.midiData) return;
    const label = ($('chordInput') && $('chordInput').value) || (S.chord ? S.chord.rootName + (S.chord.quality || '') : '?');
    if (hist.length && hist[0].seed === S.seed && hist[0].label === label) return;
    if (!StatePersist.save(TMP_SLOT)) return;
    const json = localStorage.getItem(RAW_KEY);
    StatePersist.remove(TMP_SLOT);
    if (!json) return;
    hist.unshift({ at: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), seed: S.seed, label, json });
    hist = hist.slice(0, 8);
    persistHist();
    renderHist();
  }
  function restoreHist(i) {
    const e = hist[i];
    if (!e) return;
    try {
      localStorage.setItem(RAW_KEY, e.json);
      StatePersist.load(TMP_SLOT);
      StatePersist.remove(TMP_SLOT);
      status('ヒストリーを復元しました (seed ' + e.seed + ') — 再生成します');
      /* 生成コアは seedLocked でないとシードを引き直すため、復元の間だけ
         ロックして決定的に再生成し、終わったら元のロック状態へ戻す */
      const keepLock = S.seedLocked;
      S.seedLocked = true;
      setTimeout(() => { if (typeof doGenerate === 'function') doGenerate(); }, 350);
      setTimeout(() => { S.seedLocked = keepLock; }, 1600);
    } catch (err) { status('復元に失敗: ' + (err && err.message || err), false); }
  }
  function renderHist() {
    const box = $('histRow');
    if (!box) return;
    box.innerHTML = '';
    if (!hist.length) { box.innerHTML = '<span class="crt-note">生成すると、ここに履歴が残ります</span>'; return; }
    hist.forEach((e, i) => {
      const b = document.createElement('button');
      b.className = 'crt-btn'; b.type = 'button';
      b.textContent = e.at + ' · ' + e.label + ' · #' + e.seed;
      b.title = 'この設定を復元して再生成';
      b.addEventListener('click', () => restoreHist(i));
      box.appendChild(b);
    });
  }

  /* ── MIDIドロップ解析 ── */
  const ROOT_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const TEMPLATES = [['', [0, 4, 7]], ['m', [0, 3, 7]], ['maj7', [0, 4, 7, 11]], ['m7', [0, 3, 7, 10]], ['7', [0, 4, 7, 10]], ['6', [0, 4, 7, 9]], ['m6', [0, 3, 7, 9]], ['sus4', [0, 5, 7]], ['dim', [0, 3, 6]], ['dim7', [0, 3, 6, 9]], ['aug', [0, 4, 8]], ['m7b5', [0, 3, 6, 10]]];
  const KS_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const KS_MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  function analyzeMidi(bytes) {
    const D = window.__MEIKY_DAW__;
    if (!D) throw new Error('DAW モジュール (80) が必要です');
    const smf = D.parseSMF(bytes);
    const open = new Map();
    const notes = [];
    for (const e of smf.events) {
      const st = e.bytes[0], ch = st & 0x0F, hi = st & 0xF0;
      if (hi === 0x90 && e.bytes[2] > 0) open.set(ch + ':' + e.bytes[1], { tick: e.tick, note: e.bytes[1] });
      else if (hi === 0x80 || (hi === 0x90 && e.bytes[2] === 0)) {
        const k = ch + ':' + e.bytes[1];
        if (open.has(k)) { const o = open.get(k); notes.push({ note: o.note, start: o.tick, dur: Math.max(1, e.tick - o.tick) }); open.delete(k); }
      }
    }
    if (!notes.length) throw new Error('ノートが見つかりませんでした');
    const barTicks = smf.division * 4;
    const lastTick = Math.max(...notes.map(n => n.start + n.dur));
    const numBars = Math.min(64, Math.max(1, Math.ceil(lastTick / barTicks)));
    const totalPc = new Array(12).fill(0);
    const prog = [];
    for (let bar = 0; bar < numBars; bar++) {
      const w = new Array(12).fill(0);
      let bassPc = -1, bassNote = 999;
      for (const n of notes) {
        if (n.start < bar * barTicks || n.start >= (bar + 1) * barTicks) continue;
        w[n.note % 12] += n.dur; totalPc[n.note % 12] += n.dur;
        if (n.note < bassNote) { bassNote = n.note; bassPc = n.note % 12; }
      }
      if (!w.some(v => v > 0)) { prog.push(null); continue; }
      let best = null;
      for (let root = 0; root < 12; root++) {
        for (const [q, tmpl] of TEMPLATES) {
          let score = 0;
          for (let pc = 0; pc < 12; pc++) {
            const rel = (pc - root + 12) % 12;
            score += tmpl.includes(rel) ? w[pc] : -0.5 * w[pc];
          }
          if (bassPc === root) score += w[bassPc] * 1.5;
          if (!best || score > best.score) best = { score, name: ROOT_NAMES[root] + q };
        }
      }
      prog.push(best.name);
    }
    // 連続する同コードをまとめる
    const entries = [];
    for (const name of prog) {
      if (!name) continue;
      const last = entries[entries.length - 1];
      if (last && last.name === name) last.bars++;
      else entries.push({ name, bars: 1 });
    }
    // キー推定 (Krumhansl–Schmuckler)
    let keyBest = null;
    for (let root = 0; root < 12; root++) {
      for (const [mode, prof] of [['major', KS_MAJOR], ['minor', KS_MINOR]]) {
        let dot = 0, a = 0, b = 0;
        for (let pc = 0; pc < 12; pc++) { const v = prof[(pc - root + 12) % 12]; dot += v * totalPc[pc]; a += v * v; b += totalPc[pc] * totalPc[pc]; }
        const corr = dot / (Math.sqrt(a * b) || 1);
        if (!keyBest || corr > keyBest.corr) keyBest = { corr, name: ROOT_NAMES[root] + (mode === 'major' ? ' major' : ' minor') };
      }
    }
    return { entries, key: keyBest.name, bars: numBars, noteCount: notes.length };
  }
  function applyAnalysis(res) {
    if (typeof PROG_STATE === 'undefined' || typeof parseChord !== 'function') throw new Error('進行エンジンが見つかりません');
    PROG_STATE.prog = res.entries.map(e => ({ chord: parseChord(e.name), bars: e.bars }));
    PROG_STATE.enabled = true;
    if (typeof window.refreshProgUI === 'function') window.refreshProgUI();
  }

  /* ── パネル ── */
  function init() {
    if (!document.getElementById('crtStyle')) {
      const st = document.createElement('style');
      st.id = 'crtStyle';
      st.textContent = '.crt-head{font-size:11px;font-weight:700;letter-spacing:3px;margin:26px 0 10px;text-transform:uppercase}'
        + '.crt-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}'
        + '.crt-btn{flex:none;background:transparent;color:var(--text,#e8e8e8);border:1px solid var(--border,#444);border-radius:6px;font-size:11px;padding:6px 10px;cursor:pointer}'
        + '.crt-btn:hover{border-color:#888}'
        + '.crt-note{font-size:10px;color:var(--text-dim,#888);line-height:1.7}'
        + '#createStatus{font-size:11px;margin-top:8px;white-space:pre-wrap}';
      document.head.appendChild(st);
    }
    const sec = document.createElement('div');
    sec.id = 'createSec';
    sec.innerHTML = `
      <div class="crt-head">Create <span class="badge">DISCOVER</span></div>
      <div class="crt-row">
        <button class="crt-btn" id="btnOmakase" type="button">おまかせ生成</button>
        <button class="crt-btn" id="btnMutate" type="button">突然変異</button>
        <span class="crt-note">おまかせ = パラメータの約半分＋コード＋シードを振り直し。変異 = 今の設定から約1/4を少しだけ動かす。どちらも生成まで行います。.mid ファイルをページへ落とすとコード進行を解析して取り込みます。</span>
      </div>
      <div class="crt-row" id="histRow"></div>
      <div id="createStatus"></div>`;
    const anchor = $('dawLinkSec') || $('aiBridgeSec') || $('theoryPackSec');
    if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(sec, anchor.nextSibling);
    else document.body.appendChild(sec);

    $('btnOmakase').addEventListener('click', randomize);
    $('btnMutate').addEventListener('click', mutate);
    renderHist();

    const genBtn = $('btnGen');
    if (genBtn) genBtn.addEventListener('click', () => setTimeout(captureHistory, 1100));

    document.addEventListener('drop', async ev => {
      const files = [...((ev.dataTransfer && ev.dataTransfer.files) || [])].filter(f => /\.midi?$/i.test(f.name));
      if (!files.length) return;
      try {
        const buf = new Uint8Array(await files[0].arrayBuffer());
        const res = analyzeMidi(buf);
        applyAnalysis(res);
        status('MIDI解析: ' + res.noteCount + ' 音 / ' + res.bars + ' 小節 → 進行 ' + res.entries.map(e => e.name + '×' + e.bars).join(' ') + ' / 推定キー ' + res.key + ' (Chord Progression に反映しました)');
      } catch (e) { status('MIDI解析に失敗: ' + (e && e.message || e), false); }
    });

    window.__MEIKY_CREATE__ = { randomize, mutate, analyzeMidi, getHistory: () => hist.map(h => ({ at: h.at, seed: h.seed, label: h.label })), restoreHist };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
