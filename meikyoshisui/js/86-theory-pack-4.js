/* ═══════════════════════════════════════════════════════════════
   86-theory-pack-4.js — Theory Pack IV (2026-11-13 追加)
   ───────────────────────────────────────────────────────────────
   Theory Pack III (85) に続く第4弾。接続方法は 85 と同じ
   (TheoryPack.appendTracks のラップ)。全て既定 OFF。
   OFF のとき生成には一切関与しない (rng も消費しない)。

     Chorale (SATB)     旋律へ四声体で和声付け (声部連結は近接優先)
     Bebop Lines        エンクロージャーと経過的半音を含む8分音符ライン
     Variations         主題と変奏: 小節ごとに変形の度合いが進む
     Walking Bass       4分音符のウォーキング (拍4は次の主音へ半音接近)
     Organum            平行オルガヌム (5度/4度) とフォーブルドン
     Aksak              不等拍子 (7/8, 9/8, 11/8, 5/8) のアクセント型
     Genetic Phrases    フレーズ集団の進化 (適応度=滑らかさ+和音音率)
     Ornaments          装飾音: 前打音/モルデント/ターン/トリル
     Coltrane Changes   長3度関係へのトニック化循環
     Line Cliché        静止和音の内声が半音階で下降するクリシェ
     Rondo Form         ロンド形式 ABACA: ロンド主題とエピソード
     Call & Response    呼びかけ (不安定な終止) と応答 (主音へ解決)

   状態は localStorage 'meikyoshisui_theorypack4_v1' に保存。
   ═══════════════════════════════════════════════════════════════ */
const TheoryPack4 = (() => {
  'use strict';

  const LS_KEY = 'meikyoshisui_theorypack4_v1';
  const DEF = {
    chorale:  { enabled: false },
    bebop:    { enabled: false },
    variations:{ enabled: false },
    walking:  { enabled: false },
    organum:  { enabled: false, mode: 'parallel5' },
    aksak:    { enabled: false, pattern: '7/8' },
    genetic:  { enabled: false },
    ornaments:{ enabled: false },
    coltrane: { enabled: false },
    cliche:   { enabled: false },
    rondo:    { enabled: false },
    callresp: { enabled: false },
  };
  let T4 = JSON.parse(JSON.stringify(DEF));
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (saved) for (const k of Object.keys(DEF)) if (saved[k]) Object.assign(T4[k], saved[k]);
  } catch (e) { /* ignore */ }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(T4)); } catch (e) {} }

  /* ── 共通ヘルパ (85 と同じ作法) ── */
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
  const chordPcs = ctx => [...new Set(ctx.chord.iv.map(i => pcOf(ctx.chord.root + i)))];
  function nearestPc(note, pcs, lo, hi) {
    let best = null, bd = 1e9;
    for (let n = lo; n <= hi; n++) if (pcs.includes(pcOf(n))) { const d = Math.abs(n - note); if (d < bd) { bd = d; best = n; } }
    return best;
  }

  /* ═══ 1. Chorale (SATB) ═══ */
  function chorale(ctx) {
    const { ppq, totalBars } = ctx;
    const bt = ppq * 4, total = bt * totalBars, beat = ppq;
    const mel = melodyOf(ctx);
    const pcs = chordPcs(ctx);
    // 拍ごとに代表旋律音を拾う
    const beats = [];
    for (let b = 0; b < totalBars * 4; b++) {
      const n = mel.find(m => m.pos >= b * beat && m.pos < (b + 1) * beat);
      beats.push(n ? n.note : null);
    }
    let prevA = 67, prevT = 59;
    const aA = [], aT = [], aB = [];
    let lastSop = null;
    for (let b = 0; b < beats.length; b++) {
      const sop = beats[b];
      if (sop === null) continue;
      lastSop = sop;
      const bass = nearestPc(ctx.rootMidi - 12, [pcOf(ctx.chord.root)], 33, 52) ?? (ctx.rootMidi - 24);
      const alto = nearestPc(prevA, pcs.filter(p => p !== pcOf(sop)), 55, 76) ?? prevA;
      const tenor = nearestPc(prevT, pcs.filter(p => p !== pcOf(alto)), 47, 68) ?? prevT;
      prevA = alto; prevT = tenor;
      const dur = beat * 0.94;
      pushNote(aA, b * beat, dur, 12, alto, 62, total);
      pushNote(aT, b * beat, dur, 13, tenor, 60, total);
      pushNote(aB, b * beat, dur, 14, bass, 70, total);
    }
    return [{ events: aA, name: 'Chorale Alto' }, { events: aT, name: 'Chorale Tenor' }, { events: aB, name: 'Chorale Bass' }].filter(t => t.events.length);
  }

  /* ═══ 2. Bebop Lines ═══ */
  function bebop(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi, chord } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    const tones = chord.iv.map(iv => rootMidi + 12 + iv);
    const ae = [];
    let deg = scaleIv.length + 2;
    for (let bar = 0; bar < totalBars; bar++) {
      // 拍頭のターゲット (コードトーン) を先に決める
      const targets = [0, 1, 2, 3].map(k => tones[Math.floor(R() * tones.length)] + (R() < 0.3 ? 12 : 0));
      for (let s = 0; s < 8; s++) {
        const pos = bar * bt + s * step;
        let note;
        if (s % 2 === 0) {
          note = targets[s / 2];
          deg = Math.round((note - rootMidi) / 12) * scaleIv.length; // 度数の目安を同期
        } else if (s === 7 && R() < 0.6) {
          // エンクロージャー: 次のターゲットを上下から挟む
          const tgt = tones[Math.floor(R() * tones.length)];
          note = snapToScale(tgt + (R() < 0.5 ? 2 : -1), ctx);
          pushNote(ae, pos, step * 0.5, 12, note, 66, total);
          pushNote(ae, pos + step * 0.5, step * 0.45, 12, snapToScale(tgt + (note > tgt ? -2 : 1), ctx), 62, total);
          continue;
        } else if (R() < 0.3) {
          note = snapToScale(degToMidi(deg, rootMidi, scaleIv) + (R() < 0.5 ? 1 : -1), ctx); // 経過的半音
        } else {
          deg += [1, -1, 2, -2, 1][Math.floor(R() * 5)];
          deg = Math.max(0, Math.min(scaleIv.length * 2 - 1, deg));
          note = degToMidi(deg, rootMidi, scaleIv);
        }
        pushNote(ae, pos, step * 0.9, 12, note, s % 2 === 0 ? 82 : 68, total);
      }
    }
    return [{ events: ae, name: 'Bebop Line' }];
  }

  /* ═══ 3. Theme & Variations ═══ */
  function variations(ctx) {
    const { ppq, totalBars } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const mel = melodyOf(ctx).slice(0, 300);
    const ae = [];
    for (const n of mel) {
      const bar = Math.floor(n.pos / bt), stage = Math.min(4, Math.floor(bar / 2));
      if (stage === 0) pushNote(ae, n.pos, n.dur, 12, n.note, n.vel, total);
      else if (stage === 1) { // リズム分割
        pushNote(ae, n.pos, n.dur / 2, 12, n.note, n.vel, total);
        pushNote(ae, n.pos + n.dur / 2, n.dur / 2, 12, n.note, Math.max(40, n.vel - 14), total);
      } else if (stage === 2) { // 隣接音の装飾
        pushNote(ae, n.pos, n.dur * 0.55, 12, n.note, n.vel, total);
        pushNote(ae, n.pos + n.dur * 0.55, n.dur * 0.4, 12, snapToScale(n.note + 2, ctx), Math.max(40, n.vel - 18), total);
      } else if (stage === 3) { // オクターブ転位
        pushNote(ae, n.pos, n.dur, 12, n.note + (bar % 2 ? 12 : 0), n.vel, total);
      } else { // 軸反転
        pushNote(ae, n.pos, n.dur, 12, snapToScale((ctx.rootMidi + 24) * 2 - n.note, ctx), n.vel, total);
      }
    }
    return [{ events: ae, name: 'Variations' }];
  }

  /* ═══ 4. Walking Bass ═══ */
  function walking(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi, chord } = ctx;
    const bt = ppq * 4, total = bt * totalBars, beat = ppq;
    const base = rootMidi - 12;
    const tones = chord.iv.map(iv => base + iv);
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      const nextRoot = base; // 単一コード前提: 次小節も主音へ接近
      const line = [
        base,
        tones[Math.floor(R() * tones.length)],
        R() < 0.5 ? tones[Math.floor(R() * tones.length)] : base + (scaleIv[2] || 4),
        nextRoot + (R() < 0.5 ? 1 : -1), // 拍4は半音アプローチ (あえて音階へ寄せない)
      ];
      line.forEach((n, k) => pushNote(ae, bar * bt + k * beat, beat * 0.92, 12, n, k === 0 ? 88 : 74, total));
    }
    return [{ events: ae, name: 'Walking Bass' }];
  }

  /* ═══ 5. Organum / Fauxbourdon ═══ */
  function organum(ctx) {
    const total = ctx.ppq * 4 * ctx.totalBars;
    const mel = melodyOf(ctx).slice(0, 300);
    const ae = [], ae2 = [];
    for (const n of mel) {
      if (T4.organum.mode === 'parallel5') pushNote(ae, n.pos, n.dur, 12, n.note - 7, Math.max(40, n.vel - 10), total);
      else if (T4.organum.mode === 'parallel4') pushNote(ae, n.pos, n.dur, 12, n.note - 5, Math.max(40, n.vel - 10), total);
      else { // fauxbourdon: 平行 3度下 + 6度下 (音階度数で)
        const d = midiToDeg(n.note, ctx);
        if (d !== null) {
          pushNote(ae, n.pos, n.dur, 12, degToMidi(d - 2, ctx.rootMidi, ctx.scaleIv), Math.max(40, n.vel - 10), total);
          pushNote(ae2, n.pos, n.dur, 13, degToMidi(d - 5, ctx.rootMidi, ctx.scaleIv), Math.max(40, n.vel - 14), total);
        }
      }
    }
    const out = [{ events: ae, name: 'Organum' }];
    if (ae2.length) out.push({ events: ae2, name: 'Fauxbourdon' });
    return out.filter(t => t.events.length);
  }
  function midiToDeg(note, ctx) {
    let best = null, bd = 1e9;
    for (let d = -7; d < ctx.scaleIv.length * 3; d++) {
      const m = degToMidi(d, ctx.rootMidi, ctx.scaleIv), df = Math.abs(m - note);
      if (df < bd) { bd = df; best = d; }
    }
    return bd <= 1 ? best : null;
  }

  /* ═══ 6. Aksak ═══ */
  function aksak(ctx) {
    const { ppq, totalBars, rootMidi, chord } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    const GROUPS = { '7/8': [2, 2, 3], '9/8': [2, 2, 2, 3], '11/8': [3, 3, 2, 3], '5/8': [3, 2] };
    const groups = GROUPS[T4.aksak.pattern] || GROUPS['7/8'];
    const cycle = groups.reduce((s, g) => s + g, 0);
    const starts = new Set(); { let a = 0; for (const g of groups) { starts.add(a); a += g; } }
    const ae = [];
    for (let s = 0; s * step < total; s++) {
      const inCycle = s % cycle;
      if (starts.has(inCycle)) pushNote(ae, s * step, step * 0.9, 12, rootMidi - 12, 92, total);
      else if (inCycle % 2 === 0) pushNote(ae, s * step, step * 0.5, 12, rootMidi + 12 + (chord.iv[1] || 7), 54, total);
    }
    return [{ events: ae, name: 'Aksak ' + T4.aksak.pattern }];
  }

  /* ═══ 7. Genetic Phrases ═══ */
  function genetic(ctx) {
    const { ppq, totalBars, scaleIv, chord } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    const L = 8;
    const chordDegs = new Set();
    for (let d = 0; d < scaleIv.length * 2; d++) if (chord.iv.includes(scaleIv[d % scaleIv.length])) chordDegs.add(d);
    const fitness = ph => {
      let smooth = 0, chordHits = 0;
      for (let i = 0; i < L; i++) {
        if (chordDegs.has(ph[i])) chordHits++;
        if (i) smooth -= Math.abs(ph[i] - ph[i - 1]) * 0.4;
      }
      return chordHits * 2 + smooth + new Set(ph).size * 0.3;
    };
    let pop = Array.from({ length: 6 }, () => Array.from({ length: L }, () => Math.floor(R() * scaleIv.length * 1.7)));
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      pop.sort((a, b) => fitness(b) - fitness(a));
      const best = pop[0];
      best.forEach((d, s) => pushNote(ae, bar * bt + s * step, step * 0.88, 12, degToMidi(d, ctx.rootMidi, scaleIv), s === 0 ? 84 : 66, total));
      // 次世代: 上位2個体の交叉 + 変異
      const next = [pop[0], pop[1]];
      while (next.length < 6) {
        const cut = 1 + Math.floor(R() * (L - 2));
        const child = pop[Math.floor(R() * 2)].slice(0, cut).concat(pop[Math.floor(R() * 2)].slice(cut));
        for (let m = 0; m < L; m++) if (R() < 0.18) child[m] = Math.max(0, Math.min(scaleIv.length * 2 - 1, child[m] + (R() < 0.5 ? 1 : -1)));
        next.push(child);
      }
      pop = next;
    }
    return [{ events: ae, name: 'Genetic Phrases' }];
  }

  /* ═══ 8. Ornaments ═══ */
  function ornaments(ctx) {
    const { ppq } = ctx;
    const total = ctx.ppq * 4 * ctx.totalBars;
    const mel = melodyOf(ctx).slice(0, 300);
    const ae = [];
    const grace = Math.max(24, Math.round(ppq / 8));
    for (const n of mel) {
      let mainPos = n.pos, mainDur = n.dur;
      if (n.dur >= ppq * 0.9 && R() < 0.7) { // 前打音
        pushNote(ae, n.pos - grace, grace * 0.9, 12, snapToScale(n.note - 2, ctx), Math.max(40, n.vel - 16), total);
      }
      if (n.dur >= ppq * 1.8) { // モルデント (開始部で上下)
        pushNote(ae, n.pos, grace, 12, n.note, n.vel, total);
        pushNote(ae, n.pos + grace, grace, 12, snapToScale(n.note + 2, ctx), Math.max(40, n.vel - 10), total);
        mainPos = n.pos + grace * 2; mainDur = n.dur - grace * 2;
      }
      pushNote(ae, mainPos, Math.max(40, mainDur), 12, n.note, n.vel, total);
      if (n.dur >= ppq * 3.2) { // トリル (長い音の後半)
        const tStart = n.pos + n.dur * 0.55, tStep = Math.max(30, Math.round(ppq / 6));
        for (let t = tStart, k = 0; t < n.pos + n.dur - tStep; t += tStep, k++)
          pushNote(ae, t, tStep * 0.9, 12, k % 2 ? snapToScale(n.note + 2, ctx) : n.note, Math.max(40, n.vel - 12), total);
      }
    }
    return [{ events: ae, name: 'Melody Ornamented' }];
  }

  /* ═══ 9. Coltrane Changes ═══ */
  function coltrane(ctx) {
    const { ppq, totalBars, rootMidi, chord } = ctx;
    const bt = ppq * 4, total = bt * totalBars, beat = ppq;
    const ae = [];
    const targets = [0, 4, 8]; // 長3度ずつ上がるトニック
    for (let bar = 0; bar < totalBars; bar++) {
      const tgt = rootMidi + targets[bar % 3];
      // 前半: ターゲットの V (属和音のアルペジオ), 後半: ターゲット I
      const vRoot = tgt + 7;
      [0, 4, 7, 11].forEach((iv, k) => pushNote(ae, bar * bt + k * beat * 0.5, beat * 0.44, 12, vRoot + iv, 66, total));
      [0, 4, 7, 12].forEach((iv, k) => pushNote(ae, bar * bt + bt / 2 + k * beat * 0.5, beat * 0.44, 12, tgt, 72, total));
      pushNote(ae, bar * bt, bt * 0.45, 13, vRoot - 12, 74, total);
      pushNote(ae, bar * bt + bt / 2, bt * 0.45, 13, tgt - 12, 80, total);
    }
    return [{ events: ae, name: 'Coltrane Cycle' }];
  }

  /* ═══ 10. Line Cliché ═══ */
  function cliche(ctx) {
    const { ppq, totalBars, rootMidi, chord } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const isMinor = (chord.quality || '').startsWith('m') && !(chord.quality || '').startsWith('maj');
    // マイナー: 1→7→♭7→6 / メジャー: 5→♯5→6→7 (半音の内声ライン)
    const line = isMinor ? [12, 11, 10, 9] : [7, 8, 9, 11];
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      pushNote(ae, bar * bt, bt * 0.94, 12, rootMidi + 12 + line[bar % line.length], 64, total);
      // 静止和音の軽いリヒット
      for (const iv of chord.iv) pushNote(ae, bar * bt, bt * 0.3, 13, rootMidi + iv, 44, total);
    }
    return [{ events: ae, name: 'Line Cliché' }];
  }

  /* ═══ 11. Rondo Form ═══ */
  function rondo(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    // ABACA を小節数へ比例配分
    const plan = [['A', 0.25], ['B', 0.2], ['A', 0.25], ['C', 0.2], ['A', 0.1]];
    const motifA = [0, 2, 4, 2, 5, 4, 2, 1].map(d => degToMidi(d + scaleIv.length, rootMidi, scaleIv));
    const ae = [];
    let barCursor = 0;
    for (const [name, frac] of plan) {
      const bars = Math.max(1, Math.round(totalBars * frac));
      for (let bar = 0; bar < bars && barCursor < totalBars; bar++, barCursor++) {
        for (let s = 0; s < 8; s++) {
          let note;
          if (name === 'A') note = motifA[s];
          else if (name === 'B') note = degToMidi(((s * 2 + bar) % (scaleIv.length * 2)), rootMidi, scaleIv);
          else note = degToMidi(scaleIv.length * 2 - 1 - ((s + bar * 3) % (scaleIv.length * 2)), rootMidi, scaleIv);
          if (name !== 'A' && s % 3 === 2) continue; // エピソードは間引く
          pushNote(ae, barCursor * bt + s * step, step * 0.88, 12, note, name === 'A' ? 80 : 68, total);
        }
      }
    }
    if (ctx.log) ctx.log('// RONDO: A-B-A-C-A form mapped to ' + totalBars + ' bars', 'ok');
    return [{ events: ae, name: 'Rondo' }];
  }

  /* ═══ 12. Call & Response ═══ */
  function callResponse(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    const call = [], resp = [];
    const phraseBars = 2, phraseLen = phraseBars * 8;
    for (let start = 0; start < totalBars; start += phraseBars * 2) {
      // コール: 上行して不安定な度数 (2度/6度) で止まる
      let deg = scaleIv.length;
      const callDegs = [];
      for (let s = 0; s < phraseLen; s++) {
        if (s % 2 === 0 || R() < 0.4) {
          callDegs.push(deg);
          pushNote(call, (start * 8 + s) * step, step * 0.9, 12, degToMidi(deg, rootMidi, scaleIv), 78, total);
        }
        deg += [1, 1, -1, 2, 0][Math.floor(R() * 5)];
        deg = Math.max(scaleIv.length - 2, Math.min(scaleIv.length * 2 - 1, deg));
      }
      // レスポンス: コールの輪郭を下降シーケンス化し主音で終止
      const respStart = start + phraseBars;
      if (respStart >= totalBars) break;
      callDegs.forEach((d, i) => {
        if (i >= phraseLen) return;
        const isLast = i === callDegs.length - 1;
        const nd = isLast ? scaleIv.length : Math.max(0, d - 2);
        pushNote(resp, (respStart * 8 + i) * step, step * 0.9, 13, degToMidi(nd, rootMidi, scaleIv), 70, total);
      });
    }
    return [{ events: call, name: 'Call' }, { events: resp, name: 'Response' }].filter(t => t.events.length);
  }

  /* ═══ 生成フック ═══ */
  function appendTracks4(ctx) {
    const jobs = [
      ['chorale', chorale, 'CHORALE SATB'],
      ['bebop', bebop, 'BEBOP LINES'],
      ['variations', variations, 'VARIATIONS'],
      ['walking', walking, 'WALKING BASS'],
      ['organum', organum, 'ORGANUM'],
      ['aksak', aksak, 'AKSAK'],
      ['genetic', genetic, 'GENETIC PHRASES'],
      ['ornaments', ornaments, 'ORNAMENTS'],
      ['coltrane', coltrane, 'COLTRANE CHANGES'],
      ['cliche', cliche, 'LINE CLICHÉ'],
      ['rondo', rondo, 'RONDO FORM'],
      ['callresp', callResponse, 'CALL & RESPONSE'],
    ];
    for (const [key, fn, label] of jobs) {
      if (!T4[key].enabled) continue;
      try {
        for (const t of fn(ctx)) {
          if (t.events && t.events.length) { ctx.tracks.push(t.events); ctx.tn.push(t.name); }
        }
        if (ctx.log) ctx.log('// ' + label + ': theory pack IV track added', 'ok');
      } catch (e) {
        if (ctx.log) ctx.log('// THEORY PACK IV ' + label + ' error: ' + e.message, 'warn');
      }
    }
  }

  /* ═══ UI ═══ */
  function buildUI() {
    const anchorSec = document.getElementById('theoryPack3Sec') || document.getElementById('theoryPackSec');
    if (!anchorSec || document.getElementById('theoryPack4Sec')) return;
    const sec = document.createElement('div');
    sec.id = 'theoryPack4Sec';
    const head = document.createElement('div');
    head.className = 'tp-head';
    head.textContent = 'Theory Pack IV ';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'NEW THEORY';
    head.appendChild(badge);
    sec.appendChild(head);
    const rows = [
      ['chorale', 'CHORALE (SATB)', '四声体和声付け: 旋律 (ソプラノ) に対し、声部連結を滑らかに保ちながらアルト/テノール/バスを付ける', ''],
      ['bebop', 'BEBOP LINES', 'ビバップ・ライン: 拍頭にコードトーン、エンクロージャーと経過的半音でつなぐ8分音符のフレーズ', ''],
      ['variations', 'THEME & VARIATIONS', '主題と変奏: 2小節ごとに変形が進む (原形→リズム分割→装飾→オクターブ転位→軸反転)', ''],
      ['walking', 'WALKING BASS', 'ウォーキングベース: 4分音符でコードトーンを歩き、拍4で次の主音へ半音アプローチ', ''],
      ['organum', 'ORGANUM', 'オルガヌム/フォーブルドン: 旋律への平行声部 (完全5度/4度の下行、または3度+6度の平行)',
        `<select id="tp4OrganumMode" class="tp-sel"><option value="parallel5">平行5度</option><option value="parallel4">平行4度</option><option value="fauxbourdon">フォーブルドン</option></select>`],
      ['aksak', 'AKSAK', 'アクサク: バルカン/トルコの不等拍子。8分音符グリッドにグループ頭のアクセントを打つ',
        `<select id="tp4AksakPat" class="tp-sel"><option value="7/8">7/8 (2+2+3)</option><option value="9/8">9/8 (2+2+2+3)</option><option value="11/8">11/8 (3+3+2+3)</option><option value="5/8">5/8 (3+2)</option></select>`],
      ['genetic', 'GENETIC PHRASES', '遺伝的生成: フレーズ集団を小節ごとに進化させる。適応度は和音音の的中と輪郭の滑らかさ', ''],
      ['ornaments', 'ORNAMENTS', '装飾音: 前打音/モルデント/トリルを旋律へ織り込んだ装飾版ライン', ''],
      ['coltrane', 'COLTRANE CHANGES', 'コルトレーン・チェンジ: 長3度上のキーへ V→I でトニック化を循環させる', ''],
      ['cliche', 'LINE CLICHÉ', 'ライン・クリシェ: 静止した和音の内声だけが半音階で下降していく定型', ''],
      ['rondo', 'RONDO FORM', 'ロンド形式: ロンド主題 A がエピソード B/C を挟んで回帰する ABACA の大形式', ''],
      ['callresp', 'CALL & RESPONSE', 'コール&レスポンス: 2小節の呼びかけ (不安定な終止) に、主音へ解決する応答が続く', ''],
    ];
    for (const [key, name, desc, extra] of rows) {
      const row = document.createElement('div');
      row.className = 'tog-row';
      row.innerHTML = `<div class="tog-info"><div class="tog-name">${name}</div><div class="tog-desc">${desc}</div></div>${extra}<div class="tog${T4[key].enabled ? ' on' : ''}" id="tp4Tog-${key}"></div>`;
      sec.appendChild(row);
      row.querySelector('.tog').addEventListener('click', ev => {
        T4[key].enabled = !T4[key].enabled;
        ev.currentTarget.classList.toggle('on', T4[key].enabled);
        save();
      });
    }
    const note = document.createElement('div');
    note.className = 'tog-desc';
    note.textContent = 'Theory Pack IV は生成への追加レイヤー (全て既定 OFF)。Pack II/III と併用できる。';
    sec.appendChild(note);
    anchorSec.parentNode.insertBefore(sec, anchorSec.nextSibling);
    const set = (id, val, fn) => { const el = document.getElementById(id); if (!el) return; el.value = String(val); el.addEventListener('change', () => { fn(el.value); save(); }); };
    set('tp4OrganumMode', T4.organum.mode, v => T4.organum.mode = v);
    set('tp4AksakPat', T4.aksak.pattern, v => T4.aksak.pattern = v);
  }

  function init() {
    try {
      if (typeof TheoryPack !== 'undefined' && TheoryPack.appendTracks && !TheoryPack._tp4Wrapped) {
        const orig = TheoryPack.appendTracks;
        TheoryPack.appendTracks = function (ctx) { orig(ctx); appendTracks4(ctx); };
        TheoryPack._tp4Wrapped = true;
      }
    } catch (e) { /* TheoryPack が無い場合は生成に一切関与しない */ }
    buildUI();
    let tries = 0;
    const iv = setInterval(() => {
      if (document.getElementById('theoryPack4Sec') || ++tries > 8) { clearInterval(iv); return; }
      buildUI();
    }, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { STATE: T4, appendTracks: appendTracks4, _engines: { chorale, bebop, variations, walking, organum, aksak, genetic, ornaments, coltrane, cliche, rondo, callResponse } };
})();
