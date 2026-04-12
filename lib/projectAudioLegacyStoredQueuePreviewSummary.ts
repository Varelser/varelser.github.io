import type { ParticleConfig, PresetRecord, PresetSequenceItem, ProjectAudioLegacyStoredQueuePreviewSummary } from '../types';
import { summarizeAudioLegacyRetirementImpact } from './audioReactiveRetirementImpact';
import { summarizeStoredFocusedConflict } from './audioReactiveRetirementMigration';
import { executeStoredManualQueuePreview } from './audioReactiveStoredManualQueuePreview';

export function buildProjectAudioLegacyStoredQueuePreviewSummary(
  config: ParticleConfig,
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
  limit = 3,
): ProjectAudioLegacyStoredQueuePreviewSummary {
  const hotspots = summarizeAudioLegacyRetirementImpact(config, presets, presetSequence).customConflictHotspots;
  const queueKeys = hotspots
    .map((hotspot) => {
      const summary = summarizeStoredFocusedConflict(presets, presetSequence, hotspot.key);
      const manualCount = summary.manualCustomChoiceCount + summary.manualResidualMergeCount;
      return manualCount > 0 ? hotspot.key : null;
    })
    .filter((value): value is string => Boolean(value));
  const preview = executeStoredManualQueuePreview(presets, presetSequence, queueKeys, {
    limit,
    scope: 'all',
    profile: 'align-residuals',
  });
  return {
    limit,
    scope: preview.scope,
    profile: preview.profile,
    keyCount: preview.keys.length,
    appliedKeyCount: preview.appliedKeys.length,
    presetUpdatedCount: preview.presetUpdatedCount,
    keyframeUpdatedCount: preview.keyframeUpdatedCount,
    totalUpdatedCount: preview.totalUpdatedCount,
    totalReviewDelta: preview.totalReviewDelta,
    totalBlockedDelta: preview.totalBlockedDelta,
    totalResidualDelta: preview.totalResidualDelta,
    beforePresetContextCount: preview.before.presetContextCount,
    afterPresetContextCount: preview.after.presetContextCount,
    beforeKeyframeContextCount: preview.before.keyframeContextCount,
    afterKeyframeContextCount: preview.after.keyframeContextCount,
    beforeManualCustomChoiceCount: preview.before.manualCustomChoiceCount,
    afterManualCustomChoiceCount: preview.after.manualCustomChoiceCount,
    beforeManualResidualMergeCount: preview.before.manualResidualMergeCount,
    afterManualResidualMergeCount: preview.after.manualResidualMergeCount,
    previewKeys: [...preview.keys],
    sampleUpdatedIds: [...preview.sampleUpdatedIds],
  };
}
