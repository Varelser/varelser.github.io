import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const nodeModulesPath = path.join(root, 'node_modules');
const tscBin = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
const viteBin = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
const tscJs = path.join(root, 'node_modules', 'typescript', 'lib', 'tsc.js');
const viteJs = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const packageLock = path.join(root, 'package-lock.json');

function exists(target) {
  return fs.existsSync(target);
}

function hasNonEmptyNodeModules() {
  if (!exists(nodeModulesPath)) return false;
  const entries = fs.readdirSync(nodeModulesPath).filter((entry) => entry !== '.cache');
  return entries.length > 0;
}

function getNodeVersion() {
  try {
    return execSync('node -v', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'unknown';
  }
}

const problems = [];
if (!exists(packageLock)) problems.push('package-lock.json missing');
if (!hasNonEmptyNodeModules()) problems.push('node_modules missing or empty');
if (!exists(tscJs)) problems.push('typescript runtime missing: node_modules/typescript/lib/tsc.js');
if (!exists(viteJs)) problems.push('vite runtime missing: node_modules/vite/bin/vite.js');

const report = {
  ok: problems.length === 0,
  nodeVersion: getNodeVersion(),
  hasPackageLock: exists(packageLock),
  hasNodeModules: hasNonEmptyNodeModules(),
  hasTscBin: exists(tscBin),
  hasViteBin: exists(viteBin),
  hasTscRuntime: exists(tscJs),
  hasViteRuntime: exists(viteJs),
  problems,
  fix: problems.length === 0 ? null : 'Run: npm run bootstrap',
};

console.log(JSON.stringify(report, null, 2));
if (problems.length > 0) process.exit(1);
