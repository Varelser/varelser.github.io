/* ═══════════════════════════════════════════════════════════════
   70-theory-pack.js — Theory Pack II (2026-11-10 追加)
   ───────────────────────────────────────────────────────────────
   監査後に「未実装で実装すべき理論」として挙げた8件を実装する
   追加モジュール。既存エンジンには触れず、全て既定 OFF。
   OFF のとき生成には一切関与しない (rng も消費しない)。

     生成系 (appendTracks が doGenerate のトラック結合後に呼ばれる)
       Tintinnabuli  (Arvo Pärt)      M声部 (階梯旋律) + T声部 (和音音のみ)
       Phasing       (Steve Reich)    同一パターンの位相を周期ごとにずらす
       Isorhythm     (中世)           talea (リズム周期) × color (音高周期)
       Shepard Tone                   ガウス包絡のオクターブ層による無限上昇
       Species Counterpoint (Fux)     第1種対位法 (協和のみ・並達進行の回避)

     音律/音階系 (既存データ体系への登録)
       Adaptive JI   CompTuning に 'AdaptiveJI' 音律を登録。
                     現在のコード構成音を純正比に寄せる動的セント表
       Partch Diamond 11-limit トーナリティ・ダイヤモンドの比格子を
                     1オクターブへ折り畳んだ29音を MICRO 音階として登録
       Bohlen-Pierce 3:1 (トリターヴ) を13等分する音階を MICRO 音階として登録

   状態は localStorage 'meikyoshisui_theorypack_v1' に保存 (表示/生成の
   追加分のみ。StatePersist には触れない)。
   ═══════════════════════════════════════════════════════════════ */
const TheoryPack = (() => {
  'use strict';

  const LS_KEY = 'meikyoshisui_theorypack_v1';
  const DEF = {
    tint:    { enabled: false, position: 'below', notesPerBar: 2 },
    phase:   { enabled: false, len: 12 },
    iso:     { enabled: false, taleaKey: 'classic' },
    shepard: { enabled: false, layers: 5 },
    species: { enabled: false, kind: '1' },
    cadence: { enabled: false, form: 'neapolitan' },
    rhythm:  { enabled: false, pattern: 'son32' },
    risset:  { enabled: false },
    tartini: { enabled: false },
    serial:  { enabled: false },
    ca:      { enabled: false, rule: 30 },
    chance:  { enabled: false },
    quartal: { enabled: false },
    fugue:   { enabled: false },
    sonata:  { enabled: false },
  };
  let TP = JSON.parse(JSON.stringify(DEF));
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (saved) for (const k of Object.keys(DEF)) if (saved[k]) Object.assign(TP[k], saved[k]);
  } catch (e) { /* ignore */ }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(TP)); } catch (e) {} }

  /* ── 共通ヘルパ ── */
  const clampNote = n => { n = Math.round(n); while (n < 12) n += 12; while (n > 115) n -= 12; return n; };
  function pushNote(ae, pos, dur, ch, note, vel, total) {
    pos = Math.round(pos);
    if (pos < 0 || pos >= total) return;
    const n = clampNote(note), v = Math.max(1, Math.min(127, Math.round(vel)));
    ae.push({ pos, v: [0x90 | ch, n, v] });
    ae.push({ pos: Math.min(pos + Math.max(30, Math.round(dur)), total - 1), v: [0x80 | ch, n, 0] });
  }
  /* スケール度数 (負・範囲外可) → MIDI ノート */
  function degToMidi(deg, rootMidi, iv) {
    const L = iv.length;
    const oct = Math.floor(deg / L), idx = ((deg % L) + L) % L;
    return rootMidi + oct * 12 + iv[idx];
  }
  const R = () => (typeof rng === 'function' ? rng() : Math.random());

  /* ═══ 1. Tintinnabuli (Pärt) ═══
     M声部: スケール上の階梯的ランダムウォーク (跳躍は稀)。
     T声部: 各 M 音に対し、指定方向で最も近いコードトーン。
     position: 'below' | 'above' | 'alternate' (第1/第2ポジションの簡略形) */
  function tintinnabuli(ctx) {
    const { ppq, totalBars, chord, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const npb = Math.max(1, TP.tint.notesPerBar | 0);
    const stepDur = bt / npb, steps = totalBars * npb;
    const chordPcs = new Set(chord.iv.map(i => ((chord.root + i) % 12 + 12) % 12));
    const candTones = [];
    for (let n = 12; n <= 115; n++) if (chordPcs.has(n % 12)) candTones.push(n);
    const aeM = [], aeT = [];
    let deg = 0;
    for (let i = 0; i < steps; i++) {
      const pos = Math.round(i * stepDur);
      const mNote = degToMidi(deg, rootMidi + 12, scaleIv);
      pushNote(aeM, pos, stepDur * 0.92, 0x04, mNote, 84, total);
      let tNote = null;
      const below = candTones.filter(n => n <= mNote), above = candTones.filter(n => n >= mNote);
      if (TP.tint.position === 'below') tNote = below.length ? below[below.length - 1] : above[0];
      else if (TP.tint.position === 'above') tNote = above.length ? above[0] : below[below.length - 1];
      else tNote = (i % 2 === 0) ? (below.length ? below[below.length - 1] : above[0])
                                 : (above.length ? above[0] : below[below.length - 1]);
      if (tNote != null) pushNote(aeT, pos, stepDur * 0.92, 0x05, tNote, 66, total);
      const r = R();
      deg += r < 0.32 ? -1 : r < 0.64 ? 1 : r < 0.78 ? -2 : r < 0.92 ? 2 : 0;
      deg = Math.max(-3, Math.min(scaleIv.length + 3, deg));
    }
    return [{ events: aeM, name: 'Tintinnabuli M' }, { events: aeT, name: 'Tintinnabuli T' }];
  }

  /* ═══ 2. Phasing (Reich) ═══
     同一パターンを2声で繰り返し、B声部は周期ごとに phaseStep ステップ
     ずつ開始位置が後ろへずれる (離散近似)。ずれが pattern 長に一致すると
     再びユニゾンに戻る。パターンはコードトーンのスケール度数列。 */
  function phasing(ctx) {
    const { ppq, totalBars, chord, scaleIv, rootMidi } = ctx;
    const stepDur = ppq / 2;                       /* 8分音符グリッド */
    const totalSteps = totalBars * 8;
    const total = ppq * 4 * totalBars;
    const L = Math.max(4, TP.phase.len | 0);
    /* コードトーンに最も近いスケール度数を集めてパターン化 */
    const degs = [];
    for (const s of chord.iv) {
      let best = 0, bd = 99;
      scaleIv.forEach((v, i) => { const d = Math.abs(v - s); if (d < bd) { bd = d; best = i; } });
      degs.push(best);
    }
    const pattern = [];
    for (let i = 0; i < L; i++) pattern.push(degs[i % degs.length] + (i % 3 === 2 ? scaleIv.length : 0));
    const aeA = [], aeB = [];
    for (let s = 0; s < totalSteps; s++) {
      const note = degToMidi(pattern[s % L], rootMidi + 12, scaleIv);
      pushNote(aeA, Math.round(s * stepDur), stepDur * 0.8, 0x06, note, 88, total);
    }
    /* B: 周期 k では開始オフセット k ステップ (累積) */
    let placed = 0, cycle = 0;
    while (placed < totalSteps) {
      const offset = cycle;                        /* この周期のずれ (ステップ数) */
      for (let i = 0; i < L && placed + offset + i < totalSteps + L; i++) {
        const sPos = placed + offset + i;
        if (sPos >= totalSteps) break;
        const note = degToMidi(pattern[i], rootMidi + 12, scaleIv);
        pushNote(aeB, Math.round(sPos * stepDur), stepDur * 0.8, 0x07, note, 78, total);
      }
      placed += L + cycle;                         /* 周期ごとにずれが 1 ずつ増える */
      cycle++;
      if (cycle > L * 2) break;                    /* 安全上限 */
    }
    return [{ events: aeA, name: 'Phase A' }, { events: aeB, name: 'Phase B' }];
  }

  /* ═══ 3. Isorhythm ═══
     talea (音価の周期) と color (音高の周期) を独立に繰り返す。
     全体の周期は lcm(|talea|, |color|) 音符。 */
  const TALEAS = {
    classic: [2, 1, 2, 3, 1, 2],        /* 4分音符単位 */
    additive: [3, 2, 1, 2],
    long: [4, 2, 2, 3, 1, 2, 2],
  };
  function isorhythm(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const total = ppq * 4 * totalBars;
    const talea = TALEAS[TP.iso.taleaKey] || TALEAS.classic;
    const color = [0, 2, 4, 3, 1, 5, 4];          /* スケール度数列 */
    const ae = [];
    let t = 0, i = 0;
    while (t < total) {
      const dur = talea[i % talea.length] * ppq;
      pushNote(ae, t, dur * 0.92, 0x08, degToMidi(color[i % color.length], rootMidi + 12, scaleIv), 82, total);
      t += dur; i++;
    }
    return [{ events: ae, name: 'Isorhythm' }];
  }

  /* ═══ 4. Shepard Tone ═══
     オクターブ層が半音ずつ上昇し、音量は高さに対するガウス包絡。
     上端に達した層は下端へ戻る (重みほぼ0のため継ぎ目が聞こえない)。 */
  function shepard(ctx) {
    const { ppq, totalBars, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const layers = Math.max(3, Math.min(7, TP.shepard.layers | 0));
    const base = Math.max(24, rootMidi - 24);
    const span = layers * 12;
    const sigma = layers / 3.2;
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      for (let k = 0; k < layers; k++) {
        const h = (k * 12 + bar) % span;           /* 半音単位の高さ 0..span-1 */
        const x = h / 12;                          /* オクターブ単位の高さ */
        const w = Math.exp(-((x - layers / 2) ** 2) / (2 * sigma * sigma));
        const vel = Math.round(100 * w);
        if (vel < 4) continue;
        pushNote(ae, bar * bt, bt * 0.98, 0x0A, base + h, vel, total);
      }
    }
    return [{ events: ae, name: 'Shepard' }];
  }

  /* ═══ 5. Species Counterpoint (Fux, 第1種) ═══
     定旋律 (cantus) をスケール上に生成し、その上方に対位旋律を
     1音対1音で付ける。垂直音程は協和のみ、並達5度/8度を回避、
     開始と終止は完全協和。validateCounterpoint が規則検証を担う。 */
  const CONSONANT = new Set([0, 3, 4, 7, 8, 9, 12]);
  function genCantus(n, scaleIv) {
    const cf = [0];
    let deg = 0;
    for (let i = 1; i < n - 2; i++) {
      const r = R();
      deg += r < 0.4 ? 1 : r < 0.8 ? -1 : r < 0.9 ? 2 : -2;
      deg = Math.max(0, Math.min(scaleIv.length + 1, deg));
      cf.push(deg);
    }
    if (n >= 3) { cf.push(1); }                     /* 終止前は上主音度へ */
    cf.push(0);
    return cf.slice(0, n);
  }
  function counterpoint(cfMidi) {
    const cp = [];
    let prevIv = null, prevCf = null, prevCp = null;
    for (let i = 0; i < cfMidi.length; i++) {
      const cf = cfMidi[i];
      const isEdge = (i === 0 || i === cfMidi.length - 1);
      const ivs = isEdge ? [12, 7, 0] : [3, 4, 7, 8, 9, 12, 15, 16];
      let best = null, bestScore = -1e9;
      for (const iv of ivs) {
        const cand = cf + iv;
        if (cand > 115) continue;
        const ivc = ((iv % 12) + 12) % 12;
        if (!CONSONANT.has(ivc)) continue;
        let score = 0;
        if (prevIv !== null) {
          const dCf = Math.sign(cf - prevCf), dCp = Math.sign(cand - prevCp);
          if ((prevIv % 12 === 7 || prevIv % 12 === 0) && ivc === prevIv % 12 && dCf !== 0 && dCf === dCp)
            score -= 100;                            /* 並達完全音程 — 事実上禁止 */
          if (dCp === -dCf && dCf !== 0) score += 3; /* 反行 */
          else if (dCp === 0) score += 2;            /* 斜行 */
          const leap = Math.abs(cand - prevCp);
          score += leap <= 2 ? 2 : leap <= 4 ? 0 : -Math.min(6, leap - 3);
        }
        score += R() * 0.5;                          /* 同点の分散 (seed 依存) */
        if (score > bestScore) { bestScore = score; best = cand; }
      }
      if (best === null) best = cf + 12;
      cp.push(best);
      prevIv = ((best - cf) % 12 + 12) % 12; prevCf = cf; prevCp = best;
    }
    return cp;
  }
  function validateCounterpoint(cfMidi, cpMidi) {
    const bad = [];
    for (let i = 0; i < cfMidi.length; i++) {
      const iv = ((cpMidi[i] - cfMidi[i]) % 12 + 12) % 12;
      if (!CONSONANT.has(iv)) bad.push(`dissonance@${i}`);
      if (i > 0) {
        const piv = ((cpMidi[i - 1] - cfMidi[i - 1]) % 12 + 12) % 12;
        const dCf = Math.sign(cfMidi[i] - cfMidi[i - 1]), dCp = Math.sign(cpMidi[i] - cpMidi[i - 1]);
        if ((piv === 7 || piv === 0) && iv === piv && dCf !== 0 && dCf === dCp) bad.push(`parallel@${i}`);
      }
    }
    const f = ((cpMidi[0] - cfMidi[0]) % 12 + 12) % 12, l = ((cpMidi[cpMidi.length - 1] - cfMidi[cfMidi.length - 1]) % 12 + 12) % 12;
    if (!(f === 0 || f === 7)) bad.push('start');
    if (!(l === 0 || l === 7)) bad.push('end');
    return bad;
  }
  function species(ctx) {
    if (TP.species.kind === '2') return species2(ctx);
    if (TP.species.kind === '3') return species3(ctx);
    if (TP.species.kind === '4') return species4(ctx);
    if (TP.species.kind === '5') return species5(ctx);
    if (TP.species.kind === 'canon') return canon(ctx);
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const cfDeg = genCantus(totalBars, scaleIv);
    const cfMidi = cfDeg.map(d => degToMidi(d, rootMidi, scaleIv));
    const cpMidi = counterpoint(cfMidi);
    const ae = [];
    cfMidi.forEach((n, i) => pushNote(ae, i * bt, bt * 0.95, 0x0E, n, 78, total));
    cpMidi.forEach((n, i) => pushNote(ae, i * bt, bt * 0.95, 0x0F, n, 84, total));
    return [{ events: ae, name: 'Species Counterpoint' }];
  }

  /* ═══ 5b. Species 第2種 + 模倣カノン ═══
     第2種: 定旋律1音に対し対旋律2音。強拍は協和 (第1種と同じ選択)、
     弱拍は経過音 (隣接音へのステップ) を許す。
     カノン: dux の旋律を comes が2小節遅れで完全8度上に模倣する。 */
  function species2(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const cfDeg = genCantus(totalBars, scaleIv);
    const cfMidi = cfDeg.map(d => degToMidi(d, rootMidi, scaleIv));
    const cpStrong = counterpoint(cfMidi);
    const ae = [];
    cfMidi.forEach((n, i) => pushNote(ae, i * bt, bt * 0.95, 0x0E, n, 78, total));
    for (let i = 0; i < cfMidi.length; i++) {
      pushNote(ae, i * bt, bt * 0.48, 0x0F, cpStrong[i], 84, total);
      if (i + 1 < cfMidi.length) {
        const step = Math.sign(cpStrong[i + 1] - cpStrong[i]);
        const weak = step !== 0 ? cpStrong[i] + step : cpStrong[i] + (R() < 0.5 ? 1 : -1);
        pushNote(ae, i * bt + bt / 2, bt * 0.48, 0x0F, weak, 70, total);
      }
    }
    return [{ events: ae, name: 'Species 2 (2:1)' }];
  }
  function canon(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const duxDeg = genCantus(Math.max(2, totalBars - 2), scaleIv);
    const dux = duxDeg.map(d => degToMidi(d, rootMidi + 12, scaleIv));
    const ae = [];
    dux.forEach((n, i) => pushNote(ae, i * bt, bt * 0.92, 0x0E, n, 80, total));
    dux.forEach((n, i) => pushNote(ae, (i + 2) * bt, bt * 0.92, 0x0F, n + 12, 76, total));
    return [{ events: ae, name: 'Canon (Imitation)' }];
  }

  /* ═══ 5b2. Species 第3〜5種 ═══
     共通基盤: counterpoint() で強拍 (小節頭) の協和音列を先に決める。
     第3種: 4:1 — 弱拍は度数空間で強拍間をステップ補間 (経過音)。
     第4種: 掛留 — 後半に置いた音が次小節頭へ繋がり、不協和なら
             準備 → 掛留 → 下行解決 (4-3 / 9-8 / 7-6) を作る。
     第5種: 華麗対位法 — 小節ごとに 第1/2/3種のフィギュアと掛留を混用。 */
  function midiToDeg(midi, rootMidi, iv) {
    let best = 0, bd = 1e9;
    for (let d = -iv.length; d < iv.length * 2; d++) {
      const dist = Math.abs(degToMidi(d, rootMidi, iv) - midi);
      if (dist < bd) { bd = dist; best = d; }
    }
    return best;
  }
  function species3(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, qt = ppq;
    const cfMidi = genCantus(totalBars, scaleIv).map(d => degToMidi(d, rootMidi, scaleIv));
    const strong = counterpoint(cfMidi);
    const ae = [];
    cfMidi.forEach((n, i) => pushNote(ae, i * bt, bt * 0.95, 0x0E, n, 78, total));
    for (let b = 0; b < totalBars; b++) {
      const d0 = midiToDeg(strong[b], rootMidi + 12, scaleIv);
      const d1 = b + 1 < totalBars ? midiToDeg(strong[b + 1], rootMidi + 12, scaleIv) : d0;
      for (let k = 0; k < 4; k++) {
        const deg = k === 0 ? d0 : Math.round(d0 + (d1 - d0) * k / 4);
        pushNote(ae, b * bt + k * qt, qt * 0.92, 0x0F, degToMidi(deg, rootMidi + 12, scaleIv), k === 0 ? 84 : 72, total);
      }
    }
    return [{ events: ae, name: 'Species 3 (4:1)' }];
  }
  const SUSP_DIS = new Set([2, 5, 10]); /* 掛留になりうる不協和 (9th, 4th, 7th) */
  function species4(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, half = bt / 2;
    const cfMidi = genCantus(totalBars, scaleIv).map(d => degToMidi(d, rootMidi, scaleIv));
    const N = totalBars, H = new Array(2 * N).fill(null); /* 半小節スロットの cp */
    const cons = (m, cf) => CONSONANT.has(((m - cf) % 12 + 12) % 12);
    const pickCons = (cf, near) => {
      let best = null, bs = -1e9;
      for (let m = cf + 3; m <= cf + 16; m++) {
        if (!cons(m, cf)) continue;
        const sc = -Math.abs(m - near) * 2 + R();
        if (sc > bs) { bs = sc; best = m; }
      }
      return best !== null ? best : cf + 12;
    };
    H[1] = pickCons(cfMidi[0], cfMidi[0] + 12);
    for (let b = 1; b < N; b++) {
      const s = 2 * b, cf = cfMidi[b], prev = H[s - 1];
      const ivc = ((prev - cf) % 12 + 12) % 12;
      if (SUSP_DIS.has(ivc) && cons(prev, cfMidi[b - 1])) {
        H[s] = prev; /* 掛留: 前の音が繋がる */
        let res = prev - 1; /* 下行解決: 最も近い下の協和音 */
        while (res > prev - 4 && !cons(res, cf)) res--;
        H[s + 1] = cons(res, cf) ? res : pickCons(cf, prev - 2);
      } else {
        H[s] = pickCons(cf, prev);
        H[s + 1] = pickCons(cf, H[s]);
      }
    }
    H[2 * N - 1] = null;
    if (N >= 2) { const lf = cfMidi[N - 1]; if (!cons(H[2 * N - 2], lf) || ![0, 7].includes(((H[2 * N - 2] - lf) % 12 + 12) % 12)) H[2 * N - 2] = lf + 12; }
    const ae = [];
    cfMidi.forEach((n, i) => pushNote(ae, i * bt, bt * 0.95, 0x0E, n, 78, total));
    for (let s = 1; s < 2 * N; s++) if (H[s] !== null) pushNote(ae, s * half, half * 0.94, 0x0F, H[s], 82, total);
    return [{ events: ae, name: 'Species 4 (Suspension)' }];
  }
  function validateSuspensions(cfMidi, H) {
    const bad = [];
    const cons = (m, cf) => CONSONANT.has(((m - cf) % 12 + 12) % 12);
    for (let b = 1; b < cfMidi.length; b++) {
      const s = 2 * b, m = H[s];
      if (m === null || m === undefined) continue;
      if (cons(m, cfMidi[b])) continue;
      if (m !== H[s - 1]) bad.push('unprepared@' + b);
      else if (!cons(m, cfMidi[b - 1])) bad.push('prepDissonant@' + b);
      const res = H[s + 1];
      if (res === null || res === undefined || !(res < m && m - res <= 2 && cons(res, cfMidi[b]))) bad.push('unresolved@' + b);
    }
    return bad;
  }
  function species5(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, qt = ppq, half = bt / 2;
    const cfMidi = genCantus(totalBars, scaleIv).map(d => degToMidi(d, rootMidi, scaleIv));
    const strong = counterpoint(cfMidi);
    const ae = [];
    cfMidi.forEach((n, i) => pushNote(ae, i * bt, bt * 0.95, 0x0E, n, 78, total));
    let prevNote = null;
    for (let b = 0; b < totalBars; b++) {
      const fig = b === 0 || b === totalBars - 1 ? 'whole' : ['whole', 'halves', 'quarters', 'quarters'][Math.floor(R() * 4)];
      const s0 = strong[b];
      if (fig === 'whole') {
        pushNote(ae, b * bt, bt * 0.94, 0x0F, s0, 84, total);
      } else if (fig === 'halves') {
        pushNote(ae, b * bt, half * 0.94, 0x0F, s0, 84, total);
        const nxt = b + 1 < totalBars ? strong[b + 1] : s0;
        const step = Math.sign(nxt - s0);
        pushNote(ae, b * bt + half, half * 0.94, 0x0F, step !== 0 ? s0 + step : s0 + 1, 72, total);
      } else {
        const d0 = midiToDeg(s0, rootMidi + 12, scaleIv);
        const d1 = b + 1 < totalBars ? midiToDeg(strong[b + 1], rootMidi + 12, scaleIv) : d0;
        for (let k = 0; k < 4; k++) {
          const deg = k === 0 ? d0 : Math.round(d0 + (d1 - d0) * k / 4);
          pushNote(ae, b * bt + k * qt, qt * 0.92, 0x0F, degToMidi(deg, rootMidi + 12, scaleIv), k === 0 ? 84 : 72, total);
        }
      }
      prevNote = s0;
    }
    return [{ events: ae, name: 'Species 5 (Florid)' }];
  }

  /* ═══ 5b3. フーガ提示部 (Fugue Exposition) ═══
     主題 (2小節、特徴的な度数パターン) を生成し、3声で
     主題 (I) → 応答 (V、度数空間で +4 = 属調) → 主題 (I、低音声部)
     と提示する。既出声部は対題 (小節頭で協和な対旋律) を担う。
     余裕があれば主題頭部のゼクエンツによるエピソードを付ける。 */
  function fugueSubject(scaleIv) {
    for (let tries = 0; tries < 40; tries++) {
      const steps = [0];
      let d = 0, leaps = 0;
      for (let i = 0; i < 7; i++) {
        const r = R();
        const mv = r < 0.55 ? (R() < 0.5 ? 1 : -1) : r < 0.8 ? (R() < 0.5 ? 2 : -2) : (R() < 0.5 ? 3 : -3);
        if (Math.abs(mv) >= 3) leaps++;
        d = Math.max(-1, Math.min(scaleIv.length + 1, d + mv));
        steps.push(d);
      }
      steps.push(1); steps.push(0); /* 終止: 上主音度 → 主音度 */
      if (leaps >= 1 && steps[steps.length - 1] === 0) return steps;
    }
    return [0, 2, 3, 2, 4, 3, 1, 2, 1, 0];
  }
  function fugue(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const subjBars = totalBars >= 8 ? 2 : 1;
    const subj = fugueSubject(scaleIv);
    const rhythm = subjBars === 2 ? [0, 1, 1.5, 2, 3, 4, 5, 5.5, 6, 7] : [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.25, 3.5, 3.75];
    const durs = rhythm.map((v, i) => (i + 1 < rhythm.length ? rhythm[i + 1] : subjBars * 4) - v);
    const ae = [];
    const playSubj = (startBar, degShift, base, ch, vel) => {
      subj.forEach((d, i) => pushNote(ae, startBar * bt + rhythm[i] * ppq, durs[i] * ppq * 0.92, ch, degToMidi(d + degShift, base, scaleIv), vel, total));
    };
    const playCounter = (startBar, entryNotes, base, ch) => {
      for (let b = 0; b < subjBars; b++) {
        const anchor = entryNotes[b * 4] !== undefined ? entryNotes[b * 4] : entryNotes[0];
        let best = null, bs = -1e9;
        for (let d = 0; d < scaleIv.length + 3; d++) {
          const m = degToMidi(d, base, scaleIv);
          const ivc = ((m - anchor) % 12 + 12) % 12;
          if (!CONSONANT.has(ivc)) continue;
          const sc = -Math.abs(d - scaleIv.length / 2) + R() * 0.4;
          if (sc > bs) { bs = sc; best = m; }
        }
        if (best !== null) pushNote(ae, (startBar + b) * bt, bt * 0.94, ch, best, 68, total);
      }
    };
    const notesOf = (degShift, base) => {
      const arr = new Array(subjBars * 4).fill(undefined);
      subj.forEach((d, i) => { arr[Math.floor(rhythm[i])] = degToMidi(d + degShift, base, scaleIv); });
      for (let i = 1; i < arr.length; i++) if (arr[i] === undefined) arr[i] = arr[i - 1];
      return arr;
    };
    /* 提示部: V1 主題 → V2 応答 (+4度) → V3 主題 (低音) */
    playSubj(0, 0, rootMidi + 12, 0x0E, 86);
    if (totalBars >= subjBars * 2) {
      playSubj(subjBars, 4, rootMidi + 12, 0x0F, 84);
      playCounter(0 + subjBars, notesOf(4, rootMidi + 12), rootMidi + 12, 0x0E);
    }
    if (totalBars >= subjBars * 3) {
      playSubj(subjBars * 2, 0, rootMidi, 0x03, 88);
      playCounter(subjBars * 2, notesOf(0, rootMidi), rootMidi + 12, 0x0E);
      playCounter(subjBars * 2, notesOf(0, rootMidi), rootMidi + 12, 0x0F);
    }
    /* エピソード: 主題頭部を度数 −1, −2 とゼクエンツ */
    const epiStart = subjBars * 3;
    if (totalBars >= epiStart + 2) {
      [0, 1].forEach(k => {
        subj.slice(0, 5).forEach((d, i) => {
          pushNote(ae, (epiStart + k) * bt + rhythm[i] * ppq / 2, ppq * 0.8, 0x0E, degToMidi(d - 1 - k, rootMidi + 12, scaleIv), 74, total);
        });
        pushNote(ae, (epiStart + k) * bt, bt * 0.94, 0x03, degToMidi(-1 - k, rootMidi, scaleIv), 70, total);
      });
    }
    return [{ events: ae, name: 'Fugue Exposition' }];
  }

  /* ═══ 5b4. ソナタ形式 (Sonata Form) ═══
     提示部 (第1主題 I → 経過 → 第2主題 V) / 展開部 (断片のゼクエンツ)
     / 再現部 (第2主題も I に戻る = ソナタ原理) / コーダ を、
     主題モチーフの同一性を保ちながら小節配分する長大形式エンジン。 */
  const SONATA_SEGMENTS = [
    { id: 'T1', label: '提示部・第1主題', w: 2, key: 0, motif: 'A' },
    { id: 'T1v', label: '提示部・第1主題 変奏', w: 1, key: 0, motif: 'Av' },
    { id: 'TR', label: '提示部・経過句', w: 2, key: 0, motif: 'TR' },
    { id: 'T2', label: '提示部・第2主題', w: 2, key: 4, motif: 'B' },
    { id: 'T2v', label: '提示部・第2主題 変奏', w: 1, key: 4, motif: 'Bv' },
    { id: 'CT', label: '提示部・結尾句', w: 1, key: 0, motif: 'A' },
    { id: 'DEV1', label: '展開部 1 (IV)', w: 2, key: 3, motif: 'A' },
    { id: 'DEV2', label: '展開部 2 (ii)', w: 2, key: 1, motif: 'Afrag' },
    { id: 'DEV3', label: '展開部 3 (vi)', w: 2, key: 5, motif: 'Bfrag' },
    { id: 'RT1', label: '再現部・第1主題', w: 2, key: 0, motif: 'A' },
    { id: 'RTR', label: '再現部・経過句', w: 1, key: 0, motif: 'TR' },
    { id: 'RT2', label: '再現部・第2主題 (主調)', w: 2, key: 0, motif: 'B' },
    { id: 'CODA', label: 'コーダ', w: 2, key: 0, motif: 'A' },
  ];
  function sonataPlan(totalBars) {
    const W = SONATA_SEGMENTS.reduce((a, s) => a + s.w, 0);
    const exact = SONATA_SEGMENTS.map(s => s.w / W * totalBars);
    const bars = exact.map(v => Math.floor(v));
    let rest = totalBars - bars.reduce((a, b) => a + b, 0);
    const order = exact.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]);
    for (let k = 0; rest > 0; k = (k + 1) % order.length) { bars[order[k][1]]++; rest--; }
    const raw = SONATA_SEGMENTS.map((s, i) => ({ ...s, bars: bars[i], start: 0 }));
    let acc = 0;
    for (const s of raw) { s.start = acc; acc += s.bars; }
    return raw;
  }
  const MOTIFS = {
    A: { degs: [0, 2, 4, 3], beats: [0, 1, 2, 3], dur: 0.9 },
    Av: { degs: [0, 2, 4, 5], beats: [0, 1, 2, 3], dur: 0.9 },
    B: { degs: [4, 3, 2, 1], beats: [0, 1, 2, 3], dur: 1.8 },
    Bv: { degs: [4, 5, 4, 3], beats: [0, 1, 2, 3], dur: 1.8 },
    TR: { degs: [0, 1, 2, 3], beats: [0, 1, 2, 3], dur: 0.7 },
    Afrag: { degs: [0, 2], beats: [0, 2], dur: 0.9 },
    Bfrag: { degs: [4, 3], beats: [0, 2], dur: 1.4 },
  };
  function sonata(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const plan = sonataPlan(totalBars);
    const ae = [];
    for (const seg of plan) {
      const m = MOTIFS[seg.motif];
      for (let b = 0; b < seg.bars; b++) {
        const barStart = (seg.start + b) * bt;
        /* バス: セグメントのキー度数の根音 */
        pushNote(ae, barStart, bt * 0.95, 0x01, degToMidi(seg.key, rootMidi - 12, scaleIv), 80, total);
        /* 冒頭小節: キーの三和音スタブ */
        if (b === 0) for (const dd of [0, 2, 4]) pushNote(ae, barStart, bt * 0.9, 0x03, degToMidi(seg.key + dd, rootMidi, scaleIv), 62, total);
        /* モチーフ */
        m.degs.forEach((d, i) => pushNote(ae, barStart + m.beats[i] * ppq, ppq * m.dur, 0x0E, degToMidi(seg.key + d, rootMidi + 12, scaleIv), seg.motif.startsWith('B') ? 78 : 86, total));
      }
    }
    return [{ events: ae, name: 'Sonata Form' }];
  }

  /* ═══ 5c. 終止定型 (Cadence Forms) ═══
     古典和声の終止/半終止の定型を、現在のコードのキーを主音として
     ブロックコードで循環させる。和音は主音からの半音オフセット列。 */
  const CADENCE_FORMS = {
    neapolitan: { label: 'Neapolitan → V → I', minorOk: true, seq: [[5, 8, 13], [7, 11, 14], [12, 16, 19]] },
    'aug6-it':  { label: 'Italian +6 → V → I', seq: [[8, 12, 18], [7, 11, 14], [12, 16, 19]] },
    'aug6-fr':  { label: 'French +6 → V → I', seq: [[8, 12, 14, 18], [7, 11, 14], [12, 16, 19]] },
    'aug6-ger': { label: 'German +6 → V → I', seq: [[8, 12, 15, 18], [7, 11, 14], [12, 16, 19]] },
    picardy:    { label: 'Picardy (i → V → I)', seq: [[0, 3, 7], [7, 11, 14], [12, 16, 19]] },
    'phrygian-half': { label: 'Phrygian Half (iv6 → V)', seq: [[8, 12, 17], [7, 11, 14]] },
  };
  function cadenceForms(ctx) {
    const { ppq, totalBars, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const form = CADENCE_FORMS[TP.cadence.form] || CADENCE_FORMS.neapolitan;
    const q0 = ctx.chord.quality || ''; const isMinor = q0.startsWith('m') && !q0.startsWith('maj');
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      let offs = form.seq[bar % form.seq.length].slice();
      /* ナポリは長調でも短調でも ♭II–V–I (終止は短調なら i) */
      if (TP.cadence.form === 'neapolitan' && isMinor && bar % form.seq.length === 2) offs = [12, 15, 19];
      for (const o of offs) pushNote(ae, bar * bt, bt * 0.95, 0x03, rootMidi + o, 76, total);
    }
    return [{ events: ae, name: 'Cadence: ' + form.label }];
  }

  /* ═══ 5d. ワールド・リズム定型 (Clave / Tala / Polymeter) ═══ */
  const CLAVE = { /* 2小節 = 32ステップ (16分) の打点 */
    son32:  [0, 3, 6, 10, 12, 20, 28],
    rumba:  [0, 3, 6, 10, 13, 20, 28],
    bossa:  [0, 3, 6, 10, 12, 19, 22, 25, 28],
  };
  function worldRhythm(ctx) {
    const { ppq, totalBars, rootMidi } = ctx;
    const total = ppq * 4 * totalBars;
    const ae = [];
    if (TP.rhythm.pattern === 'polymeter') {
      /* 5拍子ループ × 4拍子ループ (8分単位) — 20ステップで再同期 */
      for (let s = 0; s < totalBars * 8; s++) {
        if (s % 5 === 0) pushNote(ae, s * ppq / 2, ppq * 0.2, 0x09, rootMidi + 36, 100, total);
        if (s % 4 === 0) pushNote(ae, s * ppq / 2, ppq * 0.2, 0x09, rootMidi + 24, 84, total);
      }
    } else if (TP.rhythm.pattern === 'teental') {
      /* ティーンタール: 16拍周期、sam (1) / tali (5,13) / khali (9) */
      const acc = [127, 70, 70, 70, 92, 70, 70, 70, 58, 70, 70, 70, 92, 70, 70, 70];
      for (let b = 0; b < totalBars * 4; b++)
        pushNote(ae, b * ppq, ppq * 0.25, 0x09, rootMidi + (b % 4 === 0 ? 31 : 24), acc[b % 16], total);
    } else {
      const hits = CLAVE[TP.rhythm.pattern] || CLAVE.son32;
      const step = ppq / 4, cycle = 32 * step;
      for (let base = 0; base < total; base += cycle)
        for (const h of hits) pushNote(ae, base + h * step, step * 0.6, 0x09, rootMidi + 36, 96, total);
    }
    return [{ events: ae, name: 'World Rhythm' }];
  }

  /* ═══ 5e. Risset Rhythm (無限加速の錯覚) ═══
     テンポの異なる層が1小節ごとに倍速側へ移り、重みは対数テンポの
     ガウス包絡。シェパード・トーンのリズム版。 */
  function risset(ctx) {
    const { ppq, totalBars, rootMidi } = ctx;
    const total = ppq * 4 * totalBars;
    const L = 5, center = (L - 1) / 2, sigma = L / 3.2;
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      for (let k = 0; k < L; k++) {
        const h = (k + bar) % L;                    /* この層のテンポ段 (bar ごとに +1) */
        const pulses = Math.pow(2, h - center) * 4; /* 1, 2, 4, 8, 16 打/小節 */
        const w = Math.exp(-((h - center) ** 2) / (2 * sigma * sigma));
        const vel = Math.round(104 * w);
        if (vel < 5) continue;
        for (let p = 0; p < pulses; p++)
          pushNote(ae, bar * ppq * 4 + p * (ppq * 4 / pulses), ppq * 0.18, 0x09, rootMidi + 36, vel, total);
      }
    }
    return [{ events: ae, name: 'Risset Rhythm' }];
  }

  /* ═══ 5f. 結合音 (Tartini / Combination Tones) ═══
     コード構成音の全ペアについて差音 f2 − f1 を弱く持続させる。 */
  function tartini(ctx) {
    const { ppq, totalBars, chord, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const midis = [...new Set(chord.iv.map(iv => rootMidi + 12 + iv))].sort((a, b) => a - b);
    const f = m => 440 * Math.pow(2, (m - 69) / 12);
    const ae = [], seen = new Set();
    for (let i = 0; i < midis.length; i++) for (let j = i + 1; j < midis.length; j++) {
      const fd = f(midis[j]) - f(midis[i]);
      if (fd < 30) continue;
      const md = Math.round(69 + 12 * Math.log2(fd / 440));
      if (md < 12 || seen.has(md)) continue;
      seen.add(md);
      for (let bar = 0; bar < totalBars; bar++) pushNote(ae, bar * bt, bt * 0.96, 0x02, md, 38, total);
    }
    return [{ events: ae, name: 'Combination Tones' }];
  }

  /* ═══ 5g. トータル・セリエリズム ═══
     音高列 (P/I/R/RI) に音価列と強弱列を並行して回す全面セリエ。 */
  function serial(ctx) {
    const { ppq, totalBars, chord, rootMidi } = ctx;
    const total = ppq * 4 * totalBars;
    const pcs = [];
    for (const iv of chord.iv) { const p = ((chord.root + iv) % 12 + 12) % 12; if (!pcs.includes(p)) pcs.push(p); }
    const rest = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter(p => !pcs.includes(p));
    for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1));[rest[i], rest[j]] = [rest[j], rest[i]]; }
    const P = pcs.concat(rest);
    const I = P.map(p => ((2 * P[0] - p) % 12 + 12) % 12);
    const forms = [P, I, P.slice().reverse(), I.slice().reverse()];
    const durSeries = [1, 3, 2, 4], velSeries = [46, 96, 64, 112];
    const ae = [];
    let t = 0, idx = 0;
    for (let f = 0; f < 4 && t < total; f++) {
      for (let n = 0; n < 12 && t < total; n++, idx++) {
        const dur = durSeries[idx % 4] * (ppq / 2);
        pushNote(ae, t, dur * 0.9, 0x01, rootMidi + 12 + ((forms[f][n] - chord.root + 12) % 12), velSeries[idx % 4], total);
        t += dur;
      }
    }
    return [{ events: ae, name: 'Total Serial' }];
  }

  /* ═══ 5h. セル・オートマトン (Wolfram 1次元 CA) ═══ */
  function cellular(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const half = ppq * 2, total = ppq * 4 * totalBars;
    const W = 24, rule = TP.ca.rule | 0;
    let row = Array.from({ length: W }, () => R() < 0.32 ? 1 : 0);
    const ae = [];
    const gens = totalBars * 2;
    for (let g = 0; g < gens; g++) {
      row.forEach((c, j) => {
        if (c) pushNote(ae, g * half, half * 0.7, 0x07, degToMidi(j % (scaleIv.length * 2), rootMidi, scaleIv), 72, total);
      });
      row = row.map((_, j) => {
        const code = (row[(j - 1 + W) % W] << 2) | (row[j] << 1) | row[(j + 1) % W];
        return (rule >> code) & 1;
      });
    }
    return [{ events: ae, name: 'Cellular Automaton R' + rule }];
  }

  /* ═══ 5i. チャンス・オペレーション (易経コイン法) ═══
     1小節ごとに3コイン×6爻で卦を立て、数値を音高/音価/強弱へ写す。
     ケージ的な不確定性作曲 (分布ではなく神託的決定)。 */
  function chance(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      let hex = 0;
      for (let line = 0; line < 6; line++) {
        const coins = (R() < 0.5 ? 2 : 3) + (R() < 0.5 ? 2 : 3) + (R() < 0.5 ? 2 : 3); /* 6..9 */
        if (coins >= 7) hex |= (1 << line);
      }
      const deg = hex % scaleIv.length, oct = ((hex >> 3) % 2) * scaleIv.length;
      const durT = [0.25, 0.5, 1][hex % 3], vel = [52, 76, 100][(hex >> 2) % 3];
      pushNote(ae, bar * bt, bt * durT, 0x01, degToMidi(deg + oct, rootMidi + 12, scaleIv), vel, total);
      pushNote(ae, bar * bt + bt / 2, bt * durT * 0.8, 0x01, degToMidi((deg + 2) % scaleIv.length + oct, rootMidi + 12, scaleIv), Math.max(30, vel - 14), total);
    }
    return [{ events: ae, name: 'Chance Operations' }];
  }

  /* ═══ 5j. クォータル・ハーモニー (四度堆積) ═══
     スケール度数 +2 間隔 (= 四度) で3音を積んだボイシングを小節ごとに
     度数ウォークで移動させる (McCoy Tyner 的な左手の響き)。 */
  function quartal(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const ae = [];
    let deg = 0;
    for (let bar = 0; bar < totalBars; bar++) {
      for (const d of [deg, deg + 2, deg + 4])
        pushNote(ae, bar * bt, bt * 0.94, 0x02, degToMidi(d, rootMidi, scaleIv), 72, total);
      deg += [1, -1, 2, -2, 1, 0][bar % 6];
      deg = Math.max(0, Math.min(scaleIv.length - 1, deg));
    }
    return [{ events: ae, name: 'Quartal Harmony' }];
  }

  /* ═══ 5k. ラフネス (Plomp–Levelt / Sethares) ═══
     倍音列同士の臨界帯域干渉から協和度を測る。2つの倍音音の
     ディソナンス曲線は純音程で谷、微分音域で山になる。 */
  function roughnessFreqs(freqs) {
    let total = 0;
    const partials = [];
    for (const f0 of freqs) for (let n = 1; n <= 6; n++) partials.push({ f: f0 * n, a: 1 / n });
    for (let i = 0; i < partials.length; i++) for (let j = i + 1; j < partials.length; j++) {
      const fmin = Math.min(partials[i].f, partials[j].f), d = Math.abs(partials[i].f - partials[j].f);
      if (d === 0 || d > 1200) continue;
      const s = 0.24 / (0.0207 * fmin + 18.96);
      total += partials[i].a * partials[j].a * (Math.exp(-3.5 * s * d) - Math.exp(-5.75 * s * d));
    }
    return total;
  }
  function roughnessOfChord() {
    if (typeof S === 'undefined' || !S.chord) return null;
    const rootMidi = (S.rootOct || 4) * 12 + S.chord.root;
    const freqs = S.chord.iv.map(iv => 440 * Math.pow(2, (rootMidi + iv - 69) / 12));
    return roughnessFreqs(freqs);
  }

  /* ═══ 6. Adaptive JI (CompTuning への動的音律) ═══
     現在のコードの構成音だけを純正比へ寄せたセント偏差表を
     TEMPERAMENTS.AdaptiveJI.cents に書き込む。非構成音は平均律のまま。 */
  /* 半音数 → 純正比。偏差は比率から計算する (手書き転記ミス防止)。
     2026-11-10 精査で修正: 6/5 は +15.64 (符号反転していた)、
     16/9 は -3.91、9/5 は +17.60、半音1 は 16/15 = +11.73。 */
  const JUST_RATIOS = { 0: [1, 1], 1: [16, 15], 2: [9, 8], 3: [6, 5], 4: [5, 4], 5: [4, 3],
                        6: [7, 5], 7: [3, 2], 8: [8, 5], 9: [5, 3], 11: [15, 8] };
  const devOf = (n, d, semi) => +(1200 * Math.log2(n / d) - semi * 100).toFixed(2);
  const JUST_DEV = {};
  for (const [semi, [n, d]] of Object.entries(JUST_RATIOS)) JUST_DEV[semi] = devOf(n, d, +semi);
  function seventhDev(chord) {
    const q = chord.quality || '';
    if (/^(7|9|11|13)/.test(q)) return devOf(7, 4, 10);   /* 属和音系 (7, 7b9, 9sus4…): 7/4 = -31.17 */
    if (q.startsWith('m') && !q.startsWith('maj')) return devOf(16, 9, 10);  /* 16/9 = -3.91 */
    return devOf(9, 5, 10);                                                  /* 9/5 = +17.60 */
  }
  function refreshAdaptiveJI() {
    if (typeof CompTuningEngine === 'undefined' || typeof S === 'undefined' || !S.chord) return null;
    const chord = S.chord;
    const cents = new Array(12).fill(0);
    for (const s of chord.iv) {
      const semi = ((s % 12) + 12) % 12;
      const pc = ((chord.root + semi) % 12 + 12) % 12;
      cents[pc] = semi === 10 ? seventhDev(chord) : (JUST_DEV[semi] ?? 0);
    }
    CompTuningEngine.TEMPERAMENTS.AdaptiveJI.cents = cents;
    return cents;
  }
  function registerAdaptiveJI() {
    if (typeof CompTuningEngine === 'undefined') return;
    if (!CompTuningEngine.TEMPERAMENTS.AdaptiveJI) {
      CompTuningEngine.TEMPERAMENTS.AdaptiveJI = {
        name: 'Adaptive JI',
        desc: '適応型純正律 — 現在のコード構成音のみを純正比 (5/4, 3/2, 7/4…) へ動的に寄せる',
        cents: new Array(12).fill(0),
      };
    }
    refreshAdaptiveJI();
    if (typeof CompTuningEngine.buildUI === 'function') CompTuningEngine.buildUI();
  }

  /* ═══ 7+8. Partch Diamond / Bohlen-Pierce (MICRO 音階として登録) ═══ */
  function partchDiamond(oddLimit = 11) {
    const odds = [];
    for (let o = 1; o <= oddLimit; o += 2) odds.push(o);
    const seen = new Map();
    for (const o of odds) for (const u of odds) {
      let r = o / u;
      while (r < 1) r *= 2;
      while (r >= 2) r /= 2;
      const cents = +(1200 * Math.log2(r)).toFixed(2);
      if (![...seen.values()].some(e => Math.abs(e.cents - cents) < 0.01))
        seen.set(o + '/' + u, { ratio: o / u, label: o + '/' + u, cents });
    }
    return [...seen.values()].sort((a, b) => a.cents - b.cents);
  }
  function registerScales() {
    if (typeof MICRO_CENTS === 'undefined' || typeof SCALES === 'undefined') return;
    const cat = SCALES['Spectral / Micro'];
    /* Bohlen-Pierce: トリターヴ (3:1 = 1901.955¢) の13等分 */
    const BP_NAME = 'Bohlen-Pierce';
    if (!MICRO_CENTS[BP_NAME]) {
      MICRO_CENTS[BP_NAME] = Array.from({ length: 13 }, (_, k) => +(k * 1901.955001 / 13).toFixed(2));
      const bpIv = [0, 1, 3, 4, 6, 7, 9, 10, 12, 13, 15, 16, 18];
      if (cat && !cat[BP_NAME]) cat[BP_NAME] = { iv: bpIv, desc: 'Bohlen-Pierce: tritave (3:1) divided into 13 equal steps. No octave equivalence.', char: 'tritave' };
      if (typeof ALL_SCALES !== 'undefined' && !ALL_SCALES[BP_NAME]) ALL_SCALES[BP_NAME] = cat[BP_NAME];
    }
    /* Partch Diamond: 11-limit の比格子を1オクターブに折り畳む (29音) */
    const PD_NAME = 'Partch Diamond 11';
    if (!MICRO_CENTS[PD_NAME]) {
      const dia = partchDiamond(11);
      MICRO_CENTS[PD_NAME] = dia.map(e => e.cents);
      const pdIv = dia.map(e => Math.round(e.cents / 100));
      if (cat && !cat[PD_NAME]) cat[PD_NAME] = { iv: pdIv, desc: 'Partch 11-limit tonality diamond folded into one octave (29 tones).', char: 'diamond' };
      if (typeof ALL_SCALES !== 'undefined' && !ALL_SCALES[PD_NAME]) ALL_SCALES[PD_NAME] = cat[PD_NAME];
    }
    /* Wendy Carlos α/β/γ: 完全5度 (701.955¢) を 9 / 11 / 20 等分 */
    const carlos = [['Carlos Alpha', 9, 15], ['Carlos Beta', 11, 18], ['Carlos Gamma', 20, 34]];
    for (const [nm, div, kmax] of carlos) {
      if (MICRO_CENTS[nm]) continue;
      const step = 701.955001 / div;
      MICRO_CENTS[nm] = Array.from({ length: kmax + 1 }, (_, k) => +(k * step).toFixed(2));
      const iv = MICRO_CENTS[nm].map(c => Math.round(c / 100));
      if (cat && !cat[nm]) cat[nm] = { iv, desc: nm + ': perfect fifth divided into ' + div + ' equal steps (' + step.toFixed(2) + ' cents/step).', char: 'carlos' };
      if (typeof ALL_SCALES !== 'undefined' && !ALL_SCALES[nm]) ALL_SCALES[nm] = cat[nm];
    }
    /* MOS (Moment of Symmetry): ジェネレータから生成される音階の一例 */
    const MOS_NAME = 'MOS Diatonic (Gen P5)';
    if (!MICRO_CENTS[MOS_NAME]) {
      MICRO_CENTS[MOS_NAME] = mos(701.955001, 7);
      const iv = MICRO_CENTS[MOS_NAME].map(c => Math.round(c / 100));
      if (cat && !cat[MOS_NAME]) cat[MOS_NAME] = { iv, desc: 'MOS generated scale: 7 notes from a perfect-fifth generator (5L 2s pattern).', char: 'mos' };
      if (typeof ALL_SCALES !== 'undefined' && !ALL_SCALES[MOS_NAME]) ALL_SCALES[MOS_NAME] = cat[MOS_NAME];
    }
  }
  /* ジェネレータ (セント) から n 音の生成音階を作る (1オクターブへ折り畳み) */
  function mos(genCents, n) {
    const vals = new Set([0]);
    for (let i = 1; i < n; i++) vals.add(+(((i * genCents) % 1200 + 1200) % 1200).toFixed(2));
    return [...vals].sort((a, b) => a - b);
  }

  /* ═══ 生成フック (doGenerate から呼ばれる) ═══ */
  function appendTracks(ctx) {
    refreshAdaptiveJI();
    const rel = document.getElementById('tpRoughness');
    if (rel) { const r = roughnessOfChord(); if (r !== null) rel.textContent = 'ROUGHNESS (Sethares): ' + r.toFixed(3) + ' — 現在のコードの協和度'; }
    const jobs = [
      ['tint', tintinnabuli, 'TINTINNABULI'],
      ['phase', phasing, 'PHASING'],
      ['iso', isorhythm, 'ISORHYTHM'],
      ['shepard', shepard, 'SHEPARD'],
      ['species', species, 'SPECIES'],
      ['cadence', cadenceForms, 'CADENCE'],
      ['rhythm', worldRhythm, 'WORLD RHYTHM'],
      ['risset', risset, 'RISSET RHYTHM'],
      ['tartini', tartini, 'COMBINATION TONES'],
      ['serial', serial, 'TOTAL SERIAL'],
      ['ca', cellular, 'CELLULAR AUTOMATON'],
      ['chance', chance, 'CHANCE OPS'],
      ['quartal', quartal, 'QUARTAL'],
      ['fugue', fugue, 'FUGUE'],
      ['sonata', sonata, 'SONATA FORM'],
    ];
    for (const [key, fn, label] of jobs) {
      if (!TP[key].enabled) continue;
      try {
        for (const t of fn(ctx)) {
          if (t.events && t.events.length) { ctx.tracks.push(t.events); ctx.tn.push(t.name); }
        }
        if (ctx.log) ctx.log('// ' + label + ': theory pack track added', 'ok');
      } catch (e) {
        if (ctx.log) ctx.log('// THEORY PACK ' + label + ' error: ' + e.message, 'warn');
      }
    }
  }

  /* ═══ UI ═══ */
  function buildUI() {
    const labels = [...document.querySelectorAll('.sec-label')];
    const anchor = labels.find(l => l.textContent.includes('Rhythmic Canons'));
    if (!anchor || document.getElementById('theoryPackSec')) return;
    if (!document.getElementById('tpStyle')) {
      const st = document.createElement('style');
      st.id = 'tpStyle';
      st.textContent = '.tp-head{font-family:inherit;font-size:11px;font-weight:700;letter-spacing:3px;margin:26px 0 10px;text-transform:uppercase}.tp-sel{background:var(--panel2,#1a1a1f);color:var(--text,#e8e8e8);border:1px solid var(--border,#333);border-radius:4px;font-size:10px;padding:3px 6px;margin-right:10px}';
      document.head.appendChild(st);
    }
    const sec = document.createElement('div');
    sec.id = 'theoryPackSec';
    const head = document.createElement('div');
    head.className = 'tp-head';
    head.textContent = 'Theory Pack II ';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'NEW THEORY';
    head.appendChild(badge);
    sec.appendChild(head);
    const rows = [
      ['tint', 'TINTINNABULI', 'ペルトのティンティナブリ: 階梯的な旋律声部 (M) + コードトーンのみの鐘声部 (T)',
        `<select id="tpTintPos" class="tp-sel"><option value="below">T: 下方</option><option value="above">T: 上方</option><option value="alternate">T: 交互</option></select>`],
      ['phase', 'PHASING', 'ライヒのフェイジング: 同一パターンの位相が周期ごとに1ステップずつずれる',
        `<select id="tpPhaseLen" class="tp-sel"><option value="8">8 steps</option><option value="12">12 steps</option><option value="16">16 steps</option></select>`],
      ['iso', 'ISORHYTHM', 'イソリズム: リズム周期 (talea) と音高周期 (color) を独立に回す',
        `<select id="tpIsoTalea" class="tp-sel"><option value="classic">talea 2-1-2-3-1-2</option><option value="additive">talea 3-2-1-2</option><option value="long">talea 4-2-2-3-1-2-2</option></select>`],
      ['shepard', 'SHEPARD TONE', 'シェパード・トーン: ガウス包絡のオクターブ層が半音ずつ上昇し続ける',
        `<select id="tpShepLayers" class="tp-sel"><option value="4">4 layers</option><option value="5">5 layers</option><option value="6">6 layers</option><option value="7">7 layers</option></select>`],
      ['species', 'SPECIES COUNTERPOINT', '種対位法: 定旋律への対旋律 (第1種 1:1 / 第2種 2:1) と模倣カノン',
        `<select id="tpSpeciesKind" class="tp-sel"><option value="1">第1種 1:1</option><option value="2">第2種 2:1</option><option value="3">第3種 4:1</option><option value="4">第4種 掛留</option><option value="5">第5種 華麗</option><option value="canon">カノン (模倣)</option></select>`],
      ['cadence', 'CADENCE FORMS', '終止定型: ナポリのII / 増六和音 (伊・仏・独) / ピカルディ / フリジアン半終止を現在のキーで循環',
        `<select id="tpCadenceForm" class="tp-sel"><option value="neapolitan">Neapolitan</option><option value="aug6-it">Italian +6</option><option value="aug6-fr">French +6</option><option value="aug6-ger">German +6</option><option value="picardy">Picardy</option><option value="phrygian-half">Phrygian Half</option></select>`],
      ['rhythm', 'WORLD RHYTHM', 'リズム定型: クラーベ (ソン/ルンバ/ボッサ)、インドのターラ (ティーンタール)、ポリメーター 5:4',
        `<select id="tpRhythmPattern" class="tp-sel"><option value="son32">Son Clave 3-2</option><option value="rumba">Rumba Clave</option><option value="bossa">Bossa Clave</option><option value="teental">Teental (Tala)</option><option value="polymeter">Polymeter 5:4</option></select>`],
      ['risset', 'RISSET RHYTHM', 'リセット・リズム: テンポ層が倍速側へ移り続ける無限加速の錯覚', ''],
      ['tartini', 'COMBINATION TONES', '結合音 (タルティーニ音): コード構成音ペアの差音 f2−f1 を弱く持続', ''],
      ['serial', 'TOTAL SERIALISM', 'トータル・セリエリズム: 音高列 (P/I/R/RI) と音価列・強弱列を並行運用', ''],
      ['ca', 'CELLULAR AUTOMATON', 'セル・オートマトン: Wolfram 1次元 CA の生存セルを音に写す',
        `<select id="tpCaRule" class="tp-sel"><option value="30">Rule 30</option><option value="90">Rule 90</option><option value="110">Rule 110</option><option value="150">Rule 150</option></select>`],
      ['chance', 'CHANCE OPERATIONS', '偶然性: 易経コイン法 (3コイン×6爻) で小節ごとの音を神託的に決定', ''],
      ['quartal', 'QUARTAL HARMONY', 'クォータル・ハーモニー: 四度堆積ボイシングが度数ウォークで移動', ''],
      ['fugue', 'FUGUE (EXPOSITION)', 'フーガ提示部: 主題を生成し I → V (応答) → I と3声で提示、対題とエピソード付き', ''],
      ['sonata', 'SONATA FORM', 'ソナタ形式: 提示部 (第2主題は属調) → 展開部 → 再現部 (第2主題も主調へ) → コーダの長大形式', ''],
    ];
    for (const [key, name, desc, extra] of rows) {
      const row = document.createElement('div');
      row.className = 'tog-row';
      row.innerHTML = `<div class="tog-info"><div class="tog-name">${name}</div><div class="tog-desc">${desc}</div></div>${extra}<div class="tog${TP[key].enabled ? ' on' : ''}" id="tpTog-${key}"></div>`;
      sec.appendChild(row);
      row.querySelector('.tog').addEventListener('click', ev => {
        TP[key].enabled = !TP[key].enabled;
        ev.currentTarget.classList.toggle('on', TP[key].enabled);
        save();
      });
    }
    const note = document.createElement('div');
    note.className = 'tog-desc';
    note.textContent = '音律/音階の追加: CompTuning に「Adaptive JI」(現在のコード構成音を純正比へ)、音階 Spectral / Micro に「Bohlen-Pierce」「Partch Diamond 11」「Carlos Alpha/Beta/Gamma」「MOS Diatonic」を登録済み。';
    sec.appendChild(note);
    const rEl = document.createElement('div');
    rEl.className = 'tog-desc';
    rEl.id = 'tpRoughness';
    { const r = roughnessOfChord(); rEl.textContent = 'ROUGHNESS (Sethares): ' + (r !== null ? r.toFixed(3) : '—') + ' — 現在のコードの協和度'; }
    sec.appendChild(rEl);
    anchor.parentNode.insertBefore(sec, anchor);
    /* select の初期値と配線 */
    const set = (id, val, fn) => { const el = document.getElementById(id); if (!el) return; el.value = String(val); el.addEventListener('change', () => { fn(el.value); save(); }); };
    set('tpTintPos', TP.tint.position, v => TP.tint.position = v);
    set('tpPhaseLen', TP.phase.len, v => TP.phase.len = +v);
    set('tpIsoTalea', TP.iso.taleaKey, v => TP.iso.taleaKey = v);
    set('tpShepLayers', TP.shepard.layers, v => TP.shepard.layers = +v);
    set('tpSpeciesKind', TP.species.kind, v => TP.species.kind = v);
    set('tpCadenceForm', TP.cadence.form, v => TP.cadence.form = v);
    set('tpRhythmPattern', TP.rhythm.pattern, v => TP.rhythm.pattern = v);
    set('tpCaRule', TP.ca.rule, v => TP.ca.rule = +v);
  }

  function init() {
    registerScales();
    registerAdaptiveJI();
    if (typeof buildScaleUI === 'function') { try { buildScaleUI(); } catch (e) { /* UI 再構築は任意 */ } }
    buildUI();
    const ci = document.getElementById('chordInput');
    if (ci) ci.addEventListener('input', () => setTimeout(refreshAdaptiveJI, 50));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return {
    STATE: TP, appendTracks, refreshAdaptiveJI, partchDiamond, mos, roughnessFreqs, roughnessOfChord,
    validateCounterpoint, validateSuspensions, sonataPlan, _engines: { tintinnabuli, phasing, isorhythm, shepard, species, species2, species3, species4, species5, canon, fugue, sonata, cadenceForms, worldRhythm, risset, tartini, serial, cellular, chance, quartal },
    CADENCE_FORMS,
  };
})();
