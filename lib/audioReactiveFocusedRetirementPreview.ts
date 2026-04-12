import type { ParticleConfig, PresetRecord, PresetSequenceItem } from '../types';
import { summarizeLegacyAudioRouteParity, type AudioLegacyDeprecationCandidate } from './audioReactiveValidation';

export interface AudioFocusedRetirementPreviewCandidateSummary {
  legacyId: string;
  key: string;
  status: 'review' | 'blocked';
  contextCount: number;
  currentConfig: boolean;
  presetCount: number;
  sequenceLinkedPresetCount: number;
  keyframeCount: number;
  sampleContexts: string[];
}

export interface AudioFocusedRetirementPreviewSummary {
  key: string;
  candidateCount: number;
  reviewCount: number;
  blockedCount: number;
  currentConfigCandidateCount: number;
  presetContextCount: number;
  sequenceLinkedPresetCount: number;
  keyframeContextCount: number;
  samplePresetNames: string[];
  sampleSequenceLabels: string[];
  sampleKeyframeLabels: string[];
  candidates: AudioFocusedRetirementPreviewCandidateSummary[];
}

interface CandidateAggregate {
  legacyId: string;
  key: string;
  status: 'review' | 'blocked';
  currentConfig: boolean;
  presetNames: Set<string>;
  sequenceLabels: Set<string>;
  keyframeLabels: Set<string>;
}

function pushSample(target: string[], value: string, limit = 5) {
  if (!target.includes(value) && target.length < limit) {
    target.push(value);
  }
}

function upsertCandidateAggregate(
  aggregates: Map<string, CandidateAggregate>,
  candidate: AudioLegacyDeprecationCandidate,
  context: 'current' | 'preset' | 'sequence-linked-preset' | 'keyframe',
  label: string,
) {
  if (candidate.status === 'safe') return;
  const aggregate = aggregates.get(candidate.legacyId) ?? {
    legacyId: candidate.legacyId,
    key: candidate.key,
    status: candidate.status,
    currentConfig: false,
    presetNames: new Set<string>(),
    sequenceLabels: new Set<string>(),
    keyframeLabels: new Set<string>(),
  };
  if (candidate.status === 'blocked') {
    aggregate.status = 'blocked';
  }
  if (context === 'current') {
    aggregate.currentConfig = true;
  } else if (context === 'preset') {
    aggregate.presetNames.add(label);
  } else if (context === 'sequence-linked-preset') {
    aggregate.sequenceLabels.add(label);
  } else {
    aggregate.keyframeLabels.add(label);
  }
  aggregates.set(candidate.legacyId, aggregate);
}

export function summarizeFocusedLegacyRetirementPreview(
  currentConfig: ParticleConfig,
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
  key: string | null | undefined,
): AudioFocusedRetirementPreviewSummary | null {
  const normalizedKey = key?.trim();
  if (!normalizedKey) return null;

  const aggregates = new Map<string, CandidateAggregate>();
  const samplePresetNames: string[] = [];
  const sampleSequenceLabels: string[] = [];
  const sampleKeyframeLabels: string[] = [];

  const pickCandidates = (config: ParticleConfig) => (
    summarizeLegacyAudioRouteParity(config, config.audioRoutes).deprecationOrder.filter(
      (candidate) => candidate.key === normalizedKey && candidate.status !== 'safe',
    )
  );

  pickCandidates(currentConfig).forEach((candidate) => {
    upsertCandidateAggregate(aggregates, candidate, 'current', 'Current Config');
  });

  const presetParityById = new Map<string, AudioLegacyDeprecationCandidate[]>();
  presets.forEach((preset) => {
    const candidates = pickCandidates(preset.config);
    presetParityById.set(preset.id, candidates);
    if (candidates.length <= 0) return;
    pushSample(samplePresetNames, preset.name);
    candidates.forEach((candidate) => {
      upsertCandidateAggregate(aggregates, candidate, 'preset', preset.name);
    });
  });

  presetSequence.forEach((item, index) => {
    const label = item.label?.trim() || `Sequence ${index + 1}`;
    const linkedPresetCandidates = presetParityById.get(item.presetId) ?? [];
    if (linkedPresetCandidates.length > 0) {
      pushSample(sampleSequenceLabels, label);
      linkedPresetCandidates.forEach((candidate) => {
        upsertCandidateAggregate(aggregates, candidate, 'sequence-linked-preset', label);
      });
    }
    if (!item.keyframeConfig) return;
    const keyframeCandidates = pickCandidates(item.keyframeConfig);
    if (keyframeCandidates.length <= 0) return;
    pushSample(sampleKeyframeLabels, label);
    keyframeCandidates.forEach((candidate) => {
      upsertCandidateAggregate(aggregates, candidate, 'keyframe', label);
    });
  });

  const candidates = Array.from(aggregates.values())
    .map<AudioFocusedRetirementPreviewCandidateSummary>((aggregate) => ({
      legacyId: aggregate.legacyId,
      key: aggregate.key,
      status: aggregate.status,
      contextCount:
        (aggregate.currentConfig ? 1 : 0)
        + aggregate.presetNames.size
        + aggregate.sequenceLabels.size
        + aggregate.keyframeLabels.size,
      currentConfig: aggregate.currentConfig,
      presetCount: aggregate.presetNames.size,
      sequenceLinkedPresetCount: aggregate.sequenceLabels.size,
      keyframeCount: aggregate.keyframeLabels.size,
      sampleContexts: [
        ...(aggregate.currentConfig ? ['Current Config'] : []),
        ...Array.from(aggregate.presetNames).slice(0, 2).map((name) => `Preset:${name}`),
        ...Array.from(aggregate.sequenceLabels).slice(0, 2).map((name) => `Sequence:${name}`),
        ...Array.from(aggregate.keyframeLabels).slice(0, 2).map((name) => `Keyframe:${name}`),
      ].slice(0, 6),
    }))
    .sort((left, right) => {
      const rank = (status: 'review' | 'blocked') => (status === 'blocked' ? 0 : 1);
      const statusDelta = rank(left.status) - rank(right.status);
      if (statusDelta !== 0) return statusDelta;
      if (right.contextCount !== left.contextCount) return right.contextCount - left.contextCount;
      return left.legacyId.localeCompare(right.legacyId);
    });

  return {
    key: normalizedKey,
    candidateCount: candidates.length,
    reviewCount: candidates.filter((candidate) => candidate.status === 'review').length,
    blockedCount: candidates.filter((candidate) => candidate.status === 'blocked').length,
    currentConfigCandidateCount: candidates.filter((candidate) => candidate.currentConfig).length,
    presetContextCount: candidates.reduce((sum, candidate) => sum + candidate.presetCount, 0),
    sequenceLinkedPresetCount: candidates.reduce((sum, candidate) => sum + candidate.sequenceLinkedPresetCount, 0),
    keyframeContextCount: candidates.reduce((sum, candidate) => sum + candidate.keyframeCount, 0),
    samplePresetNames,
    sampleSequenceLabels,
    sampleKeyframeLabels,
    candidates,
  };
}
