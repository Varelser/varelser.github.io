import React from 'react';
import { useThree } from '@react-three/fiber';
import { FloatType, LinearFilter, OrthographicCamera, PerspectiveCamera, WebGLRenderTarget } from 'three';
import type { ParticleConfig } from '../types';

export const SceneDefaultCamera: React.FC<{ config: ParticleConfig }> = ({ config }) => {
  const { set, size } = useThree();
  const perspectiveCamera = React.useMemo(() => new PerspectiveCamera(50, 1, 0.1, 10_000), []);
  const orthographicCamera = React.useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0.1, 5_000), []);

  React.useEffect(() => {
    const aspect = Math.max(0.0001, size.width / Math.max(1, size.height));

    if (config.viewMode === 'orthographic') {
      orthographicCamera.left = -size.width / 2;
      orthographicCamera.right = size.width / 2;
      orthographicCamera.top = size.height / 2;
      orthographicCamera.bottom = -size.height / 2;
      orthographicCamera.position.set(0, 0, 500);
      orthographicCamera.zoom = Math.max(1, 1500 / Math.max(10, config.cameraDistance));
      orthographicCamera.near = 0.1;
      orthographicCamera.far = 5000;
      orthographicCamera.lookAt(0, 0, 0);
      orthographicCamera.updateProjectionMatrix();
      set({ camera: orthographicCamera });
      return;
    }

    perspectiveCamera.aspect = aspect;
    perspectiveCamera.position.set(0, 0, config.cameraDistance + 200);
    perspectiveCamera.fov = config.perspective / 20;
    perspectiveCamera.near = 0.1;
    perspectiveCamera.far = 10_000;
    perspectiveCamera.lookAt(0, 0, 0);
    perspectiveCamera.updateProjectionMatrix();
    set({ camera: perspectiveCamera });
  }, [config.cameraDistance, config.perspective, config.viewMode, orthographicCamera, perspectiveCamera, set, size.height, size.width]);

  return null;
};

export function useFloatRenderTarget(size: number) {
  const target = React.useMemo(() => new WebGLRenderTarget(size, size, {
    type: FloatType,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  }), [size]);

  React.useEffect(() => () => {
    target.dispose();
  }, [target]);

  return target;
}
