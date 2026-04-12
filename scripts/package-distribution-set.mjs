import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const outDir = path.resolve(rootDir, '.artifacts');
const stamp = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());
const summarySuffix = process.argv.includes('--proof-split') ? 'distribution-set-proof-split' : 'distribution-set';
const summaryPath = path.resolve(outDir, `${summarySuffix}_${stamp}.json`);
const summaryMdPath = path.resolve(outDir, `${summarySuffix}_${stamp}.md`);

fs.mkdirSync(outDir, { recursive: true });

const proofSplit = process.argv.includes('--proof-split');
const tasks = proofSplit
  ? [
      { id: 'full-local-dev', command: process.execPath, args: ['scripts/package-full-zip.mjs'] },
      { id: 'source-only-clean', command: 'bash', args: ['scripts/package-source-zip.sh'] },
      { id: 'proof-packet-verify-status', command: process.execPath, args: ['scripts/package-proof-packet-verify-status.mjs'] },
      { id: 'proof-packet-intel-mac-closeout', command: process.execPath, args: ['scripts/package-proof-packet-intel-mac-closeout.mjs'] },
    ]
  : [
      { id: 'full-local-dev', command: process.execPath, args: ['scripts/package-full-zip.mjs'] },
      { id: 'source-only-clean', command: 'bash', args: ['scripts/package-source-zip.sh'] },
      { id: 'proof-packet', command: process.execPath, args: ['scripts/package-proof-packet.mjs'] },
    ];

const results = [];
for (const task of tasks) {
  const run = spawnSync(task.command, task.args, {
    cwd: rootDir,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 64,
  });
  const combined = `${run.stdout ?? ''}${run.stderr ?? ''}`.trim();
  const lastLine = combined.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).at(-1) ?? null;
  const resolvedOutput = lastLine && fs.existsSync(lastLine) ? path.relative(rootDir, lastLine) : null;
  results.push({
    id: task.id,
    status: run.status ?? 1,
    outputPath: resolvedOutput,
    stdoutTail: combined.split(/\r?\n/).slice(-20),
  });
  if ((run.status ?? 1) !== 0) {
    fs.writeFileSync(summaryPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), passed: false, failedStep: task.id, proofSplit, results }, null, 2)}\n`, 'utf8');
    process.exit(run.status ?? 1);
  }
}

const indexRun = spawnSync(process.execPath, ['scripts/package-distribution-index.mjs'], {
  cwd: rootDir,
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 16,
});
const indexCombined = `${indexRun.stdout ?? ''}${indexRun.stderr ?? ''}`.trim();
const indexLastLine = indexCombined.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).at(-1) ?? null;
const indexJsonPath = indexLastLine && fs.existsSync(indexLastLine) ? path.relative(rootDir, indexLastLine) : null;
const indexMdPath = indexJsonPath?.endsWith('.json') ? indexJsonPath.replace(/\.json$/, '.md') : null;

const summary = {
  generatedAt: new Date().toISOString(),
  passed: true,
  proofSplit,
  bundleCount: results.length,
  results,
  index: {
    status: indexRun.status ?? 1,
    jsonPath: indexJsonPath,
    mdPath: indexMdPath,
  },
};
fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
const markdown = [
  '# Distribution Set',
  '',
  `- generatedAt: ${summary.generatedAt}`,
  `- bundleCount: ${summary.bundleCount}`,
  `- passed: ${summary.passed}`,
  `- proofSplit: ${summary.proofSplit}`,
  `- bundleIndexJson: ${summary.index.jsonPath ? `\`${summary.index.jsonPath}\`` : 'missing'}`,
  `- bundleIndexMd: ${summary.index.mdPath ? `\`${summary.index.mdPath}\`` : 'missing'}`,
  '',
  '## bundles',
  ...summary.results.map((entry) => `- ${entry.id}: ${entry.outputPath ? `\`${entry.outputPath}\`` : 'missing output'} (status ${entry.status})`),
].join('\n');
fs.writeFileSync(summaryMdPath, `${markdown}\n`, 'utf8');
console.log(summaryPath);
