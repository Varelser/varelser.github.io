import { normalizeConfig } from '../lib/appStateConfigNormalization';
import { createLegacyAudioRoutes } from '../lib/audioReactiveConfig';
import { summarizeLegacyAudioRouteParity } from '../lib/audioReactiveValidation';
import {
  formatStoredAutoFixPreview,
  summarizeStoredAutoFixPreview,
} from '../lib/audioReactiveStoredAutoFixPreview';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const baseline = normalizeConfig({
  audioRoutes: [],
  audioLegacySliderVisibilityMode: 'retired-safe',
  audioBassMotionScale: 1.2,
  audioTrebleMotionScale: 1.1,
  audioPulseScale: 1.0,
});

const reviewConfig = normalizeConfig({
  ...baseline,
  audioRoutes: createLegacyAudioRoutes(baseline).map((route) => (
    route.id === 'legacy-bass-motion'
      ? { ...route, amount: Number((route.amount * 0.5).toFixed(3)) }
      : route
  )),
});

const parity = summarizeLegacyAudioRouteParity(reviewConfig, reviewConfig.audioRoutes);
const bassCandidate = parity.deprecationOrder.find((candidate) => candidate.legacyId === 'legacy-bass-motion');
assert(bassCandidate, 'expected legacy-bass-motion candidate');
assert(bassCandidate.status === 'review', 'expected review candidate before preview');

const presets = [
  {
    id: 'preset-review',
    name: 'Preset Review',
    config: reviewConfig,
    createdAt: '2026-04-07T00:00:00.000Z',
    updatedAt: '2026-04-07T00:00:00.000Z',
  },
];

const presetSequence = [
  {
    id: 'seq-review',
    presetId: 'preset-review',
    label: 'Sequence Review',
    holdSeconds: 1,
    transitionSeconds: 1,
    transitionEasing: 'linear' as const,
    screenSequenceDriveMode: 'inherit' as const,
    screenSequenceDriveStrengthMode: 'inherit' as const,
    screenSequenceDriveStrengthOverride: null,
    screenSequenceDriveMultiplier: 1,
    keyframeConfig: reviewConfig,
  },
];

const preview = summarizeStoredAutoFixPreview(presets, presetSequence, {
  scope: 'all',
  profile: 'safe',
  onlyKey: bassCandidate.key,
});

assert(preview.hasChanges, 'expected stored preview to detect changes');
assert(preview.totalUpdatedCount >= 2, 'expected both preset and keyframe updates');
assert(preview.totalReviewDelta < 0, 'expected preview to reduce review counts');
assert(preview.before, 'expected before summary');
assert(preview.after, 'expected after summary');
assert(preview.before?.presetContextCount === 1, 'expected preset context coverage before preview');
assert(preview.before?.keyframeContextCount === 1, 'expected keyframe coverage before preview');
assert(preview.sampleUpdatedIds.includes('Preset Review'), 'expected preset update sample');
assert(preview.sampleUpdatedIds.includes('Sequence Review'), 'expected keyframe update sample');

const formatted = formatStoredAutoFixPreview(preview);
assert(formatted.includes('scope=all'), 'formatted preview should include scope');
assert(formatted.includes('profile=safe'), 'formatted preview should include profile');
assert(formatted.includes(bassCandidate.key), 'formatted preview should include focused key');

console.log(JSON.stringify({
  ok: true,
  key: bassCandidate.key,
  updated: preview.totalUpdatedCount,
  reviewDelta: preview.totalReviewDelta,
  sampleUpdatedIds: preview.sampleUpdatedIds,
}, null, 2));
