import React from "react";
import type { ParticleConfig } from "../types";
import { createAudioCurationHistoryEntry } from "../lib/audioReactiveCurationHistory";
import { summarizeAudioLegacyRetirementImpact } from "../lib/audioReactiveRetirementImpact";
import {
  summarizeStoredFocusedConflict,
} from "../lib/audioReactiveRetirementMigration";
import { summarizeFocusedCustomConflict } from "../lib/audioReactiveValidation";
import type { ControlPanelContentProps } from "./controlPanelTabsShared";

type Presets = ControlPanelContentProps["presets"];
type PresetSequence = ControlPanelContentProps["presetSequence"];

interface UseAudioLegacyConflictBatchStateArgs {
  curationHistoryKeySet: ReadonlySet<string>;
  appendCurationHistoryEntries: (entries: ReturnType<typeof createAudioCurationHistoryEntry>[]) => void;
}

export function useAudioLegacyConflictBatchState({
  curationHistoryKeySet,
  appendCurationHistoryEntries,
}: UseAudioLegacyConflictBatchStateArgs) {
  const summarizeHotspotBatchState = React.useCallback(
    (
      nextConfig: ParticleConfig,
      nextPresets: Presets,
      nextPresetSequence: PresetSequence,
      historyKeySet: ReadonlySet<string> = curationHistoryKeySet,
    ) => {
      const impact = summarizeAudioLegacyRetirementImpact(
        nextConfig,
        nextPresets,
        nextPresetSequence,
      );
      const pendingHotspots = impact.customConflictHotspots.filter(
        (hotspot) => !historyKeySet.has(hotspot.key),
      );
      return {
        hotspotCount: impact.customConflictHotspots.length,
        contextCount: impact.customConflictHotspots.reduce(
          (sum, hotspot) => sum + hotspot.contextCount,
          0,
        ),
        pendingHotspotCount: pendingHotspots.length,
        pendingContextCount: pendingHotspots.reduce(
          (sum, hotspot) => sum + hotspot.contextCount,
          0,
        ),
        pendingSamples: pendingHotspots
          .slice(0, 8)
          .map((hotspot) => `${hotspot.key} (${hotspot.contextCount})`),
      };
    },
    [curationHistoryKeySet],
  );

  const summarizeManualBatchState = React.useCallback(
    (
      nextConfig: ParticleConfig,
      nextPresets: Presets,
      nextPresetSequence: PresetSequence,
      historyKeySet: ReadonlySet<string> = curationHistoryKeySet,
    ) => {
      const impact = summarizeAudioLegacyRetirementImpact(
        nextConfig,
        nextPresets,
        nextPresetSequence,
      );
      let currentManualKeyCount = 0;
      let storedManualKeyCount = 0;
      let pendingCurrentManualKeyCount = 0;
      let pendingStoredManualKeyCount = 0;
      const pendingCurrentManualSamples: string[] = [];
      const pendingStoredManualSamples: string[] = [];
      impact.customConflictHotspots.forEach((hotspot) => {
        const detail = summarizeFocusedCustomConflict(
          nextConfig,
          nextConfig.audioRoutes,
          hotspot.key,
        );
        if (
          detail &&
          (detail.recommendation === "manual-custom-choice" ||
            detail.recommendation === "manual-residual-merge")
        ) {
          currentManualKeyCount += 1;
          if (!historyKeySet.has(hotspot.key)) {
            pendingCurrentManualKeyCount += 1;
            if (pendingCurrentManualSamples.length < 8) {
              pendingCurrentManualSamples.push(
                `${hotspot.key} (${detail.recommendation})`,
              );
            }
          }
        }
        const stored = summarizeStoredFocusedConflict(
          nextPresets,
          nextPresetSequence,
          hotspot.key,
        );
        if (stored.manualCustomChoiceCount + stored.manualResidualMergeCount > 0) {
          storedManualKeyCount += 1;
          if (!historyKeySet.has(hotspot.key)) {
            pendingStoredManualKeyCount += 1;
            if (pendingStoredManualSamples.length < 8) {
              pendingStoredManualSamples.push(
                `${hotspot.key} (${stored.dominantRecommendation})`,
              );
            }
          }
        }
      });
      return {
        currentManualKeyCount,
        storedManualKeyCount,
        pendingCurrentManualKeyCount,
        pendingStoredManualKeyCount,
        pendingCurrentManualSamples,
        pendingStoredManualSamples,
      };
    },
    [curationHistoryKeySet],
  );

  const recordCurationHistory = React.useCallback(
    (
      scope: "current" | "stored" | "everywhere",
      action: string,
      keys: string[],
      note?: string,
    ) => {
      if (keys.length === 0) return;
      appendCurationHistoryEntries(
        keys.map((key) =>
          createAudioCurationHistoryEntry({
            key,
            scope,
            action,
            note,
          }),
        ),
      );
    },
    [appendCurationHistoryEntries],
  );

  return {
    summarizeHotspotBatchState,
    summarizeManualBatchState,
    recordCurationHistory,
  };
}
