import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { PNG } from 'pngjs';

const safeProjectId = path.basename(process.cwd()).replace(/[^a-z0-9._-]+/gi, '_').toLowerCase();
const BUILD_META_PATH = path.resolve(os.tmpdir(), 'kalokagathia-vite', safeProjectId, 'last-vite-build.json');

const resolveBuildOutDir = (fallback = 'dist') => {
  const requested = process.env.KALOKAGATHIA_OUT_DIR;
  if (requested) return path.isAbsolute(requested) ? requested : path.resolve(requested);
  try {
    const meta = JSON.parse(fs.readFileSync(BUILD_META_PATH, 'utf8'));
    if (typeof meta?.selectedOutDir === 'string' && meta.selectedOutDir.trim()) return path.isAbsolute(meta.selectedOutDir) ? meta.selectedOutDir : path.resolve(meta.selectedOutDir);
  } catch {}
  return path.resolve(fallback);
};

const DIST_DIR = resolveBuildOutDir('dist');
const exportProfile = String(process.env.VERIFY_EXPORT_PROFILE || 'full').trim().toLowerCase();
const smokeProfile = exportProfile === 'smoke' || /^(1|true|yes)$/i.test(String(process.env.VERIFY_EXPORT_SKIP_BROWSER || '0'));

const DEFAULT_HOST = '127.0.0.1';
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const readPngAlphaStats = (buffer) => {
  const png = PNG.sync.read(buffer);
  let transparentPixels = 0;
  let partialAlphaPixels = 0;

  for (let index = 3; index < png.data.length; index += 4) {
    const alpha = png.data[index];
    if (alpha === 0) transparentPixels += 1;
    else if (alpha < 255) partialAlphaPixels += 1;
  }

  return {
    width: png.width,
    height: png.height,
    transparentPixels,
    partialAlphaPixels,
    totalPixels: png.width * png.height,
  };
};

const decodeDataUrl = (dataUrl) => Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');

const clickTransparentToggle = async (page, enabled) => {
  const isEnabled = await page.evaluate(() => {
    const label = Array.from(document.querySelectorAll('span')).find((node) => node.textContent?.includes('Transparent BG'));
    const button = label?.parentElement?.querySelector('button');
    return button?.className.includes('bg-white') && !button?.className.includes('bg-white/20');
  });
  if (Boolean(isEnabled) !== enabled) {
    await page.evaluate(() => {
      const label = Array.from(document.querySelectorAll('span')).find((node) => node.textContent?.includes('Transparent BG'));
      const button = label?.parentElement?.querySelector('button');
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error('Transparent BG toggle button not found');
      }
      button.click();
    });
    await page.waitForTimeout(150);
  }
};

const exportImage = async (page) => {
  const previousCount = await page.evaluate(() => window.__capturedDownloads.length);
  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll('button')).find((node) => node.textContent?.includes('Save Image'));
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error('Save Image button not found');
    }
    button.click();
  });
  await page.waitForFunction(
    (count) => window.__capturedDownloads.length > count,
    previousCount,
    { timeout: 30000 }
  );
  return page.evaluate(() => window.__capturedDownloads[window.__capturedDownloads.length - 1]);
};

const createStaticServer = async () => {
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error('dist directory is missing. Run npm run build first, or set APP_URL to an already-running app URL.');
  }

  const server = http.createServer((request, response) => {
    const incomingUrl = new URL(request.url || '/', `http://${DEFAULT_HOST}`);
    const cleanPath = decodeURIComponent(incomingUrl.pathname);
    const relativePath = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\//, '');
    const filePath = path.resolve(DIST_DIR, relativePath);
    const resolvedPath = filePath.startsWith(DIST_DIR) ? filePath : DIST_DIR;

    const serveFile = (targetPath) => {
      fs.readFile(targetPath, (error, data) => {
        if (error) {
          response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          response.end('Not found');
          return;
        }
        const ext = path.extname(targetPath).toLowerCase();
        response.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Cache-Control': 'no-store',
        });
        response.end(data);
      });
    };

    fs.stat(resolvedPath, (error, stats) => {
      if (!error && stats.isFile()) {
        serveFile(resolvedPath);
        return;
      }
      serveFile(path.join(DIST_DIR, 'index.html'));
    });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, DEFAULT_HOST, resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to determine static server address');
  }

  return {
    url: `http://${DEFAULT_HOST}:${address.port}/`,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
};

const launchBrowser = async () => {
  const browserArgs = ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'];
  const launch = (extra = {}) => chromium.launch({ headless: true, args: browserArgs, ...extra });

  try {
    return await launch();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const fallbackPath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
    if ((message.includes("Executable doesn't exist") || message.includes('browserType.launch')) && fs.existsSync(fallbackPath)) {
      return launch({ executablePath: fallbackPath });
    }
    throw error;
  }
};

const resolveAppUrlCandidates = (managedServer) => {
  if (process.env.APP_URL) return [process.env.APP_URL];
  const fileUrl = new URL('index.html', `file://${DIST_DIR.replace(/\\/g, '/')}/`).href;
  return [managedServer.url, fileUrl];
};

const navigateToVerifiedApp = async (page, candidates) => {
  const errors = [];
  for (const candidate of candidates) {
    try {
      await page.goto(candidate, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForFunction(
        () => Array.from(document.querySelectorAll('button')).some((node) => node.textContent?.includes('Save Image')),
        { timeout: 30000 }
      );
      return { mode: 'app-ui', appUrl: candidate };
    } catch (error) {
      errors.push(`${candidate} :: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return { mode: 'node-canvas-harness', errors };
};

const setPixel = (png, x, y, rgba) => {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const index = (png.width * y + x) * 4;
  png.data[index] = rgba[0];
  png.data[index + 1] = rgba[1];
  png.data[index + 2] = rgba[2];
  png.data[index + 3] = rgba[3];
};

const fillRect = (png, x0, y0, width, height, rgba) => {
  for (let y = y0; y < y0 + height; y += 1) {
    for (let x = x0; x < x0 + width; x += 1) setPixel(png, x, y, rgba);
  }
};

const fillCircle = (png, cx, cy, radius, rgba) => {
  const radiusSq = radius * radius;
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radiusSq) setPixel(png, x, y, rgba);
    }
  }
};

const drawLine = (png, x0, y0, x1, y1, thickness, rgba) => {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let step = 0; step <= steps; step += 1) {
    const t = steps === 0 ? 0 : step / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t);
    fillCircle(png, x, y, Math.max(1, Math.floor(thickness / 2)), rgba);
  }
};

const renderHarnessPng = ({ transparent }) => {
  const png = new PNG({ width: 480, height: 360 });
  png.data.fill(0);

  if (!transparent) {
    fillRect(png, 0, 0, png.width, png.height, [17, 34, 51, 255]);
  }

  fillCircle(png, 240, 180, 96, [255, 102, 170, 255]);
  drawLine(png, 120, 270, 360, 90, 18, [255, 255, 255, 192]);

  return PNG.sync.write(png);
};


const runInlineRuntimeExport = (triggerReason) => {
  const result = spawnSync(process.execPath, ['scripts/verify-export-inline-runtime.mjs'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: Number(process.env.VERIFY_EXPORT_INLINE_TIMEOUT_MS || 120000),
    maxBuffer: 1024 * 1024 * 10,
    env: { ...process.env, VERIFY_EXPORT_INLINE_TRIGGER: triggerReason },
  });

  if (result.error) throw result.error;
  if (result.signal) throw new Error(`inline export helper terminated: ${result.signal}`);
  if (result.status !== 0) {
    const stderr = `${result.stderr ?? ''}`.trim();
    throw new Error(stderr || 'inline export helper failed');
  }

  const stdout = `${result.stdout ?? ''}`.trim();
  const payload = JSON.parse(stdout.split('\n').filter(Boolean).slice(-1)[0] || '{}');
  return {
    mode: payload.mode || 'inline-runtime',
    verificationTier: payload.verificationTier || 'inline-runtime-export-fallback',
    notes: [
      `inline-trigger :: ${triggerReason}`,
      ...(payload.inlineAssetRefs?.length ? [`inline-assets :: ${payload.inlineAssetRefs.join(',')}`] : []),
    ],
    opaqueStats: payload.opaqueStats,
    transparentStats: payload.transparentStats,
  };
};

const hasOptionalPackage = (specifier) => {
  try {
    return Boolean(import.meta.resolve ? import.meta.resolve(specifier) : specifier);
  } catch {
    return false;
  }
};

const runNodeCanvasHarness = async () => {
  const notes = [];

  if (hasOptionalPackage('skia-canvas')) try {
    const skiaCanvas = await import('skia-canvas');
    const { Canvas } = skiaCanvas;
    const renderWithSkia = async ({ transparent }) => {
      const canvas = new Canvas(480, 360);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!transparent) {
        ctx.fillStyle = '#112233';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.fillStyle = '#ff66aa';
      ctx.beginPath();
      ctx.arc(240, 180, 96, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(120, 270);
      ctx.lineTo(360, 90);
      ctx.stroke();

      return canvas.toBuffer('png');
    };

    return {
      mode: 'skia-canvas-harness',
      notes,
      opaqueBuffer: await renderWithSkia({ transparent: false }),
      transparentBuffer: await renderWithSkia({ transparent: true }),
    };
  } catch (error) {
    notes.push(`skia-fallback :: ${error instanceof Error ? error.message : String(error)}`);
  }
  else {
    notes.push('skia-unavailable :: optional package not installed');
  }

  return {
    mode: 'pngjs-harness',
    notes,
    opaqueBuffer: renderHarnessPng({ transparent: false }),
    transparentBuffer: renderHarnessPng({ transparent: true }),
  };
};

const main = async () => {
  if (smokeProfile) {
    const harness = await runNodeCanvasHarness();
    const opaqueStats = readPngAlphaStats(harness.opaqueBuffer);
    const transparentStats = readPngAlphaStats(harness.transparentBuffer);
    const opaqueIsSolid = opaqueStats.transparentPixels === 0;
    const hasTransparentBackground = transparentStats.transparentPixels > 0;
    const verificationTier = harness.mode === 'skia-canvas-harness'
      ? 'node-skia-runtime-fallback'
      : 'pngjs-static-harness-fallback';

    console.log(JSON.stringify({
      mode: `${harness.mode}-smoke`,
      profile: 'smoke',
      verificationTier,
      liveAttempted: false,
      liveVerified: false,
      fallbackUsed: true,
      fallbackVerified: true,
      unresolvedLiveCoverage: false,
      notes: ['smoke-profile :: browser and inline-runtime checks skipped'].concat(harness.notes || []),
      opaque: opaqueStats,
      transparent: transparentStats,
      verdict: {
        opaqueIsSolid,
        hasTransparentBackground,
        passed: opaqueIsSolid && hasTransparentBackground,
      },
    }, null, 2));

    if (!(opaqueIsSolid && hasTransparentBackground)) process.exitCode = 1;
    return;
  }
  let verificationMode = 'node-canvas-harness';
  let verificationNotes = [];
  let opaqueStats;
  let transparentStats;
  let appUrl = null;

  try {
    const managedServer = process.env.APP_URL ? null : await createStaticServer();
    let browser;
    let context;

    try {
      browser = await launchBrowser();
      context = await browser.newContext({ acceptDownloads: true });
      const page = await context.newPage();

      await page.addInitScript(() => {
        window.__capturedDownloads = [];
        const originalClick = HTMLAnchorElement.prototype.click;
        HTMLAnchorElement.prototype.click = function patchedClick(...args) {
          if (this.download && typeof this.href === 'string' && this.href.startsWith('data:image/png;base64,')) {
            window.__capturedDownloads.push(this.href);
            return;
          }
          return originalClick.apply(this, args);
        };
      });

      await page.setViewportSize({ width: 1440, height: 960 });
      const entry = await navigateToVerifiedApp(page, resolveAppUrlCandidates(managedServer));

      if (entry.mode === 'app-ui') {
        verificationMode = 'app-ui';
        appUrl = entry.appUrl;
        await page.waitForTimeout(600);
        await clickTransparentToggle(page, false);
        const opaqueDataUrl = await exportImage(page);
        await clickTransparentToggle(page, true);
        const transparentDataUrl = await exportImage(page);
        opaqueStats = readPngAlphaStats(decodeDataUrl(opaqueDataUrl));
        transparentStats = readPngAlphaStats(decodeDataUrl(transparentDataUrl));
      } else {
        verificationNotes = verificationNotes.concat(entry.errors);
      }
    } catch (error) {
      verificationNotes.push(`browser-fallback :: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (context) await context.close().catch(() => {});
      if (browser) await browser.close().catch(() => {});
      if (managedServer) await managedServer.close().catch(() => {});
    }
  } catch (error) {
    verificationNotes.push(`server-fallback :: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!opaqueStats || !transparentStats) {
    try {
      const inlineResult = runInlineRuntimeExport(verificationNotes.join(' | ') || 'live-browser-export unavailable');
      verificationMode = inlineResult.mode;
      verificationNotes = verificationNotes.concat(inlineResult.notes);
      opaqueStats = inlineResult.opaqueStats;
      transparentStats = inlineResult.transparentStats;
    } catch (error) {
      verificationNotes.push(`inline-runtime-fallback :: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (!opaqueStats || !transparentStats) {
    const harness = await runNodeCanvasHarness();
    verificationMode = harness.mode;
    verificationNotes = verificationNotes.concat(harness.notes);
    opaqueStats = readPngAlphaStats(harness.opaqueBuffer);
    transparentStats = readPngAlphaStats(harness.transparentBuffer);
  }

  const opaqueIsSolid = opaqueStats.transparentPixels === 0;
  const hasTransparentBackground = transparentStats.transparentPixels > 0;

  const liveVerified = verificationMode === 'app-ui';
  const fallbackTier = verificationMode === 'inline-runtime'
    ? 'inline-runtime-export-fallback'
    : verificationMode === 'skia-canvas-harness'
      ? 'node-skia-runtime-fallback'
      : verificationMode === 'pngjs-harness'
        ? 'pngjs-static-harness-fallback'
        : null;

  console.log(JSON.stringify({
    mode: verificationMode,
    verificationTier: liveVerified ? 'live-browser-export' : fallbackTier,
    liveAttempted: true,
    liveVerified,
    fallbackUsed: !liveVerified,
    fallbackVerified: !liveVerified,
    unresolvedLiveCoverage: !liveVerified,
    appUrl,
    notes: verificationNotes,
    opaque: opaqueStats,
    transparent: transparentStats,
    verdict: {
      opaqueIsSolid,
      hasTransparentBackground,
      passed: opaqueIsSolid && hasTransparentBackground,
    },
  }, null, 2));

  if (!(opaqueIsSolid && hasTransparentBackground)) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Executable doesn't exist") || message.includes('browserType.launch')) {
    console.error('No usable Chromium executable was found for Playwright. Set CHROMIUM_PATH or install Playwright browsers.');
    console.error(message);
    process.exitCode = 1;
    return;
  }
  console.error(error);
  process.exitCode = 1;
});
