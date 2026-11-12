/* ═══════════════════════════════════════════════════════════════
   88-theory-pack-6.js — Theory Pack VI (2026-11-13 追加)
   ───────────────────────────────────────────────────────────────
   Theory Pack V (87) に続く第6弾。コード全体を精査して「本当に
   未実装」と確認できた最後の3技法を実装する。接続方法は 85〜87
   と同じ (TheoryPack.appendTracks のラップ)。全て既定 OFF。

     Brownian / 1/f   ブラウン運動 (反射ランダムウォーク) と
                      Voss-McCartney 法の 1/f ゆらぎ旋律
     Sonification     素数列・π・e・φ・フィボナッチを音程へ写像
     Tempo Canon      無理数比 (√2, φ, √3, π/2) のテンポカノン
                      (ナンカロウ式: 同じ旋律が割り切れない速さで追う)

   状態は localStorage 'meikyoshisui_theorypack6_v1' に保存。
   ═══════════════════════════════════════════════════════════════ */
const TheoryPack6 = (() => {
  'use strict';

  const LS_KEY = 'meikyoshisui_theorypack6_v1';
  const DEF = {
    brownian:   { enabled: false, mode: 'brown' },
    sonify:     { enabled: false, source: 'primes' },
    tempocanon: { enabled: false, ratio: 'sqrt2' },
  };
  let T6 = JSON.parse(JSON.stringify(DEF));
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (saved) for (const k of Object.keys(DEF)) if (saved[k]) Object.assign(T6[k], saved[k]);
  } catch (e) { /* ignore */ }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(T6)); } catch (e) {} }

  /* ── 共通ヘルパ (85〜87 と同じ作法) ── */
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

  /* ═══ 1. Brownian / 1/f ═══ */
  function brownian(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const total = ppq * 4 * totalBars, step = ppq / 2;
    const range = scaleIv.length * 2;
    const ae = [];
    const steps = totalBars * 8;
    if (T6.brownian.mode === 'pink') {
      // Voss–McCartney: 周期の異なるダイスの合計が 1/f ゆらぎになる
      const DICE = 5;
      const dice = Array.from({ length: DICE }, () => Math.floor(R() * range));
      for (let i = 0; i < steps; i++) {
        let v = 0;
        for (let k = 0; k < DICE; k++) {
          if (i % (1 << k) === 0) dice[k] = Math.floor(R() * range);
          v += dice[k];
        }
        const deg = Math.round(v / DICE);
        if (i % 2 === 0 || R() < 0.6) pushNote(ae, i * step, step * 0.9, 12, degToMidi(deg, rootMidi, scaleIv), 72, total);
      }
      return [{ events: ae, name: '1/f Melody (Voss)' }];
    }
    // ブラウン運動: ガウス的な歩幅のランダムウォーク + 範囲端で反射
    let x = scaleIv.length;
    const gauss = () => (R() + R() + R() - 1.5) * 2;
    for (let i = 0; i < steps; i++) {
      pushNote(ae, i * step, step * 0.9, 12, degToMidi(Math.round(x), rootMidi, scaleIv), i % 8 === 0 ? 82 : 68, total);
      x += gauss() * 1.4;
      if (x < 0) x = -x;
      if (x > range - 1) x = 2 * (range - 1) - x;
      x = Math.max(0, Math.min(range - 1, x));
    }
    return [{ events: ae, name: 'Brownian Walk' }];
  }

  /* ═══ 2. Sonification ═══ */
  const DIGITS = {
    pi: '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679',
    e: '7182818284590452353602874713526624977572470936999595749669676277240766303535475945713821785251664274',
    phi: '61803398874989484820458683436563811772030917980576286213544862270526046281890',
  };
  function primesUpTo(n) {
    const sieve = new Array(n + 1).fill(true); sieve[0] = sieve[1] = false;
    for (let i = 2; i * i <= n; i++) if (sieve[i]) for (let j = i * i; j <= n; j += i) sieve[j] = false;
    const out = [];
    for (let i = 2; i <= n; i++) if (sieve[i]) out.push(i);
    return out;
  }
  function sonify(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const total = ppq * 4 * totalBars, step = ppq / 2;
    const L = scaleIv.length, steps = totalBars * 8;
    const ae = [];
    const src = T6.sonify.source;
    let seq = [], label = '';
    if (src === 'primes') {
      const pr = primesUpTo(541);
      seq = pr.map(p => p % (L * 2));
      label = 'Primes';
    } else if (src === 'fib') {
      let a = 0, b = 1;
      for (let i = 0; i < 100; i++) { seq.push(a % (L * 2)); [a, b] = [b, a + b]; }
      label = 'Fibonacci';
    } else {
      seq = DIGITS[src].split('').map(Number).map(d => d % (L * 2));
      label = { pi: 'π Digits', e: 'e Digits', phi: 'φ Digits' }[src];
    }
    for (let i = 0; i < steps; i++) {
      const deg = seq[i % seq.length];
      pushNote(ae, i * step, step * 0.88, 12, degToMidi(deg, rootMidi, scaleIv), i % 8 === 0 ? 84 : 66, total);
    }
    return [{ events: ae, name: 'Sonify: ' + label }];
  }

  /* ═══ 3. Irrational Tempo Canon ═══ */
  function tempoCanon(ctx) {
    const total = ctx.ppq * 4 * ctx.totalBars;
    const RATIOS = { sqrt2: Math.SQRT2, phi: (1 + Math.sqrt(5)) / 2, sqrt3: Math.sqrt(3), pi2: Math.PI / 2 };
    const ratio = RATIOS[T6.tempocanon.ratio] || Math.SQRT2;
    const mel = melodyOf(ctx).slice(0, 160);
    const aA = [], aB = [];
    for (const n of mel) {
      pushNote(aA, n.pos, n.dur, 12, n.note, n.vel, total);
      const posB = n.pos * ratio;
      if (posB < total - 40) pushNote(aB, posB, n.dur * ratio, 13, n.note, Math.max(40, n.vel - 8), total);
    }
    const names = { sqrt2: '√2', phi: 'φ', sqrt3: '√3', pi2: 'π/2' };
    return [{ events: aA, name: 'Canon Dux' }, { events: aB, name: 'Canon Comes ×' + (names[T6.tempocanon.ratio] || '√2') }].filter(t => t.events.length);
  }

  /* ═══ 生成フック ═══ */
  function appendTracks6(ctx) {
    const jobs = [
      ['brownian', brownian, 'BROWNIAN / 1/f'],
      ['sonify', sonify, 'SONIFICATION'],
      ['tempocanon', tempoCanon, 'IRRATIONAL TEMPO CANON'],
    ];
    for (const [key, fn, label] of jobs) {
      if (!T6[key].enabled) continue;
      try {
        for (const t of fn(ctx)) {
          if (t.events && t.events.length) { ctx.tracks.push(t.events); ctx.tn.push(t.name); }
        }
        if (ctx.log) ctx.log('// ' + label + ': theory pack VI track added', 'ok');
      } catch (e) {
        if (ctx.log) ctx.log('// THEORY PACK VI ' + label + ' error: ' + e.message, 'warn');
      }
    }
  }

  /* ═══ UI ═══ */
  function buildUI() {
    const anchorSec = document.getElementById('theoryPack5Sec') || document.getElementById('theoryPack4Sec') || document.getElementById('theoryPackSec');
    if (!anchorSec || document.getElementById('theoryPack6Sec')) return;
    const sec = document.createElement('div');
    sec.id = 'theoryPack6Sec';
    const head = document.createElement('div');
    head.className = 'tp-head';
    head.textContent = 'Theory Pack VI ';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'NEW THEORY';
    head.appendChild(badge);
    sec.appendChild(head);
    const rows = [
      ['brownian', 'BROWNIAN / 1/f', 'ブラウン運動の反射ランダムウォーク旋律、または Voss–McCartney 法による 1/f (ピンクノイズ) ゆらぎ旋律',
        `<select id="tp6BrownMode" class="tp-sel"><option value="brown">ブラウン運動</option><option value="pink">1/f ゆらぎ</option></select>`],
      ['sonify', 'SONIFICATION', '数列の音化: 素数列・π・e・φ・フィボナッチの値を音階の度数へ写像する',
        `<select id="tp6SonifySrc" class="tp-sel"><option value="primes">素数列</option><option value="pi">π</option><option value="e">e</option><option value="phi">φ</option><option value="fib">フィボナッチ</option></select>`],
      ['tempocanon', 'IRRATIONAL TEMPO CANON', '無理数比テンポカノン (ナンカロウ): 同じ旋律が割り切れない速さ比で追いかけ、永遠に位相が合わない',
        `<select id="tp6TempoRatio" class="tp-sel"><option value="sqrt2">×√2</option><option value="phi">×φ</option><option value="sqrt3">×√3</option><option value="pi2">×π/2</option></select>`],
    ];
    for (const [key, name, desc, extra] of rows) {
      const row = document.createElement('div');
      row.className = 'tog-row';
      row.innerHTML = `<div class="tog-info"><div class="tog-name">${name}</div><div class="tog-desc">${desc}</div></div>${extra}<div class="tog${T6[key].enabled ? ' on' : ''}" id="tp6Tog-${key}"></div>`;
      sec.appendChild(row);
      row.querySelector('.tog').addEventListener('click', ev => {
        T6[key].enabled = !T6[key].enabled;
        ev.currentTarget.classList.toggle('on', T6[key].enabled);
        save();
      });
    }
    const note = document.createElement('div');
    note.className = 'tog-desc';
    note.textContent = 'Theory Pack VI は生成への追加レイヤー (全て既定 OFF)。コード精査で「未実装」と確認できた最後の3技法。';
    sec.appendChild(note);
    anchorSec.parentNode.insertBefore(sec, anchorSec.nextSibling);
    const set = (id, val, fn) => { const el = document.getElementById(id); if (!el) return; el.value = String(val); el.addEventListener('change', () => { fn(el.value); save(); }); };
    set('tp6BrownMode', T6.brownian.mode, v => T6.brownian.mode = v);
    set('tp6SonifySrc', T6.sonify.source, v => T6.sonify.source = v);
    set('tp6TempoRatio', T6.tempocanon.ratio, v => T6.tempocanon.ratio = v);
  }

  function init() {
    try {
      if (typeof TheoryPack !== 'undefined' && TheoryPack.appendTracks && !TheoryPack._tp6Wrapped) {
        const orig = TheoryPack.appendTracks;
        TheoryPack.appendTracks = function (ctx) { orig(ctx); appendTracks6(ctx); };
        TheoryPack._tp6Wrapped = true;
      }
    } catch (e) { /* TheoryPack が無い場合は生成に一切関与しない */ }
    buildUI();
    let tries = 0;
    const iv = setInterval(() => {
      if (document.getElementById('theoryPack6Sec') || ++tries > 8) { clearInterval(iv); return; }
      buildUI();
    }, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { STATE: T6, appendTracks: appendTracks6, _engines: { brownian, sonify, tempoCanon } };
})();
