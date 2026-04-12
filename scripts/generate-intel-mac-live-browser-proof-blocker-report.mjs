import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const writeJsonArg = getArgValue('--write-json') || 'docs/archive/intel-mac-live-browser-proof-blockers.json';
const writeMarkdownArg = getArgValue('--write-markdown') || 'docs/archive/intel-mac-live-browser-proof-blockers.md';
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
const doctor = readJsonSafe('docs/archive/intel-mac-live-browser-proof-doctor.json');
const status = readJsonSafe('docs/archive/intel-mac-live-browser-proof-status.json');

const blockerMap = new Map();
const add = (scope, kind, target, action) => {
  const key = `${scope}:${kind}:${target}`;
  if (!blockerMap.has(key)) blockerMap.set(key, { scope, kind, target, action });
};
for (const item of dropCheck?.checks ?? []) {
  if (!item.ok) add('drop', item.kind, item.target, item.kind === 'proof-summary-json'
    ? 'real-export-proof.json を captured 状態に更新する'
    : item.kind === 'fixture-json' || item.kind === 'fixture-json-valid'
      ? 'real-export fixture JSON を追加または修正する'
      : item.kind === 'structured-proof-files'
        ? 'build log / verify log / console dump を追加する'
        : 'drop scaffold を確認する');
}
for (const item of targetReadiness?.checks ?? []) {
  if (!item.ok) add('target', item.kind, item.target, item.kind === 'browser-executable'
    ? 'Playwright Chromium か Chrome 実体を用意し、必要なら executable path を渡す'
    : item.kind === 'real-export-manifest' || item.kind === 'real-export-readiness-report'
      ? 'finalize:intel-mac-live-browser-proof を実行して再生成する'
      : 'Intel Mac live browser proof finalize を再実行する');
}

const blockers = Array.from(blockerMap.values());
const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    blockerCount: blockers.length,
    dropPassed: dropCheck?.summary?.passed ?? 0,
    dropTotal: dropCheck?.summary?.total ?? 0,
    targetPassed: targetReadiness?.summary?.passed ?? 0,
    targetTotal: targetReadiness?.summary?.total ?? 0,
    doctorNextStepCount: doctor?.nextSteps?.length ?? 0,
    statusBlockerCount: status?.blockers?.length ?? 0,
  },
  blockers,
};

fs.mkdirSync(path.dirname(writeJsonPath), { recursive: true });
fs.writeFileSync(writeJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
const lines = [
  '# Intel Mac Live Browser Proof Blockers',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- blockerCount: ${report.summary.blockerCount}`,
  `- drop: ${report.summary.dropPassed}/${report.summary.dropTotal}`,
  `- target: ${report.summary.targetPassed}/${report.summary.targetTotal}`,
  '',
  '## Blockers',
  ...(blockers.length ? blockers.map((item) => `- [${item.scope}] ${item.kind}: ${item.target} -> ${item.action}`) : ['- none']),
  '',
];
fs.mkdirSync(path.dirname(writeMarkdownPath), { recursive: true });
fs.writeFileSync(writeMarkdownPath, lines.join('\n'), 'utf8');
console.log(`[generate-intel-mac-live-browser-proof-blocker-report] blockers=${blockers.length} drop=${report.summary.dropPassed}/${report.summary.dropTotal} target=${report.summary.targetPassed}/${report.summary.targetTotal}`);
