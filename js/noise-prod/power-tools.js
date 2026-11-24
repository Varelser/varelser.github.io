/* Noise Power Tools (2026-11-24) — additive module
   1. A/B Snapshot Comparison (sessionStorage)
   2. XY Morphing Pad (2D pointer/touch canvas -> any 2 range sliders)
   3. Visualizer Video Recording (canvas.captureStream + MediaRecorder, standard DOM)
   4. Infinite Ambient Auto-Cycle (preset stepping timer)
   5. Media Session API (OS media keys & lock-screen controls)
   6. Multi-tab Exclusive Playback (BroadcastChannel)
   Zero modifications to core.min.js or free-guard.min.js. */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function dispatchControlEvents(el, withChange) {
    try {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      if (withChange) el.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (_) {}
  }

  function stepPreset(delta) {
    var sel = document.getElementById('presetSelect');
    if (!sel || !sel.options || sel.options.length === 0) return false;
    var len = sel.options.length;
    var idx = sel.selectedIndex;
    if (idx < 0) idx = 0;
    var next = (idx + delta + len) % len;
    sel.selectedIndex = next;
    dispatchControlEvents(sel, true);
    var applyBtn = document.getElementById('applyPreset');
    if (applyBtn) applyBtn.click();
    return true;
  }

  function getCurrentPresetLabel() {
    var sel = document.getElementById('presetSelect');
    if (sel && sel.options && sel.selectedIndex >= 0) {
      var opt = sel.options[sel.selectedIndex];
      if (opt && opt.textContent) return opt.textContent.trim();
    }
    return 'Ambient Noise';
  }

  function initPowerTools() {
    var panel = document.getElementById('panel');
    var playBtn = document.getElementById('playBtn');
    var stopBtn = document.getElementById('stopBtn');
    var isPlaying = false;

    /* =====================================================================
       Inject collapsible UI section (#sec-power)
       ===================================================================== */
    if (panel && !document.getElementById('sec-power')) {
      var sec = document.createElement('div');
      sec.className = 'section';
      sec.id = 'sec-power';
      sec.innerHTML =
        '<div class="head"><h2>パフォーマンス / ツール</h2><button class="collapse-btn" type="button" aria-expanded="true" aria-label="開閉"><span class="chev">▾</span></button></div>' +
        '<div class="body">' +
          /* 1. A/B Snapshot */
          '<div class="pt-block">' +
            '<div class="pt-title">A / B スナップショット比較</div>' +
            '<div class="pt-row">' +
              '<button id="abSaveA" class="secondary" type="button">A 保存</button>' +
              '<button id="abLoadA" class="secondary" type="button">A 呼出</button>' +
              '<button id="abSaveB" class="secondary" type="button">B 保存</button>' +
              '<button id="abLoadB" class="secondary" type="button">B 呼出</button>' +
              '<button id="abSwapBtn" class="secondary" type="button">A↔B 切替</button>' +
            '</div>' +
            '<div id="abStatus" class="pt-meta">A: 未保存 / B: 未保存</div>' +
          '</div>' +
          /* 2. XY Morphing Pad */
          '<div class="pt-block">' +
            '<div class="pt-title">XY モーフィングパッド</div>' +
            '<div class="pt-xy-axes">' +
              '<label class="pt-axis"><span>X</span><select id="xyAxisX"></select></label>' +
              '<label class="pt-axis"><span>Y</span><select id="xyAxisY"></select></label>' +
            '</div>' +
            '<canvas id="xyPad" width="280" height="160" aria-label="XY モーフィングパッド"></canvas>' +
            '<div id="xyReadout" class="pt-meta">ドラッグして 2 パラメータを同時に操作</div>' +
          '</div>' +
          /* 3. Visualizer Video Recording */
          '<div class="pt-block">' +
            '<div class="pt-title">ビジュアライザ動画録画</div>' +
            '<div class="pt-row">' +
              '<button id="recVizBtn" class="secondary" type="button">● 録画開始</button>' +
              '<span id="recVizTimer" class="pt-meta">待機中</span>' +
            '</div>' +
            '<div id="recVizOut" class="pt-rec-out"></div>' +
          '</div>' +
          /* 4. Infinite Ambient Auto-Cycle */
          '<div class="pt-block">' +
            '<div class="pt-title">無限アンビエント・オートサイクル</div>' +
            '<div class="pt-row">' +
              '<button id="autoCycleBtn" class="secondary" type="button">オート: OFF</button>' +
              '<select id="autoCycleSec" aria-label="切替間隔">' +
                '<option value="30">30秒</option>' +
                '<option value="60" selected>1分</option>' +
                '<option value="120">2分</option>' +
                '<option value="300">5分</option>' +
              '</select>' +
              '<select id="autoCycleMode" aria-label="対象">' +
                '<option value="all" selected>全プリセット</option>' +
                '<option value="fav">お気に入り優先</option>' +
              '</select>' +
            '</div>' +
            '<div id="autoCycleInfo" class="pt-meta">停止中</div>' +
          '</div>' +
        '</div>';

      var anchor = document.getElementById('sec-session');
      if (anchor && anchor.parentNode === panel) {
        panel.insertBefore(sec, anchor.nextSibling);
      } else {
        panel.appendChild(sec);
      }

      var head = sec.querySelector('.head');
      var collapseBtn = sec.querySelector('.collapse-btn');
      function setPowerCollapsed(collapsed) {
        sec.classList.toggle('collapsed', !!collapsed);
        if (collapseBtn && collapseBtn.setAttribute) {
          collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        }
      }
      if (head) {
        head.addEventListener('click', function () {
          setPowerCollapsed(!sec.classList.contains('collapsed'));
        });
      }
      var expandAllBtn = document.getElementById('expandAllBtn');
      var collapseAllBtn = document.getElementById('collapseAllBtn');
      if (expandAllBtn) expandAllBtn.addEventListener('click', function () { setPowerCollapsed(false); });
      if (collapseAllBtn) collapseAllBtn.addEventListener('click', function () { setPowerCollapsed(true); });
    }

    /* =====================================================================
       1. A/B Snapshot Comparison
       ===================================================================== */
    var AB_KEY = 'noise_power_ab_v1';
    var FIELD_CONTAINERS = ['masterFields', 'layerAFields', 'layerBFields', 'layerCFields'];
    var abState = { A: null, B: null, active: null };

    try {
      var savedAb = sessionStorage.getItem(AB_KEY);
      if (savedAb) {
        var parsed = JSON.parse(savedAb);
        if (parsed && typeof parsed === 'object') {
          abState.A = parsed.A || null;
          abState.B = parsed.B || null;
          abState.active = parsed.active || null;
        }
      }
    } catch (_) {}

    function persistAb() {
      try {
        sessionStorage.setItem(AB_KEY, JSON.stringify(abState));
      } catch (_) {}
    }

    function getParamControls() {
      var list = [];
      for (var i = 0; i < FIELD_CONTAINERS.length; i++) {
        var cid = FIELD_CONTAINERS[i];
        var box = document.getElementById(cid);
        if (!box) continue;
        var els = box.querySelectorAll('input, select');
        for (var j = 0; j < els.length; j++) {
          var el = els[j];
          if (el.type === 'file' || el.type === 'button' || el.type === 'submit') continue;
          var key = el.id || (el.name ? cid + ':' + el.name : cid + '#' + j);
          list.push({ key: key, el: el });
        }
      }
      return list;
    }

    function captureSnapshot() {
      var controls = getParamControls();
      var snap = {};
      for (var i = 0; i < controls.length; i++) {
        var c = controls[i];
        snap[c.key] = c.el.type === 'checkbox' ? !!c.el.checked : String(c.el.value);
      }
      return snap;
    }

    function applySnapshot(snap) {
      if (!snap || typeof snap !== 'object') return false;
      var controls = getParamControls();
      var applied = 0;
      for (var i = 0; i < controls.length; i++) {
        var c = controls[i];
        if (!Object.prototype.hasOwnProperty.call(snap, c.key)) continue;
        if (c.el.type === 'checkbox') {
          c.el.checked = !!snap[c.key];
        } else {
          c.el.value = String(snap[c.key]);
        }
        dispatchControlEvents(c.el, true);
        applied++;
      }
      return applied > 0;
    }

    function updateAbUi() {
      var st = document.getElementById('abStatus');
      var loadA = document.getElementById('abLoadA');
      var loadB = document.getElementById('abLoadB');
      if (loadA) loadA.classList.toggle('on', abState.active === 'A');
      if (loadB) loadB.classList.toggle('on', abState.active === 'B');
      if (st) {
        var aTxt = abState.A ? '保存済' : '未保存';
        var bTxt = abState.B ? '保存済' : '未保存';
        var actTxt = abState.active ? ' / 現在: ' + abState.active : '';
        st.textContent = 'A: ' + aTxt + ' / B: ' + bTxt + actTxt;
      }
    }

    var abSaveA = document.getElementById('abSaveA');
    var abLoadA = document.getElementById('abLoadA');
    var abSaveB = document.getElementById('abSaveB');
    var abLoadB = document.getElementById('abLoadB');
    var abSwapBtn = document.getElementById('abSwapBtn');

    if (abSaveA) abSaveA.addEventListener('click', function () {
      abState.A = captureSnapshot();
      abState.active = 'A';
      persistAb();
      updateAbUi();
    });
    if (abSaveB) abSaveB.addEventListener('click', function () {
      abState.B = captureSnapshot();
      abState.active = 'B';
      persistAb();
      updateAbUi();
    });
    if (abLoadA) abLoadA.addEventListener('click', function () {
      if (!abState.A) return;
      applySnapshot(abState.A);
      abState.active = 'A';
      persistAb();
      updateAbUi();
      if (typeof syncXyFromSliders === 'function') syncXyFromSliders();
    });
    if (abLoadB) abLoadB.addEventListener('click', function () {
      if (!abState.B) return;
      applySnapshot(abState.B);
      abState.active = 'B';
      persistAb();
      updateAbUi();
      if (typeof syncXyFromSliders === 'function') syncXyFromSliders();
    });
    if (abSwapBtn) abSwapBtn.addEventListener('click', function () {
      var target = abState.active === 'A' ? 'B' : 'A';
      if (!abState[target]) target = abState.A ? 'A' : (abState.B ? 'B' : null);
      if (!target) return;
      applySnapshot(abState[target]);
      abState.active = target;
      persistAb();
      updateAbUi();
      if (typeof syncXyFromSliders === 'function') syncXyFromSliders();
    });
    updateAbUi();

    /* =====================================================================
       2. XY Morphing Pad
       ===================================================================== */
    var xyCanvas = document.getElementById('xyPad');
    var xyAxisX = document.getElementById('xyAxisX');
    var xyAxisY = document.getElementById('xyAxisY');
    var xyReadout = document.getElementById('xyReadout');
    var xySliders = [];
    var xyState = { nx: 0.5, ny: 0.5, dragging: false, trail: [] };

    function getSliderLabel(el, containerId, idx) {
      var prefix = containerId.replace('Fields', '').replace('layer', 'L').replace('master', 'Master');
      var field = el.closest ? el.closest('.field') : null;
      var lbl = field ? field.querySelector('label span') || field.querySelector('label') : null;
      var text = lbl && lbl.textContent ? lbl.textContent.trim().replace(/\s+/g, ' ') : (el.id || ('Param ' + (idx + 1)));
      if (text.length > 26) text = text.slice(0, 26);
      return prefix + ': ' + text;
    }

    function populateXyAxes() {
      if (!xyAxisX || !xyAxisY) return;
      xySliders = [];
      for (var i = 0; i < FIELD_CONTAINERS.length; i++) {
        var cid = FIELD_CONTAINERS[i];
        var box = document.getElementById(cid);
        if (!box) continue;
        var ranges = box.querySelectorAll('input[type="range"]');
        for (var j = 0; j < ranges.length; j++) {
          var el = ranges[j];
          xySliders.push({
            el: el,
            label: getSliderLabel(el, cid, j)
          });
        }
      }
      xyAxisX.innerHTML = '';
      xyAxisY.innerHTML = '';
      for (var k = 0; k < xySliders.length; k++) {
        var o1 = document.createElement('option');
        o1.value = String(k);
        o1.textContent = xySliders[k].label;
        xyAxisX.appendChild(o1);
        var o2 = document.createElement('option');
        o2.value = String(k);
        o2.textContent = xySliders[k].label;
        xyAxisY.appendChild(o2);
      }
      if (xySliders.length > 0) {
        var defX = 0;
        var defY = xySliders.length > 1 ? 1 : 0;
        for (var s = 0; s < xySliders.length; s++) {
          var lb = xySliders[s].label.toLowerCase();
          if (defX === 0 && /cut|lpf|freq|tone|filter|tilt/.test(lb)) defX = s;
          else if (/space|reverb|drive|width|gain|air/.test(lb) && s !== defX) { defY = s; break; }
        }
        xyAxisX.value = String(defX);
        xyAxisY.value = String(defY);
        syncXyFromSliders();
      }
    }

    function sliderToNorm(el) {
      var min = parseFloat(el.min); if (isNaN(min)) min = 0;
      var max = parseFloat(el.max); if (isNaN(max)) max = 1;
      var val = parseFloat(el.value); if (isNaN(val)) val = min;
      if (max === min) return 0.5;
      return Math.max(0, Math.min(1, (val - min) / (max - min)));
    }

    function applyNormToSlider(el, norm, withChange) {
      var min = parseFloat(el.min); if (isNaN(min)) min = 0;
      var max = parseFloat(el.max); if (isNaN(max)) max = 1;
      var step = parseFloat(el.step);
      var v = min + Math.max(0, Math.min(1, norm)) * (max - min);
      if (!isNaN(step) && step > 0) {
        v = Math.round((v - min) / step) * step + min;
        var decimals = (String(step).split('.')[1] || '').length;
        v = Number(v.toFixed(Math.min(6, decimals)));
      }
      v = Math.max(min, Math.min(max, v));
      el.value = String(v);
      dispatchControlEvents(el, withChange);
      return v;
    }

    function drawXyPad() {
      if (!xyCanvas || !xyCanvas.getContext) return;
      var ctx = xyCanvas.getContext('2d');
      if (!ctx) return;
      var w = xyCanvas.width;
      var h = xyCanvas.height;
      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, w, h);

      // Subtle monochrome grid
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      for (var gx = 1; gx < 4; gx++) {
        var x = Math.round((w * gx) / 4) + 0.5;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (var gy = 1; gy < 4; gy++) {
        var y = Math.round((h * gy) / 4) + 0.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Trail
      if (xyState.trail.length > 1) {
        for (var t = 1; t < xyState.trail.length; t++) {
          var p0 = xyState.trail[t - 1];
          var p1 = xyState.trail[t];
          var alpha = (t / xyState.trail.length) * 0.45;
          ctx.strokeStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p0.nx * w, (1 - p0.ny) * h);
          ctx.lineTo(p1.nx * w, (1 - p1.ny) * h);
          ctx.stroke();
        }
      }

      // Crosshair & dot
      var px = xyState.nx * w;
      var py = (1 - xyState.ny) * h;
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    function syncXyFromSliders() {
      var sx = xySliders[Number(xyAxisX && xyAxisX.value)];
      var sy = xySliders[Number(xyAxisY && xyAxisY.value)];
      if (sx) xyState.nx = sliderToNorm(sx.el);
      if (sy) xyState.ny = sliderToNorm(sy.el);
      drawXyPad();
    }

    function handleXyPointer(e, withChange) {
      if (!xyCanvas) return;
      if (xySliders.length === 0) populateXyAxes();
      var rect = xyCanvas.getBoundingClientRect ? xyCanvas.getBoundingClientRect() : { left: 0, top: 0, width: xyCanvas.width, height: xyCanvas.height };
      var rw = rect.width || xyCanvas.width || 1;
      var rh = rect.height || xyCanvas.height || 1;
      var nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rw));
      var ny = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rh));
      xyState.nx = nx;
      xyState.ny = ny;
      xyState.trail.push({ nx: nx, ny: ny });
      if (xyState.trail.length > 18) xyState.trail.shift();

      var sx = xySliders[Number(xyAxisX && xyAxisX.value)];
      var sy = xySliders[Number(xyAxisY && xyAxisY.value)];
      var vx = sx ? applyNormToSlider(sx.el, nx, withChange) : nx.toFixed(2);
      var vy = sy ? applyNormToSlider(sy.el, ny, withChange) : ny.toFixed(2);
      if (xyReadout) {
        xyReadout.textContent = 'X: ' + vx + ' / Y: ' + vy;
      }
      drawXyPad();
    }

    if (xyAxisX) xyAxisX.addEventListener('change', syncXyFromSliders);
    if (xyAxisY) xyAxisY.addEventListener('change', syncXyFromSliders);
    if (xyCanvas) {
      xyCanvas.addEventListener('pointerdown', function (e) {
        xyState.dragging = true;
        if (xyCanvas.setPointerCapture && e.pointerId != null) {
          try { xyCanvas.setPointerCapture(e.pointerId); } catch (_) {}
        }
        handleXyPointer(e, false);
      });
      xyCanvas.addEventListener('pointermove', function (e) {
        if (!xyState.dragging) return;
        handleXyPointer(e, false);
      });
      var endDrag = function (e) {
        if (!xyState.dragging) return;
        xyState.dragging = false;
        handleXyPointer(e, true);
      };
      xyCanvas.addEventListener('pointerup', endDrag);
      xyCanvas.addEventListener('pointercancel', endDrag);
    }

    populateXyAxes();
    drawXyPad();

    /* =====================================================================
       3. Visualizer Video Recording (standard DOM / MediaRecorder)
       ===================================================================== */
    var recVizBtn = document.getElementById('recVizBtn');
    var recVizTimer = document.getElementById('recVizTimer');
    var recVizOut = document.getElementById('recVizOut');
    var recState = {
      recorder: null,
      chunks: [],
      timerId: null,
      startAt: 0,
      lastUrl: null,
      streams: [],
      audioTap: null,
      audioDest: null
    };

    function findActiveVizCanvas() {
      var readout = document.getElementById('readout');
      if (!readout) return null;
      var view = readout.getAttribute('data-view') || '';
      if (view === 'liquidgl') {
        var lgl = document.getElementById('liquidgl');
        if (lgl) return lgl;
      }
      if (view === 'particle') {
        var pp = document.getElementById('partPro') || document.getElementById('part');
        if (pp) return pp;
      }
      var cards = readout.querySelectorAll('.card');
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var dv = card.getAttribute('data-viz');
        if (view && view !== 'trio' && view !== 'grid' && dv !== view) continue;
        var c = (dv === 'particle' && card.querySelector('#partPro')) || card.querySelector('canvas');
        if (c) return c;
      }
      return readout.querySelector('canvas');
    }

    function formatElapsed(ms) {
      var sec = Math.max(0, Math.floor(ms / 1000));
      var m = String(Math.floor(sec / 60)).padStart(2, '0');
      var s = String(sec % 60).padStart(2, '0');
      return m + ':' + s;
    }

    function cleanupAudioTap() {
      if (recState.audioTap && recState.audioDest) {
        try { recState.audioTap.disconnect(recState.audioDest); } catch (_) {}
      }
      recState.audioTap = null;
      recState.audioDest = null;
    }

    function stopCapturedStreams() {
      for (var i = 0; i < recState.streams.length; i++) {
        var st = recState.streams[i];
        if (st && typeof st.getTracks === 'function') {
          var trs = st.getTracks();
          for (var j = 0; j < trs.length; j++) {
            try { if (trs[j] && typeof trs[j].stop === 'function') trs[j].stop(); } catch (_) {}
          }
        }
      }
      recState.streams = [];
    }

    function stopVizRecording() {
      if (recState.timerId) {
        clearInterval(recState.timerId);
        recState.timerId = null;
      }
      if (recState.recorder && recState.recorder.state !== 'inactive') {
        try { recState.recorder.stop(); } catch (_) {}
      }
      cleanupAudioTap();
      stopCapturedStreams();
      if (recVizBtn) {
        recVizBtn.textContent = '● 録画開始';
        recVizBtn.classList.remove('on');
      }
    }

    function startVizRecording() {
      var canvas = findActiveVizCanvas();
      if (!canvas || typeof canvas.captureStream !== 'function' || typeof window.MediaRecorder !== 'function') {
        if (recVizTimer) recVizTimer.textContent = 'このブラウザは動画録画に非対応です';
        return;
      }
      if (!canvas.width || !canvas.height) {
        if (recVizTimer) recVizTimer.textContent = '表示中のビジュアライザがありません';
        return;
      }
      var stream = canvas.captureStream(30);
      recState.streams = [stream];
      var tracks = stream.getVideoTracks ? stream.getVideoTracks().slice() : [];

      // Optionally tap active audio analyser if context supports MediaStreamDestination
      try {
        var ans = window.__noiseAnalysers || [];
        var activeAn = null;
        for (var i = ans.length - 1; i >= 0; i--) {
          if (ans[i] && ans[i].context && ans[i].context.state !== 'closed') {
            activeAn = ans[i];
            break;
          }
        }
        if (activeAn && typeof activeAn.context.createMediaStreamDestination === 'function') {
          var dest = activeAn.context.createMediaStreamDestination();
          activeAn.connect(dest);
          recState.audioTap = activeAn;
          recState.audioDest = dest;
          if (dest.stream) recState.streams.push(dest.stream);
          if (dest.stream && dest.stream.getAudioTracks) {
            var aTracks = dest.stream.getAudioTracks();
            for (var a = 0; a < aTracks.length; a++) tracks.push(aTracks[a]);
          }
        }
      } catch (_) {
        cleanupAudioTap();
      }

      var combined = (typeof window.MediaStream === 'function' && tracks.length > 0)
        ? new window.MediaStream(tracks)
        : stream;

      var mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      var chosenMime = '';
      if (typeof window.MediaRecorder.isTypeSupported === 'function') {
        for (var m = 0; m < mimeTypes.length; m++) {
          if (window.MediaRecorder.isTypeSupported(mimeTypes[m])) {
            chosenMime = mimeTypes[m];
            break;
          }
        }
      }

      recState.chunks = [];
      var mr;
      try {
        mr = chosenMime ? new window.MediaRecorder(combined, { mimeType: chosenMime }) : new window.MediaRecorder(combined);
      } catch (err) {
        cleanupAudioTap();
        stopCapturedStreams();
        if (recVizTimer) recVizTimer.textContent = '録画開始に失敗しました';
        return;
      }

      recState.recorder = mr;
      recState.startAt = Date.now();

      mr.ondataavailable = function (ev) {
        if (ev && ev.data && ev.data.size > 0) recState.chunks.push(ev.data);
      };
      mr.onstop = function () {
        if (recState.lastUrl && window.URL && window.URL.revokeObjectURL) {
          try { window.URL.revokeObjectURL(recState.lastUrl); } catch (_) {}
        }
        var mime = chosenMime || 'video/webm';
        var ext = mime.indexOf('mp4') >= 0 ? 'mp4' : 'webm';
        var blob = new Blob(recState.chunks, { type: mime });
        var url = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(blob) : '';
        recState.lastUrl = url;
        if (recVizTimer) recVizTimer.textContent = '録画完了 (' + Math.max(1, Math.round(blob.size / 1024)) + ' KB)';
        if (recVizOut && url) {
          recVizOut.innerHTML = '';
          var vid = document.createElement('video');
          vid.controls = true;
          vid.playsInline = true;
          vid.muted = true;
          vid.src = url;
          vid.className = 'pt-rec-video';
          var dl = document.createElement('a');
          dl.href = url;
          dl.download = 'noise-visualizer.' + ext;
          dl.textContent = '録画をダウンロード (.' + ext + ')';
          dl.className = 'pt-rec-dl';
          recVizOut.appendChild(vid);
          recVizOut.appendChild(dl);
        }
        recState.recorder = null;
      };

      mr.start(500);
      if (recVizBtn) {
        recVizBtn.textContent = '■ 録画停止';
        recVizBtn.classList.add('on');
      }
      if (recVizTimer) recVizTimer.textContent = '● REC 00:00';
      recState.timerId = setInterval(function () {
        if (recVizTimer) recVizTimer.textContent = '● REC ' + formatElapsed(Date.now() - recState.startAt);
      }, 500);
    }

    if (recVizBtn) {
      recVizBtn.addEventListener('click', function () {
        if (recState.recorder && recState.recorder.state !== 'inactive') {
          stopVizRecording();
        } else {
          startVizRecording();
        }
      });
    }

    /* =====================================================================
       4. Infinite Ambient Auto-Cycle
       ===================================================================== */
    var autoCycleBtn = document.getElementById('autoCycleBtn');
    var autoCycleSec = document.getElementById('autoCycleSec');
    var autoCycleMode = document.getElementById('autoCycleMode');
    var autoCycleInfo = document.getElementById('autoCycleInfo');
    var cycleTimer = null;
    var cycleRemaining = 0;

    function getCycleInterval() {
      var v = parseInt(autoCycleSec ? autoCycleSec.value : '60', 10);
      return isNaN(v) || v < 5 ? 60 : v;
    }

    var lastFavIdx = -1;
    function pickNextCyclePreset() {
      var mode = autoCycleMode ? autoCycleMode.value : 'all';
      if (mode === 'fav') {
        var chips = document.querySelectorAll('#presetQuick .q-chip');
        if (chips && chips.length > 0) {
          var idx = Math.floor(Math.random() * chips.length);
          if (chips.length > 1 && idx === lastFavIdx) idx = (idx + 1) % chips.length;
          lastFavIdx = idx;
          var nextChip = chips[idx];
          if (nextChip) {
            nextChip.click();
            return true;
          }
        }
      }
      return stepPreset(1);
    }

    function stopAutoCycle() {
      if (cycleTimer) {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
      if (autoCycleBtn) {
        autoCycleBtn.textContent = 'オート: OFF';
        autoCycleBtn.classList.remove('on');
      }
      if (autoCycleInfo) autoCycleInfo.textContent = '停止中';
    }

    function startAutoCycle() {
      stopAutoCycle();
      cycleRemaining = getCycleInterval();
      if (autoCycleBtn) {
        autoCycleBtn.textContent = 'オート: ON';
        autoCycleBtn.classList.add('on');
      }
      if (autoCycleInfo) autoCycleInfo.textContent = '次のプリセットまで ' + cycleRemaining + ' 秒';
      cycleTimer = setInterval(function () {
        cycleRemaining--;
        if (cycleRemaining <= 0) {
          pickNextCyclePreset();
          cycleRemaining = getCycleInterval();
        }
        if (autoCycleInfo) autoCycleInfo.textContent = '次のプリセットまで ' + cycleRemaining + ' 秒';
      }, 1000);
    }

    if (autoCycleBtn) {
      autoCycleBtn.addEventListener('click', function () {
        if (cycleTimer) stopAutoCycle();
        else startAutoCycle();
      });
    }
    if (autoCycleSec) {
      autoCycleSec.addEventListener('change', function () {
        if (cycleTimer) cycleRemaining = getCycleInterval();
      });
    }

    /* =====================================================================
       5. Media Session API
       ===================================================================== */
    function resolveArtwork() {
      try {
        if (window.location && /^https?:$/.test(window.location.protocol) && typeof URL === 'function') {
          return [{ src: new URL('assets/noise-kamon-white.png', window.location.href).href, sizes: '512x512', type: 'image/png' }];
        }
      } catch (_) {}
      return [];
    }

    function updateMediaSession(playing) {
      var ms = typeof navigator !== 'undefined' ? navigator.mediaSession : null;
      if (!ms) return;
      try {
        if (typeof window.MediaMetadata === 'function') {
          ms.metadata = new window.MediaMetadata({
            title: getCurrentPresetLabel(),
            artist: 'VARELSER Noise',
            album: 'Noise Generator',
            artwork: resolveArtwork()
          });
        }
      } catch (_) {}
      try {
        ms.playbackState = playing ? 'playing' : 'paused';
      } catch (_) {}
    }

    (function setupMediaSession() {
      var ms = typeof navigator !== 'undefined' ? navigator.mediaSession : null;
      if (!ms || typeof ms.setActionHandler !== 'function') return;
      var bind = function (action, handler) {
        try { ms.setActionHandler(action, handler); } catch (_) {}
      };
      bind('play', function () {
        if (playBtn) playBtn.click();
      });
      bind('pause', function () {
        if (stopBtn) stopBtn.click();
      });
      bind('stop', function () {
        if (stopBtn) stopBtn.click();
      });
      bind('nexttrack', function () {
        stepPreset(1);
        updateMediaSession(isPlaying);
      });
      bind('previoustrack', function () {
        stepPreset(-1);
        updateMediaSession(isPlaying);
      });
    })();

    /* =====================================================================
       6. Multi-tab Exclusive Playback (BroadcastChannel)
       ===================================================================== */
    var tabId = 'tab_' + Math.random().toString(36).slice(2) + '_' + Date.now();
    var bc = null;
    var suppressBroadcast = false;

    if (typeof window.BroadcastChannel === 'function') {
      try {
        bc = new window.BroadcastChannel('varelser-noise-transport');
        bc.onmessage = function (ev) {
          var msg = ev && ev.data;
          if (!msg || msg.type !== 'playing' || msg.tabId === tabId) return;
          if (isPlaying && stopBtn) {
            suppressBroadcast = true;
            stopBtn.click();
            notifyPlaybackState(false);
            suppressBroadcast = false;
          }
        };
        window.addEventListener('beforeunload', function () {
          try { bc.close(); } catch (_) {}
        });
      } catch (_) {
        bc = null;
      }
    }

    function notifyPlaybackState(playing) {
      if (playing === isPlaying) return;
      isPlaying = playing;
      updateMediaSession(playing);
      if (playing) {
        if (bc && !suppressBroadcast) {
          try { bc.postMessage({ type: 'playing', tabId: tabId, ts: Date.now() }); } catch (_) {}
        }
      } else {
        if (cycleTimer) stopAutoCycle();
      }
    }

    if (playBtn) {
      playBtn.addEventListener('click', function () { notifyPlaybackState(true); });
    }
    if (stopBtn) {
      stopBtn.addEventListener('click', function () { notifyPlaybackState(false); });
    }

    // Also observe #status so Space key, MIDI, Sleep Timer, or Studio Link stay in sync
    var statusEl = document.getElementById('status');
    if (statusEl && typeof MutationObserver === 'function') {
      try {
        new MutationObserver(function () {
          var txt = statusEl.textContent || '';
          if (txt.indexOf('再生中') >= 0) notifyPlaybackState(true);
          else if (isPlaying && (txt.indexOf('停止') >= 0 || txt.indexOf('待機') >= 0)) notifyPlaybackState(false);
        }).observe(statusEl, { childList: true, characterData: true, subtree: true });
      } catch (_) {}
    }

    var applyBtn = document.getElementById('applyPreset');
    var presetSel = document.getElementById('presetSelect');
    var randBtn = document.getElementById('randomizeAll');
    var resetBtn = document.getElementById('resetBtn');
    function deferredXySync() {
      if (typeof setTimeout === 'function') setTimeout(syncXyFromSliders, 0);
      else syncXyFromSliders();
    }
    if (applyBtn) applyBtn.addEventListener('click', function () { updateMediaSession(isPlaying); deferredXySync(); });
    if (presetSel) presetSel.addEventListener('change', function () { updateMediaSession(isPlaying); deferredXySync(); });
    if (randBtn) randBtn.addEventListener('click', deferredXySync);
    if (resetBtn) resetBtn.addEventListener('click', deferredXySync);
  }

  ready(initPowerTools);
})();
