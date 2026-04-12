import React from "react";
import type { ParticleConfig } from "../types";
import { summarizeFocusedCustomConflict } from "../lib/audioReactiveValidation";
import { applyLegacyAudioRouteAutoFixes } from "../lib/audioReactiveLegacyFixes";
import { applyLegacyAudioRouteAutoFixesToStoredContexts } from "../lib/audioReactiveRetirementMigration";
import { createStoredLegacyAutoFixOptions } from "../lib/audioReactiveStoredAutoFixPreview";
import type { AudioModulationRoute } from "../types/audioReactive";
import type { ControlPanelContentProps } from "./controlPanelTabsShared";

export function useAudioLegacyConflictManagerActions({
  config,
  updateConfig,
  presets,
  setPresets,
  presetSequence,
  setPresetSequence,
  isPublicLibrary,
  setLegacyAutoFixNotice,
  setStoredLegacyAutoFixNotice,
}: {
  config: ParticleConfig;
  updateConfig: ControlPanelContentProps["updateConfig"];
  presets: ControlPanelContentProps["presets"];
  setPresets: ControlPanelContentProps["setPresets"];
  presetSequence: ControlPanelContentProps["presetSequence"];
  setPresetSequence: ControlPanelContentProps["setPresetSequence"];
  isPublicLibrary: boolean;
  setLegacyAutoFixNotice: React.Dispatch<React.SetStateAction<string | null>>;
  setStoredLegacyAutoFixNotice: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const applyStoredLegacyAutoFixes = React.useCallback((scope: "presets" | "keyframes" | "all", profile: "safe" | "collapse-review" | "remove-custom-shadow" | "collapse-custom-exact" | "align-residuals" | "mute-focused-conflict" = "safe", onlyKey?: string, keepRouteId?: string) => {
    if (isPublicLibrary) {
      setStoredLegacyAutoFixNotice("Stored preset migration is disabled in public library mode.");
      return;
    }
    const result = applyLegacyAudioRouteAutoFixesToStoredContexts(
      presets,
      presetSequence,
      createStoredLegacyAutoFixOptions(profile, onlyKey, keepRouteId),
      scope,
    );
    if (scope !== "keyframes") setPresets(result.presets);
    if (scope !== "presets") setPresetSequence(result.presetSequence);
    const presetDelta = `${result.presetsSummary.reviewBeforeCount}->${result.presetsSummary.reviewAfterCount} review / ${result.presetsSummary.blockedBeforeCount}->${result.presetsSummary.blockedAfterCount} blocked`;
    const keyframeDelta = `${result.keyframesSummary.reviewBeforeCount}->${result.keyframesSummary.reviewAfterCount} review / ${result.keyframesSummary.blockedBeforeCount}->${result.keyframesSummary.blockedAfterCount} blocked`;
    const profileLabel = profile === "collapse-review" ? "review-collapse" : profile === "remove-custom-shadow" ? "remove-custom-shadow" : profile === "collapse-custom-exact" ? "collapse-custom-exact" : profile === "align-residuals" ? "align-residuals" : profile === "mute-focused-conflict" ? "mute-focused-conflict" : "safe-pass";
    const collapsedDelta = profile === "collapse-review"
      ? ` / collapsed legacy-owned duplicates presets ${result.presetsSummary.collapsedLegacyOwnedDuplicateCount}, keyframes ${result.keyframesSummary.collapsedLegacyOwnedDuplicateCount}`
      : profile === "remove-custom-shadow"
        ? ` / removed legacy shadowed by custom exact presets ${result.presetsSummary.removedLegacyShadowedByCustomExactCount}, keyframes ${result.keyframesSummary.removedLegacyShadowedByCustomExactCount}`
        : profile === "collapse-custom-exact"
          ? ` / collapsed exact custom duplicates presets ${result.presetsSummary.collapsedExactCustomDuplicateCount}, keyframes ${result.keyframesSummary.collapsedExactCustomDuplicateCount}`
          : profile === "align-residuals"
            ? ` / residual aligned presets ${result.presetsSummary.residualAlignedCount}, keyframes ${result.keyframesSummary.residualAlignedCount}`
            : profile === "mute-focused-conflict"
              ? ` / muted non-dominant focused routes presets ${result.presetsSummary.disabledNonDominantFocusedRouteCount}, keyframes ${result.keyframesSummary.disabledNonDominantFocusedRouteCount}`
              : "";
    const scopeSuffix = onlyKey ? ` / key ${onlyKey}` : "";
    setStoredLegacyAutoFixNotice(`Stored ${profileLabel} ${scope}${scopeSuffix}: presets ${result.presetsSummary.updatedCount} (${presetDelta}), keyframes ${result.keyframesSummary.updatedCount} (${keyframeDelta})${collapsedDelta}.`);
  }, [isPublicLibrary, presetSequence, presets, setPresetSequence, setPresets, setStoredLegacyAutoFixNotice]);

  const applyLegacyAutoFixes = React.useCallback((mode: "append-missing" | "align-residuals" | "dedupe-exact" | "collapse-review-duplicates" | "remove-custom-shadow" | "collapse-custom-exact" | "mute-focused-conflict" | "remove-stale" | "run-safe-pass", onlyKey?: string, keepRouteId?: string) => {
    const options = mode === "append-missing" ? { appendMissing: true, onlyKey }
      : mode === "align-residuals" ? { alignResiduals: true, onlyKey }
      : mode === "dedupe-exact" ? { dedupeExact: true, onlyKey }
      : mode === "collapse-review-duplicates" ? { alignResiduals: true, dedupeExact: true, collapseLegacyOwnedDuplicates: true, onlyKey }
      : mode === "remove-custom-shadow" ? { removeLegacyShadowedByCustomExact: true, onlyKey }
      : mode === "collapse-custom-exact" ? { collapseExactCustomDuplicates: true, onlyKey }
      : mode === "mute-focused-conflict" ? { disableNonDominantFocusedRoutes: true, onlyKey, keepRouteId }
      : mode === "remove-stale" ? { removeStaleLegacy: true, onlyKey }
      : { appendMissing: true, alignResiduals: true, dedupeExact: true, removeStaleLegacy: true, onlyKey };
    const result = applyLegacyAudioRouteAutoFixes(config, config.audioRoutes, options);
    const changed = result.summary.missingAddedCount + result.summary.residualAlignedCount + result.summary.duplicateRemovedCount + result.summary.collapsedLegacyOwnedDuplicateCount + result.summary.removedLegacyShadowedByCustomExactCount + result.summary.collapsedExactCustomDuplicateCount + result.summary.disabledNonDominantFocusedRouteCount + result.summary.staleLegacyRemovedCount;
    if (changed === 0) {
      setLegacyAutoFixNotice("Legacy auto-fix skipped because no matching changes were needed.");
      return;
    }
    updateConfig("audioRoutes", result.routes); updateConfig("audioRoutesEnabled", true);
    const summaryParts = [
      result.summary.missingAddedCount > 0 ? `missing +${result.summary.missingAddedCount}` : null,
      result.summary.residualAlignedCount > 0 ? `residual aligned ${result.summary.residualAlignedCount}` : null,
      result.summary.duplicateRemovedCount > 0 ? `duplicates removed ${result.summary.duplicateRemovedCount}` : null,
      result.summary.collapsedLegacyOwnedDuplicateCount > 0 ? `legacy-owned duplicates collapsed ${result.summary.collapsedLegacyOwnedDuplicateCount}` : null,
      result.summary.removedLegacyShadowedByCustomExactCount > 0 ? `legacy shadowed by custom exact removed ${result.summary.removedLegacyShadowedByCustomExactCount}` : null,
      result.summary.collapsedExactCustomDuplicateCount > 0 ? `exact custom duplicates collapsed ${result.summary.collapsedExactCustomDuplicateCount}` : null,
      result.summary.disabledNonDominantFocusedRouteCount > 0 ? `non-dominant focused routes muted ${result.summary.disabledNonDominantFocusedRouteCount}` : null,
      result.summary.staleLegacyRemovedCount > 0 ? `stale removed ${result.summary.staleLegacyRemovedCount}` : null,
    ].filter(Boolean);
    const scopeSuffix = onlyKey ? ` / key ${onlyKey}` : "";
    setLegacyAutoFixNotice(`Legacy auto-fix applied${scopeSuffix} / ${summaryParts.join(" / ")}.`);
  }, [config, setLegacyAutoFixNotice, updateConfig]);

  const applyConflictRecommendationForKey = React.useCallback((key: string, routes: AudioModulationRoute[] = config.audioRoutes, overrideKeepRouteId?: string) => {
    const detail = summarizeFocusedCustomConflict(config, routes, key);
    if (!detail) return { applied: false, routes, label: "none", reason: "No focused conflict detail available." } as const;
    if (overrideKeepRouteId) {
      const fix = applyLegacyAudioRouteAutoFixes(config, routes, { disableNonDominantFocusedRoutes: true, onlyKey: key, keepRouteId: overrideKeepRouteId });
      return { applied: JSON.stringify(fix.routes) !== JSON.stringify(routes), routes: fix.routes, label: "mute-focused-conflict", reason: `Manual keep route override / ${overrideKeepRouteId}.` } as const;
    }
    if (detail.recommendation === "collapse-exact-custom") {
      const fix = applyLegacyAudioRouteAutoFixes(config, routes, { collapseExactCustomDuplicates: true, onlyKey: key });
      return { applied: JSON.stringify(fix.routes) !== JSON.stringify(routes), routes: fix.routes, label: "collapse-exact-custom", reason: detail.recommendationReason } as const;
    }
    if (detail.recommendation === "remove-legacy-shadow") {
      const fix = applyLegacyAudioRouteAutoFixes(config, routes, { removeLegacyShadowedByCustomExact: true, onlyKey: key });
      return { applied: JSON.stringify(fix.routes) !== JSON.stringify(routes), routes: fix.routes, label: "remove-legacy-shadow", reason: detail.recommendationReason } as const;
    }
    if (detail.recommendation === "manual-residual-merge") {
      const fix = applyLegacyAudioRouteAutoFixes(config, routes, { alignResiduals: true, onlyKey: key });
      return { applied: JSON.stringify(fix.routes) !== JSON.stringify(routes), routes: fix.routes, label: "align-residuals", reason: detail.recommendationReason } as const;
    }
    if (detail.dominantRouteId) {
      const fix = applyLegacyAudioRouteAutoFixes(config, routes, { disableNonDominantFocusedRoutes: true, onlyKey: key, keepRouteId: detail.dominantRouteId });
      return { applied: JSON.stringify(fix.routes) !== JSON.stringify(routes), routes: fix.routes, label: "mute-focused-conflict", reason: detail.recommendationReason } as const;
    }
    return { applied: false, routes, label: "none", reason: detail.recommendationReason } as const;
  }, [config]);

  return { applyStoredLegacyAutoFixes, applyLegacyAutoFixes, applyConflictRecommendationForKey };
}
