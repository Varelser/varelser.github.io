import type { Camera, OrthographicCamera, PerspectiveCamera, WebGLRenderer } from 'three';
import type { ParticleConfig } from '../types';

export type ExportAspectPreset = ParticleConfig['exportAspectPreset'];

export const EXPORT_ASPECT_PRESET_OPTIONS: Array<{ label: string; value: ExportAspectPreset; ratio: number | null }> = [
  { label: 'Current', value: 'current', ratio: null },
  { label: 'Square 1:1', value: 'square', ratio: 1 },
  { label: 'Portrait 4:5', value: 'portrait-4-5', ratio: 4 / 5 },
  { label: 'Stories 9:16', value: 'story-9-16', ratio: 9 / 16 },
  { label: 'Wide 16:9', value: 'widescreen-16-9', ratio: 16 / 9 },
];

const EXPORT_ASPECT_RATIO_MAP: Record<Exclude<ExportAspectPreset, 'current'>, number> = {
  square: 1,
  'portrait-4-5': 4 / 5,
  'story-9-16': 9 / 16,
  'widescreen-16-9': 16 / 9,
};

export function getExportAspectRatio(preset: ExportAspectPreset) {
  if (preset === 'current') return null;
  return EXPORT_ASPECT_RATIO_MAP[preset];
}

export function resolveExportCanvasSize(
  sourceWidth: number,
  sourceHeight: number,
  exportScale: number,
  exportAspectPreset: ExportAspectPreset,
) {
  const safeWidth = Math.max(1, Math.round(sourceWidth));
  const safeHeight = Math.max(1, Math.round(sourceHeight));
  const safeScale = Math.max(1, exportScale || 1);
  const baseWidth = Math.max(1, Math.round(safeWidth * safeScale));
  const baseHeight = Math.max(1, Math.round(safeHeight * safeScale));
  const aspectRatio = getExportAspectRatio(exportAspectPreset);

  if (!aspectRatio) {
    return {
      width: baseWidth,
      height: baseHeight,
      aspectRatio: safeWidth / safeHeight,
      preset: exportAspectPreset,
    };
  }

  const currentAspect = safeWidth / safeHeight;
  if (currentAspect >= aspectRatio) {
    return {
      width: Math.max(1, Math.round(baseHeight * aspectRatio)),
      height: baseHeight,
      aspectRatio,
      preset: exportAspectPreset,
    };
  }

  return {
    width: baseWidth,
    height: Math.max(1, Math.round(baseWidth / aspectRatio)),
    aspectRatio,
    preset: exportAspectPreset,
  };
}

type ExportCanvasSnapshot = {
  width: number;
  height: number;
  pixelRatio: number;
  perspectiveAspect: number | null;
};

function isPerspectiveCamera(camera: Camera): camera is PerspectiveCamera {
  return 'isPerspectiveCamera' in camera && Boolean((camera as PerspectiveCamera & { isPerspectiveCamera?: boolean }).isPerspectiveCamera);
}

function isOrthographicCamera(camera: Camera): camera is OrthographicCamera {
  return 'isOrthographicCamera' in camera && Boolean((camera as OrthographicCamera & { isOrthographicCamera?: boolean }).isOrthographicCamera);
}

export function createExportRenderTargetCanvas(sourceCanvas: HTMLCanvasElement, config: ParticleConfig) {
  const targetSize = resolveExportCanvasSize(sourceCanvas.width, sourceCanvas.height, config.exportScale, config.exportAspectPreset);
  const canvas = document.createElement('canvas');
  canvas.width = targetSize.width;
  canvas.height = targetSize.height;
  return { canvas, targetSize };
}

export function drawSourceCanvasToTarget(sourceCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement) {
  const context = targetCanvas.getContext('2d', { alpha: true });
  if (!context) {
    throw new Error('2D export canvas context is unavailable.');
  }

  const sourceWidth = sourceCanvas.width;
  const sourceHeight = sourceCanvas.height;
  const targetWidth = targetCanvas.width;
  const targetHeight = targetCanvas.height;
  const sourceAspect = sourceWidth / Math.max(1, sourceHeight);
  const targetAspect = targetWidth / Math.max(1, targetHeight);

  let sampleX = 0;
  let sampleY = 0;
  let sampleWidth = sourceWidth;
  let sampleHeight = sourceHeight;

  if (sourceAspect > targetAspect) {
    sampleWidth = Math.max(1, Math.round(sourceHeight * targetAspect));
    sampleX = Math.max(0, Math.floor((sourceWidth - sampleWidth) * 0.5));
  } else if (sourceAspect < targetAspect) {
    sampleHeight = Math.max(1, Math.round(sourceWidth / targetAspect));
    sampleY = Math.max(0, Math.floor((sourceHeight - sampleHeight) * 0.5));
  }

  context.clearRect(0, 0, targetWidth, targetHeight);
  context.drawImage(sourceCanvas, sampleX, sampleY, sampleWidth, sampleHeight, 0, 0, targetWidth, targetHeight);
}

export function startCanvasMirrorLoop(sourceCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement) {
  let rafId = 0;
  let active = true;

  const tick = () => {
    if (!active) return;
    drawSourceCanvasToTarget(sourceCanvas, targetCanvas);
    rafId = window.requestAnimationFrame(tick);
  };

  tick();

  return () => {
    active = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
  };
}


export function prepareExportCanvas(renderer: WebGLRenderer, camera: Camera, config: ParticleConfig) {
  const snapshot: ExportCanvasSnapshot = {
    width: renderer.domElement.width,
    height: renderer.domElement.height,
    pixelRatio: renderer.getPixelRatio(),
    perspectiveAspect: isPerspectiveCamera(camera) ? camera.aspect : null,
  };

  const targetSize = resolveExportCanvasSize(snapshot.width, snapshot.height, config.exportScale, config.exportAspectPreset);

  renderer.setPixelRatio(1);
  renderer.setSize(targetSize.width, targetSize.height, false);

  if (isPerspectiveCamera(camera)) {
    camera.aspect = targetSize.width / targetSize.height;
    camera.updateProjectionMatrix();
  } else if (isOrthographicCamera(camera)) {
    camera.updateProjectionMatrix();
  }

  const restore = () => {
    renderer.setPixelRatio(snapshot.pixelRatio);
    renderer.setSize(snapshot.width, snapshot.height, false);
    if (isPerspectiveCamera(camera) && snapshot.perspectiveAspect !== null) {
      camera.aspect = snapshot.perspectiveAspect;
      camera.updateProjectionMatrix();
    } else if (isOrthographicCamera(camera)) {
      camera.updateProjectionMatrix();
    }
  };

  return {
    restore,
    snapshot,
    targetSize,
  };
}
