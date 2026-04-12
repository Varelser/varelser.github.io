import { MutableRefObject, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Camera, Scene, WebGLRenderer } from 'three';
import type { ParticleConfig, PresetRecord, PresetSequenceItem } from '../types';
import type { CameraPathSlot, CameraRigApi } from '../types/cameraPath';
import type { SynthEngine } from './audioControllerTypes';
import { useExportBatchQueue } from './useExportBatchQueue';
import { useFrameExport } from './useFrameExport';
import { useGifExport } from './useGifExport';
import { useVideoExport } from './useVideoExport';
import type { ExportCameraPathPlan } from './exportCameraPath';

type UseExportControllerArgs = {
  applyConfigInstant: (nextConfig: ParticleConfig) => void;
  activeSequenceItemId: string | null;
  config: ParticleConfig;
  stopSequencePlayback: () => void;
  handleStartSequencePlayback: () => void;
  presetSequenceLength: number;
  presetSequence: PresetSequenceItem[];
  presets: PresetRecord[];
  rendererRef: MutableRefObject<WebGLRenderer | null>;
  sceneRef?: MutableRefObject<Scene | null>;
  cameraRef?: MutableRefObject<Camera | null>;
  cameraRigApiRef?: MutableRefObject<CameraRigApi | null>;
  cameraPathEnabled: boolean;
  cameraPathSlots: CameraPathSlot[];
  sequenceLoopEnabled: boolean;
  sequenceSinglePassDuration: number;
  setActiveSequenceItemId: (value: string | null) => void;
  setPresetSequence: Dispatch<SetStateAction<PresetSequenceItem[]>>;
  setPresets: Dispatch<SetStateAction<PresetRecord[]>>;
  setSequenceLoopEnabled: (value: boolean) => void;
  microphoneStreamRef: MutableRefObject<MediaStream | null>;
  sharedAudioStreamRef: MutableRefObject<MediaStream | null>;
  synthEngineRef: MutableRefObject<SynthEngine | null>;
  videoDurationSeconds: number;
  videoExportMode: 'current' | 'sequence';
  videoFps: number;
};

export function useExportController(args: UseExportControllerArgs) {
  const cameraPathPlan: ExportCameraPathPlan = {
    enabled: args.cameraPathEnabled,
    slots: args.cameraPathSlots,
  };
  const videoExport = useVideoExport({
    ...args,
    cameraPathPlan,
  });
  const frameExport = useFrameExport({
    config: args.config,
    handleStartSequencePlayback: args.handleStartSequencePlayback,
    presetSequenceLength: args.presetSequenceLength,
    rendererRef: args.rendererRef,
    sceneRef: args.sceneRef,
    cameraRef: args.cameraRef,
    cameraRigApiRef: args.cameraRigApiRef,
    cameraPathPlan,
    sequenceLoopEnabled: args.sequenceLoopEnabled,
    sequenceSinglePassDuration: args.sequenceSinglePassDuration,
    setSequenceLoopEnabled: args.setSequenceLoopEnabled,
    stopSequencePlayback: args.stopSequencePlayback,
    videoDurationSeconds: args.videoDurationSeconds,
    videoExportMode: args.videoExportMode,
    videoFps: args.videoFps,
  });
  const gifExport = useGifExport({
    config: args.config,
    handleStartSequencePlayback: args.handleStartSequencePlayback,
    presetSequenceLength: args.presetSequenceLength,
    rendererRef: args.rendererRef,
    sceneRef: args.sceneRef,
    cameraRef: args.cameraRef,
    cameraRigApiRef: args.cameraRigApiRef,
    cameraPathPlan,
    sequenceLoopEnabled: args.sequenceLoopEnabled,
    sequenceSinglePassDuration: args.sequenceSinglePassDuration,
    setSequenceLoopEnabled: args.setSequenceLoopEnabled,
    stopSequencePlayback: args.stopSequencePlayback,
    videoDurationSeconds: args.videoDurationSeconds,
    videoExportMode: args.videoExportMode,
    videoFps: args.videoFps,
  });

  const exportBatchQueue = useExportBatchQueue({
    applyConfigInstant: args.applyConfigInstant,
    activeSequenceItemId: args.activeSequenceItemId,
    config: args.config,
    cameraPathEnabled: args.cameraPathEnabled,
    cameraPathSlots: args.cameraPathSlots,
    isFrameExporting: frameExport.isFrameExporting,
    isGifExporting: gifExport.isGifExporting,
    isVideoRecording: videoExport.isVideoRecording,
    presetSequence: args.presetSequence,
    presetSequenceLength: args.presetSequenceLength,
    presets: args.presets,
    runFrameExport: frameExport.runFrameExport,
    runGifExport: gifExport.runGifExport,
    runVideoRecording: videoExport.runVideoRecording,
    sequenceSinglePassDuration: args.sequenceSinglePassDuration,
    setActiveSequenceItemId: args.setActiveSequenceItemId,
    setPresetSequence: args.setPresetSequence,
    setPresets: args.setPresets,
    stopFrameExport: frameExport.stopFrameExport,
    stopGifExport: gifExport.stopGifExport,
    stopVideoRecording: videoExport.stopVideoRecording,
    videoDurationSeconds: args.videoDurationSeconds,
    videoExportMode: args.videoExportMode,
    videoFps: args.videoFps,
  });

  const startVideoRecording = useCallback(() => {
    if (frameExport.isFrameExporting) {
      videoExport.showVideoNotice('Stop PNG frame export before recording video.');
      return;
    }
    if (gifExport.isGifExporting) {
      videoExport.showVideoNotice('Stop GIF export before recording video.');
      return;
    }
    videoExport.startVideoRecording();
  }, [frameExport.isFrameExporting, gifExport.isGifExporting, videoExport]);

  const startFrameExport = useCallback(() => {
    if (videoExport.isVideoRecording) {
      frameExport.showFrameNotice('Stop video recording before exporting PNG frames.');
      return;
    }
    if (gifExport.isGifExporting) {
      frameExport.showFrameNotice('Stop GIF export before exporting PNG frames.');
      return;
    }
    void frameExport.startFrameExport();
  }, [frameExport, gifExport.isGifExporting, videoExport.isVideoRecording]);

  const startGifExport = useCallback(() => {
    if (videoExport.isVideoRecording) {
      gifExport.showGifNotice('Stop video recording before exporting GIF.');
      return;
    }
    if (frameExport.isFrameExporting) {
      gifExport.showGifNotice('Stop PNG frame export before exporting GIF.');
      return;
    }
    void gifExport.startGifExport();
  }, [frameExport.isFrameExporting, gifExport, videoExport.isVideoRecording]);

  return {
    ...exportBatchQueue,
    ...frameExport,
    ...gifExport,
    ...videoExport,
    startFrameExport,
    startGifExport,
    startVideoRecording,
  };
}
