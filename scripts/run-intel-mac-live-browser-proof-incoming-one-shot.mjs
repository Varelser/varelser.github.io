import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  getIntelMacLiveBrowserProofIncomingDir,
  listIntelMacLiveBrowserProofBundles,
} from './intelMacLiveBrowserProofShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};

const sourceDirArg = getArgValue('--source-dir') || 'exports/intel-mac-live-browser-proof-drop';
const sourceDir = path.resolve(rootDir, sourceDirArg);
const incomingDir = getIntelMacLiveBrowserProofIncomingDir(rootDir, sourceDir);
const browserExecutablePath = getArgValue('--browser-executable-path');
const strict = hasFlag('--strict');
const dryRun = hasFlag('--dry-run');
const keepBundle = hasFlag('--keep-bundle');
const skipExtract = hasFlag('--skip-extract');
const skipFinalize = hasFlag('--skip-finalize');
const writePath = path.resolve(rootDir, getArgValue('--write') || 'docs/archive/intel-mac-live-browser-proof-incoming-one-shot.json');
const writeMarkdownPath = path.resolve(rootDir, getArgValue('--write-markdown') || 'docs/archive/intel-mac-live-browser-proof-incoming-one-shot.md');

const commandLog = [];
const run = (label, command, commandArgs, allowFailure = false) => {
  const result = spawnSync(command, commandArgs, { cwd: rootDir, stdio: 'inherit' });
  const status = result.status ?? 1;
  commandLog.push({ label, command, args: commandArgs, status, ok: status === 0 });
  if (!allowFailure && status !== 0) {
    console.error(`[run-intel-mac-live-browser-proof-incoming-one-shot] failed: ${label}`);
    process.exit(status);
  }
  return status;
};

const incomingFiles = fs.existsSync(incomingDir)
  ? fs.readdirSync(incomingDir).sort().map((name) => path.join(incomingDir, name)).filter((p) => fs.statSync(p).isFile())
  : [];
const bundleNames = listIntelMacLiveBrowserProofBundles(rootDir, sourceDir);

if (!skipExtract && bundleNames.length > 0) {
  const extractArgs = ['scripts/extract-intel-mac-live-browser-proof-bundle.mjs', '--source-dir', sourceDirArg, '--write', 'docs/archive/intel-mac-live-browser-proof-bundle-extract.json'];
  if (keepBundle) extractArgs.push('--keep-bundle');
  run('extract:intel-mac-live-browser-proof-bundle', process.execPath, extractArgs);
}

if (!skipFinalize && !dryRun) {
  const finalizeArgs = ['scripts/finalize-intel-mac-live-browser-proof.mjs', '--source-dir', sourceDirArg, '--write', 'docs/archive/intel-mac-live-browser-proof-finalize.json'];
  if (browserExecutablePath) finalizeArgs.push('--browser-executable-path', browserExecutablePath);
  if (strict) finalizeArgs.push('--strict');
  run('finalize:intel-mac-live-browser-proof', process.execPath, finalizeArgs, true);
}

run('report:intel-mac-live-browser-proof-readiness-audit', process.execPath, ['scripts/generate-intel-mac-live-browser-proof-readiness-audit.mjs']);
run('report:intel-mac-live-browser-proof-closeout-verdict', process.execPath, ['scripts/generate-intel-mac-live-browser-proof-closeout-verdict.mjs']);

const verdictPath = path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-closeout-verdict.json');
const auditPath = path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-readiness-audit.json');
const verdict = fs.existsSync(verdictPath) ? JSON.parse(fs.readFileSync(verdictPath, 'utf8')) : null;
const audit = fs.existsSync(auditPath) ? JSON.parse(fs.readFileSync(auditPath, 'utf8')) : null;

const report = {
  generatedAt: new Date().toISOString(),
  sourceDir: path.relative(rootDir, sourceDir),
  incomingDir: path.relative(rootDir, incomingDir),
  incomingFiles: incomingFiles.map((p) => path.relative(rootDir, p)),
  bundleCountBeforeRun: bundleNames.length,
  skipExtract,
  skipFinalize,
  strict,
  dryRun,
  keepBundle,
  browserExecutablePath: browserExecutablePath || null,
  commands: commandLog,
  verdict: verdict?.verdict ?? null,
  readyForRealCapture: audit?.decision?.readyForRealCapture ?? audit?.summary?.readyForRealCapture ?? null,
  readyForHostFinalize: audit?.decision?.readyForHostFinalize ?? audit?.summary?.readyForHostFinalize ?? null,
  effectivelyClosable: audit?.decision?.effectivelyClosable ?? audit?.summary?.effectivelyClosable ?? null,
  nextAction: verdict?.nextStep || verdict?.nextAction || audit?.nextActions?.[0] || 'review proof audit and verdict outputs',
};

fs.mkdirSync(path.dirname(writePath), { recursive: true });
fs.writeFileSync(writePath, JSON.stringify(report, null, 2) + '\n', 'utf8');

const lines = [
  '# Intel Mac Live Browser Proof Incoming One-Shot',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- sourceDir: ${report.sourceDir}`,
  `- incomingDir: ${report.incomingDir}`,
  `- incomingFiles: ${report.incomingFiles.length}`,
  `- bundleCountBeforeRun: ${report.bundleCountBeforeRun}`,
  `- skipExtract: ${report.skipExtract}`,
  `- skipFinalize: ${report.skipFinalize}`,
  `- strict: ${report.strict}`,
  `- dryRun: ${report.dryRun}`,
  `- browserExecutablePath: ${report.browserExecutablePath || 'auto'}`,
  `- verdict: ${report.verdict || 'unknown'}`,
  `- readyForRealCapture: ${report.readyForRealCapture}`,
  `- readyForHostFinalize: ${report.readyForHostFinalize}`,
  `- effectivelyClosable: ${report.effectivelyClosable}`,
  '',
  '## Commands',
  ...report.commands.map((item) => `- [${item.ok ? 'ok' : 'fail'}] ${item.label}`),
  '',
  '## Next Action',
  `- ${report.nextAction}`,
  '',
];
fs.mkdirSync(path.dirname(writeMarkdownPath), { recursive: true });
fs.writeFileSync(writeMarkdownPath, lines.join('\n'), 'utf8');
console.log(`[run-intel-mac-live-browser-proof-incoming-one-shot] verdict=${report.verdict} readyForHostFinalize=${report.readyForHostFinalize} effectivelyClosable=${report.effectivelyClosable}`);
