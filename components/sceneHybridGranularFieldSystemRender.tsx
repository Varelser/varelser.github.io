import React from 'react';
import type { InstancedMesh, ColorRepresentation } from 'three';

export const HybridGranularFieldSystemRender: React.FC<{
  meshRef: React.RefObject<InstancedMesh | null>;
  color: ColorRepresentation;
  count: number;
  opacity: number;
}> = ({ meshRef, color, count, opacity }) => (
  <instancedMesh ref={meshRef as React.Ref<InstancedMesh>} args={[undefined, undefined, count]} renderOrder={4}>
    <icosahedronGeometry args={[1, 0]} />
    <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.62} metalness={0.08} />
  </instancedMesh>
);
