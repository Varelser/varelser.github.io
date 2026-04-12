import React from 'react';
import { Blending, LineSegments, ShaderMaterial } from 'three';
import {
  createFiberUniforms,
  FIBER_FRAGMENT_SHADER,
  FIBER_VERTEX_SHADER,
  type FiberProfile,
} from './sceneFiberFieldSystemShared';

export const FiberFieldSystemRender: React.FC<{
  lineRef: React.RefObject<LineSegments | null>;
  materialRef: React.RefObject<ShaderMaterial | null>;
  blending: Blending;
  fiberProfile: FiberProfile;
}> = ({ lineRef, materialRef, blending, fiberProfile }) => (
  <lineSegments ref={lineRef as React.Ref<any>} renderOrder={2}>
    <shaderMaterial
      ref={materialRef as React.Ref<any>}
      transparent={true}
      depthWrite={false}
      blending={blending}
      vertexShader={FIBER_VERTEX_SHADER}
      fragmentShader={FIBER_FRAGMENT_SHADER}
      uniforms={createFiberUniforms(fiberProfile)}
    />
  </lineSegments>
);
