#!/usr/bin/env node
/*
 * noise-cli.mjs — headless renderer for noise.html (VM / server use)
 *
 * Extracts the exact DSP + export code from noise.html in the same directory
 * and renders WAV/AIFF from a preset or session JSON, with the same two-pass
 * normalize + export-safety + loop-crossfade behaviour as the browser page.
 * This lets an AI agent / VM job generate the same sounds without a browser.
 *
 * Usage:
 *   node noise-cli.mjs --list                       list presets
 *   node noise-cli.mjs --types                      list noise types
 *   node noise-cli.mjs --preset "Sleep: Delta Binaural" --duration 600 --rate 22050 --out sleep.wav
 *   node noise-cli.mjs --session session.json --out out.wav
 *   node noise-cli.mjs --preset "Mountain Stream" --set master_loopFade=3 --set A_gain=0.7 --out stream.wav
 *
 * Options:
 *   --preset <name>     preset name (see --list)
 *   --session <file>    session JSON exported from the page (overrides preset)
 *   --set key=value     override any parameter (repeatable)
 *   --duration <sec>    override master_duration (5..1800)
 *   --rate <hz>         override master_exportSampleRate (22050..192000)
 *   --out <file>        output file (default: noise_out.wav)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(here, 'noise.html');
if (!fs.existsSync(htmlPath)) {
  console.error('noise.html not found next to noise-cli.mjs');
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.error('script block not found in noise.html'); process.exit(1); }
const src = m[1];

function braceBlock(s, startIdx) {
  const i = s.indexOf('{', startIdx);
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}') { depth--; if (depth === 0) return s.slice(startIdx, j + 1); }
  }
  throw new Error('unbalanced braces');
}

const parts = [];
// header consts (TAU, clamp, ... SESSION_KEY)
parts.push(src.slice(src.indexOf('const TAU'), src.indexOf('let autosaveTimer = 0;') + 'let autosaveTimer = 0;'.length));
// NOISE_TYPES .. MASTER_SCHEMA (includes DEFAULTS, PRESETS, LAYER_SCHEMA)
parts.push(src.slice(src.indexOf('const NOISE_TYPES'), src.indexOf('const MASTER_SCHEMA')));
// getExport* helpers .. class RNG (RNG rides along in this span)
parts.push(src.slice(src.indexOf('function getExportFormat'), src.indexOf('function normalizeParams')));
parts.push(braceBlock(src, src.indexOf('function normalizeParams')));
// DSP span: lp .. renderBlock
{
  const a = src.indexOf('function lp(');
  const rb = src.indexOf('function renderBlock(');
  parts.push(src.slice(a, rb) + braceBlock(src, rb));
}
// export span: initExportSafetyState .. encodeAudioChunked
{
  const a = src.indexOf('function initExportSafetyState');
  const enc = src.indexOf('function encodeAudioChunked');
  parts.push(src.slice(a, enc) + braceBlock(src, enc));
}

const epilogue = `
;globalThis.__api = { DEFAULTS, PRESETS, NOISE_TYPES, normalizeParams, scanPeakStreamed, scanLoudnessStreamed, encodeAudioChunked, getExportTargetPeakAmp };
`;
if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
}
const factory = new Function(parts.join('\n') + epilogue + '\nreturn globalThis.__api;');
const api = factory();

function parseArgs(argv) {
  const out = { set: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--list') out.list = true;
    else if (a === '--types') out.types = true;
    else if (a === '--preset') out.preset = argv[++i];
    else if (a === '--session') out.session = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--duration') out.duration = Number(argv[++i]);
    else if (a === '--rate') out.rate = Number(argv[++i]);
    else if (a === '--set') out.set.push(argv[++i]);
    else if (a === '--help' || a === '-h') out.help = true;
    else { console.error('unknown arg:', a); process.exit(1); }
  }
  return out;
}

const args = parseArgs(process.argv);
if (args.help) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 26).join('\n')); process.exit(0); }
if (args.list) { console.log(Object.keys(api.PRESETS).join('\n')); process.exit(0); }
if (args.types) { console.log(api.NOISE_TYPES.map(([id, label]) => `${id}\t${label}`).join('\n')); process.exit(0); }

let params;
if (args.session) {
  const obj = JSON.parse(fs.readFileSync(args.session, 'utf8'));
  params = { ...api.DEFAULTS, ...(obj.params || obj) };
} else if (args.preset) {
  if (!api.PRESETS[args.preset]) {
    console.error('preset not found:', args.preset);
    console.error('see: node noise-cli.mjs --list');
    process.exit(1);
  }
  params = { ...api.PRESETS[args.preset] };
} else {
  params = { ...api.DEFAULTS };
}
for (const kv of args.set) {
  const eq = kv.indexOf('=');
  if (eq < 0) { console.error('bad --set (need key=value):', kv); process.exit(1); }
  const key = kv.slice(0, eq);
  const raw = kv.slice(eq + 1);
  if (!(key in api.DEFAULTS)) { console.error('unknown parameter:', key); process.exit(1); }
  const def = api.DEFAULTS[key];
  params[key] = typeof def === 'boolean' ? (raw === 'true' || raw === '1') : typeof def === 'number' ? Number(raw) : raw;
}
if (Number.isFinite(args.duration)) params.master_duration = args.duration;
if (Number.isFinite(args.rate)) params.master_exportSampleRate = args.rate;
params = api.normalizeParams(params);

const outFile = args.out || 'noise_out.wav';
const token = { cancelled: false };
let lastPct = -1;
const progress = (done, total, pass) => {
  const pct = Math.floor((done / total) * 100);
  if (pct !== lastPct && pct % 10 === 0) { lastPct = pct; console.log(`pass ${pass}: ${pct}%`); }
};

const loudTarget = Number(params.master_exportLoudness) || 0;
let normalizeGain = 1;
let peak = 0;
if (params.master_normalize || loudTarget) {
  const scan = await api.scanLoudnessStreamed(params, token, (d, t) => progress(d, t, 1));
  peak = scan.peak;
  const targetPeak = api.getExportTargetPeakAmp(params);
  let gPeak = null;
  let gLoud = null;
  if (params.master_normalize && scan.peak > 0.000001) gPeak = Math.min(targetPeak / scan.peak, 8);
  if (loudTarget && Number.isFinite(scan.rmsDb)) {
    gLoud = Math.pow(10, (loudTarget - scan.rmsDb) / 20);
    if (scan.peak > 0.000001) gLoud = Math.min(gLoud, targetPeak / scan.peak);
    gLoud = Math.min(gLoud, 8);
  }
  if (gPeak !== null && gLoud !== null) normalizeGain = Math.min(gPeak, gLoud);
  else if (gPeak !== null) normalizeGain = gPeak;
  else if (gLoud !== null) normalizeGain = gLoud;
}
if (!params.master_normalize && !loudTarget) {
  peak = await api.scanPeakStreamed(params, token, (d, t) => progress(d, t, 1));
}
const blob = await api.encodeAudioChunked(params, token, (d, t) => progress(d, t, 2), normalizeGain);
const buf = Buffer.from(await blob.arrayBuffer());
fs.writeFileSync(outFile, buf);
console.log(JSON.stringify({
  out: outFile,
  bytes: buf.length,
  durationSec: params.master_duration,
  sampleRate: params.master_exportSampleRate,
  format: params.master_exportFormat,
  peak: Number(peak.toFixed(4)),
  normalizeGain: Number(normalizeGain.toFixed(3)),
  layers: [params.A_enabled ? params.A_type : null, params.B_enabled ? params.B_type : null].filter(Boolean),
  binaural: params.master_binauralEnabled ? `${params.master_binauralBeat} Hz @ ${params.master_binauralCarrier} Hz` : null,
  loopFade: params.master_loopFade
}, null, 2));
