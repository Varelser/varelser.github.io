import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import { buildCaptureExportManifest } from '../../lib/captureExportManifest';

export async function main() {
  const config = {
    ...DEFAULT_CONFIG,
    audioEnabled: true,
    audioSourceMode: 'microphone',
    renderQuality: 'cinematic',
    layer2Enabled: true,
    layer2ConnectionEnabled: true,
    layer2Count: 96000,
    projectSeedLockEnabled: true,
    projectSeedValue: 4101,
    projectSeedAutoAdvance: true,
    projectSeedStep: 9,
    projectSeedLastApplied: 4101,
    projectSeedLastTriggerKind: 'preset-randomize',
    projectSeedLastMutationScope: 'hybrid',
    projectSeedLastMutationIntensity: 0.88,
    projectSeedLastRecordedAt: '2026-04-10T00:00:00.000Z',
  } as const;

  const manifestA = buildCaptureExportManifest({
    kind: 'png-sequence',
    exportMode: 'sequence',
    fileName: 'capture.zip',
    mimeType: 'application/zip',
    config,
    targetDurationSeconds: 6,
    fps: 30,
    frameCount: 180,
    includeAudio: false,
    exportScale: config.exportScale,
    transparentBackground: config.exportTransparent,
    canvas: { width: 1920, height: 1080, devicePixelRatio: 2 },
    sequenceLength: 4,
    sequenceSinglePassDuration: 6,
  });
  const manifestB = buildCaptureExportManifest({
    kind: 'png-sequence',
    exportMode: 'sequence',
    fileName: 'capture.zip',
    mimeType: 'application/zip',
    config,
    targetDurationSeconds: 6,
    fps: 30,
    frameCount: 180,
    includeAudio: false,
    exportScale: config.exportScale,
    transparentBackground: config.exportTransparent,
    canvas: { width: 1920, height: 1080, devicePixelRatio: 2 },
    sequenceLength: 4,
    sequenceSinglePassDuration: 6,
  });

  assert.equal(manifestA.configHash, manifestB.configHash);
  assert.equal(manifestA.reproduction.captureFingerprint, manifestB.reproduction.captureFingerprint);
  assert.equal(manifestA.performanceTier, 'heavy');
  assert.equal(manifestA.summary.layerCounts.layer2, 96000);
  assert.equal(manifestA.sequenceLength, 4);
  assert.equal(manifestA.frameCount, 180);
  assert.equal(manifestA.canvas?.width, 1920);
  assert.equal(manifestA.includeAudio, false);
  assert.ok(manifestA.advice.some((entry) => entry.includes('Connection lines')));
  assert.ok(manifestA.advice.some((entry) => entry.includes('Cinematic quality')));
  assert.equal(manifestA.configSnapshot.layer2Count, 96000);
  assert.equal(manifestA.summary.seedReplay.currentSeedValue, 4101);
  assert.equal(manifestA.summary.seedReplay.autoAdvance, true);
  assert.equal(manifestA.summary.seedReplay.step, 9);
  assert.equal(manifestA.summary.seedReplay.lastTriggerKind, 'preset-randomize');
  assert.equal(manifestA.summary.seedReplay.lastMutationIntensity, 0.88);
}
