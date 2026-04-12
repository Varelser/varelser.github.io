import React from 'react';
import { AdditiveBlending, BufferGeometry, DoubleSide, MeshBasicMaterial, ShaderMaterial } from 'three';
import type { ParticleConfig } from '../types';
import {
  createMembraneUniforms,
  MEMBRANE_FRAGMENT_SHADER,
  MEMBRANE_VERTEX_SHADER,
} from './sceneMembraneSystemShared';

export const MembraneSystemRender: React.FC<{
  config: ParticleConfig;
  layerIndex: 2 | 3;
  geometry: BufferGeometry;
  surfaceMaterialRef: React.MutableRefObject<ShaderMaterial | null>;
  wireMaterialRef: React.MutableRefObject<MeshBasicMaterial | null>;
}> = ({ config, layerIndex, geometry, surfaceMaterialRef, wireMaterialRef }) => (
  <group>
    <mesh geometry={geometry} renderOrder={1}>
      <shaderMaterial
        ref={surfaceMaterialRef as React.Ref<any>}
        vertexShader={MEMBRANE_VERTEX_SHADER}
        fragmentShader={MEMBRANE_FRAGMENT_SHADER}
        transparent={true}
        depthWrite={false}
        side={DoubleSide}
        blending={AdditiveBlending}
        uniforms={createMembraneUniforms(config, layerIndex)}
      />
    </mesh>
    <mesh geometry={geometry} renderOrder={2}>
      <meshBasicMaterial
        ref={wireMaterialRef as React.Ref<any>}
        transparent={true}
        depthWrite={false}
        wireframe={true}
        toneMapped={false}
        opacity={0.28}
        color={layerIndex === 2 ? config.layer2Color : config.layer3Color}
      />
    </mesh>
  </group>
);
