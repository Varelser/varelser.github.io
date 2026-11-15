/* ── 2026-11-15 v2: Lien layout packing + flow guide (95) ──
   「見せ方」だけの追加レイヤー (生成・保存・既存ハンドラには触れない)。
   1) パネル詰め込み: >=1280px で .wrap の直列フローを「全幅行 (ヘッダー /
      ECB / 操作バー / 生成クラスター / 広いパネル5枚)」と「列セグメント」に
      分け、列セグメント内は LPT (高い順→最短列) で 3列 (>=1800px は 4列)
      に詰める。行揃えグリッドの無駄を無くし、文書高を現行以下に抑える。
      <1280px と CLASSIC では元の DOM に完全復元する。
   2) 動線: ECB 直下にクイックスタート帯 (4ステップ + 実験室導線) と
      目的別ジャンプ (6件) を置く。ジャンプは対象パネルの tier へ切替え、
      折りたたみを展開してからスクロールする。#uiControlBar には tier の
      1行説明、生成後は #genBar に試聴/保存への案内チップを出す。 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const wrap = document.querySelector('.wrap');
  if (!wrap) return;
  const skin = document.getElementById('modernSkinLink');
  const modern = () => !skin || !skin.disabled;
  const WIDE = new Set(['cc-automation', 'lorenz', 'rubato', 'spectral', 'rhythmic-canons']);
  const GAP = 16;

  /* ════ 元構造の記録 (復元用) ════ */
  const moved = [];           // {el, parent, index, depth}
  const record = (el, parent) => {
    moved.push({ el, parent, index: Array.from(parent.children).indexOf(el), depth: 0 });
  };
  const g2shells = Array.from(wrap.querySelectorAll(':scope > .g2, :scope > .g3'));
  const flatItems = [];       // {el, kind: 'pool'|'wide'|'chrome', slug}
  const ecb = document.getElementById('engineControlBar');
  const tools = wrap.querySelector(':scope > .meikyo-panel-tools');
  const header = wrap.querySelector(':scope > header');
  const footer = wrap.querySelector(':scope > footer');
  const cluster = Array.from(wrap.children).find(c => c.querySelector && c.querySelector(':scope > .gen-row'));
  let uiBar = document.getElementById('uiControlBar');

  for (const child of Array.from(wrap.children)) {
    record(child, wrap);
    if (child.classList && (child.classList.contains('g2') || child.classList.contains('g3'))) {
      for (const sub of Array.from(child.children)) {
        record(sub, child);
        flatItems.push({ el: sub, shell: child });
      }
    } else {
      flatItems.push({ el: child, shell: null });
    }
  }
  for (const m of moved) { let d = 0, n = m.parent; while (n && n !== wrap) { d++; n = n.parentElement; } m.depth = d; }
  const kindOf = el => {
    if (el === header || el === ecb || el === tools || el === footer || el === cluster || el === uiBar) return 'chrome';
    if (el.classList && el.classList.contains('panel') && WIDE.has(el.dataset.section)) {
      /* 非表示の広パネルは境界にしない (前後のセグメントが繋がって詰まる) */
      return getComputedStyle(el).display === 'none' ? 'pool' : 'chrome';
    }
    return 'pool';
  };

  /* ════ Synthesis の param-row + desc をペアで包む (内部2カラム用) ════ */
  const pairWraps = [];
  const synth = wrap.querySelector('.panel[data-section="synthesis"]');
  if (synth) {
    Array.from(synth.children).forEach(node => {
      if (node.classList && node.classList.contains('param-row')) {
        const next = node.nextElementSibling;
        const w = document.createElement('div');
        w.className = 'lien-pair';
        synth.insertBefore(w, node);
        w.appendChild(node);
        if (next && next.classList && next.classList.contains('param-desc')) w.appendChild(next);
        pairWraps.push(w);
      }
    });
  }

  /* ════ 動線帯 (クイックスタート + 目的別ジャンプ) ════ */
  const nav = document.createElement('div');
  nav.className = 'lien-nav';
  nav.id = 'lienNav';
  nav.innerHTML =
    '<div class="lien-nav-row lien-steps">' +
      '<span class="lien-nav-label">クイックスタート</span>' +
      '<button type="button" data-goto="chord-input">1 コードを決める</button><span class="lien-arrow">→</span>' +
      '<button type="button" data-goto="genre">2 雰囲気をえらぶ</button><span class="lien-arrow">→</span>' +
      '<button type="button" data-goto="__gen">3 下の GENERATE を押す</button><span class="lien-arrow">→</span>' +
      '<button type="button" data-goto="__preview">4 試聴してダウンロード</button>' +
      '<button type="button" class="lien-adv" data-goto="__lab">上級者向け: 実験室タブで全機能</button>' +
    '</div>' +
    '<div class="lien-nav-row lien-jumps">' +
      '<span class="lien-nav-label">目的別</span>' +
      '<button type="button" data-goto="chord-input">コード</button>' +
      '<button type="button" data-goto="genre">雰囲気・エンジン</button>' +
      '<button type="button" data-goto="layers">レイヤー</button>' +
      '<button type="button" data-goto="rhythmic-canons">理論パック</button>' +
      '<button type="button" data-goto="__preview">プレビュー</button>' +
      '<button type="button" data-goto="multi-export">書き出し</button>' +
      '<div class="lien-nav-tools"></div>' +
    '</div>';

  /* tier 説明 (#uiControlBar の1行目に差し込む) */
  const TIER_DESC = {
    play: '生成 — コードと雰囲気だけで作れる基本ビュー',
    design: 'レイヤー — エンジンを重ねて調整するビュー',
    lab: '実験室 — 全セクション表示 (上級者向け)',
  };
  const tierDesc = document.createElement('span');
  tierDesc.id = 'lienTierDesc';
  const syncTierDesc = () => {
    const v = window.__MEIKY_UI__ ? window.__MEIKY_UI__.getView() : 'design';
    tierDesc.textContent = TIER_DESC[v] || '';
  };

  /* 生成後の案内チップ (#genBar 内) */
  const genBar = document.getElementById('genBar');
  const genHint = document.createElement('button');
  genHint.type = 'button';
  genHint.id = 'lienGenHint';
  genHint.textContent = '生成できました — 試聴は PREVIEW、保存は .MID';
  genHint.style.display = 'none';
  genHint.addEventListener('click', () => gotoTarget(previewTarget(), null));
  if (genBar) genBar.appendChild(genHint);
  const refreshGenHint = () => {
    const has = typeof S !== 'undefined' && S && S.midiData && S.midiData.length > 0;
    genHint.style.display = has ? '' : 'none';
  };

  function previewTarget() {
    const pv = document.getElementById('midiPreviewPanel');
    if (pv && getComputedStyle(pv).display !== 'none') return pv;
    return cluster;
  }

  /* ════ ジャンプ (tier 切替 + 展開 + スクロール) ════ */
  function ensureVisible(panel) {
    if (!panel) return;
    if (getComputedStyle(panel).display !== 'none') return;
    const ui = window.__MEIKY_UI__;
    if (!ui) return;
    const sec = ui.sections.find(s => s.slug === panel.dataset.section);
    const search = document.getElementById('uiSearch');
    if (search && search.value) search.value = '';
    const ao = document.getElementById('uiActiveOnly');
    if (ao && ao.checked) ao.checked = false;
    if (sec) ui.setView(['play', 'design', 'lab'][sec.tier] || 'lab');
    ui.applyFilters();
    syncTierDesc();
  }
  function flash(el) {
    if (!el) return;
    el.classList.add('lien-flash');
    setTimeout(() => el.classList.remove('lien-flash'), 1300);
  }
  function gotoTarget(el, panel) {
    if (panel) ensureVisible(panel);
    distribute();
    if (panel && panel.classList.contains('collapsed')) {
      const label = panel.querySelector(':scope > .sec-label');
      if (label) label.click();
    }
    if (!el) el = panel;
    if (!el) return;
    requestAnimationFrame(() => setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      flash(panel || el);
    }, 40));
  }
  function gotoSlug(slug) {
    if (slug === '__gen') { gotoTarget(cluster, null); const b = document.getElementById('btnGen'); if (b) flash(b.closest('.gen-row') || b); return; }
    if (slug === '__preview') { gotoTarget(previewTarget(), null); return; }
    if (slug === '__lab') {
      if (window.__MEIKY_UI__) { window.__MEIKY_UI__.setView('lab'); syncTierDesc(); }
      distribute();
      if (uiBar) { uiBar.scrollIntoView({ behavior: 'smooth', block: 'start' }); flash(uiBar); }
      return;
    }
    const panel = wrap.querySelector('.panel[data-section="' + slug + '"]');
    gotoTarget(panel, panel);
  }
  nav.addEventListener('click', ev => {
    const b = ev.target.closest('button[data-goto]');
    if (b) gotoSlug(b.dataset.goto);
  });

  /* ════ 復元 / 配置 ════ */
  function restore() {
    if (nav.parentElement) nav.remove();
    const byDepth = moved.slice().sort((a, b) => a.depth - b.depth || a.index - b.index);
    // 親 (浅い順) ごとに index 昇順で戻す
    const groups = new Map();
    for (const m of byDepth) {
      if (!groups.has(m.parent)) groups.set(m.parent, []);
      groups.get(m.parent).push(m);
    }
    for (const list of groups.values()) {
      list.sort((a, b) => a.index - b.index);
      for (const m of list) {
        const ref = m.parent.children[m.index] || null;
        if (ref !== m.el) m.parent.insertBefore(m.el, ref);
      }
    }
    wrap.querySelectorAll(':scope > .lien-cols').forEach(c => c.remove());
    wrap.classList.remove('lien-on');
  }

  function setupChrome() {
    // 帯は tools の直後 (ECB の下) に置き、tools を帯の2行目右端へ迎える
    if (tools && tools.parentElement) {
      tools.parentElement.insertBefore(nav, tools.nextSibling);
    } else if (ecb && ecb.parentElement) {
      ecb.parentElement.insertBefore(nav, ecb.nextSibling);
    }
    const slot = nav.querySelector('.lien-nav-tools');
    if (tools && slot && tools.parentElement !== slot) slot.appendChild(tools);
    if (uiBar && !tierDesc.parentElement) {
      const row = uiBar.querySelector('.ui-row');
      if (row) row.appendChild(tierDesc);
    }
    syncTierDesc();
  }

  function teardownChrome() {
    if (nav.parentElement) nav.remove();
    restore();
  }

  function distribute() {
    if (!modern()) return;
    // 列セグメントだけを組み直す (帯・tools・tier説明は setupChrome の担当)
    wrap.querySelectorAll(':scope > .lien-cols').forEach(c => {
      // セグメントを解体し、子を一旦 wrap 直下 (境界の前) へ戻す
      const items = Array.from(c.querySelectorAll(':scope > .lien-col > *'));
      for (const it of items) wrap.insertBefore(it, c);
      c.remove();
    });
    // g2 の中身を wrap 直下へ持ち上げる (uiBar は全幅行、パネルはプール候補)
    for (const shell of g2shells) {
      if (!shell.parentElement) continue;
      while (shell.firstChild) wrap.insertBefore(shell.firstChild, shell);
      shell.remove();
    }
    wrap.classList.add('lien-on');
    if (window.innerWidth < 1280) return; // 1カラム: DOM順そのまま

    const candidates = window.innerWidth >= 1800 ? [2, 3, 4, 5] : [2, 3];
    const items = [];
    for (const child of Array.from(wrap.children)) {
      if (child === nav || child.classList.contains('lien-cols')) continue;
      items.push(child);
    }
    let segment = [];
    // セグメントを cols 列で組み、実測高を返す (assign を渡すと再利用)
    const buildInto = (box, cols, reuseAssign) => {
      box.innerHTML = '';
      box.dataset.cols = cols;
      const colEls = [];
      for (let i = 0; i < cols; i++) {
        const c = document.createElement('div');
        c.className = 'lien-col';
        box.appendChild(c);
        colEls.push(c);
      }
      for (const el of segment) colEls[0].appendChild(el);
      let assign = reuseAssign;
      if (!assign) {
        const heights = segment.map(el => el.offsetHeight);
        // LPT: 高い順に最短列へ。列内は DOM 順に戻す
        const order = segment.map((el, i) => i).sort((a, b) => heights[b] - heights[a] || a - b);
        const sums = new Array(cols).fill(0);
        const counts = new Array(cols).fill(0);
        assign = new Array(segment.length).fill(0);
        for (const i of order) {
          let best = 0;
          for (let c = 1; c < cols; c++) {
            const scoreA = heights[i] === 0 ? counts[c] : sums[c];
            const scoreB = heights[i] === 0 ? counts[best] : sums[best];
            if (scoreA < scoreB) best = c;
          }
          assign[i] = best;
          sums[best] += heights[i] + GAP;
          counts[best]++;
        }
      }
      segment.forEach((el, i) => colEls[assign[i]].appendChild(el));
      return { h: box.offsetHeight, assign };
    };
    const flush = anchor => {
      if (segment.length < 2) { segment = []; return; }
      if (segment.every(el => getComputedStyle(el).display === 'none')) { segment = []; return; }
      const box = document.createElement('div');
      box.className = 'lien-cols';
      wrap.insertBefore(box, anchor);
      // 列数は候補を実測し、最も低くなるものを採る (パネル幅で高さが
      // 非単調に変わるため: 狭いと伸びるパネルと、内部2カラムが効く
      // 広いと縮むパネルが混在する)
      let best = null;
      for (const c of candidates) {
        const r = buildInto(box, c, null);
        if (!best || r.h < best.h) best = { c, h: r.h, assign: r.assign };
      }
      buildInto(box, best.c, best.assign);
      segment = [];
    };
    for (const el of items) {
      if (kindOf(el) === 'chrome') flush(el);
      else segment.push(el);
    }
    flush(footer || null);
  }

  /* ════ 配線 ════ */
  let currentMode = null; // 'modern' | 'classic'
  function applyMode() {
    const m = modern() ? 'modern' : 'classic';
    if (m === currentMode) { if (m === 'modern') distribute(); return; }
    currentMode = m;
    if (m === 'classic') {
      teardownChrome();
    } else {
      restore();
      setupChrome();
      distribute();
    }
  }

  applyMode();

  const dt = document.getElementById('designToggle');
  if (dt) dt.addEventListener('click', () => setTimeout(applyMode, 90));

  if (uiBar) {
    uiBar.addEventListener('click', ev => {
      if (ev.target.closest('.ui-view-btn')) setTimeout(() => { syncTierDesc(); distribute(); }, 40);
    });
    uiBar.addEventListener('change', ev => {
      if (ev.target.id === 'uiActiveOnly') setTimeout(distribute, 40);
    });
    const search = document.getElementById('uiSearch');
    if (search) {
      let t = null;
      search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(distribute, 350); });
    }
  }
  document.addEventListener('click', ev => {
    if (ev.target.closest('#btnGen, #btnGenAB, #genBar button.primary')) {
      setTimeout(refreshGenHint, 1600);
    }
  });
  refreshGenHint();

  const mq1280 = window.matchMedia('(min-width: 1280px)');
  const mq1800 = window.matchMedia('(min-width: 1800px)');
  const onMq = () => { if (currentMode === 'modern') distribute(); };
  if (mq1280.addEventListener) { mq1280.addEventListener('change', onMq); mq1800.addEventListener('change', onMq); }

  window.__MEIKY_LIEN__ = { distribute, restore, gotoSlug, nav };
});
