import React from "react";
import { AUDIO_LEGACY_SLIDER_VISIBILITY_MODES } from "../types/audioReactive";
import type { AudioLegacyConflictPanelProps } from "./audioLegacyConflictPanelTypes";
import { AudioLegacyConflictHotspotQueueSection } from "./audioLegacyConflictHotspotQueueSection";
import { AudioLegacyConflictFocusedInspectorSection } from "./audioLegacyConflictFocusedInspectorSection";
import { buildAudioLegacyFinalPanelState } from "../lib/audioLegacyFinalPanelState";
import { buildProjectAudioLegacyTargetHostProofPacket, formatProjectAudioLegacyTargetHostProofPacket } from "../lib/projectAudioLegacyTargetHostProofPacket";
import { buildProjectAudioLegacyCloseoutPacket, formatProjectAudioLegacyCloseoutPacket } from "../lib/projectAudioLegacyCloseoutPacket";
import { buildProjectAudioLegacyStoredQueuePreviewSummary } from "../lib/projectAudioLegacyStoredQueuePreviewSummary";

export function AudioLegacyConflictPanel({
  config,
  activeRouteCount,
  documentedTargetCount,
  legacyRouteParity,
  legacyCloseoutSummary,
  cleanupState,
  legacySliderVisibilityMode,
  setLegacyVisibilityMode,
  applyLegacyAutoFixes,
  applyStoredLegacyAutoFixes,
  visibleLegacySliderCount,
  totalLegacySliderCount,
  hiddenSafeLegacySliderCount,
  legacyAutoFixNotice,
  storedLegacyAutoFixNotice,
  ...rest
}: AudioLegacyConflictPanelProps) {
  const finalPanelState = React.useMemo(() => buildAudioLegacyFinalPanelState(cleanupState, legacyCloseoutSummary), [cleanupState, legacyCloseoutSummary]);
  const targetHostProofPacket = React.useMemo(() => buildProjectAudioLegacyTargetHostProofPacket(legacyCloseoutSummary), [legacyCloseoutSummary]);
  const storedQueuePreviewSummary = React.useMemo(
    () => buildProjectAudioLegacyStoredQueuePreviewSummary(config, rest.presets, rest.presetSequence),
    [config, rest.presets, rest.presetSequence],
  );
  const closeoutPacket = React.useMemo(
    () => buildProjectAudioLegacyCloseoutPacket(legacyCloseoutSummary, storedQueuePreviewSummary),
    [legacyCloseoutSummary, storedQueuePreviewSummary],
  );
  const [showAdvancedTools, setShowAdvancedTools] = React.useState(!finalPanelState.shouldCollapseAdvancedSections);

  const copyTargetHostProofPacket = React.useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      rest.setLegacyAutoFixNotice("Clipboard API unavailable. Target-host proof packet was not copied.");
      return;
    }
    try {
      await navigator.clipboard.writeText(formatProjectAudioLegacyTargetHostProofPacket(targetHostProofPacket, legacyCloseoutSummary));
      rest.setLegacyAutoFixNotice("Copied target-host proof packet to clipboard.");
    } catch {
      rest.setLegacyAutoFixNotice("Clipboard write failed for target-host proof packet.");
    }
  }, [legacyCloseoutSummary, rest, targetHostProofPacket]);

  const copyFinalCloseoutPacket = React.useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      rest.setLegacyAutoFixNotice("Clipboard API unavailable. Final closeout packet was not copied.");
      return;
    }
    try {
      await navigator.clipboard.writeText(formatProjectAudioLegacyCloseoutPacket(closeoutPacket, legacyCloseoutSummary, storedQueuePreviewSummary));
      rest.setLegacyAutoFixNotice("Copied final closeout packet to clipboard.");
    } catch {
      rest.setLegacyAutoFixNotice("Clipboard write failed for final closeout packet.");
    }
  }, [closeoutPacket, legacyCloseoutSummary, rest, storedQueuePreviewSummary]);

  React.useEffect(() => {
    if (!finalPanelState.shouldCollapseAdvancedSections) {
      setShowAdvancedTools(true);
      return;
    }
    setShowAdvancedTools(false);
  }, [finalPanelState.shouldCollapseAdvancedSections]);
  return (
    <div className="mb-4 rounded border border-white/10 bg-black/10 px-3 py-3 text-panel text-white/70">
      {finalPanelState.compactCloseoutReady && !showAdvancedTools ? (
        <div className="mb-3 rounded border border-emerald-300/20 bg-emerald-500/10 px-3 py-3 text-panel-sm uppercase tracking-widest text-emerald-100/80">
          <div className="text-white/70">Legacy panel / compact closeout mode</div>
          <div className="mt-1 text-white/45">{legacyCloseoutSummary.closeoutMessage}</div>
          <div className="mt-1 text-white/35">Next / {legacyCloseoutSummary.nextStepLabel}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => setShowAdvancedTools(true)} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/70 hover:bg-white/10">Show Advanced Legacy Tools</button>
            <button onClick={() => setLegacyVisibilityMode(legacyCloseoutSummary.recommendedVisibilityMode)} disabled={!legacyCloseoutSummary.modeDrift} className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40">Adopt Recommended Visibility</button>
            <button onClick={() => { void copyTargetHostProofPacket(); }} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20">Copy Target-Host Packet</button>
            <button onClick={() => { void copyFinalCloseoutPacket(); }} className="rounded border border-violet-400/25 bg-violet-500/10 px-2 py-1 text-white/70 hover:bg-violet-500/20">Copy Final Closeout Packet</button>
            <button onClick={() => { void copyFinalCloseoutPacket(); }} className="rounded border border-violet-400/25 bg-violet-500/10 px-2 py-1 text-white/70 hover:bg-violet-500/20">Copy Final Closeout Packet</button>
          </div>
        </div>
      ) : null}

      <div className="mb-2 uppercase tracking-widest text-white/45">Route Coverage</div>
      <div className="mb-2">
        {activeRouteCount} active routes / {config.audioRoutes.length} total / {documentedTargetCount} documented live-or-reserved targets
      </div>
      <div className="mb-3 rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-panel-sm uppercase tracking-widest text-white/55">
        <div className="mb-1 text-white/45">Legacy Slider Parity</div>
        <div>Expected {legacyRouteParity.legacyRouteCount} / Exact {legacyRouteParity.exactMatchCount} / Residual {legacyRouteParity.residualCount}</div>
        <div className="mt-1 text-white/40">Partial {legacyRouteParity.partialMatchCount} / Missing {legacyRouteParity.missingCount} / Duplicate Matches {legacyRouteParity.duplicateMatchCount} / Stale Legacy {legacyRouteParity.staleLegacyCount} / Extra Custom {legacyRouteParity.extraCustomCount}</div>
        <div className="mt-1 text-white/40">Deprecation Order / Safe {legacyRouteParity.safeToDeprecateCount} / Review {legacyRouteParity.reviewBeforeDeprecateCount} / Blocked {legacyRouteParity.blockedDeprecationCount}</div>
        <div className="mt-1 text-white/35">Review Breakdown / duplicate-only {legacyRouteParity.reviewDuplicateOnlyCount} / residual-only {legacyRouteParity.reviewResidualOnlyCount} / mixed {legacyRouteParity.reviewMixedCount} / collapsible legacy-owned duplicates {legacyRouteParity.reviewCollapsibleDuplicateCount}</div>
        <div className="mt-1 text-white/35">Custom Conflict / shadowed by custom exact {legacyRouteParity.reviewShadowedByCustomExactCount} / other custom duplicate conflicts {legacyRouteParity.reviewCustomConflictCount}</div>
        {legacyRouteParity.sampleCustomConflicts.length > 0 && <div className="mt-1 text-white/35">Custom conflict sample: {legacyRouteParity.sampleCustomConflicts.join(" / ")}</div>}
        <div className={`mt-2 rounded border px-2 py-2 ${legacyCloseoutSummary.status === "ready" ? "border-emerald-300/20 bg-emerald-500/10" : legacyCloseoutSummary.status === "blocked" ? "border-rose-300/20 bg-rose-500/10" : "border-amber-300/20 bg-amber-500/10"}`}>
          <div className="text-white/70">Closeout {legacyCloseoutSummary.status.toUpperCase()} / current {legacyCloseoutSummary.currentVisibilityMode} / recommended {legacyCloseoutSummary.recommendedVisibilityMode}</div>
          <div className="mt-1 text-white/40">Current unresolved / review {legacyCloseoutSummary.currentReviewCount} / blocked {legacyCloseoutSummary.currentBlockedCount} / residual {legacyCloseoutSummary.currentResidualCount}</div>
          <div className="mt-1 text-white/40">Stored unresolved / review {legacyCloseoutSummary.storedReviewCount} / blocked {legacyCloseoutSummary.storedBlockedCount} / safe {legacyCloseoutSummary.safeToDeprecateCount}</div>
          {legacyCloseoutSummary.highestRiskLegacyIds.length > 0 && <div className="mt-1 text-white/35">Highest risk / {legacyCloseoutSummary.highestRiskLegacyIds.join(" / ")}</div>}
          <div className="mt-1 text-white/35">{legacyCloseoutSummary.closeoutMessage}</div>
          <div className="mt-1 text-white/30">Next / {legacyCloseoutSummary.nextStepLabel}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => setLegacyVisibilityMode(legacyCloseoutSummary.recommendedVisibilityMode)} disabled={!legacyCloseoutSummary.modeDrift} className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40">Adopt Recommended Visibility</button>
            <button onClick={() => { void copyTargetHostProofPacket(); }} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20">Copy Target-Host Packet</button>
            {finalPanelState.shouldCollapseAdvancedSections ? <button onClick={() => setShowAdvancedTools((current) => !current)} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/60 hover:bg-white/10">{showAdvancedTools ? "Hide Advanced Legacy Tools" : "Show Advanced Legacy Tools"}</button> : null}
            <div className="px-1 py-1 text-white/35">New defaults now start in retired-safe mode for fresh projects.</div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {AUDIO_LEGACY_SLIDER_VISIBILITY_MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => setLegacyVisibilityMode(mode)}
              className={`rounded border px-2 py-1 hover:bg-white/10 ${legacySliderVisibilityMode === mode ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-100/90" : "border-white/15 bg-white/5 text-white/60"}`}
            >
              {mode === "all" ? "Show All Legacy Sliders" : mode === "review-blocked" ? "Hide Safe Sliders" : "Retire Safe Sliders"}
            </button>
          ))}
        </div>
        {(!finalPanelState.shouldCollapseAdvancedSections || showAdvancedTools) ? (
        <><div className="mt-2 flex flex-wrap gap-2">
          <button onClick={() => applyLegacyAutoFixes("run-safe-pass")} className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/70 hover:bg-emerald-500/20">Run Safe Auto-Fix Pass</button>
          <button onClick={() => applyLegacyAutoFixes("append-missing")} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/60 hover:bg-white/10">Append Missing</button>
          <button onClick={() => applyLegacyAutoFixes("align-residuals")} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/60 hover:bg-white/10">Align Residuals</button>
          <button onClick={() => applyLegacyAutoFixes("dedupe-exact")} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/60 hover:bg-white/10">Remove Exact Duplicates</button>
          <button onClick={() => applyLegacyAutoFixes("collapse-review-duplicates")} className="rounded border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-white/70 hover:bg-amber-500/20">Collapse Legacy-Owned Review Duplicates</button>
          <button onClick={() => applyLegacyAutoFixes("remove-custom-shadow")} className="rounded border border-sky-400/25 bg-sky-500/10 px-2 py-1 text-white/70 hover:bg-sky-500/20">Remove Legacy Shadowed by Custom Exact</button>
          <button onClick={() => applyLegacyAutoFixes("collapse-custom-exact")} className="rounded border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-1 text-white/70 hover:bg-fuchsia-500/20">Collapse Exact Custom Duplicates</button>
          <button onClick={() => applyLegacyAutoFixes("remove-stale")} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/60 hover:bg-white/10">Remove Stale Legacy</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={() => applyStoredLegacyAutoFixes("all")} disabled={rest.isPublicLibrary} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40">Fix Stored Presets + Keyframes</button>
          <button onClick={() => applyStoredLegacyAutoFixes("all", "collapse-review")} disabled={rest.isPublicLibrary} className="rounded border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-white/70 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40">Collapse Stored Review Duplicates</button>
          <button onClick={() => applyStoredLegacyAutoFixes("all", "remove-custom-shadow")} disabled={rest.isPublicLibrary} className="rounded border border-sky-400/25 bg-sky-500/10 px-2 py-1 text-white/70 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40">Remove Stored Legacy Shadowed by Custom Exact</button>
          <button onClick={() => applyStoredLegacyAutoFixes("all", "collapse-custom-exact")} disabled={rest.isPublicLibrary} className="rounded border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-1 text-white/70 hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-40">Collapse Stored Exact Custom Duplicates</button>
          <button onClick={() => applyStoredLegacyAutoFixes("presets")} disabled={rest.isPublicLibrary} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">Fix Saved Presets</button>
          <button onClick={() => applyStoredLegacyAutoFixes("keyframes")} disabled={rest.isPublicLibrary} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">Fix Sequence Keyframes</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={rest.copyRetirementImpactSummary} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20">Copy Retirement Impact</button>
          <button onClick={rest.copyFocusedRetirementSnapshot} className="rounded border border-sky-400/25 bg-sky-500/10 px-2 py-1 text-white/70 hover:bg-sky-500/20">Copy Handoff Snapshot</button>
        </div>
        <div className="mt-1 text-white/35">Visible legacy reactive sliders {visibleLegacySliderCount} / {totalLegacySliderCount} / hidden safe {hiddenSafeLegacySliderCount}</div>
        <div className="mt-1 text-white/35">Visibility mode {legacySliderVisibilityMode} / persisted in config for later AI handoff.</div>
        <div className="mt-1 text-white/35">Cleanup state / hotspots {cleanupState.hotspotCount} / current manual {cleanupState.manualConflictCount} / stored manual {cleanupState.storedManualConflictCount}{cleanupState.cleanupReady ? " / ready" : " / active"}</div>
        {legacySliderVisibilityMode === "retired-safe" && legacyRouteParity.safeToDeprecateCount > 0 && (
          <div className="mt-1 text-amber-100/75">Runtime bridge mute is active for {legacyRouteParity.safeToDeprecateCount} safe legacy sliders. Custom / review / blocked sliders stay live.</div>
        )}
        {legacyAutoFixNotice && <div className="mt-1 text-emerald-100/75">{legacyAutoFixNotice}</div>}
        {storedLegacyAutoFixNotice && <div className="mt-1 text-cyan-100/75">{storedLegacyAutoFixNotice}</div>}
        {legacyRouteParity.sampleMissing.length > 0 && <div className="mt-1 text-white/35">Missing sample: {legacyRouteParity.sampleMissing.join(" / ")}</div>}
        {legacyRouteParity.sampleCollapsibleReview.length > 0 && <div className="mt-1 text-white/35">Collapsible review sample: {legacyRouteParity.sampleCollapsibleReview.join(" / ")}</div>}
        {legacyRouteParity.sampleResiduals.length > 0 && (
          <div className="mt-1 space-y-1 text-white/35">
            {legacyRouteParity.sampleResiduals.map((residual) => (
              <div key={`${residual.key}:${residual.routeId}`}>
                Residual {residual.key} → {residual.routeId} / amount Δ {residual.amountDelta.toFixed(2)} / bias Δ {residual.biasDelta.toFixed(2)} / timing Δ {residual.timingDelta.toFixed(2)}
              </div>
            ))}
          </div>
        )}
        {legacyRouteParity.deprecationOrder.length > 0 && (
          <div className="mt-2 space-y-1 text-white/35">
            {legacyRouteParity.deprecationOrder.slice(0, 8).map((candidate, index) => (
              <div key={`${candidate.legacyId}:${candidate.key}`}>
                #{index + 1} {candidate.status.toUpperCase()} / {candidate.key} / {candidate.routeId ?? "no-route"} / {candidate.reason}
              </div>
            ))}
          </div>
        )}

        <AudioLegacyConflictHotspotQueueSection
          {...rest}
          config={config}
          activeRouteCount={activeRouteCount}
          documentedTargetCount={documentedTargetCount}
          legacyRouteParity={legacyRouteParity}
          legacyCloseoutSummary={legacyCloseoutSummary}
          legacySliderVisibilityMode={legacySliderVisibilityMode}
          setLegacyVisibilityMode={setLegacyVisibilityMode}
          applyLegacyAutoFixes={applyLegacyAutoFixes}
          applyStoredLegacyAutoFixes={applyStoredLegacyAutoFixes}
          visibleLegacySliderCount={visibleLegacySliderCount}
          totalLegacySliderCount={totalLegacySliderCount}
          hiddenSafeLegacySliderCount={hiddenSafeLegacySliderCount}
          legacyAutoFixNotice={legacyAutoFixNotice}
          storedLegacyAutoFixNotice={storedLegacyAutoFixNotice}
          cleanupState={cleanupState}
        />

        <AudioLegacyConflictFocusedInspectorSection
          {...rest}
          config={config}
          activeRouteCount={activeRouteCount}
          documentedTargetCount={documentedTargetCount}
          legacyRouteParity={legacyRouteParity}
          legacyCloseoutSummary={legacyCloseoutSummary}
          legacySliderVisibilityMode={legacySliderVisibilityMode}
          setLegacyVisibilityMode={setLegacyVisibilityMode}
          applyLegacyAutoFixes={applyLegacyAutoFixes}
          applyStoredLegacyAutoFixes={applyStoredLegacyAutoFixes}
          visibleLegacySliderCount={visibleLegacySliderCount}
          totalLegacySliderCount={totalLegacySliderCount}
          hiddenSafeLegacySliderCount={hiddenSafeLegacySliderCount}
          legacyAutoFixNotice={legacyAutoFixNotice}
          storedLegacyAutoFixNotice={storedLegacyAutoFixNotice}
          cleanupState={cleanupState}
        />
        </>
      ) : null}
      </div>

      {finalPanelState.shouldShowTargetHostReminder ? (
        <div className="mt-2 rounded border border-cyan-400/20 bg-cyan-500/10 px-2 py-2 text-panel-sm uppercase tracking-widest text-cyan-100/80">
          <div>Target-host live browser proof is still required before final closeout handoff.</div>
          <div className="mt-1 text-cyan-100/70">Runner / {targetHostProofPacket.runnerCommand}</div>
          <div className="mt-1 text-cyan-100/65">Refresh / {targetHostProofPacket.refreshCommand}</div>
          <div className="mt-1 text-cyan-100/60">Artifacts / {targetHostProofPacket.proofArtifacts.join(" / ")}</div>
          <div className="mt-2">
            <button onClick={() => { void copyTargetHostProofPacket(); }} className="rounded border border-cyan-300/20 bg-cyan-500/10 px-2 py-1 text-cyan-100/80 hover:bg-cyan-500/20">Copy Target-Host Packet</button>
          </div>
        </div>
      ) : null}

      {legacySliderVisibilityMode === "retired-safe" && hiddenSafeLegacySliderCount > 0 && (
        <div className="mt-2 rounded border border-amber-400/20 bg-amber-500/10 px-2 py-2 text-panel-sm uppercase tracking-widest text-amber-100/80">
          Safe legacy sliders are retired from the active panel view. Switch back to "Show All Legacy Sliders" when you need to audit or restore them.
        </div>
      )}
    </div>
  );
}
