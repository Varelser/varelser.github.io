import React from 'react';
import { AlertTriangle, Briefcase, Copy, Orbit } from 'lucide-react';
import type { ParticleConfig, PresetRecord, ProjectManifest, ProjectFutureNativeSpecialistRouteControlEntry } from '../types';
import { FUTURE_NATIVE_FAMILY_LABELS } from '../lib/presetCatalog';
import { getFutureNativeProjectRouteSummary } from '../lib/futureNativePanelSummaries';
import {
  buildProjectFutureNativeCapabilityMatrix,
  buildProjectFutureNativeImplementationPacket,
  buildProjectFutureNativeWarningFocusPacket,
  filterProjectFutureNativeCapabilityRows,
} from '../lib/projectFutureNativeCapabilityMatrix';
import { buildProjectFutureNativeSpecialistRouteEntries } from '../lib/future-native-families/futureNativeFamiliesSpecialistPackets';
import { buildFutureNativeSpecialistRouteAggregateSummary } from '../lib/future-native-families/futureNativeFamiliesSpecialistRouteSummary';
import {
  buildProjectWebgpuCapabilityPacket,
  CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT,
  filterProjectWebgpuCapabilityBuckets,
  getProjectWebgpuCapabilityBuckets,
} from '../lib/projectWebgpuCapabilityCurrent';
import {
  buildProjectIntelMacProofIntakePacket,
  buildProjectIntelMacProofOperatorPacket,
  CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT,
  filterProjectIntelMacProofBlockers,
} from '../lib/projectIntelMacProofCurrent';
import {
  buildProjectDistributionProofBundleManifestDeltaValues,
  buildProjectDistributionProofBundleManifestSummary,
  buildProjectDistributionProofBundlePacket,
  CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
  filterProjectDistributionProofBundles,
  summarizeProjectDistributionProofBundles,
} from '../lib/projectDistributionProofBundleCurrent';
import {
  buildDefaultProjectFutureNativeSpecialistRouteControls,
  buildFutureNativeSpecialistRouteControlDeltaValues,
  buildFutureNativeSpecialistRouteManifestDeltaValues,
  extractFutureNativeSpecialistRouteResolvedControlValues,
  normalizeProjectFutureNativeSpecialistRouteControls,
  patchProjectFutureNativeSpecialistRouteControls,
} from '../lib/future-native-families/futureNativeSpecialistRouteControls';
import {
  buildProjectExportHandoffManifestDeltaValues,
  buildProjectExportHandoffManifestSummary,
  buildProjectExportHandoffPacket,
} from '../lib/projectExportHandoffCurrent';
import {
  buildProjectCloseoutCurrentDeltaValues,
  buildProjectCloseoutCurrentPacket,
  buildProjectCloseoutCurrentSummary,
} from '../lib/projectCloseoutCurrent';
import { ControlPanelProjectIOFutureNativeCapabilityMatrix } from './controlPanelProjectIOFutureNativeCapabilityMatrix';
import { ControlPanelProjectIOFutureNativeExecutionSurfaces } from './controlPanelProjectIOFutureNativeExecutionSurfaces';
import { ControlPanelProjectIOFutureNativeSpecialistRouteControls } from './controlPanelProjectIOFutureNativeSpecialistRouteControls';

interface ControlPanelProjectIOFutureNativeSectionProps {
  currentConfig: ParticleConfig;
  projectManifest: ProjectManifest;
  presets: PresetRecord[];
  futureNativeSpecialistRouteControls: ProjectFutureNativeSpecialistRouteControlEntry[];
  onSetFutureNativeSpecialistRouteControls: React.Dispatch<React.SetStateAction<ProjectFutureNativeSpecialistRouteControlEntry[]>>;
}

async function copyText(value: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
  }
}

export const ControlPanelProjectIOFutureNativeSection: React.FC<ControlPanelProjectIOFutureNativeSectionProps> = ({
  currentConfig,
  projectManifest,
  presets,
  futureNativeSpecialistRouteControls,
  onSetFutureNativeSpecialistRouteControls,
}) => {
  const summary = React.useMemo(
    () => getFutureNativeProjectRouteSummary(currentConfig, projectManifest),
    [currentConfig, projectManifest],
  );
  const matrix = React.useMemo(
    () => buildProjectFutureNativeCapabilityMatrix(currentConfig, projectManifest, presets),
    [currentConfig, projectManifest, presets],
  );
  const implementationPacket = React.useMemo(
    () => buildProjectFutureNativeImplementationPacket(matrix, currentConfig, projectManifest),
    [matrix, currentConfig, projectManifest],
  );
  const normalizedSpecialistRouteControls = React.useMemo(
    () => normalizeProjectFutureNativeSpecialistRouteControls(futureNativeSpecialistRouteControls),
    [futureNativeSpecialistRouteControls],
  );
  const specialistRouteEntries = React.useMemo(
    () => buildProjectFutureNativeSpecialistRouteEntries(normalizedSpecialistRouteControls),
    [normalizedSpecialistRouteControls],
  );
  const specialistRouteSummary = React.useMemo(
    () => buildFutureNativeSpecialistRouteAggregateSummary(specialistRouteEntries),
    [specialistRouteEntries],
  );
  const matrixRowByFamily = React.useMemo(
    () => new Map(matrix.rows.map((row) => [row.familyId, row])),
    [matrix.rows],
  );
  const defaultSpecialistRouteControls = React.useMemo(
    () => buildDefaultProjectFutureNativeSpecialistRouteControls(),
    [],
  );
  const specialistRouteControlDiffsByFamily = React.useMemo(
    () => new Map(
      normalizedSpecialistRouteControls.map((entry) => [
        entry.familyId,
        buildFutureNativeSpecialistRouteControlDeltaValues(entry, defaultSpecialistRouteControls),
      ]),
    ),
    [defaultSpecialistRouteControls, normalizedSpecialistRouteControls],
  );
  const manifestSpecialistRoutes = React.useMemo(
    () => projectManifest.futureNativeSpecialistRoutes ?? [],
    [projectManifest.futureNativeSpecialistRoutes],
  );
  const manifestSpecialistRoutesByFamily = React.useMemo(
    () => new Map(manifestSpecialistRoutes.map((route) => [route.familyId, route])),
    [manifestSpecialistRoutes],
  );
  const specialistManifestDiffsByFamily = React.useMemo(
    () => new Map(
      specialistRouteEntries.map((route) => [
        route.familyId,
        buildFutureNativeSpecialistRouteManifestDeltaValues(route, manifestSpecialistRoutesByFamily.get(route.familyId)),
      ]),
    ),
    [manifestSpecialistRoutesByFamily, specialistRouteEntries],
  );
  const specialistManifestDriftCount = React.useMemo(
    () => specialistRouteEntries.filter((route) => (specialistManifestDiffsByFamily.get(route.familyId) ?? []).length > 0).length,
    [specialistManifestDiffsByFamily, specialistRouteEntries],
  );

  const updateSpecialistRouteControl = React.useCallback((
    familyId: ProjectFutureNativeSpecialistRouteControlEntry['familyId'],
    patch: Partial<ProjectFutureNativeSpecialistRouteControlEntry>,
  ) => {
    onSetFutureNativeSpecialistRouteControls((previous) => patchProjectFutureNativeSpecialistRouteControls(previous, familyId as any, patch));
  }, [onSetFutureNativeSpecialistRouteControls]);
  const resetSpecialistRouteControls = React.useCallback(() => {
    onSetFutureNativeSpecialistRouteControls(normalizeProjectFutureNativeSpecialistRouteControls([]));
  }, [onSetFutureNativeSpecialistRouteControls]);

  const [searchText, setSearchText] = React.useState('');
  const [warningsOnly, setWarningsOnly] = React.useState(false);
  const [exposureStatus, setExposureStatus] = React.useState<'all' | 'scene-bound' | 'preset-only' | 'specialist-preview' | 'report-only'>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'manifest' | 'inactive'>('all');

  const filteredRows = React.useMemo(
    () => filterProjectFutureNativeCapabilityRows(matrix, { searchText, warningsOnly, exposureStatus, statusFilter }),
    [matrix, searchText, warningsOnly, exposureStatus, statusFilter],
  );
  const warningFamilyCount = React.useMemo(
    () => matrix.rows.filter((row) => row.warnings.length > 0).length,
    [matrix.rows],
  );
  const warningPacket = React.useMemo(
    () => buildProjectFutureNativeWarningFocusPacket(filteredRows, { searchText, warningsOnly, exposureStatus, statusFilter }),
    [filteredRows, searchText, warningsOnly, exposureStatus, statusFilter],
  );

  const currentDistributionBundleManifestSummary = React.useMemo(
    () => buildProjectDistributionProofBundleManifestSummary(CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT),
    [],
  );
  const distributionBundleManifestDiffValues = React.useMemo(
    () => buildProjectDistributionProofBundleManifestDeltaValues(projectManifest.distributionProofBundles, CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT),
    [projectManifest.distributionProofBundles],
  );
  const distributionBundleManifestDriftCount = distributionBundleManifestDiffValues.length;
  const exportHandoffCurrentSummary = React.useMemo(
    () => buildProjectExportHandoffManifestSummary({
      summary,
      matrix,
      specialistRouteEntries,
      specialistRouteControlDiffsByFamily,
      specialistManifestDiffsByFamily,
      distributionBundleManifestDriftCount,
      webgpuReport: CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT,
      intelMacReport: CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT,
      distributionBundleReport: CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
    }),
    [
      distributionBundleManifestDriftCount,
      matrix,
      specialistManifestDiffsByFamily,
      specialistRouteControlDiffsByFamily,
      specialistRouteEntries,
      summary,
    ],
  );
  const exportHandoffManifestDiffValues = React.useMemo(
    () => buildProjectExportHandoffManifestDeltaValues(projectManifest.exportHandoff, exportHandoffCurrentSummary),
    [exportHandoffCurrentSummary, projectManifest.exportHandoff],
  );
  const exportHandoffPacket = React.useMemo(
    () => buildProjectExportHandoffPacket(exportHandoffCurrentSummary),
    [exportHandoffCurrentSummary],
  );
  const closeoutCurrentSummary = React.useMemo(
    () => buildProjectCloseoutCurrentSummary({
      handoffSummary: exportHandoffCurrentSummary,
      webgpuReport: CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT,
      intelMacReport: CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT,
      distributionBundleReport: CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
    }),
    [exportHandoffCurrentSummary],
  );
  const closeoutCurrentDiffValues = React.useMemo(
    () => buildProjectCloseoutCurrentDeltaValues(projectManifest.closeoutCurrent, closeoutCurrentSummary),
    [closeoutCurrentSummary, projectManifest.closeoutCurrent],
  );
  const closeoutCurrentPacket = React.useMemo(
    () => buildProjectCloseoutCurrentPacket(closeoutCurrentSummary),
    [closeoutCurrentSummary],
  );

  const focusFamily = React.useCallback((familyId: string) => {
    setSearchText(familyId);
    setWarningsOnly(false);
    setExposureStatus('all');
    setStatusFilter('all');
  }, []);

  if (summary.currentRoutes.length === 0 && summary.manifestRoutes.length === 0 && matrix.totalFamilies === 0) return null;

  return (
    <div className="mb-3 rounded border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-2 text-panel uppercase tracking-widest font-bold text-white/65">
        <div className="flex items-center gap-2"><Orbit size={12} /> Future-native project routes</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void copyText(warningPacket)}
            className="flex items-center gap-1 rounded border border-amber-300/15 bg-amber-500/[0.05] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-100/65 transition-colors hover:bg-amber-500/[0.12]"
            title="Copy filtered warning packet"
          >
            <AlertTriangle size={11} /> Copy warnings
          </button>
          <button
            onClick={() => void copyText(implementationPacket)}
            className="flex items-center gap-1 rounded border border-white/15 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55 transition-colors hover:bg-white/[0.08]"
            title="Copy future-native implementation packet"
          >
            <Copy size={11} /> Copy packet
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {FUTURE_NATIVE_FAMILY_LABELS.map((familyLabel) => (
          <span key={familyLabel} className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/50">
            {familyLabel} {summary.familyCounts[familyLabel]}
          </span>
        ))}
      </div>
      <div className="mt-2 text-panel-sm text-white/42">
        This project export keeps future-native routing in the manifest, so family-level handoff stays visible after save/load.
      </div>

      <ControlPanelProjectIOFutureNativeExecutionSurfaces />

      <ControlPanelProjectIOFutureNativeSpecialistRouteControls
        specialistRouteSummary={specialistRouteSummary}
        specialistRouteEntries={specialistRouteEntries}
        normalizedSpecialistRouteControls={normalizedSpecialistRouteControls}
        matrixRowByFamily={matrixRowByFamily}
        specialistRouteControlDiffsByFamily={specialistRouteControlDiffsByFamily}
        onResetSpecialistRouteControls={resetSpecialistRouteControls}
        onUpdateSpecialistRouteControl={updateSpecialistRouteControl}
        onFocusFamily={focusFamily}
        onCopyText={copyText}
      />

      <ControlPanelProjectIOFutureNativeCapabilityMatrix
        matrix={matrix}
        filteredRows={filteredRows}
        currentConfig={currentConfig}
        projectManifest={projectManifest}
        warningFamilyCount={warningFamilyCount}
        searchText={searchText}
        warningsOnly={warningsOnly}
        exposureStatus={exposureStatus}
        statusFilter={statusFilter}
        specialistRouteControlDiffsByFamily={specialistRouteControlDiffsByFamily}
        onSetSearchText={setSearchText}
        onSetWarningsOnly={setWarningsOnly}
        onSetExposureStatus={setExposureStatus}
        onSetStatusFilter={setStatusFilter}
        onFocusFamily={focusFamily}
        onCopyText={copyText}
      />

      <div className="mt-3 rounded border border-fuchsia-300/15 bg-fuchsia-500/[0.05] p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-100/74">Closeout current packet</div>
            <div className="mt-1 text-panel-sm leading-relaxed text-white/42">
              WebGPU / Intel Mac / distribution advice / export handoff を 1 本の closeout 単位に束ね、最終担当へ渡せます。
            </div>
          </div>
          <button
            onClick={() => void copyText(closeoutCurrentPacket)}
            className="flex items-center gap-1 rounded border border-fuchsia-300/15 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-fuchsia-100/70 transition-colors hover:bg-white/[0.06]"
            title="Copy current closeout packet"
          >
            <Copy size={11} /> Copy closeout
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${closeoutCurrentSummary.repoReady ? 'border-emerald-300/20 bg-emerald-500/[0.05] text-emerald-100/75' : 'border-amber-300/20 bg-amber-500/[0.05] text-amber-100/75'}`}>repo {closeoutCurrentSummary.repoReady ? 'ready' : 'warnings'}</span>
          <span className="rounded border border-fuchsia-300/15 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-fuchsia-100/74">overall {closeoutCurrentSummary.overallCompletionPercent}%</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">routes {closeoutCurrentSummary.routeCount}</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">webgpu {`${closeoutCurrentSummary.webgpuDirectCount}/${closeoutCurrentSummary.webgpuLimitedCount}/${closeoutCurrentSummary.webgpuFallbackOnlyCount}`}</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">intel {closeoutCurrentSummary.intelMacDropProgress} · {closeoutCurrentSummary.intelMacTargetProgress}</span>
          <span className="rounded border border-amber-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-amber-100/75">blockers {closeoutCurrentSummary.intelMacBlockerCount}</span>
        </div>
        <div className="mt-3 grid gap-2 xl:grid-cols-2">
          <div className="rounded border border-white/10 bg-black/20 p-2 text-panel-sm text-white/55">
            <div className="font-semibold text-white/82">Recommended bundles</div>
            <div className="mt-2 grid gap-1 text-[10px] uppercase tracking-[0.18em] text-white/36">
              <div>resume {closeoutCurrentSummary.recommendedResumeBundle}</div>
              <div>proof {closeoutCurrentSummary.recommendedProofBundle}</div>
              <div>intel closeout {closeoutCurrentSummary.recommendedIntelMacBundle}</div>
            </div>
          </div>
          <div className="rounded border border-white/10 bg-black/20 p-2 text-panel-sm text-white/55">
            <div className="font-semibold text-white/82">Operator handoff</div>
            <div className="mt-2 grid gap-1 text-[10px] uppercase tracking-[0.18em] text-white/36">
              <div>verdict {closeoutCurrentSummary.intelMacVerdict}</div>
              <div>real capture {closeoutCurrentSummary.intelMacReadyForRealCapture ? 'ready' : 'pending'}</div>
              <div>host finalize {closeoutCurrentSummary.intelMacReadyForHostFinalize ? 'ready' : 'pending'}</div>
            </div>
            <div className="mt-2 text-panel-sm leading-relaxed text-white/42">
              refresh {closeoutCurrentSummary.operatorCommand}
            </div>
            <div className="mt-1 text-panel-sm leading-relaxed text-white/42">
              ingest {closeoutCurrentSummary.intakeCommand}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 xl:grid-cols-2">
        {summary.currentRoutes.map((route) => (
          <div key={route.key} className="rounded border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/38">Current config · {route.label}</div>
                <div className="mt-1 text-xs font-semibold text-white/84">{route.familyLabel}</div>
                <div className="mt-1 text-panel-sm text-white/46">{route.mode}</div>
              </div>
              <Briefcase size={12} className="text-white/28" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {route.bindingMode ? <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/50">{route.bindingMode}</span> : null}
              {route.primaryPresetId ? <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/38">primary preset</span> : null}
            </div>
            <div className="mt-2 text-panel-sm leading-relaxed text-white/42">{route.reason}</div>
            {route.recommendedPresetIds.length > 0 ? (
              <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/36">
                Recommended preset ids {route.recommendedPresetIds.length}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-3 rounded border border-white/10 bg-white/[0.03] p-3">
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/38">Manifest snapshot</div>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/50">
            routes {summary.manifestRoutes.length}
          </span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/50">
            recommended ids {summary.recommendedPresetIds.length}
          </span>
          <span className="rounded border border-violet-300/15 bg-violet-500/[0.05] px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-violet-100/72">
            specialist snapshot {manifestSpecialistRoutes.length}
          </span>
          <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${specialistManifestDriftCount > 0 ? 'border-amber-300/20 bg-amber-500/[0.05] text-amber-100/75' : 'border-emerald-300/20 bg-emerald-500/[0.05] text-emerald-100/70'}`}>
            specialist drift {specialistManifestDriftCount}
          </span>
          <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${distributionBundleManifestDriftCount > 0 ? 'border-amber-300/20 bg-amber-500/[0.05] text-amber-100/75' : 'border-emerald-300/20 bg-emerald-500/[0.05] text-emerald-100/70'}`}>
            bundle drift {distributionBundleManifestDriftCount}
          </span>
          <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${exportHandoffManifestDiffValues.length > 0 ? 'border-amber-300/20 bg-amber-500/[0.05] text-amber-100/75' : 'border-emerald-300/20 bg-emerald-500/[0.05] text-emerald-100/70'}`}>
            handoff drift {exportHandoffManifestDiffValues.length}
          </span>
          <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${closeoutCurrentDiffValues.length > 0 ? 'border-amber-300/20 bg-amber-500/[0.05] text-amber-100/75' : 'border-emerald-300/20 bg-emerald-500/[0.05] text-emerald-100/70'}`}>
            closeout drift {closeoutCurrentDiffValues.length}
          </span>
        </div>
        {specialistRouteEntries.length > 0 ? (
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-violet-100/62">Specialist route snapshot diff</div>
            <div className="mt-2 grid gap-2 xl:grid-cols-2">
              {specialistRouteEntries.map((route) => {
                const manifestRoute = manifestSpecialistRoutesByFamily.get(route.familyId);
                const manifestDiffValues = specialistManifestDiffsByFamily.get(route.familyId) ?? [];
                const currentResolved = extractFutureNativeSpecialistRouteResolvedControlValues(route);
                const manifestResolved = manifestRoute ? extractFutureNativeSpecialistRouteResolvedControlValues(manifestRoute) : null;
                return (
                  <div key={`manifest-specialist-${route.familyId}`} className="rounded border border-violet-300/15 bg-black/20 p-2 text-panel-sm text-white/55">
                    <div className="font-semibold text-white/82">{route.routeLabel}</div>
                    <div className="mt-1 text-white/42">{route.title}</div>
                    <div className="mt-2 grid gap-1 text-[10px] uppercase tracking-[0.18em] text-white/36">
                      <div>manifest target {manifestResolved?.selectedExecutionTarget ?? 'missing'}</div>
                      <div>manifest adapter {manifestResolved?.selectedAdapterId ?? 'missing'}</div>
                    </div>
                    <div className="mt-2 grid gap-1 text-[10px] uppercase tracking-[0.18em] text-white/36">
                      <div>current target {currentResolved.selectedExecutionTarget}</div>
                      <div>current adapter {currentResolved.selectedAdapterId}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {manifestDiffValues.length > 0 ? manifestDiffValues.map((value) => (
                        <span key={`${route.familyId}:${value}`} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${value === 'manifest:missing' ? 'border-amber-300/20 bg-amber-500/[0.05] text-amber-100/75' : 'border-violet-300/15 bg-violet-500/[0.05] text-violet-100/72'}`}>{value === 'manifest:missing' ? 'missing' : value.replace(/^.*->/u, '')}</span>
                      )) : <span className="rounded border border-emerald-300/20 bg-emerald-500/[0.05] px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-emerald-100/70">manifest-aligned</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/62">Distribution / proof bundle snapshot diff</div>
          <div className="mt-2 rounded border border-emerald-300/15 bg-black/20 p-2 text-panel-sm text-white/55">
            <div className="grid gap-2 xl:grid-cols-2">
              <div>
                <div className="font-semibold text-white/82">Manifest bundle summary</div>
                <div className="mt-2 grid gap-1 text-[10px] uppercase tracking-[0.18em] text-white/36">
                  <div>generated {projectManifest.distributionProofBundles?.generatedAt ?? 'missing'}</div>
                  <div>output {projectManifest.distributionProofBundles?.outputDir ?? 'missing'}</div>
                  <div>resume {projectManifest.distributionProofBundles?.immediateResume ?? 'missing'}</div>
                  <div>handoff {projectManifest.distributionProofBundles?.lightweightHandoff ?? 'missing'}</div>
                  <div>verify {projectManifest.distributionProofBundles?.verifyStatusOnly ?? 'missing'}</div>
                  <div>intel closeout {projectManifest.distributionProofBundles?.intelMacCloseoutOnly ?? 'missing'}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-white/82">Current bundle summary</div>
                <div className="mt-2 grid gap-1 text-[10px] uppercase tracking-[0.18em] text-white/36">
                  <div>generated {currentDistributionBundleManifestSummary.generatedAt}</div>
                  <div>output {currentDistributionBundleManifestSummary.outputDir}</div>
                  <div>resume {currentDistributionBundleManifestSummary.immediateResume}</div>
                  <div>handoff {currentDistributionBundleManifestSummary.lightweightHandoff}</div>
                  <div>verify {currentDistributionBundleManifestSummary.verifyStatusOnly}</div>
                  <div>intel closeout {currentDistributionBundleManifestSummary.intelMacCloseoutOnly}</div>
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {distributionBundleManifestDiffValues.length > 0 ? distributionBundleManifestDiffValues.map((value) => (
                <span key={`distribution-manifest-drift:${value}`} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${value === 'manifest:missing' ? 'border-amber-300/20 bg-amber-500/[0.05] text-amber-100/75' : 'border-emerald-300/15 bg-emerald-500/[0.05] text-emerald-100/72'}`}>
                  {value === 'manifest:missing' ? 'missing' : value.replace(/^quickAdvice:/u, '').replace(/^summary:/u, '')}
                </span>
              )) : <span className="rounded border border-emerald-300/20 bg-emerald-500/[0.05] px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-emerald-100/70">manifest-aligned</span>}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/34">
              bundles {projectManifest.distributionProofBundles?.bundleIds.join(', ') ?? 'missing'}
            </div>
          </div>
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/62">Export / handoff snapshot diff</div>
            <button
              type="button"
              onClick={() => void copyText(exportHandoffPacket)}
              className="inline-flex items-center gap-1 rounded border border-cyan-300/20 bg-cyan-500/[0.06] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/75 transition hover:border-cyan-200/35 hover:text-cyan-50"
            >
              <Copy size={11} /> Copy handoff
            </button>
          </div>
          <div className="mt-2 rounded border border-cyan-300/15 bg-black/20 p-2 text-panel-sm text-white/55">
            <div className="grid gap-2 xl:grid-cols-2">
              <div>
                <div className="font-semibold text-white/82">Manifest handoff summary</div>
                <div className="mt-2 grid gap-1 text-[10px] uppercase tracking-[0.18em] text-white/36">
                  <div>generated {projectManifest.exportHandoff?.generatedAt ?? 'missing'}</div>
                  <div>routes {projectManifest.exportHandoff?.routeCount ?? 'missing'}</div>
                  <div>warnings {projectManifest.exportHandoff?.warningFamilyCount ?? 'missing'}</div>
                  <div>specialist drift {projectManifest.exportHandoff?.specialistDriftCount ?? 'missing'}</div>
                  <div>snapshot drift {projectManifest.exportHandoff?.specialistManifestDriftCount ?? 'missing'}</div>
                  <div>bundle drift {projectManifest.exportHandoff?.bundleManifestDriftCount ?? 'missing'}</div>
                  <div>webgpu {projectManifest.exportHandoff ? `${projectManifest.exportHandoff.webgpuDirectCount}/${projectManifest.exportHandoff.webgpuLimitedCount}/${projectManifest.exportHandoff.webgpuFallbackOnlyCount}` : 'missing'}</div>
                  <div>intel {projectManifest.exportHandoff?.intelMacVerdict ?? 'missing'}</div>
                  <div>drop {projectManifest.exportHandoff?.intelMacDropProgress ?? 'missing'}</div>
                  <div>target {projectManifest.exportHandoff?.intelMacTargetProgress ?? 'missing'}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-white/82">Current handoff summary</div>
                <div className="mt-2 grid gap-1 text-[10px] uppercase tracking-[0.18em] text-white/36">
                  <div>generated {exportHandoffCurrentSummary.generatedAt}</div>
                  <div>routes {exportHandoffCurrentSummary.routeCount}</div>
                  <div>warnings {exportHandoffCurrentSummary.warningFamilyCount}</div>
                  <div>specialist drift {exportHandoffCurrentSummary.specialistDriftCount}</div>
                  <div>snapshot drift {exportHandoffCurrentSummary.specialistManifestDriftCount}</div>
                  <div>bundle drift {exportHandoffCurrentSummary.bundleManifestDriftCount}</div>
                  <div>webgpu {`${exportHandoffCurrentSummary.webgpuDirectCount}/${exportHandoffCurrentSummary.webgpuLimitedCount}/${exportHandoffCurrentSummary.webgpuFallbackOnlyCount}`}</div>
                  <div>intel {exportHandoffCurrentSummary.intelMacVerdict}</div>
                  <div>drop {exportHandoffCurrentSummary.intelMacDropProgress}</div>
                  <div>target {exportHandoffCurrentSummary.intelMacTargetProgress}</div>
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {exportHandoffManifestDiffValues.length > 0 ? exportHandoffManifestDiffValues.map((value) => (
                <span key={`export-handoff-drift:${value}`} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${value === 'manifest:missing' ? 'border-amber-300/20 bg-amber-500/[0.05] text-amber-100/75' : 'border-cyan-300/15 bg-cyan-500/[0.05] text-cyan-100/72'}`}>
                  {value === 'manifest:missing' ? 'missing' : value.replace(/([A-Z])/g, '-$1').toLowerCase()}
                </span>
              )) : <span className="rounded border border-emerald-300/20 bg-emerald-500/[0.05] px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-emerald-100/70">manifest-aligned</span>}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/34">
              bundles {projectManifest.exportHandoff ? `${projectManifest.exportHandoff.bundleImmediateResume} / ${projectManifest.exportHandoff.bundleLightweightHandoff} / ${projectManifest.exportHandoff.bundleVerifyStatusOnly} / ${projectManifest.exportHandoff.bundleIntelMacCloseoutOnly}` : 'missing'}
            </div>
          </div>
        </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-100/62">Closeout / current snapshot diff</div>
            <button
              type="button"
              onClick={() => void copyText(closeoutCurrentPacket)}
              className="inline-flex items-center gap-1 rounded border border-fuchsia-300/20 bg-fuchsia-500/[0.06] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-100/75 transition hover:border-fuchsia-200/35 hover:text-fuchsia-50"
            >
              <Copy size={11} /> Copy closeout
            </button>
          </div>
          <div className="mt-2 rounded border border-fuchsia-300/15 bg-black/20 p-2 text-panel-sm text-white/55">
            <div className="grid gap-2 xl:grid-cols-2">
              <div>
                <div className="font-semibold text-white/82">Manifest closeout summary</div>
                <div className="mt-2 grid gap-1 text-[10px] uppercase tracking-[0.18em] text-white/36">
                  <div>generated {projectManifest.closeoutCurrent?.generatedAt ?? 'missing'}</div>
                  <div>repo {projectManifest.closeoutCurrent ? (projectManifest.closeoutCurrent.repoReady ? 'ready' : 'warnings') : 'missing'}</div>
                  <div>overall {projectManifest.closeoutCurrent?.overallCompletionPercent ?? 'missing'}%</div>
                  <div>routes {projectManifest.closeoutCurrent?.routeCount ?? 'missing'}</div>
                  <div>warnings {projectManifest.closeoutCurrent?.warningFamilyCount ?? 'missing'}</div>
                  <div>specialist drift {projectManifest.closeoutCurrent?.specialistDriftCount ?? 'missing'}</div>
                  <div>snapshot drift {projectManifest.closeoutCurrent?.specialistManifestDriftCount ?? 'missing'}</div>
                  <div>bundle drift {projectManifest.closeoutCurrent?.bundleManifestDriftCount ?? 'missing'}</div>
                  <div>webgpu {projectManifest.closeoutCurrent ? `${projectManifest.closeoutCurrent.webgpuDirectCount}/${projectManifest.closeoutCurrent.webgpuLimitedCount}/${projectManifest.closeoutCurrent.webgpuFallbackOnlyCount}` : 'missing'}</div>
                  <div>intel {projectManifest.closeoutCurrent?.intelMacVerdict ?? 'missing'}</div>
                  <div>real capture {projectManifest.closeoutCurrent ? (projectManifest.closeoutCurrent.intelMacReadyForRealCapture ? 'ready' : 'pending') : 'missing'}</div>
                  <div>host finalize {projectManifest.closeoutCurrent ? (projectManifest.closeoutCurrent.intelMacReadyForHostFinalize ? 'ready' : 'pending') : 'missing'}</div>
                  <div>drop {projectManifest.closeoutCurrent?.intelMacDropProgress ?? 'missing'}</div>
                  <div>target {projectManifest.closeoutCurrent?.intelMacTargetProgress ?? 'missing'}</div>
                  <div>blockers {projectManifest.closeoutCurrent?.intelMacBlockerCount ?? 'missing'}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-white/82">Current closeout summary</div>
                <div className="mt-2 grid gap-1 text-[10px] uppercase tracking-[0.18em] text-white/36">
                  <div>generated {closeoutCurrentSummary.generatedAt}</div>
                  <div>repo {closeoutCurrentSummary.repoReady ? 'ready' : 'warnings'}</div>
                  <div>overall {closeoutCurrentSummary.overallCompletionPercent}%</div>
                  <div>routes {closeoutCurrentSummary.routeCount}</div>
                  <div>warnings {closeoutCurrentSummary.warningFamilyCount}</div>
                  <div>specialist drift {closeoutCurrentSummary.specialistDriftCount}</div>
                  <div>snapshot drift {closeoutCurrentSummary.specialistManifestDriftCount}</div>
                  <div>bundle drift {closeoutCurrentSummary.bundleManifestDriftCount}</div>
                  <div>webgpu {`${closeoutCurrentSummary.webgpuDirectCount}/${closeoutCurrentSummary.webgpuLimitedCount}/${closeoutCurrentSummary.webgpuFallbackOnlyCount}`}</div>
                  <div>intel {closeoutCurrentSummary.intelMacVerdict}</div>
                  <div>real capture {closeoutCurrentSummary.intelMacReadyForRealCapture ? 'ready' : 'pending'}</div>
                  <div>host finalize {closeoutCurrentSummary.intelMacReadyForHostFinalize ? 'ready' : 'pending'}</div>
                  <div>drop {closeoutCurrentSummary.intelMacDropProgress}</div>
                  <div>target {closeoutCurrentSummary.intelMacTargetProgress}</div>
                  <div>blockers {closeoutCurrentSummary.intelMacBlockerCount}</div>
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {closeoutCurrentDiffValues.length > 0 ? closeoutCurrentDiffValues.map((value) => (
                <span key={`closeout-current-drift:${value}`} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${value === 'manifest:missing' ? 'border-amber-300/20 bg-amber-500/[0.05] text-amber-100/75' : 'border-fuchsia-300/15 bg-fuchsia-500/[0.05] text-fuchsia-100/72'}`}>
                  {value === 'manifest:missing' ? 'missing' : value.replace(/([A-Z])/g, '-$1').toLowerCase()}
                </span>
              )) : <span className="rounded border border-emerald-300/20 bg-emerald-500/[0.05] px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-emerald-100/70">manifest-aligned</span>}
            </div>
            <div className="mt-2 grid gap-1 text-[10px] uppercase tracking-[0.18em] text-white/34 xl:grid-cols-2">
              <div>manifest bundles {projectManifest.closeoutCurrent ? `${projectManifest.closeoutCurrent.recommendedResumeBundle} / ${projectManifest.closeoutCurrent.recommendedProofBundle} / ${projectManifest.closeoutCurrent.recommendedIntelMacBundle}` : 'missing'}</div>
              <div>current bundles {`${closeoutCurrentSummary.recommendedResumeBundle} / ${closeoutCurrentSummary.recommendedProofBundle} / ${closeoutCurrentSummary.recommendedIntelMacBundle}`}</div>
              <div>manifest commands {projectManifest.closeoutCurrent ? `${projectManifest.closeoutCurrent.operatorCommand} · ${projectManifest.closeoutCurrent.intakeCommand}` : 'missing'}</div>
              <div>current commands {`${closeoutCurrentSummary.operatorCommand} · ${closeoutCurrentSummary.intakeCommand}`}</div>
            </div>
          </div>
        </div>

        {summary.manifestRoutes.length > 0 ? (
          <div className="mt-2 grid gap-2 xl:grid-cols-2">
            {summary.manifestRoutes.map((route) => (
              <div key={`manifest-${route.key}`} className="rounded border border-white/10 bg-black/20 p-2 text-panel-sm text-white/55">
                <div className="font-semibold text-white/80">{route.label} · {route.familyLabel}</div>
                <div className="mt-1">{route.mode}</div>
                {route.bindingMode ? <div className="mt-1 text-white/40">Binding · {route.bindingMode}</div> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-panel-sm text-white/40">No future-native route is currently serialized in the manifest.</div>
        )}
      </div>
    </div>
  );
};
