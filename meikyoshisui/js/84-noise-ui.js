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
});
