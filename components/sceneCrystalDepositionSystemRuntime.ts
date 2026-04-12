import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, InstancedMesh, MeshStandardMaterial, ShaderMaterial } from 'three';
import { createAudioRouteStateMap, evaluateAudioRoutes } from '../lib/audioReactiveRuntime';
import {
  buildCrystalDepositionLayout,
  getCrystalDepositionLayoutDeps,
  type CrystalDepositionSystemProps,
  updateCrystalDepositionScene,
} from './sceneCrystalDepositionSystemShared';

export function useCrystalDepositionRuntime(
  props: CrystalDepositionSystemProps,
  groupRef: RefObject<Group | null>,
  planeMaterialRef: RefObject<ShaderMaterial | null>,
  crystalMaterialRef: RefObject<MeshStandardMaterial | null>,
  meshRef: RefObject<InstancedMesh | null>,
) {
  const { config, layerIndex, audioRef, isPlaying } = props;
  const audioRouteStateRef = useRef(createAudioRouteStateMap());
  const layout = useMemo(() => buildCrystalDepositionLayout(config, layerIndex), getCrystalDepositionLayoutDeps(config, layerIndex));

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const planeMaterial = planeMaterialRef.current;
    const crystalMaterial = crystalMaterialRef.current;
    const mesh = meshRef.current;
    if (!group || !planeMaterial || !crystalMaterial || !mesh || !layout) return;
    const audioRouteEvaluation = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    updateCrystalDepositionScene({
      group,
      planeMaterial,
      crystalMaterial,
      mesh,
      layout,
      config,
      layerIndex,
      audioFrame: audioRef.current,
      audioRouteEvaluation,
      isPlaying,
      time: clock.getElapsedTime(),
    });
  });

  return { layout };
}
