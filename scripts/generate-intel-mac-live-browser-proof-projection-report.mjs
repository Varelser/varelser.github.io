import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const writeJsonArg = getArgValue('--write-json') || 'docs/archive/intel-mac-live-browser-proof-projection.json';
const writeMarkdownArg = getArgValue('--write-markdown') || 'docs/archive/intel-mac-live-browser-proof-projection.md';
const writeJsonPath = path.resolve(rootDir, writeJsonArg);
const writeMarkdownPath = path.resolve(rootDir, writeMarkdownArg);

const readJsonSafe = (relativePath) => {
  const absolutePath = path.resolve(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  } catch {
    return null;
  }
};

const dropCheck = readJsonSafe('docs/archive/intel-mac-live-browser-proof-drop-check.json');
const targetReadiness = readJsonSafe('docs/archive/target-live-browser-readiness-intel-mac.json');

const getCheck = (report, kind) => (report?.checks ?? []).find((item) => item.kind === kind) ?? null;
const hasFixtures = Boolean(getCheck(dropCheck, 'fixture-json-valid')?.ok);
const hasProofSummary = Boolean(getCheck(dropCheck, 'proof-summary-json')?.ok);
const hasArtifactPaths = Boolean(getCheck(dropCheck, 'proof-summary-artifact-paths')?.ok);
const hasProjectLinkage = Boolean(getCheck(dropCheck, 'proof-summary-project-linkage')?.ok);
const hasStructuredProof = Boolean(getCheck(dropCheck, 'structured-proof-files')?.ok);
const browserReady = Boolean(getCheck(targetReadiness, 'browser-executable')?.ok);
const notesReady = Boolean(getCheck(dropCheck, 'proof-notes')?.ok) || Boolean(getCheck(targetReadiness, 'proof-notes')?.ok);
const moduleReady = Boolean(getCheck(targetReadiness, 'node-module')?.ok);

const projectedChecks = [
  { kind: 'node-module', ok: moduleReady, rationale: moduleReady ? 'playwright module already present' : 'playwright module missing' },
  { kind: 'browser-executable', ok: browserReady, rationale: browserReady ? 'browser executable already detectable on target host' : 'browser executable still missing on target host' },
  { kind: 'real-export-fixture', ok: hasFixtures, rationale: hasFixtures ? 'valid dropped fixture can be ingested' : 'no valid dropped fixture available yet' },
  {
    kind: 'real-export-manifest-after-finalize',
    ok: hasFixtures,
    rationale: hasFixtures ? 'finalize can regenerate real-export manifest from valid fixture input' : 'manifest cannot be regenerated until a valid fixture is dropped',
  },
  {
    kind: 'real-export-readiness-report-after-finalize',
    ok: hasFixtures && hasProofSummary && hasArtifactPaths && hasStructuredProof,
    rationale: (hasFixtures && hasProofSummary && hasArtifactPaths && hasStructuredProof)
      ? 'finalize has enough dropped evidence to regenerate readiness artifacts'
      : 'finalize still lacks valid fixture/proof summary/artifact paths/structured proof evidence',
  },
  {
    kind: 'proof-notes',
    ok: notesReady,
    rationale: notesReady ? 'proof notes template already present' : 'proof notes are missing',
  },
];

const blockers = [];
if (!hasFixtures) blockers.push('valid real-export fixture JSON');
if (!hasProofSummary) blockers.push('captured real-export-proof.json');
if (!hasArtifactPaths) blockers.push('artifact paths in real-export-proof.json that point at real files');
if (!hasProjectLinkage) blockers.push('capture.sourceProjectSlug matched to exported project JSON');
if (!hasStructuredProof) blockers.push('structured proof artifact (.log/.txt/.json)');
if (!browserReady) blockers.push('browser executable on Intel Mac target host');

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    currentTargetPassed: targetReadiness?.summary?.passed ?? 0,
    currentTargetTotal: targetReadiness?.summary?.total ?? 0,
    projectedAfterFinalizePassed: projectedChecks.filter((item) => item.ok).length,
    projectedAfterFinalizeTotal: projectedChecks.length,
    blockerCount: blockers.length,
  },
  projectedChecks,
  blockers,
  nextAction: blockers.length === 0
    ? 'finalize can be rerun now; target live browser readiness should be fully green'
    : 'close the remaining blockers, then rerun finalize to lift target live browser readiness',
};

fs.mkdirSync(path.dirname(writeJsonPath), { recursive: true });
fs.writeFileSync(writeJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

const lines = [
  '# Intel Mac Live Browser Proof Projection',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- currentTargetReadiness: ${report.summary.currentTargetPassed}/${report.summary.currentTargetTotal}`,
  `- projectedAfterFinalize: ${report.summary.projectedAfterFinalizePassed}/${report.summary.projectedAfterFinalizeTotal}`,
  `- blockerCount: ${report.summary.blockerCount}`,
  '',
  '## Projected Checks',
  ...projectedChecks.map((item) => `- [${item.ok ? 'x' : ' '}] ${item.kind}: ${item.rationale}`),
  '',
  '## Remaining Blockers',
  ...(blockers.length ? blockers.map((item) => `- ${item}`) : ['- none']),
  '',
  `## Next Action\n- ${report.nextAction}`,
  '',
];
fs.mkdirSync(path.dirname(writeMarkdownPath), { recursive: true });
fs.writeFileSync(writeMarkdownPath, lines.join('\n'), 'utf8');
console.log(`[generate-intel-mac-live-browser-proof-projection-report] current=${report.summary.currentTargetPassed}/${report.summary.currentTargetTotal} projected=${report.summary.projectedAfterFinalizePassed}/${report.summary.projectedAfterFinalizeTotal} blockers=${report.summary.blockerCount}`);
