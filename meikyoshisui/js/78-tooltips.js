/* 78-tooltips.js — ホバーツールチップ (2026-11-11)
   セクション見出し / スライダー / 理論エンジンの行 / 進行チップ /
   マクロ / 主要ボタンにカーソルを合わせると一文説明を表示する。
   表示専用の層であり、既存の id・配線・保存形式・生成には触れない。
   説明文の出どころ:
   · セクション … このファイルの SECTION_TIPS (slug 単位)
   · スライダー … 69 が描画する .param-desc の文面をそのまま流用
   · 理論の行 … 70 / 本体の .tog-desc の文面をそのまま流用
   · 進行チップ … 71 が付けていた title (進行の note + 度数) を引き継ぐ
   ON/OFF は UI バーの「ヒント」で切り替え、localStorage に保存する。 */
(() => {
  'use strict';

  const SECTION_TIPS = {
    'chord-input': 'コードを入力する場所。コード名を解析し、生成全体の和声の土台になります。',
    'genre': 'ジャンル／質感のプリセット。複数のパラメータをまとめて切り替えます。',
    'cc-automation': 'MIDI CC でパラメータを時間変化させる自動化。レーンごとにステップやグライドを設定します。',
    'attractor-seq': 'アトラクター（力学系の軌道）から音列を生成するシーケンサです。',
    'scale-mutation': 'スケールを確率的に変異させ、音階そのものが少しずつ変化していきます。',
    'progression': 'コード進行を設定する場所。入力に合わせて定番進行のサジェスト（予測変換）も出ます。',
    'conductor': '曲全体のセクション構成とテンポの流れを指揮するトラックです。',
    'rhythmic-canons': 'リズムのタイリングカノン。2つのリズム型が隙間なく組み合わさる構造を作ります。',
    'just-intonation': '純正律。倍音比に基づく音程で、平均律より澄んだ響きになります。',
    'neo-riemannian': 'ネオ・リーマン変換（P/L/R）。三和音同士を最小の声部移動でつなぐ理論です。',
    'negative-harmony': 'ネガティブハーモニー。軸で反転した鏡像コードへ変換します。',
    'boids': '群れシミュレーション（Boids）。個体の動きから音型を生成します。',
    'lorenz': 'ローレンツ・アトラクターのカオス軌道を音高やリズムに写像します。',
    'cellular-automaton': 'セル・オートマトン。セルの生滅パターンがフレーズになります。',
    'sieve': 'クセナキスの篩（ふるい）理論。剰余系の組み合わせで音高集合を選別します。',
    'euclidean': 'ユークリッドリズム。拍をできるだけ均等に配分するリズム生成法です。',
    'humanizer': 'タイミングと強さに人間らしい揺らぎを加えます。',
    'serialism': '総音列主義（Integral Serialism）。音高・長さ・強さなどを音列で統制します。',
    'markov': 'マルコフ連鎖。前の音から次の音の確率が決まる旋律生成です。',
    'lsystem': 'L-System。文字列の書き換え規則でフレーズを成長させる生成法です。',
    'rubato': 'ルバート。テンポを伸縮させ、演奏の息づかいを再現します。',
    'spectral': 'スペクトル分析。倍音構造に基づく和声生成です。',
    'solfeggio': 'ソルフェジオ周波数。特定の周波数を基音に使うエンジンです。',
    'binaural': 'バイノーラルビート。左右の周波数差でうなりを作ります。',
    'comp-tuning': '補正調律。歴史的音律や Scala 音律で全体のチューニングを差し替えます。',
    'macro-structure': '曲全体のセクション構成（導入・展開など）の設計です。',
    'theory-framework': '音楽理論フレームワークの土台設定です。',
    'theory-analysis': '生成結果の理論分析（音集合など）を表示します。',
    'pcset-map': 'PC Set（ピッチクラス集合）の類似マップ。音集合同士の近さを表示します。',
    'octave-range': '生成音域（オクターブ範囲）の制御です。',
    'synthesis': '生成の基本パラメータ。密度など全体の性格を決めます。',
    'layers': 'レイヤー別の生成とプレビュー、書き出しの中心です。',
    'multi-export': 'ステム別 MIDI や MusicXML、OSC など複数形式の書き出しです。',
    'macros': 'マクロ操作。複数のパラメータを1本のスライダーでまとめて動かします。',
  };
  const MACRO_TIPS = {
    density: '音の密度 — 1小節あたりの発音数をまとめて増減します。',
    velocity: '強さ — 全体のベロシティ（打鍵の強さ）を増減します。',
    dissonance: '不協和 — 不協和音程の許容量を上げ、解決の閾値を下げます。',
    humanize: 'ゆらぎ — タイミングと長さの人間らしいばらつきを増減します。',
    spread: '広がり — 音域（オクターブの拡がり）を広げます。',
    brightness: '明るさ — 倍音の明るさを上げ、減衰を緩やかにします。',
    length: '長さ — 音の長さ（ゲート）の基準を伸ばします。',
    chaos: 'カオス — ドリフトやポリリズムなど不規則さの要素をまとめて上げます。',
  };
  const BUTTON_TIPS = {
    btnGen: '現在の設定で MIDI を生成します。',
    btnGenAB: 'A/B の2バリアントを生成して比べます。',
    prevPlay: '生成結果をプレビュー再生します。',
    prevPause: 'プレビューを一時停止します。',
    prevStop: 'プレビューを停止します。',
    btnDl: '生成した MIDI ファイルをダウンロードします。',
    btnMultiDl: 'レイヤー別（ステム）の MIDI を書き出します。',
    btnMusicXml: 'MusicXML（楽譜データ）として書き出します。',
    btnOscSend: '生成データを OSC で送信します。',
  };
  const THEORY_PACK_TIP = 'Theory Pack — ティンティナブリ／フェイジング／イソリズム／シェパード・トーン／種対位法（第1〜5種＋カノン）／フーガ提示部／ソナタ形式／終止定型／クラーベやターラ／結合音など、追加の音楽理論エンジン群。全て既定 OFF で、ON にしたものだけ生成に加わります。';

  const KEY = 'meikyoshisui_tooltips';
  let enabled = true;
  try { enabled = localStorage.getItem(KEY) !== 'off'; } catch (_) { /* 既定 ON */ }

  let tipEl = null, showTimer = null, currentTarget = null;

  function ensureTipEl() {
    if (tipEl) return tipEl;
    const style = document.createElement('style');
    style.textContent = `
      #meikyTip { position: fixed; z-index: 9999; pointer-events: none; max-width: 300px;
        background: #1a1a1f; color: #e8e8e8; border: 1px solid #3a3a42; border-radius: 8px;
        padding: 8px 10px; font-size: 11px; line-height: 1.6; letter-spacing: .02em;
        opacity: 0; transition: opacity .12s ease; box-shadow: 0 6px 24px rgba(0,0,0,.45); }
      #meikyTip.on { opacity: 1; }
      [data-tip] { cursor: help; }`;
    document.head.appendChild(style);
    tipEl = document.createElement('div');
    tipEl.id = 'meikyTip';
    document.body.appendChild(tipEl);
    return tipEl;
  }

  function position(target) {
    const el = ensureTipEl();
    const r = target.getBoundingClientRect();
    el.style.visibility = 'hidden';
    el.classList.add('on');
    const tw = el.offsetWidth, th = el.offsetHeight;
    let x = Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - tw - 8));
    let y = r.top - th - 8;
    if (y < 8) y = Math.min(r.bottom + 8, window.innerHeight - th - 8);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.visibility = '';
  }
  function show(target) {
    if (!enabled) return;
    const text = target.getAttribute('data-tip');
    if (!text) return;
    currentTarget = target;
    const el = ensureTipEl();
    el.textContent = text;
    position(target);
  }
  function hide() {
    currentTarget = null;
    if (showTimer) { clearTimeout(showTimer); showTimer = null; }
    if (tipEl) tipEl.classList.remove('on');
  }
  function queueShow(target) {
    if (showTimer) clearTimeout(showTimer);
    showTimer = setTimeout(() => show(target), 200);
  }

  /* ── タグ付け ── */
  let tagged = 0;
  function tag(el, text) {
    if (!el || !text) return;
    if (el.getAttribute('data-tip') === text) return;
    el.setAttribute('data-tip', text);
    tagged++;
  }
  function tagAll(root) {
    const scope = root && root.querySelectorAll ? root : document;
    // セクション見出し
    scope.querySelectorAll('.panel[data-section]').forEach(panel => {
      const tip = SECTION_TIPS[panel.dataset.section];
      const head = panel.querySelector('.sec-label');
      if (tip && head) tag(head, tip);
    });
    // Theory Pack 見出し
    scope.querySelectorAll('.tp-head').forEach(h => tag(h, THEORY_PACK_TIP));
    // スライダー (69 の .param-desc を流用。説明文は .param-row の直後の兄弟として挿入される)
    scope.querySelectorAll('.param-desc').forEach(desc => {
      const text = desc.textContent.trim();
      if (!text) return;
      let row = desc.previousElementSibling;
      while (row && !row.classList.contains('param-row')) row = row.previousElementSibling;
      const slider = row && row.querySelector('input[type="range"]');
      if (slider) tag(slider, text);
    });
    // マクロ
    scope.querySelectorAll('.macro-slider[data-macro]').forEach(s => tag(s, MACRO_TIPS[s.dataset.macro]));
    // 理論エンジン等のトグル行 (.tog-desc を流用)
    scope.querySelectorAll('.tog-row').forEach(row => {
      const desc = row.querySelector('.tog-desc');
      if (desc && desc.textContent.trim()) tag(row, desc.textContent.trim());
    });
    // 主要ボタンと生成バーのプロキシ
    scope.querySelectorAll('button[id], #genBar button').forEach(btn => {
      const key = btn.id || btn.dataset.proxy;
      if (key && BUTTON_TIPS[key]) tag(btn, BUTTON_TIPS[key]);
    });
    // 進行チップ (71 の title を引き継ぎ、二重表示を防ぐため title は外す)
    scope.querySelectorAll('.cp-preset-btn[title]').forEach(chip => {
      tag(chip, chip.getAttribute('title'));
      chip.removeAttribute('title');
    });
    // 本体側の進行プリセットボタン (39 が ProgEngine.PROG_PRESETS から生成)
    scope.querySelectorAll('.cp-preset-btn:not([data-tip])').forEach(btn => {
      const label = (btn.textContent || '').trim();
      let tip = '';
      try {
        const presets = (typeof ProgEngine !== 'undefined' && ProgEngine.PROG_PRESETS) || {};
        const hit = Object.values(presets).find(p => p.label === label);
        if (hit) tip = '進行プリセット: ' + hit.chords.join(' → ') + '（各4小節）— クリックでこの進行を設定します。';
      } catch (_) { /* 取得できない場合は汎用文 */ }
      tag(btn, tip || ('コード進行プリセット「' + label + '」— クリックで進行に設定します。'));
    });
  }

  function init() {
    ensureTipEl();
    tagAll(document);
    // 動的に増える要素 (進行チップの再描画など) を追う
    const mo = new MutationObserver(muts => {
      for (const m of muts) for (const n of m.addedNodes) {
        if (n.nodeType === 1) { tagAll(n); if (n.matches && n.matches('[data-tip],[title]')) tagAll(n.parentElement || document); }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('mouseover', e => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (t && t !== currentTarget) queueShow(t);
    });
    document.addEventListener('mouseout', e => {
      if (currentTarget && !currentTarget.contains(e.relatedTarget)) hide();
      else if (showTimer && e.target.closest && !e.target.closest('[data-tip]')) hide();
    });
    document.addEventListener('focusin', e => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (t) queueShow(t);
    });
    document.addEventListener('focusout', hide);
    document.addEventListener('click', hide, true);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);

    // UI バーに ON/OFF を追加 (説明文チェックの隣)
    const descBox = document.getElementById('uiShowDesc');
    if (descBox && !document.getElementById('uiShowTips')) {
      const label = document.createElement('label');
      label.className = 'ui-check';
      label.innerHTML = '<input type="checkbox" id="uiShowTips"> ヒント';
      label.querySelector('input').checked = enabled;
      label.querySelector('input').addEventListener('change', ev => {
        enabled = ev.target.checked;
        if (!enabled) hide();
        try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch (_) {}
      });
      descBox.closest('.ui-check').after(label);
    }
    window.__MEIKY_TIPS__ = { get count() { return tagged; }, tagAll, setEnabled(v) { enabled = !!v; if (!enabled) hide(); } };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
