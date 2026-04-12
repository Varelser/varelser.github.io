import React from 'react';
import { AdditiveBlending, DoubleSide } from 'three';
import type { BufferGeometry, Group, InstancedMesh, MeshStandardMaterial, PlaneGeometry, ShaderMaterial } from 'three';
import { createCrystalDepositionUniforms, CRYSTAL_DEPOSITION_FRAGMENT_SHADER, CRYSTAL_DEPOSITION_VERTEX_SHADER, getCrystalDepositionSettings } from './sceneCrystalDepositionSystemShared';
import type { ParticleConfig } from '../types';

export const CrystalDepositionSystemRender: React.FC<{
  groupRef: React.RefObject<Group | null>;
  planeMaterialRef: React.RefObject<ShaderMaterial | null>;
  crystalMaterialRef: React.RefObject<MeshStandardMaterial | null>;
  meshRef: React.RefObject<InstancedMesh | null>;
  planeGeometry: PlaneGeometry;
  crystalGeometry: BufferGeometry;
  config: ParticleConfig;
  layerIndex: 2 | 3;
  instanceCount: number;
}> = ({ groupRef, planeMaterialRef, crystalMaterialRef, meshRef, planeGeometry, crystalGeometry, config, layerIndex, instanceCount }) => {
  const settings = getCrystalDepositionSettings(config, layerIndex);
  return (
    <group ref={groupRef as React.Ref<any>} renderOrder={2}>
      <mesh geometry={planeGeometry}>
        <shaderMaterial
          ref={planeMaterialRef as React.Ref<any>}
          transparent={true}
          depthWrite={false}
          side={DoubleSide}
          blending={AdditiveBlending}
          vertexShader={CRYSTAL_DEPOSITION_VERTEX_SHADER}
          fragmentShader={CRYSTAL_DEPOSITION_FRAGMENT_SHADER}
          uniforms={createCrystalDepositionUniforms(settings)}
        />
      </mesh>
      <instancedMesh ref={meshRef as React.Ref<any>} args={[crystalGeometry, undefined, instanceCount]} renderOrder={3}>
        <meshStandardMaterial ref={crystalMaterialRef as React.Ref<any>} transparent={true} depthWrite={false} vertexColors={true} blending={AdditiveBlending} />
      </instancedMesh>
    </group>
  );
};
