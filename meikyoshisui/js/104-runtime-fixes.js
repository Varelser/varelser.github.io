/* ═══════════════════════════════════════════════════════════════
   104-runtime-fixes.js — Runtime bugfix & Preview Engine v2 (2026-11-25)
   Additive layer without altering obfuscated/hardened modules:
   - Bugfixes:
     1. MidiPreview: Pitch Bend (JI/Scala/MPE), multi-tempo Rubato,
        CC7/CC11/CC10, live setChVol GainNode updates (Mixer /
        STUDIO RESONANCE / Studio Console), O(N) note pairing,
        lookahead scheduling, de-click fade-out on pause/stop/seek.
     2. #prevSeek: resume playback after drag/click + pointer/touch.
     3. Keyboard shortcuts: resolve 1-3 triple collision, guard
        modifier keys on Visualizer, route F key to Studio Dock.
     4. Create Randomize/Mutate: protect transport, mixer, concert
        pitch, visualizer, MIDI capture, and Studio dock sliders.
     5. Adaptive JI: prevent premature nulling of
        window.__MEIKY_JI_SECTION_BARS__ across async __genYield().
   - Engine Extensions (used by js/105-studio-features.js):
     6. Ambient FX bus: synthetic stereo IR reverb (ConvolverNode),
        master warmth lowpass filter, Drone/Pad detuned unison.
     7. Real-time A/B Tuning Compare (Microtonal/JI vs 12-TET).
     8. Seamless Loop & A-B Section Loop playback.
     9. Section × Layer Arranger mute matrix.
    10. Layer Freeze (keep frozen channels across re-generation).
   ═══════════════════════════════════════════════════════════════ */
(() => {
'use strict';

/* ── 1. Enhanced MidiPreview Engine ───────────────────────────── */
const TIMBRE = {
  default: { wave: 'sine',     attack: 0.02, release: 0.15, unison: false },
  0:       { wave: 'sine',     attack: 0.4,  release: 1.2,  unison: true  },
  1:       { wave: 'triangle', attack: 0.15, release: 0.6,  unison: true  },
  2:       { wave: 'sawtooth', attack: 0.01, release: 0.08, unison: false },
  3:       { wave: 'sine',     attack: 0.03, release: 0.18, unison: false },
  4:       { wave: 'sine',     attack: 0.05, release: 0.3,  unison: false },
  5:       { wave: 'triangle', attack: 0.02, release: 0.25, unison: true  },
  6:       { wave: 'sine',     attack: 0.08, release: 0.5,  unison: true  },
  7:       { wave: 'sawtooth', attack: 0.01, release: 0.1,  unison: false },
  8:       { wave: 'triangle', attack: 0.03, release: 0.12, unison: false },
  9:       { wave: 'square',   attack: 0.02, release: 0.1,  unison: false },
};

function parseMidiEnhanced(bytes) {
  if (!bytes || bytes.length < 14) return null;
  if (bytes[0] !== 0x4D || bytes[1] !== 0x54 || bytes[2] !== 0x68 || bytes[3] !== 0x64) return null;
  let pos = 4;
  function readU16() { const v = (bytes[pos] << 8) | bytes[pos + 1]; pos += 2; return v; }
  function readU32() { const v = ((bytes[pos] << 24) | (bytes[pos + 1] << 16) | (bytes[pos + 2] << 8) | bytes[pos + 3]) >>> 0; pos += 4; return v; }
  function readVLQ(limit) {
    let v = 0;
    for (let i = 0; i < 4 && pos < limit; i++) {
      const b = bytes[pos++];
      v = (v << 7) | (b & 0x7F);
      if (!(b & 0x80)) break;
    }
    return v;
  }

  readU32(); /* header length */
  readU16(); /* format */
  const numTracks = readU16();
  const ppq = readU16() || 480;

  const noteEvents = [];
  const tempos = [];
  const pitchBends = [];
  const ccs = [];

  for (let t = 0; t < numTracks; t++) {
    if (pos + 8 > bytes.length) break;
    if (bytes[pos] !== 0x4D || bytes[pos + 1] !== 0x54 || bytes[pos + 2] !== 0x72 || bytes[pos + 3] !== 0x6B) break;
    pos += 4;
    const trkLen = readU32();
    const trkEnd = Math.min(bytes.length, pos + trkLen);
    let tick = 0;
    let runStatus = 0;

    while (pos < trkEnd) {
      tick += readVLQ(trkEnd);
      if (pos >= trkEnd) break;
      let status = bytes[pos];
      if (status & 0x80) {
        if (status < 0xF0) runStatus = status;
        pos++;
      } else {
        status = runStatus;
      }

      const type = status & 0xF0;
      const ch = status & 0x0F;

      if (type === 0x90) {
        if (pos + 1 >= trkEnd) break;
        const note = bytes[pos++];
        const vel = bytes[pos++];
        noteEvents.push({ on: vel > 0, ch, note, vel: vel > 0 ? vel : 0, tick });
      } else if (type === 0x80) {
        if (pos + 1 >= trkEnd) break;
        const note = bytes[pos++];
        pos++;
        noteEvents.push({ on: false, ch, note, vel: 0, tick });
      } else if (type === 0xA0) {
        pos += 2;
      } else if (type === 0xB0) {
        if (pos + 1 >= trkEnd) break;
        const cc = bytes[pos++];
        const val = bytes[pos++];
        if (cc === 7 || cc === 10 || cc === 11) ccs.push({ ch, cc, val, tick });
      } else if (type === 0xC0 || type === 0xD0) {
        pos += 1;
      } else if (type === 0xE0) {
        if (pos + 1 >= trkEnd) break;
        const lsb = bytes[pos++];
        const msb = bytes[pos++];
        pitchBends.push({ ch, val: ((msb << 7) | lsb) - 8192, tick });
      } else if (status === 0xFF) {
        if (pos >= trkEnd) break;
        const mtype = bytes[pos++];
        const mlen = readVLQ(trkEnd);
        if (mtype === 0x51 && mlen === 3 && pos + 2 < trkEnd) {
          const uspb = (bytes[pos] << 16) | (bytes[pos + 1] << 8) | bytes[pos + 2];
          if (uspb > 0) tempos.push({ tick, us: uspb });
        }
        pos += mlen;
      } else if (status === 0xF0 || status === 0xF7) {
        const slen = readVLQ(trkEnd);
        pos += slen;
      } else {
        pos++;
      }
    }
    pos = trkEnd;
  }

  noteEvents.sort((a, b) => a.tick - b.tick || (a.on === b.on ? 0 : (a.on ? 1 : -1)));
  tempos.sort((a, b) => a.tick - b.tick);
  pitchBends.sort((a, b) => a.tick - b.tick);
  ccs.sort((a, b) => a.tick - b.tick);

  const bpmOverride = tempos.length ? Math.round(60000000 / tempos[0].us) : null;
  return { ppq, bpmOverride, noteEvents, tempos, pitchBends, ccs };
}

function buildTempoMap(ppq, tempos, fallbackBpm) {
  const defaultUs = Math.round(60000000 / (fallbackBpm > 0 ? fallbackBpm : 60));
  const segs = [];
  let curUs = defaultUs;
  let lastTick = 0;
  let accSec = 0;

  if (!tempos || !tempos.length || tempos[0].tick > 0) {
    segs.push({ tick: 0, sec: 0, us: defaultUs });
  }
  for (let i = 0; i < (tempos ? tempos.length : 0); i++) {
    const t = tempos[i];
    if (t.tick > lastTick) {
      accSec += ((t.tick - lastTick) / ppq) * (curUs / 1e6);
      lastTick = t.tick;
    }
    curUs = t.us;
    if (segs.length && segs[segs.length - 1].tick === t.tick) {
      segs[segs.length - 1].us = curUs;
    } else {
      segs.push({ tick: t.tick, sec: accSec, us: curUs });
    }
  }

  function tickToSec(tick) {
    let lo = 0, hi = segs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (segs[mid].tick <= tick) lo = mid;
      else hi = mid - 1;
    }
    const seg = segs[lo];
    return seg.sec + ((tick - seg.tick) / ppq) * (seg.us / 1e6);
  }

  function secToTick(sec) {
    const s = Math.max(0, Number(sec) || 0);
    let lo = 0, hi = segs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (segs[mid].sec <= s) lo = mid;
      else hi = mid - 1;
    }
    const seg = segs[lo];
    return Math.round(seg.tick + ((s - seg.sec) / (seg.us / 1e6)) * ppq);
  }

  return { segs, tickToSec, secToTick };
}

function buildScheduledNotes(parsed, tickToSec, pbRange) {
  const range = (typeof pbRange === 'number' && isFinite(pbRange) && pbRange > 0) ? pbRange : 2;
  const timeline = [];
  for (let i = 0; i < parsed.pitchBends.length; i++) {
    const b = parsed.pitchBends[i];
    timeline.push({ tick: b.tick, ord: 0, kind: 'pb', ch: b.ch, val: b.val });
  }
  for (let i = 0; i < parsed.ccs.length; i++) {
    const c = parsed.ccs[i];
    timeline.push({ tick: c.tick, ord: 1, kind: 'cc', ch: c.ch, cc: c.cc, val: c.val });
  }
  for (let i = 0; i < parsed.noteEvents.length; i++) {
    const n = parsed.noteEvents[i];
    timeline.push({ tick: n.tick, ord: n.on ? 3 : 2, kind: n.on ? 'on' : 'off', ch: n.ch, note: n.note, vel: n.vel });
  }
  timeline.sort((a, b) => a.tick - b.tick || a.ord - b.ord);

  const bendByCh = new Float64Array(16);
  const cc7ByCh = new Float64Array(16).fill(127);
  const cc11ByCh = new Float64Array(16).fill(127);
  const openMap = new Map();
  const notes = [];

  for (let i = 0; i < timeline.length; i++) {
    const ev = timeline[i];
    if (ev.kind === 'pb') {
      bendByCh[ev.ch] = (ev.val / 8192) * range;
      const tSec = tickToSec(ev.tick);
      openMap.forEach(list => {
        for (let j = 0; j < list.length; j++) {
          if (list[j].ch === ev.ch) list[j].bends.push({ sec: tSec, semis: bendByCh[ev.ch] });
        }
      });
    } else if (ev.kind === 'cc') {
      if (ev.cc === 7) cc7ByCh[ev.ch] = ev.val;
      else if (ev.cc === 11) cc11ByCh[ev.ch] = ev.val;
    } else if (ev.kind === 'on') {
      const k = ev.ch + ':' + ev.note;
      const startSec = tickToSec(ev.tick);
      const ccGain = Math.max(0.05, (cc7ByCh[ev.ch] / 127) * (cc11ByCh[ev.ch] / 127));
      const item = {
        ch: ev.ch,
        note: ev.note,
        vel: ev.vel,
        startSec,
        endSec: startSec + 0.5,
        bendSemis: bendByCh[ev.ch],
        ccGain,
        bends: [],
      };
      let list = openMap.get(k);
      if (!list) { list = []; openMap.set(k, list); }
      list.push(item);
      notes.push(item);
    } else if (ev.kind === 'off') {
      const k = ev.ch + ':' + ev.note;
      const list = openMap.get(k);
      if (list && list.length) {
        const item = list.shift();
        item.endSec = Math.max(item.startSec + 0.03, tickToSec(ev.tick));
        if (!list.length) openMap.delete(k);
      }
    }
  }

  notes.sort((a, b) => a.startSec - b.startSec);
  return notes;
}

function createAmbientIR(ac, seconds, decay) {
  const sr = ac.sampleRate || 44100;
  const len = Math.max(1, Math.floor(sr * (seconds || 2.8)));
  const buf = ac.createBuffer(2, len, sr);
  let seed = 0x1234567;
  function rand() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed / 4294967296) * 2 - 1;
  }
  const d = decay || 2.6;
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const env = Math.pow(1 - i / len, d);
      /* Gentle lowpass inside IR for warm dark-ambient tail */
      lp += (rand() - lp) * 0.22;
      data[i] = lp * env;
    }
  }
  return buf;
}

let _seekDragging = false;
let _omakaseGuarding = false;

function patchMidiPreview() {
  if (typeof MidiPreview === 'undefined' || !MidiPreview) return;

  let _ac = null;
  let _masterGain = null;
  let _filterNode = null;
  let _dryGain = null;
  let _wetGain = null;
  let _convolver = null;
  let _irBuffer = null;
  let _analyser = null;
  let _recDest = null;
  let _chGains = {};
  const _chVol = {};

  let _parsed = null;
  let _tempoMap = null;
  let _notes = [];
  let _bpm = 60;
  let _duration = 0;
  let _startAt = 0;
  let _pausedAt = 0;
  let _playing = false;
  let _raf = null;
  let _schedTimer = null;
  let _nextIdx = 0;
  let _activeNodes = new Set();

  /* Feature state */
  const _fx = { enabled: true, reverbWet: 0.35, filterHz: 4200, unison: true };
  let _tuningMode = 'micro'; /* 'micro' | '12tet' */
  const _loop = { enabled: false, startSec: null, endSec: null };
  const _arranger = { sections: 4, muted: {} }; /* key: `${sec}:${ch}` -> true */
  const _frozenCh = new Set();
  const _frozenNotes = new Map(); /* ch -> cloned note[] */
  const _listeners = new Set();

  function emitChange(kind) {
    _listeners.forEach(fn => { try { fn(kind); } catch (e) {} });
  }

  function getAC() {
    if (!_ac || _ac.state === 'closed') {
      const AC = window.AudioContext || window.webkitAudioContext;
      try { _ac = new AC({ latencyHint: 'interactive' }); } catch (e) { _ac = new AC(); }
      _irBuffer = null;
    }
    if (_ac.state === 'suspended') _ac.resume().catch(() => {});
    return _ac;
  }

  function midiFreq(midiFloat, ignoreMicro) {
    if (ignoreMicro) return 440 * Math.pow(2, (midiFloat - 69) / 12);
    const P = window.__MEIKY_PATCH__;
    if (P && typeof P.midiToHz === 'function') return P.midiToHz(midiFloat);
    return 440 * Math.pow(2, (midiFloat - 69) / 12);
  }

  function currentPbRange() {
    try {
      if (typeof S !== 'undefined' && S && typeof S.pbRange === 'number' && isFinite(S.pbRange) && S.pbRange > 0) {
        return S.pbRange;
      }
    } catch (e) {}
    return 2;
  }

  function sectionIndexForSec(sec) {
    const contentDur = Math.max(0.1, _duration - 2.0);
    const n = Math.max(1, _arranger.sections);
    return Math.max(0, Math.min(n - 1, Math.floor((Math.max(0, sec) / contentDur) * n)));
  }

  function isMutedAt(sec, ch) {
    const sIdx = sectionIndexForSec(sec);
    return !!_arranger.muted[sIdx + ':' + ch];
  }

  function _syncFxNodes() {
    if (!_ac) return;
    const now = _ac.currentTime;
    if (_filterNode) {
      const targetHz = _fx.enabled ? Math.max(250, Math.min(18000, _fx.filterHz)) : 18000;
      try { _filterNode.frequency.setTargetAtTime(targetHz, now, 0.025); }
      catch (e) { _filterNode.frequency.value = targetHz; }
    }
    if (_wetGain && _dryGain) {
      const wet = _fx.enabled ? Math.max(0, Math.min(0.85, _fx.reverbWet)) : 0;
      const dry = _fx.enabled ? Math.max(0.35, 1 - wet * 0.45) : 1;
      try {
        _wetGain.gain.setTargetAtTime(wet, now, 0.025);
        _dryGain.gain.setTargetAtTime(dry, now, 0.025);
      } catch (e) {
        _wetGain.gain.value = wet;
        _dryGain.gain.value = dry;
      }
    }
  }

  function _syncSectionFocus(elapsedSec, isPlayingNow, force) {
    const P = window.__MEIKY_PATCH__;
    if (!P || typeof P.syncPreviewLinkedSectionFocus !== 'function' || !_parsed) return;
    const safeElapsed = Math.max(0, Number(elapsedSec) || 0);
    const tick = _tempoMap ? _tempoMap.secToTick(safeElapsed) : 0;
    const bar = Math.floor(tick / (_parsed.ppq * 4));
    P.syncPreviewLinkedSectionFocus(bar, {
      playing: !!isPlayingNow,
      duration: _duration,
      progress: _duration > 0 ? safeElapsed / _duration : 0,
      force: !!force,
    });
  }

  function _resetSectionTracking() {
    const P = window.__MEIKY_PATCH__;
    if (P && typeof P.resetPreviewSectionTracking === 'function') P.resetPreviewSectionTracking();
  }

  function _fmtTime(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(s / 60);
    return m + ':' + String(s % 60).padStart(2, '0');
  }

  function _updateUI() {
    const container = document.getElementById('midiPreviewPanel');
    if (!container) return;
    const btnPlay = document.getElementById('prevPlay');
    const btnPause = document.getElementById('prevPause');
    const btnStop = document.getElementById('prevStop');
    if (btnPlay) btnPlay.style.display = _playing ? 'none' : '';
    if (btnPause) btnPause.style.display = _playing ? '' : 'none';
    if (btnStop) btnStop.disabled = (!_playing && _pausedAt === 0);
    if (!_seekDragging) {
      const bar = document.getElementById('prevSeek');
      if (bar) bar.value = _duration > 0 ? Math.round((Math.min(_duration, _pausedAt) / _duration) * 1000) : 0;
      const timeEl = document.getElementById('prevTime');
      if (timeEl) timeEl.textContent = _fmtTime(_pausedAt) + ' / ' + _fmtTime(_duration);
    }
  }

  function _getChGain(ch) {
    if (!_chGains[ch] && _ac && _masterGain) {
      const g = _ac.createGain();
      g.gain.value = _chVol[ch] !== undefined ? _chVol[ch] : 0.8;
      g.connect(_masterGain);
      _chGains[ch] = g;
    }
    return _chGains[ch];
  }

  function _teardownNodes(fadeOut) {
    if (_schedTimer) { clearInterval(_schedTimer); _schedTimer = null; }
    const ac = _ac;
    const master = _masterGain;
    const nodes = Array.from(_activeNodes);
    _activeNodes.clear();
    _chGains = {};
    _masterGain = null;
    _filterNode = null;
    _dryGain = null;
    _wetGain = null;
    _convolver = null;

    if (!ac) return;
    const now = ac.currentTime;
    const stopDelay = (fadeOut && master) ? 0.025 : 0;
    if (fadeOut && master) {
      try {
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0, now + 0.018);
      } catch (e) {}
    }
    for (let i = 0; i < nodes.length; i++) {
      try { nodes[i].osc.stop(now + stopDelay); } catch (e) {}
    }
  }

  function _noteHz(n, bendSemis) {
    if (_tuningMode === '12tet') return midiFreq(n.note, true);
    return midiFreq(n.note + bendSemis, false);
  }

  function _scheduleOsc(n, startT, noteEnd, tb, chGain, detuneCents, gainScale) {
    const osc = _ac.createOscillator();
    osc.type = tb.wave;
    if (detuneCents && osc.detune) osc.detune.setValueAtTime(detuneCents, startT);
    osc.frequency.setValueAtTime(_noteHz(n, n.bendSemis), startT);

    if (_tuningMode !== '12tet' && n.bends && n.bends.length) {
      for (let b = 0; b < n.bends.length; b++) {
        const bt = _startAt + n.bends[b].sec;
        if (bt > startT && bt <= noteEnd + tb.release) {
          osc.frequency.setValueAtTime(midiFreq(n.note + n.bends[b].semis, false), bt);
        }
      }
    }

    const gain = _ac.createGain();
    const velGain = (n.vel / 127) * 0.62 * n.ccGain * gainScale;
    const atkEnd = Math.min(noteEnd, startT + tb.attack);
    gain.gain.setValueAtTime(0.0001, startT);
    gain.gain.linearRampToValueAtTime(velGain, atkEnd);
    gain.gain.setValueAtTime(velGain, noteEnd);
    gain.gain.linearRampToValueAtTime(0.0001, noteEnd + tb.release);

    osc.connect(gain);
    gain.connect(chGain);
    const entry = { osc, gain, note: n };
    _activeNodes.add(entry);
    osc.onended = () => {
      _activeNodes.delete(entry);
      try { osc.disconnect(); gain.disconnect(); } catch (e) {}
    };
    osc.start(startT);
    osc.stop(noteEnd + tb.release + 0.04);
  }

  function _scheduleWindow() {
    if (!_playing || !_ac || !_masterGain) return;
    const now = _ac.currentTime;
    const elapsed = now - _startAt;
    const loopEnd = (_loop.enabled && _loop.endSec != null && _loop.endSec > 0) ? _loop.endSec : _duration;
    const horizon = Math.min(loopEnd, elapsed + 0.45);

    while (_nextIdx < _notes.length && _notes[_nextIdx].startSec <= horizon) {
      const n = _notes[_nextIdx++];
      if (n.endSec <= elapsed) continue;
      if (isMutedAt(n.startSec, n.ch)) continue;
      const startT = Math.max(now, _startAt + n.startSec);
      const noteEnd = Math.max(startT + 0.02, _startAt + Math.min(n.endSec, loopEnd));
      const tb = TIMBRE[n.ch] || TIMBRE.default;
      const chGain = _getChGain(n.ch);
      if (!chGain) continue;

      const useUnison = _fx.enabled && _fx.unison && tb.unison;
      if (useUnison) {
        _scheduleOsc(n, startT, noteEnd, tb, chGain, -4.5, 0.62);
        _scheduleOsc(n, startT, noteEnd, tb, chGain, +4.5, 0.52);
      } else {
        _scheduleOsc(n, startT, noteEnd, tb, chGain, 0, 1.0);
      }
    }
  }

  function _tick() {
    if (!_playing || !_ac) return;
    const elapsed = _ac.currentTime - _startAt;
    const loopStart = (_loop.enabled && _loop.startSec != null) ? Math.max(0, _loop.startSec) : 0;
    const loopEnd = (_loop.enabled && _loop.endSec != null && _loop.endSec > loopStart + 0.25)
      ? Math.min(_duration, _loop.endSec)
      : Math.max(0.5, _duration - (_loop.enabled ? 1.6 : 0));

    if (_loop.enabled && elapsed >= loopEnd) {
      seek(_duration > 0 ? loopStart / _duration : 0);
      return;
    }

    const progress = _duration > 0 ? Math.min(1, elapsed / _duration) : 0;
    _syncSectionFocus(elapsed, true, false);

    if (!_seekDragging) {
      const bar = document.getElementById('prevSeek');
      if (bar) bar.value = Math.round(progress * 1000);
      const timeEl = document.getElementById('prevTime');
      if (timeEl) {
        const cur = Math.max(0, Math.min(_duration, elapsed));
        timeEl.textContent = _fmtTime(cur) + ' / ' + _fmtTime(_duration);
      }
    }

    emitChange('tick');

    if (!_loop.enabled && elapsed >= _duration) {
      stop();
      return;
    }
    _raf = requestAnimationFrame(_tick);
  }

  function _applyFrozenMerge(freshNotes) {
    if (!_frozenCh.size) return freshNotes;
    const merged = freshNotes.filter(n => !_frozenCh.has(n.ch));
    _frozenCh.forEach(ch => {
      const kept = _frozenNotes.get(ch);
      if (kept && kept.length) {
        for (let i = 0; i < kept.length; i++) {
          merged.push(Object.assign({}, kept[i], { bends: kept[i].bends ? kept[i].bends.slice() : [] }));
        }
      }
    });
    merged.sort((a, b) => a.startSec - b.startSec);
    return merged;
  }

  function load(midiData, bpm) {
    stop();
    _parsed = parseMidiEnhanced(midiData);
    if (!_parsed) { console.warn('[MidiPreview] parse failed'); return; }
    _bpm = (_parsed.bpmOverride && _parsed.bpmOverride > 0) ? _parsed.bpmOverride : (bpm || 60);
    _tempoMap = buildTempoMap(_parsed.ppq, _parsed.tempos, _bpm);
    const freshNotes = buildScheduledNotes(_parsed, _tempoMap.tickToSec, currentPbRange());
    _notes = _applyFrozenMerge(freshNotes);

    let maxEnd = 0;
    for (let i = 0; i < _notes.length; i++) {
      if (_notes[i].endSec > maxEnd) maxEnd = _notes[i].endSec;
    }
    if (!maxEnd && _parsed.noteEvents.length) {
      maxEnd = _tempoMap.tickToSec(_parsed.noteEvents[_parsed.noteEvents.length - 1].tick);
    }
    _duration = maxEnd + 2.0;
    _pausedAt = 0;
    if (_loop.endSec != null && _loop.endSec > _duration) _loop.endSec = null;
    if (_loop.startSec != null && _loop.startSec >= _duration) _loop.startSec = null;
    _syncSectionFocus(0, false, true);
    _updateUI();
    emitChange('load');
  }

  function play() {
    if (!_parsed || _playing) return;
    const ac = getAC();
    _playing = true;
    _startAt = ac.currentTime - _pausedAt;
    _syncSectionFocus(_pausedAt, true, true);

    _masterGain = ac.createGain();
    _masterGain.gain.value = 0.6;
    _analyser = ac.createAnalyser();
    _analyser.fftSize = 2048;
    _analyser.smoothingTimeConstant = 0.84;

    /* Audio graph: chGains -> _masterGain -> _filterNode -> (dry + Convolver wet) -> _analyser -> destination */
    if (typeof ac.createBiquadFilter === 'function') {
      _filterNode = ac.createBiquadFilter();
      _filterNode.type = 'lowpass';
      _filterNode.Q.value = 0.7;
      _masterGain.connect(_filterNode);
    } else {
      _filterNode = null;
    }
    const postFilter = _filterNode || _masterGain;

    if (typeof ac.createConvolver === 'function' && typeof ac.createBuffer === 'function') {
      if (!_irBuffer) _irBuffer = createAmbientIR(ac, 2.8, 2.6);
      _convolver = ac.createConvolver();
      _convolver.buffer = _irBuffer;
      _dryGain = ac.createGain();
      _wetGain = ac.createGain();
      postFilter.connect(_dryGain);
      postFilter.connect(_convolver);
      _convolver.connect(_wetGain);
      _dryGain.connect(_analyser);
      _wetGain.connect(_analyser);
    } else {
      postFilter.connect(_analyser);
    }

    _syncFxNodes();
    _analyser.connect(ac.destination);
    if (_recDest && _recDest.context === ac) _analyser.connect(_recDest);

    _chGains = {};
    let idx = 0;
    while (idx < _notes.length && _notes[idx].endSec <= _pausedAt) idx++;
    _nextIdx = idx;

    _scheduleWindow();
    _schedTimer = setInterval(_scheduleWindow, 60);
    _raf = requestAnimationFrame(_tick);
    _updateUI();
    emitChange('play');
  }

  function pause() {
    if (!_playing) return;
    _pausedAt = _ac ? Math.max(0, Math.min(_duration, _ac.currentTime - _startAt)) : _pausedAt;
    _teardownNodes(true);
    _playing = false;
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
    _syncSectionFocus(_pausedAt, false, true);
    _updateUI();
    emitChange('pause');
  }

  function stop() {
    _teardownNodes(true);
    _playing = false;
    _pausedAt = 0;
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
    _resetSectionTracking();
    _updateUI();
    emitChange('stop');
  }

  function setChVol(ch, val) {
    const clamped = Math.max(0, Math.min(1.5, Number(val)));
    if (!isFinite(clamped)) return;
    _chVol[ch] = clamped;
    const g = _chGains[ch];
    if (g && _ac) {
      try { g.gain.setTargetAtTime(clamped, _ac.currentTime, 0.015); }
      catch (e) { g.gain.value = clamped; }
    }
  }

  function seek(pos01) {
    if (_omakaseGuarding) return;
    const clamped01 = Math.max(0, Math.min(1, Number(pos01) || 0));
    const wasPlaying = _playing;
    if (wasPlaying) {
      _teardownNodes(true);
      _playing = false;
      if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
    }
    _pausedAt = clamped01 * _duration;
    if (wasPlaying) {
      play();
    } else {
      _syncSectionFocus(_pausedAt, false, true);
      _updateUI();
      emitChange('seek');
    }
  }

  /* ── Extension APIs for js/105-studio-features.js ── */
  function setAmbientFx(patch) {
    if (!patch || typeof patch !== 'object') return;
    if (typeof patch.enabled === 'boolean') _fx.enabled = patch.enabled;
    if (typeof patch.reverbWet === 'number' && isFinite(patch.reverbWet)) _fx.reverbWet = Math.max(0, Math.min(0.85, patch.reverbWet));
    if (typeof patch.filterHz === 'number' && isFinite(patch.filterHz)) _fx.filterHz = Math.max(250, Math.min(18000, patch.filterHz));
    if (typeof patch.unison === 'boolean') _fx.unison = patch.unison;
    _syncFxNodes();
    emitChange('fx');
  }
  function getAmbientFx() { return Object.assign({}, _fx); }

  function setTuningCompare(mode) {
    const next = mode === '12tet' ? '12tet' : 'micro';
    if (next === _tuningMode) return;
    _tuningMode = next;
    if (_playing && _ac) {
      const now = _ac.currentTime;
      _activeNodes.forEach(entry => {
        if (!entry.osc || !entry.note) return;
        const hz = _noteHz(entry.note, entry.note.bendSemis);
        try {
          entry.osc.frequency.cancelScheduledValues(now);
          entry.osc.frequency.setTargetAtTime(hz, now, 0.015);
        } catch (e) {
          entry.osc.frequency.value = hz;
        }
      });
    }
    emitChange('tuning');
  }
  function getTuningCompare() { return _tuningMode; }

  function setLoop(patch) {
    if (!patch || typeof patch !== 'object') return;
    if (typeof patch.enabled === 'boolean') _loop.enabled = patch.enabled;
    if ('startSec' in patch) _loop.startSec = patch.startSec == null ? null : Math.max(0, Number(patch.startSec) || 0);
    if ('endSec' in patch) _loop.endSec = patch.endSec == null ? null : Math.max(0, Number(patch.endSec) || 0);
    if (_loop.startSec != null && _loop.endSec != null && _loop.endSec <= _loop.startSec + 0.25) {
      _loop.endSec = null;
    }
    emitChange('loop');
  }
  function getLoop() { return Object.assign({}, _loop); }

  function setSectionMute(secIdx, ch, muted) {
    const k = secIdx + ':' + ch;
    if (muted) _arranger.muted[k] = true;
    else delete _arranger.muted[k];
    emitChange('arranger');
  }
  function clearSectionMutes() {
    _arranger.muted = {};
    emitChange('arranger');
  }
  function setSectionCount(n) {
    _arranger.sections = Math.max(2, Math.min(8, parseInt(n, 10) || 4));
    emitChange('arranger');
  }
  function getArrangerState() {
    const curSec = _duration > 0 ? sectionIndexForSec(getElapsed()) : 0;
    return { sections: _arranger.sections, muted: Object.assign({}, _arranger.muted), currentSection: curSec };
  }

  function setLayerFreeze(ch, frozen) {
    const c = parseInt(ch, 10);
    if (!isFinite(c) || c < 0 || c > 15) return;
    if (frozen) {
      const snap = _notes.filter(n => n.ch === c).map(n => Object.assign({}, n, { bends: n.bends ? n.bends.slice() : [] }));
      _frozenNotes.set(c, snap);
      _frozenCh.add(c);
    } else {
      _frozenCh.delete(c);
      _frozenNotes.delete(c);
    }
    emitChange('freeze');
  }
  function getFrozenLayers() { return Array.from(_frozenCh).sort((a, b) => a - b); }

  function onUpdate(fn) {
    if (typeof fn === 'function') _listeners.add(fn);
    return () => _listeners.delete(fn);
  }

  function isPlaying() { return _playing; }
  function getDuration() { return _duration; }
  function getAnalyser() { return _analyser; }
  function getContext() { return _ac; }
  function getAudioStream() {
    if (!_ac || _ac.state === 'closed') return null;
    if (!_recDest || _recDest.context !== _ac) {
      _recDest = _ac.createMediaStreamDestination();
      if (_analyser) _analyser.connect(_recDest);
    }
    return _recDest.stream;
  }
  function getElapsed() { return _playing && _ac ? Math.max(0, _ac.currentTime - _startAt) : (_pausedAt || 0); }
  function getParsed() { return _parsed; }
  function getBpm() { return _bpm; }
  function getNoteCount() { return _notes.length; }

  Object.assign(MidiPreview, {
    load, play, pause, stop, seek, setChVol,
    isPlaying, getDuration, getAnalyser, getElapsed,
    getParsed, getBpm, getContext, getAudioStream,
    /* New extension APIs */
    setAmbientFx, getAmbientFx,
    setTuningCompare, getTuningCompare,
    setLoop, getLoop,
    setSectionMute, clearSectionMutes, setSectionCount, getArrangerState,
    setLayerFreeze, getFrozenLayers,
    getNoteCount, onUpdate,
  });
}

/* ── 2. Fix #prevSeek drag/resume & touch support ─────────────── */
function patchSeekBar() {
  const oldSeek = document.getElementById('prevSeek');
  if (!oldSeek || !oldSeek.parentNode || oldSeek.dataset.seekFixed) return;
  const seekBar = oldSeek.cloneNode(true);
  seekBar.dataset.seekFixed = '1';
  oldSeek.parentNode.replaceChild(seekBar, oldSeek);

  let resumeAfterDrag = false;
  function fmt(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  function onStart() {
    if (typeof MidiPreview === 'undefined') return;
    _seekDragging = true;
    resumeAfterDrag = MidiPreview.isPlaying();
    if (resumeAfterDrag) MidiPreview.pause();
  }
  function onInput() {
    if (typeof MidiPreview === 'undefined' || _omakaseGuarding) return;
    const dur = MidiPreview.getDuration ? MidiPreview.getDuration() : 0;
    const cur = (parseInt(seekBar.value, 10) / 1000) * dur;
    const timeEl = document.getElementById('prevTime');
    if (timeEl) timeEl.textContent = fmt(cur) + ' / ' + fmt(dur);
  }
  function onEnd() {
    if (_omakaseGuarding) { _seekDragging = false; resumeAfterDrag = false; return; }
    const shouldResume = resumeAfterDrag;
    _seekDragging = false;
    resumeAfterDrag = false;
    if (typeof MidiPreview !== 'undefined') {
      MidiPreview.seek(parseInt(seekBar.value, 10) / 1000);
      if (shouldResume && !MidiPreview.isPlaying()) MidiPreview.play();
    }
  }

  seekBar.addEventListener('pointerdown', onStart);
  seekBar.addEventListener('input', onInput);
  seekBar.addEventListener('change', onEnd);
  seekBar.addEventListener('pointercancel', () => { _seekDragging = false; resumeAfterDrag = false; });
}

/* ── 3. Keyboard Shortcut Arbiter (F / Alt+1..9 / 1..9) ───────── */
function installShortcutArbiter() {
  function isEditable(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!el.isContentEditable;
  }

  window.addEventListener('keydown', ev => {
    if (isEditable(ev.target)) return;
    const key = ev.key;
    const low = key.toLowerCase();

    if (ev.altKey && !ev.ctrlKey && !ev.metaKey && /^[1-9]$/.test(key)) {
      const dock = window.__studioDock;
      if (dock && typeof dock.toggle === 'function') {
        const tabs = Array.from(document.querySelectorAll('#sdockRail .sdock-tab'))
          .filter(b => b.style.display !== 'none');
        const idx = parseInt(key, 10) - 1;
        if (tabs[idx]) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          tabs[idx].click();
        }
      }
      return;
    }

    if ((ev.ctrlKey || ev.metaKey) && /^[0-9]$/.test(key)) {
      ev.stopImmediatePropagation();
      return;
    }

    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;

    if (low === 'f') {
      const dock = window.__studioDock;
      if (dock && typeof dock.toggle === 'function') {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        dock.toggle('free');
      }
      return;
    }

    if (/^[1-3]$/.test(key)) {
      const dockOpen = window.__studioDock && typeof window.__studioDock.open === 'function'
        ? window.__studioDock.open() : null;
      const vizFs = document.fullscreenElement && document.fullscreenElement.id === 'vizPanel';
      if (dockOpen === 'free') {
        const freedom = window.__studioFreedom;
        if (freedom && typeof freedom.settings === 'function') {
          const names = Object.keys((freedom.settings().presets) || {});
          const nm = names[parseInt(key, 10) - 1];
          if (nm) {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            freedom.applyPreset(nm);
            return;
          }
        }
      }
      if (!vizFs) {
        const labels = { '1': '生成', '2': 'レイヤー', '3': '実験室' };
        const target = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent.trim() === labels[key] || b.textContent.trim().startsWith(labels[key]));
        if (target) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          target.click();
        }
      }
    }
  }, true);
}

/* ── 4. Protect non-synthesis sliders from Randomize / Mutate ─── */
function installOmakaseGuard() {
  const PROTECTED_IDS = new Set([
    'prevSeek', 'ctA4Slider', 'ctGlobalCents', 'vizSens',
    'midiCaptureHoldMs', 'midiCaptureMinVel', 'sfReverbWet', 'sfFilterHz',
  ]);
  function isProtectedSlider(el) {
    if (!el || el.type !== 'range') return false;
    if (el.id && PROTECTED_IDS.has(el.id)) return true;
    if (el.closest('#prevMixer, #midiPreviewPanel, #vizPanel, [id^="fdPanel-"], [id^="sdockWrap-"], #studioResPanel')) return true;
    return false;
  }

  document.addEventListener('click', ev => {
    const btn = ev.target && ev.target.closest ? ev.target.closest('#btnOmakase, #btnMutate') : null;
    if (!btn) return;
    const saved = [];
    document.querySelectorAll('input[type="range"]').forEach(el => {
      if (isProtectedSlider(el)) saved.push([el, el.value]);
    });
    _omakaseGuarding = true;
    Promise.resolve().then(() => {
      for (let i = 0; i < saved.length; i++) {
        const [el, val] = saved[i];
        if (el.value !== val) {
          el.value = val;
          if (el.id !== 'prevSeek') {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
      _omakaseGuarding = false;
    });
  }, true);
}

/* ── 5. Fix Adaptive JI __MEIKY_JI_SECTION_BARS__ async race ──── */
function patchJiSectionBarsRace() {
  if (typeof window === 'undefined') return;
  let stored = window.__MEIKY_JI_SECTION_BARS__ || null;
  let pendingClear = false;

  function isGenerating() {
    const b1 = document.getElementById('btnGen');
    const b2 = document.getElementById('btnGenAB');
    return !!((b1 && b1.classList.contains('busy')) || (b2 && b2.classList.contains('busy')));
  }

  function scheduleClearCheck() {
    if (!pendingClear) return;
    setTimeout(() => {
      if (!pendingClear) return;
      if (isGenerating()) {
        scheduleClearCheck();
      } else {
        stored = null;
        pendingClear = false;
      }
    }, 80);
  }

  try {
    Object.defineProperty(window, '__MEIKY_JI_SECTION_BARS__', {
      configurable: true,
      get() { return stored; },
      set(val) {
        if (val != null) {
          stored = val;
          pendingClear = false;
        } else if (stored != null && isGenerating()) {
          pendingClear = true;
          scheduleClearCheck();
        } else {
          stored = null;
          pendingClear = false;
        }
      },
    });
  } catch (e) {}
}

/* ── Boot ─────────────────────────────────────────────────────── */
if (typeof window !== 'undefined') {
  patchMidiPreview();
  patchJiSectionBarsRace();
  if (typeof document !== 'undefined') {
    installShortcutArbiter();
    installOmakaseGuard();
    const afterDom = () => { setTimeout(patchSeekBar, 50); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', afterDom);
    else afterDom();
  }
  window.__MEIKY_RUNTIME_FIXES__ = {
    version: '2.0-20261125',
    parseMidiEnhanced,
    buildTempoMap,
    buildScheduledNotes,
    createAmbientIR,
  };
}
})();
