import path from 'node:path';
import { runStepSuite } from './run-step-suite.mjs';

const ROOT_DIR = process.cwd();
const node = process.execPath;
const LEAF_DIR = path.join('docs', 'archive', 'verification-leaf-suites');

export const CORE_STEPS_FULL = [
  { label: 'typecheck:audio-reactive:attempt', cmd: node, args: ['./node_modules/typescript/lib/_tsc.js', '-p', 'tsconfig.audio-reactive.json', '--noEmit'] },
  { label: 'verify:audio-reactive:check', cmd: node, args: ['scripts/check-audio-reactive.mjs'] },
  { label: 'verify:audio-reactive', cmd: node, args: ['scripts/verify-audio-reactive.mjs'] },
  { label: 'typecheck', cmd: node, args: ['./node_modules/typescript/lib/_tsc.js', '--noEmit'] },
  { label: 'build', cmd: node, args: ['scripts/run-vite.mjs', 'build'] },
  { label: 'verify:phase4', cmd: node, args: ['scripts/verify-phase4.mjs'], env: { VERIFY_PHASE4_SKIP_TYPECHECK: '1', VERIFY_PHASE4_SKIP_BUILD: '1', VERIFY_PHASE4_SKIP_EXPORT: '1' } },
  { label: 'verify:phase5', cmd: node, args: ['scripts/verify-phase5.mjs'] },
  { label: 'verify:export', cmd: node, args: ['scripts/verify-export.mjs'] },
];

export const CORE_STEPS_FAST = [
  { label: 'verify:audio-reactive:check', cmd: node, args: ['scripts/check-audio-reactive.mjs'] },
  { label: 'verify:audio-reactive', cmd: node, args: ['scripts/verify-audio-reactive.mjs'] },
  { label: 'typecheck', cmd: node, args: ['./node_modules/typescript/lib/_tsc.js', '--noEmit'] },
  { label: 'build', cmd: node, args: ['scripts/run-vite.mjs', 'build'], env: { KALOKAGATHIA_FAST_BUILD: '1' } },
  { label: 'verify:phase4:smoke', cmd: node, args: ['scripts/verify-phase4-smoke.mjs'] },
  { label: 'verify:phase5:smoke', cmd: node, args: ['scripts/verify-phase5-smoke.mjs'] },
  { label: 'verify:export:smoke', cmd: node, args: ['scripts/verify-export.mjs'], env: { VERIFY_EXPORT_PROFILE: 'smoke' } },
];

export const BROWSER_STEPS = [
  { label: 'verify:public-ui', cmd: node, args: ['scripts/verify-public-ui.mjs'] },
  { label: 'verify:audio', cmd: node, args: ['scripts/verify-audio.mjs'] },
  { label: 'verify:video', cmd: node, args: ['scripts/verify-video.mjs'] },
  { label: 'verify:frames', cmd: node, args: ['scripts/verify-frames.mjs'] },
  { label: 'verify:library', cmd: node, args: ['scripts/verify-library.mjs'] },
  { label: 'verify:collision', cmd: node, args: ['scripts/verify-collision.mjs'] },
  { label: 'verify:standalone-synth', cmd: node, args: ['scripts/verify-standalone-synth.mjs'] },
  { label: 'verify:video-audio', cmd: node, args: ['scripts/verify-video-audio.mjs'] },
  { label: 'verify:shared-audio', cmd: node, args: ['scripts/verify-shared-audio.mjs'] },
];

function buildPaths(title) {
  const summaryPath = path.join(LEAF_DIR, `${title}.json`);
  return {
    summaryPath,
    reportMdPath: path.join(LEAF_DIR, `${title}.md`),
    latestPointerPath: path.join(LEAF_DIR, `${title}-latest.json`),
  };
}

export function runVerifyLeafSuite({ title, steps, timeoutMs, inheritStdio = true, resume = process.env.STEP_SUITE_RESUME === '1' }) {
  const paths = buildPaths(title);
  return runStepSuite({
    title,
    steps,
    timeoutMs,
    inheritStdio,
    resume,
    ...paths,
  });
}
