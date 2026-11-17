/* ═══════════════════════════════════════════════════════════════
   v7.0: 表現拡張 第1弾 (Expression Expansion Pack 1) — UI 層
   ───────────────────────────────────────────────────────────────
   新規トップレベルパネルは作らず、既存パネルの内部へコントロールを
   構築する:
     · スウィング＆グルーヴ      → Humanizer パネル (humControls の後段)
     · Markov モード/コーパス    → Markov パネル (markovControls 内)
     · レイヤー別 Activity/Register + 声部連結スムーズネス
                                 → Layers パネル (layerToggles の後段)
     · アボイド/テンション重み   → Synthesis Parameters パネル
     · セクション境界フィル      → Macro パネル (macroControls 内)
   状態は S (groove/layerFx/avoidWeight/sectionFill/vlSmooth) と
   MarkovEngine.STATE (mode/corpusUse) が持ち、StatePersist の
   extractS / markov 経路で保存・復元される。復元時の表示同期は
   window.__MEIKY_V7_SYNC__ を js/29 の _refreshUI から呼ぶ。
   全機能の既定は OFF / 中立で、生成結果は v6.3 と一致する。
   ═══════════════════════════════════════════════════════════════ */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const LAYERS = [['drone','Drone'],['pad','Pad'],['arp','Arp'],['melody','Melody'],['bass','Bass'],['overtone','Overtone'],['texture','Texture'],['lead','Lead'],['markov','Markov']];
const PROFILES = [['swing8','Swing 8'],['shuffle','Shuffle'],['swing16','Swing 16'],['laidback','Laid-back'],['push','Push']];
let curLayer = 'pad';

function secLabel(text) {
  const d = document.createElement('div');
  d.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--text-dim);letter-spacing:3px;margin:14px 0 6px;";
  d.textContent = text;
  return d;
}
function mkSlider(id, min, max, step) {
  const s = document.createElement('input');
  s.type = 'range'; s.className = 'slider'; s.id = id;
  s.min = min; s.max = max; if (step) s.step = step;
  return s;
}
function mkVal(id) { const v = document.createElement('span'); v.className = 'pval'; v.id = id; return v; }
function paramRow(label, slider, valEl) {
  const r = document.createElement('div'); r.className = 'param-row';
  const l = document.createElement('span'); l.className = 'param-label'; l.textContent = label;
  r.appendChild(l); r.appendChild(slider); r.appendChild(valEl);
  return r;
}
function mkTog(id) { const t = document.createElement('div'); t.className = 'tog'; t.id = id; return t; }
function togRow(name, desc, tog) {
  const r = document.createElement('div'); r.className = 'tog-row';
  r.style.cssText = 'margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:10px;';
  const info = document.createElement('div'); info.className = 'tog-info';
  const n = document.createElement('div'); n.className = 'tog-name'; n.style.cssText = 'font-size:11px;'; n.textContent = name;
  const d = document.createElement('div'); d.className = 'tog-desc'; d.textContent = desc;
  info.appendChild(n); info.appendChild(d);
  r.appendChild(info); r.appendChild(tog);
  return r;
}
function noteLine(text) {
  const d = document.createElement('div'); d.className = 'tog-desc'; d.textContent = text; return d;
}

/* ── 1. スウィング＆グルーヴ (Humanizer パネル) ── */
function buildGroove() {
  const hum = $('humControls');
  if (!hum || $('v7GrooveTog')) return;
  const wrap = document.createElement('div'); wrap.id = 'v7GrooveSec';
  const tog = mkTog('v7GrooveTog');
  wrap.appendChild(togRow('Swing & Groove', '生成ノートへスウィング / シャッフル等のマイクロタイミングを適用 (v7)', tog));
  const body = document.createElement('div'); body.id = 'v7GrooveBody'; body.style.display = 'none';
  body.appendChild(secLabel('GROOVE PROFILE'));
  const grp = document.createElement('div'); grp.className = 'hum-mode-group'; grp.id = 'v7GrooveProfiles';
  PROFILES.forEach(([k, l]) => {
    const b = document.createElement('button');
    b.className = 'hum-mode-btn'; b.dataset.profile = k; b.textContent = l;
    b.addEventListener('click', () => { S.groove.profile = k; sync(); });
    grp.appendChild(b);
  });
  body.appendChild(grp);
  const sl = mkSlider('v7GrooveAmt', 0, 100), vl = mkVal('v7GrooveAmtV');
  sl.addEventListener('input', () => { S.groove.amount = parseInt(sl.value); vl.textContent = sl.value + '%'; });
  body.appendChild(paramRow('Amount', sl, vl));
  wrap.appendChild(body);
  tog.addEventListener('click', () => { S.groove.enabled = !S.groove.enabled; sync(); });
  hum.parentElement.appendChild(wrap);
}

/* ── 3+4. Markov モード / コーパス (Markov パネル) ── */
function buildMarkov() {
  const mc = $('markovControls');
  if (!mc || $('v7MkvModeGrp')) return;
  const wrap = document.createElement('div'); wrap.id = 'v7MkvSec';
  wrap.appendChild(secLabel('MARKOV MODE — v7'));
  const grp = document.createElement('div'); grp.className = 'mkv-bias-group'; grp.id = 'v7MkvModeGrp';
  [['order1', '1次 (従来)'], ['order2', '2次'], ['chord', 'コード条件付き']].forEach(([k, l]) => {
    const b = document.createElement('button');
    b.className = 'mkv-bias-btn'; b.dataset.mode = k; b.textContent = l;
    b.addEventListener('click', () => { MarkovEngine.STATE.mode = k; sync(); });
    grp.appendChild(b);
  });
  wrap.appendChild(grp);
  wrap.appendChild(secLabel('CORPUS — ドロップした .mid から学習'));
  const tog = mkTog('v7CorpusTog');
  wrap.appendChild(togRow('Use Learned Corpus', '学習済みコーパスの遷移行列で生成する', tog));
  tog.addEventListener('click', () => { MarkovEngine.STATE.corpusUse = !MarkovEngine.STATE.corpusUse; sync(); });
  const st = document.createElement('div'); st.id = 'v7CorpusStatus'; st.className = 'mkv-info'; st.textContent = '—';
  wrap.appendChild(st);
  const clr = document.createElement('button');
  clr.className = 'ep-btn'; clr.id = 'v7CorpusClear'; clr.textContent = 'コーパスを消去';
  clr.addEventListener('click', () => { MarkovEngine.clearCorpus(); MarkovEngine.STATE.corpusUse = false; sync(); });
  wrap.appendChild(clr);
  mc.appendChild(wrap);
}

/* ── 2+7. レイヤー別 Activity/Register + 声部連結 (Layers パネル) ── */
function buildLayerFx() {
  const lt = $('layerToggles');
  if (!lt || $('v7LfxSec')) return;
  const panel = lt.closest('.panel'); if (!panel) return;
  const wrap = document.createElement('div'); wrap.id = 'v7LfxSec';
  wrap.appendChild(secLabel('LAYER ACTIVITY & REGISTER — v7'));
  const sel = document.createElement('div');
  sel.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;';
  sel.id = 'v7LfxLayers';
  LAYERS.forEach(([k, l]) => {
    const b = document.createElement('button');
    b.className = 'ep-btn'; b.dataset.layer = k; b.textContent = l;
    b.addEventListener('click', () => { curLayer = k; sync(); });
    sel.appendChild(b);
  });
  wrap.appendChild(sel);
  const dS = mkSlider('v7LfxD', 20, 200), dV = mkVal('v7LfxDV');
  const vS = mkSlider('v7LfxV', 10, 200), vV = mkVal('v7LfxVV');
  const oS = mkSlider('v7LfxO', -2, 2, 1), oV = mkVal('v7LfxOV');
  dS.addEventListener('input', () => { S.layerFx[curLayer].d = parseInt(dS.value) / 100; dV.textContent = dS.value + '%'; markLayerBtns(); });
  vS.addEventListener('input', () => { S.layerFx[curLayer].v = parseInt(vS.value) / 100; vV.textContent = vS.value + '%'; markLayerBtns(); });
  oS.addEventListener('input', () => { S.layerFx[curLayer].o = parseInt(oS.value); oV.textContent = (oS.value > 0 ? '+' : '') + oS.value + ' oct'; markLayerBtns(); });
  wrap.appendChild(paramRow('Density', dS, dV));
  wrap.appendChild(paramRow('Velocity', vS, vV));
  wrap.appendChild(paramRow('Octave', oS, oV));
  const rst = document.createElement('button');
  rst.className = 'ep-btn'; rst.id = 'v7LfxReset'; rst.textContent = '全レイヤーを既定に戻す';
  rst.addEventListener('click', () => { for (const k in S.layerFx) S.layerFx[k] = { d: 1, v: 1, o: 0 }; sync(); });
  wrap.appendChild(rst);
  wrap.appendChild(secLabel('VOICE-LEADING SMOOTHNESS — v7'));
  const sS = mkSlider('v7VlSmooth', 0, 100), sV = mkVal('v7VlSmoothV');
  sS.addEventListener('input', () => {
    S.vlSmooth = parseInt(sS.value); sV.textContent = sS.value;
    if (typeof VLEngine !== 'undefined' && VLEngine.invalidateCache) VLEngine.invalidateCache();
  });
  wrap.appendChild(paramRow('Smoothness', sS, sV));
  wrap.appendChild(noteLine('50 = 従来の声部連結。上げると滑らかに、下げると跳躍を許す (Pad / 進行ボイシング)'));
  panel.appendChild(wrap);
}
function markLayerBtns() {
  const lg = $('v7LfxLayers'); if (!lg || typeof S === 'undefined' || !S.layerFx) return;
  lg.querySelectorAll('button').forEach(b => {
    const fx = S.layerFx[b.dataset.layer];
    const mod = fx && (fx.d !== 1 || fx.v !== 1 || fx.o !== 0);
    const lbl = LAYERS.find(x => x[0] === b.dataset.layer);
    b.textContent = (lbl ? lbl[1] : b.dataset.layer) + (mod ? ' •' : '');
    b.classList.toggle('on', b.dataset.layer === curLayer);
  });
}

/* ── 5. アボイド/テンション重み (Synthesis Parameters パネル) ── */
function buildAvoid() {
  const den = $('density');
  if (!den || $('v7Avoid')) return;
  const panel = den.closest('.panel'); if (!panel) return;
  const wrap = document.createElement('div'); wrap.id = 'v7AvoidSec';
  wrap.style.cssText = 'margin-top:14px;padding-top:14px;border-top:1px solid var(--border);';
  const head = document.createElement('div');
  head.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:8px;color:#aaa;letter-spacing:3px;margin-bottom:10px;";
  head.textContent = 'AVOID / TENSION WEIGHT — v7';
  wrap.appendChild(head);
  const sl = mkSlider('v7Avoid', 0, 100), vl = mkVal('v7AvoidV');
  sl.addEventListener('input', () => { S.avoidWeight = parseInt(sl.value); vl.textContent = sl.value + '%'; });
  wrap.appendChild(paramRow('Avoid Weight', sl, vl));
  wrap.appendChild(noteLine('アボイド音 (長3度コード上の4度・コードに無い♭9) を避け、コードトーン/テンションへ寄せる (Melody / Arp / Lead)'));
  panel.appendChild(wrap);
}

/* ── 6. セクション境界フィル (Macro パネル) ── */
function buildFill() {
  const mc = $('macroControls');
  if (!mc || $('v7FillTog')) return;
  const tog = mkTog('v7FillTog');
  const row = togRow('Section Boundary Fill', 'セクション境界の直前にフィル (上行ジェスチャ) を挿入 (v7)', tog);
  row.id = 'v7FillRow';
  tog.addEventListener('click', () => { S.sectionFill = !S.sectionFill; sync(); });
  mc.appendChild(row);
}

/* ── 表示同期 (初期表示 + StatePersist 復元時に js/29 から呼ばれる) ── */
function sync() {
  if (typeof S === 'undefined') return;
  const gt = $('v7GrooveTog');
  if (gt) gt.classList.toggle('on', !!(S.groove && S.groove.enabled));
  const gb = $('v7GrooveBody');
  if (gb) gb.style.display = (S.groove && S.groove.enabled) ? 'block' : 'none';
  if (S.groove) {
    const ga = $('v7GrooveAmt');
    if (ga) { ga.value = S.groove.amount; const v = $('v7GrooveAmtV'); if (v) v.textContent = S.groove.amount + '%'; }
    const gp = $('v7GrooveProfiles');
    if (gp) gp.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.profile === S.groove.profile));
  }
  if (typeof MarkovEngine !== 'undefined') {
    const mg = $('v7MkvModeGrp');
    if (mg) mg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.mode === MarkovEngine.STATE.mode));
    const ct = $('v7CorpusTog');
    if (ct) ct.classList.toggle('on', !!MarkovEngine.STATE.corpusUse);
    const cs = $('v7CorpusStatus');
    if (cs) {
      const c = MarkovEngine.getCorpus ? MarkovEngine.getCorpus() : null;
      cs.textContent = c ? ('LEARNED FROM: ' + c.name + ' (' + c.notes + ' notes)') : 'コーパス未学習 — .mid をページへドロップすると学習します';
    }
  }
  if (S.layerFx && S.layerFx[curLayer]) {
    const f = S.layerFx[curLayer];
    const d = $('v7LfxD'), v = $('v7LfxV'), o = $('v7LfxO');
    if (d) { d.value = Math.round(f.d * 100); const e = $('v7LfxDV'); if (e) e.textContent = Math.round(f.d * 100) + '%'; }
    if (v) { v.value = Math.round(f.v * 100); const e = $('v7LfxVV'); if (e) e.textContent = Math.round(f.v * 100) + '%'; }
    if (o) { o.value = f.o; const e = $('v7LfxOV'); if (e) e.textContent = (f.o > 0 ? '+' : '') + f.o + ' oct'; }
    markLayerBtns();
  }
  const vs = $('v7VlSmooth');
  if (vs) { vs.value = S.vlSmooth; const e = $('v7VlSmoothV'); if (e) e.textContent = S.vlSmooth; }
  const av = $('v7Avoid');
  if (av) { av.value = S.avoidWeight; const e = $('v7AvoidV'); if (e) e.textContent = S.avoidWeight + '%'; }
  const ft = $('v7FillTog');
  if (ft) ft.classList.toggle('on', !!S.sectionFill);
}

function init() {
  try { buildGroove(); } catch (e) { console.error('[v7] groove UI', e); }
  try { buildMarkov(); } catch (e) { console.error('[v7] markov UI', e); }
  try { buildLayerFx(); } catch (e) { console.error('[v7] layerFx UI', e); }
  try { buildAvoid(); } catch (e) { console.error('[v7] avoid UI', e); }
  try { buildFill(); } catch (e) { console.error('[v7] fill UI', e); }
  sync();
  window.__MEIKY_V7_SYNC__ = sync;
  window.__MEIKY_V7__ = { sync };
  /* js/95 の列パッキングは DOMContentLoaded 時点の実測で行われるため、
     本 UI の追加後に一度だけ再配分して高さを取り直す */
  setTimeout(() => {
    try { if (window.__MEIKY_LIEN__ && window.__MEIKY_LIEN__.distribute) window.__MEIKY_LIEN__.distribute(); } catch (e) {}
  }, 150);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
