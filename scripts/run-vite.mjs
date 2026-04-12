import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ensureRuntimeExecutables } from './ensure-runtime-executables.mjs';
import { buildHostRuntimeChecks, summarizeHostRuntimeChecks } from './hostRuntimeShared.mjs';
import { clearNativeQuarantine } from './nativeQuarantineShared.mjs';
import { loadPackageJson } from './packageIntegrityShared.mjs';

const ROOT_DIR = process.cwd();
const safeProjectId = path.basename(ROOT_DIR).replace(/[^a-z0-9._-]+/gi, '_').toLowerCase();
const OUT_DIR = path.resolve(os.tmpdir(), 'kalokagathia-vite', safeProjectId);
const META_PATH = path.resolve(OUT_DIR, 'last-vite-build.json');
const HTML_POSTBUILD_PRELOAD_EXCLUSION_PATTERNS = [
  /(^|\/)starter-library-(?:core|base|extensions|sequences|product-packs)-/,
];
const nodeBin = process.execPath;
const rawArgs = process.argv.slice(2);

const ensureConfigLoaderRunner = (args) => args.includes('--configLoader') ? args : ['--configLoader', 'runner', ...args];
const getCommand = (args) => args.find((arg) => !arg.startsWith('-')) || 'dev';
const getMode = (args) => {
  const index = args.findIndex((arg) => arg === '--mode');
  return index >= 0 && args[index + 1] ? args[index + 1] : process.env.MODE || '';
};
const canWriteDirectory = (targetPath) => {
  try { fs.accessSync(targetPath, fs.constants.W_OK | fs.constants.X_OK); return true; } catch { return false; }
};
const toAbsolutePath = (targetPath) => path.isAbsolute(targetPath) ? targetPath : path.resolve(ROOT_DIR, targetPath);
const canUseOutDir = (targetPath) => {
  const absoluteDir = toAbsolutePath(targetPath);
  if (fs.existsSync(absoluteDir)) {
    try { if (!fs.statSync(absoluteDir).isDirectory()) return false; } catch { return false; }
    return canWriteDirectory(absoluteDir);
  }
  return canWriteDirectory(path.dirname(absoluteDir));
};
const stripExcludedHtmlPreloads = (html) => html.replace(new RegExp('\\n?\\s*<link rel=\"modulepreload\" crossorigin href=\"([^\"]+)\">', 'g'), (match, href) => (
  HTML_POSTBUILD_PRELOAD_EXCLUSION_PATTERNS.some((pattern) => pattern.test(href)) ? '' : match
));

const chooseOutDir = (defaultOutDir) => {
  const requested = process.env.KALOKAGATHIA_OUT_DIR || defaultOutDir;
  if (canUseOutDir(requested)) return { selectedOutDir: requested, fallbackApplied: false, requestedOutDir: requested };
  const externalBaseDir = path.resolve(OUT_DIR, 'build-output');
  fs.mkdirSync(externalBaseDir, { recursive: true });
  const baseName = defaultOutDir.replace(/[^a-z0-9._-]+/gi, '-');
  let attempt = path.resolve(externalBaseDir, baseName);
  let counter = 1;
  while (!canUseOutDir(attempt)) { attempt = path.resolve(externalBaseDir, `${baseName}-${counter}`); counter += 1; }
  return { selectedOutDir: attempt, fallbackApplied: true, requestedOutDir: requested };
};

ensureRuntimeExecutables();

const packageJson = loadPackageJson(ROOT_DIR);
const hostRuntime = buildHostRuntimeChecks(ROOT_DIR, packageJson);
const hostRuntimeSummary = summarizeHostRuntimeChecks(hostRuntime.checks);

const args = ensureConfigLoaderRunner(rawArgs);
const command = getCommand(rawArgs);
const mode = getMode(rawArgs);
const defaultOutDir = mode === 'verify-inline' ? 'dist-verify-inline' : 'dist';
const buildTarget = command === 'build' ? chooseOutDir(defaultOutDir) : null;

if (buildTarget && hostRuntimeSummary.failed > 0) {
  console.error('[run-vite] current host is missing required native runtime pieces for Vite/Rollup/Playwright.');
  for (const item of hostRuntimeSummary.missingTargets) {
    console.error(`- ${item.runtime ?? item.kind}: ${item.target}`);
  }
  console.error('[run-vite] run npm install on this host, then rerun npm run verify:host-runtime and npm run build.');
  process.exit(1);
}

if (process.platform === 'darwin') {
  const quarantineRecovery = clearNativeQuarantine(ROOT_DIR);
  if (quarantineRecovery.supported && quarantineRecovery.clearedCount > 0) {
    console.error(`[run-vite] cleared quarantine from ${quarantineRecovery.clearedCount} native runtime binaries before launching Vite.`);
  }
  if (quarantineRecovery.failedCount > 0) {
    console.error(`[run-vite] failed to clear quarantine from ${quarantineRecovery.failedCount} native runtime binaries.`);
    for (const failure of quarantineRecovery.failedFiles.slice(0, 5)) {
      console.error(`- ${path.relative(ROOT_DIR, failure.filePath)}`);
    }
  }
}

if (buildTarget) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(buildTarget.selectedOutDir, { recursive: true });
  fs.writeFileSync(META_PATH, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    command,
    mode,
    defaultOutDir,
    requestedOutDir: buildTarget.requestedOutDir,
    selectedOutDir: buildTarget.selectedOutDir,
    fallbackApplied: buildTarget.fallbackApplied,
  }, null, 2)}\n`);
}

const result = spawnSync(nodeBin, ['./node_modules/vite/bin/vite.js', ...args], {
  cwd: ROOT_DIR,
  stdio: 'inherit',
  env: { ...process.env, ...(buildTarget ? { KALOKAGATHIA_OUT_DIR: buildTarget.selectedOutDir } : {}) },
});
if (result.error) { console.error(result.error); process.exit(1); }
if (result.status === 0 && buildTarget) {
  const indexHtmlPath = path.resolve(toAbsolutePath(buildTarget.selectedOutDir), 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    const currentHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    const nextHtml = stripExcludedHtmlPreloads(currentHtml);
    if (nextHtml !== currentHtml) fs.writeFileSync(indexHtmlPath, nextHtml);
  }
}
if (result.signal) process.kill(process.pid, result.signal);
process.exit(result.status ?? 0);
