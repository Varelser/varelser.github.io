import { spawnSync } from 'node:child_process';
import { getFreshBuildState } from './buildFreshnessShared.mjs';

const nodeBin = process.execPath;
const rootDir = process.cwd();
const truthy = (value) => /^(1|true|yes)$/i.test(String(value || '0'));
const skipBuild = truthy(process.env.VERIFY_PHASE4_SMOKE_SKIP_BUILD);
const skipExport = truthy(process.env.VERIFY_PHASE4_SMOKE_SKIP_EXPORT);

const steps = [];
const buildState = getFreshBuildState(rootDir);
if (!skipBuild && !buildState.reusable) {
  steps.push({
    id: 'build',
    command: nodeBin,
    args: ['scripts/run-vite.mjs', 'build'],
    env: { ...process.env, KALOKAGATHIA_FAST_BUILD: process.env.KALOKAGATHIA_FAST_BUILD || '1' },
  });
}

steps.push({
  id: 'project-state-smoke',
  command: nodeBin,
  args: ['scripts/verify-project-state-smoke.mjs'],
  env: process.env,
});

if (!skipExport) {
  steps.push({
    id: 'export-smoke',
    command: nodeBin,
    args: ['scripts/verify-export.mjs'],
    env: { ...process.env, VERIFY_EXPORT_PROFILE: 'smoke' },
  });
}

const summary = [];
for (const step of steps) {
  const startedAt = Date.now();
  const result = spawnSync(step.command, step.args, {
    stdio: 'pipe',
    encoding: 'utf8',
    env: step.env,
    timeout: 480_000,
    maxBuffer: 1024 * 1024 * 20,
  });

  const combined = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const tail = combined.trim().split('\n').slice(-20).join('\n');
  summary.push({
    id: step.id,
    status: result.status,
    signal: result.signal,
    durationMs: Date.now() - startedAt,
    timedOut: Boolean(result.error && /timed out/i.test(result.error.message)),
    tail,
  });

  if (combined.trim()) process.stdout.write(`${combined.trim()}\n`);

  if (result.status !== 0 || result.signal || result.error) {
    console.error(JSON.stringify({
      passed: false,
      failedStep: step.id,
      summary,
      buildFreshness: buildState,
    }, null, 2));
    process.exit(result.status ?? 1);
  }
}

console.log(JSON.stringify({
  passed: true,
  verifiedStepCount: summary.length,
  buildFreshness: buildState,
  summary,
}, null, 2));
