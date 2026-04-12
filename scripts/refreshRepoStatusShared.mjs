import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT_DIR = process.cwd();
const ARCHIVE_DIR = path.resolve(ROOT_DIR, 'docs/archive');
const RUNS_DIR = path.resolve(ARCHIVE_DIR, 'refresh-repo-status-runs');

function safeId(value) {
  return String(value).replace(/[^a-z0-9._-]+/gi, '_');
}

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function renderMarkdown(report) {
  const lines = [
    '# Refresh Repo Status Report',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Run ID: ${report.runId}`,
    `- Passed: ${report.passedCount}/${report.total}`,
    `- Failed: ${report.failedCount}`,
    `- Parallel stage count: ${report.parallelStageCount}`,
    '',
    '| Step | Stage | Result | Duration ms | Execution |',
    '| --- | ---: | --- | ---: | --- |',
  ];
  for (const step of report.steps) {
    lines.push(`| ${step.id} | ${step.stageIndex + 1} | ${step.passed ? 'PASS' : 'FAIL'} | ${step.durationMs} | ${step.execution} |`);
  }
  return `${lines.join('\n')}\n`;
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

async function runStep(step, stageIndex, stepIndex, totalSteps, runDir) {
  const started = Date.now();
  const logPath = path.resolve(runDir, 'step-logs', `${safeId(step.id)}.log`);
  const logger = createStepLogger(logPath);

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
      console.error(`[refresh-repo-status] ${stepIndex + 1}/${totalSteps} ${step.id} => FAIL (spawn-error)`);
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
      console.error(`[refresh-repo-status] ${stepIndex + 1}/${totalSteps} ${step.id} => ${passed ? 'PASS' : 'FAIL'} (${execution})`);
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

export async function runRefreshRepoStatus({
  runId = new Date().toISOString().replace(/[\:.]/g, '-'),
  stages,
} = {}) {
  const runDir = path.resolve(RUNS_DIR, runId);
  const reportPath = path.resolve(runDir, 'refresh-repo-status-report.json');
  const reportMdPath = path.resolve(runDir, 'refresh-repo-status-report.md');
  const latestReportPath = path.resolve(ARCHIVE_DIR, 'refresh-repo-status-report.json');
  const latestPointerPath = path.resolve(ARCHIVE_DIR, 'refresh-repo-status-latest-run.json');

  ensureDir(path.resolve(runDir, 'step-logs'));

  const flatSteps = stages.flatMap((stage, stageIndex) => stage.map((step) => ({ ...step, stageIndex })));
  const totalSteps = flatSteps.length;
  const results = [];

  for (const [stageIndex, stage] of stages.entries()) {
    const stageSteps = stage.map((step) => ({ ...step, stageIndex }));
    const stageStarted = results.length;
    const stageResults = stageIndex === 0
      ? await Promise.all(stageSteps.map((step, index) => runStep(step, stageIndex, stageStarted + index, totalSteps, runDir)))
      : [];
    if (stageIndex !== 0) {
      for (const [index, step] of stageSteps.entries()) {
        stageResults.push(await runStep(step, stageIndex, stageStarted + index, totalSteps, runDir));
      }
    }
    results.push(...stageResults);
    if (stageResults.some((entry) => !entry.passed)) break;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    runId,
    runDir: path.relative(ROOT_DIR, runDir),
    total: totalSteps,
    parallelStageCount: 1,
    passedCount: results.filter((entry) => entry.passed).length,
    failedCount: results.filter((entry) => !entry.passed).length,
    steps: results,
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMdPath, renderMarkdown(report));
  fs.writeFileSync(latestReportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(latestPointerPath, `${JSON.stringify({ runId, runDir: path.relative(ROOT_DIR, runDir), generatedAt: report.generatedAt }, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (report.failedCount > 0) process.exit(1);
}

export const DEFAULT_REFRESH_REPO_STATUS_STAGES = Object.freeze([
  [
    { id: 'verify:package-integrity', command: process.execPath, args: ['scripts/verify-package-integrity.mjs', '--write', 'docs/archive/package-integrity-report.json'] },
    { id: 'verify:host-runtime', command: process.execPath, args: ['scripts/verify-host-runtime.mjs', '--write', 'docs/archive/host-runtime-readiness.json'] },
    { id: 'verify:live-browser-readiness', command: process.execPath, args: ['scripts/verify-live-browser-readiness.mjs', '--write', 'docs/archive/live-browser-readiness.json'] },
    { id: 'verify:dead-code', command: process.execPath, args: ['scripts/verify-dead-code.mjs'] },
  ],
  [
    { id: 'doctor:package-handoff', command: process.execPath, args: ['scripts/doctor-package-handoff.mjs', '--write', 'docs/archive/package-handoff-doctor.json'] },
    { id: 'generate:closeout-report', command: process.execPath, args: ['scripts/generate-closeout-report.mjs'] },
    { id: 'report:repo-status', command: process.execPath, args: ['scripts/generate-repo-status-report.mjs'] },
  ],
]);
