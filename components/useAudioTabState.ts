import React from "react";
import type { AudioModulationRoute } from "../types/audioReactive";
import type {
  AudioHotspotBatchSummary,
  AudioManualBatchSummary,
} from "./controlPanelTabsAudioLegacy";

export function useAudioTabState() {
  const [routeEditorOpen, setRouteEditorOpen] = React.useState(false);
  const [routeSystemFilter, setRouteSystemFilter] = React.useState("all");
  const [routeSourceFilter, setRouteSourceFilter] = React.useState<
    "all" | AudioModulationRoute["source"]
  >("all");
  const [routeStateFilter, setRouteStateFilter] = React.useState<
    "all" | "enabled" | "disabled"
  >("all");
  const [routeSearch, setRouteSearch] = React.useState("");
  const [routeTransferText, setRouteTransferText] = React.useState("");
  const [routeTransferNotice, setRouteTransferNotice] = React.useState<string | null>(null);
  const [routeTransferFileMode, setRouteTransferFileMode] = React.useState<
    "box" | "append" | "replace"
  >("box");
  const [routeTransferDragActive, setRouteTransferDragActive] = React.useState(false);
  const [legacyAutoFixNotice, setLegacyAutoFixNotice] = React.useState<string | null>(null);
  const [storedLegacyAutoFixNotice, setStoredLegacyAutoFixNotice] = React.useState<string | null>(null);
  const [lastHotspotBatchSummary, setLastHotspotBatchSummary] =
    React.useState<AudioHotspotBatchSummary | null>(null);
  const [lastManualBatchSummary, setLastManualBatchSummary] =
    React.useState<AudioManualBatchSummary | null>(null);
  const [focusedConflictKey, setFocusedConflictKey] = React.useState<string | null>(null);
  const [bulkNumericOffsets, setBulkNumericOffsets] = React.useState({
    amount: 0,
    bias: 0,
    clampMin: 0,
    clampMax: 0,
    smoothing: 0,
    attack: 0,
    release: 0,
  });
  const routeTransferFileInputRef = React.useRef<HTMLInputElement | null>(null);

  return {
    routeEditorOpen,
    setRouteEditorOpen,
    routeSystemFilter,
    setRouteSystemFilter,
    routeSourceFilter,
    setRouteSourceFilter,
    routeStateFilter,
    setRouteStateFilter,
    routeSearch,
    setRouteSearch,
    routeTransferText,
    setRouteTransferText,
    routeTransferNotice,
    setRouteTransferNotice,
    routeTransferFileMode,
    setRouteTransferFileMode,
    routeTransferDragActive,
    setRouteTransferDragActive,
    legacyAutoFixNotice,
    setLegacyAutoFixNotice,
    storedLegacyAutoFixNotice,
    setStoredLegacyAutoFixNotice,
    lastHotspotBatchSummary,
    setLastHotspotBatchSummary,
    lastManualBatchSummary,
    setLastManualBatchSummary,
    focusedConflictKey,
    setFocusedConflictKey,
    bulkNumericOffsets,
    setBulkNumericOffsets,
    routeTransferFileInputRef,
  };
}
