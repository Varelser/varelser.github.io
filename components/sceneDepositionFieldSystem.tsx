import React, { useEffect, useMemo, useRef } from 'react';
import { PlaneGeometry } from 'three';
import type { Group, ShaderMaterial } from 'three';
import type { DepositionFieldSystemProps } from './sceneDepositionFieldSystemShared';
import { useDepositionFieldRuntime } from './sceneDepositionFieldSystemRuntime';
import { DepositionFieldSystemRender } from './sceneDepositionFieldSystemRender';

export const DepositionFieldSystem: React.FC<DepositionFieldSystemProps> = (props) => {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const geometry = useMemo(() => new PlaneGeometry(1, 1, 72, 72), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const { layout } = useDepositionFieldRuntime(props, groupRef, materialRef);
  if (!layout) return null;
  return <DepositionFieldSystemRender groupRef={groupRef} materialRef={materialRef} geometry={geometry} config={props.config} layerIndex={props.layerIndex} />;
};

export type {
  DepositionAudioFrame,
  DepositionFieldLayout,
  DepositionFieldSystemProps,
  DepositionMode,
  DepositionProfile,
} from './sceneDepositionFieldSystemShared';
export {
  buildDepositionFieldLayout,
  createDepositionFieldUniforms,
  DEPOSITION_FIELD_FRAGMENT_SHADER,
  DEPOSITION_FIELD_VERTEX_SHADER,
  getDepositionFieldLayoutDeps,
  getDepositionProfile,
  updateDepositionFieldScene,
} from './sceneDepositionFieldSystemShared';
export { useDepositionFieldRuntime } from './sceneDepositionFieldSystemRuntime';
export { DepositionFieldSystemRender } from './sceneDepositionFieldSystemRender';
