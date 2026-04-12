import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const hasFlag = (flag) => args.includes(flag);

const sourceDirArg = getArgValue('--source-dir') || 'exports/intel-mac-live-browser-proof-drop';
const sourceDir = path.resolve(rootDir, sourceDirArg);
const writeJsonPath = path.resolve(rootDir, getArgValue('--write-json') || 'docs/archive/intel-mac-live-browser-proof-operator-packet.json');
const writeMarkdownPath = path.resolve(rootDir, getArgValue('--write-markdown') || 'docs/archive/intel-mac-live-browser-proof-operator-packet.md');
const mirrorToDrop = !hasFlag('--no-drop-copy');
const skipPrereqs = hasFlag('--skip-prereqs');

const relRoot = (targetPath) => path.relative(rootDir, targetPath).replace(/\\/g, '/');
const relDrop = (targetPath) => path.relative(sourceDir, targetPath).replace(/\\/g, '/');
const readJsonSafe = (relativePath) => {
  const absolutePath = path.resolve(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  } catch {
    return null;
  }
};
const ensureParent = (filePath) => fs.mkdirSync(path.dirname(filePath), { recursive: true });

if (!skipPrereqs) {
  execFileSync(process.execPath, ['scripts/emit-intel-mac-live-browser-proof-capture-kit.mjs', '--source-dir', sourceDirArg], {
    cwd: rootDir,
    stdio: 'inherit',
  });
  execFileSync(process.execPath, ['scripts/verify-intel-mac-live-browser-proof-drop.mjs', '--source-dir', sourceDirArg, '--write', 'docs/archive/intel-mac-live-browser-proof-drop-check.json'], {
    cwd: rootDir,
    stdio: 'inherit',
  });
  execFileSync(process.execPath, ['scripts/generate-intel-mac-live-browser-proof-status-report.mjs', '--write-json', 'docs/archive/intel-mac-live-browser-proof-status.json', '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-status.md'], {
    cwd: rootDir,
    stdio: 'inherit',
  });
  execFileSync(process.execPath, ['scripts/generate-intel-mac-live-browser-proof-blocker-report.mjs', '--write-json', 'docs/archive/intel-mac-live-browser-proof-blockers.json', '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-blockers.md'], {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

const captureKit = readJsonSafe('docs/archive/intel-mac-live-browser-proof-capture-kit.json') ?? { outputs: {} };
const dropCheck = readJsonSafe('docs/archive/intel-mac-live-browser-proof-drop-check.json') ?? { summary: {}, checks: [], recommendedNextSteps: [] };
const statusReport = readJsonSafe('docs/archive/intel-mac-live-browser-proof-status.json') ?? { summary: {}, blockers: [], nextActions: [] };
const blockerReport = readJsonSafe('docs/archive/intel-mac-live-browser-proof-blockers.json') ?? { summary: {}, blockers: [] };

const checkByKind = new Map((dropCheck.checks ?? []).map((check) => [check.kind, check]));
const failedChecks = (dropCheck.checks ?? []).filter((check) => check.ok === false);
const failedKinds = failedChecks.map((check) => check.kind);
const fixtureJsonCheck = checkByKind.get('fixture-json');
const proofSummaryCheck = checkByKind.get('proof-summary-json');
const structuredLogsCheck = checkByKind.get('structured-proof-files');
const incomingBundleCheck = checkByKind.get('incoming-bundle-zip');

const commandHints = {
  scaffold: `npm run scaffold:intel-mac-live-browser-proof-drop -- --source-dir ${sourceDirArg}`,
  stage: `npm run stage:intel-mac-live-browser-proof-artifacts -- --source-dir ${sourceDirArg} --slug <slug> --browser-executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --real-export ~/Downloads/kalokagathia-project-<slug>.json --screenshot ~/Desktop/export-overview.png --log exports/intel-mac-live-browser-proof-drop/phase5-proof-input/logs/pipeline.log`,
  draft: `npm run draft:intel-mac-live-browser-proof-summary -- --source-dir ${sourceDirArg} --browser-executable-path \"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome\"`,
  verify: `npm run verify:intel-mac-live-browser-proof-drop -- --source-dir ${sourceDirArg}`,
  pipeline: `npm run run:intel-mac-live-browser-proof-pipeline -- --source-dir ${sourceDirArg} --browser-executable-path \"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome\"`,
  finalize: `npm run finalize:intel-mac-live-browser-proof -- --source-dir ${sourceDirArg} --browser-executable-path \"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome\"`,
  doctor: 'npm run doctor:intel-mac-live-browser-proof:refresh',
};

const prioritizedActions = [];
if (!fixtureJsonCheck?.ok) {
  prioritizedActions.push({
    id: 'capture-real-export',
    reason: 'real browser export JSON is still missing from the drop',
    command: './capture-on-intel-mac.sh /path/to/repo <slug> /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome $PWD',
    outputs: [
      'phase5-proof-input/logs/pipeline.log',
      'real browser UI export saved to ~/Downloads/kalokagathia-project-<slug>.json',
    ],
  });
  prioritizedActions.push({
    id: 'stage-real-proof-artifacts',
    reason: 'copied export/screenshots/logs must be normalized into the drop before verify/finalize can pass',
    command: commandHints.stage,
    outputs: [
      'real-export/kalokagathia-project-<slug>.json',
      'phase5-proof-input/real-export-proof.json',
      'phase5-proof-input/evidence-manifest.json',
      'phase5-proof-input/screenshots/*.png',
      'phase5-proof-input/logs/*.log',
    ],
  });
}
if (!proofSummaryCheck?.ok) {
  prioritizedActions.push({
    id: 'draft-proof-summary',
    reason: 'proof summary JSON is incomplete or still pending',
    command: commandHints.draft,
    outputs: ['phase5-proof-input/real-export-proof.json'],
  });
}
if (!structuredLogsCheck?.ok) {
  prioritizedActions.push({
    id: 'attach-structured-logs',
    reason: 'structured proof logs are missing from the drop',
    command: 'copy build / verify / browser-console logs into phase5-proof-input/logs/',
    outputs: ['phase5-proof-input/logs/*.log'],
  });
}
if (!incomingBundleCheck?.ok && !fixtureJsonCheck?.ok) {
  prioritizedActions.push({
    id: 'package-bundle',
    reason: 'bundle zip is absent, so host-side ingest has no portable handoff artifact',
    command: './package-proof-bundle.sh $PWD <slug>',
    outputs: ['incoming/kalokagathia-intel-mac-live-browser-proof-<slug>.zip'],
  });
}
prioritizedActions.push({
  id: 'host-finalize',
  reason: 'after the drop is populated, ingest/finalize must regenerate repo-side manifests and status',
  command: './finalize-on-host.sh /path/to/repo exports/intel-mac-live-browser-proof-drop /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome',
  outputs: [
    'fixtures/project-state/real-export/manifest.json',
    'docs/archive/phase5-real-export-readiness-report.json',
    'docs/archive/intel-mac-live-browser-proof-status.json',
  ],
});

const requiredFiles = [
  'real-export/kalokagathia-project-<slug>.json',
  'phase5-proof-input/real-export-proof.json',
  'phase5-proof-input/real-export-capture-notes.md',
  'phase5-proof-input/logs/*.log',
  'phase5-proof-input/screenshots/*.png',
  'incoming/kalokagathia-intel-mac-live-browser-proof-<slug>.zip',
];

const report = {
  generatedAt: new Date().toISOString(),
  sourceDir: relRoot(sourceDir),
  summary: {
    dropPassed: dropCheck.summary?.passed ?? 0,
    dropTotal: dropCheck.summary?.total ?? 0,
    targetPassed: statusReport.summary?.targetPassed ?? 0,
    targetTotal: statusReport.summary?.targetTotal ?? 0,
    blockerCount: blockerReport.summary?.blockerCount ?? (statusReport.blockers?.length ?? 0),
    proofReady: Boolean(statusReport.summary?.proofSummaryOk && (statusReport.summary?.dropPassed ?? 0) >= (statusReport.summary?.dropTotal ?? Number.MAX_SAFE_INTEGER) && (statusReport.summary?.targetPassed ?? 0) >= (statusReport.summary?.targetTotal ?? Number.MAX_SAFE_INTEGER)),
  },
  requiredFiles,
  failedCheckKinds: failedKinds,
  prioritizedActions,
  commands: commandHints,
  outputs: captureKit.outputs ?? {},
  blockers: blockerReport.blockers ?? statusReport.blockers ?? [],
  nextActions: statusReport.nextActions ?? dropCheck.recommendedNextSteps ?? [],
};

const markdown = [
  '# Intel Mac Live Browser Proof Operator Packet',
  '',
  `- sourceDir: \`${report.sourceDir}\``,
  `- drop: **${report.summary.dropPassed}/${report.summary.dropTotal}**`,
  `- target: **${report.summary.targetPassed}/${report.summary.targetTotal}**`,
  `- blockers: **${report.summary.blockerCount}**`,
  `- proofReady: **${report.summary.proofReady ? 'true' : 'false'}**`,
  '',
  '## Required files',
  ...requiredFiles.map((item) => `- \`${item}\``),
  '',
  '## Priority actions',
  ...prioritizedActions.flatMap((action, index) => [
    `${index + 1}. **${action.id}** — ${action.reason}`,
    `   - command: \`${action.command}\``,
    `   - outputs: ${action.outputs.map((item) => `\`${item}\``).join(', ')}`,
  ]),
  '',
  '## Existing helper scripts',
  `- capture: \`${captureKit.outputs?.captureScript ?? 'exports/intel-mac-live-browser-proof-drop/capture-on-intel-mac.sh'}\``,
  `- stage: \`${captureKit.outputs?.stageScript ?? 'exports/intel-mac-live-browser-proof-drop/stage-artifacts-on-intel-mac.sh'}\``,
  `- package: \`${captureKit.outputs?.packageScript ?? 'exports/intel-mac-live-browser-proof-drop/package-proof-bundle.sh'}\``,
  `- finalize: \`${captureKit.outputs?.finalizeScript ?? 'exports/intel-mac-live-browser-proof-drop/finalize-on-host.sh'}\``,
  '',
  '## Failed check kinds',
  ...(failedKinds.length ? failedKinds.map((item) => `- \`${item}\``) : ['- none']),
  '',
  '## Blockers',
  ...((report.blockers.length ? report.blockers : [{ scope: 'status', kind: 'none', target: 'n/a', action: 'no blockers' }]).map((item) => `- [${item.scope}] \`${item.kind}\` → \`${item.target}\`${item.action ? ` — ${item.action}` : ''}`)),
  '',
].join('\n');

ensureParent(writeJsonPath);
ensureParent(writeMarkdownPath);
fs.writeFileSync(writeJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
fs.writeFileSync(writeMarkdownPath, markdown + '\n', 'utf8');

if (mirrorToDrop) {
  const dropJsonPath = path.join(sourceDir, 'OPERATOR_PACKET.json');
  const dropMarkdownPath = path.join(sourceDir, 'OPERATOR_PACKET.md');
  fs.writeFileSync(dropJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  fs.writeFileSync(dropMarkdownPath, markdown + '\n', 'utf8');
}

console.log(`[emit-intel-mac-live-browser-proof-operator-packet] wrote ${relRoot(writeJsonPath)} and ${relRoot(writeMarkdownPath)}`);
