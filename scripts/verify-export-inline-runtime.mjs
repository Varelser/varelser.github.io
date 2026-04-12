import fs from 'node:fs';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { loadInlineVerifyHtml } from './verifyInlineRuntime.mjs';

const readPngAlphaStats = (buffer) => {
  const png = PNG.sync.read(buffer);
  let transparentPixels = 0;
  let partialAlphaPixels = 0;
  for (let index = 3; index < png.data.length; index += 4) {
    const alpha = png.data[index];
    if (alpha === 0) transparentPixels += 1;
    else if (alpha < 255) partialAlphaPixels += 1;
  }
  return { width: png.width, height: png.height, transparentPixels, partialAlphaPixels, totalPixels: png.width * png.height };
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
      if (!(button instanceof HTMLButtonElement)) throw new Error('Transparent BG toggle button not found');
      button.click();
    });
    await page.waitForTimeout(150);
  }
};

const exportImage = async (page) => {
  const previousCount = await page.evaluate(() => window.__capturedDownloads.length);
  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll('button')).find((node) => node.textContent?.includes('Save Image'));
    if (!(button instanceof HTMLButtonElement)) throw new Error('Save Image button not found');
    button.click();
  });
  await page.waitForFunction((count) => window.__capturedDownloads.length > count, previousCount, { timeout: 30000 });
  return page.evaluate(() => window.__capturedDownloads[window.__capturedDownloads.length - 1]);
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

const main = async () => {
  const browser = await launchBrowser();
  let context;
  try {
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
    const inlineBundle = await loadInlineVerifyHtml();
    await page.setContent(inlineBundle.html, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Array.from(document.querySelectorAll('button')).some((node) => node.textContent?.includes('Save Image')), { timeout: 30000 });
    await page.waitForTimeout(600);
    await clickTransparentToggle(page, false);
    const opaqueDataUrl = await exportImage(page);
    await clickTransparentToggle(page, true);
    const transparentDataUrl = await exportImage(page);
    console.log(JSON.stringify({
      mode: 'inline-runtime',
      verificationTier: 'inline-runtime-export-fallback',
      opaqueStats: readPngAlphaStats(decodeDataUrl(opaqueDataUrl)),
      transparentStats: readPngAlphaStats(decodeDataUrl(transparentDataUrl)),
      inlineAssetRefs: inlineBundle.assetRefs,
    }));
  } finally {
    if (context) await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? `${error.name}: ${error.message}` : String(error));
  process.exitCode = 1;
});
