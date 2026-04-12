import { chromium } from 'playwright';
import { getChromiumLaunchOptions, runStaticChecks, runVerification } from './verifyRuntimeFallback.mjs';

const APP_URL = process.env.APP_URL || 'http://127.0.0.1:3000/';

const PRESET_STORAGE_KEY = 'kalokagathia-presets-v2';
const PRESET_SEQUENCE_STORAGE_KEY = 'kalokagathia-preset-sequence-v2';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clickButtonByText = async (page, text) => {
  await page.evaluate((targetText) => {
    const button = Array.from(document.querySelectorAll('button')).find((node) => node.textContent?.includes(targetText));
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error(`Button not found: ${targetText}`);
    }
    button.click();
  }, text);
};

const setPresetNameAndSave = async (page, name) => {
  await page.locator('input[placeholder="New preset name"]').fill(name);
  await clickButtonByText(page, 'Save New');
  await page.waitForFunction(
    (targetName) => Array.from(document.querySelectorAll('div')).some((node) => node.textContent?.includes(targetName)),
    name,
    { timeout: 30000 }
  );
};

const addPresetToSequence = async (page, presetName) => {
  await page.evaluate((targetName) => {
    const presetLabel = Array.from(document.querySelectorAll('div')).find((node) => node.textContent?.trim() === targetName);
    const card = presetLabel?.closest('div.rounded.border');
    const addButton = Array.from(card?.querySelectorAll('button') || []).find((node) => node.getAttribute('title') === 'Add to sequence');
    if (!(addButton instanceof HTMLButtonElement)) {
      throw new Error(`Add to sequence button not found for preset: ${targetName}`);
    }
    addButton.click();
  }, presetName);
  await wait(200);
};

const getLibraryStorageState = async (page) => page.evaluate(({ presetKey, sequenceKey }) => ({
  presets: JSON.parse(window.localStorage.getItem(presetKey) || '[]'),
  sequence: JSON.parse(window.localStorage.getItem(sequenceKey) || '[]'),
}), { presetKey: PRESET_STORAGE_KEY, sequenceKey: PRESET_SEQUENCE_STORAGE_KEY });

const exportLibrary = async (page) => {
  const previousCount = await page.evaluate(() => window.__capturedLibraryExports.length);
  await clickButtonByText(page, 'Export JSON');
  await page.waitForFunction(
    (count) => window.__capturedLibraryExports.length > count,
    previousCount,
    { timeout: 30000 }
  );
  return page.evaluate(() => window.__capturedLibraryExports[window.__capturedLibraryExports.length - 1]);
};

const setImportMode = async (page, mode) => {
  await page.evaluate((targetMode) => {
    const button = Array.from(document.querySelectorAll('button')).find((node) => node.textContent?.trim() === targetMode);
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error(`Import mode button not found: ${targetMode}`);
    }
    button.click();
  }, mode);
  await wait(150);
};

const importLibrary = async (page, payload, mode) => {
  await setImportMode(page, mode);
  await page.locator('input[type="file"]').setInputFiles({
    name: `library-${mode.toLowerCase()}.json`,
    mimeType: 'application/json',
    buffer: Buffer.from(payload, 'utf8'),
  });
  await page.waitForFunction(
    (expectedText) => Array.from(document.querySelectorAll('span, div')).some((node) => node.textContent?.includes(expectedText)),
    'Library imported',
    { timeout: 30000 }
  );
  await wait(200);
};


const buildFallbackReport = async (error) => runStaticChecks({
  verifier: 'library',
  appUrl: APP_URL,
  error,
  checks: [
    { label: 'library-storage-keys', file: 'lib/appStateLibrary.ts', markers: ['kalokagathia-presets-v2', 'kalokagathia-preset-sequence-v2', 'presetSequence'] },
    { label: 'library-io-controls', file: 'components/controlPanelPresetLibraryIO.tsx', markers: ['Export JSON', 'Import JSON'] },
    { label: 'library-transfer-runtime', file: 'lib/useLibraryTransfer.ts', markers: ['Library imported:', 'presets replaced.', 'presets appended.'] },
    { label: 'sequence-add-action', file: 'components/controlPanelPresetCard.tsx', markers: ['Add to sequence'] },
  ],
});

const main = async () => {
  const browser = await chromium.launch(getChromiumLaunchOptions());
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.__capturedLibraryExports = [];

      const originalCreateObjectURL = URL.createObjectURL.bind(URL);
      URL.createObjectURL = function patchedCreateObjectURL(blob) {
        if (blob instanceof Blob && blob.type === 'application/json') {
          blob.text().then((text) => {
            window.__capturedLibraryExports.push(text);
          });
        }
        return originalCreateObjectURL(blob);
      };
    });

    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('button')).some((node) => node.textContent?.includes('Save New')),
      { timeout: 30000 }
    );
    await wait(500);

    await setPresetNameAndSave(page, 'Library Alpha');
    await setPresetNameAndSave(page, 'Library Beta');
    await addPresetToSequence(page, 'Library Alpha');

    const beforeExportState = await getLibraryStorageState(page);
    const exportedPayload = await exportLibrary(page);
    const exportedLibrary = JSON.parse(exportedPayload);

    if (beforeExportState.presets.length !== 2 || beforeExportState.sequence.length !== 1) {
      throw new Error(`Unexpected pre-export state: ${JSON.stringify(beforeExportState)}`);
    }

    if (exportedLibrary.presets?.length !== 2 || exportedLibrary.presetSequence?.length !== 1) {
      throw new Error(`Exported library contents are invalid: ${JSON.stringify(exportedLibrary)}`);
    }

    await importLibrary(page, exportedPayload, 'Append');
    const appendedState = await getLibraryStorageState(page);

    if (appendedState.presets.length !== 4 || appendedState.sequence.length !== 2) {
      throw new Error(`Append import failed: ${JSON.stringify(appendedState)}`);
    }

    await importLibrary(page, exportedPayload, 'Replace');
    const replacedState = await getLibraryStorageState(page);

    if (replacedState.presets.length !== 2 || replacedState.sequence.length !== 1) {
      throw new Error(`Replace import failed: ${JSON.stringify(replacedState)}`);
    }

    console.log(JSON.stringify({
      appUrl: APP_URL,
      exportedPresets: exportedLibrary.presets.length,
      exportedSequenceItems: exportedLibrary.presetSequence.length,
      appendResult: {
        presets: appendedState.presets.length,
        sequence: appendedState.sequence.length,
      },
      replaceResult: {
        presets: replacedState.presets.length,
        sequence: replacedState.sequence.length,
      },
      passed: true,
    }, null, 2));
  } finally {
    await context.close();
    await browser.close();
  }
};

runVerification({
  verifier: 'library',
  appUrl: APP_URL,
  live: main,
  fallback: buildFallbackReport,
});
