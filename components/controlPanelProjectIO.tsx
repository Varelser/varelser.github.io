import React from 'react';
import { Briefcase, Download, FolderOpen } from 'lucide-react';
import type { ParticleConfig, PresetRecord, ProjectManifest, ProjectFutureNativeSpecialistRouteControlEntry } from '../types';
import type { UpdateConfig } from './controlPanelTabsShared';
import type { Notice } from '../lib/audioControllerTypes';
import type { ComparePreviewOrientation, LayerFocusMode, LayerToggleState, SnapshotSlot } from './controlPanelTypes';
import { NoticeBanner } from './controlPanelTabsShared';
import { getActiveHybridRecipes } from '../lib/hybridExpressions';
import { ControlPanelProjectIOFutureNativeSection } from './controlPanelProjectIOFutureNativeSection';
const ControlPanelProjectIOManifestSection = React.lazy(() =>
  import('./controlPanelProjectIOManifestSection').then((module) => ({ default: module.ControlPanelProjectIOManifestSection })),
);
const ControlPanelProjectIOCompareSection = React.lazy(() =>
  import('./controlPanelProjectIOCompareSection').then((module) => ({ default: module.ControlPanelProjectIOCompareSection })),
);

export type ControlPanelProjectIOProps = {
  handleProjectFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDismissProjectNotice: () => void;
  onExportProject: () => void;
  projectInputRef: React.RefObject<HTMLInputElement | null>;
  projectManifest: ProjectManifest;
  projectNotice: Notice | null;
  onReplayProjectSeed: () => void;
  updateConfig: UpdateConfig;
  futureNativeSpecialistRouteControls: ProjectFutureNativeSpecialistRouteControlEntry[];
  onSetFutureNativeSpecialistRouteControls: React.Dispatch<React.SetStateAction<ProjectFutureNativeSpecialistRouteControlEntry[]>>;
  layerFocusMode: LayerFocusMode;
  comparePreviewEnabled: boolean;
  onSetComparePreviewEnabled: (enabled: boolean) => void;
  comparePreviewOrientation: ComparePreviewOrientation;
  onSetComparePreviewOrientation: (orientation: ComparePreviewOrientation) => void;
  comparePreviewSlotIndex: number;
  onSetComparePreviewSlotIndex: (slotIndex: number) => void;
  onSetLayerFocusMode: (mode: LayerFocusMode) => void;
  layerMuteState: LayerToggleState;
  onToggleLayerMute: (layer: keyof LayerToggleState) => void;
  layerLockState: LayerToggleState;
  onToggleLayerLock: (layer: keyof LayerToggleState) => void;
  snapshotSlots: SnapshotSlot[];
  onCaptureSnapshot: (slotIndex: number) => void;
  onLoadSnapshot: (slotIndex: number) => void;
  onMorphSnapshot: (slotIndex: number) => void;
  onClearSnapshot: (slotIndex: number) => void;
  onRenameSnapshot: (slotIndex: number, label: string) => void;
  onSetSnapshotNote: (slotIndex: number, note: string) => void;
  compareReferenceConfig: ParticleConfig | null;
  currentConfig: ParticleConfig;
  presets: PresetRecord[];
};

export const ControlPanelProjectIO: React.FC<ControlPanelProjectIOProps> = ({
  handleProjectFileChange,
  onDismissProjectNotice,
  onExportProject,
  projectInputRef,
  projectManifest,
  projectNotice,
  onReplayProjectSeed,
  updateConfig,
  futureNativeSpecialistRouteControls,
  onSetFutureNativeSpecialistRouteControls,
  layerFocusMode,
  comparePreviewEnabled,
  onSetComparePreviewEnabled,
  comparePreviewOrientation,
  onSetComparePreviewOrientation,
  comparePreviewSlotIndex,
  onSetComparePreviewSlotIndex,
  onSetLayerFocusMode,
  layerMuteState,
  onToggleLayerMute,
  layerLockState,
  onToggleLayerLock,
  snapshotSlots,
  onCaptureSnapshot,
  onLoadSnapshot,
  onMorphSnapshot,
  onClearSnapshot,
  onRenameSnapshot,
  onSetSnapshotNote,
  compareReferenceConfig,
  currentConfig,
  presets,
}) => {
  const activeHybridRecipes = getActiveHybridRecipes(currentConfig);

  return (
    <div className="mt-4 rounded border border-white/10 bg-white/5 p-3">
      <div className="mb-3 flex items-center gap-2 text-panel font-bold uppercase tracking-widest text-white/70">
        <Briefcase size={12} /> Project I/O
      </div>
      <input
        ref={projectInputRef as React.RefObject<HTMLInputElement>}
        type="file"
        accept="application/json"
        onChange={handleProjectFileChange}
        className="hidden"
      />
      <div className="mb-2 grid grid-cols-2 gap-2">
        <button
          onClick={onExportProject}
          className="flex items-center justify-center gap-2 rounded border border-white/20 bg-white/5 py-2 text-panel font-bold uppercase transition-colors hover:bg-white/10"
        >
          <Download size={12} /> Export Project
        </button>
        <button
          onClick={() => projectInputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded border border-white/20 bg-white/5 py-2 text-panel font-bold uppercase transition-colors hover:bg-white/10"
        >
          <FolderOpen size={12} /> Load Project
        </button>
      </div>

      <div className="mb-3 rounded border border-emerald-300/15 bg-emerald-500/5 p-2">
        <div className="mb-2 text-panel uppercase tracking-widest text-emerald-100/70">Seed lock / replay</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className="flex items-center gap-2 rounded border border-white/10 bg-black/20 px-2 py-1 text-panel text-white/70">
            <input
              type="checkbox"
              checked={currentConfig.projectSeedLockEnabled}
              onChange={(event) => updateConfig('projectSeedLockEnabled', event.target.checked)}
            />
            Lock seed
          </label>
          <label className="flex items-center gap-2 rounded border border-white/10 bg-black/20 px-2 py-1 text-panel text-white/70">
            <input
              type="checkbox"
              checked={currentConfig.projectSeedAutoAdvance}
              onChange={(event) => updateConfig('projectSeedAutoAdvance', event.target.checked)}
            />
            Auto-advance
          </label>
          <label className="rounded border border-white/10 bg-black/20 px-2 py-1 text-panel text-white/70">
            <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/38">Current seed</div>
            <input
              type="number"
              value={currentConfig.projectSeedValue}
              min={1}
              step={1}
              onChange={(event) => updateConfig('projectSeedValue', Math.max(1, Math.floor(Number(event.target.value) || 1)))}
              className="w-full rounded border border-white/10 bg-black/25 px-2 py-1 text-white/80 outline-none"
            />
          </label>
          <label className="rounded border border-white/10 bg-black/20 px-2 py-1 text-panel text-white/70">
            <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/38">Advance step</div>
            <input
              type="number"
              value={currentConfig.projectSeedStep}
              min={1}
              step={1}
              onChange={(event) => updateConfig('projectSeedStep', Math.max(1, Math.floor(Number(event.target.value) || 1)))}
              className="w-full rounded border border-white/10 bg-black/25 px-2 py-1 text-white/80 outline-none"
            />
          </label>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded border border-white/10 bg-black/20 px-2 py-1 text-panel text-white/55">Last seed · {currentConfig.projectSeedLastApplied}</div>
          <div className="rounded border border-white/10 bg-black/20 px-2 py-1 text-panel text-white/55">Last trigger · {currentConfig.projectSeedLastTriggerKind}</div>
          <div className="rounded border border-white/10 bg-black/20 px-2 py-1 text-panel text-white/55">Last scope · {currentConfig.projectSeedLastMutationScope}</div>
          <div className="rounded border border-white/10 bg-black/20 px-2 py-1 text-panel text-white/55">Last intensity · {currentConfig.projectSeedLastMutationIntensity.toFixed(2)}</div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={onReplayProjectSeed}
            className="rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-white/75 hover:bg-emerald-500/20"
          >
            Replay last seed
          </button>
          <button
            onClick={() => updateConfig('projectSeedValue', Math.max(1, currentConfig.projectSeedLastApplied || currentConfig.projectSeedValue))}
            className="rounded border border-white/15 bg-black/20 px-2 py-1 text-white/65 hover:bg-white/10"
          >
            Use last seed as lock value
          </button>
        </div>
      </div>

      <ControlPanelProjectIOFutureNativeSection currentConfig={currentConfig} projectManifest={projectManifest} presets={presets} futureNativeSpecialistRouteControls={futureNativeSpecialistRouteControls} onSetFutureNativeSpecialistRouteControls={onSetFutureNativeSpecialistRouteControls} />

      {activeHybridRecipes.length > 0 ? (
        <div className="mb-3 rounded border border-fuchsia-300/20 bg-fuchsia-500/5 p-2">
          <div className="mb-2 text-panel uppercase tracking-widest text-fuchsia-100/70">Active hybrid expressions</div>
          <div className="space-y-2">
            {activeHybridRecipes.map((recipe) => (
              <div key={recipe.id} className="rounded border border-white/10 bg-black/20 p-2">
                <div className="text-panel font-bold uppercase tracking-widest text-white/78">{recipe.name}</div>
                <div className="mt-1 text-panel text-white/58">{recipe.summary}</div>
                <div className="mt-1 text-panel text-white/42">Focus · {recipe.emphasis.join(' · ')}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <React.Suspense fallback={null}>
        <ControlPanelProjectIOManifestSection projectManifest={projectManifest} />

        <ControlPanelProjectIOCompareSection
        layerFocusMode={layerFocusMode}
        onSetLayerFocusMode={onSetLayerFocusMode}
        layerMuteState={layerMuteState}
        onToggleLayerMute={onToggleLayerMute}
        layerLockState={layerLockState}
        onToggleLayerLock={onToggleLayerLock}
        comparePreviewEnabled={comparePreviewEnabled}
        onSetComparePreviewEnabled={onSetComparePreviewEnabled}
        comparePreviewOrientation={comparePreviewOrientation}
        onSetComparePreviewOrientation={onSetComparePreviewOrientation}
        comparePreviewSlotIndex={comparePreviewSlotIndex}
        onSetComparePreviewSlotIndex={onSetComparePreviewSlotIndex}
        snapshotSlots={snapshotSlots}
        onCaptureSnapshot={onCaptureSnapshot}
        onLoadSnapshot={onLoadSnapshot}
        onMorphSnapshot={onMorphSnapshot}
        onClearSnapshot={onClearSnapshot}
        onRenameSnapshot={onRenameSnapshot}
        onSetSnapshotNote={onSetSnapshotNote}
        compareReferenceConfig={compareReferenceConfig}
        currentConfig={currentConfig}
        storedQueuePreviewSummary={projectManifest.audioLegacyStoredQueuePreview}
        />
      </React.Suspense>

      <div className="mb-2 text-panel uppercase tracking-widest text-white/40">
        Saves current config, presets, sequence, UI playback/export settings, and layer mode/source/material manifest.
      </div>
      <NoticeBanner notice={projectNotice} onDismiss={onDismissProjectNotice} className="mt-3" />
    </div>
  );
};
