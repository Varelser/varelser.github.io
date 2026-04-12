import React, { useRef } from 'react';
import type { BufferGeometry, LineSegments, Mesh } from 'three';
import type { LineSystemProps } from './sceneLineSystemShared';
import { useLineSystemRuntime } from './sceneLineSystemRuntime';
import { LineSystemRender } from './sceneLineSystemRender';

export const LineSystem: React.FC<LineSystemProps> = (props) => {
  const lineRef = useRef<LineSegments>(null);
  const brushRef = useRef<Mesh>(null);
  const lineGeometryRef = useRef<BufferGeometry>(null);
  const brushGeometryRef = useRef<BufferGeometry>(null);
  const { layerConnectionStyle } = useLineSystemRuntime(props, lineRef, brushRef, lineGeometryRef, brushGeometryRef);
  return (
    <LineSystemRender
      config={props.config}
      layerConnectionStyle={layerConnectionStyle}
      uniforms={props.uniforms}
      lineRef={lineRef}
      brushRef={brushRef}
      lineGeometryRef={lineGeometryRef}
      brushGeometryRef={brushGeometryRef}
    />
  );
};
