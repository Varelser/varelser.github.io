import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadPackageJson } from './packageIntegrityShared.mjs';
import { buildHostRuntimeChecks, summarizeHostRuntimeChecks, formatHostDescriptor } from './hostRuntimeShared.mjs';

const ROOT_DIR = process.cwd();
const ARCHIVE_DIR = path.resolve(ROOT_DIR, 'docs/archive');
const REPORT_JSON_PATH = path.resolve(ARCHIVE_DIR, 'core-portable-verification.json');
const REPORT_MD_PATH = path.resolve(ARCHIVE_DIR, 'core-portable-verification.md');
const REPORT_RUNS_DIR = path.resolve(ARCHIVE_DIR, 'core-portable-verification-runs');
const runId = new Date().toISOString().replace(/[\:.]/g, '-');
const RUN_DIR = path.resolve(REPORT_RUNS_DIR, runId);
const STEP_LOG_DIR = path.resolve(RUN_DIR, 'step-logs');

const nodeBin = process.execPath;
const packageJson = loadPackageJson(ROOT_DIR);
const hostRuntime = buildHostRuntimeChecks(ROOT_DIR, packageJson);
const hostSummary = summarizeHostRuntimeChecks(hostRuntime.checks);
const hostDescriptor = formatHostDescriptor(hostRuntime.host);
const runStartedAt = new Date().toISOString();

const steps = [
  { id: 'typecheck:audio-reactive:attempt', command: nodeBin, args: ['./node_modules/typescript/lib/_tsc.js', '-p', 'tsconfig.audio-reactive.json', '--noEmit'], category: 'portable-core' },
  { id: 'verify:audio-reactive:check', command: nodeBin, args: ['scripts/check-audio-reactive.mjs'], category: 'portable-core' },
  { id: 'verify:audio-reactive', command: nodeBin, args: ['scripts/verify-audio-reactive.mjs'], category: 'portable-core' },
  { id: 'typecheck', command: nodeBin, args: ['./node_modules/typescript/lib/_tsc.js', '--noEmit'], category: 'portable-core' },
  { id: 'build', command: nodeBin, args: ['scripts/run-vite.mjs', 'build'], category: 'host-runtime', requiresHostRuntime: true },
  { id: 'verify:phase4', command: nodeBin, args: ['scripts/verify-phase4.mjs'], category: 'host-runtime', requiresHostRuntime: true },
  { id: 'verify:phase5', command: nodeBin, args: ['scripts/verify-phase5.mjs'], category: 'host-runtime', requiresHostRuntime: true },
  { id: 'verify:export', command: nodeBin, args: ['scripts/verify-export.mjs'], category: 'portable-core' }
];

const safeStepId = (value) => value.replace(/[^a-z0-9._-]+/gi, '_');
const parseLastJson = (text) => {
  const trimmed = String(text || '').trim();
  if (!trimmed) return null;
  const lastOpeningBrace = trimmed.lastIndexOf('\n{');
  const candidate = lastOpeningBrace >= 0 ? trimmed.slice(lastOpeningBrace + 1) : trimmed;
  try { return JSON.parse(candidate); } catch {}
  const match = trimmed.match(/\{[\s\S]*\}$/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
};
const rel = (filePath) => path.relative(ROOT_DIR, filePath);

function classifyPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return {
      execution: 'opaque',
      verificationTier: null,
      liveVerified: false,
      fallbackUsed: false,
      unresolvedLiveCoverage: false,
      blocked: false,
      reason: null,
    };
  }
  const verificationTier = typeof payload.verificationTier === 'string' ? payload.verificationTier : null;
  const liveVerified = payload.liveVerified === true;
  const fallbackUsed = payload.fallbackUsed === true;
  const unresolvedLiveCoverage = payload.unresolvedLiveCoverage === true;
  if (payload.failedStep === 'host-runtime' || verificationTier === 'host-runtime-blocked' || payload.blocked === true) {
    return {
      execution: 'blocked-host-runtime',
      verificationTier: verificationTier || 'host-runtime-blocked',
      liveVerified: false,
      fallbackUsed: false,
      unresolvedLiveCoverage: false,
      blocked: true,
      reason: payload.reason || 'host runtime blocked',
    };
  }
  if (verificationTier === 'live-browser' || verificationTier === 'live-browser-export') {
    return { execution: 'live', verificationTier, liveVerified: true, fallbackUsed: false, unresolvedLiveCoverage: false, blocked: false, reason: null };
  }
  if (verificationTier === 'inline-runtime-fallback' || verificationTier === 'inline-runtime-export-fallback') {
    return { execution: 'inline-runtime-fallback', verificationTier, liveVerified: false, fallbackUsed: true, unresolvedLiveCoverage: true, blocked: false, reason: null };
  }
  if (verificationTier === 'source-static-fallback') {
    return { execution: 'source-static-fallback', verificationTier, liveVerified: false, fallbackUsed: true, unresolvedLiveCoverage: true, blocked: false, reason: null };
  }
  if (verificationTier === 'pngjs-static-harness-fallback') {
    return { execution: 'pngjs-static-harness-fallback', verificationTier, liveVerified: false, fallbackUsed: true, unresolvedLiveCoverage: true, blocked: false, reason: null };
  }
  return {
    execution: 'direct',
    verificationTier,
    liveVerified,
    fallbackUsed,
    unresolvedLiveCoverage,
    blocked: false,
    reason: null,
  };
}

function runStep(step) {
  const startedAt = new Date().toISOString();
  const logPath = path.resolve(STEP_LOG_DIR, `${safeStepId(step.id)}.log`);

  if (step.requiresHostRuntime && hostSummary.failed > 0) {
    const payload = {
      blocked: true,
      failedStep: 'host-runtime',
      reason: 'current host is missing native runtime pieces required for this verification step',
      host: hostRuntime.host,
      hostDescriptor,
      summary: hostSummary,
      recommendedNextSteps: [
        'run npm install on the target host to refresh host-native optional packages',
        'rerun npm run verify:host-runtime',
        `rerun ${step.id}`
      ]
    };
    fs.writeFileSync(logPath, `${JSON.stringify(payload, null, 2)}\n`);
    return {
      id: step.id,
      category: step.category,
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: 0,
      passed: false,
      blocked: true,
      status: null,
      signal: null,
      execution: 'blocked-host-runtime',
      verificationTier: 'host-runtime-blocked',
      liveVerified: false,
      fallbackUsed: false,
      unresolvedLiveCoverage: false,
      reason: payload.reason,
      payload,
      logPath: rel(logPath),
      command: [step.command, ...step.args].join(' '),
    };
  }

  const result = spawnSync(step.command, step.args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 480000,
    maxBuffer: 1024 * 1024 * 8,
  });

  const combined = `${result.stdout || ''}${result.stderr || ''}`.trim();
  fs.writeFileSync(logPath, `${combined}\n`);
  const payload = parseLastJson(combined);
  const classified = classifyPayload(payload);
  const passed = result.status === 0 && !result.signal && classified.blocked !== true;

  return {
    id: step.id,
    category: step.category,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Math.max(0, Date.now() - Date.parse(startedAt)),
    passed,
    blocked: classified.blocked,
    status: result.status,
    signal: result.signal,
    execution: classified.execution,
    verificationTier: classified.verificationTier,
    liveVerified: classified.liveVerified,
    fallbackUsed: classified.fallbackUsed,
    unresolvedLiveCoverage: classified.unresolvedLiveCoverage,
    reason: classified.reason,
    payload,
    logPath: rel(logPath),
    command: [step.command, ...step.args].join(' '),
  };
}

function renderMarkdown(report) {
  const lines = [
    '# Core Portable Verification Report',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Run ID: ${report.runId}`,
    `- Host: ${report.hostDescriptor}`,
    `- Portable pass: ${report.portablePassCount}/${report.portableTotal}`,
    `- Blocked host-runtime steps: ${report.blockedCount}`,
    `- Portable progress: ${report.portableProgressPercent}%`,
    '',
    '## Host runtime summary',
    '',
    `- Checks: ${report.hostRuntime.total}`,
    `- Passed: ${report.hostRuntime.passed}`,
    `- Failed: ${report.hostRuntime.failed}`,
    ''
  ];

  if (report.hostRuntime.missingTargets.length === 0) {
    lines.push('- Missing targets: none');
  } else {
    lines.push('- Missing targets:');
    for (const item of report.hostRuntime.missingTargets) {
      lines.push(`  - ${item.runtime || 'runtime'} :: ${item.target}`);
    }
  }

  lines.push('', '## Step summary', '', '| Step | Category | Result | Execution | Tier | Notes |', '| --- | --- | --- | --- | --- | --- |');
  for (const step of report.steps) {
    const result = step.blocked ? 'BLOCKED' : (step.passed ? 'PASS' : 'FAIL');
    lines.push(`| ${step.id} | ${step.category} | ${result} | ${step.execution} | ${step.verificationTier || ''} | ${step.reason || ''} |`);
  }

  if (report.blockedSteps.length > 0) {
    lines.push('', '## Blocked steps', '');
    for (const step of report.blockedSteps) {
      lines.push(`- ${step.id}: ${step.reason}`);
    }
  }

  if (report.failedSteps.length > 0) {
    lines.push('', '## Failed steps', '');
    for (const step of report.failedSteps) {
      lines.push(`- ${step.id}: status=${step.status} signal=${step.signal || 'none'}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

fs.mkdirSync(STEP_LOG_DIR, { recursive: true });
const stepsRun = steps.map(runStep);
const portableSteps = stepsRun.filter((step) => step.category === 'portable-core');
const blockedSteps = stepsRun.filter((step) => step.blocked);
const failedSteps = stepsRun.filter((step) => !step.passed && !step.blocked);
const portablePassCount = portableSteps.filter((step) => step.passed).length;
const report = {
  generatedAt: new Date().toISOString(),
  runId,
  hostDescriptor,
  runStartedAt,
  runDir: rel(RUN_DIR),
  portableTotal: portableSteps.length,
  portablePassCount,
  portableProgressPercent: Number(((portablePassCount / Math.max(portableSteps.length, 1)) * 100).toFixed(1)),
  blockedCount: blockedSteps.length,
  failedCount: failedSteps.length,
  hostRuntime: hostSummary,
  steps: stepsRun,
  blockedSteps,
  failedSteps,
};

fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true });
fs.writeFileSync(path.resolve(RUN_DIR, 'core-portable-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.resolve(RUN_DIR, 'core-portable-verification.md'), renderMarkdown(report));
fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(REPORT_MD_PATH, renderMarkdown(report));
console.log(JSON.stringify(report, null, 2));
process.exit(failedSteps.length > 0 ? 1 : 0);
