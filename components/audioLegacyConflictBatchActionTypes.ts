import type React from "react";
import type { ParticleConfig } from "../types";
import type { AudioModulationRoute } from "../types/audioReactive";
import type { AudioHotspotBatchSummary, AudioManualBatchSummary } from "./controlPanelTabsAudioLegacy";
import type { ControlPanelContentProps } from "./controlPanelTabsShared";

export type Presets = ControlPanelContentProps["presets"];
export type PresetSequence = ControlPanelContentProps["presetSequence"];
export type UpdateConfig = ControlPanelContentProps["updateConfig"];
export type QueueEntry = { key: string };
export type HotspotEntry = { key: string };

export type HotspotBatchStateSummary = {
  hotspotCount: number;
  contextCount: number;
  pendingHotspotCount: number;
  pendingContextCount: number;
  pendingSamples: string[];
};

export type ManualBatchStateSummary = {
  currentManualKeyCount: number;
  storedManualKeyCount: number;
  pendingCurrentManualKeyCount: number;
  pendingStoredManualKeyCount: number;
  pendingCurrentManualSamples: string[];
  pendingStoredManualSamples: string[];
};

export type ApplyConflictRecommendationResult = {
  applied: boolean;
  routes: AudioModulationRoute[];
  label: string;
  reason: string;
};

export interface UseAudioLegacyConflictBatchActionsArgs {
  config: ParticleConfig;
  updateConfig: UpdateConfig;
  presets: Presets;
  setPresets: React.Dispatch<React.SetStateAction<Presets>>;
  presetSequence: PresetSequence;
  setPresetSequence: React.Dispatch<React.SetStateAction<PresetSequence>>;
  isPublicLibrary: boolean;
  filteredCustomConflictHotspots: HotspotEntry[];
  manualConflictQueue: QueueEntry[];
  storedManualConflictQueue: QueueEntry[];
  combinedManualConflictQueue: QueueEntry[];
  summarizeHotspotBatchState: (
    nextConfig: ParticleConfig,
    nextPresets: Presets,
    nextPresetSequence: PresetSequence,
    historyKeySet?: ReadonlySet<string>,
  ) => HotspotBatchStateSummary;
  summarizeManualBatchState: (
    nextConfig: ParticleConfig,
    nextPresets: Presets,
    nextPresetSequence: PresetSequence,
    historyKeySet?: ReadonlySet<string>,
  ) => ManualBatchStateSummary;
  recordCurationHistory: (
    scope: "current" | "stored" | "everywhere",
    action: string,
    keys: string[],
    note?: string,
  ) => void;
  createCurationHistoryKeySetWith: (keys: string[]) => ReadonlySet<string>;
  applyConflictRecommendationForKey: (
    key: string,
    routes?: AudioModulationRoute[],
    overrideKeepRouteId?: string,
  ) => ApplyConflictRecommendationResult;
  setLegacyAutoFixNotice: React.Dispatch<React.SetStateAction<string | null>>;
  setStoredLegacyAutoFixNotice: React.Dispatch<React.SetStateAction<string | null>>;
  setLastHotspotBatchSummary: React.Dispatch<React.SetStateAction<AudioHotspotBatchSummary | null>>;
  setLastManualBatchSummary: React.Dispatch<React.SetStateAction<AudioManualBatchSummary | null>>;
}
