import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const title = 'emit-future-native-artifact-suite';
const summaryPath = path.resolve('generated', 'future-native-suite-status', `${title}.json`);
const timeoutMs = Number(process.env.FUTURE_NATIVE_EMIT_TIMEOUT_MS || 0);
const startedAt = new Date().toISOString();
const steps = [
  { label: 'emit:future-native-artifact-core', args: ['scripts/emit-future-native-artifact-core.mjs'] },
  { label: 'emit:future-native-artifact-tail', args: ['scripts/emit-future-native-artifact-tail.mjs'] },
];
const finalizers = [
  { label: 'emit:future-native-suite-status-report', args: ['scripts/emit-future-native-suite-status-report.mjs'] },
  { label: 'package:future-native-source-only', args: ['scripts/package-future-native-source-only.mjs'] },
  { label: 'emit:future-native-generated-artifact-inventory', args: ['scripts/emit-future-native-generated-artifact-inventory.mjs'] },
];
const results = [];

function writeSummary(payload) {
  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  fs.writeFileSync(summaryPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function runNodeStep(label, args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { stdio: 'inherit' });
    let timeoutId = null;
    let timedOut = false;
    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
        setTimeout(() => child.kill('SIGKILL'), 1000).unref();
      }, timeoutMs);
      timeoutId.unref();
    }
    child.on('close', (code, signal) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({ code, signal, timedOut });
    });
    child.on('error', () => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({ code: 1, signal: null, timedOut });
    });
  });
}

writeSummary({ ok: null, title, startedAt, timeoutMs, runningStep: null, results });

for (const step of steps) {
  console.error(`[${title}] start ${step.label}`);
  writeSummary({ ok: null, title, startedAt, timeoutMs, runningStep: step.label, results });
  const started = Date.now();
  const result = await runNodeStep(step.label, step.args);
  const durationMs = Date.now() - started;
  const status = result.timedOut ? 'timeout' : result.code === 0 ? 'pass' : 'fail';
  results.push({ step: step.label, status, durationMs, exitCode: result.code ?? null });
  if (status !== 'pass') {
    const payload = { ok: false, title, startedAt, timeoutMs, failedStep: step.label, runningStep: null, results };
    writeSummary(payload);
    console.error(JSON.stringify(payload, null, 2));
    process.exit(result.code ?? 1);
  }
  writeSummary({ ok: null, title, startedAt, timeoutMs, runningStep: null, results });
  console.error(`[${title}] done ${step.label} (${status}, ${durationMs}ms)`);
}

const payload = { ok: true, title, startedAt, timeoutMs, runningStep: null, results };
writeSummary(payload);

for (const finalizer of finalizers) {
  console.error(`[${title}] finalize ${finalizer.label}`);
  const result = await runNodeStep(finalizer.label, finalizer.args);
  if (result.timedOut || result.code !== 0) {
    const payload = { ok: false, title, startedAt, timeoutMs, failedStep: finalizer.label, runningStep: null, results, finalizerFailure: true };
    writeSummary(payload);
    console.error(JSON.stringify(payload, null, 2));
    process.exit(result.code ?? 1);
  }
  console.error(`[${title}] finalized ${finalizer.label}`);
}

writeSummary(payload);
console.log(JSON.stringify(payload, null, 2));
