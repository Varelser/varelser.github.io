import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const writeJsonArg = getArgValue('--write-json') || 'docs/archive/intel-mac-live-browser-proof-remediation.json';
const writeMarkdownArg = getArgValue('--write-markdown') || 'docs/archive/intel-mac-live-browser-proof-remediation.md';
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

const dropCheck = readJsonSafe('docs/archive/intel-mac-live-browser-proof-drop-check.json') ?? {};
const targetReadiness = readJsonSafe('docs/archive/target-live-browser-readiness-intel-mac.json') ?? {};
const projection = readJsonSafe('docs/archive/intel-mac-live-browser-proof-projection.json') ?? {};
const doctor = readJsonSafe('docs/archive/intel-mac-live-browser-proof-doctor.json') ?? {};
const blockerReport = readJsonSafe('docs/archive/intel-mac-live-browser-proof-blockers.json') ?? {};

const missingKinds = new Set((dropCheck.checks ?? []).filter((item) => !item.ok).map((item) => item.kind));
const targetMissingKinds = new Set((targetReadiness.checks ?? []).filter((item) => !item.ok).map((item) => item.kind));

const exactFiles = [];
const addFile = (kind, pathValue, why) => exactFiles.push({ kind, path: pathValue, why });

if (missingKinds.has('fixture-json')) {
  addFile('real-export-fixture', 'exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-<slug>.json', 'real browser export JSON がまだ無い');
  addFile('bundle-drop', 'exports/intel-mac-live-browser-proof-drop/incoming/kalokagathia-intel-mac-live-browser-proof-<slug>.zip', '個別ファイルの代わりに bundle zip を 1 本置くこともできる');
}
if (missingKinds.has('proof-summary-json')) {
  addFile('proof-summary', 'exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-proof.json', 'captured 状態へ更新されていない');
  addFile('evidence-manifest', 'exports/intel-mac-live-browser-proof-drop/phase5-proof-input/evidence-manifest.json', 'stage script が生成する intake manifest。screenshots / logs / exports の実在確認に使う');
}
if (missingKinds.has('proof-summary-artifact-paths')) {
  addFile('summary-artifacts', 'exports/intel-mac-live-browser-proof-drop/phase5-proof-input/screenshots/*', 'summary に書いた artifact path が実在する必要がある');
  addFile('summary-artifacts', 'exports/intel-mac-live-browser-proof-drop/phase5-proof-input/logs/*', 'summary に書いた artifact path が実在する必要がある');
}
if (missingKinds.has('structured-proof-files')) {
  addFile('structured-log', 'exports/intel-mac-live-browser-proof-drop/phase5-proof-input/logs/<build|verify|console>.log', 'proof notes 以外に structured proof が必要');
}
if (targetMissingKinds.has('browser-executable')) {
  addFile('browser-executable', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'Intel Mac 実機の browser executable が必要');
}
if (targetMissingKinds.has('real-export-manifest')) {
  addFile('generated-manifest', 'fixtures/project-state/real-export/manifest.json', 'finalize 後に自動生成される');
}
if (targetMissingKinds.has('real-export-readiness-report')) {
  addFile('generated-readiness-report', 'docs/archive/phase5-real-export-readiness-report.json', 'finalize 後に自動生成される');
}

const commands = [
  'npm run scaffold:intel-mac-live-browser-proof-drop',
  'npm run run:intel-mac-live-browser-proof-pipeline',
  'npm run stage:intel-mac-live-browser-proof-artifacts -- --source-dir exports/intel-mac-live-browser-proof-drop --slug <slug> --browser-executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --real-export ~/Downloads/kalokagathia-project-<slug>.json --screenshot ~/Desktop/export-overview.png --log exports/intel-mac-live-browser-proof-drop/phase5-proof-input/logs/pipeline.log',
  'npm run draft:intel-mac-live-browser-proof-summary',
  'npm run verify:intel-mac-live-browser-proof-drop',
  'npm run finalize:intel-mac-live-browser-proof -- --browser-executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"',
  'npm run doctor:intel-mac-live-browser-proof:refresh',
];

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    dropPassed: dropCheck.summary?.passed ?? 0,
    dropTotal: dropCheck.summary?.total ?? 0,
    targetPassed: targetReadiness.summary?.passed ?? 0,
    targetTotal: targetReadiness.summary?.total ?? 0,
    projectedAfterFinalizePassed: projection.summary?.projectedAfterFinalizePassed ?? 0,
    projectedAfterFinalizeTotal: projection.summary?.projectedAfterFinalizeTotal ?? 0,
    blockerCount: blockerReport.summary?.blockerCount ?? projection.summary?.blockerCount ?? doctor.summary?.statusBlockerCount ?? 0,
  },
  exactFiles,
  commands,
  nextFocus: exactFiles.length > 0
    ? exactFiles[0].path
    : 'Intel Mac live-browser proof は remediation 不要',
};

fs.mkdirSync(path.dirname(writeJsonPath), { recursive: true });
fs.writeFileSync(writeJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

const lines = [
  '# Intel Mac Live Browser Proof Remediation',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- drop: ${report.summary.dropPassed}/${report.summary.dropTotal}`,
  `- target: ${report.summary.targetPassed}/${report.summary.targetTotal}`,
  `- projectedAfterFinalize: ${report.summary.projectedAfterFinalizePassed}/${report.summary.projectedAfterFinalizeTotal}`,
  `- blockerCount: ${report.summary.blockerCount}`,
  '',
  '## Exact Files',
  ...(report.exactFiles.length
    ? report.exactFiles.map((item) => `- [${item.kind}] ${item.path} — ${item.why}`)
    : ['- none']),
  '',
  '## Commands',
  ...report.commands.map((item) => `- ${item}`),
  '',
  `## Next Focus\n- ${report.nextFocus}`,
  '',
];
fs.mkdirSync(path.dirname(writeMarkdownPath), { recursive: true });
fs.writeFileSync(writeMarkdownPath, lines.join('\n'), 'utf8');
console.log(`[generate-intel-mac-live-browser-proof-remediation-report] exactFiles=${report.exactFiles.length} blockers=${report.summary.blockerCount} projected=${report.summary.projectedAfterFinalizePassed}/${report.summary.projectedAfterFinalizeTotal}`);
