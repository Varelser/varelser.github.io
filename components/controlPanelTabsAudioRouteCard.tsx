import React from 'react';
import { AUDIO_FEATURE_KEYS, AUDIO_REACTIVE_CURVES, AUDIO_REACTIVE_MODES } from '../types/audioReactive';
import type { AudioRouteCardProps } from './controlPanelTabsAudioRouteEditorShared';

export function AudioRouteCard({
  route,
  config,
  index,
  routeSystem,
  isFirst,
  isLast,
  draggingRouteId,
  dragOverRouteId,
  setDraggingRouteId,
  setDragOverRouteId,
  reorderRoute,
  moveRoute,
  updateRoute,
  duplicateRoute,
  removeRoute,
  targetOptions,
}: AudioRouteCardProps) {
  return (
    <div
      onDragOver={(event) => {
        if (!draggingRouteId || draggingRouteId === route.id) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDragOverRouteId(route.id);
      }}
      onDrop={(event) => {
        event.preventDefault();
        const droppedRouteId = draggingRouteId || event.dataTransfer.getData('text/plain');
        if (droppedRouteId && droppedRouteId !== route.id) {
          reorderRoute(droppedRouteId, route.id, 'before');
        }
        setDraggingRouteId(null);
        setDragOverRouteId(null);
      }}
      className={`rounded border px-3 py-3 ${dragOverRouteId === route.id && draggingRouteId !== route.id ? 'border-cyan-300/40 bg-cyan-500/10' : 'border-white/10 bg-white/[0.03]'}`}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-panel-sm uppercase tracking-widest text-white/55">
        <div>#{index + 1} {route.id} / {routeSystem}</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            draggable
            onDragStart={(event) => {
              setDraggingRouteId(route.id);
              setDragOverRouteId(route.id);
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', route.id);
            }}
            onDragEnd={() => {
              setDraggingRouteId(null);
              setDragOverRouteId(null);
            }}
            className={`rounded border px-2 py-1 ${draggingRouteId === route.id ? 'border-cyan-300/40 bg-cyan-500/20 text-cyan-50' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}
            title="Drag to reorder"
          >
            Drag
          </button>
          <button onClick={() => moveRoute(route.id, -1)} disabled={isFirst} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10 disabled:opacity-30">Up</button>
          <button onClick={() => moveRoute(route.id, 1)} disabled={isLast} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10 disabled:opacity-30">Down</button>
          <button onClick={() => updateRoute(route.id, { enabled: !route.enabled })} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">{route.enabled ? 'Disable' : 'Enable'}</button>
          <button onClick={() => duplicateRoute(route.id)} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">Duplicate</button>
          <button onClick={() => removeRoute(route.id)} className="rounded border border-red-400/20 bg-red-500/10 px-2 py-1 text-red-100/80 hover:bg-red-500/20">Remove</button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <label className="text-panel-sm uppercase tracking-widest text-white/45">Source
          <select value={route.source} onChange={(event) => updateRoute(route.id, { source: event.target.value as typeof route.source })} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
            {AUDIO_FEATURE_KEYS.map((source) => <option key={source} value={source}>{source}</option>)}
          </select>
        </label>
        <label className="text-panel-sm uppercase tracking-widest text-white/45">Target
          <select value={route.target} onChange={(event) => updateRoute(route.id, { target: event.target.value })} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
            {targetOptions.map((option) => <option key={`${option.system}:${option.target}`} value={option.target}>{option.label}</option>)}
          </select>
        </label>
        <label className="text-panel-sm uppercase tracking-widest text-white/45">Mode
          <select value={route.mode} onChange={(event) => updateRoute(route.id, { mode: event.target.value as typeof route.mode })} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
            {AUDIO_REACTIVE_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
          </select>
        </label>
        <label className="text-panel-sm uppercase tracking-widest text-white/45">Curve
          <select value={route.curve} onChange={(event) => updateRoute(route.id, { curve: event.target.value as typeof route.curve })} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80">
            {AUDIO_REACTIVE_CURVES.map((curve) => <option key={curve} value={curve}>{curve}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        {([
          ['Amount', 'amount', -8, 8, 0.1],
          ['Bias', 'bias', -4, 4, 0.1],
          ['Clamp Min', 'clampMin', -8, 8, 0.1],
          ['Clamp Max', 'clampMax', -8, 8, 0.1],
        ] as const).map(([label, key, min, max, step]) => (
          <label key={key} className="text-panel-sm uppercase tracking-widest text-white/45">{label}
            <input type="number" value={route[key]} min={min} max={max} step={step} onChange={(event) => updateRoute(route.id, { [key]: Number(event.target.value) })} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80" />
          </label>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
        {([
          ['Smoothing', 'smoothing'],
          ['Attack', 'attack'],
          ['Release', 'release'],
        ] as const).map(([label, key]) => (
          <label key={key} className="text-panel-sm uppercase tracking-widest text-white/45">{label}
            <input type="range" value={route[key]} min={0} max={1} step={0.01} onChange={(event) => updateRoute(route.id, { [key]: Number(event.target.value) })} className="mt-1 w-full" />
            <div className="mt-1 text-white/35">{route[key].toFixed(2)}</div>
          </label>
        ))}
      </div>
      <label className="mt-2 block text-panel-sm uppercase tracking-widest text-white/45">Notes
        <input type="text" value={route.notes ?? ''} placeholder="why this route exists" onChange={(event) => updateRoute(route.id, { notes: event.target.value || undefined })} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-[11px] text-white/80" />
      </label>
    </div>
  );
}
