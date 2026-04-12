import fs from 'node:fs';
import path from 'node:path';
import {
  getIntelMacLiveBrowserProofFixtureDir,
  getIntelMacLiveBrowserProofInputDir,
  getIntelMacLiveBrowserProofSummaryPath,
  listIntelMacLiveBrowserProofFixtures,
  readJsonSafe,
  readIntelMacLiveBrowserProofNotes,
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
const fixtureDir = getIntelMacLiveBrowserProofFixtureDir(rootDir, sourceDir);
const summaryPath = path.resolve(rootDir, getArgValue('--write') || path.relative(rootDir, getIntelMacLiveBrowserProofSummaryPath(rootDir, sourceDir)));
const metadataPath = path.join(sourceDir, 'capture-metadata.json');
const browserExecutablePathArg = getArgValue('--browser-executable-path').trim();
const browserNameArg = getArgValue('--browser-name').trim();
const browserVersionArg = getArgValue('--browser-version').trim();
const capturedAtArg = getArgValue('--captured-at').trim();
const forceCaptured = hasFlag('--force-captured');
const dryRun = hasFlag('--dry-run');

if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
  console.error(`[draft-intel-mac-live-browser-proof-summary] source dir not found: ${sourceDir}`);
  process.exit(1);
}

const metadata = readJsonSafe(metadataPath) ?? {};
const existing = readJsonSafe(summaryPath) ?? {};
const notesInfo = readIntelMacLiveBrowserProofNotes(rootDir, sourceDir);
const notesParsed = notesInfo.parsed ?? {};

const walkFiles = (dir) => {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  const out = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolutePath);
      } else if (entry.isFile()) {
        out.push(absolutePath);
      }
    }
  }
  return out.sort();
};

const toRelative = (absolutePath) => path.relative(sourceDir, absolutePath).replace(/\\/g, '/');

const allDropFiles = walkFiles(sourceDir);
const fixtureNames = listIntelMacLiveBrowserProofFixtures(rootDir, sourceDir);
const fixturePaths = fixtureNames.map((name) => path.join(fixtureDir, name)).filter((item) => fs.existsSync(item));
const screenshotPaths = allDropFiles.filter((filePath) => /\.(png|jpg|jpeg|webp)$/i.test(filePath));
const logPaths = allDropFiles.filter((filePath) => /\.(log|txt|json)$/i.test(filePath)).filter((filePath) => {
  const relativePath = toRelative(filePath);
  return relativePath !== 'capture-metadata.json' && relativePath !== 'phase5-proof-input/real-export-proof.json';
});
const exportPaths = [
  ...fixturePaths,
  path.join(fixtureDir, 'manifest.json'),
].filter((filePath, index, self) => fs.existsSync(filePath) && self.indexOf(filePath) === index);

const inferSlug = () => {
  const fixtureMatch = fixtureNames.length === 1
    ? /^kalokagathia-project-(.+)\.json$/i.exec(fixtureNames[0])
    : null;
  return fixtureMatch?.[1] ?? '';
};

const latestTimestamp = () => {
  const candidates = [...screenshotPaths, ...logPaths, ...exportPaths];
  if (candidates.length === 0) return '';
  const latestMs = Math.max(...candidates.map((item) => fs.statSync(item).mtimeMs));
  if (!Number.isFinite(latestMs) || latestMs <= 0) return '';
  return new Date(latestMs).toISOString();
};

const existingCapture = existing.capture && typeof existing.capture === 'object' ? existing.capture : {};
const existingBrowser = existing.browser && typeof existing.browser === 'object' ? existing.browser : {};
const inferredSlug =
  (typeof existingCapture.sourceProjectSlug === 'string' && existingCapture.sourceProjectSlug.trim()) ||
  notesParsed.sourceProjectSlug ||
  inferSlug();
const inferredCapturedAt =
  capturedAtArg ||
  (typeof existingCapture.capturedAt === 'string' && existingCapture.capturedAt.trim()) ||
  notesParsed.exportTimestamp ||
  latestTimestamp();
const inferredBrowserName =
  browserNameArg ||
  (typeof existingBrowser.name === 'string' && existingBrowser.name.trim()) ||
  'Chromium';
const inferredBrowserExecutablePath =
  browserExecutablePathArg ||
  (typeof existingBrowser.executablePath === 'string' && existingBrowser.executablePath.trim()) ||
  notesParsed.browserExecutablePath ||
  '';
const inferredBrowserVersion =
  browserVersionArg ||
  (typeof existingBrowser.version === 'string' && existingBrowser.version.trim()) ||
  notesParsed.browserVersion ||
  '';

const hasEvidence = exportPaths.length > 0 && screenshotPaths.length > 0 && logPaths.length > 0;
const status = forceCaptured || (hasEvidence && inferredBrowserExecutablePath && inferredSlug)
  ? 'captured'
  : 'pending';

const summary = {
  status,
  capture: {
    hostPlatform: 'darwin',
    hostArch: 'x64',
    capturedAt: status === 'captured' ? inferredCapturedAt : (inferredCapturedAt || ''),
    sourceProjectSlug: inferredSlug || '',
  },
  browser: {
    name: inferredBrowserName,
    executablePath: inferredBrowserExecutablePath,
    version: inferredBrowserVersion,
  },
  artifacts: {
    exports: exportPaths.map(toRelative),
    screenshots: screenshotPaths.map(toRelative),
    logs: logPaths.map(toRelative),
  },
  notes: (typeof existing.notes === 'string' && existing.notes.trim()) || notesParsed.notes || '',
  captureMetadata: metadata && typeof metadata === 'object'
    ? {
        targetHost: metadata.targetHost ?? null,
        generatedAt: metadata.generatedAt ?? null,
      }
    : null,
};

const report = {
  generatedAt: new Date().toISOString(),
  sourceDir: path.relative(rootDir, sourceDir),
  summaryPath: path.relative(rootDir, summaryPath),
  summary,
  discovered: {
    fixtureCount: exportPaths.length,
    screenshotCount: screenshotPaths.length,
    logCount: logPaths.length,
    inferredSlug: inferredSlug || null,
    inferredCapturedAt: inferredCapturedAt || null,
    notesPath: notesInfo.exists ? path.relative(rootDir, notesInfo.path) : null,
    notesUsed: {
      browserExecutablePath: Boolean(notesParsed.browserExecutablePath),
      exportTimestamp: Boolean(notesParsed.exportTimestamp),
      sourceProjectSlug: Boolean(notesParsed.sourceProjectSlug),
      browserVersion: Boolean(notesParsed.browserVersion),
      notes: Boolean(notesParsed.notes),
    },
  },
  nextAction: status === 'captured'
    ? 'run npm run finalize:intel-mac-live-browser-proof after verifying the generated summary content'
    : 'add missing executable path / sourceProjectSlug / evidence files, then rerun this draft step',
};

if (!dryRun) {
  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');
}

console.log(`[draft-intel-mac-live-browser-proof-summary] status=${status} fixtures=${exportPaths.length} screenshots=${screenshotPaths.length} logs=${logPaths.length} slug=${inferredSlug || 'missing'} notes=${Object.values(report.discovered.notesUsed).filter(Boolean).length}`);
console.log(JSON.stringify(report, null, 2));
