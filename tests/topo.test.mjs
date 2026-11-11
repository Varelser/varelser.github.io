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
  assert.ok(html.includes('WORKER_SCREEN_THRESHOLD = 3000000'), 'screen worker threshold');
  assert.equal(typeof run(`renderArtworkCache`), 'function');
  assert.equal(typeof run(`invalidateArtworkCache`), 'function');
  assert.ok(html.includes('image(artworkCache'), 'draw() blits the artwork cache');
});

check('stitch quantization scale matches grid step (v2 key precision)', () => {
  assert.equal(run(`coreStitchScale(12)`), 1000);
  assert.equal(run(`coreStitchScale(4)`), 10000);
  assert.equal(run(`coreStitchScale(18)`), 1000);
});

console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
