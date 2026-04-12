import { normalizeConfig } from '../lib/appStateConfigNormalization';
import type { PresetRecord, PresetSequenceItem } from '../types';
import { summarizeAudioLegacyRetirementImpact } from '../lib/audioReactiveRetirementImpact';
import { summarizeFocusedCustomConflict } from '../lib/audioReactiveValidation';
import {
  formatAudioLegacyFocusedRetirementSnapshot,
  formatAudioLegacyRetirementImpactSummary,
} from '../lib/audioReactiveRetirementImpactReport';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const config = normalizeConfig({
  audioLegacySliderVisibilityMode: 'retired-safe',
  audioBassMotionScale: 0.8,
  audioTrebleMotionScale: 0.4,
  audioPulseScale: 0.65,
  audioRoutesEnabled: true,
  audioRoutes: [
    {
      id: 'custom-bass-motion-a',
      enabled: true,
      source: 'bass',
      target: 'particle.motion',
      amount: 1.25,
      bias: 0,
      curve: 'linear',
      smoothing: 0.22,
      attack: 0.1,
      release: 0.3,
      clampMin: -2,
      clampMax: 2,
      mode: 'add',
      notes: 'custom',
    },
    {
      id: 'custom-bass-motion-b',
      enabled: true,
      source: 'bass',
      target: 'particle.motion',
      amount: 1.2,
      bias: 0,
      curve: 'linear',
      smoothing: 0.2,
      attack: 0.1,
      release: 0.28,
      clampMin: -2,
      clampMax: 2,
      mode: 'add',
      notes: 'custom-duplicate',
    },
  ],
});

const presets: PresetRecord[] = [
  {
    id: 'preset-review',
    name: 'Preset Review',
    createdAt: '2026-04-07T00:00:00.000Z',
    updatedAt: '2026-04-07T00:00:00.000Z',
    config: normalizeConfig({
      ...config,
      audioRoutes: [],
      audioRoutesEnabled: false,
      audioBassMotionScale: 0.75,
    }),
  },
];

const presetSequence: PresetSequenceItem[] = [
  {
    id: 'sequence-1',
    label: 'Sequence Review',
    presetId: 'preset-review',
    holdSeconds: 1.2,
    transitionSeconds: 0.3,
    transitionEasing: 'linear',
    screenSequenceDriveMode: 'inherit',
    screenSequenceDriveStrengthMode: 'inherit',
    screenSequenceDriveStrengthOverride: null,
    screenSequenceDriveMultiplier: 1,
    keyframeConfig: normalizeConfig({
      ...config,
      audioRoutes: [],
      audioRoutesEnabled: false,
      audioBassMotionScale: 0.55,
    }),
  },
];

const impact = summarizeAudioLegacyRetirementImpact(config, presets, presetSequence);
const report = formatAudioLegacyRetirementImpactSummary(impact);
assert(report.includes('current.review='), 'impact report should include current review count');
assert(report.includes('highestRiskCandidates:'), 'impact report should include candidate section');
assert(report.includes('customConflictHotspots:'), 'impact report should include hotspot section');

const focusedKey = impact.customConflictHotspots[0]?.key ?? null;
const focused = summarizeFocusedCustomConflict(config, config.audioRoutes, focusedKey);
const snapshot = formatAudioLegacyFocusedRetirementSnapshot({
  legacyRetirementImpact: impact,
  focusedCustomConflictDetail: focused,
  filteredCustomConflictHotspots: impact.customConflictHotspots,
});
assert(snapshot.includes('focusedConflict:'), 'focused snapshot should include focused section');
assert(snapshot.includes('visibleHotspots:'), 'focused snapshot should include visible hotspots section');
if (focusedKey) {
  assert(snapshot.includes(focusedKey), 'focused snapshot should include focused key');
}

console.log(JSON.stringify({
  highestRiskCandidates: impact.highestRiskCandidates.length,
  hotspots: impact.customConflictHotspots.length,
  focusedKey,
  reportLines: report.split('\n').length,
  snapshotLines: snapshot.split('\n').length,
}, null, 2));
