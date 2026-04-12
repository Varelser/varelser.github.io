import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function normalizeStep(step) {
  if (typeof step === 'string') {
    return { label: step, cmd: npmCommand, args: ['run', step], env: undefined };
  }
  return {
    label: step.label,
    cmd: step.cmd,
    args: step.args ?? [],
    env: step.env ? Object.fromEntries(Object.entries(step.env).map(([key, value]) => [String(key), String(value)])) : undefined,
  };
}

function readSummary(summaryPath) {
  if (!summaryPath) return null;
  const resolved = path.resolve(process.cwd(), summaryPath);
  if (!fs.existsSync(resolved)) return null;
  try {
    return JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch {
    return null;
  }
}

function renderMarkdownSummary(payload) {
  const lines = [
    `# ${payload.title}`,
    '',
    `- Started: ${payload.startedAt}`,
    `- Running step: ${payload.runningStep ?? 'none'}`,
    `- Resumed: ${payload.resumed ? 'yes' : 'no'}`,
    `- Resumed step count: ${payload.resumedStepCount ?? 0}`,
    `- Timeout ms: ${payload.timeoutMs ?? 0}`,
    `- OK: ${payload.ok === null ? 'in-progress' : (payload.ok ? 'true' : 'false')}`,
    payload.failedStep ? `- Failed step: ${payload.failedStep}` : null,
    payload.finalizerFailure ? `- Finalizer failure: yes` : null,
    '',
    '| Step | Status | Duration ms | Exit code |',
    '| --- | --- | ---: | ---: |',
  ].filter(Boolean);

  for (const entry of payload.results ?? []) {
    lines.push(`| ${entry.step} | ${entry.status} | ${entry.durationMs ?? ''} | ${entry.exitCode ?? ''} |`);
  }

  return `${lines.join('\n')}\n`;
}

export function runStepSuite({
  steps,
  timeoutMs = 0,
  stopOnFailure = true,
  inheritStdio = true,
  title = 'step-suite',
  summaryPath = path.join('generated', 'future-native-suite-status', `${title}.json`),
  reportMdPath = summaryPath ? summaryPath.replace(/\.json$/i, '.md') : null,
  latestPointerPath = summaryPath ? summaryPath.replace(/\.json$/i, '-latest.json') : null,
  finalizers = [],
  resume = process.env.STEP_SUITE_RESUME === '1',
} = {}) {
  const normalizedSteps = steps.map(normalizeStep);
  const startedAt = new Date().toISOString();
  const previousSummary = resume ? readSummary(summaryPath) : null;
  const results = [];
  let resumeCursor = 0;

  if (previousSummary?.title === title && Array.isArray(previousSummary.results)) {
    while (
      resumeCursor < normalizedSteps.length &&
      resumeCursor < previousSummary.results.length &&
      previousSummary.results[resumeCursor]?.status === 'pass' &&
      previousSummary.results[resumeCursor]?.step === normalizedSteps[resumeCursor]?.label
    ) {
      results.push(previousSummary.results[resumeCursor]);
      resumeCursor += 1;
    }
  }

  const writeSummary = (payload) => {
    if (!summaryPath) return;
    const resolved = path.resolve(process.cwd(), summaryPath);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    if (reportMdPath) {
      const resolvedMd = path.resolve(process.cwd(), reportMdPath);
      fs.mkdirSync(path.dirname(resolvedMd), { recursive: true });
      fs.writeFileSync(resolvedMd, renderMarkdownSummary(payload), 'utf8');
    }
    if (latestPointerPath) {
      const resolvedLatest = path.resolve(process.cwd(), latestPointerPath);
      fs.mkdirSync(path.dirname(resolvedLatest), { recursive: true });
      fs.writeFileSync(resolvedLatest, `${JSON.stringify({
        title,
        summaryPath: path.relative(process.cwd(), resolved),
        reportMdPath: reportMdPath ? path.relative(process.cwd(), path.resolve(process.cwd(), reportMdPath)) : null,
        generatedAt: new Date().toISOString(),
        runningStep: payload.runningStep ?? null,
        ok: payload.ok,
      }, null, 2)}\n`, 'utf8');
    }
  };


  writeSummary({
    ok: null,
    title,
    startedAt,
    resumed: resumeCursor > 0,
    resumedStepCount: resumeCursor,
    resumedFromStartedAt: previousSummary?.startedAt ?? null,
    timeoutMs,
    runningStep: null,
    results,
  });

  for (let index = resumeCursor; index < normalizedSteps.length; index += 1) {
    const step = normalizedSteps[index];
    const started = Date.now();
    console.error(`[${title}] start ${step.label}`);
    writeSummary({
      ok: null,
      title,
      startedAt,
      resumed: resumeCursor > 0,
      resumedStepCount: resumeCursor,
      resumedFromStartedAt: previousSummary?.startedAt ?? null,
      timeoutMs,
      runningStep: step.label,
      results,
    });
    const result = spawnSync(step.cmd, step.args, {
      stdio: inheritStdio ? 'inherit' : 'pipe',
      timeout: timeoutMs > 0 ? timeoutMs : undefined,
      encoding: 'utf8',
      env: step.env ? { ...process.env, ...step.env } : process.env,
    });
    const durationMs = Date.now() - started;
    const timedOut = result.error?.code === 'ETIMEDOUT';
    const status = timedOut ? 'timeout' : result.status === 0 ? 'pass' : 'fail';
    results.push({ step: step.label, status, durationMs, exitCode: result.status ?? null });

    if (!inheritStdio && result.stdout) process.stdout.write(result.stdout);
    if (!inheritStdio && result.stderr) process.stderr.write(result.stderr);

    if (status !== 'pass' && stopOnFailure) {
      const payload = {
        ok: false,
        title,
        startedAt,
        resumed: resumeCursor > 0,
        resumedStepCount: resumeCursor,
        resumedFromStartedAt: previousSummary?.startedAt ?? null,
        timeoutMs,
        failedStep: step.label,
        runningStep: null,
        results,
      };
      writeSummary(payload);
      console.error(JSON.stringify(payload, null, 2));
      process.exit(result.status ?? 1);
    }

    writeSummary({
      ok: null,
      title,
      startedAt,
      resumed: resumeCursor > 0,
      resumedStepCount: resumeCursor,
      resumedFromStartedAt: previousSummary?.startedAt ?? null,
      timeoutMs,
      runningStep: null,
      results,
    });
    console.error(`[${title}] done ${step.label} (${status}, ${durationMs}ms)`);
  }

  const payload = {
    ok: results.every((entry) => entry.status === 'pass'),
    title,
    startedAt,
    resumed: resumeCursor > 0,
    resumedStepCount: resumeCursor,
    resumedFromStartedAt: previousSummary?.startedAt ?? null,
    timeoutMs,
    runningStep: null,
    results,
  };

  writeSummary(payload);

  for (const rawFinalizer of finalizers) {
    const finalizer = normalizeStep(rawFinalizer);
    console.error(`[${title}] finalize ${finalizer.label}`);
    const result = spawnSync(finalizer.cmd, finalizer.args, {
      stdio: inheritStdio ? 'inherit' : 'pipe',
      timeout: timeoutMs > 0 ? timeoutMs : undefined,
      encoding: 'utf8',
      env: finalizer.env ? { ...process.env, ...finalizer.env } : process.env,
    });
    if (!inheritStdio && result.stdout) process.stdout.write(result.stdout);
    if (!inheritStdio && result.stderr) process.stderr.write(result.stderr);
    if (result.error?.code === 'ETIMEDOUT' || result.status !== 0) {
      const finalizePayload = { ...payload, ok: false, failedStep: finalizer.label, finalizerFailure: true };
      writeSummary(finalizePayload);
      console.error(JSON.stringify(finalizePayload, null, 2));
      process.exit(result.status ?? 1);
    }
    console.error(`[${title}] finalized ${finalizer.label}`);
  }

  console.log(JSON.stringify(payload, null, 2));

  process.exit(payload.ok ? 0 : 1);
}
