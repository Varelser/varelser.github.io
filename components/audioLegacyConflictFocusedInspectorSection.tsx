import React from "react";
import {
  formatStoredAutoFixPreview,
  summarizeStoredAutoFixPreview,
  type StoredAutoFixPreviewProfile,
  type StoredAutoFixPreviewScope,
} from "../lib/audioReactiveStoredAutoFixPreview";
import type { AudioLegacyConflictPanelProps } from "./audioLegacyConflictPanelTypes";

const STORED_PREVIEW_SCOPES: StoredAutoFixPreviewScope[] = ["all", "presets", "keyframes"];
const STORED_PREVIEW_PROFILES: StoredAutoFixPreviewProfile[] = [
  "safe",
  "collapse-review",
  "remove-custom-shadow",
  "collapse-custom-exact",
  "align-residuals",
  "mute-focused-conflict",
];

function getStoredPreviewProfileLabel(profile: StoredAutoFixPreviewProfile) {
  switch (profile) {
    case "collapse-review":
      return "review-collapse";
    case "remove-custom-shadow":
      return "remove-shadow";
    case "collapse-custom-exact":
      return "collapse-custom";
    case "align-residuals":
      return "align-residuals";
    case "mute-focused-conflict":
      return "mute-dominant";
    default:
      return "safe-pass";
  }
}

export function AudioLegacyConflictFocusedInspectorSection({
  config,
  presets,
  presetSequence,
  curationHistorySummary,
  copyCurationHistory,
  copyFocusedRetirementSnapshot,
  setCurationQueueFilterMode,
  clearCurationHistory,
  focusConflictKey,
  focusedCustomConflictDetail,
  applyFocusedConflictRecommendation,
  applyFocusedConflictRecommendationAndAdvance,
  muteFocusedConflictToDominant,
  keepFocusedConflictRoute,
  keepStoredFocusedConflictRoute,
  isPublicLibrary,
  filteredCustomConflictHotspots,
  applyConflictRecommendationForKey,
  updateConfig,
  setLegacyAutoFixNotice,
  applyStoredHotspotRecommendationForKey,
  applyLegacyAutoFixes,
  applyStoredLegacyAutoFixes,
  focusedConflictKey,
  muteStoredFocusedConflictToDominant,
}: AudioLegacyConflictPanelProps) {
  const [storedPreviewScope, setStoredPreviewScope] = React.useState<StoredAutoFixPreviewScope>("all");
  const [storedPreviewProfile, setStoredPreviewProfile] = React.useState<StoredAutoFixPreviewProfile>("safe");

  const storedPreviewKeepRouteId =
    storedPreviewProfile === "mute-focused-conflict"
      ? focusedCustomConflictDetail?.dominantRouteId ?? undefined
      : undefined;

  const storedAutoFixPreview = React.useMemo(() => {
    if (!focusedConflictKey) {
      return null;
    }
    return summarizeStoredAutoFixPreview(presets, presetSequence, {
      scope: storedPreviewScope,
      profile: storedPreviewProfile,
      onlyKey: focusedConflictKey,
      keepRouteId: storedPreviewKeepRouteId,
    });
  }, [
    focusedConflictKey,
    presetSequence,
    presets,
    storedPreviewKeepRouteId,
    storedPreviewProfile,
    storedPreviewScope,
  ]);

  const copyStoredAutoFixPreview = React.useCallback(async () => {
    if (!storedAutoFixPreview) return;
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("clipboard unavailable");
      }
      await navigator.clipboard.writeText(formatStoredAutoFixPreview(storedAutoFixPreview));
      setLegacyAutoFixNotice(
        `Stored auto-fix preview copied / ${storedAutoFixPreview.profile} / ${storedAutoFixPreview.scope}${storedAutoFixPreview.key ? ` / key ${storedAutoFixPreview.key}` : ""}.`,
      );
    } catch {
      setLegacyAutoFixNotice("Stored auto-fix preview copy failed in this environment.");
    }
  }, [setLegacyAutoFixNotice, storedAutoFixPreview]);

  const applyStoredAutoFixPreview = React.useCallback(() => {
    if (!focusedConflictKey) return;
    applyStoredLegacyAutoFixes(
      storedPreviewScope,
      storedPreviewProfile,
      focusedConflictKey,
      storedPreviewKeepRouteId,
    );
  }, [
    applyStoredLegacyAutoFixes,
    focusedConflictKey,
    storedPreviewKeepRouteId,
    storedPreviewProfile,
    storedPreviewScope,
  ]);

  return (
    <>
      <div className="mt-2 rounded border border-white/10 bg-white/[0.02] px-2 py-2 text-white/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-white/55">Recent Curation History</div>
            <div className="mt-1 text-white/35">entries {config.audioCurationHistory.length} / recent keys {curationHistorySummary.recentKeys.length}</div>
            <div className="mt-1 text-white/30">hot keys: {curationHistorySummary.hottestKeys.map((entry) => `${entry.key}(${entry.count})`).join(" / ") || "none"}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={copyCurationHistory} className="rounded border border-white/15 bg-white/[0.04] px-2 py-1 text-white/70 hover:bg-white/[0.08]">Copy History</button>
            <button onClick={copyFocusedRetirementSnapshot} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20">Copy Focused Retirement Snapshot</button>
            <button onClick={() => setCurationQueueFilterMode("hide-curated")} className="rounded border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-white/70 hover:bg-amber-500/20">Hide Curated Keys</button>
            <button onClick={clearCurationHistory} className="rounded border border-rose-400/25 bg-rose-500/10 px-2 py-1 text-white/70 hover:bg-rose-500/20">Clear History</button>
          </div>
        </div>
        {curationHistorySummary.entries.length > 0 && (
          <div className="mt-2 space-y-2 text-white/30">
            {curationHistorySummary.entries.slice(0, 8).map((entry, index) => (
              <div key={`${entry.id}:${index}`} className="rounded border border-white/10 bg-black/10 px-2 py-2">
                <div>#{index + 1} {entry.scope} / {entry.action} / {entry.key}</div>
                <div className="mt-1 text-white/25">{entry.createdAt} {entry.note ? ` / ${entry.note}` : ""}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => focusConflictKey(entry.key)} className="rounded border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-white/70 hover:bg-amber-500/20">Focus Key</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {focusedCustomConflictDetail && (
        <div className="mt-2 rounded border border-cyan-400/15 bg-cyan-500/5 px-2 py-2 text-white/40">
          <div className="text-white/55">Focused Conflict Inspector / {focusedCustomConflictDetail.key}</div>
          <div className="mt-1">Recommendation {focusedCustomConflictDetail.recommendation} / dominant {focusedCustomConflictDetail.dominantRouteId ?? "none"} ({focusedCustomConflictDetail.dominantOwner ?? "n/a"})</div>
          <div className="mt-1 text-white/35">{focusedCustomConflictDetail.recommendationReason}</div>
          <div className="mt-1 text-white/35">Counts / custom {focusedCustomConflictDetail.customRouteCount} / legacy {focusedCustomConflictDetail.legacyRouteCount} / exact custom {focusedCustomConflictDetail.exactCustomCount} / exact legacy {focusedCustomConflictDetail.exactLegacyCount}</div>
          <div className="mt-1 text-white/35">Spread / amount {focusedCustomConflictDetail.amountSpread} / bias {focusedCustomConflictDetail.biasSpread} / timing {focusedCustomConflictDetail.timingSpread}</div>
          <div className="mt-1 text-white/35">Recommended keep route / {focusedCustomConflictDetail.dominantRouteId ?? "none"} / owner {focusedCustomConflictDetail.dominantOwner ?? "n/a"}</div>
          <div className="mt-1 flex flex-wrap gap-2 text-white/45">
            <button onClick={applyFocusedConflictRecommendation} className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20">Apply Recommendation</button>
            <button onClick={applyFocusedConflictRecommendationAndAdvance} className="rounded border border-lime-400/25 bg-lime-500/10 px-2 py-1 text-white/70 hover:bg-lime-500/20">Apply + Next</button>
            <button onClick={muteFocusedConflictToDominant} className="rounded border border-orange-400/25 bg-orange-500/10 px-2 py-1 text-white/70 hover:bg-orange-500/20">Mute To Dominant</button>
          </div>

          {storedAutoFixPreview && (
            <div className="mt-3 rounded border border-cyan-400/15 bg-black/10 px-2 py-2 text-white/35">
              <div className="text-white/55">Stored Auto-Fix Preview / staged / key {storedAutoFixPreview.key}</div>
              <div className="mt-1 text-white/35">This preview simulates stored preset + keyframe migration without mutating saved data.</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {STORED_PREVIEW_SCOPES.map((scope) => (
                  <button
                    key={scope}
                    onClick={() => setStoredPreviewScope(scope)}
                    className={`rounded border px-2 py-1 ${storedPreviewScope === scope ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-100/90" : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"}`}
                  >
                    {scope}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {STORED_PREVIEW_PROFILES.map((profile) => (
                  <button
                    key={profile}
                    onClick={() => setStoredPreviewProfile(profile)}
                    className={`rounded border px-2 py-1 ${storedPreviewProfile === profile ? "border-amber-400/30 bg-amber-500/10 text-amber-100/90" : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"}`}
                  >
                    {getStoredPreviewProfileLabel(profile)}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-white/35">Preview / profile {storedAutoFixPreview.profile} / scope {storedAutoFixPreview.scope} / changes {storedAutoFixPreview.hasChanges ? "pending" : "none"} / keep {storedAutoFixPreview.keepRouteId ?? "none"}</div>
              <div className="mt-1 text-white/35">Updated contexts {storedAutoFixPreview.totalUpdatedCount} / presets {storedAutoFixPreview.presetsSummary.updatedCount} / keyframes {storedAutoFixPreview.keyframesSummary.updatedCount}</div>
              <div className="mt-1 text-white/35">Delta / review {storedAutoFixPreview.totalReviewDelta} / blocked {storedAutoFixPreview.totalBlockedDelta} / residual {storedAutoFixPreview.totalResidualDelta}</div>
              {storedAutoFixPreview.before && storedAutoFixPreview.after && (
                <>
                  <div className="mt-1 text-white/30">Before / presets {storedAutoFixPreview.before.presetContextCount} / keyframes {storedAutoFixPreview.before.keyframeContextCount} / manual custom {storedAutoFixPreview.before.manualCustomChoiceCount} / manual residual {storedAutoFixPreview.before.manualResidualMergeCount} / auto resolvable {storedAutoFixPreview.before.autoResolvableCount}</div>
                  <div className="mt-1 text-white/30">After / presets {storedAutoFixPreview.after.presetContextCount} / keyframes {storedAutoFixPreview.after.keyframeContextCount} / manual custom {storedAutoFixPreview.after.manualCustomChoiceCount} / manual residual {storedAutoFixPreview.after.manualResidualMergeCount} / auto resolvable {storedAutoFixPreview.after.autoResolvableCount}</div>
                  {storedAutoFixPreview.after.sampleContexts.length > 0 && (
                    <div className="mt-1 text-white/30">Remaining samples: {storedAutoFixPreview.after.sampleContexts.join(" / ")}</div>
                  )}
                </>
              )}
              {storedAutoFixPreview.sampleUpdatedIds.length > 0 && (
                <div className="mt-1 text-white/30">Updated sample ids: {storedAutoFixPreview.sampleUpdatedIds.join(" / ")}</div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={copyStoredAutoFixPreview} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20">Copy Stored Preview</button>
                <button onClick={applyStoredAutoFixPreview} disabled={isPublicLibrary} className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40">Apply This Stored Preview</button>
              </div>
            </div>
          )}

          <div className="mt-2 space-y-2 text-white/30">
            {focusedCustomConflictDetail.routes.slice(0, 6).map((route, index) => (
              <div key={`${route.id}:focused-detail`} className="rounded border border-white/10 bg-white/[0.02] px-2 py-2">
                <div>
                  #{index + 1} {route.owner} / {route.id} / {route.enabled ? "enabled" : "disabled"} / score {route.score} / Δ amount {route.amountDelta} / Δ bias {route.biasDelta} / Δ timing {route.timingDelta} / amount {route.amount.toFixed(2)} / bias {route.bias.toFixed(2)} / mode {route.mode} / curve {route.curve}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-white/45">
                  <button onClick={() => keepFocusedConflictRoute(route.id)} className="rounded border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-white/70 hover:bg-amber-500/20">Keep This Route</button>
                  <button onClick={() => keepFocusedConflictRoute(route.id, true)} className="rounded border border-lime-400/25 bg-lime-500/10 px-2 py-1 text-white/70 hover:bg-lime-500/20">Keep + Next</button>
                  <button onClick={() => keepStoredFocusedConflictRoute(route)} disabled={isPublicLibrary} className="rounded border border-sky-400/25 bg-sky-500/10 px-2 py-1 text-white/70 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40">Keep In Stored</button>
                  <button onClick={() => keepStoredFocusedConflictRoute(route, true)} disabled={isPublicLibrary} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40">Keep Stored + Next</button>
                  {focusedCustomConflictDetail.dominantRouteId === route.id && <span className="rounded border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-white/55">recommended dominant</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredCustomConflictHotspots.length > 0 && (
        <div className="mt-2 space-y-2 text-white/35">
          {filteredCustomConflictHotspots.slice(0, 8).map((hotspot, index) => (
            <div key={`${hotspot.key}:hotspot`} className="rounded border border-white/10 bg-white/[0.02] px-2 py-2">
              <div>#{index + 1} {hotspot.highestKind} / {hotspot.key} / contexts {hotspot.contextCount} / current {hotspot.currentConfig ? "yes" : "no"} / presets {hotspot.presetCount} / sequence presets {hotspot.sequenceLinkedPresetCount} / keyframes {hotspot.keyframeCount}</div>
              {hotspot.sampleContexts.length > 0 && <div className="mt-1 text-white/30">Samples: {hotspot.sampleContexts.join(" / ")}</div>}
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => focusConflictKey(hotspot.key)} className="rounded border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-white/70 hover:bg-amber-500/20">Focus In Route Editor</button>
                <button
                  onClick={() => {
                    const result = applyConflictRecommendationForKey(hotspot.key);
                    focusConflictKey(hotspot.key);
                    if (result.applied) {
                      updateConfig("audioRoutes", result.routes);
                      updateConfig("audioRoutesEnabled", true);
                      setLegacyAutoFixNotice(`Hotspot recommendation applied / key ${hotspot.key} / ${result.label}.`);
                    } else {
                      setLegacyAutoFixNotice(`Hotspot recommendation skipped / key ${hotspot.key}.`);
                    }
                  }}
                  className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20"
                >
                  Apply Hotspot Recommendation
                </button>
                <button
                  onClick={() => {
                    focusConflictKey(hotspot.key);
                    applyStoredHotspotRecommendationForKey(hotspot.key);
                  }}
                  disabled={isPublicLibrary}
                  className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Apply Stored Hotspot Recommendation
                </button>
                <button onClick={() => applyLegacyAutoFixes("collapse-custom-exact", hotspot.key)} className="rounded border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-1 text-white/70 hover:bg-fuchsia-500/20">Collapse Exact Custom Duplicates</button>
                <button onClick={() => applyStoredLegacyAutoFixes("all", "collapse-custom-exact", hotspot.key)} disabled={isPublicLibrary} className="rounded border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-1 text-white/70 hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-40">Collapse Stored Exact Custom Duplicates</button>
                {focusedConflictKey === hotspot.key && focusedCustomConflictDetail?.dominantRouteId && (
                  <>
                    <button onClick={muteFocusedConflictToDominant} className="rounded border border-orange-400/25 bg-orange-500/10 px-2 py-1 text-white/70 hover:bg-orange-500/20">Mute To Dominant</button>
                    <button onClick={muteStoredFocusedConflictToDominant} disabled={isPublicLibrary} className="rounded border border-orange-400/25 bg-orange-500/10 px-2 py-1 text-white/70 hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40">Mute Stored To Dominant</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
