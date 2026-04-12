import { readFileSync } from 'node:fs';
import path from 'node:path';

const REPORT_FILE_NAMES = [
  'verify-suite-leaf-core.json',
  'verify-suite-leaf-full.json',
];

const EXPECTED_SCENARIOS = {
  'fixture-file-parsing': [
    'native-rich:parsed',
    'native-rich:fingerprint-stable',
    'native-rich:source-token-confirmed',
    'sparse-layer2-custom:parsed',
    'sparse-layer2-custom:fingerprint-stable',
    'sparse-layer2-custom:custom-token-preserved',
    'legacy-v24:parsed',
    'legacy-v24:fingerprint-stable',
    'legacy-v24:migration-confirmed',
    'duplicate-ids-invalid-active:parsed',
    'duplicate-ids-invalid-active:fingerprint-stable',
    'duplicate-ids-invalid-active:duplicate-input-sanitized',
    'orphan-sequence:parsed',
    'orphan-sequence:fingerprint-stable',
    'orphan-sequence:orphan-input-sanitized',
  ],
  'file-roundtrip-and-import-preparation': [
    'export-file-name-stable',
    'exported-file-reparsed',
    'manifest-stable-after-file-io',
    'preset-id-remap-covered',
    'import-diagnostics-synced',
    'rebuilt-manifest-and-serialization-synced',
    'prepared-import-reparsed',
  ],
  'duplicate-import-recovery': [
    'duplicate-preset-collision-remapped',
    'duplicate-sequence-collision-remapped',
    'duplicate-preset-references-resolve-deterministically',
    'invalid-active-preset-falls-back',
    'import-notice-reports-normalization',
    'duplicate-id-visibility-in-report',
  ],
  'orphan-sequence-recovery': [
    'orphan-sequence-sanitized-on-parse',
    'surviving-sequence-remapped',
    'orphan-diagnostics-stay-zero-after-sanitization',
    'sanitized-sequence-visible-in-report',
  ],
  'roundtrip-stability': [
    'parse-parse-serialization-stable',
    'manifest-execution-stable',
    'project-fingerprint-stable',
    'fresh-serialization-compatible',
  ],
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parseTailJson(tail, reportName) {
  const text = String(tail || '').trim();
  const start = text.lastIndexOf('\n{');
  const candidate = start >= 0 ? text.slice(start + 1) : text;
  try {
    return JSON.parse(candidate);
  } catch {
    throw new Error(`[phase5-archive] ${reportName} verify:phase5 tail did not end with JSON`);
  }
}

function verifyReport(reportPath) {
  const reportName = path.basename(reportPath);
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  assert(report?.ok === true, `[phase5-archive] ${reportName} did not finish ok`);
  const result = Array.isArray(report?.results)
    ? report.results.find((entry) => entry?.step === 'verify:phase5')
    : null;
  assert(result?.status === 'pass', `[phase5-archive] ${reportName} missing passing verify:phase5 result`);
  const payload = parseTailJson(result.tail, reportName);
  assert(payload?.profile === 'full', `[phase5-archive] ${reportName} phase5 payload was not full profile`);
  assert(Array.isArray(payload?.scenarios), `[phase5-archive] ${reportName} scenarios missing`);

  for (const [scenarioId, expectedChecks] of Object.entries(EXPECTED_SCENARIOS)) {
    const scenario = payload.scenarios.find((entry) => entry?.id === scenarioId);
    assert(scenario, `[phase5-archive] ${reportName} missing scenario ${scenarioId}`);
    assert(
      JSON.stringify(scenario.checks) === JSON.stringify(expectedChecks),
      `[phase5-archive] ${reportName} checks drifted for ${scenarioId}`,
    );
  }

  return { fileName: reportName, scenarioCount: payload.scenarios.length };
}

const archiveDir = path.join(process.cwd(), 'docs', 'archive', 'verification-leaf-suites');
const reports = REPORT_FILE_NAMES.map((fileName) => verifyReport(path.join(archiveDir, fileName)));

console.log(JSON.stringify({
  id: 'strict-leaf-archive-evidence',
  checks: [
    ...reports.map((report) => `${report.fileName}:phase5-pass`),
    ...Object.keys(EXPECTED_SCENARIOS).map((scenarioId) => `${scenarioId}:archived-checks-match`),
  ],
}, null, 2));
