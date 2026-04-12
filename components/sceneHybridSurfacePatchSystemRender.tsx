import React from 'react';
import { AdditiveBlending, DoubleSide } from 'three';
import type { Mesh } from 'three';
import {
  HYBRID_SURFACE_PATCH_FRAGMENT_SHADER,
  HYBRID_SURFACE_PATCH_VERTEX_SHADER,
} from './sceneHybridSurfacePatchSystemShared';

export const HybridSurfacePatchSystemRender: React.FC<{
  meshRef: React.RefObject<Mesh | null>;
  size: number;
  uniforms: Record<string, { value: unknown }>;
}> = ({ meshRef, size, uniforms }) => (
  <mesh ref={meshRef as React.Ref<any>} renderOrder={3}>
    <planeGeometry args={[size, size, 96, 96]} />
    <shaderMaterial
      uniforms={uniforms}
      vertexShader={HYBRID_SURFACE_PATCH_VERTEX_SHADER}
      fragmentShader={HYBRID_SURFACE_PATCH_FRAGMENT_SHADER}
      transparent
      depthWrite={false}
      side={DoubleSide}
      blending={AdditiveBlending}
    />
  </mesh>
);
