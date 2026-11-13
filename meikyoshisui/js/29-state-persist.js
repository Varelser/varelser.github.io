/* ═══════════════════════════════════════════════════
   v25.0: STATE PERSIST — localStorage 保存/読み込み
   ─────────────────────────────────────────────────
   保存対象:
     S (メインstate) — midiData/layerTracks/conductorRaw を除くプリミティブ全フィールド
     LORENZ_PARAMS   — sigma/rho/beta/dt/warmup/activePreset
     CA_PARAMS       — rule/seed/override
     RUBATO_PARAMS   — e/t0/notes/dir
     ATTRACTOR_STATE — type/a/b/c/dt/warmup/mapX/mapY/mapZ/scaleX/scaleY/scaleZ/activePreset
     PROG_STATE      — enabled/velShapeMode/velShapeAmt/transitionMode/loopProg/prog[]
     SCALE_MUT_STATE — enabled/transMode/transLen/loop/slots[]
     Humanizer.STATE — enabled/mode/velScale/timScale/pnSpeed/pnAmp/pinkOctaves/velCurveEnabled/velCurveShape/velCurveAmount
     CC_AUTO_STATE   — enabled/lanes[] (全8レーン steps[]含む)

   保存しないもの:
     midiData / layerTracks / conductorRaw (大容量バイナリ)
     S._inst 等のプライベートフィールド

   公開API:
     StatePersist.save(slotName)   — 指定スロットに保存
     StatePersist.load(slotName)   — 指定スロットから読み込み
     StatePersist.remove(slotName) — スロット削除
     StatePersist.listSlots()      — 保存済みスロット一覧 [{name, savedAt, label}]
     StatePersist.autoSave()       — スロット名 '__auto__' に保存
     StatePersist.autoLoad()       — '__auto__' から読み込み (起動時に呼ぶ)
═══════════════════════════════════════════════════ */

const StatePersist = (() => {
  'use strict';

  const STORAGE_PREFIX = 'meikyoshisui_v25_';
  const SLOT_INDEX_KEY = STORAGE_PREFIX + 'slots';
  const MAX_SLOTS = 20;

  /* ── S から保存対象フィールドだけ抽出 ── */
  function extractS() {
    const SKIP = new Set(['midiData','layerTracks','conductorRaw','chord']);
    const out = {};
    for (const [k, v] of Object.entries(S)) {
      if (SKIP.has(k)) continue;
      // 深いオブジェクトはJSON経由でディープコピー
      try { out[k] = JSON.parse(JSON.stringify(v)); } catch(_) { out[k] = v; }
    }
    // chord は rootName + forteKey だけ保存（再解析用）
    if (S.chord) out._chordInput = document.getElementById('chordInput')?.value || '';
    return out;
  }

  /* ── LORENZ_PARAMS の保存対象フィールド ── */
  function extractLorenz() {
    if (typeof LORENZ_PARAMS === 'undefined') return null;
    return {
      sigma: LORENZ_PARAMS.sigma,
      rho:   LORENZ_PARAMS.rho,
      beta:  LORENZ_PARAMS.beta,
      dt:    LORENZ_PARAMS.dt,
      warmup: LORENZ_PARAMS.warmup,
      activePreset: LORENZ_PARAMS.activePreset,
    };
  }

  /* ── CA_PARAMS ── */
  function extractCA() {
    if (typeof CA_PARAMS === 'undefined') return null;
    return { rule: CA_PARAMS.rule, seed: CA_PARAMS.seed, override: CA_PARAMS.override };
  }

  /* ── RUBATO_PARAMS ── */
  function extractRubato() {
    if (typeof RUBATO_PARAMS === 'undefined') return null;
    return { e: RUBATO_PARAMS.e, t0: RUBATO_PARAMS.t0, notes: RUBATO_PARAMS.notes, dir: RUBATO_PARAMS.dir };
  }

  /* ── ATTRACTOR_STATE ── */
  function extractAttractor() {
    if (typeof ATTRACTOR_STATE === 'undefined') return null;
    return {
      type: ATTRACTOR_STATE.type,
      a: ATTRACTOR_STATE.a, b: ATTRACTOR_STATE.b, c: ATTRACTOR_STATE.c,
      dt: ATTRACTOR_STATE.dt, warmup: ATTRACTOR_STATE.warmup,
      activePreset: ATTRACTOR_STATE.activePreset,
      mapX: ATTRACTOR_STATE.mapX, mapY: ATTRACTOR_STATE.mapY, mapZ: ATTRACTOR_STATE.mapZ,
      scaleX: ATTRACTOR_STATE.scaleX, scaleY: ATTRACTOR_STATE.scaleY, scaleZ: ATTRACTOR_STATE.scaleZ,
      enabled: ATTRACTOR_STATE.enabled,
    };
  }

  /* ── PROG_STATE ── */
  function extractProg() {
    if (typeof PROG_STATE === 'undefined') return null;
    return {
      enabled: PROG_STATE.enabled,
      velShapeMode: PROG_STATE.velShapeMode,
      velShapeAmt: PROG_STATE.velShapeAmt,
      transitionMode: PROG_STATE.transitionMode,
      loopProg: PROG_STATE.loopProg,
      // prog配列: {chord:{root,rootName,quality,iv,name}, bars} の安全なディープコピー
      prog: JSON.parse(JSON.stringify(PROG_STATE.prog || [])),
    };
  }

  /* ── SCALE_MUT_STATE ── */
  function extractScaleMut() {
    if (typeof SCALE_MUT_STATE === 'undefined') return null;
    return {
      enabled: SCALE_MUT_STATE.enabled,
      transMode: SCALE_MUT_STATE.transMode,
      transLen: SCALE_MUT_STATE.transLen,
      loop: SCALE_MUT_STATE.loop,
      // slots配列: {scale:string, iv:number[], bars:number} の安全なディープコピー
      slots: JSON.parse(JSON.stringify(SCALE_MUT_STATE.slots || [])),
    };
  }

  /* ── Humanizer.STATE ── */
  function extractHumanizer() {
    if (typeof Humanizer === 'undefined') return null;
    const h = Humanizer.STATE;
    return {
      enabled: h.enabled,
      mode: h.mode,
      velScale: h.velScale,
      timScale: h.timScale,
      pnSpeed: h.pnSpeed,
      pnAmp: h.pnAmp,
      pinkOctaves: h.pinkOctaves,
      velCurveEnabled: h.velCurveEnabled,
      velCurveShape: h.velCurveShape,
      velCurveAmount: h.velCurveAmount,
    };
  }

  /* ── CC_AUTO_STATE ── */
  function extractCCAuto() {
    if (typeof CC_AUTO_STATE === 'undefined') return null;
    return {
      enabled: CC_AUTO_STATE.enabled,
      // lanes配列: 各レーンオブジェクトを steps[] 含めてディープコピー
      lanes: JSON.parse(JSON.stringify(CC_AUTO_STATE.lanes || [])),
    };
  }

  /* ── patch layer 拡張スナップショット (2026-11-10: 92 のラップを本体へ還元) ──
     PATCH (90) が有効な場合のみ、patch 機能の状態も同じスナップショットへ含める。
     PATCH が無い環境では従来通りのスナップショットになる。 */
  function patchLib() {
    return (typeof window !== 'undefined' && window.__MEIKY_PATCH__) || null;
  }

  function extractPatchExtras() {
    const P = patchLib();
    if (!P || typeof P.jsonClone !== 'function') return {};
    try {
      return {
        ji: typeof JI_PARAMS !== 'undefined' ? P.jsonClone(JI_PARAMS) : null,
        rc: typeof RC_PARAMS !== 'undefined' ? P.jsonClone(RC_PARAMS) : null,
        compTuning: (typeof CompTuningEngine !== 'undefined' && CompTuningEngine.STATE)
          ? {
              ...P.jsonClone(CompTuningEngine.STATE),
              channels: Array.from(CompTuningEngine.STATE.channels || []),
            }
          : null,
        sectionLearnFocus: P.jsonClone(P.sectionLearnFocus),
        sectionPreviewFollow: P.jsonClone(P.ensureSectionPreviewFollow()),
        midiCapturePolicy: P.jsonClone(P.ensureMidiCapturePolicy()),
        conductorViz: typeof CONDUCTOR_VIZ_STATE !== 'undefined' ? P.jsonClone(CONDUCTOR_VIZ_STATE) : null,
      };
    } catch(_) {
      return {};
    }
  }

  function applyPatchExtras(snap) {
    const P = patchLib();
    if (!P || !snap) return;
    if (snap.ji && typeof JI_PARAMS !== 'undefined') {
      Object.assign(JI_PARAMS, snap.ji);
    }
    if (snap.rc && typeof RC_PARAMS !== 'undefined') {
      Object.assign(RC_PARAMS, snap.rc);
    }
    if (snap.compTuning && typeof CompTuningEngine !== 'undefined' && CompTuningEngine.STATE) {
      const saved = { ...snap.compTuning };
      if (Array.isArray(saved.channels)) saved.channels = new Set(saved.channels);
      Object.assign(CompTuningEngine.STATE, saved);
      if (!(CompTuningEngine.STATE.channels instanceof Set)) {
        CompTuningEngine.STATE.channels = new Set(saved.channels || []);
      }
    }
    if (snap.sectionLearnFocus && P.sectionLearnFocus) {
      Object.assign(P.sectionLearnFocus, snap.sectionLearnFocus);
    }
    if (snap.sectionPreviewFollow && P.sectionPreviewFollow) {
      Object.assign(P.ensureSectionPreviewFollow(), snap.sectionPreviewFollow);
    }
    if (snap.midiCapturePolicy) {
      Object.assign(P.ensureMidiCapturePolicy(), snap.midiCapturePolicy);
    }
    if (snap.conductorViz && typeof CONDUCTOR_VIZ_STATE !== 'undefined') {
      Object.assign(CONDUCTOR_VIZ_STATE, snap.conductorViz);
    }
  }

  /* load 完了後に patch 側の生成物クリア・状態適用・UI 同期を行う (92 の load ラップから還元) */
  function syncPatchAfterLoad(snap) {
    const P = patchLib();
    if (!P) return;
    if (typeof P.clearGeneratedArtifacts === 'function') P.clearGeneratedArtifacts();
    applyPatchExtras(snap);

    if (typeof P.syncAttractorUI === 'function') P.syncAttractorUI();

    if (typeof CompTuningEngine !== 'undefined' && CompTuningEngine.STATE) {
      const toggler = document.getElementById('togCompTuning');
      const controls = document.getElementById('compTuningControls');
      const compTuningEnabled = typeof S !== 'undefined' && S && S.engines ? !!S.engines.comptuning : false;
      if (toggler) toggler.classList.toggle('on', compTuningEnabled);
      if (controls) controls.style.display = compTuningEnabled ? 'block' : 'none';

      const pbSlider = document.getElementById('ctPbRange');
      const pbValue = document.getElementById('ctPbRangeV');
      const a4Slider = document.getElementById('ctA4Slider');
      const a4Value = document.getElementById('ctA4Val');
      const globalSlider = document.getElementById('ctGlobalCents');
      const globalValue = document.getElementById('ctGlobalCentsV');
      if (pbSlider) pbSlider.value = CompTuningEngine.STATE.pbRange;
      if (pbValue) pbValue.textContent = '±' + CompTuningEngine.STATE.pbRange + ' st';
      if (a4Slider) a4Slider.value = CompTuningEngine.STATE.a4Hz;
      if (a4Value) a4Value.textContent = CompTuningEngine.STATE.a4Hz.toFixed(1) + ' Hz';
      if (globalSlider) globalSlider.value = CompTuningEngine.STATE.globalCents;
      if (globalValue) {
        const sign = CompTuningEngine.STATE.globalCents >= 0 ? '+' : '';
        globalValue.textContent = sign + CompTuningEngine.STATE.globalCents.toFixed(1) + '¢';
      }

      const rootSlider = document.getElementById('ctRootPc');
      const rootValue = document.getElementById('ctRootPcV');
      if (rootSlider) rootSlider.value = CompTuningEngine.STATE.rootPc;
      if (rootValue) rootValue.textContent = P.NOTE_NAMES[CompTuningEngine.STATE.rootPc] || 'C';

      const scaleSyncBtn = document.getElementById('ctScaleSyncBtn');
      if (scaleSyncBtn) {
        const auto = !!CompTuningEngine.STATE.autoScaleSync;
        scaleSyncBtn.classList.toggle('on', auto);
        scaleSyncBtn.textContent = auto ? 'AUTO' : 'MANUAL';
      }

      if (typeof CompTuningEngine.buildA4Presets === 'function') {
        CompTuningEngine.buildA4Presets();
      }
      if (typeof P.ensureScalaTemperamentEntry === 'function') P.ensureScalaTemperamentEntry();
      if (typeof P.refreshScalaProfile === 'function') P.refreshScalaProfile(false);
      if (typeof CompTuningEngine.buildTemperamentButtons === 'function') {
        CompTuningEngine.buildTemperamentButtons();
      }
      if (typeof CompTuningEngine.buildIntervalGrid === 'function') {
        CompTuningEngine.buildIntervalGrid();
      }
      if (typeof CompTuningEngine.updateDisplay === 'function') {
        CompTuningEngine.updateDisplay();
      }
    }

    if (typeof P.syncCAPreviewUI === 'function') P.syncCAPreviewUI();
    if (typeof P.syncJustIntonationUI === 'function') P.syncJustIntonationUI();
    if (typeof P.syncRhythmicCanonsUI === 'function') P.syncRhythmicCanonsUI();
    if (typeof P.syncConductorVizUI === 'function') P.syncConductorVizUI();
    if (typeof P.syncGeneratedOutputUI === 'function') P.syncGeneratedOutputUI();
    if (typeof P.syncBinauralUI === 'function') P.syncBinauralUI();
    if (typeof P.syncConcertPitchUI === 'function') P.syncConcertPitchUI();
    if (typeof P.syncScalaUI === 'function') P.syncScalaUI();
    if (typeof P.syncCompSectionUI === 'function') P.syncCompSectionUI();
  }

  /* ── スナップショット全体を構築 ── */
  function buildSnapshot(label) {
    const snap = {
      version: 25,
      label: label || '',
      savedAt: new Date().toISOString(),
      s: extractS(),
      lorenz: extractLorenz(),
      ca: extractCA(),
      rubato: extractRubato(),
      attractor: extractAttractor(),
      prog: extractProg(),
      scaleMut: extractScaleMut(),
      humanizer: extractHumanizer(),
      ccAuto: extractCCAuto(),
    };
    /* patch 拡張 (92 の save ラップから還元): キーの追加順もラップと同一に保つ */
    const extras = extractPatchExtras();
    for (const key of ['ji', 'rc', 'compTuning', 'sectionLearnFocus', 'sectionPreviewFollow', 'midiCapturePolicy', 'conductorViz']) {
      if (key in extras) snap[key] = extras[key];
    }
    return snap;
  }

  /* ── スロットインデックスの読み書き ── */
  function getIndex() {
    try { return JSON.parse(localStorage.getItem(SLOT_INDEX_KEY) || '[]'); } catch(_) { return []; }
  }
  function setIndex(arr) {
    localStorage.setItem(SLOT_INDEX_KEY, JSON.stringify(arr));
  }

  /* ── 保存 ── */
  function save(slotName, label) {
    if (!slotName) return false;
    const snap = buildSnapshot(label || slotName);
    try {
      localStorage.setItem(STORAGE_PREFIX + slotName, JSON.stringify(snap));
      // インデックス更新
      if (slotName !== '__auto__') {
        let idx = getIndex().filter(s => s.name !== slotName);
        idx.unshift({ name: slotName, savedAt: snap.savedAt, label: snap.label });
        if (idx.length > MAX_SLOTS) idx = idx.slice(0, MAX_SLOTS);
        setIndex(idx);
      }
      return true;
    } catch(e) {
      console.error('[StatePersist] save failed:', e);
      return false;
    }
  }

  /* ── S へ復元 ── */
  function restoreS(data) {
    if (!data) return;
    const SKIP = new Set(['midiData','layerTracks','conductorRaw','chord','_chordInput']);
    for (const [k, v] of Object.entries(data)) {
      if (SKIP.has(k)) continue;
      if (k in S) {
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          Object.assign(S[k], v);
        } else {
          S[k] = v;
        }
      }
    }
    // chord 入力欄を復元してイベント発火
    if (data._chordInput) {
      const ci = document.getElementById('chordInput');
      if (ci) { ci.value = data._chordInput; ci.dispatchEvent(new Event('input')); }
    }
  }

  /* ── LORENZ_PARAMS 復元 ── */
  function restoreLorenz(data) {
    if (!data || typeof LORENZ_PARAMS === 'undefined') return;
    Object.assign(LORENZ_PARAMS, data);
  }

  /* ── CA_PARAMS 復元 ── */
  function restoreCA(data) {
    if (!data || typeof CA_PARAMS === 'undefined') return;
    Object.assign(CA_PARAMS, data);
  }

  /* ── RUBATO_PARAMS 復元 ── */
  function restoreRubato(data) {
    if (!data || typeof RUBATO_PARAMS === 'undefined') return;
    Object.assign(RUBATO_PARAMS, data);
  }

  /* ── ATTRACTOR_STATE 復元 ── */
  function restoreAttractor(data) {
    if (!data || typeof ATTRACTOR_STATE === 'undefined') return;
    Object.assign(ATTRACTOR_STATE, data);
  }

  /* ── PROG_STATE 復元 ── */
  function restoreProg(data) {
    if (!data || typeof PROG_STATE === 'undefined') return;
    PROG_STATE.enabled       = data.enabled       ?? PROG_STATE.enabled;
    PROG_STATE.velShapeMode  = data.velShapeMode  ?? PROG_STATE.velShapeMode;
    PROG_STATE.velShapeAmt   = data.velShapeAmt   ?? PROG_STATE.velShapeAmt;
    PROG_STATE.transitionMode= data.transitionMode?? PROG_STATE.transitionMode;
    PROG_STATE.loopProg      = data.loopProg      ?? PROG_STATE.loopProg;
    // prog配列を完全置換（旧スナップショットに prog がなければ触らない）
    if (Array.isArray(data.prog)) {
      PROG_STATE.prog.length = 0;
      data.prog.forEach(item => PROG_STATE.prog.push(item));
    }
  }

  /* ── SCALE_MUT_STATE 復元 ── */
  function restoreScaleMut(data) {
    if (!data || typeof SCALE_MUT_STATE === 'undefined') return;
    SCALE_MUT_STATE.enabled   = data.enabled  ?? SCALE_MUT_STATE.enabled;
    SCALE_MUT_STATE.transMode = data.transMode?? SCALE_MUT_STATE.transMode;
    SCALE_MUT_STATE.transLen  = data.transLen ?? SCALE_MUT_STATE.transLen;
    SCALE_MUT_STATE.loop      = data.loop     ?? SCALE_MUT_STATE.loop;
    // slots配列を完全置換（旧スナップショットに slots がなければ触らない）
    if (Array.isArray(data.slots)) {
      SCALE_MUT_STATE.slots.length = 0;
      data.slots.forEach(item => SCALE_MUT_STATE.slots.push(item));
    }
  }

  /* ── Humanizer.STATE 復元 ── */
  function restoreHumanizer(data) {
    if (!data || typeof Humanizer === 'undefined') return;
    Object.assign(Humanizer.STATE, data);
    if (data.enabled !== undefined) {
      Humanizer.STATE.enabled = data.enabled;
      const tog = document.getElementById('togHum');
      if (tog) tog.classList.toggle('on', data.enabled);
    }
  }

  /* ── CC_AUTO_STATE 復元 ── */
  function restoreCCAuto(data) {
    if (!data || typeof CC_AUTO_STATE === 'undefined') return;
    CC_AUTO_STATE.enabled = data.enabled ?? CC_AUTO_STATE.enabled;
    // lanes配列: 要素数が一致する範囲で上書き (レーン数の増減に対応)
    if (Array.isArray(data.lanes)) {
      data.lanes.forEach((saved, i) => {
        if (i < CC_AUTO_STATE.lanes.length) Object.assign(CC_AUTO_STATE.lanes[i], saved);
      });
    }
    // トグルUI同期
    const tog = document.getElementById('togCCA');
    if (tog) tog.classList.toggle('on', !!CC_AUTO_STATE.enabled);
  }

  /* ── 読み込み ── */
  function load(slotName) {
    if (!slotName) return false;
    const raw = localStorage.getItem(STORAGE_PREFIX + slotName);
    if (!raw) {
      /* __auto__ は起動時に無条件で読みに来るため、未保存 (初回起動など) は正常系。
         警告を出すと毎回ログに残ってしまうので黙って戻る。名前付きスロットの
         明示ロードだけ従来どおり警告する。 */
      if (slotName !== '__auto__' && typeof log === 'function') log('// STATE LOAD: slot "' + slotName + '" not found', 'warn');
      return false;
    }
    let snap;
    try { snap = JSON.parse(raw); } catch(e) {
      if (typeof log === 'function') log('// STATE LOAD: JSON parse error — ' + e.message, 'err');
      return false;
    }
    if (!snap) {
      if (typeof log === 'function') log('// STATE LOAD: empty snapshot for "' + slotName + '"', 'err');
      return false;
    }
    if (snap.version !== 25) {
      if (typeof log === 'function') log('// STATE LOAD: version mismatch — saved=' + snap.version + ' current=25. Loading best-effort.', 'warn');
      // バージョン不一致でもロード続行 (フォールバック)
    }

    const _try = (label, fn) => {
      try { fn(); } catch(e) {
        if (typeof log === 'function') log('// STATE LOAD: ' + label + ' failed — ' + e.message, 'err');
        console.error('[StatePersist.load] ' + label, e);
      }
    };
    _try('S',          () => restoreS(snap.s));
    _try('Lorenz',     () => restoreLorenz(snap.lorenz));
    _try('CA',         () => restoreCA(snap.ca));
    _try('Rubato',     () => restoreRubato(snap.rubato));
    _try('Attractor',  () => restoreAttractor(snap.attractor));
    _try('Prog',       () => restoreProg(snap.prog));
    _try('ScaleMut',   () => restoreScaleMut(snap.scaleMut));
    _try('Humanizer',  () => restoreHumanizer(snap.humanizer));
    _try('CCAuto',     () => restoreCCAuto(snap.ccAuto));

    /* UI全体を再構築 */
    try { _refreshUI(); } catch(e) {
      if (typeof log === 'function') log('// STATE LOAD: _refreshUI failed — ' + e.message, 'err');
      console.error('[StatePersist.load] _refreshUI', e);
    }

    /* patch 拡張の適用と UI 同期 (2026-11-10: 92 の load ラップから還元) */
    try { syncPatchAfterLoad(snap); } catch(e) {
      console.error('[StatePersist.load] patch sync', e);
    }
    return true;
  }

  /* ── 削除 ── */
  function remove(slotName) {
    if (!slotName) return;
    localStorage.removeItem(STORAGE_PREFIX + slotName);
    setIndex(getIndex().filter(s => s.name !== slotName));
  }

  /* ── スロット一覧 ── */
  function listSlots() {
    return getIndex();
  }

  /* ── オートセーブ/ロード ── */
  function autoSave() { save('__auto__', 'Auto Save'); }
  function autoLoad() { return load('__auto__'); }

  /* ── 全スロットをJSONファイルにエクスポート ── */
  function exportAll() {
    const slots = getIndex();
    const out = { version: 25, exportedAt: new Date().toISOString(), slots: [] };
    slots.forEach(s => {
      const raw = localStorage.getItem(STORAGE_PREFIX + s.name);
      if (raw) {
        try { out.slots.push({ name: s.name, data: JSON.parse(raw) }); } catch(_) {}
      }
    });
    /* patch 拡張 (2026-11-10: 92 の export ラップから還元) */
    const P = patchLib();
    if (P) {
      out.patchExtras = {
        scalaFavorites: typeof P.readScalaFavorites === 'function' ? P.readScalaFavorites() : {},
        midiLearnMappings: typeof P.readMidiLearnMappings === 'function' ? P.readMidiLearnMappings() : {},
        sectionLearnFocus: typeof P.jsonClone === 'function' ? P.jsonClone(P.sectionLearnFocus) : null,
        sectionPreviewFollow: typeof P.jsonClone === 'function' ? P.jsonClone(P.ensureSectionPreviewFollow()) : null,
        midiCapturePolicy: typeof P.jsonClone === 'function' ? P.jsonClone(P.ensureMidiCapturePolicy()) : null,
      };
    }
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meikyoshisui_presets_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── JSONファイルから全スロットをインポート ── */
  function importAll(onComplete) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        let parsed;
        try { parsed = JSON.parse(e.target.result); } catch(_) {
          if (typeof log === 'function') log('// IMPORT ERROR: invalid JSON', 'err');
          return;
        }
        if (!parsed || parsed.version !== 25 || !Array.isArray(parsed.slots)) {
          if (typeof log === 'function') log('// IMPORT ERROR: incompatible format', 'err');
          return;
        }
        let count = 0;
        parsed.slots.forEach(s => {
          if (!s.name || !s.data) return;
          try {
            localStorage.setItem(STORAGE_PREFIX + s.name, JSON.stringify(s.data));
            // インデックスに追加
            let idx = getIndex().filter(x => x.name !== s.name);
            idx.unshift({ name: s.name, savedAt: s.data.savedAt || new Date().toISOString(), label: s.data.label || s.name });
            if (idx.length > MAX_SLOTS) idx = idx.slice(0, MAX_SLOTS);
            setIndex(idx);
            count++;
          } catch(_) {}
        });
        /* patch 拡張の取り込み (2026-11-10: 92 の import ラップから還元) */
        const P = patchLib();
        if (P && parsed.patchExtras) {
          const extras = parsed.patchExtras;
          if (extras.scalaFavorites && typeof extras.scalaFavorites === 'object' &&
              typeof P.writeScalaFavorites === 'function') {
            P.writeScalaFavorites(extras.scalaFavorites);
          }
          if (extras.midiLearnMappings && typeof extras.midiLearnMappings === 'object' &&
              typeof P.writeMidiLearnMappings === 'function') {
            P.writeMidiLearnMappings(extras.midiLearnMappings);
          }
          if (extras.sectionLearnFocus && typeof extras.sectionLearnFocus === 'object' && P.sectionLearnFocus) {
            Object.assign(P.sectionLearnFocus, extras.sectionLearnFocus);
          }
          if (extras.sectionPreviewFollow && typeof extras.sectionPreviewFollow === 'object' && P.sectionPreviewFollow) {
            Object.assign(P.ensureSectionPreviewFollow(), extras.sectionPreviewFollow);
          }
          if (extras.midiCapturePolicy && typeof extras.midiCapturePolicy === 'object') {
            Object.assign(P.ensureMidiCapturePolicy(), extras.midiCapturePolicy);
          }
          if (typeof P.syncScalaUI === 'function') P.syncScalaUI();
          if (typeof P.syncJustIntonationUI === 'function') P.syncJustIntonationUI();
          if (typeof P.syncCompSectionUI === 'function') P.syncCompSectionUI();
          if (typeof P.syncMidiMonitorUI === 'function') P.syncMidiMonitorUI();
        }
        if (typeof log === 'function') log('// IMPORTED ' + count + ' preset(s)', 'ok');
        if (typeof onComplete === 'function') onComplete(count);
      };
      reader.readAsText(file);
    });
    input.click();
  }

  /* ── UI 全体再構築 (load後に呼ぶ) ── */
  function _refreshUI() {
    // これらは 22-ui-functions.js / 23-init.js で定義される関数
    if (typeof buildScaleUI === 'function') buildScaleUI();
    if (typeof buildGenreUI === 'function') buildGenreUI();
    if (typeof buildLayerToggles === 'function') buildLayerToggles();
    if (typeof buildLayerOctaves === 'function') buildLayerOctaves();
    if (typeof updateTheory === 'function') updateTheory();
    if (typeof refreshBpmDisplay === 'function') refreshBpmDisplay();
    if (typeof updateGateIndicator === 'function') updateGateIndicator();
    if (typeof buildEucPresets === 'function') buildEucPresets();
    if (typeof updateEucDisplay === 'function') updateEucDisplay();
    if (typeof Humanizer !== 'undefined' && typeof Humanizer.buildUI === 'function') Humanizer.buildUI();
    // ECBトグルをS.enginesに合わせて同期
    if (typeof ECB_ENGINES !== 'undefined') {
      ECB_ENGINES.forEach(eng => {
        const btn = document.querySelector(`.ecb-btn[data-key="${eng.key}"]`);
        if (btn) btn.classList.toggle('on', !!S.engines[eng.key]);
      });
    }
    // スライダー値と表示値を一括同期
    const _sl = (id, val, fmt) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
      const vEl = document.getElementById(id + 'V');
      if (vEl && fmt) vEl.textContent = fmt(val);
    };
    _sl('bpm',        S.bpm,         v => v + ' BPM');
    _sl('bars',       S.bars,        v => String(v));
    _sl('density',    S.density,     v => v + '%');
    _sl('velocity',   S.velocity,    v => String(v));
    _sl('humanize',   S.humanize,    v => v + '%');
    _sl('drift',      S.drift,       v => v + '%');
    _sl('dissonance', S.dissonance,  v => v + '%');
    _sl('polyrhythm', S.polyrhythm,  v => v + '%');
    _sl('gateBase',   Math.round(S.gateBase * 100), v => (v / 100).toFixed(2));
    _sl('pbRange',    S.pbRange,     v => '±' + v + ' st');
    _sl('curveAmp',   S.curveAmp,    v => v + '%');
    _sl('tempoDrift', S.tempoDrift,  v => '±' + v + ' BPM');
    _sl('resolveThreshold', Math.round(S.resolveThreshold * 100), v => (v / 100).toFixed(2));
    _sl('resolveSteps', S.resolveSteps, v => String(v));
    // 表示IDが 'Val' 末尾の例外スライダー
    const _slv = (slId, dispId, val, fmt) => {
      const el = document.getElementById(slId); if (el) el.value = val;
      const vEl = document.getElementById(dispId); if (vEl && fmt) vEl.textContent = fmt(val);
    };
    _slv('octSpread', 'octSpreadVal', S.octSpread, v => '±' + v + ' oct');
    _slv('octBias',   'octBiasVal',   S.octBias,   v => v === 0 ? 'Center' : (v > 0 ? '+' + v : String(v)));

    // トグル系UIの同期 (on/off + 連動パネル表示)
    const _tog = (id, state, ctrlId) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('on', !!state);
      if (ctrlId) {
        const ct = document.getElementById(ctrlId);
        if (ct) ct.style.display = state ? 'block' : 'none';
      }
    };
    _tog('togMacro',    S.macroEnabled,    'macroControls');
    _tog('togChain',    S.chainEnabled,    'chainControls');
    _tog('togTempoMod', S.tempoModEnabled, 'tempoModControls');
    // MPE: S.mpe は S.engines.mpe ではなく独立フラグ
    const togMPE = document.getElementById('togMPE');
    if (togMPE) togMPE.classList.toggle('on', !!S.mpe);
    const mpePbRow = document.getElementById('mpePbRow');
    if (mpePbRow) mpePbRow.style.display = S.mpe ? 'block' : 'none';
    const mpeStatus = document.getElementById('mpeStatus');
    if (mpeStatus) mpeStatus.textContent = S.mpe ? 'MPE ON — pb:±' + S.pbRange + ' st' : 'MPE OFF';
    if (typeof refreshBpmDisplay === 'function') refreshBpmDisplay();
    // Macro カーブ選択UIの再構築
    if (typeof buildCurveGrid === 'function') buildCurveGrid();
    if (typeof buildChainSelect === 'function') buildChainSelect();
    const chainAName = document.getElementById('chainAName');
    if (chainAName) chainAName.textContent = S.curveShape;
    if (typeof updateMacroPreview === 'function' && S.macroEnabled) updateMacroPreview();
    // Resolve インジケーター
    if (typeof updateResolveIndicator === 'function') updateResolveIndicator();
    // octDisplay (オクターブレイヤーボタン群) の再構築
    if (typeof buildOctDisplay === 'function') buildOctDisplay();
    // Chord Progression / Scale Mutation スロット UI を再描画
    if (typeof window.refreshProgUI === 'function') window.refreshProgUI();
    if (typeof window.refreshScaleMutUI === 'function') window.refreshScaleMutUI();
    // CC Automation レーン UI を再描画
    if (typeof window.refreshCCAutoUI === 'function') window.refreshCCAutoUI();
    // Seed UI 同期
    const _seedVal = document.getElementById('seedVal');
    const _seedInp = document.getElementById('seedInput');
    const _lockBtn = document.getElementById('seedLockBtn');
    if (_seedVal && S.seed) _seedVal.textContent = S.seed;
    if (_seedInp && S.seedLocked) _seedInp.value = S.seed;
    if (_lockBtn) { _lockBtn.classList.toggle('locked', !!S.seedLocked); _lockBtn.textContent = S.seedLocked ? 'UNLOCK' : 'LOCK'; if (_seedInp) _seedInp.style.display = S.seedLocked ? 'inline-block' : 'none'; }
  }

  return { save, load, remove, listSlots, autoSave, autoLoad, exportAll, importAll };
})();
