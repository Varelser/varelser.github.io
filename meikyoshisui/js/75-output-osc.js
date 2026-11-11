/* 75-output-osc.js — 出力 / OSC / エクスポート
 * A/B バリアントと差分、マルチエクスポート、OSC ペイロードと送信・診断、出力 UI 同期、マニフェスト。
 * (2026-11-11: 90-patch-shared.js から機能ドメイン別に分散。本体モジュール。)
 */
(() => {
  'use strict';

  const PATCH = window.__MEIKY_PATCH__ || {};

  PATCH.clearGeneratedArtifacts = function clearGeneratedArtifacts() {
    if (typeof S === 'undefined' || !S) return;
    S.midiData = null;
    S.layerTracks = null;
    S.conductorRaw = null;
    S.midiDataA = null;
    S.midiDataB = null;
    S.abMode = 'A';
    S.compSectionPreTuned = false;
    PATCH.abVariants.A = null;
    PATCH.abVariants.B = null;
    if (S.oscExport) S.oscExport.lastStatus = 'GENERATEしてから送信してください';
  };

  PATCH.captureABVariant = function captureABVariant(slot) {
    if ((slot !== 'A' && slot !== 'B') || typeof S === 'undefined' || !S) return;
    PATCH.abVariants[slot] = {
      midiData: PATCH.cloneMidiBytes(S.midiData),
      layerTracks: PATCH.cloneLayerTracks(S.layerTracks),
      conductorRaw: Array.isArray(S.conductorRaw) ? S.conductorRaw.slice() : null,
    };
  };

  PATCH.restoreABVariant = function restoreABVariant(slot) {
    if ((slot !== 'A' && slot !== 'B') || typeof S === 'undefined' || !S) return false;
    const variant = PATCH.abVariants[slot];
    if (!variant || !variant.midiData) return false;
    S.abMode = slot;
    S.midiData = PATCH.cloneMidiBytes(variant.midiData);
    S.layerTracks = PATCH.cloneLayerTracks(variant.layerTracks);
    S.conductorRaw = Array.isArray(variant.conductorRaw) ? variant.conductorRaw.slice() : null;
    if (typeof MidiPreview !== 'undefined' && typeof MidiPreview.load === 'function' && S.midiData) {
      MidiPreview.load(S.midiData, S.bpm);
    }
    PATCH.syncGeneratedOutputUI();
    return true;
  };

  PATCH.syncABUI = function syncABUI() {
    if (typeof S === 'undefined' || !S) return;
    const panel = document.getElementById('abPanel');
    const buttonA = document.getElementById('abBtnA');
    const buttonB = document.getElementById('abBtnB');
    const hasA = !!S.midiDataA;
    const hasB = !!S.midiDataB;
    const hasEither = hasA || hasB;
    if (!hasEither && S.abMode !== 'A') S.abMode = 'A';
    if (panel) panel.style.display = hasEither ? '' : 'none';
    if (buttonA) {
      buttonA.classList.toggle('on', S.abMode === 'A');
      buttonA.disabled = !hasA;
    }
    if (buttonB) {
      buttonB.classList.toggle('on', S.abMode === 'B');
      buttonB.disabled = !hasB;
    }
  };

  PATCH.syncMultiExportUI = function syncMultiExportUI() {
    if (typeof S === 'undefined' || !S || !S.multiExport) return;
    const prefix = document.getElementById('mePfx');
    const numberPad = document.getElementById('meNumPad');
    const numberPadValue = document.getElementById('meNumPadV');
    const conductor = document.getElementById('meCond');
    const conductorValue = document.getElementById('meCondV');
    const manifest = document.getElementById('meManifest');
    const manifestValue = document.getElementById('meManifestV');
    const manifestBtn = document.getElementById('btnManifestDl');
    const count = document.getElementById('meCount');
    const status = document.getElementById('meStatus');
    const grid = document.getElementById('meLayerGrid');
    const download = document.getElementById('btnMultiDl');

    if (prefix) prefix.value = S.multiExport.prefix || 'void';
    if (numberPad) numberPad.classList.toggle('on', !!S.multiExport.numberPad);
    if (numberPadValue) numberPadValue.textContent = S.multiExport.numberPad ? 'ON' : 'OFF';
    if (conductor) conductor.classList.toggle('on', !!S.multiExport.includeConductor);
    if (conductorValue) conductorValue.textContent = S.multiExport.includeConductor ? 'ON' : 'OFF';
    if (manifest) manifest.classList.toggle('on', !!S.multiExport.includeManifest);
    if (manifestValue) manifestValue.textContent = S.multiExport.includeManifest ? 'ON' : 'OFF';

    if (Array.isArray(S.layerTracks) && S.layerTracks.length) {
      if (typeof buildMultiExportUI === 'function') buildMultiExportUI();
      if (download) download.classList.add('show');
      if (manifestBtn) manifestBtn.classList.add('show');
      return;
    }

    if (grid) grid.innerHTML = '';
    if (count) count.textContent = '';
    if (status) status.textContent = 'GENERATEしてからエクスポートしてください';
    if (download) download.classList.remove('show');
    if (manifestBtn) manifestBtn.classList.remove('show');
  };

  PATCH.syncOscExportUI = function syncOscExportUI() {
    if (typeof S === 'undefined' || !S || !S.oscExport) return;
    if (!('testStatus' in S.oscExport)) S.oscExport.testStatus = 'OSC TEST 未実行';
    S.oscExport.lastPayloadSummary = PATCH.describeOscPayload();
    if (!('lastTestOk' in S.oscExport)) S.oscExport.lastTestOk = null;
    const input = document.getElementById('oscWsUrl');
    const status = document.getElementById('oscSendStatus');
    const testStatus = document.getElementById('oscTestStatus');
    const payloadPreview = document.getElementById('oscPayloadPreview');
    const musicXmlStatus = document.getElementById('musicXmlStatus');
    if (input) input.value = S.oscExport.url || 'ws://127.0.0.1:7000';
    if (status) status.textContent = S.oscExport.lastStatus || 'GENERATEしてから送信してください';
    if (testStatus) {
      testStatus.textContent = S.oscExport.testStatus || 'OSC TEST 未実行';
      testStatus.style.color = S.oscExport.lastTestOk === true
        ? 'var(--teal)'
        : S.oscExport.lastTestOk === false
          ? 'var(--amber)'
          : 'var(--text-dim)';
    }
    if (payloadPreview) payloadPreview.textContent = S.oscExport.lastPayloadSummary || 'PAYLOAD PREVIEW: unavailable';
    if (musicXmlStatus && !S.midiData) {
      musicXmlStatus.textContent = 'GENERATEしてからエクスポートしてください';
    }
    if (typeof OscExportEngine !== 'undefined' && typeof OscExportEngine.initUI === 'function') {
      const binaryBtn = document.getElementById('oscModeBinary');
      const jsonBtn = document.getElementById('oscModeJson');
      if (binaryBtn) {
        binaryBtn.style.borderColor = S.oscExport.mode === 'binary' ? 'var(--teal)' : 'var(--border)';
        binaryBtn.style.color = S.oscExport.mode === 'binary' ? 'var(--teal)' : 'var(--text-dim)';
      }
      if (jsonBtn) {
        jsonBtn.style.borderColor = S.oscExport.mode === 'json' ? 'var(--teal)' : 'var(--border)';
        jsonBtn.style.color = S.oscExport.mode === 'json' ? 'var(--teal)' : 'var(--text-dim)';
      }
    }
    PATCH.syncPatchDiagnosticsUI();
  };

  PATCH.describeOscPayload = function describeOscPayload() {
    if (typeof S === 'undefined' || !S || typeof OscExportEngine === 'undefined' || typeof OscExportEngine.buildPayload !== 'function') {
      return 'PAYLOAD PREVIEW: unavailable';
    }
    const payload = OscExportEngine.buildPayload();
    if (!payload) return 'PAYLOAD PREVIEW: GENERATE required';
    const layers = Array.isArray(payload.layers) ? payload.layers.length : 0;
    const noteCount = (payload.layers || []).reduce((sum, layer) => sum + (layer.noteCount || 0), 0);
    const conductor = payload.conductorBytes && payload.conductorBytes.length ? 'CONDUCTOR ON' : 'CONDUCTOR OFF';
    const mode = S.oscExport && S.oscExport.mode ? S.oscExport.mode.toUpperCase() : 'BINARY';
    const liveFocus = PATCH.describeLiveSectionFocus();
    return 'PAYLOAD PREVIEW: ' + layers + ' layers / ' + noteCount + ' notes / ' + conductor + ' / ' + mode +
      ' / BAR ' + (liveFocus.previewBar + 1) +
      ' / JI ' + liveFocus.ji.name +
      ' / COMP ' + liveFocus.comp.name;
  };

  if (typeof OscExportEngine !== 'undefined' &&
      typeof OscExportEngine.buildPayload === 'function' &&
      !OscExportEngine.__meikyLiveControlWrapped) {
    const originalOscBuildPayload = OscExportEngine.buildPayload.bind(OscExportEngine);
    OscExportEngine.buildPayload = function buildPayloadWithLiveControl() {
      const payload = originalOscBuildPayload();
      if (!payload) return payload;
      const liveFocus = PATCH.describeLiveSectionFocus();
      const midiLearnMappings = PATCH.readMidiLearnMappings();
      const scalaName =
        typeof CompTuningEngine !== 'undefined' &&
        CompTuningEngine.STATE &&
        CompTuningEngine.STATE.scalaProfile &&
        CompTuningEngine.STATE.scalaProfile.sclName
          ? CompTuningEngine.STATE.scalaProfile.sclName
          : 'None';
      const jiMode = typeof JI_PARAMS !== 'undefined' && JI_PARAMS && JI_PARAMS.mode ? JI_PARAMS.mode : 'off';
      const jiBlend = typeof JI_PARAMS !== 'undefined' && JI_PARAMS ? Number(JI_PARAMS.blend || 0) : 0;
      const concertA4 = PATCH.getConcertA4Hz();
      const globalCents =
        typeof CompTuningEngine !== 'undefined' &&
        CompTuningEngine.STATE &&
        Number.isFinite(CompTuningEngine.STATE.globalCents)
          ? CompTuningEngine.STATE.globalCents
          : 0;
      const progressionSummary =
        typeof PROG_STATE !== 'undefined' &&
        PROG_STATE &&
        Array.isArray(PROG_STATE.prog) &&
        PROG_STATE.prog.length
          ? PROG_STATE.prog
              .map(entry => {
                const chord = entry && entry.chord ? entry.chord.rootName + (entry.chord.quality || '') : 'N.C.';
                const bars = entry && entry.bars ? entry.bars : 0;
                return chord + ':' + bars;
              })
              .join(' -> ')
          : ((typeof S !== 'undefined' && S && S.chord)
              ? (S.chord.rootName + (S.chord.quality || ''))
              : 'N.C.');
      const activeEngines =
        typeof S !== 'undefined' &&
        S &&
        S.engines
          ? Object.entries(S.engines).filter(([, on]) => !!on).map(([name]) => name)
          : [];
      const activeLayerKeys =
        typeof S !== 'undefined' &&
        S &&
        S.layers
          ? Object.entries(S.layers).filter(([, on]) => !!on).map(([key]) => key)
          : [];
      const activeLayerDefs =
        typeof LAYER_DEFS !== 'undefined' && Array.isArray(LAYER_DEFS)
          ? activeLayerKeys.map(key => {
              const layerDef = LAYER_DEFS.find(def => def && def.k === key);
              return {
                key,
                name: layerDef && layerDef.name ? layerDef.name : key,
                desc: layerDef && layerDef.desc ? layerDef.desc : '',
              };
            })
          : activeLayerKeys.map(key => ({ key, name: key, desc: '' }));
      const layerNames =
        typeof S !== 'undefined' &&
        S &&
        Array.isArray(S.layerTracks)
          ? S.layerTracks.map(track => track && track.name ? track.name : 'Track')
          : [];
      const enabledLayerNames =
        typeof S !== 'undefined' &&
        S &&
        S.multiExport &&
        Array.isArray(S.layerTracks)
          ? S.layerTracks
              .filter(track => track && track.name && S.multiExport.layers[track.name] !== false)
              .map(track => track.name)
          : layerNames.slice();
      const seed = typeof S !== 'undefined' && S ? Number(S.seed || 0) : 0;
      const genre = typeof S !== 'undefined' && S && S.genre ? S.genre : 'unknown';
      const scale = typeof S !== 'undefined' && S && S.scale ? S.scale : 'unknown';
      const currentChordSummary =
        typeof S !== 'undefined' && S && S.chord
          ? (S.chord.rootName + (S.chord.quality || ''))
          : 'N.C.';
      const abState = {
        currentMode: typeof S !== 'undefined' && S ? (S.abMode || 'A') : 'A',
        hasA: !!(typeof S !== 'undefined' && S && S.midiDataA),
        hasB: !!(typeof S !== 'undefined' && S && S.midiDataB),
      };
      const exportState = {
        hasMidi: !!(typeof S !== 'undefined' && S && S.midiData),
        layerCount: layerNames.length,
        layerNames,
        enabledLayerNames,
        prefix: typeof S !== 'undefined' && S && S.multiExport ? (S.multiExport.prefix || 'void') : 'void',
        includeConductor: !!(typeof S !== 'undefined' && S && S.multiExport && S.multiExport.includeConductor),
        includeManifest: !!(typeof S !== 'undefined' && S && S.multiExport && S.multiExport.includeManifest),
      };
      const exportTarget = {
        kind: 'osc',
        mode: typeof S !== 'undefined' && S && S.oscExport ? (S.oscExport.mode || 'binary') : 'binary',
        url: typeof S !== 'undefined' && S && S.oscExport ? (S.oscExport.url || '') : '',
        ready: exportState.hasMidi,
      };
      const layerContexts = Array.isArray(payload.layers)
        ? payload.layers.map((layer, index) => ({
            index: layer && Number.isFinite(layer.index) ? layer.index : index,
            name: layer && layer.name ? layer.name : ('Layer ' + (index + 1)),
            genre,
            scale,
            chord: currentChordSummary,
            progression: progressionSummary,
          }))
        : [];
      if (Array.isArray(payload.layers)) {
        payload.layers = payload.layers.map((layer, index) => Object.assign({}, layer, {
          context: layerContexts[index] || null,
        }));
      }
      payload.liveControl = {
        previewBar: liveFocus.previewBar,
        sectionLearnFocus: PATCH.jsonClone(PATCH.sectionLearnFocus),
        sectionPreviewFollow: PATCH.jsonClone(PATCH.ensureSectionPreviewFollow()),
        activeJiSection: liveFocus.ji,
        activeCompSection: liveFocus.comp,
        midiLearnMappings,
        activeLayerKeys,
        activeLayerDefs,
        abState,
        progressionSummary,
        currentChordSummary,
        layerContexts,
        exportState,
        exportTarget,
        project: {
          seed,
          genre,
          scale,
          activeEngines,
        },
        tuning: {
          concertA4Hz: concertA4,
          globalCents,
          scala: scalaName,
          jiMode,
          jiBlend,
        },
      };
      payload.meta = payload.meta || {};
      payload.meta.liveControl = PATCH.jsonClone(payload.liveControl);
      const extraMessages = [
        { address: '/meiky/meta/preview_bar', args: [liveFocus.previewBar] },
        { address: '/meiky/meta/ji_section', args: [liveFocus.ji.index, liveFocus.ji.name, liveFocus.ji.follow ? 1 : 0] },
        { address: '/meiky/meta/comp_section', args: [liveFocus.comp.index, liveFocus.comp.name, liveFocus.comp.follow ? 1 : 0] },
        { address: '/meiky/meta/section_follow', args: [liveFocus.ji.follow ? 1 : 0, liveFocus.comp.follow ? 1 : 0] },
        { address: '/meiky/meta/midi_learn_count', args: [Object.keys(midiLearnMappings).length] },
        { address: '/meiky/meta/concert_a4', args: [concertA4] },
        { address: '/meiky/meta/global_cents', args: [globalCents] },
        { address: '/meiky/meta/scala_name', args: [scalaName] },
        { address: '/meiky/meta/ji_profile', args: [jiMode, jiBlend] },
        { address: '/meiky/meta/ab_state', args: [abState.currentMode, abState.hasA ? 1 : 0, abState.hasB ? 1 : 0] },
        { address: '/meiky/meta/progression_summary', args: [progressionSummary] },
        { address: '/meiky/meta/project_seed', args: [seed] },
        { address: '/meiky/meta/project_genre', args: [genre] },
        { address: '/meiky/meta/project_scale', args: [scale] },
        { address: '/meiky/meta/active_engines', args: [activeEngines.join(',')] },
        { address: '/meiky/meta/active_layer_keys', args: [activeLayerKeys.join(',')] },
        { address: '/meiky/meta/active_layer_defs', args: [activeLayerDefs.map(def => def.key + ':' + def.name).join('|')] },
        { address: '/meiky/meta/layer_count', args: [exportState.layerCount] },
        { address: '/meiky/meta/layer_names', args: [layerNames.join(',')] },
        { address: '/meiky/meta/enabled_layers', args: [enabledLayerNames.join(',')] },
        { address: '/meiky/meta/export_flags', args: [exportState.prefix, exportState.includeConductor ? 1 : 0, exportState.includeManifest ? 1 : 0, exportState.hasMidi ? 1 : 0] },
        { address: '/meiky/meta/export_target', args: [exportTarget.kind, exportTarget.mode, exportTarget.url, exportTarget.ready ? 1 : 0] },
      ].concat(layerContexts.map(layerContext => ({
        address: '/meiky/meta/layer_context',
        args: [layerContext.index, layerContext.name, layerContext.genre, layerContext.scale, layerContext.chord, layerContext.progression],
      })));
      const existing = Array.isArray(payload.messages) ? payload.messages : [];
      payload.messages = existing.filter(message =>
        ![
          '/meiky/meta/preview_bar',
          '/meiky/meta/ji_section',
          '/meiky/meta/comp_section',
          '/meiky/meta/section_follow',
          '/meiky/meta/midi_learn_count',
          '/meiky/meta/concert_a4',
          '/meiky/meta/global_cents',
          '/meiky/meta/scala_name',
          '/meiky/meta/ji_profile',
          '/meiky/meta/ab_state',
          '/meiky/meta/progression_summary',
          '/meiky/meta/project_seed',
          '/meiky/meta/project_genre',
          '/meiky/meta/project_scale',
          '/meiky/meta/active_engines',
          '/meiky/meta/active_layer_keys',
          '/meiky/meta/active_layer_defs',
          '/meiky/meta/layer_count',
          '/meiky/meta/layer_names',
          '/meiky/meta/enabled_layers',
          '/meiky/meta/export_flags',
          '/meiky/meta/export_target',
          '/meiky/meta/layer_context',
        ].includes(message && message.address)
      ).concat(extraMessages);
      return payload;
    };
    OscExportEngine.__meikyLiveControlWrapped = true;
  }

  PATCH.sendOscCurrentWithLiveControl = function sendOscCurrentWithLiveControl() {
    if (typeof OscExportEngine === 'undefined' || typeof OscExportEngine.buildPayload !== 'function') return false;
    const input = document.getElementById('oscWsUrl');
    const url = input ? String(input.value || '').trim() : '';
    if (!/^wss?:\/\//i.test(url)) {
      if (typeof S !== 'undefined' && S && S.oscExport) {
        S.oscExport.lastStatus = 'OSC URL は ws:// または wss:// で始めてください';
      }
      PATCH.syncOscExportUI();
      if (typeof log === 'function') log('⚠ OSC URL INVALID', 'warn');
      return false;
    }
    if (typeof S !== 'undefined' && S && S.oscExport) S.oscExport.url = url;

    const payload = OscExportEngine.buildPayload();
    if (!payload) {
      if (typeof S !== 'undefined' && S && S.oscExport) {
        S.oscExport.lastStatus = '先に GENERATE を実行してください';
      }
      PATCH.syncOscExportUI();
      if (typeof log === 'function') log('⚠ GENERATE FIRST FOR OSC EXPORT', 'warn');
      return false;
    }

    const mode = typeof S !== 'undefined' && S && S.oscExport && S.oscExport.mode ? S.oscExport.mode : 'binary';
    if (typeof S !== 'undefined' && S && S.oscExport) {
      S.oscExport.lastStatus = 'OSC bridge 接続中...';
    }
    PATCH.syncOscExportUI();

    const socket = new WebSocket(url);
    if (mode === 'binary') socket.binaryType = 'arraybuffer';
    socket.addEventListener('open', () => {
      if (mode === 'binary') {
        const bundle = OscExportEngine.encodeOscBundle(payload);
        socket.send(bundle.buffer);
      } else {
        socket.send(JSON.stringify(payload));
      }
      socket.close();
      const layerSummary = (payload.layers || []).map(layer => layer.name + ':' + layer.noteCount).join(' / ');
      if (typeof S !== 'undefined' && S && S.oscExport) {
        S.oscExport.lastStatus = 'OSC 送信完了 — ' + (payload.layers || []).length + ' layers (' + mode.toUpperCase() + ')';
      }
      PATCH.syncOscExportUI();
      if (typeof log === 'function') log('// OSC EXPORT[' + mode.toUpperCase() + ']: ' + (payload.layers || []).length + ' layers — ' + layerSummary, 'ok');
    }, { once: true });
    socket.addEventListener('error', () => {
      if (typeof S !== 'undefined' && S && S.oscExport) {
        S.oscExport.lastStatus = 'OSC bridge 接続失敗 — URL とブリッジ起動状態を確認';
      }
      PATCH.syncOscExportUI();
      if (typeof log === 'function') log('⚠ OSC EXPORT FAILED', 'warn');
    }, { once: true });
    return true;
  };

  PATCH.installOscSendOverride = function installOscSendOverride() {
    const button = document.getElementById('btnOscSend');
    if (!button || button.dataset.patchOscBound === '1') return;
    const clone = button.cloneNode(true);
    clone.dataset.patchOscBound = '1';
    button.parentNode.replaceChild(clone, button);
    clone.addEventListener('click', event => {
      event.preventDefault();
      PATCH.sendOscCurrentWithLiveControl();
    });
  };

  if (typeof OscExportEngine !== 'undefined' &&
      typeof OscExportEngine.sendCurrent === 'function' &&
      !OscExportEngine.__meikySendCurrentWrapped) {
    OscExportEngine.sendCurrent = function sendCurrentPatched() {
      return PATCH.sendOscCurrentWithLiveControl();
    };
    OscExportEngine.__meikySendCurrentWrapped = true;
  }

  PATCH.encodeOscDiagnosticPacket = function encodeOscDiagnosticPacket() {
    if (typeof OscExportEngine !== 'undefined' && typeof OscExportEngine.encodeOscMessage === 'function') {
      return OscExportEngine.encodeOscMessage('/meiky/test', [Date.now(), 'ping']);
    }
    return new TextEncoder().encode('meiky-osc-test');
  };

  PATCH.testOscConnection = function testOscConnection(timeoutMs = 1500) {
    if (typeof S === 'undefined' || !S || !S.oscExport) return Promise.resolve(false);
    const url = String(S.oscExport.url || '').trim();
    S.oscExport.lastPayloadSummary = PATCH.describeOscPayload();
    if (!/^wss?:\/\//i.test(url)) {
      S.oscExport.lastTestOk = false;
      S.oscExport.testStatus = 'OSC TEST FAILED — URL must start with ws:// or wss://';
      PATCH.syncOscExportUI();
      return Promise.resolve(false);
    }

    S.oscExport.lastTestOk = null;
    S.oscExport.testStatus = 'OSC TEST: connecting...';
    PATCH.syncOscExportUI();

    return new Promise(resolve => {
      let settled = false;
      let timer = null;
      const finish = (ok, text) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        S.oscExport.lastTestOk = ok;
        S.oscExport.testStatus = text;
        PATCH.syncOscExportUI();
        resolve(ok);
      };

      try {
        const socket = new WebSocket(url);
        if ((S.oscExport.mode || 'binary') === 'binary') socket.binaryType = 'arraybuffer';
        timer = setTimeout(() => {
          try { socket.close(); } catch (_) {}
          finish(false, 'OSC TEST FAILED — timeout');
        }, timeoutMs);
        socket.addEventListener('open', () => {
          try {
            if ((S.oscExport.mode || 'binary') === 'binary') {
              const packet = PATCH.encodeOscDiagnosticPacket();
              socket.send(packet.buffer ? packet.buffer : packet);
            } else {
              socket.send(JSON.stringify({
                format: 'meiky-osc-test-v1',
                type: 'ping',
                sentAt: new Date().toISOString(),
                payloadPreview: S.oscExport.lastPayloadSummary,
              }));
            }
          } catch (_) {}
          try { socket.close(); } catch (_) {}
          finish(true, 'OSC TEST OK — bridge reachable');
        }, { once: true });
        socket.addEventListener('error', () => finish(false, 'OSC TEST FAILED — bridge unreachable'), { once: true });
      } catch (_) {
        finish(false, 'OSC TEST FAILED — socket error');
      }
    });
  };

  PATCH.syncGeneratedOutputUI = function syncGeneratedOutputUI() {
    if (typeof S === 'undefined' || !S) return;
    const download = document.getElementById('btnDl');
    const preview = document.getElementById('midiPreviewPanel');
    if (download) download.classList.toggle('show', !!S.midiData);
    if (preview) preview.style.display = S.midiData ? '' : 'none';
    PATCH.syncABUI();
    PATCH.syncMultiExportUI();
    PATCH.syncOscExportUI();
    PATCH.syncConcertPitchUI();
    PATCH.syncPatchDiagnosticsUI();
  };

  PATCH.syncBinauralUI = function syncBinauralUI() {
    if (typeof BinauralEngine === 'undefined' || !BinauralEngine.STATE) return;
    const el = document.getElementById('bbCarrierNote');
    if (!el) return;
    const baseHz = PATCH.midiToHz(BinauralEngine.STATE.carrierNote);
    const rightHz = baseHz + BinauralEngine.STATE.activeBeat;
    const noteName = note => PATCH.NOTE_NAMES[note % 12] + Math.floor(note / 12 - 1);
    el.innerHTML =
      '<span style="color:#cccccc;">L: ' + noteName(BinauralEngine.STATE.carrierNote) + '</span>' +
      '<span style="color:#888;margin:0 6px;">|</span>' +
      '<span style="color:#aaaaaa;">' + baseHz.toFixed(1) + ' Hz</span>' +
      '<span style="color:#555;margin:0 8px;">→</span>' +
      '<span style="color:#cccccc;">R: ' + BinauralEngine.STATE.carrierNote + '+Δ</span>' +
      '<span style="color:#888;margin:0 6px;">|</span>' +
      '<span style="color:#aaaaaa;">' + rightHz.toFixed(2) + ' Hz</span>' +
      '<span style="color:#555;margin:0 8px;">|</span>' +
      '<span style="color:#888;">Δ = ' + BinauralEngine.STATE.activeBeat + ' Hz</span>';
    PATCH.syncConcertPitchUI();
  };

  PATCH.syncConcertPitchUI = function syncConcertPitchUI() {
    const a4 = PATCH.getConcertA4Hz();
    const netCents = PATCH.getGlobalConcertOffsetCents();

    const previewPanel = document.getElementById('midiPreviewPanel');
    if (previewPanel && !document.getElementById('prevConcertPitch')) {
      const badge = document.createElement('div');
      badge.id = 'prevConcertPitch';
      badge.style.fontFamily = "'Share Tech Mono',monospace";
      badge.style.fontSize = '8px';
      badge.style.letterSpacing = '1px';
      badge.style.color = '#8f8f8f';
      badge.style.padding = '0 8px';
      badge.style.whiteSpace = 'nowrap';
      const timeEl = document.getElementById('prevTime');
      if (timeEl && timeEl.parentNode) {
        timeEl.parentNode.insertBefore(badge, timeEl.nextSibling);
      }
    }

    const previewBadge = document.getElementById('prevConcertPitch');
    if (previewBadge) {
      previewBadge.textContent = 'A4 ' + a4.toFixed(1) + ' Hz  |  ' + PATCH.formatSignedCents(netCents);
      previewBadge.title = 'Current concert pitch and net offset from 440Hz';
    }

    const compControls = document.getElementById('compTuningControls');
    if (compControls && !document.getElementById('ctConcertPitchSummary')) {
      const summary = document.createElement('div');
      summary.id = 'ctConcertPitchSummary';
      summary.style.fontFamily = "'Share Tech Mono',monospace";
      summary.style.fontSize = '8px';
      summary.style.letterSpacing = '1px';
      summary.style.lineHeight = '1.8';
      summary.style.color = '#8f8f8f';
      summary.style.margin = '-2px 0 14px';
      summary.style.padding = '8px 10px';
      summary.style.border = '1px solid var(--border)';
      summary.style.background = 'rgba(255,255,255,.03)';
      const globalRow = document.getElementById('ctGlobalCents');
      if (globalRow) {
        const row = globalRow.closest('.param-row');
        if (row && row.parentNode) {
          row.parentNode.insertBefore(summary, row.nextSibling);
        }
      }
    }

    const compSummary = document.getElementById('ctConcertPitchSummary');
    if (compSummary) {
      compSummary.innerHTML =
        '<span style="color:#cfcfcf;">CONCERT PITCH</span>' +
        '<span style="color:#555;margin:0 8px;">|</span>' +
        '<span style="color:#aaaaaa;">A4 = ' + a4.toFixed(1) + ' Hz</span>' +
        '<span style="color:#555;margin:0 8px;">|</span>' +
        '<span style="color:#aaaaaa;">NET ' + PATCH.formatSignedCents(netCents) + ' from 440</span>';
    }

    const binauralControls = document.getElementById('binauralControls');
    if (binauralControls && !document.getElementById('bbConcertPitchInfo')) {
      const info = document.createElement('div');
      info.id = 'bbConcertPitchInfo';
      info.style.fontFamily = "'Share Tech Mono',monospace";
      info.style.fontSize = '8px';
      info.style.letterSpacing = '1px';
      info.style.color = '#777';
      info.style.margin = '2px 0 12px';
      const carrierNote = document.getElementById('bbCarrierNote');
      if (carrierNote && carrierNote.parentNode && carrierNote.parentNode.parentNode) {
        carrierNote.parentNode.parentNode.appendChild(info);
      }
    }

    const binauralInfo = document.getElementById('bbConcertPitchInfo');
    if (binauralInfo) {
      binauralInfo.textContent = 'CONCERT PITCH: A4 ' + a4.toFixed(1) + ' Hz  |  NET ' + PATCH.formatSignedCents(netCents);
    }
    PATCH.syncPatchDiagnosticsUI();
  };


  PATCH.buildABDiffSummary = function buildABDiffSummary() {
    const variantA = PATCH.abVariants && PATCH.abVariants.A;
    const variantB = PATCH.abVariants && PATCH.abVariants.B;
    if (!variantA || !variantB || !variantA.midiData || !variantB.midiData) return null;

    const midiA = Array.from(variantA.midiData || []);
    const midiB = Array.from(variantB.midiData || []);
    const minLength = Math.min(midiA.length, midiB.length);
    let firstDiffIndex = -1;
    for (let index = 0; index < minLength; index++) {
      if (midiA[index] !== midiB[index]) {
        firstDiffIndex = index;
        break;
      }
    }
    const differingBytes = Math.abs(midiA.length - midiB.length) +
      Array.from({ length: minLength }).reduce((sum, _, index) => sum + (midiA[index] !== midiB[index] ? 1 : 0), 0);
    const layerNamesA = Array.isArray(variantA.layerTracks) ? variantA.layerTracks.map(track => track.name) : [];
    const layerNamesB = Array.isArray(variantB.layerTracks) ? variantB.layerTracks.map(track => track.name) : [];

    return {
      hasVariants: true,
      currentMode: typeof S !== 'undefined' && S ? (S.abMode || 'A') : 'A',
      midiBytes: { A: midiA.length, B: midiB.length },
      differingBytes,
      firstDiffIndex,
      layerNames: { A: layerNamesA, B: layerNamesB },
      conductorBytes: {
        A: Array.isArray(variantA.conductorRaw) ? variantA.conductorRaw.length : 0,
        B: Array.isArray(variantB.conductorRaw) ? variantB.conductorRaw.length : 0,
      },
    };
  };

  PATCH.buildExportManifest = function buildExportManifest(kind, fileEntries) {
    const progression =
      typeof PROG_STATE !== 'undefined' &&
      PROG_STATE &&
      Array.isArray(PROG_STATE.prog) &&
      PROG_STATE.prog.length
        ? PROG_STATE.prog.map(entry => ({
            chord: entry && entry.chord ? entry.chord.rootName + (entry.chord.quality || '') : null,
            bars: entry && entry.bars ? entry.bars : 0,
          }))
        : [];
    const layers = typeof S !== 'undefined' && S && Array.isArray(S.layerTracks)
      ? S.layerTracks.map(track => track.name)
      : [];
    const activeLayers = typeof S !== 'undefined' && S && S.layers
      ? Object.entries(S.layers).filter(([, on]) => !!on).map(([name]) => name)
      : [];
    const activeEngines = typeof S !== 'undefined' && S && S.engines
      ? Object.entries(S.engines).filter(([, on]) => !!on).map(([name]) => name)
      : [];
    const scalaName =
      typeof CompTuningEngine !== 'undefined' &&
      CompTuningEngine.STATE &&
      CompTuningEngine.STATE.scalaProfile &&
      CompTuningEngine.STATE.scalaProfile.sclName
        ? CompTuningEngine.STATE.scalaProfile.sclName
        : null;
    const sections =
      typeof S !== 'undefined' &&
      S &&
      S.engines &&
      S.engines.macro &&
      S.macroEnabled &&
      typeof generateTensionCurve === 'function' &&
      typeof detectSections === 'function'
        ? detectSections(generateTensionCurve(S.curveShape, PATCH.getActiveProgressionTotalBars() || S.bars, S.curveAmp, S.chainEnabled, S.curveShapeB))
        : [];
    if (typeof JI_PARAMS !== 'undefined') PATCH.ensureJiSectionProfiles();
    if (typeof CompTuningEngine !== 'undefined' && CompTuningEngine.STATE) PATCH.ensureCompSectionProfiles();
    const liveFocus = PATCH.describeLiveSectionFocus();
    return {
      format: 'meiky-export-manifest-v1',
      kind: kind || 'manual',
      exportedAt: new Date().toISOString(),
      source: 'index.html',
      project: {
        chord: typeof S !== 'undefined' && S && S.chord ? S.chord.rootName + (S.chord.quality || '') : null,
        progression,
        scale: typeof S !== 'undefined' && S ? S.scale : null,
        genre: typeof S !== 'undefined' && S ? S.genre : null,
        bpm: typeof S !== 'undefined' && S ? S.bpm : null,
        bars: typeof S !== 'undefined' && S ? PATCH.getActiveProgressionTotalBars() || S.bars : null,
        rootOct: typeof S !== 'undefined' && S ? S.rootOct : null,
        seed: typeof S !== 'undefined' && S ? S.seed : null,
        sections: sections.map(section => ({ name: section.name, bar: section.bar })),
      },
      tuning: {
        concertA4Hz: PATCH.getConcertA4Hz(),
        globalOffsetCents: PATCH.getGlobalConcertOffsetCents(),
        compTuningSummary: typeof CompTuningEngine !== 'undefined' && typeof CompTuningEngine.getSummary === 'function'
          ? CompTuningEngine.getSummary()
          : null,
        scala: scalaName,
        compSectionModulation: typeof CompTuningEngine !== 'undefined' && CompTuningEngine.STATE ? {
          enabled: !!CompTuningEngine.STATE.sectionModEnabled,
          runtimeApplied: PATCH.isCompSectionRuntimeActive(),
          profiles: Array.isArray(CompTuningEngine.STATE.sectionProfiles) ? PATCH.jsonClone(CompTuningEngine.STATE.sectionProfiles) : [],
        } : null,
        justIntonation: typeof JI_PARAMS !== 'undefined' ? {
          enabled: !!JI_PARAMS.enabled,
          mode: JI_PARAMS.mode,
          blend: JI_PARAMS.blend,
          harmonicLimit: JI_PARAMS.harmonicLimit,
          adaptiveMemoryEnabled: !!JI_PARAMS.adaptiveMemoryEnabled,
          adaptiveMemoryStrength: JI_PARAMS.adaptiveMemoryStrength,
          adaptiveBassAnchorStrength: JI_PARAMS.adaptiveBassAnchorStrength,
          adaptiveVoiceLeadingStrength: JI_PARAMS.adaptiveVoiceLeadingStrength,
          adaptiveCadenceResetEnabled: !!JI_PARAMS.adaptiveCadenceResetEnabled,
          adaptiveCadenceResetStrength: JI_PARAMS.adaptiveCadenceResetStrength,
          lastOffsetCents: PATCH.jiAdaptiveMemory ? PATCH.jiAdaptiveMemory.lastOffsetCents : 0,
          lastVoiceLeadOffsetCents: PATCH.jiAdaptiveMemory ? PATCH.jiAdaptiveMemory.lastVoiceLeadOffsetCents : 0,
          lastCadenceType: PATCH.jiAdaptiveMemory ? PATCH.jiAdaptiveMemory.lastCadenceType : '',
          sectionResetEnabled: !!JI_PARAMS.adaptiveResetOnSection,
          sectionModEnabled: !!JI_PARAMS.sectionModEnabled,
          sectionProfiles: Array.isArray(JI_PARAMS.sectionProfiles) ? PATCH.jsonClone(JI_PARAMS.sectionProfiles) : [],
        } : null,
      },
      liveControl: {
        previewBar: liveFocus.previewBar,
        sectionLearnFocus: PATCH.jsonClone(PATCH.sectionLearnFocus),
        sectionPreviewFollow: PATCH.jsonClone(PATCH.ensureSectionPreviewFollow()),
        activeJiSection: liveFocus.ji,
        activeCompSection: liveFocus.comp,
        midiLearnMappings: PATCH.readMidiLearnMappings(),
      },
      exports: {
        layerNames: layers,
        activeLayers,
        activeEngines,
        multiExport: typeof S !== 'undefined' && S && S.multiExport ? PATCH.jsonClone(S.multiExport) : null,
        files: Array.isArray(fileEntries) ? fileEntries : [],
        abDiff: PATCH.buildABDiffSummary(),
      },
    };
  };

  PATCH.downloadJsonFile = function downloadJsonFile(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  PATCH.downloadExportManifest = function downloadExportManifest(kind, fileEntries) {
    if (typeof S === 'undefined' || !S) return false;
    const prefix = ((S.multiExport && S.multiExport.prefix) || 'void').replace(/[^a-zA-Z0-9_-]/g, '_') || 'void';
    const manifest = PATCH.buildExportManifest(kind, fileEntries);
    PATCH.downloadJsonFile(prefix + '_manifest.json', manifest);
    const status = document.getElementById('meStatus');
    if (status) status.textContent = 'EXPORT MANIFEST saved';
    return true;
  };

  PATCH.syncPatchDiagnosticsUI = function syncPatchDiagnosticsUI() {
    const el = document.getElementById('patchDiagnostics');
    if (!el) return;
    const a4 = PATCH.getConcertA4Hz();
    const netCents = PATCH.getGlobalConcertOffsetCents();
    const scalaName =
      typeof CompTuningEngine !== 'undefined' &&
      CompTuningEngine.STATE &&
      CompTuningEngine.STATE.scalaProfile &&
      CompTuningEngine.STATE.scalaProfile.scale &&
      CompTuningEngine.STATE.scalaProfile.scale.name
        ? CompTuningEngine.STATE.scalaProfile.scale.name
        : 'None';
    const learnCount = Object.keys(PATCH.readMidiLearnMappings()).length;
    const capture = PATCH.midiCaptureState || {};
    const capturePolicy = PATCH.ensureMidiCapturePolicy();
    const follow = PATCH.ensureSectionPreviewFollow();
    const previewState = PATCH.previewTransportState || { playing: false, bar: 0, progress: 0, duration: 0 };
    const captureState = !capture.enabled
      ? 'IDLE'
      : capture.pendingChord
        ? 'PENDING ' + capture.pendingChord.rootName + (capture.pendingChord.quality || '')
        : 'ARMED';
    const jiFocus = PATCH.getFocusedSectionProfile('ji');
    const compFocus = PATCH.getFocusedSectionProfile('comp');
    const jiState = typeof JI_PARAMS !== 'undefined'
      ? (!!JI_PARAMS.enabled
          ? (
              JI_PARAMS.mode +
              (JI_PARAMS.adaptiveMemoryEnabled ? ' / MEM ' + Math.round((JI_PARAMS.adaptiveMemoryStrength || 0) * 100) + '%' : '') +
              (JI_PARAMS.adaptiveMemoryEnabled && (Number(JI_PARAMS.adaptiveBassAnchorStrength) || 0) > 0 ? ' / BASS ' + Math.round((JI_PARAMS.adaptiveBassAnchorStrength || 0) * 100) + '%' : '') +
              (JI_PARAMS.adaptiveMemoryEnabled && (Number(JI_PARAMS.adaptiveVoiceLeadingStrength) || 0) > 0 ? ' / VL ' + Math.round((JI_PARAMS.adaptiveVoiceLeadingStrength || 0) * 100) + '%' : '') +
              (JI_PARAMS.adaptiveCadenceResetEnabled ? ' / CAD ' + Math.round((JI_PARAMS.adaptiveCadenceResetStrength || 0) * 100) + '%' : '') +
              (JI_PARAMS.adaptiveMemoryEnabled ? ' / SEC ' + (JI_PARAMS.adaptiveResetOnSection ? 'ON' : 'OFF') : '') +
              (JI_PARAMS.sectionModEnabled ? ' / MOD ON' : '') +
              (JI_PARAMS.sectionModEnabled && jiFocus && jiFocus.profile ? ' / F:' + (jiFocus.profile.name || ('#' + (jiFocus.index + 1))) : '')
            )
          : 'OFF')
      : 'OFF';
    const compState =
      typeof CompTuningEngine !== 'undefined' && CompTuningEngine.STATE
        ? (CompTuningEngine.STATE.sectionModEnabled
            ? ('MOD ON' + (PATCH.isCompSectionRuntimeActive() ? '' : ' / MPE BYPASS') + (compFocus && compFocus.profile ? ' / F:' + (compFocus.profile.name || ('#' + (compFocus.index + 1))) : ''))
            : 'MOD OFF')
        : 'MOD OFF';
    const oscMode = typeof S !== 'undefined' && S && S.oscExport ? (S.oscExport.mode || 'binary').toUpperCase() : 'BINARY';
    const oscUrl = typeof S !== 'undefined' && S && S.oscExport ? (S.oscExport.url || '—') : '—';
    const oscTest = typeof S !== 'undefined' && S && S.oscExport ? (S.oscExport.testStatus || 'OSC TEST 未実行') : 'OSC TEST 未実行';
    const abState = typeof S !== 'undefined' && S ? 'A:' + (!!S.midiDataA) + ' / B:' + (!!S.midiDataB) + ' / CUR:' + (S.abMode || 'A') : 'A:false / B:false / CUR:A';
    const currentOutput = typeof S !== 'undefined' && S && S.midiData ? ('MIDI ' + S.midiData.length + ' bytes') : 'No MIDI';
    el.innerHTML =
      '<div style="color:#e5e7eb;">PATCH DIAGNOSTICS</div>' +
      '<div style="color:#7c7c7c;margin-top:4px;">CONCERT: A4 ' + a4.toFixed(1) + ' Hz / ' + PATCH.formatSignedCents(netCents) + '</div>' +
      '<div style="color:#7c7c7c;">SCALA: ' + scalaName + '</div>' +
      '<div style="color:#7c7c7c;">COMP: ' + compState + '</div>' +
      '<div style="color:#7c7c7c;">JI: ' + jiState + '</div>' +
      '<div style="color:#7c7c7c;">OSC: ' + oscMode + ' / ' + oscUrl + '</div>' +
      '<div style="color:#7c7c7c;">OSC TEST: ' + oscTest + '</div>' +
      '<div style="color:#7c7c7c;">PREVIEW: ' + (previewState.playing ? 'PLAY' : 'STOP') + ' / BAR ' + (previewState.bar + 1) + ' / JI ' + (follow.ji ? 'FOLLOW' : 'MANUAL') + ' / COMP ' + (follow.comp ? 'FOLLOW' : 'MANUAL') + '</div>' +
      '<div style="color:#7c7c7c;">MIDI LEARN: ' + learnCount + ' map(s) / CAPTURE ' + captureState + ' / ' + capturePolicy.mode.toUpperCase() + ' / ' + capturePolicy.holdMs + 'ms</div>' +
      '<div style="color:#7c7c7c;">A/B: ' + abState + '</div>' +
      '<div style="color:#7c7c7c;">OUTPUT: ' + currentOutput + '</div>';
  };

  window.__MEIKY_PATCH__ = PATCH;
})();
