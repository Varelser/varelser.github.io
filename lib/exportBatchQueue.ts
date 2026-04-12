import type { ParticleConfig, PresetRecord, PresetSequenceItem } from '../types';
import type { CameraPathSlot } from '../types/cameraPath';

export type ExportRunStatus = 'completed' | 'cancelled' | 'failed';

export interface ExportRunMetadata {
  rendererPath: 'dedicated' | 'mirror';
  dedicatedRendererUsed: boolean;
  mirrorFallbackUsed: boolean;
  actualDimensions: {
    width: number;
    height: number;
  };
  cameraPathUsed: boolean;
  cameraPathSlotCount: number;
}

export interface ExportRunResult {
  ok: boolean;
  status: ExportRunStatus;
  message: string;
  metadata: ExportRunMetadata | null;
}

export type ExportBatchJobKind = 'video-webm' | 'png-sequence' | 'gif';
export type ExportBatchJobStatus = 'queued' | 'running' | 'completed' | 'cancelled' | 'failed';

export interface ExportBatchJob {
  id: string;
  label: string;
  kind: ExportBatchJobKind;
  exportMode: 'current' | 'sequence';
  targetDurationSeconds: number;
  fps: number;
  sequenceLength: number;
  sequenceSinglePassDuration: number | null;
  createdAt: string;
  completedAt: string | null;
  status: ExportBatchJobStatus;
  resultMessage: string | null;
  resultMetadata: ExportRunMetadata | null;
  cameraPathEnabled: boolean;
  cameraPathSlotCount: number;
  cameraPathSlotsSnapshot: CameraPathSlot[];
  configSnapshot: ParticleConfig;
  presetSnapshots: PresetRecord[];
  sequenceSnapshot: PresetSequenceItem[];
}

export interface BuildExportBatchJobArgs {
  kind: ExportBatchJobKind;
  exportMode: 'current' | 'sequence';
  targetDurationSeconds: number;
  fps: number;
  sequenceLength: number;
  sequenceSinglePassDuration: number | null;
  config: ParticleConfig;
  cameraPathEnabled: boolean;
  cameraPathSlots: CameraPathSlot[];
  presets: PresetRecord[];
  presetSequence: PresetSequenceItem[];
  createdAt?: string;
  id?: string;
}

export function cloneExportSnapshot<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function formatExportBatchJobLabel(job: Pick<ExportBatchJob, 'kind' | 'exportMode' | 'targetDurationSeconds' | 'fps'>) {
  const kindLabel = job.kind === 'video-webm'
    ? 'WebM'
    : job.kind === 'gif'
      ? 'GIF'
      : 'PNG ZIP';
  return `${kindLabel} · ${job.exportMode} · ${job.targetDurationSeconds.toFixed(1)}s @ ${job.fps}fps`;
}

export function formatExportRunMetadataSummary(metadata: ExportRunMetadata) {
  const parts = [
    metadata.rendererPath === 'dedicated' ? 'dedicated renderer' : 'mirror fallback',
    `${metadata.actualDimensions.width}x${metadata.actualDimensions.height}`,
  ];

  if (metadata.cameraPathUsed) {
    parts.push(`camera path ${metadata.cameraPathSlotCount} slots`);
  } else if (metadata.cameraPathSlotCount > 0) {
    parts.push(`camera path idle (${metadata.cameraPathSlotCount} slots captured)`);
  }

  return parts.join(' · ');
}

export function buildExportBatchJob({
  config,
  cameraPathEnabled,
  cameraPathSlots,
  createdAt = new Date().toISOString(),
  exportMode,
  fps,
  id,
  kind,
  presetSequence,
  presets,
  sequenceLength,
  sequenceSinglePassDuration,
  targetDurationSeconds,
}: BuildExportBatchJobArgs): ExportBatchJob {
  const normalizedCreatedAt = typeof createdAt === 'string' && createdAt ? createdAt : new Date().toISOString();
  const safeId = id ?? `export-job-${normalizedCreatedAt.replace(/[^0-9]/gu, '').slice(0, 17)}-${kind}-${exportMode}`;
  const cameraPathSlotsSnapshot = cloneExportSnapshot(cameraPathSlots);
  const cameraPathSlotCount = cameraPathSlotsSnapshot.filter((slot: CameraPathSlot) => slot !== null).length;
  const job: ExportBatchJob = {
    id: safeId,
    label: formatExportBatchJobLabel({
      kind,
      exportMode,
      targetDurationSeconds,
      fps,
    }),
    kind,
    exportMode,
    targetDurationSeconds,
    fps,
    sequenceLength,
    sequenceSinglePassDuration,
    createdAt: normalizedCreatedAt,
    completedAt: null,
    status: 'queued',
    resultMessage: null,
    resultMetadata: null,
    cameraPathEnabled,
    cameraPathSlotCount,
    cameraPathSlotsSnapshot,
    configSnapshot: cloneExportSnapshot(config),
    presetSnapshots: cloneExportSnapshot(presets),
    sequenceSnapshot: cloneExportSnapshot(presetSequence),
  };
  return job;
}
