import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  getProofInputDir,
  getRealExportFixtureDir,
  listRealExportJsonFixtures,
} from './liveBrowserReadinessShared.mjs';
import {
  getIntelMacLiveBrowserProofFixtureDir,
  getIntelMacLiveBrowserProofInputDir,
  getIntelMacLiveBrowserProofSummaryPath,
  inspectLiveBrowserProofSummaryFile,
  inspectRealExportFixtureFile,
} from './intelMacLiveBrowserProofShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const hasFlag = (flag) => args.includes(flag);

const sourceDirArg = getArgValue('--source-dir');
if (!sourceDirArg) {
  console.error('[ingest-intel-mac-live-browser-proof] --source-dir is required');
  process.exit(1);
}
const sourceDir = path.resolve(rootDir, sourceDirArg);
if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
  console.error(`[ingest-intel-mac-live-browser-proof] source dir not found: ${sourceDir}`);
  process.exit(1);
}

const browserExecutablePath = getArgValue('--browser-executable-path');
const strict = hasFlag('--strict');
const writeArg = getArgValue('--write');
const writePath = writeArg ? path.resolve(rootDir, writeArg) : null;

const targetFixtureDir = getRealExportFixtureDir(rootDir);
const targetProofInputDir = getProofInputDir(rootDir);
const targetMetadataPath = path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-capture-metadata.json');
const sourceFixtureDirCandidates = [
  getIntelMacLiveBrowserProofFixtureDir(rootDir, sourceDir),
  sourceDir,
].filter((value, index, self) => self.indexOf(value) === index);
const sourceProofInputDirCandidates = [
  getIntelMacLiveBrowserProofInputDir(rootDir, sourceDir),
  sourceDir,
].filter((value, index, self) => self.indexOf(value) === index);
const sourceMetadataPath = path.join(sourceDir, 'capture-metadata.json');
const sourceProofSummaryPath = getIntelMacLiveBrowserProofSummaryPath(rootDir, sourceDir);

fs.mkdirSync(targetFixtureDir, { recursive: true });
fs.mkdirSync(targetProofInputDir, { recursive: true });
fs.mkdirSync(path.dirname(targetMetadataPath), { recursive: true });

const copiedFixtures = [];
const fixtureValidation = [];
for (const candidate of sourceFixtureDirCandidates) {
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isDirectory()) continue;
  for (const name of fs.readdirSync(candidate).filter((item) => /^kalokagathia-project-.+\.json$/i.test(item)).sort()) {
    const sourcePath = path.join(candidate, name);
    const inspection = inspectRealExportFixtureFile(sourcePath);
    fixtureValidation.push({ fileName: name, ok: inspection.ok, errors: inspection.errors, metadata: inspection.metadata });
    if (!inspection.ok) {
      console.error(`[ingest-intel-mac-live-browser-proof] invalid fixture: ${name}`);
      for (const error of inspection.errors) console.error(`- ${error}`);
      process.exit(1);
    }
    const targetPath = path.join(targetFixtureDir, name);
    fs.copyFileSync(sourcePath, targetPath);
    copiedFixtures.push(path.relative(rootDir, targetPath));
  }
}

const proofSummaryInspection = inspectLiveBrowserProofSummaryFile(sourceProofSummaryPath);
if (!proofSummaryInspection.ok) {
  console.error('[ingest-intel-mac-live-browser-proof] invalid proof summary json');
  for (const error of proofSummaryInspection.errors) console.error(`- ${error}`);
  process.exit(1);
}

const copiedProofFiles = [];
for (const candidate of sourceProofInputDirCandidates) {
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isDirectory()) continue;
  for (const name of fs.readdirSync(candidate).filter((item) => /\.(md|log|txt|json)$/i.test(item)).sort()) {
    const sourcePath = path.join(candidate, name);
    if (!fs.statSync(sourcePath).isFile()) continue;
    const targetPath = path.join(targetProofInputDir, name);
    fs.copyFileSync(sourcePath, targetPath);
    copiedProofFiles.push(path.relative(rootDir, targetPath));
  }
}

if (fs.existsSync(sourceMetadataPath) && fs.statSync(sourceMetadataPath).isFile()) {
  fs.copyFileSync(sourceMetadataPath, targetMetadataPath);
}

const commandLog = [];
const run = (label, command, commandArgs) => {
  const result = spawnSync(command, commandArgs, { cwd: rootDir, stdio: 'inherit' });
  commandLog.push({ label, command, args: commandArgs, status: result.status ?? 1 });
  if ((result.status ?? 1) !== 0) {
    console.error(`[ingest-intel-mac-live-browser-proof] failed: ${label}`);
    process.exit(result.status ?? 1);
  }
};

if (listRealExportJsonFixtures(rootDir).length === 0) {
  console.error('[ingest-intel-mac-live-browser-proof] no real-export fixture json files were found after copy');
  process.exit(1);
}

run('generate:phase5-real-export-manifest', process.execPath, ['scripts/generate-phase5-real-export-manifest.mjs']);
run('generate:phase5-real-export-readiness-report', process.execPath, ['scripts/generate-phase5-real-export-readiness-report.mjs']);
run('generate:phase5-proof-intake', process.execPath, ['scripts/generate-phase5-proof-intake.mjs']);
run('generate:intel-mac-live-browser-proof-projection-report', process.execPath, [
  'scripts/generate-intel-mac-live-browser-proof-projection-report.mjs',
  '--write-json', 'docs/archive/intel-mac-live-browser-proof-projection.json',
  '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-projection.md',
]);
run('generate:intel-mac-live-browser-proof-status-report', process.execPath, [
  'scripts/generate-intel-mac-live-browser-proof-status-report.mjs',
  '--write-json', 'docs/archive/intel-mac-live-browser-proof-status.json',
  '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-status.md',
]);

const readinessArgs = [
  'scripts/verify-target-live-browser-readiness.mjs',
  '--platform', 'darwin',
  '--arch', 'x64',
  '--home-dir', process.env.HOME || '~',
  '--write', 'docs/archive/target-live-browser-readiness-intel-mac.json',
];
if (browserExecutablePath) {
  readinessArgs.push('--browser-executable-path', browserExecutablePath);
}
if (strict) readinessArgs.push('--strict');
run('inspect:intel-mac-live-browser-readiness', process.execPath, readinessArgs);
run('doctor-package-handoff', process.execPath, ['scripts/doctor-package-handoff.mjs', '--write', 'docs/archive/package-handoff-doctor.json']);

const summary = {
  fixtureCount: copiedFixtures.length,
  proofFileCount: copiedProofFiles.length,
  browserExecutablePath: browserExecutablePath || null,
  commands: commandLog,
};
const report = {
  generatedAt: new Date().toISOString(),
  sourceDir: path.relative(rootDir, sourceDir),
  copiedFixtures,
  copiedProofFiles,
  copiedMetadataPath: fs.existsSync(targetMetadataPath) ? path.relative(rootDir, targetMetadataPath) : null,
  fixtureValidation,
  proofSummaryValidation: proofSummaryInspection,
  summary,
};

if (writePath) {
  fs.mkdirSync(path.dirname(writePath), { recursive: true });
  fs.writeFileSync(writePath, JSON.stringify(report, null, 2) + '\n', 'utf8');
}

console.log(`[ingest-intel-mac-live-browser-proof] fixtures=${summary.fixtureCount} proof-files=${summary.proofFileCount}`);
console.log('[ingest-intel-mac-live-browser-proof] regenerated manifest, readiness, proof intake, status report, and handoff doctor');
