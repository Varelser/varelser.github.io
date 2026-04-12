import React from 'react';
import { AdditiveBlending, DoubleSide } from 'three';
import type { Group, PlaneGeometry, ShaderMaterial } from 'three';
import { createDepositionFieldUniforms, DEPOSITION_FIELD_FRAGMENT_SHADER, DEPOSITION_FIELD_VERTEX_SHADER } from './sceneDepositionFieldSystemShared';
import { getLayerRuntimeDepositionSnapshot } from '../lib/sceneRenderRoutingRuntime';
import type { ParticleConfig } from '../types';

export const DepositionFieldSystemRender: React.FC<{
  groupRef: React.RefObject<Group | null>;
  materialRef: React.RefObject<ShaderMaterial | null>;
  geometry: PlaneGeometry;
  config: ParticleConfig;
  layerIndex: 2 | 3;
}> = ({ groupRef, materialRef, geometry, config, layerIndex }) => {
  const settings = getLayerRuntimeDepositionSnapshot(config, layerIndex);
  return (
    <group ref={groupRef as React.Ref<any>} renderOrder={1}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={materialRef as React.Ref<any>}
          transparent={true}
          depthWrite={false}
          side={DoubleSide}
          blending={AdditiveBlending}
          vertexShader={DEPOSITION_FIELD_VERTEX_SHADER}
          fragmentShader={DEPOSITION_FIELD_FRAGMENT_SHADER}
          uniforms={createDepositionFieldUniforms(settings)}
        />
      </mesh>
    </group>
  );
};
