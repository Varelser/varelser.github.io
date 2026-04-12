import React from 'react';
import { Copy, Target } from 'lucide-react';
import type { ProjectFutureNativeSpecialistRouteControlEntry } from '../types';
import type { ProjectFutureNativeCapabilityMatrixRow } from '../lib/projectFutureNativeCapabilityMatrix';
import {
  buildProjectFutureNativeSpecialistAdapterPacketForRow,
  buildProjectFutureNativeSpecialistComparisonPacketForRow,
} from '../lib/projectFutureNativeCapabilityMatrix';
import { buildProjectFutureNativeSpecialistRouteEntries } from '../lib/future-native-families/futureNativeFamiliesSpecialistPackets';
import { buildFutureNativeSpecialistRouteAggregateSummary, hasSpecialistRouteWarning } from '../lib/future-native-families/futureNativeFamiliesSpecialistRouteSummary';
import { buildRouteMetadata } from '../lib/future-native-families/futureNativeFamiliesSpecialistRouteMetadata';
import { buildFutureNativeSpecialistRouteControlPacket } from '../lib/future-native-families/futureNativeSpecialistRouteControls';

interface ControlPanelProjectIOFutureNativeSpecialistRouteControlsProps {
  specialistRouteSummary: ReturnType<typeof buildFutureNativeSpecialistRouteAggregateSummary>;
  specialistRouteEntries: ReturnType<typeof buildProjectFutureNativeSpecialistRouteEntries>;
  normalizedSpecialistRouteControls: ProjectFutureNativeSpecialistRouteControlEntry[];
  matrixRowByFamily: Map<string, ProjectFutureNativeCapabilityMatrixRow>;
  specialistRouteControlDiffsByFamily: Map<string, string[]>;
  onResetSpecialistRouteControls: () => void;
  onUpdateSpecialistRouteControl: (
    familyId: ProjectFutureNativeSpecialistRouteControlEntry['familyId'],
    patch: Partial<ProjectFutureNativeSpecialistRouteControlEntry>,
  ) => void;
  onFocusFamily: (familyId: string) => void;
  onCopyText: (value: string) => void | Promise<void>;
}

export const ControlPanelProjectIOFutureNativeSpecialistRouteControls: React.FC<ControlPanelProjectIOFutureNativeSpecialistRouteControlsProps> = ({
  specialistRouteSummary,
  specialistRouteEntries,
  normalizedSpecialistRouteControls,
  matrixRowByFamily,
  specialistRouteControlDiffsByFamily,
  onResetSpecialistRouteControls,
  onUpdateSpecialistRouteControl,
  onFocusFamily,
  onCopyText,
}) => (
  <div className="mt-3 rounded border border-violet-300/15 bg-violet-500/[0.05] p-3">
    <div className="flex items-center justify-between gap-2">
      <div className="text-[10px] uppercase tracking-[0.22em] text-violet-100/72">Specialist route controls</div>
      <button
        onClick={onResetSpecialistRouteControls}
        className="rounded border border-violet-300/20 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-violet-100/65 transition-colors hover:bg-white/[0.06]"
      >
        Reset specialist
      </button>
    </div>
    <div className="mt-2 flex flex-wrap gap-1">
      <span className="rounded border border-violet-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-violet-100/75">routes {specialistRouteSummary.routeCount}</span>
      <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/50">manual {specialistRouteSummary.manualSelectionCount}</span>
      <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/50">pinned {specialistRouteSummary.pinnedOverrideCount}</span>
      <span className="rounded border border-amber-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-amber-100/75">warning routes {specialistRouteSummary.warningRouteCount}</span>
    </div>
    <div className="mt-2 text-panel-sm leading-relaxed text-white/42">
      selected adapter / target switch / override をここで直接編集できます。auto では既定 adapter に戻り、manual では export packet と保存対象が同期します。
    </div>
    <div className="mt-3 grid gap-2 xl:grid-cols-2">
      {specialistRouteEntries.map((route) => {
        const metadata = buildRouteMetadata(route.familyId as any);
        const control = normalizedSpecialistRouteControls.find((entry) => entry.familyId === route.familyId);
        const row = matrixRowByFamily.get(route.familyId);
        const hasWarning = hasSpecialistRouteWarning(route);
        const controlDiffValues = specialistRouteControlDiffsByFamily.get(route.familyId) ?? [];
        return (
          <div key={`specialist-control-${route.familyId}`} className={`rounded border p-3 ${hasWarning ? 'border-amber-300/20 bg-amber-500/[0.04]' : 'border-white/10 bg-black/20'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/38">{route.routeLabel}</div>
                <div className="mt-1 text-xs font-semibold text-white/84">{route.title}</div>
                <div className="mt-1 text-panel-sm text-white/46">{route.selectedAdapterLabel} · {route.executionTarget.replace(/^hybrid:/u, '')}</div>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${hasWarning ? 'border-amber-300/20 text-amber-100/75' : 'border-violet-300/20 text-violet-100/75'}`}>{control?.overrideMode ?? 'auto'}</span>
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">{control?.overrideDisposition ?? 'advisory'}</span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {controlDiffValues.length > 0 ? controlDiffValues.map((value) => (
                <span key={`${route.familyId}:${value}`} className="rounded border border-cyan-300/15 bg-cyan-500/[0.05] px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-cyan-100/70">{value.replace(/^.*->/u, '')}</span>
              )) : <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/40">default-aligned</span>}
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-2">
              <label className="rounded border border-white/10 bg-black/20 px-2 py-1.5">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/34">Override mode</div>
                <select
                  value={control?.overrideMode ?? 'auto'}
                  onChange={(event) => onUpdateSpecialistRouteControl(route.familyId, { overrideMode: event.target.value === 'manual' ? 'manual' : 'auto' })}
                  className="mt-1 w-full bg-transparent text-[11px] uppercase tracking-[0.16em] text-white/72 outline-none"
                >
                  <option value="auto">auto</option>
                  <option value="manual">manual</option>
                </select>
              </label>
              <label className="rounded border border-white/10 bg-black/20 px-2 py-1.5">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/34">Selected adapter</div>
                <select
                  value={control?.selectedAdapterId ?? metadata.adapterOptions[0].id}
                  onChange={(event) => onUpdateSpecialistRouteControl(route.familyId, { selectedAdapterId: event.target.value, overrideMode: 'manual' })}
                  disabled={control?.overrideMode !== 'manual'}
                  className="mt-1 w-full bg-transparent text-[11px] text-white/72 outline-none disabled:opacity-35"
                >
                  {metadata.adapterOptions.map((option) => (
                    <option key={`${route.familyId}:adapter:${option.id}`} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="rounded border border-white/10 bg-black/20 px-2 py-1.5">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/34">Target switch</div>
                <select
                  value={control?.selectedExecutionTarget ?? metadata.adapterOptions[0].executionTarget}
                  onChange={(event) => onUpdateSpecialistRouteControl(route.familyId, { selectedExecutionTarget: event.target.value, overrideMode: 'manual' })}
                  disabled={control?.overrideMode !== 'manual'}
                  className="mt-1 w-full bg-transparent text-[11px] text-white/72 outline-none disabled:opacity-35"
                >
                  {metadata.adapterOptions.map((option) => (
                    <option key={`${route.familyId}:target:${option.executionTarget}`} value={option.executionTarget}>{option.executionTarget.replace(/^hybrid:/u, '')}</option>
                  ))}
                </select>
              </label>
              <label className="rounded border border-white/10 bg-black/20 px-2 py-1.5">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/34">Override candidate</div>
                <select
                  value={control?.overrideCandidateId ?? metadata.adapterOptions[0].overrideCandidate}
                  onChange={(event) => onUpdateSpecialistRouteControl(route.familyId, { overrideCandidateId: event.target.value, overrideMode: 'manual' })}
                  disabled={control?.overrideMode !== 'manual'}
                  className="mt-1 w-full bg-transparent text-[11px] text-white/72 outline-none disabled:opacity-35"
                >
                  {metadata.adapterOptions.map((option) => (
                    <option key={`${route.familyId}:override:${option.overrideCandidate}`} value={option.overrideCandidate}>{option.overrideCandidate.replace(/^override:/u, '')}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <label className="rounded border border-white/10 bg-black/20 px-2 py-1.5">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/34">Override disposition</div>
                <select
                  value={control?.overrideDisposition ?? 'advisory'}
                  onChange={(event) => onUpdateSpecialistRouteControl(route.familyId, { overrideDisposition: event.target.value === 'pinned' ? 'pinned' : 'advisory' })}
                  className="mt-1 w-full bg-transparent text-[11px] uppercase tracking-[0.16em] text-white/72 outline-none"
                >
                  <option value="advisory">advisory</option>
                  <option value="pinned">pinned</option>
                </select>
              </label>
              <div className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-panel-sm text-white/45">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/34">Fallback reason</div>
                <div className="mt-1 leading-relaxed">{route.fallbackReasonValues.find((value) => value.startsWith('fallbackReason:'))?.replace('fallbackReason:', '') ?? 'none'}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
              <button
                onClick={() => void onCopyText(buildFutureNativeSpecialistRouteControlPacket(route))}
                className="flex items-center justify-center gap-1 rounded border border-violet-300/15 bg-violet-500/[0.05] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-violet-100/70 transition-colors hover:bg-violet-500/[0.12]"
                title={`Copy control packet for ${route.familyId}`}
              >
                <Copy size={11} /> Copy control
              </button>
              <button
                onClick={() => onFocusFamily(route.familyId)}
                className="flex items-center justify-center gap-1 rounded border border-white/15 bg-white/[0.03] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/56 transition-colors hover:bg-white/[0.08]"
                title={`Focus ${route.familyId}`}
              >
                <Target size={11} /> Focus family
              </button>
              {row ? (
                <button
                  onClick={() => void onCopyText(buildProjectFutureNativeSpecialistAdapterPacketForRow(row))}
                  className="flex items-center justify-center gap-1 rounded border border-cyan-300/15 bg-cyan-500/[0.05] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-cyan-100/70 transition-colors hover:bg-cyan-500/[0.12]"
                  title={`Copy adapter packet for ${route.familyId}`}
                >
                  <Copy size={11} /> Copy adapter
                </button>
              ) : <div />}
              {row ? (
                <button
                  onClick={() => void onCopyText(buildProjectFutureNativeSpecialistComparisonPacketForRow(row))}
                  className="flex items-center justify-center gap-1 rounded border border-amber-300/15 bg-amber-500/[0.05] px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-amber-100/70 transition-colors hover:bg-amber-500/[0.12]"
                  title={`Copy comparison packet for ${route.familyId}`}
                >
                  <Copy size={11} /> Copy compare
                </button>
              ) : <div />}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
