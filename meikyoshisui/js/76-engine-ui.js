/* 76-engine-ui.js — エンジン系 UI 同期と描画
 * CA プレビュー、アトラクター、純正律 / リズムカノン描画、コンダクター Viz の UI 同期。
 * (2026-11-11: 90-patch-shared.js から機能ドメイン別に分散。本体モジュール。)
 */
(() => {
  'use strict';

  const PATCH = window.__MEIKY_PATCH__ || {};

  PATCH.drawCAPreviewPatched = function drawCAPreviewPatched() {
    if (typeof CellularAutomaton === 'undefined') return;
    const canvas = document.getElementById('caViz');
    if (!canvas) return;
    const rule = PATCH.getAutoCARule();
    const inst = CellularAutomaton.create({ width: 64, rule, seed: CA_PARAMS.seed, rows: 80 });
    const width = canvas.offsetWidth || 340;
    const height = 80;
    const rows = Math.min(inst.history.length, height);
    const cols = inst.width;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    const cw = width / cols;
    const rh = height / rows;
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      const row = inst.history[rowIndex];
      for (let colIndex = 0; colIndex < cols; colIndex++) {
        if (!row[colIndex]) continue;
        ctx.fillStyle = 'rgba(0,229,255,0.75)';
        ctx.fillRect(
          Math.floor(colIndex * cw),
          Math.floor(rowIndex * rh),
          Math.max(1, Math.ceil(cw)),
          Math.max(1, Math.ceil(rh))
        );
      }
    }
  };

  PATCH.syncCAPreviewUI = function syncCAPreviewUI() {
    if (typeof CA_PARAMS === 'undefined') return;
    const overrideTog = document.getElementById('caOverrideTog');
    const overrideLabel = document.getElementById('caOverrideLabel');
    const manualControls = document.getElementById('caManualControls');
    const ruleSlider = document.getElementById('caRule');
    const ruleVal = document.getElementById('caRuleV');
    const ruleName = document.getElementById('caRuleName');
    if (overrideTog) overrideTog.classList.toggle('on', !!CA_PARAMS.override);
    if (overrideLabel) overrideLabel.textContent = CA_PARAMS.override ? 'MANUAL (手動指定)' : 'AUTO (ジャンル連動)';
    if (manualControls) manualControls.style.display = CA_PARAMS.override ? 'block' : 'none';
    if (ruleSlider) ruleSlider.value = CA_PARAMS.rule;
    if (ruleVal) ruleVal.textContent = String(CA_PARAMS.rule);
    if (ruleName && typeof CellularAutomaton !== 'undefined') {
      const shownRule = CA_PARAMS.override ? CA_PARAMS.rule : PATCH.getAutoCARule();
      const presetName = CellularAutomaton.PRESETS[shownRule] || '(unnamed)';
      ruleName.textContent = 'Rule ' + shownRule + ' — ' + presetName;
    }
    PATCH.drawCAPreviewPatched();
  };

  PATCH.syncAttractorUI = function syncAttractorUI() {
    if (typeof ATTRACTOR_STATE === 'undefined') return;
    const tog = document.getElementById('togAttractor');
    const controls = document.getElementById('attractorControls');
    const legacyPanel = document.getElementById('lorenzLegacyPanel');
    const typeRow = document.getElementById('atTypeRow');
    const presets = document.querySelectorAll('.at-preset-btn');
    const labels = {
      lorenz: { a: 'A (σ)', b: 'B (ρ)', c: 'C (β)', aMin: 1, aMax: 30, bMin: 1, bMax: 60, cMin: 0.1, cMax: 15 },
      rossler: { a: 'A', b: 'B', c: 'C', aMin: 0.01, aMax: 1, bMin: 0.01, bMax: 5, cMin: 1, cMax: 20 },
      thomas: { a: 'B (diss)', b: '—', c: '—', aMin: 0.05, aMax: 0.5, bMin: 0, bMax: 1, cMin: 0, cMax: 1 },
    }[ATTRACTOR_STATE.type] || {
      a: 'A (σ)', b: 'B (ρ)', c: 'C (β)', aMin: 1, aMax: 30, bMin: 1, bMax: 60, cMin: 0.1, cMax: 15,
    };

    if (tog) tog.classList.toggle('on', !!ATTRACTOR_STATE.enabled);
    if (controls) controls.style.display = ATTRACTOR_STATE.enabled ? 'block' : 'none';
    if (legacyPanel) legacyPanel.style.display = ATTRACTOR_STATE.enabled ? 'none' : '';
    if (typeRow) {
      typeRow.querySelectorAll('.at-type-btn').forEach(btn => {
        btn.classList.toggle('on', btn.dataset.type === ATTRACTOR_STATE.type);
      });
    }
    presets.forEach(btn => {
      btn.classList.toggle('on', btn.textContent === (typeof AttractorEngine !== 'undefined' &&
        AttractorEngine.PRESETS &&
        AttractorEngine.PRESETS[ATTRACTOR_STATE.activePreset] &&
        AttractorEngine.PRESETS[ATTRACTOR_STATE.activePreset].label));
    });

    const labelA = document.getElementById('atLabelA');
    const labelB = document.getElementById('atLabelB');
    const labelC = document.getElementById('atLabelC');
    if (labelA) labelA.textContent = labels.a;
    if (labelB) labelB.textContent = labels.b;
    if (labelC) labelC.textContent = labels.c;

    const paramA = document.getElementById('atParamA');
    const paramB = document.getElementById('atParamB');
    const paramC = document.getElementById('atParamC');
    const paramAV = document.getElementById('atParamAV');
    const paramBV = document.getElementById('atParamBV');
    const paramCV = document.getElementById('atParamCV');
    if (paramA) { paramA.min = labels.aMin; paramA.max = labels.aMax; paramA.value = ATTRACTOR_STATE.a; }
    if (paramB) { paramB.min = labels.bMin; paramB.max = labels.bMax; paramB.value = ATTRACTOR_STATE.b; }
    if (paramC) { paramC.min = labels.cMin; paramC.max = labels.cMax; paramC.value = ATTRACTOR_STATE.c; }
    if (paramAV) paramAV.textContent = parseFloat(ATTRACTOR_STATE.a).toFixed(2);
    if (paramBV) paramBV.textContent = parseFloat(ATTRACTOR_STATE.b).toFixed(2);
    if (paramCV) paramCV.textContent = parseFloat(ATTRACTOR_STATE.c).toFixed(2);
    if (paramB && paramB.parentElement) paramB.parentElement.style.opacity = ATTRACTOR_STATE.type === 'thomas' ? '0.35' : '1';
    if (paramC && paramC.parentElement) paramC.parentElement.style.opacity = ATTRACTOR_STATE.type === 'thomas' ? '0.35' : '1';

    const dt = document.getElementById('atDt');
    const dtV = document.getElementById('atDtV');
    const warmup = document.getElementById('atWarmup');
    const warmupV = document.getElementById('atWarmupV');
    if (dt) dt.value = Math.round(ATTRACTOR_STATE.dt * 1000);
    if (dtV) dtV.textContent = Number(ATTRACTOR_STATE.dt).toFixed(3);
    if (warmup) warmup.value = ATTRACTOR_STATE.warmup;
    if (warmupV) warmupV.textContent = String(ATTRACTOR_STATE.warmup);

    ['X', 'Y', 'Z'].forEach(axis => {
      const mapEl = document.getElementById('atMap' + axis);
      const scaleEl = document.getElementById('atScale' + axis);
      const scaleValueEl = document.getElementById('atScale' + axis + 'V');
      const mapKey = 'map' + axis;
      const scaleKey = 'scale' + axis;
      if (mapEl && ATTRACTOR_STATE[mapKey] != null) mapEl.value = ATTRACTOR_STATE[mapKey];
      if (scaleEl && ATTRACTOR_STATE[scaleKey] != null) scaleEl.value = ATTRACTOR_STATE[scaleKey];
      if (scaleValueEl && ATTRACTOR_STATE[scaleKey] != null) scaleValueEl.textContent = ATTRACTOR_STATE[scaleKey] + '%';
    });

    const canvas = document.getElementById('atCanvas');
    if (canvas && typeof AttractorEngine !== 'undefined') {
      setTimeout(() => {
        canvas.width = canvas.offsetWidth || 400;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const inst = AttractorEngine.create(ATTRACTOR_STATE.type, {
          a: ATTRACTOR_STATE.a,
          b: ATTRACTOR_STATE.b,
          c: ATTRACTOR_STATE.c,
          dt: ATTRACTOR_STATE.dt,
        });
        inst.stepN(Math.min(ATTRACTOR_STATE.warmup, 500));
        const points = [];
        for (let index = 0; index < 600; index++) {
          inst.step();
          points.push({ ...inst.state });
        }
        const xs = points.map(point => point.x);
        const ys = points.map(point => point.y);
        const zs = points.map(point => point.z);
        const xMin = Math.min(...xs), xMax = Math.max(...xs);
        const yMin = Math.min(...ys), yMax = Math.max(...ys);
        const zMin = Math.min(...zs), zMax = Math.max(...zs);
        const mx = xMax === xMin ? 1 : xMax - xMin;
        const my = yMax === yMin ? 1 : yMax - yMin;
        const mz = zMax === zMin ? 1 : zMax - zMin;
        const pad = 10;
        const width = canvas.width - pad * 2;
        const height = canvas.height - pad * 2;
        const colors = { lorenz: '#ffcc00', rossler: '#ff6b35', thomas: '#1de9b6' };
        const baseColor = colors[ATTRACTOR_STATE.type] || '#ffcc00';
        ctx.lineWidth = 0.8;
        for (let index = 1; index < points.length; index++) {
          const prev = points[index - 1];
          const next = points[index];
          const px = pad + (prev.x - xMin) / mx * width;
          const py = pad + (1 - (prev.y - yMin) / my) * height;
          const nx = pad + (next.x - xMin) / mx * width;
          const ny = pad + (1 - (next.y - yMin) / my) * height;
          const alpha = 0.15 + 0.55 * (next.z - zMin) / mz;
          ctx.strokeStyle = baseColor + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }
      }, 0);
    }
  };

  PATCH.drawJustIntonationPatched = function drawJustIntonationPatched() {
    if (typeof JustIntonation === 'undefined' || typeof JI_PARAMS === 'undefined') return;
    const canvas = document.getElementById('jiDeviationCanvas');
    const info = document.getElementById('jiInfo');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 300;
    canvas.height = 72;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    if (!JI_PARAMS.enabled || typeof S === 'undefined' || !S || !S.chord) {
      ctx.fillStyle = 'rgba(0,230,118,0.08)';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const root = S.chord.root;
    const rows = JustIntonation.getDeviationTable(root, JI_PARAMS);
    const chordPcs = S.chord.iv.map(iv => ((S.chord.root + iv) % 12 + 12) % 12);
    const barWidth = width / 12;
    const maxDeviation = 50;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(0,230,118,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    rows.forEach((row, index) => {
      const x = index * barWidth;
      const deviation = Math.max(-maxDeviation, Math.min(maxDeviation, row.deviation));
      const barHeight = Math.abs(deviation) / maxDeviation * (height / 2 - 4);
      const y = deviation >= 0 ? height / 2 - barHeight : height / 2;
      const isChordTone = chordPcs.includes(row.pc);
      ctx.fillStyle = isChordTone ? 'rgba(0,230,118,0.75)' : 'rgba(0,180,100,0.35)';
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      ctx.fillStyle = isChordTone ? '#00e676' : 'rgba(0,230,118,0.55)';
      ctx.font = '7px Share Tech Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(row.name, x + barWidth / 2, height - 2);
    });

    if (info) {
      const consonance = JustIntonation.consonanceScore(chordPcs, root, JI_PARAMS);
      info.textContent = 'MODE: ' + JI_PARAMS.mode.toUpperCase()
        + '  BLEND: ' + Math.round(JI_PARAMS.blend * 100) + '%'
        + '  CONSONANCE: ' + (consonance * 100).toFixed(1) + '%'
        + (JI_PARAMS.adaptiveMemoryEnabled
          ? '  MEMORY: ' + Math.round((JI_PARAMS.adaptiveMemoryStrength || 0) * 100) + '%'
            + '  OFFSET: ' + PATCH.formatSignedCents(PATCH.jiAdaptiveMemory ? PATCH.jiAdaptiveMemory.lastOffsetCents : 0)
          : '');
    }
  };

  PATCH.syncJustIntonationUI = function syncJustIntonationUI() {
    if (typeof JI_PARAMS === 'undefined') return;
    const tog = document.getElementById('togJI');
    const modeRow = document.getElementById('jiModeRow');
    const blendEl = document.getElementById('jiBlend');
    const blendValue = document.getElementById('jiBlendV');
    const harmonicRow = document.getElementById('jiHarmonicRow');
    const harmonicEl = document.getElementById('jiHarmonicLimit');
    const harmonicValue = document.getElementById('jiHarmonicLimitV');
    const adaptiveBtn = document.getElementById('jiAdaptiveMemoryBtn');
    const adaptiveStrength = document.getElementById('jiAdaptiveMemoryStrength');
    const adaptiveStrengthValue = document.getElementById('jiAdaptiveMemoryStrengthV');
    const adaptiveBassBias = document.getElementById('jiAdaptiveBassBias');
    const adaptiveBassBiasValue = document.getElementById('jiAdaptiveBassBiasV');
    const adaptiveVoiceLeading = document.getElementById('jiAdaptiveVoiceLeading');
    const adaptiveVoiceLeadingValue = document.getElementById('jiAdaptiveVoiceLeadingV');
    const adaptiveCadenceBtn = document.getElementById('jiAdaptiveCadenceBtn');
    const adaptiveCadenceStrength = document.getElementById('jiAdaptiveCadenceStrength');
    const adaptiveCadenceStrengthValue = document.getElementById('jiAdaptiveCadenceStrengthV');
    const adaptiveSectionBtn = document.getElementById('jiAdaptiveSectionBtn');
    const sectionModBtn = document.getElementById('jiSectionModBtn');
    const sectionFollowBtn = document.getElementById('jiSectionFollowBtn');
    const sectionWrap = document.getElementById('jiSectionProfiles');
    const adaptiveInfo = document.getElementById('jiAdaptiveMemoryInfo');
    const follow = PATCH.ensureSectionPreviewFollow();
    const previewState = PATCH.previewTransportState || { bar: 0 };
    if (tog) tog.classList.toggle('on', !!JI_PARAMS.enabled);
    if (modeRow) {
      modeRow.querySelectorAll('.ji-mode-btn').forEach(btn => {
        btn.classList.toggle('on', btn.dataset.mode === JI_PARAMS.mode);
      });
    }
    if (blendEl) blendEl.value = Math.round(JI_PARAMS.blend * 100);
    if (blendValue) blendValue.textContent = Math.round(JI_PARAMS.blend * 100) + '%';
    if (harmonicRow) {
      harmonicRow.style.display = (JI_PARAMS.mode === 'harmonic' || JI_PARAMS.mode === 'utonal') ? 'flex' : 'none';
    }
    if (harmonicEl) harmonicEl.value = JI_PARAMS.harmonicLimit;
    if (harmonicValue) harmonicValue.textContent = String(JI_PARAMS.harmonicLimit);
    if (adaptiveBtn) adaptiveBtn.classList.toggle('on', !!JI_PARAMS.adaptiveMemoryEnabled);
    if (adaptiveStrength) adaptiveStrength.value = Math.round((Number(JI_PARAMS.adaptiveMemoryStrength) || 0) * 100);
    if (adaptiveStrengthValue) adaptiveStrengthValue.textContent = Math.round((Number(JI_PARAMS.adaptiveMemoryStrength) || 0) * 100) + '%';
    if (adaptiveBassBias) adaptiveBassBias.value = Math.round((Number(JI_PARAMS.adaptiveBassAnchorStrength) || 0) * 100);
    if (adaptiveBassBiasValue) adaptiveBassBiasValue.textContent = Math.round((Number(JI_PARAMS.adaptiveBassAnchorStrength) || 0) * 100) + '%';
    if (adaptiveVoiceLeading) adaptiveVoiceLeading.value = Math.round((Number(JI_PARAMS.adaptiveVoiceLeadingStrength) || 0) * 100);
    if (adaptiveVoiceLeadingValue) adaptiveVoiceLeadingValue.textContent = Math.round((Number(JI_PARAMS.adaptiveVoiceLeadingStrength) || 0) * 100) + '%';
    if (adaptiveCadenceBtn) adaptiveCadenceBtn.classList.toggle('on', !!JI_PARAMS.adaptiveCadenceResetEnabled);
    if (adaptiveCadenceStrength) adaptiveCadenceStrength.value = Math.round((Number(JI_PARAMS.adaptiveCadenceResetStrength) || 0) * 100);
    if (adaptiveCadenceStrengthValue) adaptiveCadenceStrengthValue.textContent = Math.round((Number(JI_PARAMS.adaptiveCadenceResetStrength) || 0) * 100) + '%';
    if (adaptiveSectionBtn) adaptiveSectionBtn.classList.toggle('on', !!JI_PARAMS.adaptiveResetOnSection);
    if (sectionModBtn) sectionModBtn.classList.toggle('on', !!JI_PARAMS.sectionModEnabled);
    if (sectionFollowBtn) sectionFollowBtn.classList.toggle('on', !!follow.ji);
    if (adaptiveInfo) {
      adaptiveInfo.textContent = JI_PARAMS.adaptiveMemoryEnabled
        ? 'COMMON-TONE DRIFT: ' + PATCH.formatSignedCents(PATCH.jiAdaptiveMemory ? PATCH.jiAdaptiveMemory.lastOffsetCents : 0)
          + '  |  COMMON PCS: ' + (PATCH.jiAdaptiveMemory ? PATCH.jiAdaptiveMemory.lastCommonCount : 0)
          + '  |  BASS BIAS: ' + Math.round((Number(JI_PARAMS.adaptiveBassAnchorStrength) || 0) * 100) + '%'
          + '  |  VL: ' + Math.round((Number(JI_PARAMS.adaptiveVoiceLeadingStrength) || 0) * 100) + '%'
          + '  |  CADENCE: ' + (JI_PARAMS.adaptiveCadenceResetEnabled
              ? ((PATCH.jiAdaptiveMemory && PATCH.jiAdaptiveMemory.lastCadenceType) || 'ARMED')
              : 'OFF')
          + '  |  SECTION RESET: ' + (JI_PARAMS.adaptiveResetOnSection ? 'ON' : 'OFF')
          + '  |  FOLLOW: ' + (follow.ji ? ('BAR ' + (previewState.bar + 1)) : 'MANUAL')
        : 'ADAPTIVE MEMORY OFF';
    }
    if (sectionWrap) {
      const profiles = PATCH.ensureJiSectionProfiles();
      sectionWrap.style.display = JI_PARAMS.sectionModEnabled && profiles.length ? '' : 'none';
      sectionWrap.innerHTML = profiles.map((profile, index) =>
        '<div data-ji-section-index="' + index + '" style="border:1px solid ' + (index === (Number(PATCH.sectionLearnFocus.ji) || 0) ? 'var(--cyan)' : 'var(--border)') + ';padding:8px 10px;margin-bottom:8px;background:' + (index === (Number(PATCH.sectionLearnFocus.ji) || 0) ? 'rgba(34,211,238,.08)' : 'rgba(255,255,255,.02)') + ';cursor:pointer;">' +
          '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:#b7f7d1;letter-spacing:2px;margin-bottom:6px;">' +
            profile.name + ' @ BAR ' + (profile.bar + 1) + (index === (Number(PATCH.sectionLearnFocus.ji) || 0) ? '  |  LEARN TARGET' : '') +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:6px;">' +
            '<label style="font-size:8px;color:var(--text-dim);">MODE</label>' +
            '<select data-ji-section-mode="' + index + '" class="midi-in-select" style="min-width:110px;">' +
              ['limit5','limit7','limit11','harmonic','utonal'].map(mode =>
                '<option value="' + mode + '"' + (mode === profile.mode ? ' selected' : '') + '>' + mode.toUpperCase() + '</option>'
              ).join('') +
            '</select>' +
            '<label style="font-size:8px;color:var(--text-dim);">BLEND</label>' +
            '<input data-ji-section-blend="' + index + '" type="range" min="0" max="100" step="1" value="' + Math.round((profile.blend || 0) * 100) + '" style="flex:1;min-width:120px;">' +
            '<div data-ji-section-blend-v="' + index + '" style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--cyan);min-width:36px;">' + Math.round((profile.blend || 0) * 100) + '%</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
            '<label style="font-size:8px;color:var(--text-dim);">HARMONIC LIMIT</label>' +
            '<input data-ji-section-harmonic="' + index + '" type="range" min="2" max="32" step="1" value="' + (profile.harmonicLimit || 16) + '" style="flex:1;min-width:120px;">' +
            '<div data-ji-section-harmonic-v="' + index + '" style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--cyan);min-width:24px;">' + (profile.harmonicLimit || 16) + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px;">' +
            '<label style="font-size:8px;color:var(--text-dim);">BASS BIAS</label>' +
            '<input data-ji-section-bass="' + index + '" type="range" min="0" max="100" step="1" value="' + Math.round((profile.adaptiveBassAnchorStrength || 0) * 100) + '" style="flex:1;min-width:120px;">' +
            '<div data-ji-section-bass-v="' + index + '" style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--cyan);min-width:36px;">' + Math.round((profile.adaptiveBassAnchorStrength || 0) * 100) + '%</div>' +
            '<label style="font-size:8px;color:var(--text-dim);">VL</label>' +
            '<input data-ji-section-vl="' + index + '" type="range" min="0" max="100" step="1" value="' + Math.round((profile.adaptiveVoiceLeadingStrength || 0) * 100) + '" style="flex:1;min-width:120px;">' +
            '<div data-ji-section-vl-v="' + index + '" style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--cyan);min-width:36px;">' + Math.round((profile.adaptiveVoiceLeadingStrength || 0) * 100) + '%</div>' +
            '<button class="midi-in-btn' + (profile.adaptiveCadenceResetEnabled ? ' on' : '') + '" data-ji-section-cadence-btn="' + index + '" type="button">CADENCE</button>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px;">' +
            '<label style="font-size:8px;color:var(--text-dim);">CAD STR</label>' +
            '<input data-ji-section-cadence="' + index + '" type="range" min="0" max="100" step="1" value="' + Math.round((profile.adaptiveCadenceResetStrength || 0) * 100) + '" style="flex:1;min-width:120px;">' +
            '<div data-ji-section-cadence-v="' + index + '" style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--cyan);min-width:36px;">' + Math.round((profile.adaptiveCadenceResetStrength || 0) * 100) + '%</div>' +
          '</div>' +
        '</div>'
      ).join('');
    }
    PATCH.drawJustIntonationPatched();
    PATCH.syncPatchDiagnosticsUI();
  };

  PATCH.drawRhythmicCanonsPatched = function drawRhythmicCanonsPatched() {
    if (typeof RhythmicCanons === 'undefined' || typeof RC_PARAMS === 'undefined') return;
    const canvas = document.getElementById('rcPatternCanvas');
    const info = document.getElementById('rcInfo');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 320;
    canvas.height = 56;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0d0600';
    ctx.fillRect(0, 0, width, height);
    if (!RC_PARAMS.enabled) {
      ctx.fillStyle = 'rgba(255,109,0,0.08)';
      ctx.fillRect(0, 0, width, height);
      if (info) info.textContent = 'RHYTHMIC CANONS — 無効';
      return;
    }

    const patternInfo = RhythmicCanons.getPatternInfo(RC_PARAMS);
    const n = patternInfo.n;
    const cellWidth = width / n;
    const rowHeight = patternInfo.voices.length > 0 ? Math.floor((height - 8) / patternInfo.voices.length) : height - 8;
    patternInfo.voices.forEach((voice, voiceIndex) => {
      const y = 4 + voiceIndex * rowHeight;
      voice.binary.forEach((bit, index) => {
        ctx.fillStyle = bit
          ? (voiceIndex === 0 ? 'rgba(255,109,0,0.85)' : 'rgba(255,145,0,0.65)')
          : 'rgba(255,109,0,0.06)';
        ctx.fillRect(index * cellWidth + 1, y, cellWidth - 2, rowHeight - 2);
      });
      ctx.fillStyle = voiceIndex === 0 ? '#ff6d00' : '#ff9100';
      ctx.font = '7px Share Tech Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(voice.label + '  density:' + (voice.density * 100).toFixed(0) + '%', 2, y + rowHeight - 3);
    });
    if (info) info.textContent = 'MODE: ' + RC_PARAMS.mode.toUpperCase() + '  n=' + n;
  };

  PATCH.rebuildRhythmicCanonPresets = function rebuildRhythmicCanonPresets() {
    if (typeof RhythmicCanons === 'undefined' || typeof RC_PARAMS === 'undefined') return;
    const presetsEl = document.getElementById('rcPresets');
    const presetWrap = document.getElementById('rcPresetWrap');
    const presetN = document.getElementById('rcPresetN');
    if (!presetsEl || !presetWrap) return;

    const isVuza = RC_PARAMS.mode === 'vuza' || RC_PARAMS.mode === 'tiling';
    presetWrap.style.display = isVuza ? '' : 'none';
    presetsEl.innerHTML = '';
    if (!isVuza) return;

    if (presetN) presetN.textContent = String(RC_PARAMS.n);
    const presets = RhythmicCanons.getPresets(RC_PARAMS.n);
    presets.forEach((preset, index) => {
      const btn = document.createElement('div');
      btn.className = 'rc-preset-btn' + (RC_PARAMS.presetIndex === index ? ' on' : '');
      btn.textContent = 'P' + (index + 1) + ': [' + preset.A + ']';
      btn.title = preset.label;
      btn.addEventListener('click', () => {
        RC_PARAMS.presetIndex = index;
        PATCH.rebuildRhythmicCanonPresets();
        PATCH.drawRhythmicCanonsPatched();
      });
      presetsEl.appendChild(btn);
    });
  };

  PATCH.syncRhythmicCanonsUI = function syncRhythmicCanonsUI() {
    if (typeof RC_PARAMS === 'undefined') return;
    const tog = document.getElementById('togRC');
    const modeRow = document.getElementById('rcModeRow');
    const presetWrap = document.getElementById('rcPresetWrap');
    const presetN = document.getElementById('rcPresetN');
    const nEl = document.getElementById('rcN');
    const nValue = document.getElementById('rcNV');
    const voicesEl = document.getElementById('rcVoices');
    const voicesValue = document.getElementById('rcVoicesV');
    const messiaenRow = document.getElementById('rcMessiaenRow');
    const messiaenEl = document.getElementById('rcMessiaenPattern');
    const polymeterRow = document.getElementById('rcPolymeterRow');
    const polymeterEl = document.getElementById('rcPolymeterCycles');
    if (tog) tog.classList.toggle('on', !!RC_PARAMS.enabled);
    if (modeRow) {
      modeRow.querySelectorAll('.rc-mode-btn').forEach(btn => {
        btn.classList.toggle('on', btn.dataset.mode === RC_PARAMS.mode);
      });
    }
    PATCH.rebuildRhythmicCanonPresets();
    if (presetWrap) presetWrap.style.display = (RC_PARAMS.mode === 'vuza' || RC_PARAMS.mode === 'tiling') ? '' : 'none';
    if (presetN) presetN.textContent = String(RC_PARAMS.n);
    if (nEl) nEl.value = RC_PARAMS.n;
    if (nValue) nValue.textContent = String(RC_PARAMS.n);
    if (voicesEl) voicesEl.value = RC_PARAMS.voices;
    if (voicesValue) voicesValue.textContent = String(RC_PARAMS.voices);
    if (messiaenRow) messiaenRow.style.display = RC_PARAMS.mode === 'messiaen' ? 'block' : 'none';
    if (messiaenEl) messiaenEl.value = (RC_PARAMS.messiaenPattern || []).join(',');
    if (polymeterRow) polymeterRow.style.display = RC_PARAMS.mode === 'polymeter' ? 'block' : 'none';
    if (polymeterEl) polymeterEl.value = (RC_PARAMS.polymeterCycles || []).join(',');
    PATCH.drawRhythmicCanonsPatched();
  };

  PATCH.syncConductorVizUI = function syncConductorVizUI() {
    if (typeof CONDUCTOR_VIZ_STATE === 'undefined') return;
    const hasState = typeof S !== 'undefined' && !!S;
    const tog = document.getElementById('togCV');
    const editBtn = document.getElementById('cvEditBtn');
    const info = document.getElementById('cvInfo');
    const canvas = document.getElementById('conductorVizCanvas');
    if (tog) tog.classList.toggle('on', !!CONDUCTOR_VIZ_STATE.enabled);
    if (editBtn) editBtn.classList.toggle('on', !!CONDUCTOR_VIZ_STATE.editMode);
    if (info) {
      if (!CONDUCTOR_VIZ_STATE.enabled) info.textContent = 'CONDUCTOR VIZ — 無効';
      else if (CONDUCTOR_VIZ_STATE.editMode) info.textContent = 'EDIT MODE — クリック&ドラッグでテンションを編集';
      else if (CONDUCTOR_VIZ_STATE.editedCurve) info.textContent = '手動編集済み — 次回 GENERATE に適用されます';
      else info.textContent = 'CONDUCTOR VIZ — 有効 (次回 GENERATE 後に更新)';
    }
    if (canvas && typeof ConductorViz !== 'undefined') {
      let displayData = null;
      if (CONDUCTOR_VIZ_STATE.editedCurve && typeof ConductorViz.buildDisplayData === 'function') {
        const curve = CONDUCTOR_VIZ_STATE.editedCurve;
        const totalBars = curve.length || PATCH.getTotalBarsForUI();
        const sections = typeof detectSections === 'function' ? detectSections(curve) : [];
        displayData = ConductorViz.buildDisplayData(
          hasState && S.bpm ? S.bpm : 60,
          totalBars,
          curve,
          !!(hasState && S.engines && S.engines.macro && S.macroEnabled && S.tempoModEnabled),
          hasState && Number.isFinite(S.tempoDrift) ? S.tempoDrift : 0,
          sections
        );
        ConductorViz.draw(canvas, displayData);
      } else {
        ConductorViz.draw(canvas, null);
      }

      if (CONDUCTOR_VIZ_STATE.editMode &&
          displayData &&
          typeof ConductorViz.bindEditInteraction === 'function') {
        const parent = canvas.parentNode;
        if (parent) {
          const clone = canvas.cloneNode(true);
          parent.replaceChild(clone, canvas);
          ConductorViz.draw(clone, displayData);
          ConductorViz.bindEditInteraction(clone, displayData, null);
        }
      }
    }
  };

  window.__MEIKY_PATCH__ = PATCH;
})();
