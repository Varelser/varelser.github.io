import { useEffect, useMemo, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ParticleConfig } from '../types';
import { normalizeConfig } from './appStateConfigNormalization';
import {
  EXTERNAL_CONTROL_BRIDGE_MODE,
  getExternalControlBridgeOptions,
  parseExternalControlInboundMessage,
  type ExternalControlOutboundMessage,
  type ExternalControlPresetTransitionMode,
} from './externalControlBridge';
import {
  getRecommendedExternalControlExportPresetId,
  listExternalControlExportPresetCatalog,
  listExternalControlExportPresetIds,
  type ExternalControlExportPresetExecution,
  type ExternalControlExportPresetId,
} from './externalControlExportPresets';

type UseExternalControlBridgeArgs = {
  activePresetId: string | null;
  activeSequenceItemId: string | null;
  config: ParticleConfig;
  exportQueueLength: number;
  isAudioActive: boolean;
  isExportQueueRunning: boolean;
  isSequencePlaying: boolean;
  videoDurationSeconds: number;
  videoExportMode: 'current' | 'sequence';
  videoFps: number;
  cameraPathDurationSeconds: number;
  cameraPathExportEnabled: boolean;
  cameraPathSlotCount: number;
  isCameraPathPlaying: boolean;
  onCancelExportQueue: () => void;
  onClearExportQueue: () => void;
  onCaptureCameraPathSlot: (slotIndex: number) => boolean;
  onLoadCameraPathSlot: (slotIndex: number) => boolean;
  onMorphCameraPathSlot: (slotIndex: number) => boolean;
  onClearCameraPathSlot: (slotIndex: number) => boolean;
  onPlayCameraPathSequence: () => boolean;
  onStopCameraPathSequence: () => void;
  onSetCameraPathDurationSeconds: (seconds: number) => boolean;
  onSetCameraPathExportEnabled: (enabled: boolean) => void;
  onCopyCameraPathDurationToExport: () => void;
  onSetVideoExportMode: (mode: 'current' | 'sequence') => void;
  onSetVideoDurationSeconds: (seconds: number) => boolean;
  onSetVideoFps: (fps: number) => boolean;
  onSetExportScale: (scale: number) => boolean;
  onSetExportAspectPreset: (preset: ParticleConfig['exportAspectPreset']) => void;
  onSetExportTransparent: (enabled: boolean) => void;
  onRunExportPreset: (presetId: ExternalControlExportPresetId, execution: ExternalControlExportPresetExecution) => boolean;
  onEnqueueFrameExportJob: () => void;
  onEnqueueGifExportJob: () => void;
  onEnqueueVideoExportJob: () => void;
  onLoadPreset: (presetId: string, transitionMode: ExternalControlPresetTransitionMode) => boolean;
  onRandomize: () => void;
  onReplayProjectSeed: () => void;
  onSelectSequenceItem: (itemId: string | null) => boolean;
  onStartExportQueue: () => void;
  onStartAudio: () => void;
  onStartSequencePlayback: () => void;
  onStopAudio: () => void;
  onStopSequencePlayback: () => void;
  presetCount: number;
  sequenceLength: number;
  setConfig: Dispatch<SetStateAction<ParticleConfig>>;
};


function buildExternalControlStatusPayload(args: {
  sessionId: string;
  connected: boolean;
  isSequencePlaying: boolean;
  isAudioActive: boolean;
  activePresetId: string | null;
  activeSequenceItemId: string | null;
  presetCount: number;
  sequenceLength: number;
  exportQueueLength: number;
  isExportQueueRunning: boolean;
  cameraPathSlotCount: number;
  cameraPathDurationSeconds: number;
  cameraPathExportEnabled: boolean;
  isCameraPathPlaying: boolean;
  videoExportMode: 'current' | 'sequence';
  videoDurationSeconds: number;
  videoFps: number;
  config: ParticleConfig;
}): ExternalControlOutboundMessage {
  const exportPresetIds = listExternalControlExportPresetIds();
  const exportPresetCatalog = listExternalControlExportPresetCatalog();
  const recommendedExportPresetId = getRecommendedExternalControlExportPresetId({
    videoExportMode: args.videoExportMode,
    videoDurationSeconds: args.videoDurationSeconds,
    videoFps: args.videoFps,
    exportScale: args.config.exportScale,
    exportAspectPreset: args.config.exportAspectPreset,
    exportTransparent: args.config.exportTransparent,
  });

  return {
    type: 'external-control-status',
    mode: EXTERNAL_CONTROL_BRIDGE_MODE,
    sessionId: args.sessionId,
    connected: args.connected,
    isSequencePlaying: args.isSequencePlaying,
    isAudioActive: args.isAudioActive,
    activePresetId: args.activePresetId,
    activeSequenceItemId: args.activeSequenceItemId,
    presetCount: args.presetCount,
    sequenceLength: args.sequenceLength,
    exportQueueLength: args.exportQueueLength,
    isExportQueueRunning: args.isExportQueueRunning,
    cameraPathSlotCount: args.cameraPathSlotCount,
    cameraPathDurationSeconds: args.cameraPathDurationSeconds,
    cameraPathExportEnabled: args.cameraPathExportEnabled,
    isCameraPathPlaying: args.isCameraPathPlaying,
    videoExportMode: args.videoExportMode,
    videoDurationSeconds: args.videoDurationSeconds,
    videoFps: args.videoFps,
    exportScale: args.config.exportScale,
    exportAspectPreset: args.config.exportAspectPreset,
    exportTransparent: args.config.exportTransparent,
    exportPresetIds,
    exportPresetCatalog,
    recommendedExportPresetId,
    config: args.config,
  };
}

function sendBridgeMessage(socket: WebSocket | null, payload: ExternalControlOutboundMessage) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }
  socket.send(JSON.stringify(payload));
}

export function useExternalControlBridge({
  activePresetId,
  activeSequenceItemId,
  config,
  exportQueueLength,
  isAudioActive,
  isExportQueueRunning,
  isSequencePlaying,
  videoDurationSeconds,
  videoExportMode,
  videoFps,
  cameraPathDurationSeconds,
  cameraPathExportEnabled,
  cameraPathSlotCount,
  isCameraPathPlaying,
  onCancelExportQueue,
  onClearExportQueue,
  onCaptureCameraPathSlot,
  onLoadCameraPathSlot,
  onMorphCameraPathSlot,
  onClearCameraPathSlot,
  onPlayCameraPathSequence,
  onStopCameraPathSequence,
  onSetCameraPathDurationSeconds,
  onSetCameraPathExportEnabled,
  onCopyCameraPathDurationToExport,
  onSetVideoExportMode,
  onSetVideoDurationSeconds,
  onSetVideoFps,
  onSetExportScale,
  onSetExportAspectPreset,
  onSetExportTransparent,
  onRunExportPreset,
  onEnqueueFrameExportJob,
  onEnqueueGifExportJob,
  onEnqueueVideoExportJob,
  onLoadPreset,
  onRandomize,
  onReplayProjectSeed,
  onSelectSequenceItem,
  onStartExportQueue,
  onStartAudio,
  onStartSequencePlayback,
  onStopAudio,
  onStopSequencePlayback,
  presetCount,
  sequenceLength,
  setConfig,
}: UseExternalControlBridgeArgs) {
  const options = useMemo(() => (
    typeof window === 'undefined' ? null : getExternalControlBridgeOptions(window.location.search)
  ), []);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!options?.url || typeof WebSocket === 'undefined') {
      return;
    }

    const socket = new WebSocket(options.url);
    socketRef.current = socket;

    const sendStatus = (connected: boolean) => {
      sendBridgeMessage(socket, buildExternalControlStatusPayload({
        sessionId: options.sessionId,
        connected,
        isSequencePlaying,
        isAudioActive,
        activePresetId,
        activeSequenceItemId,
        presetCount,
        sequenceLength,
        exportQueueLength,
        isExportQueueRunning,
        cameraPathSlotCount,
        cameraPathDurationSeconds,
        cameraPathExportEnabled,
        isCameraPathPlaying,
        videoExportMode,
        videoDurationSeconds,
        videoFps,
        config,
      }));
    };

    socket.addEventListener('open', () => {
      sendStatus(true);
    });

    socket.addEventListener('message', (event) => {
      const message = parseExternalControlInboundMessage(event.data);
      if (!message) {
        sendBridgeMessage(socket, {
          type: 'external-control-error',
          mode: EXTERNAL_CONTROL_BRIDGE_MODE,
          sessionId: options.sessionId,
          message: 'Invalid external control payload.',
        });
        return;
      }

      if (message.sessionId && message.sessionId !== options.sessionId) {
        return;
      }

      if (message.type === 'external-control-handshake') {
        sendStatus(true);
        return;
      }

      if (message.type === 'external-control-export-preset-query') {
        sendStatus(true);
        return;
      }

      if (message.type === 'external-control-patch-config') {
        setConfig((prev) => normalizeConfig({ ...prev, ...message.patch }));
        return;
      }

      if (message.type === 'external-control-replace-config') {
        setConfig(normalizeConfig(message.config));
        return;
      }

      if (message.type === 'external-control-load-preset') {
        const ok = onLoadPreset(message.presetId, message.transitionMode ?? 'instant');
        if (!ok) {
          sendBridgeMessage(socket, {
            type: 'external-control-error',
            mode: EXTERNAL_CONTROL_BRIDGE_MODE,
            sessionId: options.sessionId,
            message: `Unknown preset id: ${message.presetId}`,
          });
          return;
        }
        return;
      }

      if (message.type === 'external-control-export-settings') {
        switch (message.action) {
          case 'set-mode':
            onSetVideoExportMode(message.mode);
            return;
          case 'set-fps':
            if (!onSetVideoFps(message.fps)) {
              sendBridgeMessage(socket, {
                type: 'external-control-error',
                mode: EXTERNAL_CONTROL_BRIDGE_MODE,
                sessionId: options.sessionId,
                message: `Invalid export fps: ${message.fps}`,
              });
            }
            return;
          case 'set-duration':
            if (!onSetVideoDurationSeconds(message.durationSeconds)) {
              sendBridgeMessage(socket, {
                type: 'external-control-error',
                mode: EXTERNAL_CONTROL_BRIDGE_MODE,
                sessionId: options.sessionId,
                message: `Invalid export duration: ${message.durationSeconds}`,
              });
            }
            return;
          case 'set-scale':
            if (!onSetExportScale(message.scale)) {
              sendBridgeMessage(socket, {
                type: 'external-control-error',
                mode: EXTERNAL_CONTROL_BRIDGE_MODE,
                sessionId: options.sessionId,
                message: `Invalid export scale: ${message.scale}`,
              });
            }
            return;
          case 'set-aspect-preset':
            onSetExportAspectPreset(message.aspectPreset);
            return;
          case 'set-transparent':
            onSetExportTransparent(message.enabled);
            return;
          default:
            return;
        }
      }


      if (message.type === 'external-control-export-preset') {
        if (!onRunExportPreset(message.presetId, message.action)) {
          sendBridgeMessage(socket, {
            type: 'external-control-error',
            mode: EXTERNAL_CONTROL_BRIDGE_MODE,
            sessionId: options.sessionId,
            message: `Export preset rejected: ${message.presetId} (${message.action})`,
          });
        }
        return;
      }

      if (message.type === 'external-control-select-sequence-item') {
        const ok = onSelectSequenceItem(message.itemId);
        if (!ok) {
          sendBridgeMessage(socket, {
            type: 'external-control-error',
            mode: EXTERNAL_CONTROL_BRIDGE_MODE,
            sessionId: options.sessionId,
            message: `Unknown sequence item id: ${message.itemId}`,
          });
        }
        return;
      }

      if (message.type === 'external-control-camera-path') {
        switch (message.action) {
          case 'capture-slot':
            if (!onCaptureCameraPathSlot(message.slotIndex)) {
              sendBridgeMessage(socket, {
                type: 'external-control-error',
                mode: EXTERNAL_CONTROL_BRIDGE_MODE,
                sessionId: options.sessionId,
                message: `Invalid camera path slot index: ${message.slotIndex}`,
              });
            }
            return;
          case 'load-slot':
            if (!onLoadCameraPathSlot(message.slotIndex)) {
              sendBridgeMessage(socket, {
                type: 'external-control-error',
                mode: EXTERNAL_CONTROL_BRIDGE_MODE,
                sessionId: options.sessionId,
                message: `Invalid camera path slot index: ${message.slotIndex}`,
              });
            }
            return;
          case 'morph-slot':
            if (!onMorphCameraPathSlot(message.slotIndex)) {
              sendBridgeMessage(socket, {
                type: 'external-control-error',
                mode: EXTERNAL_CONTROL_BRIDGE_MODE,
                sessionId: options.sessionId,
                message: `Invalid camera path slot index: ${message.slotIndex}`,
              });
            }
            return;
          case 'clear-slot':
            if (!onClearCameraPathSlot(message.slotIndex)) {
              sendBridgeMessage(socket, {
                type: 'external-control-error',
                mode: EXTERNAL_CONTROL_BRIDGE_MODE,
                sessionId: options.sessionId,
                message: `Invalid camera path slot index: ${message.slotIndex}`,
              });
            }
            return;
          case 'play':
            if (!onPlayCameraPathSequence()) {
              sendBridgeMessage(socket, {
                type: 'external-control-error',
                mode: EXTERNAL_CONTROL_BRIDGE_MODE,
                sessionId: options.sessionId,
                message: 'Camera path playback requires at least two captured slots.',
              });
            }
            return;
          case 'stop':
            onStopCameraPathSequence();
            return;
          case 'set-duration':
            if (!onSetCameraPathDurationSeconds(message.durationSeconds)) {
              sendBridgeMessage(socket, {
                type: 'external-control-error',
                mode: EXTERNAL_CONTROL_BRIDGE_MODE,
                sessionId: options.sessionId,
                message: `Invalid camera path duration: ${message.durationSeconds}`,
              });
            }
            return;
          case 'set-export-enabled':
            onSetCameraPathExportEnabled(message.enabled);
            return;
          case 'copy-duration-to-export':
            onCopyCameraPathDurationToExport();
            return;
          default:
            return;
        }
      }

      if (message.type === 'external-control-export-queue') {
        switch (message.action) {
          case 'enqueue-video-webm':
            onEnqueueVideoExportJob();
            return;
          case 'enqueue-png-sequence':
            onEnqueueFrameExportJob();
            return;
          case 'enqueue-gif':
            onEnqueueGifExportJob();
            return;
          case 'start':
            onStartExportQueue();
            return;
          case 'cancel':
            onCancelExportQueue();
            return;
          case 'clear':
            onClearExportQueue();
            return;
          default:
            return;
        }
      }

      switch (message.action) {
        case 'randomize':
          onRandomize();
          return;
        case 'replay-seed':
          onReplayProjectSeed();
          return;
        case 'sequence-start':
          onStartSequencePlayback();
          return;
        case 'sequence-stop':
          onStopSequencePlayback();
          return;
        case 'audio-start':
          onStartAudio();
          return;
        case 'audio-stop':
          onStopAudio();
          return;
        default:
          return;
      }
    });

    socket.addEventListener('close', () => {
      socketRef.current = null;
    });

    return () => {
      socket.close();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [
    activeSequenceItemId,
    activePresetId,
    config,
    exportQueueLength,
    isAudioActive,
    isExportQueueRunning,
    isSequencePlaying,
    videoDurationSeconds,
    videoExportMode,
    videoFps,
    cameraPathDurationSeconds,
    cameraPathExportEnabled,
    cameraPathSlotCount,
    isCameraPathPlaying,
    onCancelExportQueue,
    onClearExportQueue,
    onCaptureCameraPathSlot,
    onLoadCameraPathSlot,
    onMorphCameraPathSlot,
    onClearCameraPathSlot,
    onPlayCameraPathSequence,
    onStopCameraPathSequence,
    onSetCameraPathDurationSeconds,
    onSetCameraPathExportEnabled,
    onCopyCameraPathDurationToExport,
    onSetVideoExportMode,
    onSetVideoDurationSeconds,
    onSetVideoFps,
    onSetExportScale,
    onSetExportAspectPreset,
    onSetExportTransparent,
    onRunExportPreset,
    onEnqueueFrameExportJob,
    onEnqueueGifExportJob,
    onEnqueueVideoExportJob,
    onLoadPreset,
    onRandomize,
    onReplayProjectSeed,
    onSelectSequenceItem,
    onStartExportQueue,
    onStartAudio,
    onStartSequencePlayback,
    onStopAudio,
    onStopSequencePlayback,
    options,
    presetCount,
    sequenceLength,
    setConfig,
  ]);

  useEffect(() => {
    if (!options) {
      return;
    }
    sendBridgeMessage(socketRef.current, buildExternalControlStatusPayload({
      sessionId: options.sessionId,
      connected: true,
      isSequencePlaying,
      isAudioActive,
      activePresetId,
      activeSequenceItemId,
      presetCount,
      sequenceLength,
      exportQueueLength,
      isExportQueueRunning,
      cameraPathSlotCount,
      cameraPathDurationSeconds,
      cameraPathExportEnabled,
      isCameraPathPlaying,
      videoExportMode,
      videoDurationSeconds,
      videoFps,
      config,
    }));
  }, [
    activePresetId,
    activeSequenceItemId,
    config,
    exportQueueLength,
    isAudioActive,
    isExportQueueRunning,
    isSequencePlaying,
    videoDurationSeconds,
    videoExportMode,
    videoFps,
    cameraPathDurationSeconds,
    cameraPathExportEnabled,
    cameraPathSlotCount,
    isCameraPathPlaying,
    options,
    presetCount,
    sequenceLength,
  ]);
}
