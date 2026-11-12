/* ═══════════════════════════════════════════════════════════════
   85-theory-pack-3.js — Theory Pack III (2026-11-13 追加)
   ───────────────────────────────────────────────────────────────
   Theory Pack II (70) に続く第3弾。既存エンジンには触れず、
   全て既定 OFF。OFF のとき生成には一切関与しない (rng も消費しない)。
   生成への接続は TheoryPack.appendTracks をラップして同じ ctx を
   受け取る形 (22 の呼び出し側は無改造)。

     Canon Forms        比例/反行/逆行/拡大カノン (旋律トラックを変形)
     Micropolyphony     リゲティ式: 微小な時差と音程ドリフトの雲
     Klangfarbenmelodie 旋律音を音色 (チャンネル) へ順次配分
     Additive Process   セルが1音ずつ増減する加算プロセス
     Hocket             旋律を2声に交互分割
     Passacaglia        地下声部 (フォリア/ロマネスカ/下降四音/パッサメッツォ)
     Metric Modulation  後半のグリッドが比率で変調するオスティナート
     Frippertronics     テープループ式: 減衰する世代カノン
     Voice Exchange     旋律と低音の音高集合を小節ごとに入れ替え
     Change Ringing     隣接互換の順列で鐘を鳴らす (プレーンハント)
     Colotomic Cycle    ガムランのコロトミー: 周期を刻む標識音
     Sequence           動機の模進 (段階下降/五度下降/段階上昇)

   状態は localStorage 'meikyoshisui_theorypack3_v1' に保存。
   ═══════════════════════════════════════════════════════════════ */
const TheoryPack3 = (() => {
  'use strict';

  const LS_KEY = 'meikyoshisui_theorypack3_v1';
  const DEF = {
    canon:    { enabled: false, form: 'prolation' },
    micro:    { enabled: false },
    klang:    { enabled: false },
    additive: { enabled: false },
    hocket:   { enabled: false },
    ground:   { enabled: false, pattern: 'folia' },
    metric:   { enabled: false, ratio: '3:2' },
    frip:     { enabled: false },
    exchange: { enabled: false },
    ringing:  { enabled: false },
    colotomic:{ enabled: false },
    sequence: { enabled: false, mode: 'desc-step' },
  };
  let T3 = JSON.parse(JSON.stringify(DEF));
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (saved) for (const k of Object.keys(DEF)) if (saved[k]) Object.assign(T3[k], saved[k]);
  } catch (e) { /* ignore */ }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(T3)); } catch (e) {} }

  /* ── 共通ヘルパは js/89-theory-pack-common.js (TPCommon) へ集約 (2026-11-13) ── */
  const HPC = window.TPCommon || {};
  const { clampNote, pushNote, degToMidi, pcOf, R, snapToScale, parseSmfTrack, notesFromTrack, extractLine, genMelody, melodyOf } = HPC;

  /* ═══ 1. Canon Forms ═══ */
  function canonForms(ctx) {
    const { ppq, totalBars } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const mel = melodyOf(ctx).slice(0, 400);
    const form = T3.canon.form, out = [];
    const mk = (list, ch, velMul, name) => {
      const ae = [];
      for (const n of list) pushNote(ae, n.pos, n.dur, ch, n.note, n.vel * velMul, total);
      if (ae.length) out.push({ events: ae, name });
    };
    if (form === 'prolation') {
      for (const [speed, ch, vm] of [[2, 12, 0.85], [3, 13, 0.7]]) {
        const list = [];
        const span = mel.length ? (mel[mel.length - 1].pos + mel[mel.length - 1].dur) / speed : 0;
        for (let base = 0; base + 10 < total && span > 0; base += span)
          for (const n of mel) list.push({ pos: base + n.pos / speed, dur: n.dur / speed, note: n.note, vel: n.vel });
        mk(list.slice(0, 600), ch, vm, 'Canon x' + speed);
      }
    } else if (form === 'inversion') {
      const axis = ctx.rootMidi + 24;
      mk(mel.map(n => ({ pos: n.pos + bt, dur: n.dur, note: snapToScale(axis * 2 - n.note, ctx), vel: n.vel })), 12, 0.85, 'Canon Inversion');
    } else if (form === 'retrograde') {
      mk(mel.map(n => ({ pos: total - (n.pos + n.dur), dur: n.dur, note: n.note, vel: n.vel })), 12, 0.85, 'Canon Retrograde');
    } else { // augmentation
      mk(mel.filter(n => n.pos * 2 + n.dur * 2 <= total).map(n => ({ pos: n.pos * 2, dur: n.dur * 2, note: n.note, vel: n.vel })), 12, 0.85, 'Canon Augmentation');
    }
    return out;
  }

  /* ═══ 2. Micropolyphony ═══ */
  function micropolyphony(ctx) {
    const mel = melodyOf(ctx).slice(0, 96);
    const drifts = [0, 0, 1, 0, -1, 0, 2, -1];
    const ae = [];
    for (let v = 0; v < 8; v++) {
      const off = v * 41, ch = 12 + (v % 4);
      for (const n of mel) {
        const note = drifts[v] ? snapToScale(n.note + drifts[v], ctx) : n.note;
        pushNote(ae, n.pos + off, n.dur, ch, note, 30 + (v % 3) * 6, ctx.ppq * 4 * ctx.totalBars);
      }
    }
    return [{ events: ae, name: 'Micropolyphony' }];
  }

  /* ═══ 3. Klangfarbenmelodie ═══ */
  function klangfarben(ctx) {
    const total = ctx.ppq * 4 * ctx.totalBars;
    const mel = melodyOf(ctx).slice(0, 400);
    const tracks = [[], [], [], []];
    mel.forEach((n, i) => pushNote(tracks[i % 4], n.pos, n.dur, 12 + (i % 4), n.note, n.vel, total));
    return tracks.map((ae, i) => ({ events: ae, name: 'Klangfarben ' + (i + 1) })).filter(t => t.events.length);
  }

  /* ═══ 4. Additive Process ═══ */
  function additive(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    const cell = [0, 2, 4, 7, 4, 2, 1, 4].map(d => degToMidi(d + scaleIv.length, rootMidi, scaleIv));
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      const phase = bar % 14, k = phase < 8 ? phase + 1 : 14 - phase;
      for (let s = 0; s < k; s++)
        pushNote(ae, bar * bt + s * step, step * 0.9, 12, cell[s], s === 0 ? 84 : 66, total);
    }
    return [{ events: ae, name: 'Additive Process' }];
  }

  /* ═══ 5. Hocket ═══ */
  function hocket(ctx) {
    const total = ctx.ppq * 4 * ctx.totalBars;
    const mel = melodyOf(ctx).slice(0, 400);
    const a = [], b = [];
    mel.forEach((n, i) => {
      if (i % 2 === 0) pushNote(a, n.pos, n.dur, 12, n.note, n.vel, total);
      else pushNote(b, n.pos, n.dur, 13, n.note, Math.max(30, n.vel - 12), total);
    });
    return [{ events: a, name: 'Hocket A' }, { events: b, name: 'Hocket B' }].filter(t => t.events.length);
  }

  /* ═══ 6. Passacaglia (ground bass) ═══ */
  function passacaglia(ctx) {
    const { ppq, totalBars, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const base = rootMidi - 12;
    // [semitone offset, length in bars] の地下定型
    const PATS = {
      folia:      [[0,1],[7,1],[0,1],[10,1],[3,1],[10,1],[0,1],[7,1]],
      romanesca:  [[0,1],[7,1],[9,1],[4,1],[5,1],[0,1],[5,1],[7,1]],
      tetrachord: [[0,0.5],[-2,0.5],[-4,0.5],[-5,0.5]],
      passamezzo: [[0,1],[10,1],[0,1],[7,1],[5,1],[0,1],[5,1],[7,1]],
    };
    const pat = PATS[T3.ground.pattern] || PATS.folia;
    const cycleBars = pat.reduce((s, p) => s + p[1], 0);
    const ae = [];
    for (let start = 0; start < totalBars; start += cycleBars) {
      let cur = start;
      for (const [off, len] of pat) {
        if (cur >= totalBars) break;
        const pos = cur * bt, dur = bt * len;
        pushNote(ae, pos, dur * 0.92, 12, base + off, 88, total);
        pushNote(ae, pos + dur / 2, dur * 0.42, 12, base + off + 7, 52, total);
        cur += len;
      }
    }
    return [{ events: ae, name: 'Passacaglia Ground' }];
  }

  /* ═══ 7. Metric Modulation ═══ */
  function metricMod(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const ratios = { '3:2': 2 / 3, '4:3': 3 / 4, '5:4': 4 / 5, '2:3': 3 / 2 };
    const f = ratios[T3.metric.ratio] || 2 / 3;
    const pat = [0, 4, 2, 5, 3, 6, 4, 1].map(d => degToMidi(d + scaleIv.length, rootMidi, scaleIv));
    const ae = [];
    const half = Math.floor(totalBars / 2);
    for (let bar = 0; bar < totalBars; bar++) {
      const step = (ppq / 2) * (bar < half ? 1 : f);
      for (let s = 0, i = 0; bar * bt + s < (bar + 1) * bt - 20; s += step, i++)
        pushNote(ae, bar * bt + s, step * 0.85, 13, pat[i % pat.length], i % 8 === 0 ? 82 : 62, total);
    }
    return [{ events: ae, name: 'Metric Modulation' }];
  }

  /* ═══ 8. Frippertronics ═══ */
  function frippertronics(ctx) {
    const { ppq, totalBars } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const mel = melodyOf(ctx).slice(0, 300);
    const ae = [];
    for (const [gen, decay] of [[1, 0.72], [2, 0.5], [3, 0.34]])
      for (const n of mel) pushNote(ae, n.pos + gen * bt, n.dur, 13, n.note, n.vel * decay, total);
    return [{ events: ae, name: 'Tape Loop Canon' }];
  }

  /* ═══ 9. Voice Exchange ═══ */
  function voiceExchange(ctx) {
    const { ppq, totalBars } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const mel = melodyOf(ctx);
    let bass = extractLine(ctx, /bass/i);
    if (!bass) {
      bass = [];
      for (let bar = 0; bar < totalBars; bar++)
        bass.push({ pos: bar * bt, dur: bt * 0.9, note: ctx.rootMidi - 12, vel: 80 });
    }
    const aeM = [], aeB = [];
    const bassPitchOfBar = bar => {
      const n = bass.find(x => x.pos >= bar * bt && x.pos < (bar + 1) * bt);
      return n ? n.note : ctx.rootMidi - 12;
    };
    const melPitchOfBar = bar => {
      const n = mel.find(x => x.pos >= bar * bt && x.pos < (bar + 1) * bt);
      return n ? n.note : ctx.rootMidi + 12;
    };
    for (const n of mel) {
      const bar = Math.floor(n.pos / bt);
      const note = bar % 2 === 1 ? clampNote(bassPitchOfBar(bar) + 24) : n.note;
      pushNote(aeM, n.pos, n.dur, 12, note, n.vel, total);
    }
    for (const n of bass) {
      const bar = Math.floor(n.pos / bt);
      const note = bar % 2 === 1 ? clampNote(melPitchOfBar(bar) - 24) : n.note;
      pushNote(aeB, n.pos, n.dur, 13, note, n.vel, total);
    }
    return [{ events: aeM, name: 'Exchange Melody' }, { events: aeB, name: 'Exchange Bass' }].filter(t => t.events.length);
  }

  /* ═══ 10. Change Ringing (plain hunt) ═══ */
  function changeRinging(ctx) {
    const { ppq, totalBars, chord, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    let bells = [...new Set(chord.iv.map(iv => rootMidi + 12 + iv))].sort((a, b) => a - b);
    while (bells.length < 4) bells.push(bells[bells.length - 1] + 12);
    bells = bells.slice(0, 6);
    const n = bells.length;
    let order = bells.map((_, i) => i);
    const ae = [];
    let pos = 0, change = 0;
    const maxRows = Math.floor(total / step / n);
    for (let row = 0; row < maxRows; row++) {
      for (let k = 0; k < n; k++) pushNote(ae, pos + k * step, step * 0.95, 12, bells[order[k]], k === 0 ? 84 : 68, total);
      pos += n * step;
      // 隣接互換: 偶数回目は (0,1)(2,3)…, 奇数回目は (1,2)(3,4)…
      const startAt = change % 2 === 0 ? 0 : 1;
      for (let i = startAt; i + 1 < n; i += 2) { const t = order[i]; order[i] = order[i + 1]; order[i + 1] = t; }
      change++;
      if (change > 2 * n + 4) { order = bells.map((_, i) => i); change = 0; }
    }
    return [{ events: ae, name: 'Change Ringing' }];
  }

  /* ═══ 11. Colotomic Cycle ═══ */
  function colotomic(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, beat = ppq;
    const gong = degToMidi(0, rootMidi - 12, scaleIv);
    const kenong = degToMidi(4, rootMidi, scaleIv);
    const kempul = degToMidi(2, rootMidi, scaleIv);
    const kethuk = degToMidi(scaleIv.length - 1, rootMidi, scaleIv);
    const ae = [];
    for (let b = 0; b < totalBars * 4; b++) {
      const pos = b * beat, inCycle = b % 16;
      if (inCycle === 0) pushNote(ae, pos, beat * 3.6, 12, gong, 92, total);
      else if (inCycle === 8) pushNote(ae, pos, beat * 1.8, 12, kenong, 72, total);
      else if (inCycle % 4 === 0) pushNote(ae, pos, beat * 0.9, 12, kempul, 58, total);
      else if (inCycle % 2 === 0) pushNote(ae, pos, beat * 0.4, 12, kethuk, 40, total);
    }
    return [{ events: ae, name: 'Colotomic Cycle' }];
  }

  /* ═══ 12. Sequence ═══ */
  function sequenceEngine(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const mel = melodyOf(ctx);
    const figure = mel.filter(n => n.pos < bt);
    const src = figure.length ? figure : [{ pos: 0, dur: ppq / 2, note: degToMidi(scaleIv.length, rootMidi, scaleIv), vel: 76 }];
    const toDeg = note => {
      // 音高をスケール度数へ近似変換 (オクターブ込み)
      let best = 0, bd = 1e9;
      for (let d = -7; d < scaleIv.length * 3; d++) {
        const m = degToMidi(d, rootMidi, scaleIv), df = Math.abs(m - note);
        if (df < bd) { bd = df; best = d; }
      }
      return best;
    };
    const shifts = { 'desc-step': -1, 'fifth': -4, 'asc-step': 1 };
    const shift = shifts[T3.sequence.mode] != null ? shifts[T3.sequence.mode] : -1;
    const ae = [];
    const reps = Math.min(totalBars, 8);
    for (let r = 0; r < reps; r++)
      for (const n of src) {
        const deg = toDeg(n.note) + shift * r;
        pushNote(ae, r * bt + n.pos, n.dur, 12, degToMidi(deg, rootMidi, scaleIv), Math.max(40, n.vel - r * 4), total);
      }
    return [{ events: ae, name: 'Sequence' }];
  }

  /* ═══ 生成フック ═══ */
  function appendTracks3(ctx) {
    const jobs = [
      ['canon', canonForms, 'CANON FORMS'],
      ['micro', micropolyphony, 'MICROPOLYPHONY'],
      ['klang', klangfarben, 'KLANGFARBEN'],
      ['additive', additive, 'ADDITIVE PROCESS'],
      ['hocket', hocket, 'HOCKET'],
      ['ground', passacaglia, 'PASSACAGLIA'],
      ['metric', metricMod, 'METRIC MODULATION'],
      ['frip', frippertronics, 'FRIPPERTRONICS'],
      ['exchange', voiceExchange, 'VOICE EXCHANGE'],
      ['ringing', changeRinging, 'CHANGE RINGING'],
      ['colotomic', colotomic, 'COLOTOMIC CYCLE'],
      ['sequence', sequenceEngine, 'SEQUENCE'],
    ];
    for (const [key, fn, label] of jobs) {
      if (!T3[key].enabled) continue;
      try {
        for (const t of fn(ctx)) {
          if (t.events && t.events.length) { ctx.tracks.push(t.events); ctx.tn.push(t.name); }
        }
        if (ctx.log) ctx.log('// ' + label + ': theory pack III track added', 'ok');
      } catch (e) {
        if (ctx.log) ctx.log('// THEORY PACK III ' + label + ' error: ' + e.message, 'warn');
      }
    }
  }

  /* ═══ UI ═══ */
  function buildUI() {
    const anchorSec = document.getElementById('theoryPackSec');
    if (!anchorSec || document.getElementById('theoryPack3Sec')) return;
    const sec = document.createElement('div');
    sec.id = 'theoryPack3Sec';
    const head = document.createElement('div');
    head.className = 'tp-head';
    head.textContent = 'Theory Pack III ';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'NEW THEORY';
    head.appendChild(badge);
    sec.appendChild(head);
    const rows = [
      ['canon', 'CANON FORMS', 'カノンの諸形式: 比例 (速度比) / 反行 / 逆行 / 拡大で旋律トラックを対位的に重ねる',
        `<select id="tp3CanonForm" class="tp-sel"><option value="prolation">比例 1:2:3</option><option value="inversion">反行</option><option value="retrograde">逆行</option><option value="augmentation">拡大</option></select>`],
      ['micro', 'MICROPOLYPHONY', 'リゲティのマイクロポリフォニー: 旋律を8声に分け、微小な時差と音程の揺らぎで音の雲にする', ''],
      ['klang', 'KLANGFARBENMELODIE', '音色旋律 (シェーンベルク/ヴェーベルン): 旋律の各音を別チャンネルへ順番に配り、音色の連なりで旋律を描く', ''],
      ['additive', 'ADDITIVE PROCESS', '加算プロセス (グラス/ライヒ): 短いセルが1音ずつ増えて満ち、また減っていく', ''],
      ['hocket', 'HOCKET', 'ホケット: 旋律を1音ごとに2声へ交互に割り振り、互いに食い合うように鳴らす中世の技法', ''],
      ['ground', 'PASSACAGLIA', 'パッサカリア: 地下定型 (フォリア/ロマネスカ/下降四音/パッサメッツォ) が全編を循環する',
        `<select id="tp3GroundPat" class="tp-sel"><option value="folia">Folia</option><option value="romanesca">Romanesca</option><option value="tetrachord">下降四音</option><option value="passamezzo">Passamezzo</option></select>`],
      ['metric', 'METRIC MODULATION', 'メトリック・モジュレーション (カーター): 後半のオスティナートの刻みが比率で変調する',
        `<select id="tp3MetricRatio" class="tp-sel"><option value="3:2">3:2 加速</option><option value="4:3">4:3 加速</option><option value="5:4">5:4 加速</option><option value="2:3">2:3 減速</option></select>`],
      ['frip', 'FRIPPERTRONICS', 'フリッパートロニクス: 旋律が1小節遅れで減衰しながら3世代重なるテープループ・カノン', ''],
      ['exchange', 'VOICE EXCHANGE', '声部交換 (Stimmtausch): 旋律と低音の音高を小節ごとに入れ替え、リズムだけを残す', ''],
      ['ringing', 'CHANGE RINGING', '変化鐘: コードトーンの鐘を隣接互換の順列 (プレーンハント) で鳴らし続ける英国の作法', ''],
      ['colotomic', 'COLOTOMIC CYCLE', 'コロトミー (ガムラン): 16拍周期を大ゴング/ケノン/ケンプルの標識音で区切る', ''],
      ['sequence', 'SEQUENCE', '模進 (セクエンツ): 1小節の動機を音階の度数でずらしながら反復する',
        `<select id="tp3SeqMode" class="tp-sel"><option value="desc-step">段階下降</option><option value="fifth">五度下降</option><option value="asc-step">段階上昇</option></select>`],
    ];
    for (const [key, name, desc, extra] of rows) {
      const row = document.createElement('div');
      row.className = 'tog-row';
      row.innerHTML = `<div class="tog-info"><div class="tog-name">${name}</div><div class="tog-desc">${desc}</div></div>${extra}<div class="tog${T3[key].enabled ? ' on' : ''}" id="tp3Tog-${key}"></div>`;
      sec.appendChild(row);
      row.querySelector('.tog').addEventListener('click', ev => {
        T3[key].enabled = !T3[key].enabled;
        ev.currentTarget.classList.toggle('on', T3[key].enabled);
        save();
      });
    }
    const note = document.createElement('div');
    note.className = 'tog-desc';
    note.textContent = 'Theory Pack III は生成への追加レイヤー (全て既定 OFF)。カノン/ホケット等は旋律トラック (薄い場合はスケール生成の旋律) を素材に変形する。';
    sec.appendChild(note);
    anchorSec.parentNode.insertBefore(sec, anchorSec.nextSibling);
    const set = (id, val, fn) => { const el = document.getElementById(id); if (!el) return; el.value = String(val); el.addEventListener('change', () => { fn(el.value); save(); }); };
    set('tp3CanonForm', T3.canon.form, v => T3.canon.form = v);
    set('tp3GroundPat', T3.ground.pattern, v => T3.ground.pattern = v);
    set('tp3MetricRatio', T3.metric.ratio, v => T3.metric.ratio = v);
    set('tp3SeqMode', T3.sequence.mode, v => T3.sequence.mode = v);
  }

  function init() {
    /* Theory Pack II の appendTracks をラップして同じ ctx を受け取る */
    try {
      if (typeof TheoryPack !== 'undefined' && TheoryPack.appendTracks && window.TPCommon && !TheoryPack._tp3Wrapped) {
        const orig = TheoryPack.appendTracks;
        TheoryPack.appendTracks = function (ctx) { orig(ctx); appendTracks3(ctx); };
        TheoryPack._tp3Wrapped = true;
      }
    } catch (e) { /* TheoryPack が無い場合は生成に一切関与しない */ }
    buildUI();
    /* Pack II の UI 構築が遅れた場合に備えて数回だけ再試行 */
    let tries = 0;
    const iv = setInterval(() => {
      if (document.getElementById('theoryPack3Sec') || ++tries > 8) { clearInterval(iv); return; }
      buildUI();
    }, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { STATE: T3, appendTracks: appendTracks3, _engines: { canonForms, micropolyphony, klangfarben, additive, hocket, passacaglia, metricMod, frippertronics, voiceExchange, changeRinging, colotomic, sequenceEngine } };
})();
