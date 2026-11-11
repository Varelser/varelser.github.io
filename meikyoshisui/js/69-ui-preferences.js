/* ── 2026-11-10: UI Preferences (readability toggle + first-run chord seed) ──
   - READABLE トグル: body.readable-ui の ON/OFF を localStorage に保存する。
     従来は index.html に class が固定で書かれており切替できなかった。
   - 初回コード: 保存済み状態 (auto スロット) が無く、コード未入力の場合だけ
     'Cmaj7' を初期値として入れ、開いてすぐ GENERATE できるようにする。
     保存済み状態がある場合は一切触らない。 */
document.addEventListener('DOMContentLoaded', () => {
  /* ── readability toggle ── */
  const READABLE_KEY = 'meikyoshisui_readable_ui';
  const btn = document.getElementById('readableToggle');
  const applyReadable = on => {
    document.body.classList.toggle('readable-ui', on);
    if (btn) btn.textContent = on ? 'READABLE: ON' : 'READABLE: OFF';
  };
  let readableOn = true;
  try {
    readableOn = localStorage.getItem(READABLE_KEY) !== 'off';
  } catch (_) { /* storage 不可なら既定 ON */ }
  applyReadable(readableOn);
  if (btn) {
    btn.addEventListener('click', () => {
      readableOn = !document.body.classList.contains('readable-ui');
      applyReadable(readableOn);
      try {
        localStorage.setItem(READABLE_KEY, readableOn ? 'on' : 'off');
      } catch (_) { /* 保存できなくても切替自体は有効 */ }
    });
  }

  /* ── 2026-11-10: デザイン切替 (Modern Skin) ──
     styles-modern.css の link を有効/無効にするだけの表示専用トグル。
     既定は MODERN。CLASSIC で従来の外観に戻る。localStorage に保存。 */
  const DESIGN_KEY = 'meikyoshisui_design';
  const skinLink = document.getElementById('modernSkinLink');
  if (skinLink && btn && btn.parentElement) {
    const dBtn = document.createElement('button');
    dBtn.id = 'designToggle';
    dBtn.className = 'ecb-preset-btn';
    dBtn.style.cssText = 'float:right;margin-right:8px';
    dBtn.title = 'デザイン切替: MODERN (洗練されたソリッドな外観) / CLASSIC (従来)';
    const applyDesign = modern => {
      skinLink.disabled = !modern;
      dBtn.textContent = modern ? 'DESIGN: MODERN' : 'DESIGN: CLASSIC';
    };
    let modern = true;
    try { modern = localStorage.getItem(DESIGN_KEY) !== 'classic'; } catch (_) { /* 既定 MODERN */ }
    applyDesign(modern);
    dBtn.addEventListener('click', () => {
      modern = skinLink.disabled; /* 現在無効なら MODERN へ */
      applyDesign(modern);
      try { localStorage.setItem(DESIGN_KEY, modern ? 'modern' : 'classic'); } catch (_) { /* 保存不可でも切替は有効 */ }
    });
    btn.parentElement.insertBefore(dBtn, btn);
  }

  /* ── first-run chord seed ── */
  try {
    const hasAutoSlot = !!localStorage.getItem('meikyoshisui_v25___auto__');
    const input = document.getElementById('chordInput');
    if (!hasAutoSlot && input && !input.value.trim() &&
        typeof S !== 'undefined' && S && !S.chord) {
      input.value = 'Cmaj7';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } catch (_) { /* 失敗しても通常起動を妨げない */ }
});

/* ── 2026-11-10: 微分音スケールのセントプレビュー ──
   #scaleWrap の直後に読み出し行を置き、選択中スケールが微分音 (MICRO_CENTS)
   または EDO のときだけ、各デグリーのセント値と 12平均律からの偏差を表示する。
   スケールボタンのクリックと、プリセット読込等を拾うための低頻度ポーリングで更新。 */
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('scaleWrap');
  if (!wrap || !wrap.parentElement) return;
  const readout = document.createElement('div');
  readout.id = 'scaleCentsReadout';
  readout.style.cssText = 'display:none;font-family:Share Tech Mono,monospace;font-size:10px;line-height:1.7;color:var(--amber);letter-spacing:.04em;margin:6px 0 2px;word-break:break-all;';
  wrap.parentElement.insertBefore(readout, wrap.nextSibling);

  function degreeCentsFor(scaleName) {
    if (typeof MICRO_CENTS !== 'undefined' && MICRO_CENTS[scaleName]) {
      if (typeof CompTuningEngine !== 'undefined' && typeof CompTuningEngine.getScaleDegreeCents === 'function') {
        const via = CompTuningEngine.getScaleDegreeCents(scaleName, 0);
        if (Array.isArray(via) && via.length) return { cents: via, intervals: null };
      }
      return { cents: MICRO_CENTS[scaleName].slice(), intervals: null };
    }
    const P = window.__MEIKY_PATCH__;
    if (P && typeof P.getEDOSteps === 'function') {
      const steps = P.getEDOSteps(scaleName);
      if (Array.isArray(steps) && steps.length > 1) {
        const division = steps[steps.length - 1] || 12;
        return { cents: steps.map(s => +(s * 1200 / division).toFixed(1)), intervals: null };
      }
    }
    return null;
  }

  function refresh() {
    if (typeof S === 'undefined' || !S || !S.scale) { readout.style.display = 'none'; return; }
    const found = degreeCentsFor(S.scale);
    if (!found) { readout.style.display = 'none'; readout.textContent = ''; return; }
    /* 偏差は「最も近い12平均律ピッチから何セントずれているか」で統一表示する。
       ±50 のタイは '±50' と明示する (スケール固有の iv 基準だと符号が曖昧になるため)。 */
    const parts = found.cents.map(c => {
      const rounded = Math.round(c * 10) / 10;
      const dev = Math.round((c - Math.round(c / 100) * 100) * 10) / 10;
      if (dev === 0) return `${rounded}`;
      if (Math.abs(dev) === 50) return `${rounded} (±50)`;
      return `${rounded} (${dev > 0 ? '+' : ''}${dev})`;
    });
    readout.textContent = `◈ ${S.scale} — ${found.cents.length}音 / cents: ${parts.join(' · ')} · 1200`;
    readout.style.display = 'block';
  }

  let lastScale = null;
  const tick = () => {
    const cur = (typeof S !== 'undefined' && S) ? S.scale : null;
    if (cur !== lastScale) { lastScale = cur; refresh(); }
  };
  wrap.addEventListener('click', () => setTimeout(tick, 0));
  tick();
  setInterval(tick, 1000);
});

/* ═══════════════════════════════════════════════════════════════
   2026-11-10: UI 改善 (docs/UI_PLAN.md U0〜U5)
   ───────────────────────────────────────────────────────────────
   U0 セクション registry / U1 階層ビュー / U2 検索・有効フィルタ・
   パラメータ説明文 / U3 生成バー / U4 マクロ / U5 状態サマリー。
   全て「見せ方」の層だけを触り、既存の id・配線・保存形式には触れない。
   セクションの表示/非表示は .panel 要素の display だけを切り替える。
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ── U0: セクション registry ──
     [sec-label の見出し, slug, tier (0=生成 / 1=レイヤー / 2=実験室), 検索キーワード] */
  const SECTION_DEFS = [
    ['Chord Input', 'chord-input', 0, 'コード 入力 和音 chord'],
    ['Genre / Texture', 'genre', 0, 'ジャンル 質感 genre プリセット'],
    ['CC Automation', 'cc-automation', 2, 'cc オートメーション automation'],
    ['Attractor Sequencer', 'attractor-seq', 1, 'アトラクタ シーケンサ attractor'],
    ['Scale Mutation', 'scale-mutation', 1, 'スケール 変異 mutation'],
    ['Chord Progression', 'progression', 0, 'コード進行 進行 progression'],
    ['Conductor Track', 'conductor', 1, '指揮者 conductor テンポ セクション'],
    ['Rhythmic Canons', 'rhythmic-canons', 1, 'リズム カノン canons'],
    ['Just Intonation', 'just-intonation', 1, '純正律 ji intonation'],
    ['Neo-Riemannian', 'neo-riemannian', 2, 'ネオ リーマン nr 変換 tonnetz'],
    ['Negative Harmony', 'negative-harmony', 2, '負の和声 ネガティブ negative'],
    ['Swarm Intelligence', 'boids', 1, '群れ boids ボイド swarm'],
    ['Lorenz Attractor', 'lorenz', 1, 'ローレンツ lorenz'],
    ['Cellular Automaton', 'cellular-automaton', 1, 'セル オートマトン ca automaton'],
    ['Xenakis Sieve Theory', 'sieve', 1, '篩 シーブ クセナキス sieve'],
    ['Euclidean Rhythm', 'euclidean', 1, 'ユークリッド リズム euclidean'],
    ['Humanizer Noise', 'humanizer', 1, 'ヒューマナイズ 揺らぎ humanizer ノイズ'],
    ['Integral Serialism', 'serialism', 2, 'セリエリズム serialism 総音程'],
    ['Markov Chain Melody', 'markov', 1, 'マルコフ markov メロディ'],
    ['L-System', 'lsystem', 1, 'l-system フレーズ 成長'],
    ['Rubato Engine', 'rubato', 1, 'ルバート rubato テンポ'],
    ['Spectral Analysis', 'spectral', 1, 'スペクトル spectral 倍音'],
    ['Solfeggio Frequencies', 'solfeggio', 1, 'ソルフェジオ solfeggio 周波数'],
    ['Binaural Beat Engine', 'binaural', 1, 'バイノーラル binaural ビート'],
    ['Compensation Tuning', 'comp-tuning', 2, '補正 調律 tuning テンパラメント scala'],
    ['Macro Structure', 'macro-structure', 0, 'マクロ macro 構成 セクション'],
    ['Theory Framework', 'theory-framework', 2, '理論 theory フレームワーク'],
    ['Theory Analysis', 'theory-analysis', 2, '理論 theory 分析 analysis'],
    ['PC Set Similarity Map', 'pcset-map', 2, '音集合 pc set 類似 マップ'],
    ['Octave Range Control', 'octave-range', 1, 'オクターブ octave 音域'],
    ['Synthesis Parameters', 'synthesis', 1, '基本 synthesis パラメータ 密度'],
    ['Layers', 'layers', 0, 'レイヤー layers 生成 プレビュー generate'],
    ['Multi-File Export', 'multi-export', 2, '書き出し export 個別 osc musicxml'],
  ];

  const sections = [];
  document.querySelectorAll('.sec-label').forEach(label => {
    const panel = label.closest('.panel');
    if (!panel) return;
    const title = (label.textContent || '').trim();
    const def = SECTION_DEFS.find(d => title.toLowerCase().startsWith(d[0].toLowerCase()));
    const slug = def ? def[1] : 'unregistered-' + sections.length;
    panel.dataset.section = slug;
    sections.push({
      slug,
      title: def ? def[0] : title,
      tier: def ? def[2] : 1,
      keywords: (def ? def[3] : '') + ' ' + title,
      el: panel,
    });
  });

  /* ── U2: パラメータ説明文 (スライダー id → 一文説明) ── */
  const PARAM_DESCRIPTIONS = {
    bpm: '生成する曲全体のテンポ',
    bars: '生成する小節数 (セクション長)',
    density: 'ノートの密度。高いほど音数が増える',
    velocity: 'ノートの強さ (ベロシティ) の中心値',
    dissonance: '不協和な音程をどれだけ許すか',
    humanize: 'タイミングと強さへの人間的な揺らぎ',
    gateBase: 'ノートの長さの比率 (発音の持続)',
    gateHumanize: 'ノート長への揺らぎ',
    drift: 'パラメータ全体の緩やかな漂流',
    tempoDrift: 'テンポの緩やかな漂流',
    polyrhythm: 'レイヤー間の拍のずれ (ポリリズム)',
    resolveThreshold: '不協和が解決へ向かう閾値',
    resolveSteps: '解決までにかけるステップ数',
    octSpread: '音域の広がり (オクターブ幅)',
    octBias: '音域の中心の偏り (高音寄り/低音寄り)',
    rootOct: 'ルート音のオクターブ位置',
    pbRange: 'ピッチベンドの可動範囲 (半音)',
    spBrightness: '倍音の明るさ (高域の強調)',
    spHarmonics: '倍音成分の数',
    spRolloff: '高域倍音の減衰の速さ',
    spThreshold: 'スペクトル処理が効き始める閾値',
    spConsGate: '協和度によるゲートの強さ',
    eucPulses: 'ユークリッドリズムのパルス数 k',
    eucSteps: 'ユークリッドリズムのステップ数 n',
    eucRotation: 'パターンの回転 (開始位置ずらし)',
    caRule: 'セルオートマトンのルール番号',
    lzSigma: 'Lorenz の σ (対流の強さ)',
    lzRho: 'Lorenz の ρ (温度差、カオスの主因)',
    lzBeta: 'Lorenz の β (減衰)',
    mkvTension: 'Markov メロディの緊張度',
    mkvTemp: 'Markov 選択のランダムさ (温度)',
    humVelScale: 'ベロシティ揺らぎの大きさ',
    humTimScale: 'タイミング揺らぎの大きさ (ticks)',
    sfDensity: 'Solfeggio レイヤーの密度',
    sfGate: 'Solfeggio ノートの長さ',
    bbVelocity: 'Binaural ノートのベロシティ',
    ctGlobalCents: '全体へのセント単位の微調整',
    ctPbRange: 'CompTuning が使う PB レンジ (半音)',
    rcN: 'Rhythmic Canons の総ステップ数',
  };

  /* ── スタイル注入 ── */
  const style = document.createElement('style');
  style.textContent = `
    #uiControlBar { position: sticky; top: 0; z-index: 60; background: var(--bg, #000);
      border: 1px solid var(--border, #333); padding: 8px 10px; margin: 10px 0; }
    #uiControlBar .ui-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    #uiControlBar .ui-row + .ui-row { margin-top: 6px; }
    .ui-view-btn { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: .08em;
      background: transparent; color: var(--text-dim, #888); border: 1px solid var(--border, #333);
      padding: 4px 12px; cursor: pointer; }
    .ui-view-btn.on { color: var(--teal, #2dd4bf); border-color: var(--teal, #2dd4bf); }
    #uiSearch { font-family: 'Share Tech Mono', monospace; font-size: 11px; background: transparent;
      color: inherit; border: 1px solid var(--border, #333); padding: 4px 8px; min-width: 180px; }
    .ui-check { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--text-dim, #888);
      display: inline-flex; gap: 4px; align-items: center; cursor: pointer; }
    .status-chip { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: .05em;
      border: 1px solid var(--border, #333); color: var(--text-dim, #888); padding: 2px 7px; }
    .status-chip b { color: var(--teal, #2dd4bf); font-weight: normal; }
    #macroPanel .param-row { max-width: 560px; }
    .param-desc { display: none; font-size: 10px; color: var(--text-dim, #888); line-height: 1.5;
      margin: 1px 0 5px; letter-spacing: .02em; }
    body.show-desc .param-desc { display: block; }
    #genBar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 70; display: flex; gap: 6px;
      align-items: center; flex-wrap: wrap; padding: 7px 10px; background: var(--bg, #000);
      border-top: 1px solid var(--border, #333); }
    #genBar button { font-family: 'Share Tech Mono', monospace; font-size: 11px; background: transparent;
      color: inherit; border: 1px solid var(--border, #333); padding: 5px 10px; cursor: pointer; }
    #genBar button.primary { color: var(--teal, #2dd4bf); border-color: var(--teal, #2dd4bf); }
    #genBarStatus { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--text-dim, #888); }
    body { padding-bottom: 52px; }
  `;
  document.head.appendChild(style);

  /* ── コントロールバーの構築 (最初のセクションの直前) ── */
  const firstPanel = sections.length ? sections[0].el : null;
  const bar = document.createElement('div');
  bar.id = 'uiControlBar';
  bar.innerHTML = `
    <div class="ui-row">
      <button type="button" class="ui-view-btn" data-view="play">生成</button>
      <button type="button" class="ui-view-btn" data-view="design">レイヤー</button>
      <button type="button" class="ui-view-btn" data-view="lab">実験室</button>
      <input id="uiSearch" type="search" placeholder="セクション / パラメータ検索 (例: 純正律、lorenz)">
      <label class="ui-check"><input type="checkbox" id="uiActiveOnly"> 有効なものだけ</label>
      <label class="ui-check"><input type="checkbox" id="uiShowDesc"> 説明文</label>
      <span id="uiSectionCount" style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text-dim,#888);"></span>
    </div>
    <div class="ui-row" id="statusChips"></div>`;
  if (firstPanel && firstPanel.parentElement) {
    firstPanel.parentElement.insertBefore(bar, firstPanel);
  } else {
    document.body.insertBefore(bar, document.body.firstChild);
  }

  /* ── U4: マクロパネル (コントロールバーの直後) ── */
  const MACROS = [
    { id: 'density', label: '密度', targets: [['density', 1]] },
    { id: 'velocity', label: '強さ', targets: [['velocity', 1]] },
    { id: 'dissonance', label: '不協和', targets: [['dissonance', 1], ['resolveThreshold', -1]] },
    { id: 'humanize', label: 'ゆらぎ', targets: [['humanize', 1], ['gateHumanize', 1]] },
    { id: 'spread', label: '広がり', targets: [['octSpread', 1]] },
    { id: 'brightness', label: '明るさ', targets: [['spBrightness', 1], ['spRolloff', -1]] },
    { id: 'length', label: '長さ', targets: [['gateBase', 1]] },
    { id: 'chaos', label: 'カオス', targets: [['drift', 1], ['tempoDrift', 1], ['polyrhythm', 1]] },
  ];
  function setSliderNormalized(slider, pos) {
    const min = parseFloat(slider.min || '0');
    const max = parseFloat(slider.max || '100');
    const step = parseFloat(slider.step || '0');
    let value = min + Math.max(0, Math.min(1, pos)) * (max - min);
    if (step > 0) value = min + Math.round((value - min) / step) * step;
    slider.value = String(+value.toFixed(4));
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function sliderNormalized(slider) {
    const min = parseFloat(slider.min || '0');
    const max = parseFloat(slider.max || '100');
    if (max === min) return 0;
    return (parseFloat(slider.value) - min) / (max - min);
  }
  const macroPanel = document.createElement('div');
  macroPanel.id = 'macroPanel';
  macroPanel.className = 'panel full';
  macroPanel.innerHTML = '<div class="panel-top"></div><div class="sec-label">Macros <span class="badge">UI</span></div>' +
    MACROS.map(m => `
      <div class="param-row">
        <span class="param-label">${m.label}</span>
        <input type="range" class="slider macro-slider" data-macro="${m.id}" min="0" max="100" value="50">
        <span class="pval" data-macro-val="${m.id}">50</span>
      </div>`).join('');
  bar.parentElement.insertBefore(macroPanel, bar.nextSibling);
  /* マクロ自体も registry に載せる (生成ビューに表示) */
  sections.unshift({ slug: 'macros', title: 'Macros', tier: 0, keywords: 'マクロ macro 密度 不協和 ゆらぎ', el: macroPanel });
  macroPanel.dataset.section = 'macros';

  const macroInputs = new Map();
  macroPanel.querySelectorAll('.macro-slider').forEach(input => {
    const macro = MACROS.find(m => m.id === input.dataset.macro);
    macroInputs.set(macro.id, input);
    const primary = document.getElementById(macro.targets[0][0]);
    if (primary) {
      const pos = sliderNormalized(primary);
      const shown = Math.round((macro.targets[0][1] > 0 ? pos : 1 - pos) * 100);
      input.value = String(shown);
      const valEl = macroPanel.querySelector(`[data-macro-val="${macro.id}"]`);
      if (valEl) valEl.textContent = String(shown);
    }
    input.addEventListener('input', () => {
      const v = parseFloat(input.value) / 100;
      const valEl = macroPanel.querySelector(`[data-macro-val="${macro.id}"]`);
      if (valEl) valEl.textContent = input.value;
      macro.targets.forEach(([sliderId, dir]) => {
        const slider = document.getElementById(sliderId);
        if (slider) setSliderNormalized(slider, dir > 0 ? v : 1 - v);
      });
    });
  });

  /* ── U2: 説明文の差し込み ── */
  document.querySelectorAll('.param-row').forEach(row => {
    const slider = row.querySelector('input[type="range"]');
    if (!slider || !slider.id) return;
    const desc = PARAM_DESCRIPTIONS[slider.id];
    if (!desc) return;
    const el = document.createElement('div');
    el.className = 'param-desc';
    el.textContent = desc;
    row.parentElement.insertBefore(el, row.nextSibling);
  });

  /* ── U1 + U2: ビュー / 検索 / 有効フィルタ ── */
  const VIEW_KEY = 'meikyoshisui_ui_view';
  const DESC_KEY = 'meikyoshisui_ui_desc';
  const viewTier = { play: 0, design: 1, lab: 2 };
  let currentView = 'design';
  try {
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved && saved in viewTier) currentView = saved;
  } catch (_) { /* 既定はレイヤー */ }
  const searchInput = document.getElementById('uiSearch');
  const activeOnlyBox = document.getElementById('uiActiveOnly');
  const descBox = document.getElementById('uiShowDesc');
  let descOn = true;
  try { descOn = localStorage.getItem(DESC_KEY) !== 'off'; } catch (_) { /* 既定 ON */ }
  descBox.checked = descOn;
  document.body.classList.toggle('show-desc', descOn);
  descBox.addEventListener('change', () => {
    document.body.classList.toggle('show-desc', descBox.checked);
    try { localStorage.setItem(DESC_KEY, descBox.checked ? 'on' : 'off'); } catch (_) {}
  });

  function sectionIsActive(section) {
    const togs = section.el.querySelectorAll('.tog');
    if (!togs.length) return true;
    return !!section.el.querySelector('.tog.on');
  }
  function applyFilters() {
    const query = (searchInput.value || '').trim().toLowerCase();
    const activeOnly = activeOnlyBox.checked;
    let shown = 0;
    for (const section of sections) {
      let visible;
      if (query) {
        const hay = (section.keywords + ' ' + section.el.textContent).toLowerCase();
        visible = hay.includes(query);
      } else {
        visible = section.tier <= viewTier[currentView];
      }
      if (visible && activeOnly) visible = sectionIsActive(section);
      section.el.style.display = visible ? '' : 'none';
      if (visible) shown++;
    }
    const count = document.getElementById('uiSectionCount');
    if (count) count.textContent = shown + ' / ' + sections.length + ' sections';
    bar.querySelectorAll('.ui-view-btn').forEach(btn => {
      btn.classList.toggle('on', btn.dataset.view === currentView);
    });
  }
  bar.querySelectorAll('.ui-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      try { localStorage.setItem(VIEW_KEY, currentView); } catch (_) {}
      applyFilters();
    });
  });
  searchInput.addEventListener('input', applyFilters);
  activeOnlyBox.addEventListener('change', applyFilters);

  /* ── U5: 状態サマリー ── */
  const chipsEl = document.getElementById('statusChips');
  const genStatus = document.createElement('span');
  function refreshChips() {
    if (!chipsEl) return;
    const active = sections.filter(s => s.slug !== 'macros' && s.el.querySelector('.tog.on'));
    chipsEl.innerHTML = active.length
      ? active.map(s => `<span class="status-chip"><b>ON</b> ${s.title}</span>`).join('')
      : '<span class="status-chip">有効なエンジンなし (基本レイヤーのみ)</span>';
  }
  function refreshGenStatus() {
    if (typeof S === 'undefined' || !S) return;
    const bytes = S.midiData && S.midiData.length ? S.midiData.length : 0;
    if (!bytes) { genStatus.textContent = ''; return; }
    let extra = '';
    if (typeof CompTuningEngine !== 'undefined' && CompTuningEngine.STATE.lastAdaptiveRouting) {
      const r = CompTuningEngine.STATE.lastAdaptiveRouting;
      if (r.reassignedNotes || r.fallbackConflicts) {
        extra = ` / shadow再配置 ${r.reassignedNotes} / fallback ${r.fallbackConflicts}`;
      }
    }
    genStatus.textContent = `生成済み: ${bytes} bytes${extra}`;
  }
  document.addEventListener('click', event => {
    if (event.target.closest('.tog')) setTimeout(refreshChips, 0);
    if (event.target.closest('#btnGen, #btnGenAB')) setTimeout(() => { refreshChips(); refreshGenStatus(); }, 1200);
  });

  /* ── U3: 生成バー ── */
  const genBar = document.createElement('div');
  genBar.id = 'genBar';
  genBar.innerHTML = `
    <button type="button" class="primary" data-proxy="btnGen">⬡ GENERATE</button>
    <button type="button" data-proxy="btnGenAB">A/B</button>
    <button type="button" data-proxy="prevPlay">▶</button>
    <button type="button" data-proxy="prevPause">⏸</button>
    <button type="button" data-proxy="prevStop">■</button>
    <button type="button" data-proxy="btnDl">.MID</button>
    <button type="button" data-proxy="btnMultiDl">STEMS</button>
    <button type="button" data-proxy="btnMusicXml">XML</button>
    <button type="button" data-proxy="btnOscSend">OSC</button>`;
  genStatus.id = 'genBarStatus';
  genBar.appendChild(genStatus);
  document.body.appendChild(genBar);
  genBar.querySelectorAll('button[data-proxy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.proxy);
      if (target) target.click();
      if (btn.dataset.proxy === 'btnGen' || btn.dataset.proxy === 'btnGenAB') {
        setTimeout(() => { refreshChips(); refreshGenStatus(); }, 1200);
      }
    });
  });

  applyFilters();
  refreshChips();
  refreshGenStatus();

  /* テスト/将来の拡張用に公開する */
  window.__MEIKY_UI__ = {
    sections: sections.map(s => ({ slug: s.slug, title: s.title, tier: s.tier })),
    macros: MACROS.map(m => m.id),
    setView(view) {
      if (view in viewTier) {
        currentView = view;
        try { localStorage.setItem(VIEW_KEY, currentView); } catch (_) {}
        applyFilters();
      }
    },
    getView() { return currentView; },
    applyFilters,
  };
});
