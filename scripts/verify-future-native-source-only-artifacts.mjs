import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const manifestPath = path.join(projectRoot, 'docs', 'handoff', 'archive', 'generated', 'future-native-source-only-package', 'future-native-source-only-manifest.json');
const inventoryPath = path.join(projectRoot, 'docs', 'handoff', 'archive', 'generated', 'future-native-release-report', 'future-native-generated-artifact-inventory.json');

const requiredInventoryPaths = [
  'docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md',
  'docs/handoff/SESSION_CHECKPOINT_2026-04-05.md',
  'docs/handoff/archive/FUTURE_NATIVE_SUITE_STATUS_2026-04-05.md',
  'docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_SUMMARY_2026-04-05.md',
  'docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_TREND_2026-04-05.md',
  'docs/handoff/archive/generated/future-native-release-report/future-native-release-report.json',
  'docs/handoff/archive/generated/future-native-release-report/future-native-release-report.md',
  'docs/handoff/archive/generated/future-native-release-report/future-native-family-previews.json',
  'docs/handoff/archive/generated/future-native-release-report/future-native-family-previews.md',
  'docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.json',
  'docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.md',
  'docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-family-previews.json',
  'docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-family-previews.md',
  'docs/handoff/archive/generated/future-native-suite-status/future-native-suite-status-summary.json',
  'docs/handoff/archive/generated/future-native-suite-status/future-native-suite-status-summary.md',
  'docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only.zip',
  'docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-manifest.json',
  'docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-manifest.md',
  'docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-rehydration-report.json',
  'docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-rehydration-report.md',
];

const requiredManifestCriticalPaths = [
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
  'scripts/verify-future-native-specialist-family-previews.mjs',
  'scripts/verify-future-native-family-preview-surfaces.mjs',
  'scripts/emit-future-native-family-previews.mjs',
  'docs/handoff/FUTURE_NATIVE_SOURCE_ONLY_DISTRIBUTION.md',
  'docs/handoff/FUTURE_NATIVE_RELEASE_CHECKLIST.md',
  'CURRENT_STATUS.md',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [manifestRaw, inventoryRaw] = await Promise.all([
  readFile(manifestPath, 'utf8'),
  readFile(inventoryPath, 'utf8'),
]);
const manifest = JSON.parse(manifestRaw);
const inventory = JSON.parse(inventoryRaw);

assert(Array.isArray(inventory.entries), 'generated artifact inventory entries missing');
assert(Array.isArray(manifest.criticalPathChecks), 'source-only manifest criticalPathChecks missing');
assert(Array.isArray(manifest.excludedEntries), 'source-only manifest excludedEntries missing');
assert(Array.isArray(manifest.topLevelEntries), 'source-only manifest topLevelEntries missing');

const inventoryMap = new Map(inventory.entries.map((entry) => [entry.path, entry]));
for (const relativePath of requiredInventoryPaths) {
  const entry = inventoryMap.get(relativePath);
  assert(entry, `inventory missing required entry: ${relativePath}`);
  assert(entry.exists === true, `inventory marks required entry missing: ${relativePath}`);
  assert(typeof entry.sha256 === 'string' && entry.sha256.length === 64, `inventory sha256 missing for ${relativePath}`);
  const fileStat = await stat(path.join(projectRoot, relativePath));
  assert(fileStat.isFile(), `required artifact is not a file: ${relativePath}`);
  assert(entry.sizeBytes === fileStat.size, `inventory size mismatch for ${relativePath}`);
}

const manifestCriticalPathMap = new Map(manifest.criticalPathChecks.map((entry) => [entry.path, entry]));
for (const relativePath of requiredManifestCriticalPaths) {
  const entry = manifestCriticalPathMap.get(relativePath);
  assert(entry, `source-only manifest missing critical path check: ${relativePath}`);
  assert(entry.exists === true, `source-only manifest marks critical path missing: ${relativePath}`);
}

assert(manifest.archivePath === 'docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only.zip', 'source-only manifest archivePath drifted');
assert(manifest.topLevelEntries.includes('docs'), 'source-only manifest missing docs top-level entry');
assert(manifest.topLevelEntries.includes('scripts'), 'source-only manifest missing scripts top-level entry');
assert(manifest.topLevelEntries.includes('lib'), 'source-only manifest missing lib top-level entry');
assert(!manifest.topLevelEntries.includes('node_modules'), 'source-only manifest unexpectedly includes node_modules top-level entry');
assert(!manifest.topLevelEntries.includes('dist'), 'source-only manifest unexpectedly includes dist top-level entry');
assert(!manifest.topLevelEntries.includes('tmp'), 'source-only manifest unexpectedly includes tmp top-level entry');
assert(manifest.excludedEntries.includes('node_modules/'), 'source-only manifest missing node_modules exclusion');
assert(manifest.excludedEntries.includes('dist/'), 'source-only manifest missing dist exclusion');

const specialistReportEntry = inventoryMap.get('docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.md');
const specialistTrendEntry = inventoryMap.get('docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-warning-trend-comparison.md');
assert(specialistReportEntry && specialistTrendEntry, 'specialist handoff inventory entries missing');

const payload = {
  verifiedAt: new Date().toISOString(),
  requiredInventoryEntryCount: requiredInventoryPaths.length,
  requiredManifestCriticalPathCount: requiredManifestCriticalPaths.length,
  sourceOnlyArchivePath: manifest.archivePath,
  sourceOnlyArchiveSha256: manifest.archiveSha256,
  sourceOnlyArchiveSizeBytes: manifest.archiveSizeBytes,
  specialistHandoffSha256: specialistReportEntry.sha256,
  specialistWarningTrendSha256: specialistTrendEntry.sha256,
};

console.log(JSON.stringify(payload, null, 2));
