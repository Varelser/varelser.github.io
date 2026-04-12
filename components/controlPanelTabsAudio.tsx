import React from "react";
const AudioLegacySection = React.lazy(() => import("./AudioLegacySection").then((module) => ({ default: module.AudioLegacySection })));
const AudioSynthControlsPanel = React.lazy(() => import("./controlPanelTabsAudioSynth").then((module) => ({ default: module.AudioSynthControlsPanel })));
import { Mic, X } from "lucide-react";
import type { AudioSourceMode } from "../types";
import { Toggle } from "./controlPanelParts";
import { ControlPanelContentProps } from "./controlPanelTabsShared";
import { AudioRouteEditorPanel } from "./controlPanelTabsAudioRouteEditor";
import { useAudioTabState } from "./useAudioTabState";
import { useAudioCurationHistory } from "./useAudioCurationHistory";
import { useAudioRouteTransferUtilities } from "./useAudioRouteTransferUtilities";
import { useAudioRouteEditorCore } from "./useAudioRouteEditorCore";

export const AudioTabContent: React.FC<ControlPanelContentProps> = ({
  audioActionLabel,
  audioNotice,
  audioSourceMode,
  config,
  isAudioActive,
  onAudioSourceModeChange,
  onDismissAudioNotice,
  startAudio,
  stopAudio,
  updateConfig,
  presets,
  setPresets,
  presetSequence,
  setPresetSequence,
  isPublicLibrary,
}) => {
  const {
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
  } = useAudioTabState();

  const {
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
  } = useAudioCurationHistory({
    audioCurationHistory: config.audioCurationHistory,
    curationQueueFilterMode: config.audioCurationQueueFilterMode,
    updateConfig,
    setRouteTransferNotice,
  });

  const {
    addRoute,
    duplicateRoute,
    filteredRouteIdSet,
    filteredRoutes,
    moveRoute,
    removeRoute,
    reorderRoute,
    routeSystemOptions,
    routeTransferValidation,
    targetOptions,
    targetSystemMap,
    updateRoute,
  } = useAudioRouteEditorCore({
    config,
    updateConfig,
    focusedConflictKey,
    routeSearch,
    routeSourceFilter,
    routeStateFilter,
    routeSystemFilter,
    routeTransferText,
    setRouteEditorOpen,
  });

  const {
    applyBulkToVisible,
    applyVisibleNumericOffsets,
    copyRouteBundle,
    exportRouteBundle,
    handleRouteTransferDragLeave,
    handleRouteTransferDragOver,
    handleRouteTransferDrop,
    handleRouteTransferFileChange,
    importRouteBundle,
    openRouteTransferFilePicker,
    removeDisabledRoutes,
    resetBulkNumericOffsets,
    sortRoutes,
    updateBulkNumericOffset,
  } = useAudioRouteTransferUtilities({
    config,
    updateConfig,
    filteredRoutes,
    filteredRouteIdSet,
    targetSystemMap,
    routeTransferText,
    setRouteTransferText,
    setRouteTransferNotice,
    routeTransferFileMode,
    setRouteTransferFileMode,
    setRouteTransferDragActive,
    routeTransferFileInputRef,
    setRouteEditorOpen,
    bulkNumericOffsets,
    setBulkNumericOffsets,
  });

  const shouldRenderSynthPanel = audioSourceMode !== "microphone";

  return (
    <div>
      <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Mic size={12} /> Audio Analysis
      </h3>
      <Toggle
        label="Audio Source"
        value={audioSourceMode}
        options={[
          { label: "Microphone", val: "microphone" },
          { label: "Shared Tab / System", val: "shared-audio" },
          { label: "MIDI", val: "midi" },
          { label: "Standalone Synth", val: "standalone-synth" },
          { label: "Built-in Synth", val: "internal-synth" },
        ]}
        onChange={(value) => onAudioSourceModeChange(value as AudioSourceMode)}
      />
      <div className="mb-4">
        <button
          onClick={isAudioActive ? stopAudio : startAudio}
          className={`w-full py-3 rounded border font-bold uppercase tracking-wider transition-all ${
            isAudioActive
              ? "bg-green-500/20 border-green-500/50 text-green-300"
              : "bg-white/5 border-white/20 hover:bg-white/10"
          }`}
        >
          {audioActionLabel}
        </button>
      </div>
      {audioNotice && (
        <div
          className={`mb-4 flex items-start justify-between gap-3 rounded border px-3 py-2 text-panel uppercase tracking-widest ${
            audioNotice.tone === "error"
              ? "border-red-400/30 bg-red-500/10 text-red-100/90"
              : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100/90"
          }`}
        >
          <span>{audioNotice.message}</span>
          <button
            onClick={onDismissAudioNotice}
            className="opacity-60 hover:opacity-100"
          >
            <X size={12} />
          </button>
        </div>
      )}
      {shouldRenderSynthPanel && (
        <React.Suspense fallback={<div className="mb-4 rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-panel-sm uppercase tracking-widest text-white/35">Loading synth controls…</div>}>
          <AudioSynthControlsPanel
            audioSourceMode={audioSourceMode}
            config={config}
            updateConfig={updateConfig}
          />
        </React.Suspense>
      )}
      <div className="mb-4 mt-4 rounded border border-white/10 bg-black/10 px-3 py-2 text-panel uppercase tracking-widest text-white/55">
        Reactive Routing
      </div>
      <Toggle
        label="Audio Route Matrix"
        value={config.audioRoutesEnabled}
        options={[
          { label: "On", val: true },
          { label: "Off", val: false },
        ]}
        onChange={(value) => updateConfig("audioRoutesEnabled", value)}
      />
        <React.Suspense fallback={<div className="mb-3 rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-panel-sm uppercase tracking-widest text-white/35">Loading legacy cleanup…</div>}>
          <AudioLegacySection
            config={config}
            updateConfig={updateConfig}
            presets={presets}
            setPresets={setPresets}
            presetSequence={presetSequence}
            setPresetSequence={setPresetSequence}
            isPublicLibrary={isPublicLibrary}
            focusedConflictKey={focusedConflictKey}
            setFocusedConflictKey={setFocusedConflictKey}
            legacyAutoFixNotice={legacyAutoFixNotice}
            setLegacyAutoFixNotice={setLegacyAutoFixNotice}
            storedLegacyAutoFixNotice={storedLegacyAutoFixNotice}
            setStoredLegacyAutoFixNotice={setStoredLegacyAutoFixNotice}
            lastHotspotBatchSummary={lastHotspotBatchSummary}
            setLastHotspotBatchSummary={setLastHotspotBatchSummary}
            lastManualBatchSummary={lastManualBatchSummary}
            setLastManualBatchSummary={setLastManualBatchSummary}
            setRouteTransferNotice={setRouteTransferNotice}
            setRouteEditorOpen={setRouteEditorOpen}
            setRouteSearch={setRouteSearch}
            curationHistorySummary={curationHistorySummary}
            recentCurationKeySet={recentCurationKeySet}
            curationHistoryKeySet={curationHistoryKeySet}
            curationQueueFilterMode={curationQueueFilterMode}
            setCurationQueueFilterMode={setCurationQueueFilterMode}
            shouldIncludeCurationQueueKey={shouldIncludeCurationQueueKey}
            appendCurationHistoryEntries={appendCurationHistoryEntries}
            clearCurationHistory={clearCurationHistory}
            createCurationHistoryKeySetWith={createCurationHistoryKeySetWith}
            copyCurationHistory={copyCurationHistory}
          />
        </React.Suspense>
        <AudioRouteEditorPanel
          config={config}
          updateConfig={updateConfig}
          routeEditorOpen={routeEditorOpen}
          setRouteEditorOpen={setRouteEditorOpen}
          focusedConflictKey={focusedConflictKey}
          clearFocusedConflictKey={() => setFocusedConflictKey(null)}
          addRoute={addRoute}
          routeTransferFileInputRef={routeTransferFileInputRef}
          handleRouteTransferFileChange={handleRouteTransferFileChange}
          routeTransferFileMode={routeTransferFileMode}
          setRouteTransferFileMode={setRouteTransferFileMode}
          exportRouteBundle={exportRouteBundle}
          copyRouteBundle={copyRouteBundle}
          importRouteBundle={importRouteBundle}
          openRouteTransferFilePicker={openRouteTransferFilePicker}
          setRouteTransferText={setRouteTransferText}
          setRouteTransferNotice={setRouteTransferNotice}
          handleRouteTransferDragOver={handleRouteTransferDragOver}
          handleRouteTransferDragLeave={handleRouteTransferDragLeave}
          handleRouteTransferDrop={handleRouteTransferDrop}
          routeTransferDragActive={routeTransferDragActive}
          routeTransferText={routeTransferText}
          routeTransferValidation={routeTransferValidation}
          routeTransferNotice={routeTransferNotice}
          filteredRoutes={filteredRoutes}
          routeSystemFilter={routeSystemFilter}
          setRouteSystemFilter={setRouteSystemFilter}
          routeSystemOptions={routeSystemOptions}
          routeSourceFilter={routeSourceFilter}
          setRouteSourceFilter={setRouteSourceFilter}
          routeStateFilter={routeStateFilter}
          setRouteStateFilter={setRouteStateFilter}
          routeSearch={routeSearch}
          setRouteSearch={setRouteSearch}
          applyBulkToVisible={applyBulkToVisible}
          filteredRouteIdSet={filteredRouteIdSet}
          sortRoutes={sortRoutes}
          removeDisabledRoutes={removeDisabledRoutes}
          bulkNumericOffsets={bulkNumericOffsets}
          updateBulkNumericOffset={updateBulkNumericOffset}
          applyVisibleNumericOffsets={applyVisibleNumericOffsets}
          resetBulkNumericOffsets={resetBulkNumericOffsets}
          targetSystemMap={targetSystemMap}
          moveRoute={moveRoute}
          reorderRoute={reorderRoute}
          updateRoute={updateRoute}
          duplicateRoute={duplicateRoute}
          removeRoute={removeRoute}
          targetOptions={targetOptions}
        />
    </div>
  );
};
