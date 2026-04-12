import React from "react";
import type { ControlPanelContentProps } from "./controlPanelTabsShared";
import { AudioLegacyConflictPanel } from "./controlPanelTabsAudioLegacyConflict";
import { AudioLegacySlidersPanel } from "./controlPanelTabsAudioLegacySliders";
import { useAudioLegacyConflictManager } from "./useAudioLegacyConflictManager";
import type { AudioHotspotBatchSummary, AudioManualBatchSummary } from "./controlPanelTabsAudioLegacy";

interface AudioLegacySectionProps {
  config: ControlPanelContentProps["config"];
  updateConfig: ControlPanelContentProps["updateConfig"];
  presets: ControlPanelContentProps["presets"];
  setPresets: ControlPanelContentProps["setPresets"];
  presetSequence: ControlPanelContentProps["presetSequence"];
  setPresetSequence: ControlPanelContentProps["setPresetSequence"];
  isPublicLibrary: ControlPanelContentProps["isPublicLibrary"];
  focusedConflictKey: string | null;
  setFocusedConflictKey: React.Dispatch<React.SetStateAction<string | null>>;
  legacyAutoFixNotice: string | null;
  setLegacyAutoFixNotice: React.Dispatch<React.SetStateAction<string | null>>;
  storedLegacyAutoFixNotice: string | null;
  setStoredLegacyAutoFixNotice: React.Dispatch<React.SetStateAction<string | null>>;
  lastHotspotBatchSummary: AudioHotspotBatchSummary | null;
  setLastHotspotBatchSummary: React.Dispatch<React.SetStateAction<AudioHotspotBatchSummary | null>>;
  lastManualBatchSummary: AudioManualBatchSummary | null;
  setLastManualBatchSummary: React.Dispatch<React.SetStateAction<AudioManualBatchSummary | null>>;
  setRouteTransferNotice: React.Dispatch<React.SetStateAction<string | null>>;
  setRouteEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setRouteSearch: React.Dispatch<React.SetStateAction<string>>;
  curationHistorySummary: ReturnType<typeof import("../lib/audioReactiveCurationHistory").summarizeAudioCurationHistory>;
  recentCurationKeySet: Set<string>;
  curationHistoryKeySet: Set<string>;
  curationQueueFilterMode: string;
  setCurationQueueFilterMode: (value: any) => void;
  shouldIncludeCurationQueueKey: (key: string) => boolean;
  appendCurationHistoryEntries: (entries: any[]) => void;
  clearCurationHistory: () => void;
  createCurationHistoryKeySetWith: (keys: string[]) => Set<string>;
  copyCurationHistory: () => Promise<void>;
}

export function AudioLegacySection(props: AudioLegacySectionProps) {
  const {
    config, updateConfig, presets, setPresets, presetSequence, setPresetSequence, isPublicLibrary, focusedConflictKey,
    setFocusedConflictKey, legacyAutoFixNotice, setLegacyAutoFixNotice, storedLegacyAutoFixNotice, setStoredLegacyAutoFixNotice,
    lastHotspotBatchSummary, setLastHotspotBatchSummary, lastManualBatchSummary, setLastManualBatchSummary,
    setRouteTransferNotice, setRouteEditorOpen, setRouteSearch, curationHistorySummary, recentCurationKeySet,
    curationHistoryKeySet, curationQueueFilterMode, setCurationQueueFilterMode, shouldIncludeCurationQueueKey,
    appendCurationHistoryEntries, clearCurationHistory, createCurationHistoryKeySetWith, copyCurationHistory,
  } = props;

  const { panelProps: legacyConflictPanelProps, shouldRenderLegacySlider } = useAudioLegacyConflictManager({
    config, updateConfig, presets, setPresets, presetSequence, setPresetSequence, isPublicLibrary, focusedConflictKey,
    setFocusedConflictKey, legacyAutoFixNotice, setLegacyAutoFixNotice, storedLegacyAutoFixNotice, setStoredLegacyAutoFixNotice,
    lastHotspotBatchSummary, setLastHotspotBatchSummary, lastManualBatchSummary, setLastManualBatchSummary,
    setRouteTransferNotice, setRouteEditorOpen, setRouteSearch, curationHistorySummary, recentCurationKeySet, curationHistoryKeySet,
    curationQueueFilterMode: curationQueueFilterMode as any, setCurationQueueFilterMode, shouldIncludeCurationQueueKey,
    appendCurationHistoryEntries, clearCurationHistory, createCurationHistoryKeySetWith, copyCurationHistory,
  });

  return (
    <>
      <AudioLegacyConflictPanel {...legacyConflictPanelProps} />
      <AudioLegacySlidersPanel config={config} updateConfig={updateConfig} shouldRenderLegacySlider={shouldRenderLegacySlider} />
    </>
  );
}
