(function (root) {
  'use strict';

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const VERT_SRC = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  // 3重ドメインワーピング（f(p + f(p + f(p)))）によるモノクロサイケデリック流体シェーダー
  const FRAG_SRC = `
    precision highp float;
    varying vec2 v_uv;
    uniform vec2 u_res;
    uniform float u_time;
    uniform float u_bass;
    uniform float u_mid;
    uniform float u_high;
    uniform float u_flux;
    uniform float u_stereo;
    uniform float u_warp;
    uniform float u_bands;
    uniform int u_mode; // 0:mercury, 1:zebra, 2:ink, 3:moire

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    mat2 rot(float a) {
      float c = cos(a), s = sin(a);
      return mat2(c, -s, s, c);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.52;
      mat2 m = rot(0.58);
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = m * p * 2.03 + vec2(1.7, 9.2);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
      float t = u_time;

      // ステレオ広がりによる微細なせん断＋中域による渦回転
      uv.x += u_stereo * 0.14 * sin(uv.y * 3.0 + t * 0.6);
      float r = length(uv);
      uv = rot(sin(r * 2.2 - t * 0.45) * (0.22 + u_mid * 0.55) + u_stereo * 0.18) * uv;

      // 低域ブレス＋トランジェント（flux）衝撃波リップル
      float ripple = sin(r * 16.0 - t * 5.0) * exp(-r * 2.2) * u_flux * 0.22;
      vec2 p = uv * (1.85 - u_bass * 0.28) + normalize(uv + 1e-4) * ripple;

      // 3重ドメインワーピング（サイケデリック流体リキッドの核）
      float wAmp = u_warp * (0.85 + u_bass * 0.75 + u_flux * 0.55);
      vec2 q = vec2(
        fbm(p + vec2(0.0, 0.0) + t * 0.14),
        fbm(p + vec2(5.2, 1.3) - t * 0.12)
      );
      vec2 q2 = vec2(
        fbm(p + 3.2 * wAmp * q + vec2(1.7, 9.2) + t * 0.19),
        fbm(p + 3.2 * wAmp * q + vec2(8.3, 2.8) - t * 0.16)
      );
      float f = fbm(p + 2.4 * wAmp * q2 + vec2(u_high * 0.6, -u_mid * 0.5));

      // 疑似法線（液体表面の金属的ハイライト用）
      float eps = 0.015;
      float fx = fbm(p + vec2(eps, 0.0) + 2.4 * wAmp * q2) - f;
      float fy = fbm(p + vec2(0.0, eps) + 2.4 * wAmp * q2) - f;
      vec3 norm = normalize(vec3(-fx * 18.0, -fy * 18.0, 1.0));
      vec3 lightDir = normalize(vec3(cos(t * 0.5), sin(t * 0.4), 0.75));
      float spec = pow(max(dot(norm, lightDir), 0.0), 14.0);

      float bands = u_bands + u_high * 8.0;
      float lum = 0.0;

      if (u_mode == 1) {
        // Op-Art Zebra: 鋭利な白黒サイケ等高線
        float s = sin((f * 2.0 + length(q2) * 0.9) * bands * 3.14159 - t * 1.4);
        lum = smoothstep(-0.14, 0.14, s);
        lum = mix(lum, 1.0 - lum, smoothstep(0.65, 0.95, f) * 0.35);
      } else if (u_mode == 2) {
        // Ink Wash: 漆黒の墨流し＋繊細な銀の筋
        float ridge = 1.0 - abs(sin(f * bands * 2.2 - t * 0.7));
        float vein = pow(ridge, 6.0);
        float mist = smoothstep(0.28, 0.86, f) * 0.55;
        lum = clamp(mist + vein * (0.65 + u_high * 0.5) + spec * 0.35, 0.0, 1.0);
      } else if (u_mode == 3) {
        // Moiré: 2重干渉縞の光学サイケリキッド
        float a = sin((f * bands * 2.6 + uv.x * 6.0) * 3.14159 - t * 1.2);
        float b = sin((length(q) * bands * 2.4 - uv.y * 6.0) * 3.14159 + t * 1.1);
        float m = a * b;
        lum = smoothstep(-0.22, 0.22, m) * 0.92 + spec * 0.25;
      } else {
        // Mercury: 水銀リキッド（滑らかな金属階調＋等高線＋スペキュラ）
        float wave = 0.5 + 0.5 * sin(f * bands * 3.14159 + length(q) * 4.2 - t * 0.9);
        float metallic = smoothstep(0.18, 0.85, wave);
        float darkCore = smoothstep(0.22, 0.75, f);
        lum = mix(darkCore * 0.38, metallic * 0.92, 0.72) + spec * (0.45 + u_high * 0.45);
      }

      // 高域に反応する微細な銀塩フィルムグレイン＋ソフトビネット
      float grain = (hash(gl_FragCoord.xy + fract(t * 17.3) * 100.0) - 0.5) * (0.045 + u_high * 0.08);
      float vig = smoothstep(1.45, 0.25, r);
      lum = clamp((lum + grain) * (0.28 + 0.72 * vig), 0.0, 1.0);

      gl_FragColor = vec4(vec3(lum), 1.0);
    }
  `;

  function compileShader(gl, type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const msg = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error(msg || 'SHADER_COMPILE_FAILED');
    }
    return sh;
  }

  function initWebGL(canvas) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false })
      || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    try {
      const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('PROGRAM_LINK_FAILED');
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uniforms = {};
      ['u_res','u_time','u_bass','u_mid','u_high','u_flux','u_stereo','u_warp','u_bands','u_mode'].forEach(k => {
        uniforms[k] = gl.getUniformLocation(prog, k);
      });
      return { gl, uniforms };
    } catch (_err) {
      return null;
    }
  }

  // WebGL 非対応時の Canvas 2D フォールバック（軽量ドメインワープ）
  function drawFallback2D(ctx, w, h, t, feat, cfg) {
    const sw = Math.max(80, Math.floor(w / 4));
    const sh = Math.max(48, Math.floor(h / 4));
    if (!ctx._img || ctx._img.width !== sw || ctx._img.height !== sh) {
      ctx._img = ctx.createImageData(sw, sh);
      ctx._u32 = new Uint32Array(ctx._img.data.buffer);
    }
    const u32 = ctx._u32;
    const bands = cfg.bands + feat.high * 6;
    const warp = cfg.warp * (1 + feat.bass * 0.8);
    let idx = 0;
    for (let y = 0; y < sh; y++) {
      const ny = (y / sh - 0.5) * 3.0;
      for (let x = 0; x < sw; x++) {
        const nx = (x / sw - 0.5) * 3.0;
        const wx = nx + Math.sin(ny * 2.1 + t * 0.7) * warp * 0.45;
        const wy = ny + Math.cos(nx * 2.1 - t * 0.6) * warp * 0.45;
        const v = Math.sin((wx * wx + wy * wy) * 0.8 + Math.sin(wx * 2.4 - wy * 1.9 + t) * bands * 0.35);
        const lum = cfg.mode === 'zebra'
          ? (v > 0 ? 245 : 8)
          : Math.max(0, Math.min(255, Math.floor((0.5 + 0.5 * v) * 245)));
        u32[idx++] = ((255 << 24) | (lum << 16) | (lum << 8) | lum) >>> 0;
      }
    }
    if (!ctx._off) {
      ctx._off = document.createElement('canvas');
      ctx._offCtx = ctx._off.getContext('2d');
    }
    if (ctx._off.width !== sw || ctx._off.height !== sh) {
      ctx._off.width = sw;
      ctx._off.height = sh;
    }
    ctx._offCtx.putImageData(ctx._img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(ctx._off, 0, 0, w, h);
  }

  /**
   * モノクロサイケデリック流体リキッド・ビジュアライザーを生成する。
   * @param {HTMLCanvasElement} canvas
   * @param {Object} [options]
   *   - analyserL / analyserR / analyser: Web Audio AnalyserNode（任意）
   *   - getAudioFeatures: () => ({ bass, mid, high, flux, stereo }) カスタム特徴量（任意）
   *   - mode: 'mercury' | 'zebra' | 'ink' | 'moire'
   *   - speed, warp, bands, reactivity: 数値パラメータ
   */
  function createMonochromeLiquidVisualizer(canvas, options = {}) {
    const cfg = {
      mode: options.mode || 'mercury',
      speed: options.speed ?? 0.85,
      warp: options.warp ?? 1.55,
      bands: options.bands ?? 11,
      reactivity: options.reactivity ?? 1.25,
      analyser: options.analyser || null,
      analyserL: options.analyserL || null,
      analyserR: options.analyserR || null,
      getAudioFeatures: options.getAudioFeatures || null,
      onFrame: options.onFrame || null
    };

    const webgl = initWebGL(canvas);
    const ctx2d = webgl ? null : canvas.getContext('2d');
    const backend = webgl ? 'WebGL' : 'Canvas2D';

    let freqL = new Uint8Array(512);
    let freqR = new Uint8Array(512);
    let prevEnergy = 0;
    const smooth = { bass: 0, mid: 0, high: 0, flux: 0, stereo: 0 };
    let simTime = 0;
    let lastTs = 0;
    let rafId = 0;
    let running = true;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(240, Math.floor(rect.width * dpr));
      const h = Math.max(160, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (webgl) webgl.gl.viewport(0, 0, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    function sampleFeatures(dt) {
      if (typeof cfg.getAudioFeatures === 'function') {
        const ext = cfg.getAudioFeatures(simTime) || {};
        return {
          bass: clamp(ext.bass || 0, 0, 2),
          mid: clamp(ext.mid || 0, 0, 2),
          high: clamp(ext.high || 0, 0, 2),
          flux: clamp(ext.flux || 0, 0, 2),
          stereo: clamp(ext.stereo || 0, -1, 1)
        };
      }
      const anL = cfg.analyserL || cfg.analyser;
      const anR = cfg.analyserR || cfg.analyserL || cfg.analyser;
      if (!anL) return { bass: 0, mid: 0, high: 0, flux: 0, stereo: 0 };

      const len = anL.frequencyBinCount || 512;
      if (freqL.length !== len) {
        freqL = new Uint8Array(len);
        freqR = new Uint8Array(len);
      }
      anL.getByteFrequencyData(freqL);
      anR.getByteFrequencyData(freqR);

      const bandAvg = (a, b) => {
        const i0 = Math.max(0, Math.floor(a * len));
        const i1 = Math.min(len - 1, Math.ceil(b * len));
        let s = 0, diff = 0;
        for (let i = i0; i <= i1; i++) {
          s += (freqL[i] + freqR[i]) * 0.5;
          diff += (freqL[i] - freqR[i]);
        }
        const n = Math.max(1, i1 - i0 + 1);
        return { avg: s / (n * 255), diff: diff / (n * 255) };
      };
      const b = bandAvg(0.0, 0.08);
      const m = bandAvg(0.08, 0.35);
      const h = bandAvg(0.35, 0.85);
      const energy = b.avg * 0.5 + m.avg * 0.35 + h.avg * 0.15;
      const flux = Math.max(0, (energy - prevEnergy) * 6.5);
      prevEnergy = energy;
      return {
        bass: b.avg,
        mid: m.avg,
        high: h.avg,
        flux,
        stereo: clamp((b.diff + m.diff + h.diff) * 1.5, -1, 1)
      };
    }

    const modeToInt = (m) => (m === 'zebra' ? 1 : m === 'ink' ? 2 : m === 'moire' ? 3 : 0);

    function frame(ts) {
      if (!running) return;
      rafId = requestAnimationFrame(frame);
      if (document.hidden) return;
      const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
      lastTs = ts;

      const raw = sampleFeatures(dt);
      const react = cfg.reactivity;
      const atk = 1 - Math.exp(-dt * 14);
      const rel = 1 - Math.exp(-dt * 4.5);
      smooth.bass += (raw.bass * react - smooth.bass) * (raw.bass * react > smooth.bass ? atk : rel);
      smooth.mid += (raw.mid * react - smooth.mid) * (raw.mid * react > smooth.mid ? atk : rel);
      smooth.high += (raw.high * react - smooth.high) * (raw.high * react > smooth.high ? atk : rel);
      smooth.flux += (raw.flux * react - smooth.flux) * (raw.flux * react > smooth.flux ? 0.55 : rel);
      smooth.stereo += (raw.stereo * react - smooth.stereo) * rel;

      simTime += dt * cfg.speed * (0.65 + smooth.bass * 0.9 + smooth.mid * 0.5);

      if (webgl) {
        const { gl, uniforms } = webgl;
        gl.uniform2f(uniforms.u_res, canvas.width, canvas.height);
        gl.uniform1f(uniforms.u_time, simTime);
        gl.uniform1f(uniforms.u_bass, smooth.bass);
        gl.uniform1f(uniforms.u_mid, smooth.mid);
        gl.uniform1f(uniforms.u_high, smooth.high);
        gl.uniform1f(uniforms.u_flux, smooth.flux);
        gl.uniform1f(uniforms.u_stereo, smooth.stereo);
        gl.uniform1f(uniforms.u_warp, cfg.warp);
        gl.uniform1f(uniforms.u_bands, cfg.bands);
        gl.uniform1i(uniforms.u_mode, modeToInt(cfg.mode));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } else if (ctx2d) {
        drawFallback2D(ctx2d, canvas.width, canvas.height, simTime, smooth, cfg);
      }

      if (typeof cfg.onFrame === 'function') cfg.onFrame(smooth, backend);
    }
    rafId = requestAnimationFrame(frame);

    return {
      backend,
      resize,
      setConfig(patch) { Object.assign(cfg, patch); },
      setAnalysers(anL, anR) { cfg.analyserL = anL; cfg.analyserR = anR || anL; cfg.getAudioFeatures = null; },
      destroy() {
        running = false;
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', resize);
      }
    };
  }

  root.createMonochromeLiquidVisualizer = createMonochromeLiquidVisualizer;
})(typeof globalThis !== 'undefined' ? globalThis : window);
