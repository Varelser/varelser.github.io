import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const writeJsonArg = getArgValue('--write-json') || 'docs/archive/intel-mac-live-browser-proof-status.json';
const writeMarkdownArg = getArgValue('--write-markdown') || 'docs/archive/intel-mac-live-browser-proof-status.md';
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
const handoffDoctor = readJsonSafe('docs/archive/package-handoff-doctor.json');
const ingestReport = readJsonSafe('docs/archive/intel-mac-live-browser-proof-ingest.json');
const finalizeReport = readJsonSafe('docs/archive/intel-mac-live-browser-proof-finalize.json');
const projectionReport = readJsonSafe('docs/archive/intel-mac-live-browser-proof-projection.json');

const summary = {
  dropPassed: dropCheck?.summary?.passed ?? 0,
  dropTotal: dropCheck?.summary?.total ?? 0,
  targetPassed: targetReadiness?.summary?.passed ?? 0,
  targetTotal: targetReadiness?.summary?.total ?? 0,
  fixtureCount: dropCheck?.summary?.fixtureCount ?? 0,
  invalidFixtureCount: dropCheck?.summary?.invalidFixtureCount ?? 0,
  proofFileCount: dropCheck?.summary?.proofFileCount ?? 0,
  structuredProofFileCount: dropCheck?.summary?.structuredProofFileCount ?? 0,
  proofSummaryOk: (dropCheck?.checks ?? []).find((item) => item.kind === 'proof-summary-json')?.ok ?? false,
  ingestedFixtures: ingestReport?.summary?.fixtureCount ?? 0,
  ingestedProofFiles: ingestReport?.summary?.proofFileCount ?? 0,
  finalizedTargetPassed: finalizeReport?.summary?.targetLiveBrowserPassed ?? null,
  finalizedTargetTotal: finalizeReport?.summary?.targetLiveBrowserTotal ?? null,
  handoffEffectiveStatus: handoffDoctor?.effectiveStatus ?? null,
  projectedAfterFinalizePassed: projectionReport?.summary?.projectedAfterFinalizePassed ?? 0,
  projectedAfterFinalizeTotal: projectionReport?.summary?.projectedAfterFinalizeTotal ?? 0,
};

const blockers = [];
for (const item of dropCheck?.checks ?? []) if (!item.ok) blockers.push({ scope: 'drop', kind: item.kind, target: item.target });
for (const item of targetReadiness?.checks ?? []) if (!item.ok) blockers.push({ scope: 'target', kind: item.kind, target: item.target });

const nextActions = [];
if ((dropCheck?.summary?.fixtureCount ?? 0) === 0) nextActions.push('Intel Mac 実機で real-export JSON を 1 本採取し、stage-artifacts-on-intel-mac.sh か npm run stage:intel-mac-live-browser-proof-artifacts で drop へ正規配置する');
if ((dropCheck?.summary?.invalidFixtureCount ?? 0) > 0) nextActions.push('drop へ置いた real-export JSON の壊れたファイルを修正または取り除く');
if (!((dropCheck?.checks ?? []).find((item) => item.kind === 'proof-summary-json')?.ok ?? false)) nextActions.push('stage-artifacts-on-intel-mac.sh か npm run stage:intel-mac-live-browser-proof-artifacts で real-export-proof.json と evidence-manifest.json を再生成する');
if ((dropCheck?.summary?.structuredProofFileCount ?? 0) === 0) nextActions.push('proof notes 以外に build log / verify log / console dump のいずれかを 1 本追加する');
if ((targetReadiness?.summary?.failed ?? 1) > 0) nextActions.push('browser executable / manifest / readiness report の欠損を埋めて finalize を再実行する');
if ((projectionReport?.summary?.blockerCount ?? 0) > 0) nextActions.push(`projection after finalize is ${summary.projectedAfterFinalizePassed}/${summary.projectedAfterFinalizeTotal}; close remaining blockers before rerun`);
if (nextActions.length === 0) nextActions.push('Intel Mac live-browser proof は handoff 可能な状態です');

const report = {
  generatedAt: new Date().toISOString(),
  summary,
  blockers,
  nextActions,
};

fs.mkdirSync(path.dirname(writeJsonPath), { recursive: true });
fs.writeFileSync(writeJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

const lines = [
  '# Intel Mac Live Browser Proof Status',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- drop: ${summary.dropPassed}/${summary.dropTotal}`,
  `- target readiness: ${summary.targetPassed}/${summary.targetTotal}`,
  `- fixtureCount: ${summary.fixtureCount}`,
  `- invalidFixtureCount: ${summary.invalidFixtureCount}`,
  `- proofFileCount: ${summary.proofFileCount}`,
  `- structuredProofFileCount: ${summary.structuredProofFileCount}`,
  `- proofSummaryOk: ${summary.proofSummaryOk}`,
  `- ingestedFixtures: ${summary.ingestedFixtures}`,
  `- ingestedProofFiles: ${summary.ingestedProofFiles}`,
  `- handoffEffectiveStatus: ${summary.handoffEffectiveStatus ?? 'unknown'}`,
  `- projectedAfterFinalize: ${summary.projectedAfterFinalizePassed}/${summary.projectedAfterFinalizeTotal}`,
  '',
  '## Blockers',
  ...((blockers.length > 0)
    ? blockers.map((item) => `- [${item.scope}] ${item.kind}: ${item.target}`)
    : ['- none']),
  '',
  '## Next Actions',
  ...nextActions.map((item) => `- ${item}`),
  '',
];
fs.mkdirSync(path.dirname(writeMarkdownPath), { recursive: true });
fs.writeFileSync(writeMarkdownPath, lines.join('\n'), 'utf8');
console.log(`[generate-intel-mac-live-browser-proof-status-report] drop=${summary.dropPassed}/${summary.dropTotal} target=${summary.targetPassed}/${summary.targetTotal} blockers=${blockers.length}`);
