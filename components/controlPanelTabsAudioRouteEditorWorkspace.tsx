import React from 'react';
import { AUDIO_FEATURE_KEYS, AUDIO_REACTIVE_CURVES, AUDIO_REACTIVE_MODES } from '../types/audioReactive';
import { applyBulkRouteEditToVisible, DEFAULT_BULK_ROUTE_EDIT_DRAFT } from '../lib/audioRouteBulkEdit';
import { AudioRouteCard } from './controlPanelTabsAudioRouteCard';
import type { AudioRouteEditorWorkspaceProps } from './controlPanelTabsAudioRouteEditorShared';

export function AudioRouteEditorWorkspace({
  config,
  updateConfig,
  routeEditorOpen,
  filteredRoutes,
  routeSystemFilter,
  setRouteSystemFilter,
  routeSystemOptions,
  routeSourceFilter,
  setRouteSourceFilter,
  routeStateFilter,
  setRouteStateFilter,
  routeSearch,
  setRouteSearch,
  applyBulkToVisible,
  filteredRouteIdSet,
  sortRoutes,
  removeDisabledRoutes,
  bulkNumericOffsets,
  updateBulkNumericOffset,
  applyVisibleNumericOffsets,
  resetBulkNumericOffsets,
  targetSystemMap,
  moveRoute,
  reorderRoute,
  updateRoute,
  duplicateRoute,
  removeRoute,
  targetOptions,
}: AudioRouteEditorWorkspaceProps) {
  const [draggingRouteId, setDraggingRouteId] = React.useState<string | null>(null);
  const [dragOverRouteId, setDragOverRouteId] = React.useState<string | null>(null);
  const [bulkEditDraft, setBulkEditDraft] = React.useState(DEFAULT_BULK_ROUTE_EDIT_DRAFT);
  const [bulkEditNotice, setBulkEditNotice] = React.useState<string | null>(null);

  if (!routeEditorOpen) {
    return null;
  }

  const applyBulkDraft = () => {
    const { nextRoutes, touchedCount } = applyBulkRouteEditToVisible(config.audioRoutes, filteredRouteIdSet, bulkEditDraft);
    if (touchedCount === 0) {
      setBulkEditNotice('Bulk edit skipped because no visible routes were selected.');
      return;
    }
    updateConfig('audioRoutes', nextRoutes);
    setBulkEditNotice(`Applied generic bulk edit to ${touchedCount} visible routes.`);
  };

  const resetBulkDraft = () => {
    setBulkEditDraft(DEFAULT_BULK_ROUTE_EDIT_DRAFT);
    setBulkEditNotice('Bulk edit draft reset.');
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="uppercase tracking-widest text-white/45">Route Editor</div>
        <div className="text-panel-sm uppercase tracking-widest text-white/35">{filteredRoutes.length} visible / {config.audioRoutes.length} total</div>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
        <label className="text-panel-sm uppercase tracking-widest text-white/45">Family
          <select value={routeSystemFilter} onChange={(event) => setRouteSystemFilter(event.target.value)} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
            <option value="all">all systems</option>
            {routeSystemOptions.map((system) => <option key={system} value={system}>{system}</option>)}
          </select>
        </label>
        <label className="text-panel-sm uppercase tracking-widest text-white/45">Source
          <select value={routeSourceFilter} onChange={(event) => setRouteSourceFilter(event.target.value as typeof routeSourceFilter)} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
            <option value="all">all sources</option>
            {AUDIO_FEATURE_KEYS.map((source) => <option key={source} value={source}>{source}</option>)}
          </select>
        </label>
        <label className="text-panel-sm uppercase tracking-widest text-white/45">State
          <select value={routeStateFilter} onChange={(event) => setRouteStateFilter(event.target.value as typeof routeStateFilter)} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
            <option value="all">all routes</option>
            <option value="enabled">enabled only</option>
            <option value="disabled">disabled only</option>
          </select>
        </label>
        <label className="text-panel-sm uppercase tracking-widest text-white/45">Search
          <input type="text" value={routeSearch} onChange={(event) => setRouteSearch(event.target.value)} placeholder="id / target / notes" className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80" />
        </label>
      </div>
      <div className="rounded border border-white/10 bg-white/[0.03] px-3 py-3">
        <div className="mb-2 text-panel-sm uppercase tracking-widest text-white/45">Bulk Actions (visible routes)</div>
        <div className="mb-2 text-panel-sm uppercase tracking-widest text-white/30">Drag handle を掴んで、重ねた route の直前へ並び替えできます。</div>
        <div className="flex flex-wrap gap-2 text-panel-sm uppercase tracking-widest">
          <button onClick={() => applyBulkToVisible({ enabled: true })} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Enable Visible</button>
          <button onClick={() => applyBulkToVisible({ enabled: false })} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Disable Visible</button>
          <button onClick={() => updateConfig('audioRoutes', config.audioRoutes.map((route) => filteredRouteIdSet.has(route.id) ? { ...route, enabled: !route.enabled } : route))} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Invert Visible</button>
          <button onClick={() => applyBulkToVisible({ mode: 'add' })} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Mode Add</button>
          <button onClick={() => applyBulkToVisible({ mode: 'trigger' })} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Mode Trigger</button>
          <button onClick={() => applyBulkToVisible({ curve: 'linear' })} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Curve Linear</button>
          <button onClick={() => applyBulkToVisible({ curve: 'ease-out' })} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Curve Ease-Out</button>
          <button onClick={() => sortRoutes('system')} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Sort All / Family</button>
          <button onClick={() => sortRoutes('source')} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Sort All / Source</button>
          <button onClick={() => sortRoutes('target')} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Sort All / Target</button>
          <button onClick={removeDisabledRoutes} className="rounded border border-red-400/20 bg-red-500/10 px-2 py-1 text-red-100/80 hover:bg-red-500/20">Remove Disabled</button>
        </div>
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="mb-2 text-panel-sm uppercase tracking-widest text-white/45">Generic Bulk Edit (visible routes)</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            <label className="text-panel-sm uppercase tracking-widest text-white/45">Enabled
              <select value={bulkEditDraft.enabled} onChange={(event) => setBulkEditDraft((current) => ({ ...current, enabled: event.target.value as typeof current.enabled }))} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
                <option value="keep">keep</option>
                <option value="enabled">force on</option>
                <option value="disabled">force off</option>
                <option value="invert">invert</option>
              </select>
            </label>
            <label className="text-panel-sm uppercase tracking-widest text-white/45">Source
              <select value={bulkEditDraft.source} onChange={(event) => setBulkEditDraft((current) => ({ ...current, source: event.target.value as typeof current.source }))} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
                <option value="keep">keep</option>
                {AUDIO_FEATURE_KEYS.map((source) => <option key={source} value={source}>{source}</option>)}
              </select>
            </label>
            <label className="text-panel-sm uppercase tracking-widest text-white/45">Target
              <select value={bulkEditDraft.target} onChange={(event) => setBulkEditDraft((current) => ({ ...current, target: event.target.value }))} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
                <option value="keep">keep</option>
                {targetOptions.map((option) => <option key={option.target} value={option.target}>{option.label}</option>)}
              </select>
            </label>
            <label className="text-panel-sm uppercase tracking-widest text-white/45">Mode
              <select value={bulkEditDraft.mode} onChange={(event) => setBulkEditDraft((current) => ({ ...current, mode: event.target.value as typeof current.mode }))} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
                <option value="keep">keep</option>
                {AUDIO_REACTIVE_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
              </select>
            </label>
            <label className="text-panel-sm uppercase tracking-widest text-white/45">Curve
              <select value={bulkEditDraft.curve} onChange={(event) => setBulkEditDraft((current) => ({ ...current, curve: event.target.value as typeof current.curve }))} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
                <option value="keep">keep</option>
                {AUDIO_REACTIVE_CURVES.map((curve) => <option key={curve} value={curve}>{curve}</option>)}
              </select>
            </label>
            <label className="text-panel-sm uppercase tracking-widest text-white/45">Amount ×
              <input type="number" value={bulkEditDraft.amountScale} min={0} max={8} step={0.1} onChange={(event) => setBulkEditDraft((current) => ({ ...current, amountScale: Number(event.target.value) }))} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80" />
            </label>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
            {([
              ['Amount =', 'amountSet', -8, 8, 0.1],
              ['Bias =', 'biasSet', -8, 8, 0.1],
              ['Clamp Min =', 'clampMinSet', -8, 8, 0.1],
              ['Clamp Max =', 'clampMaxSet', -8, 8, 0.1],
              ['Smoothing =', 'smoothingSet', 0, 1, 0.01],
              ['Attack =', 'attackSet', 0, 1, 0.01],
              ['Release =', 'releaseSet', 0, 1, 0.01],
            ] as const).map(([label, key, min, max, step]) => (
              <label key={key} className="text-panel-sm uppercase tracking-widest text-white/45">{label}
                <input
                  type="number"
                  value={bulkEditDraft[key]}
                  min={min}
                  max={max}
                  step={step}
                  onChange={(event) => setBulkEditDraft((current) => ({
                    ...current,
                    [key]: event.target.value === '' ? '' : Number(event.target.value),
                  }))}
                  placeholder="keep"
                  className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80"
                />
              </label>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[180px_minmax(0,1fr)]">
            <label className="text-panel-sm uppercase tracking-widest text-white/45">Notes
              <select value={bulkEditDraft.notesMode} onChange={(event) => setBulkEditDraft((current) => ({ ...current, notesMode: event.target.value as typeof current.notesMode }))} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
                <option value="keep">keep</option>
                <option value="append">append</option>
                <option value="replace">replace</option>
                <option value="clear">clear</option>
              </select>
            </label>
            <label className="text-panel-sm uppercase tracking-widest text-white/45">Notes Text
              <input type="text" value={bulkEditDraft.notesText} onChange={(event) => setBulkEditDraft((current) => ({ ...current, notesText: event.target.value }))} placeholder="Append / replace notes for visible routes" className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80" />
            </label>
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/32">Scale + exact values can be combined. Exact numeric inputs override the scaled amount or current route value.</div>
          <div className="mt-2 flex flex-wrap gap-2 text-panel-sm uppercase tracking-widest">
            <button onClick={applyBulkDraft} className="rounded border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-emerald-100/85 hover:bg-emerald-500/20">Apply Generic Bulk Edit</button>
            <button onClick={resetBulkDraft} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Reset Generic Draft</button>
          </div>
          {bulkEditNotice && <div className="mt-2 text-panel-sm uppercase tracking-widest text-white/45">{bulkEditNotice}</div>}
        </div>
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="mb-2 text-panel-sm uppercase tracking-widest text-white/45">Bulk Numeric Offsets (visible routes)</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
            {([
              ['Amount Δ', 'amount', -4, 4, 0.1],
              ['Bias Δ', 'bias', -4, 4, 0.1],
              ['Clamp Min Δ', 'clampMin', -4, 4, 0.1],
              ['Clamp Max Δ', 'clampMax', -4, 4, 0.1],
              ['Smoothing Δ', 'smoothing', -1, 1, 0.01],
              ['Attack Δ', 'attack', -1, 1, 0.01],
              ['Release Δ', 'release', -1, 1, 0.01],
            ] as const).map(([label, key, min, max, step]) => (
              <label key={key} className="text-panel-sm uppercase tracking-widest text-white/45">{label}
                <input type="number" value={bulkNumericOffsets[key]} min={min} max={max} step={step} onChange={(event) => updateBulkNumericOffset(key, Number(event.target.value))} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80" />
              </label>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-panel-sm uppercase tracking-widest">
            <button onClick={applyVisibleNumericOffsets} className="rounded border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-emerald-100/85 hover:bg-emerald-500/20">Apply Offsets To Visible</button>
            <button onClick={resetBulkNumericOffsets} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Reset Offset Inputs</button>
          </div>
        </div>
      </div>
      {config.audioRoutes.length === 0 && <div className="rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-panel-sm uppercase tracking-widest text-white/40">No routes yet. Add Route または preset pack で作成してください。</div>}
      {config.audioRoutes.length > 0 && filteredRoutes.length === 0 && <div className="rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-panel-sm uppercase tracking-widest text-white/40">現在の filter 条件に一致する route はありません。</div>}
      {filteredRoutes.map((route) => {
        const index = config.audioRoutes.findIndex((entry) => entry.id === route.id);
        const routeSystem = targetSystemMap.get(route.target) ?? 'unknown';
        return (
          <AudioRouteCard
            key={route.id}
            route={route}
            config={config}
            index={index}
            routeSystem={routeSystem}
            isFirst={index <= 0}
            isLast={index >= config.audioRoutes.length - 1}
            draggingRouteId={draggingRouteId}
            dragOverRouteId={dragOverRouteId}
            setDraggingRouteId={setDraggingRouteId}
            setDragOverRouteId={setDragOverRouteId}
            reorderRoute={reorderRoute}
            moveRoute={moveRoute}
            updateRoute={updateRoute}
            duplicateRoute={duplicateRoute}
            removeRoute={removeRoute}
            targetOptions={targetOptions}
          />
        );
      })}
    </div>
  );
}
