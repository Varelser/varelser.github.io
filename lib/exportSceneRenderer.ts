import type { Camera, OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { Color, WebGLRenderer as ThreeWebGLRenderer } from "three";
import type { ParticleConfig } from "../types";
import { resolveExportCanvasSize } from "./exportDimensions";

type DedicatedExportRenderSessionArgs = {
  config: ParticleConfig;
  scene: Scene | null;
  sourceCamera: Camera | null;
  sourceRenderer: WebGLRenderer | null;
};

export type DedicatedExportRenderSession = {
  canvas: HTMLCanvasElement;
  renderFrame: () => void;
  dispose: () => void;
};

function isPerspectiveCamera(camera: Camera): camera is PerspectiveCamera {
  return 'isPerspectiveCamera' in camera && Boolean((camera as PerspectiveCamera & { isPerspectiveCamera?: boolean }).isPerspectiveCamera);
}

function isOrthographicCamera(camera: Camera): camera is OrthographicCamera {
  return 'isOrthographicCamera' in camera && Boolean((camera as OrthographicCamera & { isOrthographicCamera?: boolean }).isOrthographicCamera);
}

function syncExportCamera(sourceCamera: Camera, exportCamera: Camera, aspect: number) {
  exportCamera.position.copy(sourceCamera.position);
  exportCamera.quaternion.copy(sourceCamera.quaternion);
  exportCamera.scale.copy(sourceCamera.scale);
  exportCamera.up.copy(sourceCamera.up);
  exportCamera.layers.mask = sourceCamera.layers.mask;

  if (isPerspectiveCamera(sourceCamera) && isPerspectiveCamera(exportCamera)) {
    exportCamera.near = sourceCamera.near;
    exportCamera.far = sourceCamera.far;
    exportCamera.fov = sourceCamera.fov;
    exportCamera.zoom = sourceCamera.zoom;
    exportCamera.focus = sourceCamera.focus;
    exportCamera.aspect = aspect;
    exportCamera.filmGauge = sourceCamera.filmGauge;
    exportCamera.filmOffset = sourceCamera.filmOffset;
  } else if (isOrthographicCamera(sourceCamera) && isOrthographicCamera(exportCamera)) {
    exportCamera.near = sourceCamera.near;
    exportCamera.far = sourceCamera.far;
    exportCamera.left = sourceCamera.left;
    exportCamera.right = sourceCamera.right;
    exportCamera.top = sourceCamera.top;
    exportCamera.bottom = sourceCamera.bottom;
    exportCamera.zoom = sourceCamera.zoom;
  }

  if (isPerspectiveCamera(exportCamera) || isOrthographicCamera(exportCamera)) {
    exportCamera.updateProjectionMatrix();
  }
  exportCamera.updateMatrixWorld(true);
}

export function createDedicatedExportRenderSession({
  config,
  scene,
  sourceCamera,
  sourceRenderer,
}: DedicatedExportRenderSessionArgs): DedicatedExportRenderSession | null {
  if (!scene || !sourceCamera || !sourceRenderer) {
    return null;
  }

  try {
    const canvas = document.createElement('canvas');
    const targetSize = resolveExportCanvasSize(
      sourceRenderer.domElement.width,
      sourceRenderer.domElement.height,
      config.exportScale,
      config.exportAspectPreset,
    );

    const exportRenderer = new ThreeWebGLRenderer({
      canvas,
      antialias: false,
      alpha: config.exportTransparent,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });

    exportRenderer.setPixelRatio(1);
    exportRenderer.setSize(targetSize.width, targetSize.height, false);
    exportRenderer.toneMapping = sourceRenderer.toneMapping;
    exportRenderer.toneMappingExposure = sourceRenderer.toneMappingExposure;
    exportRenderer.outputColorSpace = sourceRenderer.outputColorSpace;
    exportRenderer.shadowMap.enabled = sourceRenderer.shadowMap.enabled;

    const exportCamera = sourceCamera.clone();

    const renderFrame = () => {
      syncExportCamera(sourceCamera, exportCamera, targetSize.width / Math.max(1, targetSize.height));
      const previousBackground = scene.background;
      if (config.exportTransparent) {
        scene.background = null;
        exportRenderer.setClearColor(new Color(config.backgroundColor), 0);
      } else {
        exportRenderer.setClearColor(new Color(config.backgroundColor), 1);
      }
      exportRenderer.clear(true, true, true);
      exportRenderer.render(scene, exportCamera);
      scene.background = previousBackground;
    };

    const dispose = () => {
      exportRenderer.dispose();
      exportRenderer.forceContextLoss();
    };

    return {
      canvas,
      renderFrame,
      dispose,
    };
  } catch (error) {
    console.warn('Falling back to mirrored export renderer:', error);
    return null;
  }
}

export function startDedicatedExportRenderLoop(session: DedicatedExportRenderSession) {
  let rafId = 0;
  let active = true;

  const tick = () => {
    if (!active) return;
    session.renderFrame();
    rafId = window.requestAnimationFrame(tick);
  };

  tick();

  return () => {
    active = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
    session.dispose();
  };
}
