import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2] ?? 'docs/archive/build-logs/2026-03-31/typecheck.out';
const raw = fs.readFileSync(inputPath, 'utf8');
const lines = raw.split(/\r?\n/);
const errorRegex = /^(?<file>.+?)\((?<line>\d+),(?<column>\d+)\): error (?<code>TS\d+): (?<message>.+)$/;

const codeCounts = new Map();
const fileCounts = new Map();
const sampleByCode = new Map();
const errors = [];

for (const line of lines) {
  const match = line.match(errorRegex);
  if (!match?.groups) continue;
  const { file, code, message } = match.groups;
  errors.push({ file, code, message });
  codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1);
  fileCounts.set(file, (fileCounts.get(file) ?? 0) + 1);
  if (!sampleByCode.has(code)) sampleByCode.set(code, line);
}

const topCodes = [...codeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
const topFiles = [...fileCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
const directoryCounts = new Map();
for (const [file, count] of fileCounts.entries()) {
  const dir = file.includes('/') ? file.split('/')[0] : '(root)';
  directoryCounts.set(dir, (directoryCounts.get(dir) ?? 0) + count);
}
const topDirectories = [...directoryCounts.entries()].sort((a, b) => b[1] - a[1]);

const siblingNames = ['typecheck.out', 'typecheck2.out', 'typecheck3.out', 'typecheck4.out'];
const siblingCounts = [];
for (const name of siblingNames) {
  const siblingPath = path.join(path.dirname(inputPath), name);
  if (!fs.existsSync(siblingPath)) continue;
  const siblingRaw = fs.readFileSync(siblingPath, 'utf8');
  const count = (siblingRaw.match(/error TS\d+:/g) ?? []).length;
  siblingCounts.push([name, count]);
}

const report = {
  inputPath,
  totalErrors: errors.length,
  fileCount: fileCounts.size,
  topCodes: topCodes.map(([code, count]) => ({ code, count, sample: sampleByCode.get(code) })),
  topFiles: topFiles.map(([file, count]) => ({ file, count })),
  directories: topDirectories.map(([directory, count]) => ({ directory, count })),
  siblings: siblingCounts.map(([name, count]) => ({ name, count })),
};

console.log(JSON.stringify(report, null, 2));
