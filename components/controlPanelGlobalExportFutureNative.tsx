import React from 'react';
import { Clapperboard, Orbit } from 'lucide-react';
import type { ParticleConfig, PresetRecord, PresetSequenceItem } from '../types';
import { getFutureNativeExportAdvice } from '../lib/futureNativePanelSummaries';

interface GlobalExportFutureNativeSectionProps {
  config: ParticleConfig;
  presets: PresetRecord[];
  presetSequence: PresetSequenceItem[];
  videoExportMode: 'current' | 'sequence';
  onVideoExportModeChange: (mode: 'current' | 'sequence') => void;
}

export const GlobalExportFutureNativeSection: React.FC<GlobalExportFutureNativeSectionProps> = ({
  config,
  presets,
  presetSequence,
  videoExportMode,
  onVideoExportModeChange,
}) => {
  const advice = React.useMemo(
    () => getFutureNativeExportAdvice(config, presets, presetSequence),
    [config, presetSequence, presets],
  );

  if (advice.libraryCounts.futureNativePresetCount === 0) return null;

  return (
    <div className="mt-3 rounded border border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-2 text-panel uppercase font-bold tracking-widest text-white/65">
        <Clapperboard size={12} /> Future-native export focus
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/40">
        Active routes {advice.activeRoutes.length} • queued future-native steps {advice.sequenceCounts.futureNativeStepCount}
      </div>

      <div className="mt-3 rounded border border-white/10 bg-white/[0.03] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/58">
            Suggested mode {advice.preferredVideoMode}
          </span>
          <span className="rounded border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/58">
            Suggested output {advice.preferredCaptureLabel}
          </span>
        </div>
        <div className="mt-2 text-panel-sm leading-relaxed text-white/50">{advice.recommendation}</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onVideoExportModeChange('current')}
            className={`rounded border px-3 py-2 text-panel-sm font-bold uppercase transition-colors ${videoExportMode === 'current' ? 'border-white/30 bg-white/12 text-white/85' : 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Use Current
          </button>
          <button
            onClick={() => onVideoExportModeChange('sequence')}
            className={`rounded border px-3 py-2 text-panel-sm font-bold uppercase transition-colors ${videoExportMode === 'sequence' ? 'border-white/30 bg-white/12 text-white/85' : 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Use Sequence
          </button>
        </div>
      </div>

      {advice.activeRoutes.length > 0 ? (
        <div className="mt-3 grid gap-2 xl:grid-cols-2">
          {advice.activeRoutes.map((route) => (
            <div key={route.key} className="rounded border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/38">{route.label}</div>
                  <div className="mt-1 text-xs font-semibold text-white/84">{route.familyLabel}</div>
                  <div className="mt-1 text-panel-sm text-white/46">{route.mode}</div>
                </div>
                <Orbit size={12} className="text-white/30" />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {route.bindingMode ? <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/50">{route.bindingMode}</span> : null}
                {route.capabilityFlags.map((flag) => (
                  <span key={flag} className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/40">{flag}</span>
                ))}
              </div>
              <div className="mt-2 text-panel-sm leading-relaxed text-white/42">{route.reason}</div>
              {route.recommendedPresetIds.length > 0 ? (
                <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/36">
                  Recommended presets {route.recommendedPresetIds.length}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-panel-sm text-white/42">
          No active future-native route is enabled in the current config. This section will react when MPM, PBD, Fracture, or Volumetric is active.
        </div>
      )}
    </div>
  );
};
