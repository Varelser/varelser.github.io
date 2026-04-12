import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const projectName = path.basename(projectRoot);
const outputDir = path.join(projectRoot, 'docs', 'handoff', 'archive', 'generated', 'future-native-source-only-package');
const zipPath = path.join(outputDir, 'future-native-source-only.zip');
const manifestJsonPath = path.join(outputDir, 'future-native-source-only-manifest.json');
const manifestMdPath = path.join(outputDir, 'future-native-source-only-manifest.md');
const rehydrationJsonPath = path.join(outputDir, 'future-native-source-only-rehydration-report.json');
const rehydrationMdPath = path.join(outputDir, 'future-native-source-only-rehydration-report.md');

const excludedDirNames = new Set(['node_modules', 'dist', 'tmp']);
const excludedPrefixes = ['.tmp-', '.tmp_', 'out'];
const excludedRelativePaths = new Set([
  'docs/handoff/archive/generated/future-native-source-only-package',
]);

function isExcluded(relativePath, dirent) {
  if (!relativePath) return false;
  if (excludedRelativePaths.has(relativePath)) return true;
  const segments = relativePath.split(path.sep);
  if (segments.some((segment) => excludedDirNames.has(segment))) return true;
  if (segments.some((segment) => excludedPrefixes.some((prefix) => segment.startsWith(prefix)))) return true;
  if (dirent?.name && excludedDirNames.has(dirent.name)) return true;
  if (dirent?.name && excludedPrefixes.some((prefix) => dirent.name.startsWith(prefix))) return true;
  return false;
}

async function walkAndCopy(srcDir, destDir, summary, relativeDir = '') {
  const entries = await readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = relativeDir ? path.join(relativeDir, entry.name) : entry.name;
    if (isExcluded(relativePath, entry)) {
      summary.excluded.push(relativePath + (entry.isDirectory() ? '/' : ''));
      continue;
    }
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await mkdir(destPath, { recursive: true });
      summary.directories += 1;
      if (relativeDir === '') summary.topLevelEntries.add(entry.name);
      await walkAndCopy(srcPath, destPath, summary, relativePath);
      continue;
    }
    if (!entry.isFile()) continue;
    await cp(srcPath, destPath, { force: true });
    const fileStat = await stat(srcPath);
    summary.files += 1;
    summary.totalBytes += fileStat.size;
    if (relativeDir === '') summary.topLevelEntries.add(entry.name);
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex += 1;
  } while (value >= 1024 && unitIndex < units.length - 1);
  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

function runZip(cwd, archivePath, rootEntry) {
  return new Promise((resolve, reject) => {
    const child = spawn('zip', ['-qr', archivePath, rootEntry], { cwd, stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`zip exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function listZipEntries(archivePath) {
  const result = spawnSync('unzip', ['-Z1', archivePath], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`failed to list zip entries: ${result.stderr || result.stdout || result.status}`);
  }
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function collectPackageLockRegistryHosts(packageLockRaw) {
  const matches = [...packageLockRaw.matchAll(/"resolved": "https:\/\/([^\/]+)\//g)];
  return [...new Set(matches.map((match) => match[1]).filter(Boolean))].sort();
}

async function sha256(filePath) {
  const buffer = await readFile(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

const stageRoot = await mkdtemp(path.join(tmpdir(), 'future-native-source-only-'));
const stageProjectRoot = path.join(stageRoot, projectName);
await mkdir(stageProjectRoot, { recursive: true });
await mkdir(outputDir, { recursive: true });
await rm(zipPath, { force: true });

const summary = {
  files: 0,
  directories: 0,
  totalBytes: 0,
  excluded: [],
  topLevelEntries: new Set(),
};

try {
  await walkAndCopy(projectRoot, stageProjectRoot, summary);
  await runZip(stageRoot, zipPath, projectName);
  const zipStats = await stat(zipPath);
  const zipHash = await sha256(zipPath);
  const criticalPaths = [
    'package.json',
    'package-lock.json',
    'scripts/run-ts-entry.mjs',
    'scripts/run-registered-verify-entry.mjs',
    'scripts/verify-entry-registry.mjs',
    'scripts/package-future-native-source-only.mjs',
    'scripts/emit-future-native-artifact-suite.mjs',
    'scripts/emit-future-native-artifact-core.mjs',
    'scripts/emit-future-native-artifact-tail.mjs',
    'scripts/verify-future-native-artifact-suite.mjs',
    'scripts/verify-future-native-safe-pipeline-core.mjs',
    'scripts/verify-future-native-artifact-tail.mjs',
    'scripts/emit-future-native-generated-artifact-inventory.mjs',
    'scripts/emit-future-native-suite-status-report.mjs',
    'scripts/verify-future-native-source-only-artifacts.mjs',
    'scripts/verify-future-native-specialist-family-previews.mjs',
    'scripts/verify-future-native-family-preview-surfaces.mjs',
    'scripts/emit-future-native-family-previews.mjs',
    'docs/handoff/FUTURE_NATIVE_SOURCE_ONLY_DISTRIBUTION.md',
    'docs/handoff/FUTURE_NATIVE_RELEASE_CHECKLIST.md',
    'CURRENT_STATUS.md',
  ];
  const manifest = {
    projectName,
    generatedAt: new Date().toISOString(),
    archivePath: path.relative(projectRoot, zipPath),
    archiveSizeBytes: zipStats.size,
    archiveSizeLabel: formatBytes(zipStats.size),
    archiveSha256: zipHash,
    includedFileCount: summary.files,
    includedDirectoryCount: summary.directories,
    includedTotalBytes: summary.totalBytes,
    includedTotalBytesLabel: formatBytes(summary.totalBytes),
    topLevelEntries: [...summary.topLevelEntries].sort(),
    excludedEntries: [...new Set([...summary.excluded, 'node_modules/', 'dist/', 'tmp/'])].sort(),
    criticalPathChecks: await Promise.all(
      criticalPaths.map(async (relativePath) => ({
        path: relativePath,
        exists: Boolean(await stat(path.join(stageProjectRoot, relativePath)).then(() => true).catch(() => false)),
      })),
    ),
  };

  await writeFile(manifestJsonPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  const markdown = [
    '# Future-Native Source-Only Package',
    '',
    `- generatedAt: ${manifest.generatedAt}`,
    `- archivePath: \`${manifest.archivePath}\``,
    `- archiveSize: ${manifest.archiveSizeLabel}`,
    `- archiveSha256: \`${manifest.archiveSha256}\``,
    `- includedFileCount: ${manifest.includedFileCount}`,
    `- includedDirectoryCount: ${manifest.includedDirectoryCount}`,
    `- includedPayloadSize: ${manifest.includedTotalBytesLabel}`,
    '',
    '## top-level entries',
    ...manifest.topLevelEntries.map((entry) => `- \`${entry}\``),
    '',
    '## excluded entries',
    ...manifest.excludedEntries.map((entry) => `- \`${entry}\``),
    '',
    '## critical path checks',
    ...manifest.criticalPathChecks.map((entry) => `- \`${entry.path}\`: ${entry.exists ? 'ok' : 'missing'}`),
  ].join('\n');
  await writeFile(manifestMdPath, `${markdown}\n`, 'utf8');

  const zipEntries = listZipEntries(zipPath);
  const excludedEntriesAbsent = ['node_modules', 'dist', 'tmp'].filter(
    (entry) => !zipEntries.some((zipEntry) => zipEntry.startsWith(`${projectName}/${entry}/`) || zipEntry.includes(`/${entry}/`)),
  );
  const packageLockRaw = await readFile(path.join(projectRoot, 'package-lock.json'), 'utf8');
  const packageLockRegistryHosts = collectPackageLockRegistryHosts(packageLockRaw);
  const rehydrationReport = {
    generatedAt: new Date().toISOString(),
    mode: 'workspace-packaged-source-only-baseline',
    sourceOnlyZip: {
      relativePath: path.relative(projectRoot, zipPath),
      sha256: zipHash,
    },
    excludedEntriesAbsent,
    packageLockRegistryHosts,
    packageLockUsesPublicRegistryOnly: packageLockRegistryHosts.every((host) => host === 'registry.npmjs.org'),
    commands: [
      { step: 'bootstrap', ok: null, command: 'npm ci --no-audit --no-fund' },
      { step: 'emit:future-native-artifact-suite', ok: null, command: 'npm run emit:future-native-artifact-suite' },
      { step: 'verify:future-native-artifact-suite', ok: null, command: 'npm run verify:future-native-artifact-suite' },
    ],
    overallOk: excludedEntriesAbsent.length === 3,
    note: 'Baseline source-only packaging report. It confirms archive integrity, excluded directories, and lockfile registry normalization. Clean-host bootstrap/verify execution should overwrite this report with isolated-run results.',
  };
  await writeFile(rehydrationJsonPath, `${JSON.stringify(rehydrationReport, null, 2)}\n`, 'utf8');
  const rehydrationMd = [
    '# Future-Native Source-Only Rehydration Report',
    '',
    `- generatedAt: ${rehydrationReport.generatedAt}`,
    `- mode: ${rehydrationReport.mode}`,
    `- sourceOnlyZip: ${rehydrationReport.sourceOnlyZip.relativePath}`,
    `- sourceOnlyZipSha256: ${rehydrationReport.sourceOnlyZip.sha256}`,
    `- excludedEntriesAbsent: ${rehydrationReport.excludedEntriesAbsent.join(', ')}`,
    `- packageLockRegistryHosts: ${rehydrationReport.packageLockRegistryHosts.join(', ') || 'none'}`,
    `- packageLockUsesPublicRegistryOnly: ${rehydrationReport.packageLockUsesPublicRegistryOnly ? 'true' : 'false'}`,
    `- overallOk: ${rehydrationReport.overallOk ? 'true' : 'false'}`,
    '',
    '## Planned commands',
    '| Step | OK | Command |',
    '| --- | --- | --- |',
    ...rehydrationReport.commands.map((entry) => `| ${entry.step} | ${entry.ok === null ? 'pending' : entry.ok ? 'yes' : 'no'} | \`${entry.command}\` |`),
    '',
    '## Notes',
    `- ${rehydrationReport.note}`,
  ].join('\n');
  await writeFile(rehydrationMdPath, `${rehydrationMd}\n`, 'utf8');
} finally {
  await rm(stageRoot, { recursive: true, force: true });
}
