import type { ParticleConfig, PresetRecord, PresetSequenceItem, ProjectAudioLegacyRetirementSummary } from '../types';
import { summarizeAudioLegacyRetirementImpact } from './audioReactiveRetirementImpact';
import { summarizeLegacyAudioRouteParity } from './audioReactiveValidation';

function unique(values: string[], limit = 8) {
  return Array.from(new Set(values.filter((value) => typeof value === 'string' && value.trim().length > 0))).slice(0, limit);
}

export function buildProjectAudioLegacyRetirementSummary(
  config: ParticleConfig,
  presets: PresetRecord[] = [],
  presetSequence: PresetSequenceItem[] = [],
): ProjectAudioLegacyRetirementSummary {
  const parity = summarizeLegacyAudioRouteParity(config, config.audioRoutes);
  const impact = summarizeAudioLegacyRetirementImpact(config, presets, presetSequence);

  return {
    visibilityMode: config.audioLegacySliderVisibilityMode,
    safeToDeprecateCount: parity.safeToDeprecateCount,
    reviewBeforeDeprecateCount: parity.reviewBeforeDeprecateCount,
    blockedDeprecationCount: parity.blockedDeprecationCount,
    residualCount: parity.residualCount,
    presetAffectedReviewCount: impact.presets.affectedReviewCount,
    presetAffectedBlockedCount: impact.presets.affectedBlockedCount,
    sequenceLinkedPresetReviewCount: impact.sequence.linkedPresetReviewCount,
    sequenceLinkedPresetBlockedCount: impact.sequence.linkedPresetBlockedCount,
    keyframeReviewCount: impact.sequence.keyframeReviewCount,
    keyframeBlockedCount: impact.sequence.keyframeBlockedCount,
    highestRiskLegacyIds: unique(impact.highestRiskCandidates.map((candidate) => candidate.legacyId)),
    customConflictHotspotKeys: unique(impact.customConflictHotspots.map((hotspot) => hotspot.key)),
  };
}
