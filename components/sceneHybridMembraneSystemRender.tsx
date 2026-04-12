import React from 'react';
import { DoubleSide } from 'three';
import type { Mesh } from 'three';
import {
  HYBRID_MEMBRANE_FRAGMENT_SHADER,
  HYBRID_MEMBRANE_VERTEX_SHADER,
} from './sceneHybridMembraneSystemShared';

export const HybridMembraneSystemRender: React.FC<{
  meshRef: React.RefObject<Mesh | null>;
  size: number;
  uniforms: Record<string, { value: unknown }>;
}> = ({ meshRef, size, uniforms }) => (
  <mesh ref={meshRef as React.Ref<any>} renderOrder={3}>
    <planeGeometry args={[size, size, 96, 96]} />
    <shaderMaterial
      uniforms={uniforms}
      vertexShader={HYBRID_MEMBRANE_VERTEX_SHADER}
      fragmentShader={HYBRID_MEMBRANE_FRAGMENT_SHADER}
      transparent
      depthWrite={false}
      side={DoubleSide}
    />
  </mesh>
);
