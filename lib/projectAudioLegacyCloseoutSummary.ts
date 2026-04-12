import type { ParticleConfig, PresetRecord, PresetSequenceItem, ProjectAudioLegacyCloseoutSummary } from '../types';
import { summarizeLegacyAudioRouteParity } from './audioReactiveValidation';
import { summarizeAudioLegacyRetirementImpact } from './audioReactiveRetirementImpact';

function getRecommendedVisibilityMode(safeToDeprecateCount: number): ProjectAudioLegacyCloseoutSummary['recommendedVisibilityMode'] {
  return safeToDeprecateCount > 0 ? 'retired-safe' : 'review-blocked';
}

function getCloseoutCopy(
  status: ProjectAudioLegacyCloseoutSummary['status'],
  recommendedVisibilityMode: ProjectAudioLegacyCloseoutSummary['recommendedVisibilityMode'],
): Pick<ProjectAudioLegacyCloseoutSummary, 'requiresTargetHostProof' | 'closeoutMessage' | 'nextStepLabel'> {
  if (status === 'ready') {
    return {
      requiresTargetHostProof: true,
      closeoutMessage: `Legacy cleanup is locally ready. Keep ${recommendedVisibilityMode} mode active and finish with target-host live browser proof before declaring closeout final.`,
      nextStepLabel: 'Run target-host Intel Mac closeout proof and archive the result in Project IO.',
    };
  }

  if (status === 'blocked') {
    return {
      requiresTargetHostProof: false,
      closeoutMessage: 'Blocked legacy conflicts still remain. Do not call closeout final until blocked current or stored issues are cleared.',
      nextStepLabel: 'Resolve blocked legacy ids first, then rerun the closeout summary.',
    };
  }

  return {
    requiresTargetHostProof: false,
    closeoutMessage: 'Legacy cleanup is in watchlist mode. Review or residual items still need attention before target-host closeout proof.',
    nextStepLabel: `Finish review and residual cleanup, then switch to ${recommendedVisibilityMode} and export a fresh manifest.`,
  };
}

export function buildProjectAudioLegacyCloseoutSummary(
  config: ParticleConfig,
  presets: PresetRecord[] = [],
  presetSequence: PresetSequenceItem[] = [],
): ProjectAudioLegacyCloseoutSummary {
  const parity = summarizeLegacyAudioRouteParity(config, config.audioRoutes);
  const impact = summarizeAudioLegacyRetirementImpact(config, presets, presetSequence);

  const currentReviewCount = parity.reviewBeforeDeprecateCount;
  const currentBlockedCount = parity.blockedDeprecationCount;
  const currentResidualCount = parity.residualCount;
  const storedReviewCount = impact.presets.affectedReviewCount + impact.sequence.linkedPresetReviewCount + impact.sequence.keyframeReviewCount;
  const storedBlockedCount = impact.presets.affectedBlockedCount + impact.sequence.linkedPresetBlockedCount + impact.sequence.keyframeBlockedCount;
  const recommendedVisibilityMode = getRecommendedVisibilityMode(parity.safeToDeprecateCount);

  const status: ProjectAudioLegacyCloseoutSummary['status'] =
    currentBlockedCount > 0 || storedBlockedCount > 0
      ? 'blocked'
      : currentReviewCount > 0 || currentResidualCount > 0 || storedReviewCount > 0
        ? 'watchlist'
        : 'ready';

  return {
    status,
    currentVisibilityMode: config.audioLegacySliderVisibilityMode,
    recommendedVisibilityMode,
    modeDrift: config.audioLegacySliderVisibilityMode !== recommendedVisibilityMode,
    safeToDeprecateCount: parity.safeToDeprecateCount,
    currentReviewCount,
    currentBlockedCount,
    currentResidualCount,
    storedReviewCount,
    storedBlockedCount,
    highestRiskLegacyIds: impact.highestRiskCandidates.slice(0, 5).map((candidate) => candidate.legacyId),
    ...getCloseoutCopy(status, recommendedVisibilityMode),
  };
}
