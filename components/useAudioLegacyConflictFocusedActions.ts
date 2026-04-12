import React from "react";
import { applyKeepRouteReferenceToStoredContexts } from "../lib/audioReactiveRetirementMigration";
import type { AudioFocusedCustomConflictRouteDetail } from "../lib/audioReactiveValidation";
import type { AudioModulationRoute } from "../types/audioReactive";
import type { ControlPanelContentProps } from "./controlPanelTabsShared";

import {
  getNextConflict,
  type UseAudioLegacyConflictFocusedActionsArgs,
} from "./audioLegacyConflictFocusedActionTypes";

export function useAudioLegacyConflictFocusedActions({
  configAudioRoutes,
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
}: UseAudioLegacyConflictFocusedActionsArgs) {
  const collapseFocusedExactCustomDuplicates = React.useCallback(() => {
    if (!focusedConflictKey) {
      setLegacyAutoFixNotice(
        "Focus a conflict key before collapsing exact custom duplicates.",
      );
      return;
    }
    applyLegacyAutoFixes("collapse-custom-exact", focusedConflictKey);
  }, [applyLegacyAutoFixes, focusedConflictKey, setLegacyAutoFixNotice]);

  const collapseStoredFocusedExactCustomDuplicates = React.useCallback(() => {
    if (!focusedConflictKey) {
      setStoredLegacyAutoFixNotice(
        "Focus a conflict key before collapsing stored exact custom duplicates.",
      );
      return;
    }
    applyStoredLegacyAutoFixes(
      "all",
      "collapse-custom-exact",
      focusedConflictKey,
    );
  }, [
    applyStoredLegacyAutoFixes,
    focusedConflictKey,
    setStoredLegacyAutoFixNotice,
  ]);

  const muteFocusedConflictToDominant = React.useCallback(() => {
    if (!focusedCustomConflictDetail?.dominantRouteId) {
      setLegacyAutoFixNotice("Focused conflict has no dominant route to keep.");
      return;
    }
    applyLegacyAutoFixes(
      "mute-focused-conflict",
      focusedCustomConflictDetail.key,
      focusedCustomConflictDetail.dominantRouteId,
    );
  }, [
    applyLegacyAutoFixes,
    focusedCustomConflictDetail,
    setLegacyAutoFixNotice,
  ]);

  const muteStoredFocusedConflictToDominant = React.useCallback(() => {
    if (!focusedCustomConflictDetail?.dominantRouteId) {
      setStoredLegacyAutoFixNotice(
        "Focused conflict has no dominant route to keep in stored contexts.",
      );
      return;
    }
    applyStoredLegacyAutoFixes(
      "all",
      "mute-focused-conflict",
      focusedCustomConflictDetail.key,
      focusedCustomConflictDetail.dominantRouteId,
    );
  }, [
    applyStoredLegacyAutoFixes,
    focusedCustomConflictDetail,
    setStoredLegacyAutoFixNotice,
  ]);

  const applyFocusedConflictRecommendation = React.useCallback(() => {
    if (!focusedCustomConflictDetail) {
      setLegacyAutoFixNotice(
        "Focus a conflict key before applying recommendation.",
      );
      return;
    }
    const result = applyConflictRecommendationForKey(
      focusedCustomConflictDetail.key,
    );
    if (!result.applied) {
      setLegacyAutoFixNotice(
        `Focused recommendation skipped / key ${focusedCustomConflictDetail.key} / ${result.reason}.`,
      );
      return;
    }
    updateConfig("audioRoutes", result.routes);
    updateConfig("audioRoutesEnabled", true);
    recordCurationHistory(
      "current",
      "focused-recommendation",
      [focusedCustomConflictDetail.key],
      result.label,
    );
    setLegacyAutoFixNotice(
      `Focused recommendation applied / key ${focusedCustomConflictDetail.key} / ${result.label}.`,
    );
  }, [
    applyConflictRecommendationForKey,
    focusedCustomConflictDetail,
    recordCurationHistory,
    setLegacyAutoFixNotice,
    updateConfig,
  ]);

  const applyFocusedConflictRecommendationAndAdvance = React.useCallback(() => {
    if (!focusedCustomConflictDetail) {
      setLegacyAutoFixNotice(
        "Focus a conflict key before applying and advancing.",
      );
      return;
    }
    const result = applyConflictRecommendationForKey(
      focusedCustomConflictDetail.key,
    );
    if (result.applied) {
      updateConfig("audioRoutes", result.routes);
      updateConfig("audioRoutesEnabled", true);
      recordCurationHistory(
        "current",
        "focused-recommendation",
        [focusedCustomConflictDetail.key],
        result.label,
      );
    }
    const next = getNextConflict(manualConflictQueue, focusedCustomConflictDetail.key);
    if (!next) {
      setLegacyAutoFixNotice(
        result.applied
          ? `Focused recommendation applied / key ${focusedCustomConflictDetail.key} / ${result.label}.`
          : "No manual residual conflicts remain in the current queue.",
      );
      return;
    }
    focusConflictKey(next.nextEntry.key);
    setLegacyAutoFixNotice(
      result.applied
        ? `Focused recommendation applied / key ${focusedCustomConflictDetail.key} / ${result.label} / next #${next.nextIndex + 1}/${manualConflictQueue.length} ${next.nextEntry.key}.`
        : `Advanced to next manual conflict / #${next.nextIndex + 1}/${manualConflictQueue.length} / ${next.nextEntry.key}.`,
    );
  }, [
    applyConflictRecommendationForKey,
    focusConflictKey,
    focusedCustomConflictDetail,
    manualConflictQueue,
    recordCurationHistory,
    setLegacyAutoFixNotice,
    updateConfig,
  ]);

  const applyStoredFocusedConflictRecommendation = React.useCallback(() => {
    if (!focusedCustomConflictDetail) {
      setStoredLegacyAutoFixNotice(
        "Focus a conflict key before applying stored recommendation.",
      );
      return;
    }
    if (
      focusedCustomConflictDetail.recommendation === "collapse-exact-custom"
    ) {
      applyStoredLegacyAutoFixes(
        "all",
        "collapse-custom-exact",
        focusedCustomConflictDetail.key,
      );
      return;
    }
    if (focusedCustomConflictDetail.recommendation === "remove-legacy-shadow") {
      applyStoredLegacyAutoFixes(
        "all",
        "remove-custom-shadow",
        focusedCustomConflictDetail.key,
      );
      return;
    }
    if (focusedCustomConflictDetail.recommendation === "manual-residual-merge") {
      applyStoredLegacyAutoFixes(
        "all",
        "align-residuals",
        focusedCustomConflictDetail.key,
      );
      return;
    }
    if (focusedCustomConflictDetail.dominantRouteId) {
      applyStoredLegacyAutoFixes(
        "all",
        "mute-focused-conflict",
        focusedCustomConflictDetail.key,
        focusedCustomConflictDetail.dominantRouteId,
      );
      return;
    }
    setStoredLegacyAutoFixNotice(
      "Focused conflict recommendation is informational only for stored contexts.",
    );
  }, [
    applyStoredLegacyAutoFixes,
    focusedCustomConflictDetail,
    setStoredLegacyAutoFixNotice,
  ]);

  const applyStoredFocusedConflictRecommendationAndAdvance =
    React.useCallback(() => {
      if (!focusedConflictKey) {
        setStoredLegacyAutoFixNotice(
          "Focus a stored manual conflict before applying and advancing.",
        );
        return;
      }
      applyStoredHotspotRecommendationForKey(focusedConflictKey);
      const next = getNextConflict(storedManualConflictQueue, focusedConflictKey);
      if (!next) {
        return;
      }
      focusConflictKey(next.nextEntry.key);
      setStoredLegacyAutoFixNotice(
        `Stored focused recommendation applied / key ${focusedConflictKey} / next #${next.nextIndex + 1}/${storedManualConflictQueue.length} ${next.nextEntry.key}.`,
      );
    }, [
      applyStoredHotspotRecommendationForKey,
      focusConflictKey,
      focusedConflictKey,
      setStoredLegacyAutoFixNotice,
      storedManualConflictQueue,
    ]);

  const keepFocusedConflictRoute = React.useCallback(
    (routeId: string, advance = false) => {
      if (!focusedConflictKey) {
        setLegacyAutoFixNotice(
          "Focus a conflict key before curating a specific route.",
        );
        return;
      }
      const result = applyConflictRecommendationForKey(
        focusedConflictKey,
        configAudioRoutes,
        routeId,
      );
      if (!result.applied) {
        setLegacyAutoFixNotice(
          `Focused route curation skipped / key ${focusedConflictKey} / keep ${routeId}.`,
        );
        return;
      }
      updateConfig("audioRoutes", result.routes);
      updateConfig("audioRoutesEnabled", true);
      recordCurationHistory("current", "keep-route", [focusedConflictKey], routeId);
      const next = advance ? getNextConflict(manualConflictQueue, focusedConflictKey) : null;
      if (!next) {
        setLegacyAutoFixNotice(
          `Focused route curated / key ${focusedConflictKey} / keep ${routeId}.`,
        );
        return;
      }
      focusConflictKey(next.nextEntry.key);
      setLegacyAutoFixNotice(
        `Focused route curated / key ${focusedConflictKey} / keep ${routeId} / next #${next.nextIndex + 1}/${manualConflictQueue.length} ${next.nextEntry.key}.`,
      );
    },
    [
      applyConflictRecommendationForKey,
      configAudioRoutes,
      focusConflictKey,
      focusedConflictKey,
      manualConflictQueue,
      recordCurationHistory,
      setLegacyAutoFixNotice,
      updateConfig,
    ],
  );

  const keepStoredFocusedConflictRoute = React.useCallback(
    (route: AudioFocusedCustomConflictRouteDetail, advance = false) => {
      if (isPublicLibrary) {
        setStoredLegacyAutoFixNotice(
          "Stored preset migration is disabled in public library mode.",
        );
        return;
      }
      if (!focusedConflictKey) {
        setStoredLegacyAutoFixNotice(
          "Focus a conflict key before curating a stored route.",
        );
        return;
      }
      const result = applyKeepRouteReferenceToStoredContexts(
        presets,
        presetSequence,
        focusedConflictKey,
        {
          owner: route.owner,
          amount: route.amount,
          bias: route.bias,
          smoothing: route.smoothing,
          attack: route.attack,
          release: route.release,
          clampMin: route.clampMin,
          clampMax: route.clampMax,
          mode: route.mode,
          curve: route.curve,
        },
        "all",
      );
      const appliedCount =
        result.presetsSummary.appliedRecommendationCount +
        result.keyframesSummary.appliedRecommendationCount;
      if (appliedCount === 0) {
        setStoredLegacyAutoFixNotice(
          `Stored route keep skipped / key ${focusedConflictKey} / route ${route.id}.`,
        );
        return;
      }
      setPresets(result.presets);
      setPresetSequence(result.presetSequence);
      recordCurationHistory(
        "stored",
        "stored-keep-route",
        [focusedConflictKey],
        route.id,
      );
      const next = advance
        ? getNextConflict(storedManualConflictQueue, focusedConflictKey)
        : null;
      if (!next) {
        setStoredLegacyAutoFixNotice(
          `Stored route curated / key ${focusedConflictKey} / route ${route.id} / presets ${result.presetsSummary.updatedCount} / keyframes ${result.keyframesSummary.updatedCount}.`,
        );
        return;
      }
      focusConflictKey(next.nextEntry.key);
      setStoredLegacyAutoFixNotice(
        `Stored route curated / key ${focusedConflictKey} / route ${route.id} / next #${next.nextIndex + 1}/${storedManualConflictQueue.length} ${next.nextEntry.key}.`,
      );
    },
    [
      focusConflictKey,
      focusedConflictKey,
      isPublicLibrary,
      presetSequence,
      presets,
      recordCurationHistory,
      setPresetSequence,
      setPresets,
      setStoredLegacyAutoFixNotice,
      storedManualConflictQueue,
    ],
  );

  return {
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
  };
}
