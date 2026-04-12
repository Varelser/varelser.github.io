import React from "react";
import type { ParticleConfig } from "../types";
import { type AudioLegacySliderVisibilityMode } from "../types/audioReactive";
import {
  type AudioHotspotBatchSummary,
  type AudioManualBatchSummary,
} from "./controlPanelTabsAudioLegacy";
import { useAudioLegacyConflictBatchState } from "./useAudioLegacyConflictBatchState";
import { useAudioLegacyConflictBatchActions } from "./useAudioLegacyConflictBatchActions";
import { useAudioLegacyConflictClipboard } from "./useAudioLegacyConflictClipboard";
import { useAudioLegacyConflictFocusedActions } from "./useAudioLegacyConflictFocusedActions";
import { useAudioLegacyConflictManagerActions } from "./useAudioLegacyConflictManagerActions";
import { useAudioLegacyConflictDerivedState } from "./useAudioLegacyConflictDerivedState";
import { buildProjectAudioLegacyCloseoutSummary } from '../lib/projectAudioLegacyCloseoutSummary';
import { buildAudioLegacyCleanupState } from "../lib/audioLegacyCleanupState";
import type { ControlPanelContentProps } from "./controlPanelTabsShared";
import { useAudioCurationHistory } from "./useAudioCurationHistory";
import { useAudioTabState } from "./useAudioTabState";

type AudioTabStateSnapshot = ReturnType<typeof useAudioTabState>;
type AudioCurationHistorySnapshot = ReturnType<typeof useAudioCurationHistory>;

interface UseAudioLegacyConflictManagerArgs {
  config: ParticleConfig;
  updateConfig: ControlPanelContentProps["updateConfig"];
  presets: ControlPanelContentProps["presets"];
  setPresets: ControlPanelContentProps["setPresets"];
  presetSequence: ControlPanelContentProps["presetSequence"];
  setPresetSequence: ControlPanelContentProps["setPresetSequence"];
  isPublicLibrary: ControlPanelContentProps["isPublicLibrary"];
  focusedConflictKey: AudioTabStateSnapshot["focusedConflictKey"];
  setFocusedConflictKey: AudioTabStateSnapshot["setFocusedConflictKey"];
  legacyAutoFixNotice: AudioTabStateSnapshot["legacyAutoFixNotice"];
  setLegacyAutoFixNotice: AudioTabStateSnapshot["setLegacyAutoFixNotice"];
  storedLegacyAutoFixNotice: AudioTabStateSnapshot["storedLegacyAutoFixNotice"];
  setStoredLegacyAutoFixNotice: AudioTabStateSnapshot["setStoredLegacyAutoFixNotice"];
  lastHotspotBatchSummary: AudioHotspotBatchSummary | null;
  setLastHotspotBatchSummary: React.Dispatch<React.SetStateAction<AudioHotspotBatchSummary | null>>;
  lastManualBatchSummary: AudioManualBatchSummary | null;
  setLastManualBatchSummary: React.Dispatch<React.SetStateAction<AudioManualBatchSummary | null>>;
  setRouteTransferNotice: AudioTabStateSnapshot["setRouteTransferNotice"];
  setRouteEditorOpen: AudioTabStateSnapshot["setRouteEditorOpen"];
  setRouteSearch: AudioTabStateSnapshot["setRouteSearch"];
  curationHistorySummary: AudioCurationHistorySnapshot["curationHistorySummary"];
  recentCurationKeySet: AudioCurationHistorySnapshot["recentCurationKeySet"];
  curationHistoryKeySet: AudioCurationHistorySnapshot["curationHistoryKeySet"];
  curationQueueFilterMode: AudioCurationHistorySnapshot["curationQueueFilterMode"];
  setCurationQueueFilterMode: AudioCurationHistorySnapshot["setCurationQueueFilterMode"];
  shouldIncludeCurationQueueKey: AudioCurationHistorySnapshot["shouldIncludeCurationQueueKey"];
  appendCurationHistoryEntries: AudioCurationHistorySnapshot["appendCurationHistoryEntries"];
  clearCurationHistory: AudioCurationHistorySnapshot["clearCurationHistory"];
  createCurationHistoryKeySetWith: AudioCurationHistorySnapshot["createCurationHistoryKeySetWith"];
  copyCurationHistory: AudioCurationHistorySnapshot["copyCurationHistory"];
}

export function useAudioLegacyConflictManager({
  config,
  updateConfig,
  presets,
  setPresets,
  presetSequence,
  setPresetSequence,
  isPublicLibrary,
  focusedConflictKey,
  setFocusedConflictKey,
  legacyAutoFixNotice,
  setLegacyAutoFixNotice,
  storedLegacyAutoFixNotice,
  setStoredLegacyAutoFixNotice,
  lastHotspotBatchSummary,
  setLastHotspotBatchSummary,
  lastManualBatchSummary,
  setLastManualBatchSummary,
  setRouteTransferNotice,
  setRouteEditorOpen,
  setRouteSearch,
  curationHistorySummary,
  recentCurationKeySet,
  curationHistoryKeySet,
  curationQueueFilterMode,
  setCurationQueueFilterMode,
  shouldIncludeCurationQueueKey,
  appendCurationHistoryEntries,
  clearCurationHistory,
  createCurationHistoryKeySetWith,
  copyCurationHistory,
}: UseAudioLegacyConflictManagerArgs) {
  const {
    activeRouteCount,
    clearFocusedConflictKey,
    combinedManualConflictQueue,
    documentedTargetCount,
    filteredCustomConflictHotspots,
    focusConflictKey,
    focusedCustomConflictDetail,
    focusedManualConflictIndex,
    focusedStoredManualConflictIndex,
    focusNextManualConflict,
    focusNextStoredManualConflict,
    focusPreviousManualConflict,
    focusPreviousStoredManualConflict,
    hiddenSafeLegacySliderCount,
    historyFilteredHotspotCount,
    legacyRouteParity,
    legacyRetirementImpact,
    manualConflictQueue,
    shouldRenderLegacySlider,
    storedManualConflictQueue,
    totalLegacySliderCount,
    visibleLegacySliderCount,
  } = useAudioLegacyConflictDerivedState({
    config,
    presets,
    presetSequence,
    focusedConflictKey,
    setFocusedConflictKey,
    setLegacyAutoFixNotice,
    setStoredLegacyAutoFixNotice,
    setRouteTransferNotice,
    setRouteEditorOpen,
    setRouteSearch,
    shouldIncludeCurationQueueKey,
  });

  const legacySliderVisibilityMode = config.audioLegacySliderVisibilityMode;
  const legacyCloseoutSummary = React.useMemo(() => buildProjectAudioLegacyCloseoutSummary(config, presets, presetSequence), [config, presets, presetSequence]);
  const cleanupState = React.useMemo(() => buildAudioLegacyCleanupState({
    focusedConflictKey,
    hotspotKeys: filteredCustomConflictHotspots.map((entry) => entry.key),
    manualConflictKeys: manualConflictQueue.map((entry) => entry.key),
    storedManualConflictKeys: storedManualConflictQueue.map((entry) => entry.key),
    lastHotspotBatchSummary,
    lastManualBatchSummary,
  }), [filteredCustomConflictHotspots, focusedConflictKey, lastHotspotBatchSummary, lastManualBatchSummary, manualConflictQueue, storedManualConflictQueue]);

  React.useEffect(() => {
    if (!cleanupState.shouldAutoClearFocusedConflict || !focusedConflictKey) return;
    clearFocusedConflictKey();
    setStoredLegacyAutoFixNotice((current) => current ?? `Focused conflict ${focusedConflictKey} resolved and was auto-cleared.`);
  }, [cleanupState.shouldAutoClearFocusedConflict, clearFocusedConflictKey, focusedConflictKey, setStoredLegacyAutoFixNotice]);

  React.useEffect(() => {
    if (!cleanupState.shouldAutoDismissLastHotspotBatch || !lastHotspotBatchSummary) return;
    setLastHotspotBatchSummary(null);
    setLegacyAutoFixNotice((current) => current ?? "Hotspot queue resolved. Last hotspot batch summary was auto-dismissed.");
  }, [cleanupState.shouldAutoDismissLastHotspotBatch, lastHotspotBatchSummary, setLastHotspotBatchSummary, setLegacyAutoFixNotice]);

  React.useEffect(() => {
    if (!cleanupState.shouldAutoDismissLastManualBatch || !lastManualBatchSummary) return;
    setLastManualBatchSummary(null);
    setStoredLegacyAutoFixNotice((current) => current ?? "Manual residual queues resolved. Last manual batch summary was auto-dismissed.");
  }, [cleanupState.shouldAutoDismissLastManualBatch, lastManualBatchSummary, setLastManualBatchSummary, setStoredLegacyAutoFixNotice]);

  const setLegacyVisibilityMode = React.useCallback(
    (mode: AudioLegacySliderVisibilityMode) => {
      updateConfig("audioLegacySliderVisibilityMode", mode);
    },
    [updateConfig],
  );

  const {
    applyStoredLegacyAutoFixes,
    applyLegacyAutoFixes,
    applyConflictRecommendationForKey,
  } = useAudioLegacyConflictManagerActions({
    config,
    updateConfig,
    presets,
    setPresets,
    presetSequence,
    setPresetSequence,
    isPublicLibrary,
    setLegacyAutoFixNotice,
    setStoredLegacyAutoFixNotice,
  });

  const {
    summarizeHotspotBatchState,
    summarizeManualBatchState,
    recordCurationHistory,
  } = useAudioLegacyConflictBatchState({
    curationHistoryKeySet,
    appendCurationHistoryEntries,
  });

  const {
    applyStoredHotspotRecommendationForKey,
    applyTopHotspotRecommendations,
    applyStoredTopHotspotRecommendations,
    applyEverywhereTopHotspotRecommendations,
    applyTopManualQueueRecommendations,
    applyStoredTopManualQueueRecommendations,
    applyStoredPreviewManualQueueRecommendations,
    applyEverywhereTopManualQueueRecommendations,
    } = useAudioLegacyConflictBatchActions({
    config,
    updateConfig,
    presets,
    setPresets,
    presetSequence,
    setPresetSequence,
    isPublicLibrary,
    filteredCustomConflictHotspots,
    manualConflictQueue,
    storedManualConflictQueue,
    combinedManualConflictQueue,
    summarizeHotspotBatchState,
    summarizeManualBatchState,
    recordCurationHistory,
    createCurationHistoryKeySetWith,
    applyConflictRecommendationForKey,
    setLegacyAutoFixNotice,
    setStoredLegacyAutoFixNotice,
    setLastHotspotBatchSummary,
    setLastManualBatchSummary,
  });

  const {
    collapseFocusedExactCustomDuplicates,
    collapseStoredFocusedExactCustomDuplicates,
    muteFocusedConflictToDominant,
    muteStoredFocusedConflictToDominant,
    applyFocusedConflictRecommendation,
    applyFocusedConflictRecommendationAndAdvance,
    applyStoredFocusedConflictRecommendation,
    applyStoredFocusedConflictRecommendationAndAdvance,
    keepFocusedConflictRoute,
    keepStoredFocusedConflictRoute,
  } = useAudioLegacyConflictFocusedActions({
    configAudioRoutes: config.audioRoutes,
    updateConfig,
    presets,
    setPresets,
    presetSequence,
    setPresetSequence,
    isPublicLibrary,
    focusedConflictKey,
    focusedCustomConflictDetail,
    manualConflictQueue,
    storedManualConflictQueue,
    applyLegacyAutoFixes,
    applyStoredLegacyAutoFixes,
    applyConflictRecommendationForKey,
    applyStoredHotspotRecommendationForKey,
    focusConflictKey,
    recordCurationHistory,
    setLegacyAutoFixNotice,
    setStoredLegacyAutoFixNotice,
  });

  const {
    copyCustomConflictHotspots,
    copyFocusedConflictDetail,
    copyFocusedRetirementSnapshot,
    copyLastHotspotBatchSummary,
    copyLastManualBatchSummary,
    copyRetirementImpactSummary,
  } = useAudioLegacyConflictClipboard({
    filteredCustomConflictHotspots,
    focusedCustomConflictDetail,
    legacyRetirementImpact,
    lastHotspotBatchSummary,
    lastManualBatchSummary,
    setRouteTransferNotice,
  });

  const panelProps = {
    config,
    updateConfig,
    presets,
    presetSequence,
    isPublicLibrary,
    activeRouteCount,
    documentedTargetCount,
    legacyRouteParity,
    legacyRetirementImpact,
    legacyCloseoutSummary,
    cleanupState,
    legacySliderVisibilityMode,
    setLegacyVisibilityMode,
    applyLegacyAutoFixes,
    applyStoredLegacyAutoFixes,
    visibleLegacySliderCount,
    totalLegacySliderCount,
    hiddenSafeLegacySliderCount,
    legacyAutoFixNotice,
    storedLegacyAutoFixNotice,
    setLegacyAutoFixNotice,
    filteredCustomConflictHotspots,
    historyFilteredHotspotCount,
    focusedConflictKey,
    curationQueueFilterMode,
    setCurationQueueFilterMode,
    recentCurationKeyCount: recentCurationKeySet.size,
    copyCustomConflictHotspots,
    copyFocusedRetirementSnapshot,
    applyTopHotspotRecommendations,
    applyStoredTopHotspotRecommendations,
    applyEverywhereTopHotspotRecommendations,
    copyLastHotspotBatchSummary,
    copyRetirementImpactSummary,
    copyLastManualBatchSummary,
    lastHotspotBatchSummary,
    applyFocusedConflictRecommendation,
    applyStoredFocusedConflictRecommendation,
    muteFocusedConflictToDominant,
    muteStoredFocusedConflictToDominant,
    collapseFocusedExactCustomDuplicates,
    collapseStoredFocusedExactCustomDuplicates,
    copyFocusedConflictDetail,
    clearFocusedConflictKey,
    manualConflictQueue,
    focusedManualConflictIndex,
    focusPreviousManualConflict,
    focusNextManualConflict,
    applyFocusedConflictRecommendationAndAdvance,
    applyTopManualQueueRecommendations,
    applyStoredTopManualQueueRecommendations,
    applyEverywhereTopManualQueueRecommendations,
    storedManualConflictQueue,
    focusedStoredManualConflictIndex,
    focusPreviousStoredManualConflict,
    focusNextStoredManualConflict,
    applyStoredFocusedConflictRecommendationAndAdvance,
    applyStoredPreviewManualQueueRecommendations,
    lastManualBatchSummary,
    curationHistorySummary,
    copyCurationHistory,
    clearCurationHistory,
    focusConflictKey,
    focusedCustomConflictDetail,
    keepFocusedConflictRoute,
    keepStoredFocusedConflictRoute,
    applyConflictRecommendationForKey,
    applyStoredHotspotRecommendationForKey,
  };

  return {
    clearFocusedConflictKey,
    panelProps,
    shouldRenderLegacySlider,
  };
}
