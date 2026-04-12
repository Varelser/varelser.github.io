import React, { useRef } from 'react';
import type { BufferGeometry, LineSegments, ShaderMaterial } from 'three';
import type { FiberFieldSystemProps } from './sceneFiberFieldSystemShared';
import { useFiberFieldRuntime } from './sceneFiberFieldSystemRuntime';
import { FiberFieldSystemRender } from './sceneFiberFieldSystemRender';

export const FiberFieldSystem: React.FC<FiberFieldSystemProps> = (props) => {
  const lineRef = useRef<LineSegments>(null);
  const geometryRef = useRef<BufferGeometry | null>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const { layout, fiberProfile, blending } = useFiberFieldRuntime(props, lineRef, geometryRef, materialRef);
  if (!layout) return null;
  return <FiberFieldSystemRender lineRef={lineRef} materialRef={materialRef} blending={blending} fiberProfile={fiberProfile} />;
};
