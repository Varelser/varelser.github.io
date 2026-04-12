import type { WebGLRenderer } from 'three';

const TARGET_WIDTH = 320;
const TARGET_HEIGHT = 180;
const MIME_TYPE = 'image/jpeg';
const JPEG_QUALITY = 0.82;

export function capturePresetThumbnailDataUrl(renderer: WebGLRenderer | null): string | null {
  if (typeof document === 'undefined' || !renderer) {
    return null;
  }

  try {
    const sourceCanvas = renderer.domElement;
    if (!sourceCanvas || sourceCanvas.width <= 0 || sourceCanvas.height <= 0) {
      return null;
    }

    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = TARGET_WIDTH;
    targetCanvas.height = TARGET_HEIGHT;
    const context = targetCanvas.getContext('2d', { alpha: false });
    if (!context) {
      return null;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
    return targetCanvas.toDataURL(MIME_TYPE, JPEG_QUALITY);
  } catch (error) {
    console.warn('Failed to capture preset thumbnail:', error);
    return null;
  }
}
