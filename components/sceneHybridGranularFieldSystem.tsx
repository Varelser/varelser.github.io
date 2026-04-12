import React, { useMemo, useRef } from 'react';
import { Object3D } from 'three';
import type { InstancedMesh } from 'three';
import type { HybridGranularFieldSystemProps } from './sceneHybridGranularFieldSystemShared';
import { useHybridGranularFieldRuntime } from './sceneHybridGranularFieldSystemRuntime';
import { HybridGranularFieldSystemRender } from './sceneHybridGranularFieldSystemRender';

export const HybridGranularFieldSystem: React.FC<HybridGranularFieldSystemProps> = (props) => {
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);
  const runtime = useHybridGranularFieldRuntime(props, meshRef, tempObject);
  return <HybridGranularFieldSystemRender meshRef={meshRef} color={runtime.color} count={runtime.instanceCapacity} opacity={runtime.opacity} />;
};

export type { GranularProfile, HybridGranularAudioFrame, HybridGranularFieldSystemProps } from './sceneHybridGranularFieldSystemShared';
export {
  createHybridGranularFieldData,
  DEFAULT_GRANULAR_PROFILE,
  getHybridGranularAudioDrive,
  getHybridGranularLayerMode,
  getHybridGranularRuntimeVisuals,
  GRANULAR_MODE_PROFILES,
  mergeHybridGranularProfile,
} from './sceneHybridGranularFieldSystemShared';
export { useHybridGranularFieldRuntime } from './sceneHybridGranularFieldSystemRuntime';
export { HybridGranularFieldSystemRender } from './sceneHybridGranularFieldSystemRender';
export default HybridGranularFieldSystem;
