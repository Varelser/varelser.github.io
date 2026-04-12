import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const read = (relativePath) => fs.readFileSync(path.resolve(rootDir, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.resolve(rootDir, relativePath));

const scorecardPath = 'docs/PHASE_BCDE_CLOSEOUT_SCORECARD_CURRENT.md';
const intelCurrentPath = 'docs/INTEL_MAC_LIVE_BROWSER_PROOF_CURRENT.md';
const oneShotCurrentPath = 'docs/INTEL_MAC_INCOMING_ONE_SHOT_CURRENT.md';
const checkpointPath = 'docs/handoff/SESSION_CHECKPOINT_2026-04-09.md';

const scorecard = exists(scorecardPath) ? read(scorecardPath).trim() : '# Phase B/C/D/E Closeout Scorecard Current\n\n- missing';
const intelCurrent = exists(intelCurrentPath) ? read(intelCurrentPath).trim() : '# Intel Mac Live Browser Proof Current\n\n- missing';
const oneShotCurrent = exists(oneShotCurrentPath) ? read(oneShotCurrentPath).trim() : '# Intel Mac Incoming One-Shot Current\n\n- missing';

const generatedBlock = [
  '<!-- PHASE_BCDE_CURRENT_SYNC:START -->',
  '## 2026-04-09 phase current sync',
  '',
  '- canonical current docs:',
  '  - `docs/PHASE_BCDE_CLOSEOUT_SCORECARD_CURRENT.md`',
  '  - `docs/INTEL_MAC_LIVE_BROWSER_PROOF_CURRENT.md`',
  '  - `docs/INTEL_MAC_INCOMING_ONE_SHOT_CURRENT.md`',
  '  - `docs/EXECUTION_SURFACES_CURRENT.md`',
  '  - `docs/UX_CLOSEOUT_MATRIX_CURRENT.md`',
  '  - `docs/UX_IMPLEMENTATION_BOUNDARY_CURRENT.md`',
  '  - `docs/WEBGPU_CAPABILITY_STATUS_CURRENT.md`',
  '  - `docs/WEBGPU_EXECUTION_MODE_MATRIX_CURRENT.md`',
  '  - `docs/CHUNK_WARNING_INVENTORY_CURRENT.md`',
  '',
  '- summary:',
  ...scorecard.split('\n').slice(2, 6).map((line) => `  ${line}`),
  '',
  '- intel mac current:',
  ...intelCurrent.split('\n').slice(2, 8).map((line) => `  ${line}`),
  '<!-- PHASE_BCDE_CURRENT_SYNC:END -->',
  '',
].join('\n');

const syncFile = (relativePath) => {
  const absolutePath = path.resolve(rootDir, relativePath);
  let text = fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : '';
  if (/<!-- PHASE_BCDE_CURRENT_SYNC:START -->[\s\S]*?<!-- PHASE_BCDE_CURRENT_SYNC:END -->\n?/m.test(text)) {
    text = text.replace(/<!-- PHASE_BCDE_CURRENT_SYNC:START -->[\s\S]*?<!-- PHASE_BCDE_CURRENT_SYNC:END -->\n?/m, generatedBlock);
  } else {
    text += (text.endsWith('\n') ? '' : '\n') + '\n' + generatedBlock;
  }
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, text, 'utf8');
};

const checkpoint = [
  '# Session Checkpoint — 2026-04-09',
  '',
  '## Canonical Current Docs',
  '- `docs/PHASE_BCDE_CLOSEOUT_SCORECARD_CURRENT.md`',
  '- `docs/INTEL_MAC_LIVE_BROWSER_PROOF_CURRENT.md`',
  '- `docs/INTEL_MAC_INCOMING_ONE_SHOT_CURRENT.md`',
  '- `docs/EXECUTION_SURFACES_CURRENT.md`',
  '- `docs/UX_CLOSEOUT_MATRIX_CURRENT.md`',
  '- `docs/UX_IMPLEMENTATION_BOUNDARY_CURRENT.md`',
  '- `docs/WEBGPU_CAPABILITY_STATUS_CURRENT.md`',
  '- `docs/WEBGPU_EXECUTION_MODE_MATRIX_CURRENT.md`',
  '- `docs/CHUNK_WARNING_INVENTORY_CURRENT.md`',
  '',
  scorecard,
  '',
  intelCurrent,
  '',
  oneShotCurrent,
  '',
].join('\n');
fs.mkdirSync(path.resolve(rootDir, 'docs/handoff'), { recursive: true });
fs.writeFileSync(path.resolve(rootDir, checkpointPath), checkpoint, 'utf8');

syncFile('CURRENT_STATUS.md');
syncFile('FINAL_INTERNAL_HANDOFF_2026-04-08.md');
console.log('[sync-phase-bcde-current-state] synced CURRENT_STATUS, FINAL_INTERNAL_HANDOFF, SESSION_CHECKPOINT');
