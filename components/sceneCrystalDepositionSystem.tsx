import React, { useEffect, useMemo, useRef } from 'react';
import { OctahedronGeometry, PlaneGeometry } from 'three';
import type { Group, InstancedMesh, MeshStandardMaterial, ShaderMaterial } from 'three';
import type { CrystalDepositionSystemProps } from './sceneCrystalDepositionSystemShared';
import { useCrystalDepositionRuntime } from './sceneCrystalDepositionSystemRuntime';
import { CrystalDepositionSystemRender } from './sceneCrystalDepositionSystemRender';

export const CrystalDepositionSystem: React.FC<CrystalDepositionSystemProps> = (props) => {
  const groupRef = useRef<Group>(null);
  const planeMaterialRef = useRef<ShaderMaterial>(null);
  const crystalMaterialRef = useRef<MeshStandardMaterial>(null);
  const meshRef = useRef<InstancedMesh>(null);
  const planeGeometry = useMemo(() => new PlaneGeometry(1, 1, 68, 68), []);
  const crystalGeometry = useMemo(() => new OctahedronGeometry(1, 0), []);

  useEffect(() => () => {
    planeGeometry.dispose();
    crystalGeometry.dispose();
  }, [planeGeometry, crystalGeometry]);

  const { layout } = useCrystalDepositionRuntime(props, groupRef, planeMaterialRef, crystalMaterialRef, meshRef);
  if (!layout) return null;
  return (
    <CrystalDepositionSystemRender
      groupRef={groupRef}
      planeMaterialRef={planeMaterialRef}
      crystalMaterialRef={crystalMaterialRef}
      meshRef={meshRef}
      planeGeometry={planeGeometry}
      crystalGeometry={crystalGeometry}
      config={props.config}
      layerIndex={props.layerIndex}
      instanceCount={layout.instanceCount}
    />
  );
};

export type {
  CrystalDepositionAudioFrame,
  CrystalDepositionLayout,
  CrystalDepositionSystemProps,
  CrystalHybridSettings,
  CrystalSurfaceProfile,
} from './sceneCrystalDepositionSystemShared';
export {
  buildCrystalDepositionLayout,
  createCrystalDepositionUniforms,
  CRYSTAL_DEPOSITION_FRAGMENT_SHADER,
  CRYSTAL_DEPOSITION_VERTEX_SHADER,
  getCrystalDepositionLayoutDeps,
  getCrystalDepositionSettings,
  getCrystalDepositionSurfaceProfile,
  styleifyCrystalDeposition,
  updateCrystalDepositionScene,
} from './sceneCrystalDepositionSystemShared';
export { useCrystalDepositionRuntime } from './sceneCrystalDepositionSystemRuntime';
export { CrystalDepositionSystemRender } from './sceneCrystalDepositionSystemRender';
