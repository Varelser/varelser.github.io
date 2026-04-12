import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import type { Camera, Scene, WebGLRenderer } from 'three';
import type { ParticleConfig } from '../types';
import type { Notice, SynthEngine } from './audioControllerTypes';
import type { CameraRigApi } from '../types/cameraPath';
import type { ExportRunResult } from './exportBatchQueue';
import { createExportRenderTargetCanvas, startCanvasMirrorLoop } from './exportDimensions';
import { createDedicatedExportRenderSession, startDedicatedExportRenderLoop } from './exportSceneRenderer';
import { getExportCameraPathSlotCount, startExportCameraPathPlayback, type ExportCameraPathPlan } from './exportCameraPath';
import { getRuntimeProfilingNow, recordRuntimeProfilingDuration } from './runtimeProfiling';

type UseVideoExportArgs = {
  config: ParticleConfig;
  handleStartSequencePlayback: () => void;
  presetSequenceLength: number;
  rendererRef: MutableRefObject<WebGLRenderer | null>;
  sceneRef?: MutableRefObject<Scene | null>;
  cameraRef?: MutableRefObject<Camera | null>;
  cameraRigApiRef?: MutableRefObject<CameraRigApi | null>;
  cameraPathPlan?: ExportCameraPathPlan;
  sequenceLoopEnabled: boolean;
  sequenceSinglePassDuration: number;
  setSequenceLoopEnabled: (value: boolean) => void;
  microphoneStreamRef: MutableRefObject<MediaStream | null>;
  sharedAudioStreamRef: MutableRefObject<MediaStream | null>;
  stopSequencePlayback: () => void;
  synthEngineRef: MutableRefObject<SynthEngine | null>;
  videoDurationSeconds: number;
  videoExportMode: 'current' | 'sequence';
  videoFps: number;
};

const loadVideoExportHelpers = () => import('./videoExportHelpers');
const loadVideoExportRecording = () => import('./videoExportRecording');
const loadVideoExportSynthBridge = () => import('./videoExportSynthBridge');

export function useVideoExport({
  config,
  handleStartSequencePlayback,
  presetSequenceLength,
  rendererRef,
  sceneRef = { current: null },
  cameraRef = { current: null },
  cameraRigApiRef = { current: null },
  cameraPathPlan,
  sequenceLoopEnabled,
  sequenceSinglePassDuration,
  setSequenceLoopEnabled,
  microphoneStreamRef,
  sharedAudioStreamRef,
  stopSequencePlayback,
  synthEngineRef,
  videoDurationSeconds,
  videoExportMode,
  videoFps,
}: UseVideoExportArgs) {
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoNotice, setVideoNotice] = useState<Notice | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingSynthEngineRef = useRef<SynthEngine | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoStopTimerRef = useRef<number | null>(null);
  const recordingLoopRestoreRef = useRef<boolean | null>(null);
  const recordingModeRef = useRef<'current' | 'sequence'>('current');
  const pendingResultRef = useRef<((result: ExportRunResult) => void) | null>(null);
  const stopRequestedRef = useRef(false);
  const exportMirrorCleanupRef = useRef<(() => void) | null>(null);

  const clearVideoStopTimer = useCallback(() => {
    if (videoStopTimerRef.current !== null) {
      window.clearTimeout(videoStopTimerRef.current);
      videoStopTimerRef.current = null;
    }
  }, []);

  const dismissVideoNotice = useCallback(() => {
    setVideoNotice(null);
  }, []);

  const releaseExportMirror = useCallback(() => {
    exportMirrorCleanupRef.current?.();
    exportMirrorCleanupRef.current = null;
  }, []);

  const stopExportCameraPathPlayback = useCallback(() => {
    cameraRigApiRef.current?.stopPlayback();
  }, [cameraRigApiRef]);

  const showVideoNotice = useCallback((message: string) => {
    setVideoNotice({ tone: 'error', message });
  }, []);

  const stopVideoRecording = useCallback(() => {
    stopRequestedRef.current = true;
    clearVideoStopTimer();
    releaseExportMirror();

    if (recordingModeRef.current === 'sequence') {
      stopSequencePlayback();
    }
    stopExportCameraPathPlayback();

    void (async () => {
      const { stopVideoRecorder } = await loadVideoExportRecording();
      stopVideoRecorder({
        mediaRecorderRef,
        mediaStreamRef,
        microphoneStreamRef,
        recordingLoopRestoreRef,
        recordingSynthEngineRef,
        videoChunksRef,
      }, {
        setIsVideoRecording,
        setSequenceLoopEnabled,
        setVideoNotice,
      });
    })();
  }, [clearVideoStopTimer, releaseExportMirror, setSequenceLoopEnabled, stopSequencePlayback]);

  const runVideoRecording = useCallback(async (overrides?: Partial<UseVideoExportArgs> & { config?: ParticleConfig; cameraPathPlan?: ExportCameraPathPlan }): Promise<ExportRunResult> => {
    const exportStartedAtMs = getRuntimeProfilingNow();
    const resolvedConfig = overrides?.config ?? config;
    const resolvedMode = overrides?.videoExportMode ?? videoExportMode;
    const resolvedDuration = overrides?.videoDurationSeconds ?? videoDurationSeconds;
    const resolvedFps = overrides?.videoFps ?? videoFps;
    const resolvedSequenceLength = overrides?.presetSequenceLength ?? presetSequenceLength;
    const resolvedSequenceSinglePassDuration = overrides?.sequenceSinglePassDuration ?? sequenceSinglePassDuration;
    const resolvedCameraPathPlan = overrides?.cameraPathPlan ?? cameraPathPlan;
    const renderer = rendererRef.current;
    const canvas = renderer?.domElement ?? null;
    const { getSupportedVideoMimeType, validateVideoExportTarget } = await loadVideoExportHelpers();
    const validationError = validateVideoExportTarget(
      canvas,
      resolvedSequenceLength,
      resolvedSequenceSinglePassDuration,
      resolvedDuration,
      resolvedMode,
    );
    if (validationError) {
      setVideoNotice({ tone: 'error', message: validationError });
      return { ok: false, status: 'failed', message: validationError, metadata: null };
    }

    const targetDuration = resolvedMode === 'sequence'
      ? resolvedSequenceSinglePassDuration
      : Math.max(0.5, resolvedDuration);
    const mimeType = getSupportedVideoMimeType();
    if (!canvas) {
      const message = 'Renderer is not ready yet.';
      setVideoNotice({ tone: 'error', message });
      return { ok: false, status: 'failed', message, metadata: null };
    }

    const dedicatedSession = createDedicatedExportRenderSession({
      config: resolvedConfig,
      scene: sceneRef.current ?? null,
      sourceCamera: cameraRef.current ?? null,
      sourceRenderer: renderer,
    });
    const exportCanvas = dedicatedSession?.canvas ?? createExportRenderTargetCanvas(canvas, resolvedConfig).canvas;
    let cameraPathUsed = false;
    const exportMetadataBase = {
      rendererPath: dedicatedSession ? 'dedicated' as const : 'mirror' as const,
      dedicatedRendererUsed: Boolean(dedicatedSession),
      mirrorFallbackUsed: !dedicatedSession,
      actualDimensions: {
        width: exportCanvas.width,
        height: exportCanvas.height,
      },
      cameraPathSlotCount: getExportCameraPathSlotCount(resolvedCameraPathPlan),
    };
    releaseExportMirror();
    exportMirrorCleanupRef.current = dedicatedSession
      ? startDedicatedExportRenderLoop(dedicatedSession)
      : startCanvasMirrorLoop(canvas, exportCanvas);

    dismissVideoNotice();
    clearVideoStopTimer();
    videoChunksRef.current = [];
    recordingModeRef.current = resolvedMode;
    recordingLoopRestoreRef.current = sequenceLoopEnabled;
    stopRequestedRef.current = false;

    return await new Promise<ExportRunResult>(async (resolve) => {
      pendingResultRef.current = resolve;

      try {
        if (resolvedConfig.audioSourceMode === 'standalone-synth' && resolvedConfig.audioEnabled) {
          const { createSynthEngine } = await loadVideoExportSynthBridge();
          recordingSynthEngineRef.current = await createSynthEngine(resolvedConfig, { connectToDestination: false });
        }

        const { startVideoRecorderSession } = await loadVideoExportRecording();
        startVideoRecorderSession({
          canvas: exportCanvas,
          config: resolvedConfig,
          mimeType,
          refs: {
            mediaRecorderRef,
            mediaStreamRef,
            microphoneStreamRef,
            recordingLoopRestoreRef,
            recordingSynthEngineRef,
            videoChunksRef,
          },
          setters: {
            setIsVideoRecording,
            setSequenceLoopEnabled,
            setVideoNotice,
          },
          sharedAudioStreamRef,
          stopVideoRecording,
          synthEngineRef,
          videoExportMode: resolvedMode,
          videoFps: resolvedFps,
          targetDurationSeconds: targetDuration,
          presetSequenceLength: resolvedSequenceLength,
          sequenceSinglePassDuration: resolvedSequenceSinglePassDuration,
          onRecorderStop: (blobSize) => {
            releaseExportMirror();
            stopExportCameraPathPlayback();
            const result: ExportRunResult = stopRequestedRef.current
              ? {
                ok: false,
                status: 'cancelled',
                message: blobSize > 0 ? 'Video recording stopped early.' : 'Video recording cancelled.',
                metadata: {
                  ...exportMetadataBase,
                  cameraPathUsed,
                },
              }
              : blobSize > 0
                ? {
                  ok: true,
                  status: 'completed',
                  message: 'Video exported with manifest sidecar.',
                  metadata: {
                    ...exportMetadataBase,
                    cameraPathUsed,
                  },
                }
                : {
                  ok: false,
                  status: 'failed',
                  message: 'Recorded video was empty.',
                  metadata: {
                    ...exportMetadataBase,
                    cameraPathUsed,
                  },
                };
            pendingResultRef.current?.(result);
            recordRuntimeProfilingDuration('export:video-webm', 'export', getRuntimeProfilingNow() - exportStartedAtMs);
            pendingResultRef.current = null;
            stopRequestedRef.current = false;
          },
          onRecorderError: () => {
            releaseExportMirror();
            stopExportCameraPathPlayback();
            pendingResultRef.current?.({
              ok: false,
              status: 'failed',
              message: 'Video recording failed.',
              metadata: {
                ...exportMetadataBase,
                cameraPathUsed,
              },
            });
            recordRuntimeProfilingDuration('export:video-webm', 'export', getRuntimeProfilingNow() - exportStartedAtMs);
            pendingResultRef.current = null;
            stopRequestedRef.current = false;
          },
        });

        if (resolvedMode === 'sequence') {
          setSequenceLoopEnabled(false);
          handleStartSequencePlayback();
        } else {
          cameraPathUsed = startExportCameraPathPlayback({
            rigApi: cameraRigApiRef.current,
            plan: resolvedCameraPathPlan,
            exportMode: resolvedMode,
            durationSeconds: targetDuration,
          });
        }

        videoStopTimerRef.current = window.setTimeout(() => {
          stopVideoRecording();
        }, targetDuration * 1000);
      } catch (error) {
        console.error('Video recording failed to start:', error);
        const message = 'Could not start video recording.';
        setVideoNotice({ tone: 'error', message });
        pendingResultRef.current?.({
          ok: false,
          status: 'failed',
          message,
          metadata: {
            ...exportMetadataBase,
            cameraPathUsed,
          },
        });
        recordRuntimeProfilingDuration('export:video-webm', 'export', getRuntimeProfilingNow() - exportStartedAtMs);
        pendingResultRef.current = null;
        stopRequestedRef.current = false;
        releaseExportMirror();
        stopExportCameraPathPlayback();
        stopVideoRecording();
      }
    });
  }, [
    clearVideoStopTimer,
    config,
    dismissVideoNotice,
    handleStartSequencePlayback,
    microphoneStreamRef,
    presetSequenceLength,
    releaseExportMirror,
    stopExportCameraPathPlayback,
    rendererRef,
    sceneRef,
    cameraRef,
    cameraPathPlan,
    cameraRigApiRef,
    cameraPathPlan,
    cameraRigApiRef,
    sequenceLoopEnabled,
    sequenceSinglePassDuration,
    setSequenceLoopEnabled,
    sharedAudioStreamRef,
    stopVideoRecording,
    synthEngineRef,
    videoDurationSeconds,
    videoExportMode,
    videoFps,
  ]);

  const startVideoRecording = useCallback(() => {
    void runVideoRecording();
  }, [runVideoRecording]);

  useEffect(() => {
    const recordingSynth = recordingSynthEngineRef.current;
    if (!recordingSynth || !isVideoRecording) {
      return;
    }

    if (config.audioSourceMode === 'standalone-synth' && config.audioEnabled) {
      return;
    }

    void (async () => {
      const { stopSynthEngine } = await loadVideoExportSynthBridge();
      stopSynthEngine(recordingSynth);
    })();
    void recordingSynth.context.close().catch(() => {});
    recordingSynthEngineRef.current = null;
  }, [config.audioEnabled, config.audioSourceMode, isVideoRecording]);

  useEffect(() => {
    const recordingSynth = recordingSynthEngineRef.current;
    if (!recordingSynth || !isVideoRecording || config.audioSourceMode !== 'standalone-synth' || !config.audioEnabled) {
      return;
    }

    void (async () => {
      const { updateVideoExportSynthSettings } = await loadVideoExportSynthBridge();
      updateVideoExportSynthSettings(recordingSynth, config);
    })();
  }, [
    config,
    config.audioEnabled,
    config.audioSourceMode,
    config.synthCutoff,
    config.synthPatternDepth,
    config.synthVolume,
    config.synthWaveform,
    isVideoRecording,
  ]);

  useEffect(() => {
    const recordingSynth = recordingSynthEngineRef.current;
    if (!recordingSynth || !isVideoRecording || config.audioSourceMode !== 'standalone-synth' || !config.audioEnabled) {
      return;
    }

    void (async () => {
      const { restartVideoExportSynthSequencer } = await loadVideoExportSynthBridge();
      restartVideoExportSynthSequencer(recordingSynth, config);
    })();

    return () => {
      if (recordingSynth.stepTimer !== null) {
        window.clearInterval(recordingSynth.stepTimer);
        recordingSynth.stepTimer = null;
      }
    };
  }, [
    config,
    config.audioEnabled,
    config.audioSourceMode,
    config.synthBaseFrequency,
    config.synthCutoff,
    config.synthPattern,
    config.synthPatternDepth,
    config.synthScale,
    config.synthTempo,
    isVideoRecording,
  ]);

  useEffect(() => () => {
    clearVideoStopTimer();
    releaseExportMirror();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    void (async () => {
      const { cleanupVideoExportSession } = await loadVideoExportRecording();
      cleanupVideoExportSession({
        mediaRecorderRef,
        mediaStreamRef,
        microphoneStreamRef,
        recordingLoopRestoreRef,
        recordingSynthEngineRef,
        videoChunksRef,
      }, {
        setIsVideoRecording,
        setSequenceLoopEnabled,
        setVideoNotice,
      });
    })();
  }, [clearVideoStopTimer, microphoneStreamRef, releaseExportMirror]);

  return {
    dismissVideoNotice,
    isVideoRecording,
    runVideoRecording,
    showVideoNotice,
    startVideoRecording,
    stopVideoRecording,
    videoNotice,
  };
}
