import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { loadPackageJson, writeJson } from './packageIntegrityShared.mjs';
import { formatHostDescriptor, getHostDescriptor, resolvePlaywrightExecutable } from './hostRuntimeShared.mjs';
import {
  buildProofNotesCheck,
  buildRealExportFixtureCheck,
  buildRealExportManifestCheck,
  buildRealExportReadinessReportCheck,
} from './liveBrowserReadinessShared.mjs';

const require = createRequire(import.meta.url);
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
const packageJson = loadPackageJson(rootDir);
const dependencyNames = new Set([
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
  ...Object.keys(packageJson.optionalDependencies ?? {}),
]);

const host = getHostDescriptor();
const checks = [];
const playwrightPath = path.resolve(rootDir, 'node_modules/playwright');
checks.push({
  kind: 'node-module',
  target: 'node_modules/playwright',
  ok: dependencyNames.has('playwright') && fs.existsSync(playwrightPath),
});

const executableResolution = dependencyNames.has('playwright') ? resolvePlaywrightExecutable(rootDir, host) : { resolvedPath: null, resolvedSource: null, candidates: [] };
checks.push({
  kind: 'browser-executable',
  target: executableResolution.resolvedPath || executableResolution.candidates[0]?.path || 'playwright:chromium-executable',
  ok: Boolean(executableResolution.resolvedPath),
  executablePath: executableResolution.resolvedPath,
  executableSource: executableResolution.resolvedSource,
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
  missingTargets: missing.map((item) => ({ kind: item.kind, target: item.target })),
};
const report = {
  generatedAt: new Date().toISOString(),
  rootDir,
  host,
  hostLabel: formatHostDescriptor(host),
  summary,
  checks,
};
if (writePath) writeJson(writePath, report);

console.log(`[verify-live-browser-readiness] host=${report.hostLabel} ${summary.passed}/${summary.total} ok`);
if (summary.failed > 0) {
  console.log('[verify-live-browser-readiness] missing on current host:');
  for (const item of summary.missingTargets) console.log(`- ${item.kind}: ${item.target}`);
  console.log('[verify-live-browser-readiness] recommended next steps:');
  console.log('- run npx playwright install chromium on the target host');
  console.log('- capture at least one browser-export fixture into fixtures/project-state/real-export/kalokagathia-project-<slug>.json');
  console.log('- then run npm run generate:phase5-real-export-manifest and npm run generate:phase5-real-export-readiness-report');
  console.log('- keep notes in docs/archive/phase5-proof-input/real-export-capture-notes.md');
}

if (strict && summary.failed > 0) process.exit(1);
