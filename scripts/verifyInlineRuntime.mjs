import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const safeProjectId = path.basename(ROOT_DIR).replace(/[^a-z0-9._-]+/gi, '_').toLowerCase();
const BUILD_META_PATH = path.resolve(os.tmpdir(), 'kalokagathia-vite', safeProjectId, 'last-vite-build.json');

const resolveBuildOutDir = (fallback = 'dist-verify-inline') => {
  const requested = process.env.KALOKAGATHIA_OUT_DIR;
  if (requested) return path.isAbsolute(requested) ? requested : path.resolve(ROOT_DIR, requested);
  try {
    const meta = JSON.parse(readFileSync(BUILD_META_PATH, 'utf8'));
    if (meta?.mode === 'verify-inline' && typeof meta?.selectedOutDir === 'string' && meta.selectedOutDir.trim()) {
      return path.isAbsolute(meta.selectedOutDir) ? meta.selectedOutDir : path.resolve(ROOT_DIR, meta.selectedOutDir);
    }
  } catch {}
  return path.resolve(ROOT_DIR, fallback);
};

const DIST_DIR = resolveBuildOutDir('dist-verify-inline');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');
const nodeBin = process.execPath;

function inlineAssetTag(html, matcher, replacer) {
  let updated = html;
  for (const match of html.matchAll(matcher)) {
    updated = updated.replace(match[0], replacer(match));
  }
  return updated;
}

export function buildVerifyInlineBundle({ buildEnv = {} } = {}) {
  const result = spawnSync(nodeBin, ['scripts/run-vite.mjs', 'build', '--mode', 'verify-inline'], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    env: { ...process.env, VITE_VERIFY_INLINE: '1', ...buildEnv },
    stdio: 'pipe',
    timeout: 480_000,
    maxBuffer: 1024 * 1024 * 20,
  });

  if (result.status !== 0 || result.signal || result.error) {
    const tail = `${result.stdout ?? ''}
${result.stderr ?? ''}`.trim().split('\n').slice(-40).join('\n');
    throw new Error(`verify-inline build failed: ${tail}`);
  }
}

export async function loadInlineVerifyHtml(options = {}) {
  buildVerifyInlineBundle(options);
  let html = await fs.readFile(INDEX_PATH, 'utf8');

  html = inlineAssetTag(html, /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/g, (match) => `__STYLE__${match[1]}__`);
  html = inlineAssetTag(html, /<script[^>]+type="module"[^>]+src="([^"]+)"[^>]*><\/script>/g, (match) => `__SCRIPT__${match[1]}__`);
  html = html.replace(/<link[^>]+rel="modulepreload"[^>]*>/g, '');

  const assetRefs = [...html.matchAll(/__(STYLE|SCRIPT)__([^_]+?)__/g)].map(([, kind, ref]) => ({ kind, ref }));
  for (const asset of assetRefs) {
    const assetPath = path.resolve(DIST_DIR, `.${asset.ref}`);
    const content = await fs.readFile(assetPath, 'utf8');
    const replacement = asset.kind === 'STYLE'
      ? `<style data-inline-asset="${asset.ref}">\n${content}\n</style>`
      : `<script type="module" data-inline-asset="${asset.ref}">\n${content}\n</script>`;
    html = html.replace(`__${asset.kind}__${asset.ref}__`, replacement);
  }

  return {
    html,
    distDir: DIST_DIR,
    assetRefs: assetRefs.map((asset) => asset.ref),
  };
}
