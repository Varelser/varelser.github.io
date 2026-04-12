import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync, spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { formatHostDescriptor, getHostDescriptor, resolvePlaywrightExecutable } from './hostRuntimeShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getArgValue = (flag, fallback = '') => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
};

const dryRun = hasFlag('--dry-run');
const refreshOptional = hasFlag('--refresh-optional');
const installPlaywrightChromium = hasFlag('--install-playwright-chromium');
const skipProofPipeline = hasFlag('--skip-proof-pipeline');
const strictTargetHost = !hasFlag('--allow-non-target-host');
const port = Number(getArgValue('--port', '3000')) || 3000;
const host = getArgValue('--host', '127.0.0.1');
const homeDir = getArgValue('--home-dir', process.env.HOME || os.homedir() || '~');
const explicitBrowserPath = getArgValue('--browser-executable-path', '').trim();
const sourceDirArg = getArgValue('--source-dir', 'exports/intel-mac-live-browser-proof-drop');
const writePath = path.resolve(rootDir, getArgValue('--write', 'docs/archive/target-host-intel-mac-closeout.json'));
const writeMarkdownPath = path.resolve(rootDir, getArgValue('--write-markdown', 'docs/archive/target-host-intel-mac-closeout.md'));
const logsDir = path.resolve(rootDir, getArgValue('--logs-dir', 'docs/archive/target-host-intel-mac-closeout-logs'));
const serverLogPath = path.join(logsDir, 'vite-live-server.log');
const nodeBin = process.execPath;
const appUrl = `http://${host}:${port}/`;

const targetHost = { platform: 'darwin', arch: 'x64' };
const currentHost = getHostDescriptor();
const runId = new Date().toISOString().replace(/[\:.]/g, '-');

const ensureDir = (targetPath) => fs.mkdirSync(targetPath, { recursive: true });
const writeJson = (filePath, payload) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
};
const writeText = (filePath, text) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, text);
};

const browserResolution = resolvePlaywrightExecutable(rootDir, { platform: 'darwin', arch: 'x64', libc: null }, homeDir, explicitBrowserPath || null);
const resolvedBrowserPath = explicitBrowserPath || browserResolution.resolvedPath || '';

ensureDir(logsDir);

const results = [];
let liveServer = null;
let liveServerStarted = false;

const buildStepResult = ({ id, command, args: commandArgs = [], status = 'skipped', ok = false, blocked = false, skipped = false, reason = null, stdout = '', stderr = '', extra = {} }) => ({
  id,
  command: [command, ...commandArgs].join(' ').trim(),
  status,
  ok,
  blocked,
  skipped,
  reason,
  stdoutTail: String(stdout || '').trim().split(/\r?\n/).slice(-40).join('\n'),
  stderrTail: String(stderr || '').trim().split(/\r?\n/).slice(-40).join('\n'),
  ...extra,
});

const runCommand = (id, command, commandArgs, options = {}) => {
  if (dryRun) {
    const result = buildStepResult({ id, command, args: commandArgs, status: 'dry-run', ok: true, skipped: true, reason: 'dry-run', extra: { envApplied: options.env ? Object.keys(options.env) : [] } });
    results.push(result);
    return result;
  }
  const result = spawnSync(command, commandArgs, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: 'pipe',
    env: { ...process.env, ...(options.env || {}) },
    timeout: options.timeout ?? 900_000,
    maxBuffer: 1024 * 1024 * 32,
  });
  const ok = result.status === 0 && !result.signal && !result.error;
  const stepResult = buildStepResult({
    id,
    command,
    args: commandArgs,
    status: ok ? 'passed' : 'failed',
    ok,
    stdout: result.stdout,
    stderr: result.stderr || (result.error ? String(result.error) : ''),
    extra: {
      exitCode: result.status,
      signal: result.signal ?? null,
      timedOut: Boolean(result.error && /timed out/i.test(String(result.error?.message || ''))),
      envApplied: options.env ? Object.keys(options.env) : [],
    },
  });
  results.push(stepResult);
  return stepResult;
};

const addSynthetic = (id, status, reason, extra = {}) => {
  const item = buildStepResult({ id, command: 'internal', status, ok: status === 'passed', blocked: status === 'blocked', skipped: status === 'skipped', reason, extra });
  results.push(item);
  return item;
};

const waitForServer = async (url, timeoutMs = 120_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok || response.status === 404) return { ok: true, status: response.status };
    } catch {}
    await delay(1000);
  }
  return { ok: false, status: null };
};

const startLiveServer = async () => {
  if (dryRun) {
    liveServerStarted = true;
    addSynthetic('live-server', 'skipped', 'dry-run');
    return true;
  }
  const logStream = fs.createWriteStream(serverLogPath, { flags: 'w' });
  liveServer = spawn(nodeBin, ['scripts/run-vite.mjs', '--host', host, '--port', String(port)], {
    cwd: rootDir,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  liveServer.stdout.on('data', (chunk) => logStream.write(chunk));
  liveServer.stderr.on('data', (chunk) => logStream.write(chunk));
  liveServer.on('close', (code, signal) => {
    logStream.write(`\n[live-server] closed code=${code} signal=${signal}\n`);
    logStream.end();
  });
  const readiness = await waitForServer(appUrl, 120_000);
  if (!readiness.ok) {
    try { liveServer.kill('SIGTERM'); } catch {}
    addSynthetic('live-server', 'failed', 'vite dev server did not become ready within timeout', { logPath: path.relative(rootDir, serverLogPath) });
    return false;
  }
  liveServerStarted = true;
  addSynthetic('live-server', 'passed', 'vite dev server ready for live browser verification', { appUrl, logPath: path.relative(rootDir, serverLogPath) });
  return true;
};

const stopLiveServer = async () => {
  if (!liveServer) return;
  try {
    liveServer.kill('SIGTERM');
    await delay(1500);
    if (!liveServer.killed) liveServer.kill('SIGKILL');
  } catch {}
};

const renderMarkdown = (report) => {
  const lines = [
    '# Target Host Intel Mac Closeout',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Run ID: ${report.runId}`,
    `- Target host: ${report.targetHost}`,
    `- Current host: ${report.currentHost}`,
    `- Dry run: ${report.dryRun ? 'yes' : 'no'}`,
    `- Browser executable: ${report.browserExecutablePath || 'missing'}`,
    `- Steps passed: ${report.summary.passed}`,
    `- Steps failed: ${report.summary.failed}`,
    `- Steps blocked: ${report.summary.blocked}`,
    `- Steps skipped: ${report.summary.skipped}`,
    '',
    '## Steps',
    '',
    '| Step | Status | Reason |',
    '| --- | --- | --- |',
  ];
  for (const item of report.steps) {
    lines.push(`| ${item.id} | ${item.status.toUpperCase()} | ${String(item.reason || '').replace(/\|/g, '\\|')} |`);
  }
  lines.push('', '## Notes', '');
  for (const note of report.notes) lines.push(`- ${note}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
};

const notes = [];
if (strictTargetHost && !dryRun && !(currentHost.platform === targetHost.platform && currentHost.arch === targetHost.arch)) {
  const report = {
    generatedAt: new Date().toISOString(),
    runId,
    targetHost: `${targetHost.platform}/${targetHost.arch}`,
    currentHost: formatHostDescriptor(currentHost),
    dryRun,
    browserExecutablePath: resolvedBrowserPath || null,
    notes: ['This runner is intended to execute on the Intel Mac target host.', 'Use --allow-non-target-host only for syntax or dry-run checks.'],
    summary: { passed: 0, failed: 0, blocked: 1, skipped: 0 },
    steps: [buildStepResult({ id: 'target-host-guard', command: 'internal', status: 'blocked', blocked: true, reason: `current host ${formatHostDescriptor(currentHost)} is not darwin/x64` })],
  };
  writeJson(writePath, report);
  writeText(writeMarkdownPath, renderMarkdown(report));
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

if (!resolvedBrowserPath) {
  notes.push('Playwright Chromium executable is not currently resolved. Use --install-playwright-chromium or pass --browser-executable-path on the target host.');
}

const execute = async () => {
  if (refreshOptional) runCommand('npm-install-optional', 'npm', ['install', '--include=optional'], { timeout: 1_800_000 });
  else addSynthetic('npm-install-optional', 'skipped', 'not requested');

  if (installPlaywrightChromium) runCommand('playwright-install-chromium', 'npx', ['playwright', 'install', 'chromium'], { timeout: 1_800_000 });
  else addSynthetic('playwright-install-chromium', 'skipped', 'not requested');

  if (explicitBrowserPath) {
    notes.push(`browser executable override supplied: ${explicitBrowserPath}`);
  } else if (browserResolution.resolvedPath) {
    notes.push(`browser executable resolved from ${browserResolution.resolvedSource}: ${browserResolution.resolvedPath}`);
  }

  runCommand('inspect-intel-mac-runtime', nodeBin, ['scripts/verify-target-host-runtime.mjs', '--platform', 'darwin', '--arch', 'x64', '--write', 'docs/archive/target-host-runtime-intel-mac.json']);

  const liveReadinessArgs = ['scripts/verify-target-live-browser-readiness.mjs', '--platform', 'darwin', '--arch', 'x64', '--home-dir', homeDir, '--write', 'docs/archive/target-live-browser-readiness-intel-mac.json'];
  if (resolvedBrowserPath) liveReadinessArgs.push('--browser-executable-path', resolvedBrowserPath);
  runCommand('inspect-intel-mac-live-browser-readiness', nodeBin, liveReadinessArgs);

  runCommand('build', 'npm', ['run', 'build'], { timeout: 1_800_000 });
  runCommand('verify-phase4', 'npm', ['run', 'verify:phase4'], { timeout: 1_800_000 });
  runCommand('verify-phase5', 'npm', ['run', 'verify:phase5'], { timeout: 1_800_000 });

  const liveReady = await startLiveServer();
  if (liveReady) {
    runCommand('verify-all-browser-live', nodeBin, ['scripts/verify-suite.mjs'], {
      timeout: 1_800_000,
      env: {
        VERIFY_RUNTIME_MODE: 'live',
        VERIFY_SUITE_ONLY: 'verify:public-ui,verify:audio,verify:video,verify:frames,verify:library,verify:collision,verify:standalone-synth,verify:video-audio,verify:shared-audio',
        APP_URL: appUrl,
        ...(resolvedBrowserPath ? { PLAYWRIGHT_EXECUTABLE_PATH: resolvedBrowserPath } : {}),
      },
    });
  } else {
    addSynthetic('verify-all-browser-live', 'blocked', 'live browser verification skipped because dev server did not become ready');
  }

  if (!skipProofPipeline) {
    const proofArgs = ['scripts/run-intel-mac-live-browser-proof-pipeline.mjs', '--source-dir', sourceDirArg, '--home-dir', homeDir, '--write', 'docs/archive/intel-mac-live-browser-proof-pipeline.json', '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-pipeline.md'];
    if (resolvedBrowserPath) proofArgs.push('--browser-executable-path', resolvedBrowserPath);
    runCommand('intel-mac-live-browser-proof-pipeline', nodeBin, proofArgs, { timeout: 1_800_000 });
  } else {
    addSynthetic('intel-mac-live-browser-proof-pipeline', 'skipped', 'proof pipeline explicitly skipped');
  }

  runCommand('doctor-package-handoff', nodeBin, ['scripts/doctor-package-handoff.mjs', '--write', 'docs/archive/package-handoff-doctor.json']);
};

try {
  await execute();
} finally {
  await stopLiveServer();
}

const summary = results.reduce((acc, item) => {
  if (item.status === 'passed') acc.passed += 1;
  else if (item.status === 'failed') acc.failed += 1;
  else if (item.status === 'blocked') acc.blocked += 1;
  else acc.skipped += 1;
  return acc;
}, { passed: 0, failed: 0, blocked: 0, skipped: 0 });

const report = {
  generatedAt: new Date().toISOString(),
  runId,
  targetHost: `${targetHost.platform}/${targetHost.arch}`,
  currentHost: formatHostDescriptor(currentHost),
  dryRun,
  browserExecutablePath: resolvedBrowserPath || null,
  appUrl,
  logsDir: path.relative(rootDir, logsDir),
  notes,
  summary,
  steps: results,
};

writeJson(writePath, report);
writeText(writeMarkdownPath, renderMarkdown(report));
console.log(JSON.stringify(report, null, 2));
if (summary.failed > 0 || summary.blocked > 0) process.exit(1);
