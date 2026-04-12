import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ParticleConfig, PresetRecord, PresetSequenceItem } from '../types';
import { normalizeConfig } from './appStateConfigNormalization';
import { buildExportBatchJob, cloneExportSnapshot, type ExportBatchJob, type ExportRunResult } from './exportBatchQueue';
import type { ExportCameraPathPlan } from './exportCameraPath';



type EnqueueExportJobOverrides = {
  kind: ExportBatchJob['kind'];
  config?: ParticleConfig;
  exportMode?: 'current' | 'sequence';
  targetDurationSeconds?: number;
  fps?: number;
  sequenceLength?: number;
  sequenceSinglePassDuration?: number | null;
  cameraPathEnabled?: boolean;
  cameraPathSlots?: ExportCameraPathPlan['slots'];
  presets?: PresetRecord[];
  presetSequence?: PresetSequenceItem[];
};

type UseExportBatchQueueArgs = {
  applyConfigInstant: (nextConfig: ParticleConfig) => void;
  activeSequenceItemId: string | null;
  config: ParticleConfig;
  cameraPathEnabled: boolean;
  cameraPathSlots: ExportCameraPathPlan['slots'];
  isFrameExporting: boolean;
  isGifExporting: boolean;
  isVideoRecording: boolean;
  presetSequence: PresetSequenceItem[];
  presetSequenceLength: number;
  presets: PresetRecord[];
  runFrameExport: (overrides?: {
    config?: ParticleConfig;
    videoExportMode?: 'current' | 'sequence';
    videoDurationSeconds?: number;
    videoFps?: number;
    presetSequenceLength?: number;
    sequenceSinglePassDuration?: number;
    cameraPathPlan?: ExportCameraPathPlan;
  }) => Promise<ExportRunResult>;
  runGifExport: (overrides?: {
    config?: ParticleConfig;
    videoExportMode?: 'current' | 'sequence';
    videoDurationSeconds?: number;
    videoFps?: number;
    presetSequenceLength?: number;
    sequenceSinglePassDuration?: number;
    cameraPathPlan?: ExportCameraPathPlan;
  }) => Promise<ExportRunResult>;
  runVideoRecording: (overrides?: {
    config?: ParticleConfig;
    videoExportMode?: 'current' | 'sequence';
    videoDurationSeconds?: number;
    videoFps?: number;
    presetSequenceLength?: number;
    sequenceSinglePassDuration?: number;
    cameraPathPlan?: ExportCameraPathPlan;
  }) => Promise<ExportRunResult>;
  sequenceSinglePassDuration: number;
  setActiveSequenceItemId: Dispatch<SetStateAction<string | null>>;
  setPresetSequence: Dispatch<SetStateAction<PresetSequenceItem[]>>;
  setPresets: Dispatch<SetStateAction<PresetRecord[]>>;
  stopFrameExport: () => void;
  stopGifExport: () => void;
  stopVideoRecording: () => void;
  videoDurationSeconds: number;
  videoExportMode: 'current' | 'sequence';
  videoFps: number;
};

function waitForRenderCommit() {
  if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

export function useExportBatchQueue({
  applyConfigInstant,
  activeSequenceItemId,
  config,
  cameraPathEnabled,
  cameraPathSlots,
  isFrameExporting,
  isGifExporting,
  isVideoRecording,
  presetSequence,
  presetSequenceLength,
  presets,
  runFrameExport,
  runGifExport,
  runVideoRecording,
  sequenceSinglePassDuration,
  setActiveSequenceItemId,
  setPresetSequence,
  setPresets,
  stopFrameExport,
  stopGifExport,
  stopVideoRecording,
  videoDurationSeconds,
  videoExportMode,
  videoFps,
}: UseExportBatchQueueArgs) {
  const [exportQueue, setExportQueue] = useState<ExportBatchJob[]>([]);
  const [isExportQueueRunning, setIsExportQueueRunning] = useState(false);
  const [activeExportQueueJobId, setActiveExportQueueJobId] = useState<string | null>(null);
  const queueRef = useRef<ExportBatchJob[]>([]);
  const cancelRequestedRef = useRef(false);

  useEffect(() => {
    queueRef.current = exportQueue;
  }, [exportQueue]);

  const enqueueExportJobWithOverrides = useCallback((overrides: EnqueueExportJobOverrides) => {
    const resolvedMode = overrides.exportMode ?? videoExportMode;
    const targetDurationSeconds = overrides.targetDurationSeconds
      ?? (resolvedMode === 'sequence'
        ? sequenceSinglePassDuration
        : Math.max(0.5, videoDurationSeconds));
    const job = buildExportBatchJob({
      kind: overrides.kind,
      exportMode: resolvedMode,
      targetDurationSeconds,
      fps: overrides.fps ?? videoFps,
      sequenceLength: overrides.sequenceLength ?? presetSequenceLength,
      sequenceSinglePassDuration: overrides.sequenceSinglePassDuration
        ?? (resolvedMode === 'sequence' ? sequenceSinglePassDuration : null),
      config: overrides.config ?? config,
      cameraPathEnabled: overrides.cameraPathEnabled ?? cameraPathEnabled,
      cameraPathSlots: overrides.cameraPathSlots ?? cameraPathSlots,
      presets: overrides.presets ?? presets,
      presetSequence: overrides.presetSequence ?? presetSequence,
    });
    setExportQueue((prev) => [...prev, job]);
  }, [cameraPathEnabled, cameraPathSlots, config, presetSequence, presetSequenceLength, presets, sequenceSinglePassDuration, videoDurationSeconds, videoExportMode, videoFps]);

  const enqueueExportJob = useCallback((kind: ExportBatchJob['kind']) => {
    enqueueExportJobWithOverrides({ kind });
  }, [enqueueExportJobWithOverrides]);

  const removeExportJob = useCallback((jobId: string) => {
    setExportQueue((prev) => prev.filter((job) => job.id !== jobId || job.status === 'running'));
  }, []);

  const clearExportQueue = useCallback(() => {
    setExportQueue((prev) => prev.filter((job) => job.status === 'running'));
  }, []);

  const updateJob = useCallback((jobId: string, updater: (job: ExportBatchJob) => ExportBatchJob) => {
    setExportQueue((prev) => prev.map((job) => (job.id === jobId ? updater(job) : job)));
  }, []);

  const cancelExportQueue = useCallback(() => {
    cancelRequestedRef.current = true;
    if (isVideoRecording) {
      stopVideoRecording();
    }
    if (isFrameExporting) {
      stopFrameExport();
    }
    if (isGifExporting) {
      stopGifExport();
    }
  }, [isFrameExporting, isGifExporting, isVideoRecording, stopFrameExport, stopGifExport, stopVideoRecording]);

  const startExportQueue = useCallback(async () => {
    if (isExportQueueRunning) {
      return;
    }

    const nextQueuedJob = queueRef.current.find((job) => job.status === 'queued');
    if (!nextQueuedJob) {
      return;
    }

    const restoreConfig = cloneExportSnapshot(config);
    const restorePresets = cloneExportSnapshot(presets);
    const restoreSequence = cloneExportSnapshot(presetSequence);
    const restoreActiveSequenceItemId = activeSequenceItemId;
    cancelRequestedRef.current = false;
    setIsExportQueueRunning(true);

    try {
      let currentJob = queueRef.current.find((job) => job.status === 'queued');
      while (currentJob) {
        if (cancelRequestedRef.current) {
          break;
        }

        setActiveExportQueueJobId(currentJob.id);
        updateJob(currentJob.id, (job) => ({
          ...job,
          status: 'running',
          resultMessage: null,
          completedAt: null,
        }));

        setPresets(cloneExportSnapshot(currentJob.presetSnapshots));
        setPresetSequence(cloneExportSnapshot(currentJob.sequenceSnapshot));
        setActiveSequenceItemId(null);
        applyConfigInstant(normalizeConfig(cloneExportSnapshot(currentJob.configSnapshot)));
        await waitForRenderCommit();

        const result = currentJob.kind === 'video-webm'
          ? await runVideoRecording({
            config: currentJob.configSnapshot,
            videoExportMode: currentJob.exportMode,
            videoDurationSeconds: currentJob.targetDurationSeconds,
            videoFps: currentJob.fps,
            presetSequenceLength: currentJob.sequenceLength,
            sequenceSinglePassDuration: currentJob.sequenceSinglePassDuration ?? sequenceSinglePassDuration,
            cameraPathPlan: {
              enabled: currentJob.cameraPathEnabled,
              slots: currentJob.cameraPathSlotsSnapshot,
            },
          })
          : currentJob.kind === 'gif'
            ? await runGifExport({
              config: currentJob.configSnapshot,
              videoExportMode: currentJob.exportMode,
              videoDurationSeconds: currentJob.targetDurationSeconds,
              videoFps: currentJob.fps,
              presetSequenceLength: currentJob.sequenceLength,
              sequenceSinglePassDuration: currentJob.sequenceSinglePassDuration ?? sequenceSinglePassDuration,
              cameraPathPlan: {
                enabled: currentJob.cameraPathEnabled,
                slots: currentJob.cameraPathSlotsSnapshot,
              },
            })
            : await runFrameExport({
              config: currentJob.configSnapshot,
              videoExportMode: currentJob.exportMode,
              videoDurationSeconds: currentJob.targetDurationSeconds,
              videoFps: currentJob.fps,
              presetSequenceLength: currentJob.sequenceLength,
              sequenceSinglePassDuration: currentJob.sequenceSinglePassDuration ?? sequenceSinglePassDuration,
            });

        updateJob(currentJob.id, (job) => ({
          ...job,
          status: result.status,
          resultMessage: result.message,
          resultMetadata: result.metadata,
          completedAt: new Date().toISOString(),
        }));

        if (result.status === 'cancelled' && cancelRequestedRef.current) {
          break;
        }

        currentJob = queueRef.current.find((job) => job.status === 'queued');
      }
    } finally {
      setPresets(cloneExportSnapshot(restorePresets));
      setPresetSequence(cloneExportSnapshot(restoreSequence));
      setActiveSequenceItemId(restoreActiveSequenceItemId);
      applyConfigInstant(normalizeConfig(restoreConfig));
      await waitForRenderCommit();
      cancelRequestedRef.current = false;
      setActiveExportQueueJobId(null);
      setIsExportQueueRunning(false);
    }
  }, [
    applyConfigInstant,
    activeSequenceItemId,
    config,
    isExportQueueRunning,
    presetSequence,
    presets,
    runFrameExport,
    runGifExport,
    runVideoRecording,
    sequenceSinglePassDuration,
    setActiveSequenceItemId,
    setPresetSequence,
    setPresets,
    updateJob,
  ]);

  return {
    activeExportQueueJobId,
    cancelExportQueue,
    clearExportQueue,
    enqueueExportJobWithOverrides,
    enqueueFrameExportJob: () => enqueueExportJob('png-sequence'),
    enqueueGifExportJob: () => enqueueExportJob('gif'),
    enqueueVideoExportJob: () => enqueueExportJob('video-webm'),
    exportQueue,
    isExportQueueRunning,
    removeExportJob,
    startExportQueue,
  };
}
