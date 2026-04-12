import type { ParticleConfig, PresetRecord, PresetSequenceItem } from '../types';
import { summarizeLegacyAudioRouteParity, type AudioLegacyCustomConflictCandidate, type AudioLegacyDeprecationCandidate, type AudioLegacyParitySummary } from './audioReactiveValidation';

export interface AudioLegacyRetirementImpactContextSummary {
  total: number;
  affectedReviewCount: number;
  affectedBlockedCount: number;
  sampleReview: string[];
  sampleBlocked: string[];
}

export interface AudioLegacyRetirementImpactSequenceSummary {
  totalItems: number;
  linkedPresetReviewCount: number;
  linkedPresetBlockedCount: number;
  sampleLinkedPresetReview: string[];
  sampleLinkedPresetBlocked: string[];
  keyframeCount: number;
  keyframeReviewCount: number;
  keyframeBlockedCount: number;
  sampleKeyframeReview: string[];
  sampleKeyframeBlocked: string[];
}

export interface AudioLegacyRetirementImpactCandidateSummary {
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

export interface AudioLegacyRetirementImpactCustomConflictSummary {
  key: string;
  highestKind: AudioLegacyCustomConflictCandidate['conflictKind'];
  contextCount: number;
  currentConfig: boolean;
  presetCount: number;
  sequenceLinkedPresetCount: number;
  keyframeCount: number;
  sampleContexts: string[];
}

export interface AudioLegacyRetirementImpactSummary {
  currentConfig: Pick<AudioLegacyParitySummary, 'reviewBeforeDeprecateCount' | 'blockedDeprecationCount' | 'residualCount'>;
  presets: AudioLegacyRetirementImpactContextSummary;
  sequence: AudioLegacyRetirementImpactSequenceSummary;
  highestRiskCandidates: AudioLegacyRetirementImpactCandidateSummary[];
  customConflictHotspots: AudioLegacyRetirementImpactCustomConflictSummary[];
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

interface CustomConflictAggregate {
  key: string;
  highestKind: AudioLegacyCustomConflictCandidate['conflictKind'];
  currentConfig: boolean;
  presetNames: Set<string>;
  sequenceLabels: Set<string>;
  keyframeLabels: Set<string>;
}

function createEmptyContextSummary(total: number): AudioLegacyRetirementImpactContextSummary {
  return {
    total,
    affectedReviewCount: 0,
    affectedBlockedCount: 0,
    sampleReview: [],
    sampleBlocked: [],
  };
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
  if (candidate.status === 'safe') {
    return;
  }
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
  } else if (context === 'preset' || context === 'sequence-linked-preset') {
    aggregate.presetNames.add(label);
    if (context === 'sequence-linked-preset') {
      aggregate.sequenceLabels.add(label);
    }
  } else if (context === 'keyframe') {
    aggregate.keyframeLabels.add(label);
  }
  aggregates.set(candidate.legacyId, aggregate);
}


function upsertCustomConflictAggregate(
  aggregates: Map<string, CustomConflictAggregate>,
  candidate: AudioLegacyCustomConflictCandidate,
  context: 'current' | 'preset' | 'sequence-linked-preset' | 'keyframe',
  label: string,
) {
  const aggregate = aggregates.get(candidate.key) ?? {
    key: candidate.key,
    highestKind: candidate.conflictKind,
    currentConfig: false,
    presetNames: new Set<string>(),
    sequenceLabels: new Set<string>(),
    keyframeLabels: new Set<string>(),
  };
  const rank = (kind: AudioLegacyCustomConflictCandidate['conflictKind']) => (
    kind === 'mixed-custom-conflict' ? 0 : kind === 'other-custom-duplicate-conflict' ? 1 : 2
  );
  if (rank(candidate.conflictKind) < rank(aggregate.highestKind)) {
    aggregate.highestKind = candidate.conflictKind;
  }
  if (context === 'current') {
    aggregate.currentConfig = true;
  } else if (context === 'preset' || context === 'sequence-linked-preset') {
    aggregate.presetNames.add(label);
    if (context === 'sequence-linked-preset') {
      aggregate.sequenceLabels.add(label);
    }
  } else if (context === 'keyframe') {
    aggregate.keyframeLabels.add(label);
  }
  aggregates.set(candidate.key, aggregate);
}

export function summarizeAudioLegacyRetirementImpact(
  currentConfig: ParticleConfig,
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
): AudioLegacyRetirementImpactSummary {
  const currentParity = summarizeLegacyAudioRouteParity(currentConfig, currentConfig.audioRoutes);
  const candidateAggregates = new Map<string, CandidateAggregate>();
  const customConflictAggregates = new Map<string, CustomConflictAggregate>();

  currentParity.deprecationOrder.forEach((candidate) => {
    upsertCandidateAggregate(candidateAggregates, candidate, 'current', 'Current Config');
  });
  currentParity.customConflictCandidates.forEach((candidate) => {
    upsertCustomConflictAggregate(customConflictAggregates, candidate, 'current', 'Current Config');
  });

  const presetsSummary = createEmptyContextSummary(presets.length);
  const presetParityById = new Map<string, AudioLegacyParitySummary>();

  presets.forEach((preset) => {
    const parity = summarizeLegacyAudioRouteParity(preset.config, preset.config.audioRoutes);
    presetParityById.set(preset.id, parity);
    if (parity.reviewBeforeDeprecateCount > 0) {
      presetsSummary.affectedReviewCount += 1;
      pushSample(presetsSummary.sampleReview, preset.name);
    }
    if (parity.blockedDeprecationCount > 0) {
      presetsSummary.affectedBlockedCount += 1;
      pushSample(presetsSummary.sampleBlocked, preset.name);
    }
    parity.deprecationOrder.forEach((candidate) => {
      upsertCandidateAggregate(candidateAggregates, candidate, 'preset', preset.name);
    });
    parity.customConflictCandidates.forEach((candidate) => {
      upsertCustomConflictAggregate(customConflictAggregates, candidate, 'preset', preset.name);
    });
  });

  const sequenceSummary: AudioLegacyRetirementImpactSequenceSummary = {
    totalItems: presetSequence.length,
    linkedPresetReviewCount: 0,
    linkedPresetBlockedCount: 0,
    sampleLinkedPresetReview: [],
    sampleLinkedPresetBlocked: [],
    keyframeCount: 0,
    keyframeReviewCount: 0,
    keyframeBlockedCount: 0,
    sampleKeyframeReview: [],
    sampleKeyframeBlocked: [],
  };

  presetSequence.forEach((item, index) => {
    const sequenceLabel = item.label?.trim() || `Sequence ${index + 1}`;
    const linkedPresetParity = presetParityById.get(item.presetId);
    if (linkedPresetParity) {
      if (linkedPresetParity.reviewBeforeDeprecateCount > 0) {
        sequenceSummary.linkedPresetReviewCount += 1;
        pushSample(sequenceSummary.sampleLinkedPresetReview, sequenceLabel);
      }
      if (linkedPresetParity.blockedDeprecationCount > 0) {
        sequenceSummary.linkedPresetBlockedCount += 1;
        pushSample(sequenceSummary.sampleLinkedPresetBlocked, sequenceLabel);
      }
      linkedPresetParity.deprecationOrder.forEach((candidate) => {
        upsertCandidateAggregate(candidateAggregates, candidate, 'sequence-linked-preset', sequenceLabel);
      });
      linkedPresetParity.customConflictCandidates.forEach((candidate) => {
        upsertCustomConflictAggregate(customConflictAggregates, candidate, 'sequence-linked-preset', sequenceLabel);
      });
    }
    if (!item.keyframeConfig) {
      return;
    }
    sequenceSummary.keyframeCount += 1;
    const parity = summarizeLegacyAudioRouteParity(item.keyframeConfig, item.keyframeConfig.audioRoutes);
    if (parity.reviewBeforeDeprecateCount > 0) {
      sequenceSummary.keyframeReviewCount += 1;
      pushSample(sequenceSummary.sampleKeyframeReview, sequenceLabel);
    }
    if (parity.blockedDeprecationCount > 0) {
      sequenceSummary.keyframeBlockedCount += 1;
      pushSample(sequenceSummary.sampleKeyframeBlocked, sequenceLabel);
    }
    parity.deprecationOrder.forEach((candidate) => {
      upsertCandidateAggregate(candidateAggregates, candidate, 'keyframe', sequenceLabel);
    });
    parity.customConflictCandidates.forEach((candidate) => {
      upsertCustomConflictAggregate(customConflictAggregates, candidate, 'keyframe', sequenceLabel);
    });
  });

  const highestRiskCandidates = Array.from(candidateAggregates.values())
    .map<AudioLegacyRetirementImpactCandidateSummary>((aggregate) => ({
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
      if (statusDelta !== 0) {
        return statusDelta;
      }
      if (right.contextCount !== left.contextCount) {
        return right.contextCount - left.contextCount;
      }
      return left.key.localeCompare(right.key);
    })
    .slice(0, 8);

  const customConflictHotspots = Array.from(customConflictAggregates.values())
    .map<AudioLegacyRetirementImpactCustomConflictSummary>((aggregate) => ({
      key: aggregate.key,
      highestKind: aggregate.highestKind,
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
      const rank = (kind: AudioLegacyRetirementImpactCustomConflictSummary['highestKind']) => (
        kind === 'mixed-custom-conflict' ? 0 : kind === 'other-custom-duplicate-conflict' ? 1 : 2
      );
      const kindDelta = rank(left.highestKind) - rank(right.highestKind);
      if (kindDelta !== 0) {
        return kindDelta;
      }
      if (right.contextCount !== left.contextCount) {
        return right.contextCount - left.contextCount;
      }
      return left.key.localeCompare(right.key);
    })
    .slice(0, 10);

  return {
    currentConfig: {
      reviewBeforeDeprecateCount: currentParity.reviewBeforeDeprecateCount,
      blockedDeprecationCount: currentParity.blockedDeprecationCount,
      residualCount: currentParity.residualCount,
    },
    presets: presetsSummary,
    sequence: sequenceSummary,
    highestRiskCandidates,
    customConflictHotspots,
  };
}
