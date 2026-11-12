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
    ecbPresetFull: 'エンジンプリセット ALL ON — 推奨の基本セットをまとめて ON にします。',
    ecbPresetMin: 'エンジンプリセット MINIMAL — PC Set と Resolve だけの最小構成にします。',
    ecbPresetChaos: 'エンジンプリセット CHAOS — カオス系（Lorenz／セルオートマトン／ルバート）を中心に ON にします。',
    ecbPresetOff: 'エンジンプリセット ALL OFF — 全エンジンを OFF にします。',
    ecbPresetSerial: 'エンジンプリセット SERIAL — 十二音技法と Integral Serialism の直列系セットです。',
    ecbPresetXenakis: 'エンジンプリセット XENAKIS — Xenakis の篩（Sieve）理論のセットです。',
    ecbPresetSwarm: 'エンジンプリセット SWARM — Boids など群れ・カオス系のセットです。',
    ecbPresetOrganic: 'エンジンプリセット ORGANIC — L-System や Humanizer など有機的な生成のセットです。',
    ecbPresetSacred: 'エンジンプリセット SACRED — ソルフェジオ周波数など Sacred 系のセットです。',
  };
  const ECB_GROUP_TIPS = {
    THEORY: '理論系エンジン — 和声・音列の規則で生成を支配します。',
    CHAOS: 'カオス系エンジン — 力学系や確率のゆらぎで変調します。',
    GENERATE: '生成系エンジン — リズムやフレーズそのものを作ります。',
    FINISH: '仕上げ系エンジン — 生成後の解決・整形・変調を行います。',
  };
  const THEORY_PACK_TIP = 'Theory Pack — ティンティナブリ／フェイジング／イソリズム／シェパード・トーン／種対位法（第1〜5種＋カノン）／フーガ提示部／ソナタ形式／終止定型／クラーベやターラ／結合音など、追加の音楽理論エンジン群。全て既定 OFF で、ON にしたものだけ生成に加わります。';

  /* ── note 記事への節リンク (2026-11-13) ─────────────────────────
     「MEIKYOSHISUIに実装されている音楽理論のすべて」
     https://note.com/varelser/n/n3f568ee84095
     note の見出しには公開時に UUID の id が付くので、記事URL#UUID で
     該当節へ直接飛べる (公開ページの HTML から全69見出しを取得済み)。
     見出しを作り直すと UUID が変わるため、記事を編集したら再取得すること。
     対応表の控え: ~/workspace/meikyoshisui-noise-refine/notelink/MAPPING.md
     dataset.note が '' の要素は記事トップへ、UUID の要素はその節へ飛ぶ。
     dataset.note 自体が無い要素はリンクなし (操作系など)。 */
  const NOTE_BASE = 'https://note.com/varelser/n/n3f568ee84095';
  const NA = {
    s1:'243d07bd-9598-41f6-9c9a-19b64e37f602', s2:'64c7631d-769b-4321-9fe2-d8ad1f92cd81',
    s3:'c120a62d-1204-4db3-83d1-ebc94c03282e', s4:'cd11c6de-b94e-4980-ae19-e6b99b7ea37e',
    s5:'37ccdd64-ee22-4f71-8e41-91f5af789019', s6:'9b83dee2-07c7-4864-9f35-8ff49ad270d2',
    s7:'87434497-17bc-4d67-bb31-60f6027b9e98', s8:'7936dc51-bee9-46f0-a569-ded09bfc6739',
    s9:'a9fdf261-529f-4440-b957-13e0b55ab6a8', s10:'9058fede-7ef2-431b-a61d-4ba65b028d32',
    s11:'df8115c2-658c-4846-98e0-1c2562af3562', s12:'0a899cd4-d2ca-4f43-9a5d-09c7664f93ad',
    s13:'2f542574-d6e1-4327-a76d-a3589475f9f9', s14:'75e792b5-045d-43f4-ac6f-49f92f0e4085',
    s15:'16aad578-09be-4d68-960c-f9c1852c95e4', s16:'b0974b1d-02d3-44e3-af06-863c592c908e',
    s17:'dc6c2b6f-a370-4a4f-b174-c6e4df33a994', s18:'c067f6d8-9c34-47ac-9c04-d224ba202097',
    s19:'57c54d67-2385-4348-b0d3-7f5a1cf81130', s20:'31ba793f-0ba7-4d3f-be12-fc6c75a1d228',
    s21:'cfdcf019-cd1a-4ec9-98ab-f9c9a6f6067a', s22:'fdf564b2-5061-4020-b03e-5d7e890b4f7b',
    s23:'4681346e-61b1-4cff-937b-428d352ca743', s24:'adec00bc-51f2-40fa-a1c7-2bc6bca185ad',
    s25:'6faef0c5-18ec-468e-8b21-891f4f62a531', s26:'8a38164f-47de-4547-9dce-88927552f41f',
    s27:'1b571a97-94f4-4639-9310-01cb2714ff3e', s28:'9d429bf7-a6c9-496a-b1db-40cd5f028539',
    s29:'25c34dd5-2c59-4524-912f-d9815d22c28e', s30:'6cd626cb-cec4-451d-a836-3fd5cb6e3ef1',
    s31:'739088a1-7a04-4c04-aa0e-284d1916c59c', s32:'b1e4f196-bcfe-46b8-9875-17d74299fa9d',
    s34:'8a90d582-9e26-4152-83da-aae6de8af60e', s35:'0152922d-8882-4831-9225-a86b7a0c8cb1',
    s37:'8343d369-0311-477d-bc44-60b09aa24e54', s38:'bd5020ca-9331-492c-a2b5-59bc76fc3bf6',
    s39:'9e31f181-5749-4944-97f3-a19ca5a160b7', s40:'d799253a-8469-45d1-80bf-b8abfc5589e5',
    s41:'09158763-f58a-4505-ad91-09d7dce07677',
    genre:'fb112e38-55d7-445e-91a6-5805dda983a9',
    p3:'69a710cc-eef8-432a-9ecb-d284ec29c7c4', p4:'40666225-89c9-447e-a785-374598e08486',
    p5:'dc4e62f7-2960-4590-acf8-e6ad5a134951', p6:'8cb68bf9-58cf-450a-b54e-c36f0a639bb5',
    p7:'abec92f6-fc85-4935-a997-61741b8eb98e',
  };
  const SECTION_NOTE = {
    'chord-input': NA.s2, 'genre': NA.genre, 'cc-automation': NA.s32,
    'attractor-seq': NA.s27, 'scale-mutation': NA.s6, 'progression': NA.s4,
    'conductor': NA.s31, 'rhythmic-canons': NA.s19, 'just-intonation': NA.s34,
    'neo-riemannian': NA.s8, 'negative-harmony': NA.s7, 'boids': NA.s28,
    'lorenz': NA.s27, 'cellular-automaton': NA.s26, 'sieve': NA.s25,
    'euclidean': NA.s18, 'humanizer': NA.s30, 'serialism': NA.s12,
    'markov': NA.s23, 'lsystem': NA.s24, 'rubato': NA.s29, 'spectral': NA.s37,
    'solfeggio': NA.s38, 'binaural': NA.s38, 'comp-tuning': NA.s35,
    'macro-structure': NA.s31, 'theory-framework': NA.p3,
    'theory-analysis': NA.s41, 'pcset-map': NA.s10, 'octave-range': NA.s40,
    'synthesis': NA.s40, 'layers': NA.s40,
  };
  const ENGINE_LABEL_NOTE = {
    'PC Set': NA.s10, 'NegHarm': NA.s7, '12-Tone': NA.s11, 'Integral': NA.s12,
    'Lorenz': NA.s27, 'Cell.Auto': NA.s26, 'Rubato': NA.s29, 'Sieve': NA.s25,
    'Euclidean': NA.s18, 'Markov': NA.s23, 'L-System': NA.s24,
    'Solfeggio': NA.s38, 'Binaural': NA.s38, 'CompTune': NA.s35,
    'Humaniz': NA.s30, 'Resolve': NA.s9, 'MPE': NA.s38, 'Macro': NA.s31,
    'Boids': NA.s28, 'Spectral': NA.s37,
  };
  const GROUP_NOTE = { THEORY: NA.p3, CHAOS: NA.p6, GENERATE: NA.p5, FINISH: NA.p7 };
  const PRESET_NOTE = {
    ecbPresetFull: '', ecbPresetMin: NA.s10, ecbPresetChaos: NA.p6,
    ecbPresetSerial: NA.s11, ecbPresetXenakis: NA.s25, ecbPresetSwarm: NA.s28,
    ecbPresetOrganic: NA.s24, ecbPresetSacred: NA.s38,
  };
  const MACRO_NOTE = {
    density: NA.s40, velocity: NA.s31, dissonance: NA.s9, humanize: NA.s30,
    spread: NA.s40, brightness: NA.s37, length: NA.s31, chaos: NA.s27,
  };
  /* .tog-name のキーワード → 節 (上から順に照合するので具体的なものを先に) */
  const TOGNAME_NOTE = [
    ['TINTINNABULI', NA.s16], ['PHASING', NA.s21], ['ISORHYTHM', NA.s21],
    ['SHEPARD', NA.s22], ['SPECIES', NA.s13], ['CADENCE', NA.s15],
    ['WORLD RHYTHM', NA.s20], ['RISSET', NA.s22], ['COMBINATION TONES', NA.s37],
    ['TOTAL SERIALISM', NA.s12], ['CHANCE', NA.s39], ['QUARTAL', NA.s17],
    ['FUGUE', NA.s14], ['SONATA', NA.s14],
    ['ADAPTIVE JI', NA.s34], ['JUST INTONATION', NA.s34],
    ['NEO-RIEMANNIAN', NA.s8], ['NEGATIVE HARMONY', NA.s7],
    ['RHYTHMIC CANON', NA.s19], ['CONDUCTOR', NA.s31],
    ['SCALE MUTATION', NA.s6], ['PROGRESSION', NA.s5],
    ['ATTRACTOR', NA.s27], ['LORENZ', NA.s27],
    ['BOIDS', NA.s28], ['SWARM', NA.s28],
    ['SIEVE', NA.s25], ['CELLULAR AUTOMATON', NA.s26],
    ['EUCLIDEAN', NA.s18], ['MARKOV', NA.s23], ['L-SYSTEM', NA.s24],
    ['HUMANIZ', NA.s30], ['RUBATO', NA.s29],
    ['INTEGRAL SERIALISM', NA.s12], ['SERIALISM', NA.s12],
    ['TWELVE', NA.s11], ['12-TONE', NA.s11], ['PC SET', NA.s10],
    ['SOLFEGGIO', NA.s38], ['BINAURAL', NA.s38],
    ['COMPENSATION', NA.s35], ['COMP TUNING', NA.s35], ['COMPTUNING', NA.s35],
    ['SPECTRAL', NA.s37], ['MPE', NA.s38], ['MACRO', NA.s31],
    ['CC AUTOMATION', NA.s32], ['VOICE LEADING', NA.s9], ['ROUGHNESS', NA.s37],
  ];
  function togNoteFor(name) {
    const u = (name || '').toUpperCase();
    if (!u) return undefined;
    for (const [k, a] of TOGNAME_NOTE) if (u.includes(k)) return a;
    return undefined;
  }

  const KEY = 'meikyoshisui_tooltips';
  let enabled = true;
  try { enabled = localStorage.getItem(KEY) !== 'off'; } catch (_) { /* 既定 ON */ }

  let tipEl = null, showTimer = null, hideTimer = null, currentTarget = null;

  function ensureTipEl() {
    if (tipEl) return tipEl;
    const style = document.createElement('style');
    style.textContent = `
      #meikyTip { position: fixed; z-index: 9999; pointer-events: none; max-width: 300px;
        background: #1a1a1f; color: #e8e8e8; border: 1px solid #3a3a42; border-radius: 8px;
        padding: 8px 10px; font-size: 11px; line-height: 1.6; letter-spacing: .02em;
        opacity: 0; transition: opacity .12s ease; box-shadow: 0 6px 24px rgba(0,0,0,.45); }
      #meikyTip.on { opacity: 1; }
      #meikyTip.has-link { pointer-events: auto; }
      #meikyTip .meiky-tip-link { display: inline-block; margin-top: 6px; color: #fff;
        font-weight: 600; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
      #meikyTip .meiky-tip-link:hover { opacity: .75; }
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
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    currentTarget = target;
    const el = ensureTipEl();
    el.textContent = '';
    const body = document.createElement('div');
    body.textContent = text;
    el.appendChild(body);
    const anchor = target.dataset ? target.dataset.note : undefined;
    el.classList.toggle('has-link', anchor !== undefined);
    if (anchor !== undefined) {
      const a = document.createElement('a');
      a.className = 'meiky-tip-link';
      a.href = NOTE_BASE + (anchor ? '#' + anchor : '');
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'noteで詳しく読む →';
      el.appendChild(a);
    }
    position(target);
  }
  function hide() {
    currentTarget = null;
    if (showTimer) { clearTimeout(showTimer); showTimer = null; }
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (tipEl) tipEl.classList.remove('on');
  }
  function scheduleHide() {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 350);
  }
  function queueShow(target) {
    if (showTimer) clearTimeout(showTimer);
    showTimer = setTimeout(() => show(target), 200);
  }

  /* ── タグ付け ── */
  let tagged = 0;
  function tag(el, text, note) {
    if (!el || !text) return;
    if (note !== undefined && el.dataset) el.dataset.note = note;
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
      if (tip && head) tag(head, tip, SECTION_NOTE[panel.dataset.section]);
    });
    // Theory Pack 見出し
    scope.querySelectorAll('.tp-head').forEach(h => tag(h, THEORY_PACK_TIP, NA.p4));
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
    scope.querySelectorAll('.macro-slider[data-macro]').forEach(s => tag(s, MACRO_TIPS[s.dataset.macro], MACRO_NOTE[s.dataset.macro]));
    // 理論エンジン等のトグル行 (.tog-desc を流用)
    scope.querySelectorAll('.tog-row').forEach(row => {
      const desc = row.querySelector('.tog-desc');
      if (desc && desc.textContent.trim()) {
        const nameEl = row.querySelector('.tog-name');
        tag(row, desc.textContent.trim(), togNoteFor(nameEl ? nameEl.textContent : ''));
      }
    });
    // 主要ボタンと生成バーのプロキシ
    scope.querySelectorAll('button[id], #genBar button').forEach(btn => {
      const key = btn.id || btn.dataset.proxy;
      if (key && BUTTON_TIPS[key]) tag(btn, BUTTON_TIPS[key], PRESET_NOTE[key]);
    });
    // Engine Control のエンジン行 (21 が付ける title=desc を引き継ぎ、title は外す)
    scope.querySelectorAll('.ecb-row[title]').forEach(row => {
      const lbl = row.querySelector('.ecb-label');
      tag(row, row.getAttribute('title'), ENGINE_LABEL_NOTE[lbl ? lbl.textContent.trim() : '']);
      row.removeAttribute('title');
    });
    // ECB 行は再描画で title が外れた後もラベルからリンクを付け直せるようにする
    scope.querySelectorAll('.ecb-row[data-tip]').forEach(row => {
      if (row.dataset.note !== undefined) return;
      const lbl = row.querySelector('.ecb-label');
      const anchor = ENGINE_LABEL_NOTE[lbl ? lbl.textContent.trim() : ''];
      if (anchor !== undefined) row.dataset.note = anchor;
    });
    // Engine Control のグループ見出し
    scope.querySelectorAll('.ecb-group-label').forEach(lbl => {
      const key = Object.keys(ECB_GROUP_TIPS).find(k => (lbl.textContent || '').toUpperCase().includes(k));
      if (key) tag(lbl, ECB_GROUP_TIPS[key], GROUP_NOTE[key]);
    });
    // 進行チップ (71 の title を引き継ぎ、二重表示を防ぐため title は外す)
    scope.querySelectorAll('.cp-preset-btn[title]').forEach(chip => {
      tag(chip, chip.getAttribute('title'), NA.s4);
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
      tag(btn, tip || ('コード進行プリセット「' + label + '」— クリックで進行に設定します。'), NA.s4);
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

    ensureTipEl().addEventListener('mouseenter', () => {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    });
    ensureTipEl().addEventListener('mouseleave', hide);
    document.addEventListener('mouseover', e => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (t && t !== currentTarget) queueShow(t);
    });
    document.addEventListener('mouseout', e => {
      if (tipEl && e.relatedTarget && tipEl.contains(e.relatedTarget)) return;
      if (currentTarget && !currentTarget.contains(e.relatedTarget)) {
        if (tipEl && tipEl.classList.contains('has-link')) scheduleHide();
        else hide();
      }
      else if (showTimer && e.target.closest && !e.target.closest('[data-tip]')) hide();
    });
    document.addEventListener('focusin', e => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (t) queueShow(t);
    });
    document.addEventListener('focusout', hide);
    document.addEventListener('click', e => {
      if (tipEl && tipEl.contains(e.target)) return;
      hide();
    }, true);
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
    window.__MEIKY_TIPS__ = { get count() { return tagged; }, tagAll, setEnabled(v) { enabled = !!v; if (!enabled) hide(); }, NOTE_BASE, NA };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
