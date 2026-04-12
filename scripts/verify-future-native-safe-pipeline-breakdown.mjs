import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const timeoutMs = Number(process.env.FUTURE_NATIVE_VERIFY_TIMEOUT_MS || 30000);
const breakOnFailure = process.env.FUTURE_NATIVE_VERIFY_BREAK_ON_FAILURE === '1';
const steps = [
  'verify:future-native-guardrails',
  'verify:future-native-scene-bindings',
  'verify:future-native-volumetric-routes',
  'verify:future-native-nonvolumetric-routes',
  'verify:future-native-project-state-fast',
  'verify:future-native-specialist-routes',
  'verify:future-native-specialist-runtime-export-regression',
];

const startedAt = new Date().toISOString();
const results = [];

for (const step of steps) {
  const started = Date.now();
  const result = spawnSync(npmCommand, ['run', step], { stdio: 'inherit', timeout: timeoutMs });
  const durationMs = Date.now() - started;
  const timedOut = result.error?.code === 'ETIMEDOUT';
  const status = timedOut ? 'timeout' : result.status === 0 ? 'pass' : 'fail';
  results.push({ step, status, durationMs, exitCode: result.status ?? null });
  if (status !== 'pass' && breakOnFailure) {
    break;
  }
}

const payload = {
  startedAt,
  timeoutMs,
  breakOnFailure,
  results,
};

console.log(JSON.stringify(payload, null, 2));

if (results.some((entry) => entry.status !== 'pass')) {
  process.exit(1);
}
