import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  getIntelMacLiveBrowserProofIncomingDir,
  listIntelMacLiveBrowserProofBundles,
} from './intelMacLiveBrowserProofShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const hasFlag = (flag) => args.includes(flag);

const sourceDirArg = getArgValue('--source-dir') || 'exports/intel-mac-live-browser-proof-drop';
const sourceDir = path.resolve(rootDir, sourceDirArg);
const incomingDir = getIntelMacLiveBrowserProofIncomingDir(rootDir, sourceDir);
const writePath = path.resolve(rootDir, getArgValue('--write') || 'docs/archive/intel-mac-live-browser-proof-bundle-extract.json');
const explicitBundleArg = getArgValue('--bundle-path');
const keepBundle = hasFlag('--keep-bundle');

const writeReport = (report) => {
  fs.mkdirSync(path.dirname(writePath), { recursive: true });
  fs.writeFileSync(writePath, JSON.stringify(report, null, 2) + '\n', 'utf8');
};

const bundleCandidates = explicitBundleArg
  ? [path.isAbsolute(explicitBundleArg) ? explicitBundleArg : path.resolve(rootDir, explicitBundleArg)]
  : listIntelMacLiveBrowserProofBundles(rootDir, sourceDir).map((name) => path.join(incomingDir, name));

const report = {
  generatedAt: new Date().toISOString(),
  sourceDir: path.relative(rootDir, sourceDir),
  incomingDir: path.relative(rootDir, incomingDir),
  bundleCount: bundleCandidates.length,
  bundlePath: null,
  extracted: false,
  removedBundle: false,
  extractedEntries: [],
  warnings: [],
};

if (bundleCandidates.length === 0) {
  report.warnings.push('no bundle zip found');
  writeReport(report);
  console.log('[extract-intel-mac-live-browser-proof-bundle] skipped: no bundle zip found');
  process.exit(0);
}

if (bundleCandidates.length > 1 && !explicitBundleArg) {
  report.warnings.push('multiple bundle zips found; pass --bundle-path to disambiguate');
  report.bundleCandidates = bundleCandidates.map((item) => path.relative(rootDir, item));
  writeReport(report);
  console.error('[extract-intel-mac-live-browser-proof-bundle] multiple bundle zips found');
  process.exit(1);
}

const bundlePath = bundleCandidates[0];
report.bundlePath = path.relative(rootDir, bundlePath);
if (!fs.existsSync(bundlePath)) {
  report.warnings.push('bundle path missing');
  writeReport(report);
  console.error('[extract-intel-mac-live-browser-proof-bundle] bundle path missing');
  process.exit(1);
}

const listResult = spawnSync('unzip', ['-Z1', bundlePath], { cwd: rootDir, encoding: 'utf8' });
if ((listResult.status ?? 1) !== 0) {
  report.warnings.push('failed to inspect bundle with unzip -Z1');
  report.stderr = (listResult.stderr || '').trim();
  writeReport(report);
  console.error('[extract-intel-mac-live-browser-proof-bundle] failed to inspect bundle');
  process.exit(listResult.status ?? 1);
}

const entries = (listResult.stdout || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
report.extractedEntries = entries;
const topSegments = [...new Set(entries.map((item) => item.split('/')[0]).filter(Boolean))];
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kalo-proof-bundle-'));
const unzipResult = spawnSync('unzip', ['-oq', bundlePath, '-d', tempDir], { cwd: rootDir, encoding: 'utf8' });
if ((unzipResult.status ?? 1) !== 0) {
  report.warnings.push('failed to unzip bundle');
  report.stderr = (unzipResult.stderr || '').trim();
  writeReport(report);
  console.error('[extract-intel-mac-live-browser-proof-bundle] failed to unzip bundle');
  process.exit(unzipResult.status ?? 1);
}

let extractRoot = tempDir;
if (topSegments.length === 1) {
  const candidate = path.join(tempDir, topSegments[0]);
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    extractRoot = candidate;
  }
}

for (const name of fs.readdirSync(extractRoot)) {
  const fromPath = path.join(extractRoot, name);
  const toPath = path.join(sourceDir, name);
  fs.rmSync(toPath, { recursive: true, force: true });
  fs.renameSync(fromPath, toPath);
}
fs.rmSync(tempDir, { recursive: true, force: true });
report.extracted = true;
if (!keepBundle) {
  fs.rmSync(bundlePath, { force: true });
  report.removedBundle = true;
}

writeReport(report);
console.log(`[extract-intel-mac-live-browser-proof-bundle] extracted=${entries.length} bundle=${path.relative(rootDir, bundlePath)}`);
