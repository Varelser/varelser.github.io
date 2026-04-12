import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();
const testsRoot = path.join(projectRoot, 'tests', 'unit');
const matchArgIndex = process.argv.findIndex((arg) => arg === '--match');
const match = matchArgIndex >= 0 ? process.argv[matchArgIndex + 1] ?? '' : '';

function collectTestFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTestFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

const allTests = collectTestFiles(testsRoot);
const selectedTests = match
  ? allTests.filter((filePath) => filePath.includes(match))
  : allTests;

if (selectedTests.length === 0) {
  console.error(match
    ? `[unit] No tests matched --match=${JSON.stringify(match)}`
    : '[unit] No test files found under tests/unit');
  process.exit(1);
}

let failureCount = 0;
const startedAt = Date.now();

for (const testFile of selectedTests) {
  const relativePath = path.relative(projectRoot, testFile);
  const testStartedAt = Date.now();
  const result = spawnSync(
    process.execPath,
    ['scripts/run-ts-entry.mjs', relativePath],
    {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'pipe',
      env: process.env,
    },
  );
  const elapsedMs = Date.now() - testStartedAt;
  const ok = result.status === 0;
  process.stdout.write(`${ok ? 'PASS' : 'FAIL'} ${relativePath} (${elapsedMs}ms)\n`);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (!ok) failureCount += 1;
}

const totalElapsedMs = Date.now() - startedAt;
if (failureCount > 0) {
  process.stderr.write(`[unit] ${failureCount}/${selectedTests.length} test files failed in ${totalElapsedMs}ms\n`);
  process.exit(1);
}

process.stdout.write(`[unit] ${selectedTests.length} test files passed in ${totalElapsedMs}ms\n`);
