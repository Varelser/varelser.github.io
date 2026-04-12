import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const isWindows = process.platform === 'win32';

const safeStat = (targetPath) => {
  try { return fs.statSync(targetPath); } catch { return null; }
};

const chmodIfNeeded = (targetPath) => {
  if (isWindows) return false;
  const stat = safeStat(targetPath);
  if (!stat?.isFile()) return false;
  const desiredMode = stat.mode | 0o111;
  if (desiredMode === stat.mode) return false;
  fs.chmodSync(targetPath, desiredMode);
  return true;
};

const listFiles = (dirPath) => {
  try {
    return fs.readdirSync(dirPath).map((name) => path.join(dirPath, name));
  } catch {
    return [];
  }
};

export function ensureRuntimeExecutables() {
  const changed = [];
  const explicitTargets = [
    'node_modules/@esbuild/linux-x64/bin/esbuild',
    'node_modules/esbuild/bin/esbuild',
  ].map((rel) => path.resolve(ROOT_DIR, rel));

  const dynamicTargets = [
    ...listFiles(path.resolve(ROOT_DIR, 'node_modules/.bin')),
    ...listFiles(path.resolve(ROOT_DIR, 'node_modules/esbuild/bin')),
    ...listFiles(path.resolve(ROOT_DIR, 'node_modules/@esbuild/linux-x64/bin')),
  ];

  const seen = new Set();
  for (const targetPath of [...explicitTargets, ...dynamicTargets]) {
    if (seen.has(targetPath)) continue;
    seen.add(targetPath);
    if (chmodIfNeeded(targetPath)) changed.push(path.relative(ROOT_DIR, targetPath));
  }

  return {
    platform: process.platform,
    changed,
    changedCount: changed.length,
    skipped: isWindows,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(ensureRuntimeExecutables(), null, 2));
}
