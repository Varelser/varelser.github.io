import { normalizeConfig } from '../lib/appStateConfigNormalization';
import { createLegacyAudioRoutes } from '../lib/audioReactiveConfig';
import {
  executeStoredManualQueuePreview,
  formatStoredManualQueuePreview,
} from '../lib/audioReactiveStoredManualQueuePreview';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const baseline = normalizeConfig({
  audioRoutes: [],
  audioBassMotionScale: 1.2,
  audioTrebleMotionScale: 1.1,
  audioPulseScale: 1.0,
  audioLegacySliderVisibilityMode: 'retired-safe',
});

const legacyRoutes = createLegacyAudioRoutes(baseline);
const bassLegacy = legacyRoutes.find((route) => route.id === 'legacy-bass-motion');
assert(bassLegacy, 'expected legacy bass motion route');

const reviewConfig = normalizeConfig({
  ...baseline,
  audioRoutes: [
    ...legacyRoutes,
    {
      ...bassLegacy,
      id: 'custom-bass-motion-preview',
      notes: 'manual preview residual',
      amount: Number((bassLegacy.amount * 0.5).toFixed(3)),
    },
  ],
});

const presets = [
  {
    id: 'preset-preview-queue',
    name: 'Preset Preview Queue',
    config: reviewConfig,
    createdAt: '2026-04-07T00:00:00.000Z',
    updatedAt: '2026-04-07T00:00:00.000Z',
  },
];

const presetSequence = [
  {
    id: 'seq-preview-queue',
    presetId: 'preset-preview-queue',
    label: 'Sequence Preview Queue',
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

const previewKey = `${bassLegacy.source} -> ${bassLegacy.target}`;

const preview = executeStoredManualQueuePreview(
  presets,
  presetSequence,
  [previewKey],
  { profile: 'align-residuals', scope: 'all', limit: 1 },
);

assert(preview.hasChanges, 'expected stored manual queue preview to detect changes');
assert(preview.before.manualResidualMergeCount === 2, 'expected manual residual merge before preview');
assert(preview.after.manualResidualMergeCount === 0, 'expected manual residual merge to be cleared');
assert(preview.presetUpdatedCount === 1, 'expected one preset update');
assert(preview.keyframeUpdatedCount === 1, 'expected one keyframe update');
assert(preview.appliedKeys.includes(previewKey), 'expected applied key');

const formatted = formatStoredManualQueuePreview(preview);
assert(formatted.includes('profile=align-residuals'), 'formatted preview should include profile');
assert(formatted.includes(previewKey), 'formatted preview should include key');

console.log(JSON.stringify({
  ok: true,
  keys: preview.keys,
  updated: preview.totalUpdatedCount,
  appliedKeys: preview.appliedKeys,
}, null, 2));
