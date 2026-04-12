import { chromium } from 'playwright';
import { getChromiumLaunchOptions, runStaticChecks, runVerification } from './verifyRuntimeFallback.mjs';
import { loadInlineVerifyHtml } from './verifyInlineRuntime.mjs';

const APP_URL = process.env.APP_URL || 'http://127.0.0.1:3000/';

const STATIC_CHECKS = [
  { label: 'public-library-gate', file: 'App.tsx', markers: ["LIBRARY_SCOPE === 'public'", 'loadPublicPresetLibraryData'] },
  { label: 'public-exhibition-notice', file: 'components/controlPanelTabs.tsx', markers: ['Public exhibition mode: scene parameters and sequence editing are locked.'] },
  { label: 'public-preset-locks', file: 'components/controlPanelGlobalPresets.tsx', markers: ['Public build: bundled presets are read-only.', 'Browse Library'] },
  { label: 'public-sequence-locks', file: 'components/controlPanelGlobalSequence.tsx', markers: ['Playlist structure is bundled in the public build.', 'Locked in public build'] },
  { label: 'bundled-public-library', file: 'public-library.json', markers: ['"presets"', '"presetSequence"'] },
];

const buildFallbackReport = async (error) => {
  try {
    return await verifyInlinePublicUi(error);
  } catch (inlineError) {
    const staticReport = await runStaticChecks({
      verifier: 'public-ui',
      appUrl: APP_URL,
      error,
      checks: STATIC_CHECKS,
      extra: {
        inlineRuntimeAttempted: true,
        inlineRuntimePassed: false,
        inlineRuntimeError: inlineError instanceof Error ? inlineError.message : String(inlineError),
      },
    });
    return staticReport;
  }
};

function resolvePublicAppUrl() {
  const resolvedUrl = new URL(APP_URL);
  if (!resolvedUrl.searchParams.has('libraryScope')) resolvedUrl.searchParams.set('libraryScope', 'public');
  return resolvedUrl.toString();
}

async function collectPublicUiSummary(page) {
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h2, div, span')).some((node) => node.textContent?.includes('KALOKAGATHIA')),
    { timeout: 30000 }
  );

  return page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const textNodes = Array.from(document.querySelectorAll('div, span, h2'));

    const exhibitionNoticeVisible = textNodes.some((node) =>
      node.textContent?.includes('Public exhibition mode: scene parameters and sequence editing are locked.')
    );
    const readOnlyNoticeVisible = textNodes.some((node) =>
      node.textContent?.includes('Public build: bundled presets are read-only.')
    );
    const playlistNoticeVisible = textNodes.some((node) =>
      node.textContent?.includes('Playlist structure is bundled in the public build.')
    );

    const randomizeButton = buttons.find((node) => node.getAttribute('title')?.includes('Locked in public build') && node.textContent?.trim() === '');
    const resetButton = buttons.find((node) => node.getAttribute('title') === 'Locked in public build');
    const lockedButtons = buttons.filter((node) => node.getAttribute('title') === 'Locked in public build' && node.hasAttribute('disabled')).length;
    const playSequenceButton = buttons.find((node) => node.textContent?.includes('Play Sequence') || node.textContent?.includes('Stop Sequence'));
    const loadButton = buttons.find((node) => node.textContent?.trim() === 'Load');
    const morphButton = buttons.find((node) => node.textContent?.trim() === 'Morph');

    const saveNewInputPresent = Boolean(document.querySelector('input[placeholder="New preset name"]'));
    const exportJsonVisible = buttons.some((node) => node.textContent?.includes('Export JSON'));
    const importJsonVisible = buttons.some((node) => node.textContent?.includes('Import JSON'));
    const sequenceStepTextInputPresent = Array.from(document.querySelectorAll('input[type="text"]')).some((node) =>
      node instanceof HTMLInputElement && node.value.trim().length > 0
    );

    return {
      exhibitionNoticeVisible,
      readOnlyNoticeVisible,
      playlistNoticeVisible,
      lockedButtons,
      randomizeDisabled: Boolean(randomizeButton?.hasAttribute('disabled')),
      resetDisabled: Boolean(resetButton?.hasAttribute('disabled')),
      playSequenceAvailable: Boolean(playSequenceButton && !playSequenceButton.hasAttribute('disabled')),
      loadAvailable: Boolean(loadButton && !loadButton.hasAttribute('disabled')),
      morphAvailable: Boolean(morphButton && !morphButton.hasAttribute('disabled')),
      saveNewInputPresent,
      exportJsonVisible,
      importJsonVisible,
      sequenceStepTextInputPresent,
    };
  });
}

function assertPublicUiSummary(summary) {
  if (!summary.exhibitionNoticeVisible) {
    throw new Error('Public exhibition notice not found. Ensure the app is running with VITE_LIBRARY_SCOPE=public or verify-inline public bundle.');
  }
  if (!summary.readOnlyNoticeVisible) {
    throw new Error('Bundled preset read-only notice not found.');
  }
  if (!summary.playlistNoticeVisible) {
    throw new Error('Public playlist notice not found.');
  }
  if (!summary.randomizeDisabled || !summary.resetDisabled) {
    throw new Error(`Expected randomize/reset to be disabled: ${JSON.stringify(summary)}`);
  }
  if (summary.lockedButtons < 3) {
    throw new Error(`Expected multiple locked public-mode controls: ${JSON.stringify(summary)}`);
  }
  if (!summary.playSequenceAvailable || !summary.loadAvailable || !summary.morphAvailable) {
    throw new Error(`Expected playback and preset actions to remain available: ${JSON.stringify(summary)}`);
  }
  if (summary.saveNewInputPresent || summary.exportJsonVisible || summary.importJsonVisible || summary.sequenceStepTextInputPresent) {
    throw new Error(`Found editing controls that should be hidden in public mode: ${JSON.stringify(summary)}`);
  }
}

async function withBrowser(task) {
  const browser = await chromium.launch(getChromiumLaunchOptions());
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.setViewportSize({ width: 1440, height: 960 });
    return await task(page);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function verifyLivePublicUi() {
  const resolvedUrl = resolvePublicAppUrl();
  return withBrowser(async (page) => {
    await page.goto(resolvedUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const summary = await collectPublicUiSummary(page);
    assertPublicUiSummary(summary);
    return {
      effectiveMode: 'live',
      verificationTier: 'live-browser',
      appUrl: resolvedUrl,
      transport: 'url-navigation',
      inlineAssetRefs: [],
      passed: true,
      ...summary,
    };
  });
}

async function verifyInlinePublicUi(triggerError) {
  return withBrowser(async (page) => {
    const inlineBundle = await loadInlineVerifyHtml({ buildEnv: { VITE_LIBRARY_SCOPE: 'public' } });
    await page.setContent(inlineBundle.html, { waitUntil: 'domcontentloaded' });
    const summary = await collectPublicUiSummary(page);
    assertPublicUiSummary(summary);
    return {
      verifier: 'public-ui',
      appUrl: APP_URL,
      effectiveMode: 'inline-runtime',
      verificationTier: 'inline-runtime-fallback',
      mode: 'inline-runtime-fallback',
      triggerReason: triggerError instanceof Error ? triggerError.message : String(triggerError),
      transport: 'inline-html',
      inlineAssetRefs: inlineBundle.assetRefs,
      inlineRuntimeAttempted: true,
      inlineRuntimePassed: true,
      passed: true,
      ...summary,
    };
  });
}

runVerification({
  verifier: 'public-ui',
  appUrl: APP_URL,
  live: verifyLivePublicUi,
  fallback: buildFallbackReport,
});
