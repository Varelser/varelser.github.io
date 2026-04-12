import React from 'react';
import { AdditiveBlending, DoubleSide, Mesh, MeshBasicMaterial, ShaderMaterial } from 'three';
import type { ParticleConfig } from '../types';
import { PATCH_FRAGMENT_SHADER, PATCH_VERTEX_SHADER, createPatchUniforms, getLayerPatchSettings } from './sceneSurfacePatchSystemShared';

type SurfacePatchRenderProps = {
  config: ParticleConfig;
  layerIndex: 2 | 3;
  meshRef: React.MutableRefObject<Mesh | null>;
  wireMeshRef: React.MutableRefObject<Mesh | null>;
  materialRef: React.MutableRefObject<ShaderMaterial | null>;
  wireMaterialRef: React.MutableRefObject<MeshBasicMaterial | null>;
};

export function SurfacePatchSystemRender({
  config,
  layerIndex,
  meshRef,
  wireMeshRef,
  materialRef,
  wireMaterialRef,
}: SurfacePatchRenderProps) {
  return (
    <group>
      <mesh ref={meshRef as React.Ref<any>} renderOrder={1}>
        <shaderMaterial
          ref={materialRef as React.Ref<any>}
          vertexShader={PATCH_VERTEX_SHADER}
          fragmentShader={PATCH_FRAGMENT_SHADER}
          transparent={true}
          depthWrite={false}
          side={DoubleSide}
          blending={AdditiveBlending}
          uniforms={createPatchUniforms(config, layerIndex)}
        />
      </mesh>
      <mesh ref={wireMeshRef as React.Ref<any>} renderOrder={2}>
        <meshBasicMaterial
          ref={wireMaterialRef as React.Ref<any>}
          transparent={true}
          depthWrite={false}
          wireframe={true}
          toneMapped={false}
          opacity={0.2}
          color={getLayerPatchSettings(config, layerIndex).color}
        />
      </mesh>
    </group>
  );
}
