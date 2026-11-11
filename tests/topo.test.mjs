// topo.html behavioural tests — Node, no dependencies.
// Run: node topo.test.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert';
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
  // A function condition is an assertion block: it must actually run.
  // (Passing the function object itself as a boolean would make the
  // check vacuously "ok" without executing any assertion.)
  if (typeof cond === 'function') {
    try {
      cond();
      passed++; console.log(`ok - ${name}`);
    } catch (err) {
      failed++; console.log(`FAIL - ${name}: ${err && err.message ? err.message : err}`);
    }
    return;
  }
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
  if (loadError) { console.error(loadError); await finish(); return; }
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

  // 14b. v6: deleting a non-last hole, then reloading the saved
  // settings, reproduces the identical scene (phase is persisted).
  const deleteReloadResult = run(`
    (() => {
      const chk = (sd) => { let v = 0; for (const c of sd.contours) { v += c.points.length; for (const pt of c.points) v += pt.x * 0.123 + pt.y * 0.765; } return sd.contours.length + ':' + v.toFixed(4); };
      Object.assign(params, JSON.parse(JSON.stringify(DEFAULT_PARAMS)));
      seedVal = 777;
      holes = [createHole(0.25, 0.3, {}), createHole(0.5, 0.5, {}), createHole(0.75, 0.7, {})];
      for (let i = 0; i < holes.length; i++) holes[i].phase = computeHolePhase(i);
      selectedHoleIndex = 0;
      deleteSelectedHole();
      const live = chk(buildSceneData(500, 400, 777));
      const parsed = parseSettingsJSON(serializeSettings());
      if (!parsed.ok) return false;
      applySettingsData(parsed.data);
      const reloaded = chk(buildSceneData(500, 400, 777));
      return live === reloaded && holes.length === 2;
    })()
  `);
  check('v6: scene after hole deletion reproduces after settings reload (phase persisted)', deleteReloadResult === true);

  // 14c. v6: legacy settings without phase fall back to index-derived
  // phases; EXPORT_TRANSPARENT round-trips; hole clamp unified 0.02-0.98.
  const legacyResult = run(`
    (() => {
      const legacy = parseSettingsJSON('{"params":{"EXPORT_TRANSPARENT":false},"holes":[{"x":0.02,"y":0.99,"radius":1,"strength":1,"waveAmp":1},{"x":0.5,"y":0.5,"radius":1,"strength":1,"waveAmp":1}],"seed":777}');
      if (!legacy.ok) return false;
      const h0 = legacy.data.holes[0];
      return legacy.data.params.EXPORT_TRANSPARENT === false &&
        h0.x === 0.02 && h0.y === 0.98 &&
        Math.abs(h0.phase - computeHolePhase(0, 777)) < 1e-9 &&
        Math.abs(legacy.data.holes[1].phase - computeHolePhase(1, 777)) < 1e-9;
    })()
  `);
  check('v6: legacy settings get index-derived phases; hole clamp 0.02-0.98; transparent flag round-trips', legacyResult === true);

  // ---- static HTML checks ----
  check('html has lang="ja"', /<html lang="ja">/.test(html));
  check('p5 script tag has SRI integrity sha512', /integrity="sha512-[A-Za-z0-9+/=]+"/.test(html));
  check('MAX_HOLES = 12 declared', /MAX_HOLES\s*=\s*12/.test(html));
  check('localStorage key topo-settings-v1 present', html.includes('topo-settings-v1'));
  check('no window.confirm/prompt/alert usage', !/window\.(confirm|prompt|alert)/.test(html) && !/\b(confirm|prompt|alert)\s*\(/.test(mainScript));
  check('unified draw routines only (no old duplicated pairs)', !/drawSmoothPath(Main|OnGraphics)|drawFaintTextureTo(Main|Graphics)/.test(html));
  check('grid resolution label renamed', html.includes('グリッド解像度 (ANGLE_STEPS)') && !html.includes('角度分割相当'));
  check('v6: ANGLE_STEPS slider step is 1 (default 900 on-step)', /id="a" type="range" min="128" max="2000" step="1" value="900"/.test(html));
  check('v6: EXPORT_TRANSPARENT has a UI checkbox', html.includes('id="exportTransparent"'));
  check('canvas press guard ignores clicks on UI elements (panel toggle)', /event\.target\.tagName !== 'CANVAS'/.test(mainScript) && mainScript.includes("getElementById('panelToggle')"));

  const rangeIds = [...html.matchAll(/<input[^>]*type="range"[^>]*>/g)].map((m) => {
    const idMatch = m[0].match(/id="([^"]+)"/);
    return idMatch ? idMatch[1] : null;
  }).filter(Boolean);
  const labelFors = new Set([...html.matchAll(/<label for="([^"]+)"/g)].map((m) => m[1]));
  check('every range slider has a matching label for=', rangeIds.length >= 14 && rangeIds.every((id) => labelFors.has(id)));

  await finish();
}

async function checkAsync(name, fn) {
  try {
    await fn();
    passed++; console.log(`ok - ${name}`);
  } catch (err) {
    failed++; console.log(`FAIL - ${name}: ${err && err.message ? err.message : err}`);
  }
}

async function finish() {
  
// ---------- v3: unified pure core / worker / performance ----------

const P5_NOISE_POINTS = [[0, 0], [0.5, 0.5], [1.234, 5.678], [10.3, 7.9], [123.456, 789.012], [0.001, 0.999], [55.5, 44.4], [3.14159, 2.71828], [999.9, 0.1], [42, 42]];
// Golden values captured from the REAL p5.js 1.6.0 (unminified cdnjs build)
// executed in a Node vm with DOM stubs (Object.create(p5.prototype)).
const P5_NOISE_GOLDEN = {
  42: [0.23657360135985073, 0.545861631151638, 0.5815667471822621, 0.2906978839319886, 0.5438622891067466, 0.3064290981153905, 0.3578792172824211, 0.3614049146345455, 0.6353107637488877, 0.5234830810077256],
  777: [0.5036214456777088, 0.40333592699607834, 0.5880289597098413, 0.33491501007377406, 0.573929948766857, 0.657538345057417, 0.3291281315626731, 0.3321174385024342, 0.6998523202665139, 0.7894149922649376]
};
// random() call sequence: random(), random(800), random(600), random(0.4, 2.0), random()
const P5_RANDOM_GOLDEN = {
  987655098: [0.3664631734136492, 279.83546182513237, 383.21164255030453, 0.6692182116210461, 0.5133795489091426],
  13122: [0.32153092161752284, 394.69870403409004, 336.8900415021926, 1.0345925889909267, 0.7543117993045598]
};

check('core noise matches real p5 1.6.0 values (golden)', () => {
  for (const [seedStr, expected] of Object.entries(P5_NOISE_GOLDEN)) {
    const seed = Number(seedStr);
    const got = run(`(() => { const c = createCoreState(); coreNoiseSeed(c, ${seed}); return ${JSON.stringify(P5_NOISE_POINTS)}.map(([x, y]) => coreNoise(c, x, y, 0)); })()`);
    assert.equal(got.length, expected.length);
    got.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-9, `seed ${seed} point ${i}: ${v} != ${expected[i]}`));
  }
});

// Independent reference implementation, written directly from the
// unminified p5 1.6.0 source (separate reading from the core code).
function makeRefNoise() {
  const PERLIN_SIZE = 4095;
  let perlin = null;
  let z = 0;
  const next = () => { z = (1664525 * z + 1013904223) % 4294967296; return z / 4294967296; };
  return {
    seed(s) { z = s >>> 0; perlin = new Array(PERLIN_SIZE + 1); for (let i = 0; i <= PERLIN_SIZE; i++) perlin[i] = next(); },
    noise(x, y = 0, zz = 0) {
      const YWRAP = 1 << 4, ZWRAP = 1 << 8;
      const sc = (i) => 0.5 * (1.0 - Math.cos(i * Math.PI));
      if (x < 0) x = -x; if (y < 0) y = -y; if (zz < 0) zz = -zz;
      let xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(zz);
      let xf = x - xi, yf = y - yi, zf = zz - zi;
      let r = 0, ampl = 0.5, n1, n2, n3;
      for (let o = 0; o < 4; o++) {
        let of = xi + (yi << 4) + (zi << 8);
        const rxf = sc(xf), ryf = sc(yf);
        n1 = perlin[of & PERLIN_SIZE];
        n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
        n2 = perlin[(of + YWRAP) & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + YWRAP + 1) & PERLIN_SIZE] - n2);
        n1 += ryf * (n2 - n1);
        of += ZWRAP;
        n2 = perlin[of & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
        n3 = perlin[(of + YWRAP) & PERLIN_SIZE];
        n3 += rxf * (perlin[(of + YWRAP + 1) & PERLIN_SIZE] - n3);
        n2 += ryf * (n3 - n2);
        n1 += sc(zf) * (n2 - n1);
        r += n1 * ampl;
        ampl *= 0.5;
        xi <<= 1; xf *= 2; yi <<= 1; yf *= 2; zi <<= 1; zf *= 2;
        if (xf >= 1.0) { xi++; xf--; }
        if (yf >= 1.0) { yi++; yf--; }
        if (zf >= 1.0) { zi++; zf--; }
      }
      return r;
    }
  };
}

check('core noise matches independent reference implementation', () => {
  const ref = makeRefNoise();
  for (const seed of [42, 777, 123456789, 5]) {
    ref.seed(seed);
    const got = run(`(() => { const c = createCoreState(); coreNoiseSeed(c, ${seed}); return ${JSON.stringify(P5_NOISE_POINTS)}.map(([x, y]) => coreNoise(c, x, y, 0)); })()`);
    P5_NOISE_POINTS.forEach(([x, y], i) => {
      const expected = ref.noise(x, y);
      assert.ok(Math.abs(got[i] - expected) < 1e-9, `seed ${seed} point ${i}: ${got[i]} != ${expected}`);
    });
  }
});

check('core LCG random matches real p5 1.6.0 values (golden)', () => {
  for (const [seedStr, expected] of Object.entries(P5_RANDOM_GOLDEN)) {
    const seed = Number(seedStr);
    const got = run(`(() => { const c = createCoreState(); coreRandomSeed(c, ${seed}); return [coreRandom(c), coreRandom(c, 800), coreRandom(c, 600), coreRandom(c, 0.4, 2.0), coreRandom(c)]; })()`);
    got.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-9, `seed ${seed} call ${i}: ${v} != ${expected[i]}`));
  }
});

// Node-side scene checksum (mirrors the vm __checksum helper).
function sceneChecksum(sd) {
  let s = 0;
  for (const c of sd.contours) { s += c.points.length; for (const p of c.points) { s += p.x * 0.1234567 + p.y * 0.7654321; } }
  return sd.contours.length + ':' + s.toFixed(6) + ':' + sd.gridStep;
}

const GOLDEN_CHECKSUM = '672:2181243.391762:12'; // 800x600, defaults, seed 777, one centre hole (matches pre-v3 output exactly)

check('golden checksum regression: new core reproduces pre-v3 contours', () => {
  run(`Object.assign(params, { NUM_RINGS: 70, ANGLE_STEPS: 900, NOISE_FREQ: 3.5, NOISE_AMPLITUDE: 0.14, CENTER_BULGE: 1.0, OUTER_RADIUS_RATIO: 0.46, WAVE_DETAIL: 1.0, INTERFERENCE_BOOST: 1.0, CIRCULARIZE_MIX: 0.30, ENABLE_INTERFERENCE: true, ENABLE_CIRCULARIZE: true, TEXTURE_POINTS: 700 });`);
  run(`__resetState(777)`);
  const sd = run(`buildSceneData(800, 600, 777)`);
  assert.equal(sceneChecksum(sd), GOLDEN_CHECKSUM);
});

check('worker source assembled from core functions, runs identically in vm', () => {
  const srcText = run(`getWorkerSourceText()`);
  assert.equal(typeof srcText, 'string');
  assert.ok(srcText.includes('function coreSampleFieldAt'), 'worker source must contain the core field sampler');
  assert.ok(srcText.includes('function coreMarchingSquaresPaths'), 'worker source must contain core marching squares');
  assert.ok(srcText.includes('self.onmessage'), 'worker source must install the message handler');

  const messages = [];
  const workerSandbox = {
    console,
    self: {
      onmessage: null,
      postMessage: (msg) => { messages.push(msg); }
    }
  };
  workerSandbox.globalThis = workerSandbox;
  const wctx = vm.createContext(workerSandbox);
  vm.runInContext(srcText, wctx);
  assert.equal(typeof workerSandbox.self.onmessage, 'function');

  const req = run(`(() => { __resetState(777); return { id: 99, params: coreParamsSnapshot(), holes: snapshotSceneHoles(), seed: 777, width: 800, height: 600, baseW: 800, baseH: 600, gridStep: 12 }; })()`);
  workerSandbox.self.onmessage({ data: req });
  const result = messages.find((m) => m.type === 'result');
  assert.ok(result, 'worker must post a result message');
  assert.equal(result.id, 99);
  const payload = result.payload;
  // Checksum straight from the flattened typed arrays.
  let sum = 0;
  let offset = 0;
  for (let i = 0; i < payload.counts.length; i++) {
    sum += payload.counts[i];
    for (let j = 0; j < payload.counts[i]; j++) {
      sum += payload.coords[offset++] * 0.1234567 + payload.coords[offset++] * 0.7654321;
    }
  }
  const workerChecksum = `${payload.counts.length}:${sum.toFixed(6)}:${payload.gridStep}`;
  assert.equal(workerChecksum, GOLDEN_CHECKSUM);
  // Progress messages were throttled to integer-percent changes.
  const progresses = messages.filter((m) => m.type === 'progress').map((m) => Math.floor(m.progress * 100));
  assert.ok(progresses.length <= 101, `too many progress messages: ${progresses.length}`);
  assert.ok(progresses.every((v, i) => i === 0 || v > progresses[i - 1]), 'progress percents must be strictly increasing');
});

check('worker fallback: no Worker support falls back and is flagged', () => {
  assert.equal(typeof run(`getWorkerState`), 'function');
  // The test sandbox has no Worker/Blob/URL.createObjectURL, so creation must fail safe.
  assert.equal(run(`ensureTopoWorker()`), null);
  assert.equal(run(`getWorkerState().failed`), true);
  const promise = run(`buildSceneViaWorker({ params: coreParamsSnapshot(), holes: snapshotSceneHoles(), seed: 1, width: 100, height: 100, baseW: 100, baseH: 100, gridStep: 10 }, null)`);
  assert.ok(promise && typeof promise.then === 'function', 'buildSceneViaWorker must return a promise');
  promise.then((res) => assert.equal(res, null));
});

check('culled field matches non-culled within epsilon 1e-3', () => {
  const maxDiff = run(`(() => {
    const cp = { NUM_RINGS: 70, ANGLE_STEPS: 900, NOISE_FREQ: 3.5, NOISE_AMPLITUDE: 0.14, CENTER_BULGE: 1.0, OUTER_RADIUS_RATIO: 0.46, WAVE_DETAIL: 1.0, INTERFERENCE_BOOST: 1.0, CIRCULARIZE_MIX: 0.30, ENABLE_INTERFERENCE: true, ENABLE_CIRCULARIZE: true, TEXTURE_POINTS: 700 };
    const holes2 = [
      { x: 0.12, y: 0.2, radius: 0.55, strength: 1.0, waveAmp: 1.0, phase: 1.1 },
      { x: 0.88, y: 0.75, radius: 0.6, strength: 1.2, waveAmp: 0.8, phase: 2.6 }
    ];
    const core = createCoreState();
    coreNoiseSeed(core, 777);
    const prep = corePrepareField(cp, holes2, 1920, 1080, 777);
    let maxD = 0;
    for (let gy = 0; gy <= 90; gy++) {
      for (let gx = 0; gx <= 160; gx++) {
        const x = gx * 12, y = gy * 12;
        const d = Math.abs(coreSampleFieldAt(core, prep, x, y, true) - coreSampleFieldAt(core, prep, x, y, false));
        if (d > maxD) maxD = d;
      }
    }
    return maxD;
  })()`);
  assert.ok(maxDiff > 0, 'culling should actually engage somewhere on this grid');
  assert.ok(maxDiff < 1e-3, `max culled field diff ${maxDiff} exceeds epsilon`);
});

check('flatten/unflatten round-trip preserves the scene', () => {
  const before = run(`buildSceneData(400, 300, 42)`);
  const restored = run(`unflattenScene(flattenScene(buildSceneData(400, 300, 42)))`);
  assert.equal(sceneChecksum(restored), sceneChecksum(before));
  assert.equal(restored.textureDots.length, before.textureDots.length);
  assert.ok(Math.abs(restored.textureDots[0].x - before.textureDots[0].x) < 1e-12);
});

check('static: single core field implementation, worker assembly present', () => {
  assert.equal((html.match(/function coreSampleFieldAt/g) || []).length, 1);
  assert.equal((html.match(/function coreMarchingSquaresPaths/g) || []).length, 1);
  assert.ok(html.includes('TOPO_CORE_FUNCTIONS'), 'core function list for worker assembly');
  assert.ok(html.includes('getWorkerSourceText'), 'worker source assembly');
  assert.ok(html.includes('new Blob('), 'worker created from Blob URL');
  assert.ok(html.includes('Workerで計算中'), 'worker status indication');
  // v4 adaptation: the WORKER_SCREEN_THRESHOLD static assert was
  // removed because v4 removes that gate entirely (all screen
  // regenerations now go through the worker). The dedicated v4
  // checks below assert the gate is gone and dispatch is universal.
  assert.equal(typeof run(`renderArtworkCache`), 'function');
  assert.equal(typeof run(`invalidateArtworkCache`), 'function');
  assert.ok(html.includes('image(artworkCache'), 'draw() blits the artwork cache');
});

check('stitch quantization scale matches grid step (v2 key precision)', () => {
  assert.equal(run(`coreStitchScale(12)`), 1000);
  assert.equal(run(`coreStitchScale(4)`), 10000);
  assert.equal(run(`coreStitchScale(18)`), 1000);
});

// ---------- v4: worker pool / worker rasterization / all-worker regen ----------

// Golden curvePoint(a, b, c, d, t) values captured from the REAL
// p5.js 1.6.0 (unminified cdnjs build) executed in a Node vm with
// DOM stubs, via Object.create(p5.prototype) with a stub renderer
// whose _curveTightness is 0 (the p5 default) — the same capture
// technique as the noise/random goldens above.
const P5_CURVE_TS = [0, 0.13, 0.25, 0.5, 0.77, 1];
const P5_CURVE_GOLDEN = [
  { q: [5, 73, 73, 15], expected: [73, 76.77188500000001, 79.140625, 80.875, 78.33956500000001, 73] },
  { q: [26, 24, 61, 65], expected: [24, 27.133858000000004, 31.28125, 42.125, 53.945761999999995, 61] },
  { q: [0, 100, -40, 33.333], expected: [100, 92.03932245050001, 76.8750078125, 31.666687500000002, -17.457830605500003, -40] },
  { q: [123.456, -7.89, 0.001, 999.9], expected: [-7.89, -21.0071683565, -38.9575390625, -74.6473125, -72.28827782849999, 0.001] },
  { q: [3, 3, 3, 3], expected: [3, 3, 3, 3, 3, 3] }
];

check('curve port: catmullRomPoint matches real p5 1.6.0 curvePoint golden values', () => {
  for (const { q, expected } of P5_CURVE_GOLDEN) {
    const got = run(`(${JSON.stringify(P5_CURVE_TS)}).map((t) => catmullRomPoint(${q.join(', ')}, t))`);
    assert.equal(got.length, expected.length);
    got.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-9, `curvePoint(${q.join(',')}, ${P5_CURVE_TS[i]}): ${v} != ${expected[i]}`));
  }
});

check('curve port: bezier through p5 control points equals Catmull-Rom samples within 1e-6', () => {
  const quads = [
    [[10, 20], [110, 40], [210, 180], [320, 60]],
    [[0, 0], [50, 200], [400, 30], [500, 500]],
    [[-30, 77], [13, -5], [99, 99], [250, -120]],
    [[7, 7], [7, 7], [7, 7], [7, 7]]
  ];
  const maxErr = run(`(() => {
    const quads = ${JSON.stringify(quads)};
    const ts = ${JSON.stringify(P5_CURVE_TS)};
    let maxErr = 0;
    for (const [pv, cu, nx, n2] of quads) {
      const P = (a) => ({ x: a[0], y: a[1] });
      const cp = curveBezierControls(P(pv), P(cu), P(nx), P(n2));
      for (const t of ts) {
        const bx = cubicBezierPoint(cu[0], cp[0].x, cp[1].x, nx[0], t);
        const by = cubicBezierPoint(cu[1], cp[0].y, cp[1].y, nx[1], t);
        const cx = catmullRomPoint(pv[0], cu[0], nx[0], n2[0], t);
        const cy = catmullRomPoint(pv[1], cu[1], nx[1], n2[1], t);
        maxErr = Math.max(maxErr, Math.abs(bx - cx), Math.abs(by - cy));
      }
    }
    return maxErr;
  })()`);
  assert.ok(maxErr < 1e-6, `max bezier vs Catmull-Rom deviation ${maxErr}`);
});

// Reference command stream for p5 1.6.0's Renderer2D curve branch,
// written directly from the unminified p5 source (independent of
// the port under test): start at vertices[1], one bezier per span
// with neighbour-derived control points, CLOSE appends vertices[0]
// twice up front, then a final lineTo and closePath.
function refStrokeCommands(pts, closed) {
  const n = pts.length;
  const V = [];
  if (closed) {
    V.push(pts[n - 1], pts[0]);
    for (const p of pts) V.push(p);
    V.push(pts[0], pts[1]);
  } else {
    V.push(pts[0], pts[0]);
    for (let i = 1; i < n; i++) V.push(pts[i]);
    V.push(pts[n - 1], pts[n - 1]);
  }
  const verts = closed ? V.concat([V[0], V[0]]) : V;
  const numVerts = verts.length;
  const calls = [['beginPath'], ['moveTo', verts[1].x, verts[1].y]];
  let i = 1;
  for (; i + 2 < numVerts; i++) {
    const prev = verts[i - 1], cur = verts[i], next = verts[i + 1], next2 = verts[i + 2];
    calls.push(['bezierCurveTo',
      cur.x + (next.x - prev.x) / 6, cur.y + (next.y - prev.y) / 6,
      next.x + (cur.x - next2.x) / 6, next.y + (cur.y - next2.y) / 6,
      next.x, next.y]);
  }
  if (closed) calls.push(['lineTo', verts[i + 1].x, verts[i + 1].y], ['closePath']);
  calls.push(['stroke']);
  return calls;
}

function assertCallsClose(got, expected, label) {
  assert.equal(got.length, expected.length, `${label}: command count ${got.length} != ${expected.length}`);
  got.forEach((call, i) => {
    assert.equal(call[0], expected[i][0], `${label}: command ${i} type`);
    for (let k = 1; k < call.length; k++) {
      assert.ok(Math.abs(call[k] - expected[i][k]) < 1e-9, `${label}: command ${i} arg ${k}: ${call[k]} != ${expected[i][k]}`);
    }
  });
}

check('curve port: strokeCurvePath2D emits the p5 command stream (open and closed)', () => {
  const quad = [{ x: 0, y: 0 }, { x: 100, y: 10 }, { x: 90, y: 90 }, { x: 10, y: 100 }];
  const tri = [{ x: 5, y: 5 }, { x: 60, y: 0 }, { x: 30, y: 40 }];
  const got = run(`(() => {
    const record = (pts, closed) => {
      const calls = [];
      const ctx = {
        beginPath: () => calls.push(['beginPath']),
        moveTo: (x, y) => calls.push(['moveTo', x, y]),
        bezierCurveTo: (a, b, c, d, x, y) => calls.push(['bezierCurveTo', a, b, c, d, x, y]),
        lineTo: (x, y) => calls.push(['lineTo', x, y]),
        closePath: () => calls.push(['closePath']),
        stroke: () => calls.push(['stroke'])
      };
      strokeCurvePath2D(ctx, pts, closed);
      return calls;
    };
    return {
      closedQuad: record(${JSON.stringify(quad)}, true),
      openQuad: record(${JSON.stringify(quad)}, false),
      closedTri: record(${JSON.stringify(tri)}, true),
      openTri: record(${JSON.stringify(tri)}, false)
    };
  })()`);
  assertCallsClose(got.closedQuad, refStrokeCommands(quad, true), 'closed quad');
  assertCallsClose(got.openQuad, refStrokeCommands(quad, false), 'open quad');
  assertCallsClose(got.closedTri, refStrokeCommands(tri, true), 'closed tri');
  assertCallsClose(got.openTri, refStrokeCommands(tri, false), 'open tri');
});

check('no WORKER_SCREEN_THRESHOLD gate remains; pool dispatch functions present', () => {
  assert.ok(!mainScript.includes('WORKER_SCREEN_THRESHOLD'), 'the screen-size worker gate must be gone');
  assert.equal(typeof run(`buildSceneAuto`), 'function');
  assert.equal(typeof run(`buildScenePooled`), 'function');
  assert.equal(typeof run(`partitionThresholdRanges`), 'function');
  assert.equal(typeof run(`mergeSceneChunks`), 'function');
  assert.equal(JSON.stringify(run(`partitionThresholdRanges(70, 2)`)), JSON.stringify([{ start: 0, end: 35 }, { start: 35, end: 70 }]));
  assert.equal(JSON.stringify(run(`partitionThresholdRanges(70, 4)`)), JSON.stringify([{ start: 0, end: 18 }, { start: 18, end: 36 }, { start: 36, end: 53 }, { start: 53, end: 70 }]));
  assert.equal(JSON.stringify(run(`partitionThresholdRanges(5, 4)`)), JSON.stringify([{ start: 0, end: 2 }, { start: 2, end: 3 }, { start: 3, end: 4 }, { start: 4, end: 5 }]));
});

check('threshold partition (2-way and 4-way) merged reproduces the golden checksum', () => {
  run(`Object.assign(params, { NUM_RINGS: 70, ANGLE_STEPS: 900, NOISE_FREQ: 3.5, NOISE_AMPLITUDE: 0.14, CENTER_BULGE: 1.0, OUTER_RADIUS_RATIO: 0.46, WAVE_DETAIL: 1.0, INTERFERENCE_BOOST: 1.0, CIRCULARIZE_MIX: 0.30, ENABLE_INTERFERENCE: true, ENABLE_CIRCULARIZE: true, TEXTURE_POINTS: 700 });`);
  run(`__resetState(777)`);
  const got = run(`(() => {
    const cp = coreParamsSnapshot();
    const hs = snapshotSceneHoles();
    const buildRange = (range) => {
      const c = createCoreState();
      return coreBuildScene(c, cp, hs, 777, 800, 600, { baseW: 800, baseH: 600, gridStep: 12, thresholdRange: range });
    };
    const full = buildRange(null);
    const two = mergeSceneChunks(partitionThresholdRanges(70, 2).map(buildRange));
    const four = mergeSceneChunks(partitionThresholdRanges(70, 4).map(buildRange));
    return {
      full: __checksum(full), two: __checksum(two), four: __checksum(four),
      dotsFull: full.textureDots.length, dotsTwo: two.textureDots.length, dotsFour: four.textureDots.length,
      contours: full.contours.length, contoursTwo: two.contours.length, contoursFour: four.contours.length
    };
  })()`);
  assert.equal(got.full, GOLDEN_CHECKSUM);
  assert.equal(got.two, GOLDEN_CHECKSUM);
  assert.equal(got.four, GOLDEN_CHECKSUM);
  assert.equal(got.contoursTwo, got.contours);
  assert.equal(got.contoursFour, got.contours);
  assert.equal(got.dotsTwo, got.dotsFull);
  assert.equal(got.dotsFour, got.dotsFull);
});

check('threshold partition in flat mode matches the full build', () => {
  const got = run(`(() => {
    const cp = coreParamsSnapshot();
    cp.NOISE_AMPLITUDE = 0;
    const hs = snapshotSceneHoles();
    const buildRange = (range) => {
      const c = createCoreState();
      return coreBuildScene(c, cp, hs, 777, 400, 300, { baseW: 400, baseH: 300, thresholdRange: range });
    };
    const full = buildRange(null);
    const two = mergeSceneChunks(partitionThresholdRanges(cp.NUM_RINGS, 2).map(buildRange));
    return { full: __checksum(full), two: __checksum(two), contours: full.contours.length };
  })()`);
  assert.ok(got.contours > 0, 'flat build must produce contours');
  assert.equal(got.two, got.full);
});

await checkAsync('render: capability gate, worker render attempt and main-thread fallback are wired', async () => {
  const srcText = run(`getWorkerSourceText()`);
  assert.ok(srcText.includes("req.kind === 'render'"), 'worker source must handle render messages');
  assert.ok(srcText.includes("req.kind === 'renderCaps'"), 'worker source must answer capability queries');
  assert.ok(srcText.includes('OffscreenCanvas'), 'render gate must reference OffscreenCanvas');
  assert.ok(srcText.includes('convertToBlob'), 'render must encode via convertToBlob');
  assert.equal(typeof run(`renderSceneViaWorker`), 'function');
  assert.equal(typeof run(`renderExportOnMainThread`), 'function');
  assert.ok(mainScript.includes('renderSceneViaWorker(exportScene'), 'export must try the worker render path first');
  assert.ok(mainScript.includes('renderExportOnMainThread(exportScene'), 'export must fall back to the main-thread rasterizer');
  // Behavioural: this sandbox has no Worker at all, so the worker
  // render path must decline (resolve null) — that null is exactly
  // what routes runExport to the main-thread fallback.
  const blob = await run(`renderSceneViaWorker({ contours: [], textureDots: [], holesPx: [], gridStep: 6 }, { width: 10, height: 10, showTexture: false, showRedShadow: false, redShadowAlpha: 0, redShadowScale: 2.2, whiteStrokeWeight: 1, scale: 1, transparent: true }, null)`);
  assert.equal(blob, null);
});

// A Worker stand-in that runs the REAL assembled worker source in a
// throwaway vm context per instance and delivers replies
// synchronously. Used to prove dispatch behaviour end to end.
function makeWorkerContext() {
  const state = { instances: [], ctx: null };
  const sb = makeSandbox();
  class FakeWorker {
    constructor(url) {
      this.url = url;
      this.onmessage = null;
      this.onerror = null;
      this.messages = [];
      const srcText = vm.runInContext('getWorkerSourceText()', state.ctx);
      const wSandbox = {
        console,
        self: {
          onmessage: null,
          postMessage: (m) => { if (this.onmessage) this.onmessage({ data: m }); }
        }
      };
      wSandbox.globalThis = wSandbox;
      const wctx = vm.createContext(wSandbox);
      vm.runInContext(srcText, wctx);
      this.__deliver = (msg) => wSandbox.self.onmessage({ data: msg });
      state.instances.push(this);
    }
    postMessage(msg) {
      this.messages.push(msg);
      this.__deliver(msg);
    }
    terminate() {}
  }
  sb.Worker = FakeWorker;
  sb.Blob = Blob;
  sb.URL = { createObjectURL: () => 'blob:fake', revokeObjectURL: () => {} };
  state.ctx = vm.createContext(sb);
  state.run = (code) => vm.runInContext(code, state.ctx);
  state.run(mainScript);
  state.run(HELPERS);
  return state;
}

await checkAsync('all screen regenerations dispatch to a worker (small build, no size gate)', async () => {
  const w = makeWorkerContext();
  w.run(`__resetState(777)`);
  w.run(`regenerateScene({ newSeed: false })`);
  await new Promise((r) => setTimeout(r, 100));
  assert.ok(w.instances.length >= 1, 'a worker must be created even for a small screen build');
  const computeMsgs = w.instances.flatMap((i) => i.messages).filter((m) => !m.kind);
  assert.ok(computeMsgs.length >= 1, 'a compute request must be dispatched to the worker');
  assert.equal(w.run(`getWorkerState().failed`), false);
  assert.ok(w.run(`scene.contours.length`) > 0, 'the scene must be populated from the worker result');
  assert.equal(w.run(`__checksum(scene)`), GOLDEN_CHECKSUM);
});

await checkAsync('pooled dispatch: heavy build splits thresholds across the pool and matches the single build', async () => {
  const w = makeWorkerContext();
  w.run(`__resetState(777)`);
  w.run(`params.ANGLE_STEPS = 2000; params.NUM_RINGS = 220;`);
  const direct = w.run(`__checksum(buildSceneData(800, 600, 777))`);
  w.run(`regenerateScene({ newSeed: false })`);
  await new Promise((r) => setTimeout(r, 200));
  // The vm sandbox has no navigator, so the pool size defaults to 2.
  assert.equal(w.instances.length, 2, 'the pool must top up to 2 workers for the pooled build');
  const computeMsgs = w.instances.flatMap((i) => i.messages).filter((m) => !m.kind);
  assert.equal(computeMsgs.length, 2, 'each pooled worker must receive exactly one chunk');
  const ranges = computeMsgs.map((m) => m.thresholdRange).sort((a, b) => a.start - b.start);
  assert.ok(ranges.every((r) => r && typeof r.start === 'number' && typeof r.end === 'number'), 'chunks must carry threshold ranges');
  assert.equal(ranges[0].start, 0);
  assert.equal(ranges[ranges.length - 1].end, 220);
  for (let i = 1; i < ranges.length; i++) assert.equal(ranges[i].start, ranges[i - 1].end, 'ranges must be contiguous');
  assert.equal(w.run(`getWorkerState().failed`), false);
  assert.equal(w.run(`__checksum(scene)`), direct, 'pooled result must be identical to the single build');
});

// ---------- v5: SVG export ----------

check('svg number formatting trims to 2 decimals', () => {
  const cases = [
    [1, '1'], [1.5, '1.5'], [1.25, '1.25'], [1.234, '1.23'], [1.236, '1.24'],
    [0, '0'], [-0.004, '0'], [100.1, '100.1'], [3.14159, '3.14'], [1234.5, '1234.5'],
    [-12.345, '-12.35'], [0.005, '0.01']
  ];
  for (const [input, expected] of cases) {
    assert.equal(run(`formatSvgNumber(${input})`), expected, `formatSvgNumber(${input})`);
  }
  assert.equal(run(`formatSvgAlpha(6 / 255)`), '0.0235');
  assert.equal(run(`formatSvgAlpha(42 / 255)`), '0.1647');
  assert.equal(run(`formatSvgAlpha(1)`), '1');
  assert.equal(run(`formatSvgAlpha(0)`), '0');
});

check('svg size estimate and guard decision thresholds', () => {
  assert.equal(run(`svgSizeDecision(1000)`), 'ok');
  assert.equal(run(`svgSizeDecision(SVG_CONFIRM_BYTES)`), 'ok');
  assert.equal(run(`svgSizeDecision(SVG_CONFIRM_BYTES + 1)`), 'confirm');
  assert.equal(run(`svgSizeDecision(SVG_HARD_BYTES)`), 'confirm');
  assert.equal(run(`svgSizeDecision(SVG_HARD_BYTES + 1)`), 'refuse');
  // The estimator reads point counts only and never builds strings:
  // stub scenes with bare length-carrying arrays price out purely
  // from their totals, so an oversized scene is refused up front.
  sandbox.__stubHuge = { contours: [{ points: new Array(2000000) }, { points: new Array(2000000) }], textureDots: [] };
  sandbox.__stubMid = { contours: [{ points: new Array(200000) }], textureDots: [] };
  sandbox.__stubSmall = { contours: [{ points: new Array(1000) }], textureDots: new Array(700) };
  assert.equal(run(`svgSizeDecision(estimateSvgBytes(__stubHuge, { showTexture: true, showRedShadow: true, transparent: true }))`), 'refuse');
  assert.equal(run(`svgSizeDecision(estimateSvgBytes(__stubMid, { showTexture: true, showRedShadow: true, transparent: true }))`), 'confirm');
  assert.equal(run(`svgSizeDecision(estimateSvgBytes(__stubSmall, { showTexture: true, showRedShadow: true, transparent: true }))`), 'ok');
  // Fewer passes / no dots must price lower.
  const full = run(`estimateSvgBytes(__stubMid, { showTexture: true, showRedShadow: true, transparent: true })`);
  const lean = run(`estimateSvgBytes(__stubMid, { showTexture: false, showRedShadow: false, transparent: true })`);
  assert.ok(lean < full, `lean estimate ${lean} must be below full estimate ${full}`);
});

check('svg export UI wiring present', () => {
  assert.ok(html.includes('id="exportSvg"'), 'SVG button exists in the panel');
  assert.ok(html.includes('SVG 保存 (V)'), 'SVG button label');
  assert.ok(mainScript.includes("getElementById('exportSvg')"), 'SVG button is wired in initControls');
  assert.ok(mainScript.includes("'image/svg+xml'"), 'SVG download uses the SVG MIME type');
  assert.equal(typeof run(`exportSVG`), 'function');
  assert.equal(typeof run(`runSvgExport`), 'function');
  assert.equal(typeof run(`buildSvgString`), 'function');
  assert.equal(typeof run(`curveSegmentStream`), 'function');
  // The shared segment helper must travel into the worker source:
  // the worker's strokeCurvePath2D depends on it (v3 lesson).
  const srcText = run(`getWorkerSourceText()`);
  assert.ok(srcText.includes('function curveSegmentStream'), 'worker source includes curveSegmentStream');
});

await checkAsync('svg export: golden scene structure mirrors the canvas port', async () => {
  run(`Object.assign(params, { NUM_RINGS: 70, ANGLE_STEPS: 900, NOISE_FREQ: 3.5, NOISE_AMPLITUDE: 0.14, CENTER_BULGE: 1.0, OUTER_RADIUS_RATIO: 0.46, WAVE_DETAIL: 1.0, INTERFERENCE_BOOST: 1.0, CIRCULARIZE_MIX: 0.30, ENABLE_INTERFERENCE: true, ENABLE_CIRCULARIZE: true, TEXTURE_POINTS: 700, WHITE_STROKE_WEIGHT: 1.1, RED_SHADOW_ALPHA: 42 });`);
  run(`__resetState(777)`);
  const sd = run(`buildSceneData(800, 600, 777)`);
  assert.equal(sceneChecksum(sd), GOLDEN_CHECKSUM);
  sandbox.__svgScene = sd;

  // The canvas port's command stream for the first contour, recorded
  // with the same fake-ctx technique as the v4 curve checks.
  const recorded = run(`(() => {
    const nums = [];
    const ctx = {
      beginPath: () => {},
      moveTo: (x, y) => nums.push(x, y),
      bezierCurveTo: (a, b, c, d, x, y) => nums.push(a, b, c, d, x, y),
      lineTo: (x, y) => nums.push(x, y),
      closePath: () => {},
      stroke: () => {}
    };
    const c = __svgScene.contours[0];
    strokeCurvePath2D(ctx, c.points, c.closed);
    return nums;
  })()`);
  assert.ok(recorded.length > 10, 'recorded command stream must be non-trivial');

  const svgNums = (d) => (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  const assertStreamMatches = (d, factor, label) => {
    const nums = svgNums(d);
    assert.equal(nums.length, recorded.length, `${label}: number count ${nums.length} != ${recorded.length}`);
    nums.forEach((v, i) => {
      assert.ok(Math.abs(v - recorded[i] * factor) <= 0.006, `${label}: number ${i}: ${v} != ${recorded[i] * factor} (2-decimal rounding)`);
    });
  };

  // Scale 1, transparent, shadow on, texture on.
  const svg = await run(`buildSvgString(__svgScene, { width: 800, height: 600, coordScale: 1, strokeScale: 1, showTexture: true, showRedShadow: true, transparent: true, redShadowAlpha: 42, redShadowScale: 2.2, whiteStrokeWeight: 1.1 }, null)`);
  assert.ok(svg.startsWith('<svg '), 'document must start with <svg');
  assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'), 'xmlns present');
  assert.ok(svg.includes('width="800" height="600"'), 'width/height attributes at scale 1');
  assert.ok(svg.includes('viewBox="0 0 800 600"'), 'viewBox at scale 1');
  assert.ok(svg.endsWith('</svg>'), 'document closes');
  assert.ok(!svg.includes('<rect'), 'no background rect when transparent');
  const pathDs = [...svg.matchAll(/<path d="([^"]*)"\/>/g)].map((m) => m[1]);
  assert.equal(pathDs.length, sd.contours.length * 2, 'one path per contour per pass (shadow + white)');
  pathDs.forEach((d) => assert.ok(d.startsWith('M'), 'every path starts with M'));
  for (let j = 0; j < sd.contours.length; j++) {
    assert.equal(pathDs[j].endsWith('Z'), sd.contours[j].closed, `shadow path ${j} Z matches closed=${sd.contours[j].closed}`);
    assert.equal(pathDs[j + sd.contours.length].endsWith('Z'), sd.contours[j].closed, `white path ${j} Z matches closed=${sd.contours[j].closed}`);
  }
  assert.equal((svg.match(/<circle/g) || []).length, sd.textureDots.length, 'one circle per texture dot');
  assert.ok(svg.includes('fill-opacity="0.0235"'), 'dot alpha 6/255 as fill-opacity');
  assert.ok(svg.includes('stroke-opacity="0.1647"'), 'shadow alpha 42/255 as stroke-opacity');
  assert.ok(svg.includes('stroke-width="2.42"'), 'shadow width = 1.1 * 2.2 * scale');
  assert.ok(svg.includes('stroke-width="1.1"'), 'white width = 1.1 * scale');
  assert.ok(svg.includes('stroke-linecap="round"') && svg.includes('stroke-linejoin="round"'), 'round cap/join on contour groups');
  assertStreamMatches(pathDs[0], 1, 'first contour (shadow pass, scale 1)');

  // The pre-build estimate must cover the actual byte size without
  // being wildly conservative.
  const estBytes = run(`estimateSvgBytes(__svgScene, { showTexture: true, showRedShadow: true, transparent: true })`);
  const actualBytes = Buffer.byteLength(svg, 'utf8');
  assert.ok(estBytes >= actualBytes, `estimate ${estBytes} must cover actual ${actualBytes}`);
  assert.ok(estBytes < actualBytes * 1.5, `estimate ${estBytes} must stay within 1.5x of actual ${actualBytes}`);
  assert.equal(run(`svgSizeDecision(${estBytes})`), 'ok');

  // Scale 2, opaque, no shadow pass.
  const svg2 = await run(`buildSvgString(__svgScene, { width: 1600, height: 1200, coordScale: 2, strokeScale: 2, showTexture: true, showRedShadow: false, transparent: false, redShadowAlpha: 42, redShadowScale: 2.2, whiteStrokeWeight: 1.1 }, null)`);
  assert.ok(svg2.includes('width="1600" height="1200"'), 'width/height attributes at scale 2');
  assert.ok(svg2.includes('viewBox="0 0 1600 1200"'), 'viewBox at scale 2');
  assert.equal((svg2.match(/<rect/g) || []).length, 1, 'exactly one background rect when opaque');
  assert.ok(svg2.indexOf('<rect') < svg2.indexOf('<path'), 'background rect precedes contour paths');
  const pathDs2 = [...svg2.matchAll(/<path d="([^"]*)"\/>/g)].map((m) => m[1]);
  assert.equal(pathDs2.length, sd.contours.length, 'single pass when shadow is off');
  assert.ok(svg2.includes('stroke-width="2.2"'), 'white width = 1.1 * scale 2');
  assertStreamMatches(pathDs2[0], 2, 'first contour (white pass, scale 2)');

  // Texture off -> no circles at all.
  const svg3 = await run(`buildSvgString(__svgScene, { width: 800, height: 600, coordScale: 1, strokeScale: 1, showTexture: false, showRedShadow: false, transparent: true, redShadowAlpha: 42, redShadowScale: 2.2, whiteStrokeWeight: 1.1 }, null)`);
  assert.ok(!svg3.includes('<circle'), 'no dot circles when texture is off');
});

console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
