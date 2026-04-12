import React from "react";
import {
  appendAudioCurationHistory,
  createAudioCurationKeySet,
  shouldIncludeAudioCurationKey,
  summarizeAudioCurationHistory,
} from "../lib/audioReactiveCurationHistory";
import type {
  AudioCurationHistoryEntry,
  AudioCurationQueueFilterMode,
} from "../types/audioReactive";
import type { UpdateConfig } from "./controlPanelTabsShared";

interface UseAudioCurationHistoryArgs {
  audioCurationHistory: AudioCurationHistoryEntry[];
  curationQueueFilterMode: AudioCurationQueueFilterMode;
  updateConfig: UpdateConfig;
  setRouteTransferNotice: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useAudioCurationHistory({
  audioCurationHistory,
  curationQueueFilterMode,
  updateConfig,
  setRouteTransferNotice,
}: UseAudioCurationHistoryArgs) {
  const curationHistorySummary = React.useMemo(
    () => summarizeAudioCurationHistory(audioCurationHistory, 16),
    [audioCurationHistory],
  );

  const recentCurationKeySet = React.useMemo(
    () => new Set(curationHistorySummary.recentKeys),
    [curationHistorySummary],
  );

  const curationHistoryKeySet = React.useMemo(
    () => createAudioCurationKeySet(audioCurationHistory),
    [audioCurationHistory],
  );

  const shouldIncludeCurationQueueKey = React.useCallback(
    (key: string) =>
      shouldIncludeAudioCurationKey(
        key,
        curationHistoryKeySet,
        curationQueueFilterMode,
      ),
    [curationHistoryKeySet, curationQueueFilterMode],
  );

  const setCurationQueueFilterMode = React.useCallback(
    (mode: AudioCurationQueueFilterMode) => {
      updateConfig("audioCurationQueueFilterMode", mode);
    },
    [updateConfig],
  );

  const appendCurationHistoryEntries = React.useCallback(
    (entries: AudioCurationHistoryEntry[]) => {
      updateConfig(
        "audioCurationHistory",
        appendAudioCurationHistory(audioCurationHistory, entries),
      );
    },
    [audioCurationHistory, updateConfig],
  );

  const clearCurationHistory = React.useCallback(() => {
    updateConfig("audioCurationHistory", []);
    setRouteTransferNotice("Cleared audio curation history.");
  }, [setRouteTransferNotice, updateConfig]);

  const createCurationHistoryKeySetWith = React.useCallback(
    (keys: string[]) => {
      const next = new Set(curationHistoryKeySet);
      keys.forEach((key) => {
        if (key) next.add(key);
      });
      return next;
    },
    [curationHistoryKeySet],
  );

  const copyCurationHistory = React.useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setRouteTransferNotice("Clipboard is not available in this environment.");
      return;
    }
    const lines = curationHistorySummary.entries.map((entry) =>
      [
        entry.createdAt,
        entry.scope,
        entry.action,
        entry.key,
        entry.routeId ?? entry.routeSignature ?? "",
        entry.note ?? "",
      ].join("\t"),
    );
    await navigator.clipboard.writeText(lines.join("\n"));
    setRouteTransferNotice(`Copied ${lines.length} curation history rows to clipboard.`);
  }, [curationHistorySummary, setRouteTransferNotice]);

  return {
    curationHistorySummary,
    recentCurationKeySet,
    curationHistoryKeySet,
    curationQueueFilterMode,
    shouldIncludeCurationQueueKey,
    setCurationQueueFilterMode,
    appendCurationHistoryEntries,
    clearCurationHistory,
    createCurationHistoryKeySetWith,
    copyCurationHistory,
  };
}
