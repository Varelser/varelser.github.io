import fs from 'node:fs';
import path from 'node:path';
import { writeJson } from './packageIntegrityShared.mjs';
import {
  getIntelMacLiveBrowserProofFixtureDir,
  getIntelMacLiveBrowserProofIncomingDir,
  getIntelMacLiveBrowserProofInputDir,
  getIntelMacLiveBrowserProofDropDir,
  getIntelMacLiveBrowserProofSummaryPath,
  inspectLiveBrowserProofSummaryFile,
  inspectRealExportFixtureFile,
  listIntelMacLiveBrowserProofBundles,
  listIntelMacLiveBrowserProofFixtures,
  listIntelMacLiveBrowserProofFiles,
  readJsonSafe,
} from './intelMacLiveBrowserProofShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};

const strict = hasFlag('--strict');
const sourceDirArg = getArgValue('--source-dir') || 'exports/intel-mac-live-browser-proof-drop';
const writeArg = getArgValue('--write') || 'docs/archive/intel-mac-live-browser-proof-drop-check.json';
const sourceDir = path.resolve(rootDir, sourceDirArg);
const writePath = path.resolve(rootDir, writeArg);
const fixtureDir = getIntelMacLiveBrowserProofFixtureDir(rootDir, sourceDir);
const incomingDir = getIntelMacLiveBrowserProofIncomingDir(rootDir, sourceDir);
const proofInputDir = getIntelMacLiveBrowserProofInputDir(rootDir, sourceDir);
const metadataPath = path.join(sourceDir, 'capture-metadata.json');
const readmePath = path.join(sourceDir, 'README.md');
const notesPath = path.join(proofInputDir, 'real-export-capture-notes.md');
const proofSummaryPath = getIntelMacLiveBrowserProofSummaryPath(rootDir, sourceDir);

const bundleNames = listIntelMacLiveBrowserProofBundles(rootDir, sourceDir);
const fixtureNames = listIntelMacLiveBrowserProofFixtures(rootDir, sourceDir);
const proofFiles = listIntelMacLiveBrowserProofFiles(rootDir, sourceDir);
const metadata = readJsonSafe(metadataPath);
const fixtureInspections = fixtureNames.map((name) => inspectRealExportFixtureFile(path.join(fixtureDir, name)));
const invalidFixtures = fixtureInspections.filter((item) => !item.ok);
const parsedFixtures = fixtureInspections.filter((item) => item.parsed).length;
const proofSummaryInspection = inspectLiveBrowserProofSummaryFile(proofSummaryPath, sourceDir);
const structuredProofFiles = proofFiles.filter((name) => /\.(log|txt|json)$/i.test(name) && !/^(real-export-proof\.json|real-export-capture-notes\.md)$/i.test(name));
const proofSummaryArtifacts = proofSummaryInspection.artifacts ?? { screenshots: [], logs: [], exports: [] };
const missingProofSummaryArtifacts = [
  ...proofSummaryArtifacts.screenshots,
  ...proofSummaryArtifacts.logs,
  ...proofSummaryArtifacts.exports,
].filter((item) => !item.exists);

const checks = [
  {
    kind: 'drop-dir',
    target: path.relative(rootDir, sourceDir),
    ok: fs.existsSync(sourceDir) && fs.statSync(sourceDir).isDirectory(),
  },
  {
    kind: 'drop-readme',
    target: path.relative(rootDir, readmePath),
    ok: fs.existsSync(readmePath),
  },
  {
    kind: 'drop-metadata',
    target: path.relative(rootDir, metadataPath),
    ok: Boolean(metadata && metadata.targetHost?.platform === 'darwin' && metadata.targetHost?.arch === 'x64'),
  },
  {
    kind: 'proof-notes',
    target: path.relative(rootDir, notesPath),
    ok: fs.existsSync(notesPath),
  },
  {
    kind: 'incoming-bundle-zip',
    target: `${path.relative(rootDir, incomingDir)}/*.zip`,
    ok: bundleNames.length > 0,
    bundleCount: bundleNames.length,
    bundleNames,
  },
  {
    kind: 'fixture-json',
    target: `${path.relative(rootDir, fixtureDir)}/kalokagathia-project-*.json`,
    ok: fixtureNames.length > 0,
    bundleCount: bundleNames.length,
    fixtureCount: fixtureNames.length,
    fixtureNames,
  },
  {
    kind: 'fixture-json-valid',
    target: `${path.relative(rootDir, fixtureDir)}/kalokagathia-project-*.json`,
    ok: fixtureNames.length > 0 && invalidFixtures.length === 0,
    parsedFixtures,
    invalidFixtureCount: invalidFixtures.length,
    invalidFixtures: invalidFixtures.map((item) => ({ fileName: item.fileName, errors: item.errors })),
  },
  {
    kind: 'proof-summary-json',
    target: path.relative(rootDir, proofSummaryPath),
    ok: proofSummaryInspection.ok,
    parsed: proofSummaryInspection.parsed,
    errors: proofSummaryInspection.errors,
    metadata: proofSummaryInspection.metadata,
  },
  {
    kind: 'proof-summary-artifact-paths',
    target: 'listed paths in real-export-proof.json',
    ok: proofSummaryInspection.ok && missingProofSummaryArtifacts.length === 0,
    missingArtifactCount: missingProofSummaryArtifacts.length,
    missingArtifacts: missingProofSummaryArtifacts.map((item) => item.listedPath),
  },
  {
    kind: 'proof-summary-project-linkage',
    target: 'capture.sourceProjectSlug -> artifacts.exports',
    ok: proofSummaryInspection.ok && Boolean(proofSummaryInspection.metadata?.slugLinked),
    sourceProjectSlug: proofSummaryInspection.metadata?.sourceProjectSlug ?? null,
  },
  {
    kind: 'structured-proof-files',
    target: `${path.relative(rootDir, path.join(proofInputDir, 'logs'))}/*.(log|txt|json)` ,
    ok: structuredProofFiles.length > 0,
    proofFileCount: structuredProofFiles.length,
    proofFiles: structuredProofFiles,
  },
];

const missing = checks.filter((item) => !item.ok);
const report = {
  generatedAt: new Date().toISOString(),
  sourceDir: path.relative(rootDir, sourceDir),
  summary: {
    total: checks.length,
    passed: checks.length - missing.length,
    failed: missing.length,
    bundleCount: bundleNames.length,
    fixtureCount: fixtureNames.length,
    parsedFixtureCount: parsedFixtures,
    invalidFixtureCount: invalidFixtures.length,
    proofFileCount: proofFiles.length,
    structuredProofFileCount: structuredProofFiles.length,
    missingProofSummaryArtifactCount: missingProofSummaryArtifacts.length,
  },
  checks,
  proofFiles,
  fixtureInspections,
  recommendedNextSteps: [
    'optionally drop one bundle zip into exports/intel-mac-live-browser-proof-drop/incoming/ and let the pipeline auto-extract it',
    'run npm run scaffold:intel-mac-live-browser-proof-drop if the drop directory is missing',
    'place at least one real browser export json into exports/intel-mac-live-browser-proof-drop/real-export/',
    'make sure the dropped fixture JSON parses and still contains schema/presets/manifest.execution/serialization.layers',
    'keep notes in exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-capture-notes.md',
    'run npm run draft:intel-mac-live-browser-proof-summary to auto-populate real-export-proof.json from dropped files',
    'edit phase5-proof-input/real-export-proof.json and set status=captured with browser path, timestamps, sourceProjectSlug, exports, screenshots, and logs',
    'make every path listed in real-export-proof.json point at an existing file under the drop directory',
    'add at least one structured proof artifact under phase5-proof-input/logs/ (.log, .txt, or .json)',
    'then run npm run finalize:intel-mac-live-browser-proof -- --browser-executable-path <actual path>',
  ],
};

fs.mkdirSync(path.dirname(writePath), { recursive: true });
writeJson(writePath, report);
console.log(`[verify-intel-mac-live-browser-proof-drop] ${report.summary.passed}/${report.summary.total} ok fixtures=${fixtureNames.length} invalid=${invalidFixtures.length} proofFiles=${proofFiles.length}`);
if (missing.length > 0) {
  console.log('[verify-intel-mac-live-browser-proof-drop] missing:');
  for (const item of missing) console.log(`- ${item.kind}: ${item.target}`);
}
if (strict && missing.length > 0) process.exit(1);
