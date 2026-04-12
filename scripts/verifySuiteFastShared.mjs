import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { getFreshBuildState } from './buildFreshnessShared.mjs';

const ROOT_DIR = process.cwd();
const ARCHIVE_DIR = path.resolve(ROOT_DIR, 'docs/archive');

function safeId(value) {
  return String(value).replace(/[^a-z0-9._-]+/gi, '_');
}

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function createStepLogger(logPath) {
  ensureDir(path.dirname(logPath));
  const stream = fs.createWriteStream(logPath, { flags: 'w' });
  let tail = '';
  return {
    append(chunk) {
      const text = String(chunk || '');
      if (!text) return;
      stream.write(text);
      tail = `${tail}${text}`;
      if (tail.length > 65536) tail = tail.slice(-65536);
    },
    close() {
      return new Promise((resolve) => stream.end(resolve));
    },
    getTail() {
      return tail.trim();
    },
  };
}

function renderMarkdown(report) {
  const lines = [
    '# Verification Suite Fast Smoke Report',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Run ID: ${report.runId}`,
    `- Passed: ${report.passedCount}/${report.total}`,
    `- Failed: ${report.failedCount}`,
    `- Parallel stage count: ${report.parallelStageCount}`,
    `- Cached steps: ${report.steps.filter((step) => step.execution === 'cached-build').length}`,
    '',
    '| Step | Stage | Result | Duration ms | Execution |',
    '| --- | ---: | --- | ---: | --- |',
  ];
  for (const step of report.steps) {
    lines.push(`| ${step.id} | ${step.stageIndex + 1} | ${step.passed ? 'PASS' : 'FAIL'} | ${step.durationMs} | ${step.execution} |`);
  }
  return `${lines.join('\n')}\n`;
}

async function runStep(step, stageIndex, stepIndex, totalSteps, runDir) {
  const started = Date.now();
  const logPath = path.resolve(runDir, 'step-logs', `${safeId(step.id)}.log`);
  const logger = createStepLogger(logPath);

  if (step.id === 'build') {
    const fresh = getFreshBuildState(ROOT_DIR);
    if (fresh.reusable) {
      const tail = JSON.stringify(fresh, null, 2);
      logger.append(`${tail}\n`);
      await logger.close();
      console.error(`[verify-suite-fast] ${stepIndex + 1}/${totalSteps} ${step.id} => PASS (cached-build)`);
      return {
        id: step.id,
        stageIndex,
        passed: true,
        durationMs: 0,
        execution: 'cached-build',
        status: 0,
        signal: null,
        error: null,
        timedOut: false,
        logPath: path.relative(ROOT_DIR, logPath),
        tail,
      };
    }
  }

  return await new Promise((resolve) => {
    let timedOut = false;
    const timeoutMs = step.timeoutMs ?? 480_000;
    const child = spawn(step.command, step.args, {
      cwd: ROOT_DIR,
      env: { ...process.env, ...(step.env || {}) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 1000).unref();
    }, timeoutMs);

    child.stdout.on('data', (chunk) => logger.append(chunk));
    child.stderr.on('data', (chunk) => logger.append(chunk));

    child.on('error', async (error) => {
      clearTimeout(timer);
      await logger.close();
      console.error(`[verify-suite-fast] ${stepIndex + 1}/${totalSteps} ${step.id} => FAIL (spawn-error)`);
      resolve({
        id: step.id,
        stageIndex,
        passed: false,
        durationMs: Date.now() - started,
        execution: 'spawn-error',
        status: null,
        signal: null,
        error: String(error),
        timedOut: false,
        logPath: path.relative(ROOT_DIR, logPath),
        tail: logger.getTail(),
      });
    });

    child.on('close', async (status, signal) => {
      clearTimeout(timer);
      await logger.close();
      const passed = status === 0 && !signal && !timedOut;
      const execution = timedOut ? 'timed-out' : (passed ? 'direct' : 'failed');
      console.error(`[verify-suite-fast] ${stepIndex + 1}/${totalSteps} ${step.id} => ${passed ? 'PASS' : 'FAIL'} (${execution})`);
      resolve({
        id: step.id,
        stageIndex,
        passed,
        durationMs: Date.now() - started,
        execution,
        status,
        signal,
        error: timedOut ? `timed out after ${timeoutMs}ms` : null,
        timedOut,
        logPath: path.relative(ROOT_DIR, logPath),
        tail: logger.getTail(),
      });
    });
  });
}

export async function runVerifySuiteFast({
  runId = new Date().toISOString().replace(/[\:.]/g, '-'),
  stages,
  reportBaseName = 'verification-suite-fast-smoke',
  reportTitle = 'Verification Suite Fast Smoke Report',
} = {}) {
  const runsDir = path.resolve(ARCHIVE_DIR, `${reportBaseName}-runs`);
  const runDir = path.resolve(runsDir, runId);
  const reportPath = path.resolve(runDir, `${reportBaseName}-report.json`);
  const reportMdPath = path.resolve(runDir, `${reportBaseName}-report.md`);
  const latestReportPath = path.resolve(ARCHIVE_DIR, `${reportBaseName}-report.json`);
  const latestPointerPath = path.resolve(ARCHIVE_DIR, `${reportBaseName}-latest-run.json`);

  ensureDir(path.resolve(runDir, 'step-logs'));

  const flatSteps = stages.flatMap((stage, stageIndex) => stage.map((step) => ({ ...step, stageIndex })));
  const totalSteps = flatSteps.length;
  const results = [];

  for (const [stageIndex, stage] of stages.entries()) {
    const stageSteps = stage.map((step) => ({ ...step, stageIndex }));
    const stageStarted = results.length;
    const stageResults = await Promise.all(
      stageSteps.map((step, index) => runStep(step, stageIndex, stageStarted + index, totalSteps, runDir))
    );
    results.push(...stageResults);
    if (stageResults.some((entry) => !entry.passed)) break;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    runId,
    runDir: path.relative(ROOT_DIR, runDir),
    total: totalSteps,
    parallelStageCount: stages.length,
    passedCount: results.filter((entry) => entry.passed).length,
    failedCount: results.filter((entry) => !entry.passed).length,
    steps: results,
  };

  const markdown = renderMarkdown({ ...report, title: reportTitle });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMdPath, markdown.replace('# Verification Suite Fast Smoke Report', `# ${reportTitle}`));
  fs.writeFileSync(latestReportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(latestPointerPath, `${JSON.stringify({ runId, runDir: path.relative(ROOT_DIR, runDir), generatedAt: report.generatedAt }, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (report.failedCount > 0) process.exit(1);
}

export const DEFAULT_VERIFY_SUITE_FAST_SMOKE_STAGES = Object.freeze([
  [
    { id: 'verify:audio-reactive:check', command: process.execPath, args: ['scripts/check-audio-reactive.mjs'] },
    { id: 'verify:audio-reactive', command: process.execPath, args: ['scripts/verify-audio-reactive.mjs'] },
    { id: 'typecheck', command: process.execPath, args: ['./node_modules/typescript/lib/_tsc.js', '--noEmit'] },
    { id: 'build', command: process.execPath, args: ['scripts/run-vite.mjs', 'build'], env: { KALOKAGATHIA_FAST_BUILD: '1' } },
  ],
  [
    { id: 'verify:phase4:project-state-smoke', command: process.execPath, args: ['scripts/verify-phase4-smoke.mjs'], env: { VERIFY_PHASE4_SMOKE_SKIP_EXPORT: '1', VERIFY_PHASE4_SMOKE_SKIP_BUILD: '1' } },
    { id: 'verify:phase5:smoke', command: process.execPath, args: ['scripts/verify-phase5-smoke.mjs'] },
    { id: 'verify:export:smoke', command: process.execPath, args: ['scripts/verify-export.mjs'], env: { VERIFY_EXPORT_PROFILE: 'smoke' } },
  ],
]);

export const DEFAULT_VERIFY_SUITE_FAST_TAIL_STAGES = Object.freeze([
  DEFAULT_VERIFY_SUITE_FAST_SMOKE_STAGES[1],
]);
