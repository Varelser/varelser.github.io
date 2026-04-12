import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import type { Camera, Scene, WebGLRenderer } from 'three';
import type { CameraRigApi } from '../types/cameraPath';
import type { ParticleConfig } from '../types';
import type { Notice } from './audioControllerTypes';
import { buildCaptureExportManifest } from './captureExportManifest';
import { createExportRenderTargetCanvas, drawSourceCanvasToTarget } from './exportDimensions';
import { createDedicatedExportRenderSession } from './exportSceneRenderer';
import { getExportCameraPathSlotCount, startExportCameraPathPlayback, type ExportCameraPathPlan } from './exportCameraPath';
import type { ExportRunResult } from './exportBatchQueue';
import { getRuntimeProfilingNow, recordRuntimeProfilingDuration } from './runtimeProfiling';

type UseFrameExportArgs = {
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

export function useFrameExport({
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
}: UseFrameExportArgs) {
  const [frameNotice, setFrameNotice] = useState<Notice | null>(null);
  const [isFrameExporting, setIsFrameExporting] = useState(false);
  const recordingLoopRestoreRef = useRef<boolean | null>(null);
  const recordingModeRef = useRef<'current' | 'sequence'>('current');
  const frameExportAbortRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const stopExportCameraPathPlayback = useCallback(() => {
    cameraRigApiRef.current?.stopPlayback();
  }, [cameraRigApiRef]);

  const dismissFrameNotice = useCallback(() => {
    setFrameNotice(null);
  }, []);

  const runFrameExport = useCallback(async (overrides?: Partial<UseFrameExportArgs> & { config?: ParticleConfig; cameraPathPlan?: ExportCameraPathPlan }): Promise<ExportRunResult> => {
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
      setFrameNotice({ tone: 'error', message });
      return { ok: false, status: 'failed', message, metadata: null };
    }

    const canvas = renderer.domElement;
    const dedicatedSession = createDedicatedExportRenderSession({
      config: resolvedConfig,
      scene: sceneRef.current ?? null,
      sourceCamera: cameraRef.current ?? null,
      sourceRenderer: renderer,
    });
    const exportCanvas = dedicatedSession?.canvas ?? createExportRenderTargetCanvas(canvas, resolvedConfig).canvas;
    const targetDuration = resolvedMode === 'sequence'
      ? resolvedSequenceSinglePassDuration
      : Math.max(0.5, resolvedDuration);

    if (targetDuration <= 0) {
      const message = 'Set a valid frame export duration first.';
      setFrameNotice({ tone: 'error', message });
      return { ok: false, status: 'failed', message, metadata: null };
    }

    if (resolvedMode === 'sequence' && resolvedSequenceLength === 0) {
      const message = 'Add at least one sequence step before exporting PNG frames.';
      setFrameNotice({ tone: 'error', message });
      return { ok: false, status: 'failed', message, metadata: null };
    }

    dismissFrameNotice();
    frameExportAbortRef.current = { cancelled: false };
    recordingModeRef.current = resolvedMode;
    recordingLoopRestoreRef.current = sequenceLoopEnabled;
    setIsFrameExporting(true);
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

    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      const frameCount = Math.max(1, Math.round(targetDuration * Math.max(1, resolvedFps)));
      const frameDelay = 1000 / Math.max(1, resolvedFps);

      for (let index = 0; index < frameCount; index += 1) {
        if (frameExportAbortRef.current.cancelled) {
          const message = `PNG frame export stopped at ${index} frames.`;
          setFrameNotice({ tone: 'success', message });
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
          drawSourceCanvasToTarget(canvas, exportCanvas);
        }
        await new Promise((resolve, reject) => {
          exportCanvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas PNG export failed'));
              return;
            }

            blob.arrayBuffer()
              .then((buffer) => {
                zip.file(`frame-${String(index + 1).padStart(4, '0')}.png`, buffer);
                resolve(buffer);
              })
              .catch(reject);
          }, 'image/png');
        });

        if (index < frameCount - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, frameDelay));
        }
      }

      const archiveFileName = `kalokagathia-${resolvedMode}-frames-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
      const manifest = buildCaptureExportManifest({
        kind: 'png-sequence',
        exportMode: resolvedMode,
        fileName: archiveFileName,
        mimeType: 'application/zip',
        config: resolvedConfig,
        targetDurationSeconds: targetDuration,
        fps: resolvedFps,
        frameCount,
        includeAudio: false,
        exportScale: resolvedConfig.exportScale,
        transparentBackground: resolvedConfig.exportTransparent,
        canvas: {
          width: exportCanvas.width,
          height: exportCanvas.height,
          devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : undefined,
        },
        sequenceLength: resolvedSequenceLength,
        sequenceSinglePassDuration: resolvedMode === 'sequence' ? resolvedSequenceSinglePassDuration : null,
      });
      zip.file('capture.manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);

      const archive = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/zip',
        compression: 'STORE',
      });
      const url = window.URL.createObjectURL(archive);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = archiveFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      const message = `PNG frame export complete: ${frameCount} frames. Embedded capture.manifest.json included.`;
      setFrameNotice({ tone: 'success', message });
      const result: ExportRunResult = {
        ok: true,
        status: 'completed',
        message,
        metadata: {
          ...exportMetadataBase,
          cameraPathUsed,
        },
      };
      recordRuntimeProfilingDuration('export:png-sequence', 'export', getRuntimeProfilingNow() - exportStartedAtMs);
      return result;
    } catch (error) {
      console.error('PNG frame export failed:', error);
      const message = 'PNG frame export failed.';
      setFrameNotice({ tone: 'error', message });
      const result: ExportRunResult = {
        ok: false,
        status: 'failed',
        message,
        metadata: {
          ...exportMetadataBase,
          cameraPathUsed,
        },
      };
      recordRuntimeProfilingDuration('export:png-sequence', 'export', getRuntimeProfilingNow() - exportStartedAtMs);
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
      setIsFrameExporting(false);
    }
  }, [
    config,
    dismissFrameNotice,
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

  const showFrameNotice = useCallback((message: string) => {
    setFrameNotice({ tone: 'error', message });
  }, []);

  const stopFrameExport = useCallback(() => {
    frameExportAbortRef.current.cancelled = true;
    setIsFrameExporting(false);

    if (recordingModeRef.current === 'sequence') {
      stopSequencePlayback();
    }
    stopExportCameraPathPlayback();

    if (recordingLoopRestoreRef.current !== null) {
      setSequenceLoopEnabled(recordingLoopRestoreRef.current);
      recordingLoopRestoreRef.current = null;
    }
  }, [setSequenceLoopEnabled, stopSequencePlayback]);

  const startFrameExport = useCallback(() => {
    void runFrameExport();
  }, [runFrameExport]);

  useEffect(() => () => {
    frameExportAbortRef.current.cancelled = true;
  }, []);

  return {
    dismissFrameNotice,
    frameNotice,
    isFrameExporting,
    runFrameExport,
    showFrameNotice,
    startFrameExport,
    stopFrameExport,
  };
}
