import React from 'react';
import { AdditiveBlending } from 'three';
import type { LineSegments, ShaderMaterial } from 'three';
import {
  createGrowthUniforms,
  GROWTH_FRAGMENT_SHADER,
  GROWTH_VERTEX_SHADER,
} from './sceneGrowthFieldSystemShared';

export const GrowthFieldRender: React.FC<{
  lineRef: React.MutableRefObject<LineSegments | null>;
  materialRef: React.MutableRefObject<ShaderMaterial | null>;
}> = ({ lineRef, materialRef }) => (
  <lineSegments ref={lineRef as React.Ref<any>} renderOrder={2}>
    <shaderMaterial
      ref={materialRef as React.Ref<any>}
      transparent={true}
      depthWrite={false}
      blending={AdditiveBlending}
      vertexShader={GROWTH_VERTEX_SHADER}
      fragmentShader={GROWTH_FRAGMENT_SHADER}
      uniforms={createGrowthUniforms()}
    />
  </lineSegments>
);
