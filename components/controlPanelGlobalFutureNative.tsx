import React from 'react';
import { Copy, Layers2, Orbit, Plus, Search } from 'lucide-react';
import {
  FUTURE_NATIVE_FAMILY_LABELS,
  getFutureNativeFamilyLabel,
  getFutureNativeLibraryCounts,
  getFutureNativeSequenceCounts,
  getRepresentativePresetForFutureNativeFamily,
  type FutureNativeFamilyLabel,
} from '../lib/presetCatalog';
import { FUTURE_NATIVE_SCENE_BINDINGS, type FutureNativeSceneBinding } from '../lib/future-native-families/futureNativeSceneBindingData';
import { buildFutureNativeScenePresetPatch } from '../lib/future-native-families/futureNativeSceneBindings';
import { listFutureNativeSpecialistUiPreviews } from '../lib/futureNativeSpecialistUiPreview';
import {
  buildFutureNativeSpecialistAdapterPacket,
  buildFutureNativeSpecialistComparisonPacket,
  buildFutureNativeSpecialistOperatorPacket,
} from '../lib/future-native-families/futureNativeSpecialistOperatorPackets';
import { buildFutureNativeFamilyCatalog } from '../lib/futureNativeFamilyCatalog';
import { ControlPanelContentProps } from './controlPanelTabsShared';

const FAMILY_ACCENT_CLASS: Record<FutureNativeFamilyLabel, string> = {
  MPM: 'border-white/15 bg-white/[0.04] text-white/78',
  PBD: 'border-white/15 bg-white/[0.04] text-white/78',
  Fracture: 'border-white/15 bg-white/[0.04] text-white/78',
  Volumetric: 'border-white/15 bg-white/[0.04] text-white/78',
};

const DETAILED_FAMILY_GROUP_LABELS: Record<string, string> = {
  mpm: 'MPM',
  pbd: 'PBD',
  fracture: 'Fracture',
  volumetric: 'Volumetric',
  'specialist-native': 'Specialist',
};

const EXPOSURE_BADGE_CLASS: Record<string, string> = {
  'scene-bound': 'border-emerald-300/25 bg-emerald-500/10 text-emerald-100/80',
  'preset-only': 'border-cyan-300/25 bg-cyan-500/10 text-cyan-100/80',
  'specialist-preview': 'border-violet-300/25 bg-violet-500/10 text-violet-100/80',
  'report-only': 'border-white/10 bg-white/[0.05] text-white/45',
};

async function copyText(value: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
  }
}

function matchesFamilySearch(query: string, values: string[]) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) => value.toLowerCase().includes(normalized));
}

export const GlobalFutureNativeSection: React.FC<ControlPanelContentProps> = ({
  config,
  isPublicLibrary,
  onAddPresetToSequence,
  onLoadPreset,
  presetSequence,
  presets,
  updateConfig,
}) => {
  const libraryCounts = React.useMemo(() => getFutureNativeLibraryCounts(presets), [presets]);
  const sequenceCounts = React.useMemo(() => getFutureNativeSequenceCounts(presetSequence, presets), [presetSequence, presets]);
  const activeFamilyLabels = React.useMemo(() => {
    const labels = new Set<FutureNativeFamilyLabel>();
    [config.layer2Type, config.layer3Type].forEach((modeId) => {
      const binding = FUTURE_NATIVE_SCENE_BINDINGS.find((entry) => entry.modeId === modeId);
      if (!binding) return;
      labels.add(getFutureNativeFamilyLabel(binding.familyId));
    });
    return labels;
  }, [config.layer2Type, config.layer3Type]);

  const activeDetailedFamilies = React.useMemo(() => {
    const ids = new Set<string>();
    [config.layer2Type, config.layer3Type].forEach((modeId) => {
      const binding = FUTURE_NATIVE_SCENE_BINDINGS.find((entry) => entry.modeId === modeId);
      if (!binding) return;
      ids.add(binding.familyId);
    });
    return ids;
  }, [config.layer2Type, config.layer3Type]);

  const representatives = React.useMemo(
    () => FUTURE_NATIVE_FAMILY_LABELS.map((familyLabel) => getRepresentativePresetForFutureNativeFamily(familyLabel, presets)),
    [presets],
  );

  const detailedCatalog = React.useMemo(() => buildFutureNativeFamilyCatalog(presets), [presets]);

  const specialistPreviews = React.useMemo(() => listFutureNativeSpecialistUiPreviews(), []);
  const [catalogSearchText, setCatalogSearchText] = React.useState('');
  const [catalogExposureStatus, setCatalogExposureStatus] = React.useState<'all' | 'scene-bound' | 'preset-only' | 'specialist-preview' | 'report-only'>('all');

  const filteredDetailedCatalog = React.useMemo(() => detailedCatalog.filter((entry) => {
    if (catalogExposureStatus !== 'all' && entry.uiExposureStatus !== catalogExposureStatus) return false;
    return matchesFamilySearch(catalogSearchText, [
      entry.familyId,
      entry.group,
      entry.title,
      entry.summary,
      entry.stage,
      entry.uiExposureLabel,
      entry.representativePresetId ?? '',
      ...entry.bindingModes,
      ...entry.targetBehaviors,
    ]);
  }), [catalogExposureStatus, catalogSearchText, detailedCatalog]);

  const filteredSpecialistPreviews = React.useMemo(() => specialistPreviews.filter((preview) => {
    if (catalogExposureStatus !== 'all' && catalogExposureStatus !== 'specialist-preview') return false;
    return matchesFamilySearch(catalogSearchText, [
      preview.familyId,
      preview.title,
      preview.routeId,
      preview.routeLabel,
      preview.selectedAdapterId,
      preview.executionTarget,
      preview.comparisonSignature,
      ...preview.warningValues,
    ]);
  }), [catalogExposureStatus, catalogSearchText, specialistPreviews]);

  const applySceneBindingToLayer = React.useCallback((binding: FutureNativeSceneBinding, layerIndex: 2 | 3) => {
    const patch = buildFutureNativeScenePresetPatch(binding.primaryPresetId, layerIndex)
      ?? {
        [(layerIndex === 2 ? 'layer2Enabled' : 'layer3Enabled')]: true,
        [(layerIndex === 2 ? 'layer2Type' : 'layer3Type')]: binding.modeId,
      };
    const enabledKey: 'layer2Enabled' | 'layer3Enabled' = layerIndex === 2 ? 'layer2Enabled' : 'layer3Enabled';
    const typeKey: 'layer2Type' | 'layer3Type' = layerIndex === 2 ? 'layer2Type' : 'layer3Type';
    updateConfig(enabledKey, true as any);
    updateConfig(typeKey, binding.modeId as any);
    Object.entries(patch).forEach(([key, value]) => {
      updateConfig(key as keyof typeof config, value as any);
    });
  }, [config, updateConfig]);
  const hasAnyFutureNativeEntry = libraryCounts.futureNativePresetCount > 0 || detailedCatalog.some((entry) => entry.representativePreset);

  if (!hasAnyFutureNativeEntry) return null;

  return (
    <div className="mt-4 rounded border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2 text-panel uppercase font-bold tracking-widest text-white/70">
        <Orbit size={12} /> Future-native overview
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.24em] text-white/40">
        {libraryCounts.futureNativePresetCount} presets exposed • {sequenceCounts.futureNativeStepCount} queued steps • {detailedCatalog.length} families catalogued
      </div>
      <div className="mt-3 grid gap-2 xl:grid-cols-2">
        {representatives.map((representative) => {
          const familyLibraryCount = libraryCounts.familyCounts[representative.familyLabel];
          const familySequenceCount = sequenceCounts.familyCounts[representative.familyLabel];
          const isActive = activeFamilyLabels.has(representative.familyLabel);
          return (
            <div
              key={representative.familyLabel}
              className={`rounded border p-3 ${FAMILY_ACCENT_CLASS[representative.familyLabel]} ${isActive ? 'ring-1 ring-white/20' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/46">
                    {representative.familyLabel}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-white/86">
                    {representative.title}
                  </div>
                  <div className="mt-1 text-[10px] leading-relaxed text-white/52">
                    {representative.summary}
                  </div>
                </div>
                {isActive && (
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-black">
                    Active now
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/55">
                  Library {familyLibraryCount}
                </span>
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/55">
                  Sequence {familySequenceCount}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => representative.preset && onLoadPreset(representative.preset.id)}
                  disabled={!representative.preset}
                  className="rounded border border-white/20 bg-white/5 px-3 py-2 text-panel font-bold uppercase transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Load
                </button>
                <button
                  onClick={() => representative.preset && onAddPresetToSequence(representative.preset.id)}
                  disabled={!representative.preset || isPublicLibrary}
                  className="flex items-center justify-center gap-1 rounded border border-white/20 bg-white/5 px-3 py-2 text-panel font-bold uppercase transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  title={isPublicLibrary ? 'Locked in public build' : 'Add representative preset to sequence'}
                >
                  <Plus size={12} /> Queue
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 rounded border border-white/10 bg-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/42">
        Use this section for family-level entry. Detailed filtering stays below in Presets and Sequence.
      </div>

      <div className="mt-4 rounded border border-white/10 bg-black/20 p-3">
        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Detailed family catalog</div>
        <div className="mt-1 text-panel-sm leading-relaxed text-white/42">
          All 22 future-native families are listed here. Scene-bound families can be activated directly into layer 2 / layer 3, while specialist packet families expose their packet target and adapter preview below.
        </div>
        <div className="mt-3 grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <label className="flex items-center gap-2 rounded border border-white/10 bg-black/20 px-2 py-1.5 text-[11px] text-white/56">
            <Search size={12} className="text-white/30" />
            <input
              value={catalogSearchText}
              onChange={(event) => setCatalogSearchText(event.target.value)}
              placeholder="Search family, preset, behavior"
              className="w-full bg-transparent text-[11px] text-white/80 outline-none placeholder:text-white/22"
            />
          </label>
          <select
            value={catalogExposureStatus}
            onChange={(event) => setCatalogExposureStatus(event.target.value as 'all' | 'scene-bound' | 'preset-only' | 'specialist-preview' | 'report-only')}
            className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-[11px] uppercase tracking-[0.16em] text-white/60"
          >
            <option value="all">all exposure</option>
            <option value="scene-bound">scene-bound</option>
            <option value="preset-only">preset-only</option>
            <option value="specialist-preview">specialist</option>
            <option value="report-only">report-only</option>
          </select>
          <button
            onClick={() => {
              setCatalogSearchText('');
              setCatalogExposureStatus('all');
            }}
            className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/48 transition-colors hover:bg-white/[0.06]"
          >
            Reset catalog
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">filtered {filteredDetailedCatalog.length}</span>
          <button onClick={() => setCatalogExposureStatus('all')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${catalogExposureStatus === 'all' ? 'border-white/20 bg-white/[0.08] text-white/75' : 'border-white/10 text-white/38'}`}>all</button>
          <button onClick={() => setCatalogExposureStatus('scene-bound')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${catalogExposureStatus === 'scene-bound' ? 'border-emerald-300/20 bg-emerald-500/[0.08] text-emerald-100/80' : 'border-white/10 text-white/38'}`}>scene-bound</button>
          <button onClick={() => setCatalogExposureStatus('preset-only')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${catalogExposureStatus === 'preset-only' ? 'border-cyan-300/20 bg-cyan-500/[0.08] text-cyan-100/80' : 'border-white/10 text-white/38'}`}>preset-only</button>
          <button onClick={() => setCatalogExposureStatus('specialist-preview')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${catalogExposureStatus === 'specialist-preview' ? 'border-violet-300/20 bg-violet-500/[0.08] text-violet-100/80' : 'border-white/10 text-white/38'}`}>specialist</button>
          <button onClick={() => setCatalogExposureStatus('report-only')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${catalogExposureStatus === 'report-only' ? 'border-white/20 bg-white/[0.08] text-white/75' : 'border-white/10 text-white/38'}`}>report-only</button>
        </div>
        <div className="mt-3 grid gap-2 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredDetailedCatalog.map((entry) => {
            const isActive = activeDetailedFamilies.has(entry.familyId);
            const tagClass = EXPOSURE_BADGE_CLASS[entry.uiExposureStatus] ?? EXPOSURE_BADGE_CLASS['report-only'];
            return (
              <div key={entry.familyId} className={`rounded border p-3 ${isActive ? 'border-cyan-300/35 bg-cyan-400/10' : 'border-white/10 bg-white/[0.03]'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/38">{DETAILED_FAMILY_GROUP_LABELS[entry.group]}</div>
                    <div className="mt-1 text-xs font-semibold text-white/86">{entry.title}</div>
                    <div className="mt-1 text-panel-sm leading-relaxed text-white/48">{entry.summary}</div>
                  </div>
                  {isActive ? <span className="rounded-full bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-black">Active</span> : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${tagClass}`}>{entry.uiExposureLabel}</span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/55">routes {entry.routeCount}</span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/55">presets {entry.presetCount}</span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/35">{entry.stage}</span>
                </div>
                {entry.bindingModes.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.bindingModes.slice(0, 3).map((bindingMode) => (
                      <span key={`${entry.familyId}:${bindingMode}`} className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/35">{bindingMode}</span>
                    ))}
                  </div>
                ) : null}
                {entry.targetBehaviors.length > 0 ? (
                  <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/32">
                    {entry.targetBehaviors.slice(0, 4).join(' · ')}
                  </div>
                ) : null}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => entry.representativePreset && onLoadPreset(entry.representativePreset.id)}
                    disabled={!entry.representativePreset}
                    className="rounded border border-white/20 bg-white/5 px-3 py-2 text-panel font-bold uppercase transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    title={entry.representativePreset ? entry.representativePreset.id : 'No representative preset available'}
                  >
                    Load preset
                  </button>
                  <button
                    onClick={() => entry.representativePreset && onAddPresetToSequence(entry.representativePreset.id)}
                    disabled={!entry.representativePreset || isPublicLibrary}
                    className="flex items-center justify-center gap-1 rounded border border-white/20 bg-white/5 px-3 py-2 text-panel font-bold uppercase transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    title={isPublicLibrary ? 'Locked in public build' : entry.representativePreset ? `Queue ${entry.representativePreset.id}` : 'No representative preset available'}
                  >
                    <Plus size={12} /> Queue
                  </button>
                </div>

                {entry.sceneBindings.length > 0 ? (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => applySceneBindingToLayer(entry.sceneBindings[0], 2)}
                      className="flex items-center justify-center gap-1 rounded border border-cyan-300/25 bg-cyan-500/10 px-3 py-2 text-panel font-bold uppercase text-cyan-100/85 transition-colors hover:bg-cyan-500/20"
                      title={`Activate ${entry.sceneBindings[0].modeId} on layer 2`}
                    >
                      <Layers2 size={12} /> Activate L2
                    </button>
                    <button
                      onClick={() => applySceneBindingToLayer(entry.sceneBindings[0], 3)}
                      className="flex items-center justify-center gap-1 rounded border border-cyan-300/25 bg-cyan-500/10 px-3 py-2 text-panel font-bold uppercase text-cyan-100/85 transition-colors hover:bg-cyan-500/20"
                      title={`Activate ${entry.sceneBindings[0].modeId} on layer 3`}
                    >
                      <Layers2 size={12} /> Activate L3
                    </button>
                  </div>
                ) : null}
                {entry.representativePresetId ? (
                  <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/30">representative {entry.representativePresetId}</div>
                ) : (
                  <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/24">No representative preset packaged yet</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded border border-white/10 bg-black/20 p-3">
        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Specialist packet preview rail</div>
        <div className="mt-1 text-panel-sm leading-relaxed text-white/42">
          Specialist families stay outside the main scene-binding rail, but their route packet, adapter, and execution target are visible here for direct operator review.
        </div>
        <div className="mt-3 grid gap-2 xl:grid-cols-2">
          {filteredSpecialistPreviews.map((preview) => (
            <div key={preview.familyId} className="rounded border border-violet-300/20 bg-violet-500/5 p-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-violet-100/55">Specialist packet</div>
              <div className="mt-1 text-xs font-semibold text-white/86">{preview.familyId}</div>
              <div className="mt-1 text-panel-sm leading-relaxed text-white/50">{preview.routeLabel}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/55">adapter {preview.selectedAdapterId}</span>
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/55">target {preview.executionTarget}</span>
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/32">{preview.comparisonSignature}</div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/28">warnings {preview.warningValues.length > 0 ? preview.warningValues.join(' · ') : 'none'}</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  onClick={() => void copyText(buildFutureNativeSpecialistOperatorPacket(preview.familyId))}
                  className="flex items-center justify-center gap-1 rounded border border-violet-300/20 bg-violet-500/[0.08] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-violet-100/78 transition-colors hover:bg-violet-500/[0.16]"
                  title={`Copy operator packet for ${preview.familyId}`}
                >
                  <Copy size={11} /> Operator
                </button>
                <button
                  onClick={() => void copyText(buildFutureNativeSpecialistAdapterPacket(preview.familyId))}
                  className="flex items-center justify-center gap-1 rounded border border-cyan-300/20 bg-cyan-500/[0.08] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-cyan-100/78 transition-colors hover:bg-cyan-500/[0.16]"
                  title={`Copy adapter packet for ${preview.familyId}`}
                >
                  <Copy size={11} /> Adapter
                </button>
                <button
                  onClick={() => void copyText(buildFutureNativeSpecialistComparisonPacket(preview.familyId))}
                  className="flex items-center justify-center gap-1 rounded border border-emerald-300/20 bg-emerald-500/[0.08] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-emerald-100/78 transition-colors hover:bg-emerald-500/[0.16]"
                  title={`Copy comparison packet for ${preview.familyId}`}
                >
                  <Copy size={11} /> Compare
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
