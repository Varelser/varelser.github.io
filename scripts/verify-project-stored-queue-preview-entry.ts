import { buildProjectData, parseProjectData } from '../lib/projectState';
import { normalizeConfig } from '../lib/appStateConfigNormalization';
import { createLegacyAudioRoutes } from '../lib/audioReactiveConfig';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
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

const project = buildProjectData({
  name: 'Stored Queue Preview Compare',
  config: baseline,
  presets: [{
    id: 'preset-preview-queue',
    name: 'Preset Preview Queue',
    createdAt: '2026-04-07T00:00:00.000Z',
    updatedAt: '2026-04-07T00:00:00.000Z',
    config: reviewConfig,
  }],
  presetSequence: [{
    id: 'seq-preview-queue',
    presetId: 'preset-preview-queue',
    label: 'Sequence Preview Queue',
    holdSeconds: 1,
    transitionSeconds: 1,
    transitionEasing: 'linear',
    screenSequenceDriveMode: 'inherit',
    screenSequenceDriveStrengthMode: 'inherit',
    screenSequenceDriveStrengthOverride: null,
    screenSequenceDriveMultiplier: 1,
    keyframeConfig: reviewConfig,
  }],
  activePresetId: null,
  presetBlendDuration: 1.5,
  sequenceLoopEnabled: true,
  ui: {
    isPlaying: false,
    isPanelOpen: true,
    videoExportMode: 'current',
    videoDurationSeconds: 8,
    videoFps: 30,
  },
});

const summary = project.manifest.audioLegacyStoredQueuePreview;
assert(summary, 'manifest should include stored queue preview summary');
assert(summary.keyCount >= 1, 'expected preview keys');
assert(summary.totalUpdatedCount >= 1, 'expected staged stored updates');
assert(summary.beforePresetContextCount >= summary.afterPresetContextCount, 'expected preset contexts to stay same or shrink');
assert(summary.beforeKeyframeContextCount >= summary.afterKeyframeContextCount, 'expected keyframe contexts to stay same or shrink');
assert(summary.beforeManualResidualMergeCount >= summary.afterManualResidualMergeCount, 'expected residual merges to stay same or shrink');
assert(summary.totalReviewDelta <= 0, 'expected review delta to be non-positive');

const parsed = parseProjectData(JSON.parse(JSON.stringify(project)));
assert(parsed, 'parseProjectData returned null');
assert(parsed.manifest.audioLegacyStoredQueuePreview, 'parsed manifest should keep preview summary');
assert(JSON.stringify(parsed.manifest.audioLegacyStoredQueuePreview) === JSON.stringify(summary), 'parsed preview summary drift');

console.log(JSON.stringify(summary, null, 2));
