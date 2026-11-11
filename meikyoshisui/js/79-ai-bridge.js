/* 79-ai-bridge.js — AI API / ブラウザ / VM 連携 (2026-11-11)
   · AI API: OpenAI / Anthropic / Ollama / OpenAI互換カスタムへ直接、
     または VM ブリッジ (scripts/vm-bridge.mjs) 経由で接続する。
     AI の返答は JSON として検証してから、コード進行とパラメータにだけ適用する。
   · VM: ブリッジへ生成 MIDI と状態 JSON を保存し、受信一覧を確認できる。
   · ブラウザ: 状態を URL ハッシュに埋めた共有リンク、.scl / 状態 JSON の
     ドラッグ&ドロップ取り込みに対応する。
   API キーはこのブラウザの localStorage にのみ保存され、状態スナップショットや
   共有リンクには含まれない。生成ロジックには一切触れない。 */
(() => {
  'use strict';

  const SET_KEY = 'meikyoshisui_ai_bridge_v1';
  const KEY_KEY = 'meikyoshisui_ai_key';
  const DEFAULTS = { mode: 'bridge', provider: 'openai', model: '', customUrl: '', bridgeUrl: 'http://127.0.0.1:8766', bridgeToken: '' };
  let cfg = { ...DEFAULTS };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(SET_KEY) || '{}')); } catch (_) {}
  let apiKey = '';
  try { apiKey = localStorage.getItem(KEY_KEY) || ''; } catch (_) {}
  const saveCfg = () => { try { localStorage.setItem(SET_KEY, JSON.stringify(cfg)); } catch (_) {} };

  const $ = id => document.getElementById(id);
  function status(msg, ok) {
    const el = $('abStatus');
    if (el) { el.textContent = msg; el.style.color = ok === false ? '#f87171' : ''; }
    if (typeof log === 'function') { try { log('// AI/BRIDGE: ' + msg, ok === false ? 'err' : 'ok'); } catch (_) {} }
  }

  /* ── AI 呼び出し ── */
  async function chat(system, user) {
    const model = cfg.model.trim();
    if (cfg.mode === 'bridge') {
      const r = await fetch(cfg.bridgeUrl.replace(/\/$/, '') + '/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(cfg.bridgeToken ? { 'X-Bridge-Token': cfg.bridgeToken } : {}) },
        body: JSON.stringify({ provider: cfg.provider, model: model || undefined, prompt: user, system }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || ('bridge HTTP ' + r.status));
      return j.text || '';
    }
    if (cfg.provider === 'openai' || cfg.provider === 'custom') {
      const url = cfg.provider === 'custom' ? cfg.customUrl.trim() : 'https://api.openai.com/v1/chat/completions';
      if (!url) throw new Error('カスタムURLが未設定です');
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: 'Bearer ' + apiKey } : {}) },
        body: JSON.stringify({ model: model || 'gpt-4o-mini', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.7 }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status));
      return j.choices?.[0]?.message?.content || j.text || '';
    }
    if (cfg.provider === 'anthropic') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: model || 'claude-sonnet-4-5', max_tokens: 1024, system, messages: [{ role: 'user', content: user }] }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status));
      return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    }
    // ollama
    const base = (cfg.customUrl.trim() || 'http://127.0.0.1:11434').replace(/\/$/, '');
    const r = await fetch(base + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: model || 'llama3.1', stream: false, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error('Ollama HTTP ' + r.status);
    return j.message?.content || '';
  }

  function extractJson(text) {
    const a = text.indexOf('{'), b = text.lastIndexOf('}');
    if (a < 0 || b <= a) throw new Error('AIの返答に JSON が見つかりませんでした');
    return JSON.parse(text.slice(a, b + 1));
  }
  function contextText() {
    const parts = [];
    const inp = $('chordInput');
    if (inp && inp.value) parts.push('現在のコード入力: ' + inp.value);
    if (typeof S !== 'undefined' && S) {
      if (S.scale) parts.push('現在のスケール: ' + S.scale);
      if (S.genre) parts.push('ジャンル: ' + S.genre);
    }
    if (typeof PROG_STATE !== 'undefined' && PROG_STATE.prog && PROG_STATE.prog.length) {
      parts.push('現在の進行: ' + PROG_STATE.prog.map(e => e.chord ? e.chord.rootName + (e.chord.quality || '') : '?').join(' → '));
    }
    return parts.join(' / ') || 'なし';
  }

  /* ── AI 返答の適用 (検証してから触る) ── */
  function applyProgression(data) {
    const list = Array.isArray(data.progression) ? data.progression : (Array.isArray(data.chords) ? data.chords.map(c => ({ chord: c })) : null);
    if (!list || !list.length) throw new Error('返答に progression がありません');
    const entries = [];
    for (const item of list) {
      const name = typeof item === 'string' ? item : item.chord;
      const chord = typeof parseChord === 'function' ? parseChord(String(name || '')) : null;
      if (!chord) throw new Error('解釈できないコード名: ' + name);
      const bars = Math.max(1, Math.min(16, parseInt(item.bars, 10) || 4));
      entries.push({ chord, bars });
    }
    PROG_STATE.prog = entries;
    PROG_STATE.enabled = true;
    if (typeof window.__cpRenderSlots === 'function') window.__cpRenderSlots();
    return entries.map(e => e.chord.rootName + (e.chord.quality || '')).join(' → ');
  }
  function applyParams(data) {
    const params = data.params || data.parameters || null;
    if (!params || typeof params !== 'object') throw new Error('返答に params がありません');
    let applied = 0; const names = [];
    for (const [id, value] of Object.entries(params)) {
      const el = document.getElementById(id);
      if (!el || el.type !== 'range') continue;
      const min = parseFloat(el.min || '0'), max = parseFloat(el.max || '100');
      const v = Math.max(min, Math.min(max, Number(value)));
      if (!Number.isFinite(v)) continue;
      el.value = String(v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      applied++; names.push(id + '=' + v);
    }
    if (!applied) throw new Error('適用できるパラメータがありませんでした');
    return names.join(', ');
  }

  async function aiProgression() {
    const wish = ($('abPrompt').value || '').trim() || '穏やかなアンビエント進行';
    status('AIに進行を問い合わせ中…');
    const system = 'あなたは作曲支援AIです。必ずJSONだけを返してください。形式: {"progression":[{"chord":"Dm7","bars":4},{"chord":"G7","bars":4}]} chord は MEIKYOSHISUI の parseChord で解釈できるコード名 (例: Cmaj7, Am7, Fmaj7, G7, Dm7b5)。4〜8コード、各1〜16小節。説明文は付けないこと。';
    const text = await chat(system, '要望: ' + wish + '\n参考情報: ' + contextText());
    const applied = applyProgression(extractJson(text));
    status('AI進行を適用しました: ' + applied);
  }
  async function aiParams() {
    const wish = ($('abPrompt').value || '').trim() || '穏やかで浮遊感のある設定';
    status('AIにパラメータを問い合わせ中…');
    const ids = [...document.querySelectorAll('input[type=range][id]')].slice(0, 60).map(el => el.id + ' (' + (el.min || 0) + '..' + (el.max || 100) + ', 現在 ' + el.value + ')').join(', ');
    const system = 'あなたはシンセ設定支援AIです。必ずJSONだけを返してください。形式: {"params":{"density":40,"velocity":60}} キーは提示されたスライダーidのみ、値はその範囲内。説明文は付けないこと。';
    const text = await chat(system, '要望: ' + wish + '\n参考情報: ' + contextText() + '\nスライダー一覧: ' + ids);
    const applied = applyParams(extractJson(text));
    status('AIパラメータを適用しました: ' + applied);
  }

  /* ── VM ブリッジ ── */
  const bridgeHeaders = () => ({ 'Content-Type': 'application/json', ...(cfg.bridgeToken ? { 'X-Bridge-Token': cfg.bridgeToken } : {}) });
  async function bridgeHealth() {
    const r = await fetch(cfg.bridgeUrl.replace(/\/$/, '') + '/health', { headers: bridgeHeaders() });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(j.error || ('HTTP ' + r.status));
    return j;
  }
  function bytesToBase64(bytes) {
    let bin = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return btoa(bin);
  }
  async function saveMidiToVM() {
    if (typeof S === 'undefined' || !S.midiData) throw new Error('先に GENERATE してください');
    const r = await fetch(cfg.bridgeUrl.replace(/\/$/, '') + '/save-midi', {
      method: 'POST', headers: bridgeHeaders(),
      body: JSON.stringify({ name: 'meiky', dataBase64: bytesToBase64(new Uint8Array(S.midiData)) }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
    status('VMに保存しました: ' + j.saved);
  }
  async function saveStateToVM() {
    if (typeof StatePersist === 'undefined') throw new Error('StatePersist がありません');
    StatePersist.save('__bridge__', 'Bridge');
    const raw = localStorage.getItem('meikyoshisui_v25___bridge__');
    if (!raw) throw new Error('状態の取得に失敗しました');
    const r = await fetch(cfg.bridgeUrl.replace(/\/$/, '') + '/save-state', {
      method: 'POST', headers: bridgeHeaders(),
      body: JSON.stringify({ name: 'state', state: JSON.parse(raw) }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
    status('VMに状態を保存しました: ' + j.saved);
  }
  async function listVMFiles() {
    const r = await fetch(cfg.bridgeUrl.replace(/\/$/, '') + '/files', { headers: bridgeHeaders() });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
    const el = $('abFiles');
    if (el) el.textContent = (j.files || []).slice(0, 12).map(f => f.name + ' (' + f.size + ' B)').join('\n') || '(なし)';
    status('VMの受信フォルダ: ' + (j.files || []).length + ' 件');
  }

  /* ── ブラウザ連携: 共有リンク / ドロップ取り込み ── */
  function b64urlEncode(text) {
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64urlDecode(s) {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  async function copyShareLink() {
    StatePersist.save('__share__', 'Share');
    const raw = localStorage.getItem('meikyoshisui_v25___share__');
    if (!raw) throw new Error('状態の取得に失敗しました');
    const url = location.origin + location.pathname + '#s=' + b64urlEncode(raw);
    try { await navigator.clipboard.writeText(url); status('共有リンクをコピーしました (' + url.length + ' 文字)'); }
    catch (_) { const u = $('abShareUrl'); if (u) { u.value = url; u.style.display = 'block'; u.focus(); u.select(); } status('自動コピーできませんでした。下の欄のリンクをコピーしてください', false); }
  }
  function applySharedFromHash() {
    if (!location.hash.startsWith('#s=')) return;
    try {
      const raw = b64urlDecode(location.hash.slice(3));
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 25) return;
      localStorage.setItem('meikyoshisui_v25___shared__', raw);
      setTimeout(() => {
        if (typeof StatePersist !== 'undefined' && StatePersist.load('__shared__')) status('共有リンクから状態を読み込みました');
      }, 1200);
    } catch (_) { /* 壊れたリンクは無視 */ }
  }
  function setupDrop() {
    const overlay = document.createElement('div');
    overlay.id = 'abDropOverlay';
    overlay.textContent = 'ドロップで取り込み (.scl / 状態JSON)';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;display:none;align-items:center;justify-content:center;background:rgba(10,10,12,.85);color:#e8e8e8;font-size:14px;letter-spacing:2px;pointer-events:none;';
    document.body.appendChild(overlay);
    let depth = 0;
    document.addEventListener('dragenter', e => { e.preventDefault(); depth++; overlay.style.display = 'flex'; });
    document.addEventListener('dragleave', () => { if (--depth <= 0) { depth = 0; overlay.style.display = 'none'; } });
    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', async e => {
      e.preventDefault(); depth = 0; overlay.style.display = 'none';
      for (const file of e.dataTransfer.files || []) {
        try {
          const text = await file.text();
          if (/\.scl$/i.test(file.name)) {
            const P = window.__MEIKY_PATCH__;
            if (P && P.importScalaProfile) {
              if (P.importScalaProfile(text, null, file.name)) status('Scalaを取り込みました: ' + file.name);
              else status('Scalaの取り込みに失敗しました (形式を確認してください): ' + file.name, false);
            }
            else status('Scala取り込み先が見つかりません', false);
          } else if (/\.json$/i.test(file.name)) {
            const parsed = JSON.parse(text);
            if (parsed && parsed.version === 25 && parsed.s) {
              localStorage.setItem('meikyoshisui_v25___dropped__', text);
              if (StatePersist.load('__dropped__')) status('状態JSONを取り込みました: ' + file.name);
            } else if (parsed && Array.isArray(parsed.slots)) {
              parsed.slots.forEach(s => { if (s.name && s.data) localStorage.setItem('meikyoshisui_v25_' + s.name, JSON.stringify(s.data)); });
              status('プリセットJSONを取り込みました (' + parsed.slots.length + ' 件、スロットから読み込めます)');
            } else status('未対応のJSON形式です: ' + file.name, false);
          } else status('未対応のファイルです: ' + file.name, false);
        } catch (err) { status('取り込み失敗: ' + err.message, false); }
      }
    });
  }

  /* ── パネル構築 ── */
  function init() {
    if (!document.getElementById('abStyle')) {
      const st = document.createElement('style');
      st.id = 'abStyle';
      st.textContent = '.ab-head{font-size:11px;font-weight:700;letter-spacing:3px;margin:26px 0 10px;text-transform:uppercase}'
        + '.ab-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}'
        + '.ab-in{background:var(--panel2,#1a1a1f);color:var(--text,#e8e8e8);border:1px solid var(--border,#333);border-radius:4px;font-size:11px;padding:5px 7px}'
        + '.aib-btn{flex:none;background:transparent;color:var(--text,#e8e8e8);border:1px solid var(--border,#444);border-radius:6px;font-size:11px;padding:6px 10px;cursor:pointer}'
        + '.aib-btn:hover{border-color:#888}'
        + '.ab-note{font-size:10px;color:var(--text-dim,#888);line-height:1.6}'
        + '#abStatus{font-size:11px;margin-top:8px;white-space:pre-wrap}'
        + '#abShareUrl{width:100%;margin-top:6px}'
        + '#abFiles{font-size:10px;color:var(--text-dim,#888);white-space:pre-wrap;margin-top:4px}';
      document.head.appendChild(st);
    }
    const sec = document.createElement('div');
    sec.id = 'aiBridgeSec';
    sec.innerHTML = `
      <div class="ab-head">AI / Bridge <span class="badge">LINK</span></div>
      <div class="ab-row">
        <select id="abMode" class="ab-in"><option value="bridge">VMブリッジ経由</option><option value="direct">ブラウザから直接</option></select>
        <select id="abProvider" class="ab-in"><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="ollama">Ollama (local)</option><option value="custom">カスタム互換</option></select>
        <input id="abModel" class="ab-in" size="18" placeholder="モデル名 (空=既定)">
        <input id="abKey" class="ab-in" type="password" size="18" placeholder="APIキー (直接接続時)">
      </div>
      <div class="ab-row">
        <input id="abBridgeUrl" class="ab-in" size="26" placeholder="ブリッジURL">
        <input id="abBridgeToken" class="ab-in" type="password" size="12" placeholder="ブリッジトークン (任意)">
        <input id="abCustomUrl" class="ab-in" size="26" placeholder="カスタム/Ollama URL (任意)">
      </div>
      <div class="ab-row">
        <input id="abPrompt" class="ab-in" size="52" placeholder="AIへの要望 (例: 雨の夜のドローン、短調で不穏に)">
        <button class="aib-btn" id="abBtnProg" type="button">AIに進行を作らせる</button>
        <button class="aib-btn" id="abBtnParams" type="button">AIにパラメータ提案</button>
      </div>
      <div class="ab-row">
        <button class="aib-btn" id="abBtnHealth" type="button">ブリッジ接続テスト</button>
        <button class="aib-btn" id="abBtnSaveMidi" type="button">生成MIDIをVMへ保存</button>
        <button class="aib-btn" id="abBtnSaveState" type="button">状態をVMへ保存</button>
        <button class="aib-btn" id="abBtnFiles" type="button">VMのファイル一覧</button>
        <button class="aib-btn" id="abBtnShare" type="button">共有リンクをコピー</button>
      </div>
      <div class="ab-note">AIキーはこのブラウザ内にのみ保存され、共有リンクや状態には含まれません。VMブリッジ経由ではキーは VM の環境変数に置けます (docs/BRIDGE.md)。 .scl / 状態JSON はこの画面へドラッグ&ドロップでも取り込めます。</div>
      <div id="abStatus"></div><input id="abShareUrl" class="ab-in" readonly style="display:none" placeholder="共有リンク"><div id="abFiles"></div>`;
    const anchor = $('theoryPackSec');
    if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(sec, anchor.nextSibling);
    else document.body.appendChild(sec);

    const bind = (id, key, isCfg) => { const el = $(id); if (!el) return; el.value = isCfg ? (cfg[key] || '') : el.value; el.addEventListener('change', () => { if (isCfg) { cfg[key] = el.value; saveCfg(); } }); };
    $('abMode').value = cfg.mode; $('abMode').addEventListener('change', e => { cfg.mode = e.target.value; saveCfg(); });
    $('abProvider').value = cfg.provider; $('abProvider').addEventListener('change', e => { cfg.provider = e.target.value; saveCfg(); });
    bind('abModel', 'model', true); bind('abCustomUrl', 'customUrl', true); bind('abBridgeUrl', 'bridgeUrl', true); bind('abBridgeToken', 'bridgeToken', true);
    $('abBridgeUrl').value = cfg.bridgeUrl; $('abBridgeToken').value = cfg.bridgeToken || '';
    $('abKey').value = apiKey;
    $('abKey').addEventListener('change', e => { apiKey = e.target.value; try { localStorage.setItem(KEY_KEY, apiKey); } catch (_) {} });

    const guard = fn => async () => { try { await fn(); } catch (e) { status('失敗: ' + (e && e.message || e), false); } };
    $('abBtnProg').addEventListener('click', guard(aiProgression));
    $('abBtnParams').addEventListener('click', guard(aiParams));
    $('abBtnHealth').addEventListener('click', guard(async () => { const h = await bridgeHealth(); status('ブリッジ接続OK — AI: OpenAI ' + (h.ai.openai ? '可' : '不可') + ' / Anthropic ' + (h.ai.anthropic ? '可' : '不可') + ' / 受信先: ' + h.inbox); }));
    $('abBtnSaveMidi').addEventListener('click', guard(saveMidiToVM));
    $('abBtnSaveState').addEventListener('click', guard(saveStateToVM));
    $('abBtnFiles').addEventListener('click', guard(listVMFiles));
    $('abBtnShare').addEventListener('click', guard(copyShareLink));
    $('abShareUrl').addEventListener('click', e => e.target.select());

    setupDrop();
    applySharedFromHash();
    window.__MEIKY_BRIDGE__ = { chat, applyProgression, applyParams, bridgeHealth, saveMidiToVM, saveStateToVM, get config() { return cfg; } };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
