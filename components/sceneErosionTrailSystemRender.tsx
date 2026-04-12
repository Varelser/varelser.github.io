import React from 'react';
import { AdditiveBlending, LineSegments, ShaderMaterial } from 'three';
import {
  createErosionTrailUniforms,
  EROSION_TRAIL_FRAGMENT_SHADER,
  EROSION_TRAIL_VERTEX_SHADER,
} from './sceneErosionTrailSystemShared';

export const ErosionTrailSystemRender: React.FC<{
  lineRef: React.RefObject<LineSegments | null>;
  materialRef: React.RefObject<ShaderMaterial | null>;
}> = ({ lineRef, materialRef }) => (
  <lineSegments ref={lineRef as React.Ref<any>} renderOrder={2}>
    <shaderMaterial
      ref={materialRef as React.Ref<any>}
      transparent={true}
      depthWrite={false}
      blending={AdditiveBlending}
      vertexShader={EROSION_TRAIL_VERTEX_SHADER}
      fragmentShader={EROSION_TRAIL_FRAGMENT_SHADER}
      uniforms={createErosionTrailUniforms()}
    />
  </lineSegments>
);
