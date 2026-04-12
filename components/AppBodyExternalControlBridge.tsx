import React from 'react';
import type { ParticleConfig } from '../types';
import {
  getExternalControlExportPresetDefinition,
  type ExternalControlExportPresetExecution,
  type ExternalControlExportPresetId,
} from '../lib/externalControlExportPresets';
import { useExternalControlBridge } from '../lib/useExternalControlBridge';

type AppBodyExternalControlBridgeProps = {
  audioController: any;
  config: ParticleConfig;
  exportQueue: any[];
  isExportQueueRunning: boolean;
  isFrameExporting: boolean;
  isGifExporting: boolean;
  isVideoRecording: boolean;
  cancelExportQueue: () => void;
  clearExportQueue: () => void;
  enqueueExportJobWithOverrides: (job: any) => void;
  enqueueFrameExportJob: () => void;
  enqueueGifExportJob: () => void;
  enqueueVideoExportJob: () => void;
  handleLoadPreset: (presetId: string) => void;
  handleTransitionToPreset: (presetId: string) => void;
  onReplayProjectSeed: () => void;
  presetLibrary: any;
  runFrameExport: (overrides: any) => Promise<unknown>;
  runGifExport: (overrides: any) => Promise<unknown>;
  runVideoRecording: (overrides: any) => Promise<unknown>;
  sequenceController: any;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  startExportQueue: () => Promise<void>;
  uiState: any;
};

export const AppBodyExternalControlBridge: React.FC<AppBodyExternalControlBridgeProps> = ({
  audioController,
  cancelExportQueue,
  clearExportQueue,
  config,
  enqueueExportJobWithOverrides,
  enqueueFrameExportJob,
  enqueueGifExportJob,
  enqueueVideoExportJob,
  exportQueue,
  handleLoadPreset,
  handleTransitionToPreset,
  isExportQueueRunning,
  isFrameExporting,
  isGifExporting,
  isVideoRecording,
  onReplayProjectSeed,
  presetLibrary,
  runFrameExport,
  runGifExport,
  runVideoRecording,
  sequenceController,
  setConfig,
  startExportQueue,
  uiState,
}) => {
  const handleRunExternalControlExportPreset = (
    presetId: ExternalControlExportPresetId,
    execution: ExternalControlExportPresetExecution,
  ) => {
    const preset = getExternalControlExportPresetDefinition(presetId);
    const nextDurationSeconds = preset.videoExportMode === 'sequence'
      ? Math.max(0.5, sequenceController.sequenceSinglePassDuration)
      : Math.max(0.5, preset.videoDurationSeconds);
    const nextConfig: ParticleConfig = {
      ...config,
      exportScale: preset.exportScale,
      exportAspectPreset: preset.exportAspectPreset,
      exportTransparent: preset.exportTransparent,
    };

    uiState.setVideoExportMode(preset.videoExportMode);
    uiState.setVideoFps(preset.videoFps);
    uiState.setVideoDurationSeconds(Math.round(nextDurationSeconds * 1000) / 1000);
    setConfig(nextConfig);

    if (execution === 'apply') {
      return true;
    }

    const exportOverrides = {
      config: nextConfig,
      videoExportMode: preset.videoExportMode,
      videoDurationSeconds: nextDurationSeconds,
      videoFps: preset.videoFps,
      presetSequenceLength: sequenceController.presetSequence.length,
      sequenceSinglePassDuration: sequenceController.sequenceSinglePassDuration,
      cameraPathPlan: {
        enabled: uiState.cameraPathExportEnabled,
        slots: uiState.cameraPathSlots,
      },
    };

    if (execution === 'enqueue') {
      enqueueExportJobWithOverrides({
        kind: preset.kind,
        config: nextConfig,
        exportMode: preset.videoExportMode,
        targetDurationSeconds: nextDurationSeconds,
        fps: preset.videoFps,
        sequenceLength: sequenceController.presetSequence.length,
        sequenceSinglePassDuration: preset.videoExportMode === 'sequence'
          ? sequenceController.sequenceSinglePassDuration
          : null,
        cameraPathEnabled: uiState.cameraPathExportEnabled,
        cameraPathSlots: uiState.cameraPathSlots,
      });
      return true;
    }

    if (isFrameExporting || isGifExporting || isVideoRecording) {
      return false;
    }

    if (preset.kind === 'video-webm') {
      void runVideoRecording(exportOverrides);
      return true;
    }
    if (preset.kind === 'gif') {
      void runGifExport(exportOverrides);
      return true;
    }
    void runFrameExport(exportOverrides);
    return true;
  };

  useExternalControlBridge({
    activePresetId: presetLibrary.activePresetId,
    activeSequenceItemId: sequenceController.activeSequenceItemId,
    config,
    exportQueueLength: exportQueue.length,
    isAudioActive: audioController.isAudioActive,
    isExportQueueRunning,
    isSequencePlaying: sequenceController.isSequencePlaying,
    videoDurationSeconds: uiState.videoDurationSeconds,
    videoExportMode: uiState.videoExportMode,
    videoFps: uiState.videoFps,
    cameraPathDurationSeconds: uiState.cameraPathDurationSeconds,
    cameraPathExportEnabled: uiState.cameraPathExportEnabled,
    cameraPathSlotCount: uiState.cameraPathSlots.length,
    isCameraPathPlaying: uiState.isCameraPathPlaying,
    onCancelExportQueue: cancelExportQueue,
    onClearExportQueue: clearExportQueue,
    onCaptureCameraPathSlot: (slotIndex) => {
      if (slotIndex < 0 || slotIndex >= uiState.cameraPathSlots.length) {
        return false;
      }
      uiState.onCaptureCameraPathSlot(slotIndex);
      return true;
    },
    onLoadCameraPathSlot: (slotIndex) => {
      if (slotIndex < 0 || slotIndex >= uiState.cameraPathSlots.length) {
        return false;
      }
      uiState.onLoadCameraPathSlot(slotIndex);
      return true;
    },
    onMorphCameraPathSlot: (slotIndex) => {
      if (slotIndex < 0 || slotIndex >= uiState.cameraPathSlots.length) {
        return false;
      }
      uiState.onMorphCameraPathSlot(slotIndex);
      return true;
    },
    onClearCameraPathSlot: (slotIndex) => {
      if (slotIndex < 0 || slotIndex >= uiState.cameraPathSlots.length) {
        return false;
      }
      uiState.onClearCameraPathSlot(slotIndex);
      return true;
    },
    onPlayCameraPathSequence: () => {
      if (uiState.cameraPathSlots.filter((slot: unknown) => slot !== null).length < 2) {
        return false;
      }
      uiState.onPlayCameraPathSequence();
      return true;
    },
    onStopCameraPathSequence: uiState.onStopCameraPathSequence,
    onSetCameraPathDurationSeconds: (seconds) => {
      if (!Number.isFinite(seconds) || seconds <= 0) {
        return false;
      }
      uiState.onCameraPathDurationSecondsChange(seconds);
      return true;
    },
    onSetCameraPathExportEnabled: uiState.onCameraPathExportEnabledChange,
    onCopyCameraPathDurationToExport: uiState.onCopyCameraPathDurationToExport,
    onSetVideoExportMode: uiState.setVideoExportMode,
    onSetVideoDurationSeconds: (seconds) => {
      if (!Number.isFinite(seconds) || seconds < 1 || seconds > 30) {
        return false;
      }
      uiState.setVideoDurationSeconds(Math.round(seconds * 1000) / 1000);
      return true;
    },
    onSetVideoFps: (fps) => {
      if (!Number.isFinite(fps) || fps < 12 || fps > 60) {
        return false;
      }
      uiState.setVideoFps(Math.round(fps));
      return true;
    },
    onSetExportScale: (scale) => {
      if (!Number.isFinite(scale) || scale < 1 || scale > 8) {
        return false;
      }
      setConfig((prev) => ({ ...prev, exportScale: Math.round(scale * 1000) / 1000 }));
      return true;
    },
    onSetExportAspectPreset: (preset) => {
      setConfig((prev) => ({ ...prev, exportAspectPreset: preset }));
    },
    onSetExportTransparent: (enabled) => {
      setConfig((prev) => ({ ...prev, exportTransparent: enabled }));
    },
    onRunExportPreset: handleRunExternalControlExportPreset,
    onEnqueueFrameExportJob: enqueueFrameExportJob,
    onEnqueueGifExportJob: enqueueGifExportJob,
    onEnqueueVideoExportJob: enqueueVideoExportJob,
    onLoadPreset: (presetId, transitionMode) => {
      if (!presetLibrary.presets.some((preset: { id: string }) => preset.id === presetId)) {
        return false;
      }
      if (transitionMode === 'morph') {
        handleTransitionToPreset(presetId);
      } else {
        handleLoadPreset(presetId);
      }
      return true;
    },
    onRandomize: presetLibrary.handleRandomize,
    onReplayProjectSeed,
    onSelectSequenceItem: (itemId) => {
      if (itemId !== null && !sequenceController.presetSequence.some((item: { id: string }) => item.id === itemId)) {
        return false;
      }
      sequenceController.setActiveSequenceItemId(itemId);
      return true;
    },
    onStartExportQueue: () => {
      void startExportQueue();
    },
    onStartAudio: audioController.startAudio,
    onStartSequencePlayback: sequenceController.handleStartSequencePlayback,
    onStopAudio: audioController.stopAudio,
    onStopSequencePlayback: sequenceController.handleStopSequencePlayback,
    presetCount: presetLibrary.presets.length,
    sequenceLength: sequenceController.presetSequence.length,
    setConfig,
  });

  return null;
};
