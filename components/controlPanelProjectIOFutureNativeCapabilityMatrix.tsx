import React from 'react';
import { Copy, Search, Target } from 'lucide-react';
import type { ParticleConfig, ProjectManifest } from '../types';
import {
  buildProjectFutureNativeCapabilityMatrix,
  buildProjectFutureNativeFamilyFocusPacket,
  buildProjectFutureNativeRepresentativePresetPacket,
  buildProjectFutureNativeRouteFocusPacket,
  buildProjectFutureNativeSpecialistAdapterPacketForRow,
  buildProjectFutureNativeSpecialistComparisonPacketForRow,
  buildProjectFutureNativeSpecialistOperatorPacketForRow,
  buildProjectFutureNativeSpecialistPacket,
  type ProjectFutureNativeCapabilityMatrix,
} from '../lib/projectFutureNativeCapabilityMatrix';

const EXPOSURE_BADGE_CLASS: Record<string, string> = {
  'scene-bound': 'border-emerald-300/25 bg-emerald-500/10 text-emerald-100/80',
  'preset-only': 'border-cyan-300/25 bg-cyan-500/10 text-cyan-100/80',
  'specialist-preview': 'border-violet-300/25 bg-violet-500/10 text-violet-100/80',
  'report-only': 'border-white/10 bg-white/[0.05] text-white/45',
};

type ExposureStatus = 'all' | 'scene-bound' | 'preset-only' | 'specialist-preview' | 'report-only';
type StatusFilter = 'all' | 'active' | 'manifest' | 'inactive';

interface ControlPanelProjectIOFutureNativeCapabilityMatrixProps {
  matrix: ProjectFutureNativeCapabilityMatrix;
  filteredRows: ReturnType<typeof buildProjectFutureNativeCapabilityMatrix>['rows'];
  currentConfig: ParticleConfig;
  projectManifest: ProjectManifest;
  warningFamilyCount: number;
  searchText: string;
  warningsOnly: boolean;
  exposureStatus: ExposureStatus;
  statusFilter: StatusFilter;
  specialistRouteControlDiffsByFamily: Map<string, string[]>;
  onSetSearchText: React.Dispatch<React.SetStateAction<string>>;
  onSetWarningsOnly: React.Dispatch<React.SetStateAction<boolean>>;
  onSetExposureStatus: React.Dispatch<React.SetStateAction<ExposureStatus>>;
  onSetStatusFilter: React.Dispatch<React.SetStateAction<StatusFilter>>;
  onFocusFamily: (familyId: string) => void;
  onCopyText: (value: string) => void | Promise<void>;
}

export const ControlPanelProjectIOFutureNativeCapabilityMatrix: React.FC<ControlPanelProjectIOFutureNativeCapabilityMatrixProps> = ({
  matrix,
  filteredRows,
  currentConfig,
  projectManifest,
  warningFamilyCount,
  searchText,
  warningsOnly,
  exposureStatus,
  statusFilter,
  specialistRouteControlDiffsByFamily,
  onSetSearchText,
  onSetWarningsOnly,
  onSetExposureStatus,
  onSetStatusFilter,
  onFocusFamily,
  onCopyText,
}) => (
  <div className="mt-3 rounded border border-white/10 bg-white/[0.03] p-3">
    <div className="flex items-center justify-between gap-2">
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/38">Capability matrix</div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/30">families {matrix.totalFamilies}</div>
    </div>
    <div className="mt-2 flex flex-wrap gap-1">
      <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/50">active {matrix.activeFamilies}</span>
      <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/50">manifest {matrix.manifestFamilies}</span>
      <button onClick={() => onSetExposureStatus('scene-bound')} className="rounded border border-emerald-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-emerald-100/75">scene-bound {matrix.sceneBoundFamilies}</button>
      <button onClick={() => onSetExposureStatus('preset-only')} className="rounded border border-cyan-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-cyan-100/75">preset-only {matrix.presetOnlyFamilies}</button>
      <button onClick={() => onSetExposureStatus('specialist-preview')} className="rounded border border-violet-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-violet-100/75">specialist {matrix.specialistPreviewFamilies}</button>
      <button onClick={() => onSetWarningsOnly((value) => !value)} className="rounded border border-amber-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-amber-100/75">warning families {warningFamilyCount}</button>
    </div>
    <div className="mt-3 grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
      <label className="flex items-center gap-2 rounded border border-white/10 bg-black/20 px-2 py-1.5 text-[11px] text-white/56">
        <Search size={12} className="text-white/30" />
        <input
          value={searchText}
          onChange={(event) => onSetSearchText(event.target.value)}
          placeholder="Search family, warning, preset"
          className="w-full bg-transparent text-[11px] text-white/80 outline-none placeholder:text-white/22"
        />
      </label>
      <select
        value={statusFilter}
        onChange={(event) => onSetStatusFilter(event.target.value as StatusFilter)}
        className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-[11px] uppercase tracking-[0.16em] text-white/60"
      >
        <option value="all">all status</option>
        <option value="active">active</option>
        <option value="manifest">manifest</option>
        <option value="inactive">inactive</option>
      </select>
      <button
        onClick={() => {
          onSetSearchText('');
          onSetWarningsOnly(false);
          onSetExposureStatus('all');
          onSetStatusFilter('all');
        }}
        className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/55 transition-colors hover:bg-white/[0.06]"
      >
        Reset filters
      </button>
    </div>
    <div className="mt-2 flex flex-wrap gap-1">
      <button onClick={() => onSetStatusFilter('active')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${statusFilter === 'active' ? 'border-emerald-300/20 bg-emerald-500/[0.08] text-emerald-100/80' : 'border-white/10 text-white/38'}`}>active only</button>
      <button onClick={() => onSetStatusFilter('manifest')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${statusFilter === 'manifest' ? 'border-cyan-300/20 bg-cyan-500/[0.08] text-cyan-100/80' : 'border-white/10 text-white/38'}`}>manifest only</button>
      <button onClick={() => onSetStatusFilter('inactive')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${statusFilter === 'inactive' ? 'border-white/20 bg-white/[0.08] text-white/75' : 'border-white/10 text-white/38'}`}>inactive only</button>
      <button onClick={() => onSetExposureStatus('all')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${exposureStatus === 'all' ? 'border-violet-300/20 bg-violet-500/[0.08] text-violet-100/80' : 'border-white/10 text-white/38'}`}>all exposure</button>
    </div>
    <div className="mt-3 grid gap-2 xl:grid-cols-2">
      {filteredRows.map((row) => {
        const isSpecialistPreview = row.uiExposureStatus === 'specialist-preview';
        const specialistControlDiffValues = specialistRouteControlDiffsByFamily.get(row.familyId) ?? [];
        return (
          <div key={row.familyId} className="rounded border border-white/10 bg-black/20 p-3 text-panel-sm text-white/55">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-white/84">{row.title}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/34">{row.familyId}</div>
              </div>
              <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${EXPOSURE_BADGE_CLASS[row.uiExposureStatus] ?? 'border-white/10 text-white/45'}`}>
                {row.uiExposureLabel}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">routes {row.currentRouteCount}/{row.manifestRouteCount}</span>
              <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">presets {row.presetCount}</span>
              <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">scene {row.sceneBindingCount}</span>
              {row.supportsDirectSceneActivation ? <span className="rounded border border-emerald-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-emerald-100/75">direct activate</span> : null}
            </div>
            {row.representativePresetId ? <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/28">representative {row.representativePresetId}</div> : null}
            {row.warnings.length > 0 ? <div className="mt-2 text-panel-sm leading-relaxed text-amber-100/70">{row.warnings.join(' · ')}</div> : <div className="mt-2 text-panel-sm leading-relaxed text-emerald-100/55">No current warnings</div>}
            {isSpecialistPreview ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {specialistControlDiffValues.length > 0 ? specialistControlDiffValues.map((value) => (
                  <span key={`${row.familyId}:${value}`} className="rounded border border-violet-300/15 bg-violet-500/[0.05] px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-violet-100/70">{value.replace(/^.*->/u, '')}</span>
                )) : <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/40">default-aligned</span>}
              </div>
            ) : null}
            <div className={`mt-3 grid grid-cols-2 gap-2 ${isSpecialistPreview ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>
              <button
                onClick={() => onFocusFamily(row.familyId)}
                className="flex items-center justify-center gap-1 rounded border border-white/15 bg-white/[0.03] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/56 transition-colors hover:bg-white/[0.08]"
                title={`Focus ${row.familyId}`}
              >
                <Target size={11} /> Focus family
              </button>
              <button
                onClick={() => void onCopyText(buildProjectFutureNativeFamilyFocusPacket(row, currentConfig, projectManifest))}
                className="flex items-center justify-center gap-1 rounded border border-cyan-300/15 bg-cyan-500/[0.05] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-cyan-100/70 transition-colors hover:bg-cyan-500/[0.12]"
                title={`Copy ${row.familyId} focus packet`}
              >
                <Copy size={11} /> Copy family
              </button>
              {row.representativePresetId ? (
                <button
                  onClick={() => void onCopyText(buildProjectFutureNativeRepresentativePresetPacket(row, currentConfig, projectManifest))}
                  className="flex items-center justify-center gap-1 rounded border border-emerald-300/15 bg-emerald-500/[0.05] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-emerald-100/70 transition-colors hover:bg-emerald-500/[0.12]"
                  title={`Copy representative preset packet for ${row.familyId}`}
                >
                  <Copy size={11} /> Copy preset
                </button>
              ) : null}
              {(row.currentRouteCount > 0 || row.manifestRouteCount > 0) ? (
                <button
                  onClick={() => void onCopyText(isSpecialistPreview ? buildProjectFutureNativeSpecialistPacket(row, currentConfig, projectManifest) : buildProjectFutureNativeRouteFocusPacket(row, currentConfig, projectManifest))}
                  className="flex items-center justify-center gap-1 rounded border border-violet-300/15 bg-violet-500/[0.05] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-violet-100/70 transition-colors hover:bg-violet-500/[0.12]"
                  title={isSpecialistPreview ? `Copy specialist packet for ${row.familyId}` : `Copy route packet for ${row.familyId}`}
                >
                  <Copy size={11} /> {isSpecialistPreview ? 'Copy specialist' : 'Copy routes'}
                </button>
              ) : null}
              {isSpecialistPreview ? (
                <>
                  <button
                    onClick={() => void onCopyText(buildProjectFutureNativeSpecialistOperatorPacketForRow(row))}
                    className="flex items-center justify-center gap-1 rounded border border-white/15 bg-white/[0.03] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/62 transition-colors hover:bg-white/[0.08]"
                    title={`Copy operator packet for ${row.familyId}`}
                  >
                    <Copy size={11} /> Copy operator
                  </button>
                  <button
                    onClick={() => void onCopyText(buildProjectFutureNativeSpecialistAdapterPacketForRow(row))}
                    className="flex items-center justify-center gap-1 rounded border border-cyan-300/15 bg-cyan-500/[0.05] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-cyan-100/70 transition-colors hover:bg-cyan-500/[0.12]"
                    title={`Copy adapter packet for ${row.familyId}`}
                  >
                    <Copy size={11} /> Copy adapter
                  </button>
                  <button
                    onClick={() => void onCopyText(buildProjectFutureNativeSpecialistComparisonPacketForRow(row))}
                    className="flex items-center justify-center gap-1 rounded border border-amber-300/15 bg-amber-500/[0.05] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-amber-100/70 transition-colors hover:bg-amber-500/[0.12]"
                    title={`Copy comparison packet for ${row.familyId}`}
                  >
                    <Copy size={11} /> Copy compare
                  </button>
                </>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
