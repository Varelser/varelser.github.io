import React from 'react';
import { Layers3 } from 'lucide-react';
import type { ParticleConfig } from '../types';
import { getActiveRenderModes, getRenderCategorySummary, getRenderSupportSummary } from '../lib/renderModeRegistry';

type ControlPanelGlobalDisplayRenderClassesProps = {
  config: ParticleConfig;
};

export const ControlPanelGlobalDisplayRenderClasses: React.FC<ControlPanelGlobalDisplayRenderClassesProps> = ({
  config,
}) => {
  const activeRenderModes = React.useMemo(() => getActiveRenderModes(config), [config]);
  const renderCategorySummary = React.useMemo(() => getRenderCategorySummary(config), [config]);
  const renderSupportSummary = React.useMemo(() => getRenderSupportSummary(config), [config]);

  return (
    <div className="mt-5 rounded border border-white/10 bg-white/5 p-3">
      <div className="mb-3 flex items-center gap-2 text-panel uppercase tracking-widest font-bold text-white/70">
        <Layers3 size={12} /> Render Classes
      </div>
      <div className="mb-3 text-panel text-white/45 leading-relaxed">
        Current render stack grouped by primitive class. This is the registry layer for expanding beyond one particle pipeline.
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded border border-white/10 bg-black/20 p-2">
          <div className="text-panel-sm uppercase tracking-[0.2em] text-white/45">Stable</div>
          <div className="mt-1 text-sm font-bold text-white/85">{renderSupportSummary.stable}</div>
        </div>
        <div className="rounded border border-white/10 bg-black/20 p-2">
          <div className="text-panel-sm uppercase tracking-[0.2em] text-white/45">Experimental</div>
          <div className="mt-1 text-sm font-bold text-white/85">{renderSupportSummary.experimental}</div>
        </div>
        <div className="rounded border border-white/10 bg-black/20 p-2">
          <div className="text-panel-sm uppercase tracking-[0.2em] text-white/45">Heavy</div>
          <div className="mt-1 text-sm font-bold text-white/85">{renderSupportSummary.heavy}</div>
        </div>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {renderCategorySummary.map((entry) => (
          <div key={entry.category} className="rounded border border-white/10 bg-black/20 px-2 py-2">
            <div className="flex items-center justify-between gap-2 text-panel-sm uppercase tracking-[0.2em] text-white/45">
              <span>{entry.category}</span>
              <span className="font-mono text-white/65">{entry.activeCount}/{entry.totalCount}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-white/60" style={{ width: `${entry.totalCount > 0 ? (entry.activeCount / entry.totalCount) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {activeRenderModes.length > 0 ? activeRenderModes.map((mode) => (
          <div key={mode.id} className="rounded border border-white/10 bg-black/20 px-2 py-1.5">
            <div className="text-panel-sm uppercase tracking-[0.2em] text-white/45">{mode.category} · {mode.support}</div>
            <div className="mt-1 text-[11px] font-medium text-white/85">{mode.label}</div>
          </div>
        )) : (
          <div className="text-panel text-white/45">No render class is active yet.</div>
        )}
      </div>
    </div>
  );
};
