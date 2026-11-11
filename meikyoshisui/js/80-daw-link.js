/* 80-daw-link.js — DAW 連携 (2026-11-11)
   · ライブ送信: 生成済み MIDI を WebMIDI 出力へ実時間で流す。DAW 側で
     仮想MIDIポート (macOS: IACドライバ / Windows: loopMIDI 等) を入力に
     録音待機すれば、そのまま DAW のトラックに取り込める。
     ピッチベンドや CC もファイルの内容そのままで送る (微分音も保持)。
   · MIDI クロック: 任意で Start / Clock (24PPQN) / Stop を送り、DAW と同期。
   · DAW強化MIDI: コード名マーカー (FF06) のトラックを足した .mid を書き出す。
     通常の書き出し (トラック名・テンポ・セクションマーカー入り) は従来通り。
   生成ロジックには触れない。対応DAWの手順は docs/DAW.md。 */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  function status(msg, ok) {
    const el = $('dawStatus');
    if (el) { el.textContent = msg; el.style.color = ok === false ? '#f87171' : ''; }
  }

  /* ── SMF パース (再生用: チャンネルイベント + テンポマップ) ── */
  function parseSMF(bytes) {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let p = 0;
    const str = n => { let s = ''; for (let i = 0; i < n; i++) s += String.fromCharCode(u8[p++]); return s; };
    const u32 = () => (u8[p++] << 24) + (u8[p++] << 16) + (u8[p++] << 8) + u8[p++];
    const u16 = () => (u8[p++] << 8) + u8[p++];
    if (str(4) !== 'MThd') throw new Error('MIDIファイルではありません');
    const hlen = u32();
    const format = u16(), ntrks = u16(), division = u16();
    p += hlen - 6;
    if (division & 0x8000) throw new Error('SMPTE形式は未対応です');
    const events = [];   // {tick, bytes:[..]} チャンネルメッセージのみ
    const tempos = [];   // {tick, us}
    for (let t = 0; t < ntrks; t++) {
      if (str(4) !== 'MTrk') break;
      const len = u32(); const end = p + len;
      let tick = 0, running = 0;
      while (p < end) {
        let delta = 0, b;
        do { b = u8[p++]; delta = (delta << 7) | (b & 0x7F); } while (b & 0x80);
        tick += delta;
        let statusByte = u8[p];
        if (statusByte & 0x80) { running = statusByte; p++; } else statusByte = running;
        if (statusByte === 0xFF) {
          const type = u8[p++];
          let mlen = 0; do { b = u8[p++]; mlen = (mlen << 7) | (b & 0x7F); } while (b & 0x80);
          if (type === 0x51 && mlen === 3) tempos.push({ tick, us: (u8[p] << 16) + (u8[p + 1] << 8) + u8[p + 2] });
          p += mlen;
          if (type === 0x2F) break;
        } else if (statusByte === 0xF0 || statusByte === 0xF7) {
          let slen = 0; do { b = u8[p++]; slen = (slen << 7) | (b & 0x7F); } while (b & 0x80);
          p += slen;
        } else {
          const hi = statusByte & 0xF0;
          const nData = (hi === 0xC0 || hi === 0xD0) ? 1 : 2;
          const data = [statusByte];
          for (let i = 0; i < nData; i++) data.push(u8[p++]);
          events.push({ tick, bytes: data });
        }
      }
      p = end;
    }
    events.sort((a, b) => a.tick - b.tick);
    tempos.sort((a, b) => a.tick - b.tick);
    return { format, division, events, tempos };
  }
  function makeTickToMs(tempos, ppq) {
    const segs = [];
    let cur = 500000, lastTick = 0, accMs = 0;
    for (const t of tempos) {
      if (t.tick > lastTick) { accMs += (t.tick - lastTick) / ppq * (cur / 1000); lastTick = t.tick; }
      cur = t.us;
      segs.push({ tick: t.tick, ms: accMs, us: cur });
    }
    return tick => {
      let seg = { tick: 0, ms: 0, us: 500000 };
      for (const s of segs) { if (s.tick <= tick) seg = s; else break; }
      return seg.ms + (tick - seg.tick) / ppq * (seg.us / 1000);
    };
  }

  /* ── ライブ送信プレイヤ ── */
  const player = {
    output: null, timer: null, playing: false, startedAt: 0, idx: 0, items: [], clockItems: [], clockIdx: 0, loop: false, withClock: false, durationMs: 0,
    load(bytes, opts) {
      const smf = parseSMF(bytes);
      const toMs = makeTickToMs(smf.tempos, smf.division);
      this.items = smf.events.map(e => ({ ms: toMs(e.tick), bytes: e.bytes }));
      this.durationMs = this.items.length ? this.items[this.items.length - 1].ms : 0;
      this.clockItems = [];
      if (opts.withClock) {
        const step = Math.max(1, Math.round(smf.division / 24));
        const lastTick = smf.events.length ? smf.events[smf.events.length - 1].tick : 0;
        for (let tk = 0; tk <= lastTick; tk += step) this.clockItems.push(toMs(tk));
      }
      this.withClock = !!opts.withClock;
      this.loop = !!opts.loop;
    },
    play(output) {
      if (!output || typeof output.send !== 'function') throw new Error('MIDI出力が選ばれていません');
      this.output = output;
      this.playing = true;
      this.startedAt = performance.now();
      this.idx = 0; this.clockIdx = 0;
      if (this.withClock) { try { output.send([0xFA]); } catch (_) {} }
      const tickFn = () => {
        if (!this.playing) return;
        const now = performance.now();
        const horizon = now + 300;
        while (this.idx < this.items.length) {
          const it = this.items[this.idx];
          const at = this.startedAt + it.ms;
          if (at > horizon) break;
          try { this.output.send(it.bytes, Math.max(now, at)); } catch (_) {}
          this.idx++;
        }
        while (this.clockIdx < this.clockItems.length) {
          const at = this.startedAt + this.clockItems[this.clockIdx];
          if (at > horizon) break;
          try { this.output.send([0xF8], Math.max(now, at)); } catch (_) {}
          this.clockIdx++;
        }
        if (this.idx >= this.items.length && this.clockIdx >= this.clockItems.length) {
          if (this.loop) { this.startedAt = performance.now(); this.idx = 0; this.clockIdx = 0; if (this.withClock) { try { this.output.send([0xFA]); } catch (_) {} } }
          else { this.stop(true); status('DAW送信が完了しました'); return; }
        }
        this.timer = setTimeout(tickFn, 100);
      };
      tickFn();
    },
    stop(finished) {
      this.playing = false;
      if (this.timer) { clearTimeout(this.timer); this.timer = null; }
      if (this.output) {
        for (let ch = 0; ch < 16; ch++) {
          try { this.output.send([0xB0 | ch, 123, 0]); } catch (_) {}
          try { this.output.send([0xB0 | ch, 120, 0]); } catch (_) {}
        }
        if (this.withClock && !finished) { try { this.output.send([0xFC]); } catch (_) {} }
        if (this.withClock && finished) { try { this.output.send([0xFC]); } catch (_) {} }
      }
      const btn = $('dawPlayBtn'); if (btn) btn.textContent = 'DAWへライブ送信';
    },
  };

  /* ── DAW強化MIDI (コードマーカー追加) ── */
  function vlq(n) { const out = [n & 0x7F]; n >>= 7; while (n > 0) { out.unshift((n & 0x7F) | 0x80); n >>= 7; } return out; }
  function chordMarkers() {
    const marks = [];
    const ppq = 480, beatsPerBar = 4;
    if (typeof PROG_STATE !== 'undefined' && PROG_STATE.enabled && PROG_STATE.prog && PROG_STATE.prog.length && typeof ProgEngine !== 'undefined') {
      const totalBars = PROG_STATE.prog.reduce((s, e) => s + (e.bars || 4), 0);
      const expanded = ProgEngine.expandToBars(PROG_STATE.prog, totalBars);
      for (const seg of expanded) {
        if (seg.chord) marks.push({ tick: seg.barStart * ppq * beatsPerBar, name: seg.chord.rootName + (seg.chord.quality || '') });
      }
    } else if (typeof S !== 'undefined' && S.chord) {
      marks.push({ tick: 0, name: S.chord.rootName + (S.chord.quality || '') });
    }
    return marks;
  }
  function buildDawMidi() {
    if (typeof S === 'undefined' || !S.midiData) throw new Error('先に GENERATE してください');
    const src = S.midiData instanceof Uint8Array ? S.midiData : new Uint8Array(S.midiData);
    // ヘッダとトラックを分解
    let p = 0;
    const u32at = o => (src[o] << 24) + (src[o + 1] << 16) + (src[o + 2] << 8) + src[o + 3];
    const hlen = u32at(4);
    const format = (src[8] << 8) + src[9];
    const ntrks = (src[10] << 8) + src[11];
    p = 8 + hlen;
    const chunks = [];
    for (let i = 0; i < ntrks; i++) {
      const len = u32at(p + 4);
      chunks.push(src.slice(p, p + 8 + len));
      p += 8 + len;
    }
    // マーカートラックを構築
    const name = 'Chords';
    const track = [];
    track.push(...vlq(0), 0xFF, 0x03, name.length, ...[...name].map(c => c.charCodeAt(0)));
    let prev = 0;
    for (const m of chordMarkers()) {
      const bytes = [...m.name].map(c => c.charCodeAt(0) & 0x7F);
      track.push(...vlq(Math.max(0, m.tick - prev)), 0xFF, 0x06, bytes.length, ...bytes);
      prev = m.tick;
    }
    track.push(0, 0xFF, 0x2F, 0);
    const markerChunk = [0x4D, 0x54, 0x72, 0x6B, (track.length >>> 24) & 0xFF, (track.length >>> 16) & 0xFF, (track.length >>> 8) & 0xFF, track.length & 0xFF, ...track];
    // 再構成 (format 0 の場合は 1 にする)
    const out = [];
    out.push(0x4D, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, (format === 0 ? 1 : format), ((ntrks + 1) >> 8) & 0xFF, (ntrks + 1) & 0xFF, src[12], src[13]);
    for (const c of chunks) out.push(...c);
    out.push(...markerChunk);
    return new Uint8Array(out);
  }
  function downloadDawMidi() {
    const bytes = buildDawMidi();
    const blob = new Blob([bytes], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'meikyoshisui_daw.mid'; a.click();
    URL.revokeObjectURL(url);
    status('DAW強化MIDIを書き出しました (コードマーカー付き)');
  }

  /* ── パネル ── */
  let access = null;
  async function refreshOutputs() {
    const sel = $('dawOutSel');
    if (!sel) return;
    sel.innerHTML = '';
    if (!navigator.requestMIDIAccess) { sel.innerHTML = '<option>WebMIDI未対応ブラウザ</option>'; return; }
    try {
      access = access || await navigator.requestMIDIAccess();
      access.onstatechange = refreshOutputs;
      const outs = [...access.outputs.values()];
      if (!outs.length) sel.innerHTML = '<option>(出力デバイスなし)</option>';
      for (const o of outs) { const opt = document.createElement('option'); opt.value = o.id; opt.textContent = o.name || o.id; sel.appendChild(opt); }
    } catch (e) { sel.innerHTML = '<option>MIDIアクセス不可</option>'; }
  }
  function selectedOutput() {
    const sel = $('dawOutSel');
    if (!access || !sel) return null;
    return access.outputs.get(sel.value) || [...access.outputs.values()][0] || null;
  }

  function init() {
    if (!document.getElementById('dawStyle')) {
      const st = document.createElement('style');
      st.id = 'dawStyle';
      st.textContent = '.daw-head{font-size:11px;font-weight:700;letter-spacing:3px;margin:26px 0 10px;text-transform:uppercase}'
        + '.daw-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}'
        + '.daw-in{background:var(--panel2,#1a1a1f);color:var(--text,#e8e8e8);border:1px solid var(--border,#333);border-radius:4px;font-size:11px;padding:5px 7px}'
        + '.daw-btn{flex:none;background:transparent;color:var(--text,#e8e8e8);border:1px solid var(--border,#444);border-radius:6px;font-size:11px;padding:6px 10px;cursor:pointer}'
        + '.daw-btn:hover{border-color:#888}'
        + '.daw-note{font-size:10px;color:var(--text-dim,#888);line-height:1.7}'
        + '#dawStatus{font-size:11px;margin-top:8px;white-space:pre-wrap}';
      document.head.appendChild(st);
    }
    const sec = document.createElement('div');
    sec.id = 'dawLinkSec';
    sec.innerHTML = `
      <div class="daw-head">DAW Link <span class="badge">MIDI OUT</span></div>
      <div class="daw-row">
        <select id="dawOutSel" class="daw-in"></select>
        <button class="daw-btn" id="dawRefreshBtn" type="button">出力デバイス再読込</button>
        <button class="daw-btn" id="dawPlayBtn" type="button">DAWへライブ送信</button>
        <label class="daw-note"><input type="checkbox" id="dawClock"> MIDIクロック送信</label>
        <label class="daw-note"><input type="checkbox" id="dawLoop"> ループ</label>
        <button class="daw-btn" id="dawDlBtn" type="button">DAW強化MIDI (.mid)</button>
      </div>
      <div class="daw-note">
        使い方: 仮想MIDIポート (macOS: Audio MIDI設定の IACドライバ / Windows: loopMIDI) を作り、DAW の MIDI トラックの入力にそのポートを選んで録音待機 → ここから送信すると DAW にそのまま録音できます。
        対応: Ableton Live / Logic Pro / Cubase / Studio One / FL Studio / Reaper / Pro Tools ほか、外部MIDI入力を受けられる全てのDAW。GarageBand は外部MIDI録音ができないため、MIDIファイルの取り込みを使ってください。
        DAW側のピッチベンド幅は ±2 (MPE/微分音トラックは各音源の設定) に合わせると音律が一致します。詳細は docs/DAW.md。
      </div>
      <div id="dawStatus"></div>`;
    const anchor = $('aiBridgeSec') || $('theoryPackSec');
    if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(sec, anchor.nextSibling);
    else document.body.appendChild(sec);

    refreshOutputs();
    $('dawRefreshBtn').addEventListener('click', () => { access = null; refreshOutputs(); status('出力デバイスを再読み込みしました'); });
    $('dawPlayBtn').addEventListener('click', async () => {
      try {
        if (player.playing) { player.stop(); status('送信を停止しました'); return; }
        if (typeof S === 'undefined' || !S.midiData) { status('先に GENERATE してください', false); return; }
        const out = selectedOutput();
        if (!out) { status('MIDI出力がありません。仮想MIDIポートを作成し、再読込してください', false); return; }
        player.load(S.midiData, { withClock: $('dawClock').checked, loop: $('dawLoop').checked });
        player.play(out);
        $('dawPlayBtn').textContent = '停止';
        status('送信中: ' + (out.name || out.id) + ' (' + Math.round(player.durationMs / 100) / 10 + ' 秒)');
      } catch (e) { status('失敗: ' + (e && e.message || e), false); }
    });
    $('dawDlBtn').addEventListener('click', () => { try { downloadDawMidi(); } catch (e) { status('失敗: ' + (e && e.message || e), false); } });

    window.__MEIKY_DAW__ = { player, parseSMF, buildDawMidi, refreshOutputs };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
