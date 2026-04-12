import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Color } from 'three';
import type { ParticleConfig } from '../types';
import { buildCaptureExportManifest, downloadJsonFile } from '../lib/captureExportManifest';
import { createExportRenderTargetCanvas, drawSourceCanvasToTarget, prepareExportCanvas } from '../lib/exportDimensions';
import { createDedicatedExportRenderSession } from '../lib/exportSceneRenderer';

export const ScreenshotManager: React.FC<{ config: ParticleConfig; saveTrigger: number }> = ({ config, saveTrigger }) => {
  const { gl, scene, camera } = useThree();
  const prevTrigger = useRef(0);

  useEffect(() => {
    if (saveTrigger === 0 || saveTrigger === prevTrigger.current) return;
    prevTrigger.current = saveTrigger;

    const dedicatedSession = createDedicatedExportRenderSession({
      config,
      scene,
      sourceCamera: camera,
      sourceRenderer: gl,
    });
    const exportCanvas = dedicatedSession?.canvas ?? createExportRenderTargetCanvas(gl.domElement, config).canvas;

    if (dedicatedSession) {
      dedicatedSession.renderFrame();
    } else {
      const exportState = prepareExportCanvas(gl, camera, config);
      const prevClearColor = new Color();
      gl.getClearColor(prevClearColor);
      const prevClearAlpha = gl.getClearAlpha();
      const prevSceneBackground = scene.background;
      const prevAutoClear = gl.autoClear;

      if (config.exportTransparent) {
        scene.background = null;
        gl.setClearColor(0x000000, 0);
      } else {
        const bgColor = new Color(config.backgroundColor);
        scene.background = bgColor;
        gl.setClearColor(bgColor, 1);
      }

      gl.autoClear = true;
      camera.updateMatrixWorld();
      gl.clear(true, true, true);
      gl.render(scene, camera);
      drawSourceCanvasToTarget(gl.domElement, exportCanvas);
      exportState.restore();
      gl.setClearColor(prevClearColor, prevClearAlpha);
      scene.background = prevSceneBackground;
      gl.autoClear = prevAutoClear;
      gl.render(scene, camera);
    }

    const dataURL = exportCanvas.toDataURL('image/png');
    const fileName = `kalokagathia_${Date.now()}.png`;
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataURL;
    link.click();

    const manifest = buildCaptureExportManifest({
      kind: 'png-screenshot',
      exportMode: 'current',
      fileName,
      mimeType: 'image/png',
      config,
      targetDurationSeconds: 0,
      frameCount: 1,
      fps: null,
      includeAudio: false,
      exportScale: config.exportScale,
      transparentBackground: config.exportTransparent,
      canvas: {
        width: exportCanvas.width,
        height: exportCanvas.height,
        devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : undefined,
      },
    });
    downloadJsonFile(fileName.replace(/\.png$/u, '.manifest.json'), manifest);
    dedicatedSession?.dispose();
  }, [saveTrigger, config, gl, scene, camera]);

  return null;
};
