import fs from 'node:fs';
import path from 'node:path';
import { buildPackageManifest, normalizePackageClass, writeJson } from './packageIntegrityShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const hasFlag = (flag) => args.includes(flag);

const outputPath = getArgValue('--output');
const manifestPath = getArgValue('--manifest');
const packageClass = normalizePackageClass(getArgValue('--class') || 'unknown');
const reportPath = path.resolve(rootDir, getArgValue('--report') || 'docs/archive/package-integrity-report.json');
const allowPartial = hasFlag('--allow-partial');
const excludesNodeModules = hasFlag('--exclude-node-modules');

if (!outputPath || !manifestPath) {
  console.error('[write-package-manifest] --output and --manifest are required.');
  process.exit(1);
}

const resolvedOutput = path.resolve(rootDir, outputPath);
const resolvedManifest = path.resolve(rootDir, manifestPath);
if (!fs.existsSync(resolvedOutput)) {
  console.error(`[write-package-manifest] output not found: ${resolvedOutput}`);
  process.exit(1);
}

const report = fs.existsSync(reportPath)
  ? JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  : null;
const stat = fs.statSync(resolvedOutput);
const manifest = buildPackageManifest({
  outputPath: resolvedOutput,
  manifestPath: resolvedManifest,
  sizeBytes: stat.size,
  packageClass,
  repoSummary: report?.repo?.summary ?? null,
  zipSummary: report?.zip?.summary ?? null,
  allowPartial,
  excludesNodeModules,
});
writeJson(resolvedManifest, manifest);
console.log(resolvedManifest);
