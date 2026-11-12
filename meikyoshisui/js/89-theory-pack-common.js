/* ═══════════════════════════════════════════════════════════════
   89-theory-pack-common.js — Theory Pack 共通ヘルパ (2026-11-13)
   ───────────────────────────────────────────────────────────────
   Theory Pack III〜VI (85〜88) で複製されていた共通ヘルパを集約。
   index.html では 85 より前に読み込むこと (SW CORE も同様)。
   各パックは window.TPCommon から destructure して使う。
   TPCommon が無い場合、各パックは生成フックを張らず無力化する
   (アプリ本体には影響しない)。
   ═══════════════════════════════════════════════════════════════ */
window.TPCommon = (() => {
  'use strict';

  const clampNote = n => { n = Math.round(n); while (n < 12) n += 12; while (n > 115) n -= 12; return n; };
  function pushNote(ae, pos, dur, ch, note, vel, total) {
    pos = Math.round(pos);
    if (pos < 0 || pos >= total) return;
    const n = clampNote(note), v = Math.max(1, Math.min(127, Math.round(vel)));
    ae.push({ pos, v: [0x90 | ch, n, v] });
    ae.push({ pos: Math.min(pos + Math.max(30, Math.round(dur)), total - 1), v: [0x80 | ch, n, 0] });
  }
  function degToMidi(deg, rootMidi, iv) {
    const L = iv.length;
    const oct = Math.floor(deg / L), idx = ((deg % L) + L) % L;
    return rootMidi + oct * 12 + iv[idx];
  }
  const R = () => (typeof rng === 'function' ? rng() : Math.random());
  const pcOf = n => ((n % 12) + 12) % 12;
  function snapToScale(note, ctx) {
    const pcs = new Set(ctx.scaleIv.map(i => pcOf(ctx.chord.root + i)));
    if (pcs.has(pcOf(note))) return note;
    for (let d = 1; d < 7; d++) {
      if (pcs.has(pcOf(note + d))) return note + d;
      if (pcs.has(pcOf(note - d))) return note - d;
    }
    return note;
  }
  function parseSmfTrack(b) {
    let i = 0, pos = 0, status = 0;
    const on = new Map(), notes = [];
    const readVar = () => { let v = 0; while (i < b.length) { const c = b[i++]; v = (v << 7) | (c & 0x7f); if (!(c & 0x80)) break; } return v; };
    while (i < b.length) {
      pos += readVar();
      if (i >= b.length) break;
      let st;
      if (b[i] & 0x80) { st = b[i++]; if (st < 0xf0) status = st; }
      else st = status;
      if (st === 0xff) { i++; const len = readVar(); i += len; continue; }
      if (st === 0xf0 || st === 0xf7) { const len = readVar(); i += len; continue; }
      const hi = st & 0xf0, ch = st & 0x0f;
      const d1 = b[i++];
      const d2 = (hi === 0xc0 || hi === 0xd0) ? 0 : b[i++];
      const key = ch + ':' + d1;
      if (hi === 0x90 && d2 > 0) { if (!on.has(key)) on.set(key, []); on.get(key).push({ pos, note: d1, vel: d2 }); }
      else if (hi === 0x80 || (hi === 0x90 && d2 === 0)) {
        const q = on.get(key);
        if (q && q.length) { const o = q.shift(); notes.push({ pos: o.pos, dur: Math.max(30, pos - o.pos), note: d1, vel: o.vel }); }
      }
    }
    return notes.sort((a, b2) => a.pos - b2.pos);
  }
  function notesFromTrack(tr) {
    if (!tr || !tr.length) return [];
    if (typeof tr[0] === 'number') return parseSmfTrack(tr);
    const on = new Map(), notes = [];
    for (const e of [...tr].sort((a, b) => a.pos - b.pos)) {
      if (!e || !Array.isArray(e.v) || e.v.length < 3) continue;
      const st = e.v[0], n = e.v[1], v = e.v[2], key = (st & 0x0f) + ':' + n;
      if ((st & 0xf0) === 0x90 && v > 0) { if (!on.has(key)) on.set(key, []); on.get(key).push({ pos: e.pos, note: n, vel: v }); }
      else if (((st & 0xf0) === 0x80 || ((st & 0xf0) === 0x90 && v === 0))) {
        const q = on.get(key);
        if (q && q.length) { const o = q.shift(); notes.push({ pos: o.pos, dur: Math.max(30, e.pos - o.pos), note: n, vel: o.vel }); }
      }
    }
    return notes.sort((a, b) => a.pos - b.pos);
  }
  function extractLine(ctx, preferRe) {
    let best = null;
    (ctx.tn || []).forEach((name, i) => {
      const notes = notesFromTrack(ctx.tracks[i]);
      if (!notes.length) return;
      const mid = notes.reduce((s, x) => s + x.note, 0) / notes.length;
      let score = notes.length - Math.abs(mid - 72) * 0.5;
      if (preferRe && preferRe.test(name)) score += 10000;
      if (!best || score > best.score) best = { notes, score };
    });
    return best ? best.notes : null;
  }
  function genMelody(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const step = ppq / 2, notes = [];
    let deg = scaleIv.length;
    for (let i = 0; i < totalBars * 8; i++) {
      if (R() < 0.78) notes.push({ pos: i * step, dur: step * 0.92, note: degToMidi(deg, rootMidi, scaleIv), vel: 74 });
      deg += [0, 1, -1, 1, -1, 2, -2][Math.floor(R() * 7)];
      deg = Math.max(0, Math.min(scaleIv.length * 2 - 1, deg));
    }
    return notes;
  }
  const melodyOf = ctx => {
    const ex = extractLine(ctx, /melod|lead|top line/i);
    return (ex && ex.length >= 8) ? ex : genMelody(ctx);
  };

  return { clampNote, pushNote, degToMidi, R, pcOf, snapToScale, parseSmfTrack, notesFromTrack, extractLine, genMelody, melodyOf };
})();
