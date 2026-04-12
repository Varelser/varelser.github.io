import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  buildPackageManifest,
  buildRepoChecks,
  CANONICAL_PACKAGE_CLASSES,
  loadPackageJson,
  resolvePackageClass,
  summarizeChecks,
  writeJson,
} from './packageIntegrityShared.mjs';

const rootDir = process.cwd();
const projectName = path.basename(rootDir);
const outDir = path.resolve(rootDir, '.artifacts');
const stamp = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());
const args = process.argv.slice(2);
const allowPartial = args.includes('--allow-partial');
const reportPath = path.resolve(rootDir, 'docs/archive/package-integrity-report.json');

const packageJson = loadPackageJson(rootDir);
const repoChecks = buildRepoChecks(rootDir, packageJson);
const repoSummary = summarizeChecks(repoChecks);
const packageClass = resolvePackageClass({ summary: repoSummary });
const fileLabel = packageClass === CANONICAL_PACKAGE_CLASSES.FULL_LOCAL_DEV ? 'full-local-dev' : 'platform-specific-runtime-bundled';
const outputPath = path.resolve(outDir, `${projectName}_${fileLabel}_${stamp}.zip`);
const manifestPath = path.resolve(outDir, `${projectName}_${fileLabel}_${stamp}.manifest.json`);

fs.mkdirSync(outDir, { recursive: true });

const verifyCurrent = spawnSync(process.execPath, [
  './scripts/verify-package-integrity.mjs',
  '--write',
  'docs/archive/package-integrity-report.json',
], {
  cwd: rootDir,
  encoding: 'utf8',
});

const preflight = {
  generatedAt: new Date().toISOString(),
  verifyStatus: verifyCurrent.status ?? 1,
  verifyStdout: verifyCurrent.stdout ?? '',
  verifyStderr: verifyCurrent.stderr ?? '',
  packageClass,
  allowPartial,
};
writeJson(reportPath, { ...(fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : {}), preflight });

if (packageClass !== CANONICAL_PACKAGE_CLASSES.FULL_LOCAL_DEV && !allowPartial) {
  console.error('[package-full-zip] critical package integrity checks failed.');
  console.error('[package-full-zip] rerun with --allow-partial to emit an explicitly platform-specific-runtime-bundled archive.');
  process.exit(2);
}

fs.rmSync(outputPath, { force: true });
fs.rmSync(manifestPath, { force: true });
const parentDir = path.dirname(rootDir);
const zipArgs = [
  '-rq',
  outputPath,
  projectName,
  '-x', `${projectName}/dist/*`,
  '-x', `${projectName}/dist-verify-inline/*`,
  '-x', `${projectName}/.vite/*`,
  '-x', `${projectName}/.out/*`,
  '-x', `${projectName}/.artifacts/*`,
  '-x', `${projectName}/docs/archive/verification-step-logs/*`,
  '-x', `${projectName}/docs/archive/verification-suite-runs/*/step-logs/*`,
];
const zipResult = spawnSync('zip', zipArgs, {
  cwd: parentDir,
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 32,
});
if ((zipResult.status ?? 1) !== 0) {
  console.error(zipResult.stderr || zipResult.stdout || 'zip packaging failed');
  process.exit(zipResult.status ?? 1);
}

const verifyZip = spawnSync(process.execPath, [
  './scripts/verify-package-integrity.mjs',
  '--zip',
  path.relative(rootDir, outputPath),
  '--write',
  'docs/archive/package-integrity-report.json',
], {
  cwd: rootDir,
  encoding: 'utf8',
});

const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : {};
const zipSummary = report.zip?.summary ?? null;
const stat = fs.statSync(outputPath);
const manifest = buildPackageManifest({
  outputPath,
  manifestPath,
  sizeBytes: stat.size,
  packageClass,
  repoSummary,
  zipSummary,
  allowPartial,
  excludesNodeModules: false,
  extra: {
    host: {
      platform: process.platform,
      arch: process.arch,
      node: process.version,
      tmpdir: os.tmpdir(),
    },
    verifyZipStatus: verifyZip.status ?? 1,
    verifyZipStdout: verifyZip.stdout ?? '',
    verifyZipStderr: verifyZip.stderr ?? '',
  },
});
writeJson(manifestPath, manifest);
writeJson(reportPath, { ...report, packageFullZip: manifest });
console.log(outputPath);
