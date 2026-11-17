/* ── 2026-11-16 Focus B (97): ⌘K パレット + 集中モード + 共有URL ──
   候補B (集中型・プロ再編、Noise 候補B と同型) の additive 実装。
   既存モジュールには触れず、公開入口だけで接続する:
   - パネルジャンプ: window.__MEIKY_LIEN__.gotoSlug (96 が系統側の
     revealInFlyout でラップ済み — 系統内パネルはフライアウトが開く)
   - 系統オープン: window.__MEIKY_FAM__.open(id)
   - ビュー切替: window.__MEIKY_UI__.setView / getView
   - シード復元: #seedInput へ値を入れて change を dispatch する
     既存の経路のみを使う (js/46 のハンドラが S.seed へ反映する)
   保存キーは新規の3件だけを追加する (既存キーには触れない):
   - meikyoshisui_focus_v1  : 'on' | 'off' (未保存なら ON = 集中が既定)
   - meikyoshisui_recent_v1 : パレット/系統チップの利用履歴 (最大8件)
   - meikyoshisui_fav_v1    : パレット内 ★ のお気に入り
   ECB の畳みは表示 (class) の切替だけで、コントロールの状態・値には
   一切触れない。集中 OFF では v36 と同じ表示に完全に戻る。 */
(() => {
'use strict';

const FOCUS_KEY = 'meikyoshisui_focus_v1';
const RECENT_KEY = 'meikyoshisui_recent_v1';
const FAV_KEY = 'meikyoshisui_fav_v1';
const FAM_EN = { theory: 'THEORY', nature: 'NATURE / MATH', time: 'TIME', tuning: 'TUNING', layers: 'LAYERS', transform: 'TRANSFORM' };

const store = {
  get(k, dflt) { try { const v = localStorage.getItem(k); return v == null ? dflt : v; } catch (e) { return dflt; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 保存不可でも動作は続ける */ } },
  getJSON(k, dflt) { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : dflt; } catch (e) { return dflt; } },
  setJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 同上 */ } },
};

/* ── URL パラメータ (hash / query の両方を読む) ── */
function urlParams() {
  const out = {};
  const absorb = s => {
    if (!s) return;
    try { new URLSearchParams(s).forEach((v, k) => { if (!(k in out)) out[k] = v; }); } catch (e) { /* ignore */ }
  };
  absorb(location.search.replace(/^\?/, ''));
  absorb(location.hash.replace(/^#/, ''));
  return out;
}

/* ── 状態 ── */
let focusOn = store.get(FOCUS_KEY, 'on') !== 'off';
let ecbCollapsed = true;               // 集中 ON の間だけ意味を持つ
let recent = store.getJSON(RECENT_KEY, []);
let favs = store.getJSON(FAV_KEY, []);
let els = {};                          // 構築した chrome の参照
let entries = [];                      // パレットの索引
let activeIdx = 0;
let lastFocused = null;
let shareFeedbackTimer = null;
const SHARE_LINK_SVG = '<svg class="ic-share" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14.5a4.2 4.2 0 0 0 6 .4l3-3a4.24 4.24 0 1 0-6-6l-1.5 1.5"/><path d="M14 9.5a4.2 4.2 0 0 0-6-.4l-3 3a4.24 4.24 0 1 0 6 6L12.5 16.5"/></svg>';
const SHARE_CHECK_SVG = '<svg class="ic-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12.5 10 18 19.5 6.5"/></svg>';
const shareIconHtml = new Map();
function ensureShareIconStyle() { if (document.getElementById('shareIconStyle')) return; const st = document.createElement('style'); st.id = 'shareIconStyle'; st.textContent = '.share-icon-btn{width:32px!important;height:32px!important;min-width:32px!important;padding:0!important;border:0!important;border-radius:50%!important;background:transparent!important;display:inline-flex!important;align-items:center;justify-content:center;cursor:pointer;color:inherit;flex:none!important;transition:background .18s,transform .18s}.share-icon-btn svg{width:20px;height:20px;display:block}.share-icon-btn .ic-check{display:none}.share-icon-btn.copied .ic-share{display:none}.share-icon-btn.copied .ic-check{display:block}.share-icon-btn:hover{background:rgba(255,255,255,.12)!important;transform:translateY(-1px)}'; document.head.appendChild(st); }
function shareIconInit(b, label) { ensureShareIconStyle(); b.innerHTML = SHARE_LINK_SVG + SHARE_CHECK_SVG; b.classList.add('share-icon-btn'); b.setAttribute('aria-label', label); shareIconHtml.set(b, b.innerHTML); }

function recordRecent(id) {
  if (!id) return;
  recent = [id, ...recent.filter(x => x !== id)].slice(0, 8);
  store.setJSON(RECENT_KEY, recent);
}
function toggleFav(id) {
  favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
  store.setJSON(FAV_KEY, favs);
}

/* ════ 共有URL ════ */
function readSeed() {
  const sv = document.getElementById('seedVal');
  const t = sv ? (sv.textContent || '').trim() : '';
  if (/^\d+$/.test(t)) return t;
  try { if (typeof S !== 'undefined' && S && S.seed) return String(S.seed >>> 0); } catch (e) { /* ignore */ }
  return '';
}
function buildShareURL() {
  const u = new URL(location.href);
  const p = new URLSearchParams();
  const seed = readSeed();
  if (seed) p.set('seed', seed);
  if (window.__MEIKY_UI__) p.set('view', window.__MEIKY_UI__.getView());
  p.set('focus', focusOn ? 'on' : 'off');
  u.search = '';
  u.hash = p.toString();
  return u.toString();
}
async function copyShareURL(btn) {
  const url = buildShareURL();
  let ok = false;
  try { await navigator.clipboard.writeText(url); ok = true; }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
    ta.remove();
  }
  const targets = [btn, els.shareBtn, els.seedShareBtn].filter(Boolean);
  for (const b of targets) {
    if (ok) b.classList.add('copied');
    else if (shareIconHtml.has(b)) b.textContent = url;
  }
  clearTimeout(shareFeedbackTimer);
  shareFeedbackTimer = setTimeout(() => {
    for (const b of targets) {
      b.classList.remove('copied');
      if (shareIconHtml.has(b) && !b.querySelector('svg')) b.innerHTML = shareIconHtml.get(b);
    }
  }, 1600);
  return url;
}

/* ════ ECB サマリー ════ */
function ecbCounts() {
  const grid = document.getElementById('ecbGrid');
  if (!grid) return { on: 0, total: 0 };
  const togs = grid.querySelectorAll('.ecb-tog');
  let on = 0;
  togs.forEach(t => { if (t.classList.contains('on')) on++; });
  return { on, total: togs.length };
}
function refreshEcbSummary() {
  if (!els.ecbSummaryText) return;
  const { on, total } = ecbCounts();
  els.ecbSummaryText.textContent = total
    ? `Engine Control — 有効 ${on} / ${total}`
    : 'Engine Control';
  if (els.ecbToggleBtn) {
    els.ecbToggleBtn.textContent = ecbCollapsed ? '▾' : '▴';
    els.ecbToggleBtn.setAttribute('aria-label', ecbCollapsed ? 'Engine Controlを開く' : 'Engine Controlを畳む');
  }
}
function setEcbCollapsed(collapsed) {
  ecbCollapsed = !!collapsed;
  const ecb = document.getElementById('engineControlBar');
  if (ecb) ecb.classList.toggle('ecb-collapsed', focusOn && ecbCollapsed);
  refreshEcbSummary();
}

/* ════ 集中モード ════ */
function applyFocus(persist = true) {
  document.body.classList.toggle('focus-on', focusOn);
  const ecb = document.getElementById('engineControlBar');
  if (ecb) ecb.classList.toggle('ecb-collapsed', focusOn && ecbCollapsed);
  if (els.focusBtn) {
    els.focusBtn.textContent = focusOn ? '集中: ON' : '集中: OFF';
    els.focusBtn.setAttribute('aria-pressed', String(focusOn));
    els.focusBtn.classList.toggle('on', focusOn);
  }
  if (persist) store.set(FOCUS_KEY, focusOn ? 'on' : 'off');
  refreshEcbSummary();
  /* 列詰め (95) は表示変化に追随させる */
  if (window.__MEIKY_LIEN__) setTimeout(() => window.__MEIKY_LIEN__.distribute(), 60);
}
function setFocus(on, persist = true) { focusOn = !!on; if (focusOn) ecbCollapsed = true; applyFocus(persist); }

/* ════ パレット索引 ════ */
function clickById(id) { const el = document.getElementById(id); if (el) el.click(); return !!el; }
function buildEntries() {
  const list = [];
  const ui = window.__MEIKY_UI__;
  if (ui && Array.isArray(ui.sections)) {
    for (const s of ui.sections) {
      const panel = document.querySelector('.panel[data-section="' + s.slug + '"]');
      const labelEl = panel ? panel.querySelector(':scope > .sec-label') : null;
      const jp = labelEl ? (labelEl.textContent || '').trim() : '';
      list.push({
        id: 'panel:' + s.slug, kind: 'panel', slug: s.slug,
        title: s.title, sub: jp && jp !== s.title ? jp : 'パネル',
        hay: (s.title + ' ' + s.slug + ' ' + jp).toLowerCase(),
        run() { if (window.__MEIKY_LIEN__) window.__MEIKY_LIEN__.gotoSlug(s.slug); },
      });
    }
  }
  if (window.__MEIKY_FAM__) {
    for (const f of window.__MEIKY_FAM__.families) {
      list.push({
        id: 'family:' + f.id, kind: 'family', fam: f.id,
        title: f.label + ' 系統', sub: (FAM_EN[f.id] || '') + ' — ' + f.slugs.length + ' パネル',
        hay: (f.label + ' ' + (FAM_EN[f.id] || '') + ' family ' + f.id + ' ' + f.slugs.join(' ')).toLowerCase(),
        run() { window.__MEIKY_FAM__.open(f.id); },
      });
    }
  }
  const act = (id, title, sub, hay, run) => list.push({ id: 'action:' + id, kind: 'action', title, sub, hay: (title + ' ' + sub + ' ' + hay).toLowerCase(), run });
  act('generate', 'GENERATE — 生成する', '操作', 'generate 生成 midi', () => clickById('btnGen'));
  act('generate-ab', 'GEN A/B — シード違いで2案生成', '操作', 'generate ab 生成 比較', () => clickById('btnGenAB'));
  act('preview-play', 'プレビュー再生', '操作', 'preview play 再生 試聴', () => clickById('prevPlay'));
  act('preview-stop', 'プレビュー停止', '操作', 'preview stop 停止', () => clickById('prevStop'));
  act('download-mid', '.MID をダウンロード', '書き出し', 'download mid ダウンロード 保存', () => clickById('btnDl'));
  act('stems', 'STEMS を書き出す', '書き出し', 'stems export 書き出し multi', () => clickById('btnMultiDl'));
  act('musicxml', 'MusicXML を書き出す', '書き出し', 'musicxml xml export 書き出し 楽譜', () => clickById('btnMusicXml'));
  act('osc', 'OSC を送信する', '書き出し', 'osc send 送信', () => clickById('btnOscSend'));
  act('all-open', '全て開く (パネル展開)', '表示', 'open all 全て開く 展開', () => {
    const b = Array.from(document.querySelectorAll('.meikyo-panel-tools button')).find(x => x.textContent.includes('全て開く'));
    if (b) b.click();
  });
  act('all-close', '全て閉じる (パネル折りたたみ)', '表示', 'close all 全て閉じる 折りたたみ', () => {
    const b = Array.from(document.querySelectorAll('.meikyo-panel-tools button')).find(x => x.textContent.includes('全て閉じる'));
    if (b) b.click();
  });
  act('view-play', 'ビュー: 生成', '表示', 'view play 生成 ビュー', () => { if (window.__MEIKY_UI__) window.__MEIKY_UI__.setView('play'); });
  act('view-design', 'ビュー: レイヤー', '表示', 'view design レイヤー ビュー', () => { if (window.__MEIKY_UI__) window.__MEIKY_UI__.setView('design'); });
  act('view-lab', 'ビュー: 実験室 (全表示)', '表示', 'view lab 実験室 ビュー 全表示', () => { if (window.__MEIKY_UI__) window.__MEIKY_UI__.setView('lab'); });
  act('focus-toggle', '集中モードを切り替える', '表示', 'focus 集中 toggle', () => setFocus(!focusOn));
  act('ecb-toggle', 'Engine Control を開く / 畳む', '表示', 'engine control ecb エンジン 展開', () => { if (!focusOn) setFocus(true); setEcbCollapsed(!ecbCollapsed); });
  act('share-url', '共有URLをコピー (シード+ビュー+集中)', '共有', 'share url copy 共有 リンク コピー seed', () => copyShareURL(null));
  entries = list;
}

/* ════ パレット UI ════ */
function buildPalette() {
  const overlay = document.createElement('div');
  overlay.id = 'cmdkOverlay';
  overlay.className = 'cmdk-overlay';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="cmdk-box" role="dialog" aria-modal="true" aria-label="コマンドパレット">' +
      '<input id="cmdkInput" type="text" role="combobox" aria-expanded="true" aria-controls="cmdkList" aria-autocomplete="list" placeholder="パネル・系統・操作を検索 (例: lorenz / 純正律 / generate)" autocomplete="off" spellcheck="false">' +
      '<div id="cmdkList" role="listbox" aria-label="候補"></div>' +
      '<div class="cmdk-foot">↑↓ 選択 ・ Enter 実行 ・ Esc 閉じる ・ ★ お気に入り</div>' +
    '</div>';
  document.body.appendChild(overlay);
  els.overlay = overlay;
  els.cmdkInput = overlay.querySelector('#cmdkInput');
  els.cmdkList = overlay.querySelector('#cmdkList');
  overlay.addEventListener('mousedown', ev => { if (ev.target === overlay) closePalette(); });
  els.cmdkInput.addEventListener('input', () => { activeIdx = 0; renderList(); });
  els.cmdkInput.addEventListener('keydown', ev => {
    const rows = Array.from(els.cmdkList.querySelectorAll('.cmdk-row'));
    if (ev.key === 'ArrowDown') { ev.preventDefault(); activeIdx = Math.min(activeIdx + 1, rows.length - 1); paintActive(); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); paintActive(); }
    else if (ev.key === 'Enter') { ev.preventDefault(); const r = rows[activeIdx]; if (r) executeEntry(r.dataset.entryId); }
    else if (ev.key === 'Escape') { ev.preventDefault(); closePalette(); }
  });
}
function currentRows() {
  const q = (els.cmdkInput.value || '').trim().toLowerCase();
  if (!q) return null; // 空クエリはセクション表示
  const hits = entries.filter(e => e.hay.includes(q) || e.title.toLowerCase().includes(q));
  hits.sort((a, b) => (favs.includes(b.id) - favs.includes(a.id)));
  return hits;
}
function rowEl(e, sectionLabel) {
  const row = document.createElement('div');
  row.className = 'cmdk-row';
  row.setAttribute('role', 'option');
  row.dataset.entryId = e.id;
  const star = document.createElement('button');
  star.type = 'button';
  star.className = 'cmdk-star' + (favs.includes(e.id) ? ' on' : '');
  star.textContent = favs.includes(e.id) ? '★' : '☆';
  star.setAttribute('aria-label', 'お気に入り切替');
  star.addEventListener('click', ev => { ev.stopPropagation(); toggleFav(e.id); renderList(); });
  const main = document.createElement('span');
  main.className = 'cmdk-row-main';
  main.innerHTML = '';
  const t = document.createElement('span'); t.className = 'cmdk-row-title'; t.textContent = e.title;
  const s = document.createElement('span'); s.className = 'cmdk-row-sub'; s.textContent = sectionLabel || e.sub || '';
  main.appendChild(t); main.appendChild(s);
  row.appendChild(main); row.appendChild(star);
  row.addEventListener('click', () => executeEntry(e.id));
  row.addEventListener('mousemove', () => {
    const rows = Array.from(els.cmdkList.querySelectorAll('.cmdk-row'));
    const i = rows.indexOf(row); if (i >= 0 && i !== activeIdx) { activeIdx = i; paintActive(); }
  });
  return row;
}
function paintActive() {
  const rows = Array.from(els.cmdkList.querySelectorAll('.cmdk-row'));
  rows.forEach((r, i) => {
    r.classList.toggle('active', i === activeIdx);
    r.setAttribute('aria-selected', String(i === activeIdx));
  });
  const r = rows[activeIdx];
  if (r) r.scrollIntoView({ block: 'nearest' });
}
function sectionHead(text) {
  const h = document.createElement('div');
  h.className = 'cmdk-section'; h.textContent = text;
  return h;
}
function renderList() {
  if (!els.cmdkList) return;
  els.cmdkList.innerHTML = '';
  const q = (els.cmdkInput.value || '').trim();
  if (!q) {
    const favEntries = favs.map(id => entries.find(e => e.id === id)).filter(Boolean);
    const recentEntries = recent.map(id => entries.find(e => e.id === id)).filter(Boolean);
    if (favEntries.length) { els.cmdkList.appendChild(sectionHead('★ お気に入り')); favEntries.forEach(e => els.cmdkList.appendChild(rowEl(e))); }
    if (recentEntries.length) { els.cmdkList.appendChild(sectionHead('最近使った')); recentEntries.forEach(e => els.cmdkList.appendChild(rowEl(e))); }
    els.cmdkList.appendChild(sectionHead('操作'));
    entries.filter(e => e.kind === 'action').forEach(e => els.cmdkList.appendChild(rowEl(e)));
    els.cmdkList.appendChild(sectionHead('系統'));
    entries.filter(e => e.kind === 'family').forEach(e => els.cmdkList.appendChild(rowEl(e)));
    els.cmdkList.appendChild(sectionHead('パネル (全34件は検索で)'));
    entries.filter(e => e.kind === 'panel').slice(0, 8).forEach(e => els.cmdkList.appendChild(rowEl(e)));
  } else {
    const hits = currentRows() || [];
    if (!hits.length) {
      const d = document.createElement('div');
      d.className = 'cmdk-empty'; d.textContent = '見つかりませんでした';
      els.cmdkList.appendChild(d);
    } else {
      hits.slice(0, 30).forEach(e => els.cmdkList.appendChild(rowEl(e)));
    }
  }
  if (activeIdx >= els.cmdkList.querySelectorAll('.cmdk-row').length) activeIdx = 0;
  paintActive();
}
function executeEntry(id) {
  const e = entries.find(x => x.id === id);
  if (!e) return;
  recordRecent(id);
  closePalette();
  /* パレットを閉じてから実行する (フライアウトやスクロールの邪魔をしない) */
  setTimeout(() => { try { e.run(); } catch (err) { /* 個別の失敗で全体を止めない */ } }, 30);
}
function openPalette() {
  if (!els.overlay) return;
  buildEntries();
  lastFocused = document.activeElement;
  els.overlay.hidden = false;
  els.cmdkInput.value = '';
  activeIdx = 0;
  renderList();
  els.cmdkInput.focus();
}
function closePalette() {
  if (!els.overlay || els.overlay.hidden) return;
  els.overlay.hidden = true;
  if (lastFocused && typeof lastFocused.focus === 'function') { try { lastFocused.focus(); } catch (e) { /* ignore */ } }
}
function paletteOpen() { return !!(els.overlay && !els.overlay.hidden); }

/* ════ chrome 構築 (集中トグル / ⌘K / 共有 / ECBサマリー / シード横共有) ════ */
function buildChrome() {
  const nav = document.getElementById('lienNav');
  if (nav && !document.getElementById('focusRow')) {
    const row = document.createElement('div');
    row.className = 'lien-nav-row focus-row';
    row.id = 'focusRow';
    const label = document.createElement('span');
    label.className = 'lien-nav-label'; label.textContent = '集中';
    const focusBtn = document.createElement('button');
    focusBtn.type = 'button'; focusBtn.id = 'focusToggleBtn';
    focusBtn.addEventListener('click', () => setFocus(!focusOn));
    const cmdkBtn = document.createElement('button');
    cmdkBtn.type = 'button'; cmdkBtn.id = 'cmdkOpenBtn'; cmdkBtn.textContent = '⌘K 検索';
    cmdkBtn.addEventListener('click', openPalette);
    const shareBtn = document.createElement('button');
    shareBtn.type = 'button'; shareBtn.id = 'shareUrlBtn'; shareIconInit(shareBtn, '共有URLをコピー'); shareBtn.title = '共有URLをコピー';
    shareBtn.addEventListener('click', () => copyShareURL(shareBtn));
    row.appendChild(label); row.appendChild(focusBtn); row.appendChild(cmdkBtn); row.appendChild(shareBtn);
    nav.appendChild(row);
    els.focusBtn = focusBtn; els.shareBtn = shareBtn;
  }
  const ecb = document.getElementById('engineControlBar');
  if (ecb && !document.getElementById('ecbSummary')) {
    const bar = document.createElement('div');
    bar.className = 'ecb-summary'; bar.id = 'ecbSummary';
    const txt = document.createElement('span');
    txt.className = 'ecb-summary-text'; txt.id = 'ecbSummaryText';
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'ecb-summary-btn'; btn.id = 'ecbSummaryBtn'; btn.textContent = '▾';
    btn.setAttribute('aria-label', 'Engine Controlを開く');
    btn.addEventListener('click', () => setEcbCollapsed(!ecbCollapsed));
    bar.appendChild(txt); bar.appendChild(btn);
    ecb.insertBefore(bar, ecb.firstChild);
    els.ecbSummaryText = txt; els.ecbToggleBtn = btn;
    /* ホバーで開く (user 2026-11-16): 畳んだ ECB にカーソルが来たら展開する。
       120ms の意図判定つき。開いた後は自動では畳まない (操作中に閉じないため)。 */
    let ecbHoverTimer = null;
    ecb.addEventListener('mouseenter', () => {
      if (!focusOn || !ecbCollapsed) return;
      clearTimeout(ecbHoverTimer);
      ecbHoverTimer = setTimeout(() => { if (focusOn && ecbCollapsed) setEcbCollapsed(false); }, 120);
    });
    ecb.addEventListener('mouseleave', () => clearTimeout(ecbHoverTimer));
  }
  const seedRow = document.getElementById('seedRow');
  if (seedRow && !document.getElementById('seedShareBtn')) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'seed-btn'; b.id = 'seedShareBtn'; shareIconInit(b, '共有URL');
    b.title = 'シード+ビュー+集中状態を含むURLをコピー';
    b.addEventListener('click', () => copyShareURL(b));
    seedRow.appendChild(b);
    els.seedShareBtn = b;
  }
  /* 系統チップの利用を最近履歴へ (クリック = 固定オープンがクリーンな接点) */
  document.querySelectorAll('.fam-chip').forEach(chip => {
    if (chip.dataset.focusHooked) return;
    chip.dataset.focusHooked = '1';
    chip.addEventListener('click', () => recordRecent('family:' + chip.dataset.family));
  });
}

/* ════ URL 復元 ════ */
function restoreFromURL() {
  const p = urlParams();
  let applied = false;
  if (p.focus === 'on' || p.focus === 'off') { focusOn = p.focus === 'on'; if (focusOn) ecbCollapsed = true; applied = true; }
  if (applied) applyFocus(true);
  if (p.view && window.__MEIKY_UI__ && ['play', 'design', 'lab'].includes(p.view)) {
    window.__MEIKY_UI__.setView(p.view);
  }
  if (p.seed && /^\d+$/.test(p.seed)) {
    const inp = document.getElementById('seedInput');
    const lock = document.getElementById('seedLockBtn');
    if (inp) {
      try {
        if (typeof S !== 'undefined' && S && !S.seedLocked && lock) lock.click();
      } catch (e) { /* ロックできなくても change 経路は試す */ }
      inp.value = String((parseInt(p.seed, 10) >>> 0) || 1);
      inp.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}

/* ════ 初期化 (95/96 の構築が終わるまで待つ) ════ */
function init() {
  buildPalette();
  buildChrome();
  buildEntries();
  applyFocus(false);              // 保存済みの選択をそのまま反映 (再保存はしない)
  restoreFromURL();               // URL があればそちらを優先
  applyFocus(true);
  refreshEcbSummary();
  document.addEventListener('click', () => setTimeout(refreshEcbSummary, 60));
  document.addEventListener('keydown', ev => {
    if ((ev.metaKey || ev.ctrlKey) && (ev.key === 'k' || ev.key === 'K')) {
      ev.preventDefault();
      paletteOpen() ? closePalette() : openPalette();
    }
  });
  window.__MEIKY_FOCUS__ = {
    isOn: () => focusOn,
    setFocus, toggleFocus: () => setFocus(!focusOn),
    ecbCollapsed: () => ecbCollapsed, setEcbCollapsed,
    openPalette, closePalette, paletteOpen,
    buildShareURL, copyShareURL,
    recent: () => recent.slice(), favs: () => favs.slice(),
    entries: () => entries.map(e => e.id),
  };
}
function boot() {
  let tries = 0;
  const iv = setInterval(() => {
    tries++;
    const ready = document.getElementById('lienNav') && window.__MEIKY_FAM__ && window.__MEIKY_UI__;
    if (ready || tries > 50) { clearInterval(iv); init(); }
  }, 100);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
