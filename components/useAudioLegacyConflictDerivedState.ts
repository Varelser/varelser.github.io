import React from "react";
import type { ParticleConfig } from "../types";
import type { PresetRecord } from "../types/presets";
import type { PresetSequenceItem } from "../types/sequence";
import { AUDIO_REACTIVE_CAPABILITY_REGISTRY } from "../lib/audioReactiveRegistry";
import {
  summarizeFocusedCustomConflict,
  summarizeLegacyAudioRouteParity,
} from "../lib/audioReactiveValidation";
import { summarizeAudioLegacyRetirementImpact } from "../lib/audioReactiveRetirementImpact";
import { summarizeFocusedLegacyRetirementPreview } from "../lib/audioReactiveFocusedRetirementPreview";
import { summarizeStoredFocusedConflict } from "../lib/audioReactiveRetirementMigration";
import {
  AUDIO_LEGACY_SLIDER_VISIBILITY_MODES,
  type AudioLegacySliderVisibilityMode,
} from "../types/audioReactive";
import {
  LEGACY_AUDIO_BAND_A_SLIDERS,
  LEGACY_AUDIO_BAND_B_SLIDERS,
  LEGACY_AUDIO_PRIMARY_SLIDERS,
} from "./controlPanelTabsAudioLegacy";

interface UseAudioLegacyConflictDerivedStateArgs {
  config: ParticleConfig;
  presets: PresetRecord[];
  presetSequence: PresetSequenceItem[];
  focusedConflictKey: string | null;
  setFocusedConflictKey: React.Dispatch<React.SetStateAction<string | null>>;
  setLegacyAutoFixNotice: React.Dispatch<React.SetStateAction<string | null>>;
  setStoredLegacyAutoFixNotice: React.Dispatch<React.SetStateAction<string | null>>;
  setRouteTransferNotice: React.Dispatch<React.SetStateAction<string | null>>;
  setRouteEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setRouteSearch: React.Dispatch<React.SetStateAction<string>>;
  shouldIncludeCurationQueueKey: (key: string) => boolean;
}

export function useAudioLegacyConflictDerivedState({
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
}: UseAudioLegacyConflictDerivedStateArgs) {
  const legacyRouteParity = React.useMemo(
    () => summarizeLegacyAudioRouteParity(config, config.audioRoutes),
    [config],
  );

  const legacyRetirementImpact = React.useMemo(
    () => summarizeAudioLegacyRetirementImpact(config, presets, presetSequence),
    [config, presetSequence, presets],
  );

  const focusedCustomConflictDetail = React.useMemo(
    () => summarizeFocusedCustomConflict(config, config.audioRoutes, focusedConflictKey),
    [config, focusedConflictKey],
  );

  const focusedLegacyRetirementPreview = React.useMemo(
    () => summarizeFocusedLegacyRetirementPreview(config, presets, presetSequence, focusedConflictKey),
    [config, focusedConflictKey, presetSequence, presets],
  );

  const filteredCustomConflictHotspots = React.useMemo(
    () =>
      legacyRetirementImpact.customConflictHotspots.filter((hotspot) =>
        shouldIncludeCurationQueueKey(hotspot.key),
      ),
    [legacyRetirementImpact.customConflictHotspots, shouldIncludeCurationQueueKey],
  );

  const historyFilteredHotspotCount =
    legacyRetirementImpact.customConflictHotspots.length -
    filteredCustomConflictHotspots.length;

  const manualConflictQueue = React.useMemo(() => {
    return filteredCustomConflictHotspots
      .map((hotspot) => {
        const detail = summarizeFocusedCustomConflict(config, config.audioRoutes, hotspot.key);
        if (!detail) return null;
        if (
          detail.recommendation !== "manual-custom-choice" &&
          detail.recommendation !== "manual-residual-merge"
        ) {
          return null;
        }
        return {
          key: hotspot.key,
          contextCount: hotspot.contextCount,
          highestKind: hotspot.highestKind,
          recommendation: detail.recommendation,
          dominantRouteId: detail.dominantRouteId,
          amountSpread: detail.amountSpread,
          biasSpread: detail.biasSpread,
          timingSpread: detail.timingSpread,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  }, [config, filteredCustomConflictHotspots]);

  const focusedManualConflictIndex = React.useMemo(
    () => manualConflictQueue.findIndex((entry) => entry.key === focusedConflictKey),
    [focusedConflictKey, manualConflictQueue],
  );

  const storedManualConflictQueue = React.useMemo(() => {
    return filteredCustomConflictHotspots
      .map((hotspot) => {
        const summary = summarizeStoredFocusedConflict(
          presets,
          presetSequence,
          hotspot.key,
        );
        const manualCount =
          summary.manualCustomChoiceCount + summary.manualResidualMergeCount;
        if (manualCount <= 0) return null;
        return {
          key: hotspot.key,
          contextCount: hotspot.presetCount + hotspot.keyframeCount,
          manualCount,
          manualCustomChoiceCount: summary.manualCustomChoiceCount,
          manualResidualMergeCount: summary.manualResidualMergeCount,
          presetContextCount: summary.presetContextCount,
          keyframeContextCount: summary.keyframeContextCount,
          sampleContexts: summary.sampleContexts,
          dominantRecommendation: summary.dominantRecommendation,
        };
      })
      .filter(
        (
          entry,
        ): entry is {
          key: string;
          contextCount: number;
          manualCount: number;
          manualCustomChoiceCount: number;
          manualResidualMergeCount: number;
          presetContextCount: number;
          keyframeContextCount: number;
          sampleContexts: string[];
          dominantRecommendation:
            | "manual-custom-choice"
            | "manual-residual-merge"
            | "collapse-exact-custom"
            | "remove-legacy-shadow"
            | "none";
        } => Boolean(entry),
      )
      .sort((left, right) => {
        if (right.manualCount !== left.manualCount) {
          return right.manualCount - left.manualCount;
        }
        if (right.contextCount !== left.contextCount) {
          return right.contextCount - left.contextCount;
        }
        return left.key.localeCompare(right.key);
      });
  }, [filteredCustomConflictHotspots, presetSequence, presets]);

  const focusedStoredManualConflictIndex = React.useMemo(
    () => storedManualConflictQueue.findIndex((entry) => entry.key === focusedConflictKey),
    [focusedConflictKey, storedManualConflictQueue],
  );

  const combinedManualConflictQueue = React.useMemo(() => {
    const bucket = new Map<string, {
      key: string;
      currentManualCount: number;
      currentContextCount: number;
      storedManualCount: number;
      storedContextCount: number;
      recommendation: string | null;
      highestKind: string | null;
      sampleContexts: string[];
    }>();

    manualConflictQueue.forEach((entry) => {
      bucket.set(entry.key, {
        key: entry.key,
        currentManualCount: 1,
        currentContextCount: entry.contextCount,
        storedManualCount: 0,
        storedContextCount: 0,
        recommendation: entry.recommendation,
        highestKind: entry.highestKind,
        sampleContexts: [],
      });
    });

    storedManualConflictQueue.forEach((entry) => {
      const existing = bucket.get(entry.key);
      if (existing) {
        existing.storedManualCount = entry.manualCount;
        existing.storedContextCount = entry.contextCount;
        existing.sampleContexts = entry.sampleContexts;
      } else {
        bucket.set(entry.key, {
          key: entry.key,
          currentManualCount: 0,
          currentContextCount: 0,
          storedManualCount: entry.manualCount,
          storedContextCount: entry.contextCount,
          recommendation: entry.dominantRecommendation,
          highestKind: null,
          sampleContexts: entry.sampleContexts,
        });
      }
    });

    return Array.from(bucket.values()).sort((left, right) => {
      const leftScore = left.currentManualCount + left.storedManualCount;
      const rightScore = right.currentManualCount + right.storedManualCount;
      if (rightScore !== leftScore) return rightScore - leftScore;
      return left.key.localeCompare(right.key);
    });
  }, [manualConflictQueue, storedManualConflictQueue]);

  const legacyDeprecationStatusMap = React.useMemo(
    () => new Map(legacyRouteParity.deprecationOrder.map((candidate) => [candidate.legacyId, candidate.status])),
    [legacyRouteParity.deprecationOrder],
  );

  const legacySliderVisibilityMode = config.audioLegacySliderVisibilityMode;

  const shouldRenderLegacySlider = React.useCallback(
    (legacyId: string) => {
      if (legacySliderVisibilityMode === "all") return true;
      return legacyDeprecationStatusMap.get(legacyId) !== "safe";
    },
    [legacyDeprecationStatusMap, legacySliderVisibilityMode],
  );

  const focusConflictKey = React.useCallback((key: string) => {
    setFocusedConflictKey(key);
    setRouteEditorOpen(true);
    setRouteSearch("");
    setRouteTransferNotice(`Focused route editor on conflict key ${key}.`);
  }, [setFocusedConflictKey, setRouteEditorOpen, setRouteSearch, setRouteTransferNotice]);

  const clearFocusedConflictKey = React.useCallback(() => {
    setFocusedConflictKey(null);
  }, [setFocusedConflictKey]);

  const focusNextManualConflict = React.useCallback(() => {
    if (manualConflictQueue.length === 0) {
      setLegacyAutoFixNotice("No manual residual conflicts remain in the current queue.");
      return;
    }
    const nextIndex = focusedManualConflictIndex >= 0 ? (focusedManualConflictIndex + 1) % manualConflictQueue.length : 0;
    const nextEntry = manualConflictQueue[nextIndex];
    focusConflictKey(nextEntry.key);
    setLegacyAutoFixNotice(`Focused next manual conflict / #${nextIndex + 1}/${manualConflictQueue.length} / ${nextEntry.key} / ${nextEntry.recommendation}.`);
  }, [focusConflictKey, focusedManualConflictIndex, manualConflictQueue, setLegacyAutoFixNotice]);

  const focusPreviousManualConflict = React.useCallback(() => {
    if (manualConflictQueue.length === 0) {
      setLegacyAutoFixNotice("No manual residual conflicts remain in the current queue.");
      return;
    }
    const nextIndex = focusedManualConflictIndex >= 0 ? (focusedManualConflictIndex - 1 + manualConflictQueue.length) % manualConflictQueue.length : manualConflictQueue.length - 1;
    const nextEntry = manualConflictQueue[nextIndex];
    focusConflictKey(nextEntry.key);
    setLegacyAutoFixNotice(`Focused previous manual conflict / #${nextIndex + 1}/${manualConflictQueue.length} / ${nextEntry.key} / ${nextEntry.recommendation}.`);
  }, [focusConflictKey, focusedManualConflictIndex, manualConflictQueue, setLegacyAutoFixNotice]);

  const focusNextStoredManualConflict = React.useCallback(() => {
    if (storedManualConflictQueue.length === 0) {
      setStoredLegacyAutoFixNotice("No manual residual conflicts remain in stored contexts.");
      return;
    }
    const nextIndex = focusedStoredManualConflictIndex >= 0 ? (focusedStoredManualConflictIndex + 1) % storedManualConflictQueue.length : 0;
    const nextEntry = storedManualConflictQueue[nextIndex];
    focusConflictKey(nextEntry.key);
    setStoredLegacyAutoFixNotice(`Focused next stored manual conflict / #${nextIndex + 1}/${storedManualConflictQueue.length} / ${nextEntry.key} / manual ${nextEntry.manualCount}.`);
  }, [focusConflictKey, focusedStoredManualConflictIndex, setStoredLegacyAutoFixNotice, storedManualConflictQueue]);

  const focusPreviousStoredManualConflict = React.useCallback(() => {
    if (storedManualConflictQueue.length === 0) {
      setStoredLegacyAutoFixNotice("No manual residual conflicts remain in stored contexts.");
      return;
    }
    const nextIndex = focusedStoredManualConflictIndex >= 0 ? (focusedStoredManualConflictIndex - 1 + storedManualConflictQueue.length) % storedManualConflictQueue.length : storedManualConflictQueue.length - 1;
    const nextEntry = storedManualConflictQueue[nextIndex];
    focusConflictKey(nextEntry.key);
    setStoredLegacyAutoFixNotice(`Focused previous stored manual conflict / #${nextIndex + 1}/${storedManualConflictQueue.length} / ${nextEntry.key} / manual ${nextEntry.manualCount}.`);
  }, [focusConflictKey, focusedStoredManualConflictIndex, setStoredLegacyAutoFixNotice, storedManualConflictQueue]);

  const totalLegacySliderCount =
    LEGACY_AUDIO_PRIMARY_SLIDERS.length +
    LEGACY_AUDIO_BAND_A_SLIDERS.length +
    LEGACY_AUDIO_BAND_B_SLIDERS.length;

  const visibleLegacySliderCount = React.useMemo(
    () =>
      LEGACY_AUDIO_PRIMARY_SLIDERS.concat(LEGACY_AUDIO_BAND_A_SLIDERS, LEGACY_AUDIO_BAND_B_SLIDERS).filter((definition) =>
        shouldRenderLegacySlider(definition.legacyId),
      ).length,
    [shouldRenderLegacySlider],
  );

  const hiddenSafeLegacySliderCount = totalLegacySliderCount - visibleLegacySliderCount;
  const activeRouteCount = config.audioRoutes.filter((route) => route.enabled).length;
  const documentedTargetCount = AUDIO_REACTIVE_CAPABILITY_REGISTRY.reduce((total, entry) => total + entry.targets.length, 0);

  return {
    activeRouteCount,
    clearFocusedConflictKey,
    combinedManualConflictQueue,
    documentedTargetCount,
    filteredCustomConflictHotspots,
    focusConflictKey,
    focusedCustomConflictDetail,
    focusedLegacyRetirementPreview,
    focusedManualConflictIndex,
    focusedStoredManualConflictIndex,
    focusNextManualConflict,
    focusNextStoredManualConflict,
    focusPreviousManualConflict,
    focusPreviousStoredManualConflict,
    hiddenSafeLegacySliderCount,
    historyFilteredHotspotCount,
    legacyDeprecationStatusMap,
    legacyRouteParity,
    legacyRetirementImpact,
    manualConflictQueue,
    shouldRenderLegacySlider,
    storedManualConflictQueue,
    totalLegacySliderCount,
    visibleLegacySliderCount,
  };
}
