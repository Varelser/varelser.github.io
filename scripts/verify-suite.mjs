import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { loadPackageJson } from './packageIntegrityShared.mjs';
import { getFreshBuildState } from './buildFreshnessShared.mjs';
import { buildHostRuntimeChecks, summarizeHostRuntimeChecks, formatHostDescriptor } from './hostRuntimeShared.mjs';

const ROOT_DIR = process.cwd();
const ARCHIVE_DIR = path.resolve(ROOT_DIR, 'docs/archive');
const RUNS_DIR = path.resolve(ARCHIVE_DIR, 'verification-suite-runs');
const runId = String(process.env.VERIFY_SUITE_RUN_ID || new Date().toISOString().replace(/[\:.]/g, '-')).trim();
const RUN_DIR = path.resolve(RUNS_DIR, runId);
const REPORT_PATH = path.resolve(RUN_DIR, 'verification-suite-report.json');
const REPORT_MD_PATH = path.resolve(RUN_DIR, 'verification-suite-report.md');
const LATEST_REPORT_PATH = path.resolve(ARCHIVE_DIR, 'verification-suite-report.json');
const LATEST_REPORT_MD_PATH = path.resolve(ARCHIVE_DIR, 'verification-suite-report.md');
const LATEST_POINTER_PATH = path.resolve(ARCHIVE_DIR, 'verification-suite-latest-run.json');
const STEP_REPORT_DIR = path.resolve(RUN_DIR, 'step-reports');
const STEP_LOG_DIR = path.resolve(RUN_DIR, 'step-logs');
const mode = String(process.env.VERIFY_RUNTIME_MODE || 'static').trim().toLowerCase();
const suiteProfile = String(process.env.VERIFY_SUITE_PROFILE || 'full').trim().toLowerCase();
const suiteOnly = process.env.VERIFY_SUITE_ONLY ? new Set(process.env.VERIFY_SUITE_ONLY.split(',').map((value) => value.trim()).filter(Boolean)) : null;
const suiteStartAt = String(process.env.VERIFY_SUITE_START_AT || '').trim();
const suiteResume = /^(1|true|yes)$/i.test(String(process.env.VERIFY_SUITE_RESUME || '0'));
const stopOnFailure = /^(1|true|yes)$/i.test(String(process.env.VERIFY_SUITE_STOP_ON_FAILURE || '0'));
const timeoutMs = Number(process.env.VERIFY_SUITE_STEP_TIMEOUT_MS || 480000);
const nodeBin = process.execPath;
const runnerPath = path.resolve(ROOT_DIR, 'scripts/verify-step-runner.mjs');
const packageJson = loadPackageJson(ROOT_DIR);
const hostRuntime = buildHostRuntimeChecks(ROOT_DIR, packageJson);
const hostSummary = summarizeHostRuntimeChecks(hostRuntime.checks);
const hostDescriptor = formatHostDescriptor(hostRuntime.host);

const allSteps = [
  { id: 'typecheck:audio-reactive:attempt', group: 'core', command: nodeBin, args: ['./node_modules/typescript/lib/_tsc.js', '-p', 'tsconfig.audio-reactive.json', '--noEmit'] },
  { id: 'verify:audio-reactive:check', group: 'core', command: nodeBin, args: ['scripts/check-audio-reactive.mjs'] },
  { id: 'verify:audio-reactive', group: 'core', command: nodeBin, args: ['scripts/verify-audio-reactive.mjs'] },
  { id: 'typecheck', group: 'core', command: nodeBin, args: ['./node_modules/typescript/lib/_tsc.js', '--noEmit'] },
  {
    id: 'build',
    group: 'core',
    command: nodeBin,
    args: ['scripts/run-vite.mjs', 'build'],
    requiresHostRuntime: true,
    env: suiteProfile === 'fast' ? { KALOKAGATHIA_FAST_BUILD: '1' } : undefined
  },
  {
    id: 'verify:phase4',
    group: 'core',
    command: nodeBin,
    args: suiteProfile === 'fast' ? ['scripts/verify-phase4-smoke.mjs'] : ['scripts/verify-phase4.mjs'],
    requiresHostRuntime: true,
    env: suiteProfile === 'fast'
      ? undefined
      : {
          VERIFY_PHASE4_SKIP_TYPECHECK: '1',
          VERIFY_PHASE4_SKIP_BUILD: '1',
          VERIFY_PHASE4_SKIP_EXPORT: '1'
        }
  },
  {
    id: 'verify:phase5',
    group: 'core',
    command: nodeBin,
    args: suiteProfile === 'fast' ? ['scripts/verify-phase5-smoke.mjs'] : ['scripts/verify-phase5.mjs'],
    requiresHostRuntime: true
  },
  {
    id: 'verify:export',
    group: 'core',
    command: nodeBin,
    args: ['scripts/verify-export.mjs'],
    env: suiteProfile === 'fast' ? { VERIFY_EXPORT_PROFILE: 'smoke' } : undefined
  },
  { id: 'verify:public-ui', group: 'browser', command: nodeBin, args: ['scripts/verify-public-ui.mjs'] },
  { id: 'verify:audio', group: 'browser', command: nodeBin, args: ['scripts/verify-audio.mjs'] },
  { id: 'verify:video', group: 'browser', command: nodeBin, args: ['scripts/verify-video.mjs'] },
  { id: 'verify:frames', group: 'browser', command: nodeBin, args: ['scripts/verify-frames.mjs'] },
  { id: 'verify:library', group: 'browser', command: nodeBin, args: ['scripts/verify-library.mjs'] },
  { id: 'verify:collision', group: 'browser', command: nodeBin, args: ['scripts/verify-collision.mjs'] },
  { id: 'verify:standalone-synth', group: 'browser', command: nodeBin, args: ['scripts/verify-standalone-synth.mjs'] },
  { id: 'verify:video-audio', group: 'browser', command: nodeBin, args: ['scripts/verify-video-audio.mjs'] },
  { id: 'verify:shared-audio', group: 'browser', command: nodeBin, args: ['scripts/verify-shared-audio.mjs'] }
];

const safeStepId = (value) => value.replace(/[^a-z0-9._-]+/gi, '_');
const readJson = (filePath) => {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
};
const countBy = (entries, selector) => {
  const out = {};
  for (const entry of entries) {
    const key = selector(entry);
    if (!key) continue;
    out[key] = (out[key] || 0) + 1;
  }
  return out;
};

const profileStepIds = suiteProfile === 'fast'
  ? new Set([
      'verify:audio-reactive:check',
      'verify:audio-reactive',
      'typecheck',
      'build',
      'verify:phase4',
      'verify:phase5',
      'verify:export'
    ])
  : null;

const steps = allSteps.filter((step) => !profileStepIds || profileStepIds.has(step.id));
const shouldReuseFreshBuild = /^(1|true|yes)$/i.test(String(process.env.VERIFY_SUITE_REUSE_FRESH_BUILD || (suiteProfile === 'fast' ? '1' : '0')));

function renderMarkdownReport(report) {
  const lines = [
    '# Verification Suite Report',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Run ID: ${report.runId}`,
    `- Run dir: ${report.runDir}`,
    `- Requested mode: ${report.requestedMode}`,
    `- Passed: ${report.passedCount}/${report.total}`,
    `- Failed: ${report.failedCount}`,
    `- Blocked: ${report.blockedCount}`,
    `- Progress: ${report.progressPercent}%`,
    '',
    '## Coverage breakdown',
    '',
    `- Live attempted: ${report.coverageBreakdown.liveAttempted}`,
    `- Live verified: ${report.coverageBreakdown.liveVerified}`,
    `- Fallback used: ${report.coverageBreakdown.fallbackUsed}`,
    `- Unresolved live coverage: ${report.coverageBreakdown.unresolvedLiveCoverage}`,
    '',
    '## Execution breakdown',
    ''
  ];

  for (const [key, value] of Object.entries(report.executionBreakdown)) lines.push(`- ${key}: ${value}`);
  lines.push('', '## Verification tiers', '');
  for (const [key, value] of Object.entries(report.verificationTierBreakdown)) lines.push(`- ${key}: ${value}`);

  lines.push('', '## Blocked steps', '');
  if (report.blockedSteps.length === 0) {
    lines.push('- None');
  } else {
    for (const entry of report.blockedSteps) {
      lines.push(`- ${entry.id} [${entry.group}] :: ${entry.execution} :: ${entry.reason || 'blocked'}`);
    }
  }

  lines.push('', '## Unresolved live-coverage steps', '');
  if (report.unresolvedLiveSteps.length === 0) {
    lines.push('- None');
  } else {
    for (const entry of report.unresolvedLiveSteps) {
      lines.push(`- ${entry.id} [${entry.group}] :: ${entry.execution}${entry.verificationTier ? ` :: ${entry.verificationTier}` : ''}`);
    }
  }

  lines.push('', '## Step summary', '', '| Step | Group | Result | Execution | Tier | Live | Fallback |', '| --- | --- | --- | --- | --- | --- | --- |');
  for (const entry of report.summary) {
    const resultLabel = entry.blocked ? 'BLOCKED' : (entry.passed ? 'PASS' : 'FAIL');
    lines.push(`| ${entry.id} | ${entry.group} | ${resultLabel} | ${entry.execution} | ${entry.verificationTier || ''} | ${entry.liveVerified ? 'live' : (entry.liveAttempted ? 'attempted' : '')} | ${entry.fallbackUsed ? 'yes' : ''} |`);
  }

  return `${lines.join('\n')}\n`;
}

function writeReport(summary, runnableSteps) {
  const blockedCount = summary.filter((entry) => entry.blocked).length;
  const passedCount = summary.filter((entry) => entry.passed).length;
  const failedCount = summary.filter((entry) => !entry.passed && !entry.blocked).length;
  const report = {
    generatedAt: new Date().toISOString(),
    runId,
    runDir: path.relative(ROOT_DIR, RUN_DIR),
    requestedMode: mode,
    requestedProfile: suiteProfile,
    suiteResume,
    stopOnFailure,
    total: runnableSteps.length,
    passedCount,
    failedCount,
    blockedCount,
    progressPercent: Number((((passedCount + blockedCount) / Math.max(runnableSteps.length, 1)) * 100).toFixed(1)),
    executionBreakdown: {
      live: summary.filter((entry) => entry.execution === 'live').length,
      inlineRuntimeFallback: summary.filter((entry) => entry.execution === 'inline-runtime-fallback').length,
      sourceStaticFallback: summary.filter((entry) => entry.execution === 'source-static-fallback').length,
      nodeSkiaRuntimeFallback: summary.filter((entry) => entry.execution === 'node-skia-runtime-fallback').length,
      pngjsStaticHarnessFallback: summary.filter((entry) => entry.execution === 'pngjs-static-harness-fallback').length,
      blockedHostRuntime: summary.filter((entry) => entry.execution === 'blocked-host-runtime').length,
      direct: summary.filter((entry) => entry.execution === 'direct').length,
      opaque: summary.filter((entry) => entry.execution === 'opaque').length,
      cachedBuild: summary.filter((entry) => entry.execution === 'cached-build').length
    },
    verificationTierBreakdown: countBy(summary, (entry) => entry.verificationTier || 'none'),
    coverageBreakdown: {
      liveAttempted: summary.filter((entry) => entry.liveAttempted).length,
      liveVerified: summary.filter((entry) => entry.liveVerified).length,
      fallbackUsed: summary.filter((entry) => entry.fallbackUsed).length,
      unresolvedLiveCoverage: summary.filter((entry) => entry.unresolvedLiveCoverage).length
    },
    blockedSteps: summary
      .filter((entry) => entry.blocked)
      .map((entry) => ({
        id: entry.id,
        group: entry.group,
        execution: entry.execution,
        verificationTier: entry.verificationTier,
        reason: entry.reason || entry.payload?.reason || null,
        reportPath: entry.reportPath,
        logPath: entry.logPath
      })),
    unresolvedLiveSteps: summary
      .filter((entry) => entry.unresolvedLiveCoverage)
      .map((entry) => ({
        id: entry.id,
        group: entry.group,
        execution: entry.execution,
        verificationTier: entry.verificationTier,
        reportPath: entry.reportPath,
        logPath: entry.logPath
      })),
    summary
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(REPORT_MD_PATH, renderMarkdownReport(report));
  fs.writeFileSync(LATEST_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(LATEST_REPORT_MD_PATH, renderMarkdownReport(report));
  fs.writeFileSync(LATEST_POINTER_PATH, `${JSON.stringify({ runId, runDir: path.relative(ROOT_DIR, RUN_DIR), generatedAt: report.generatedAt, requestedMode: mode }, null, 2)}\n`);
  return report;
}

function createBlockedStepReport(step, reason, reportPath, logPath) {
  const payload = {
    passed: false,
    blocked: true,
    failedStep: 'host-runtime',
    reason,
    host: hostRuntime.host,
    hostDescriptor,
    summary: hostSummary,
    recommendedNextSteps: [
      'run npm install on the target host to refresh host-native optional packages',
      'rerun npm run verify:host-runtime',
      `rerun ${step.id}`
    ]
  };
  const report = {
    id: step.id,
    command: step.command,
    args: step.args,
    requestedMode: mode,
    requestedProfile: suiteProfile,
    stepEnv: step.env || {},
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    durationMs: 0,
    passed: false,
    blocked: true,
    status: null,
    signal: null,
    timedOut: false,
    execution: 'blocked-host-runtime',
    effectiveMode: 'blocked',
    verificationTier: 'host-runtime-blocked',
    liveAttempted: false,
    liveVerified: false,
    fallbackUsed: false,
    unresolvedLiveCoverage: false,
    payload,
    reason,
    error: null,
    logPath: path.relative(ROOT_DIR, logPath),
    tail: JSON.stringify(payload, null, 2)
  };
  fs.writeFileSync(logPath, `${report.tail}\n`);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

async function runStep(step) {
  const safeId = safeStepId(step.id);
  const reportPath = path.join(STEP_REPORT_DIR, `${safeId}.json`);
  const logPath = path.join(STEP_LOG_DIR, `${safeId}.log`);
  const existing = suiteResume ? readJson(reportPath) : null;
  if (existing && existing.requestedMode === mode && (existing.passed || existing.blocked)) {
    return {
      ...existing,
      id: step.id,
      group: step.group,
      resumed: true,
      reportPath: path.relative(ROOT_DIR, reportPath),
      logPath: path.relative(ROOT_DIR, logPath)
    };
  }

  if (step.id === 'build' && shouldReuseFreshBuild) {
    const freshBuildState = getFreshBuildState(ROOT_DIR);
    if (freshBuildState.reusable) {
      const report = {
        id: step.id,
        command: step.command,
        args: step.args,
        requestedMode: mode,
        requestedProfile: suiteProfile,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 0,
        passed: true,
        blocked: false,
        status: 0,
        signal: null,
        timedOut: false,
        execution: 'cached-build',
        effectiveMode: 'cached-build',
        verificationTier: 'artifact-fresh',
        liveAttempted: false,
        liveVerified: false,
        fallbackUsed: true,
        unresolvedLiveCoverage: false,
        payload: freshBuildState,
        reason: freshBuildState.reason,
        error: null,
        logPath: path.relative(ROOT_DIR, logPath),
        tail: JSON.stringify(freshBuildState, null, 2)
      };
      fs.writeFileSync(logPath, `${report.tail}\n`);
      fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
      return { ...report, group: step.group, resumed: false, reportPath: path.relative(ROOT_DIR, reportPath), logPath: path.relative(ROOT_DIR, logPath) };
    }
  }

  if (step.requiresHostRuntime && hostSummary.failed > 0) {
    return {
      ...createBlockedStepReport(step, 'current host is missing native runtime pieces required for this verification step', reportPath, logPath),
      id: step.id,
      group: step.group,
      resumed: false,
      reportPath: path.relative(ROOT_DIR, reportPath),
      logPath: path.relative(ROOT_DIR, logPath)
    };
  }

  const result = await new Promise((resolve) => {
    let timedOut = false;
    let tail = '';
    const child = spawn(nodeBin, [runnerPath], {
      cwd: ROOT_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        VERIFY_RUNTIME_MODE: mode,
        VERIFY_STEP_ID: step.id,
        VERIFY_STEP_COMMAND: step.command,
        VERIFY_STEP_ARGS_JSON: JSON.stringify(step.args),
        VERIFY_STEP_REPORT_PATH: reportPath,
        VERIFY_STEP_LOG_PATH: logPath,
        VERIFY_STEP_TIMEOUT_MS: String(timeoutMs),
        VERIFY_SUITE_RUN_ID: runId,
        VERIFY_STEP_ENV_JSON: JSON.stringify(step.env || {})
      },
    });

    const append = (chunk) => {
      const text = String(chunk || '');
      if (!text) return;
      tail = `${tail}${text}`;
      if (tail.length > 262144) tail = tail.slice(-262144);
    };

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 1000).unref();
    }, timeoutMs + 10_000);

    child.stdout.on('data', append);
    child.stderr.on('data', append);
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ status: null, signal: null, error: String(error), tail: tail.trim(), timedOut: false });
    });
    child.on('close', (status, signal) => {
      clearTimeout(timer);
      resolve({ status, signal, error: null, tail: tail.trim(), timedOut });
    });
  });

  const report = readJson(reportPath) ?? {
    id: step.id,
    group: step.group,
    passed: false,
    blocked: false,
    status: result.status,
    signal: result.signal,
    timedOut: result.timedOut === true,
    execution: 'opaque',
    effectiveMode: 'unknown',
    verificationTier: null,
    liveAttempted: false,
    liveVerified: false,
    fallbackUsed: false,
    unresolvedLiveCoverage: false,
    tail: result.tail,
    error: result.error,
    requestedMode: mode,
    requestedProfile: suiteProfile,
    reportPath: path.relative(ROOT_DIR, reportPath),
    logPath: path.relative(ROOT_DIR, logPath)
  };

  return {
    ...report,
    blocked: report.blocked === true,
    id: step.id,
    group: step.group,
    resumed: false,
    reportPath: path.relative(ROOT_DIR, reportPath),
    logPath: path.relative(ROOT_DIR, logPath)
  };
}

const filteredSteps = steps.filter((step) => !suiteOnly || suiteOnly.has(step.id));
const startIndex = suiteStartAt ? Math.max(filteredSteps.findIndex((step) => step.id === suiteStartAt), 0) : 0;
const runnableSteps = filteredSteps.slice(startIndex);

async function main() {
  fs.mkdirSync(RUN_DIR, { recursive: true });
  fs.mkdirSync(STEP_REPORT_DIR, { recursive: true });
  fs.mkdirSync(STEP_LOG_DIR, { recursive: true });

  const summary = [];
  let aborted = false;
  for (const [index, step] of runnableSteps.entries()) {
    const entry = await runStep(step);
    summary.push(entry);
    writeReport(summary, runnableSteps);
    const resultLabel = entry.blocked ? 'BLOCKED' : (entry.passed ? 'PASS' : 'FAIL');
    console.error(`[verify-suite] ${index + 1}/${runnableSteps.length} ${step.id} => ${resultLabel} (${entry.execution})${entry.resumed ? ' [resumed]' : ''}`);
    if (!entry.passed && !entry.blocked && stopOnFailure) {
      aborted = true;
      break;
    }
  }

  const report = writeReport(summary, runnableSteps);
  report.aborted = aborted;
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}
`);
  fs.writeFileSync(REPORT_MD_PATH, renderMarkdownReport(report));
  console.log(JSON.stringify(report, null, 2));
  if (report.failedCount > 0 || aborted) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
