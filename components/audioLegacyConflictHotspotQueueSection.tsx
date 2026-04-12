import React from "react";
import { AUDIO_CURATION_QUEUE_FILTER_MODES } from "../types/audioReactive";
import {
  executeStoredManualQueuePreview,
  formatStoredManualQueuePreview,
  type StoredManualQueuePreviewProfile,
} from "../lib/audioReactiveStoredManualQueuePreview";
import type { AudioLegacyConflictPanelProps } from "./audioLegacyConflictPanelTypes";

const STORED_QUEUE_PREVIEW_PROFILES: StoredManualQueuePreviewProfile[] = [
  "align-residuals",
  "safe",
  "collapse-review",
  "remove-custom-shadow",
  "collapse-custom-exact",
];

function getStoredQueuePreviewProfileLabel(profile: StoredManualQueuePreviewProfile) {
  switch (profile) {
    case "collapse-review":
      return "review-collapse";
    case "remove-custom-shadow":
      return "remove-shadow";
    case "collapse-custom-exact":
      return "collapse-custom";
    case "align-residuals":
      return "align-residuals";
    default:
      return "safe-pass";
  }
}
function combinedLimitBlocked(currentCount: number, storedCount: number) {
  return currentCount + storedCount === 0;
}

export function AudioLegacyConflictHotspotQueueSection({
  legacyRetirementImpact,
  presets,
  presetSequence,
  filteredCustomConflictHotspots,
  historyFilteredHotspotCount,
  focusedConflictKey,
  curationQueueFilterMode,
  setCurationQueueFilterMode,
  recentCurationKeyCount,
  copyCustomConflictHotspots,
  applyTopHotspotRecommendations,
  applyStoredTopHotspotRecommendations,
  applyEverywhereTopHotspotRecommendations,
  copyLastHotspotBatchSummary,
  copyLastManualBatchSummary,
  lastHotspotBatchSummary,
  applyFocusedConflictRecommendation,
  applyStoredFocusedConflictRecommendation,
  muteFocusedConflictToDominant,
  muteStoredFocusedConflictToDominant,
  collapseFocusedExactCustomDuplicates,
  collapseStoredFocusedExactCustomDuplicates,
  copyFocusedConflictDetail,
  clearFocusedConflictKey,
  manualConflictQueue,
  focusedManualConflictIndex,
  focusPreviousManualConflict,
  focusNextManualConflict,
  applyFocusedConflictRecommendationAndAdvance,
  applyTopManualQueueRecommendations,
  applyStoredTopManualQueueRecommendations,
  applyEverywhereTopManualQueueRecommendations,
  storedManualConflictQueue,
  focusedStoredManualConflictIndex,
  focusPreviousStoredManualConflict,
  focusNextStoredManualConflict,
  applyStoredFocusedConflictRecommendationAndAdvance,
  applyStoredPreviewManualQueueRecommendations,
  lastManualBatchSummary,
  focusedCustomConflictDetail,
  applyLegacyAutoFixes,
  applyStoredLegacyAutoFixes,
  isPublicLibrary,
  cleanupState,
}: AudioLegacyConflictPanelProps) {
  const [storedQueuePreviewLimit, setStoredQueuePreviewLimit] = React.useState<3 | 8 | -1>(3);
  const [storedQueuePreviewScope, setStoredQueuePreviewScope] = React.useState<"presets" | "keyframes" | "all">("all");
  const [storedQueuePreviewProfile, setStoredQueuePreviewProfile] = React.useState<StoredManualQueuePreviewProfile>("align-residuals");

  const storedQueuePreviewKeys = React.useMemo(() => (
    storedQueuePreviewLimit === -1
      ? storedManualConflictQueue.map((entry) => entry.key)
      : storedManualConflictQueue.slice(0, storedQueuePreviewLimit).map((entry) => entry.key)
  ), [storedManualConflictQueue, storedQueuePreviewLimit]);

  const storedQueuePreview = React.useMemo(() => executeStoredManualQueuePreview(
    presets,
    presetSequence,
    storedQueuePreviewKeys,
    {
      limit: storedQueuePreviewKeys.length,
      scope: storedQueuePreviewScope,
      profile: storedQueuePreviewProfile,
    },
  ), [presets, presetSequence, storedQueuePreviewKeys, storedQueuePreviewProfile, storedQueuePreviewScope]);

  const copyStoredQueuePreview = React.useCallback(async () => {
    if (!storedQueuePreview) return;
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("clipboard unavailable");
      }
      await navigator.clipboard.writeText(formatStoredManualQueuePreview(storedQueuePreview));
    } catch {
      // ignore; panel notice is handled by higher-level actions only
    }
  }, [storedQueuePreview]);

  const applyStoredQueuePreview = React.useCallback(() => {
    if (storedQueuePreviewKeys.length === 0) return;
    applyStoredPreviewManualQueueRecommendations(
      storedQueuePreviewLimit === -1 ? storedQueuePreviewKeys.length : storedQueuePreviewLimit,
      storedQueuePreviewProfile,
      storedQueuePreviewScope,
    );
  }, [applyStoredPreviewManualQueueRecommendations, storedQueuePreviewKeys.length, storedQueuePreviewLimit, storedQueuePreviewProfile, storedQueuePreviewScope]);

  return (
    <div className="mt-3 rounded border border-white/10 bg-black/10 px-2 py-2 text-panel-sm uppercase tracking-widest text-white/60">
      <div className="mb-1 text-white/45">Retirement Impact / Presets + Sequence</div>
      <div>
        Current Review {legacyRetirementImpact.currentConfig.reviewBeforeDeprecateCount} / Current Blocked {legacyRetirementImpact.currentConfig.blockedDeprecationCount} /
        Current Residual {legacyRetirementImpact.currentConfig.residualCount}
      </div>
      <div className="mt-1 text-white/40">
        Presets {legacyRetirementImpact.presets.total} / Review Impact {legacyRetirementImpact.presets.affectedReviewCount} / Blocked Impact {legacyRetirementImpact.presets.affectedBlockedCount}
      </div>
      <div className="mt-1 text-white/40">
        Sequence Items {legacyRetirementImpact.sequence.totalItems} / Linked Preset Review {legacyRetirementImpact.sequence.linkedPresetReviewCount} / Linked Preset Blocked {legacyRetirementImpact.sequence.linkedPresetBlockedCount}
      </div>
      <div className="mt-1 text-white/40">
        Keyframes {legacyRetirementImpact.sequence.keyframeCount} / Keyframe Review {legacyRetirementImpact.sequence.keyframeReviewCount} / Keyframe Blocked {legacyRetirementImpact.sequence.keyframeBlockedCount}
      </div>
      <div className="mt-1 text-white/35">
        Use stored auto-fix only after current config safe pass. This migrates saved presets and custom sequence keyframes without deleting legacy sliders.
      </div>
      {legacyRetirementImpact.presets.sampleReview.length > 0 && (
        <div className="mt-1 text-white/35">Preset review sample: {legacyRetirementImpact.presets.sampleReview.join(" / ")}</div>
      )}
      {legacyRetirementImpact.presets.sampleBlocked.length > 0 && (
        <div className="mt-1 text-white/35">Preset blocked sample: {legacyRetirementImpact.presets.sampleBlocked.join(" / ")}</div>
      )}
      {legacyRetirementImpact.sequence.sampleLinkedPresetReview.length > 0 && (
        <div className="mt-1 text-white/35">Sequence linked preset review: {legacyRetirementImpact.sequence.sampleLinkedPresetReview.join(" / ")}</div>
      )}
      {legacyRetirementImpact.sequence.sampleLinkedPresetBlocked.length > 0 && (
        <div className="mt-1 text-white/35">Sequence linked preset blocked: {legacyRetirementImpact.sequence.sampleLinkedPresetBlocked.join(" / ")}</div>
      )}
      {legacyRetirementImpact.sequence.sampleKeyframeReview.length > 0 && (
        <div className="mt-1 text-white/35">Keyframe review sample: {legacyRetirementImpact.sequence.sampleKeyframeReview.join(" / ")}</div>
      )}
      {legacyRetirementImpact.sequence.sampleKeyframeBlocked.length > 0 && (
        <div className="mt-1 text-white/35">Keyframe blocked sample: {legacyRetirementImpact.sequence.sampleKeyframeBlocked.join(" / ")}</div>
      )}
      {legacyRetirementImpact.highestRiskCandidates.length > 0 && (
        <div className="mt-2 space-y-1 text-white/35">
          {legacyRetirementImpact.highestRiskCandidates.map((candidate, index) => (
            <div key={`${candidate.legacyId}:${candidate.key}:impact`}>
              #{index + 1} {candidate.status.toUpperCase()} / {candidate.key} / contexts {candidate.contextCount} / current {candidate.currentConfig ? "yes" : "no"} /
              presets {candidate.presetCount} / sequence presets {candidate.sequenceLinkedPresetCount} / keyframes {candidate.keyframeCount}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 border-t border-white/10 pt-2 text-white/35">
        <div className={`mb-2 rounded border px-2 py-2 ${cleanupState.cleanupReady ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-100/80" : "border-white/10 bg-black/10 text-white/45"}`}><div className="text-white/60">Queue Cleanup</div><div className="mt-1">Hotspots {cleanupState.hotspotCount} / current manual {cleanupState.manualConflictCount} / stored manual {cleanupState.storedManualConflictCount}</div>{cleanupState.cleanupReady ? <div className="mt-1">Cleanup ready. Preview and manual queue sections auto-collapse when no tracked conflicts remain.</div> : <div className="mt-1">Auto-clear focus {cleanupState.shouldAutoClearFocusedConflict ? "pending" : "idle"} / auto-dismiss hotspot {cleanupState.shouldAutoDismissLastHotspotBatch ? "ready" : "idle"} / auto-dismiss manual {cleanupState.shouldAutoDismissLastManualBatch ? "ready" : "idle"}</div>}</div>
        <div className="mb-1 text-white/45">Custom Conflict Hotspots</div>
        <div>
          Hotspots {filteredCustomConflictHotspots.length}
          {historyFilteredHotspotCount > 0 ? ` / hidden by history ${historyFilteredHotspotCount}` : ""} / current focus {focusedConflictKey ?? "none"}
        </div>
        <div className="mt-1 text-white/35">Queue filter / {curationQueueFilterMode} / recent seen {recentCurationKeyCount}</div>
        <div className="mt-1 flex flex-wrap gap-2">
          {AUDIO_CURATION_QUEUE_FILTER_MODES.map((mode) => (
            <button
              key={`queue-filter:${mode}`}
              onClick={() => setCurationQueueFilterMode(mode)}
              className={`rounded border px-2 py-1 ${
                curationQueueFilterMode === mode
                  ? "border-amber-400/30 bg-amber-500/10 text-white/85"
                  : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <div className="mt-1 flex flex-wrap gap-2">
          <button onClick={copyCustomConflictHotspots} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/60 hover:bg-white/10">Copy Conflict Report</button>
          <button onClick={() => applyTopHotspotRecommendations(3)} className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20">Apply Top 3 Recommendations</button>
          <button onClick={() => applyTopHotspotRecommendations(8)} className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20">Apply Top 8 Recommendations</button>
          <button onClick={() => applyStoredTopHotspotRecommendations(3)} disabled={isPublicLibrary} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Stored Top 3</button>
          <button onClick={() => applyStoredTopHotspotRecommendations(8)} disabled={isPublicLibrary} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Stored Top 8</button>
          <button onClick={() => applyEverywhereTopHotspotRecommendations(3)} disabled={isPublicLibrary} className="rounded border border-violet-400/25 bg-violet-500/10 px-2 py-1 text-white/70 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Top 3 Everywhere</button>
          <button onClick={() => applyEverywhereTopHotspotRecommendations(8)} disabled={isPublicLibrary} className="rounded border border-violet-400/25 bg-violet-500/10 px-2 py-1 text-white/70 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Top 8 Everywhere</button>
          <button onClick={copyLastHotspotBatchSummary} disabled={!lastHotspotBatchSummary} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">Copy Last Batch Summary</button>
          {focusedConflictKey && (
            <>
              <button onClick={applyFocusedConflictRecommendation} className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20">Apply Focused Recommendation</button>
              <button onClick={applyStoredFocusedConflictRecommendation} disabled={isPublicLibrary} className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Stored Recommendation</button>
              <button onClick={muteFocusedConflictToDominant} className="rounded border border-orange-400/25 bg-orange-500/10 px-2 py-1 text-white/70 hover:bg-orange-500/20">Mute Non-Dominant Focused Routes</button>
              <button onClick={() => applyLegacyAutoFixes("align-residuals", focusedConflictKey ?? undefined)} disabled={!focusedConflictKey} className="rounded border border-sky-400/25 bg-sky-500/10 px-2 py-1 text-white/70 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40">Align Focused Residual to Legacy</button>
              <button onClick={() => focusedConflictKey && applyStoredLegacyAutoFixes("all", "align-residuals", focusedConflictKey)} disabled={isPublicLibrary || !focusedConflictKey} className="rounded border border-sky-400/25 bg-sky-500/10 px-2 py-1 text-white/70 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40">Align Stored Focused Residual</button>
              <button onClick={muteStoredFocusedConflictToDominant} disabled={isPublicLibrary} className="rounded border border-orange-400/25 bg-orange-500/10 px-2 py-1 text-white/70 hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40">Mute Stored Non-Dominant</button>
              <button onClick={collapseFocusedExactCustomDuplicates} className="rounded border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-1 text-white/70 hover:bg-fuchsia-500/20">Collapse Focused Exact Custom Duplicates</button>
              <button onClick={collapseStoredFocusedExactCustomDuplicates} disabled={isPublicLibrary} className="rounded border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-1 text-white/70 hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-40">Collapse Stored Focused Exact Custom Duplicates</button>
              <button onClick={copyFocusedConflictDetail} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20">Copy Focused Conflict Detail</button>
              <button onClick={clearFocusedConflictKey} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/60 hover:bg-white/10">Clear Focus</button>
            </>
          )}
        </div>

        {lastHotspotBatchSummary && (
          <div className="mt-2 rounded border border-violet-400/15 bg-violet-500/5 px-2 py-2 text-white/40">
            <div className="text-white/55">Last Hotspot Batch / {lastHotspotBatchSummary.scope} / top {lastHotspotBatchSummary.limit}</div>
            <div className="mt-1 text-white/35">Hotspots {lastHotspotBatchSummary.beforeHotspotCount} -&gt; {lastHotspotBatchSummary.afterHotspotCount} / contexts {lastHotspotBatchSummary.beforeContextCount} -&gt; {lastHotspotBatchSummary.afterContextCount}</div>
            <div className="mt-1 text-white/35">Pending hotspots {lastHotspotBatchSummary.beforePendingHotspotCount} -&gt; {lastHotspotBatchSummary.afterPendingHotspotCount} / pending contexts {lastHotspotBatchSummary.beforePendingContextCount} -&gt; {lastHotspotBatchSummary.afterPendingContextCount}</div>
            <div className="mt-1 text-white/35">Current applied {lastHotspotBatchSummary.currentAppliedCount} / stored applied {lastHotspotBatchSummary.storedAppliedCount} / preset updates {lastHotspotBatchSummary.storedPresetUpdatedCount} / keyframe updates {lastHotspotBatchSummary.storedKeyframeUpdatedCount}</div>
            <div className="mt-1 text-white/30">Current samples: {lastHotspotBatchSummary.currentSamples.join(" / ") || "none"}</div>
            <div className="mt-1 text-white/30">Stored samples: {lastHotspotBatchSummary.storedSamples.join(" / ") || "none"}</div>
          </div>
        )}

{manualConflictQueue.length > 0 || lastManualBatchSummary?.scope !== "stored" ? (
        <div className="mt-2 rounded border border-amber-400/15 bg-amber-500/5 px-2 py-2 text-white/40">
          <div className="text-white/55">Manual Residual Queue / total {manualConflictQueue.length} / focused {focusedManualConflictIndex >= 0 ? `${focusedManualConflictIndex + 1}/${manualConflictQueue.length}` : "none"}</div>
          <div className="mt-1 text-white/35">
            manual-custom-choice {manualConflictQueue.filter((entry) => entry.recommendation === "manual-custom-choice").length} / manual-residual-merge {manualConflictQueue.filter((entry) => entry.recommendation === "manual-residual-merge").length}
          </div>
          {manualConflictQueue.length > 0 && (
            <div className="mt-1 text-white/35">Head / {manualConflictQueue.slice(0, 3).map((entry) => `${entry.key} [${entry.recommendation}]`).join(" / ")}</div>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-white/45">
            <button onClick={focusPreviousManualConflict} disabled={manualConflictQueue.length === 0} className="rounded border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-white/70 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40">Focus Previous Manual</button>
            <button onClick={focusNextManualConflict} disabled={manualConflictQueue.length === 0} className="rounded border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-white/70 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40">Focus Next Manual</button>
            <button onClick={applyFocusedConflictRecommendationAndAdvance} disabled={!focusedCustomConflictDetail} className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Focused + Next</button>
            <button onClick={() => applyTopManualQueueRecommendations(3)} disabled={manualConflictQueue.length === 0} className="rounded border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-white/70 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Top 3 Manual</button>
            <button onClick={() => applyTopManualQueueRecommendations(8)} disabled={manualConflictQueue.length === 0} className="rounded border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-white/70 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Top 8 Manual</button>
            <button onClick={() => applyStoredTopManualQueueRecommendations(3)} disabled={isPublicLibrary || storedManualConflictQueue.length === 0} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Stored Top 3 Manual</button>
            <button onClick={() => applyStoredTopManualQueueRecommendations(8)} disabled={isPublicLibrary || storedManualConflictQueue.length === 0} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Stored Top 8 Manual</button>
            <button onClick={() => applyEverywhereTopManualQueueRecommendations(3)} disabled={isPublicLibrary || combinedLimitBlocked(manualConflictQueue.length, storedManualConflictQueue.length)} className="rounded border border-violet-400/25 bg-violet-500/10 px-2 py-1 text-white/70 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Top 3 Manual Everywhere</button>
            <button onClick={() => applyEverywhereTopManualQueueRecommendations(8)} disabled={isPublicLibrary || combinedLimitBlocked(manualConflictQueue.length, storedManualConflictQueue.length)} className="rounded border border-violet-400/25 bg-violet-500/10 px-2 py-1 text-white/70 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Top 8 Manual Everywhere</button>
          </div>
        </div>
        ) : (
          <div className="mt-2 rounded border border-amber-400/15 bg-amber-500/5 px-2 py-2 text-white/35">Current manual queue resolved. Controls are hidden until a new current manual conflict appears.</div>
        )}

        {storedManualConflictQueue.length > 0 || Boolean(lastManualBatchSummary?.previewProfile) ? (
        <div className="mt-2 rounded border border-fuchsia-400/15 bg-fuchsia-500/5 px-2 py-2 text-white/40">
          <div className="text-white/55">Stored Manual Residual Queue / total {storedManualConflictQueue.length} / focused {focusedStoredManualConflictIndex >= 0 ? `${focusedStoredManualConflictIndex + 1}/${storedManualConflictQueue.length}` : "none"}</div>
          <div className="mt-1 text-white/35">
            manual-custom-choice {storedManualConflictQueue.reduce((sum, entry) => sum + entry.manualCustomChoiceCount, 0)} / manual-residual-merge {storedManualConflictQueue.reduce((sum, entry) => sum + entry.manualResidualMergeCount, 0)}
          </div>
          {storedManualConflictQueue.length > 0 && (
            <div className="mt-1 text-white/35">Head / {storedManualConflictQueue.slice(0, 3).map((entry) => `${entry.key} [m${entry.manualCount} / p${entry.presetContextCount} / k${entry.keyframeContextCount}]`).join(" / ")}</div>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-white/45">
            <button onClick={focusPreviousStoredManualConflict} disabled={storedManualConflictQueue.length === 0} className="rounded border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-1 text-white/70 hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-40">Focus Previous Stored Manual</button>
            <button onClick={focusNextStoredManualConflict} disabled={storedManualConflictQueue.length === 0} className="rounded border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-1 text-white/70 hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-40">Focus Next Stored Manual</button>
            <button onClick={applyStoredFocusedConflictRecommendationAndAdvance} disabled={!focusedConflictKey || storedManualConflictQueue.length === 0} className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Stored Focused + Next</button>
          </div>

          {storedManualConflictQueue.length > 0 ? (
          <div className="mt-3 rounded border border-fuchsia-400/15 bg-black/10 px-2 py-2 text-white/35">
            <div className="text-white/55">Stored Queue Preview Batch / staged</div>
            <div className="mt-1 text-white/35">Preview scope {storedQueuePreview.scope} / profile {storedQueuePreview.profile} / limit {storedQueuePreviewLimit === -1 ? "all" : storedQueuePreviewLimit} / keys {storedQueuePreview.keys.length}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[3, 8, -1].map((limit) => (
                <button
                  key={`stored-queue-limit:${limit}`}
                  onClick={() => setStoredQueuePreviewLimit(limit as 3 | 8 | -1)}
                  className={`rounded border px-2 py-1 ${storedQueuePreviewLimit === limit ? "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100/90" : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"}`}
                >
                  {limit === -1 ? "all" : `top-${limit}`}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["all", "presets", "keyframes"].map((scope) => (
                <button
                  key={`stored-queue-scope:${scope}`}
                  onClick={() => setStoredQueuePreviewScope(scope as "all" | "presets" | "keyframes")}
                  className={`rounded border px-2 py-1 ${storedQueuePreviewScope === scope ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-100/90" : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"}`}
                >
                  {scope}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {STORED_QUEUE_PREVIEW_PROFILES.map((profile) => (
                <button
                  key={`stored-queue-profile:${profile}`}
                  onClick={() => setStoredQueuePreviewProfile(profile)}
                  className={`rounded border px-2 py-1 ${storedQueuePreviewProfile === profile ? "border-amber-400/30 bg-amber-500/10 text-amber-100/90" : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"}`}
                >
                  {getStoredQueuePreviewProfileLabel(profile)}
                </button>
              ))}
            </div>
            <div className="mt-2 text-white/35">Before / preset {storedQueuePreview.before.presetContextCount} / keyframe {storedQueuePreview.before.keyframeContextCount} / manual custom {storedQueuePreview.before.manualCustomChoiceCount} / manual residual {storedQueuePreview.before.manualResidualMergeCount}</div>
            <div className="mt-1 text-white/35">After / preset {storedQueuePreview.after.presetContextCount} / keyframe {storedQueuePreview.after.keyframeContextCount} / manual custom {storedQueuePreview.after.manualCustomChoiceCount} / manual residual {storedQueuePreview.after.manualResidualMergeCount}</div>
            <div className="mt-1 text-white/35">Delta / review {storedQueuePreview.totalReviewDelta} / blocked {storedQueuePreview.totalBlockedDelta} / residual {storedQueuePreview.totalResidualDelta}</div>
            <div className="mt-1 text-white/35">Updates / presets {storedQueuePreview.presetUpdatedCount} / keyframes {storedQueuePreview.keyframeUpdatedCount} / keys {storedQueuePreview.appliedKeys.length} / changes {storedQueuePreview.hasChanges ? "pending" : "none"}</div>
            <div className="mt-1 text-white/30">Preview keys: {storedQueuePreview.keys.join(" / ") || "none"}</div>
            <div className="mt-1 text-white/30">Samples: {storedQueuePreview.sampleUpdatedIds.join(" / ") || "none"}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-white/45">
              <button onClick={copyStoredQueuePreview} disabled={storedQueuePreview.keys.length === 0} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40">Copy Stored Queue Preview</button>
              <button onClick={applyStoredQueuePreview} disabled={isPublicLibrary || storedQueuePreview.keys.length === 0 || !storedQueuePreview.hasChanges} className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply Stored Queue Preview</button>
            </div>
          </div>
          ) : (
            <div className="mt-3 rounded border border-fuchsia-400/15 bg-black/10 px-2 py-2 text-white/30">Stored queue preview auto-hidden. No stored manual conflicts remain.</div>
          )}
        </div>
        ) : (
          <div className="mt-2 rounded border border-fuchsia-400/15 bg-fuchsia-500/5 px-2 py-2 text-white/35">Stored manual queue resolved. Preview controls are hidden until a new stored conflict appears.</div>
        )}

        {lastManualBatchSummary && (
          <div className="mt-2 rounded border border-violet-400/15 bg-violet-500/5 px-2 py-2 text-white/40">
            <div className="text-white/55">Last Manual Batch / {lastManualBatchSummary.scope} / top {lastManualBatchSummary.limit}{lastManualBatchSummary.batchLabel ? ` / ${lastManualBatchSummary.batchLabel}` : ""}{lastManualBatchSummary.previewProfile ? ` / ${lastManualBatchSummary.previewProfile}` : ""}</div>
            <div className="mt-1 text-white/35">Current manual {lastManualBatchSummary.beforeCurrentManualKeyCount} -&gt; {lastManualBatchSummary.afterCurrentManualKeyCount} / stored manual {lastManualBatchSummary.beforeStoredManualKeyCount} -&gt; {lastManualBatchSummary.afterStoredManualKeyCount}</div>
            <div className="mt-1 text-white/35">Pending current {lastManualBatchSummary.beforePendingCurrentManualKeyCount} -&gt; {lastManualBatchSummary.afterPendingCurrentManualKeyCount} / pending stored {lastManualBatchSummary.beforePendingStoredManualKeyCount} -&gt; {lastManualBatchSummary.afterPendingStoredManualKeyCount}</div>
            <div className="mt-1 text-white/35">Current applied {lastManualBatchSummary.currentAppliedCount} / stored applied {lastManualBatchSummary.storedAppliedCount}</div>
            {typeof lastManualBatchSummary.previewKeyCount === "number" ? (
              <div className="mt-1 text-white/35">Preview keys {lastManualBatchSummary.previewKeyCount} / preset updates {lastManualBatchSummary.previewPresetUpdatedCount ?? 0} / keyframe updates {lastManualBatchSummary.previewKeyframeUpdatedCount ?? 0}</div>
            ) : null}
            {typeof lastManualBatchSummary.previewTotalReviewDelta === "number" ? (
              <div className="mt-1 text-white/35">Preview delta / review {lastManualBatchSummary.previewTotalReviewDelta} / blocked {lastManualBatchSummary.previewTotalBlockedDelta ?? 0} / residual {lastManualBatchSummary.previewTotalResidualDelta ?? 0}</div>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2 text-white/45">
              <button onClick={copyLastManualBatchSummary} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/60 hover:bg-white/10">Copy Last Manual Batch Summary</button>
            </div>
            <div className="mt-1 text-white/30">Current samples: {lastManualBatchSummary.currentSamples.join(" / ") || "none"}</div>
            <div className="mt-1 text-white/30">Stored samples: {lastManualBatchSummary.storedSamples.join(" / ") || "none"}</div>
            {lastManualBatchSummary.previewAppliedKeys?.length ? <div className="mt-1 text-white/30">Preview applied keys: {lastManualBatchSummary.previewAppliedKeys.join(" / ")}</div> : null}
          </div>
        )}
      </div>
    </div>
  );
}
