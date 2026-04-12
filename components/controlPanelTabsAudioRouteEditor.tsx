import React from 'react';
const AudioSequenceTriggerPanel = React.lazy(() => import('./controlPanelTabsAudioSequenceTrigger').then((module) => ({ default: module.AudioSequenceTriggerPanel })));
const AudioRouteTransferSection = React.lazy(() => import('./controlPanelTabsAudioRouteTransferSection').then((module) => ({ default: module.AudioRouteTransferSection })));
const AudioRouteEditorWorkspace = React.lazy(() => import('./controlPanelTabsAudioRouteEditorWorkspace').then((module) => ({ default: module.AudioRouteEditorWorkspace })));
import { AUDIO_ROUTE_PRESET_DEFINITIONS, appendAudioRoutePresetPack } from '../lib/audioReactivePresets';
import { createLegacyAudioRoutes } from '../lib/audioReactiveConfig';
import type { AudioRouteEditorPanelProps } from './controlPanelTabsAudioRouteEditorShared';

export function AudioRouteEditorPanel({
  config,
  updateConfig,
  routeEditorOpen,
  setRouteEditorOpen,
  focusedConflictKey,
  clearFocusedConflictKey,
  addRoute,
  ...rest
}: AudioRouteEditorPanelProps) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          onClick={() => {
            updateConfig('audioRoutes', createLegacyAudioRoutes(config));
            updateConfig('audioRoutesEnabled', true);
          }}
          className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10"
        >
          Sync Legacy → Routes
        </button>
        <button onClick={addRoute} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10">Add Route</button>
        <button onClick={() => updateConfig('audioRoutes', [])} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10">Clear Routes</button>
        <button onClick={() => setRouteEditorOpen((prev) => !prev)} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10">{routeEditorOpen ? 'Hide Route Editor' : 'Show Route Editor'}</button>
        {focusedConflictKey && (
          <button onClick={clearFocusedConflictKey} className="rounded border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-panel-sm uppercase text-amber-100/80 hover:bg-amber-500/20">Clear Focus {focusedConflictKey}</button>
        )}
      </div>
      <div className="mb-2 uppercase tracking-widest text-white/45">Preset Packs</div>
      <div className="mb-3 flex flex-wrap gap-2">
        {AUDIO_ROUTE_PRESET_DEFINITIONS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              updateConfig('audioRoutes', appendAudioRoutePresetPack(config.audioRoutes, preset.id));
              updateConfig('audioRoutesEnabled', true);
            }}
            className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10"
            title={preset.description}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="space-y-1">
        {config.audioRoutes.slice(0, 8).map((route) => (
          <div key={route.id} className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-panel-sm uppercase tracking-widest text-white/55">
            {route.source} → {route.target} × {route.amount.toFixed(2)}
          </div>
        ))}
        {config.audioRoutes.length > 8 && (
          <div className="text-panel-sm uppercase tracking-widest text-white/35">+ {config.audioRoutes.length - 8} more routes</div>
        )}
      </div>

      {routeEditorOpen && (
        <React.Suspense fallback={<div className="mb-3 rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-panel-sm uppercase tracking-widest text-white/35">Loading route editor…</div>}>
          <AudioSequenceTriggerPanel config={config} updateConfig={updateConfig} />
          <AudioRouteTransferSection {...rest} />
          <AudioRouteEditorWorkspace config={config} updateConfig={updateConfig} routeEditorOpen={routeEditorOpen} {...rest} />
        </React.Suspense>
      )}
    </div>
  );
}
