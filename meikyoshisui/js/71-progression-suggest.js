/* ═══════════════════════════════════════════════════════════════
   71-progression-suggest.js — コード進行サジェスト (2026-11-10 追加)
   ───────────────────────────────────────────────────────────────
   「黄金進行」級の定番進行ライブラリ (移調可能) と、予測変換式の
   サジェスト。ADD CHORD にコードを入力したり進行へ追加すると、
   入力済みコード列に連続一致する定番進行を候補として提示し、
   クリックで PROG_STATE.prog へ一括適用する。

   マッチング: 進行はループとして扱い、全ローテーション × 移調を
   走査。入力列 (2コード以上) が連続セグメントとして一致するものを
   優先し、1コードの場合はそのコードを含む進行を提示する。
   品質の一致はクラス単位 (長和音 ≒ maj7、短和音 ≒ m7 は互換)。
   ═══════════════════════════════════════════════════════════════ */
const ProgSuggest = (() => {
  'use strict';
  const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  /* ── parseChord 拡張: オンコード (C/E) とポリコード (D|C) ──
     本体 parseChord は "/E" を黙って捨てるため、ラッパで拾う。
     オンコードは bass (pc) を保持、ポリコードは2和音の構成音を
     合成した iv を持つ和音として返す (生成は iv を使うため機能する)。 */
  if (typeof parseChord === 'function' && !parseChord.__tpWrapped) {
    const origParseChord = parseChord;
    const wrapped = function (str) {
      if (!str || typeof str !== 'string') return origParseChord(str);
      if (str.includes('|')) {
        const [a, b] = str.split('|').map(s => s.trim());
        const ca = origParseChord(a), cb = origParseChord(b);
        if (!ca || !cb) return null;
        const shift = ((cb.root - ca.root) % 12 + 12) % 12;
        const ivs = [...new Set([...ca.iv, ...cb.iv.map(v => v + shift)])].sort((x, y) => x - y);
        return { root: ca.root, rootName: ca.rootName, quality: 'poly', iv: ivs, name: ca.name + ' | ' + cb.name, poly: true };
      }
      const c = origParseChord(str);
      if (!c) return null;
      const si = str.lastIndexOf('/');
      if (si >= 0) {
        const bn = str.substring(si + 1).trim();
        if (/^[A-Ga-g][#b]?$/.test(bn) && typeof NN !== 'undefined') {
          const nm = bn[0].toUpperCase() + (bn[1] || '');
          const pc = NN.indexOf(typeof ALIASES !== 'undefined' && ALIASES[nm] ? ALIASES[nm] : nm);
          if (pc >= 0) { c.bass = pc; c.bassName = bn; }
        }
      }
      return c;
    };
    wrapped.__tpWrapped = true;
    try { window.parseChord = wrapped; } catch (e) { /* const binding の場合は拡張なしで継続 */ }
  }

  /* ── トライトーン代理 (裏コード): 進行内の属七を ♭II7 へ ── */
  function tritoneSubAll() {
    if (typeof PROG_STATE === 'undefined') return 0;
    let n = 0;
    for (const e of PROG_STATE.prog) {
      if (!e.chord || qClass(e.chord.quality || '') !== 'dom7') continue;
      const sub = parseChord(SHARP[(e.chord.root + 6) % 12] + (e.chord.quality || '7'));
      if (sub) { e.chord = sub; n++; }
    }
    if (n && typeof window.__cpRenderSlots === 'function') window.__cpRenderSlots();
    return n;
  }

  /* off: 主音からの半音オフセット / q: parseChord 用サフィックス / bars: 任意 */
  const S_ = (off, q, bars) => ({ off, q, bars });
  const LIBRARY = [
    /* ── 長調 ── */
    { name: '王道進行', mode: 'major', steps: [S_(0, ''), S_(7, ''), S_(9, 'm'), S_(5, '')], note: 'I–V–vi–IV。J-POP の黄金パターン' },
    { name: 'カノン進行', mode: 'major', steps: [S_(0, ''), S_(7, ''), S_(9, 'm'), S_(4, 'm'), S_(5, ''), S_(0, ''), S_(5, ''), S_(7, '')], note: 'I–V–vi–iii–IV–I–IV–V。パッヘルベル' },
    { name: '逆王道 (Axis)', mode: 'major', steps: [S_(9, 'm'), S_(5, ''), S_(0, ''), S_(7, '')], note: 'vi–IV–I–V。王道の回転形' },
    { name: '50s 進行', mode: 'major', steps: [S_(0, ''), S_(9, 'm'), S_(5, ''), S_(7, '')], note: 'I–vi–IV–V。ドゥーワップ' },
    { name: 'ターンアラウンド', mode: 'major', steps: [S_(0, ''), S_(9, 'm'), S_(2, 'm'), S_(7, '')], note: 'I–vi–ii–V (1625)' },
    { name: 'ii–V–I (ジャズ)', mode: 'major', steps: [S_(2, 'm7'), S_(7, '7'), S_(0, 'maj7')], note: 'ジャズの基本ケイデンス' },
    { name: '4536 進行', mode: 'major', steps: [S_(5, ''), S_(7, ''), S_(4, 'm'), S_(9, 'm')], note: 'IV–V–iii–vi。バラード定番' },
    { name: '456 進行', mode: 'major', steps: [S_(5, ''), S_(7, ''), S_(9, 'm')], note: 'IV–V–vi' },
    { name: '丸サ進行', mode: 'major', steps: [S_(5, 'maj7'), S_(4, '7'), S_(9, 'm7')], note: 'IVmaj7–III7–vi7。Just The Two of Us' },
    { name: 'クリープ進行', mode: 'major', steps: [S_(0, ''), S_(4, ''), S_(5, ''), S_(5, 'm')], note: 'I–III–IV–iv。Radiohead “Creep”' },
    { name: '五度圏ダイアトニック', mode: 'major', steps: [S_(0, ''), S_(5, ''), S_(11, 'dim'), S_(4, 'm'), S_(9, 'm'), S_(2, 'm'), S_(7, ''), S_(0, '')], note: 'I–IV–vii°–iii–vi–ii–V–I' },
    { name: 'バックドア・ケイデンス', mode: 'major', steps: [S_(5, 'm7'), S_(10, '7'), S_(0, 'maj7')], note: 'iv7–♭VII7–Imaj7' },
    { name: 'コルトレーン・チェンジ', mode: 'major', steps: [S_(0, 'maj7'), S_(3, '7'), S_(8, 'maj7'), S_(11, '7'), S_(4, 'maj7'), S_(7, '7'), S_(0, 'maj7')], note: 'Giant Steps の長3度サイクル' },
    { name: 'マリオ・ケイデンス', mode: 'major', steps: [S_(8, ''), S_(10, ''), S_(0, '')], note: '♭VI–♭VII–I' },
    { name: 'ミクソリディアン・ループ', mode: 'major', steps: [S_(0, ''), S_(10, ''), S_(5, ''), S_(0, '')], note: 'I–♭VII–IV–I' },
    { name: 'プラガル・ケイデンス', mode: 'major', steps: [S_(5, ''), S_(0, '')], note: 'IV–I。アーメン終止' },
    { name: 'ターンアラウンド (二次ドミナント)', mode: 'major', steps: [S_(0, 'maj7'), S_(9, '7'), S_(2, '7'), S_(7, '7')], note: 'Imaj7–VI7–II7–V7。セカンダリ・ドミナント連鎖' },
    { name: 'ロックンロール', mode: 'major', steps: [S_(0, ''), S_(5, ''), S_(7, ''), S_(5, '')], note: 'I–IV–V–IV' },
    { name: 'カントリー進行', mode: 'major', steps: [S_(0, ''), S_(7, ''), S_(5, ''), S_(0, '')], note: 'I–V–IV–I' },
    { name: 'ブルース・ロック', mode: 'major', steps: [S_(0, ''), S_(3, ''), S_(5, '')], note: 'I–♭III–IV' },
    { name: 'スケール・クライム', mode: 'major', steps: [S_(0, ''), S_(2, 'm'), S_(4, 'm'), S_(5, ''), S_(7, ''), S_(9, 'm')], note: 'I–ii–iii–IV–V–vi。音階を上行する進行' },
    { name: 'ダブル・プラガル', mode: 'major', steps: [S_(5, ''), S_(10, ''), S_(0, '')], note: 'IV–♭VII–I。二重変格終止' },
    { name: 'ツーファイブ・サイクル', mode: 'major', steps: [S_(2, 'm7'), S_(7, '7'), S_(0, 'maj7'), S_(9, '7')], note: 'ii7–V7–Imaj7–VI7。循環ケイデンス' },
    { name: 'リズムチェンジ (A)', mode: 'major', steps: [S_(0, 'maj7'), S_(9, '7'), S_(2, 'm7'), S_(7, '7'), S_(0, 'maj7'), S_(9, '7'), S_(2, 'm7'), S_(7, '7')], note: 'I Got Rhythm のAセクション' },
    { name: 'リズムチェンジ・ブリッジ', mode: 'major', steps: [S_(4, '7'), S_(9, '7'), S_(2, '7'), S_(7, '7')], note: 'III7–VI7–II7–V7。ドミナントの五度連鎖' },
    { name: 'ジャズ・ブルース', mode: 'major', steps: [S_(0, '7'), S_(5, '7'), S_(0, '7'), S_(0, '7'), S_(5, '7'), S_(5, '7'), S_(0, '7'), S_(9, '7'), S_(2, 'm7'), S_(7, '7'), S_(0, '7'), S_(7, '7')], note: '12小節ジャズ・ブルース (簡略形)' },
    /* ── 短調 ── */
    { name: 'アンダルシア・カデンツ', mode: 'minor', steps: [S_(0, 'm'), S_(10, ''), S_(8, ''), S_(7, '')], note: 'i–VII–VI–V。フラメンコ' },
    { name: '小室進行', mode: 'minor', steps: [S_(0, 'm'), S_(8, ''), S_(10, ''), S_(0, 'm')], note: 'i–VI–VII–i。90s J-POP' },
    { name: 'マイナー・アクシス', mode: 'minor', steps: [S_(0, 'm'), S_(8, ''), S_(3, ''), S_(10, '')], note: 'i–VI–III–VII' },
    { name: 'マイナー五度圏', mode: 'minor', steps: [S_(0, 'm'), S_(5, 'm'), S_(10, ''), S_(3, ''), S_(8, ''), S_(2, 'dim'), S_(7, ''), S_(0, 'm')], note: 'i–iv–VII–III–VI–ii°–V–i' },
    { name: 'ドリアン・ループ', mode: 'minor', steps: [S_(0, 'm7'), S_(5, '7')], note: 'im7–IV7。Oye Como Va' },
    { name: 'ワンダーウォール進行', mode: 'minor', steps: [S_(0, 'm'), S_(3, ''), S_(10, ''), S_(5, '')], note: 'i–III–VII–IV。Oasis “Wonderwall”' },
    { name: 'ホテル・カリフォルニア進行', mode: 'minor', steps: [S_(0, 'm'), S_(7, ''), S_(10, ''), S_(5, ''), S_(8, ''), S_(3, ''), S_(5, 'm'), S_(7, '')], note: 'i–V–VII–IV–VI–III–iv–V。下降バスライン' },
    { name: 'ラ・フォリア', mode: 'minor', steps: [S_(0, 'm'), S_(7, ''), S_(0, 'm'), S_(10, ''), S_(3, ''), S_(10, ''), S_(0, 'm'), S_(7, ''), S_(0, 'm')], note: 'i–V–i–VII–III–VII–i–V–i。バロックの定型' },
    { name: '枯葉 (Autumn Leaves)', mode: 'minor', steps: [S_(5, 'm7'), S_(10, '7'), S_(3, 'maj7'), S_(8, 'maj7'), S_(2, 'm7b5'), S_(7, '7'), S_(0, 'm')], note: 'iv7–VII7–IIImaj7–VImaj7–iiø–V7–i' },
    { name: 'マイナー ii–V–i', mode: 'minor', steps: [S_(2, 'm7b5'), S_(7, '7'), S_(0, 'm7')], note: 'iiø–V7–i。短調の基本ケイデンス' },
    { name: 'マイナー・ブルース', mode: 'minor', steps: [S_(0, 'm', 4), S_(5, 'm', 2), S_(0, 'm', 2), S_(7, '7', 1), S_(5, 'm', 1), S_(0, 'm', 1), S_(7, '7', 1)], note: '12小節マイナー・ブルース' },
    { name: 'ライン・クリシェ', mode: 'minor', steps: [S_(0, 'm'), S_(0, 'mM7'), S_(0, 'm7'), S_(8, '')], note: 'i–imaj7–i7–VI。内声が半音下降する定型' },
    { name: 'フリジアン・ループ', mode: 'minor', steps: [S_(0, 'm'), S_(1, '')], note: 'i–♭II。フリジアンの響き' },
    { name: '短調下行 (哀愁)', mode: 'minor', steps: [S_(0, 'm'), S_(10, ''), S_(8, ''), S_(5, 'm'), S_(7, '')], note: 'i–VII–VI–iv–V' },
    /* ── ブルース ── */
    { name: '12バー・ブルース', mode: 'major', steps: [S_(0, '7', 4), S_(5, '7', 2), S_(0, '7', 2), S_(7, '7', 1), S_(5, '7', 1), S_(0, '7', 1), S_(7, '7', 1)], note: 'I7–IV7–V7 の12小節定型' },
    /* ── ボカロ ── */
    { name: 'ボカロ疾走マイナー', mode: 'minor', steps: [S_(0, 'm'), S_(10, ''), S_(8, ''), S_(10, '')], note: 'i–VII–VI–VII。疾走感のあるマイナー・ループ' },
    { name: 'ボカロ・サビ (IV始動)', mode: 'major', steps: [S_(5, ''), S_(0, ''), S_(7, ''), S_(9, 'm')], note: 'IV–I–V–vi。サビ頭で多用される始動形' },
    { name: 'ボカロ・ドライブ', mode: 'minor', steps: [S_(0, 'm'), S_(8, ''), S_(10, ''), S_(7, '')], note: 'i–VI–VII–V。ループ先頭へ戻す緊張感' },
    { name: '上昇フィニッシュ VI–VII–i', mode: 'minor', steps: [S_(8, ''), S_(10, ''), S_(0, 'm')], note: 'VI–VII–i。駆け上がって主音で締める' },
    { name: 'ダーク・ループ i–VII', mode: 'minor', steps: [S_(0, 'm'), S_(10, '')], note: 'i–VII。ダーク系ボカロの2コード・ループ' },
    { name: 'キラキラ進行', mode: 'major', steps: [S_(0, ''), S_(4, 'm'), S_(5, ''), S_(7, '')], note: 'I–iii–IV–V。明るいポップス/キラキラ系' },
    { name: 'ボカロ・セブンス循環', mode: 'major', steps: [S_(0, 'maj7'), S_(9, 'm7'), S_(2, 'm7'), S_(7, '7')], note: 'Imaj7–vi7–ii7–V7。お洒落系の循環' },
  ];

  function qClass(q) {
    if (q === 'poly') return 'poly';
    if (!q) return 'maj';
    if (q === 'maj7' || q === 'maj9' || q === '6' || q === 'add9') return 'maj7';
    if (q === 'm') return 'min';
    if (q === 'm7' || q === 'm9' || q === 'm11' || q === 'mM7') return 'm7';
    if (q === 'dim' || q === 'dim7') return 'dim';
    if (q === 'm7b5') return 'hdim';
    if (q === 'aug') return 'aug';
    if (q === 'sus4' || q === 'sus2') return 'sus';
    return 'dom7'; /* 7, 9, 11, 13, 7sus4 … */
  }
  const compat = (a, b) => a === b
    || (a === 'maj' && b === 'maj7') || (a === 'maj7' && b === 'maj')
    || (a === 'min' && b === 'm7') || (a === 'm7' && b === 'min');

  const ROMAN_MAJ = ['I', '♭II', 'II', '♭III', 'III', 'IV', '♭V', 'V', '♭VI', 'VI', '♭VII', 'VII'];
  const ROMAN_MIN = ['I', '♭II', 'II', 'III', '♯III', 'IV', '♭V', 'V', 'VI', '♭VII', 'VII', '♯VII'];
  function roman(step, mode) {
    let r = (mode === 'minor' ? ROMAN_MIN : ROMAN_MAJ)[step.off] || '?';
    const c = qClass(step.q);
    if (c === 'min' || c === 'm7' || c === 'dim') r = r.toLowerCase();
    if (c === 'dim') r += '°';
    if (c === 'aug') r += '+';
    if (c === 'dom7' || c === 'm7') r += '7';
    if (c === 'maj7') r += 'maj7';
    return r;
  }
  const chordName = (tonic, step) => SHARP[((tonic + step.off) % 12 + 12) % 12] + step.q;
  const seqText = (entry, tonic) => entry.steps.map(s => chordName(tonic, s)).join(' → ');

  /* 入力列 [{root, cls}] に対する候補 (最大6件) */
  function suggest(entered) {
    if (!entered.length) return [];
    const out = new Map();
    LIBRARY.forEach((entry, li) => {
      const L = entry.steps.length;
      for (let r = 0; r < L; r++) {
        const tonic = ((entered[0].root - entry.steps[r].off) % 12 + 12) % 12;
        let ok = true;
        for (let i = 0; i < entered.length; i++) {
          const st = entry.steps[(r + i) % L];
          if (((tonic + st.off) % 12 + 12) % 12 !== entered[i].root || !compat(qClass(st.q), entered[i].cls)) { ok = false; break; }
        }
        if (!ok) continue;
        const score = (entered.length >= 2 ? 1000 + entered.length * 10 : 500) - li;
        if (!out.has(entry.name) || out.get(entry.name).score < score)
          out.set(entry.name, { entry, tonic, score });
      }
    });
    return [...out.values()].sort((a, b) => b.score - a.score).slice(0, 6);
  }

  function apply(entry, tonic) {
    if (typeof PROG_STATE === 'undefined' || typeof parseChord === 'undefined') return;
    PROG_STATE.prog = entry.steps
      .map(s => ({ chord: parseChord(chordName(tonic, s)), bars: s.bars || 4 }))
      .filter(e => e.chord);
    if (!PROG_STATE.prog.length) return;
    if (!PROG_STATE.enabled) {
      PROG_STATE.enabled = true;
      const tog = document.getElementById('togProgression');
      if (tog) tog.classList.add('on');
      const ctrl = document.getElementById('progressionControls');
      if (ctrl) ctrl.style.display = 'block';
    }
    document.querySelectorAll('.cp-preset-btn').forEach(b => b.classList.remove('on'));
    if (typeof window.__cpRenderSlots === 'function') window.__cpRenderSlots();
  }

  /* ── UI ── */
  function currentEntered() {
    const seq = [];
    if (typeof PROG_STATE !== 'undefined')
      for (const e of PROG_STATE.prog) if (e.chord) seq.push({ root: e.chord.root % 12, cls: qClass(e.chord.quality || '') });
    const inp = document.getElementById('cpAddInput');
    if (inp && inp.value.trim() && typeof parseChord === 'function') {
      const c = parseChord(inp.value.trim());
      if (c) seq.push({ root: c.root % 12, cls: qClass(c.quality || '') });
    }
    return seq;
  }
  function render() {
    const row = document.getElementById('cpSuggestRow');
    if (!row) return;
    const entered = currentEntered();
    row.innerHTML = '';
    let items, headText;
    if (entered.length) {
      items = suggest(entered);
      headText = items.length ? `進行サジェスト — ${entered.length}コードから予測` : '進行サジェスト — 一致する定番進行なし';
    } else {
      const tonic = (typeof S !== 'undefined' && S.chord) ? S.chord.root % 12 : 0;
      items = LIBRARY.map(entry => ({ entry, tonic, score: 0 }));
      headText = '進行ライブラリ — 全' + LIBRARY.length + '種 (キー: ' + SHARP[tonic] + ')';
    }
    const label = document.getElementById('cpSuggestLabel');
    if (label) label.textContent = headText;
    for (const { entry, tonic } of items) {
      const chip = document.createElement('div');
      chip.className = 'cp-preset-btn';
      chip.textContent = entry.name + ' — ' + seqText(entry, tonic);
      chip.title = entry.note + ' | ' + entry.steps.map(s => roman(s, entry.mode)).join('–');
      chip.addEventListener('click', () => { apply(entry, tonic); render(); });
      row.appendChild(chip);
    }
  }
  function init() {
    const addRow = document.querySelector('.cp-add-row');
    if (!addRow || document.getElementById('cpSuggestRow')) return;
    const label = document.createElement('div');
    label.id = 'cpSuggestLabel';
    label.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:8px;color:#00e67688;letter-spacing:3px;margin:14px 0 6px;";
    label.textContent = '進行サジェスト';
    const rowEl = document.createElement('div');
    rowEl.className = 'cp-preset-row';
    rowEl.id = 'cpSuggestRow';
    addRow.parentNode.insertBefore(label, addRow.nextSibling);
    addRow.parentNode.insertBefore(rowEl, label.nextSibling);
    const inp = document.getElementById('cpAddInput');
    if (inp) inp.addEventListener('input', render);
    const addBtn = document.getElementById('cpAddBtn');
    if (addBtn) addBtn.addEventListener('click', () => setTimeout(render, 0));
    const slots = document.getElementById('cpSlots');
    if (slots) slots.addEventListener('click', () => setTimeout(render, 0));
    const main = document.getElementById('chordInput');
    if (main) main.addEventListener('input', () => setTimeout(render, 50));
    const subBtn = document.createElement('button');
    subBtn.className = 'cp-add-btn';
    subBtn.textContent = '裏コード置換 (属七→♭II7)';
    subBtn.title = '進行内のドミナント7thをトライトーン代理へ置換';
    subBtn.style.marginTop = '8px';
    subBtn.addEventListener('click', () => { tritoneSubAll(); render(); });
    rowEl.parentNode.insertBefore(subBtn, rowEl.nextSibling);
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { LIBRARY, suggest, apply, render, qClass, tritoneSubAll };
})();
