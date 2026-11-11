/* 90-patch-shared.js — PATCH コア（スリム化）
 * PATCH 名前空間の定数・状態、ピッチ / JSON ユーティリティ、セクションフォーカス追随、数学ユーティリティ。機能の実体は 72–77 の本体モジュール群へ分散済み。
 * (2026-11-11: 90-patch-shared.js から機能ドメイン別に分散。本体モジュール。)
 */
(() => {
  'use strict';

  const PATCH = window.__MEIKY_PATCH__ || {};


  PATCH.NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  PATCH.STORAGE_PREFIX = 'meikyoshisui_v25_';
  PATCH.abVariants = PATCH.abVariants || { A: null, B: null };
  PATCH.midiMonitorState = PATCH.midiMonitorState || { armedTarget: '', events: [] };
  PATCH.midiCaptureState = PATCH.midiCaptureState || {
    enabled: false,
    lastCapturedKey: '',
    lastCapturedAt: 0,
    lastCaptureSource: '',
    pendingKey: '',
    pendingSince: 0,
    pendingChord: null,
    pendingTimer: null,
    policy: {
      mode: 'stable',
      holdMs: 180,
      minVelocity: 1,
      ignoreInversions: true,
    },
  };
  PATCH.SCALA_TEMPERAMENT_KEY = 'Scala';
  PATCH.SCALA_PRESETS = PATCH.SCALA_PRESETS || [];
  PATCH.SCALA_FAVORITE_SLOTS = ['F1', 'F2', 'F3', 'F4'];
  PATCH.SCALA_FAVORITES_KEY = PATCH.STORAGE_PREFIX + 'scala_favorites';
  PATCH.MIDI_LEARN_KEY = PATCH.STORAGE_PREFIX + 'midi_learn_map';
  PATCH.sectionLearnFocus = PATCH.sectionLearnFocus || { ji: 0, comp: 0 };
  PATCH.sectionPreviewFollow = PATCH.sectionPreviewFollow || { ji: false, comp: false };
  PATCH.previewTransportState = PATCH.previewTransportState || { playing: false, bar: 0, progress: 0, duration: 0 };
  PATCH.jiAdaptiveMemory = PATCH.jiAdaptiveMemory || { prevCents: null, prevPcs: [], lastOffsetCents: 0, lastCommonCount: 0 };
  PATCH.MIDI_LEARN_TARGETS = [
    { id: 'density', label: 'DENSITY', min: 0, max: 100, valueId: 'densityV', format: value => value + '%' },
    { id: 'velocity', label: 'VELOCITY', min: 1, max: 127, valueId: 'velocityV', format: value => '' + value },
    { id: 'humanize', label: 'HUMANIZE', min: 0, max: 100, valueId: 'humanizeV', format: value => value + '%' },
    { id: 'dissonance', label: 'DISSONANCE', min: 0, max: 100, valueId: 'dissonanceV', format: value => value + '%' },
    { id: 'bpm', label: 'BPM', min: 30, max: 240, valueId: 'bpmV', format: value => value + ' BPM' },
    { id: 'gateBase', label: 'GATE RATIO', min: 30, max: 150, valueId: 'gateBaseV', format: value => (value / 100).toFixed(2) },
    { id: 'curveAmp', label: 'CURVE AMP', min: 0, max: 100, valueId: 'curveAmpV', format: value => value + '%' },
    { id: 'tempoDrift', label: 'TEMPO DRIFT', min: 0, max: 30, valueId: 'tempoDriftV', format: value => '±' + value + ' BPM' },
    { id: 'pbRange', label: 'PB RANGE', min: 1, max: 48, valueId: 'pbRangeV', format: value => '±' + value + ' st' },
    { id: 'concertA4', label: 'CONCERT A4', min: 415, max: 466, step: 0.1, valueId: 'ctA4Val', format: value => value.toFixed(1) + ' Hz' },
    { id: 'concertCents', label: 'GLOBAL CENTS', min: -100, max: 100, step: 0.5, valueId: 'ctGlobalCentsV', format: value => (value >= 0 ? '+' : '') + value.toFixed(1) + '¢' },
    { id: 'concertRoot', label: 'CONCERT ROOT', min: 0, max: 11, valueId: 'ctRootPcV', format: value => PATCH.NOTE_NAMES[PATCH.mod(value, 12)] || 'C' },
    { id: 'jiBlend', label: 'JI BLEND', min: 0, max: 100, valueId: 'jiBlendV', format: value => value + '%' },
    { id: 'jiMemory', label: 'JI MEMORY', min: 0, max: 100, valueId: 'jiAdaptiveMemoryStrengthV', format: value => value + '%' },
    { id: 'jiBassBias', label: 'JI BASS', min: 0, max: 100, valueId: 'jiAdaptiveBassBiasV', format: value => value + '%' },
    { id: 'jiVoiceLeading', label: 'JI VL', min: 0, max: 100, valueId: 'jiAdaptiveVoiceLeadingV', format: value => value + '%' },
    { id: 'jiCadence', label: 'JI CADENCE', min: 0, max: 100, valueId: 'jiAdaptiveCadenceStrengthV', format: value => value + '%' },
    { id: 'scalaPreset', label: 'SCALA PRESET', min: 0, max: 127, valueId: 'ctScalaStatus', format: value => String(value) },
    { id: 'scalaFavorite', label: 'SCALA FAVORITE', min: 0, max: 127, valueId: 'ctScalaStatus', format: value => String(value) },
    { id: 'jiSectionBlend', label: 'JI SEC BLEND', min: 0, max: 100, valueId: 'jiAdaptiveMemoryInfo', format: value => value + '%' },
    { id: 'jiSectionBass', label: 'JI SEC BASS', min: 0, max: 100, valueId: 'jiAdaptiveMemoryInfo', format: value => value + '%' },
    { id: 'jiSectionVl', label: 'JI SEC VL', min: 0, max: 100, valueId: 'jiAdaptiveMemoryInfo', format: value => value + '%' },
    { id: 'compSectionA4', label: 'CT SEC A4', min: 415, max: 466, step: 0.1, valueId: 'ctSectionInfo', format: value => value.toFixed(1) + ' Hz' },
    { id: 'compSectionCents', label: 'CT SEC CENTS', min: -100, max: 100, step: 0.5, valueId: 'ctSectionInfo', format: value => (value >= 0 ? '+' : '') + value.toFixed(1) + '¢' },
    { id: 'compSectionRoot', label: 'CT SEC ROOT', min: 0, max: 11, valueId: 'ctSectionInfo', format: value => PATCH.NOTE_NAMES[PATCH.mod(value, 12)] || 'C' },
    { id: 'compSectionScala', label: 'CT SEC SCALA', min: 0, max: 127, valueId: 'ctSectionInfo', format: value => String(value) },
  ];

  if (typeof JI_PARAMS !== 'undefined') {
    if (typeof JI_PARAMS.adaptiveMemoryEnabled !== 'boolean') JI_PARAMS.adaptiveMemoryEnabled = false;
    if (!Number.isFinite(JI_PARAMS.adaptiveMemoryStrength)) JI_PARAMS.adaptiveMemoryStrength = 0.65;
    if (!Number.isFinite(JI_PARAMS.adaptiveBassAnchorStrength)) JI_PARAMS.adaptiveBassAnchorStrength = 0;
    if (!Number.isFinite(JI_PARAMS.adaptiveVoiceLeadingStrength)) JI_PARAMS.adaptiveVoiceLeadingStrength = 0;
    if (typeof JI_PARAMS.adaptiveCadenceResetEnabled !== 'boolean') JI_PARAMS.adaptiveCadenceResetEnabled = false;
    if (!Number.isFinite(JI_PARAMS.adaptiveCadenceResetStrength)) JI_PARAMS.adaptiveCadenceResetStrength = 0.8;
    if (typeof JI_PARAMS.adaptiveResetOnSection !== 'boolean') JI_PARAMS.adaptiveResetOnSection = true;
    if (typeof JI_PARAMS.sectionModEnabled !== 'boolean') JI_PARAMS.sectionModEnabled = false;
    if (!Array.isArray(JI_PARAMS.sectionProfiles)) JI_PARAMS.sectionProfiles = [];
  }
  if (typeof CompTuningEngine !== 'undefined' && CompTuningEngine.STATE) {
    if (typeof CompTuningEngine.STATE.sectionModEnabled !== 'boolean') CompTuningEngine.STATE.sectionModEnabled = false;
    if (!Array.isArray(CompTuningEngine.STATE.sectionProfiles)) CompTuningEngine.STATE.sectionProfiles = [];
  }
  if (typeof S !== 'undefined' && S && S.multiExport && typeof S.multiExport.includeManifest !== 'boolean') {
    S.multiExport.includeManifest = false;
  }

  PATCH.jsonClone = function jsonClone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  };

  PATCH.getConcertA4Hz = function getConcertA4Hz() {
    if (typeof CompTuningEngine !== 'undefined' &&
        CompTuningEngine.STATE &&
        Number.isFinite(CompTuningEngine.STATE.a4Hz) &&
        CompTuningEngine.STATE.a4Hz > 0) {
      return CompTuningEngine.STATE.a4Hz;
    }
    return 440.0;
  };

  PATCH.midiToHz = function midiToHz(note, referenceHz) {
    const a4 = Number.isFinite(referenceHz) && referenceHz > 0 ? referenceHz : PATCH.getConcertA4Hz();
    return a4 * Math.pow(2, (note - 69) / 12);
  };

  PATCH.hzToMidi = function hzToMidi(freqHz, referenceHz) {
    const a4 = Number.isFinite(referenceHz) && referenceHz > 0 ? referenceHz : PATCH.getConcertA4Hz();
    if (freqHz <= 0) return 24;
    let note = Math.round(69 + 12 * Math.log2(freqHz / a4));
    while (note < 12) note += 12;
    while (note > 115) note -= 12;
    return note;
  };

  PATCH.hzDiffToCents = function hzDiffToCents(baseHz, beatHz) {
    return 1200 * Math.log2((baseHz + beatHz) / baseHz);
  };

  PATCH.getGlobalConcertOffsetCents = function getGlobalConcertOffsetCents() {
    const a4 = PATCH.getConcertA4Hz();
    const fromA4 = 1200 * Math.log2(a4 / 440.0);
    const globalCents =
      typeof CompTuningEngine !== 'undefined' &&
      CompTuningEngine.STATE &&
      Number.isFinite(CompTuningEngine.STATE.globalCents)
        ? CompTuningEngine.STATE.globalCents
        : 0;
    return fromA4 + globalCents;
  };

  PATCH.formatSignedCents = function formatSignedCents(value) {
    const rounded = Number.isFinite(value) ? value : 0;
    const sign = rounded > 0 ? '+' : '';
    return sign + rounded.toFixed(1) + '¢';
  };

  PATCH.readMidiLearnMappings = function readMidiLearnMappings() {
    try {
      const raw = localStorage.getItem(PATCH.MIDI_LEARN_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  };

  PATCH.writeMidiLearnMappings = function writeMidiLearnMappings(mappings) {
    try {
      localStorage.setItem(PATCH.MIDI_LEARN_KEY, JSON.stringify(mappings || {}));
    } catch (_) {}
  };

  PATCH.getMidiLearnTarget = function getMidiLearnTarget(id) {
    return PATCH.MIDI_LEARN_TARGETS.find(target => target.id === id) || null;
  };

  PATCH.getFocusedSectionProfile = function getFocusedSectionProfile(kind) {
    if (kind === 'ji') {
      if (typeof JI_PARAMS === 'undefined' || !Array.isArray(JI_PARAMS.sectionProfiles) || !JI_PARAMS.sectionProfiles.length) return null;
      const index = Math.max(0, Math.min(JI_PARAMS.sectionProfiles.length - 1, Number(PATCH.sectionLearnFocus.ji) || 0));
      PATCH.sectionLearnFocus.ji = index;
      return { index, profile: JI_PARAMS.sectionProfiles[index] };
    }
    if (kind === 'comp') {
      if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE || !Array.isArray(CompTuningEngine.STATE.sectionProfiles) || !CompTuningEngine.STATE.sectionProfiles.length) return null;
      const index = Math.max(0, Math.min(CompTuningEngine.STATE.sectionProfiles.length - 1, Number(PATCH.sectionLearnFocus.comp) || 0));
      PATCH.sectionLearnFocus.comp = index;
      return { index, profile: CompTuningEngine.STATE.sectionProfiles[index] };
    }
    return null;
  };

  PATCH.getFocusedSectionLabel = function getFocusedSectionLabel(kind) {
    const focused = PATCH.getFocusedSectionProfile(kind);
    if (!focused || !focused.profile) return kind === 'ji' ? 'JI#1' : 'COMP#1';
    return focused.profile.name || ((kind === 'ji' ? 'JI' : 'COMP') + '#' + (focused.index + 1));
  };

  PATCH.isSectionLearnTarget = function isSectionLearnTarget(targetId) {
    return [
      'jiSectionBlend',
      'jiSectionBass',
      'jiSectionVl',
      'compSectionA4',
      'compSectionCents',
      'compSectionRoot',
      'compSectionScala',
    ].includes(targetId);
  };

  PATCH.describeLiveSectionFocus = function describeLiveSectionFocus() {
    const follow = PATCH.ensureSectionPreviewFollow();
    const transport = PATCH.previewTransportState || { bar: 0 };
    return {
      previewBar: Math.max(0, Math.floor(Number(transport.bar) || 0)),
      ji: {
        index: Number(PATCH.sectionLearnFocus && PATCH.sectionLearnFocus.ji) || 0,
        name: PATCH.getFocusedSectionLabel('ji'),
        follow: !!follow.ji,
      },
      comp: {
        index: Number(PATCH.sectionLearnFocus && PATCH.sectionLearnFocus.comp) || 0,
        name: PATCH.getFocusedSectionLabel('comp'),
        follow: !!follow.comp,
      },
    };
  };

  PATCH.ensureSectionPreviewFollow = function ensureSectionPreviewFollow() {
    const state = PATCH.sectionPreviewFollow || (PATCH.sectionPreviewFollow = {});
    if (typeof state.ji !== 'boolean') state.ji = false;
    if (typeof state.comp !== 'boolean') state.comp = false;
    return state;
  };

  PATCH.findSectionIndexForBar = function findSectionIndexForBar(profiles, bar) {
    if (!Array.isArray(profiles) || !profiles.length) return 0;
    const safeBar = Math.max(0, Math.floor(Number(bar) || 0));
    let index = 0;
    for (let i = 0; i < profiles.length; i++) {
      const startBar = Math.max(0, Math.floor(Number(profiles[i] && profiles[i].bar) || 0));
      if (safeBar >= startBar) index = i;
      else break;
    }
    return index;
  };

  PATCH.syncPreviewLinkedSectionFocus = function syncPreviewLinkedSectionFocus(bar, options) {
    const transport = PATCH.previewTransportState || (PATCH.previewTransportState = { playing: false, bar: 0, progress: 0, duration: 0 });
    const follow = PATCH.ensureSectionPreviewFollow();
    const safeBar = Math.max(0, Math.floor(Number(bar) || 0));
    const opts = options || {};
    const force = !!opts.force;
    const changedBar = transport.bar !== safeBar;
    transport.bar = safeBar;
    if (typeof opts.playing === 'boolean') transport.playing = opts.playing;
    if (Number.isFinite(opts.progress)) transport.progress = Math.max(0, Math.min(1, Number(opts.progress)));
    if (Number.isFinite(opts.duration)) transport.duration = Math.max(0, Number(opts.duration));

    let jiChanged = false;
    let compChanged = false;

    if (follow.ji && typeof JI_PARAMS !== 'undefined' && Array.isArray(JI_PARAMS.sectionProfiles) && JI_PARAMS.sectionProfiles.length) {
      const jiIndex = PATCH.findSectionIndexForBar(JI_PARAMS.sectionProfiles, safeBar);
      if (force || PATCH.sectionLearnFocus.ji !== jiIndex) {
        PATCH.sectionLearnFocus.ji = jiIndex;
        jiChanged = true;
      }
    }

    if (follow.comp &&
        typeof CompTuningEngine !== 'undefined' &&
        CompTuningEngine.STATE &&
        Array.isArray(CompTuningEngine.STATE.sectionProfiles) &&
        CompTuningEngine.STATE.sectionProfiles.length) {
      const compIndex = PATCH.findSectionIndexForBar(CompTuningEngine.STATE.sectionProfiles, safeBar);
      if (force || PATCH.sectionLearnFocus.comp !== compIndex) {
        PATCH.sectionLearnFocus.comp = compIndex;
        compChanged = true;
      }
    }

    if (jiChanged) PATCH.syncJustIntonationUI();
    if (compChanged) PATCH.syncCompSectionUI();
    if (!jiChanged && !compChanged && (changedBar || force)) PATCH.syncPatchDiagnosticsUI();

    return {
      bar: safeBar,
      ji: PATCH.sectionLearnFocus.ji,
      comp: PATCH.sectionLearnFocus.comp,
      playing: transport.playing,
    };
  };

  PATCH.resetPreviewSectionTracking = function resetPreviewSectionTracking() {
    const transport = PATCH.previewTransportState || (PATCH.previewTransportState = { playing: false, bar: 0, progress: 0, duration: 0 });
    transport.playing = false;
    transport.bar = 0;
    transport.progress = 0;
    transport.duration = 0;
    PATCH.syncPatchDiagnosticsUI();
  };


  PATCH.floorDiv = function floorDiv(value, divisor) {
    return Math.floor(value / divisor);
  };

  PATCH.mod = function mod(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  };

  PATCH.cloneMidiBytes = function cloneMidiBytes(value) {
    if (!value) return null;
    if (value instanceof Uint8Array) return new Uint8Array(value);
    return new Uint8Array(Array.from(value));
  };

  PATCH.cloneLayerTracks = function cloneLayerTracks(layerTracks) {
    if (!Array.isArray(layerTracks)) return null;
    return layerTracks.map(layerTrack => ({
      name: layerTrack.name,
      data: Array.isArray(layerTrack.data) ? layerTrack.data.slice() : [],
    }));
  };

  PATCH.getActiveProgressionTotalBars = function getActiveProgressionTotalBars() {
    if (typeof PROG_STATE !== 'undefined' &&
        PROG_STATE &&
        PROG_STATE.enabled &&
        Array.isArray(PROG_STATE.prog) &&
        PROG_STATE.prog.length) {
      return PROG_STATE.prog.reduce((sum, entry) => sum + (entry && entry.bars ? entry.bars : 0), 0);
    }
    return (typeof S !== 'undefined' && S && Number.isFinite(S.bars)) ? S.bars : 0;
  };

  PATCH.getTotalBarsForUI = function getTotalBarsForUI() {
    return Math.max(1, PATCH.getActiveProgressionTotalBars() || 0);
  };

  PATCH.getAutoCARule = function getAutoCARule() {
    if (typeof CA_PARAMS === 'undefined' || !CA_PARAMS) return 30;
    if (CA_PARAMS.override) return CA_PARAMS.rule;
    const genre = (typeof S !== 'undefined' && S && S.genre) ? S.genre : 'ambient';
    return ({
      ambient: 30,
      drone: 90,
      dark_ambient: 110,
      psychedelic: 54,
      space: 18,
      ritual: 150,
      kosmische: 73,
      noise: 126,
    })[genre] || 30;
  };

  PATCH.normalizeNRTriad = function normalizeNRTriad(chord) {
    if (!chord) return chord;
    const quality = String(chord.quality || '');
    const isMinor = quality.startsWith('m') && !quality.startsWith('maj');
    const keepAsIs = /dim|aug|sus|quartal|quintal|cluster|tone|ø/i.test(quality);
    const isMajor = !isMinor && !keepAsIs;
    if (!isMinor && !isMajor) return { ...chord };
    return {
      root: chord.root,
      quality: isMinor ? 'm' : '',
      rootName: chord.rootName || PATCH.NOTE_NAMES[((chord.root % 12) + 12) % 12],
      iv: isMinor ? [0, 3, 7] : [0, 4, 7],
      name: isMinor ? 'Minor' : 'Major',
    };
  };

  window.__MEIKY_PATCH__ = PATCH;
})();
