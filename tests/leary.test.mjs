// Behavioural tests for leary.html (single-file generative art tool).
//
// Runs the page's inline script in Node against a stub DOM and exercises the
// real event handlers: rendering, input clamping, debounced re-rendering,
// auto-protected PNG export, guarded SVG export, settings JSON round-trip,
// and keyboard operation (swirl points and the viewer).
//
// Usage (from the repository root):  node tests/leary.test.mjs
// Exits non-zero if any test fails. No dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] || path.join(here, '..', 'leary.html');
const html = fs.readFileSync(file, 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];

// ---------------------------------------------------------------- stub DOM
const listeners = {};
const els = {};
const createdCanvases = [];
const downloads = [];
const blobsByUrl = new Map();
const confirmCalls = [];
let confirmAnswer = true;

function makeCtx(owner) {
  const rec = { lineWidths: [], drawImages: 0 };
  const target = { canvas: owner, _rec: rec };
  return new Proxy(target, {
    get(t, p) {
      if (p === '_rec') return rec;
      if (p in t) return t[p];
      if (p === 'drawImage') return () => { rec.drawImages++; };
      return () => {};
    },
    set(t, p, v) { t[p] = v; if (p === 'lineWidth') rec.lineWidths.push(v); return true; },
  });
}
function makeEl(id) {
  const el = {
    id, value: '', checked: false, textContent: '',
    style: {}, dataset: {}, files: [], _children: [], _listeners: {}, _html: '',
    classList: { add() {}, remove() {} },
    addEventListener(ev, fn) {
      (listeners[id + ':' + ev] ||= []).push(fn);
      (this._listeners[ev] ||= []).push(fn);
    },
    removeEventListener() {},
    appendChild(c) { this._children.push(c); },
    querySelectorAll() { return this._children.flatMap(c => [c, ...c.querySelectorAll()]); },
    querySelector() { return null; },
    setAttribute() {},
    focus() { if (globalThis.document) globalThis.document.activeElement = this; },
    getBoundingClientRect() { return { width: 1920, height: 1080, left: 0, top: 0 }; },
    getContext() { return this._ctx ||= makeCtx(this); },
    toBlob(cb) { cb(new Blob(['PNGDATA'], { type: 'image/png' })); },
    click() { if (this.download) downloads.push({ name: this.download, blob: blobsByUrl.get(this.href) }); },
  };
  Object.defineProperty(el, 'innerHTML', {
    get() { return this._html; },
    set(v) {
      this._html = v;
      this._children = [];
      if (v && v.includes('data-role')) {
        for (const m of v.matchAll(/<(input|button)\b[^>]*>/g)) {
          const tag = m[0];
          const child = makeEl('ctl_' + Math.random().toString(36).slice(2));
          child.dataset.role = (tag.match(/data-role="([^"]+)"/) || [])[1];
          child.dataset.idx = (tag.match(/data-idx="([^"]+)"/) || [])[1];
          child.value = (tag.match(/value="([^"]*)"/) || [])[1] ?? '';
          child.type = (tag.match(/type="([^"]+)"/) || [])[1] || '';
          this._children.push(child);
        }
      }
    },
  });
  return el;
}
for (const m of html.matchAll(/<input[^>]*>/g)) {
  const tag = m[0];
  const id = (tag.match(/id="([^"]+)"/) || [])[1];
  if (!id) continue;
  const el = makeEl(id);
  el.type = (tag.match(/type="([^"]+)"/) || [])[1] || '';
  el.min = (tag.match(/min="([^"]+)"/) || [])[1] ?? '';
  el.max = (tag.match(/max="([^"]+)"/) || [])[1] ?? '';
  els[id] = el;
}
globalThis.document = {
  activeElement: null,
  getElementById(id) { return els[id] ||= makeEl(id); },
  createElement(tag) {
    const el = makeEl(tag + '_' + Math.random().toString(36).slice(2));
    el.tagName = tag;
    if (tag === 'canvas') createdCanvases.push(el);
    return el;
  },
  querySelectorAll() { return []; },
};
globalThis.window = { addEventListener() {}, removeEventListener() {}, setTimeout, clearTimeout };
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
globalThis.alert = () => {};
globalThis.confirm = (m) => { confirmCalls.push(String(m)); return confirmAnswer; };
globalThis.URL = {
  createObjectURL(b) { const u = 'blob:stub:' + Math.random(); blobsByUrl.set(u, b); return u; },
  revokeObjectURL() {},
};

(0, eval)(script);

// ---------------------------------------------------------------- helpers
const tick = (ms = 25) => new Promise(r => setTimeout(r, ms));
async function waitFor(cond, what, timeout = 120000) {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > timeout) throw new Error('timeout waiting for ' + what);
    await tick(50);
  }
}
function fireOn(el, ev, evObj = {}) {
  const fns = (el._listeners && el._listeners[ev]) || [];
  fns.slice().forEach(f => f({ target: el, currentTarget: el, preventDefault() {}, stopPropagation() {}, ...evObj }));
  return fns.length;
}
function fire(id, ev) { return fireOn(els[id], ev); }
function setInput(id, val) { els[id].value = String(val); fire(id, 'input'); }
async function exportSettings() {
  const mark = downloads.length;
  fire('btnExportSettings', 'click');
  await tick(120);
  const j = downloads.slice(mark).find(d => d.name.endsWith('.json'));
  if (!j) throw new Error('settings JSON not downloaded');
  return JSON.parse(await j.blob.text());
}
const status = () => els.statusRender && els.statusRender.textContent;
const viewInfo = () => {
  const m = String(els.viewInfo.textContent).match(/zoom ([\d.]+) \/ x (-?\d+) \/ y (-?\d+)/);
  return m ? { zoom: Number(m[1]), x: Number(m[2]), y: Number(m[3]) } : null;
};

let passed = 0, failed = 0;
function check(name, cond, detail = '') {
  if (cond) { passed++; console.log(`ok   ${name}`); }
  else { failed++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------------------------------------------------------------- tests
await waitFor(() => status() === '待機', 'initial preview render');
check('initial preview render completes', status() === '待機');

// Numeric inputs are clamped/validated in JS, not only by HTML attributes.
setInput('previewScale', '0.25'); // keep later preview renders cheap
setInput('lineCount', '999999');
check('lineCount clamps to 30000', els.statusCount.textContent === '30000', els.statusCount.textContent);
setInput('lineCount', 'abc');
check('non-numeric lineCount keeps previous value', els.statusCount.textContent === '30000', els.statusCount.textContent);
setInput('lineCount', '900');
await tick(400);
await waitFor(() => status() === '待機', 'render after clamp tests');

// Parameter re-rendering is debounced (~140ms): no composite right after input.
const mainCtxRec = els.canvas.getContext()._rec;
const drawsBefore = mainCtxRec.drawImages;
setInput('turbulence', '20');
await tick(60);
check('debounce: no re-render within 60ms of input', mainCtxRec.drawImages === drawsBefore,
  `${drawsBefore} -> ${mainCtxRec.drawImages}`);
await waitFor(() => mainCtxRec.drawImages > drawsBefore, 'debounced render within 3s', 3000);
check('debounce: re-render happens after the delay', mainCtxRec.drawImages > drawsBefore);
setInput('turbulence', '18');
await tick(400);
await waitFor(() => status() === '待機', 'render after debounce test');

// Auto-protected PNG export: canvas size and geometry scaling agree.
// With auto-protect, exportScale 8 (15360x8640) forces SSAA to 1, so the
// widest stroke must be lineWidthMax(3.8) * 8 * 1 = 30.4, not 45.6 (SSAA 1.5).
{
  const canvasMark = createdCanvases.length;
  const dlMark = downloads.length;
  setInput('exportScale', '8');
  fire('btnExportPng', 'click');
  await waitFor(() => downloads.slice(dlMark).some(d => d.name.endsWith('.png')), 'PNG export at scale 8');
  const png = downloads.slice(dlMark).find(d => d.name.endsWith('.png'));
  let maxLineWidth = 0, fullWidth = 0;
  for (const c of createdCanvases.slice(canvasMark)) {
    if (c.width > fullWidth) fullWidth = c.width;
    if (c._ctx) for (const w of c._ctx._rec.lineWidths) maxLineWidth = Math.max(maxLineWidth, w);
  }
  check('PNG filename carries seed and v6 tag', /_v6_seed123_15360x8640\.png$/.test(png.name), png.name);
  check('PNG work canvas is the protected size', fullWidth === 15360, String(fullWidth));
  check('PNG geometry uses protected SSAA (max lineWidth ~30.4)', maxLineWidth > 25 && maxLineWidth <= 30.5, String(maxLineWidth));
  setInput('exportScale', '2');
  await tick(400);
  await waitFor(() => status() === '待機', 'render after scale reset');
}

// Color selection weight and stroke width factor are independent inputs.
{
  const ctls = els.colors.querySelectorAll();
  const wIn = ctls.find(c => c.dataset.role === 'weight' && c.dataset.idx === '0');
  const widIn = ctls.find(c => c.dataset.role === 'width' && c.dataset.idx === '0');
  check('color row has both weight and width inputs', !!wIn && !!widIn);
  wIn.value = '3'; fireOn(wIn, 'input');
  widIn.value = '2.5'; fireOn(widIn, 'input');
  await tick(300);
  const s = await exportSettings();
  check('weight and width stored independently',
    s.config.colors[0].weight === 3 && s.config.colors[0].width === 2.5, JSON.stringify(s.config.colors[0]));
  // restore defaults for later checks
  wIn.value = '1'; fireOn(wIn, 'input');
  widIn.value = '1'; fireOn(widIn, 'input');
  await tick(300);
}

// SVG export is well-formed, and the size guard blocks when declined.
{
  const dlMark = downloads.length;
  fire('btnExportSvg', 'click');
  await waitFor(() => downloads.slice(dlMark).some(d => d.name.endsWith('.svg')), 'default SVG export');
  const svg = downloads.slice(dlMark).find(d => d.name.endsWith('.svg'));
  const text = await svg.blob.text();
  check('SVG filename carries seed and v6 tag', /_v6_seed123_1920x1080\.svg$/.test(svg.name), svg.name);
  check('SVG is well-formed', text.startsWith('<?xml') && text.trimEnd().endsWith('</svg>'), `${text.length} bytes`);

  setInput('lineCount', '5000');
  await tick(400);
  await waitFor(() => status() === '待機', 'render at 5000 lines');
  confirmAnswer = false;
  const dl2 = downloads.length, cc = confirmCalls.length;
  fire('btnExportSvg', 'click');
  await tick(2500);
  check('SVG guard asks for confirmation on huge output', confirmCalls.length > cc);
  check('SVG guard blocks download when declined', !downloads.slice(dl2).some(d => d.name.endsWith('.svg')));
  confirmAnswer = true;
  fire('btnExportSvg', 'click');
  await waitFor(() => downloads.slice(dl2).some(d => d.name.endsWith('.svg')), 'SVG export after confirming', 180000);
  check('SVG export proceeds when confirmed', true);
  setInput('lineCount', '900');
  await tick(400);
}

// Swirl source points: keyboard operation + focus preservation.
{
  const before = await exportSettings();
  await tick(400);
  const src = els.overlay.querySelectorAll().find(c => c.dataset && c.dataset.id);
  check('source point is focusable', !!src && src.tabIndex === 0);
  src.focus();
  fireOn(src, 'keydown', { key: 'ArrowRight', shiftKey: true });
  fireOn(src, 'keydown', { key: 'ArrowDown', shiftKey: false });
  await tick(250);
  const after = await exportSettings();
  check('arrow keys move the source point (+10, +1)',
    after.swirls[0].x - before.swirls[0].x === 10 && after.swirls[0].y - before.swirls[0].y === 1,
    JSON.stringify({ dx: after.swirls[0].x - before.swirls[0].x, dy: after.swirls[0].y - before.swirls[0].y }));
  check('focus survives overlay rebuild',
    globalThis.document.activeElement && globalThis.document.activeElement.dataset.id === src.dataset.id);
}

// Viewer keyboard operation: arrows pan, + zooms, 0 resets.
{
  fireOn(els.canvas, 'keydown', { key: 'ArrowRight', shiftKey: false });
  await tick(150);
  let v = viewInfo();
  check('viewer ArrowRight pans by 24', v && v.x === -24 && v.zoom === 1, JSON.stringify(v));
  fireOn(els.canvas, 'keydown', { key: '+', shiftKey: false });
  await tick(150);
  v = viewInfo();
  check('viewer + zooms to 1.15', v && Math.abs(v.zoom - 1.15) < 0.005, JSON.stringify(v));
  fireOn(els.canvas, 'keydown', { key: '0', shiftKey: false });
  await tick(150);
  v = viewInfo();
  check('viewer 0 resets the view', v && v.zoom === 1 && v.x === 0 && v.y === 0, JSON.stringify(v));
}

// Seed input + settings JSON round-trip.
{
  els.seedInput.value = '777';
  fire('seedInput', 'change');
  check('seed input applies', els.statusSeed.textContent === '777', els.statusSeed.textContent);
  els.seedInput.value = '123';
  fire('seedInput', 'change');
  check('seed restored to 123', els.statusSeed.textContent === '123', els.statusSeed.textContent);
}

// Old-format settings JSON (colors without width) imports with width:=weight.
{
  const oldJson = JSON.stringify({
    app: 'Leary', version: 1, seed: 42,
    config: { colors: [{ hex: '#ffffff', weight: 0.5 }] },
    swirls: [{ x: 100, y: 200 }],
  });
  els.settingsFile.files = [{ text: async () => oldJson }];
  fire('settingsFile', 'change');
  await tick(600);
  const s = await exportSettings();
  check('old JSON imports (seed, swirl, weight->width fallback)',
    s.seed === 42 && s.config.colors[0].weight === 0.5 && s.config.colors[0].width === 0.5 &&
    s.swirls[0].x === 100 && s.swirls[0].y === 200, JSON.stringify(s.config.colors[0]));
}

// PRNG (extracted from the file): deterministic, uniform, uncorrelated.
{
  const m = script.match(/function seededRandomFactory\(seed\)\{[\s\S]*?\n  \}/);
  const factory = eval(`(${m[0].replace('function seededRandomFactory', 'function')})`);
  const a = factory(123), b = factory(123);
  let same = true;
  for (let i = 0; i < 1000; i++) if (a() !== b()) same = false;
  check('PRNG is deterministic per seed', same);
  const r = factory(123), N = 50000, buckets = new Array(10).fill(0);
  const vals = [];
  let sum = 0;
  for (let i = 0; i < N; i++) { const v = r(); vals.push(v); sum += v; buckets[Math.min(9, Math.floor(v * 10))]++; }
  const mean = sum / N;
  const chi2 = buckets.reduce((acc, x) => acc + (x - N / 10) ** 2 / (N / 10), 0);
  let ln = 0, ld = 0;
  for (let i = 1; i < N; i++) { ln += (vals[i] - mean) * (vals[i - 1] - mean); ld += (vals[i - 1] - mean) ** 2; }
  check('PRNG uniformity (mean, chi-square)', Math.abs(mean - 0.5) < 0.01 && chi2 < 30, `mean ${mean.toFixed(4)}, chi2 ${chi2.toFixed(1)}`);
  check('PRNG lag-1 autocorrelation ~0', Math.abs(ln / ld) < 0.02, (ln / ld).toFixed(4));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
