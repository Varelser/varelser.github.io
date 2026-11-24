/* Noise additions 2026-11-24 (3/3): Liquid GL view + MIDI Learn.
   Both are additive: they use only the DOM, the app's own controls and
   standard Web APIs, and never modify the app's own script blocks. */
(function () {
  'use strict';
  var LS_L = 'noise_liquidgl_v1';
  var LS_M = 'noise_midilearn_v1';
  function $(id) { return document.getElementById(id); }
  function load(key, dflt) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : dflt; } catch (_) { return dflt; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {} }

  /* ================= Liquid GL view ================= */
  var readout = $('readout');
  var lglCfg = Object.assign(
    { mode: 'mercury', speed: 0.85, warp: 1.55, bands: 11, reactivity: 1.25 },
    load(LS_L, {})
  );
  var lglViz = null;
  var lglBtn = null;
  var lglPoll = 0;
  var lglSource = 'Demo';

  var demoFeatures = function (t) {
    var pulse = Math.pow(0.5 + 0.5 * Math.sin(t * 2.1), 4);
    return {
      bass: 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.9)) + pulse * 0.3,
      mid: 0.28 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.4 + 1.2)),
      high: 0.22 + 0.4 * (0.5 + 0.5 * Math.sin(t * 3.1 + 0.5)),
      flux: pulse * 0.85,
      stereo: Math.sin(t * 0.65) * 0.7
    };
  };

  function buildLiquidUi() {
    if (!readout || typeof window.createMonochromeLiquidVisualizer !== 'function') return;
    var card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-viz', 'liquidgl');
    card.innerHTML =
      '<div class="ch">リキッドGL（WebGL流体）</div>' +
      '<canvas id="liquidgl" role="img" aria-label="リキッドGL表示"></canvas>' +
      '<div class="lgl-ctrls">' +
        '<select id="lglMode" aria-label="Liquid style">' +
          '<option value="mercury">Mercury（水銀）</option>' +
          '<option value="zebra">Op-Art Zebra（白黒等高線）</option>' +
          '<option value="ink">Ink Wash（墨流し）</option>' +
          '<option value="moire">Moiré（光学干渉）</option>' +
        '</select>' +
        '<label class="sl">Speed <input id="lglSpeed" type="range" min="0.1" max="2.5" step="0.05"></label>' +
        '<label class="sl">Warp <input id="lglWarp" type="range" min="0.3" max="3.0" step="0.05"></label>' +
        '<label class="sl">Bands <input id="lglBands" type="range" min="2" max="28" step="0.5"></label>' +
        '<label class="sl">React <input id="lglReact" type="range" min="0" max="2.5" step="0.05"></label>' +
      '</div>' +
      '<div class="lgl-hud" id="lglHud">WebGL / ready</div>';
    readout.appendChild(card);

    lglBtn = document.createElement('button');
    lglBtn.type = 'button';
    lglBtn.className = 'viz-btn';
    lglBtn.id = 'liquidglBtn';
    lglBtn.textContent = 'リキッドGL';
    lglBtn.setAttribute('data-help', 'WebGLシェーダーのモノクロ流体ビジュアライザ（3重ドメインワーピング）。Mercury / Zebra / Ink / Moiré の4スタイル。再生中はアプリの音声に反応します。');
    var gridBtn = document.querySelector('.viz-btn[data-viz-view="grid"]');
    if (gridBtn && gridBtn.parentNode) gridBtn.parentNode.insertBefore(lglBtn, gridBtn.nextSibling);
    else if (readout.parentNode) readout.parentNode.insertBefore(lglBtn, readout);

    $('lglMode').value = lglCfg.mode;
    $('lglSpeed').value = lglCfg.speed;
    $('lglWarp').value = lglCfg.warp;
    $('lglBands').value = lglCfg.bands;
    $('lglReact').value = lglCfg.reactivity;

    function pushCfg() {
      save(LS_L, lglCfg);
      if (lglViz) lglViz.setConfig({
        mode: lglCfg.mode, speed: Number(lglCfg.speed), warp: Number(lglCfg.warp),
        bands: Number(lglCfg.bands), reactivity: Number(lglCfg.reactivity)
      });
    }
    $('lglMode').addEventListener('change', function (e) { lglCfg.mode = e.target.value; pushCfg(); });
    $('lglSpeed').addEventListener('input', function (e) { lglCfg.speed = Number(e.target.value); pushCfg(); });
    $('lglWarp').addEventListener('input', function (e) { lglCfg.warp = Number(e.target.value); pushCfg(); });
    $('lglBands').addEventListener('input', function (e) { lglCfg.bands = Number(e.target.value); pushCfg(); });
    $('lglReact').addEventListener('input', function (e) { lglCfg.reactivity = Number(e.target.value); pushCfg(); });

    lglBtn.addEventListener('click', function () {
      if (readout.getAttribute('data-view') !== 'liquidgl') activateLiquid();
    });

    var mo = new MutationObserver(function () {
      if (readout.getAttribute('data-view') !== 'liquidgl' && lglViz) deactivateLiquid();
    });
    mo.observe(readout, { attributes: true, attributeFilter: ['data-view'] });
  }

  function activateLiquid() {
    readout.setAttribute('data-view', 'liquidgl');
    document.querySelectorAll('.viz-btn[data-viz-view].active').forEach(function (b) {
      b.classList.remove('active');
    });
    if (lglBtn) lglBtn.classList.add('active');
    if (lglViz) return;
    var canvas = $('liquidgl');
    var hud = $('lglHud');
    if (!canvas) return;
    var lastHud = 0;
    var boundCount = 0;
    lglViz = window.createMonochromeLiquidVisualizer(canvas, {
      mode: lglCfg.mode, speed: Number(lglCfg.speed), warp: Number(lglCfg.warp),
      bands: Number(lglCfg.bands), reactivity: Number(lglCfg.reactivity),
      getAudioFeatures: demoFeatures,
      onFrame: function (f, backend) {
        var now = performance.now();
        if (hud && now - lastHud > 500) {
          lastHud = now;
          hud.textContent = backend + ' | ' + lglCfg.mode + ' | source ' + lglSource +
            ' | bass ' + f.bass.toFixed(2) + ' mid ' + f.mid.toFixed(2) +
            ' high ' + f.high.toFixed(2) + ' flux ' + f.flux.toFixed(2);
        }
      }
    });
    // アプリ側 AnalyserNode の生成・再生成（サンプルレート変更等）に追従して最新の有効ノードへ接続
    function syncAnalysers() {
      var raw = window.__noiseAnalysers || [];
      if (!lglViz || raw.length === boundCount) return;
      var active = raw.filter(function (an) { return !an.context || an.context.state !== 'closed'; });
      if (!active.length) return;
      boundCount = raw.length;
      if (active.length >= 2) lglViz.setAnalysers(active[active.length - 2], active[active.length - 1]);
      else lglViz.setAnalysers(active[0], active[0]);
      lglSource = 'Audio';
    }
    syncAnalysers();
    lglPoll = window.setInterval(syncAnalysers, 700);
  }

  function deactivateLiquid() {
    if (lglBtn) lglBtn.classList.remove('active');
    if (lglPoll) { window.clearInterval(lglPoll); lglPoll = 0; }
    if (lglViz) { try { lglViz.destroy(); } catch (_) {} lglViz = null; }
    lglSource = 'Demo';
  }

  /* ================= MIDI Learn ================= */
  var mlBindings = load(LS_M, {});
  var mlOn = false;
  var mlArmed = null;
  var mlAccess = null;
  var mlStatus = null;

  function mlStatusText(msg) {
    if (!mlStatus) return;
    mlStatus.textContent = msg ||
      ('MIDI Learn 割当: ' + Object.keys(mlBindings).length + ' 件' +
       (mlOn ? '（Learn ON: 操作子をクリック → CCを動かしてください）' : ''));
  }

  function mlApply(id, v) {
    var el = $(id);
    if (!el) return;
    if (el.type === 'checkbox') {
      el.checked = v >= 64;
    } else if (el.tagName === 'SELECT') {
      el.selectedIndex = Math.min(el.options.length - 1, Math.floor(v / 128 * el.options.length));
    } else {
      var min = parseFloat(el.min || '0');
      var max = parseFloat(el.max || '1');
      var step = parseFloat(el.step || '0');
      var x = min + (v / 127) * (max - min);
      if (step > 0) x = Math.round(x / step) * step;
      el.value = String(Math.round(x * 10000) / 10000);
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function mlOnMessage(e) {
    var d = e.data;
    if (!d || d.length < 3) return;
    if ((d[0] & 0xF0) !== 0xB0) return;
    var cc = d[1], val = d[2];
    if (mlArmed) {
      mlBindings[cc] = mlArmed.id;
      save(LS_M, mlBindings);
      mlStatusText('CC' + cc + ' → #' + mlArmed.id + ' に割り当てました');
      mlArmed.classList.remove('lgl-armed');
      mlArmed = null;
      return;
    }
    var id = mlBindings[cc];
    if (id) mlApply(id, val);
  }

  var mlHooked = typeof WeakSet === 'function' ? new WeakSet() : null;
  function mlHook() {
    if (!mlAccess) return;
    mlAccess.inputs.forEach(function (inp) {
      if (mlHooked && mlHooked.has(inp)) return;
      if (typeof inp.addEventListener === 'function') {
        inp.addEventListener('midimessage', mlOnMessage);
      } else {
        inp.onmidimessage = mlOnMessage;
      }
      if (mlHooked) mlHooked.add(inp);
    });
  }

  function mlEnsureAccess() {
    if (mlAccess || !navigator.requestMIDIAccess) return;
    navigator.requestMIDIAccess({ sysex: false }).then(function (acc) {
      mlAccess = acc;
      mlHook();
      acc.onstatechange = mlHook;
    }).catch(function () {
      mlStatusText('MIDIアクセスが許可されませんでした');
    });
  }

  function buildMidiLearnUi() {
    var midiBtn = $('midiBtn');
    if (!midiBtn || !midiBtn.parentNode) return;
    var wrap = midiBtn.parentNode;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'secondary';
    btn.id = 'midiLearnBtn';
    btn.textContent = 'MIDI Learn';
    btn.setAttribute('data-help', 'ONにしてパラメータの操作子をクリックし、MIDIコントローラのノブ/CCを動かすと割り当てます。割当はこのブラウザに保存されます。固定マップ（CC7等）は従来どおり同時に働きます。');
    var clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'secondary';
    clear.id = 'midiLearnClearBtn';
    clear.textContent = '割当を全消去';
    mlStatus = document.createElement('div');
    mlStatus.className = 'help';
    mlStatus.id = 'midiLearnStatus';
    wrap.appendChild(btn);
    wrap.appendChild(clear);
    wrap.appendChild(mlStatus);
    mlStatusText();

    btn.addEventListener('click', function () {
      mlOn = !mlOn;
      btn.classList.toggle('active', mlOn);
      btn.textContent = mlOn ? 'MIDI Learn: ON' : 'MIDI Learn';
      if (mlOn) mlEnsureAccess();
      if (!mlOn && mlArmed) { mlArmed.classList.remove('lgl-armed'); mlArmed = null; }
      mlStatusText();
    });
    clear.addEventListener('click', function () {
      mlBindings = {};
      save(LS_M, mlBindings);
      mlStatusText('割当を全て消去しました');
    });

    document.addEventListener('click', function (e) {
      if (!mlOn) return;
      var t = e.target;
      if (!t || !t.id) return;
      if (t.id === 'midiLearnBtn' || t.id === 'midiLearnClearBtn') return;
      if (!/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
      e.preventDefault();
      e.stopPropagation();
      if (mlArmed) mlArmed.classList.remove('lgl-armed');
      mlArmed = t;
      mlArmed.classList.add('lgl-armed');
      mlStatusText('#' + t.id + ' を選択中。割り当てたいCCを動かしてください');
    }, true);

    window.__noiseMidiLearn = {
      bindings: function () { return Object.assign({}, mlBindings); },
      applyCC: function (cc, v) { var id = mlBindings[cc]; if (id) mlApply(id, v); },
      _message: mlOnMessage
    };
  }

  /* ================= Fine Round Particle Visualizer ================= */
  var LS_P = 'noise_particle_pro_v1';
  var pCfg = Object.assign(
    { count: 560, tail: 0.55, blur: 0.35, react: 1.4 },
    load(LS_P, {})
  );

  function makeCircleSprite(size, innerStop, outerAlpha) {
    var c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    var g = c.getContext('2d');
    if (!g) return c;
    var r = size * 0.5;
    var grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(innerStop, 'rgba(245,250,255,0.88)');
    grad.addColorStop(Math.min(0.95, innerStop + 0.32), 'rgba(185,220,245,' + outerAlpha + ')');
    grad.addColorStop(1, 'rgba(140,190,230,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return c;
  }

  function buildParticlePro() {
    if (!readout) return;
    var card = readout.querySelector('.card[data-viz="particle"]');
    if (!card || $('partPro')) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'partPro';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '高精細パーティクル表示');
    card.appendChild(canvas);

    var ctrls = document.createElement('div');
    ctrls.className = 'part-ctrls';
    ctrls.innerHTML =
      '<label class="sl">量 <input id="pCount" type="range" min="100" max="10000" step="20"><b id="pCountVal"></b></label>' +
      '<label class="sl">Tail <input id="pTail" type="range" min="0" max="1" step="0.02"><b id="pTailVal"></b></label>' +
      '<label class="sl">ブラー <input id="pBlur" type="range" min="0" max="1" step="0.02"><b id="pBlurVal"></b></label>' +
      '<label class="sl">反応 <input id="pReact" type="range" min="0.2" max="2.5" step="0.05"><b id="pReactVal"></b></label>';
    card.appendChild(ctrls);

    function syncVals() {
      $('pCount').value = pCfg.count;
      $('pTail').value = pCfg.tail;
      $('pBlur').value = pCfg.blur;
      $('pReact').value = pCfg.react;
      $('pCountVal').textContent = String(Math.round(pCfg.count));
      $('pTailVal').textContent = Number(pCfg.tail).toFixed(2);
      $('pBlurVal').textContent = Number(pCfg.blur).toFixed(2);
      $('pReactVal').textContent = Number(pCfg.react).toFixed(2);
    }
    syncVals();

    $('pCount').addEventListener('input', function (e) { pCfg.count = Number(e.target.value); syncVals(); save(LS_P, pCfg); });
    $('pTail').addEventListener('input', function (e) { pCfg.tail = Number(e.target.value); syncVals(); save(LS_P, pCfg); });
    $('pBlur').addEventListener('input', function (e) { pCfg.blur = Number(e.target.value); syncVals(); save(LS_P, pCfg); });
    $('pReact').addEventListener('input', function (e) { pCfg.react = Number(e.target.value); syncVals(); save(LS_P, pCfg); });

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    // シャープな丸粒と柔らかいボケ丸粒の2種スプライトを事前生成（高速描画＆ブラー連続制御）
    var sharpSprite = makeCircleSprite(24, 0.58, 0.14);
    var blurSprite = makeCircleSprite(40, 0.14, 0.42);

    var MAX_N = 10000;
    var px = new Float32Array(MAX_N);
    var py = new Float32Array(MAX_N);
    var ox = new Float32Array(MAX_N);
    var oy = new Float32Array(MAX_N);
    var vx = new Float32Array(MAX_N);
    var vy = new Float32Array(MAX_N);
    var pBand = new Uint8Array(MAX_N);
    var pAngle = new Float32Array(MAX_N);
    var pRadius = new Float32Array(MAX_N);
    var pPhase = new Float32Array(MAX_N);
    var pChaos = new Float32Array(MAX_N);
    var pBx = new Float32Array(MAX_N);
    var pBy = new Float32Array(MAX_N);
    var pBaseSize = new Float32Array(MAX_N);
    var pSeed = 0x2468ACE1;
    function rnd() {
      var x = pSeed;
      x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
      pSeed = x >>> 0;
      return pSeed / 4294967295;
    }

    var W = 600, H = 300;
    function initParticles() {
      var cx = W * 0.5, cy = H * 0.5;
      var rad = Math.min(W, H) * 0.42;
      for (var i = 0; i < MAX_N; i++) {
        var a = rnd() * Math.PI * 2;
        var r = Math.pow(rnd(), 0.65) * rad;
        pAngle[i] = a;
        pRadius[i] = r / Math.max(1, rad);
        pPhase[i] = rnd() * Math.PI * 2;
        pChaos[i] = 0.3 + rnd() * 2.2;
        var ba0 = rnd() * Math.PI * 2;
        pBx[i] = Math.cos(ba0);
        pBy[i] = Math.sin(ba0);
        pBand[i] = Math.floor(rnd() * 32);
        pBaseSize[i] = 0.75 + Math.pow(rnd(), 2.2) * 1.9;
        px[i] = cx + Math.cos(a) * r;
        py[i] = cy + Math.sin(a) * r;
        ox[i] = px[i];
        oy[i] = py[i];
        vx[i] = 0;
        vy[i] = 0;
      }
    }

    function resize() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { width: 0, height: 0 };
      if (!rect.width || !rect.height) return;
      var nw = Math.max(240, Math.floor(rect.width * dpr));
      var nh = Math.max(160, Math.floor(rect.height * dpr));
      if (nw !== canvas.width || nh !== canvas.height) {
        canvas.width = nw;
        canvas.height = nh;
        W = nw; H = nh;
        initParticles();
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
      }
    }
    canvas.width = W;
    canvas.height = H;
    initParticles();
    resize();
    window.addEventListener('resize', resize);
    if (typeof ResizeObserver === 'function') {
      try { new ResizeObserver(resize).observe(canvas); } catch (_) {}
    }
    if (typeof MutationObserver === 'function') {
      try {
        new MutationObserver(function () {
          if (isVisible()) requestAnimationFrame(resize);
        }).observe(readout, { attributes: true, attributeFilter: ['data-view'] });
      } catch (_) {}
    }

    var freqL = new Uint8Array(512);
    var freqR = new Uint8Array(512);
    var bands = new Float32Array(32);
    var bandSmooth = new Float32Array(32);
    var prevEnergy = 0;
    var smoothBass = 0, smoothMid = 0, smoothHigh = 0, smoothFlux = 0, smoothStereo = 0;
    var simT = 0;
    var lastTs = 0;

    function isVisible() {
      var v = readout.getAttribute('data-view') || 'trio';
      return v === 'particle' || v === 'grid';
    }

    function getActiveAnalysers() {
      var raw = window.__noiseAnalysers || [];
      var active = [];
      for (var i = 0; i < raw.length; i++) {
        if (!raw[i].context || raw[i].context.state !== 'closed') active.push(raw[i]);
      }
      if (!active.length) return null;
      if (active.length >= 2) return [active[active.length - 2], active[active.length - 1]];
      return [active[0], active[0]];
    }

    function loop(ts) {
      requestAnimationFrame(loop);
      if (document.hidden || !isVisible()) return;
      if (canvas.width < 20 || canvas.height < 20) resize();
      var dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
      lastTs = ts;
      simT += dt;

      var pair = getActiveAnalysers();
      var bass = 0, mid = 0, high = 0, stereo = 0, hasAudio = false;
      if (pair) {
        var anL = pair[0], anR = pair[1];
        var len = Math.min(anL.frequencyBinCount || 512, anR.frequencyBinCount || 512);
        if (len > 0) {
          if (freqL.length !== len) {
            freqL = new Uint8Array(len);
            freqR = new Uint8Array(len);
          }
          try {
            anL.getByteFrequencyData(freqL);
            anR.getByteFrequencyData(freqR);
          } catch (_) {
            len = 0;
          }
        }
        var totalSum = 0;
        for (var b = 0; b < 32 && len > 0; b++) {
          var i0 = Math.floor(Math.pow(b / 32, 1.8) * (len - 1));
          var i1 = Math.max(i0, Math.floor(Math.pow((b + 1) / 32, 1.8) * (len - 1)));
          var s = 0, d = 0;
          for (var k = i0; k <= i1; k++) {
            s += (freqL[k] + freqR[k]) * 0.5;
            d += (freqL[k] - freqR[k]);
          }
          var cnt = Math.max(1, i1 - i0 + 1);
          var val = s / (cnt * 255);
          bands[b] = val;
          totalSum += val;
          if (b < 6) bass += val;
          else if (b < 18) mid += val;
          else high += val;
          stereo += d / (cnt * 255);
        }
        bass /= 6; mid /= 12; high /= 14; stereo = Math.max(-1, Math.min(1, stereo / 10));
        hasAudio = totalSum > 0.015;
      }

      var react = Number(pCfg.react) || 1.4;
      var energy = bass * 0.5 + mid * 0.35 + high * 0.15;
      var flux = Math.max(0, (energy - prevEnergy) * 9.0);
      prevEnergy = energy;

      var atk = 1 - Math.exp(-dt * 26);
      var rel = 1 - Math.exp(-dt * 7.5);
      smoothBass += (bass * react - smoothBass) * (bass * react > smoothBass ? atk : rel);
      smoothMid += (mid * react - smoothMid) * (mid * react > smoothMid ? atk : rel);
      smoothHigh += (high * react - smoothHigh) * (high * react > smoothHigh ? atk : rel);
      smoothFlux += (flux * react - smoothFlux) * (flux * react > smoothFlux ? 0.65 : rel);
      smoothStereo += (stereo * react - smoothStereo) * rel;
      for (var j = 0; j < 32; j++) {
        var tv = bands[j] * react;
        bandSmooth[j] += (tv - bandSmooth[j]) * (tv > bandSmooth[j] ? atk : rel);
      }

      // Tail スライダーに応じて残像の消え方を連続制御（0: 即クリア / 1: 長い余韻）
      var tail = Math.max(0, Math.min(1, Number(pCfg.tail) || 0));
      var blur = Math.max(0, Math.min(1, Number(pCfg.blur) || 0));
      var fadeAlpha = tail <= 0.01 ? 1.0 : (0.55 * Math.pow(1 - tail * 0.92, 1.7) + 0.035);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = fadeAlpha >= 0.99 ? '#000' : ('rgba(0,0,0,' + fadeAlpha.toFixed(3) + ')');
      ctx.fillRect(0, 0, W, H);

      var cx = W * 0.5 + smoothStereo * W * 0.12;
      var cy = H * 0.5;
      var baseRad = Math.min(W, H) * 0.42;
      var count = Math.max(100, Math.min(MAX_N, Math.round(Number(pCfg.count) || 560)));
      var tailLines = tail > 0.03 && count <= 5000;
      var tailBoost = 0.6 + tail * 2.8;

      ctx.globalCompositeOperation = 'lighter';

      // 1) Tail 軌跡線（Tail > 0.03 のとき各粒子の移動方向に極細の尾を描く）
      if (tailLines) {
        ctx.lineWidth = 0.6 + blur * 0.8;
        ctx.strokeStyle = 'rgba(180, 220, 248, ' + (0.14 + tail * 0.24).toFixed(2) + ')';
        ctx.beginPath();
      }

      for (var i = 0; i < count; i++) {
        var bVal = bandSmooth[pBand[i]];
        ox[i] = px[i];
        oy[i] = py[i];

        // カオス自由粒子モデル: ホームへの誘導は弱く、慣性で飛ぶ。
        // ビート (Flux) で粒ごとのランダム方向へ爆散し、強い立ち上がりでは
        // 速度の振り直し (スクランブル) とランダム位置からの再噴出が起きる。
        // 乱れ具合・減衰は粒ごとにばらつく (pChaos 0.3〜2.5)。回転はほぼ消す。
        pAngle[i] += (0.0006 + smoothMid * 0.003 + bVal * 0.0025) * ((pBand[i] % 2) ? 1 : -1);
        var reach = 0.22 + 0.78 * pRadius[i];
        var drive = bVal * 1.12 + smoothFlux * 0.30 - smoothBass * 0.10;
        var wob = 0.16 * Math.sin(simT * (0.45 + (pBand[i] % 6) * 0.06) + pPhase[i]) * (0.35 + 0.65 * bVal);
        var targetR = baseRad * Math.max(0.02, Math.min(1.45, (drive + wob) * reach));
        targetR = Math.max(4, targetR);
        var tx = cx + Math.cos(pAngle[i]) * targetR;
        var ty = cy + Math.sin(pAngle[i]) * targetR;

        // 中心からの向き (弾けの基準)
        var dcx = px[i] - cx, dcy = py[i] - cy;
        var distC = Math.sqrt(dcx * dcx + dcy * dcy) || 1;
        var ux = dcx / distC, uy = dcy / distC;

        // 爆散方向は粒ごとに持ち、ビートのたびに一部が振り直される
        if (smoothFlux > 0.5 && rnd() < 0.03) {
          var ba = rnd() * Math.PI * 2;
          pBx[i] = Math.cos(ba); pBy[i] = Math.sin(ba);
        }
        var ch = pChaos[i];
        // 弱い誘導＋ランダム爆散＋拡散。減衰は粒ごとに違い、速度が残る。
        var pull = 0.012 + bVal * 0.020;
        var kick = smoothFlux * (1.9 + bVal * 3.4) * (0.6 + 0.4 * Math.sin(pPhase[i] * 7.0)) * (0.5 + ch * 0.55);
        var jitter = (0.30 + smoothHigh * 3.4 + bVal * 2.8 + energy * 2.2) * (hasAudio ? 1 : 0.25) * ch;
        var nvx = vx[i] + (tx - px[i]) * pull + (ux * 0.4 + pBx[i] * 0.9) * kick + (rnd() - 0.5) * jitter;
        var nvy = vy[i] + (ty - py[i]) * pull + (uy * 0.4 + pBy[i] * 0.9) * kick + (rnd() - 0.5) * jitter;
        // スクランブル: 強い立ち上がりで一部の粒の速度を丸ごと振り直す
        if (smoothFlux > 0.55 && rnd() < 0.010 * ch) {
          var sa = rnd() * Math.PI * 2, sm = 6 + rnd() * 24;
          nvx = Math.cos(sa) * sm; nvy = Math.sin(sa) * sm;
        }
        // 再噴出: 一部の粒がランダムな位置から新たに噴き出す
        if (smoothFlux > 0.6 && rnd() < 0.0035 * ch) {
          var ra = rnd() * Math.PI * 2, rr = Math.pow(rnd(), 0.6) * baseRad * 1.15;
          px[i] = cx + Math.cos(ra) * rr; py[i] = cy + Math.sin(ra) * rr;
          ox[i] = px[i]; oy[i] = py[i];
          var va = rnd() * Math.PI * 2, vm = 4 + rnd() * 18;
          nvx = Math.cos(va) * vm; nvy = Math.sin(va) * vm;
        }
        // 遠くへ飛んだ粒はゆるやかに引き戻す (消えっぱなしにしない)
        var maxR = baseRad * 2.6;
        if (distC > maxR) { var back = (distC - maxR) * 0.0025; nvx -= ux * back; nvy -= uy * back; }
        var damp = 0.935 + tail * 0.04 + (ch - 1) * 0.014;
        if (damp > 0.99) damp = 0.99; else if (damp < 0.90) damp = 0.90;
        nvx *= damp; nvy *= damp;
        // 速度上限 (暴走防止)
        var sp2 = nvx * nvx + nvy * nvy;
        if (sp2 > 1600) { var sc = 40 / Math.sqrt(sp2); nvx *= sc; nvy *= sc; }
        vx[i] = nvx; vy[i] = nvy;
        px[i] += vx[i];
        py[i] += vy[i];

        if (tailLines) {
          var dx = px[i] - ox[i];
          var dy = py[i] - oy[i];
          ctx.moveTo(px[i], py[i]);
          ctx.lineTo(px[i] - dx * tailBoost, py[i] - dy * tailBoost);
        }
      }
      if (tailLines) ctx.stroke();

      // 2) 丸い細かい粒子本体（シャープ粒＋ブラー粒の2層ブレンド）
      for (var i = 0; i < count; i++) {
        var x = px[i], y = py[i];
        if (x < -16 || x > W + 16 || y < -16 || y > H + 16) continue;
        var bVal = bandSmooth[pBand[i]];
        var rCore = pBaseSize[i] * (0.72 + bVal * 1.15 + smoothFlux * 0.45);
        var alpha = hasAudio
          ? Math.min(1, 0.22 + bVal * 0.95 + smoothFlux * 0.35)
          : 0.24;

        // ブラー層（ぼんやり丸く発光）
        if (blur > 0.02 && (count <= 2000 || (i & 1) === 0)) {
          var br = rCore * (2.2 + blur * 4.4);
          if (count > 2000 && br > 13) br = 13;
          ctx.globalAlpha = alpha * (0.18 + blur * 0.52);
          ctx.drawImage(blurSprite, x - br, y - br, br * 2, br * 2);
        }
        // コア丸粒層（細かいシャープな丸）
        var sr = rCore * (1.25 - blur * 0.25);
        ctx.globalAlpha = alpha * (1.0 - blur * 0.35);
        ctx.drawImage(sharpSprite, x - sr, y - sr, sr * 2, sr * 2);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(loop);
  }

  buildLiquidUi();
  buildParticlePro();
  buildMidiLearnUi();
})();
