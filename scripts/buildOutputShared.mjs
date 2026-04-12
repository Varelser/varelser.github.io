import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function getBuildMetaPath(rootDir = process.cwd()) {
  const safeProjectId = path.basename(rootDir).replace(/[^a-z0-9._-]+/gi, '_').toLowerCase();
  return path.resolve(os.tmpdir(), 'kalokagathia-vite', safeProjectId, 'last-vite-build.json');
}

export function loadLatestBuildMeta(rootDir = process.cwd()) {
  try {
    const metaPath = getBuildMetaPath(rootDir);
    if (!fs.existsSync(metaPath)) return null;
    return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch {
    return null;
  }
}

export function resolveBuildOutDir(rootDir = process.cwd(), {
  fallback = 'dist',
  mode = null,
  allowMeta = true,
} = {}) {
  const requested = process.env.KALOKAGATHIA_OUT_DIR;
  if (requested) return path.isAbsolute(requested) ? requested : path.resolve(rootDir, requested);
  if (allowMeta) {
    const meta = loadLatestBuildMeta(rootDir);
    const metaMode = typeof meta?.mode === 'string' ? meta.mode.trim() : '';
    if (meta && typeof meta?.selectedOutDir === 'string' && meta.selectedOutDir.trim()) {
      if (!mode || metaMode === mode) {
        return path.isAbsolute(meta.selectedOutDir)
          ? meta.selectedOutDir
          : path.resolve(rootDir, meta.selectedOutDir);
      }
    }
  }
  return path.resolve(rootDir, fallback);
}

export function collectBuildOutputPaths(rootDir = process.cwd(), options = {}) {
  const outDir = resolveBuildOutDir(rootDir, options);
  return {
    outDir,
    indexHtmlPath: path.resolve(outDir, 'index.html'),
    assetsDir: path.resolve(outDir, 'assets'),
  };
}
