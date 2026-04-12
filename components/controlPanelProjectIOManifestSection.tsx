import React from 'react';
import { Layers3 } from 'lucide-react';
import type { ProjectManifest } from '../types';
import { buildProjectAudioLegacyTargetHostProofPacket, formatProjectAudioLegacyTargetHostProofPacket } from '../lib/projectAudioLegacyTargetHostProofPacket';
import { buildProjectAudioLegacyCloseoutPacket, formatProjectAudioLegacyCloseoutPacket } from '../lib/projectAudioLegacyCloseoutPacket';
import { buildProjectAudioLegacyMigrationPacket, formatProjectAudioLegacyMigrationPacket } from '../lib/projectAudioLegacyMigrationPacket';
import { StatChip, CoverageRow, CoverageRollupRow, AugmentationSuggestionRow, ProductPackScorecardRow, LayerSummaryCard } from './controlPanelProjectIOShared';

const InlineTags: React.FC<{ values: string[]; emptyLabel?: string; tone?: 'neutral' | 'warning' }> = ({ values, emptyLabel = 'None', tone = 'neutral' }) => (
  <div className="flex flex-wrap gap-1">
    {values.length > 0 ? values.map((value) => (
      <span
        key={value}
        className={`rounded border px-1.5 py-0.5 text-panel-sm uppercase tracking-widest ${tone === 'warning' ? 'border-amber-300/20 bg-amber-500/10 text-amber-100/80' : 'border-white/10 bg-black/20 text-white/55'}`}
      >
        {value}
      </span>
    )) : <span className="text-panel text-white/35">{emptyLabel}</span>}
  </div>
);

export const ControlPanelProjectIOManifestSection: React.FC<{ projectManifest: ProjectManifest }> = ({ projectManifest }) => {
  const targetHostProofPacket = React.useMemo(() => projectManifest.audioLegacyCloseout ? buildProjectAudioLegacyTargetHostProofPacket(projectManifest.audioLegacyCloseout) : null, [projectManifest.audioLegacyCloseout]);
  const finalCloseoutPacket = React.useMemo(
    () => projectManifest.audioLegacyCloseout ? buildProjectAudioLegacyCloseoutPacket(projectManifest.audioLegacyCloseout, projectManifest.audioLegacyStoredQueuePreview) : null,
    [projectManifest.audioLegacyCloseout, projectManifest.audioLegacyStoredQueuePreview],
  );
  const migrationPacket = React.useMemo(
    () => projectManifest.audioLegacyCloseout ? buildProjectAudioLegacyMigrationPacket(projectManifest.audioLegacyCloseout, projectManifest.audioLegacyManualQueue, projectManifest.audioLegacyStoredQueuePreview) : null,
    [projectManifest.audioLegacyCloseout, projectManifest.audioLegacyManualQueue, projectManifest.audioLegacyStoredQueuePreview],
  );

  const copyTargetHostProofPacket = React.useCallback(async () => {
    if (!projectManifest.audioLegacyCloseout || !targetHostProofPacket) return;
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(formatProjectAudioLegacyTargetHostProofPacket(targetHostProofPacket, projectManifest.audioLegacyCloseout));
    } catch {
      // no-op
    }
  }, [projectManifest.audioLegacyCloseout, targetHostProofPacket]);

  const copyMigrationPacket = React.useCallback(async () => {
    if (!projectManifest.audioLegacyCloseout || !migrationPacket) return;
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(formatProjectAudioLegacyMigrationPacket(migrationPacket, projectManifest.audioLegacyCloseout, projectManifest.audioLegacyManualQueue, projectManifest.audioLegacyStoredQueuePreview));
    } catch {
      // no-op
    }
  }, [migrationPacket, projectManifest.audioLegacyCloseout, projectManifest.audioLegacyManualQueue, projectManifest.audioLegacyStoredQueuePreview]);

  const copyFinalCloseoutPacket = React.useCallback(async () => {
    if (!projectManifest.audioLegacyCloseout || !finalCloseoutPacket) return;
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(formatProjectAudioLegacyCloseoutPacket(finalCloseoutPacket, projectManifest.audioLegacyCloseout, projectManifest.audioLegacyStoredQueuePreview));
    } catch {
      // no-op
    }
  }, [finalCloseoutPacket, projectManifest.audioLegacyCloseout, projectManifest.audioLegacyStoredQueuePreview]);

  return (
    <>
      <div className="mb-3 rounded border border-white/10 bg-black/20 p-2">
        <div className="mb-2 flex items-center gap-2 text-panel uppercase tracking-widest text-white/50">
          <Layers3 size={11} /> Schema-aware snapshot
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatChip label="Presets" value={projectManifest.stats.presetCount} />
          <StatChip label="Sequence" value={projectManifest.stats.sequenceCount} />
          <StatChip label="Enabled Layers" value={projectManifest.stats.enabledLayerCount} />
          <StatChip label="Materials" value={projectManifest.stats.distinctMaterialCount} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <StatChip label="Media" value={projectManifest.stats.mediaSourceCount} />
          <StatChip label="Text" value={projectManifest.stats.textSourceCount} />
          <StatChip label="Procedural" value={projectManifest.stats.proceduralModeCount} />
        </div>
        {projectManifest.seedReplay ? (
          <div className="mt-2 rounded border border-emerald-300/15 bg-emerald-500/5 p-2">
            <div className="mb-2 text-panel uppercase tracking-widest text-emerald-100/70">Seed replay / snapshot</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatChip label="Lock" value={projectManifest.seedReplay.lockEnabled ? 'on' : 'off'} />
              <StatChip label="Seed" value={projectManifest.seedReplay.currentSeedValue} />
              <StatChip label="Step" value={projectManifest.seedReplay.step} />
              <StatChip label="Last Seed" value={projectManifest.seedReplay.lastAppliedSeed} />
              <StatChip label="Last Trigger" value={projectManifest.seedReplay.lastTriggerKind} />
              <StatChip label="Last Scope" value={projectManifest.seedReplay.lastMutationScope} />
              <StatChip label="Intensity" value={projectManifest.seedReplay.lastMutationIntensity.toFixed(2)} />
              <StatChip label="Auto Advance" value={projectManifest.seedReplay.autoAdvance ? 'on' : 'off'} />
            </div>
            <div className="mt-1 text-panel-sm text-white/40">Recorded at / {projectManifest.seedReplay.lastRecordedAt || 'not yet captured'}</div>
          </div>
        ) : null}
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatChip label="Methods" value={projectManifest.stats.depictionMethodCount} />
          <StatChip label="Motions" value={projectManifest.stats.motionFamilyCount} />
          <StatChip label="Backends" value={projectManifest.stats.computeBackendCount} />
          <StatChip label="GPGPU" value={projectManifest.stats.gpgpuFeatureCount} />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatChip label="Sources" value={projectManifest.stats.sourceFamilyCount} />
          <StatChip label="Renders" value={projectManifest.stats.renderFamilyCount} />
          <StatChip label="Post FX" value={projectManifest.stats.postFamilyCount} />
          <StatChip label="Physical" value={projectManifest.stats.physicalFamilyCount} />
          <StatChip label="Geometry" value={projectManifest.stats.geometryFamilyCount} />
          <StatChip label="Temporal" value={projectManifest.stats.temporalFamilyCount} />
          <StatChip label="Pack Families" value={projectManifest.stats.productPackFamilyCount} />
          <StatChip label="Product Packs" value={projectManifest.stats.productPackCount} />
          <StatChip label="Pack Scorecards" value={projectManifest.stats.productPackScorecardCount} />
          <StatChip label="Active Pack Score" value={projectManifest.stats.activeProductPackCoverageScore} />
          <StatChip label="Current Cover" value={projectManifest.stats.currentCoverageScore} />
          <StatChip label="Overall Cover" value={projectManifest.stats.overallCoverageScore} />
          <StatChip label="Best Pack" value={projectManifest.stats.bestPackCoverageScore} />
          <StatChip label="Solver" value={projectManifest.stats.solverFamilyCount} />
          <StatChip label="Specialist" value={projectManifest.stats.specialistFamilyCount} />
          <StatChip label="Post Stacks" value={projectManifest.stats.postStackTemplateCount} />
          <StatChip label="Gap Targets" value={projectManifest.stats.coverageGapCount} />
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2">
          <CoverageRow label="Motion families" values={projectManifest.coverage.motionFamilies} />
          <CoverageRow label="Compute backends" values={projectManifest.coverage.computeBackends} />
          <CoverageRow label="Source families" values={projectManifest.coverage.sourceFamilies} />
          <CoverageRow label="Render families" values={projectManifest.coverage.renderFamilies} />
          <CoverageRow label="Post families" values={projectManifest.coverage.postFamilies} />
          <CoverageRow label="Solver families" values={projectManifest.coverage.solverFamilies} />
          <CoverageRow label="Specialist families" values={projectManifest.coverage.specialistFamilies} />
          <CoverageRow label="Physical subfamilies" values={projectManifest.coverage.physicalFamilies} />
          <CoverageRow label="Geometry subfamilies" values={projectManifest.coverage.geometryFamilies} />
          <CoverageRow label="Temporal subfamilies" values={projectManifest.coverage.temporalFamilies} />
          <CoverageRow label="Product pack families" values={projectManifest.coverage.productPackFamilies} />
          <CoverageRow label="Product packs" values={projectManifest.coverage.productPacks} />
          <CoverageRow label="Post stack templates" values={projectManifest.coverage.postStackTemplates} />
          <CoverageRow label="Active post stack" values={projectManifest.coverage.activePostStackId ? [projectManifest.coverage.activePostStackId] : []} />
          <CoverageRow label="Active product pack" values={projectManifest.coverage.activeProductPackId ? [projectManifest.coverage.activeProductPackId] : []} />
          <CoverageRow label="Gap targets" values={projectManifest.coverage.gapTargets} />
          <CoverageRollupRow rollup={projectManifest.coverage.coverageRollup} />
          <AugmentationSuggestionRow suggestions={projectManifest.coverage.augmentationSuggestions} />
          <ProductPackScorecardRow scorecards={projectManifest.coverage.productPackScorecards} />
        </div>
        <div className="mt-2 text-panel uppercase tracking-widest text-white/35">
          Manifest schema v{projectManifest.schemaVersion} · serialization schema v{projectManifest.serializationSchemaVersion} · mode/source/material/coverage summary included in export.
        </div>
      </div>

      {projectManifest.audioLegacyRetirement ? (
        <div className="mb-3 rounded border border-amber-300/15 bg-amber-500/5 p-2">
          <div className="mb-2 text-panel uppercase tracking-widest text-amber-100/70">Audio legacy retirement</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatChip label="Mode" value={projectManifest.audioLegacyRetirement.visibilityMode} />
            <StatChip label="Safe" value={projectManifest.audioLegacyRetirement.safeToDeprecateCount} />
            <StatChip label="Review" value={projectManifest.audioLegacyRetirement.reviewBeforeDeprecateCount} />
            <StatChip label="Blocked" value={projectManifest.audioLegacyRetirement.blockedDeprecationCount} />
            <StatChip label="Residual" value={projectManifest.audioLegacyRetirement.residualCount} />
            <StatChip label="Preset Review" value={projectManifest.audioLegacyRetirement.presetAffectedReviewCount} />
            <StatChip label="Preset Blocked" value={projectManifest.audioLegacyRetirement.presetAffectedBlockedCount} />
            <StatChip label="Keyframe Review" value={projectManifest.audioLegacyRetirement.keyframeReviewCount} />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-panel-sm uppercase tracking-widest text-white/35">Highest risk legacy ids</div>
              <InlineTags values={projectManifest.audioLegacyRetirement.highestRiskLegacyIds} emptyLabel="No review or blocked legacy ids" tone="warning" />
            </div>
            <div>
              <div className="mb-1 text-panel-sm uppercase tracking-widest text-white/35">Custom conflict hotspots</div>
              <InlineTags values={projectManifest.audioLegacyRetirement.customConflictHotspotKeys} emptyLabel="No custom conflict hotspots" tone="warning" />
            </div>
          </div>
        </div>
      ) : null}

      {projectManifest.audioLegacyCloseout ? (
        <div className={`mb-3 rounded border p-2 ${projectManifest.audioLegacyCloseout.status === 'ready' ? 'border-emerald-300/15 bg-emerald-500/5' : projectManifest.audioLegacyCloseout.status === 'blocked' ? 'border-rose-300/15 bg-rose-500/5' : 'border-amber-300/15 bg-amber-500/5'}`}>
          <div className="mb-2 text-panel uppercase tracking-widest text-white/70">Audio legacy closeout</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatChip label="Status" value={projectManifest.audioLegacyCloseout.status} />
            <StatChip label="Current Mode" value={projectManifest.audioLegacyCloseout.currentVisibilityMode} />
            <StatChip label="Recommended" value={projectManifest.audioLegacyCloseout.recommendedVisibilityMode} />
            <StatChip label="Mode Drift" value={projectManifest.audioLegacyCloseout.modeDrift ? 'yes' : 'no'} />
            <StatChip label="Safe" value={projectManifest.audioLegacyCloseout.safeToDeprecateCount} />
            <StatChip label="Current Review" value={projectManifest.audioLegacyCloseout.currentReviewCount} />
            <StatChip label="Current Blocked" value={projectManifest.audioLegacyCloseout.currentBlockedCount} />
            <StatChip label="Stored Review" value={projectManifest.audioLegacyCloseout.storedReviewCount} />
            <StatChip label="Stored Blocked" value={projectManifest.audioLegacyCloseout.storedBlockedCount} />
            <StatChip label="Residual" value={projectManifest.audioLegacyCloseout.currentResidualCount} />
          </div>
          <div className="mt-2 text-panel text-white/55">{projectManifest.audioLegacyCloseout.closeoutMessage}</div>
          <div className="mt-1 text-panel-sm text-white/40">Next / {projectManifest.audioLegacyCloseout.nextStepLabel}</div>
          <div className="mt-1 text-panel-sm text-white/40">Target-host proof required / {projectManifest.audioLegacyCloseout.requiresTargetHostProof ? 'yes' : 'no'}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => { void copyTargetHostProofPacket(); }} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20">Copy Target-Host Packet</button>
            <button onClick={() => { void copyFinalCloseoutPacket(); }} className="rounded border border-violet-400/25 bg-violet-500/10 px-2 py-1 text-white/70 hover:bg-violet-500/20">Copy Final Closeout Packet</button>
          </div>
          <div className="mt-2">
            <div className="mb-1 text-panel-sm uppercase tracking-widest text-white/35">Highest risk legacy ids</div>
            <InlineTags values={projectManifest.audioLegacyCloseout.highestRiskLegacyIds} emptyLabel="No closeout risk ids" tone="warning" />
          </div>
        </div>
      ) : null}

      {projectManifest.audioLegacyStoredQueuePreview ? (
        <div className="mb-3 rounded border border-fuchsia-300/15 bg-fuchsia-500/5 p-2">
          <div className="mb-2 text-panel uppercase tracking-widest text-fuchsia-100/70">Stored queue preview / manifest</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatChip label="Scope" value={projectManifest.audioLegacyStoredQueuePreview.scope} />
            <StatChip label="Profile" value={projectManifest.audioLegacyStoredQueuePreview.profile} />
            <StatChip label="Limit" value={projectManifest.audioLegacyStoredQueuePreview.limit} />
            <StatChip label="Keys" value={projectManifest.audioLegacyStoredQueuePreview.keyCount} />
            <StatChip label="Applied" value={projectManifest.audioLegacyStoredQueuePreview.appliedKeyCount} />
            <StatChip label="Preset Updates" value={projectManifest.audioLegacyStoredQueuePreview.presetUpdatedCount} />
            <StatChip label="Keyframe Updates" value={projectManifest.audioLegacyStoredQueuePreview.keyframeUpdatedCount} />
            <StatChip label="Total Updates" value={projectManifest.audioLegacyStoredQueuePreview.totalUpdatedCount} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <StatChip label="Δ Review" value={projectManifest.audioLegacyStoredQueuePreview.totalReviewDelta} />
            <StatChip label="Δ Blocked" value={projectManifest.audioLegacyStoredQueuePreview.totalBlockedDelta} />
            <StatChip label="Δ Residual" value={projectManifest.audioLegacyStoredQueuePreview.totalResidualDelta} />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-panel-sm uppercase tracking-widest text-white/35">Preview keys</div>
              <InlineTags values={projectManifest.audioLegacyStoredQueuePreview.previewKeys} emptyLabel="No queued stored preview keys" tone="warning" />
            </div>
            <div>
              <div className="mb-1 text-panel-sm uppercase tracking-widest text-white/35">Preview samples</div>
              <InlineTags values={projectManifest.audioLegacyStoredQueuePreview.sampleUpdatedIds} emptyLabel="No staged stored samples" tone="warning" />
            </div>
          </div>
        </div>
      ) : null}

      {projectManifest.audioLegacyManualQueue ? (
        <div className="mb-3 rounded border border-sky-300/15 bg-sky-500/5 p-2">
          <div className="mb-2 text-panel uppercase tracking-widest text-sky-100/70">Audio legacy manual queue / manifest</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatChip label="Current Keys" value={projectManifest.audioLegacyManualQueue.currentManualKeyCount} />
            <StatChip label="Stored Keys" value={projectManifest.audioLegacyManualQueue.storedManualKeyCount} />
            <StatChip label="Combined" value={projectManifest.audioLegacyManualQueue.combinedKeyCount} />
            <StatChip label="Stored Presets" value={projectManifest.audioLegacyManualQueue.storedPresetContextCount} />
            <StatChip label="Stored Keyframes" value={projectManifest.audioLegacyManualQueue.storedKeyframeContextCount} />
            <StatChip label="Current Custom" value={projectManifest.audioLegacyManualQueue.currentManualCustomChoiceCount} />
            <StatChip label="Current Residual" value={projectManifest.audioLegacyManualQueue.currentManualResidualMergeCount} />
            <StatChip label="Stored Manual" value={projectManifest.audioLegacyManualQueue.storedManualCustomChoiceCount + projectManifest.audioLegacyManualQueue.storedManualResidualMergeCount} />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div><div className="mb-1 text-panel-sm uppercase tracking-widest text-white/35">Current head</div><InlineTags values={projectManifest.audioLegacyManualQueue.currentHeadKeys} emptyLabel="No current manual keys" tone="warning" /></div>
            <div><div className="mb-1 text-panel-sm uppercase tracking-widest text-white/35">Stored head</div><InlineTags values={projectManifest.audioLegacyManualQueue.storedHeadKeys} emptyLabel="No stored manual keys" tone="warning" /></div>
            <div><div className="mb-1 text-panel-sm uppercase tracking-widest text-white/35">Combined head</div><InlineTags values={projectManifest.audioLegacyManualQueue.combinedHeadKeys} emptyLabel="No manual queue keys" tone="warning" /></div>
          </div>
          {migrationPacket ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => { void copyMigrationPacket(); }} className="rounded border border-sky-400/25 bg-sky-500/10 px-2 py-1 text-white/70 hover:bg-sky-500/20">Copy Migration Packet</button>
              <div className="rounded border border-white/10 bg-black/20 px-2 py-1 text-panel-sm text-white/45">Status · {migrationPacket.status}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {projectManifest.audioLegacyCloseout && finalCloseoutPacket ? (
        <div className="mb-3 rounded border border-violet-300/15 bg-violet-500/5 p-2">
          <div className="mb-2 text-panel uppercase tracking-widest text-violet-100/70">Legacy closeout packet / handoff</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatChip label="Packet Status" value={finalCloseoutPacket.status} />
            <StatChip label="Preview Keys" value={finalCloseoutPacket.previewKeyCount} />
            <StatChip label="Applied Keys" value={finalCloseoutPacket.previewAppliedKeyCount} />
            <StatChip label="Preview Updates" value={finalCloseoutPacket.previewTotalUpdatedCount} />
            <StatChip label="Δ Review" value={finalCloseoutPacket.previewDeltaReview} />
            <StatChip label="Δ Blocked" value={finalCloseoutPacket.previewDeltaBlocked} />
            <StatChip label="Δ Residual" value={finalCloseoutPacket.previewDeltaResidual} />
            <StatChip label="Target Packet" value={finalCloseoutPacket.targetHostPacket.status} />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-panel-sm uppercase tracking-widest text-white/35">Action checklist</div>
              <InlineTags values={finalCloseoutPacket.actionChecklist} emptyLabel="No additional closeout actions" tone="warning" />
            </div>
            <div>
              <div className="mb-1 text-panel-sm uppercase tracking-widest text-white/35">Preview keys</div>
              <InlineTags values={finalCloseoutPacket.previewKeys} emptyLabel="No staged preview keys" tone="warning" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => { void copyFinalCloseoutPacket(); }} className="rounded border border-violet-400/25 bg-violet-500/10 px-2 py-1 text-white/70 hover:bg-violet-500/20">Copy Final Closeout Packet</button>
            <button onClick={() => { void copyTargetHostProofPacket(); }} className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-white/70 hover:bg-cyan-500/20">Copy Target-Host Packet</button>
          </div>
        </div>
      ) : null}

      <div className="mb-3 rounded border border-white/10 bg-black/20 p-2">
        <div className="mb-2 text-panel uppercase tracking-widest text-white/45">Capability-aware routing</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {projectManifest.execution.map((entry) => (
            <div key={entry.key} className="rounded border border-white/10 bg-black/20 p-2 text-panel text-white/60">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="font-bold uppercase tracking-widest text-white/78">{entry.label}</div>
                <div className={`rounded border px-1.5 py-0.5 text-panel-sm uppercase tracking-widest ${entry.enabled ? 'border-emerald-300/25 text-emerald-100/80' : 'border-white/10 text-white/35'}`}>
                  {entry.enabled ? 'On' : 'Off'}
                </div>
              </div>
              <div><span className="text-white/35">Mode</span> · {entry.mode}</div>
              <div><span className="text-white/35">Render</span> · {entry.renderClass}</div>
              <div><span className="text-white/35">Simulation</span> · {entry.simulationClass}</div>
              <div><span className="text-white/35">Engine</span> · {entry.resolvedEngine} <span className="text-white/30">(requested {entry.requestedEngine})</span></div>
              <div><span className="text-white/35">Path</span> · {entry.path}</div>
              <div><span className="text-white/35">Override</span> · {entry.overrideId}{entry.hybridKind ? <span className="text-white/30"> · hybrid {entry.hybridKind}</span> : null}</div>
              {entry.proceduralSystemId ? <div><span className="text-white/35">Procedural</span> · {entry.proceduralSystemId}</div> : null}
              <div className="mt-2 text-panel-sm uppercase tracking-widest text-white/35">Capability flags</div>
              <div className="mt-1"><InlineTags values={entry.capabilityFlags} emptyLabel="No flags" tone={entry.capabilityFlags.includes('mobile-risky') || entry.capabilityFlags.includes('export-only') ? 'warning' : 'neutral'} /></div>
              <div className="mt-2 text-panel-sm text-white/40">{entry.reason}</div>
              {entry.notes.length > 0 ? <div className="mt-2"><InlineTags values={entry.notes} emptyLabel="No notes" /></div> : null}
              <div className="mt-2 text-panel-sm uppercase tracking-widest text-white/35">Scene branches</div>
              <div className="mt-1"><InlineTags values={entry.sceneBranches ?? []} emptyLabel="No branches" /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-2 text-panel uppercase tracking-widest text-white/45">Current manifest layers</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {projectManifest.layers.map((layer) => (
            <LayerSummaryCard
              key={layer.key}
              label={layer.label}
              enabled={layer.enabled}
              mode={layer.mode}
              source={layer.source ?? '—'}
              material={layer.material ?? '—'}
              features={layer.features}
              capabilityFlags={layer.capabilityFlags}
            />
          ))}
        </div>
      </div>
    </>
  );
};
