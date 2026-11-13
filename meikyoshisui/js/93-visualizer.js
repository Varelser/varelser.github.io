/* ═══════════════════════════════════════════════════════════════
   VISUALIZER  v1.0 (js/93)
   生成済み MIDI（MidiPreview の解析結果）を独立に読み取り、
   プレビュー再生に同期して 11 種のモノクロ表示で描く統合ビジュアライザー。
   ─────────────────────────────────────────────────────────────
   - 生成ロジックには一切触れない。データは MidiPreview.getParsed() 経由
   - 音声系は MidiPreview.getAnalyser()（28 の最小変更で公開）
   - 表示: ROLL / ORBIT / FIFTHS / SURFACE / SPECTRUM / SPECTROGRAM /
           POLAR / FLOW / PHASE / PARTICLE / PSYCHE / ALL
   - 色は使わない。レイヤーは明度でのみ区別する（モノクロ方針）
   ═══════════════════════════════════════════════════════════════ */
(() => {
'use strict';
const panel = document.getElementById('vizPanel');
if (!panel || typeof MidiPreview === 'undefined') return;
/* 要素は必ずパネル経由で引く。PiP で別ドキュメントへ移っても参照が切れないようにするため */
const $ = id => panel.querySelector('#' + id);

/* ── レイヤー（チャンネル→名前と明度） ── */
const CH_DEF = [
  { name:'Drone',    color:'#e8e8ec' },
  { name:'Pad',      color:'#83838e' },
  { name:'Arp',      color:'#c6c6cf' },
  { name:'Melody',   color:'#ffffff' },
  { name:'Bass',     color:'#5a5a64' },
  { name:'Overtone', color:'#9c9ca7' },
  { name:'Texture',  color:'#6e6e78' },
  { name:'Lead',     color:'#d8d8de' },
  { name:'Markov',   color:'#aeaeb6' },
  { name:'L-System', color:'#76767f' },
];
const layerOf = ch => CH_DEF[ch] || { name:'Ch' + ch, color:'#8b8b95' };
const MELODIC = new Set([2, 3, 7, 8, 9]);
const NN = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

/* ── 状態 ── */
let notes = [], totalBeats = 32, noteLo = 36, noteHi = 84, presentChs = [];
let lastParsed = null, lastBpm = 0, frame = 0;
let seed = 987654321;
const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

function rebuild(){
  const P = MidiPreview.getParsed();
  if (!P || P === lastParsed) return;
  lastParsed = P; lastBpm = MidiPreview.getBpm ? MidiPreview.getBpm() : 60;
  const ppq = P.ppq || 480, queues = new Map(), out = [];
  for (const ev of P.noteEvents){
    const k = ev.ch * 128 + ev.note;
    if (ev.on){
      if (!queues.has(k)) queues.set(k, []);
      queues.get(k).push(ev);
    } else {
      const q = queues.get(k);
      if (q && q.length){
        const on = q.shift();
        out.push({ note: ev.note, ch: ev.ch, start: on.tick / ppq, dur: Math.max(0.05, (ev.tick - on.tick) / ppq), vel: on.vel });
      }
    }
  }
  for (const q of queues.values()) for (const on of q)
    out.push({ note: on.note, ch: on.ch, start: on.tick / ppq, dur: 0.5, vel: on.vel });
  out.sort((a, b) => a.start - b.start);
  notes = out;
  if (notes.length){
    noteLo = Math.max(12, Math.min(...notes.map(n => n.note)) - 2);
    noteHi = Math.min(115, Math.max(...notes.map(n => n.note)) + 2);
    totalBeats = Math.ceil(Math.max(...notes.map(n => n.start + n.dur))) + 1;
    presentChs = [...new Set(notes.map(n => n.ch))].sort((a, b) => a - b);
  }
  particles.length = 0; ripples.length = 0; surfaceRings.length = 0; melodyPath.length = 0;
  sgCols.length = 0; pvBursts.length = 0; pvParticles.length = 0; rollStaticDirty = true; _prevBeat = -1;
  $('vizRollInfo').textContent = notes.length + ' NOTES · ' + totalBeats + ' BEATS';
  $('vizLegend').innerHTML = presentChs.map(ch =>
    '<span><i style="background:' + layerOf(ch).color + '"></i>' + layerOf(ch).name + '</span>').join('');
  panel.style.display = '';
}

/* ── 再生状態 ── */
const isPlaying = () => MidiPreview.isPlaying();
const elapsedSec = () => MidiPreview.getElapsed ? MidiPreview.getElapsed() : 0;
const spb = () => 60 / (MidiPreview.getBpm ? MidiPreview.getBpm() : (lastBpm || 60));
const analyser = () => MidiPreview.getAnalyser ? MidiPreview.getAnalyser() : null;

/* ── 発音イベントの記録 ── */
const particles = [], ripples = [], surfaceRings = [], melodyPath = [], pvBursts = [];
let _prevBeat = -1;
function onOnset(n){
  const ocv = $('vizCvOrbit'), r = ocv.getBoundingClientRect();
  const p = orbitPos(n, r.width || 800, r.height || 360);
  ripples.push({ x: p.x, y: p.y, r: 3, life: 1, color: layerOf(n.ch).color });
  particles.push({ x: p.x, y: p.y, a: rng() * Math.PI * 2, sp: 5 + rng() * 13, life: 1, decay: .006 + rng() * .008, color: layerOf(n.ch).color, size: .8 + rng() * 1.1 });
  surfaceRings.push({ n, t0: performance.now() });
  pvBursts.push(n);
  if (MELODIC.has(n.ch)) melodyPath.push({ n, t0: performance.now() });
  if (n.ch === 0 || n.ch === 4) psychePulse = Math.max(psychePulse, 0.75);
  if (particles.length > 260) particles.splice(0, particles.length - 260);
  if (ripples.length > 48) ripples.splice(0, ripples.length - 48);
  if (surfaceRings.length > 90) surfaceRings.splice(0, surfaceRings.length - 90);
  if (melodyPath.length > 42) melodyPath.splice(0, melodyPath.length - 42);
}

/* ── 音声解析 ── */
let _freq = null, _wave = null;
function freqData(){
  const an = analyser(); if (!an) return null;
  if (!_freq || _freq.length !== an.frequencyBinCount) _freq = new Uint8Array(an.frequencyBinCount);
  an.getByteFrequencyData(_freq); return _freq;
}
function waveData(){
  const an = analyser(); if (!an) return null;
  if (!_wave || _wave.length !== an.fftSize) _wave = new Uint8Array(an.fftSize);
  an.getByteTimeDomainData(_wave); return _wave;
}
function getBands(){
  const f = freqData(); if (!f || !isPlaying()) return { bass: 0, mid: 0, treble: 0 };
  const avg = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += f[i]; return s / ((b - a) * 255); };
  return { bass: avg(1, 10), mid: avg(10, 90), treble: avg(90, 320) };
}
const sens = () => (+$('vizSens').value) / 100;
let _prevFreq = null, _fluxAvg = 0.02, _lastBurst = 0, fluxBurst = false, psychePulse = 0;
function detectFlux(now){
  if (!isPlaying() || !analyser()) return;
  const f = freqData(); if (!f) return;
  if (!_prevFreq || _prevFreq.length !== f.length) _prevFreq = new Float32Array(f.length);
  let flux = 0;
  const lim = Math.min(360, f.length);
  for (let i = 1; i < lim; i++){ const d = f[i] / 255 - _prevFreq[i]; if (d > 0) flux += d; _prevFreq[i] = f[i] / 255; }
  flux /= lim;
  _fluxAvg = _fluxAvg * 0.96 + flux * 0.04;
  if (flux > _fluxAvg * 2.1 + 0.004 && now - _lastBurst > 130){ _lastBurst = now; fluxBurst = true; psychePulse = 1; }
}

/* ── 共通描画ユーティリティ ── */
const trailsOn = () => $('vizTrail').classList.contains('on');
/* ALL 表示では 11 画面を同時描画するため、バッキングストアを 0.6 倍に落として
   描画ピクセル数を約 1/3 にする (描画座標は CSS px のまま不変、単体表示は等倍)。
   監査第3回の所見2への対応。 */
function vizScale(){ return (typeof currentView !== 'undefined' && currentView === 'all') ? 0.6 : 1; }
function fit(cv){
  const r = cv.getBoundingClientRect(), d = (window.devicePixelRatio || 1) * vizScale();
  const w = Math.round(r.width * d), h = Math.round(r.height * d);
  if (cv.width !== w || cv.height !== h){ cv.width = w; cv.height = h; }
  const x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
  return { x, W: r.width, H: r.height };
}
function rr(x, px, py, w, h, r){
  r = Math.min(r, h / 2, w / 2);
  x.beginPath();
  x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
}
const hexA = (hex, a) => hex + Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
function circleFrame(x, W, H, angleOf){
  const cx = W / 2, cy = H / 2, maxR = Math.min(W, H) / 2 - 30;
  x.lineWidth = 1;
  for (let pc = 0; pc < 12; pc++){
    const a = angleOf(pc);
    x.strokeStyle = 'rgba(255,255,255,.04)';
    x.beginPath(); x.moveTo(cx + Math.cos(a) * 28, cy + Math.sin(a) * 28); x.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR); x.stroke();
  }
  for (let o = 0; o <= 6; o++){
    x.strokeStyle = 'rgba(255,255,255,' + (o === 0 ? '.09' : '.05') + ')';
    x.beginPath(); x.arc(cx, cy, 30 + (o / 6) * (maxR - 30), 0, Math.PI * 2); x.stroke();
  }
  return { cx, cy, maxR };
}
function ringPos(n, W, H, angleOf){
  const cx = W / 2, cy = H / 2, maxR = Math.min(W, H) / 2 - 30;
  const a = angleOf(n.note % 12);
  const oct = Math.max(0, Math.min(6, Math.floor(n.note / 12) - 2));
  const r = 30 + (oct / 6) * (maxR - 30);
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, cx, cy };
}

/* ── 1 ROLL（静的レイヤーをオフスクリーンに焼き、再生ヘッドだけ毎フレーム） ── */
const KEYW = 30;
let rollStatic = null, rollStaticDirty = true, rollStaticKey = '';
function drawRollStatic(W, H){
  rollStatic = document.createElement('canvas');
  const d = (window.devicePixelRatio || 1) * vizScale();
  rollStatic.width = Math.round(W * d); rollStatic.height = Math.round(H * d);
  const x = rollStatic.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
  x.fillStyle = '#060607'; x.fillRect(0, 0, W, H);
  const plotW = W - KEYW, xOf = b => KEYW + (b / totalBeats) * plotW;
  const yOf = n => H - ((n - noteLo) / (noteHi - noteLo)) * (H - 16) - 8;
  const rowH = (H - 16) / (noteHi - noteLo);
  for (let b = 0; b <= totalBeats; b++){
    x.strokeStyle = b % 4 === 0 ? 'rgba(255,255,255,.09)' : 'rgba(255,255,255,.025)';
    x.beginPath(); x.moveTo(xOf(b), 0); x.lineTo(xOf(b), H); x.stroke();
    if (b % 4 === 0 && b < totalBeats){ x.fillStyle = 'rgba(255,255,255,.32)'; x.font = '8.5px Share Tech Mono'; x.fillText(String(b / 4 + 1), xOf(b) + 4, 11); }
  }
  for (let n = noteLo; n <= noteHi; n++){
    const pc = n % 12, black = [1, 3, 6, 8, 10].includes(pc), y = yOf(n);
    x.fillStyle = black ? '#111114' : '#1e1e24';
    x.fillRect(0, y - rowH / 2, KEYW - 3, Math.max(1.5, rowH - .6));
    if (pc === 0){ x.fillStyle = 'rgba(255,255,255,.38)'; x.font = '8px Share Tech Mono'; x.fillText('C' + (Math.floor(n / 12) - 1), 3, y + 2.5); }
  }
  for (const n of notes){
    const L = layerOf(n.ch), nx = xOf(n.start), nw = Math.max(3, xOf(n.start + n.dur) - nx), ny = yOf(n.note);
    x.fillStyle = hexA(L.color, 0.30 + (n.vel / 127) * 0.55);
    rr(x, nx, ny - 2.6, nw, 5.2, 2.6); x.fill();
  }
  rollStaticKey = W + 'x' + H;
}
function drawRoll(beat){
  const cv = $('vizCvRoll'); if (!cv.offsetParent) return;
  const { x, W, H } = fit(cv);
  if (rollStaticDirty || !rollStatic || rollStaticKey !== W + 'x' + H){ drawRollStatic(W, H); rollStaticDirty = false; }
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, cv.width, cv.height);
  x.drawImage(rollStatic, 0, 0); x.restore();
  const plotW = W - KEYW, xOf = b => KEYW + (b / totalBeats) * plotW;
  const yOf = n => H - ((n - noteLo) / (noteHi - noteLo)) * (H - 16) - 8;
  if (isPlaying()){
    for (const n of notes){
      if (beat >= n.start && beat <= n.start + n.dur){
        const nx = xOf(n.start), nw = Math.max(3, xOf(n.start + n.dur) - nx);
        x.fillStyle = '#ffffff'; rr(x, nx, yOf(n.note) - 3.4, nw, 6.8, 3.4); x.fill();
      }
    }
    const px = xOf(beat);
    x.fillStyle = 'rgba(255,255,255,.045)'; x.fillRect(px - 20, 0, 20, H);
    x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(px - .5, 0, 1, H);
  }
}

/* ── 2 ORBIT ── */
let rot = 0;
const orbitAngle = pc => (pc / 12) * Math.PI * 2 - Math.PI / 2 + rot;
function orbitPos(n, W, H){ return ringPos(n, W, H, orbitAngle); }
function drawOrbit(W, H, beat){
  const cv = $('vizCvOrbit'); if (!cv.offsetParent) return;
  const { x } = fit(cv);
  if (trailsOn()){ x.fillStyle = 'rgba(6,6,7,.22)'; x.fillRect(0, 0, W, H); } else x.clearRect(0, 0, W, H);
  const { cx, cy, maxR } = circleFrame(x, W, H, orbitAngle);
  x.fillStyle = 'rgba(255,255,255,.5)'; x.font = '10px Share Tech Mono'; x.textAlign = 'center';
  NN.forEach((nm, pc) => { const a = orbitAngle(pc), R = maxR + 15; x.fillText(nm, cx + Math.cos(a) * R, cy + Math.sin(a) * R + 3.5); });
  x.textAlign = 'left';
  const act = isPlaying() ? notes.filter(n => beat >= n.start && beat <= n.start + n.dur) : [];
  if (act.length >= 3){
    const pts = act.map(n => orbitPos(n, W, H));
    x.beginPath();
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length], mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      const vx = mx - cx, vy = my - cy, d = Math.hypot(vx, vy) || 1, pull = 0.36;
      const cpx = mx - (vx / d) * d * pull, cpy = my - (vy / d) * d * pull;
      if (i === 0) x.moveTo(p.x, p.y); x.quadraticCurveTo(cpx, cpy, q.x, q.y);
    });
    x.closePath(); x.fillStyle = 'rgba(255,255,255,.032)'; x.fill();
    x.strokeStyle = 'rgba(255,255,255,.30)'; x.lineWidth = 1; x.stroke();
  } else if (act.length === 2){
    const [p, q] = act.map(n => orbitPos(n, W, H));
    x.strokeStyle = 'rgba(255,255,255,.30)'; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.stroke();
  }
  for (let i = ripples.length - 1; i >= 0; i--){
    const r = ripples[i]; r.r += 1.15; r.life -= 0.014;
    if (r.life <= 0){ ripples.splice(i, 1); continue; }
    x.strokeStyle = hexA(r.color, r.life * 0.32); x.lineWidth = 1;
    x.beginPath(); x.arc(r.x, r.y, r.r, 0, Math.PI * 2); x.stroke();
  }
  for (let i = particles.length - 1; i >= 0; i--){
    const p = particles[i];
    p.x += Math.cos(p.a) * p.sp * 0.016; p.y += Math.sin(p.a) * p.sp * 0.016; p.sp *= 0.985; p.life -= p.decay;
    if (p.life <= 0){ particles.splice(i, 1); continue; }
    x.fillStyle = hexA(p.color, p.life * 0.4);
    x.beginPath(); x.arc(p.x, p.y, p.size * p.life + 0.3, 0, Math.PI * 2); x.fill();
  }
  for (const n of act){
    const p = orbitPos(n, W, H), L = layerOf(n.ch);
    const pulse = 1 + Math.exp(-(beat - n.start) * 2.4) * 0.55, rad = (3 + n.vel / 22) * pulse;
    x.strokeStyle = hexA(L.color, .5); x.lineWidth = 1;
    x.beginPath(); x.arc(p.x, p.y, rad + 3.5, 0, Math.PI * 2); x.stroke();
    x.fillStyle = L.color; x.beginPath(); x.arc(p.x, p.y, rad, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#0a0a0b'; x.beginPath(); x.arc(p.x, p.y, Math.max(1, rad * 0.3), 0, Math.PI * 2); x.fill();
  }
  x.fillStyle = 'rgba(255,255,255,.9)'; x.font = '700 11px Orbitron, sans-serif'; x.textAlign = 'center';
  x.fillText('MEIKYOSHISUI', cx, cy + 1);
  x.fillStyle = 'rgba(255,255,255,.32)'; x.font = '8.5px Share Tech Mono';
  x.fillText(isPlaying() ? act.length + ' VOICES' : 'STILL WATER', cx, cy + 15);
  x.textAlign = 'left';
  $('vizOrbitInfo').textContent = isPlaying() ? ([...new Set(act.map(n => NN[n.note % 12]))].join(' · ') || '—') : '停止中 — ゆっくり回っています';
}

/* ── 3 FIFTHS ── */
const fifthsAngle = pc => (((pc * 7) % 12) / 12) * Math.PI * 2 - Math.PI / 2 + rot;
function drawFifths(W, H, beat, now){
  const cv = $('vizCvFifths'); if (!cv.offsetParent) return;
  const { x } = fit(cv);
  x.clearRect(0, 0, W, H);
  const { cx, cy, maxR } = circleFrame(x, W, H, fifthsAngle);
  x.fillStyle = 'rgba(255,255,255,.5)'; x.font = '10px Share Tech Mono'; x.textAlign = 'center';
  for (let pc = 0; pc < 12; pc++){ const a = fifthsAngle(pc), R = maxR + 15; x.fillText(NN[pc], cx + Math.cos(a) * R, cy + Math.sin(a) * R + 3.5); }
  x.textAlign = 'left';
  const alive = melodyPath.filter(m => now - m.t0 < 9000);
  if (alive.length > 1){
    for (let i = 1; i < alive.length; i++){
      const age = (now - alive[i].t0) / 9000, p = ringPos(alive[i - 1].n, W, H, fifthsAngle), q = ringPos(alive[i].n, W, H, fifthsAngle);
      x.strokeStyle = 'rgba(255,255,255,' + (0.55 * (1 - age)) + ')'; x.lineWidth = 1.4 - age;
      x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.stroke();
    }
  }
  for (const m of alive){
    const age = (now - m.t0) / 9000, p = ringPos(m.n, W, H, fifthsAngle);
    x.fillStyle = hexA(layerOf(m.n.ch).color, 0.9 * (1 - age));
    x.beginPath(); x.arc(p.x, p.y, 2.6, 0, Math.PI * 2); x.fill();
  }
  const act = isPlaying() ? notes.filter(n => beat >= n.start && beat <= n.start + n.dur) : [];
  for (const n of act){
    const p = ringPos(n, W, H, fifthsAngle), L = layerOf(n.ch);
    x.strokeStyle = hexA(L.color, .55); x.lineWidth = 1;
    x.beginPath(); x.arc(p.x, p.y, 6.5, 0, Math.PI * 2); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(p.x, p.y, 3, 0, Math.PI * 2); x.fill();
  }
  x.fillStyle = 'rgba(255,255,255,.9)'; x.font = '700 11px Orbitron, sans-serif'; x.textAlign = 'center';
  x.fillText('CIRCLE OF FIFTHS', cx, cy + 1);
  x.fillStyle = 'rgba(255,255,255,.32)'; x.font = '8.5px Share Tech Mono';
  x.fillText(isPlaying() ? act.length + ' VOICES' : 'STILL WATER', cx, cy + 15);
  x.textAlign = 'left';
  $('vizFifthsInfo').textContent = alive.length ? '軌跡 ' + alive.length + ' 音' : '—';
}

/* ── 4 SURFACE ── */
function drawSurface(now){
  const cv = $('vizCvSurface'); if (!cv.offsetParent) return;
  const { x, W, H } = fit(cv);
  x.clearRect(0, 0, W, H);
  const rows = presentChs.length ? presentChs : [0];
  const rowH = H / rows.length, xOf = note => ((note - 24) / (96 - 24)) * (W - 92) + 80;
  rows.forEach((ch, i) => {
    const y = i * rowH;
    x.strokeStyle = 'rgba(255,255,255,.05)'; x.beginPath(); x.moveTo(0, y + rowH); x.lineTo(W, y + rowH); x.stroke();
    x.fillStyle = 'rgba(255,255,255,.42)'; x.font = '9px Share Tech Mono'; x.fillText(layerOf(ch).name.toUpperCase(), 8, y + rowH / 2 + 3);
  });
  for (let m = 36; m <= 84; m += 12){
    x.fillStyle = 'rgba(255,255,255,.28)'; x.font = '8px Share Tech Mono';
    x.fillText('C' + (Math.floor(m / 12) - 1), xOf(m) - 4, H - 4);
  }
  let aliveCount = 0;
  for (const r of surfaceRings){
    const age = Math.max(0, (now - r.t0) / 1000); if (age > 3) continue; aliveCount++;
    const row = Math.max(0, rows.indexOf(r.n.ch));
    const px = xOf(r.n.note), py = (row + 0.5) * rowH;
    const rad = 3 + age * 52 * (0.7 + 0.45 * sens()), a = Math.max(0, 1 - age / 3);
    x.strokeStyle = hexA(layerOf(r.n.ch).color, a * 0.4); x.lineWidth = 1;
    x.beginPath(); x.arc(px, py, rad, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = hexA(layerOf(r.n.ch).color, a * 0.16);
    x.beginPath(); x.arc(px, py, rad * 0.62, 0, Math.PI * 2); x.stroke();
    if (age < 0.4){ x.fillStyle = hexA(layerOf(r.n.ch).color, 0.9 * (1 - age / 0.4)); x.beginPath(); x.arc(px, py, 2.4, 0, Math.PI * 2); x.fill(); }
  }
  for (let i = surfaceRings.length - 1; i >= 0; i--) if (now - surfaceRings[i].t0 > 3000) surfaceRings.splice(i, 1);
  $('vizSurfaceInfo').textContent = aliveCount ? aliveCount + ' RIPPLES' : '—';
}

/* ── 5 SPECTRUM ── */
const NB = 64; let barsSm = new Float32Array(NB), peaks = new Float32Array(NB);
function drawSpec(){
  const cv = $('vizCvSpec'); if (!cv.offsetParent) return;
  const { x, W, H } = fit(cv); x.clearRect(0, 0, W, H);
  const specH = H * 0.64;
  if (!analyser()){ x.fillStyle = 'rgba(255,255,255,.3)'; x.font = '10.5px Share Tech Mono'; x.fillText('PREVIEW再生で実音声を表示します', 12, 22); return; }
  const freq = freqData(), bw = W / NB, gain = 0.55 + 0.55 * sens();
  const g = x.createLinearGradient(0, specH, 0, 6);
  g.addColorStop(0, '#43434c'); g.addColorStop(1, '#dcdce2');
  for (let i = 0; i < NB; i++){
    const target = isPlaying() ? Math.min(1, freq[Math.floor(Math.pow(i / NB, 1.6) * freq.length * 0.72)] / 255 * gain) : 0;
    barsSm[i] += (target - barsSm[i]) * (target > barsSm[i] ? 0.8 : 0.16);
    peaks[i] = Math.max(peaks[i] - 0.0035, barsSm[i]);
    const v = barsSm[i], bh = Math.max(1.5, v * (specH - 14)), bx = i * bw + 1.6, by = specH - bh;
    x.fillStyle = g; rr(x, bx, by, bw - 3.2, bh, 2.4); x.fill();
    if (peaks[i] > 0.02){ x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(bx, specH - peaks[i] * (specH - 14) - 5, bw - 3.2, 1.6); }
  }
  const wave = waveData(), wy = H * 0.84, amp = H * 0.115, step = 6;
  x.beginPath();
  let first = true;
  for (let i = 0; i < wave.length; i += step){
    const px = (i / wave.length) * W, py = wy + ((wave[i] - 128) / 128) * amp;
    if (first){ x.moveTo(px, py); first = false; } else {
      const prevX = ((i - step) / wave.length) * W, prevY = wy + ((wave[i - step] - 128) / 128) * amp;
      x.quadraticCurveTo(prevX, prevY, (prevX + px) / 2, (prevY + py) / 2);
    }
  }
  x.strokeStyle = 'rgba(232,232,238,.85)'; x.lineWidth = 1.2; x.stroke();
  let peak = 0; for (const v of freq) peak = Math.max(peak, v);
  $('vizSpecInfo').textContent = isPlaying() ? 'PEAK ' + Math.round(peak / 255 * 100) + '%' : '—';
}

/* ── 6 SPECTROGRAM ── */
const SG_BINS = 56, SG_MAX = 220, sgCols = [];
let sgLastPush = 0;
function drawSg(now){
  const cv = $('vizCvSg'); if (!cv.offsetParent) return;
  const { x, W, H } = fit(cv);
  x.clearRect(0, 0, W, H);
  if (isPlaying() && analyser() && now - sgLastPush > 85){
    sgLastPush = now;
    const f = freqData(), col = new Float32Array(SG_BINS);
    for (let i = 0; i < SG_BINS; i++) col[i] = f[Math.floor(Math.pow(i / SG_BINS, 1.5) * f.length * 0.72)] / 255;
    sgCols.push(col); if (sgCols.length > SG_MAX) sgCols.shift();
  }
  const colW = W / SG_MAX, binH = H / SG_BINS;
  sgCols.forEach((col, ci) => {
    const px = W - (sgCols.length - ci) * colW;
    for (let i = 0; i < SG_BINS; i++){
      const v = col[i]; if (v < 0.03) continue;
      x.fillStyle = 'rgba(255,255,255,' + (v * 0.9) + ')';
      x.fillRect(px, H - (i + 1) * binH, Math.max(1, colW - 0.4), binH - 0.4);
    }
  });
  if (!sgCols.length){ x.fillStyle = 'rgba(255,255,255,.3)'; x.font = '10.5px Share Tech Mono'; x.fillText('PREVIEW再生で右から流れ込みます', 12, 22); }
  $('vizSgInfo').textContent = sgCols.length ? (sgCols.length * 0.085).toFixed(1) + ' SEC' : '—';
}

/* ── 7 POLAR ── */
const PB = 72; let polarSm = new Float32Array(PB);
function drawPolar(){
  const cv = $('vizCvPolar'); if (!cv.offsetParent) return;
  const { x, W, H } = fit(cv);
  x.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2, maxR = Math.min(W, H) / 2 - 14, r0 = 20;
  x.strokeStyle = 'rgba(255,255,255,.07)';
  [0.33, 0.66, 1].forEach(k => { x.beginPath(); x.arc(cx, cy, r0 + (maxR - r0) * k, 0, Math.PI * 2); x.stroke(); });
  const f = analyser() ? freqData() : null, gain = 0.55 + 0.55 * sens();
  let peak = 0;
  for (let i = 0; i < PB; i++){
    const target = (isPlaying() && f) ? Math.min(1, f[Math.floor(Math.pow(i / PB, 1.5) * f.length * 0.72)] / 255 * gain) : 0;
    polarSm[i] += (target - polarSm[i]) * (target > polarSm[i] ? 0.85 : 0.14);
    peak = Math.max(peak, polarSm[i]);
    const a = (i / PB) * Math.PI * 2 - Math.PI / 2, v = polarSm[i], r1 = r0 + v * (maxR - r0);
    x.strokeStyle = 'rgba(255,255,255,' + (0.18 + v * 0.75) + ')'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); x.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); x.stroke();
    if (v > 0.45){ x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.arc(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, 1.8, 0, Math.PI * 2); x.fill(); }
  }
  x.fillStyle = 'rgba(255,255,255,.35)'; x.font = '8.5px Share Tech Mono'; x.textAlign = 'center';
  x.fillText('POLAR', cx, cy + 3); x.textAlign = 'left';
  $('vizPolarInfo').textContent = isPlaying() ? 'PEAK ' + Math.round(peak * 100) + '%' : '—';
}

/* ── 8 FLOW ── */
const flowPts = [];
function drawFlow(now){
  const cv = $('vizCvFlow'); if (!cv.offsetParent) return;
  const { x, W, H } = fit(cv);
  x.fillStyle = 'rgba(6,6,7,.06)'; x.fillRect(0, 0, W, H);
  const bands = getBands(), t = now * 0.001;
  const speed = (14 + bands.bass * 130) * (0.55 + 0.55 * sens()), curl = 1.1 + bands.treble * 2.4;
  if (!flowPts.length) for (let i = 0; i < 240; i++) flowPts.push({ x: rng() * W, y: rng() * H, life: rng() });
  for (const p of flowPts){
    const a = (Math.sin(p.x * 0.008 + t * 0.24) + Math.cos(p.y * 0.010 - t * 0.17)) * curl;
    const nx = p.x + Math.cos(a) * speed * 0.016, ny = p.y + Math.sin(a) * speed * 0.016;
    x.strokeStyle = 'rgba(255,255,255,' + (0.13 + bands.mid * 0.38) * Math.min(1, p.life * 2) + ')';
    x.lineWidth = 1;
    x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(nx, ny); x.stroke();
    p.x = nx; p.y = ny; p.life -= 0.004;
    if (p.life <= 0 || p.x < -8 || p.x > W + 8 || p.y < -8 || p.y > H + 8){ p.x = rng() * W; p.y = rng() * H; p.life = 0.7 + rng() * 0.5; }
  }
  $('vizFlowInfo').textContent = isPlaying() ? 'BASS ' + Math.round(bands.bass * 100) + '% · TREBLE ' + Math.round(bands.treble * 100) + '%' : '静か — 音で流れます';
}

/* ── 9 PHASE ── */
function drawPhase(){
  const cv = $('vizCvPhase'); if (!cv.offsetParent) return;
  const { x, W, H } = fit(cv);
  x.fillStyle = 'rgba(6,6,7,.16)'; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(255,255,255,.06)';
  x.beginPath(); x.moveTo(W / 2, 6); x.lineTo(W / 2, H - 6); x.moveTo(6, H / 2); x.lineTo(W - 6, H / 2); x.stroke();
  if (!analyser() || !isPlaying()){
    x.fillStyle = 'rgba(255,255,255,.3)'; x.font = '10.5px Share Tech Mono'; x.fillText('PREVIEW再生で軌跡が残ります', 12, 22);
    $('vizPhaseInfo').textContent = '—'; return;
  }
  const w = waveData(), delay = 28, cx = W / 2, cy = H / 2, sx = W * 0.44, sy = H * 0.44;
  x.fillStyle = 'rgba(255,255,255,.55)';
  for (let i = 0; i + delay < w.length; i += 5){
    const px = cx + ((w[i] - 128) / 128) * sx, py = cy + ((w[i + delay] - 128) / 128) * sy;
    x.fillRect(px, py, 1.6, 1.6);
  }
  $('vizPhaseInfo').textContent = 'x[t] × x[t−28]';
}

/* ── 10 PARTICLE ── */
const pvParticles = [];
let pvAcc = 0;
function pvSpawn(px, py, vx, vy, life, col, size){
  if (pvParticles.length > 720) pvParticles.splice(0, pvParticles.length - 720);
  pvParticles.push({ x: px, y: py, vx, vy, life: 1, decay: 1 / (life * 60), col, size });
}
function drawParticle(){
  const cv = $('vizCvParticle'); if (!cv.offsetParent) return;
  const { x, W, H } = fit(cv);
  x.fillStyle = 'rgba(6,6,7,.30)'; x.fillRect(0, 0, W, H);
  const bands = getBands(), level = (bands.bass + bands.mid + bands.treble) / 3, s = sens();
  if (isPlaying()){
    pvAcc += (0.35 + level * 7) * s;
    while (pvAcc >= 1){
      pvAcc -= 1;
      pvSpawn(rng() * W, H + 4, (rng() - 0.5) * 0.25, -(0.55 + rng() * 1.1 + level * 1.6 * s), 1.6 + rng() * 2.2, '#c9c9d2', 0.8 + rng() * 1.2);
    }
    for (const n of pvBursts){
      const bx = ((n.note - 24) / (96 - 24)) * W * 0.88 + W * 0.06, by = H * 0.56, cnt = Math.round(4 + 3 * s);
      for (let i = 0; i < cnt; i++){
        const a = rng() * Math.PI * 2, sp = (0.35 + rng() * 1.5) * (0.6 + 0.5 * s);
        pvSpawn(bx, by, Math.cos(a) * sp, Math.sin(a) * sp - 0.3, 0.9 + rng() * 1.4, layerOf(n.ch).color, 0.9 + rng() * 1.5);
      }
    }
    if (fluxBurst){
      for (let i = 0; i < Math.round(9 * s); i++){
        const a = rng() * Math.PI * 2, sp = 0.5 + rng() * 1.9 * s;
        pvSpawn(W / 2, H / 2, Math.cos(a) * sp, Math.sin(a) * sp, 1 + rng() * 1.2, '#f2f2f5', 1 + rng() * 1.4);
      }
    }
  }
  pvBursts.length = 0;
  for (let i = pvParticles.length - 1; i >= 0; i--){
    const p = pvParticles[i];
    const ox = p.x, oy = p.y;
    p.vy -= 0.0035; p.vx += (rng() - 0.5) * bands.treble * 0.05;
    p.x += p.vx; p.y += p.vy; p.life -= p.decay;
    if (p.life <= 0 || p.y < -12 || p.x < -12 || p.x > W + 12){ pvParticles.splice(i, 1); continue; }
    x.strokeStyle = hexA(p.col, p.life * 0.65); x.lineWidth = p.size;
    x.beginPath(); x.moveTo(ox, oy); x.lineTo(p.x, p.y); x.stroke();
    x.fillStyle = hexA(p.col, p.life * 0.85);
    x.beginPath(); x.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2); x.fill();
  }
  if (!isPlaying() && !pvParticles.length){ x.fillStyle = 'rgba(255,255,255,.3)'; x.font = '10.5px Share Tech Mono'; x.fillText('PREVIEW再生で粒子が湧きます', 12, 22); }
  $('vizParticleInfo').textContent = pvParticles.length ? pvParticles.length + ' PARTICLES' : '—';
}

/* ── 11 PSYCHE ── */
function drawPsyche(now, beat){
  const cv = $('vizCvPsyche'); if (!cv.offsetParent) return;
  const { x, W, H } = fit(cv);
  const bands = getBands(), level = (bands.bass + bands.mid + bands.treble) / 3, s = sens();
  const zoom = 1.010 + level * 0.055 * s + psychePulse * 0.035;
  x.save();
  x.translate(W / 2, H / 2); x.rotate(0.0016 * (0.4 + s * 0.6) * (0.5 + level * 2)); x.scale(zoom, zoom); x.translate(-W / 2, -H / 2);
  x.drawImage(cv, 0, 0, W, H);
  x.restore();
  x.fillStyle = 'rgba(6,6,7,.09)'; x.fillRect(0, 0, W, H);
  psychePulse *= 0.94;
  const cx = W / 2, cy = H / 2, baseR = Math.min(W, H) * 0.34 * (1 + psychePulse * 0.10);
  const f = analyser() ? freqData() : null;
  const act = isPlaying() ? notes.filter(n => beat >= n.start && beat <= n.start + n.dur) : [];
  const motif = () => {
    for (let i = 0; i < 36; i++){
      const a = (i / 36) * Math.PI * 2;
      const fv = (isPlaying() && f) ? f[Math.floor(Math.pow(i / 36, 1.4) * f.length * 0.7)] / 255 : 0.16 + 0.10 * Math.sin(now * 0.001 + i * 0.7);
      const r = baseR * 0.22 + fv * baseR * 0.30 * (0.6 + 0.5 * s);
      x.fillStyle = 'rgba(255,255,255,' + (0.25 + fv * 0.6) + ')';
      x.beginPath(); x.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.3 + fv * 1.6, 0, Math.PI * 2); x.fill();
    }
    const pts = act.map(n => {
      const a = (n.note % 12) / 12 * Math.PI * 2 + rot * 2;
      const oct = Math.max(0, Math.min(6, Math.floor(n.note / 12) - 2));
      const r = baseR * (0.42 + (oct / 6) * 0.55);
      return { px: cx + Math.cos(a) * r, py: cy + Math.sin(a) * r, n };
    });
    if (pts.length > 1){
      x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 1;
      x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p.px, p.py) : x.moveTo(p.px, p.py)); x.closePath(); x.stroke();
    }
    for (const p of pts){
      x.fillStyle = layerOf(p.n.ch).color;
      x.beginPath(); x.arc(p.px, p.py, 2.4 + p.n.vel / 40, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#060607'; x.beginPath(); x.arc(p.px, p.py, 1, 0, Math.PI * 2); x.fill();
    }
  };
  const SEG = 8;
  for (let sg = 0; sg < SEG; sg++){
    x.save(); x.translate(cx, cy); x.rotate(sg * Math.PI / 4 + rot * 1.5);
    if (sg % 2) x.scale(1, -1);
    x.translate(-cx, -cy); motif(); x.restore();
  }
  $('vizPsycheInfo').textContent = isPlaying() ? (psychePulse > 0.35 ? 'PULSE' : act.length + ' VOICES · KALEIDOSCOPE') : 'KALEIDOSCOPE — 再生で回り出す';
}

/* ── メインループ ── */
function loop(now){
  frame++;
  if (frame % 20 === 0) rebuild();
  const playing = isPlaying(), beat = playing ? elapsedSec() / spb() : -1;
  if (playing){
    if (beat < _prevBeat - 0.5) { _prevBeat = beat - 0.001; } /* シークで戻ったら追随 */
    for (const n of notes) if (n.start > _prevBeat && n.start <= beat) onOnset(n);
    _prevBeat = beat;
    rot += 0.00045;
  } else { rot += 0.00013; _prevBeat = -1; }
  drawRoll(beat);
  const ocv = $('vizCvOrbit'); const r2 = ocv.getBoundingClientRect();
  drawOrbit(r2.width || 800, r2.height || 360, beat);
  const fcv = $('vizCvFifths'); const r3 = fcv.getBoundingClientRect();
  drawFifths(r3.width || 800, r3.height || 340, beat, now);
  drawSurface(now);
  drawSpec();
  /* 重い3種 (自己コピーのスペクトログラム/フロー、フィードバックのサイケ) は
     ALL 表示でのみ 1 フレームおきに交互更新し、毎フレームの負荷を平らにする */
  const heavyAlt = currentView === 'all';
  if (!heavyAlt || frame % 2 === 0) drawSg(now);
  drawPolar();
  if (!heavyAlt || frame % 2 === 0) drawFlow(now);
  drawPhase();
  detectFlux(now);
  drawParticle();
  if (!heavyAlt || frame % 2 === 1) drawPsyche(now, beat);
  fluxBurst = false;
  requestAnimationFrame(loop);
}

/* ── UI：表示選択（保存つき） ── */
const VIEW_ORDER = ['roll','orbit','fifths','surface','spec','sg','polar','flow','phase'];
const LS_KEY = 'meikyoshisui_viz_v1';
let currentView = 'all';
function savePref(){
  try { localStorage.setItem(LS_KEY, JSON.stringify({ view: currentView, trails: trailsOn(), sens: +$('vizSens').value })); } catch(e){}
}
function clearFxCanvases(){
  ['vizCvOrbit','vizCvFlow','vizCvPhase','vizCvParticle','vizCvPsyche'].forEach(id => {
    const cv = $(id); if (!cv) return;
    const x = cv.getContext('2d'); x.save(); x.setTransform(1,0,0,1,0,0); x.clearRect(0, 0, cv.width, cv.height); x.restore();
  });
}
function applyView(v){
  currentView = v;
  panel.querySelectorAll('.viz-vbtn').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  $('vizPanels').classList.toggle('all', v === 'all');
  panel.querySelectorAll('[data-panel]').forEach(p => p.classList.toggle('show', v === 'all' || p.dataset.panel === v));
  rollStaticDirty = true;
  clearFxCanvases();
  savePref();
}
const VT_OK = typeof document.startViewTransition === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function setView(v){
  if (VT_OK && v !== currentView) document.startViewTransition(() => applyView(v));
  else applyView(v);
}
panel.querySelectorAll('.viz-vbtn').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
$('vizTrail').addEventListener('click', e => { e.currentTarget.classList.toggle('on'); savePref(); });
$('vizSens').addEventListener('input', e => {
  $('vizSensV').textContent = '×' + (e.target.value / 100).toFixed(1);
  savePref();
});
$('vizFull').addEventListener('click', () => {
  document.fullscreenElement ? document.exitFullscreen() : panel.requestFullscreen && panel.requestFullscreen();
});
$('vizPng').addEventListener('click', () => {
  const src = panel.querySelector('[data-panel].show canvas'); if (!src) return;
  src.toBlob(async blob => {
    if (!blob) return;
    if (window.__MEIKY_SAVE__) { await window.__MEIKY_SAVE__.saveBlob(blob, 'meikyoshisui-visualizer.png'); return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'meikyoshisui-visualizer.png'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
});
/* ── Document Picture-in-Picture（対応時のみボタン表示） ── */
const pipBtn = $('vizPip');
if (pipBtn && 'documentPictureInPicture' in window){
  pipBtn.style.display = '';
  const placeholder = document.createElement('div');
  placeholder.id = 'vizPipPlaceholder'; placeholder.style.display = 'none';
  panel.before(placeholder);
  let pipWin = null;
  pipBtn.addEventListener('click', async () => {
    if (pipWin){ pipWin.close(); return; }
    try {
      pipWin = await window.documentPictureInPicture.requestWindow({ width: 920, height: 660 });
      const doc = pipWin.document;
      doc.addEventListener('keydown', vizKeys);
      doc.body.style.cssText = 'margin:0;background:#080809;font-family:\'Share Tech Mono\',monospace;';
      panel.style.display = '';
      doc.body.appendChild(panel);
      pipWin.addEventListener('pagehide', () => {
        placeholder.after(panel);
        pipWin = null;
        rollStaticDirty = true;
      });
    } catch (e) { pipWin = null; }
  });
}
$('vizCvRoll').addEventListener('click', e => {
  if (!notes.length || typeof MidiPreview.seek !== 'function') return;
  const cv = e.currentTarget, r = cv.getBoundingClientRect();
  const beat = Math.max(0, Math.min(totalBeats - 0.05, ((e.clientX - r.left - KEYW) / (r.width - KEYW)) * totalBeats));
  const dur = MidiPreview.getDuration ? MidiPreview.getDuration() : 0;
  if (dur > 0) MidiPreview.seek(Math.min(0.999, (beat * spb()) / dur));
});
function vizKeys(e){
  if (panel.style.display === 'none') return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  if (e.key >= '1' && e.key <= '9') setView(VIEW_ORDER[+e.key - 1]);
  else if (e.key === '0') setView('all');
  else if (e.key === 'q' || e.key === 'Q') setView('particle');
  else if (e.key === 'w' || e.key === 'W') setView('psyche');
}
document.addEventListener('keydown', vizKeys);
/* 保存された表示を復元（なければ全部表示） */
(function restore(){
  try {
    const p = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (p){
      if (p.trails === false) $('vizTrail').classList.remove('on');
      if (p.view && (p.view === 'all' || p.view === 'particle' || p.view === 'psyche' || VIEW_ORDER.includes(p.view))) currentView = p.view;
      if (p.sens){ $('vizSens').value = p.sens; $('vizSensV').textContent = '×' + (p.sens / 100).toFixed(1); }
    }
  } catch(e){}
})();
rebuild();
setView(currentView);
requestAnimationFrame(loop);
})();
