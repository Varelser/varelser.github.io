// topo.html behavioural tests — Node, no dependencies.
// Run: node topo.test.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = [path.join(here, 'topo.html'), path.join(here, '..', 'topo.html')].find((p) => fs.existsSync(p));
const html = fs.readFileSync(htmlPath, 'utf8');
const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const mainScript = inlineScripts.reduce((a, b) => (b.length > a.length ? b : a), '');

// ---------- deterministic p5 / DOM stubs ----------
function makeSandbox() {
  let rngState = 1;
  let noiseSeedVal = 0;
  const lcg = () => { rngState = (rngState * 1664525 + 1013904223) >>> 0; return rngState / 4294967296; };
  const hash2 = (x, y) => { const h = Math.sin(x * 127.1 + y * 311.7 + noiseSeedVal * 0.013) * 43758.5453; return h - Math.floor(h); };
  const makeElement = () => ({
    style: {}, dataset: {}, value: '', textContent: '', checked: false, disabled: false, hidden: false,
    addEventListener() {}, removeEventListener() {}, setAttribute() {}, getAttribute() { return null; },
    getBoundingClientRect() { return { left: 0, top: 0, right: 0, bottom: 0 }; },
    focus() {}, click() {}, appendChild() {}, removeChild() {}
  });
  const elements = new Map();
  const store = new Map();
  const sandbox = {
    console, setTimeout, clearTimeout,
    innerWidth: 800, innerHeight: 600,
    width: 800, height: 600,
    mouseX: 0, mouseY: 0, mouseButton: 0, LEFT: 0, CLOSE: 'close',
    TWO_PI: Math.PI * 2,
    floor: Math.floor, int: (n) => Math.trunc(n),
    lerp: (a, b, t) => a + (b - a) * t,
    dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    map: (v, a, b, c, d, clampFlag) => { let t = (v - a) / (b - a); if (clampFlag) t = Math.min(1, Math.max(0, t)); return c + t * (d - c); },
    noiseSeed: (s) => { noiseSeedVal = s; },
    noise: (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), dd = hash2(xi + 1, yi + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + dd) * u * v;
    },
    randomSeed: (s) => { rngState = (Math.floor(Math.abs(s)) >>> 0) || 1; },
    random: (a, b) => { if (a === undefined) return lcg(); if (b === undefined) return lcg() * a; return a + lcg() * (b - a); },
    redraw() {}, addEventListener() {},
    document: {
      getElementById(id) { if (!elements.has(id)) elements.set(id, makeElement()); return elements.get(id); },
      createElement() { return makeElement(); },
      body: makeElement(), activeElement: null
    },
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k)
    }
  };
  sandbox.window = sandbox;
  return sandbox;
}

const sandbox = makeSandbox();
const ctx = vm.createContext(sandbox);
const run = (code) => vm.runInContext(code, ctx);

let passed = 0;
let failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log(`ok - ${name}`); }
  else { failed++; console.log(`FAIL - ${name}`); }
}

const HELPERS = `
globalThis.__checksum = (sd) => {
  let s = 0;
  for (const c of sd.contours) { s += c.points.length; for (const p of c.points) { s += p.x * 0.1234567 + p.y * 0.7654321; } }
  return sd.contours.length + ':' + s.toFixed(6) + ':' + sd.gridStep;
};
globalThis.__resetState = (seed) => {
  seedVal = seed;
  holes = [createHole(0.5, 0.5, {})];
  for (let i = 0; i < holes.length; i++) holes[i].phase = computeHolePhase(i);
  selectedHoleIndex = 0;
};
`;

async function main() {
  // 1. script loads without error
  let loadError = null;
  try {
    run(mainScript);
    run(HELPERS);
  } catch (err) {
    loadError = err;
  }
  check('inline script loads without error', loadError === null);
  if (loadError) { console.error(loadError); finish(); }
  check('core functions are defined', run(`typeof buildSceneData === 'function' && typeof estimateWork === 'function' && typeof marchingSquaresPaths === 'function'`));

  // 2. same seed -> identical contours
  const sameSeed = run(`
    __resetState(777);
    const a = __checksum(buildSceneData(400, 300, 777));
    const b = __checksum(buildSceneData(400, 300, 777));
    a === b && a.split(':')[0] !== '0';
  `);
  check('same seed produces identical contours', sameSeed === true);

  // 3. different seed -> different checksum
  const diffSeed = run(`
    __resetState(777);
    const sumSeedA = __checksum(buildSceneData(400, 300, 777));
    __resetState(778);
    const sumSeedB = __checksum(buildSceneData(400, 300, 778));
    sumSeedA !== sumSeedB;
  `);
  check('different seed produces different contours', diffSeed === true);

  // 4. marching squares on a synthetic radial field -> closed paths
  const msResult = run(`
    const cols = 21, rows = 21, step = 10;
    const f = new Float32Array(cols * rows);
    for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
      f[gy * cols + gx] = Math.hypot(gx * step - 100, gy * step - 100);
    }
    const paths = marchingSquaresPaths(f, cols, rows, step, 50);
    paths.length >= 1 && paths.some((p) => p.closed && p.points.length >= 4);
  `);
  check('marching squares on radial field produces closed paths', msResult === true);

  // 5. flat mode produces contours
  const flatResult = run(`
    __resetState(42);
    params.NOISE_AMPLITUDE = 0;
    const sd = buildSceneData(400, 300, 42);
    params.NOISE_AMPLITUDE = 0.14;
    sd.contours.length > 0;
  `);
  check('flat mode (NOISE_AMPLITUDE=0) produces contours', flatResult === true);

  // 6. hole cap
  const capResult = run(`
    __resetState(99);
    let lastReturn = true;
    for (let i = 0; i < 20; i++) lastReturn = addHole(0.3, 0.3);
    holes.length === MAX_HOLES && lastReturn === false;
  `);
  check('hole cap enforces MAX_HOLES (12)', capResult === true);

  // 7. work estimation magnitudes
  const estResult = run(`
    const e = estimateWork(7680, 4320, 4, 70, 1);
    const small = estimateWork(800, 600, 12, 70, 1);
    const three = estimateWork(800, 600, 12, 70, 3);
    e.fieldPoints === 1922 * 1082 &&
    e.cellChecks === 1921 * 1081 * 70 &&
    small.cellChecks > 0 && small.cellChecks < 1000000 &&
    three.pointCost > small.pointCost;
  `);
  check('estimateWork returns expected magnitudes', estResult === true);

  // 8. adaptive grid step
  const adaptResult = run(`
    __resetState(777);
    const base = getGridStep(800, 600, false);
    const adaptedScene = buildSceneData(800, 600, 777, { budget: 1000 });
    const normalScene = buildSceneData(800, 600, 777);
    adaptedScene.adapted === true && adaptedScene.gridStep > base &&
    normalScene.adapted === false && normalScene.gridStep === base;
  `);
  check('adaptive grid step increases when budget exceeded', adaptResult === true);

  // 9. async build matches sync build
  run(`
    __resetState(777);
    globalThis.__syncChecksum = __checksum(buildSceneData(400, 300, 777));
    globalThis.__asyncDone = buildSceneDataAsync(400, 300, 777).then((s) => { globalThis.__asyncChecksum = __checksum(s); });
  `);
  await sandbox.__asyncDone;
  check('async scene build matches sync output', sandbox.__asyncChecksum === sandbox.__syncChecksum);

  // 10. settings serialize / parse round-trip
  const roundTrip = run(`
    __resetState(31337);
    params.NUM_RINGS = 88;
    const text = serializeSettings();
    const parsed = parseSettingsJSON(text);
    params.NUM_RINGS = 111;
    seedVal = 1;
    if (parsed.ok) applySettingsData(parsed.data);
    parsed.ok === true && params.NUM_RINGS === 88 && seedVal === 31337 && holes.length === 1;
  `);
  check('settings serialize/parse round-trip restores state', roundTrip === true);

  // 11. invalid JSON rejected, out-of-range values sanitized
  const invalidResult = run(`
    const bad = parseSettingsJSON('{not json');
    const notObject = parseSettingsJSON('[1,2,3]');
    const clamped = parseSettingsJSON('{"params":{"NUM_RINGS":99999},"holes":"nope","seed":5}');
    bad.ok === false && notObject.ok === false &&
    clamped.ok === true && clamped.data.params.NUM_RINGS === 220 && clamped.data.holes.length === 1;
  `);
  check('invalid JSON rejected and values sanitized', invalidResult === true);

  // 12. persistence save/load
  const persistResult = run(`
    __resetState(2024);
    params.NUM_RINGS = 99;
    saveSettings();
    params.NUM_RINGS = 5;
    const loadedOk = loadSettings();
    loadedOk === true && params.NUM_RINGS === 99 && seedVal === 2024;
  `);
  check('localStorage save/load round-trip', persistResult === true);

  // 13. undo restores pre-change snapshot
  const undoResult = run(`
    __resetState(55);
    undoStack = [];
    params.NUM_RINGS = 70;
    pushUndo();
    params.NUM_RINGS = 33;
    undoLast();
    params.NUM_RINGS === 70 && undoStack.length === 0;
  `);
  check('undo restores previous state', undoResult === true);

  // 14. seed apply reproduces phases deterministically
  const seedApplyResult = run(`
    __resetState(1);
    const first = applySeed(60606);
    const phaseA = holes[0].phase;
    applySeed(111);
    const second = applySeed(60606);
    first === true && second === true && holes[0].phase === phaseA && seedVal === 60606 &&
    applySeed(0) === false && applySeed('abc') === false;
  `);
  check('applySeed validates and is deterministic', seedApplyResult === true);

  // ---- static HTML checks ----
  check('html has lang="ja"', /<html lang="ja">/.test(html));
  check('p5 script tag has SRI integrity sha512', /integrity="sha512-[A-Za-z0-9+/=]+"/.test(html));
  check('MAX_HOLES = 12 declared', /MAX_HOLES\s*=\s*12/.test(html));
  check('localStorage key topo-settings-v1 present', html.includes('topo-settings-v1'));
  check('no window.confirm/prompt/alert usage', !/window\.(confirm|prompt|alert)/.test(html) && !/\b(confirm|prompt|alert)\s*\(/.test(mainScript));
  check('unified draw routines only (no old duplicated pairs)', !/drawSmoothPath(Main|OnGraphics)|drawFaintTextureTo(Main|Graphics)/.test(html));
  check('grid resolution label renamed', html.includes('グリッド解像度 (ANGLE_STEPS)') && !html.includes('角度分割相当'));
  check('canvas press guard ignores clicks on UI elements (panel toggle)', /event\.target\.tagName !== 'CANVAS'/.test(mainScript) && mainScript.includes("getElementById('panelToggle')"));

  const rangeIds = [...html.matchAll(/<input[^>]*type="range"[^>]*>/g)].map((m) => {
    const idMatch = m[0].match(/id="([^"]+)"/);
    return idMatch ? idMatch[1] : null;
  }).filter(Boolean);
  const labelFors = new Set([...html.matchAll(/<label for="([^"]+)"/g)].map((m) => m[1]));
  check('every range slider has a matching label for=', rangeIds.length >= 14 && rangeIds.every((id) => labelFors.has(id)));

  finish();
}

function finish() {
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
