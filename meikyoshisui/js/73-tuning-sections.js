/* 73-tuning-sections.js — 適応型 JI / CompTuning セクション
 * 適応型純正律のピッチベンドマップ、CompTuning のセクション・プロファイルと小節文脈の適用。
 * (2026-11-11: 90-patch-shared.js から機能ドメイン別に分散。本体モジュール。)
 */
(() => {
  'use strict';

  const PATCH = window.__MEIKY_PATCH__ || {};

  PATCH.centsToPitchBend = function centsToPitchBend(cents, pbRange) {
    const safeRange = Number.isFinite(pbRange) && pbRange > 0 ? pbRange : 2;
    const normalized = Math.max(-1, Math.min(1, (Number(cents) || 0) / (safeRange * 100)));
    return Math.round(8192 + normalized * 8191);
  };

  PATCH.resetAdaptiveJiMemory = function resetAdaptiveJiMemory() {
    PATCH.jiAdaptiveMemory = {
      prevCents: null,
      prevPcs: [],
      prevRootPc: null,
      prevVoicing: [],
      lastOffsetCents: 0,
      lastBaseOffsetCents: 0,
      lastAnchorOffsetCents: 0,
      lastVoiceLeadOffsetCents: 0,
      lastCommonCount: 0,
      lastCadenceType: '',
      lastBassBiasWeight: 1,
      lastVoiceLeadWeight: 1,
    };
  };

  PATCH.getAdaptiveJiTonicPc = function getAdaptiveJiTonicPc() {
    if (typeof PROG_STATE !== 'undefined' &&
        PROG_STATE &&
        PROG_STATE.enabled &&
        Array.isArray(PROG_STATE.prog) &&
        PROG_STATE.prog.length &&
        PROG_STATE.prog[0] &&
        PROG_STATE.prog[0].chord) {
      return PATCH.mod(PROG_STATE.prog[0].chord.root, 12);
    }
    if (typeof S !== 'undefined' && S && S.chord) return PATCH.mod(S.chord.root, 12);
    return null;
  };

  PATCH.detectAdaptiveJiCadence = function detectAdaptiveJiCadence(prevRootPc, currentRootPc) {
    const tonic = PATCH.getAdaptiveJiTonicPc();
    if (!Number.isFinite(tonic) || !Number.isFinite(prevRootPc) || !Number.isFinite(currentRootPc)) return '';
    const prev = PATCH.mod(prevRootPc, 12);
    const curr = PATCH.mod(currentRootPc, 12);
    if (curr !== tonic) return '';
    if (prev === PATCH.mod(tonic + 7, 12)) return 'AUTHENTIC';
    if (prev === PATCH.mod(tonic + 5, 12)) return 'PLAGAL';
    if (prev === PATCH.mod(tonic + 11, 12)) return 'LEADING';
    return '';
  };

  PATCH.getMacroSections = function getMacroSections(totalBarsOverride) {
    if (typeof S === 'undefined' ||
        !S ||
        !S.engines ||
        !S.engines.macro ||
        !S.macroEnabled ||
        typeof generateTensionCurve !== 'function' ||
        typeof detectSections !== 'function') {
      return [];
    }
    const totalBars = Math.max(1, Number(totalBarsOverride) || PATCH.getActiveProgressionTotalBars() || S.bars || 1);
    const curve = generateTensionCurve(S.curveShape, totalBars, S.curveAmp, S.chainEnabled, S.curveShapeB);
    return detectSections(curve) || [];
  };

  PATCH.ensureJiSectionProfiles = function ensureJiSectionProfiles(totalBarsOverride) {
    if (typeof JI_PARAMS === 'undefined') return [];
    const sections = PATCH.getMacroSections(totalBarsOverride);
    const existing = Array.isArray(JI_PARAMS.sectionProfiles) ? JI_PARAMS.sectionProfiles : [];
    JI_PARAMS.sectionProfiles = sections.map(section => {
      const key = (section.name || 'Section') + '@' + section.bar;
      const match = existing.find(item => ((item.name || 'Section') + '@' + item.bar) === key);
      return {
        name: section.name || 'Section',
        bar: section.bar,
        mode: match && match.mode ? match.mode : JI_PARAMS.mode,
        blend: match && Number.isFinite(match.blend) ? match.blend : JI_PARAMS.blend,
        harmonicLimit: match && Number.isFinite(match.harmonicLimit) ? match.harmonicLimit : JI_PARAMS.harmonicLimit,
        adaptiveBassAnchorStrength: match && Number.isFinite(match.adaptiveBassAnchorStrength)
          ? match.adaptiveBassAnchorStrength
          : (Number(JI_PARAMS.adaptiveBassAnchorStrength) || 0),
        adaptiveVoiceLeadingStrength: match && Number.isFinite(match.adaptiveVoiceLeadingStrength)
          ? match.adaptiveVoiceLeadingStrength
          : (Number(JI_PARAMS.adaptiveVoiceLeadingStrength) || 0),
        adaptiveCadenceResetEnabled: match && typeof match.adaptiveCadenceResetEnabled === 'boolean'
          ? match.adaptiveCadenceResetEnabled
          : !!JI_PARAMS.adaptiveCadenceResetEnabled,
        adaptiveCadenceResetStrength: match && Number.isFinite(match.adaptiveCadenceResetStrength)
          ? match.adaptiveCadenceResetStrength
          : (Number(JI_PARAMS.adaptiveCadenceResetStrength) || 0.8),
      };
    });
    return JI_PARAMS.sectionProfiles;
  };

  PATCH.getChordRootPcAtBar = function getChordRootPcAtBar(bar) {
    const targetBar = Math.max(0, Number(bar) || 0);
    if (typeof PROG_STATE !== 'undefined' &&
        PROG_STATE &&
        PROG_STATE.enabled &&
        Array.isArray(PROG_STATE.prog) &&
        PROG_STATE.prog.length) {
      let cursor = 0;
      for (const entry of PROG_STATE.prog) {
        const bars = Math.max(1, Number(entry && entry.bars) || 1);
        if (targetBar >= cursor && targetBar < cursor + bars) {
          return entry && entry.chord ? PATCH.mod(entry.chord.root, 12) : 0;
        }
        cursor += bars;
      }
    }
    if (typeof S !== 'undefined' && S && S.chord) return PATCH.mod(S.chord.root, 12);
    if (typeof CompTuningEngine !== 'undefined' && CompTuningEngine.STATE) return PATCH.mod(CompTuningEngine.STATE.rootPc, 12);
    return 0;
  };

  PATCH.ensureCompSectionProfiles = function ensureCompSectionProfiles(totalBarsOverride) {
    if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return [];
    const sections = PATCH.getMacroSections(totalBarsOverride);
    const existing = Array.isArray(CompTuningEngine.STATE.sectionProfiles) ? CompTuningEngine.STATE.sectionProfiles : [];
    CompTuningEngine.STATE.sectionProfiles = sections.map(section => {
      const key = (section.name || 'Section') + '@' + section.bar;
      const match = existing.find(item => ((item.name || 'Section') + '@' + item.bar) === key);
      const defaultRootPc = PATCH.getChordRootPcAtBar(section.bar);
      return {
        name: section.name || 'Section',
        bar: section.bar,
        a4Hz: match && Number.isFinite(match.a4Hz) ? match.a4Hz : CompTuningEngine.STATE.a4Hz,
        globalCents: match && Number.isFinite(match.globalCents) ? match.globalCents : CompTuningEngine.STATE.globalCents,
        rootPc: match && Number.isFinite(match.rootPc) ? PATCH.mod(match.rootPc, 12) : defaultRootPc,
        scalaSource: match && typeof match.scalaSource === 'string' ? match.scalaSource : 'inherit',
      };
    });
    return CompTuningEngine.STATE.sectionProfiles;
  };

  PATCH.isCompSectionModActive = function isCompSectionModActive() {
    return typeof CompTuningEngine !== 'undefined' &&
      !!CompTuningEngine.STATE &&
      !!CompTuningEngine.STATE.enabled &&
      !!CompTuningEngine.STATE.sectionModEnabled;
  };

  PATCH.isCompSectionRuntimeActive = function isCompSectionRuntimeActive() {
    return PATCH.isCompSectionModActive() &&
      !(typeof S !== 'undefined' && S && S.engines && S.engines.mpe && S.mpe);
  };

  PATCH.getCompSectionScalaOptions = function getCompSectionScalaOptions() {
    PATCH.initScalaPresets();
    const options = [
      { value: 'inherit', label: 'INHERIT CURRENT' },
      { value: 'none', label: 'NONE' },
    ];
    PATCH.SCALA_PRESETS.forEach(preset => {
      options.push({ value: 'preset:' + preset.id, label: 'PRESET ' + preset.label.toUpperCase() });
    });
    const favorites = PATCH.readScalaFavorites();
    PATCH.SCALA_FAVORITE_SLOTS.forEach(slot => {
      const entry = favorites[slot];
      if (entry) options.push({ value: 'favorite:' + slot, label: slot + ' ' + (entry.label || 'FAVORITE').toUpperCase() });
    });
    return options;
  };

  PATCH.getCompTuningContextForBar = function getCompTuningContextForBar(barOffset) {
    if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return null;
    const base = {
      a4Hz: CompTuningEngine.STATE.a4Hz,
      globalCents: CompTuningEngine.STATE.globalCents,
      rootPc: PATCH.mod(CompTuningEngine.STATE.rootPc, 12),
      scalaSource: 'inherit',
    };
    if (!CompTuningEngine.STATE.sectionModEnabled) return base;
    const profiles = PATCH.ensureCompSectionProfiles();
    if (!profiles.length) return base;
    let selected = profiles[0];
    profiles.forEach(profile => {
      if ((profile.bar || 0) <= (Number(barOffset) || 0)) selected = profile;
    });
    return {
      a4Hz: Number.isFinite(selected.a4Hz) ? selected.a4Hz : base.a4Hz,
      globalCents: Number.isFinite(selected.globalCents) ? selected.globalCents : base.globalCents,
      rootPc: Number.isFinite(selected.rootPc) ? PATCH.mod(selected.rootPc, 12) : base.rootPc,
      scalaSource: typeof selected.scalaSource === 'string' ? selected.scalaSource : 'inherit',
      sectionName: selected.name || 'Section',
      bar: selected.bar || 0,
    };
  };

  PATCH.getCompSectionSegments = function getCompSectionSegments(barOffset, barCount) {
    const start = Math.max(0, Number(barOffset) || 0);
    const totalBars = Math.max(1, Number(barCount) || 1);
    if (!PATCH.isCompSectionRuntimeActive()) return [{ barOffset: start, bars: totalBars }];
    const end = start + totalBars;
    const boundaries = PATCH.ensureCompSectionProfiles()
      .map(profile => Number(profile.bar) || 0)
      .filter(bar => bar > start && bar < end)
      .sort((a, b) => a - b);
    if (!boundaries.length) return [{ barOffset: start, bars: totalBars }];
    const segments = [];
    let cursor = start;
    boundaries.forEach(bar => {
      if (bar > cursor) {
        segments.push({ barOffset: cursor, bars: bar - cursor });
        cursor = bar;
      }
    });
    if (cursor < end) segments.push({ barOffset: cursor, bars: end - cursor });
    return segments.length ? segments : [{ barOffset: start, bars: totalBars }];
  };

  PATCH.captureCompTuningState = function captureCompTuningState() {
    if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return null;
    return {
      a4Hz: CompTuningEngine.STATE.a4Hz,
      globalCents: CompTuningEngine.STATE.globalCents,
      rootPc: CompTuningEngine.STATE.rootPc,
      temperament: CompTuningEngine.STATE.temperament,
      customCents: Array.isArray(CompTuningEngine.STATE.customCents) ? CompTuningEngine.STATE.customCents.slice() : null,
      autoScaleSync: !!CompTuningEngine.STATE.autoScaleSync,
      linkedScaleName: CompTuningEngine.STATE.linkedScaleName || null,
      scalaProfile: CompTuningEngine.STATE.scalaProfile ? PATCH.jsonClone(CompTuningEngine.STATE.scalaProfile) : null,
      generatedNoteCentsMap: CompTuningEngine.STATE.generatedNoteCentsMap ? { ...CompTuningEngine.STATE.generatedNoteCentsMap } : null,
    };
  };

  PATCH.restoreCompTuningState = function restoreCompTuningState(snapshot) {
    if (!snapshot || typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return;
    CompTuningEngine.STATE.a4Hz = snapshot.a4Hz;
    CompTuningEngine.STATE.globalCents = snapshot.globalCents;
    CompTuningEngine.STATE.rootPc = snapshot.rootPc;
    CompTuningEngine.STATE.temperament = snapshot.temperament;
    CompTuningEngine.STATE.customCents = Array.isArray(snapshot.customCents) ? snapshot.customCents.slice() : Array(12).fill(0);
    CompTuningEngine.STATE.autoScaleSync = !!snapshot.autoScaleSync;
    CompTuningEngine.STATE.linkedScaleName = snapshot.linkedScaleName || null;
    CompTuningEngine.STATE.scalaProfile = snapshot.scalaProfile ? PATCH.jsonClone(snapshot.scalaProfile) : null;
    CompTuningEngine.STATE.generatedNoteCentsMap = snapshot.generatedNoteCentsMap ? { ...snapshot.generatedNoteCentsMap } : null;
    if (CompTuningEngine.STATE.scalaProfile) {
      PATCH.ensureScalaTemperamentEntry();
      PATCH.refreshScalaProfile(false);
    } else if (typeof CompTuningEngine.clearGeneratedNoteCentsMap === 'function' && !snapshot.generatedNoteCentsMap) {
      CompTuningEngine.clearGeneratedNoteCentsMap();
    }
  };

  PATCH.resolveCompSectionScalaPayload = function resolveCompSectionScalaPayload(source) {
    if (!source || source === 'inherit') return { kind: 'inherit' };
    if (source === 'none') return { kind: 'none' };
    if (source.startsWith('preset:')) {
      PATCH.initScalaPresets();
      const presetId = source.slice('preset:'.length);
      const preset = PATCH.SCALA_PRESETS.find(entry => entry.id === presetId);
      if (!preset) return { kind: 'inherit' };
      return {
        kind: 'preset',
        sclText: preset.sclText,
        kbmText: preset.kbmText || '',
        sclName: preset.label + '.scl',
        kbmName: preset.kbmText ? preset.label + '.kbm' : '',
        presetId,
      };
    }
    if (source.startsWith('favorite:')) {
      const slot = source.slice('favorite:'.length);
      const favorites = PATCH.readScalaFavorites();
      const entry = favorites[slot];
      if (!entry) return { kind: 'inherit' };
      return {
        kind: 'favorite',
        sclText: entry.sclText,
        kbmText: entry.kbmText || '',
        sclName: entry.sclName || slot,
        kbmName: entry.kbmName || '',
        presetId: entry.presetId || null,
        favoriteSlot: slot,
      };
    }
    return { kind: 'inherit' };
  };

  PATCH.clearScalaProfileSilently = function clearScalaProfileSilently() {
    if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return;
    delete CompTuningEngine.TEMPERAMENTS[PATCH.SCALA_TEMPERAMENT_KEY];
    CompTuningEngine.STATE.scalaProfile = null;
    CompTuningEngine.STATE.customCents = Array(12).fill(0);
    if (typeof CompTuningEngine.clearGeneratedNoteCentsMap === 'function') {
      CompTuningEngine.clearGeneratedNoteCentsMap();
    } else {
      CompTuningEngine.STATE.generatedNoteCentsMap = null;
    }
    if (CompTuningEngine.STATE.temperament === PATCH.SCALA_TEMPERAMENT_KEY) {
      CompTuningEngine.STATE.temperament = 'Equal';
    }
  };

  PATCH.applyCompTuningContext = function applyCompTuningContext(context, options) {
    if (!context || typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return false;
    const opts = options || {};
    CompTuningEngine.STATE.a4Hz = context.a4Hz;
    CompTuningEngine.STATE.globalCents = context.globalCents;
    CompTuningEngine.STATE.rootPc = PATCH.mod(context.rootPc, 12);

    const scala = PATCH.resolveCompSectionScalaPayload(context.scalaSource);
    if (scala.kind === 'none') {
      PATCH.clearScalaProfileSilently();
    } else if (scala.kind === 'preset' || scala.kind === 'favorite') {
      CompTuningEngine.STATE.scalaProfile = {
        sclName: scala.sclName,
        sclText: String(scala.sclText || ''),
        kbmName: scala.kbmName || '',
        kbmText: String(scala.kbmText || ''),
        presetId: scala.presetId || null,
        favoriteSlot: scala.favoriteSlot || null,
      };
      PATCH.refreshScalaProfile(false);
    } else if (CompTuningEngine.STATE.scalaProfile) {
      PATCH.refreshScalaProfile(false);
    } else if (typeof CompTuningEngine.clearGeneratedNoteCentsMap === 'function') {
      CompTuningEngine.clearGeneratedNoteCentsMap();
    }

    if (!CompTuningEngine.STATE.scalaProfile) {
      const scaleName = opts.scaleName || (typeof S !== 'undefined' && S ? S.scale : null);
      if (CompTuningEngine.STATE.autoScaleSync &&
          scaleName &&
          typeof CompTuningEngine.buildGeneratedNoteCentsMap === 'function' &&
          typeof CompTuningEngine.setGeneratedNoteCentsMap === 'function') {
        const map = CompTuningEngine.buildGeneratedNoteCentsMap(
          scaleName,
          PATCH.mod(context.rootPc, 12),
          [0, 10],
          opts.useJI ? { useJI: true, jiParams: opts.jiParams } : undefined
        );
        CompTuningEngine.setGeneratedNoteCentsMap(map);
        CompTuningEngine.STATE.linkedScaleName = scaleName;
      }
    }
    return true;
  };

  PATCH.withCompTuningContext = function withCompTuningContext(context, options, fn) {
    const snapshot = PATCH.captureCompTuningState();
    try {
      PATCH.applyCompTuningContext(context, options);
      return fn();
    } finally {
      PATCH.restoreCompTuningState(snapshot);
    }
  };

  PATCH.extractMidiTrackDatas = function extractMidiTrackDatas(midiData) {
    const bytes = Array.from(midiData || []);
    if (bytes.length < 14) return [];
    const numTracks = (bytes[10] << 8) | bytes[11];
    let pointer = 14;
    const tracks = [];
    for (let index = 0; index < numTracks; index++) {
      if (pointer + 8 > bytes.length) break;
      const length = (bytes[pointer + 4] << 24) | (bytes[pointer + 5] << 16) | (bytes[pointer + 6] << 8) | bytes[pointer + 7];
      pointer += 8;
      tracks.push(bytes.slice(pointer, pointer + length));
      pointer += length;
    }
    return tracks;
  };

  PATCH.applyCompTuningToTrackSlice = function applyCompTuningToTrackSlice(tracks, trackNames, chord, barOffset) {
    if (!PATCH.isCompSectionRuntimeActive() || !Array.isArray(tracks) || !tracks.length || typeof writeMIDI !== 'function') {
      return tracks;
    }
    const context = PATCH.getCompTuningContextForBar(barOffset);
    if (!context) return tracks;
    const conductor = [0, 0xFF, 0x2F, 0];
    const midi = writeMIDI(tracks, (typeof S !== 'undefined' && S ? S.bpm : 120) || 120, 480, conductor);
    const useJI = typeof JI_PARAMS !== 'undefined' && JI_PARAMS && JI_PARAMS.enabled;
    const jiParams = typeof PATCH.getJiParamsForBar === 'function'
      ? PATCH.getJiParamsForBar(barOffset)
      : (typeof JI_PARAMS !== 'undefined' ? JI_PARAMS : null);
    const prevInternal = window.__MEIKY_ALLOW_COMP_SECTION_INTERNAL__;
    window.__MEIKY_ALLOW_COMP_SECTION_INTERNAL__ = true;
    try {
      const tunedMidi = PATCH.withCompTuningContext(context, {
        scaleName: typeof S !== 'undefined' && S ? S.scale : null,
        useJI,
        jiParams,
      }, () => applyCompensationTuningToMidi(midi, (typeof S !== 'undefined' && S ? S.pbRange : 2) || 2));
      const tunedTracks = PATCH.extractMidiTrackDatas(tunedMidi).slice(1);
      return tunedTracks.map((data, index) => {
        const bytes = data instanceof Uint8Array ? data : new Uint8Array(data || []);
        return bytes.length ? bytes : tracks[index];
      });
    } finally {
      window.__MEIKY_ALLOW_COMP_SECTION_INTERNAL__ = prevInternal;
    }
  };

  PATCH.getJiParamsForBar = function getJiParamsForBar(barOffset) {
    if (typeof JI_PARAMS === 'undefined') return null;
    const base = PATCH.jsonClone(JI_PARAMS);
    if (!JI_PARAMS.sectionModEnabled) return base;
    const profiles = PATCH.ensureJiSectionProfiles();
    if (!profiles.length) return base;
    let selected = profiles[0];
    profiles.forEach(profile => {
      if ((profile.bar || 0) <= (Number(barOffset) || 0)) selected = profile;
    });
    return Object.assign(base, {
      mode: selected.mode || base.mode,
      blend: Number.isFinite(selected.blend) ? selected.blend : base.blend,
      harmonicLimit: Number.isFinite(selected.harmonicLimit) ? selected.harmonicLimit : base.harmonicLimit,
      adaptiveBassAnchorStrength: Number.isFinite(selected.adaptiveBassAnchorStrength)
        ? selected.adaptiveBassAnchorStrength
        : base.adaptiveBassAnchorStrength,
      adaptiveVoiceLeadingStrength: Number.isFinite(selected.adaptiveVoiceLeadingStrength)
        ? selected.adaptiveVoiceLeadingStrength
        : base.adaptiveVoiceLeadingStrength,
      adaptiveCadenceResetEnabled: typeof selected.adaptiveCadenceResetEnabled === 'boolean'
        ? selected.adaptiveCadenceResetEnabled
        : base.adaptiveCadenceResetEnabled,
      adaptiveCadenceResetStrength: Number.isFinite(selected.adaptiveCadenceResetStrength)
        ? selected.adaptiveCadenceResetStrength
        : base.adaptiveCadenceResetStrength,
    });
  };

  PATCH.shouldResetAdaptiveJiAtBar = function shouldResetAdaptiveJiAtBar(barOffset) {
    if (typeof JI_PARAMS !== 'undefined' && JI_PARAMS && !JI_PARAMS.adaptiveResetOnSection) return false;
    const bars = window.__MEIKY_JI_SECTION_BARS__;
    if (!Array.isArray(bars) || !bars.length) return false;
    return bars.includes(Number(barOffset) || 0);
  };

  PATCH.buildAdaptiveJiPitchBendMap = function buildAdaptiveJiPitchBendMap(chord, pbRange, barOffset) {
    if (!chord || !Array.isArray(chord.iv) || typeof JustIntonation === 'undefined' || typeof JI_PARAMS === 'undefined') {
      return null;
    }
    const jiContext = PATCH.getJiParamsForBar(barOffset) || JI_PARAMS;
    if (jiContext.adaptiveMemoryEnabled && PATCH.shouldResetAdaptiveJiAtBar(barOffset)) {
      PATCH.resetAdaptiveJiMemory();
    }
    const safePbRange = Number.isFinite(pbRange) && pbRange > 0 ? pbRange : 2;
    const root = ((chord.root % 12) + 12) % 12;
    const pcs = chord.iv.map(interval => ((root + interval) % 12 + 12) % 12);
    const uniquePcs = Array.from(new Set(pcs));
    const currentCents = {};
    uniquePcs.forEach(pc => {
      currentCents[pc] = typeof JustIntonation._deviation === 'function'
        ? JustIntonation._deviation(pc, root, jiContext)
        : 0;
    });

    let offsetCents = 0;
    let commonCount = 0;
    let cadenceType = '';
    let bassBiasWeight = 1;
    let voiceLeadWeight = 1;
    const memory = PATCH.jiAdaptiveMemory || { prevCents: null, prevPcs: [], prevRootPc: null };
    const currentVoicing = typeof VLEngine !== 'undefined' && VLEngine && typeof VLEngine.voiceLead === 'function'
      ? VLEngine.voiceLead(Array.isArray(memory.prevVoicing) ? memory.prevVoicing : [], uniquePcs, { center: 60, force: true })
      : [];
    if (jiContext.adaptiveMemoryEnabled &&
        memory.prevCents &&
        Array.isArray(memory.prevPcs) &&
        memory.prevPcs.length) {
      const common = uniquePcs.filter(pc => Number.isFinite(memory.prevCents[pc]));
      commonCount = common.length;
      if (common.length) {
        const bassBias = Math.max(0, Math.min(1, Number(jiContext.adaptiveBassAnchorStrength) || 0));
        const baseDrift = common.reduce((sum, pc) => {
          return sum + (memory.prevCents[pc] - currentCents[pc]);
        }, 0) / common.length;
        const anchorPcs = common.filter(pc => {
          return pc === root || (Number.isFinite(memory.prevRootPc) && pc === memory.prevRootPc);
        });
        const anchorDrift = anchorPcs.length
          ? anchorPcs.reduce((sum, pc) => sum + (memory.prevCents[pc] - currentCents[pc]), 0) / anchorPcs.length
          : baseDrift;
        let drift = baseDrift + (anchorDrift - baseDrift) * bassBias;
        const voiceLeadBias = Math.max(0, Math.min(1, Number(jiContext.adaptiveVoiceLeadingStrength) || 0));
        const prevVoicing = Array.isArray(memory.prevVoicing) ? memory.prevVoicing : [];
        const voiceLeadWeights = {};
        if (voiceLeadBias > 0 && currentVoicing.length && prevVoicing.length) {
          currentVoicing.forEach((note, index) => {
            const pc = PATCH.mod(note, 12);
            if (!common.includes(pc)) return;
            const prevNote = prevVoicing[Math.min(index, prevVoicing.length - 1)];
            const move = Number.isFinite(prevNote) ? Math.abs(note - prevNote) : 12;
            const retain = Math.max(0, 1 - Math.min(move, 12) / 12);
            const bassPos = currentVoicing.length > 1 ? 1 - (index / (currentVoicing.length - 1)) : 1;
            const weight = 1 + retain * 1.5 + bassPos;
            voiceLeadWeights[pc] = Math.max(voiceLeadWeights[pc] || 1, weight);
          });
          const entries = common.filter(pc => Number.isFinite(voiceLeadWeights[pc]));
          if (entries.length) {
            const totalWeight = entries.reduce((sum, pc) => sum + voiceLeadWeights[pc], 0);
            const voiceLeadDrift = totalWeight > 0
              ? entries.reduce((sum, pc) => sum + (memory.prevCents[pc] - currentCents[pc]) * voiceLeadWeights[pc], 0) / totalWeight
              : drift;
            drift = drift + (voiceLeadDrift - drift) * voiceLeadBias;
            voiceLeadWeight = Math.max(...entries.map(pc => voiceLeadWeights[pc]));
            memory.lastVoiceLeadOffsetCents = voiceLeadDrift * Math.max(0, Math.min(1, Number(jiContext.adaptiveMemoryStrength) || 0));
          } else {
            memory.lastVoiceLeadOffsetCents = 0;
          }
        } else {
          memory.lastVoiceLeadOffsetCents = 0;
        }
        const strength = Math.max(0, Math.min(1, Number(jiContext.adaptiveMemoryStrength) || 0));
        offsetCents = drift * strength;
        bassBiasWeight = anchorPcs.length ? 1 + bassBias * 2 : 1;
        memory.lastBaseOffsetCents = baseDrift * strength;
        memory.lastAnchorOffsetCents = anchorDrift * strength;
      } else {
        memory.lastBaseOffsetCents = 0;
        memory.lastAnchorOffsetCents = 0;
        memory.lastVoiceLeadOffsetCents = 0;
      }
      if (jiContext.adaptiveCadenceResetEnabled) {
        cadenceType = PATCH.detectAdaptiveJiCadence(memory.prevRootPc, root);
        if (cadenceType) {
          const cadenceStrength = Math.max(0, Math.min(1, Number(jiContext.adaptiveCadenceResetStrength) || 0));
          offsetCents *= (1 - cadenceStrength);
        }
      }
    }

    const adjustedCents = {};
    const pbMap = {};
    uniquePcs.forEach(pc => {
      adjustedCents[pc] = currentCents[pc] + offsetCents;
      pbMap[pc] = PATCH.centsToPitchBend(adjustedCents[pc], safePbRange);
    });

    PATCH.jiAdaptiveMemory = {
      prevCents: adjustedCents,
      prevPcs: uniquePcs.slice(),
      prevRootPc: root,
      prevVoicing: currentVoicing.slice(),
      lastOffsetCents: offsetCents,
      lastBaseOffsetCents: memory.lastBaseOffsetCents || 0,
      lastAnchorOffsetCents: memory.lastAnchorOffsetCents || 0,
      lastVoiceLeadOffsetCents: memory.lastVoiceLeadOffsetCents || 0,
      lastCommonCount: commonCount,
      lastCadenceType: cadenceType,
      lastBassBiasWeight: bassBiasWeight,
      lastVoiceLeadWeight: voiceLeadWeight,
    };
    return pbMap;
  };

  window.__MEIKY_PATCH__ = PATCH;
})();
