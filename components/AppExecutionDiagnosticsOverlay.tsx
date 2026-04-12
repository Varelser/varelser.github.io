import React, { useMemo } from 'react';
import type { WebGLRenderer } from 'three';
import type { ParticleConfig } from '../types';
import { getExecutionDiagnostics } from '../lib/executionDiagnostics';
import { getPerformanceBudgetAdvice, getPerformanceBudgetEstimate } from '../lib/performanceHints';
import { useLivePerformanceTelemetry } from '../lib/useLivePerformanceTelemetry';
import { useRuntimeProfilingTelemetry } from '../lib/runtimeProfiling';
import { useWorkerExecutionTelemetry } from '../lib/workerExecutionTelemetry';
import { getDirectVsWorkerComparison, getWorkerCandidateSummaries } from '../lib/workerCandidateAnalysis';
import { useFutureNativeSceneDiagnostics } from '../lib/future-native-families/futureNativeSceneDiagnosticsStore';
import { getFutureNativeExecutionSummaries, getFutureNativePlaybackCloseoutSummary, getFutureNativePlaybackTuningBrief, getFutureNativePlaybackTuningPackets } from '../lib/futureNativeExecutionAnalysis';
import { getGpgpuExecutionStatus } from '../lib/gpgpuExecutionStatus';

export const AppExecutionDiagnosticsOverlay: React.FC<{ config: ParticleConfig; rendererRef: React.MutableRefObject<WebGLRenderer | null> }> = ({ config, rendererRef }) => {
  const entries = useMemo(() => getExecutionDiagnostics(config), [config]);
  const telemetry = useLivePerformanceTelemetry(rendererRef, config.executionDiagnosticsEnabled);
  const runtimeProfiling = useRuntimeProfilingTelemetry(config.executionDiagnosticsEnabled);
  const workerTelemetry = useWorkerExecutionTelemetry(config.executionDiagnosticsEnabled);
  const performanceAdvice = useMemo(() => getPerformanceBudgetAdvice(config), [config]);
  const performanceEstimate = useMemo(() => getPerformanceBudgetEstimate(config), [config]);
  const futureNativeDiagnostics = useFutureNativeSceneDiagnostics(config.executionDiagnosticsEnabled);
  const workerCandidates = useMemo(() => getWorkerCandidateSummaries(runtimeProfiling.simulation, workerTelemetry, 3), [runtimeProfiling.simulation, workerTelemetry]);
  const directVsWorker = useMemo(() => getDirectVsWorkerComparison(runtimeProfiling.simulation, workerTelemetry), [runtimeProfiling.simulation, workerTelemetry]);
  const futureNativeSummaries = useMemo(() => getFutureNativeExecutionSummaries(futureNativeDiagnostics, runtimeProfiling.simulation, workerTelemetry, 2), [futureNativeDiagnostics, runtimeProfiling.simulation, workerTelemetry]);
  const futureNativeCloseout = useMemo(() => getFutureNativePlaybackCloseoutSummary(futureNativeSummaries), [futureNativeSummaries]);
  const futureNativeTuningPackets = useMemo(() => getFutureNativePlaybackTuningPackets(futureNativeSummaries, 2), [futureNativeSummaries]);
  const futureNativeTuningBrief = useMemo(() => getFutureNativePlaybackTuningBrief(futureNativeSummaries, 2), [futureNativeSummaries]);
  const gpgpuStatus = useMemo(() => getGpgpuExecutionStatus(entries.find((entry) => entry.id === 'gpgpu') ?? null, runtimeProfiling.simulation), [entries, runtimeProfiling.simulation]);
  if (!config.executionDiagnosticsEnabled) return null;
  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-50 flex flex-col gap-2">
      <div className="rounded border border-white/15 bg-black/75 px-3 py-2 text-panel text-white/80 shadow-lg">
        <div className="font-semibold tracking-wide text-white">Live Performance · {telemetry.status}</div>
        <div>fps: {telemetry.fps.toFixed(1)} · avg frame: {telemetry.averageFrameTimeMs.toFixed(1)} ms · worst: {telemetry.worstFrameTimeMs.toFixed(1)} ms</div>
        <div>long-frame ratio: {(telemetry.longFrameRatio * 100).toFixed(1)}% · dropped: {telemetry.droppedFrameCount}</div>
        <div>render calls: {telemetry.rendererCalls} · triangles: {telemetry.triangles} · points: {telemetry.points} · lines: {telemetry.lines}</div>
        <div>gpu memory: geom {telemetry.geometries} · tex {telemetry.textures}</div>
        <div>budget: {performanceEstimate.rangeLabel} · headroom {performanceEstimate.headroom} · export risk {performanceEstimate.exportRisk}</div>
        {runtimeProfiling.simulation.length > 0 ? (
          <div>
            sim hotspots: {runtimeProfiling.simulation.slice(0, 4).map((entry) => `${entry.id} avg ${entry.averageDurationMs.toFixed(2)}ms / worst ${entry.worstDurationMs.toFixed(2)}ms`).join(' / ')}
          </div>
        ) : null}
        {runtimeProfiling.export.length > 0 ? (
          <div>
            export timings: {runtimeProfiling.export.slice(0, 3).map((entry) => `${entry.id} avg ${entry.averageDurationMs.toFixed(1)}ms / last ${entry.lastDurationMs.toFixed(1)}ms`).join(' / ')}
          </div>
        ) : null}
        {workerTelemetry.length > 0 ? (
          <div>
            worker readiness: {workerTelemetry.slice(0, 3).map((entry) => `${entry.id} ${entry.readiness} avg ${entry.averageDurationMs.toFixed(1)}ms fallback ${entry.fallbackCount} payload ${(entry.averagePayloadBytes / 1024).toFixed(1)}KB`).join(' / ')}
          </div>
        ) : null}
        {directVsWorker.length > 0 ? (
          <div>
            particle direct vs worker: {directVsWorker.slice(0, 3).map((entry) => `${entry.id} direct ${entry.directAverageDurationMs.toFixed(1)}ms / worker ${entry.workerAverageDurationMs.toFixed(1)}ms ${entry.workerReadiness} fallback ${entry.fallbackCount}`).join(' / ')}
          </div>
        ) : null}
        {workerCandidates.length > 0 ? (
          <div>
            next worker candidates: {workerCandidates.map((entry) => `${entry.id} [${entry.kind}] ${entry.route} avg ${entry.averageDurationMs.toFixed(1)}ms`).join(' / ')}
          </div>
        ) : null}
        <div>
          gpgpu preferred path: {gpgpuStatus.status} · readiness {gpgpuStatus.readiness} · active {gpgpuStatus.activeBackend}/{gpgpuStatus.actualRoute} · avg {gpgpuStatus.averageDurationMs.toFixed(1)}ms · blocker {gpgpuStatus.blockerSummary}
        </div>
        {gpgpuStatus.nextBlockerFocus.length > 0 ? (
          <div>
            gpgpu next blockers: {gpgpuStatus.nextBlockerFocus.map((entry) => `${entry.id} x${entry.count} [${entry.family}]`).join(' / ')}
          </div>
        ) : null}
        {futureNativeSummaries.length > 0 ? (
          <div>
            future-native closeout: {futureNativeCloseout.progressPercent}% · ready {futureNativeCloseout.readyCount}/{futureNativeCloseout.totalLanes} · watch {futureNativeCloseout.watchCount} · blocking {futureNativeCloseout.blockingCount} · avg health {futureNativeCloseout.averageHealthScore} · next {futureNativeCloseout.nextFocus} · focus {futureNativeCloseout.focusLane} {futureNativeCloseout.focusStatus}/{futureNativeCloseout.focusIssue}/{futureNativeCloseout.focusAction} route {futureNativeCloseout.focusSuggestedRoute} cd{futureNativeCloseout.focusSuggestedCooldownDeltaMs >= 0 ? '+' : ''}{futureNativeCloseout.focusSuggestedCooldownDeltaMs}ms to {futureNativeCloseout.focusSuggestedCooldownTargetMs}ms st{futureNativeCloseout.focusSuggestedStaleDeltaMs >= 0 ? '+' : ''}{futureNativeCloseout.focusSuggestedStaleDeltaMs}ms to {futureNativeCloseout.focusSuggestedStaleTargetMs}ms {futureNativeCloseout.focusTuningHint}
          </div>
        ) : null}
        {futureNativeSummaries.length > 0 ? (
          <div>
            future-native tuning packet: {futureNativeCloseout.focusTuningPacket}
          </div>
        ) : null}
        {futureNativeTuningPackets.length > 0 ? (
          <div>
            future-native next packets: {futureNativeTuningPackets.join(' / ')}
          </div>
        ) : null}
        {futureNativeTuningPackets.length > 0 ? (
          <div>
            future-native tuning brief: {futureNativeTuningBrief}
          </div>
        ) : null}
        {futureNativeSummaries.length > 0 ? (
          <div>
            future-native lanes: {futureNativeSummaries.map((entry) => `L${entry.layerIndex} ${entry.familyId} ${entry.bindingMode} avg ${entry.averageDurationMs.toFixed(1)}ms geom ${entry.geometryAverageDurationMs.toFixed(1)}ms packet ${entry.packetAverageDurationMs.toFixed(1)}ms desc ${entry.descriptorAverageDurationMs.toFixed(1)}ms worker ${entry.packetWorkerReadiness}(${entry.packetWorkerSuccessCount}/${entry.packetWorkerSampleCount},${entry.packetWorkerAverageDurationMs.toFixed(1)}ms,f${entry.packetWorkerFallbackCount})${entry.packetPlaybackWorkerSampleCount > 0 || entry.packetPlaybackWorkerActiveRequestCount > 0 || entry.packetPlaybackWorkerHeld || entry.packetPlaybackWorkerBypassReason !== 'none' ? ` play ${entry.packetPlaybackWorkerReadiness}(${entry.packetPlaybackWorkerSuccessCount}/${entry.packetPlaybackWorkerSampleCount},${entry.packetPlaybackWorkerAverageDurationMs.toFixed(1)}ms,f${entry.packetPlaybackWorkerFallbackCount},p${entry.packetPlaybackWorkerActiveRequestCount},t${entry.packetPlaybackWorkerPayloadTier},b${(entry.packetPlaybackWorkerEstimatedBytes / 1024).toFixed(0)}KB,cd${entry.packetPlaybackWorkerCooldownMs.toFixed(0)}ms,s${entry.packetPlaybackWorkerStaleMs.toFixed(0)}ms${entry.packetPlaybackWorkerBackoffMs > 0 ? `,b+${entry.packetPlaybackWorkerBackoffMs.toFixed(0)}ms` : ''}${entry.packetPlaybackWorkerHeld ? `,h${entry.packetPlaybackWorkerHeldAgeMs.toFixed(0)}ms` : ''},issue:${entry.packetPlaybackWorkerPrimaryIssue},health:${entry.packetPlaybackWorkerHealthScore},closeout:${entry.packetPlaybackWorkerCloseoutStatus},next:${entry.packetPlaybackWorkerNextAction},route:${entry.packetPlaybackWorkerSuggestedRoute},adj:cd${entry.packetPlaybackWorkerSuggestedCooldownDeltaMs >= 0 ? '+' : ''}${entry.packetPlaybackWorkerSuggestedCooldownDeltaMs}ms to ${entry.packetPlaybackWorkerSuggestedCooldownTargetMs}ms/st${entry.packetPlaybackWorkerSuggestedStaleDeltaMs >= 0 ? '+' : ''}${entry.packetPlaybackWorkerSuggestedStaleDeltaMs}ms to ${entry.packetPlaybackWorkerSuggestedStaleTargetMs}ms${entry.packetPlaybackWorkerBypassReason !== 'none' ? `,x:${entry.packetPlaybackWorkerBypassReason}` : ''},packet:${entry.packetPlaybackWorkerTuningPacket},hint:${entry.packetPlaybackWorkerTuningHint})` : ''} ${entry.workerPotential}`).join(' / ')}
          </div>
        ) : null}
        {performanceEstimate.hotspots.length > 0 ? <div>hotspots: {performanceEstimate.hotspots.join(' / ')}</div> : null}
        {performanceAdvice.length > 0 ? <div>advice: {performanceAdvice.join(' / ')}</div> : null}
      </div>
      {entries.map((entry) => (
        <div key={entry.id} className="rounded border border-white/15 bg-black/75 px-3 py-2 text-panel text-white/80 shadow-lg">
          <div className="font-semibold tracking-wide text-white">{entry.label} · {entry.mode}</div>
          <div>engine: {entry.engine} · path: {entry.path}{entry.hybridKind ? ` · hybrid: ${entry.hybridKind}` : ''}</div>
          <div>requested: {entry.requestedEngine} · override: {entry.overrideId}</div>
          {entry.capabilityFlags.length > 0 ? <div>flags: {entry.capabilityFlags.join(', ')}</div> : null}
          {entry.sceneBranches.length > 0 ? <div>scene: {entry.sceneBranches.join(', ')}</div> : null}
          {config.executionDiagnosticsVerbose ? <div>reason: {entry.reason}</div> : null}
          {config.executionDiagnosticsVerbose && entry.notes.length ? <div>notes: {entry.notes.join(', ')}</div> : null}
          {config.executionDiagnosticsVerbose && entry.features?.length ? <div>features: {entry.features.join(', ')}</div> : null}
          {config.executionDiagnosticsVerbose && entry.supportedFeatures?.length ? <div>supported: {entry.supportedFeatures.join(', ')}</div> : null}
          {config.executionDiagnosticsVerbose && entry.unsupportedFeatures?.length ? <div className="text-amber-300">unsupported: {entry.unsupportedFeatures.join(', ')}</div> : null}
        </div>
      ))}
    </div>
  );
};
