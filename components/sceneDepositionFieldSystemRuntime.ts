import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import type { ShaderMaterial } from 'three';
import { createAudioRouteStateMap, evaluateAudioRoutes } from '../lib/audioReactiveRuntime';
import {
  buildDepositionFieldLayout,
  getDepositionFieldLayoutDeps,
  type DepositionFieldSystemProps,
  updateDepositionFieldScene,
} from './sceneDepositionFieldSystemShared';

export function useDepositionFieldRuntime(
  props: DepositionFieldSystemProps,
  groupRef: RefObject<Group | null>,
  materialRef: RefObject<ShaderMaterial | null>,
) {
  const { config, layerIndex, audioRef, isPlaying } = props;
  const audioRouteStateRef = useRef(createAudioRouteStateMap());
  const layout = useMemo(() => buildDepositionFieldLayout(config, layerIndex), getDepositionFieldLayoutDeps(config, layerIndex));

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const material = materialRef.current;
    if (!group || !material || !layout) return;
    const audioRouteEvaluation = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    updateDepositionFieldScene({
      group,
      material,
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
