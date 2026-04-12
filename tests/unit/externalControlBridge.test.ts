import assert from 'node:assert/strict';
import {
  EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX,
  EXTERNAL_CONTROL_BRIDGE_SESSION_PARAM,
  EXTERNAL_CONTROL_BRIDGE_URL_PARAM,
  getExternalControlBridgeOptions,
  mapExternalControlOscMessage,
  parseExternalControlInboundMessage,
} from '../../lib/externalControlBridge';

export async function main() {
  const options = getExternalControlBridgeOptions(
    `?${EXTERNAL_CONTROL_BRIDGE_URL_PARAM}=ws%3A%2F%2F127.0.0.1%3A18181&${EXTERNAL_CONTROL_BRIDGE_SESSION_PARAM}=bridge-a`,
  );
  assert.equal(options?.url, 'ws://127.0.0.1:18181');
  assert.equal(options?.sessionId, 'bridge-a');
  assert.equal(getExternalControlBridgeOptions('?foo=bar'), null);

  const patchMessage = parseExternalControlInboundMessage(JSON.stringify({
    type: 'external-control-patch-config',
    sessionId: 'bridge-a',
    patch: { projectSeedValue: 4201 },
  }));
  assert.equal(patchMessage?.type, 'external-control-patch-config');
  assert.equal(patchMessage?.sessionId, 'bridge-a');
  if (patchMessage?.type !== 'external-control-patch-config') {
    throw new Error('expected patch message');
  }
  assert.equal(patchMessage.patch.projectSeedValue, 4201);

  const actionMessage = parseExternalControlInboundMessage({
    type: 'external-control-action',
    action: 'replay-seed',
  });
  assert.equal(actionMessage?.type, 'external-control-action');
  if (actionMessage?.type !== 'external-control-action') {
    throw new Error('expected action message');
  }
  assert.equal(actionMessage.action, 'replay-seed');

  const presetMessage = parseExternalControlInboundMessage({
    type: 'external-control-load-preset',
    sessionId: 'bridge-a',
    presetId: 'future-native-mpm-granular-sand-fall',
    transitionMode: 'morph',
  });
  assert.equal(presetMessage?.type, 'external-control-load-preset');
  if (presetMessage?.type !== 'external-control-load-preset') {
    throw new Error('expected preset message');
  }
  assert.equal(presetMessage.presetId, 'future-native-mpm-granular-sand-fall');
  assert.equal(presetMessage.transitionMode, 'morph');

  const queueMessage = parseExternalControlInboundMessage({
    type: 'external-control-export-queue',
    action: 'enqueue-video-webm',
  });
  assert.equal(queueMessage?.type, 'external-control-export-queue');
  if (queueMessage?.type !== 'external-control-export-queue') {
    throw new Error('expected export queue message');
  }
  assert.equal(queueMessage.action, 'enqueue-video-webm');

  const exportSettingsMessage = parseExternalControlInboundMessage({
    type: 'external-control-export-settings',
    action: 'set-aspect-preset',
    aspectPreset: 'story-9-16',
  });
  assert.equal(exportSettingsMessage?.type, 'external-control-export-settings');
  if (exportSettingsMessage?.type !== 'external-control-export-settings' || exportSettingsMessage.action !== 'set-aspect-preset') {
    throw new Error('expected export settings message');
  }
  assert.equal(exportSettingsMessage.aspectPreset, 'story-9-16');

  const exportPresetMessage = parseExternalControlInboundMessage({
    type: 'external-control-export-preset',
    action: 'enqueue',
    presetId: 'gif-loop-story',
  });
  assert.equal(exportPresetMessage?.type, 'external-control-export-preset');
  if (exportPresetMessage?.type !== 'external-control-export-preset') {
    throw new Error('expected export preset message');
  }
  assert.equal(exportPresetMessage.action, 'enqueue');
  assert.equal(exportPresetMessage.presetId, 'gif-loop-story');


  const exportPresetQueryMessage = parseExternalControlInboundMessage({
    type: 'external-control-export-preset-query',
    action: 'status',
  });
  assert.equal(exportPresetQueryMessage?.type, 'external-control-export-preset-query');
  if (exportPresetQueryMessage?.type !== 'external-control-export-preset-query') {
    throw new Error('expected export preset query message');
  }
  assert.equal(exportPresetQueryMessage.action, 'status');

  const cameraPathMessage = parseExternalControlInboundMessage({
    type: 'external-control-camera-path',
    action: 'set-duration',
    durationSeconds: 6.5,
  });
  assert.equal(cameraPathMessage?.type, 'external-control-camera-path');
  if (cameraPathMessage?.type !== 'external-control-camera-path' || cameraPathMessage.action !== 'set-duration') {
    throw new Error('expected camera path duration message');
  }
  assert.equal(cameraPathMessage.durationSeconds, 6.5);

  const oscPresetMessage = mapExternalControlOscMessage({
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/preset/load`,
    args: ['future-native-mpm-granular-sand-fall', 'morph'],
    sessionId: 'bridge-a',
  });
  assert.equal(oscPresetMessage?.type, 'external-control-load-preset');
  if (oscPresetMessage?.type !== 'external-control-load-preset') {
    throw new Error('expected osc preset message');
  }
  assert.equal(oscPresetMessage.presetId, 'future-native-mpm-granular-sand-fall');
  assert.equal(oscPresetMessage.transitionMode, 'morph');

  const oscPatchMessage = mapExternalControlOscMessage({
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/config/patch`,
    args: ['{"projectSeedValue":4201}'],
  });
  assert.equal(oscPatchMessage?.type, 'external-control-patch-config');
  if (oscPatchMessage?.type !== 'external-control-patch-config') {
    throw new Error('expected osc patch message');
  }
  assert.equal(oscPatchMessage.patch.projectSeedValue, 4201);

  const oscQueueMessage = mapExternalControlOscMessage({
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/queue/start`,
  });
  assert.equal(oscQueueMessage?.type, 'external-control-export-queue');
  if (oscQueueMessage?.type !== 'external-control-export-queue') {
    throw new Error('expected osc queue message');
  }
  assert.equal(oscQueueMessage.action, 'start');

  const oscExportAspectMessage = mapExternalControlOscMessage({
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/aspect`,
    args: ['story-9-16'],
  });
  assert.equal(oscExportAspectMessage?.type, 'external-control-export-settings');
  if (oscExportAspectMessage?.type !== 'external-control-export-settings' || oscExportAspectMessage.action !== 'set-aspect-preset') {
    throw new Error('expected osc export aspect message');
  }
  assert.equal(oscExportAspectMessage.aspectPreset, 'story-9-16');

  const oscExportFpsMessage = mapExternalControlOscMessage({
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/fps`,
    args: [24],
  });
  assert.equal(oscExportFpsMessage?.type, 'external-control-export-settings');
  if (oscExportFpsMessage?.type !== 'external-control-export-settings' || oscExportFpsMessage.action !== 'set-fps') {
    throw new Error('expected osc export fps message');
  }
  assert.equal(oscExportFpsMessage.fps, 24);

  const oscExportPresetMessage = mapExternalControlOscMessage({
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/preset/start`,
    args: ['video-story-vertical'],
  });
  assert.equal(oscExportPresetMessage?.type, 'external-control-export-preset');
  if (oscExportPresetMessage?.type !== 'external-control-export-preset') {
    throw new Error('expected osc export preset message');
  }
  assert.equal(oscExportPresetMessage.action, 'start');
  assert.equal(oscExportPresetMessage.presetId, 'video-story-vertical');


  const oscExportPresetStatusMessage = mapExternalControlOscMessage({
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/preset/status`,
  });
  assert.equal(oscExportPresetStatusMessage?.type, 'external-control-export-preset-query');
  if (oscExportPresetStatusMessage?.type !== 'external-control-export-preset-query') {
    throw new Error('expected osc export preset status message');
  }
  assert.equal(oscExportPresetStatusMessage.action, 'status');

  const oscCameraPathCapture = mapExternalControlOscMessage({
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/camera-path/capture`,
    args: [2],
    sessionId: 'bridge-a',
  });
  assert.equal(oscCameraPathCapture?.type, 'external-control-camera-path');
  if (oscCameraPathCapture?.type !== 'external-control-camera-path' || oscCameraPathCapture.action !== 'capture-slot') {
    throw new Error('expected osc camera path capture message');
  }
  assert.equal(oscCameraPathCapture.slotIndex, 1);

  const oscCameraPathToggle = mapExternalControlOscMessage({
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/camera-path/export-enabled`,
    args: ['on'],
  });
  assert.equal(oscCameraPathToggle?.type, 'external-control-camera-path');
  if (oscCameraPathToggle?.type !== 'external-control-camera-path' || oscCameraPathToggle.action !== 'set-export-enabled') {
    throw new Error('expected osc camera path export toggle message');
  }
  assert.equal(oscCameraPathToggle.enabled, true);

  const oscSequenceClearMessage = mapExternalControlOscMessage({
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/sequence/select`,
    args: [null],
  });
  assert.equal(oscSequenceClearMessage?.type, 'external-control-select-sequence-item');
  if (oscSequenceClearMessage?.type !== 'external-control-select-sequence-item') {
    throw new Error('expected osc sequence select message');
  }
  assert.equal(oscSequenceClearMessage.itemId, null);

  assert.equal(parseExternalControlInboundMessage('{invalid'), null);
  assert.equal(parseExternalControlInboundMessage({ type: 'external-control-action', action: 'nope' }), null);
  assert.equal(parseExternalControlInboundMessage({ type: 'external-control-load-preset', presetId: 'preset-a', transitionMode: 'slow' }), null);
  assert.equal(parseExternalControlInboundMessage({ type: 'external-control-camera-path', action: 'set-duration', durationSeconds: 0 }), null);
  assert.equal(parseExternalControlInboundMessage({ type: 'external-control-export-settings', action: 'set-aspect-preset', aspectPreset: 'bad' }), null);
  assert.equal(parseExternalControlInboundMessage({ type: 'external-control-export-preset', action: 'start', presetId: 'bad-preset' }), null);
  assert.equal(mapExternalControlOscMessage({ address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/preset/load`, args: [] }), null);
  assert.equal(mapExternalControlOscMessage({ address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/config/patch`, args: ['nope'] }), null);
  assert.equal(mapExternalControlOscMessage({ address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/camera-path/export-enabled`, args: ['maybe'] }), null);
  assert.equal(mapExternalControlOscMessage({ address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/aspect`, args: ['bad'] }), null);
  assert.equal(mapExternalControlOscMessage({ address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/preset/enqueue`, args: ['bad-preset'] }), null);
}
