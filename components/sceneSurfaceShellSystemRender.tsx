import React from 'react';
import { AdditiveBlending, DoubleSide, Mesh, MeshBasicMaterial, ShaderMaterial } from 'three';
import type { ParticleConfig } from '../types';
import { createShellUniforms, SHELL_FRAGMENT_SHADER, SHELL_VERTEX_SHADER } from './sceneSurfaceShellSystemShared';

type SurfaceShellSystemRenderProps = {
  config: ParticleConfig;
  layerIndex: 2 | 3;
  shellMaterialRef: React.RefObject<ShaderMaterial | null>;
  wireMaterialRef: React.RefObject<MeshBasicMaterial | null>;
  shellMeshRef: React.RefObject<Mesh | null>;
  wireMeshRef: React.RefObject<Mesh | null>;
};

export function SurfaceShellSystemRender({
  config,
  layerIndex,
  shellMaterialRef,
  wireMaterialRef,
  shellMeshRef,
  wireMeshRef,
}: SurfaceShellSystemRenderProps) {
  return (
    <group>
      <mesh ref={shellMeshRef as React.Ref<any>} renderOrder={1}>
        <shaderMaterial
          ref={shellMaterialRef as React.Ref<any>}
          vertexShader={SHELL_VERTEX_SHADER}
          fragmentShader={SHELL_FRAGMENT_SHADER}
          transparent={true}
          depthWrite={false}
          side={DoubleSide}
          blending={AdditiveBlending}
          uniforms={createShellUniforms(config, layerIndex)}
        />
      </mesh>
      <mesh ref={wireMeshRef as React.Ref<any>} renderOrder={2}>
        <meshBasicMaterial ref={wireMaterialRef as React.Ref<any>} transparent={true} depthWrite={false} wireframe={true} toneMapped={false} opacity={0.28} color={layerIndex === 2 ? config.layer2Color : config.layer3Color} />
      </mesh>
    </group>
  );
}
