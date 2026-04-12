import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'docs', 'handoff', 'archive', 'generated', 'future-native-release-report');
const jsonPath = path.join(outputDir, 'future-native-generated-artifact-inventory.json');
const mdPath = path.join(outputDir, 'future-native-generated-artifact-inventory.md');
const relativePaths = [
  'docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md',
  'docs/handoff/SESSION_CHECKPOINT_2026-04-05.md',
  'docs/handoff/archive/FUTURE_NATIVE_RELEASE_TREND_2026-04-05.md',
  'docs/handoff/archive/FUTURE_NATIVE_SUITE_STATUS_2026-04-05.md',
  'docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_SUMMARY_2026-04-05.md',
  'docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_TREND_2026-04-05.md',
  'docs/handoff/archive/INDEX.md',
  'docs/handoff/archive/generated/future-native-release-report/future-native-release-report.json',
  'docs/handoff/archive/generated/future-native-release-report/future-native-release-report.md',
  'docs/handoff/archive/generated/future-native-release-report/future-native-family-previews.json',
  'docs/handoff/archive/generated/future-native-release-report/future-native-family-previews.md',
  'docs/handoff/archive/generated/future-native-release-report/future-native-release-trend-history.json',
  'docs/handoff/archive/generated/future-native-release-report/future-native-release-trend-comparison.json',
  'docs/handoff/archive/generated/future-native-release-report/future-native-release-trend-comparison.md',
  'docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.json',
  'docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.md',
  'docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-family-previews.json',
  'docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-family-previews.md',
  'docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-warning-trend-history.json',
  'docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-warning-trend-comparison.json',
  'docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-warning-trend-comparison.md',
  'docs/handoff/archive/generated/future-native-suite-status/future-native-suite-status-summary.json',
  'docs/handoff/archive/generated/future-native-suite-status/future-native-suite-status-summary.md',
  'docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only.zip',
  'docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-manifest.json',
  'docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-manifest.md',
  'docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-rehydration-report.json',
  'docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-rehydration-report.md',
];

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

async function sha256(filePath) {
  const buffer = await readFile(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

await mkdir(outputDir, { recursive: true });
const entries = [];
for (const relativePath of relativePaths) {
  const absolutePath = path.join(projectRoot, relativePath);
  let exists = false;
  let sizeBytes = null;
  let sha256Hash = null;
  try {
    const fileStat = await stat(absolutePath);
    if (fileStat.isFile()) {
      exists = true;
      sizeBytes = fileStat.size;
      sha256Hash = await sha256(absolutePath);
    }
  } catch {}
  entries.push({
    path: relativePath,
    exists,
    sizeBytes,
    sizeLabel: sizeBytes == null ? null : formatBytes(sizeBytes),
    sha256: sha256Hash,
  });
}

const payload = {
  generatedAt: new Date().toISOString(),
  entryCount: entries.length,
  entries,
};
await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
const markdown = [
  '# Future-Native Generated Artifact Inventory',
  '',
  `- generatedAt: ${payload.generatedAt}`,
  `- entryCount: ${payload.entryCount}`,
  '',
  '## entries',
  ...entries.map((entry) => `- \`${entry.path}\`: ${entry.exists ? `ok / ${entry.sizeLabel} / \`${entry.sha256}\`` : 'missing'}`),
].join('\n');
await writeFile(mdPath, `${markdown}\n`, 'utf8');
