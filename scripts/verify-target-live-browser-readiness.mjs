import fs from 'node:fs';
import path from 'node:path';
import { loadPackageJson, writeJson } from './packageIntegrityShared.mjs';
import { formatHostDescriptor, resolvePlaywrightExecutable } from './hostRuntimeShared.mjs';
import {
  buildProofNotesCheck,
  buildRealExportFixtureCheck,
  buildRealExportManifestCheck,
  buildRealExportReadinessReportCheck,
} from './liveBrowserReadinessShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};

const strict = hasFlag('--strict');
const writeArg = getArgValue('--write');
const writePath = writeArg ? path.resolve(rootDir, writeArg) : null;
const homeDir = getArgValue('--home-dir') || '~';
const browserExecutableOverride = getArgValue('--browser-executable-path') || null;
const targetHost = {
  platform: getArgValue('--platform') || process.platform,
  arch: getArgValue('--arch') || process.arch,
  libc: getArgValue('--libc') || null,
};
if (targetHost.platform !== 'linux') targetHost.libc = null;

const packageJson = loadPackageJson(rootDir);
const dependencyNames = new Set([
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
  ...Object.keys(packageJson.optionalDependencies ?? {}),
]);
const checks = [];
const playwrightPath = path.resolve(rootDir, 'node_modules/playwright');
checks.push({
  kind: 'node-module',
  target: 'node_modules/playwright',
  ok: dependencyNames.has('playwright') && fs.existsSync(playwrightPath),
});

const executableResolution = resolvePlaywrightExecutable(rootDir, targetHost, homeDir, browserExecutableOverride);
checks.push({
  kind: 'browser-executable',
  target: executableResolution.resolvedPath || executableResolution.candidates[0]?.path || 'playwright:chromium-executable',
  ok: Boolean(executableResolution.resolvedPath),
  executablePath: executableResolution.resolvedPath,
  executableSource: executableResolution.resolvedSource,
  inferred: !browserExecutableOverride,
  candidatePaths: executableResolution.candidates.map((item) => item.path),
});

checks.push(buildRealExportFixtureCheck(rootDir));
checks.push(buildRealExportManifestCheck(rootDir));
checks.push(buildRealExportReadinessReportCheck(rootDir));
checks.push(buildProofNotesCheck(rootDir));

const missing = checks.filter((item) => !item.ok);
const summary = {
  total: checks.length,
  passed: checks.length - missing.length,
  failed: missing.length,
  missingTargets: missing.map((item) => ({
    kind: item.kind,
    target: item.target,
    executablePath: item.executablePath ?? null,
    inferred: item.inferred ?? false,
  })),
};
const report = {
  generatedAt: new Date().toISOString(),
  rootDir,
  targetHost,
  targetHostLabel: formatHostDescriptor(targetHost),
  summary,
  checks,
};
if (writePath) writeJson(writePath, report);

console.log(`[verify-target-live-browser-readiness] host=${report.targetHostLabel} ${summary.passed}/${summary.total} ok`);
if (summary.failed > 0) {
  console.log('[verify-target-live-browser-readiness] missing for target host:');
  for (const item of summary.missingTargets) console.log(`- ${item.kind}: ${item.target}`);
  console.log('[verify-target-live-browser-readiness] recommended next steps:');
  console.log('- on the target host, run npx playwright install chromium');
  console.log('- rerun this script; it will auto-detect common Playwright / Chrome-for-Testing paths on the target host');
  console.log('- or pass --browser-executable-path <actual path> to hard-verify a specific browser binary');
  console.log('- run npm run scaffold:intel-mac-live-browser-proof-drop');
  console.log('- place at least one real browser export fixture into exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-<slug>.json');
  console.log('- then run npm run ingest:intel-mac-live-browser-proof -- --source-dir exports/intel-mac-live-browser-proof-drop --browser-executable-path <actual path>');
  console.log('- keep notes in docs/archive/phase5-proof-input/real-export-capture-notes.md');
}
if (strict && summary.failed > 0) process.exit(1);
