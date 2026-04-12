import type { ParticleConfig, PresetRecord, PresetSequenceItem } from '../types';
import { createStoredLegacyAutoFixOptions, type StoredAutoFixPreviewProfile, type StoredAutoFixPreviewScope } from './audioReactiveStoredAutoFixPreview';
import { applyLegacyAudioRouteAutoFixesToStoredContexts } from './audioReactiveRetirementStoredFixes';
import { createLegacyAudioRoutes } from './audioReactiveConfig';
import { createRouteComparisonDelta, createRouteKey, getRouteOwner } from './audioReactiveValidationShared';
import { summarizeStoredFocusedConflict } from './audioReactiveRetirementStoredConflict';

export type StoredManualQueuePreviewProfile = Exclude<StoredAutoFixPreviewProfile, 'mute-focused-conflict'>;

export interface StoredManualQueuePreviewAggregate {
  presetContextCount: number;
  keyframeContextCount: number;
  manualCustomChoiceCount: number;
  manualResidualMergeCount: number;
  autoResolvableCount: number;
  informationalCount: number;
}

export interface StoredManualQueuePreview {
  scope: StoredAutoFixPreviewScope;
  profile: StoredManualQueuePreviewProfile;
  limit: number;
  keys: string[];
  before: StoredManualQueuePreviewAggregate;
  after: StoredManualQueuePreviewAggregate;
  presetUpdatedCount: number;
  keyframeUpdatedCount: number;
  totalUpdatedCount: number;
  totalReviewDelta: number;
  totalBlockedDelta: number;
  totalResidualDelta: number;
  appliedKeys: string[];
  sampleUpdatedIds: string[];
  hasChanges: boolean;
}

export interface StoredManualQueuePreviewExecution extends StoredManualQueuePreview {
  presets: PresetRecord[];
  presetSequence: PresetSequenceItem[];
}

function createEmptyAggregate(): StoredManualQueuePreviewAggregate {
  return {
    presetContextCount: 0,
    keyframeContextCount: 0,
    manualCustomChoiceCount: 0,
    manualResidualMergeCount: 0,
    autoResolvableCount: 0,
    informationalCount: 0,
  };
}

function summarizeAggregate(
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
  keys: string[],
  scope: StoredAutoFixPreviewScope,
): StoredManualQueuePreviewAggregate {
  return keys.reduce<StoredManualQueuePreviewAggregate>((aggregate, key) => {
    const summary = summarizeStoredFocusedConflict(presets, presetSequence, key, scope);
    aggregate.presetContextCount += summary.presetContextCount;
    aggregate.keyframeContextCount += summary.keyframeContextCount;
    aggregate.manualCustomChoiceCount += summary.manualCustomChoiceCount;
    aggregate.manualResidualMergeCount += summary.manualResidualMergeCount;
    aggregate.autoResolvableCount += summary.autoResolvableCount;
    aggregate.informationalCount += summary.informationalCount;
    return aggregate;
  }, createEmptyAggregate());
}

function countChangedPresets(before: PresetRecord[], after: PresetRecord[]) {
  let changed = 0;
  before.forEach((preset, index) => {
    if (JSON.stringify(preset.config.audioRoutes) !== JSON.stringify(after[index]?.config.audioRoutes)) {
      changed += 1;
    }
  });
  return changed;
}

function countChangedKeyframes(before: PresetSequenceItem[], after: PresetSequenceItem[]) {
  let changed = 0;
  before.forEach((item, index) => {
    const beforeRoutes = item.keyframeConfig?.audioRoutes ?? null;
    const afterRoutes = after[index]?.keyframeConfig?.audioRoutes ?? null;
    if (JSON.stringify(beforeRoutes) !== JSON.stringify(afterRoutes)) {
      changed += 1;
    }
  });
  return changed;
}


function alignCustomResidualRoutes(
  config: ParticleConfig,
  routes: ParticleConfig['audioRoutes'],
  key: string,
): { routes: ParticleConfig['audioRoutes']; applied: boolean } {
  const expectedRoute = createLegacyAudioRoutes(config).find((route) => createRouteKey(route) === key);
  if (!expectedRoute) {
    return { routes, applied: false };
  }
  const customIndices = routes
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => createRouteKey(route) === key && getRouteOwner(route) === 'custom');
  if (customIndices.length === 0) {
    return { routes, applied: false };
  }
  const ranked = [...customIndices].sort((left, right) => {
    const leftDelta = createRouteComparisonDelta(expectedRoute, left.route);
    const rightDelta = createRouteComparisonDelta(expectedRoute, right.route);
    const leftScore = leftDelta.amountDelta + leftDelta.biasDelta + leftDelta.timingDelta;
    const rightScore = rightDelta.amountDelta + rightDelta.biasDelta + rightDelta.timingDelta;
    return leftScore - rightScore;
  });
  const best = ranked[0];
  if (!best) {
    return { routes, applied: false };
  }
  const nextRoutes = routes.map((route, index) => {
    if (index !== best.index) return route;
    const nextRoute = {
      ...route,
      enabled: expectedRoute.enabled,
      source: expectedRoute.source,
      target: expectedRoute.target,
      amount: expectedRoute.amount,
      bias: expectedRoute.bias,
      curve: expectedRoute.curve,
      smoothing: expectedRoute.smoothing,
      attack: expectedRoute.attack,
      release: expectedRoute.release,
      clampMin: expectedRoute.clampMin,
      clampMax: expectedRoute.clampMax,
      mode: expectedRoute.mode,
      notes: route.notes ?? expectedRoute.notes,
    };
    return nextRoute;
  });
  return {
    routes: nextRoutes,
    applied: JSON.stringify(routes) !== JSON.stringify(nextRoutes),
  };
}

function applyStoredResidualAlignment(
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
  key: string,
  scope: StoredAutoFixPreviewScope,
): { presets: PresetRecord[]; presetSequence: PresetSequenceItem[]; presetSamples: string[]; keyframeSamples: string[] } {
  const presetSamples: string[] = [];
  const keyframeSamples: string[] = [];
  const nextPresets = presets.map((preset) => {
    if (scope === 'keyframes') return preset;
    const result = alignCustomResidualRoutes(preset.config, preset.config.audioRoutes, key);
    if (!result.applied) return preset;
    presetSamples.push(preset.name);
    return {
      ...preset,
      updatedAt: new Date().toISOString(),
      config: { ...preset.config, audioRoutes: result.routes },
    };
  });
  const nextPresetSequence = presetSequence.map((item, index) => {
    if (scope === 'presets' || !item.keyframeConfig) return item;
    const result = alignCustomResidualRoutes(item.keyframeConfig, item.keyframeConfig.audioRoutes, key);
    if (!result.applied) return item;
    keyframeSamples.push(item.label?.trim() || `Sequence ${index + 1}`);
    return {
      ...item,
      keyframeConfig: { ...item.keyframeConfig, audioRoutes: result.routes },
    };
  });
  return { presets: nextPresets, presetSequence: nextPresetSequence, presetSamples, keyframeSamples };
}

function unique(values: string[]) {
  return values.filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);
}

export function executeStoredManualQueuePreview(
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
  queueKeys: string[],
  {
    limit,
    scope = 'all',
    profile = 'align-residuals',
  }: {
    limit?: number;
    scope?: StoredAutoFixPreviewScope;
    profile?: StoredManualQueuePreviewProfile;
  } = {},
): StoredManualQueuePreviewExecution {
  const keys = (typeof limit === 'number' ? queueKeys.slice(0, limit) : queueKeys.slice()).filter(Boolean);
  const before = summarizeAggregate(presets, presetSequence, keys, scope);
  let nextPresets = presets;
  let nextPresetSequence = presetSequence;
  let totalReviewDelta = 0;
  let totalBlockedDelta = 0;
  let totalResidualDelta = 0;
  const appliedKeys: string[] = [];
  const sampleUpdatedIds: string[] = [];

  keys.forEach((key) => {
    const result = applyLegacyAudioRouteAutoFixesToStoredContexts(
      nextPresets,
      nextPresetSequence,
      createStoredLegacyAutoFixOptions(profile, key),
      scope,
    );
    let stagePresets = result.presets;
    let stagePresetSequence = result.presetSequence;
    if (profile === 'align-residuals' || profile === 'safe') {
      const aligned = applyStoredResidualAlignment(stagePresets, stagePresetSequence, key, scope);
      stagePresets = aligned.presets;
      stagePresetSequence = aligned.presetSequence;
      sampleUpdatedIds.push(...aligned.presetSamples, ...aligned.keyframeSamples);
    }
    const changed =
      JSON.stringify(nextPresets) !== JSON.stringify(stagePresets)
      || JSON.stringify(nextPresetSequence) !== JSON.stringify(stagePresetSequence);
    if (changed) {
      appliedKeys.push(key);
    }
    totalReviewDelta +=
      (result.presetsSummary.reviewAfterCount - result.presetsSummary.reviewBeforeCount)
      + (result.keyframesSummary.reviewAfterCount - result.keyframesSummary.reviewBeforeCount);
    totalBlockedDelta +=
      (result.presetsSummary.blockedAfterCount - result.presetsSummary.blockedBeforeCount)
      + (result.keyframesSummary.blockedAfterCount - result.keyframesSummary.blockedBeforeCount);
    totalResidualDelta +=
      (result.presetsSummary.residualAfterCount - result.presetsSummary.residualBeforeCount)
      + (result.keyframesSummary.residualAfterCount - result.keyframesSummary.residualBeforeCount);
    sampleUpdatedIds.push(...result.presetsSummary.sampleUpdatedIds, ...result.keyframesSummary.sampleUpdatedIds);
    nextPresets = stagePresets;
    nextPresetSequence = stagePresetSequence;
  });

  const after = summarizeAggregate(nextPresets, nextPresetSequence, keys, scope);
  const presetUpdatedCount = countChangedPresets(presets, nextPresets);
  const keyframeUpdatedCount = countChangedKeyframes(presetSequence, nextPresetSequence);

  return {
    scope,
    profile,
    limit: typeof limit === 'number' ? Math.min(limit, keys.length) : keys.length,
    keys,
    before,
    after,
    presetUpdatedCount,
    keyframeUpdatedCount,
    totalUpdatedCount: presetUpdatedCount + keyframeUpdatedCount,
    totalReviewDelta,
    totalBlockedDelta,
    totalResidualDelta,
    appliedKeys: unique(appliedKeys),
    sampleUpdatedIds: unique(sampleUpdatedIds),
    hasChanges: presetUpdatedCount + keyframeUpdatedCount > 0,
    presets: nextPresets,
    presetSequence: nextPresetSequence,
  };
}

export function formatStoredManualQueuePreview(preview: StoredManualQueuePreview) {
  return [
    `scope=${preview.scope}`,
    `profile=${preview.profile}`,
    `limit=${preview.limit}`,
    `keys=${preview.keys.join(' | ') || 'none'}`,
    `updated=${preview.totalUpdatedCount}`,
    `presetUpdated=${preview.presetUpdatedCount}`,
    `keyframeUpdated=${preview.keyframeUpdatedCount}`,
    `deltaReview=${preview.totalReviewDelta}`,
    `deltaBlocked=${preview.totalBlockedDelta}`,
    `deltaResidual=${preview.totalResidualDelta}`,
    `before=preset ${preview.before.presetContextCount} / keyframe ${preview.before.keyframeContextCount} / manualCustom ${preview.before.manualCustomChoiceCount} / manualResidual ${preview.before.manualResidualMergeCount} / autoResolvable ${preview.before.autoResolvableCount}`,
    `after=preset ${preview.after.presetContextCount} / keyframe ${preview.after.keyframeContextCount} / manualCustom ${preview.after.manualCustomChoiceCount} / manualResidual ${preview.after.manualResidualMergeCount} / autoResolvable ${preview.after.autoResolvableCount}`,
    `appliedKeys=${preview.appliedKeys.join(' | ') || 'none'}`,
    `samples=${preview.sampleUpdatedIds.join(' | ') || 'none'}`,
  ].join('\n');
}
