import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import { buildExportBatchJob, formatExportBatchJobLabel, formatExportRunMetadataSummary } from '../../lib/exportBatchQueue';
import type { ParticleConfig } from '../../types';
import type { PresetRecord, PresetSequenceItem } from '../../types';

export async function main() {
  const config: ParticleConfig = {
    ...DEFAULT_CONFIG,
    layer2Count: 4321,
    renderQuality: 'cinematic',
  };
  const presets: PresetRecord[] = [
    {
      id: 'preset-a',
      name: 'Preset A',
      createdAt: '2026-04-11T00:00:00.000Z',
      updatedAt: '2026-04-11T00:00:00.000Z',
      config,
    },
  ];
  const presetSequence: PresetSequenceItem[] = [
    {
      id: 'seq-a',
      presetId: 'preset-a',
      label: 'Step A',
      holdSeconds: 2,
      transitionSeconds: 1,
      transitionEasing: 'ease-in-out',
      screenSequenceDriveMode: 'inherit',
      screenSequenceDriveStrengthMode: 'inherit',
      screenSequenceDriveStrengthOverride: null,
      screenSequenceDriveMultiplier: 1,
      keyframeConfig: null,
    },
  ];

  const job = buildExportBatchJob({
    id: 'job-a',
    createdAt: '2026-04-11T00:00:00.000Z',
    kind: 'video-webm',
    exportMode: 'current',
    targetDurationSeconds: 6,
    fps: 30,
    sequenceLength: 0,
    sequenceSinglePassDuration: null,
    config,
    cameraPathEnabled: false,
    cameraPathSlots: [null, null, null, null],
    presets,
    presetSequence,
  });

  assert.equal(job.label, 'WebM · current · 6.0s @ 30fps');
  assert.equal(job.status, 'queued');
  assert.equal(job.resultMetadata, null);
  assert.equal(job.configSnapshot.layer2Count, 4321);
  assert.equal(job.presetSnapshots[0]?.config.layer2Count, 4321);
  assert.equal(job.sequenceSnapshot[0]?.id, 'seq-a');

  config.layer2Count = 99;
  presets[0]!.config.layer2Count = 99;
  assert.equal(job.configSnapshot.layer2Count, 4321);
  assert.equal(job.presetSnapshots[0]?.config.layer2Count, 4321);

  assert.equal(formatExportBatchJobLabel({
    kind: 'png-sequence',
    exportMode: 'sequence',
    targetDurationSeconds: 12.5,
    fps: 24,
  }), 'PNG ZIP · sequence · 12.5s @ 24fps');

  assert.equal(formatExportRunMetadataSummary({
    rendererPath: 'dedicated',
    dedicatedRendererUsed: true,
    mirrorFallbackUsed: false,
    actualDimensions: { width: 1080, height: 1920 },
    cameraPathUsed: true,
    cameraPathSlotCount: 4,
  }), 'dedicated renderer · 1080x1920 · camera path 4 slots');
}
