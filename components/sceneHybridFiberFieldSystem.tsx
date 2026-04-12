import React, { useRef } from 'react';
import type { LineSegments } from 'three';
import type { HybridFiberFieldSystemProps } from './sceneHybridFiberFieldSystemShared';
import { useHybridFiberFieldRuntime } from './sceneHybridFiberFieldSystemRuntime';
import { HybridFiberFieldSystemRender } from './sceneHybridFiberFieldSystemRender';

export const HybridFiberFieldSystem: React.FC<HybridFiberFieldSystemProps> = (props) => {
  const lineRef = useRef<LineSegments>(null);
  const runtime = useHybridFiberFieldRuntime(props, lineRef);
  return <HybridFiberFieldSystemRender lineRef={lineRef} {...runtime} />;
};

export type { FiberModeProfile, HybridFiberAudioFrame, HybridFiberFieldSystemProps } from './sceneHybridFiberFieldSystemShared';
export {
  createHybridFiberFieldData,
  DEFAULT_FIBER_PROFILE,
  FIBER_MODE_PROFILES,
  getHybridFiberLayerMode,
  getHybridFiberRuntimeVisuals,
  getHybridFiberSettings,
  mergeHybridFiberProfile,
} from './sceneHybridFiberFieldSystemShared';
export { useHybridFiberFieldRuntime } from './sceneHybridFiberFieldSystemRuntime';
export { HybridFiberFieldSystemRender } from './sceneHybridFiberFieldSystemRender';
export default HybridFiberFieldSystem;
