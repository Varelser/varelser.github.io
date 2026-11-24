/* Noise Multi-Tier DSP Engine (2026-11-24)
   Real-time switchable master DSP from Tier 6 (Studio Reference Mastering)
   down to Tier 0 (1-Bit / 3.2kHz Abyss Lo-Fi), transparently hooked into
   AudioNode.prototype.connect(..., ctx.destination). Zero core modification. */
(function () {
  'use strict';

  var LS_KEY = 'noise_dsp_tier_v1';

  var TIERS = [
    {
      index: 0,
      id: 'abyss1bit',
      name: 'Tier 0 — 最下層: 1-Bit 極限クラッシュ',
      short: '1-Bit / 3.2kHz / Comparator Fold',
      hpf: 240, hpfQ: 1.5,
      lowFreq: 160, lowGain: -8.0,
      midFreq: 1200, midQ: 2.0, midGain: 6.5,
      highFreq: 3000, highGain: -10.0,
      lpf: 2400, lpfQ: 1.8,
      shaperMode: 'stair', drive: 1.8, oversample: 'none',
      bits: 1.8, rateRatio: 0.075, fold: 0.65,
      compThresh: -28, compKnee: 4, compRatio: 20, compAtk: 0.002, compRel: 0.08,
      makeup: 0.92
    },
    {
      index: 1,
      id: 'retro8',
      name: 'Tier 1 — 8-Bit レトロ / エイリアシング',
      short: '6-bit / 8kHz / Digital Grit',
      hpf: 160, hpfQ: 0.9,
      lowFreq: 180, lowGain: -2.0,
      midFreq: 2200, midQ: 1.2, midGain: 3.5,
      highFreq: 5000, highGain: -4.0,
      lpf: 5200, lpfQ: 1.1,
      shaperMode: 'stair', drive: 1.1, oversample: 'none',
      bits: 6.0, rateRatio: 0.18, fold: 0.25,
      compThresh: -22, compKnee: 8, compRatio: 10, compAtk: 0.004, compRel: 0.10,
      makeup: 0.95
    },
    {
      index: 2,
      id: 'radio',
      name: 'Tier 2 — AMラジオ / 電話回線',
      short: '8-bit / 12kHz / 340Hz–3.1kHz',
      hpf: 340, hpfQ: 1.3,
      lowFreq: 200, lowGain: -6.0,
      midFreq: 1450, midQ: 1.6, midGain: 5.0,
      highFreq: 3600, highGain: -8.0,
      lpf: 3100, lpfQ: 1.2,
      shaperMode: 'diode', drive: 0.85, oversample: '2x',
      bits: 8.0, rateRatio: 0.28, fold: 0.12,
      compThresh: -24, compKnee: 10, compRatio: 8, compAtk: 0.005, compRel: 0.12,
      makeup: 1.05
    },
    {
      index: 3,
      id: 'cassette',
      name: 'Tier 3 — カセット / Vintage Lo-Fi',
      short: '12-bit / 22kHz / Band-Limited',
      hpf: 75, hpfQ: 0.7,
      lowFreq: 110, lowGain: 2.0,
      midFreq: 1800, midQ: 0.9, midGain: 1.5,
      highFreq: 6500, highGain: -3.5,
      lpf: 8500, lpfQ: 0.8,
      shaperMode: 'tape', drive: 0.65, oversample: '2x',
      bits: 12.0, rateRatio: 0.50, fold: 0.04,
      compThresh: -20, compKnee: 14, compRatio: 4.5, compAtk: 0.008, compRel: 0.15,
      makeup: 1.02
    },
    {
      index: 4,
      id: 'tape',
      name: 'Tier 4 — アナログテープ / Warm Reel',
      short: 'Analog 2x OS / Head Bump / Soft Sat',
      hpf: 38, hpfQ: 0.7,
      lowFreq: 68, lowGain: 3.2,
      midFreq: 2200, midQ: 0.8, midGain: -0.8,
      highFreq: 9000, highGain: -1.5,
      lpf: 13500, lpfQ: 0.7,
      shaperMode: 'tape', drive: 0.42, oversample: '2x',
      bits: 32.0, rateRatio: 1.0, fold: 0.0,
      compThresh: -18, compKnee: 16, compRatio: 3.0, compAtk: 0.012, compRel: 0.18,
      makeup: 1.0
    },
    {
      index: 5,
      id: 'hires',
      name: 'Tier 5 — ピュア / 高解像度ストレート',
      short: '32-bit Float / Zero Coloration',
      hpf: 16, hpfQ: 0.7,
      lowFreq: 80, lowGain: 0.0,
      midFreq: 1000, midQ: 0.7, midGain: 0.0,
      highFreq: 12000, highGain: 0.0,
      lpf: 21500, lpfQ: 0.7,
      shaperMode: 'linear', drive: 0.0, oversample: 'none',
      bits: 32.0, rateRatio: 1.0, fold: 0.0,
      compThresh: -1.0, compKnee: 1, compRatio: 20, compAtk: 0.003, compRel: 0.10,
      makeup: 1.0
    },
    {
      index: 6,
      id: 'master',
      name: 'Tier 6 — 最高峰: Studio Mastering',
      short: '32-bit Float / 4x OS / Air+Sub+BusComp',
      hpf: 28, hpfQ: 0.7,
      lowFreq: 85, lowGain: 1.4,
      midFreq: 2800, midQ: 0.7, midGain: 0.4,
      highFreq: 12000, highGain: 2.4,
      lpf: 21500, lpfQ: 0.7,
      shaperMode: 'tube', drive: 0.14, oversample: '4x',
      bits: 32.0, rateRatio: 1.0, fold: 0.0,
      compThresh: -14, compKnee: 18, compRatio: 2.2, compAtk: 0.015, compRel: 0.18,
      makeup: 1.04
    }
  ];

  var WORKLET_SOURCE = [
    'class NoiseDspTierCrusher extends AudioWorkletProcessor {',
    '  static get parameterDescriptors() {',
    '    return [',
    '      { name: "bits", defaultValue: 32, minValue: 1.2, maxValue: 32, automationRate: "k-rate" },',
    '      { name: "rateRatio", defaultValue: 1, minValue: 0.04, maxValue: 1, automationRate: "k-rate" },',
    '      { name: "fold", defaultValue: 0, minValue: 0, maxValue: 1, automationRate: "k-rate" }',
    '    ];',
    '  }',
    '  constructor() { super(); this._phase = [0, 0]; this._hold = [0, 0]; }',
    '  process(inputs, outputs, params) {',
    '    const inp = inputs[0]; const out = outputs[0];',
    '    if (!inp || !out) return true;',
    '    const bits = params.bits[0];',
    '    const rate = params.rateRatio[0];',
    '    const fold = params.fold[0];',
    '    const bypass = bits >= 24 && rate >= 0.99 && fold <= 0.001;',
    '    const levels = bypass ? 1 : Math.pow(2, Math.max(1.2, bits) - 1);',
    '    for (let ch = 0; ch < out.length; ch++) {',
    '      const ic = inp[ch] || inp[0];',
    '      const oc = out[ch];',
    '      if (!ic) { oc.fill(0); continue; }',
    '      if (bypass) { oc.set(ic); continue; }',
    '      let ph = this._phase[ch] || 0;',
    '      let hold = this._hold[ch] || 0;',
    '      for (let i = 0; i < oc.length; i++) {',
    '        ph += rate;',
    '        if (ph >= 1) {',
    '          ph -= Math.floor(ph);',
    '          let x = ic[i];',
    '          if (fold > 0.001) {',
    '            const g = 1 + fold * 4.5;',
    '            x = Math.sin(x * g);',
    '          }',
    '          hold = Math.round(x * levels) / levels;',
    '          if (bits <= 2.2) hold = hold >= 0 ? 0.65 : -0.65;',
    '        }',
    '        oc[i] = hold;',
    '      }',
    '      this._phase[ch] = ph;',
    '      this._hold[ch] = hold;',
    '    }',
    '    return true;',
    '  }',
    '}',
    'registerProcessor("noise-dsp-tier-crusher", NoiseDspTierCrusher);'
  ].join('\n');

  var state = { tier: 5, mix: 1.0 };
  try {
    var saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      if (typeof saved.tier === 'number' && saved.tier >= 0 && saved.tier < TIERS.length) state.tier = Math.round(saved.tier);
      if (typeof saved.mix === 'number' && saved.mix >= 0 && saved.mix <= 1) state.mix = saved.mix;
    }
  } catch (_) {}

  function persist() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (_) {}
  }

  var curveCache = {};
  function getShaperCurve(mode, drive) {
    var key = mode + ':' + drive.toFixed(2);
    if (curveCache[key]) return curveCache[key];
    var N = 2048;
    var curve = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      var x = (i * 2) / (N - 1) - 1;
      if (mode === 'linear' || drive <= 0.001) {
        curve[i] = x;
      } else if (mode === 'tube') {
        var k = 1 + drive * 2.4;
        curve[i] = Math.tanh(x * k + 0.04 * drive * x * x) / Math.tanh(k);
      } else if (mode === 'tape') {
        var kt = 1 + drive * 3.8;
        curve[i] = Math.tanh((x + 0.08 * drive * x * x) * kt) / Math.tanh(kt);
      } else if (mode === 'diode') {
        var kd = 1 + drive * 6.5;
        curve[i] = Math.max(-0.82, Math.min(0.82, Math.tanh(x * kd))) * 1.15;
      } else if (mode === 'stair') {
        var steps = drive > 1.4 ? 2.5 : 8;
        var q = Math.round(x * steps) / steps;
        curve[i] = Math.max(-0.9, Math.min(0.9, q * (1 + drive * 0.45)));
      } else {
        curve[i] = x;
      }
    }
    curveCache[key] = curve;
    return curve;
  }

  var buses = typeof WeakMap === 'function' ? new WeakMap() : null;
  var activeBuses = [];
  var workletUrl = null;

  function rawConnect(src, dst) {
    var fn = window.__noiseOrigConnect || (src && src.connect);
    if (fn) return fn.call(src, dst);
    return dst;
  }

  function setParam(param, val, ctx) {
    if (!param) return;
    try {
      if (typeof param.setTargetAtTime === 'function' && ctx && typeof ctx.currentTime === 'number') {
        param.setTargetAtTime(val, ctx.currentTime, 0.025);
      } else {
        param.value = val;
      }
    } catch (_) {
      try { param.value = val; } catch (__) {}
    }
  }

  function applyTierToBus(bus) {
    if (!bus || !bus.ctx || bus.ctx.state === 'closed') return;
    var ctx = bus.ctx;
    var t = TIERS[state.tier] || TIERS[5];
    var sr = ctx.sampleRate || 44100;
    var nyq = Math.max(1000, sr * 0.48);
    var mix = Math.max(0, Math.min(1, state.mix));

    setParam(bus.hpf.frequency, Math.min(nyq, t.hpf), ctx);
    setParam(bus.hpf.Q, t.hpfQ, ctx);
    setParam(bus.lowShelf.frequency, Math.min(nyq, t.lowFreq), ctx);
    setParam(bus.lowShelf.gain, t.lowGain, ctx);
    setParam(bus.midPeak.frequency, Math.min(nyq, t.midFreq), ctx);
    setParam(bus.midPeak.Q, t.midQ, ctx);
    setParam(bus.midPeak.gain, t.midGain, ctx);
    setParam(bus.highShelf.frequency, Math.min(nyq, t.highFreq), ctx);
    setParam(bus.highShelf.gain, t.highGain, ctx);
    setParam(bus.lpf.frequency, Math.min(nyq, t.lpf), ctx);
    setParam(bus.lpf.Q, t.lpfQ, ctx);

    try {
      bus.shaper.curve = t.shaperMode === 'linear' ? null : getShaperCurve(t.shaperMode, t.drive);
      bus.shaper.oversample = t.oversample;
    } catch (_) {}

    if (bus.crusherNode && bus.crusherNode.parameters) {
      setParam(bus.crusherNode.parameters.get('bits'), t.bits, ctx);
      setParam(bus.crusherNode.parameters.get('rateRatio'), t.rateRatio, ctx);
      setParam(bus.crusherNode.parameters.get('fold'), t.fold, ctx);
    }

    if (bus.comp) {
      setParam(bus.comp.threshold, t.compThresh, ctx);
      setParam(bus.comp.knee, t.compKnee, ctx);
      setParam(bus.comp.ratio, t.compRatio, ctx);
      setParam(bus.comp.attack, t.compAtk, ctx);
      setParam(bus.comp.release, t.compRel, ctx);
    }

    setParam(bus.dryGain.gain, 1 - mix, ctx);
    setParam(bus.wetGain.gain, mix * t.makeup, ctx);
  }

  function attachWorkletCrusher(bus) {
    var ctx = bus.ctx;
    if (!ctx || !ctx.audioWorklet || typeof ctx.audioWorklet.addModule !== 'function' || typeof window.AudioWorkletNode !== 'function') {
      return;
    }
    try {
      if (!workletUrl && typeof Blob === 'function' && window.URL && typeof window.URL.createObjectURL === 'function') {
        workletUrl = window.URL.createObjectURL(new Blob([WORKLET_SOURCE], { type: 'application/javascript' }));
      }
      if (!workletUrl) return;
      ctx.audioWorklet.addModule(workletUrl).then(function () {
        if (!bus || bus.ctx.state === 'closed') return;
        var wn = new window.AudioWorkletNode(ctx, 'noise-dsp-tier-crusher', {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          outputChannelCount: [2]
        });
        try {
          bus.shaper.disconnect(bus.crusherSlot);
          rawConnect(bus.shaper, wn);
          rawConnect(wn, bus.crusherSlot);
          bus.crusherNode = wn;
          bus.engine = 'AudioWorklet';
          applyTierToBus(bus);
          updateSpecUi();
        } catch (_) {}
      }).catch(function () {
        // Fallback to WaveShaper + Filter chain silently (e.g. file:// origin)
      });
    } catch (_) {}
  }

  function createBus(ctx) {
    if (!ctx || typeof ctx.createGain !== 'function' || typeof ctx.createBiquadFilter !== 'function') return null;
    var input = ctx.createGain();
    var dryGain = ctx.createGain();
    var wetGain = ctx.createGain();
    var masterOut = ctx.createGain();
    masterOut.__noiseDspBypass = true;

    var hpf = ctx.createBiquadFilter(); hpf.type = 'highpass';
    var lowShelf = ctx.createBiquadFilter(); lowShelf.type = 'lowshelf';
    var midPeak = ctx.createBiquadFilter(); midPeak.type = 'peaking';
    var highShelf = ctx.createBiquadFilter(); highShelf.type = 'highshelf';
    var lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass';
    var shaper = typeof ctx.createWaveShaper === 'function' ? ctx.createWaveShaper() : ctx.createGain();
    var crusherSlot = ctx.createGain();
    var comp = typeof ctx.createDynamicsCompressor === 'function' ? ctx.createDynamicsCompressor() : null;

    rawConnect(input, dryGain);
    rawConnect(dryGain, masterOut);

    rawConnect(input, hpf);
    rawConnect(hpf, lowShelf);
    rawConnect(lowShelf, midPeak);
    rawConnect(midPeak, highShelf);
    rawConnect(highShelf, lpf);
    rawConnect(lpf, shaper);
    rawConnect(shaper, crusherSlot);
    if (comp) {
      rawConnect(crusherSlot, comp);
      rawConnect(comp, wetGain);
    } else {
      rawConnect(crusherSlot, wetGain);
    }
    rawConnect(wetGain, masterOut);
    rawConnect(masterOut, ctx.destination);

    var bus = {
      ctx: ctx,
      input: input,
      dryGain: dryGain,
      wetGain: wetGain,
      masterOut: masterOut,
      hpf: hpf,
      lowShelf: lowShelf,
      midPeak: midPeak,
      highShelf: highShelf,
      lpf: lpf,
      shaper: shaper,
      crusherSlot: crusherSlot,
      crusherNode: null,
      comp: comp,
      engine: 'WaveShaper'
    };
    applyTierToBus(bus);
    attachWorkletCrusher(bus);
    activeBuses.push(bus);
    return bus;
  }

  window.__noiseGetDspInput = function (ctx) {
    if (!ctx) return null;
    if (typeof window.OfflineAudioContext === 'function' && ctx instanceof window.OfflineAudioContext) return null;
    if (typeof window.webkitOfflineAudioContext === 'function' && ctx instanceof window.webkitOfflineAudioContext) return null;
    var bus = buses ? buses.get(ctx) : null;
    if (!bus) {
      bus = createBus(ctx);
      if (bus && buses) buses.set(ctx, bus);
    }
    return bus ? bus.input : null;
  };

  function applyAllBuses() {
    var alive = [];
    for (var i = 0; i < activeBuses.length; i++) {
      var b = activeBuses[i];
      if (b && b.ctx && b.ctx.state !== 'closed') {
        applyTierToBus(b);
        alive.push(b);
      }
    }
    activeBuses = alive;
  }

  function updateSpecUi() {
    var spec = document.getElementById('dspTierSpec');
    var mixVal = document.getElementById('dspMixVal');
    var sel = document.getElementById('dspTierSelect');
    var sld = document.getElementById('dspTierSlider');
    var mixSld = document.getElementById('dspMixSlider');
    var t = TIERS[state.tier] || TIERS[5];
    if (sel) sel.value = String(state.tier);
    if (sld) sld.value = String(state.tier);
    if (mixSld) mixSld.value = String(Math.round(state.mix * 100));
    if (mixVal) mixVal.textContent = Math.round(state.mix * 100) + '%';
    if (spec) {
      var eng = activeBuses.some(function (b) { return b.engine === 'AudioWorklet'; }) ? 'Worklet' : 'Native';
      spec.textContent = t.short + ' · ' + eng;
    }
  }

  function setTier(idx) {
    var n = Math.max(0, Math.min(TIERS.length - 1, Math.round(Number(idx))));
    if (isNaN(n)) return;
    state.tier = n;
    persist();
    applyAllBuses();
    updateSpecUi();
  }

  function setMix(mix01) {
    var m = Math.max(0, Math.min(1, Number(mix01)));
    if (isNaN(m)) return;
    state.mix = m;
    persist();
    applyAllBuses();
    updateSpecUi();
  }

  function mountUi() {
    var target = document.getElementById('masterFields') || document.getElementById('panel');
    if (!target || document.getElementById('dspTierBox')) return;

    var box = document.createElement('div');
    box.id = 'dspTierBox';
    box.className = 'dsp-tier-box';
    var opts = TIERS.slice().reverse().map(function (t) {
      return '<option value="' + t.index + '">' + t.name + '</option>';
    }).join('');
    box.innerHTML =
      '<div class="dsp-tier-head">' +
        '<span class="dsp-tier-title">DSP クオリティ階層（最下層 ⇄ 最高峰）</span>' +
        '<span id="dspTierSpec" class="dsp-tier-spec"></span>' +
      '</div>' +
      '<select id="dspTierSelect" aria-label="DSP クオリティ階層">' + opts + '</select>' +
      '<div class="dsp-tier-sliders">' +
        '<label class="dsp-sl"><span>最下層</span><input id="dspTierSlider" type="range" min="0" max="6" step="1" aria-label="DSP階層スライダー"><span>最高峰</span></label>' +
        '<label class="dsp-sl"><span>Mix</span><input id="dspMixSlider" type="range" min="0" max="100" step="1" aria-label="DSP Wet Mix"><b id="dspMixVal">100%</b></label>' +
      '</div>';

    if (target.firstChild) target.insertBefore(box, target.firstChild);
    else target.appendChild(box);

    var sel = document.getElementById('dspTierSelect');
    var sld = document.getElementById('dspTierSlider');
    var mixSld = document.getElementById('dspMixSlider');

    if (sel) sel.addEventListener('change', function (e) { setTier(e.target.value); });
    if (sld) sld.addEventListener('input', function (e) { setTier(e.target.value); });
    if (mixSld) mixSld.addEventListener('input', function (e) { setMix(Number(e.target.value) / 100); });
    updateSpecUi();
  }

  window.__noiseDsp = {
    tiers: TIERS,
    getState: function () { return { tier: state.tier, mix: state.mix, spec: TIERS[state.tier] }; },
    setTier: setTier,
    setMix: setMix
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountUi, { once: true });
  } else {
    mountUi();
  }
})();
