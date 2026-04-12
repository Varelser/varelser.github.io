import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const archiveDir = path.resolve(rootDir, 'docs/archive');
const outCurrentJson = path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-current.json');
const outOneShotJson = path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-incoming-one-shot-current.json');
const outCurrentMd = path.resolve(rootDir, 'docs/INTEL_MAC_LIVE_BROWSER_PROOF_CURRENT.md');
const outOneShotMd = path.resolve(rootDir, 'docs/INTEL_MAC_INCOMING_ONE_SHOT_CURRENT.md');

const readJsonSafe = (relativePath) => {
  const absolutePath = path.resolve(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  try { return JSON.parse(fs.readFileSync(absolutePath, 'utf8')); } catch { return null; }
};

const status = readJsonSafe('docs/archive/intel-mac-live-browser-proof-status.json') ?? {};
const audit = readJsonSafe('docs/archive/intel-mac-live-browser-proof-readiness-audit.json') ?? {};
const verdict = readJsonSafe('docs/archive/intel-mac-live-browser-proof-closeout-verdict.json') ?? {};
const remediation = readJsonSafe('docs/archive/intel-mac-live-browser-proof-remediation.json') ?? {};
const blockerReport = readJsonSafe('docs/archive/intel-mac-live-browser-proof-blockers.json') ?? {};
const oneShot = readJsonSafe('docs/archive/intel-mac-live-browser-proof-incoming-one-shot.json') ?? {};

const current = {
  generatedAt: new Date().toISOString(),
  summary: {
    dropPassed: status.summary?.dropPassed ?? status.dropPassed ?? 0,
    dropTotal: status.summary?.dropTotal ?? status.dropTotal ?? 0,
    targetPassed: status.summary?.targetPassed ?? status.targetPassed ?? 0,
    targetTotal: status.summary?.targetTotal ?? status.targetTotal ?? 0,
    blockerCount: blockerReport.summary?.blockerCount ?? verdict.score?.blockerCount ?? remediation.summary?.blockerCount ?? remediation.blockerCount ?? 0,
    fixtureCount: status.summary?.fixtureCount ?? status.fixtureCount ?? 0,
    structuredProofFileCount: status.summary?.structuredProofFileCount ?? status.structuredProofFileCount ?? 0,
  },
  decision: {
    verdict: verdict.verdict ?? 'unknown',
    readyForRealCapture: audit.decision?.readyForRealCapture ?? false,
    readyForHostFinalize: audit.decision?.readyForHostFinalize ?? false,
    effectivelyClosable: audit.decision?.effectivelyClosable ?? false,
    recommendedMode: audit.decision?.recommendedMode ?? null,
    nextStep: verdict.nextStep ?? null,
  },
};

const oneShotCurrent = {
  generatedAt: new Date().toISOString(),
  verdict: oneShot.verdict ?? verdict.verdict ?? 'unknown',
  sourceDir: oneShot.sourceDir ?? 'exports/intel-mac-live-browser-proof-drop',
  incomingDir: oneShot.incomingDir ?? 'exports/intel-mac-live-browser-proof-drop/incoming',
  incomingFiles: oneShot.incomingFiles ?? [],
  bundleCountBeforeRun: oneShot.bundleCountBeforeRun ?? 0,
  readyForRealCapture: oneShot.readyForRealCapture ?? audit.decision?.readyForRealCapture ?? null,
  readyForHostFinalize: oneShot.readyForHostFinalize ?? audit.decision?.readyForHostFinalize ?? null,
  effectivelyClosable: oneShot.effectivelyClosable ?? audit.decision?.effectivelyClosable ?? null,
  nextAction: oneShot.nextAction ?? verdict.nextStep ?? 'review proof audit and verdict outputs',
};

fs.mkdirSync(archiveDir, { recursive: true });
fs.writeFileSync(outCurrentJson, JSON.stringify(current, null, 2) + '\n', 'utf8');
fs.writeFileSync(outOneShotJson, JSON.stringify(oneShotCurrent, null, 2) + '\n', 'utf8');

const currentLines = [
  '# Intel Mac Live Browser Proof Current',
  '',
  `- generatedAt: ${current.generatedAt}`,
  `- verdict: ${current.decision.verdict}`,
  `- drop: ${current.summary.dropPassed}/${current.summary.dropTotal}`,
  `- target: ${current.summary.targetPassed}/${current.summary.targetTotal}`,
  `- blockerCount: ${current.summary.blockerCount}`,
  `- fixtureCount: ${current.summary.fixtureCount}`,
  `- structuredProofFileCount: ${current.summary.structuredProofFileCount}`,
  `- readyForRealCapture: ${current.decision.readyForRealCapture}`,
  `- readyForHostFinalize: ${current.decision.readyForHostFinalize}`,
  `- effectivelyClosable: ${current.decision.effectivelyClosable}`,
  `- recommendedMode: ${current.decision.recommendedMode ?? 'unknown'}`,
  '',
  '## Next Step',
  `- ${current.decision.nextStep ?? 'run capture on the Intel Mac target and return the bundle/fixtures'}`,
  '',
];
const oneShotLines = [
  '# Intel Mac Incoming One-Shot Current',
  '',
  `- generatedAt: ${oneShotCurrent.generatedAt}`,
  `- sourceDir: ${oneShotCurrent.sourceDir}`,
  `- incomingDir: ${oneShotCurrent.incomingDir}`,
  `- incomingFiles: ${oneShotCurrent.incomingFiles.length}`,
  `- bundleCountBeforeRun: ${oneShotCurrent.bundleCountBeforeRun}`,
  `- verdict: ${oneShotCurrent.verdict}`,
  `- readyForRealCapture: ${oneShotCurrent.readyForRealCapture}`,
  `- readyForHostFinalize: ${oneShotCurrent.readyForHostFinalize}`,
  `- effectivelyClosable: ${oneShotCurrent.effectivelyClosable}`,
  '',
  '## Next Action',
  `- ${oneShotCurrent.nextAction}`,
  '',
];
fs.writeFileSync(outCurrentMd, currentLines.join('\n'), 'utf8');
fs.writeFileSync(outOneShotMd, oneShotLines.join('\n'), 'utf8');
console.log(`[generate-intel-mac-current-docs] verdict=${current.decision.verdict} drop=${current.summary.dropPassed}/${current.summary.dropTotal} target=${current.summary.targetPassed}/${current.summary.targetTotal}`);
