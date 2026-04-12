import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT_DIR = process.cwd();
const stepId = String(process.env.VERIFY_STEP_ID || '').trim();
const command = String(process.env.VERIFY_STEP_COMMAND || '').trim();
const args = (() => {
  const raw = String(process.env.VERIFY_STEP_ARGS_JSON || '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((value) => String(value)) : [];
  } catch {
    return [];
  }
})();
const requestedMode = String(process.env.VERIFY_RUNTIME_MODE || 'static').trim().toLowerCase();
const stepEnv = (() => {
  const raw = String(process.env.VERIFY_STEP_ENV_JSON || '{}');
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? Object.fromEntries(Object.entries(parsed).map(([key, value]) => [String(key), String(value)]))
      : {};
  } catch {
    return {};
  }
})();
const reportPath = path.resolve(ROOT_DIR, String(process.env.VERIFY_STEP_REPORT_PATH || `docs/archive/verification-steps/${stepId}.json`));
const logPath = path.resolve(ROOT_DIR, String(process.env.VERIFY_STEP_LOG_PATH || `docs/archive/verification-steps/${stepId}.log`));
const timeoutMs = Number(process.env.VERIFY_STEP_TIMEOUT_MS || 480000);

if (!stepId || !command) {
  console.error(JSON.stringify({ passed: false, reason: 'VERIFY_STEP_ID or VERIFY_STEP_COMMAND missing.' }, null, 2));
  process.exit(2);
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.mkdirSync(path.dirname(logPath), { recursive: true });

const logStream = fs.createWriteStream(logPath, { flags: 'w' });
const startedAt = new Date().toISOString();
const tailLines = [];
const maxTailLines = 120;

const appendChunk = (chunk) => {
  const text = String(chunk || '');
  if (!text) return;
  logStream.write(text);
  for (const line of text.split(/\r?\n/)) {
    tailLines.push(line);
    if (tailLines.length > maxTailLines) tailLines.shift();
  }
};

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

const classify = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return {
      execution: 'opaque',
      effectiveMode: 'unknown',
      verificationTier: null,
      liveAttempted: false,
      liveVerified: false,
      fallbackUsed: false,
      unresolvedLiveCoverage: false,
    };
  }

  const verificationTier = typeof payload.verificationTier === 'string' ? payload.verificationTier : null;
  const liveAttempted = payload.liveAttempted === true;
  const liveVerified = payload.liveVerified === true;
  const fallbackUsed = payload.fallbackUsed === true;
  const unresolvedLiveCoverage = payload.unresolvedLiveCoverage === true;

  const tierExecution = (() => {
    switch (verificationTier) {
      case 'live-browser':
      case 'live-browser-export':
        return 'live';
      case 'inline-runtime-fallback':
      case 'inline-runtime-export-fallback':
        return 'inline-runtime-fallback';
      case 'source-static-fallback':
        return 'source-static-fallback';
      case 'node-skia-runtime-fallback':
        return 'node-skia-runtime-fallback';
      case 'pngjs-static-harness-fallback':
        return 'pngjs-static-harness-fallback';
      default:
        return null;
    }
  })();

  if (tierExecution) {
    return {
      execution: tierExecution,
      effectiveMode: payload.effectiveMode ?? (liveVerified ? 'live' : 'fallback'),
      verificationTier,
      liveAttempted,
      liveVerified,
      fallbackUsed,
      unresolvedLiveCoverage,
    };
  }

  if (payload.mode === 'static-fallback') {
    return {
      execution: 'source-static-fallback',
      effectiveMode: payload.effectiveMode ?? 'static',
      verificationTier,
      liveAttempted,
      liveVerified,
      fallbackUsed: true,
      unresolvedLiveCoverage: true,
    };
  }
  if (payload.transport === 'inline-html') {
    return {
      execution: 'inline-runtime-fallback',
      effectiveMode: payload.effectiveMode ?? 'live',
      verificationTier,
      liveAttempted: true,
      liveVerified: false,
      fallbackUsed: true,
      unresolvedLiveCoverage: true,
    };
  }
  if (payload.renderPath === 'pngjs-harness') {
    return {
      execution: 'pngjs-static-harness-fallback',
      effectiveMode: payload.effectiveMode ?? 'fallback',
      verificationTier,
      liveAttempted: true,
      liveVerified: false,
      fallbackUsed: true,
      unresolvedLiveCoverage: true,
    };
  }
  if (payload.failedStep === 'host-runtime' || verificationTier === 'host-runtime-blocked') {
    return {
      execution: 'blocked-host-runtime',
      effectiveMode: 'blocked',
      verificationTier: verificationTier || 'host-runtime-blocked',
      liveAttempted: false,
      liveVerified: false,
      fallbackUsed: false,
      unresolvedLiveCoverage: false,
    };
  }
  if (payload.effectiveMode === 'live') {
    return {
      execution: 'live',
      effectiveMode: 'live',
      verificationTier,
      liveAttempted: true,
      liveVerified: true,
      fallbackUsed: false,
      unresolvedLiveCoverage: false,
    };
  }
  return {
    execution: 'direct',
    effectiveMode: payload.effectiveMode ?? 'direct',
    verificationTier,
    liveAttempted,
    liveVerified,
    fallbackUsed,
    unresolvedLiveCoverage,
  };
};

const child = spawn(command, args, {
  cwd: ROOT_DIR,
  env: { ...process.env, ...stepEnv, VERIFY_RUNTIME_MODE: requestedMode },
  stdio: ['ignore', 'pipe', 'pipe']
});

let timeout = null;
let settled = false;

const finalize = ({ status = null, signal = null, error = null, timedOut = false }) => {
  if (settled) return;
  settled = true;
  if (timeout) clearTimeout(timeout);
  logStream.end();

  const tail = tailLines.join('\n').trim();
  const payload = parseLastJson(tail);
  const classification = classify(payload);
  const report = {
    id: stepId,
    command,
    args,
    requestedMode,
    stepEnv,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Math.max(0, Date.now() - Date.parse(startedAt)),
    passed: !timedOut && !error && status === 0 && !signal,
    blocked: payload?.blocked === true || classification.execution === 'blocked-host-runtime',
    status,
    signal,
    timedOut,
    execution: classification.execution,
    effectiveMode: classification.effectiveMode,
    verificationTier: classification.verificationTier,
    liveAttempted: classification.liveAttempted,
    liveVerified: classification.liveVerified,
    fallbackUsed: classification.fallbackUsed,
    unresolvedLiveCoverage: classification.unresolvedLiveCoverage,
    payload,
    error: error ? String(error) : null,
    logPath: path.relative(ROOT_DIR, logPath),
    tail
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  if (timedOut) {
    console.error(`[verify-step-runner] ${stepId} timed out after ${timeoutMs}ms`);
    process.exitCode = 124;
    return;
  }
  if (error) {
    console.error(`[verify-step-runner] ${stepId} failed to spawn: ${error}`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = report.passed ? 0 : 1;
};

child.stdout.on('data', appendChunk);
child.stderr.on('data', appendChunk);
child.on('error', (error) => finalize({ error }));
child.on('close', (status, signal) => finalize({ status, signal }));

timeout = setTimeout(() => {
  appendChunk(`\n[verify-step-runner] timeout after ${timeoutMs}ms\n`);
  child.kill('SIGTERM');
  setTimeout(() => child.kill('SIGKILL'), 2000).unref();
  finalize({ status: null, signal: 'SIGTERM', timedOut: true });
}, timeoutMs);
