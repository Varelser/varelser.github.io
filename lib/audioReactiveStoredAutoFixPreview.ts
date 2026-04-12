import type { PresetRecord, PresetSequenceItem } from '../types';
import type { AudioLegacyAutoFixOptions } from './audioReactiveLegacyFixes';
import { applyLegacyAudioRouteAutoFixesToStoredContexts } from './audioReactiveRetirementStoredFixes';
import { summarizeStoredFocusedConflict } from './audioReactiveRetirementStoredConflict';
import type { AudioLegacyStoredContextMigrationSummary, AudioStoredFocusedConflictSummary } from './audioReactiveRetirementMigrationTypes';

export type StoredAutoFixPreviewScope = 'presets' | 'keyframes' | 'all';
export type StoredAutoFixPreviewProfile =
  | 'safe'
  | 'collapse-review'
  | 'remove-custom-shadow'
  | 'collapse-custom-exact'
  | 'align-residuals'
  | 'mute-focused-conflict';

export interface AudioStoredAutoFixPreview {
  scope: StoredAutoFixPreviewScope;
  profile: StoredAutoFixPreviewProfile;
  key: string | null;
  keepRouteId: string | null;
  before: AudioStoredFocusedConflictSummary | null;
  after: AudioStoredFocusedConflictSummary | null;
  presetsSummary: AudioLegacyStoredContextMigrationSummary;
  keyframesSummary: AudioLegacyStoredContextMigrationSummary;
  totalUpdatedCount: number;
  totalReviewDelta: number;
  totalBlockedDelta: number;
  totalResidualDelta: number;
  sampleUpdatedIds: string[];
  hasChanges: boolean;
}

export function createStoredLegacyAutoFixOptions(
  profile: StoredAutoFixPreviewProfile,
  onlyKey?: string,
  keepRouteId?: string,
): AudioLegacyAutoFixOptions {
  if (profile === 'collapse-review') {
    return {
      alignResiduals: true,
      dedupeExact: true,
      collapseLegacyOwnedDuplicates: true,
      onlyKey,
    };
  }
  if (profile === 'remove-custom-shadow') {
    return { removeLegacyShadowedByCustomExact: true, onlyKey };
  }
  if (profile === 'collapse-custom-exact') {
    return { collapseExactCustomDuplicates: true, onlyKey };
  }
  if (profile === 'align-residuals') {
    return { alignResiduals: true, onlyKey };
  }
  if (profile === 'mute-focused-conflict') {
    return {
      disableNonDominantFocusedRoutes: true,
      onlyKey,
      keepRouteId,
    };
  }
  return {
    appendMissing: true,
    alignResiduals: true,
    dedupeExact: true,
    removeStaleLegacy: true,
    onlyKey,
  };
}

export function summarizeStoredAutoFixPreview(
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
  {
    scope = 'all',
    profile = 'safe',
    onlyKey,
    keepRouteId,
  }: {
    scope?: StoredAutoFixPreviewScope;
    profile?: StoredAutoFixPreviewProfile;
    onlyKey?: string;
    keepRouteId?: string;
  },
): AudioStoredAutoFixPreview {
  const before = onlyKey
    ? summarizeStoredFocusedConflict(presets, presetSequence, onlyKey, scope)
    : null;
  const result = applyLegacyAudioRouteAutoFixesToStoredContexts(
    presets,
    presetSequence,
    createStoredLegacyAutoFixOptions(profile, onlyKey, keepRouteId),
    scope,
  );
  const after = onlyKey
    ? summarizeStoredFocusedConflict(result.presets, result.presetSequence, onlyKey, scope)
    : null;
  const sampleUpdatedIds = [
    ...result.presetsSummary.sampleUpdatedIds,
    ...result.keyframesSummary.sampleUpdatedIds,
  ].filter((value, index, array) => value && array.indexOf(value) === index);
  const totalUpdatedCount =
    result.presetsSummary.updatedCount + result.keyframesSummary.updatedCount;

  return {
    scope,
    profile,
    key: onlyKey ?? null,
    keepRouteId: keepRouteId ?? null,
    before,
    after,
    presetsSummary: result.presetsSummary,
    keyframesSummary: result.keyframesSummary,
    totalUpdatedCount,
    totalReviewDelta:
      (result.presetsSummary.reviewAfterCount - result.presetsSummary.reviewBeforeCount)
      + (result.keyframesSummary.reviewAfterCount - result.keyframesSummary.reviewBeforeCount),
    totalBlockedDelta:
      (result.presetsSummary.blockedAfterCount - result.presetsSummary.blockedBeforeCount)
      + (result.keyframesSummary.blockedAfterCount - result.keyframesSummary.blockedBeforeCount),
    totalResidualDelta:
      (result.presetsSummary.residualAfterCount - result.presetsSummary.residualBeforeCount)
      + (result.keyframesSummary.residualAfterCount - result.keyframesSummary.residualBeforeCount),
    sampleUpdatedIds,
    hasChanges: totalUpdatedCount > 0,
  };
}

export function formatStoredAutoFixPreview(preview: AudioStoredAutoFixPreview) {
  const before = preview.before;
  const after = preview.after;
  return [
    `scope=${preview.scope}`,
    `profile=${preview.profile}`,
    `key=${preview.key ?? 'none'}`,
    `keepRouteId=${preview.keepRouteId ?? 'none'}`,
    `updated=${preview.totalUpdatedCount}`,
    `deltaReview=${preview.totalReviewDelta}`,
    `deltaBlocked=${preview.totalBlockedDelta}`,
    `deltaResidual=${preview.totalResidualDelta}`,
    `presetUpdates=${preview.presetsSummary.updatedCount}`,
    `keyframeUpdates=${preview.keyframesSummary.updatedCount}`,
    before
      ? `before: preset ${before.presetContextCount} / keyframe ${before.keyframeContextCount} / manualCustom ${before.manualCustomChoiceCount} / manualResidual ${before.manualResidualMergeCount} / autoResolvable ${before.autoResolvableCount}`
      : 'before: none',
    after
      ? `after: preset ${after.presetContextCount} / keyframe ${after.keyframeContextCount} / manualCustom ${after.manualCustomChoiceCount} / manualResidual ${after.manualResidualMergeCount} / autoResolvable ${after.autoResolvableCount}`
      : 'after: none',
    `samples=${preview.sampleUpdatedIds.join(' | ') || 'none'}`,
  ].join('\n');
}
