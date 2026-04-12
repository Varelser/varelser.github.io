import React, { useRef } from 'react';
import type { Mesh } from 'three';
import type { HybridSurfacePatchSystemProps } from './sceneHybridSurfacePatchSystemShared';
import { useHybridSurfacePatchRuntime } from './sceneHybridSurfacePatchSystemRuntime';
import { HybridSurfacePatchSystemRender } from './sceneHybridSurfacePatchSystemRender';

export const HybridSurfacePatchSystem: React.FC<HybridSurfacePatchSystemProps> = (props) => {
  const meshRef = useRef<Mesh>(null);
  const runtime = useHybridSurfacePatchRuntime(props, meshRef);
  return <HybridSurfacePatchSystemRender meshRef={meshRef} {...runtime} />;
};

export type {
  HybridSurfacePatchAudioFrame,
  HybridSurfacePatchSystemProps,
  PatchProfile,
} from './sceneHybridSurfacePatchSystemShared';
export {
  createHybridSurfacePatchUniforms,
  DEFAULT_PATCH_PROFILE,
  getHybridSurfacePatchAudioDrive,
  getHybridSurfacePatchProfile,
  getHybridSurfacePatchSettings,
  getHybridSurfacePatchSize,
  HYBRID_SURFACE_PATCH_FRAGMENT_SHADER,
  HYBRID_SURFACE_PATCH_VERTEX_SHADER,
  PATCH_MODE_PROFILES,
  syncHybridSurfacePatchUniforms,
} from './sceneHybridSurfacePatchSystemShared';
export { useHybridSurfacePatchRuntime } from './sceneHybridSurfacePatchSystemRuntime';
export { HybridSurfacePatchSystemRender } from './sceneHybridSurfacePatchSystemRender';
