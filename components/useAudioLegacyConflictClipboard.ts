import React from "react";
import {
  type AudioHotspotBatchSummary,
  type AudioManualBatchSummary,
} from "./controlPanelTabsAudioLegacy";
import { summarizeFocusedCustomConflict } from "../lib/audioReactiveValidation";
import {
  formatAudioLegacyFocusedRetirementSnapshot,
  formatAudioLegacyRetirementImpactSummary,
} from "../lib/audioReactiveRetirementImpactReport";
import type { AudioLegacyRetirementImpactSummary } from "../lib/audioReactiveRetirementImpact";
import { formatAudioManualBatchSummary } from "../lib/audioReactiveManualBatchSummaryReport";

type RetirementImpactHotspot = AudioLegacyRetirementImpactSummary["customConflictHotspots"][number];

interface UseAudioLegacyConflictClipboardArgs {
  filteredCustomConflictHotspots: RetirementImpactHotspot[];
  focusedCustomConflictDetail: ReturnType<typeof summarizeFocusedCustomConflict>;
  legacyRetirementImpact: AudioLegacyRetirementImpactSummary;
  lastHotspotBatchSummary: AudioHotspotBatchSummary | null;
  lastManualBatchSummary: AudioManualBatchSummary | null;
  setRouteTransferNotice: React.Dispatch<React.SetStateAction<string | null>>;
}

async function copyText(payload: string, onSuccess: string, onUnavailable: string, onFailure: string, setRouteTransferNotice: React.Dispatch<React.SetStateAction<string | null>>) {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    setRouteTransferNotice(onUnavailable);
    return;
  }
  try {
    await navigator.clipboard.writeText(payload);
    setRouteTransferNotice(onSuccess);
  } catch {
    setRouteTransferNotice(onFailure);
  }
}

export function useAudioLegacyConflictClipboard({
  filteredCustomConflictHotspots,
  focusedCustomConflictDetail,
  legacyRetirementImpact,
  lastHotspotBatchSummary,
  lastManualBatchSummary,
  setRouteTransferNotice,
}: UseAudioLegacyConflictClipboardArgs) {
  const copyLastHotspotBatchSummary = React.useCallback(async () => {
    if (!lastHotspotBatchSummary) {
      setRouteTransferNotice("No hotspot batch summary to copy.");
      return;
    }
    const payload = [
      `scope=${lastHotspotBatchSummary.scope}`,
      `limit=${lastHotspotBatchSummary.limit}`,
      `hotspots=${lastHotspotBatchSummary.beforeHotspotCount}->${lastHotspotBatchSummary.afterHotspotCount}`,
      `pendingHotspots=${lastHotspotBatchSummary.beforePendingHotspotCount}->${lastHotspotBatchSummary.afterPendingHotspotCount}`,
      `contexts=${lastHotspotBatchSummary.beforeContextCount}->${lastHotspotBatchSummary.afterContextCount}`,
      `pendingContexts=${lastHotspotBatchSummary.beforePendingContextCount}->${lastHotspotBatchSummary.afterPendingContextCount}`,
      `pendingSamplesBefore=${lastHotspotBatchSummary.beforePendingSamples.join(" | ") || "none"}`,
      `pendingSamplesAfter=${lastHotspotBatchSummary.afterPendingSamples.join(" | ") || "none"}`,
      `currentApplied=${lastHotspotBatchSummary.currentAppliedCount}`,
      `storedApplied=${lastHotspotBatchSummary.storedAppliedCount}`,
      `storedPresetUpdated=${lastHotspotBatchSummary.storedPresetUpdatedCount}`,
      `storedKeyframeUpdated=${lastHotspotBatchSummary.storedKeyframeUpdatedCount}`,
      `currentSamples=${lastHotspotBatchSummary.currentSamples.join(" | ") || "none"}`,
      `storedSamples=${lastHotspotBatchSummary.storedSamples.join(" | ") || "none"}`,
      `createdAt=${lastHotspotBatchSummary.createdAt}`,
    ].join("\n");
    await copyText(payload, "Copied last hotspot batch summary to clipboard.", "Clipboard API unavailable. Hotspot batch summary was not copied.", "Clipboard write failed for hotspot batch summary.", setRouteTransferNotice);
  }, [lastHotspotBatchSummary, setRouteTransferNotice]);

  const copyLastManualBatchSummary = React.useCallback(async () => {
    if (!lastManualBatchSummary) {
      setRouteTransferNotice("No manual batch summary to copy.");
      return;
    }
    const payload = formatAudioManualBatchSummary(lastManualBatchSummary);
    await copyText(payload, "Copied last manual batch summary to clipboard.", "Clipboard API unavailable. Manual batch summary was not copied.", "Clipboard write failed for manual batch summary.", setRouteTransferNotice);
  }, [lastManualBatchSummary, setRouteTransferNotice]);


  const copyRetirementImpactSummary = React.useCallback(async () => {
    const payload = formatAudioLegacyRetirementImpactSummary(legacyRetirementImpact);
    await copyText(payload, "Copied retirement impact summary to clipboard.", "Clipboard API unavailable. Retirement impact summary was not copied.", "Clipboard write failed for retirement impact summary.", setRouteTransferNotice);
  }, [legacyRetirementImpact, setRouteTransferNotice]);

  const copyFocusedRetirementSnapshot = React.useCallback(async () => {
    const payload = formatAudioLegacyFocusedRetirementSnapshot({
      legacyRetirementImpact,
      focusedCustomConflictDetail,
      filteredCustomConflictHotspots,
    });
    await copyText(payload, "Copied focused retirement snapshot to clipboard.", "Clipboard API unavailable. Focused retirement snapshot was not copied.", "Clipboard write failed for focused retirement snapshot.", setRouteTransferNotice);
  }, [filteredCustomConflictHotspots, focusedCustomConflictDetail, legacyRetirementImpact, setRouteTransferNotice]);

  const copyCustomConflictHotspots = React.useCallback(async () => {
    const lines = filteredCustomConflictHotspots.map(
      (hotspot, index) =>
        `#${index + 1} ${hotspot.highestKind} / ${hotspot.key} / contexts ${hotspot.contextCount} / current ${hotspot.currentConfig ? "yes" : "no"} / presets ${hotspot.presetCount} / sequence presets ${hotspot.sequenceLinkedPresetCount} / keyframes ${hotspot.keyframeCount} / samples ${hotspot.sampleContexts.join(" | ")}`,
    );
    if (lines.length === 0) {
      setRouteTransferNotice("No custom conflict hotspots to copy.");
      return;
    }
    await copyText(lines.join("\n"), `Copied ${lines.length} visible custom conflict hotspots to clipboard.`, "Clipboard API unavailable. Custom conflict hotspot report was not copied.", "Clipboard write failed for custom conflict hotspot report.", setRouteTransferNotice);
  }, [filteredCustomConflictHotspots, setRouteTransferNotice]);

  const copyFocusedConflictDetail = React.useCallback(async () => {
    if (!focusedCustomConflictDetail) {
      setRouteTransferNotice("No focused conflict detail to copy.");
      return;
    }
    const lines = [
      `key: ${focusedCustomConflictDetail.key}`,
      `legacyId: ${focusedCustomConflictDetail.legacyId ?? "none"}`,
      `dominant: ${focusedCustomConflictDetail.dominantRouteId ?? "none"} (${focusedCustomConflictDetail.dominantOwner ?? "n/a"})`,
      `recommendation: ${focusedCustomConflictDetail.recommendation}`,
      `reason: ${focusedCustomConflictDetail.recommendationReason}`,
      `counts: custom ${focusedCustomConflictDetail.customRouteCount} / legacy ${focusedCustomConflictDetail.legacyRouteCount} / exact custom ${focusedCustomConflictDetail.exactCustomCount} / exact legacy ${focusedCustomConflictDetail.exactLegacyCount}`,
      `spread: amount ${focusedCustomConflictDetail.amountSpread} / bias ${focusedCustomConflictDetail.biasSpread} / timing ${focusedCustomConflictDetail.timingSpread}`,
      "routes:",
      ...focusedCustomConflictDetail.routes.map(
        (route, index) =>
          `#${index + 1} ${route.owner} / ${route.id} / enabled ${route.enabled ? "yes" : "no"} / score ${route.score} / Δ amount ${route.amountDelta} / Δ bias ${route.biasDelta} / Δ timing ${route.timingDelta} / amount ${route.amount} / bias ${route.bias} / mode ${route.mode} / curve ${route.curve} / notes ${route.notes || "-"}`,
      ),
    ];
    await copyText(lines.join("\n"), `Copied focused conflict detail for ${focusedCustomConflictDetail.key}.`, "Clipboard API unavailable. Focused conflict detail was not copied.", "Clipboard write failed for focused conflict detail.", setRouteTransferNotice);
  }, [focusedCustomConflictDetail, setRouteTransferNotice]);

  return {
    copyCustomConflictHotspots,
    copyFocusedConflictDetail,
    copyFocusedRetirementSnapshot,
    copyLastHotspotBatchSummary,
    copyLastManualBatchSummary,
    copyRetirementImpactSummary,
  };
}
