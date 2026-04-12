import React, { useRef } from 'react';
import type { Mesh } from 'three';
import type { HybridMembraneSystemProps } from './sceneHybridMembraneSystemShared';
import { useHybridMembraneRuntime } from './sceneHybridMembraneSystemRuntime';
import { HybridMembraneSystemRender } from './sceneHybridMembraneSystemRender';

export const HybridMembraneSystem: React.FC<HybridMembraneSystemProps> = (props) => {
  const meshRef = useRef<Mesh>(null);
  const runtime = useHybridMembraneRuntime(props, meshRef);
  return <HybridMembraneSystemRender meshRef={meshRef} {...runtime} />;
};

export type {
  HybridMembraneAudioFrame,
  HybridMembraneSystemProps,
  MembraneProfile,
} from './sceneHybridMembraneSystemShared';
export {
  createHybridMembraneUniforms,
  DEFAULT_MEMBRANE_PROFILE,
  getHybridMembraneAudioDrive,
  getHybridMembraneProfile,
  getHybridMembraneSettings,
  getHybridMembraneSize,
  HYBRID_MEMBRANE_FRAGMENT_SHADER,
  HYBRID_MEMBRANE_VERTEX_SHADER,
  MEMBRANE_MODE_PROFILES,
  syncHybridMembraneUniforms,
} from './sceneHybridMembraneSystemShared';
export { useHybridMembraneRuntime } from './sceneHybridMembraneSystemRuntime';
export { HybridMembraneSystemRender } from './sceneHybridMembraneSystemRender';
export default HybridMembraneSystem;
