import React from 'react';
import { Layers3, Orbit, Plus } from 'lucide-react';
import type { ParticleConfig, PresetRecord, PresetSequenceItem } from '../types';
import { FUTURE_NATIVE_DISPLAY_PACK_CARDS } from '../lib/futureNativeDisplayPackCards';
import { FUTURE_NATIVE_SCENE_BINDINGS } from '../lib/future-native-families/futureNativeSceneBindingData';
import {
  getFutureNativeFamilyLabel,
  getFutureNativeLibraryCounts,
  getFutureNativeSequenceCounts,
  getRepresentativePresetForFutureNativeFamily,
} from '../lib/presetCatalog';

interface GlobalDisplayFutureNativePacksSectionProps {
  config: ParticleConfig;
  presets: PresetRecord[];
  presetSequence: PresetSequenceItem[];
  isPublicLibrary: boolean;
  onLoadPreset: (presetId: string) => void;
  onAddPresetToSequence: (presetId: string) => void;
}

export const GlobalDisplayFutureNativePacksSection: React.FC<GlobalDisplayFutureNativePacksSectionProps> = ({
  config,
  presets,
  presetSequence,
  isPublicLibrary,
  onLoadPreset,
  onAddPresetToSequence,
}) => {
  const libraryCounts = React.useMemo(() => getFutureNativeLibraryCounts(presets), [presets]);
  const sequenceCounts = React.useMemo(() => getFutureNativeSequenceCounts(presetSequence, presets), [presetSequence, presets]);
  const activeLabels = React.useMemo(() => {
    const labels = new Set<string>();
    [config.layer2Type, config.layer3Type].forEach((modeId) => {
      const binding = FUTURE_NATIVE_SCENE_BINDINGS.find((entry) => entry.modeId === modeId);
      if (!binding) return;
      labels.add(getFutureNativeFamilyLabel(binding.familyId));
    });
    return labels;
  }, [config.layer2Type, config.layer3Type]);

  if (libraryCounts.futureNativePresetCount === 0) return null;

  return (
    <div className="mt-5 rounded border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center gap-2 text-panel uppercase tracking-widest font-bold text-white/70">
        <Layers3 size={12} /> Future-native display packs
      </div>
      <div className="text-panel-sm text-white/40">
        Product-pack style entry cards for the future-native families. Use short names here, then inspect exact presets below.
      </div>
      <div className="mt-3 grid gap-2 xl:grid-cols-2">
        {FUTURE_NATIVE_DISPLAY_PACK_CARDS.map((card) => {
          const representative = getRepresentativePresetForFutureNativeFamily(card.familyLabel, presets);
          const isActive = activeLabels.has(card.familyLabel);
          const libraryCount = libraryCounts.familyCounts[card.familyLabel];
          const queuedCount = sequenceCounts.familyCounts[card.familyLabel];
          return (
            <div
              key={card.id}
              className={`rounded border p-3 ${isActive ? 'border-cyan-300/35 bg-cyan-400/10' : 'border-white/10 bg-black/15'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/38">{card.subtitle}</div>
                  <div className="mt-1 text-xs font-bold text-white/86">{card.label}</div>
                  <div className="mt-1 text-panel-sm leading-relaxed text-white/48">{card.summary}</div>
                </div>
                {isActive ? (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-black">Active</span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/55">library {libraryCount}</span>
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/55">queue {queuedCount}</span>
                {card.emphasis.slice(0, 3).map((item) => (
                  <span key={item} className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/35">{item}</span>
                ))}
              </div>
              <div className="mt-2 rounded border border-white/10 bg-black/20 px-2 py-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/38">Representative preset</div>
                <div className="mt-1 text-panel-sm font-semibold text-white/76">{representative.title}</div>
                <div className="mt-1 text-panel-sm leading-relaxed text-white/40">{representative.summary}</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => representative.preset && onLoadPreset(representative.preset.id)}
                  disabled={!representative.preset}
                  className="rounded border border-white/15 bg-white/5 px-2 py-2 text-panel-sm uppercase tracking-widest text-white/70 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Load preset
                </button>
                <button
                  onClick={() => representative.preset && onAddPresetToSequence(representative.preset.id)}
                  disabled={!representative.preset || isPublicLibrary}
                  className="flex items-center justify-center gap-1 rounded border border-white/15 bg-white/5 px-2 py-2 text-panel-sm uppercase tracking-widest text-white/70 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Plus size={12} /> Queue preset
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded border border-white/10 bg-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/42">
        <Orbit size={12} /> Naming is shortened here for discovery. Exact solver names remain in Presets and Sequence.
      </div>
    </div>
  );
};
