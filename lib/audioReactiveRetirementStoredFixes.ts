import type { ParticleConfig, PresetRecord, PresetSequenceItem } from '../types';
import type { AudioLegacyAutoFixOptions } from './audioReactiveLegacyFixes';
import { applyLegacyAudioRouteAutoFixes } from './audioReactiveLegacyFixes';
import { summarizeFocusedCustomConflict, summarizeLegacyAudioRouteParity } from './audioReactiveValidation';
import {
  addAutoFixSummary,
  addHotspotFixSummary,
  applyFocusedRecommendation,
  applyKeepRouteReference,
  createEmptyHotspotBatchSummary,
  createEmptySummary,
  createStoredKeepReferenceScore,
  pushAppliedKey,
  pushSample,
  routesChanged,
} from './audioReactiveRetirementMigrationShared';
import type {
  AudioLegacyStoredContextMigrationResult,
  AudioStoredHotspotBatchResult,
  AudioStoredKeepRouteReference,
} from './audioReactiveRetirementMigrationTypes';

export function applyLegacyAudioRouteAutoFixesToStoredContexts(
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
  options: AudioLegacyAutoFixOptions,
  scope: 'presets' | 'keyframes' | 'all' = 'all',
): AudioLegacyStoredContextMigrationResult {
  const presetsSummary = createEmptySummary();
  const keyframesSummary = createEmptySummary();

  const nextPresets = presets.map((preset) => {
    if (scope === 'keyframes') {
      return preset;
    }
    const before = summarizeLegacyAudioRouteParity(preset.config, preset.config.audioRoutes);
    presetsSummary.reviewBeforeCount += before.reviewBeforeDeprecateCount;
    presetsSummary.blockedBeforeCount += before.blockedDeprecationCount;
    presetsSummary.residualBeforeCount += before.residualCount;

    const fix = applyLegacyAudioRouteAutoFixes(preset.config, preset.config.audioRoutes, options);
    const changed = routesChanged(preset.config.audioRoutes, fix.routes);
    const nextConfig = changed ? { ...preset.config, audioRoutes: fix.routes } : preset.config;
    const after = summarizeLegacyAudioRouteParity(nextConfig, nextConfig.audioRoutes);
    presetsSummary.reviewAfterCount += after.reviewBeforeDeprecateCount;
    presetsSummary.blockedAfterCount += after.blockedDeprecationCount;
    presetsSummary.residualAfterCount += after.residualCount;

    if (changed) {
      presetsSummary.updatedCount += 1;
      addAutoFixSummary(presetsSummary, fix.summary);
      if (presetsSummary.sampleUpdatedIds.length < 6) {
        presetsSummary.sampleUpdatedIds.push(preset.name);
      }
      return { ...preset, updatedAt: new Date().toISOString(), config: nextConfig };
    }
    return preset;
  });

  const nextPresetSequence = presetSequence.map((item) => {
    if (scope === 'presets' || !item.keyframeConfig) {
      return item;
    }
    const before = summarizeLegacyAudioRouteParity(item.keyframeConfig, item.keyframeConfig.audioRoutes);
    keyframesSummary.reviewBeforeCount += before.reviewBeforeDeprecateCount;
    keyframesSummary.blockedBeforeCount += before.blockedDeprecationCount;
    keyframesSummary.residualBeforeCount += before.residualCount;

    const fix = applyLegacyAudioRouteAutoFixes(item.keyframeConfig, item.keyframeConfig.audioRoutes, options);
    const changed = routesChanged(item.keyframeConfig.audioRoutes, fix.routes);
    const nextKeyframeConfig = changed ? { ...item.keyframeConfig, audioRoutes: fix.routes } : item.keyframeConfig;
    const after = summarizeLegacyAudioRouteParity(nextKeyframeConfig, nextKeyframeConfig.audioRoutes);
    keyframesSummary.reviewAfterCount += after.reviewBeforeDeprecateCount;
    keyframesSummary.blockedAfterCount += after.blockedDeprecationCount;
    keyframesSummary.residualAfterCount += after.residualCount;

    if (changed) {
      keyframesSummary.updatedCount += 1;
      addAutoFixSummary(keyframesSummary, fix.summary);
      if (keyframesSummary.sampleUpdatedIds.length < 6) {
        keyframesSummary.sampleUpdatedIds.push(item.label ?? '');
      }
      return { ...item, keyframeConfig: nextKeyframeConfig };
    }
    return item;
  });

  return { presets: nextPresets, presetSequence: nextPresetSequence, presetsSummary, keyframesSummary };
}

export function applyKeepRouteReferenceToStoredContexts(
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
  key: string,
  reference: AudioStoredKeepRouteReference,
  scope: 'presets' | 'keyframes' | 'all' = 'all',
): AudioStoredHotspotBatchResult {
  const presetsSummary = createEmptyHotspotBatchSummary();
  const keyframesSummary = createEmptyHotspotBatchSummary();

  const nextPresets = presets.map((preset) => {
    if (scope === 'keyframes') return preset;
    const result = applyKeepRouteReference(preset.config, preset.config.audioRoutes, key, reference);
    if (!result.applied) return preset;
    const detail = summarizeFocusedCustomConflict(preset.config, preset.config.audioRoutes, key);
    const ranked = detail
      ? [...detail.routes].sort(
          (left, right) =>
            createStoredKeepReferenceScore(reference, left)
            - createStoredKeepReferenceScore(reference, right),
        )
      : [];
    const keep = ranked[0];
    const fixSummary = keep
      ? applyLegacyAudioRouteAutoFixes(preset.config, preset.config.audioRoutes, {
          disableNonDominantFocusedRoutes: true,
          onlyKey: key,
          keepRouteId: keep.id,
        }).summary
      : createEmptySummary();
    presetsSummary.updatedCount += 1;
    presetsSummary.appliedRecommendationCount += 1;
    addHotspotFixSummary(presetsSummary, fixSummary);
    pushAppliedKey(presetsSummary.appliedKeys, key);
    pushSample(presetsSummary.sampleApplied, `${preset.name} / ${key} / keep-ref:${keep?.id ?? 'none'}`);
    return {
      ...preset,
      updatedAt: new Date().toISOString(),
      config: { ...preset.config, audioRoutes: result.routes },
    };
  });

  const nextPresetSequence = presetSequence.map((item, index) => {
    if (scope === 'presets' || !item.keyframeConfig) return item;
    const result = applyKeepRouteReference(item.keyframeConfig, item.keyframeConfig.audioRoutes, key, reference);
    if (!result.applied) return item;
    const detail = summarizeFocusedCustomConflict(item.keyframeConfig, item.keyframeConfig.audioRoutes, key);
    const ranked = detail
      ? [...detail.routes].sort(
          (left, right) =>
            createStoredKeepReferenceScore(reference, left)
            - createStoredKeepReferenceScore(reference, right),
        )
      : [];
    const keep = ranked[0];
    const fixSummary = keep
      ? applyLegacyAudioRouteAutoFixes(item.keyframeConfig, item.keyframeConfig.audioRoutes, {
          disableNonDominantFocusedRoutes: true,
          onlyKey: key,
          keepRouteId: keep.id,
        }).summary
      : createEmptySummary();
    keyframesSummary.updatedCount += 1;
    keyframesSummary.appliedRecommendationCount += 1;
    addHotspotFixSummary(keyframesSummary, fixSummary);
    pushAppliedKey(keyframesSummary.appliedKeys, key);
    pushSample(
      keyframesSummary.sampleApplied,
      `${item.label?.trim() || `Sequence ${index + 1}`} / ${key} / keep-ref:${keep?.id ?? 'none'}`,
    );
    return { ...item, keyframeConfig: { ...item.keyframeConfig, audioRoutes: result.routes } };
  });

  return { presets: nextPresets, presetSequence: nextPresetSequence, presetsSummary, keyframesSummary };
}

export function applyHotspotRecommendationsToStoredContexts(
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
  hotspotKeys: string[],
  scope: 'presets' | 'keyframes' | 'all' = 'all',
): AudioStoredHotspotBatchResult {
  const presetsSummary = createEmptyHotspotBatchSummary();
  const keyframesSummary = createEmptyHotspotBatchSummary();

  const nextPresets = presets.map((preset) => {
    if (scope === 'keyframes' || hotspotKeys.length === 0) return preset;
    let nextRoutes = preset.config.audioRoutes;
    let changed = false;
    let appliedLabels = 0;
    hotspotKeys.forEach((key) => {
      const beforeRoutes = nextRoutes;
      const result = applyFocusedRecommendation(preset.config, nextRoutes, key);
      if (!result.applied) return;
      const fixSummary = applyLegacyAudioRouteAutoFixes(
        preset.config,
        beforeRoutes,
        result.label === 'collapse-exact-custom'
          ? { collapseExactCustomDuplicates: true, onlyKey: key }
          : result.label === 'remove-legacy-shadow'
            ? { removeLegacyShadowedByCustomExact: true, onlyKey: key }
            : {
                disableNonDominantFocusedRoutes: true,
                onlyKey: key,
                keepRouteId: summarizeFocusedCustomConflict(preset.config, beforeRoutes, key)?.dominantRouteId,
              },
      ).summary;
      nextRoutes = result.routes;
      changed = true;
      appliedLabels += 1;
      addHotspotFixSummary(presetsSummary, fixSummary);
      pushAppliedKey(presetsSummary.appliedKeys, key);
      pushSample(presetsSummary.sampleApplied, `${preset.name} / ${key} / ${result.label}`);
    });
    if (!changed) return preset;
    presetsSummary.updatedCount += 1;
    presetsSummary.appliedRecommendationCount += appliedLabels;
    return {
      ...preset,
      updatedAt: new Date().toISOString(),
      config: { ...preset.config, audioRoutes: nextRoutes },
    };
  });

  const nextPresetSequence = presetSequence.map((item, index) => {
    if (scope === 'presets' || !item.keyframeConfig || hotspotKeys.length === 0) return item;
    let nextRoutes = item.keyframeConfig.audioRoutes;
    let changed = false;
    let appliedLabels = 0;
    hotspotKeys.forEach((key) => {
      const beforeRoutes = nextRoutes;
      const result = applyFocusedRecommendation(item.keyframeConfig!, nextRoutes, key);
      if (!result.applied) return;
      const detail = summarizeFocusedCustomConflict(item.keyframeConfig!, beforeRoutes, key);
      const fixSummary = applyLegacyAudioRouteAutoFixes(
        item.keyframeConfig!,
        beforeRoutes,
        result.label === 'collapse-exact-custom'
          ? { collapseExactCustomDuplicates: true, onlyKey: key }
          : result.label === 'remove-legacy-shadow'
            ? { removeLegacyShadowedByCustomExact: true, onlyKey: key }
            : {
                disableNonDominantFocusedRoutes: true,
                onlyKey: key,
                keepRouteId: detail?.dominantRouteId,
              },
      ).summary;
      nextRoutes = result.routes;
      changed = true;
      appliedLabels += 1;
      addHotspotFixSummary(keyframesSummary, fixSummary);
      pushAppliedKey(keyframesSummary.appliedKeys, key);
      pushSample(
        keyframesSummary.sampleApplied,
        `${item.label?.trim() || `Sequence ${index + 1}`} / ${key} / ${result.label}`,
      );
    });
    if (!changed) return item;
    keyframesSummary.updatedCount += 1;
    keyframesSummary.appliedRecommendationCount += appliedLabels;
    return { ...item, keyframeConfig: { ...item.keyframeConfig, audioRoutes: nextRoutes } };
  });

  return { presets: nextPresets, presetSequence: nextPresetSequence, presetsSummary, keyframesSummary };
}
