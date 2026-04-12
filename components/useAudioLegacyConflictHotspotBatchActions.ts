import React from "react";
import { applyHotspotRecommendationsToStoredContexts } from "../lib/audioReactiveRetirementMigration";
import { createEmptyHotspotSummary } from "./audioLegacyConflictHotspotBatchShared";
import type { UseAudioLegacyConflictBatchActionsArgs } from "./audioLegacyConflictBatchActionTypes";

export function useAudioLegacyConflictHotspotBatchActions({
  config,
  updateConfig,
  presets,
  setPresets,
  presetSequence,
  setPresetSequence,
  isPublicLibrary,
  filteredCustomConflictHotspots,
  summarizeHotspotBatchState,
  recordCurationHistory,
  createCurationHistoryKeySetWith,
  applyConflictRecommendationForKey,
  setLegacyAutoFixNotice,
  setStoredLegacyAutoFixNotice,
  setLastHotspotBatchSummary,
}: UseAudioLegacyConflictBatchActionsArgs) {
  const applyStoredHotspotRecommendationForKey = React.useCallback(
    (key: string, scope: "presets" | "keyframes" | "all" = "all") => {
      if (isPublicLibrary) {
        setStoredLegacyAutoFixNotice("Stored hotspot migration is disabled in public library mode.");
        return;
      }
      const before = summarizeHotspotBatchState(config, presets, presetSequence);
      const result = applyHotspotRecommendationsToStoredContexts(presets, presetSequence, [key], scope);
      const appliedCount = result.presetsSummary.appliedRecommendationCount + result.keyframesSummary.appliedRecommendationCount;
      const appliedKeys = Array.from(new Set([...result.presetsSummary.appliedKeys, ...result.keyframesSummary.appliedKeys]));
      const samples = [...result.presetsSummary.sampleApplied, ...result.keyframesSummary.sampleApplied].slice(0, 8);
      setPresets(result.presets);
      setPresetSequence(result.presetSequence);
      if (appliedKeys.length > 0) {
        recordCurationHistory("stored", "focused-recommendation", appliedKeys, key);
      }
      const after = summarizeHotspotBatchState(config, result.presets, result.presetSequence, createCurationHistoryKeySetWith(appliedKeys));
      setLastHotspotBatchSummary({
        scope: "stored", limit: 1,
        beforeHotspotCount: before.hotspotCount, afterHotspotCount: after.hotspotCount,
        beforeContextCount: before.contextCount, afterContextCount: after.contextCount,
        beforePendingHotspotCount: before.pendingHotspotCount, afterPendingHotspotCount: after.pendingHotspotCount,
        beforePendingContextCount: before.pendingContextCount, afterPendingContextCount: after.pendingContextCount,
        beforePendingSamples: before.pendingSamples, afterPendingSamples: after.pendingSamples,
        currentAppliedCount: 0, currentSamples: [],
        storedPresetUpdatedCount: result.presetsSummary.updatedCount,
        storedKeyframeUpdatedCount: result.keyframesSummary.updatedCount,
        storedAppliedCount: appliedCount, storedSamples: samples,
        createdAt: new Date().toISOString(),
      });
      if (appliedCount === 0) {
        setStoredLegacyAutoFixNotice(`Stored hotspot recommendation skipped / key ${key}.`);
        return;
      }
      setStoredLegacyAutoFixNotice(`Stored hotspot recommendation applied / key ${key} / presets ${result.presetsSummary.updatedCount} / keyframes ${result.keyframesSummary.updatedCount} / ${samples.join(" / ") || "no sample"}.`);
    },
    [config, createCurationHistoryKeySetWith, isPublicLibrary, presetSequence, presets, recordCurationHistory, setLastHotspotBatchSummary, setPresetSequence, setPresets, setStoredLegacyAutoFixNotice, summarizeHotspotBatchState],
  );

  const applyTopHotspotRecommendations = React.useCallback((limit: number) => {
    const targetKeys = filteredCustomConflictHotspots.slice(0, limit).map((hotspot) => hotspot.key);
    const before = summarizeHotspotBatchState(config, presets, presetSequence);
    let nextRoutes = config.audioRoutes;
    let changedKeys = 0;
    const changedKeysList: string[] = [];
    const samples: string[] = [];
    targetKeys.forEach((key) => {
      const result = applyConflictRecommendationForKey(key, nextRoutes);
      if (!result.applied) return;
      nextRoutes = result.routes;
      changedKeys += 1;
      changedKeysList.push(key);
      if (samples.length < 8) samples.push(`${key} (${result.label})`);
    });
    if (changedKeys === 0) {
      setLegacyAutoFixNotice(`Top hotspot pass skipped / no actionable keys in top ${limit}.`);
      setLastHotspotBatchSummary(createEmptyHotspotSummary("current", limit, before));
      return;
    }
    const nextConfig = { ...config, audioRoutes: nextRoutes, audioRoutesEnabled: true };
    const after = summarizeHotspotBatchState(nextConfig, presets, presetSequence, createCurationHistoryKeySetWith(changedKeysList));
    updateConfig("audioRoutes", nextRoutes);
    updateConfig("audioRoutesEnabled", true);
    recordCurationHistory("current", "hotspot-batch", changedKeysList, `top-${limit}`);
    setLastHotspotBatchSummary({
      scope: "current", limit,
      beforeHotspotCount: before.hotspotCount, afterHotspotCount: after.hotspotCount,
      beforeContextCount: before.contextCount, afterContextCount: after.contextCount,
      beforePendingHotspotCount: before.pendingHotspotCount, afterPendingHotspotCount: after.pendingHotspotCount,
      beforePendingContextCount: before.pendingContextCount, afterPendingContextCount: after.pendingContextCount,
      beforePendingSamples: before.pendingSamples, afterPendingSamples: after.pendingSamples,
      currentAppliedCount: changedKeys, currentSamples: samples,
      storedPresetUpdatedCount: 0, storedKeyframeUpdatedCount: 0, storedAppliedCount: 0, storedSamples: [],
      createdAt: new Date().toISOString(),
    });
    setLegacyAutoFixNotice(`Top hotspot pass applied / keys ${changedKeys}/${targetKeys.length} / hotspots ${before.hotspotCount} -> ${after.hotspotCount} / pending ${before.pendingHotspotCount} -> ${after.pendingHotspotCount} / contexts ${before.contextCount} -> ${after.contextCount} / pending contexts ${before.pendingContextCount} -> ${after.pendingContextCount} / ${samples.join(" / ")}.`);
  }, [applyConflictRecommendationForKey, config, createCurationHistoryKeySetWith, filteredCustomConflictHotspots, presetSequence, presets, recordCurationHistory, setLastHotspotBatchSummary, setLegacyAutoFixNotice, summarizeHotspotBatchState, updateConfig]);

  const applyStoredTopHotspotRecommendations = React.useCallback((limit: number) => {
    if (isPublicLibrary) {
      setStoredLegacyAutoFixNotice("Stored hotspot migration is disabled in public library mode.");
      return;
    }
    const targetKeys = filteredCustomConflictHotspots.slice(0, limit).map((hotspot) => hotspot.key);
    const before = summarizeHotspotBatchState(config, presets, presetSequence);
    if (targetKeys.length === 0) {
      setStoredLegacyAutoFixNotice(`Stored hotspot pass skipped / no hotspot keys in top ${limit}.`);
      setLastHotspotBatchSummary(createEmptyHotspotSummary("stored", limit, before));
      return;
    }
    const result = applyHotspotRecommendationsToStoredContexts(presets, presetSequence, targetKeys, "all");
    const storedAppliedKeys = Array.from(new Set([...result.presetsSummary.appliedKeys, ...result.keyframesSummary.appliedKeys]));
    const storedSamples = [...result.presetsSummary.sampleApplied, ...result.keyframesSummary.sampleApplied].slice(0, 8);
    const storedAppliedCount = result.presetsSummary.appliedRecommendationCount + result.keyframesSummary.appliedRecommendationCount;
    const after = summarizeHotspotBatchState(config, result.presets, result.presetSequence, createCurationHistoryKeySetWith(storedAppliedKeys));
    setPresets(result.presets); setPresetSequence(result.presetSequence);
    if (storedAppliedKeys.length > 0) recordCurationHistory("stored", "hotspot-batch", storedAppliedKeys, `top-${limit}`);
    setLastHotspotBatchSummary({
      scope: "stored", limit,
      beforeHotspotCount: before.hotspotCount, afterHotspotCount: after.hotspotCount,
      beforeContextCount: before.contextCount, afterContextCount: after.contextCount,
      beforePendingHotspotCount: before.pendingHotspotCount, afterPendingHotspotCount: after.pendingHotspotCount,
      beforePendingContextCount: before.pendingContextCount, afterPendingContextCount: after.pendingContextCount,
      beforePendingSamples: before.pendingSamples, afterPendingSamples: after.pendingSamples,
      currentAppliedCount: 0, currentSamples: [],
      storedPresetUpdatedCount: result.presetsSummary.updatedCount, storedKeyframeUpdatedCount: result.keyframesSummary.updatedCount,
      storedAppliedCount, storedSamples, createdAt: new Date().toISOString(),
    });
    if (storedAppliedCount === 0) {
      setStoredLegacyAutoFixNotice(`Stored hotspot pass skipped / no actionable keys in top ${limit}.`);
      return;
    }
    setStoredLegacyAutoFixNotice(`Stored hotspot pass top ${limit}: hotspots ${before.hotspotCount} -> ${after.hotspotCount} / pending ${before.pendingHotspotCount} -> ${after.pendingHotspotCount} / contexts ${before.contextCount} -> ${after.contextCount} / pending contexts ${before.pendingContextCount} -> ${after.pendingContextCount} / presets ${result.presetsSummary.updatedCount} / keyframes ${result.keyframesSummary.updatedCount} / applied ${storedAppliedCount} / ${storedSamples.join(" / ")}.`);
  }, [config, createCurationHistoryKeySetWith, filteredCustomConflictHotspots, isPublicLibrary, presetSequence, presets, recordCurationHistory, setLastHotspotBatchSummary, setPresetSequence, setPresets, setStoredLegacyAutoFixNotice, summarizeHotspotBatchState]);

  const applyEverywhereTopHotspotRecommendations = React.useCallback((limit: number) => {
    if (isPublicLibrary) {
      setStoredLegacyAutoFixNotice("Stored hotspot migration is disabled in public library mode.");
      return;
    }
    const targetKeys = filteredCustomConflictHotspots.slice(0, limit).map((hotspot) => hotspot.key);
    const before = summarizeHotspotBatchState(config, presets, presetSequence);
    if (targetKeys.length === 0) {
      setLegacyAutoFixNotice(`Everywhere hotspot pass skipped / no hotspot keys in top ${limit}.`);
      setLastHotspotBatchSummary(createEmptyHotspotSummary("everywhere", limit, before));
      return;
    }
    let nextRoutes = config.audioRoutes;
    let currentAppliedCount = 0;
    const currentAppliedKeys: string[] = [];
    const currentSamples: string[] = [];
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
    if (currentAppliedKeys.length > 0) recordCurationHistory("current", "hotspot-batch", currentAppliedKeys, `top-${limit}`);
    if (combinedAppliedKeys.length > 0) recordCurationHistory("everywhere", "hotspot-batch", combinedAppliedKeys, `top-${limit}`);
    setPresets(storedResult.presets); setPresetSequence(storedResult.presetSequence);
    const after = summarizeHotspotBatchState(nextConfig, storedResult.presets, storedResult.presetSequence, createCurationHistoryKeySetWith(combinedAppliedKeys));
    setLastHotspotBatchSummary({
      scope: "everywhere", limit,
      beforeHotspotCount: before.hotspotCount, afterHotspotCount: after.hotspotCount,
      beforeContextCount: before.contextCount, afterContextCount: after.contextCount,
      beforePendingHotspotCount: before.pendingHotspotCount, afterPendingHotspotCount: after.pendingHotspotCount,
      beforePendingContextCount: before.pendingContextCount, afterPendingContextCount: after.pendingContextCount,
      beforePendingSamples: before.pendingSamples, afterPendingSamples: after.pendingSamples,
      currentAppliedCount, currentSamples,
      storedPresetUpdatedCount: storedResult.presetsSummary.updatedCount,
      storedKeyframeUpdatedCount: storedResult.keyframesSummary.updatedCount,
      storedAppliedCount, storedSamples, createdAt: new Date().toISOString(),
    });
    if (currentAppliedCount + storedAppliedCount === 0) {
      setLegacyAutoFixNotice(`Everywhere hotspot pass skipped / no actionable keys in top ${limit}.`);
      setStoredLegacyAutoFixNotice(`Everywhere hotspot pass skipped / no actionable keys in top ${limit}.`);
      return;
    }
    setLegacyAutoFixNotice(`Everywhere hotspot pass top ${limit}: hotspots ${before.hotspotCount} -> ${after.hotspotCount} / pending ${before.pendingHotspotCount} -> ${after.pendingHotspotCount} / contexts ${before.contextCount} -> ${after.contextCount} / pending contexts ${before.pendingContextCount} -> ${after.pendingContextCount} / current ${currentAppliedCount} / stored ${storedAppliedCount}.`);
    setStoredLegacyAutoFixNotice(`Everywhere hotspot pass top ${limit}: presets ${storedResult.presetsSummary.updatedCount} / keyframes ${storedResult.keyframesSummary.updatedCount} / current samples ${currentSamples.join(" / ") || "none"} / stored samples ${storedSamples.join(" / ") || "none"}.`);
  }, [applyConflictRecommendationForKey, config, createCurationHistoryKeySetWith, filteredCustomConflictHotspots, isPublicLibrary, presetSequence, presets, recordCurationHistory, setLastHotspotBatchSummary, setLegacyAutoFixNotice, setPresetSequence, setPresets, setStoredLegacyAutoFixNotice, summarizeHotspotBatchState, updateConfig]);

  return { applyStoredHotspotRecommendationForKey, applyTopHotspotRecommendations, applyStoredTopHotspotRecommendations, applyEverywhereTopHotspotRecommendations };
}
