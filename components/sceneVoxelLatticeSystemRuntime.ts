import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { InstancedMesh, MeshStandardMaterial } from 'three';
import { createAudioRouteStateMap, evaluateAudioRoutes } from '../lib/audioReactiveRuntime';
import {
  buildVoxelLatticeLayout,
  getVoxelLatticeLayoutDeps,
  type VoxelLatticeSystemProps,
  updateVoxelLatticeInstances,
} from './sceneVoxelLatticeSystemShared';
import { getLayerRuntimeVoxelSnapshot } from '../lib/sceneRenderRoutingRuntime';

export function useVoxelLatticeRuntime(
  props: VoxelLatticeSystemProps,
  meshRef: RefObject<InstancedMesh | null>,
  materialRef: RefObject<MeshStandardMaterial | null>,
) {
  const { config, layerIndex, audioRef, isPlaying } = props;
  const audioRouteStateRef = useRef(createAudioRouteStateMap());
  const layout = useMemo(() => buildVoxelLatticeLayout(config, layerIndex), getVoxelLatticeLayoutDeps(config, layerIndex));

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material || !layout) return;
    const runtime = getLayerRuntimeVoxelSnapshot(config, layerIndex);
    const audioRouteEvaluation = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    updateVoxelLatticeInstances({
      mesh,
      material,
      layout,
      config,
      layerIndex,
      runtime,
      audioFrame: audioRef.current,
      audioRouteEvaluation,
      isPlaying,
      time: clock.getElapsedTime(),
    });
  });

  return { layout };
}
