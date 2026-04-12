import React, { useEffect, useMemo, useRef } from 'react';
import { BoxGeometry } from 'three';
import type { InstancedMesh, MeshStandardMaterial } from 'three';
import type { VoxelLatticeSystemProps } from './sceneVoxelLatticeSystemShared';
import { useVoxelLatticeRuntime } from './sceneVoxelLatticeSystemRuntime';
import { VoxelLatticeSystemRender } from './sceneVoxelLatticeSystemRender';

export const VoxelLatticeSystem: React.FC<VoxelLatticeSystemProps> = (props) => {
  const meshRef = useRef<InstancedMesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const { layout } = useVoxelLatticeRuntime(props, meshRef, materialRef);
  if (!layout) return null;
  return <VoxelLatticeSystemRender meshRef={meshRef} materialRef={materialRef} geometry={geometry} instanceCount={layout.instanceCount} />;
};

export type {
  VoxelLatticeAudioFrame,
  VoxelLatticeSystemProps,
  VoxelLayout,
  VoxelMode,
  VoxelProfile,
  VoxelSettings,
} from './sceneVoxelLatticeSystemShared';
export {
  applyVoxelMaterialStyle,
  buildVoxelLatticeLayout,
  getVoxelLatticeLayoutDeps,
  getVoxelLatticeSettings,
  getVoxelProfile,
  updateVoxelLatticeInstances,
} from './sceneVoxelLatticeSystemShared';
export { useVoxelLatticeRuntime } from './sceneVoxelLatticeSystemRuntime';
export { VoxelLatticeSystemRender } from './sceneVoxelLatticeSystemRender';
