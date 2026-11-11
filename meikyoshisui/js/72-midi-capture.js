/* 72-midi-capture.js — MIDI モニタ / コード捕捉 / MIDI ラーン
 * MIDI 入力の監視、保持音からのコード認識と進行への捕捉、MIDI ラーン適用、入力ハンドラの包摂。
 * (2026-11-11: 90-patch-shared.js から機能ドメイン別に分散。本体モジュール。)
 */
(() => {
  'use strict';

  const PATCH = window.__MEIKY_PATCH__ || {};

  PATCH.scaleMidiToRange = function scaleMidiToRange(value, min, max) {
    const midi = Math.max(0, Math.min(127, Number(value) || 0));
    return Math.max(min, Math.min(max, Math.round(min + (midi / 127) * (max - min))));
  };

  PATCH.scaleMidiToStepRange = function scaleMidiToStepRange(value, min, max, step) {
    const midi = Math.max(0, Math.min(127, Number(value) || 0));
    const raw = min + (midi / 127) * (max - min);
    const safeStep = step && step > 0 ? step : 1;
    const snapped = Math.round(raw / safeStep) * safeStep;
    return Math.max(min, Math.min(max, +snapped.toFixed(4)));
  };

  PATCH.pushMidiMonitorEvent = function pushMidiMonitorEvent(text) {
    const state = PATCH.midiMonitorState || (PATCH.midiMonitorState = { armedTarget: '', events: [] });
    state.events.unshift(text);
    if (state.events.length > 8) state.events.length = 8;
  };

  PATCH.getProgressionCaptureBars = function getProgressionCaptureBars() {
    const input = document.getElementById('cpAddBars');
    const value = input ? parseInt(input.value, 10) : 4;
    return Math.max(1, Math.min(32, Number.isFinite(value) ? value : 4));
  };

  PATCH.ensureMidiCapturePolicy = function ensureMidiCapturePolicy() {
    const capture = PATCH.midiCaptureState || (PATCH.midiCaptureState = {});
    const policy = capture.policy || (capture.policy = {});
    if (policy.mode !== 'release' && policy.mode !== 'stable') policy.mode = 'stable';
    if (!Number.isFinite(policy.holdMs)) policy.holdMs = 180;
    if (!Number.isFinite(policy.minVelocity)) policy.minVelocity = 1;
    if (typeof policy.ignoreInversions !== 'boolean') policy.ignoreInversions = true;
    policy.holdMs = Math.max(0, Math.min(1200, Number(policy.holdMs) || 0));
    policy.minVelocity = Math.max(1, Math.min(127, Math.round(Number(policy.minVelocity) || 1)));
    return policy;
  };

  PATCH.chordKey = function chordKey(chord) {
    if (!chord) return '';
    return [chord.root, chord.quality || '', Array.isArray(chord.iv) ? chord.iv.join(',') : ''].join(':');
  };

  PATCH.getHeldMidiBassNote = function getHeldMidiBassNote() {
    if (typeof MidiInputEngine === 'undefined' || !MidiInputEngine.STATE || !(MidiInputEngine.STATE.activeNotes instanceof Map)) return null;
    const notes = Array.from(MidiInputEngine.STATE.activeNotes.keys()).sort((a, b) => a - b);
    return notes.length ? notes[0] : null;
  };

  PATCH.getHeldMidiMaxVelocity = function getHeldMidiMaxVelocity() {
    if (typeof MidiInputEngine === 'undefined' || !MidiInputEngine.STATE || !(MidiInputEngine.STATE.activeNotes instanceof Map)) return 0;
    const velocities = Array.from(MidiInputEngine.STATE.activeNotes.values()).map(value => Number(value) || 0);
    return velocities.length ? Math.max(...velocities) : 0;
  };

  PATCH.chordCaptureKey = function chordCaptureKey(chord, options) {
    if (!chord) return '';
    const policy = PATCH.ensureMidiCapturePolicy();
    const opts = options || {};
    const base = PATCH.chordKey(chord);
    if (policy.ignoreInversions) return base;
    const bassNote = Number.isFinite(opts.bassNote) ? opts.bassNote : PATCH.getHeldMidiBassNote();
    const bassPc = bassNote == null ? 'x' : PATCH.mod(bassNote, 12);
    return base + ':bass:' + bassPc;
  };

  PATCH.cloneChord = function cloneChord(chord) {
    return chord ? PATCH.jsonClone(chord) : chord;
  };

  PATCH.clearPendingMidiCapture = function clearPendingMidiCapture() {
    const capture = PATCH.midiCaptureState || (PATCH.midiCaptureState = {
      enabled: false,
      lastCapturedKey: '',
      lastCapturedAt: 0,
      lastCaptureSource: '',
      pendingKey: '',
      pendingSince: 0,
      pendingChord: null,
      pendingTimer: null,
    });
    if (capture.pendingTimer) clearTimeout(capture.pendingTimer);
    PATCH.ensureMidiCapturePolicy();
    capture.pendingTimer = null;
    capture.pendingKey = '';
    capture.pendingSince = 0;
    capture.pendingChord = null;
  };

  PATCH.appendChordToProgression = function appendChordToProgression(chord, bars, sourceLabel) {
    if (!chord || typeof PROG_STATE === 'undefined' || !PROG_STATE) return false;
    const safeBars = Math.max(1, Math.min(32, Number.isFinite(bars) ? bars : 4));
    const capture = PATCH.midiCaptureState || (PATCH.midiCaptureState = {
      enabled: false,
      lastCapturedKey: '',
      lastCapturedAt: 0,
      lastCaptureSource: '',
      pendingKey: '',
      pendingSince: 0,
      pendingChord: null,
      pendingTimer: null,
    });
    const source = sourceLabel || 'CAPTURE';
    const lastEntry = PROG_STATE.prog[PROG_STATE.prog.length - 1];
    const canReplaceRecent =
      source === 'MIDI AUTO' &&
      lastEntry &&
      lastEntry.chord &&
      lastEntry.chord.root === chord.root &&
      Array.isArray(lastEntry.chord.iv) &&
      Array.isArray(chord.iv) &&
      chord.iv.length > lastEntry.chord.iv.length &&
      safeBars === lastEntry.bars &&
      Date.now() - (capture.lastCapturedAt || 0) < 400 &&
      capture.lastCaptureSource === 'MIDI AUTO';
    if (canReplaceRecent) {
      lastEntry.chord = PATCH.cloneChord(chord);
    } else {
      PROG_STATE.prog.push({ chord: PATCH.cloneChord(chord), bars: safeBars });
    }
    PROG_STATE.enabled = true;
    const tog = document.getElementById('togProgression');
    const controls = document.getElementById('progressionControls');
    if (tog) tog.classList.add('on');
    if (controls) controls.style.display = 'block';
    if (typeof window.refreshProgUI === 'function') window.refreshProgUI();
    capture.lastCapturedAt = Date.now();
    capture.lastCaptureSource = source;
    capture.lastCapturedKey = PATCH.chordCaptureKey(chord);
    PATCH.clearPendingMidiCapture();
    PATCH.pushMidiMonitorEvent(source + ' -> ' + chord.rootName + (chord.quality || '') + ' / ' + safeBars + ' bars');
    PATCH.syncMidiMonitorUI();
    return true;
  };

  PATCH.captureCurrentMidiChordToProgression = function captureCurrentMidiChordToProgression() {
    if (typeof S === 'undefined' || !S || !S.chord) return false;
    PATCH.clearPendingMidiCapture();
    return PATCH.appendChordToProgression(S.chord, PATCH.getProgressionCaptureBars(), 'MIDI CAPTURE');
  };

  PATCH.queueMidiChordCapture = function queueMidiChordCapture(chord, options) {
    const capture = PATCH.midiCaptureState || (PATCH.midiCaptureState = {
      enabled: false,
      lastCapturedKey: '',
      lastCapturedAt: 0,
      lastCaptureSource: '',
      pendingKey: '',
      pendingSince: 0,
      pendingChord: null,
      pendingTimer: null,
    });
    const opts = options || {};
    const policy = PATCH.ensureMidiCapturePolicy();
    if (!capture.enabled || !chord) return false;
    if (policy.mode === 'release' && opts.triggerType === 'noteon') return false;
    const minVelocity = policy.minVelocity;
    const triggerVelocity = Number.isFinite(opts.velocity) ? opts.velocity : PATCH.getHeldMidiMaxVelocity();
    if (triggerVelocity < minVelocity) return false;
    const key = PATCH.chordCaptureKey(chord, opts);
    if (!key || key === capture.lastCapturedKey) return false;
    if (capture.pendingKey === key && capture.pendingTimer) return false;

    PATCH.clearPendingMidiCapture();
    capture.pendingKey = key;
    capture.pendingSince = Date.now();
    capture.pendingChord = PATCH.cloneChord(chord);
    const delayMs = Math.max(0, Number(policy.holdMs) || 0);
    capture.pendingTimer = setTimeout(() => {
      capture.pendingTimer = null;
      const currentChord = PATCH.getHeldMidiChord();
      const currentKey = PATCH.chordCaptureKey(currentChord);
      if (!capture.enabled || !capture.pendingChord || !currentChord || currentKey !== capture.pendingKey) {
        PATCH.clearPendingMidiCapture();
        PATCH.syncMidiMonitorUI();
        return;
      }
      PATCH.appendChordToProgression(capture.pendingChord, PATCH.getProgressionCaptureBars(), 'MIDI AUTO');
    }, delayMs);
    PATCH.syncMidiMonitorUI();
    return true;
  };

  PATCH.maybeCaptureMidiChord = function maybeCaptureMidiChord(chord, options) {
    return PATCH.queueMidiChordCapture(chord, options);
  };

  PATCH.setMidiCaptureEnabled = function setMidiCaptureEnabled(enabled) {
    PATCH.ensureMidiCapturePolicy();
    PATCH.midiCaptureState.enabled = !!enabled;
    if (enabled) {
      PATCH.midiCaptureState.lastCapturedKey = (typeof S !== 'undefined' && S && S.chord) ? PATCH.chordCaptureKey(S.chord) : '';
    } else {
      PATCH.midiCaptureState.lastCapturedKey = '';
      PATCH.clearPendingMidiCapture();
    }
    PATCH.syncMidiMonitorUI();
  };

  PATCH.applyMidiLearnValue = function applyMidiLearnValue(targetId, cc, value) {
    const target = PATCH.getMidiLearnTarget(targetId);
    if (!target || typeof S === 'undefined' || !S) return false;
    let uiValue = PATCH.scaleMidiToStepRange(value, target.min, target.max, target.step || 1);
    if (target.id === 'concertA4') {
      if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return false;
      CompTuningEngine.STATE.a4Hz = uiValue;
      const slider = document.getElementById('ctA4Slider');
      if (slider) slider.value = uiValue;
      const valueEl = document.getElementById(target.valueId);
      if (valueEl) valueEl.textContent = target.format(uiValue);
      PATCH.refreshScalaProfile(false);
      PATCH.syncBinauralUI();
      PATCH.syncConcertPitchUI();
      PATCH.syncScalaUI();
    } else if (target.id === 'concertCents') {
      if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return false;
      CompTuningEngine.STATE.globalCents = uiValue;
      const slider = document.getElementById('ctGlobalCents');
      if (slider) slider.value = uiValue;
      const valueEl = document.getElementById(target.valueId);
      if (valueEl) valueEl.textContent = target.format(uiValue);
      PATCH.syncConcertPitchUI();
    } else if (target.id === 'concertRoot') {
      if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return false;
      uiValue = PATCH.scaleMidiToRange(value, 0, 11);
      CompTuningEngine.STATE.rootPc = uiValue;
      const slider = document.getElementById('ctRootPc');
      if (slider) slider.value = uiValue;
      const valueEl = document.getElementById(target.valueId);
      if (valueEl) valueEl.textContent = target.format(uiValue);
      PATCH.refreshScalaProfile(false);
      if (typeof CompTuningEngine.buildIntervalGrid === 'function') CompTuningEngine.buildIntervalGrid();
      if (typeof CompTuningEngine.updateDisplay === 'function') CompTuningEngine.updateDisplay();
      PATCH.syncScalaUI();
      PATCH.syncCompSectionUI();
    } else if (target.id === 'jiBlend') {
      if (typeof JI_PARAMS === 'undefined') return false;
      JI_PARAMS.blend = uiValue / 100;
      const slider = document.getElementById('jiBlend');
      if (slider) slider.value = uiValue;
      const valueEl = document.getElementById(target.valueId);
      if (valueEl) valueEl.textContent = target.format(uiValue);
      PATCH.syncJustIntonationUI();
    } else if (target.id === 'jiMemory') {
      if (typeof JI_PARAMS === 'undefined') return false;
      JI_PARAMS.adaptiveMemoryStrength = uiValue / 100;
      const slider = document.getElementById('jiAdaptiveMemoryStrength');
      if (slider) slider.value = uiValue;
      const valueEl = document.getElementById(target.valueId);
      if (valueEl) valueEl.textContent = target.format(uiValue);
      PATCH.syncJustIntonationUI();
    } else if (target.id === 'jiBassBias') {
      if (typeof JI_PARAMS === 'undefined') return false;
      JI_PARAMS.adaptiveBassAnchorStrength = uiValue / 100;
      const slider = document.getElementById('jiAdaptiveBassBias');
      if (slider) slider.value = uiValue;
      const valueEl = document.getElementById(target.valueId);
      if (valueEl) valueEl.textContent = target.format(uiValue);
      PATCH.syncJustIntonationUI();
    } else if (target.id === 'jiVoiceLeading') {
      if (typeof JI_PARAMS === 'undefined') return false;
      JI_PARAMS.adaptiveVoiceLeadingStrength = uiValue / 100;
      const slider = document.getElementById('jiAdaptiveVoiceLeading');
      if (slider) slider.value = uiValue;
      const valueEl = document.getElementById(target.valueId);
      if (valueEl) valueEl.textContent = target.format(uiValue);
      PATCH.syncJustIntonationUI();
    } else if (target.id === 'jiCadence') {
      if (typeof JI_PARAMS === 'undefined') return false;
      JI_PARAMS.adaptiveCadenceResetStrength = uiValue / 100;
      const slider = document.getElementById('jiAdaptiveCadenceStrength');
      if (slider) slider.value = uiValue;
      const valueEl = document.getElementById(target.valueId);
      if (valueEl) valueEl.textContent = target.format(uiValue);
      PATCH.syncJustIntonationUI();
    } else if (target.id === 'scalaPreset') {
      PATCH.initScalaPresets();
      if (!PATCH.SCALA_PRESETS.length) return false;
      const presetIndex = PATCH.scaleMidiToRange(value, 0, PATCH.SCALA_PRESETS.length - 1);
      const preset = PATCH.SCALA_PRESETS[presetIndex];
      if (!preset || !PATCH.loadScalaPreset(preset.id)) return false;
      PATCH.syncScalaUI();
      PATCH.syncCompSectionUI();
      uiValue = preset.label;
    } else if (target.id === 'scalaFavorite') {
      const favorites = PATCH.readScalaFavorites();
      const availableSlots = PATCH.SCALA_FAVORITE_SLOTS.filter(slot => !!favorites[slot]);
      if (!availableSlots.length) return false;
      const slotIndex = PATCH.scaleMidiToRange(value, 0, availableSlots.length - 1);
      const slot = availableSlots[slotIndex];
      if (!PATCH.loadScalaFavorite(slot)) return false;
      PATCH.syncScalaUI();
      PATCH.syncCompSectionUI();
      uiValue = slot;
    } else if (target.id === 'jiSectionBlend') {
      const focused = PATCH.getFocusedSectionProfile('ji');
      if (!focused) return false;
      focused.profile.blend = uiValue / 100;
      PATCH.syncJustIntonationUI();
    } else if (target.id === 'jiSectionBass') {
      const focused = PATCH.getFocusedSectionProfile('ji');
      if (!focused) return false;
      focused.profile.adaptiveBassAnchorStrength = uiValue / 100;
      PATCH.syncJustIntonationUI();
    } else if (target.id === 'jiSectionVl') {
      const focused = PATCH.getFocusedSectionProfile('ji');
      if (!focused) return false;
      focused.profile.adaptiveVoiceLeadingStrength = uiValue / 100;
      PATCH.syncJustIntonationUI();
    } else if (target.id === 'compSectionA4') {
      const focused = PATCH.getFocusedSectionProfile('comp');
      if (!focused) return false;
      focused.profile.a4Hz = uiValue;
      PATCH.syncCompSectionUI();
    } else if (target.id === 'compSectionCents') {
      const focused = PATCH.getFocusedSectionProfile('comp');
      if (!focused) return false;
      focused.profile.globalCents = uiValue;
      PATCH.syncCompSectionUI();
    } else if (target.id === 'compSectionRoot') {
      const focused = PATCH.getFocusedSectionProfile('comp');
      if (!focused) return false;
      uiValue = PATCH.scaleMidiToRange(value, 0, 11);
      focused.profile.rootPc = uiValue;
      PATCH.syncCompSectionUI();
    } else if (target.id === 'compSectionScala') {
      const focused = PATCH.getFocusedSectionProfile('comp');
      if (!focused) return false;
      const options = PATCH.getCompSectionScalaOptions();
      if (!options.length) return false;
      const optionIndex = PATCH.scaleMidiToRange(value, 0, options.length - 1);
      const option = options[optionIndex];
      if (!option) return false;
      focused.profile.scalaSource = option.value;
      PATCH.syncCompSectionUI();
      uiValue = option.label;
    } else if (target.id === 'gateBase') {
      S.gateBase = uiValue / 100;
      const slider = document.getElementById('gateBase');
      if (slider) slider.value = uiValue;
      const valueEl = document.getElementById(target.valueId);
      if (valueEl) valueEl.textContent = target.format(uiValue);
      if (typeof updateGateIndicator === 'function') updateGateIndicator();
    } else {
      S[target.id] = uiValue;
      const slider = document.getElementById(target.id);
      if (slider) slider.value = uiValue;
      const valueEl = document.getElementById(target.valueId);
      if (valueEl) valueEl.textContent = target.format(uiValue);
      if (target.id === 'bpm' && typeof refreshBpmDisplay === 'function') refreshBpmDisplay();
      if (target.id === 'dissonance' && typeof updateGateIndicator === 'function') updateGateIndicator();
      if (target.id === 'tempoDrift' && typeof refreshBpmDisplay === 'function') refreshBpmDisplay();
      if (target.id === 'curveAmp' && typeof updateMacroPreview === 'function') updateMacroPreview();
      if (target.id === 'pbRange') {
        const mpeStatus = document.getElementById('mpeStatus');
        if (mpeStatus) mpeStatus.textContent = S.mpe ? 'MPE ON — pb:±' + S.pbRange + ' st' : 'MPE OFF';
      }
    }
    PATCH.pushMidiMonitorEvent('LEARN CC' + cc + ' -> ' + target.label + ' = ' + uiValue);
    return true;
  };

  PATCH.armMidiLearn = function armMidiLearn(targetId) {
    const state = PATCH.midiMonitorState || (PATCH.midiMonitorState = { armedTarget: '', events: [] });
    state.armedTarget = targetId || '';
    PATCH.syncMidiMonitorUI();
  };

  PATCH.clearMidiLearnMapping = function clearMidiLearnMapping(cc) {
    const mappings = PATCH.readMidiLearnMappings();
    delete mappings[String(cc)];
    PATCH.writeMidiLearnMappings(mappings);
    PATCH.pushMidiMonitorEvent('LEARN CLEAR CC' + cc);
    PATCH.syncMidiMonitorUI();
  };

  PATCH.handleMidiLearnCC = function handleMidiLearnCC(cc, value) {
    const state = PATCH.midiMonitorState || (PATCH.midiMonitorState = { armedTarget: '', events: [] });
    const mappings = PATCH.readMidiLearnMappings();
    if (state.armedTarget) {
      const target = PATCH.getMidiLearnTarget(state.armedTarget);
      if (target) {
        mappings[String(cc)] = target.id;
        PATCH.writeMidiLearnMappings(mappings);
        PATCH.applyMidiLearnValue(target.id, cc, value);
        PATCH.pushMidiMonitorEvent('LEARN BIND CC' + cc + ' -> ' + target.label);
      }
      state.armedTarget = '';
      PATCH.syncMidiMonitorUI();
      return true;
    }
    const mappedTargetId = mappings[String(cc)];
    if (!mappedTargetId) return false;
    const applied = PATCH.applyMidiLearnValue(mappedTargetId, cc, value);
    if (applied) PATCH.syncMidiMonitorUI();
    return applied;
  };

  PATCH.describeMidiMessage = function describeMidiMessage(data) {
    const bytes = Array.from(data || []);
    if (!bytes.length) return 'EMPTY';
    const status = bytes[0] || 0;
    const type = status & 0xF0;
    const channel = (status & 0x0F) + 1;
    const d1 = bytes[1] || 0;
    const d2 = bytes[2] || 0;
    if (type === 0x90 && d2 > 0) return 'CH' + channel + ' NOTE ON ' + PATCH.NOTE_NAMES[d1 % 12] + (Math.floor(d1 / 12) - 1) + ' vel ' + d2;
    if (type === 0x80 || (type === 0x90 && d2 === 0)) return 'CH' + channel + ' NOTE OFF ' + PATCH.NOTE_NAMES[d1 % 12] + (Math.floor(d1 / 12) - 1);
    if (type === 0xB0) return 'CH' + channel + ' CC' + d1 + ' = ' + d2;
    if (type === 0xE0) return 'CH' + channel + ' PB';
    return 'CH' + channel + ' 0x' + status.toString(16).toUpperCase();
  };

  PATCH.syncMidiMonitorUI = function syncMidiMonitorUI() {
    const state = PATCH.midiMonitorState || (PATCH.midiMonitorState = { armedTarget: '', events: [] });
    const capture = PATCH.midiCaptureState || (PATCH.midiCaptureState = {
      enabled: false,
      lastCapturedKey: '',
      lastCapturedAt: 0,
      lastCaptureSource: '',
      pendingKey: '',
      pendingSince: 0,
      pendingChord: null,
      pendingTimer: null,
    });
    const mappings = PATCH.readMidiLearnMappings();
    const learnStatus = document.getElementById('midiLearnStatus');
    const learnTarget = document.getElementById('midiLearnTarget');
    const learnMap = document.getElementById('midiLearnMap');
    const log = document.getElementById('midiMonitorLog');
    const captureStatus = document.getElementById('midiCaptureStatus');
    const captureToggle = document.getElementById('midiCaptureTog');
    const captureMode = document.getElementById('midiCaptureMode');
    const captureHold = document.getElementById('midiCaptureHoldMs');
    const captureHoldValue = document.getElementById('midiCaptureHoldMsV');
    const captureMinVel = document.getElementById('midiCaptureMinVel');
    const captureMinVelValue = document.getElementById('midiCaptureMinVelV');
    const captureIgnoreInv = document.getElementById('midiCaptureIgnoreInv');
    const policy = PATCH.ensureMidiCapturePolicy();
    const liveFocus = PATCH.describeLiveSectionFocus();
    if (learnTarget && !learnTarget.options.length) {
      learnTarget.innerHTML = PATCH.MIDI_LEARN_TARGETS.map(target =>
        '<option value="' + target.id + '">' + target.label + '</option>'
      ).join('');
    }
    if (learnTarget && state.armedTarget) learnTarget.value = state.armedTarget;
    if (learnStatus) {
      const armedTarget = PATCH.getMidiLearnTarget(state.armedTarget);
      let armedText = 'LEARN IDLE';
      if (armedTarget) {
        armedText = 'LEARN ARMED — move a CC for ' + armedTarget.label;
        if (PATCH.isSectionLearnTarget(armedTarget.id)) {
          const kind = armedTarget.id.startsWith('ji') ? 'ji' : 'comp';
          const focus = kind === 'ji' ? liveFocus.ji : liveFocus.comp;
          armedText += ' @ ' + focus.name + (focus.follow ? ' / FOLLOW BAR ' + (liveFocus.previewBar + 1) : '');
        }
      }
      learnStatus.textContent = armedText;
      learnStatus.style.color = armedTarget ? 'var(--amber)' : 'var(--text-dim)';
    }
    if (learnMap) {
      const entries = Object.entries(mappings)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([cc, targetId]) => {
          const target = PATCH.getMidiLearnTarget(targetId);
          return 'CC' + cc + ' → ' + (target ? target.label : targetId);
        });
      learnMap.textContent =
        'FOCUS: JI=' + liveFocus.ji.name + (liveFocus.ji.follow ? '@BAR' + (liveFocus.previewBar + 1) : '') +
        ' / COMP=' + liveFocus.comp.name + (liveFocus.comp.follow ? '@BAR' + (liveFocus.previewBar + 1) : '') +
        (entries.length ? '  |  MAP: ' + entries.join('  |  ') : '  |  MAP: —');
    }
    if (log) log.textContent = state.events.length ? state.events.join('\n') : 'MONITOR: waiting for MIDI input';
    if (captureToggle) captureToggle.classList.toggle('on', !!capture.enabled);
    if (captureMode) captureMode.value = policy.mode;
    if (captureHold) captureHold.value = policy.holdMs;
    if (captureHoldValue) captureHoldValue.textContent = policy.holdMs + ' ms';
    if (captureMinVel) captureMinVel.value = policy.minVelocity;
    if (captureMinVelValue) captureMinVelValue.textContent = String(policy.minVelocity);
    if (captureIgnoreInv) captureIgnoreInv.classList.toggle('on', !!policy.ignoreInversions);
    if (captureStatus) {
      const bars = PATCH.getProgressionCaptureBars();
      if (!capture.enabled) {
        captureStatus.textContent = 'CAPTURE IDLE';
      } else if (capture.pendingKey && capture.pendingSince) {
        const pendingChord = capture.pendingChord ? capture.pendingChord.rootName + (capture.pendingChord.quality || '') : capture.pendingKey;
        captureStatus.textContent = 'CAPTURE PENDING — ' + pendingChord + ' / ' + bars + ' bars / ' + policy.mode.toUpperCase();
      } else {
        captureStatus.textContent = 'CAPTURE ARMED — ' + policy.mode.toUpperCase() + ' / ' + bars + ' bars / ' + policy.holdMs + 'ms / vel≥' + policy.minVelocity;
      }
      captureStatus.style.color = capture.enabled ? 'var(--teal)' : 'var(--text-dim)';
    }
    PATCH.syncPatchDiagnosticsUI();
  };


  PATCH.applyRecognizedMidiChord = function applyRecognizedMidiChord(chord) {
    if (!chord || typeof S === 'undefined' || !S) return;
    S.chord = chord;
    const chordText = chord.rootName + (chord.quality || '');
    const input = document.getElementById('chordInput');
    const status = document.getElementById('chordStatus');
    if (input) input.value = chordText;
    if (status) {
      status.textContent = '✓ MIDI IN ' + chordText + ' — ' + chord.name;
      status.className = 'chord-status ok';
    }
    if (typeof updateTheory === 'function') updateTheory();
    if (typeof buildScaleUI === 'function') buildScaleUI();
    if (typeof log === 'function') log('// MIDI IN CHORD: ' + chordText + ' — ' + chord.name, 'ok');
  };

  PATCH.getHeldMidiChord = function getHeldMidiChord() {
    if (typeof MidiInputEngine === 'undefined' ||
        !MidiInputEngine.STATE ||
        typeof MidiInputEngine.chordFromPitchClasses !== 'function') {
      return null;
    }
    const activeNotes = Array.from(MidiInputEngine.STATE.activeNotes.keys());
    return MidiInputEngine.chordFromPitchClasses(activeNotes.map(note => note % 12));
  };

  PATCH.syncMidiChordFromHeldNotes = function syncMidiChordFromHeldNotes() {
    if (typeof MidiInputEngine === 'undefined' || !MidiInputEngine.STATE) return;
    const state = MidiInputEngine.STATE;
    const activeNotes = Array.from(state.activeNotes.keys());
    const chord = PATCH.getHeldMidiChord();
    if (chord) {
      state.lastChordKey = '';
      PATCH.applyRecognizedMidiChord(chord);
      return chord;
    }
    if (!activeNotes.length) {
      state.lastChordKey = '';
      PATCH.clearPendingMidiCapture();
    }
    return null;
  };


  PATCH.wrapMidiInputHandlers = function wrapMidiInputHandlers() {
    if (typeof MidiInputEngine === 'undefined' || !MidiInputEngine.STATE || !MidiInputEngine.STATE.access) return;
    for (const input of MidiInputEngine.STATE.access.inputs.values()) {
      if (!input || typeof input.onmidimessage !== 'function' || input.__meikyFixWrapped) continue;
      const originalHandler = input.onmidimessage;
      input.onmidimessage = event => {
        originalHandler(event);
        const data = event && event.data ? event.data : [];
        const status = data.length ? data[0] : 0;
        const type = status & 0xF0;
        const cc = data.length > 1 ? data[1] : 0;
        const value = data.length > 2 ? data[2] : 0;
        PATCH.pushMidiMonitorEvent(PATCH.describeMidiMessage(data));
        if (type === 0x90 && value > 0) {
          const heldChord = PATCH.getHeldMidiChord();
          if (heldChord) PATCH.maybeCaptureMidiChord(heldChord, {
            triggerType: 'noteon',
            velocity: value,
            bassNote: PATCH.getHeldMidiBassNote(),
          });
        }
        if (type === 0xB0) PATCH.handleMidiLearnCC(cc, value);
        if (type === 0x80 || (type === 0x90 && value === 0)) {
          const heldChord = PATCH.syncMidiChordFromHeldNotes();
          if (heldChord) PATCH.maybeCaptureMidiChord(heldChord, {
            triggerType: 'noteoff',
            velocity: PATCH.getHeldMidiMaxVelocity(),
            bassNote: PATCH.getHeldMidiBassNote(),
          });
        }
        PATCH.syncMidiMonitorUI();
      };
      input.__meikyFixWrapped = true;
    }
  };

  window.__MEIKY_PATCH__ = PATCH;
})();
