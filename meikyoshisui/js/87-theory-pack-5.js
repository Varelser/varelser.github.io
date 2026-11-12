/* ═══════════════════════════════════════════════════════════════
   87-theory-pack-5.js — Theory Pack V (2026-11-13 追加)
   ───────────────────────────────────────────────────────────────
   Theory Pack IV (86) に続く第5弾で、候補リストの残り全部を実装する。
   接続方法は 85/86 と同じ (TheoryPack.appendTracks のラップ)。
   全て既定 OFF。OFF のとき生成には一切関与しない。

     Invertible Counterpoint  転回可能対位法: 後半で2声の音域を交換
     Nested Tuplets           入れ子トゥプレット (3/5/7連と入れ子)
     Rhythmic Displacement    リズムセルの小節ごとの置換 (ずらし)
     Granular Phrases         フレーズを粒に割り順序を組み替える
     Overtone Glissando       倍音列をなぞるグリッサンド
     Tone Clusters            半音の塊 (クラスター) の打擊と持続
     Messiaen Modes           限定移調旋法 (第2/3/6/7) の音場
     Raga Phrases             ラーガの昇降型 (アーローハ/アヴァローハ)
     Blues Changes            12小節ブルース + ターンアラウンド
     Upper Structures         アッパーストラクチャー・トライアド
     Chromatic Mediants       半音階メディアントの和音循環
     Suite Form               バロック組曲 (アレマンド〜ジーグ)

   音律の追加: CompTuning に「Railsback Stretch」(ピアノのストレッチ
   調律をオクターブ内の近似テーブルで) を登録する (70 の Adaptive JI
   と同じ方式。選択は CompTuning 側で行う)。

   状態は localStorage 'meikyoshisui_theorypack5_v1' に保存。
   ═══════════════════════════════════════════════════════════════ */
const TheoryPack5 = (() => {
  'use strict';

  const LS_KEY = 'meikyoshisui_theorypack5_v1';
  const DEF = {
    invertible: { enabled: false },
    tuplets:    { enabled: false },
    displace:   { enabled: false },
    granular:   { enabled: false },
    overtone:   { enabled: false },
    clusters:   { enabled: false, width: 7 },
    messiaen:   { enabled: false, mode: '2' },
    raga:       { enabled: false },
    blues:      { enabled: false },
    upper:      { enabled: false, ust: 'bII' },
    mediants:   { enabled: false },
    suite:      { enabled: false },
  };
  let T5 = JSON.parse(JSON.stringify(DEF));
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (saved) for (const k of Object.keys(DEF)) if (saved[k]) Object.assign(T5[k], saved[k]);
  } catch (e) { /* ignore */ }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(T5)); } catch (e) {} }

  /* ── 共通ヘルパは js/89-theory-pack-common.js (TPCommon) へ集約 (2026-11-13) ── */
  const HPC = window.TPCommon || {};
  const { clampNote, pushNote, degToMidi, pcOf, R, snapToScale, parseSmfTrack, notesFromTrack, extractLine, genMelody, melodyOf } = HPC;

  function midiToDeg(note, ctx) {
    let best = 0, bd = 1e9;
    for (let d = -7; d < ctx.scaleIv.length * 3; d++) {
      const m = degToMidi(d, ctx.rootMidi, ctx.scaleIv), df = Math.abs(m - note);
      if (df < bd) { bd = df; best = d; }
    }
    return best;
  }

  /* ═══ 1. Invertible Counterpoint ═══ */
  function invertible(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const mel = melodyOf(ctx).slice(0, 240);
    const halfPos = Math.floor(totalBars / 2) * bt;
    const offs = [4, 2, 3, 1];
    const aA = [], aB = [];
    mel.forEach((n, i) => {
      const d = midiToDeg(n.note, ctx);
      const counter = degToMidi(d - offs[i % 4], rootMidi, scaleIv);
      if (n.pos < halfPos) {
        pushNote(aA, n.pos, n.dur, 12, n.note, n.vel, total);
        pushNote(aB, n.pos, n.dur, 13, counter, Math.max(40, n.vel - 8), total);
      } else { // 転回: 声部の音域をオクターブで交換
        pushNote(aA, n.pos, n.dur, 12, n.note - 12, n.vel, total);
        pushNote(aB, n.pos, n.dur, 13, counter + 12, Math.max(40, n.vel - 8), total);
      }
    });
    return [{ events: aA, name: 'Invertible A' }, { events: aB, name: 'Invertible B' }].filter(t => t.events.length);
  }

  /* ═══ 2. Nested Tuplets ═══ */
  function tuplets(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const DIVS = [8, 12, 10, 14, 9, 15]; // 直, 3連, 5連, 7連, 入れ子3, 入れ子5
    const ae = [];
    let deg = scaleIv.length;
    for (let bar = 0; bar < totalBars; bar++) {
      const div = DIVS[bar % DIVS.length], stepDur = bt / div;
      for (let s = 0; s < div; s++) {
        if (s % 4 !== 3) pushNote(ae, bar * bt + s * stepDur, stepDur * 0.85, 12, degToMidi(deg, rootMidi, scaleIv), s === 0 ? 84 : 64, total);
        deg += [1, -1, 2, 1, -2][Math.floor(R() * 5)];
        deg = Math.max(0, Math.min(scaleIv.length * 2 - 1, deg));
      }
    }
    return [{ events: ae, name: 'Nested Tuplets' }];
  }

  /* ═══ 3. Rhythmic Displacement ═══ */
  function displacement(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    const mel = melodyOf(ctx);
    let cell = [...new Set(mel.filter(n => n.pos < bt).map(n => Math.round(n.pos / step) % 8))].sort((a, b) => a - b);
    if (!cell.length) cell = [0, 1, 3, 4, 6];
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      const shift = bar % 8;
      cell.forEach((c, i) => {
        const slot = (c + shift) % 8;
        pushNote(ae, bar * bt + slot * step, step * 0.88, 12, degToMidi(scaleIv.length + ((i + bar) % scaleIv.length), rootMidi, scaleIv), i === 0 ? 84 : 66, total);
      });
    }
    return [{ events: ae, name: 'Displaced Cell' }];
  }

  /* ═══ 4. Granular Phrases ═══ */
  function granular(ctx) {
    const { ppq, totalBars } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    const mel = melodyOf(ctx);
    const slots = new Array(totalBars * 8).fill(null);
    for (const n of mel) {
      const s = Math.floor(n.pos / step);
      if (s >= 0 && s < slots.length && !slots[s]) slots[s] = n;
    }
    const ae = [];
    const BLOCK = 16;
    for (let base = 0; base < slots.length; base += BLOCK) {
      const block = slots.slice(base, base + BLOCK);
      const mode = (base / BLOCK) % 4;
      let order = block.map((_, i) => i);
      if (mode === 1) order.reverse();
      else if (mode === 2) order = order.map((_, i) => (i + 5) % block.length);
      else if (mode === 3) { // 前半と後半をインターリーブ
        const h = Math.floor(block.length / 2), inter = [];
        for (let i = 0; i < h; i++) { inter.push(i, i + h); }
        if (block.length % 2) inter.push(block.length - 1);
        order = inter;
      }
      order.forEach((srcIdx, outIdx) => {
        const n = block[srcIdx];
        if (n) pushNote(ae, (base + outIdx) * step, step * 0.9, 12, n.note, n.vel, total);
      });
    }
    return [{ events: ae, name: 'Granular Reorder' }];
  }

  /* ═══ 5. Overtone Glissando ═══ */
  function overtone(ctx) {
    const { ppq, totalBars, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars;
    const ae = [];
    const cycles = Math.max(1, Math.floor(totalBars / 2));
    for (let c = 0; c < cycles; c++) {
      const fMidi = rootMidi - 12 + c;
      const f0 = 440 * Math.pow(2, (fMidi - 69) / 12);
      const start = c * bt * 2;
      for (let n = 1; n <= 16; n++) {
        const note = Math.round(69 + 12 * Math.log2((f0 * n) / 440));
        if (note > 115) break;
        pushNote(ae, start + ((n - 1) / 8) * bt, bt * 0.22, 12, note, Math.max(28, Math.round(92 / Math.sqrt(n))), total);
      }
    }
    return [{ events: ae, name: 'Overtone Glissando' }];
  }

  /* ═══ 6. Tone Clusters ═══ */
  function clusters(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, beat = ppq;
    const w = T5.clusters.width | 0, half = Math.floor(w / 2);
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      const center = degToMidi((bar * 2) % (scaleIv.length * 2), rootMidi, scaleIv);
      const hits = bar % 4 === 3 ? [[0, bt * 0.94, 66]] : [[0, beat * 0.8, 62], [beat * 2, beat * 0.8, 58]];
      for (const [off, dur, vel] of hits)
        for (let s = -half; s <= half; s++) pushNote(ae, bar * bt + off, dur, 12, center + s, vel, total);
    }
    return [{ events: ae, name: 'Tone Clusters' }];
  }

  /* ═══ 7. Messiaen Modes ═══ */
  function messiaen(ctx) {
    const { ppq, totalBars, rootMidi, chord } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    const MODES = {
      '2': [0, 1, 3, 4, 6, 7, 9, 10],
      '3': [0, 2, 3, 4, 6, 7, 8, 10, 11],
      '6': [0, 2, 4, 5, 7, 9, 10, 11],
      '7': [0, 1, 2, 3, 5, 6, 7, 8, 9, 11],
    };
    const mode = MODES[T5.messiaen.mode] || MODES['2'];
    const base = rootMidi + 12;
    const ae = [];
    let idx = mode.length;
    // フレーズ長は回文 (3,5,8,5,3…) — 限定移調の対称性に寄せる
    const phraseLens = [3, 5, 8, 5, 3, 5];
    let slot = 0, p = 0;
    while (slot < totalBars * 8) {
      const len = phraseLens[p % phraseLens.length];
      for (let s = 0; s < len && slot < totalBars * 8; s++, slot++) {
        pushNote(ae, slot * step, step * 0.9, 12, base + mode[idx % mode.length] + 12 * Math.floor(idx / mode.length), 72, total);
        idx += [1, 2, -1, 1][Math.floor(R() * 4)];
        idx = Math.max(0, Math.min(mode.length * 2 - 1, idx));
      }
      slot += 2; // フレーズ間の息
      p++;
    }
    return [{ events: ae, name: 'Messiaen Mode ' + T5.messiaen.mode }];
  }

  /* ═══ 8. Raga Phrases ═══ */
  function raga(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    const L = scaleIv.length;
    // アーローハ (上昇) は vakra (ジグザグ), アヴァローハ (下降) は直線+揺らし
    const ascent = [0, 1, 3, 2, 4, 3, 5, 4, 6, 7, 8];
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      const ascending = Math.floor(bar / 2) % 2 === 0;
      for (let s = 0; s < 8; s++) {
        if (s === 7) continue; // フレーズ末の息
        let deg;
        if (ascending) deg = ascent[Math.min(s + (bar % 2) * 2, ascent.length - 1)] % (L + 1);
        else deg = Math.max(0, L - Math.floor(s * L / 7));
        const note = degToMidi(deg, rootMidi, scaleIv);
        pushNote(ae, bar * bt + s * step, step * 0.9, 12, note, s === 0 ? 82 : 68, total);
        if (!ascending && s % 3 === 2) // gamaka 的な隣接音の揺らし
          pushNote(ae, bar * bt + s * step + step * 0.55, step * 0.35, 12, degToMidi(Math.max(0, deg - 1), rootMidi, scaleIv), 52, total);
      }
    }
    return [{ events: ae, name: 'Raga Phrases' }];
  }

  /* ═══ 9. Blues Changes ═══ */
  function blues(ctx) {
    const { ppq, totalBars, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, beat = ppq;
    const FORM = [0, 0, 0, 0, 5, 5, 0, 0, 7, 5, 0, 7]; // I I I I IV IV I I V IV I V
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      const fi = bar % 12, off = FORM[fi], root = rootMidi + off;
      if (fi === 11) { // ターンアラウンド: I–VI–II–V を1拍ずつ
        [0, 9, 2, 7].forEach((o, k) => pushNote(ae, bar * bt + k * beat, beat * 0.9, 13, rootMidi - 12 + o, 82, total));
      } else {
        pushNote(ae, bar * bt, beat * 0.9, 13, root - 12, 86, total);
        pushNote(ae, bar * bt + beat * 2, beat * 0.9, 13, root - 5, 78, total);
        pushNote(ae, bar * bt + beat * 3, beat * 0.5, 13, root - 12 + (fi % 2 ? -1 : 1), 70, total);
      }
      for (const b of [1, 3]) // ドミナント7th のスタブ (拍2・4)
        for (const iv of [0, 4, 10]) pushNote(ae, bar * bt + b * beat, beat * 0.42, 12, root + iv, 58, total);
    }
    return [{ events: ae, name: 'Blues Changes' }];
  }

  /* ═══ 10. Upper Structures ═══ */
  function upper(ctx) {
    const { ppq, totalBars, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, beat = ppq;
    const USTS = { bII: 1, II: 2, bV: 6, bVI: 8, VI: 9 };
    const off = USTS[T5.upper.ust] != null ? USTS[T5.upper.ust] : 1;
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      pushNote(ae, bar * bt, bt * 0.92, 13, rootMidi - 12, 80, total);
      pushNote(ae, bar * bt, bt * 0.92, 13, rootMidi - 5, 66, total);
      const inv = [0, 4, 7][bar % 3];
      [0, 4, 7].forEach((iv, k) => {
        let n = rootMidi + 12 + off + iv;
        if (k === 0 && inv) n += 12;
        pushNote(ae, bar * bt + (k % 2) * beat * 2, bt * 0.45, 12, n, 64, total);
      });
    }
    return [{ events: ae, name: 'Upper Structure ' + T5.upper.ust }];
  }

  /* ═══ 11. Chromatic Mediants ═══ */
  function mediants(ctx) {
    const { ppq, totalBars, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    // [ルート偏移, 長/短] — 半音階メディアントの循環
    const CHAIN = [[0, 0], [3, 1], [8, 0], [4, 0], [9, 1], [3, 1]];
    const ae = [];
    for (let bar = 0; bar < totalBars; bar++) {
      const [off, minor] = CHAIN[Math.floor(bar / 2) % CHAIN.length];
      const root = rootMidi + off, tri = minor ? [0, 3, 7] : [0, 4, 7];
      pushNote(ae, bar * bt, bt * 0.94, 13, root - 12, 78, total);
      for (let s = 0; s < 8; s++)
        pushNote(ae, bar * bt + s * step, step * 0.9, 12, root + 12 + tri[s % 3] + (s >= 6 ? 12 : 0), 60, total);
    }
    return [{ events: ae, name: 'Chromatic Mediants' }];
  }

  /* ═══ 12. Suite Form ═══ */
  function suite(ctx) {
    const { ppq, totalBars, scaleIv, rootMidi } = ctx;
    const bt = ppq * 4, total = bt * totalBars, step = ppq / 2;
    const moves = [['Allemande', 0.3], ['Courante', 0.25], ['Sarabande', 0.2], ['Gigue', 0.25]];
    const ae = [];
    let cursor = 0;
    for (const [name, frac] of moves) {
      const bars = Math.max(1, Math.round(totalBars * frac));
      for (let bar = 0; bar < bars && cursor < totalBars; bar++, cursor++) {
        if (name === 'Allemande') {
          let deg = scaleIv.length;
          for (let s = 0; s < 8; s++) { pushNote(ae, cursor * bt + s * step, step * 0.9, 12, degToMidi(deg, rootMidi, scaleIv), 70, total); deg += [1, -1, 1, 2][Math.floor(R() * 4)]; deg = Math.max(0, Math.min(scaleIv.length * 2 - 1, deg)); }
        } else if (name === 'Courante') {
          for (let s = 0; s < 8; s += 2) pushNote(ae, cursor * bt + s * step, step * 1.7, 12, degToMidi(scaleIv.length + ((s * 2 + bar * 3) % scaleIv.length), rootMidi, scaleIv), 72, total);
        } else if (name === 'Sarabande') {
          pushNote(ae, cursor * bt, bt * 0.45, 12, degToMidi(scaleIv.length, rootMidi, scaleIv), 66, total);
          pushNote(ae, cursor * bt + ppq, bt * 0.45, 12, degToMidi(scaleIv.length + 2, rootMidi, scaleIv), 78, total); // 2拍目のアクセント
          pushNote(ae, cursor * bt + ppq * 2.5, bt * 0.4, 12, degToMidi(scaleIv.length + 1, rootMidi, scaleIv), 62, total);
        } else { // Gigue: 3連の跳躍
          for (let s = 0; s < 8; s++) pushNote(ae, cursor * bt + s * step, step * 0.85, 12, degToMidi(scaleIv.length + [0, 4, 2, 5, 3, 6, 4, 1][s], rootMidi, scaleIv), s % 3 === 0 ? 82 : 66, total);
        }
      }
    }
    if (ctx.log) ctx.log('// SUITE: Allemande-Courante-Sarabande-Gigue over ' + totalBars + ' bars', 'ok');
    return [{ events: ae, name: 'Suite' }];
  }

  /* ═══ 音律登録: Railsback Stretch ═══ */
  function registerRailsback() {
    try {
      if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.TEMPERAMENTS) return;
      if (!CompTuningEngine.TEMPERAMENTS.Railsback) {
        CompTuningEngine.TEMPERAMENTS.Railsback = {
          name: 'Railsback Stretch',
          desc: 'ストレッチ調律 — ピアノの Railsback カーブをオクターブ内の近似で再現 (高音側へ徐々にシャープ、各オクターブ約 +6¢)',
          cents: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5],
        };
        if (typeof CompTuningEngine.buildUI === 'function') CompTuningEngine.buildUI();
      }
    } catch (e) { /* 音律登録は任意 */ }
  }

  /* ═══ 生成フック ═══ */
  function appendTracks5(ctx) {
    const jobs = [
      ['invertible', invertible, 'INVERTIBLE COUNTERPOINT'],
      ['tuplets', tuplets, 'NESTED TUPLETS'],
      ['displace', displacement, 'RHYTHMIC DISPLACEMENT'],
      ['granular', granular, 'GRANULAR PHRASES'],
      ['overtone', overtone, 'OVERTONE GLISSANDO'],
      ['clusters', clusters, 'TONE CLUSTERS'],
      ['messiaen', messiaen, 'MESSIAEN MODES'],
      ['raga', raga, 'RAGA PHRASES'],
      ['blues', blues, 'BLUES CHANGES'],
      ['upper', upper, 'UPPER STRUCTURES'],
      ['mediants', mediants, 'CHROMATIC MEDIANTS'],
      ['suite', suite, 'SUITE FORM'],
    ];
    for (const [key, fn, label] of jobs) {
      if (!T5[key].enabled) continue;
      try {
        for (const t of fn(ctx)) {
          if (t.events && t.events.length) { ctx.tracks.push(t.events); ctx.tn.push(t.name); }
        }
        if (ctx.log) ctx.log('// ' + label + ': theory pack V track added', 'ok');
      } catch (e) {
        if (ctx.log) ctx.log('// THEORY PACK V ' + label + ' error: ' + e.message, 'warn');
      }
    }
  }

  /* ═══ UI ═══ */
  function buildUI() {
    const anchorSec = document.getElementById('theoryPack4Sec') || document.getElementById('theoryPack3Sec') || document.getElementById('theoryPackSec');
    if (!anchorSec || document.getElementById('theoryPack5Sec')) return;
    const sec = document.createElement('div');
    sec.id = 'theoryPack5Sec';
    const head = document.createElement('div');
    head.className = 'tp-head';
    head.textContent = 'Theory Pack V ';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'NEW THEORY';
    head.appendChild(badge);
    sec.appendChild(head);
    const rows = [
      ['invertible', 'INVERTIBLE COUNTERPOINT', '転回可能対位法: 旋律と対旋律を組み、後半で2声の音域をオクターブで交換する', ''],
      ['tuplets', 'NESTED TUPLETS', '入れ子トゥプレット: 小節ごとに分割数が変わる (8→12→10→14→9→15)', ''],
      ['displace', 'RHYTHMIC DISPLACEMENT', '置換: 抽出したリズムセルを小節ごとに8分音符ずつずらして反復する', ''],
      ['granular', 'GRANULAR PHRASES', 'グラニュラー再構成: 旋律を8分音符の粒に割り、ブロック単位で逆行/回転/交互に組み替える', ''],
      ['overtone', 'OVERTONE GLISSANDO', '倍音グリッサンド: 基音の倍音列 (1〜16倍音) をなぞり、周期ごとに基音が半音上がる', ''],
      ['clusters', 'TONE CLUSTERS', 'トーンクラスター: 半音の塊を打擊し、4小節ごとに長い塊を持続させる',
        `<select id="tp5ClusterW" class="tp-sel"><option value="5">幅 5</option><option value="7">幅 7</option><option value="9">幅 9</option><option value="13">幅 13</option></select>`],
      ['messiaen', 'MESSIAEN MODES', '限定移調旋法 (メシアン): 対称音階の音場を回文的なフレーズ長で歩く',
        `<select id="tp5MessiaenMode" class="tp-sel"><option value="2">第2旋法</option><option value="3">第3旋法</option><option value="6">第6旋法</option><option value="7">第7旋法</option></select>`],
      ['raga', 'RAGA PHRASES', 'ラーガの昇降型: 上昇は vakra (ジグザグ)、下降は gamaka 的な揺らしを伴うフレーズ', ''],
      ['blues', 'BLUES CHANGES', '12小節ブルース: I/IV/V のドミナント7th循環と、最終小節のターンアラウンド (I–VI–II–V)', ''],
      ['upper', 'UPPER STRUCTURES', 'アッパーストラクチャー: 低音の上に別コードのトライアドを重ねるポリコード奏法',
        `<select id="tp5UpperUst" class="tp-sel"><option value="bII">♭II</option><option value="II">II</option><option value="bV">♭V</option><option value="bVI">♭VI</option><option value="VI">VI</option></select>`],
      ['mediants', 'CHROMATIC MEDIANTS', '半音階メディアント: I→♭III→♭VI→III→VI… と半音関係のメディアントを循環する', ''],
      ['suite', 'SUITE FORM', 'バロック組曲: アレマンド→クーラント→サラバンド (2拍目のアクセント) →ジーグを全小節へ配分', ''],
    ];
    for (const [key, name, desc, extra] of rows) {
      const row = document.createElement('div');
      row.className = 'tog-row';
      row.innerHTML = `<div class="tog-info"><div class="tog-name">${name}</div><div class="tog-desc">${desc}</div></div>${extra}<div class="tog${T5[key].enabled ? ' on' : ''}" id="tp5Tog-${key}"></div>`;
      sec.appendChild(row);
      row.querySelector('.tog').addEventListener('click', ev => {
        T5[key].enabled = !T5[key].enabled;
        ev.currentTarget.classList.toggle('on', T5[key].enabled);
        save();
      });
    }
    const note = document.createElement('div');
    note.className = 'tog-desc';
    note.textContent = 'Theory Pack V は生成への追加レイヤー (全て既定 OFF)。音律の追加: CompTuning に「Railsback Stretch」(ストレッチ調律) を登録済み。';
    sec.appendChild(note);
    anchorSec.parentNode.insertBefore(sec, anchorSec.nextSibling);
    const set = (id, val, fn) => { const el = document.getElementById(id); if (!el) return; el.value = String(val); el.addEventListener('change', () => { fn(el.value); save(); }); };
    set('tp5ClusterW', T5.clusters.width, v => T5.clusters.width = +v);
    set('tp5MessiaenMode', T5.messiaen.mode, v => T5.messiaen.mode = v);
    set('tp5UpperUst', T5.upper.ust, v => T5.upper.ust = v);
  }

  function init() {
    registerRailsback();
    try {
      if (typeof TheoryPack !== 'undefined' && TheoryPack.appendTracks && window.TPCommon && !TheoryPack._tp5Wrapped) {
        const orig = TheoryPack.appendTracks;
        TheoryPack.appendTracks = function (ctx) { orig(ctx); appendTracks5(ctx); };
        TheoryPack._tp5Wrapped = true;
      }
    } catch (e) { /* TheoryPack が無い場合は生成に一切関与しない */ }
    buildUI();
    let tries = 0;
    const iv = setInterval(() => {
      if (document.getElementById('theoryPack5Sec') || ++tries > 8) { clearInterval(iv); return; }
      buildUI();
    }, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { STATE: T5, appendTracks: appendTracks5, _engines: { invertible, tuplets, displacement, granular, overtone, clusters, messiaen, raga, blues, upper, mediants, suite } };
})();
