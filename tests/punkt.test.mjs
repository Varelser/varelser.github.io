// Punkt test suite — extracts the pure functions from punkt.html and tests them in Node.
// No dependencies. Run: node punkt.test.mjs
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = fs.existsSync(path.join(here, 'punkt.html')) ? path.join(here, 'punkt.html') : path.join(here, '..', 'punkt.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) { console.error('FAIL: no script block found'); process.exit(1); }
const script = scriptMatch[1];

// Extract a top-level function declaration by balanced-brace scanning.
// (The extracted functions contain no unbalanced braces inside strings/templates.)
function extractFn(name) {
  const start = script.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`function not found: ${name}`);
  let i = script.indexOf('{', start);
  let depth = 0;
  for (let j = i; j < script.length; j++) {
    const c = script[j];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return script.slice(start, j + 1); }
  }
  throw new Error(`unbalanced braces in ${name}`);
}

function extractConst(name) {
  const start = script.indexOf(`const ${name} =`);
  if (start < 0) throw new Error(`const not found: ${name}`);
  const end = script.indexOf(';', start);
  return script.slice(start, end + 1);
}

// buildWorkerSource spans up to createWorker; slice by markers instead of brace counting
// because its body builds strings containing braces.
function extractBuildWorkerSource() {
  const start = script.indexOf('function buildWorkerSource()');
  const end = script.indexOf('function workerCode()');
  if (start < 0 || end < 0) throw new Error('buildWorkerSource not found');
  return script.slice(start, end).trim();
}

const prelude = `
  const state = { config: {}, source: null };
  function getSafePngScale() { return state.source ? 4 : 1; }
`;
const api = eval([
  prelude,
  extractConst('MODES'),
  extractConst('DEFAULTS'),
  extractFn('clamp'),
  extractFn('numOr'),
  extractFn('mulberry32'),
  extractFn('safeFileName'),
  extractFn('processPoints'),
  extractFn('estimateSvgBytes'),
  extractFn('sanitizeConfig'),
  extractBuildWorkerSource(),
  ';({ state, DEFAULTS, MODES, clamp, numOr, mulberry32, safeFileName, processPoints, estimateSvgBytes, sanitizeConfig, buildWorkerSource })'
].join('\n'));

const { DEFAULTS, processPoints, estimateSvgBytes, sanitizeConfig, safeFileName, numOr, buildWorkerSource } = api;

// ---------- helpers ----------
let passed = 0, failed = 0;
function check(name, cond, detail = '') {
  if (cond) { passed++; console.log(`PASS ${name}`); }
  else { failed++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function eqArr(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
function makeImage(w, h, fn) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const [r, g, b, a] = fn(x, y);
    data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a;
  }
  return { width: w, height: h, data };
}
const baseCfg = { ...DEFAULTS, mode: 'HALFTONE', spacing: 6, threshold: 0.2, seed: 1 };
const halfImg = makeImage(120, 90, (x) => x < 60 ? [0, 0, 0, 255] : [255, 255, 255, 255]);

// ---------- (a) sanitizeConfig preserves 0, falls back on NaN/missing ----------
{
  api.state.source = null;
  api.state.config = {
    ...structuredClone(DEFAULTS),
    threshold: 0, baseOpacity: 0, edgeOpacity: 0, accentOpacity: 0,
    edgeThreshold: 0, accentThreshold: 0, maskOpacity: 0, brushSoftness: 0,
    compareMix: 0, svgPrecision: 0, seed: 0, shadowBoost: 0, highlightBoost: 0, edgeBoost: 0,
    exportScale: 8
  };
  sanitizeConfig();
  const c = api.state.config;
  check('a1 threshold 0 preserved', c.threshold === 0, `got ${c.threshold}`);
  check('a2 baseOpacity 0 preserved', c.baseOpacity === 0, `got ${c.baseOpacity}`);
  check('a3 compareMix 0 preserved', c.compareMix === 0, `got ${c.compareMix}`);
  check('a4 svgPrecision 0 preserved', c.svgPrecision === 0, `got ${c.svgPrecision}`);
  check('a5 edge/accent thresholds 0 preserved', c.edgeThreshold === 0 && c.accentThreshold === 0);
  check('a6 maskOpacity/brushSoftness 0 preserved', c.maskOpacity === 0 && c.brushSoftness === 0);
  check('a7 seed 0 preserved', c.seed === 0, `got ${c.seed}`);
  check('a8 boosts 0 preserved', c.shadowBoost === 0 && c.highlightBoost === 0 && c.edgeBoost === 0);
  check('a9 exportScale not clamped to 1 without an image', c.exportScale === 8, `got ${c.exportScale}`);

  api.state.config = { ...structuredClone(DEFAULTS), threshold: 'abc', baseOpacity: undefined, spacing: NaN };
  delete api.state.config.baseOpacity;
  sanitizeConfig();
  check('a10 NaN threshold falls back to default', api.state.config.threshold === DEFAULTS.threshold, `got ${api.state.config.threshold}`);
  check('a11 missing baseOpacity falls back to default', api.state.config.baseOpacity === DEFAULTS.baseOpacity, `got ${api.state.config.baseOpacity}`);
  check('a12 NaN spacing falls back to default', api.state.config.spacing === DEFAULTS.spacing, `got ${api.state.config.spacing}`);
  check('a13 numOr semantics', numOr(0, 5) === 0 && numOr(NaN, 5) === 5 && numOr(undefined, 5) === 5 && numOr('3', 5) === 3);
}

// ---------- (b) determinism ----------
{
  const h1 = processPoints(halfImg, { ...baseCfg, mode: 'HALFTONE', seed: 1 }, null).points;
  const h2 = processPoints(halfImg, { ...baseCfg, mode: 'HALFTONE', seed: 1 }, null).points;
  const h3 = processPoints(halfImg, { ...baseCfg, mode: 'HALFTONE', seed: 999 }, null).points;
  check('b1 halftone deterministic', eqArr(h1, h2));
  check('b2 halftone seed-invariant', eqArr(h1, h3));
  const s1 = processPoints(halfImg, { ...baseCfg, mode: 'STIPPLE', seed: 7 }, null).points;
  const s2 = processPoints(halfImg, { ...baseCfg, mode: 'STIPPLE', seed: 7 }, null).points;
  const s3 = processPoints(halfImg, { ...baseCfg, mode: 'STIPPLE', seed: 8 }, null).points;
  check('b3 stipple same-seed deterministic', eqArr(s1, s2) && s1.length > 0);
  check('b4 stipple different seed differs', !eqArr(s1, s3));
}

// ---------- (c) POISSON is real Poisson-disk ----------
{
  const dark = makeImage(120, 90, () => [0, 0, 0, 255]);
  const spacing = 8;
  const pts = processPoints(dark, { ...baseCfg, mode: 'POISSON', spacing, seed: 3 }, null).points;
  const n = pts.length / 5;
  check('c1 poisson produced points', n > 20, `n=${n}`);
  let minDist = Infinity;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = pts[i * 5] - pts[j * 5], dy = pts[i * 5 + 1] - pts[j * 5 + 1];
      const d = Math.hypot(dx, dy);
      if (d < minDist) minDist = d;
    }
  }
  check('c2 poisson min pairwise distance >= spacing*0.98', minDist >= spacing * 0.98, `minDist=${minDist.toFixed(3)}`);
  let maxDev = 0;
  for (let i = 0; i < n; i++) {
    const x = pts[i * 5], y = pts[i * 5 + 1];
    const cx = Math.round((x - spacing / 2) / spacing) * spacing + spacing / 2;
    const cy = Math.round((y - spacing / 2) / spacing) * spacing + spacing / 2;
    maxDev = Math.max(maxDev, Math.hypot(x - cx, y - cy));
  }
  check('c3 poisson points not confined to jittered grid centres', maxDev > spacing * 0.5, `maxDev=${maxDev.toFixed(2)}`);
  const p2 = processPoints(dark, { ...baseCfg, mode: 'POISSON', spacing, seed: 3 }, null).points;
  check('c4 poisson same-seed deterministic', eqArr(pts, p2));
  // Two black squares separated by a wide white gap: expansion cannot cross the
  // rejected area, so both regions must still receive points (re-seeding).
  const two = makeImage(200, 80, (x, y) => ((x >= 10 && x < 50 && y >= 20 && y < 60) || (x >= 150 && x < 190 && y >= 20 && y < 60)) ? [0, 0, 0, 255] : [255, 255, 255, 255]);
  const tp = processPoints(two, { ...baseCfg, mode: 'POISSON', spacing: 8, seed: 5 }, null).points;
  let inA = 0, inB = 0;
  for (let i = 0; i < tp.length; i += 5) { if (tp[i] < 100) inA++; else inB++; }
  check('c5 poisson covers separated dark regions', inA > 3 && inB > 3, `A=${inA} B=${inB}`);
}

// ---------- (d) threshold 0 includes the white side ----------
{
  const at02 = processPoints(halfImg, { ...baseCfg, threshold: 0.2 }, null).points.length / 5;
  const at0 = processPoints(halfImg, { ...baseCfg, threshold: 0 }, null).points.length / 5;
  check('d1 threshold 0 roughly doubles points vs 0.2', at0 >= at02 * 1.8, `0.2=${at02} 0=${at0}`);
}

// ---------- (e) alpha handling ----------
{
  const transparent = makeImage(60, 60, () => [0, 0, 0, 0]);
  const halfAlpha = makeImage(60, 60, () => [0, 0, 0, 128]);
  const fullAlpha = makeImage(60, 60, () => [0, 0, 0, 255]);
  const cfg = { ...baseCfg, spacing: 6, threshold: 0.2 };
  const pT = processPoints(transparent, cfg, null).points;
  const pH = processPoints(halfAlpha, cfg, null).points;
  const pF = processPoints(fullAlpha, cfg, null).points;
  check('e1 alpha 0 yields no points', pT.length === 0, `n=${pT.length / 5}`);
  check('e2 alpha 128 yields points', pH.length > 0);
  let radiiOk = pH.length === pF.length;
  let anySmaller = false;
  if (radiiOk) {
    for (let i = 0; i < pF.length; i += 5) {
      if (pH[i + 2] > pF[i + 2] + 1e-6) radiiOk = false;
      if (pH[i + 2] < pF[i + 2] - 1e-6) anySmaller = true;
    }
  }
  check('e3 alpha 128 radii <= alpha 255 radii', radiiOk && anySmaller);
}

// ---------- (f) worker source (built from the unified functions) matches processPoints ----------
{
  const src = buildWorkerSource();
  function runWorker(image, config) {
    const messages = [];
    const self = { onmessage: null, postMessage: (msg) => messages.push(msg) };
    const factory = new Function('self', 'performance', src + '\n;return self.onmessage;');
    const onmessage = factory(self, performance);
    onmessage({ data: { type: 'setImage', width: image.width, height: image.height, buffer: image.data.slice().buffer } });
    onmessage({ data: { type: 'process', config, requestId: 7, maskBuffer: null } });
    const done = messages.find((m) => m.type === 'done');
    if (!done) throw new Error('worker did not complete: ' + JSON.stringify(messages));
    return done.points;
  }
  const grad = makeImage(120, 90, (x) => { const v = Math.floor(255 * x / 120); return [v, v, v, 255]; });
  for (const mode of ['HALFTONE', 'STIPPLE', 'POISSON']) {
    const cfg = { ...baseCfg, mode, seed: 5, spacing: 7 };
    const direct = processPoints(grad, cfg, null).points;
    const viaWorker = runWorker(grad, cfg);
    check(`f worker matches processPoints (${mode})`, eqArr(direct, viaWorker), `direct=${direct.length / 5} worker=${viaWorker.length / 5}`);
  }
}

// ---------- (v) STIPPLE weighted Voronoi behaviour ----------
{
  const grad = makeImage(200, 100, (x) => { const v = Math.round(255 * x / 199); return [v, v, v, 255]; });
  const vcfg = { ...baseCfg, mode: 'STIPPLE', spacing: 10, threshold: 0.2, seed: 1 };
  const pts = processPoints(grad, vcfg, null).points;
  let zoneA = 0, zoneB = 0;
  for (let i = 0; i < pts.length; i += 5) {
    const x = pts[i];
    if (x >= 10 && x < 60) zoneA++;
    else if (x >= 110 && x < 160) zoneB++;
  }
  check('v1 stipple density response (dark zone >= 1.25x light zone)', zoneB > 0 && zoneA >= zoneB * 1.25, `A=${zoneA} B=${zoneB} ratio=${(zoneA / Math.max(1, zoneB)).toFixed(3)}`);

  const dark = makeImage(120, 90, () => [0, 0, 0, 255]);
  const st = processPoints(dark, { ...baseCfg, mode: 'STIPPLE', spacing: 10, threshold: 0.2, seed: 1 }, null).points;
  const ht = processPoints(dark, { ...baseCfg, mode: 'HALFTONE', spacing: 10, threshold: 0.2, seed: 1 }, null).points;
  const covRatio = (st.length / 5) / Math.max(1, ht.length / 5);
  check('v2 stipple count within +/-35% of halftone on uniform dark', covRatio >= 0.65 && covRatio <= 1.35, `stipple=${st.length / 5} halftone=${ht.length / 5} ratio=${covRatio.toFixed(3)}`);
  const quads = [0, 0, 0, 0];
  for (let i = 0; i < st.length; i += 5) { quads[(st[i] >= 60 ? 1 : 0) + (st[i + 1] >= 45 ? 2 : 0)]++; }
  check('v2b stipple covers all four quadrants', quads.every((q) => q > 0), `quadrants=${quads.join(',')}`);

  const sA = processPoints(grad, { ...vcfg, seed: 11 }, null).points;
  const sB = processPoints(grad, { ...vcfg, seed: 12 }, null).points;
  check('v3 voronoi stipple different seed differs', sA.length > 0 && !eqArr(sA, sB));
}

// ---------- (k) keyboard mask painting (static checks) ----------
{
  const sceneTag = html.match(/<div class="scene-wrap"[^>]*>/);
  check('k1a sceneWrap is focusable (tabindex="0")', !!sceneTag && sceneTag[0].includes('tabindex="0"'), sceneTag ? '' : 'sceneWrap tag not found');
  check('k1b sceneWrap aria-label explains arrow keys + Space', !!sceneTag && sceneTag[0].includes('arrow keys') && sceneTag[0].includes('Space'));
  const kdStart = script.indexOf("els.sceneWrap.addEventListener('keydown'");
  const kdBlock = kdStart >= 0 ? script.slice(kdStart, kdStart + 3000) : '';
  check('k1c sceneWrap keydown handler uses Arrow keys and Space', kdBlock.includes('ArrowLeft') && kdBlock.includes('ArrowRight') && kdBlock.includes('ArrowUp') && kdBlock.includes('ArrowDown') && kdBlock.includes("'Space'"), kdStart >= 0 ? '' : 'no sceneWrap keydown handler');
  check('k1d keyboard painting state present', script.includes('state.keyboardCursor') && script.includes('keyboardPainting'));
}

// ---------- (g) estimateSvgBytes ----------
{
  const cfg = { svgPrecision: 2, baseLayer: true, edgeLayer: true, accentLayer: true, baseOpacity: 100, edgeOpacity: 50, accentOpacity: 48 };
  const small = estimateSvgBytes(1000, cfg);
  const big = estimateSvgBytes(100000, cfg);
  const huge = estimateSvgBytes(1500000, cfg);
  check('g1 estimate grows with point count', small < big && big < huge, `${small} ${big} ${huge}`);
  check('g2 1.5M points at default precision exceeds 20 MB', huge > 20000000, `est=${huge}`);
}

// ---------- (h) safeFileName keeps Japanese ----------
{
  const jp = safeFileName('写真 2026.png');
  check('h1 Japanese filename preserved', jp.includes('写真') && jp.includes('2026'), `got ${jp}`);
  const en = safeFileName('my photo!.jpg');
  check('h2 ascii filename sanitised as before', en === 'my-photo', `got ${en}`);
}

// ---------- static guards on the HTML itself ----------
{
  check('s1 no prompt() calls remain', !script.includes('prompt('));
  check('s2 single processing core (one brightness definition)', (script.match(/function brightness/g) || []).length === 1);
  check('s3 lang is en', html.includes('<html lang="en">'));
  check('s4 worker built from unified functions', script.includes('processPoints.toString()'));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
