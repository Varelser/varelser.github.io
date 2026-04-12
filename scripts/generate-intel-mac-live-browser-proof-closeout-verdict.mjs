import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const writeJsonArg = getArgValue('--write-json') || 'docs/archive/intel-mac-live-browser-proof-closeout-verdict.json';
const writeMarkdownArg = getArgValue('--write-markdown') || 'docs/archive/intel-mac-live-browser-proof-closeout-verdict.md';
const writeJsonPath = path.resolve(rootDir, writeJsonArg);
const writeMarkdownPath = path.resolve(rootDir, writeMarkdownArg);

const readJsonSafe = (relativePath) => {
  const absolutePath = path.resolve(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  try { return JSON.parse(fs.readFileSync(absolutePath, 'utf8')); } catch { return null; }
};

const status = readJsonSafe('docs/archive/intel-mac-live-browser-proof-status.json');
const projection = readJsonSafe('docs/archive/intel-mac-live-browser-proof-projection.json');
const readiness = readJsonSafe('docs/archive/intel-mac-live-browser-proof-readiness-audit.json');
const finalize = readJsonSafe('docs/archive/intel-mac-live-browser-proof-finalize.json');
const doctor = readJsonSafe('docs/archive/intel-mac-live-browser-proof-doctor.json');
const blockers = status?.blockers ?? [];
const doctorStatus = doctor?.effectiveStatus ?? 'unknown';
const targetPassed = status?.summary?.targetPassed ?? 0;
const targetTotal = status?.summary?.targetTotal ?? 0;
const projectedPassed = projection?.summary?.projectedAfterFinalizePassed ?? 0;
const projectedTotal = projection?.summary?.projectedAfterFinalizeTotal ?? 0;
const finalizeRan = Boolean(finalize?.generatedAt);
const readyForRealCapture = Boolean(readiness?.decision?.readyForRealCapture);
const readyForHostFinalize = Boolean(readiness?.decision?.readyForHostFinalize);
const effectivelyClosable = Boolean(readiness?.decision?.effectivelyClosable);

let verdict = 'capture-missing-evidence';
if (effectivelyClosable && finalizeRan && doctorStatus === 'ready') verdict = 'closeout-complete';
else if (readyForHostFinalize) verdict = 'ready-for-host-finalize';
else if (readyForRealCapture) verdict = 'ready-for-real-capture';

const report = {
  generatedAt: new Date().toISOString(),
  verdict,
  score: {
    targetPassed,
    targetTotal,
    projectedPassed,
    projectedTotal,
    blockerCount: blockers.length,
  },
  readiness: {
    readyForRealCapture,
    readyForHostFinalize,
    effectivelyClosable,
    finalizeRan,
    doctorStatus,
  },
  blockerKinds: blockers.map((item) => item.kind),
  nextStep:
    verdict === 'closeout-complete' ? 'no further Intel Mac proof action is required' :
    verdict === 'ready-for-host-finalize' ? 'run finalize on the host with the actual browser executable path' :
    verdict === 'ready-for-real-capture' ? 'run capture on the Intel Mac target and return the bundle/fixtures' :
    'capture missing evidence on the Intel Mac target before host finalize',
};

fs.mkdirSync(path.dirname(writeJsonPath), { recursive: true });
fs.writeFileSync(writeJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

const lines = [
  '# Intel Mac Live Browser Proof Closeout Verdict',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- verdict: ${report.verdict}`,
  `- target: ${targetPassed}/${targetTotal}`,
  `- projectedAfterFinalize: ${projectedPassed}/${projectedTotal}`,
  `- blockerCount: ${blockers.length}`,
  `- doctorStatus: ${doctorStatus}`,
  `- finalizeRan: ${finalizeRan}`,
  '',
  '## Next Step',
  `- ${report.nextStep}`,
  '',
  '## Blockers',
  ...(blockers.length ? blockers.map((item) => `- [${item.scope}] ${item.kind}: ${item.target}`) : ['- none']),
  '',
];
fs.mkdirSync(path.dirname(writeMarkdownPath), { recursive: true });
fs.writeFileSync(writeMarkdownPath, lines.join('\n'), 'utf8');
console.log(`[generate-intel-mac-live-browser-proof-closeout-verdict] verdict=${verdict} blockers=${blockers.length}`);
