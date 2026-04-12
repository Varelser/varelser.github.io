import fs from 'node:fs';
import path from 'node:path';

export function getLatestMtimeMs(targetPath, { exclude = new Set() } = {}) {
  if (!fs.existsSync(targetPath)) return 0;
  const stats = fs.statSync(targetPath);
  if (stats.isFile()) return stats.mtimeMs;

  let latest = stats.mtimeMs;
  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    if (exclude.has(entry.name)) continue;
    latest = Math.max(latest, getLatestMtimeMs(path.join(targetPath, entry.name), { exclude }));
  }
  return latest;
}

export function getBuildSourceTargets(rootDir) {
  return [
    'App.tsx',
    'AppInlineVerify.tsx',
    'index.tsx',
    'styles.css',
    'index.html',
    'vite.config.ts',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'public-library.json',
    'public-library.provenance.json',
    'metadata.json',
    'components',
    'lib',
    'types',
    'workers',
    'generated',
    'fixtures',
  ].map((value) => path.resolve(rootDir, value));
}

export function getFreshBuildState(rootDir, { distDirName = 'dist' } = {}) {
  const distDir = path.resolve(rootDir, distDirName);
  if (!fs.existsSync(distDir)) return { reusable: false, reason: 'dist-missing', distDir };

  let latestSourceMtimeMs = 0;
  for (const target of getBuildSourceTargets(rootDir)) {
    latestSourceMtimeMs = Math.max(
      latestSourceMtimeMs,
      getLatestMtimeMs(target, { exclude: new Set(['node_modules', 'dist', 'dist-verify-inline']) })
    );
  }

  const latestDistMtimeMs = getLatestMtimeMs(distDir);
  return {
    reusable: latestDistMtimeMs >= latestSourceMtimeMs && latestDistMtimeMs > 0,
    reason: latestDistMtimeMs >= latestSourceMtimeMs ? 'fresh-dist' : 'stale-dist',
    distDir,
    latestDistMtimeMs,
    latestSourceMtimeMs,
  };
}
