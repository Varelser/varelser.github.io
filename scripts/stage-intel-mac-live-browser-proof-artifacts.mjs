import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  getIntelMacLiveBrowserProofFixtureDir,
  getIntelMacLiveBrowserProofInputDir,
  getIntelMacLiveBrowserProofNotesPath,
  getIntelMacLiveBrowserProofSummaryPath,
  inspectRealExportFixtureFile,
  readJsonSafe,
  readIntelMacLiveBrowserProofNotes,
} from './intelMacLiveBrowserProofShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);

const hasFlag = (flag) => args.includes(flag);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const getArgValues = (flag) => {
  const values = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === flag) values.push(args[index + 1] ?? '');
  }
  return values.filter(Boolean);
};

const sourceDirArg = getArgValue('--source-dir') || 'exports/intel-mac-live-browser-proof-drop';
const sourceDir = path.resolve(rootDir, sourceDirArg);
const fixtureDir = getIntelMacLiveBrowserProofFixtureDir(rootDir, sourceDir);
const proofInputDir = getIntelMacLiveBrowserProofInputDir(rootDir, sourceDir);
const screenshotsDir = path.join(proofInputDir, 'screenshots');
const logsDir = path.join(proofInputDir, 'logs');
const notesPath = getIntelMacLiveBrowserProofNotesPath(rootDir, sourceDir);
const summaryPath = getIntelMacLiveBrowserProofSummaryPath(rootDir, sourceDir);
const evidenceManifestPath = path.join(proofInputDir, 'evidence-manifest.json');
const writePath = path.resolve(rootDir, getArgValue('--write') || 'docs/archive/intel-mac-live-browser-proof-stage.json');

const realExportArgs = getArgValues('--real-export');
const screenshotArgs = getArgValues('--screenshot');
const logArgs = getArgValues('--log');
const artifactDirArgs = getArgValues('--artifact-dir');
const slugArg = getArgValue('--slug').trim();
const capturedAtArg = getArgValue('--captured-at').trim();
const browserExecutablePathArg = getArgValue('--browser-executable-path').trim();
const browserNameArg = getArgValue('--browser-name').trim() || 'Chromium';
const browserVersionArg = getArgValue('--browser-version').trim();
const notesArg = getArgValue('--notes').trim();
const homeDir = getArgValue('--home-dir') || process.env.HOME || '';
const dryRun = hasFlag('--dry-run');
const noAutoDetect = hasFlag('--no-auto-detect');
const allowInvalidExport = hasFlag('--allow-invalid-export');

for (const dir of [sourceDir, fixtureDir, proofInputDir, screenshotsDir, logsDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const normalizeAbs = (value) => {
  if (!value) return '';
  return path.isAbsolute(value) ? value : path.resolve(rootDir, value);
};
const unique = (items) => [...new Set(items.filter(Boolean))];
const toDropRelative = (absolutePath) => path.relative(sourceDir, absolutePath).replace(/\\/g, '/');
const fileSha256 = (filePath) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
const sanitizeFileName = (value) => value.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

const walkFiles = (dir) => {
  if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  const out = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolutePath);
      if (entry.isFile()) out.push(absolutePath);
    }
  }
  return out.sort();
};

const autoDetectLatestRealExport = () => {
  if (noAutoDetect) return [];
  const candidateDirs = unique([
    homeDir ? path.join(homeDir, 'Downloads') : '',
    homeDir ? path.join(homeDir, 'Desktop') : '',
    path.join(rootDir, 'fixtures', 'project-state', 'real-export'),
  ]);
  const candidates = [];
  for (const dir of candidateDirs) {
    for (const filePath of walkFiles(dir)) {
      const name = path.basename(filePath);
      if (/^kalokagathia-project-.+\.json$/i.test(name) && !filePath.startsWith(sourceDir)) {
        const stat = fs.statSync(filePath);
        candidates.push({ filePath, mtimeMs: stat.mtimeMs });
      }
    }
  }
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates.length > 0 ? [candidates[0].filePath] : [];
};

const resolveFiles = (values, matcher = null) => {
  const resolved = [];
  for (const value of values) {
    const absolutePath = normalizeAbs(value);
    if (!absolutePath || !fs.existsSync(absolutePath)) continue;
    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      for (const filePath of walkFiles(absolutePath)) {
        if (!matcher || matcher(filePath)) resolved.push(filePath);
      }
      continue;
    }
    if (stat.isFile() && (!matcher || matcher(absolutePath))) resolved.push(absolutePath);
  }
  return unique(resolved);
};

const screenshotMatcher = (filePath) => /\.(png|jpg|jpeg|webp)$/i.test(filePath);
const logMatcher = (filePath) => /\.(log|txt|json)$/i.test(filePath);
const realExportMatcher = (filePath) => /^kalokagathia-project-.+\.json$/i.test(path.basename(filePath));

const explicitRealExports = resolveFiles(realExportArgs, realExportMatcher);
const artifactDirFiles = resolveFiles(artifactDirArgs);
const screenshotCandidates = unique([
  ...resolveFiles(screenshotArgs, screenshotMatcher),
  ...artifactDirFiles.filter((filePath) => screenshotMatcher(filePath)),
]);
const logCandidates = unique([
  ...resolveFiles(logArgs, logMatcher),
  ...artifactDirFiles.filter((filePath) => logMatcher(filePath)),
]);
const realExportCandidates = unique(explicitRealExports.length > 0 ? explicitRealExports : autoDetectLatestRealExport());

const inferSlugFromFile = (filePath) => {
  const match = /^kalokagathia-project-(.+)\.json$/i.exec(path.basename(filePath));
  return match?.[1] ?? '';
};
const currentSummary = readJsonSafe(summaryPath) ?? {};
const currentCapture = currentSummary.capture && typeof currentSummary.capture === 'object' ? currentSummary.capture : {};
const currentBrowser = currentSummary.browser && typeof currentSummary.browser === 'object' ? currentSummary.browser : {};
const notesInfo = readIntelMacLiveBrowserProofNotes(rootDir, sourceDir);
const notesParsed = notesInfo.parsed ?? {};
const inferredSlug = slugArg || currentCapture.sourceProjectSlug || notesParsed.sourceProjectSlug || (realExportCandidates.length === 1 ? inferSlugFromFile(realExportCandidates[0]) : '');

const stageFile = (fromPath, toDir, preferredBaseName = '') => {
  const sourceName = preferredBaseName || path.basename(fromPath);
  const safeName = sanitizeFileName(sourceName);
  const destinationPath = path.join(toDir, safeName || path.basename(fromPath));
  if (!dryRun) fs.copyFileSync(fromPath, destinationPath);
  const stat = fs.statSync(fromPath);
  return {
    sourcePath: fromPath,
    sourceRelativePath: path.relative(rootDir, fromPath).replace(/\\/g, '/'),
    destinationPath,
    destinationRelativePath: toDropRelative(destinationPath),
    sizeBytes: stat.size,
    sha256: fileSha256(fromPath),
    mtimeIso: new Date(stat.mtimeMs).toISOString(),
  };
};

const stagedExports = [];
for (let index = 0; index < realExportCandidates.length; index += 1) {
  const fromPath = realExportCandidates[index];
  const baseName = inferredSlug && realExportCandidates.length === 1
    ? `kalokagathia-project-${inferredSlug}.json`
    : path.basename(fromPath);
  stagedExports.push(stageFile(fromPath, fixtureDir, baseName));
}
const stagedScreenshots = screenshotCandidates.map((fromPath) => stageFile(fromPath, screenshotsDir));
const stagedLogs = logCandidates.map((fromPath) => stageFile(fromPath, logsDir));

const manifestSourcePath = path.join(rootDir, 'fixtures', 'project-state', 'real-export', 'manifest.json');
let stagedManifest = null;
if (fs.existsSync(manifestSourcePath) && fs.statSync(manifestSourcePath).isFile()) {
  stagedManifest = stageFile(manifestSourcePath, fixtureDir, 'manifest.json');
}

const exportInspections = stagedExports.map((item) => inspectRealExportFixtureFile(item.sourcePath));
const invalidExports = exportInspections.filter((item) => !item.ok);
if (invalidExports.length > 0 && !allowInvalidExport) {
  console.error('[stage-intel-mac-live-browser-proof-artifacts] invalid real-export JSON detected');
  for (const item of invalidExports) {
    console.error(`- ${item.fileName}: ${item.errors.join('; ')}`);
  }
  process.exit(1);
}

const latestEvidenceMs = [...stagedExports, ...stagedScreenshots, ...stagedLogs]
  .map((item) => Date.parse(item.mtimeIso))
  .filter(Number.isFinite)
  .sort((a, b) => b - a)[0] ?? 0;
const capturedAt = capturedAtArg
  || currentCapture.capturedAt
  || notesParsed.exportTimestamp
  || (latestEvidenceMs > 0 ? new Date(latestEvidenceMs).toISOString() : '');
const browserExecutablePath = browserExecutablePathArg || currentBrowser.executablePath || notesParsed.browserExecutablePath || '';
const browserVersion = browserVersionArg || currentBrowser.version || notesParsed.browserVersion || '';
const notesText = notesArg || currentSummary.notes || notesParsed.notes || '- captured from Intel Mac real browser export session';
const hasMinimumEvidence = stagedExports.length > 0 && stagedScreenshots.length > 0 && stagedLogs.length > 0 && Boolean(browserExecutablePath) && Boolean(inferredSlug);
const summary = {
  status: hasMinimumEvidence ? 'captured' : 'pending',
  capture: {
    hostPlatform: 'darwin',
    hostArch: 'x64',
    capturedAt: capturedAt || '',
    sourceProjectSlug: inferredSlug || '',
  },
  browser: {
    name: browserNameArg || currentBrowser.name || 'Chromium',
    executablePath: browserExecutablePath,
    version: browserVersion,
  },
  artifacts: {
    exports: unique([
      ...stagedExports.map((item) => item.destinationRelativePath),
      ...(stagedManifest ? [stagedManifest.destinationRelativePath] : []),
    ]),
    screenshots: stagedScreenshots.map((item) => item.destinationRelativePath),
    logs: unique([
      ...stagedLogs.map((item) => item.destinationRelativePath),
      'phase5-proof-input/evidence-manifest.json',
    ]),
  },
  notes: notesText,
  captureMetadata: {
    targetHost: { platform: 'darwin', arch: 'x64' },
    stagedAt: new Date().toISOString(),
    sourceDir: path.relative(rootDir, sourceDir).replace(/\\/g, '/'),
  },
};

const evidenceManifest = {
  generatedAt: new Date().toISOString(),
  sourceDir: path.relative(rootDir, sourceDir).replace(/\\/g, '/'),
  slug: inferredSlug || null,
  capturedAt: capturedAt || null,
  browser: {
    name: summary.browser.name,
    executablePath: summary.browser.executablePath || null,
    version: summary.browser.version || null,
  },
  counts: {
    exports: stagedExports.length,
    screenshots: stagedScreenshots.length,
    logs: stagedLogs.length,
    invalidExports: invalidExports.length,
  },
  exports: stagedExports.map((item, index) => ({
    index,
    file: item.destinationRelativePath,
    source: item.sourceRelativePath,
    sizeBytes: item.sizeBytes,
    sha256: item.sha256,
    valid: exportInspections[index]?.ok ?? false,
    errors: exportInspections[index]?.errors ?? [],
  })),
  screenshots: stagedScreenshots.map((item) => ({
    file: item.destinationRelativePath,
    source: item.sourceRelativePath,
    sizeBytes: item.sizeBytes,
    sha256: item.sha256,
  })),
  logs: stagedLogs.map((item) => ({
    file: item.destinationRelativePath,
    source: item.sourceRelativePath,
    sizeBytes: item.sizeBytes,
    sha256: item.sha256,
  })),
};

const noteLines = [
  '# Intel Mac Real Export Capture Notes',
  '',
  '- host: darwin/x64 (Intel Mac)',
  `- browser executable path: ${summary.browser.executablePath}`,
  `- browser version: ${summary.browser.version}`,
  `- export timestamp: ${summary.capture.capturedAt}`,
  `- source project state slug: ${summary.capture.sourceProjectSlug}`,
  '- notes:',
  `  - ${notesText.replace(/\n+/g, '\n  - ')}`,
  `  - staged exports: ${stagedExports.length}`,
  `  - staged screenshots: ${stagedScreenshots.length}`,
  `  - staged logs: ${stagedLogs.length}`,
  '',
].join('\n');

if (!dryRun) {
  fs.writeFileSync(evidenceManifestPath, JSON.stringify(evidenceManifest, null, 2) + '\n', 'utf8');
  fs.writeFileSync(notesPath, noteLines, 'utf8');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');
}

const report = {
  generatedAt: new Date().toISOString(),
  sourceDir: path.relative(rootDir, sourceDir).replace(/\\/g, '/'),
  dryRun,
  inputs: {
    realExportCandidates: realExportCandidates.map((item) => path.relative(rootDir, item).replace(/\\/g, '/')),
    screenshotCandidates: screenshotCandidates.map((item) => path.relative(rootDir, item).replace(/\\/g, '/')),
    logCandidates: logCandidates.map((item) => path.relative(rootDir, item).replace(/\\/g, '/')),
    artifactDirs: artifactDirArgs.map((item) => normalizeAbs(item)).map((item) => path.relative(rootDir, item).replace(/\\/g, '/')),
    autoDetect: !noAutoDetect,
  },
  summary: {
    slug: inferredSlug || null,
    status: summary.status,
    exportCount: stagedExports.length,
    screenshotCount: stagedScreenshots.length,
    logCount: stagedLogs.length,
    invalidExportCount: invalidExports.length,
    browserExecutablePath: summary.browser.executablePath || null,
  },
  outputs: {
    proofSummary: toDropRelative(summaryPath),
    notes: toDropRelative(notesPath),
    evidenceManifest: toDropRelative(evidenceManifestPath),
  },
  nextAction: summary.status === 'captured'
    ? 'run npm run verify:intel-mac-live-browser-proof-drop and then npm run finalize:intel-mac-live-browser-proof'
    : 'add at least one screenshot, one log, browser executable path, and a real-export JSON, then rerun this stage step',
};

fs.mkdirSync(path.dirname(writePath), { recursive: true });
fs.writeFileSync(writePath, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(`[stage-intel-mac-live-browser-proof-artifacts] status=${summary.status} exports=${stagedExports.length} screenshots=${stagedScreenshots.length} logs=${stagedLogs.length} slug=${inferredSlug || 'missing'}`);
