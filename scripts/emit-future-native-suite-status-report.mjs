import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const statusDir = path.join(projectRoot, 'generated', 'future-native-suite-status');
const outputDir = path.join(projectRoot, 'docs', 'handoff', 'archive', 'generated', 'future-native-suite-status');
const archiveMdPath = path.join(projectRoot, 'docs', 'handoff', 'archive', 'FUTURE_NATIVE_SUITE_STATUS_2026-04-05.md');
const summaryJsonPath = path.join(outputDir, 'future-native-suite-status-summary.json');
const summaryMdPath = path.join(outputDir, 'future-native-suite-status-summary.md');

const suiteFiles = [
  'emit-future-native-artifact-core.json',
  'emit-future-native-artifact-tail.json',
  'emit-future-native-artifact-suite.json',
  'verify-future-native-safe-pipeline-core.json',
  'verify-future-native-safe-pipeline-suite.json',
  'verify-future-native-artifact-tail.json',
  'verify-future-native-artifact-suite.json',
];

function formatDurationMs(durationMs) {
  if (typeof durationMs !== 'number' || !Number.isFinite(durationMs)) return 'n/a';
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function summarizeSuite(payload) {
  if (!payload) return null;
  const results = Array.isArray(payload.results) ? payload.results : [];
  const totalDurationMs = results.reduce((sum, entry) => sum + (Number(entry.durationMs) || 0), 0);
  const failedStep = payload.failedStep ?? results.find((entry) => entry.status && entry.status !== 'pass')?.step ?? null;
  return {
    title: payload.title,
    ok: payload.ok === true,
    startedAt: payload.startedAt ?? null,
    runningStep: payload.runningStep ?? null,
    timeoutMs: payload.timeoutMs ?? 0,
    failedStep,
    totalDurationMs,
    totalDurationLabel: formatDurationMs(totalDurationMs),
    steps: results.map((entry) => ({
      step: entry.step,
      status: entry.status,
      durationMs: entry.durationMs ?? null,
      durationLabel: formatDurationMs(entry.durationMs),
      exitCode: entry.exitCode ?? null,
    })),
  };
}

const suiteSummaries = [];
for (const fileName of suiteFiles) {
  const absolutePath = path.join(statusDir, fileName);
  let payload = null;
  try {
    payload = JSON.parse(await readFile(absolutePath, 'utf8'));
  } catch {
    payload = null;
  }
  suiteSummaries.push({
    fileName,
    exists: Boolean(payload),
    summary: summarizeSuite(payload),
  });
}

const nowIso = new Date().toISOString();
const payload = {
  generatedAt: nowIso,
  suiteCount: suiteSummaries.length,
  okSuiteCount: suiteSummaries.filter((entry) => entry.summary?.ok === true).length,
  missingSuiteCount: suiteSummaries.filter((entry) => !entry.exists).length,
  suites: suiteSummaries,
};

const archiveMarkdown = [
  '# FUTURE NATIVE SUITE STATUS',
  '',
  `- generatedAt: ${payload.generatedAt}`,
  `- suiteCount: ${payload.suiteCount}`,
  `- okSuiteCount: ${payload.okSuiteCount}`,
  `- missingSuiteCount: ${payload.missingSuiteCount}`,
  '',
  '## suites',
  ...suiteSummaries.flatMap((entry) => {
    if (!entry.exists || !entry.summary) {
      return [`### ${entry.fileName}`, '', '- status: missing', ''];
    }
    const suite = entry.summary;
    return [
      `### ${suite.title}`,
      '',
      `- source: \`generated/future-native-suite-status/${entry.fileName}\``,
      `- ok: ${suite.ok ? 'true' : 'false'}`,
      `- startedAt: ${suite.startedAt ?? 'n/a'}`,
      `- totalDuration: ${suite.totalDurationLabel}`,
      `- failedStep: ${suite.failedStep ?? 'none'}`,
      `- runningStep: ${suite.runningStep ?? 'none'}`,
      '',
      '| step | status | duration | exitCode |',
      '| --- | --- | --- | --- |',
      ...suite.steps.map((step) => `| ${step.step} | ${step.status ?? 'n/a'} | ${step.durationLabel} | ${step.exitCode ?? 'n/a'} |`),
      '',
    ];
  }),
].join('\n');

await mkdir(outputDir, { recursive: true });
await writeFile(summaryJsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
await writeFile(summaryMdPath, `${archiveMarkdown}\n`, 'utf8');
await writeFile(archiveMdPath, `${archiveMarkdown}\n`, 'utf8');

console.log(JSON.stringify({
  generatedAt: payload.generatedAt,
  suiteCount: payload.suiteCount,
  okSuiteCount: payload.okSuiteCount,
  missingSuiteCount: payload.missingSuiteCount,
  archiveMdPath: path.relative(projectRoot, archiveMdPath),
  summaryJsonPath: path.relative(projectRoot, summaryJsonPath),
  summaryMdPath: path.relative(projectRoot, summaryMdPath),
}, null, 2));
