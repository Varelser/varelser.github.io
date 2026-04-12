import { spawnSync } from 'node:child_process';
import { loadPackageJson } from './packageIntegrityShared.mjs';
import { buildHostRuntimeChecks, summarizeHostRuntimeChecks } from './hostRuntimeShared.mjs';

const nodeBin = process.execPath;
const truthy = (value) => /^(1|true|yes)$/i.test(String(value || '0'));
const skipTypecheck = truthy(process.env.VERIFY_PHASE4_SKIP_TYPECHECK);
const skipBuild = truthy(process.env.VERIFY_PHASE4_SKIP_BUILD);
const skipProjectState = truthy(process.env.VERIFY_PHASE4_SKIP_PROJECT_STATE);
const skipExport = truthy(process.env.VERIFY_PHASE4_SKIP_EXPORT);

const rootDir = process.cwd();
const packageJson = loadPackageJson(rootDir);
const hostRuntime = buildHostRuntimeChecks(rootDir, packageJson);
const hostSummary = summarizeHostRuntimeChecks(hostRuntime.checks);

if (!skipBuild && hostSummary.failed > 0) {
  console.error(JSON.stringify({
    passed: false,
    failedStep: 'host-runtime',
    reason: 'current host is missing native runtime pieces required for Vite/Rollup build verification',
    host: hostRuntime.host,
    summary: hostSummary,
    skipped: { typecheck: skipTypecheck, build: skipBuild, projectState: skipProjectState, export: skipExport },
    recommendedNextSteps: [
      'run npm install on the target host to refresh host-native optional packages',
      'rerun npm run verify:host-runtime',
      'rerun npm run build',
      'rerun npm run verify:phase4'
    ]
  }, null, 2));
  process.exit(1);
}

const steps = [
  !skipTypecheck && {
    id: 'typecheck',
    command: nodeBin,
    args: ['./node_modules/typescript/lib/_tsc.js', '--noEmit'],
  },
  !skipBuild && {
    id: 'build',
    command: nodeBin,
    args: ['scripts/run-vite.mjs', 'build'],
  },
  !skipProjectState && {
    id: 'project-state',
    command: nodeBin,
    args: ['scripts/verify-project-state.mjs'],
  },
  !skipExport && {
    id: 'export',
    command: nodeBin,
    args: ['scripts/verify-export.mjs'],
  },
].filter(Boolean);

const summary = [];

for (const step of steps) {
  const result = spawnSync(step.command, step.args, {
    stdio: 'pipe',
    encoding: 'utf8',
    env: process.env,
    timeout: 480_000,
    maxBuffer: 1024 * 1024 * 20,
  });

  const combined = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const tail = combined.trim().split('\n').slice(-20).join('\n');
  summary.push({
    id: step.id,
    status: result.status,
    signal: result.signal,
    timedOut: Boolean(result.error && /timed out/i.test(result.error.message)),
    tail,
  });

  if (combined.trim()) {
    process.stdout.write(`${combined.trim()}\n`);
  }

  if (result.status !== 0 || result.signal || result.error) {
    console.error(JSON.stringify({
      passed: false,
      failedStep: step.id,
      skipped: { typecheck: skipTypecheck, build: skipBuild, projectState: skipProjectState, export: skipExport },
      summary,
    }, null, 2));
    process.exit(result.status ?? 1);
  }
}

console.log(JSON.stringify({
  passed: true,
  verifiedStepCount: summary.length,
  skipped: { typecheck: skipTypecheck, build: skipBuild, projectState: skipProjectState, export: skipExport },
  summary,
}, null, 2));
