import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const writeJsonArg = getArgValue('--write-json') || 'docs/archive/intel-mac-live-browser-proof-readiness-audit.json';
const writeMarkdownArg = getArgValue('--write-markdown') || 'docs/archive/intel-mac-live-browser-proof-readiness-audit.md';
const writeJsonPath = path.resolve(rootDir, writeJsonArg);
const writeMarkdownPath = path.resolve(rootDir, writeMarkdownArg);

const readJsonSafe = (relativePath) => {
  const absolutePath = path.resolve(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  try { return JSON.parse(fs.readFileSync(absolutePath, 'utf8')); } catch { return null; }
};

const dropCheck = readJsonSafe('docs/archive/intel-mac-live-browser-proof-drop-check.json');
const status = readJsonSafe('docs/archive/intel-mac-live-browser-proof-status.json');
const projection = readJsonSafe('docs/archive/intel-mac-live-browser-proof-projection.json');
const remediation = readJsonSafe('docs/archive/intel-mac-live-browser-proof-remediation.json');
const doctor = readJsonSafe('docs/archive/intel-mac-live-browser-proof-doctor.json');
const ingest = readJsonSafe('docs/archive/intel-mac-live-browser-proof-ingest.json');
const finalize = readJsonSafe('docs/archive/intel-mac-live-browser-proof-finalize.json');
const operatorPacket = readJsonSafe('docs/archive/intel-mac-live-browser-proof-operator-packet.json');

const checks = dropCheck?.checks ?? [];
const get = (kind) => checks.find((item) => item.kind === kind) ?? null;
const bool = (value) => Boolean(value);
const phase = {
  dropScaffolded: bool(get('drop-dir')?.ok) && bool(get('drop-readme')?.ok) && bool(get('drop-metadata')?.ok),
  fixtureReady: bool(get('fixture-json-valid')?.ok),
  proofSummaryReady: bool(get('proof-summary-json')?.ok) && bool(get('proof-summary-artifact-paths')?.ok) && bool(get('proof-summary-project-linkage')?.ok),
  structuredProofReady: bool(get('structured-proof-files')?.ok),
  ingestExecuted: bool(ingest?.generatedAt),
  finalizeExecuted: bool(finalize?.generatedAt),
  doctorFresh: bool(doctor?.generatedAt),
  operatorPacketFresh: bool(operatorPacket?.generatedAt),
};

const blockers = status?.blockers ?? [];
const readyForRealCapture = phase.dropScaffolded && !phase.fixtureReady;
const readyForHostFinalize = phase.fixtureReady && phase.proofSummaryReady && phase.structuredProofReady;
const effectivelyClosable = (projection?.summary?.blockerCount ?? 1) === 0;

const report = {
  generatedAt: new Date().toISOString(),
  score: {
    dropPassed: status?.summary?.dropPassed ?? 0,
    dropTotal: status?.summary?.dropTotal ?? 0,
    targetPassed: status?.summary?.targetPassed ?? 0,
    targetTotal: status?.summary?.targetTotal ?? 0,
    projectedAfterFinalizePassed: projection?.summary?.projectedAfterFinalizePassed ?? 0,
    projectedAfterFinalizeTotal: projection?.summary?.projectedAfterFinalizeTotal ?? 0,
  },
  phase,
  decision: {
    readyForRealCapture,
    readyForHostFinalize,
    effectivelyClosable,
    recommendedMode: effectivelyClosable ? 'finalize-now' : (readyForHostFinalize ? 'capture-return-and-finalize' : 'capture-missing-evidence'),
  },
  blockers,
  nextActions: [
    ...new Set([
      ...(status?.nextActions ?? []),
      ...(remediation?.nextActions ?? []),
      effectivelyClosable ? 'rerun finalize now; all projected blockers are closed' : '',
      readyForRealCapture ? 'Intel Mac target can start capture immediately using the bundled .command wrapper' : '',
      readyForHostFinalize ? 'Host ingest can run immediately after bundle return; evidence minimum is satisfied' : '',
    ].filter(Boolean)),
  ],
};

fs.mkdirSync(path.dirname(writeJsonPath), { recursive: true });
fs.writeFileSync(writeJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

const checkbox = (v) => (v ? '[x]' : '[ ]');
const lines = [
  '# Intel Mac Live Browser Proof Readiness Audit',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- drop: ${report.score.dropPassed}/${report.score.dropTotal}`,
  `- target readiness: ${report.score.targetPassed}/${report.score.targetTotal}`,
  `- projected after finalize: ${report.score.projectedAfterFinalizePassed}/${report.score.projectedAfterFinalizeTotal}`,
  `- recommendedMode: ${report.decision.recommendedMode}`,
  '',
  '## Gate Checklist',
  `- ${checkbox(phase.dropScaffolded)} drop scaffolded`,
  `- ${checkbox(phase.fixtureReady)} valid real-export fixture present`,
  `- ${checkbox(phase.proofSummaryReady)} proof summary captured and artifact paths valid`,
  `- ${checkbox(phase.structuredProofReady)} structured proof log present`,
  `- ${checkbox(phase.ingestExecuted)} host ingest already executed`,
  `- ${checkbox(phase.finalizeExecuted)} finalize already executed`,
  `- ${checkbox(phase.doctorFresh)} doctor report present`,
  `- ${checkbox(phase.operatorPacketFresh)} operator packet present`,
  '',
  '## Decision',
  `- readyForRealCapture: ${report.decision.readyForRealCapture}`,
  `- readyForHostFinalize: ${report.decision.readyForHostFinalize}`,
  `- effectivelyClosable: ${report.decision.effectivelyClosable}`,
  '',
  '## Remaining Blockers',
  ...((blockers.length > 0) ? blockers.map((item) => `- [${item.scope}] ${item.kind}: ${item.target}`) : ['- none']),
  '',
  '## Next Actions',
  ...report.nextActions.map((item) => `- ${item}`),
  '',
];
fs.mkdirSync(path.dirname(writeMarkdownPath), { recursive: true });
fs.writeFileSync(writeMarkdownPath, lines.join('\n'), 'utf8');
console.log(`[generate-intel-mac-live-browser-proof-readiness-audit] mode=${report.decision.recommendedMode} blockers=${blockers.length}`);
