import React from "react";
import type { ParticleConfig, ProjectAudioLegacyCloseoutSummary } from "../types";
import type { ControlPanelContentProps } from "./controlPanelTabsShared";
import {
  AUDIO_CURATION_QUEUE_FILTER_MODES,
  AUDIO_LEGACY_SLIDER_VISIBILITY_MODES,
  type AudioCurationQueueFilterMode,
  type AudioLegacySliderVisibilityMode,
} from "../types/audioReactive";
import {
  summarizeFocusedCustomConflict,
  summarizeLegacyAudioRouteParity,
} from "../lib/audioReactiveValidation";
import { summarizeAudioLegacyRetirementImpact } from "../lib/audioReactiveRetirementImpact";
import { summarizeAudioCurationHistory } from "../lib/audioReactiveCurationHistory";
import type { AudioHotspotBatchSummary, AudioManualBatchSummary } from "./controlPanelTabsAudioLegacy";
import type { StoredManualQueuePreviewProfile } from "../lib/audioReactiveStoredManualQueuePreview";
import type { AudioLegacyCleanupState } from "../lib/audioLegacyCleanupState";

export type UpdateConfigFn = ControlPanelContentProps["updateConfig"];
export type LegacyRouteParity = ReturnType<typeof summarizeLegacyAudioRouteParity>;
export type LegacyRetirementImpact = ReturnType<typeof summarizeAudioLegacyRetirementImpact>;
export type CurationHistorySummary = ReturnType<typeof summarizeAudioCurationHistory>;
export type FocusedCustomConflictDetail = ReturnType<typeof summarizeFocusedCustomConflict>;
export type FocusedConflictRoute = NonNullable<NonNullable<FocusedCustomConflictDetail>>["routes"][number];
export type ManualConflictQueueEntry = { key: string; recommendation: string };
export type StoredManualConflictQueueEntry = { key: string; manualCount: number; presetContextCount: number; keyframeContextCount: number; manualCustomChoiceCount: number; manualResidualMergeCount: number };
export type ConflictHotspot = LegacyRetirementImpact["customConflictHotspots"][number];
export type LegacyCloseoutSummary = ProjectAudioLegacyCloseoutSummary;

export type AudioLegacyConflictPanelProps = {
  config: ParticleConfig;
  updateConfig: UpdateConfigFn;
  presets: ControlPanelContentProps["presets"];
  presetSequence: ControlPanelContentProps["presetSequence"];
  isPublicLibrary: boolean;
  activeRouteCount: number;
  documentedTargetCount: number;
  legacyRouteParity: LegacyRouteParity;
  legacyRetirementImpact: LegacyRetirementImpact;
  legacyCloseoutSummary: LegacyCloseoutSummary;
  cleanupState: AudioLegacyCleanupState;
  legacySliderVisibilityMode: AudioLegacySliderVisibilityMode;
  setLegacyVisibilityMode: (mode: AudioLegacySliderVisibilityMode) => void;
  applyLegacyAutoFixes: (profile: string, focusedKey?: string) => void;
  applyStoredLegacyAutoFixes: (scope: string, profile?: string, focusedKey?: string, keepRouteId?: string) => void;
  visibleLegacySliderCount: number;
  totalLegacySliderCount: number;
  hiddenSafeLegacySliderCount: number;
  legacyAutoFixNotice: string | null;
  storedLegacyAutoFixNotice: string | null;
  setLegacyAutoFixNotice: React.Dispatch<React.SetStateAction<string | null>>;
  filteredCustomConflictHotspots: ConflictHotspot[];
  historyFilteredHotspotCount: number;
  focusedConflictKey: string | null;
  curationQueueFilterMode: AudioCurationQueueFilterMode;
  setCurationQueueFilterMode: React.Dispatch<React.SetStateAction<AudioCurationQueueFilterMode>>;
  recentCurationKeyCount: number;
  copyCustomConflictHotspots: () => Promise<void> | void;
  copyFocusedRetirementSnapshot: () => Promise<void> | void;
  applyTopHotspotRecommendations: (limit: number) => void;
  applyStoredTopHotspotRecommendations: (limit: number) => void;
  applyEverywhereTopHotspotRecommendations: (limit: number) => void;
  copyLastHotspotBatchSummary: () => Promise<void> | void;
  copyRetirementImpactSummary: () => Promise<void> | void;
  copyLastManualBatchSummary: () => Promise<void> | void;
  lastHotspotBatchSummary: AudioHotspotBatchSummary | null;
  applyFocusedConflictRecommendation: () => void;
  applyStoredFocusedConflictRecommendation: () => void;
  muteFocusedConflictToDominant: () => void;
  muteStoredFocusedConflictToDominant: () => void;
  collapseFocusedExactCustomDuplicates: () => void;
  collapseStoredFocusedExactCustomDuplicates: () => void;
  copyFocusedConflictDetail: () => Promise<void> | void;
  clearFocusedConflictKey: () => void;
  manualConflictQueue: ManualConflictQueueEntry[];
  focusedManualConflictIndex: number;
  focusPreviousManualConflict: () => void;
  focusNextManualConflict: () => void;
  applyFocusedConflictRecommendationAndAdvance: () => void;
  applyTopManualQueueRecommendations: (limit: number) => void;
  applyStoredTopManualQueueRecommendations: (limit: number) => void;
  applyEverywhereTopManualQueueRecommendations: (limit: number) => void;
  storedManualConflictQueue: StoredManualConflictQueueEntry[];
  focusedStoredManualConflictIndex: number;
  focusPreviousStoredManualConflict: () => void;
  focusNextStoredManualConflict: () => void;
  applyStoredFocusedConflictRecommendationAndAdvance: () => void;
  applyStoredPreviewManualQueueRecommendations: (limit: number, profile?: StoredManualQueuePreviewProfile, scope?: "presets" | "keyframes" | "all") => void;
  lastManualBatchSummary: AudioManualBatchSummary | null;
  curationHistorySummary: CurationHistorySummary;
  copyCurationHistory: () => Promise<void> | void;
  clearCurationHistory: () => void;
  focusConflictKey: (key: string) => void;
  focusedCustomConflictDetail: FocusedCustomConflictDetail;
  keepFocusedConflictRoute: (routeId: string, advance?: boolean) => void;
  keepStoredFocusedConflictRoute: (route: FocusedConflictRoute, advance?: boolean) => void;
  applyConflictRecommendationForKey: (key: string) => { applied: boolean; routes: ParticleConfig["audioRoutes"]; label: string; reason?: string };
  applyStoredHotspotRecommendationForKey: (key: string) => void;
};

