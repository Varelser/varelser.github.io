import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const NATIVE_QUARANTINE_TARGET_DIRS = [
  'node_modules/@rollup',
  'node_modules/@esbuild',
  'node_modules/lightningcss',
  'node_modules/lightningcss-darwin-x64',
  'node_modules/@tailwindcss',
];

const TARGET_EXTENSIONS = new Set(['.node']);
const TARGET_BASENAMES = new Set(['esbuild']);

function walk(dir, results) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, results);
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name);
    if (TARGET_EXTENSIONS.has(ext) || TARGET_BASENAMES.has(entry.name)) {
      results.push(fullPath);
    }
  }
}

function readXattr(rootDir, args) {
  return spawnSync('xattr', args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

export function collectNativeBinaryCandidates(rootDir) {
  const files = [];
  for (const relativeDir of NATIVE_QUARANTINE_TARGET_DIRS) {
    walk(path.resolve(rootDir, relativeDir), files);
  }
  return [...new Set(files)].sort();
}

export function hasMacNativeQuarantineSupport() {
  if (process.platform !== 'darwin') return false;
  const probe = spawnSync('xattr', ['-h'], { encoding: 'utf8', stdio: 'pipe' });
  return probe.status === 0 || probe.status === 1;
}

export function hasQuarantineAttribute(rootDir, targetPath) {
  return readXattr(rootDir, ['-p', 'com.apple.quarantine', targetPath]).status === 0;
}

export function clearQuarantineAttribute(rootDir, targetPath) {
  return readXattr(rootDir, ['-d', 'com.apple.quarantine', targetPath]);
}

export function clearNativeQuarantine(rootDir) {
  if (!hasMacNativeQuarantineSupport()) {
    return {
      supported: false,
      clearedCount: 0,
      failedCount: 0,
      quarantinedFiles: [],
      clearedFiles: [],
      failedFiles: [],
    };
  }

  const candidates = collectNativeBinaryCandidates(rootDir);
  const quarantinedFiles = candidates.filter((targetPath) => hasQuarantineAttribute(rootDir, targetPath));
  const clearedFiles = [];
  const failedFiles = [];

  for (const filePath of quarantinedFiles) {
    const result = clearQuarantineAttribute(rootDir, filePath);
    if (result.status === 0) {
      clearedFiles.push(filePath);
    } else {
      failedFiles.push({
        filePath,
        stderr: result.stderr ?? '',
      });
    }
  }

  return {
    supported: true,
    clearedCount: clearedFiles.length,
    failedCount: failedFiles.length,
    quarantinedFiles,
    clearedFiles,
    failedFiles,
  };
}
