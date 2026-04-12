import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, '..');
const ALLOWED_MODES = new Set(['auto', 'live', 'static']);

const formatError = (error) => {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
};

export function resolveVerificationMode() {
  const requestedMode = String(process.env.VERIFY_RUNTIME_MODE || 'auto').trim().toLowerCase();
  return ALLOWED_MODES.has(requestedMode) ? requestedMode : 'auto';
}

export function getHostDiagnostics() {
  return {
    platform: process.platform,
    release: os.release(),
    arch: process.arch,
    node: process.version,
    requestedMode: resolveVerificationMode(),
    browserExecutableOverride: process.env.PLAYWRIGHT_EXECUTABLE_PATH || null,
    hostConstraints: [
      'sandbox may block browser-managed navigation to localhost/file/data URLs',
      'native browser binaries may be unavailable on constrained hosts'
    ]
  };
}

export function getChromiumLaunchOptions() {
  const candidates = [
    process.env.PLAYWRIGHT_EXECUTABLE_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome'
  ].filter(Boolean);

  const executablePath = candidates.find((candidate) => fs.existsSync(candidate));
  return executablePath
    ? {
        headless: true,
        executablePath,
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files', '--disable-web-security']
      }
    : { headless: true };
}

async function evaluateCheck(check) {
  const filePath = path.join(ROOT_DIR, check.file);
  let text = '';
  try {
    text = await fsp.readFile(filePath, 'utf8');
  } catch {
    return {
      label: check.label,
      file: check.file,
      pass: false,
      found: [],
      missing: check.markers
    };
  }

  const found = check.markers.filter((marker) => text.includes(marker));
  const pass = (check.match ?? 'all') === 'any'
    ? found.length > 0
    : found.length === check.markers.length;

  return {
    label: check.label,
    file: check.file,
    pass,
    found,
    missing: check.markers.filter((marker) => !found.includes(marker))
  };
}

export async function runStaticChecks({ verifier, appUrl, error, checks, extra = {} }) {
  const results = [];
  for (const check of checks) results.push(await evaluateCheck(check));

  return {
    verifier,
    appUrl,
    requestedMode: resolveVerificationMode(),
    effectiveMode: 'static',
    verificationTier: 'source-static-fallback',
    mode: 'static-fallback',
    liveAttempted: false,
    liveVerified: false,
    fallbackUsed: true,
    fallbackVerified: true,
    unresolvedLiveCoverage: true,
    reason: formatError(error),
    host: getHostDiagnostics(),
    checks: results,
    ...extra,
    passed: results.every((result) => result.pass)
  };
}

const buildBasePayload = ({ verifier, appUrl, requestedMode, effectiveMode, verificationTier, extra = {} }) => ({
  verifier,
  appUrl,
  requestedMode,
  effectiveMode,
  verificationTier,
  host: getHostDiagnostics(),
  ...extra,
});

export async function runVerification({ verifier, appUrl, live, fallback }) {
  const requestedMode = resolveVerificationMode();
  if (requestedMode === 'static') {
    const fallbackResult = await fallback(new Error('Static verification forced by VERIFY_RUNTIME_MODE=static.'));
    const payload = buildBasePayload({
      verifier,
      appUrl,
      requestedMode,
      effectiveMode: fallbackResult.effectiveMode ?? 'static',
      verificationTier: fallbackResult.verificationTier ?? 'source-static-fallback',
      extra: {
        liveAttempted: false,
        liveVerified: false,
        fallbackUsed: true,
        fallbackVerified: fallbackResult.passed !== false,
        unresolvedLiveCoverage: true,
        ...fallbackResult,
      },
    });
    console.log(JSON.stringify(payload, null, 2));
    if (fallbackResult.passed === false) process.exitCode = 1;
    return;
  }

  try {
    const result = await live();
    if (result && typeof result === 'object') {
      const payload = buildBasePayload({
        verifier,
        appUrl,
        requestedMode,
        effectiveMode: result.effectiveMode ?? 'live',
        verificationTier: result.verificationTier ?? 'live-browser',
        extra: {
          liveAttempted: true,
          liveVerified: true,
          fallbackUsed: false,
          fallbackVerified: false,
          unresolvedLiveCoverage: false,
          ...result,
        },
      });
      console.log(JSON.stringify(payload, null, 2));
      if (result.passed === false) process.exitCode = 1;
    }
  } catch (error) {
    if (requestedMode === 'live') {
      console.error(JSON.stringify(buildBasePayload({
        verifier,
        appUrl,
        requestedMode,
        effectiveMode: 'live',
        verificationTier: 'live-browser',
        extra: {
          passed: false,
          liveAttempted: true,
          liveVerified: false,
          fallbackUsed: false,
          fallbackVerified: false,
          unresolvedLiveCoverage: true,
          reason: formatError(error),
        },
      }), null, 2));
      process.exitCode = 1;
      return;
    }

    const fallbackResult = await fallback(error);
    const payload = buildBasePayload({
      verifier,
      appUrl,
      requestedMode,
      effectiveMode: fallbackResult.effectiveMode ?? 'static',
      verificationTier: fallbackResult.verificationTier ?? 'source-static-fallback',
      extra: {
        liveAttempted: true,
        liveVerified: false,
        liveError: formatError(error),
        fallbackUsed: true,
        fallbackVerified: fallbackResult.passed !== false,
        unresolvedLiveCoverage: true,
        ...fallbackResult,
      },
    });
    console.log(JSON.stringify(payload, null, 2));
    if (fallbackResult.passed === false) process.exitCode = 1;
  }
}
