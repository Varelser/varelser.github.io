import type React from "react";
import type { AudioFocusedCustomConflictRouteDetail } from "../lib/audioReactiveValidation";
import type { AudioModulationRoute } from "../types/audioReactive";
import type { ControlPanelContentProps } from "./controlPanelTabsShared";

export type ConflictQueueEntry = { key: string };

export type FocusedConflictDetail = {
  key: string;
  recommendation: string;
  dominantRouteId?: string | null;
  routes: AudioFocusedCustomConflictRouteDetail[];
} | null;

export type ConflictRecommendationResult = {
  applied: boolean;
  routes: AudioModulationRoute[];
  label: string;
  reason: string;
};

export interface UseAudioLegacyConflictFocusedActionsArgs {
  configAudioRoutes: AudioModulationRoute[];
  updateConfig: ControlPanelContentProps["updateConfig"];
  presets: ControlPanelContentProps["presets"];
  setPresets: ControlPanelContentProps["setPresets"];
  presetSequence: ControlPanelContentProps["presetSequence"];
  setPresetSequence: ControlPanelContentProps["setPresetSequence"];
  isPublicLibrary: ControlPanelContentProps["isPublicLibrary"];
  focusedConflictKey: string | null;
  focusedCustomConflictDetail: FocusedConflictDetail;
  manualConflictQueue: ConflictQueueEntry[];
  storedManualConflictQueue: ConflictQueueEntry[];
  applyLegacyAutoFixes: (
    mode?:
      | "safe"
      | "append-missing"
      | "align-residuals"
      | "dedupe-exact"
      | "collapse-review"
      | "collapse-review-duplicates"
      | "remove-custom-shadow"
      | "collapse-custom-exact"
      | "mute-focused-conflict"
      | "remove-stale"
      | "run-safe-pass",
    onlyKey?: string,
    keepRouteId?: string,
  ) => void;
  applyStoredLegacyAutoFixes: (
    scope: "presets" | "keyframes" | "all",
    profile?:
      | "safe"
      | "append-missing"
      | "align-residuals"
      | "dedupe-exact"
      | "collapse-review"
      | "collapse-review-duplicates"
      | "remove-custom-shadow"
      | "collapse-custom-exact"
      | "mute-focused-conflict"
      | "remove-stale"
      | "run-safe-pass",
    onlyKey?: string,
    keepRouteId?: string,
  ) => void;
  applyConflictRecommendationForKey: (
    key: string,
    routes?: AudioModulationRoute[],
    overrideKeepRouteId?: string,
  ) => ConflictRecommendationResult;
  applyStoredHotspotRecommendationForKey: (key: string) => void;
  focusConflictKey: (key: string) => void;
  recordCurationHistory: (
    scope: "current" | "stored",
    mode: string,
    keys: string[],
    note?: string,
  ) => void;
  setLegacyAutoFixNotice: React.Dispatch<React.SetStateAction<string | null>>;
  setStoredLegacyAutoFixNotice: React.Dispatch<React.SetStateAction<string | null>>;
}

export function getNextConflict(queue: ConflictQueueEntry[], currentKey: string) {
  if (queue.length === 0) {
    return null;
  }
  const currentIndex = queue.findIndex((entry) => entry.key === currentKey);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % queue.length : 0;
  return { nextIndex, nextEntry: queue[nextIndex] };
}
