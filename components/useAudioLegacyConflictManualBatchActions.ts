import React from "react";
import { applyHotspotRecommendationsToStoredContexts } from "../lib/audioReactiveRetirementMigration";
import { executeStoredManualQueuePreview, type StoredManualQueuePreviewProfile } from "../lib/audioReactiveStoredManualQueuePreview";
import type { UseAudioLegacyConflictBatchActionsArgs } from "./audioLegacyConflictBatchActionTypes";

export function useAudioLegacyConflictManualBatchActions({
  config,
  updateConfig,
  presets,
  setPresets,
  presetSequence,
  setPresetSequence,
  isPublicLibrary,
  manualConflictQueue,
  storedManualConflictQueue,
  combinedManualConflictQueue,
  summarizeManualBatchState,
  recordCurationHistory,
  createCurationHistoryKeySetWith,
  applyConflictRecommendationForKey,
  setLegacyAutoFixNotice,
  setStoredLegacyAutoFixNotice,
  setLastManualBatchSummary,
}: UseAudioLegacyConflictBatchActionsArgs) {
  const applyTopManualQueueRecommendations = React.useCallback((limit: number) => {
    const targetKeys = manualConflictQueue.slice(0, limit).map((entry) => entry.key);
    const before = summarizeManualBatchState(config, presets, presetSequence);
    let nextRoutes = config.audioRoutes;
    let currentAppliedCount = 0;
    const currentSamples: string[] = [];
    const currentAppliedKeys: string[] = [];
    targetKeys.forEach((key) => {
      const result = applyConflictRecommendationForKey(key, nextRoutes);
      if (!result.applied) return;
      nextRoutes = result.routes;
      currentAppliedCount += 1;
      currentAppliedKeys.push(key);
      if (currentSamples.length < 8) currentSamples.push(`${key} (${result.label})`);
    });
    if (currentAppliedCount > 0) {
      updateConfig("audioRoutes", nextRoutes);
      updateConfig("audioRoutesEnabled", true);
      recordCurationHistory("current", "manual-batch", currentAppliedKeys, `top-${limit}`);
    }
    const nextConfig = currentAppliedCount > 0 ? { ...config, audioRoutes: nextRoutes, audioRoutesEnabled: true } : config;
    const after = summarizeManualBatchState(nextConfig, presets, presetSequence, createCurationHistoryKeySetWith(currentAppliedKeys));
    setLastManualBatchSummary({
      scope: "current", limit,
      beforeCurrentManualKeyCount: before.currentManualKeyCount, afterCurrentManualKeyCount: after.currentManualKeyCount,
      beforeStoredManualKeyCount: before.storedManualKeyCount, afterStoredManualKeyCount: after.storedManualKeyCount,
      beforePendingCurrentManualKeyCount: before.pendingCurrentManualKeyCount, afterPendingCurrentManualKeyCount: after.pendingCurrentManualKeyCount,
      beforePendingStoredManualKeyCount: before.pendingStoredManualKeyCount, afterPendingStoredManualKeyCount: after.pendingStoredManualKeyCount,
      beforePendingCurrentSamples: before.pendingCurrentManualSamples, afterPendingCurrentSamples: after.pendingCurrentManualSamples,
      beforePendingStoredSamples: before.pendingStoredManualSamples, afterPendingStoredSamples: after.pendingStoredManualSamples,
      currentAppliedCount, currentSamples, storedAppliedCount: 0, storedSamples: [], createdAt: new Date().toISOString(),
    });
    setLegacyAutoFixNotice(currentAppliedCount > 0 ? `Manual queue pass top ${limit}: current manual ${before.currentManualKeyCount} -> ${after.currentManualKeyCount} / pending ${before.pendingCurrentManualKeyCount} -> ${after.pendingCurrentManualKeyCount} / applied ${currentAppliedCount} / ${currentSamples.join(" / ") || "none"}.` : `Manual queue pass skipped / no actionable current manual keys in top ${limit}.`);
  }, [applyConflictRecommendationForKey, config, createCurationHistoryKeySetWith, manualConflictQueue, presetSequence, presets, recordCurationHistory, setLastManualBatchSummary, setLegacyAutoFixNotice, summarizeManualBatchState, updateConfig]);

  const applyStoredTopManualQueueRecommendations = React.useCallback((limit: number) => {
    if (isPublicLibrary) {
      setStoredLegacyAutoFixNotice("Stored manual queue migration is disabled in public library mode.");
      return;
    }
    const targetKeys = storedManualConflictQueue.slice(0, limit).map((entry) => entry.key);
    const before = summarizeManualBatchState(config, presets, presetSequence);
    const result = applyHotspotRecommendationsToStoredContexts(presets, presetSequence, targetKeys, "all");
    const storedAppliedCount = result.presetsSummary.appliedRecommendationCount + result.keyframesSummary.appliedRecommendationCount;
    const storedAppliedKeys = Array.from(new Set([...result.presetsSummary.appliedKeys, ...result.keyframesSummary.appliedKeys]));
    const storedSamples = [...result.presetsSummary.sampleApplied, ...result.keyframesSummary.sampleApplied].slice(0, 8);
    setPresets(result.presets); setPresetSequence(result.presetSequence);
    if (storedAppliedKeys.length > 0) recordCurationHistory("stored", "manual-batch", storedAppliedKeys, `top-${limit}`);
    const after = summarizeManualBatchState(config, result.presets, result.presetSequence, createCurationHistoryKeySetWith(storedAppliedKeys));
    setLastManualBatchSummary({
      scope: "stored", limit,
      beforeCurrentManualKeyCount: before.currentManualKeyCount, afterCurrentManualKeyCount: after.currentManualKeyCount,
      beforeStoredManualKeyCount: before.storedManualKeyCount, afterStoredManualKeyCount: after.storedManualKeyCount,
      beforePendingCurrentManualKeyCount: before.pendingCurrentManualKeyCount, afterPendingCurrentManualKeyCount: after.pendingCurrentManualKeyCount,
      beforePendingStoredManualKeyCount: before.pendingStoredManualKeyCount, afterPendingStoredManualKeyCount: after.pendingStoredManualKeyCount,
      beforePendingCurrentSamples: before.pendingCurrentManualSamples, afterPendingCurrentSamples: after.pendingCurrentManualSamples,
      beforePendingStoredSamples: before.pendingStoredManualSamples, afterPendingStoredSamples: after.pendingStoredManualSamples,
      currentAppliedCount: 0, currentSamples: [], storedAppliedCount, storedSamples, createdAt: new Date().toISOString(),
    });
    setStoredLegacyAutoFixNotice(storedAppliedCount > 0 ? `Stored manual queue pass top ${limit}: stored manual ${before.storedManualKeyCount} -> ${after.storedManualKeyCount} / pending ${before.pendingStoredManualKeyCount} -> ${after.pendingStoredManualKeyCount} / presets ${result.presetsSummary.updatedCount} / keyframes ${result.keyframesSummary.updatedCount} / applied ${storedAppliedCount}.` : `Stored manual queue pass skipped / no actionable stored manual keys in top ${limit}.`);
  }, [config, createCurationHistoryKeySetWith, isPublicLibrary, presetSequence, presets, recordCurationHistory, setLastManualBatchSummary, setPresetSequence, setPresets, setStoredLegacyAutoFixNotice, storedManualConflictQueue, summarizeManualBatchState]);


  const applyStoredPreviewManualQueueRecommendations = React.useCallback((
    limit: number,
    profile: StoredManualQueuePreviewProfile = "align-residuals",
    scope: "presets" | "keyframes" | "all" = "all",
  ) => {
    if (isPublicLibrary) {
      setStoredLegacyAutoFixNotice("Stored manual queue migration is disabled in public library mode.");
      return;
    }
    const targetKeys = storedManualConflictQueue.slice(0, limit).map((entry) => entry.key);
    const before = summarizeManualBatchState(config, presets, presetSequence);
    const result = executeStoredManualQueuePreview(presets, presetSequence, targetKeys, {
      limit: targetKeys.length,
      profile,
      scope,
    });
    setPresets(result.presets);
    setPresetSequence(result.presetSequence);
    if (result.appliedKeys.length > 0) {
      recordCurationHistory("stored", "manual-preview-batch", result.appliedKeys, `top-${limit}/${profile}/${scope}`);
    }
    const after = summarizeManualBatchState(
      config,
      result.presets,
      result.presetSequence,
      createCurationHistoryKeySetWith(result.appliedKeys),
    );
    setLastManualBatchSummary({
      scope: "stored", limit,
      beforeCurrentManualKeyCount: before.currentManualKeyCount, afterCurrentManualKeyCount: after.currentManualKeyCount,
      beforeStoredManualKeyCount: before.storedManualKeyCount, afterStoredManualKeyCount: after.storedManualKeyCount,
      beforePendingCurrentManualKeyCount: before.pendingCurrentManualKeyCount, afterPendingCurrentManualKeyCount: after.pendingCurrentManualKeyCount,
      beforePendingStoredManualKeyCount: before.pendingStoredManualKeyCount, afterPendingStoredManualKeyCount: after.pendingStoredManualKeyCount,
      beforePendingCurrentSamples: before.pendingCurrentManualSamples, afterPendingCurrentSamples: after.pendingCurrentManualSamples,
      beforePendingStoredSamples: before.pendingStoredManualSamples, afterPendingStoredSamples: after.pendingStoredManualSamples,
      currentAppliedCount: 0, currentSamples: [], storedAppliedCount: result.appliedKeys.length, storedSamples: result.sampleUpdatedIds.slice(0, 8), createdAt: new Date().toISOString(),
      batchLabel: `preview-${scope}`, previewProfile: profile,
      previewKeyCount: result.keys.length,
      previewPresetUpdatedCount: result.presetUpdatedCount,
      previewKeyframeUpdatedCount: result.keyframeUpdatedCount,
      previewTotalReviewDelta: result.totalReviewDelta,
      previewTotalBlockedDelta: result.totalBlockedDelta,
      previewTotalResidualDelta: result.totalResidualDelta,
      previewAppliedKeys: result.appliedKeys,
      previewSampleUpdatedIds: result.sampleUpdatedIds,
    });
    setStoredLegacyAutoFixNotice(
      result.hasChanges
        ? `Stored manual preview batch top ${limit} / ${profile} / ${scope}: stored manual ${before.storedManualKeyCount} -> ${after.storedManualKeyCount} / pending ${before.pendingStoredManualKeyCount} -> ${after.pendingStoredManualKeyCount} / presets ${result.presetUpdatedCount} / keyframes ${result.keyframeUpdatedCount} / keys ${result.appliedKeys.length}.`
        : `Stored manual preview batch skipped / no staged changes for top ${limit} / ${profile} / ${scope}.`,
    );
  }, [config, createCurationHistoryKeySetWith, isPublicLibrary, presetSequence, presets, recordCurationHistory, setLastManualBatchSummary, setPresetSequence, setPresets, setStoredLegacyAutoFixNotice, storedManualConflictQueue, summarizeManualBatchState]);

  const applyEverywhereTopManualQueueRecommendations = React.useCallback((limit: number) => {
    if (isPublicLibrary) {
      setStoredLegacyAutoFixNotice("Stored manual queue migration is disabled in public library mode.");
      return;
    }
    const targetKeys = combinedManualConflictQueue.slice(0, limit).map((entry) => entry.key);
    const before = summarizeManualBatchState(config, presets, presetSequence);
    let nextRoutes = config.audioRoutes;
    let currentAppliedCount = 0;
    const currentSamples: string[] = [];
    const currentAppliedKeys: string[] = [];
    targetKeys.forEach((key) => {
      const result = applyConflictRecommendationForKey(key, nextRoutes);
      if (!result.applied) return;
      nextRoutes = result.routes;
      currentAppliedCount += 1;
      currentAppliedKeys.push(key);
      if (currentSamples.length < 8) currentSamples.push(`${key} (${result.label})`);
    });
    const nextConfig = currentAppliedCount > 0 ? { ...config, audioRoutes: nextRoutes, audioRoutesEnabled: true } : config;
    const storedResult = applyHotspotRecommendationsToStoredContexts(presets, presetSequence, targetKeys, "all");
    const storedAppliedCount = storedResult.presetsSummary.appliedRecommendationCount + storedResult.keyframesSummary.appliedRecommendationCount;
    const storedAppliedKeys = Array.from(new Set([...storedResult.presetsSummary.appliedKeys, ...storedResult.keyframesSummary.appliedKeys]));
    const combinedAppliedKeys = Array.from(new Set([...currentAppliedKeys, ...storedAppliedKeys]));
    const storedSamples = [...storedResult.presetsSummary.sampleApplied, ...storedResult.keyframesSummary.sampleApplied].slice(0, 8);
    if (currentAppliedCount > 0) {
      updateConfig("audioRoutes", nextRoutes); updateConfig("audioRoutesEnabled", true);
    }
    if (combinedAppliedKeys.length > 0) recordCurationHistory("everywhere", "manual-batch", combinedAppliedKeys, `top-${limit}`);
    setPresets(storedResult.presets); setPresetSequence(storedResult.presetSequence);
    const after = summarizeManualBatchState(nextConfig, storedResult.presets, storedResult.presetSequence, createCurationHistoryKeySetWith(combinedAppliedKeys));
    setLastManualBatchSummary({
      scope: "everywhere", limit,
      beforeCurrentManualKeyCount: before.currentManualKeyCount, afterCurrentManualKeyCount: after.currentManualKeyCount,
      beforeStoredManualKeyCount: before.storedManualKeyCount, afterStoredManualKeyCount: after.storedManualKeyCount,
      beforePendingCurrentManualKeyCount: before.pendingCurrentManualKeyCount, afterPendingCurrentManualKeyCount: after.pendingCurrentManualKeyCount,
      beforePendingStoredManualKeyCount: before.pendingStoredManualKeyCount, afterPendingStoredManualKeyCount: after.pendingStoredManualKeyCount,
      beforePendingCurrentSamples: before.pendingCurrentManualSamples, afterPendingCurrentSamples: after.pendingCurrentManualSamples,
      beforePendingStoredSamples: before.pendingStoredManualSamples, afterPendingStoredSamples: after.pendingStoredManualSamples,
      currentAppliedCount, currentSamples, storedAppliedCount, storedSamples, createdAt: new Date().toISOString(),
    });
    if (currentAppliedCount + storedAppliedCount === 0) {
      setLegacyAutoFixNotice(`Everywhere manual queue pass skipped / no actionable keys in top ${limit}.`);
      setStoredLegacyAutoFixNotice(`Everywhere manual queue pass skipped / no actionable keys in top ${limit}.`);
      return;
    }
    setLegacyAutoFixNotice(`Everywhere manual queue pass top ${limit}: current manual ${before.currentManualKeyCount} -> ${after.currentManualKeyCount} / pending ${before.pendingCurrentManualKeyCount} -> ${after.pendingCurrentManualKeyCount} / stored manual ${before.storedManualKeyCount} -> ${after.storedManualKeyCount} / pending stored ${before.pendingStoredManualKeyCount} -> ${after.pendingStoredManualKeyCount} / current ${currentAppliedCount} / stored ${storedAppliedCount}.`);
    setStoredLegacyAutoFixNotice(`Everywhere manual queue pass top ${limit}: current samples ${currentSamples.join(" / ") || "none"} / stored samples ${storedSamples.join(" / ") || "none"}.`);
  }, [applyConflictRecommendationForKey, combinedManualConflictQueue, config, createCurationHistoryKeySetWith, isPublicLibrary, presetSequence, presets, recordCurationHistory, setLastManualBatchSummary, setLegacyAutoFixNotice, setPresetSequence, setPresets, setStoredLegacyAutoFixNotice, summarizeManualBatchState, updateConfig]);

  return { applyTopManualQueueRecommendations, applyStoredTopManualQueueRecommendations, applyStoredPreviewManualQueueRecommendations, applyEverywhereTopManualQueueRecommendations };
}
