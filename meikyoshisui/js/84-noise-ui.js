/* ── 2026-11-13: Noise-standard UI layer (84) ──
   Noise (Lien系) の作法に倣った「見せ方」だけの追加レイヤー。
   - 全 .panel を .sec-label クリックで折りたたみ可能にする (状態は
     localStorage 'meikyoshisui_ui_panels_v1' に保存、Noise の流儀)
   - Engine Control Bar の直前に「全て開く / 全て閉じる」を置く
   既存の id・配線・保存形式・生成ロジックには一切触れない。
   階層ビュー (69) が display を切り替えるのとは独立に、クラスだけを触る。 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const KEY = 'meikyoshisui_ui_panels_v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { saved = {}; }

  const panels = [];
  document.querySelectorAll('.panel').forEach((panel, i) => {
    const label = panel.querySelector(':scope > .sec-label');
    if (!label) return;
    const slug = panel.dataset.section || ('panel-' + i);
    panels.push({ panel, slug });
    label.setAttribute('role', 'button');
    label.setAttribute('tabindex', '0');
    label.title = 'クリックで開閉';
    const toggle = () => {
      panel.classList.toggle('collapsed');
      persist();
      if (!panel.classList.contains('collapsed')) {
        /* 折りたたみ中に 0 幅で初期化された canvas 類へ再描画の合図 */
        window.dispatchEvent(new Event('resize'));
      }
    };
    label.addEventListener('click', toggle);
    label.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); }
    });
  });

  function persist() {
    const state = {};
    for (const { panel, slug } of panels) {
      if (panel.classList.contains('collapsed')) state[slug] = 1;
    }
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* 保存不可でも開閉は有効 */ }
  }

  /* 保存済みの折りたたみは、各エンジンの初期化 (canvas 計測) が終わってから適用する */
  requestAnimationFrame(() => setTimeout(() => {
    for (const { panel, slug } of panels) {
      if (saved[slug]) panel.classList.add('collapsed');
    }
  }, 60));

  /* ── 全て開く / 全て閉じる (Noise の panel-tools と同じ置き方) ── */
  const anchor = document.getElementById('engineControlBar');
  if (anchor && anchor.parentElement && panels.length) {
    const tools = document.createElement('div');
    tools.className = 'meikyo-panel-tools';
    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.textContent = '全て開く';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = '全て閉じる';
    openBtn.addEventListener('click', () => {
      panels.forEach(({ panel }) => panel.classList.remove('collapsed'));
      persist();
      window.dispatchEvent(new Event('resize'));
    });
    closeBtn.addEventListener('click', () => {
      panels.forEach(({ panel }) => panel.classList.add('collapsed'));
      persist();
    });
    tools.append(openBtn, closeBtn);
    anchor.parentElement.insertBefore(tools, anchor);
  }

  /* ── よく使うパネルを作業順に集める並び替え (モダン表示時のみ) ──
     入力 → 生成 → 仕上げ → 書き出し の順に .wrap の子を並び替え、
     マウス移動を減らす。CLASSIC 表示に切り替えると元の順序に戻る。
     並び替えは DOM の順序だけであり、id・配線・保存形式には触れない。 */
  const wrap = document.querySelector('.wrap');
  if (wrap) {
    const RANK = {
      'chord-input': 10, 'genre': 11, 'synthesis': 12, 'layers': 13, 'macros': 14,
      'progression': 15, 'octave-range': 16, 'multi-export': 17,
      'humanizer': 20, 'cc-automation': 21, 'conductor': 22, 'macro-structure': 23, 'scale-mutation': 24,
      'attractor-seq': 30, 'lorenz': 31, 'boids': 32, 'cellular-automaton': 33, 'sieve': 34,
      'euclidean': 35, 'markov': 36, 'lsystem': 37, 'rubato': 38, 'serialism': 39,
      'neo-riemannian': 40, 'negative-harmony': 41, 'spectral': 42,
      'just-intonation': 50, 'comp-tuning': 51, 'solfeggio': 52, 'binaural': 53, 'rhythmic-canons': 54,
      'theory-framework': 60, 'theory-analysis': 61, 'pcset-map': 62,
    };
    const rankOf = el => {
      if (el.tagName === 'HEADER') return 0;
      if (el.id === 'engineControlBar') return 1;
      if (el.classList && el.classList.contains('meikyo-panel-tools')) return 2;
      if (el.tagName === 'FOOTER') return 999;
      if (el.id === 'spPanel') return 18;
      const s = el.dataset && el.dataset.section;
      if (s && RANK[s] != null) return RANK[s];
      // グループ div (g2 等) は、内包するパネルの最小ランクで代表する
      let best = null;
      el.querySelectorAll('.panel[data-section]').forEach(pn => {
        const r = RANK[pn.dataset.section];
        if (r != null && (best === null || r < best)) best = r;
      });
      return best !== null ? best : 45;
    };
    const original = Array.from(wrap.children);
    const applyOrder = () => {
      const skin = document.getElementById('modernSkinLink');
      const modern = !skin || !skin.disabled;
      const list = modern
        ? original.map((el, i) => [rankOf(el), i, el]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(x => x[2])
        : original;
      for (const el of list) wrap.appendChild(el);
    };
    applyOrder();
    const dt = document.getElementById('designToggle');
    if (dt) dt.addEventListener('click', () => setTimeout(applyOrder, 0));
  }
});
