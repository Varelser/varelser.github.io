/* 74-scala.js — Scala サブシステム
 * .scl/.kbm の解析、Scala プリセットとお気に入り、音名マップ構築、Scala UI 同期とインポート。
 * (2026-11-11: 90-patch-shared.js から機能ドメイン別に分散。本体モジュール。)
 */
(() => {
  'use strict';

  const PATCH = window.__MEIKY_PATCH__ || {};

  PATCH.parseScalaPitchToken = function parseScalaPitchToken(token) {
    const value = String(token || '').trim();
    if (!value) throw new Error('empty Scala pitch token');
    if (value.includes('/')) {
      const parts = value.split('/');
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (!(numerator > 0) || !(denominator > 0)) throw new Error('invalid Scala ratio: ' + value);
      return 1200 * Math.log2(numerator / denominator);
    }
    if (value.includes('.')) {
      const cents = parseFloat(value);
      if (!Number.isFinite(cents)) throw new Error('invalid Scala cents: ' + value);
      return cents;
    }
    const integer = parseFloat(value);
    if (!(integer > 0)) throw new Error('invalid Scala integer ratio: ' + value);
    return 1200 * Math.log2(integer);
  };

  PATCH.makeEdoScalaText = function makeEdoScalaText(name, edo, description, periodCents) {
    const stepCount = Math.max(1, Number(edo) || 12);
    const period = Number.isFinite(periodCents) ? periodCents : 1200;
    const lines = [description || name || (stepCount + '-EDO'), String(stepCount)];
    for (let index = 1; index <= stepCount; index++) {
      lines.push(((period / stepCount) * index).toFixed(6));
    }
    return lines.join('\n');
  };

  PATCH.initScalaPresets = function initScalaPresets() {
    if (PATCH.SCALA_PRESETS.length) return;
    PATCH.SCALA_PRESETS.push(
      {
        id: '19edo',
        label: '19-EDO',
        desc: '19 equal divisions of the octave',
        sclText: PATCH.makeEdoScalaText('19-EDO', 19, '19 equal divisions of the octave'),
        kbmText: '',
      },
      {
        id: '31edo',
        label: '31-EDO',
        desc: '31 equal divisions of the octave',
        sclText: PATCH.makeEdoScalaText('31-EDO', 31, '31 equal divisions of the octave'),
        kbmText: '',
      },
      {
        id: '22edo',
        label: '22-EDO',
        desc: '22 equal divisions of the octave',
        sclText: PATCH.makeEdoScalaText('22-EDO', 22, '22 equal divisions of the octave'),
        kbmText: '',
      },
      {
        id: '24edo',
        label: '24-EDO',
        desc: '24 equal divisions of the octave',
        sclText: PATCH.makeEdoScalaText('24-EDO', 24, '24 equal divisions of the octave'),
        kbmText: '',
      },
      {
        id: '53edo',
        label: '53-EDO',
        desc: '53 equal divisions of the octave',
        sclText: PATCH.makeEdoScalaText('53-EDO', 53, '53 equal divisions of the octave'),
        kbmText: '',
      },
      {
        id: 'bp',
        label: 'B-P',
        desc: 'Bohlen-Pierce equal temperament over a tritave',
        sclText: PATCH.makeEdoScalaText('Bohlen-Pierce', 13, 'Bohlen-Pierce equal temperament', 1901.955001),
        kbmText: '',
      },
      {
        id: '12jt',
        label: 'JI-12',
        desc: '5-limit just chromatic scale',
        sclText: [
          '5-limit just chromatic',
          '12',
          '16/15',
          '9/8',
          '6/5',
          '5/4',
          '4/3',
          '45/32',
          '3/2',
          '8/5',
          '5/3',
          '9/5',
          '15/8',
          '2/1',
        ].join('\n'),
        kbmText: '',
      },
      {
        id: 'septimal',
        label: 'JI-7',
        desc: '7-limit just scale colors',
        sclText: [
          '7-limit lattice',
          '12',
          '28/27',
          '9/8',
          '7/6',
          '5/4',
          '21/16',
          '4/3',
          '7/5',
          '3/2',
          '14/9',
          '5/3',
          '7/4',
          '2/1',
        ].join('\n'),
        kbmText: '',
      }
    );
  };

  PATCH.readScalaFavorites = function readScalaFavorites() {
    try {
      const raw = localStorage.getItem(PATCH.SCALA_FAVORITES_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  };

  PATCH.writeScalaFavorites = function writeScalaFavorites(favorites) {
    try {
      localStorage.setItem(PATCH.SCALA_FAVORITES_KEY, JSON.stringify(favorites || {}));
    } catch (_) {}
  };

  PATCH.parseScalaScl = function parseScalaScl(text, fallbackName) {
    const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/);
    const payload = [];
    for (const raw of lines) {
      const trimmed = raw.trim();
      if (!trimmed || trimmed.startsWith('!')) continue;
      payload.push(trimmed);
    }
    if (payload.length < 2) throw new Error('Scala .scl is incomplete');
    const description = payload[0];
    const noteCount = parseInt(payload[1], 10);
    if (!(noteCount > 0)) throw new Error('Scala .scl note count is invalid');
    const pitches = [];
    for (let index = 2; index < payload.length && pitches.length < noteCount; index++) {
      const token = payload[index].split(/\s+/)[0];
      pitches.push(+PATCH.parseScalaPitchToken(token).toFixed(6));
    }
    if (pitches.length !== noteCount) throw new Error('Scala .scl pitch count mismatch');
    return {
      name: String(fallbackName || description || 'Scala').replace(/\.(scl)$/i, ''),
      description,
      noteCount,
      pitches,
      periodCents: pitches.length ? pitches[pitches.length - 1] : 1200,
      text: String(text || ''),
    };
  };

  PATCH.defaultScalaKbm = function defaultScalaKbm(scale) {
    const mapSize = Math.max(1, Number(scale && scale.noteCount) || 12);
    return {
      name: 'Default KBM',
      mapSize,
      firstMidi: 0,
      lastMidi: 127,
      middleNote: 60,
      referenceNote: 69,
      referenceFreq: PATCH.getConcertA4Hz(),
      formalOctave: mapSize,
      mapping: Array.from({ length: mapSize }, (_, index) => index),
      text: '',
      implicit: true,
    };
  };

  PATCH.parseScalaKbm = function parseScalaKbm(text, scale, fallbackName) {
    if (!text || !String(text).trim()) return PATCH.defaultScalaKbm(scale);
    const lines = String(text).replace(/^\uFEFF/, '').split(/\r?\n/);
    const payload = [];
    for (const raw of lines) {
      const trimmed = raw.trim();
      if (!trimmed || trimmed.startsWith('!')) continue;
      payload.push(trimmed);
    }
    let nameLine = '';
    if (payload.length && !Number.isFinite(parseInt(payload[0], 10))) {
      nameLine = payload.shift();
    }
    if (payload.length < 7) throw new Error('Scala .kbm is incomplete');
    const mapSize = parseInt(payload[0], 10);
    const firstMidi = parseInt(payload[1], 10);
    const lastMidi = parseInt(payload[2], 10);
    const middleNote = parseInt(payload[3], 10);
    const referenceNote = parseInt(payload[4], 10);
    const referenceFreq = parseFloat(payload[5]);
    const formalOctave = parseInt(payload[6], 10);
    if (!(mapSize > 0)) throw new Error('Scala .kbm map size is invalid');
    if (!Number.isFinite(referenceFreq) || referenceFreq <= 0) throw new Error('Scala .kbm reference frequency is invalid');
    const mapping = [];
    for (let index = 0; index < mapSize; index++) {
      const raw = payload[7 + index];
      if (raw == null) {
        mapping.push(index);
        continue;
      }
      const token = raw.split(/\s+/)[0];
      mapping.push(/^[xX]$/.test(token) ? null : parseInt(token, 10));
    }
    return {
      name: String(fallbackName || nameLine || 'Keyboard Mapping').replace(/\.(kbm)$/i, ''),
      mapSize,
      firstMidi: Number.isFinite(firstMidi) ? firstMidi : 0,
      lastMidi: Number.isFinite(lastMidi) ? lastMidi : 127,
      middleNote: Number.isFinite(middleNote) ? middleNote : 60,
      referenceNote: Number.isFinite(referenceNote) ? referenceNote : 69,
      referenceFreq,
      formalOctave: formalOctave > 0 ? formalOctave : Math.max(1, Number(scale && scale.noteCount) || 12),
      mapping,
      text: String(text || ''),
      implicit: false,
    };
  };

  PATCH.scalaDegreeToCents = function scalaDegreeToCents(scale, degree, formalOctave) {
    const octaveSize = Math.max(1, formalOctave || scale.noteCount || 12);
    const periods = PATCH.floorDiv(degree, octaveSize);
    const degreeInOctave = PATCH.mod(degree, octaveSize);
    const base = periods * (Number.isFinite(scale.periodCents) ? scale.periodCents : 1200);
    if (degreeInOctave === 0) return base;
    const idx = Math.max(0, Math.min(scale.pitches.length - 1, degreeInOctave - 1));
    return base + scale.pitches[idx];
  };

  PATCH.scalaDegreeForMidi = function scalaDegreeForMidi(note, kbm) {
    if (note < kbm.firstMidi || note > kbm.lastMidi) return null;
    const relative = note - kbm.middleNote;
    const mapIndex = PATCH.mod(relative, kbm.mapSize);
    const octaveOffset = PATCH.floorDiv(relative, kbm.mapSize);
    const degree = kbm.mapping[mapIndex];
    if (!Number.isFinite(degree)) return null;
    return octaveOffset * kbm.formalOctave + degree;
  };

  PATCH.buildScalaNoteMap = function buildScalaNoteMap(scale, kbm, referenceHz) {
    const refDegree = PATCH.scalaDegreeForMidi(kbm.referenceNote, kbm);
    const fallbackRefDegree = refDegree != null ? refDegree : 0;
    const noteMap = {};
    for (let note = 0; note <= 127; note++) {
      const degree = PATCH.scalaDegreeForMidi(note, kbm);
      if (degree == null) continue;
      const relativeCents =
        PATCH.scalaDegreeToCents(scale, degree, kbm.formalOctave) -
        PATCH.scalaDegreeToCents(scale, fallbackRefDegree, kbm.formalOctave);
      const targetHz = referenceHz * Math.pow(2, relativeCents / 1200);
      const equalHz = PATCH.midiToHz(note);
      noteMap[note] = +(1200 * Math.log2(targetHz / equalHz)).toFixed(2);
    }
    return noteMap;
  };

  PATCH.deriveScalaPcCents = function deriveScalaPcCents(noteMap, rootPc) {
    const derived = Array(12).fill(0);
    for (let index = 0; index < 12; index++) {
      const midi = 60 + PATCH.mod((rootPc || 0) + index, 12);
      derived[index] = Number.isFinite(noteMap[midi]) ? noteMap[midi] : 0;
    }
    return derived;
  };

  PATCH.syncScalaUI = function syncScalaUI() {
    if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return;
    PATCH.initScalaPresets();
    PATCH.ensureScalaTemperamentEntry();
    const row = document.getElementById('ctScalaRow');
    const label = document.getElementById('ctScalaStatus');
    const clearBtn = document.getElementById('ctScalaClear');
    const kbmBtn = document.getElementById('ctScalaKbmBtn');
    const presetGrid = document.getElementById('ctScalaPresetGrid');
    const favoriteGrid = document.getElementById('ctScalaFavoriteGrid');
    const favorites = PATCH.readScalaFavorites();
    const profile = CompTuningEngine.STATE.scalaProfile;
    const enabled = !!profile;
    if (row) row.style.display = '';
    if (label) {
      if (!enabled) {
        label.textContent = 'NO SCALA FILE LOADED';
      } else {
        const kbmName = profile.kbmName || 'Default KBM';
        const refText = Number.isFinite(profile.referenceFreq) ? profile.referenceFreq.toFixed(3) + ' Hz' : 'pending';
        label.textContent =
          'SCL: ' + profile.sclName +
          '  |  KBM: ' + kbmName +
          '  |  NOTES: ' + (profile.noteCount || '?') +
          '  |  REF: ' + refText;
      }
    }
    if (clearBtn) clearBtn.disabled = !enabled;
    if (kbmBtn) {
      kbmBtn.classList.toggle('on', !!(enabled && profile.kbmText));
      kbmBtn.title = enabled && profile.kbmText ? 'Custom KBM loaded' : 'Load optional .kbm keyboard mapping';
    }
    if (presetGrid) {
      const activePresetId = enabled ? (profile.presetId || '') : '';
      presetGrid.querySelectorAll('[data-scala-preset]').forEach(button => {
        button.classList.toggle('on', button.dataset.scalaPreset === activePresetId);
      });
    }
    if (favoriteGrid) {
      const activeFavorite = enabled ? (profile.favoriteSlot || '') : '';
      favoriteGrid.querySelectorAll('[data-scala-favorite]').forEach(button => {
        const slot = button.dataset.scalaFavorite;
        const entry = favorites[slot];
        button.classList.toggle('on', slot === activeFavorite);
        button.classList.toggle('empty', !entry);
        button.textContent = entry ? slot + ' ' + (entry.label || 'Saved') : slot;
        button.title = entry ? (entry.label || slot) : 'Empty favorite slot — Option/Alt+Click to save current Scala';
      });
    }
    PATCH.syncPatchDiagnosticsUI();
  };

  PATCH.syncCompSectionUI = function syncCompSectionUI() {
    if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return;
    const button = document.getElementById('ctSectionModBtn');
    const followButton = document.getElementById('ctSectionFollowBtn');
    const wrap = document.getElementById('ctSectionProfiles');
    const info = document.getElementById('ctSectionInfo');
    const follow = PATCH.ensureSectionPreviewFollow();
    const previewState = PATCH.previewTransportState || { playing: false, bar: 0 };
    if (button) button.classList.toggle('on', !!CompTuningEngine.STATE.sectionModEnabled);
    if (followButton) followButton.classList.toggle('on', !!follow.comp);
    const profiles = PATCH.ensureCompSectionProfiles();
    if (info) {
      info.textContent = CompTuningEngine.STATE.sectionModEnabled
        ? 'SECTION TUNING ACTIVE' + (PATCH.isCompSectionRuntimeActive() ? '' : ' / MPE BYPASS') + (follow.comp ? ' / FOLLOW BAR ' + (previewState.bar + 1) : '')
        : 'SECTION TUNING OFF';
    }
    if (!wrap) {
      PATCH.syncPatchDiagnosticsUI();
      return;
    }
    wrap.style.display = CompTuningEngine.STATE.sectionModEnabled && profiles.length ? '' : 'none';
    const scalaOptions = PATCH.getCompSectionScalaOptions();
    wrap.innerHTML = profiles.map((profile, index) =>
      '<div data-ct-section-index="' + index + '" style="border:1px solid ' + (index === (Number(PATCH.sectionLearnFocus.comp) || 0) ? 'var(--cyan)' : 'var(--border)') + ';padding:8px 10px;margin-bottom:8px;background:' + (index === (Number(PATCH.sectionLearnFocus.comp) || 0) ? 'rgba(34,211,238,.08)' : 'rgba(255,255,255,.02)') + ';cursor:pointer;">' +
        '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:#b7f7d1;letter-spacing:2px;margin-bottom:6px;">' +
          profile.name + ' @ BAR ' + (profile.bar + 1) + (index === (Number(PATCH.sectionLearnFocus.comp) || 0) ? '  |  LEARN TARGET' : '') +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:6px;">' +
          '<label style="font-size:8px;color:var(--text-dim);">A4</label>' +
          '<input data-ct-section-a4="' + index + '" type="range" min="415" max="466" step="0.1" value="' + Number(profile.a4Hz || 440).toFixed(1) + '" style="flex:1;min-width:120px;">' +
          '<div data-ct-section-a4-v="' + index + '" style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--cyan);min-width:52px;">' + Number(profile.a4Hz || 440).toFixed(1) + ' Hz</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:6px;">' +
          '<label style="font-size:8px;color:var(--text-dim);">GLOBAL</label>' +
          '<input data-ct-section-cents="' + index + '" type="range" min="-100" max="100" step="0.5" value="' + Number(profile.globalCents || 0).toFixed(1) + '" style="flex:1;min-width:120px;">' +
          '<div data-ct-section-cents-v="' + index + '" style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--cyan);min-width:48px;">' + PATCH.formatSignedCents(Number(profile.globalCents || 0)) + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:6px;">' +
          '<label style="font-size:8px;color:var(--text-dim);">ROOT</label>' +
          '<input data-ct-section-root="' + index + '" type="range" min="0" max="11" step="1" value="' + PATCH.mod(profile.rootPc || 0, 12) + '" style="flex:1;min-width:120px;">' +
          '<div data-ct-section-root-v="' + index + '" style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--cyan);min-width:24px;">' + (PATCH.NOTE_NAMES[PATCH.mod(profile.rootPc || 0, 12)] || 'C') + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
          '<label style="font-size:8px;color:var(--text-dim);">SCALA</label>' +
          '<select data-ct-section-scala="' + index + '" class="midi-in-select" style="min-width:180px;">' +
            scalaOptions.map(option =>
              '<option value="' + option.value + '"' + (option.value === (profile.scalaSource || 'inherit') ? ' selected' : '') + '>' + option.label + '</option>'
            ).join('') +
          '</select>' +
        '</div>' +
      '</div>'
    ).join('');
    PATCH.syncPatchDiagnosticsUI();
  };

  PATCH.ensureScalaTemperamentEntry = function ensureScalaTemperamentEntry() {
    if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return;
    const profile = CompTuningEngine.STATE.scalaProfile;
    if (!profile) return;
    if (CompTuningEngine.TEMPERAMENTS[PATCH.SCALA_TEMPERAMENT_KEY]) return;
    const cents = Array.isArray(CompTuningEngine.STATE.customCents) && CompTuningEngine.STATE.customCents.length === 12
      ? CompTuningEngine.STATE.customCents.slice()
      : Array(12).fill(0);
    CompTuningEngine.TEMPERAMENTS[PATCH.SCALA_TEMPERAMENT_KEY] = {
      name: 'Scala Import',
      desc: profile.sclName || 'Imported Scala tuning',
      cents,
    };
    if (profile.sclName && CompTuningEngine.STATE.temperament !== PATCH.SCALA_TEMPERAMENT_KEY) {
      CompTuningEngine.STATE.temperament = PATCH.SCALA_TEMPERAMENT_KEY;
    }
  };

  PATCH.refreshScalaProfile = function refreshScalaProfile(rebuildUI = true) {
    if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE || !CompTuningEngine.STATE.scalaProfile) return false;
    const profile = CompTuningEngine.STATE.scalaProfile;
    try {
      const scale = PATCH.parseScalaScl(profile.sclText, profile.sclName);
      const kbm = PATCH.parseScalaKbm(profile.kbmText || '', scale, profile.kbmName);
      const referenceHz = kbm.referenceFreq;
      const noteMap = PATCH.buildScalaNoteMap(scale, kbm, referenceHz);
      const derivedCents = PATCH.deriveScalaPcCents(noteMap, CompTuningEngine.STATE.rootPc);
      CompTuningEngine.TEMPERAMENTS[PATCH.SCALA_TEMPERAMENT_KEY] = {
        name: 'Scala Import',
        desc: scale.description || 'Imported Scala tuning',
        cents: derivedCents.slice(),
      };
      CompTuningEngine.STATE.scalaProfile = {
        sclName: scale.name,
        sclText: scale.text,
        kbmName: kbm.name,
        kbmText: kbm.text,
        presetId: profile.presetId || null,
        favoriteSlot: profile.favoriteSlot || null,
        noteCount: scale.noteCount,
        periodCents: scale.periodCents,
        mapSize: kbm.mapSize,
        formalOctave: kbm.formalOctave,
        referenceFreq: kbm.referenceFreq,
      };
      CompTuningEngine.STATE.customCents = derivedCents.slice();
      CompTuningEngine.STATE.temperament = PATCH.SCALA_TEMPERAMENT_KEY;
      if (typeof CompTuningEngine.disableScaleMicroSync === 'function') {
        CompTuningEngine.disableScaleMicroSync();
      } else {
        CompTuningEngine.STATE.autoScaleSync = false;
      }
      if (typeof CompTuningEngine.setGeneratedNoteCentsMap === 'function') {
        CompTuningEngine.setGeneratedNoteCentsMap(noteMap);
      }
      if (rebuildUI) {
        if (typeof CompTuningEngine.buildTemperamentButtons === 'function') CompTuningEngine.buildTemperamentButtons();
        if (typeof CompTuningEngine.buildIntervalGrid === 'function') CompTuningEngine.buildIntervalGrid();
        if (typeof CompTuningEngine.updateDisplay === 'function') CompTuningEngine.updateDisplay();
        PATCH.syncScalaUI();
        PATCH.syncConcertPitchUI();
      }
      return true;
    } catch (error) {
      console.warn('[ScalaImport]', error);
      return false;
    }
  };

  PATCH.importScalaProfile = function importScalaProfile(sclText, kbmText, sclName, kbmName, meta) {
    if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return false;
    const extras = meta && typeof meta === 'object' ? meta : {};
    CompTuningEngine.STATE.scalaProfile = {
      sclName: sclName || 'Scala',
      sclText: String(sclText || ''),
      kbmName: kbmName || '',
      kbmText: String(kbmText || ''),
      presetId: extras.presetId || null,
      favoriteSlot: extras.favoriteSlot || null,
    };
    return PATCH.refreshScalaProfile(true);
  };

  PATCH.loadScalaPreset = function loadScalaPreset(presetId) {
    PATCH.initScalaPresets();
    const preset = PATCH.SCALA_PRESETS.find(entry => entry.id === presetId);
    if (!preset) return false;
    return PATCH.importScalaProfile(
      preset.sclText,
      preset.kbmText || '',
      preset.label + '.scl',
      preset.kbmText ? preset.label + '.kbm' : '',
      { presetId: preset.id }
    );
  };

  PATCH.saveScalaFavorite = function saveScalaFavorite(slot) {
    if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE || !CompTuningEngine.STATE.scalaProfile) return false;
    if (!PATCH.SCALA_FAVORITE_SLOTS.includes(slot)) return false;
    const profile = CompTuningEngine.STATE.scalaProfile;
    const favorites = PATCH.readScalaFavorites();
    favorites[slot] = {
      label: profile.sclName + (profile.kbmName ? ' + ' + profile.kbmName : ''),
      sclName: profile.sclName,
      sclText: profile.sclText,
      kbmName: profile.kbmName || '',
      kbmText: profile.kbmText || '',
      presetId: profile.presetId || null,
    };
    PATCH.writeScalaFavorites(favorites);
    CompTuningEngine.STATE.scalaProfile.favoriteSlot = slot;
    PATCH.syncScalaUI();
    return true;
  };

  PATCH.clearScalaFavorite = function clearScalaFavorite(slot) {
    if (!PATCH.SCALA_FAVORITE_SLOTS.includes(slot)) return false;
    const favorites = PATCH.readScalaFavorites();
    if (!favorites[slot]) return false;
    delete favorites[slot];
    PATCH.writeScalaFavorites(favorites);
    if (typeof CompTuningEngine !== 'undefined' &&
        CompTuningEngine.STATE &&
        CompTuningEngine.STATE.scalaProfile &&
        CompTuningEngine.STATE.scalaProfile.favoriteSlot === slot) {
      CompTuningEngine.STATE.scalaProfile.favoriteSlot = null;
    }
    PATCH.syncScalaUI();
    return true;
  };

  PATCH.loadScalaFavorite = function loadScalaFavorite(slot) {
    if (!PATCH.SCALA_FAVORITE_SLOTS.includes(slot)) return false;
    const favorites = PATCH.readScalaFavorites();
    const entry = favorites[slot];
    if (!entry) return false;
    return PATCH.importScalaProfile(
      entry.sclText,
      entry.kbmText || '',
      entry.sclName || slot,
      entry.kbmName || '',
      {
        presetId: entry.presetId || null,
        favoriteSlot: slot,
      }
    );
  };

  PATCH.clearScalaProfile = function clearScalaProfile() {
    if (typeof CompTuningEngine === 'undefined' || !CompTuningEngine.STATE) return;
    delete CompTuningEngine.TEMPERAMENTS[PATCH.SCALA_TEMPERAMENT_KEY];
    if (typeof CompTuningEngine.clearGeneratedNoteCentsMap === 'function') {
      CompTuningEngine.clearGeneratedNoteCentsMap();
    } else {
      CompTuningEngine.STATE.generatedNoteCentsMap = null;
    }
    CompTuningEngine.STATE.scalaProfile = null;
    CompTuningEngine.STATE.customCents = Array(12).fill(0);
    if (CompTuningEngine.STATE.temperament === PATCH.SCALA_TEMPERAMENT_KEY) {
      CompTuningEngine.STATE.temperament = 'Equal';
    }
    if (typeof CompTuningEngine.buildTemperamentButtons === 'function') CompTuningEngine.buildTemperamentButtons();
    if (typeof CompTuningEngine.buildIntervalGrid === 'function') CompTuningEngine.buildIntervalGrid();
    if (typeof CompTuningEngine.updateDisplay === 'function') CompTuningEngine.updateDisplay();
    PATCH.syncScalaUI();
  };

  window.__MEIKY_PATCH__ = PATCH;
})();
