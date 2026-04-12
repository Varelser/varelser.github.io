import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const outDir = path.resolve(rootDir, '.artifacts');
const stamp = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());
const summaryPath = path.resolve(outDir, `proof-packet-split_${stamp}.json`);
const summaryMdPath = path.resolve(outDir, `proof-packet-split_${stamp}.md`);

fs.mkdirSync(outDir, { recursive: true });

const tasks = [
  { id: 'proof-packet-verify-status', command: process.execPath, args: ['scripts/package-proof-packet-verify-status.mjs'] },
  { id: 'proof-packet-intel-mac-closeout', command: process.execPath, args: ['scripts/package-proof-packet-intel-mac-closeout.mjs'] },
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
    fs.writeFileSync(summaryPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), passed: false, failedStep: task.id, results }, null, 2)}\n`, 'utf8');
    process.exit(run.status ?? 1);
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  passed: true,
  bundleCount: results.length,
  results,
};
fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
const markdown = [
  '# Proof Packet Split',
  '',
  `- generatedAt: ${summary.generatedAt}`,
  `- bundleCount: ${summary.bundleCount}`,
  `- passed: ${summary.passed}`,
  '',
  '## bundles',
  ...summary.results.map((entry) => `- ${entry.id}: ${entry.outputPath ? `\`${entry.outputPath}\`` : 'missing output'} (status ${entry.status})`),
].join('\n');
fs.writeFileSync(summaryMdPath, `${markdown}\n`, 'utf8');
console.log(summaryPath);
