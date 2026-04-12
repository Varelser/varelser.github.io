import React from 'react';
import { AdditiveBlending, BackSide, Mesh } from 'three';
import {
  SDF_SURFACE_SHELL_FRAGMENT_SHADER,
  SDF_SURFACE_SHELL_VERTEX_SHADER,
} from './sceneSdfSurfaceShellSystemShared';

export const SdfSurfaceShellSystemRender: React.FC<{
  meshRef: React.RefObject<Mesh | null>;
  radius: number;
  uniforms: ReturnType<typeof import('./sceneSdfSurfaceShellSystemShared').createSdfSurfaceShellUniforms>;
}> = ({ meshRef, radius, uniforms }) => (
  <mesh ref={meshRef as React.Ref<any>} renderOrder={3}>
    <boxGeometry args={[radius * 2, radius * 2, radius * 2]} />
    <shaderMaterial
      uniforms={uniforms}
      vertexShader={SDF_SURFACE_SHELL_VERTEX_SHADER}
      fragmentShader={SDF_SURFACE_SHELL_FRAGMENT_SHADER}
      transparent
      depthWrite={false}
      side={BackSide}
      blending={AdditiveBlending}
    />
  </mesh>
);
