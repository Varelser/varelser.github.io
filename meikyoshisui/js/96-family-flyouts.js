/* ── 2026-11-15 v5: 系統ファミリー + フライアウト (96) ──
   user: 「アイコンでセオリー系はまとめるとかそういう同じ系統で
   まとめてカーソルで出す方式は？」→「全系統で試作して」。
   パネルを系統 (理論 / 自然・数理 / 時間 / 音律 / レイヤー / 変容)
   ごとにまとめ、動線帯 (#lienNav) の系統バーにアイコンチップを
   並べる。ホバーでその系統のコントロールが Lien 流のフローティ
   ングパネル (フライアウト) に浮いて出る。クリックで固定、
   Esc / 外側クリックで閉じる。タッチはタップで開閉。
   コア導線 (コード入力 / ジャンル / 生成クラスター / 状態保存 /
   ECB / genBar) はページに残す。
   実装は additive: パネルの DOM ノードをそのまま系統コンテナへ
   移動するだけ (id・配線・保存形式は不変)。生成系 JS には触れない。
   CLASSIC では 95 の復元がパネルを元の位置へ戻すため、こちらは
   バーとコンテナを畳むだけにする。 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ════ 系統の定義 (slug は 69 の registry と一致) ════ */
  const ICONS = {
    theory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 3.2 20 7.6v8.8L12 20.8 4 16.4V7.6Z"/><path d="M12 7.4 16.4 9.9v4.9L12 17.3 7.6 14.8V9.9Z"/></svg>',
    nature: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2.5 12c2.4 0 2.4-5.5 4.8-5.5S9.7 17.5 12.1 17.5s2.4-11 4.8-11 2.4 5.5 4.6 5.5"/></svg>',
    time: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="8.2"/><path d="M12 7.6V12l3.1 2"/></svg>',
    tuning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8.5 3.5v6.2a3.5 3.5 0 0 0 7 0V3.5"/><path d="M12 13.2v7.3"/><path d="M8.8 20.5h6.4"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 3.8 21 8.3l-9 4.5L3 8.3Z"/><path d="M4.6 12.4 12 16.1l7.4-3.7"/><path d="M4.6 16.2 12 19.9l7.4-3.7"/></svg>',
    transform: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 7.2h10.2l-2.4-2.4"/><path d="M19.5 16.8H9.3l2.4 2.4"/></svg>',
  };
  const FAMILIES = [
    { id: 'theory', label: '理論', en: 'THEORY', slugs: ['rhythmic-canons', 'progression', 'neo-riemannian', 'negative-harmony', 'serialism', 'theory-framework', 'theory-analysis', 'pcset-map'] },
    { id: 'nature', label: '自然・数理', en: 'NATURE / MATH', slugs: ['attractor-seq', 'lorenz', 'boids', 'cellular-automaton', 'sieve', 'markov', 'lsystem'] },
    { id: 'time', label: '時間', en: 'TIME', slugs: ['euclidean', 'rubato', 'conductor', 'humanizer', 'macro-structure'] },
    { id: 'tuning', label: '音律', en: 'TUNING', slugs: ['just-intonation', 'comp-tuning', 'solfeggio', 'binaural', 'spectral'] },
    { id: 'layers', label: 'レイヤー', en: 'LAYERS', slugs: ['layers', 'macros', 'synthesis', 'octave-range'] },
    { id: 'transform', label: '変容', en: 'TRANSFORM', slugs: ['scale-mutation', 'cc-automation'] },
  ];
  const FAMILY_OF = {};
  for (const f of FAMILIES) for (const s of f.slugs) FAMILY_OF[s] = f.id;

  const skin = document.getElementById('modernSkinLink');
  const modern = () => !skin || !skin.disabled;
  const nav = document.getElementById('lienNav');

  let grouped = false;
  let openId = null;
  let pinned = false;
  let openTimer = null;
  let closeTimer = null;
  const chips = {};      // familyId -> button
  const flyouts = {};    // familyId -> container
  const members = {};    // familyId -> [panel]
  let row = null;

  const panelOf = slug => document.querySelector('.panel[data-section="' + slug + '"]');

  /* ════ ON バッジ (系統内の .tog.on 数) ════ */
  function countOn(id) {
    let n = 0;
    for (const p of members[id] || []) n += p.querySelectorAll('.tog.on').length;
    return n;
  }
  function recount(id) {
    const chip = chips[id];
    if (!chip) return;
    const n = countOn(id);
    const badge = chip.querySelector('.fam-badge');
    if (badge) { badge.textContent = String(n); badge.hidden = n === 0; }
    chip.classList.toggle('has-on', n > 0);
  }
  const recountAll = () => FAMILIES.forEach(f => recount(f.id));
  let recountQueued = false;
  function queueRecount() {
    if (recountQueued) return;
    recountQueued = true;
    setTimeout(() => { recountQueued = false; recountAll(); }, 80);
  }

  /* ════ 配置 (チップの下、ビューポート内にクランプ) ════ */
  function place(id) {
    const box = flyouts[id], chip = chips[id];
    if (!box || !chip || box.hidden) return;
    const r = chip.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = box.offsetWidth;
    let left = Math.round(Math.min(Math.max(8, r.left), Math.max(8, vw - w - 8)));
    box.style.left = left + 'px';
    const below = Math.round(r.bottom + 8);
    if (vh - below >= 260 || r.top < vh / 2) {
      box.style.top = below + 'px';
      box.style.bottom = 'auto';
      box.style.maxHeight = Math.max(220, vh - below - 12) + 'px';
    } else {
      box.style.top = 'auto';
      box.style.bottom = Math.round(vh - r.top + 8) + 'px';
      box.style.maxHeight = Math.max(220, r.top - 20) + 'px';
    }
  }

  /* ════ 開閉 ════ */
  function showMembers(id) {
    for (const p of members[id] || []) p.style.display = '';
  }
  function open(id, pin) {
    if (!grouped) return;
    if (openId && openId !== id) hideBox(openId);
    openId = id;
    pinned = !!pin;
    const box = flyouts[id], chip = chips[id];
    showMembers(id);
    box.hidden = false;
    chip.classList.add('open');
    chip.setAttribute('aria-expanded', 'true');
    place(id);
    /* 折りたたみ中に初期化された canvas 類への再描画の合図 (84 と同じ作法) */
    requestAnimationFrame(() => setTimeout(() => window.dispatchEvent(new Event('resize')), 30));
    /* ピアノロール (82 の drawRoll) は生成時に clientWidth から幅を
       決めるため、閉じたフライアウトの中で生成すると幅 0 で描かれる。
       理論フライアウトを開いた時に、公開されている再描画入口を
       実幅で呼び直す (生成系のコード自体には触れない)。 */
    if (id === 'theory' && window.__MEIKY_RENDER__ && typeof window.__MEIKY_RENDER__.drawRoll === 'function') {
      setTimeout(() => { try { window.__MEIKY_RENDER__.drawRoll(); } catch (e) { /* データ無しでは描かない */ } }, 60);
    }
    recount(id);
  }
  function hideBox(id) {
    const box = flyouts[id], chip = chips[id];
    if (box) box.hidden = true;
    if (chip) { chip.classList.remove('open'); chip.setAttribute('aria-expanded', 'false'); }
  }
  function close() {
    if (!openId) return;
    hideBox(openId);
    openId = null;
    pinned = false;
    clearTimeout(openTimer); clearTimeout(closeTimer);
    /* tier / 検索フィルタの表示状態へ戻す (69 の正規の経路) */
    if (window.__MEIKY_UI__) window.__MEIKY_UI__.applyFilters();
  }
  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { if (openId && !pinned) close(); }, 300);
  }

  /* ════ 構築 (冪等: CLASSIC 往復後も再利用できる) ════ */
  function build() {
    if (!nav) return;
    if (!row || row.parentElement !== nav) {
      row = document.createElement('div');
      row.className = 'lien-nav-row lien-fam-row';
      row.id = 'lienFamRow';
      row.innerHTML = '<span class="lien-nav-label">系統</span>';
      for (const f of FAMILIES) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'fam-chip';
        b.dataset.family = f.id;
        b.setAttribute('aria-haspopup', 'true');
        b.setAttribute('aria-expanded', 'false');
        b.innerHTML = '<span class="fam-ico" aria-hidden="true">' + ICONS[f.id] + '</span>' +
          '<span class="fam-name">' + f.label + '</span>' +
          '<span class="fam-badge" hidden>0</span>';
        row.appendChild(b);
        chips[f.id] = b;
      }
      const hint = document.createElement('span');
      hint.className = 'fam-hint';
      hint.textContent = 'ホバーで開く / クリックで固定';
      row.appendChild(hint);
      nav.appendChild(row);
    }
    for (const f of FAMILIES) {
      if (!flyouts[f.id]) {
        const box = document.createElement('div');
        box.className = 'fam-flyout';
        box.id = 'famFlyout-' + f.id;
        box.dataset.family = f.id;
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-label', f.label);
        box.hidden = true;
        box.innerHTML =
          '<div class="fam-flyout-head">' +
            '<span class="fam-flyout-title">' + f.label + ' <span class="fam-flyout-en">' + f.en + '</span></span>' +
            '<button type="button" class="fam-flyout-close" aria-label="閉じる">×</button>' +
          '</div>' +
          '<div class="fam-flyout-body"></div>';
        document.body.appendChild(box);
        flyouts[f.id] = box;
        box.querySelector('.fam-flyout-close').addEventListener('click', () => close());
        box.addEventListener('mouseenter', () => clearTimeout(closeTimer));
        box.addEventListener('mouseleave', () => { if (!pinned) scheduleClose(); });
      }
      const body = flyouts[f.id].querySelector('.fam-flyout-body');
      members[f.id] = [];
      for (const slug of f.slugs) {
        const p = panelOf(slug);
        if (!p) continue;
        if (p.parentElement !== body) body.appendChild(p);
        members[f.id].push(p);
      }
    }
    /* チップの配線 (一度だけ) */
    if (!row.dataset.wired) {
      row.dataset.wired = '1';
      for (const f of FAMILIES) {
        const chip = chips[f.id];
        chip.addEventListener('mouseenter', () => {
          clearTimeout(closeTimer);
          if (pinned && openId) return;           // 固定中はホバーで切り替えない
          if (openId === f.id) return;
          clearTimeout(openTimer);
          openTimer = setTimeout(() => open(f.id, false), 120);
        });
        chip.addEventListener('mouseleave', () => { clearTimeout(openTimer); if (!pinned) scheduleClose(); });
        chip.addEventListener('click', () => {
          clearTimeout(openTimer); clearTimeout(closeTimer);
          if (openId === f.id && pinned) close();
          else open(f.id, true);
        });
      }
    }
    grouped = true;
    recountAll();
    if (window.__MEIKY_LIEN__) window.__MEIKY_LIEN__.distribute();
  }

  function teardown() {
    close();
    for (const f of FAMILIES) if (flyouts[f.id]) flyouts[f.id].hidden = true;
    grouped = false;
  }

  function syncSkin() {
    if (modern()) { if (!grouped) build(); }
    else if (grouped) teardown();
  }

  /* ════ 動線ジャンプとの連携 (95 の gotoSlug / 帯ボタン) ════
     95 の gotoSlug は対象パネルを .wrap の中から探すため、系統へ
     移動したパネルは見つけられない (展開もスクロールも起きない)。
     そこで系統側で先に: フライアウトを開く (固定) → 折りたたみを
     展開 → フライアウト内でスクロール + フラッシュ、までを担う。
     コア導線 (multi-export 等) は従来通り 95 に任せる。 */
  function revealInFlyout(slug) {
    const fam = FAMILY_OF[slug];
    if (!fam || !grouped) return;
    open(fam, true);
    const panel = panelOf(slug);
    if (!panel) return;
    if (panel.classList.contains('collapsed')) {
      const label = panel.querySelector(':scope > .sec-label');
      if (label) label.click();
    }
    setTimeout(() => {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      panel.classList.add('lien-flash');
      setTimeout(() => panel.classList.remove('lien-flash'), 1300);
    }, 90);
  }
  document.addEventListener('click', ev => {
    const b = ev.target.closest && ev.target.closest('button[data-goto]');
    if (!b) return;
    revealInFlyout(b.dataset.goto);
  }, true);
  if (window.__MEIKY_LIEN__ && window.__MEIKY_LIEN__.gotoSlug) {
    const orig = window.__MEIKY_LIEN__.gotoSlug;
    window.__MEIKY_LIEN__.gotoSlug = slug => {
      revealInFlyout(slug);
      return orig(slug);
    };
  }
  /* 検索: ヒットした系統を自動で開く (v3 のパック展開と同じ作法)。
     一致は slug / 見出しを優先し、本文はフォールバックにする
     (巨大な rcPanel の本文には他系統の語も混ざるため)。 */
  let lastSearchOpen = '';
  document.addEventListener('input', ev => {
    if (!ev.target || ev.target.id !== 'uiSearch' || !grouped) return;
    const q = (ev.target.value || '').trim().toLowerCase();
    if (!q || q === lastSearchOpen) return;
    const labelOf = p => { const l = p.querySelector(':scope > .sec-label'); return l ? l.textContent.toLowerCase() : ''; };
    let fam = null;
    for (const f of FAMILIES) {
      if ((members[f.id] || []).some(p => p.dataset.section.includes(q) || labelOf(p).includes(q))) { fam = f.id; break; }
    }
    if (!fam) {
      for (const f of FAMILIES) {
        if ((members[f.id] || []).some(p => (p.textContent || '').toLowerCase().includes(q))) { fam = f.id; break; }
      }
    }
    if (fam) { lastSearchOpen = q; open(fam, true); }
  });

  /* ════ 全体の閉じ条件 ════ */
  document.addEventListener('mousedown', ev => {
    if (!openId) return;
    const box = flyouts[openId], chip = chips[openId];
    if (box && box.contains(ev.target)) return;
    if (chip && chip.contains(ev.target)) return;
    close();
  });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') close(); });
  window.addEventListener('scroll', () => { if (openId && !pinned) close(); }, { capture: true, passive: true });
  window.addEventListener('resize', () => { if (openId) place(openId); });

  /* ════ バッジの追随 (トグルの class 変化を観察) ════ */
  document.addEventListener('click', ev => { if (ev.target.closest && ev.target.closest('.tog')) queueRecount(); });
  document.addEventListener('change', queueRecount);
  if (window.MutationObserver) {
    const mo = new MutationObserver(list => {
      for (const m of list) {
        if (m.target && m.target.classList && m.target.classList.contains('tog')) { queueRecount(); break; }
      }
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
  }

  /* ビュー切替で 69 が系統パネルを tier で隠し直しても、開いている
     フライアウトの中身は保つ */
  document.addEventListener('click', ev => {
    if (ev.target.closest && ev.target.closest('.ui-view-btn')) {
      setTimeout(() => { if (openId) showMembers(openId); }, 80);
    }
  });

  /* ════ スキン往復への追随 (95 と同じ designToggle 経由) ════ */
  const dt = document.getElementById('designToggle');
  if (dt) dt.addEventListener('click', () => setTimeout(syncSkin, 260));

  syncSkin();

  window.__MEIKY_FAM__ = {
    families: FAMILIES.map(f => ({ id: f.id, label: f.label, slugs: f.slugs.slice() })),
    open: id => open(id, true),
    close,
    isOpen: id => openId === id,
    openId: () => openId,
    pinned: () => pinned,
    counts: () => { const o = {}; for (const f of FAMILIES) o[f.id] = countOn(f.id); return o; },
    grouped: () => grouped,
  };
});
