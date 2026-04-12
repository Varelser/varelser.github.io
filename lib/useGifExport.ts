import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import type { Camera, Scene, WebGLRenderer } from 'three';
import type { CameraRigApi } from '../types/cameraPath';
import type { ParticleConfig } from '../types';
import type { Notice } from './audioControllerTypes';
import { buildCaptureExportManifest } from './captureExportManifest';
import { createExportRenderTargetCanvas, drawSourceCanvasToTarget, resolveExportCanvasSize } from './exportDimensions';
import { createDedicatedExportRenderSession } from './exportSceneRenderer';
import { getExportCameraPathSlotCount, startExportCameraPathPlayback, type ExportCameraPathPlan } from './exportCameraPath';
import { encodeAnimatedGif } from './gifEncoder';
import type { ExportRunResult } from './exportBatchQueue';
import { getRuntimeProfilingNow, recordRuntimeProfilingDuration } from './runtimeProfiling';

type UseGifExportArgs = {
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
  stopSequencePlayback: () => void;
  videoDurationSeconds: number;
  videoExportMode: 'current' | 'sequence';
  videoFps: number;
};

const GIF_MAX_FRAMES = 180;
const GIF_MAX_PIXELS = 480_000;
const GIF_MAX_DIMENSION = 900;

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

function buildGifSafeConfig(sourceCanvas: HTMLCanvasElement, config: ParticleConfig) {
  const requested = resolveExportCanvasSize(sourceCanvas.width, sourceCanvas.height, config.exportScale, config.exportAspectPreset);
  const pixelScale = Math.sqrt(Math.min(1, GIF_MAX_PIXELS / Math.max(1, requested.width * requested.height)));
  const dimensionScale = Math.min(1, GIF_MAX_DIMENSION / Math.max(requested.width, requested.height));
  const fitScale = Math.min(1, pixelScale, dimensionScale);
  const captureWidth = Math.max(1, Math.round(requested.width * fitScale));
  const captureHeight = Math.max(1, Math.round(requested.height * fitScale));
  if (fitScale >= 0.999) {
    return { config, capped: false, cappedScaleFactor: 1, captureWidth: requested.width, captureHeight: requested.height };
  }

  return {
    config: {
      ...config,
      exportScale: Math.max(1, Math.round(config.exportScale * fitScale * 1000) / 1000),
    },
    capped: true,
    cappedScaleFactor: fitScale,
    captureWidth,
    captureHeight,
  };
}

export function useGifExport({
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
  stopSequencePlayback,
  videoDurationSeconds,
  videoExportMode,
  videoFps,
}: UseGifExportArgs) {
  const [gifNotice, setGifNotice] = useState<Notice | null>(null);
  const [isGifExporting, setIsGifExporting] = useState(false);
  const recordingLoopRestoreRef = useRef<boolean | null>(null);
  const recordingModeRef = useRef<'current' | 'sequence'>('current');
  const gifExportAbortRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const stopExportCameraPathPlayback = useCallback(() => {
    cameraRigApiRef.current?.stopPlayback();
  }, [cameraRigApiRef]);

  const dismissGifNotice = useCallback(() => {
    setGifNotice(null);
  }, []);

  const showGifNotice = useCallback((message: string) => {
    setGifNotice({ tone: 'error', message });
  }, []);

  const stopGifExport = useCallback(() => {
    gifExportAbortRef.current.cancelled = true;
    setIsGifExporting(false);

    if (recordingModeRef.current === 'sequence') {
      stopSequencePlayback();
    }
    stopExportCameraPathPlayback();

    if (recordingLoopRestoreRef.current !== null) {
      setSequenceLoopEnabled(recordingLoopRestoreRef.current);
      recordingLoopRestoreRef.current = null;
    }
  }, [setSequenceLoopEnabled, stopSequencePlayback]);

  const runGifExport = useCallback(async (overrides?: Partial<UseGifExportArgs> & { config?: ParticleConfig; cameraPathPlan?: ExportCameraPathPlan }): Promise<ExportRunResult> => {
    const exportStartedAtMs = getRuntimeProfilingNow();
    const renderer = rendererRef.current;
    const resolvedConfig = overrides?.config ?? config;
    const resolvedMode = overrides?.videoExportMode ?? videoExportMode;
    const resolvedDuration = overrides?.videoDurationSeconds ?? videoDurationSeconds;
    const resolvedFps = overrides?.videoFps ?? videoFps;
    const resolvedSequenceLength = overrides?.presetSequenceLength ?? presetSequenceLength;
    const resolvedSequenceSinglePassDuration = overrides?.sequenceSinglePassDuration ?? sequenceSinglePassDuration;
    const resolvedCameraPathPlan = overrides?.cameraPathPlan ?? cameraPathPlan;

    if (!renderer) {
      const message = 'Renderer is not ready yet.';
      setGifNotice({ tone: 'error', message });
      return { ok: false, status: 'failed', message, metadata: null };
    }

    const sourceCanvas = renderer.domElement;
    const gifConfigResult = buildGifSafeConfig(sourceCanvas, resolvedConfig);
    const gifConfig = gifConfigResult.config;
    const targetDuration = resolvedMode === 'sequence'
      ? resolvedSequenceSinglePassDuration
      : Math.max(0.5, resolvedDuration);

    if (targetDuration <= 0) {
      const message = 'Set a valid GIF export duration first.';
      setGifNotice({ tone: 'error', message });
      return { ok: false, status: 'failed', message, metadata: null };
    }

    if (resolvedMode === 'sequence' && resolvedSequenceLength === 0) {
      const message = 'Add at least one sequence step before exporting GIF.';
      setGifNotice({ tone: 'error', message });
      return { ok: false, status: 'failed', message, metadata: null };
    }

    const requestedFrameCount = Math.max(1, Math.round(targetDuration * Math.max(1, resolvedFps)));
    const frameCount = Math.min(GIF_MAX_FRAMES, requestedFrameCount);
    const effectiveFps = Math.max(1, frameCount / Math.max(0.001, targetDuration));
    const frameDelayMs = 1000 / effectiveFps;
    const frameDelayCs = Math.max(1, Math.round(frameDelayMs / 10));

    dismissGifNotice();
    gifExportAbortRef.current = { cancelled: false };
    recordingModeRef.current = resolvedMode;
    recordingLoopRestoreRef.current = sequenceLoopEnabled;
    setIsGifExporting(true);
    let cameraPathUsed = false;

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

    const dedicatedSession = createDedicatedExportRenderSession({
      config: gifConfig,
      scene: sceneRef.current ?? null,
      sourceCamera: cameraRef.current ?? null,
      sourceRenderer: renderer,
    });
    const exportCanvas = dedicatedSession?.canvas ?? createExportRenderTargetCanvas(sourceCanvas, gifConfig).canvas;
    const exportMetadataBase = {
      rendererPath: dedicatedSession ? 'dedicated' as const : 'mirror' as const,
      dedicatedRendererUsed: Boolean(dedicatedSession),
      mirrorFallbackUsed: !dedicatedSession,
      actualDimensions: {
        width: 0,
        height: 0,
      },
      cameraPathSlotCount: getExportCameraPathSlotCount(resolvedCameraPathPlan),
    };

    try {
      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = gifConfigResult.captureWidth;
      captureCanvas.height = gifConfigResult.captureHeight;
      const captureContext = captureCanvas.getContext('2d', { alpha: true, willReadFrequently: true });
      if (!captureContext) {
        const message = 'GIF export canvas context is unavailable.';
        setGifNotice({ tone: 'error', message });
        return {
          ok: false,
          status: 'failed',
          message,
          metadata: {
            ...exportMetadataBase,
            actualDimensions: {
              width: captureCanvas.width,
              height: captureCanvas.height,
            },
            cameraPathUsed,
          },
        };
      }
      exportMetadataBase.actualDimensions = {
        width: captureCanvas.width,
        height: captureCanvas.height,
      };

      const frames: Array<{ rgba: Uint8ClampedArray; delayCs: number }> = [];

      for (let index = 0; index < frameCount; index += 1) {
        if (gifExportAbortRef.current.cancelled) {
          const message = `GIF export stopped at ${index} frames.`;
          setGifNotice({ tone: 'success', message });
          return {
            ok: false,
            status: 'cancelled',
            message,
            metadata: {
              ...exportMetadataBase,
              cameraPathUsed,
            },
          };
        }

        if (dedicatedSession) {
          dedicatedSession.renderFrame();
        } else {
          drawSourceCanvasToTarget(sourceCanvas, exportCanvas);
        }
        captureContext.clearRect(0, 0, captureCanvas.width, captureCanvas.height);
        captureContext.drawImage(exportCanvas, 0, 0, captureCanvas.width, captureCanvas.height);

        const framePixels = captureContext.getImageData(0, 0, captureCanvas.width, captureCanvas.height).data;
        frames.push({ rgba: new Uint8ClampedArray(framePixels), delayCs: frameDelayCs });

        if (index < frameCount - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, frameDelayMs));
        }
      }

      const gifBlob = encodeAnimatedGif({
        width: captureCanvas.width,
        height: captureCanvas.height,
        frames,
        transparent: gifConfig.exportTransparent,
        loopCount: 0,
      });

      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const gifFileName = `kalokagathia-${resolvedMode}-${stamp}.gif`;
      const manifest = buildCaptureExportManifest({
        kind: 'gif',
        exportMode: resolvedMode,
        fileName: gifFileName,
        mimeType: 'image/gif',
        config: gifConfig,
        targetDurationSeconds: targetDuration,
        fps: effectiveFps,
        frameCount,
        includeAudio: false,
        exportScale: gifConfig.exportScale,
        transparentBackground: gifConfig.exportTransparent,
        canvas: {
          width: captureCanvas.width,
          height: captureCanvas.height,
          devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : undefined,
        },
        sequenceLength: resolvedSequenceLength,
        sequenceSinglePassDuration: resolvedMode === 'sequence' ? resolvedSequenceSinglePassDuration : null,
      });

      downloadBlob(gifBlob, gifFileName);
      downloadBlob(new Blob([`${JSON.stringify(manifest, null, 2)}\n`], { type: 'application/json' }), `${gifFileName}.manifest.json`);

      const cappedNote = frameCount < requestedFrameCount
        ? ` GIF frame count capped to ${frameCount}.`
        : '';
      const scaledNote = gifConfigResult.capped
        ? ` GIF export scale reduced (${Math.round(gifConfigResult.cappedScaleFactor * 100)}%).`
        : '';
      const message = `GIF export complete: ${frameCount} frames.${cappedNote}${scaledNote}`;
      setGifNotice({ tone: 'success', message });
      const result: ExportRunResult = {
        ok: true,
        status: 'completed',
        message,
        metadata: {
          ...exportMetadataBase,
          cameraPathUsed,
        },
      };
      recordRuntimeProfilingDuration('export:gif', 'export', getRuntimeProfilingNow() - exportStartedAtMs);
      return result;
    } catch (error) {
      console.error('GIF export failed:', error);
      const message = 'GIF export failed.';
      setGifNotice({ tone: 'error', message });
      const result: ExportRunResult = {
        ok: false,
        status: 'failed',
        message,
        metadata: {
          ...exportMetadataBase,
          cameraPathUsed,
        },
      };
      recordRuntimeProfilingDuration('export:gif', 'export', getRuntimeProfilingNow() - exportStartedAtMs);
      return result;
    } finally {
      dedicatedSession?.dispose();
      stopExportCameraPathPlayback();
      if (resolvedMode === 'sequence') {
        stopSequencePlayback();
      }
      if (recordingLoopRestoreRef.current !== null) {
        setSequenceLoopEnabled(recordingLoopRestoreRef.current);
        recordingLoopRestoreRef.current = null;
      }
      setIsGifExporting(false);
    }
  }, [
    config,
    dismissGifNotice,
    handleStartSequencePlayback,
    presetSequenceLength,
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
    stopExportCameraPathPlayback,
    stopSequencePlayback,
    videoDurationSeconds,
    videoExportMode,
    videoFps,
  ]);

  const startGifExport = useCallback(() => {
    void runGifExport();
  }, [runGifExport]);

  useEffect(() => () => {
    gifExportAbortRef.current.cancelled = true;
  }, []);

  return {
    dismissGifNotice,
    gifNotice,
    isGifExporting,
    runGifExport,
    showGifNotice,
    startGifExport,
    stopGifExport,
  };
}
