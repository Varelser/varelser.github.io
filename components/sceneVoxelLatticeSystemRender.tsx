import React from 'react';
import { AdditiveBlending } from 'three';
import type { BoxGeometry, InstancedMesh, MeshStandardMaterial } from 'three';

export const VoxelLatticeSystemRender: React.FC<{
  meshRef: React.RefObject<InstancedMesh | null>;
  materialRef: React.RefObject<MeshStandardMaterial | null>;
  geometry: BoxGeometry;
  instanceCount: number;
}> = ({ meshRef, materialRef, geometry, instanceCount }) => (
  <instancedMesh ref={meshRef as React.Ref<any>} args={[geometry, undefined, instanceCount]} renderOrder={2}>
    <meshStandardMaterial ref={materialRef as React.Ref<any>} transparent depthWrite={false} vertexColors blending={AdditiveBlending} />
  </instancedMesh>
);
