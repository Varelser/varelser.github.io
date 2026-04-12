import { normalizeConfig } from '../lib/appStateConfigNormalization';
import { createLegacyAudioRoutes } from '../lib/audioReactiveConfig';
import { createLegacySafeRetiredRuntimeConfig, getRetiredSafeLegacySliderIds } from '../lib/audioReactiveLegacyRuntime';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const baseline = normalizeConfig({
  audioRoutes: [],
  audioLegacySliderVisibilityMode: 'all',
  audioBassMotionScale: 1.2,
  audioTrebleMotionScale: 1.1,
});

const safeRetired = normalizeConfig({
  ...baseline,
  audioLegacySliderVisibilityMode: 'retired-safe',
  audioRoutes: createLegacyAudioRoutes(baseline),
});

const retiredIds = getRetiredSafeLegacySliderIds(safeRetired);
assert(retiredIds.includes('legacy-bass-motion'), 'expected legacy-bass-motion to be safe in retired-safe mode');
assert(retiredIds.includes('legacy-treble-motion'), 'expected legacy-treble-motion to be safe in retired-safe mode');

const retiredRuntime = createLegacySafeRetiredRuntimeConfig(safeRetired);
assert(retiredRuntime !== safeRetired, 'retired-safe runtime config should clone when muting safe legacy sliders');
assert(retiredRuntime.audioBassMotionScale === 0, 'safe bass motion slider should be muted in runtime config');
assert(retiredRuntime.audioTrebleMotionScale === 0, 'safe treble motion slider should be muted in runtime config');
assert(retiredRuntime.audioPulseScale === 0, 'safe pulse slider should be muted in runtime config');
assert(retiredRuntime.audioRoutes.length === safeRetired.audioRoutes.length, 'audio routes should remain intact after runtime retirement');

const reviewConfig = normalizeConfig({
  ...baseline,
  audioLegacySliderVisibilityMode: 'retired-safe',
  audioRoutes: createLegacyAudioRoutes(baseline).map((route) => (
    route.id === 'legacy-bass-motion'
      ? { ...route, amount: Number((route.amount * 0.5).toFixed(3)) }
      : route
  )),
});

const reviewIds = getRetiredSafeLegacySliderIds(reviewConfig);
assert(!reviewIds.includes('legacy-bass-motion'), 'residual legacy-bass-motion should not be treated as safe');
const reviewRuntime = createLegacySafeRetiredRuntimeConfig(reviewConfig);
assert(reviewRuntime.audioBassMotionScale === reviewConfig.audioBassMotionScale, 'review legacy slider should remain live in runtime config');
assert(reviewRuntime.audioTrebleMotionScale === 0, 'other safe sliders should still mute in runtime config');

const allModeRuntime = createLegacySafeRetiredRuntimeConfig(baseline);
assert(allModeRuntime === baseline, 'all mode should keep original config object');

console.log(JSON.stringify({
  ok: true,
  retiredSafeIds: retiredIds.length,
  reviewSafeIds: reviewIds.length,
}, null, 2));
