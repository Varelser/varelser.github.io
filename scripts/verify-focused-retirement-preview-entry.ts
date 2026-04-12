import { normalizeConfig } from '../lib/appStateConfigNormalization';
import { createLegacyAudioRoutes } from '../lib/audioReactiveConfig';
import { summarizeLegacyAudioRouteParity } from '../lib/audioReactiveValidation';
import { summarizeFocusedLegacyRetirementPreview } from '../lib/audioReactiveFocusedRetirementPreview';

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
assert(bassCandidate.status === 'review', 'expected legacy-bass-motion to become a review candidate');

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

const summary = summarizeFocusedLegacyRetirementPreview(
  reviewConfig,
  presets,
  presetSequence,
  bassCandidate.key,
);

assert(summary, 'expected focused retirement preview summary');
assert(summary.candidateCount >= 1, 'expected at least one candidate for focused retirement preview');
assert(summary.reviewCount >= 1, 'expected review candidates in focused retirement preview');
assert(summary.currentConfigCandidateCount >= 1, 'expected current config coverage');
assert(summary.presetContextCount >= 1, 'expected preset context coverage');
assert(summary.sequenceLinkedPresetCount >= 1, 'expected sequence-linked preset coverage');
assert(summary.keyframeContextCount >= 1, 'expected keyframe coverage');
assert(summary.samplePresetNames.includes('Preset Review'), 'expected preset sample label');
assert(summary.sampleSequenceLabels.includes('Sequence Review'), 'expected sequence sample label');
assert(summary.sampleKeyframeLabels.includes('Sequence Review'), 'expected keyframe sample label');

console.log(JSON.stringify({
  ok: true,
  key: summary.key,
  candidateCount: summary.candidateCount,
  reviewCount: summary.reviewCount,
  blockedCount: summary.blockedCount,
}, null, 2));
