/* 82-render-tools.js — 描き出しと可視化 (2026-11-11)
   · WAV書き出し: 生成済み MIDI を OfflineAudioContext でレンダリングして
     .wav で保存する。プレビュー用の簡易シンセ (チャンネル別の波形＋
     エンベロープ＋短いフィードバックディレイ)。ピッチベンドも反映する。
   · バリエーション一括生成: シード違いを N 曲まとめて生成し、STORE形式
     ZIP (無圧縮・自前実装) で一括保存。終わったら元の設定に戻す。
   · ピアノロール: 生成結果全体を1枚で表示する (モノクロ、チャンネルで濃淡)。
   生成ロジックには触れない。 */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  function status(msg, ok) {
    const el = $('renderStatus');
    if (el) { el.textContent = msg; el.style.color = ok === false ? '#f87171' : ''; }
  }
  function tickToSecFn(smf) {
    const segs = [];
    let cur = 500000, lastTick = 0, acc = 0;
    const tempos = [...smf.tempos].sort((a, b) => a.tick - b.tick);
    for (const t of tempos) {
      if (t.tick > lastTick) { acc += (t.tick - lastTick) / smf.division * (cur / 1e6); lastTick = t.tick; }
      cur = t.us; segs.push({ tick: t.tick, sec: acc, us: cur });
    }
    return tick => {
      let seg = { tick: 0, sec: 0, us: 500000 };
      for (const s of segs) { if (s.tick <= tick) seg = s; else break; }
      return seg.sec + (tick - seg.tick) / smf.division * (seg.us / 1e6);
    };
  }
  function extractNotes() {
    const D = window.__MEIKY_DAW__;
    if (!D) throw new Error('DAW モジュール (80) が必要です');
    if (typeof S === 'undefined' || !S.midiData) throw new Error('先に GENERATE してください');
    const smf = D.parseSMF(S.midiData);
    const toSec = tickToSecFn(smf);
    const bend = new Array(16).fill(0);
    const open = new Map();
    const notes = [];
    for (const e of smf.events) {
      const st = e.bytes[0], ch = st & 0x0F, hi = st & 0xF0;
      if (hi === 0xE0) bend[ch] = ((e.bytes[2] << 7) | e.bytes[1]) - 8192;
      else if (hi === 0x90 && e.bytes[2] > 0) open.set(ch + ':' + e.bytes[1], { tick: e.tick, note: e.bytes[1], vel: e.bytes[2], ch, bend: bend[ch] });
      else if (hi === 0x80 || (hi === 0x90 && e.bytes[2] === 0)) {
        const k = ch + ':' + e.bytes[1];
        if (open.has(k)) {
          const o = open.get(k);
          notes.push({ note: o.note, vel: o.vel, ch: o.ch, startSec: toSec(o.tick), endSec: Math.max(toSec(o.tick) + 0.05, toSec(e.tick)), bendSemis: (o.bend / 8192) * 2 });
          open.delete(k);
        }
      }
    }
    const dur = notes.length ? Math.max(...notes.map(n => n.endSec)) : 0;
    return { notes, dur };
  }
  function freqOf(midiFloat) {
    if (typeof PATCH !== 'undefined' && typeof PATCH.midiToHz === 'function') return PATCH.midiToHz(midiFloat);
    return 440 * Math.pow(2, (midiFloat - 69) / 12);
  }

  /* ── WAV ── */
  const WAVES = ['triangle', 'sine', 'sine', 'triangle', 'sine', 'sawtooth', 'triangle', 'sine'];
  async function renderAudioBuffer(sr) {
    const { notes, dur } = extractNotes();
    if (!notes.length) throw new Error('ノートがありません');
    const total = dur + 1.5;
    if (total > 600) throw new Error('長すぎます (' + Math.round(total) + ' 秒)。小節数を減らしてください');
    const ctx = new OfflineAudioContext(2, Math.ceil(total * sr), sr);
    const master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);
    const delay = ctx.createDelay(1); delay.delayTime.value = 0.28;
    const fb = ctx.createGain(); fb.gain.value = 0.25;
    const wet = ctx.createGain(); wet.gain.value = 0.16;
    master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(comp);
    for (const n of notes) {
      const osc = ctx.createOscillator();
      osc.type = WAVES[n.ch % WAVES.length];
      osc.frequency.value = freqOf(n.note + n.bendSemis);
      const g = ctx.createGain();
      const peak = (n.vel / 127) * 0.2;
      const t0 = n.startSec, t1 = n.endSec;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 0.02);
      g.gain.setValueAtTime(peak, Math.max(t0 + 0.02, t1 - 0.08));
      g.gain.linearRampToValueAtTime(0, t1 + 0.25);
      if (osc.type === 'sawtooth') { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400; osc.connect(f); f.connect(g); }
      else osc.connect(g);
      g.connect(master);
      osc.start(t0); osc.stop(t1 + 0.3);
    }
    return ctx.startRendering();
  }
  async function renderWavBlob() {
    const buf = await renderAudioBuffer(44100);
    return new Blob([encodeWAV(buf)], { type: 'audio/wav' });
  }

  /* ── Opus (WebCodecs + 自前 Ogg muxer) ──
     WAV と同じオフライン描画を 48kHz で行い、AudioEncoder で Opus 化して
     Ogg に詰める。対応ブラウザでのみボタンが出る。 */
  const OGG_CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let r = n << 24; for (let k = 0; k < 8; k++) r = (r & 0x80000000) ? ((r << 1) ^ 0x04c11db7) : (r << 1); t[n] = r >>> 0; } return t; })();
  function oggCrc(bytes) { let crc = 0; for (let i = 0; i < bytes.length; i++) crc = ((crc << 8) ^ OGG_CRC_TABLE[((crc >>> 24) & 0xff) ^ bytes[i]]) >>> 0; return crc >>> 0; }
  function muxOggOpus(packets, channels, totalFrames) {
    const PRE_SKIP = 312, serial = 0x4d45494b;
    let seq = 0; const pages = [];
    function makePage(segs, granule, type) {
      let bodyLen = 0; for (const s of segs) bodyLen += s.length;
      const page = new Uint8Array(27 + segs.length + bodyLen);
      const dv = new DataView(page.buffer);
      page.set([0x4f, 0x67, 0x67, 0x53, 0, type], 0);
      dv.setBigUint64(6, granule < 0 ? 0xffffffffffffffffn : BigInt(Math.round(granule)), true);
      dv.setUint32(14, serial, true); dv.setUint32(18, seq++, true);
      page[26] = segs.length;
      for (let i = 0; i < segs.length; i++) page[27 + i] = segs[i].length;
      let o = 27 + segs.length;
      for (const s of segs) { page.set(s, o); o += s.length; }
      dv.setUint32(22, oggCrc(page), true);
      pages.push(page);
    }
    const head = new Uint8Array(19);
    head.set(new TextEncoder().encode('OpusHead'), 0);
    const hv = new DataView(head.buffer);
    head[8] = 1; head[9] = channels; hv.setUint16(10, PRE_SKIP, true); hv.setUint32(12, 48000, true); hv.setInt16(16, 0, true); head[18] = 0;
    makePage([head], 0, 2);
    const vendor = new TextEncoder().encode('MEIKYOSHISUI');
    const tags = new Uint8Array(8 + 4 + vendor.length + 4);
    tags.set(new TextEncoder().encode('OpusTags'), 0);
    const tv = new DataView(tags.buffer);
    tv.setUint32(8, vendor.length, true); tags.set(vendor, 12); tv.setUint32(12 + vendor.length, 0, true);
    makePage([tags], 0, 0);
    /* 音声ページ: パケットをセグメント化し、16KB 目安でページを切る。
       ページ途中でパケットが割れたら、そのページの granule は -1、
       次ページに継続フラグ (0x01) を立てる (Ogg の仕様どおり) */
    let segs = [], segBytes = 0, pageGranule = PRE_SKIP, cumSamples = 0, startsContinued = false;
    function flush(eos, granuleOverride) {
      if (!segs.length) return;
      makePage(segs, granuleOverride !== undefined ? granuleOverride : pageGranule, (startsContinued ? 1 : 0) | (eos ? 4 : 0));
      segs = []; segBytes = 0; startsContinued = false;
    }
    for (const pkt of packets) {
      let off = 0;
      while (true) {
        const take = Math.min(255, pkt.b.length - off);
        segs.push(pkt.b.subarray(off, off + take)); segBytes += take; off += take;
        if (take < 255) break;
        if (off >= pkt.b.length) { segs.push(new Uint8Array(0)); break; }
        if (segs.length >= 255 || segBytes >= 16384) { flush(false, -1); startsContinued = true; }
      }
      cumSamples += pkt.samples;
      pageGranule = PRE_SKIP + cumSamples;
      if (segBytes >= 16384 || segs.length >= 200) flush(false);
    }
    pageGranule = PRE_SKIP + totalFrames;
    flush(true);
    const out = new Uint8Array(pages.reduce((s, p) => s + p.length, 0));
    let o = 0; for (const p of pages) { out.set(p, o); o += p.length; }
    return out;
  }
  async function renderOpusBlob() {
    if (typeof AudioEncoder === 'undefined') throw new Error('このブラウザは WebCodecs に未対応です');
    const cfg = { codec: 'opus', sampleRate: 48000, numberOfChannels: 2, bitrate: 128000 };
    const sup = await AudioEncoder.isConfigSupported(cfg).catch(() => ({ supported: false }));
    if (!sup.supported) throw new Error('Opus エンコードに未対応です');
    const buf = await renderAudioBuffer(48000);
    const packets = [];
    let encErr = null;
    const enc = new AudioEncoder({
      output: chunk => { const b = new Uint8Array(chunk.byteLength); chunk.copyTo(b); packets.push({ b, samples: chunk.duration ? Math.round(chunk.duration * 48000 / 1e6) : 960 }); },
      error: e => { encErr = e; },
    });
    enc.configure(cfg);
    const sr = buf.sampleRate, ch = Math.min(2, buf.numberOfChannels);
    const chans = []; for (let c = 0; c < ch; c++) chans.push(buf.getChannelData(c));
    const FRAME = 4800;
    for (let off = 0; off < buf.length; off += FRAME) {
      const n = Math.min(FRAME, buf.length - off);
      const data = new Float32Array(n * ch);
      for (let c = 0; c < ch; c++) data.set(chans[c].subarray(off, off + n), c * n);
      const ad = new AudioData({ format: 'f32-planar', sampleRate: sr, numberOfFrames: n, numberOfChannels: ch, timestamp: Math.round(off / sr * 1e6), data });
      enc.encode(ad); ad.close();
      while (enc.encodeQueueSize > 8) await new Promise(r => setTimeout(r, 10));
    }
    await enc.flush(); enc.close();
    if (encErr) throw encErr;
    if (!packets.length) throw new Error('Opus パケットが生成されませんでした');
    return new Blob([muxOggOpus(packets, ch, buf.length)], { type: 'audio/ogg' });
  }
  function encodeWAV(buf) {
    const nCh = Math.min(2, buf.numberOfChannels);
    const sr = buf.sampleRate, len = buf.length;
    const out = new DataView(new ArrayBuffer(44 + len * nCh * 2));
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); out.setUint32(4, 36 + len * nCh * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ');
    out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, nCh, true);
    out.setUint32(24, sr, true); out.setUint32(28, sr * nCh * 2, true); out.setUint16(32, nCh * 2, true); out.setUint16(34, 16, true);
    ws(36, 'data'); out.setUint32(40, len * nCh * 2, true);
    const chans = [];
    for (let c = 0; c < nCh; c++) chans.push(buf.getChannelData(c));
    let o = 44;
    for (let i = 0; i < len; i++) for (let c = 0; c < nCh; c++) {
      const v = Math.max(-1, Math.min(1, chans[c][i]));
      out.setInt16(o, v * 0x7FFF, true); o += 2;
    }
    return out.buffer;
  }

  /* ── ZIP (STORE) ── */
  const CRC_TABLE = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; } return t; })();
  function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function buildZip(files) {
    const enc = new TextEncoder();
    const parts = [], central = [];
    let offset = 0;
    for (const f of files) {
      const name = enc.encode(f.name);
      const data = f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data);
      const crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    }
    const cenSize = central.reduce((s, p) => s + p.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cenSize, true); end.setUint32(16, offset, true);
    const all = [...parts, ...central, new Uint8Array(end.buffer)];
    const out = new Uint8Array(all.reduce((s, p) => s + p.length, 0));
    let o = 0;
    for (const p of all) { out.set(p, o); o += p.length; }
    return out;
  }

  /* ── バリエーション一括生成 ── */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function waitGen(prevRef, timeout) {
    const t0 = Date.now();
    while (Date.now() - t0 < (timeout || 5000)) {
      if (typeof S !== 'undefined' && S.midiData && S.midiData !== prevRef) return true;
      await sleep(120);
    }
    return false;
  }
  async function batchVariations(count, onProgress) {
    if (typeof StatePersist === 'undefined') throw new Error('StatePersist が必要です');
    const TMP = '__batchtmp__';
    if (!StatePersist.save(TMP)) throw new Error('現在の設定を退避できませんでした');
    const baseSeed = (typeof S !== 'undefined' && S.seed) || 424242;
    const files = [];
    /* 生成コアは seedLocked でないとシードを引き直すため、一括生成の間は
       ロックして決定的なシード系列にし、最後に元の状態へ戻す */
    const keepLock = S.seedLocked;
    S.seedLocked = true;
    try {
      for (let i = 0; i < count; i++) {
        const prev = S.midiData;
        S.seed = baseSeed + i * 7919;
        if (typeof doGenerate === 'function') doGenerate();
        if (!(await waitGen(prev))) throw new Error('生成がタイムアウトしました (' + (i + 1) + ' 曲目)');
        files.push({ name: 'variation_' + String(i + 1).padStart(2, '0') + '_seed' + S.seed + '.mid', data: S.midiData.slice() });
        if (onProgress) onProgress(i + 1, count);
      }
    } finally {
      StatePersist.load(TMP);
      StatePersist.remove(TMP);
      S.seedLocked = true;
      await sleep(350);
      const prev = S.midiData;
      if (typeof doGenerate === 'function') doGenerate();
      await waitGen(prev, 4000);
      S.seedLocked = keepLock;
    }
    return files;
  }

  /* ── ピアノロール ── */
  function drawRoll() {
    const cv = $('rollCanvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width = cv.clientWidth * 2, H = cv.height = 340;
    ctx.fillStyle = '#0e0e11'; ctx.fillRect(0, 0, W, H);
    let data;
    try { data = extractNotes(); } catch (_) { return; }
    const { notes, dur } = data;
    if (!notes.length || !dur) return;
    let lo = 127, hi = 0;
    for (const n of notes) { lo = Math.min(lo, n.note); hi = Math.max(hi, n.note); }
    lo = Math.max(0, lo - 2); hi = Math.min(127, hi + 2);
    ctx.strokeStyle = '#26262c';
    for (let pc = 0; pc <= hi - lo; pc++) { const y = H - (pc + 1) / (hi - lo + 1) * H; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (const n of notes) {
      const x = n.startSec / dur * W;
      const w = Math.max(3, (n.endSec - n.startSec) / dur * W);
      const y = H - (n.note - lo + 1) / (hi - lo + 1) * H;
      const h = Math.max(2, H / (hi - lo + 1) - 1);
      const shade = 140 + (n.ch % 6) * 18;
      ctx.fillStyle = 'rgba(' + shade + ',' + shade + ',' + shade + ',' + (0.35 + (n.vel / 127) * 0.65) + ')';
      ctx.fillRect(x, y, w, h);
    }
  }

  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  function init() {
    if (!document.getElementById('rndStyle')) {
      const st = document.createElement('style');
      st.id = 'rndStyle';
      st.textContent = '.rnd-head{font-size:11px;font-weight:700;letter-spacing:3px;margin:26px 0 10px;text-transform:uppercase}'
        + '.rnd-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}'
        + '.rnd-btn{flex:none;background:transparent;color:var(--text,#e8e8e8);border:1px solid var(--border,#444);border-radius:6px;font-size:11px;padding:6px 10px;cursor:pointer}'
        + '.rnd-btn:hover{border-color:#888}'
        + '.rnd-in{background:var(--panel2,#1a1a1f);color:var(--text,#e8e8e8);border:1px solid var(--border,#333);border-radius:4px;font-size:11px;padding:5px 7px}'
        + '.rnd-note{font-size:10px;color:var(--text-dim,#888);line-height:1.7}'
        + '#rollCanvas{width:100%;height:170px;display:block;background:#0e0e11;border:1px solid var(--border,#333);border-radius:6px;margin-top:8px}'
        + '#renderStatus{font-size:11px;margin-top:8px;white-space:pre-wrap}';
      document.head.appendChild(st);
    }
    const sec = document.createElement('div');
    sec.id = 'renderSec';
    sec.innerHTML = `
      <div class="rnd-head">Render <span class="badge">AUDIO / BATCH / ROLL</span></div>
      <div class="rnd-row">
        <button class="rnd-btn" id="btnWav" type="button">WAV書き出し</button>
        <label class="rnd-note">バリエーション数
          <select id="batchCount" class="rnd-in"><option>4</option><option selected>8</option><option>12</option></select>
        </label>
        <button class="rnd-btn" id="btnBatch" type="button">バリエーション一括生成 (ZIP)</button>
        <button class="rnd-btn" id="btnRoll" type="button">ピアノロール更新</button>
        <span class="rnd-note">WAV は内蔵シンセでの簡易レンダリングです (音色はプレビューの近似)。</span>
      </div>
      <canvas id="rollCanvas"></canvas>
      <div id="renderStatus"></div>`;
    const anchor = $('createSec') || $('dawLinkSec') || $('aiBridgeSec');
    if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(sec, anchor.nextSibling);
    else document.body.appendChild(sec);

    $('btnWav').addEventListener('click', async () => {
      try { status('WAVをレンダリング中…'); const blob = await renderWavBlob(); download(blob, 'meikyoshisui.wav'); status('WAVを書き出しました (' + Math.round(blob.size / 1024) + ' KB)'); }
      catch (e) { status('WAV失敗: ' + (e && e.message || e), false); }
    });
    /* Opus ボタンは WebCodecs 対応時のみ出す */
    if (typeof AudioEncoder !== 'undefined') {
      AudioEncoder.isConfigSupported({ codec: 'opus', sampleRate: 48000, numberOfChannels: 2, bitrate: 128000 })
        .then(sup => {
          if (!sup.supported) return;
          const b = document.createElement('button');
          b.className = 'rnd-btn'; b.id = 'btnOpus'; b.type = 'button'; b.textContent = 'OGG (Opus) 書き出し';
          b.title = 'WAV と同じ描画を Opus で小さく書き出す (WebCodecs)';
          $('btnWav').after(b);
          b.addEventListener('click', async () => {
            try { status('Opusをレンダリング中…'); const blob = await renderOpusBlob(); download(blob, 'meikyoshisui.ogg'); status('OGG (Opus) を書き出しました (' + Math.round(blob.size / 1024) + ' KB)'); }
            catch (e) { status('Opus失敗: ' + (e && e.message || e), false); }
          });
        }).catch(() => { /* 非対応なら出さない */ });
    }
    $('btnBatch').addEventListener('click', async () => {
      try {
        const count = parseInt($('batchCount').value, 10) || 8;
        status('バリエーションを生成中… (0/' + count + ')');
        const files = await batchVariations(count, (done, total) => status('バリエーションを生成中… (' + done + '/' + total + ')'));
        download(new Blob([buildZip(files)], { type: 'application/zip' }), 'meikyoshisui_variations.zip');
        status(count + ' 曲のバリエーションを ZIP で書き出しました。設定は元に戻しました');
      } catch (e) { status('一括生成に失敗: ' + (e && e.message || e), false); }
    });
    $('btnRoll').addEventListener('click', drawRoll);
    const genBtn = $('btnGen');
    if (genBtn) genBtn.addEventListener('click', () => setTimeout(drawRoll, 1200));
    setTimeout(drawRoll, 500);

    window.__MEIKY_RENDER__ = { renderWavBlob, renderOpusBlob, buildZip, batchVariations, drawRoll, extractNotes };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
