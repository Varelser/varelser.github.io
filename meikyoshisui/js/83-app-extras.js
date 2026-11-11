/* 83-app-extras.js — キーボードショートカットと PWA (2026-11-11)
   · ショートカット: 入力欄にフォーカスがある時と修飾キー併用時は無効。
     Space 再生/一時停止 · G 生成 · M MIDI保存 · 1/2/3 ビュー切替 ·
     H ヒント表示切替 · ? このヘルプ
   · PWA: Service Worker (sw.js) を登録する。https または localhost でのみ
     動作し、それ以外では何もしない。キャッシュの版は sw.js 側で管理。 */
(() => {
  'use strict';

  function findButtonByText(text) {
    return [...document.querySelectorAll('button')].find(b => b.textContent.trim() === text || b.textContent.trim().startsWith(text)) || null;
  }
  function clickId(id) { const el = document.getElementById(id); if (el) { el.click(); return true; } return false; }

  const ACTIONS = {
    ' ': () => clickId('prevPlay'),
    'g': () => clickId('btnGen'),
    'm': () => clickId('btnDl'),
    '1': () => { const b = findButtonByText('生成'); if (b) b.click(); },
    '2': () => { const b = findButtonByText('レイヤー'); if (b) b.click(); },
    '3': () => { const b = findButtonByText('実験室'); if (b) b.click(); },
    'h': () => { if (!clickId('uiShowTips')) { const b = findButtonByText('ヒント'); if (b) b.click(); } },
    '?': () => toggleHelp(),
  };

  function toggleHelp() {
    let ov = document.getElementById('shortcutHelp');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'shortcutHelp';
      ov.style.cssText = 'position:fixed;right:16px;bottom:64px;z-index:9999;background:#131316;border:1px solid #333;border-radius:8px;padding:14px 16px;font-size:11px;line-height:2;color:#e8e8e8;box-shadow:0 8px 30px rgba(0,0,0,.5)';
      ov.innerHTML = '<b>キーボードショートカット</b><br>'
        + 'Space — プレビュー再生 / 一時停止<br>'
        + 'G — 生成 (GENERATE)<br>'
        + 'M — MIDI保存<br>'
        + '1 / 2 / 3 — ビュー切替 (生成 / レイヤー / 実験室)<br>'
        + 'H — ヒント表示の ON / OFF<br>'
        + '? — このヘルプ<br>'
        + '<span style="color:#888">入力欄にフォーカスがある間は無効です</span>';
      document.body.appendChild(ov);
    }
    ov.style.display = ov.style.display === 'none' ? '' : 'none';
  }

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    const key = e.key === ' ' ? ' ' : e.key.toLowerCase();
    const act = ACTIONS[key];
    if (act) { e.preventDefault(); act(); }
  });

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  // ==== 起動時自己診断 (2026-11-11) ====
  // 必須の土台が欠けたら無言で壊れず、画面上部に理由を表示する。
  // REQUIRED_GLOBALS は scripts/audit_static.mjs が定義の実在まで照合する。
  const REQUIRED_GLOBALS = ['S', 'doGenerate', 'StatePersist', 'MidiPreview', '__MEIKY_PATCH__', 'parseChord'];
  const REQUIRED_CHECKS = [
    ['状態 (S)', () => typeof S !== 'undefined'],
    ['生成 (doGenerate)', () => typeof doGenerate === 'function'],
    ['保存 (StatePersist)', () => typeof StatePersist !== 'undefined'],
    ['プレビュー (MidiPreview)', () => typeof MidiPreview !== 'undefined'],
    ['拡張基盤 (__MEIKY_PATCH__)', () => !!window.__MEIKY_PATCH__],
    ['コード解析 (parseChord)', () => typeof parseChord === 'function']
  ];
  const OPTIONAL_CHECKS = [
    ['Theory Pack', () => typeof TheoryPack !== 'undefined'],
    ['進行サジェスト', () => typeof ProgSuggest !== 'undefined'],
    ['DAW Link', () => !!window.__MEIKY_DAW__],
    ['AI / Bridge', () => !!document.getElementById('aiBridgeSec')]
  ];
  function diagnose() {
    const old = document.getElementById('meikyDiag'); if (old) old.remove();
    const missingRequired = REQUIRED_CHECKS.filter(([, fn]) => { try { return !fn(); } catch (e) { return true; } }).map(([label]) => label);
    const missingOptional = OPTIONAL_CHECKS.filter(([, fn]) => { try { return !fn(); } catch (e) { return true; } }).map(([label]) => label);
    if (missingRequired.length || missingOptional.length) {
      const bar = document.createElement('div');
      bar.id = 'meikyDiag';
      const severe = missingRequired.length > 0;
      bar.style.cssText = 'position:sticky;top:0;z-index:9999;padding:8px 12px;font-size:12px;line-height:1.6;color:#fff;background:' + (severe ? '#7f1d1d' : '#713f12') + ';';
      bar.textContent = (severe
        ? '読み込み不完全: ' + missingRequired.join(' / ') + ' が見つかりません。ファイルの欠落や読み込み順を確認してください。'
        : '一部の追加機能が無効です: ' + missingOptional.join(' / '));
      const close = document.createElement('button');
      close.textContent = '×';
      close.style.cssText = 'float:right;background:none;border:1px solid #fff;color:#fff;cursor:pointer;padding:0 8px;';
      close.addEventListener('click', () => bar.remove());
      bar.appendChild(close);
      document.body.insertBefore(bar, document.body.firstChild);
      console.error('[MEIKYOSHISUI] self-diagnosis', { missingRequired, missingOptional });
    }
    return { missingRequired, missingOptional };
  }
  // 79/80 などは DOMContentLoaded で初期化するので、診断はその後に行う
  let DIAG = { missingRequired: [], missingOptional: [] };
  function runDiagnose() { DIAG = diagnose(); if (window.__MEIKY_APP__) window.__MEIKY_APP__.DIAG = DIAG; }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runDiagnose);
  else runDiagnose();

  window.__MEIKY_APP__ = { toggleHelp, diagnose, DIAG, REQUIRED_GLOBALS };
})();
