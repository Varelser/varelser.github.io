import assert from 'node:assert/strict';
import {
  createExternalControlBridgeProxyStatusSnapshot,
  updateExternalControlBridgeProxyStatusSnapshot,
} from '../../lib/externalControlBridgeStatus';

export async function main() {
  const initial = createExternalControlBridgeProxyStatusSnapshot(0);
  assert.equal(initial.connectedClientCount, 0);
  assert.equal(initial.messageCount, 0);
  assert.equal(initial.latestStatus, null);
  assert.equal(initial.latestError, null);

  const afterStatus = updateExternalControlBridgeProxyStatusSnapshot(initial, {
    type: 'external-control-status',
    mode: 'ws-json',
    sessionId: 'bridge-a',
    connected: true,
    isSequencePlaying: false,
    isAudioActive: true,
    activePresetId: 'preset-a',
    activeSequenceItemId: 'seq-a',
    presetCount: 10,
    sequenceLength: 5,
    exportQueueLength: 2,
    isExportQueueRunning: true,
    cameraPathSlotCount: 3,
    cameraPathDurationSeconds: 8,
    cameraPathExportEnabled: true,
    isCameraPathPlaying: false,
    videoExportMode: 'current',
    videoDurationSeconds: 6,
    videoFps: 24,
    exportScale: 2,
    exportAspectPreset: 'story-9-16',
    exportTransparent: false,
    exportPresetIds: ['video-preview-square', 'gif-loop-story'],
    exportPresetCatalog: [
      {
        id: 'video-preview-square',
        label: 'WebM Preview Square',
        kind: 'video-webm',
        videoExportMode: 'current',
        videoDurationSeconds: 6,
        videoFps: 24,
        exportScale: 1,
        exportAspectPreset: 'square',
        exportTransparent: false,
        tags: ['preview', 'square', 'webm', 'fast-review'],
        useCase: 'preview',
        qualityTier: 'draft',
        aspectFamily: 'square',
        expectedCost: 'low',
      },
    ],
    recommendedExportPresetId: 'video-preview-square',
    config: { projectSeedValue: 4201 } as any,
  }, 1);
  assert.equal(afterStatus.connectedClientCount, 1);
  assert.equal(afterStatus.messageCount, 1);
  assert.equal(afterStatus.statusCount, 1);
  assert.equal(afterStatus.errorCount, 0);
  assert.equal(afterStatus.latestStatus?.sessionId, 'bridge-a');
  assert.equal(afterStatus.latestError, null);
  assert.deepEqual(afterStatus.latestStatus?.exportPresetCatalog[0]?.tags, ['preview', 'square', 'webm', 'fast-review']);
  assert.equal(afterStatus.latestStatus?.exportPresetCatalog[0]?.useCase, 'preview');
  assert.equal(afterStatus.latestStatus?.exportPresetCatalog[0]?.qualityTier, 'draft');
  assert.equal(afterStatus.latestStatus?.exportPresetCatalog[0]?.aspectFamily, 'square');
  assert.equal(afterStatus.latestStatus?.exportPresetCatalog[0]?.expectedCost, 'low');

  const afterError = updateExternalControlBridgeProxyStatusSnapshot(afterStatus, {
    type: 'external-control-error',
    mode: 'ws-json',
    sessionId: 'bridge-a',
    message: 'Unknown preset id: preset-missing',
  }, 1);
  assert.equal(afterError.messageCount, 2);
  assert.equal(afterError.statusCount, 1);
  assert.equal(afterError.errorCount, 1);
  assert.equal(afterError.latestStatus?.activePresetId, 'preset-a');
  assert.equal(afterError.latestError?.message, 'Unknown preset id: preset-missing');

  console.log('externalControlBridgeStatus ok');
}
