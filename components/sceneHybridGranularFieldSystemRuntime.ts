import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { InstancedMesh, MathUtils, MeshStandardMaterial, Object3D } from 'three';
import { createAudioRouteStateMap, evaluateAudioRoutes } from '../lib/audioReactiveRuntime';
import { resolveGranularAudioDrives } from '../lib/audioReactiveTargetSets';
import {
  createHybridGranularFieldData,
  getHybridGranularLayerMode,
  getHybridGranularRuntimeVisuals,
  type HybridGranularFieldSystemProps,
} from './sceneHybridGranularFieldSystemShared';

const HYBRID_GRANULAR_INSTANCE_CAPACITY = 320;

export function useHybridGranularFieldRuntime(
  props: HybridGranularFieldSystemProps,
  meshRef: RefObject<InstancedMesh | null>,
  tempObject: Object3D,
) {
  const { config, layerIndex, audioRef, isPlaying } = props;
  const audioRouteStateRef = useRef(createAudioRouteStateMap());
  const mode = getHybridGranularLayerMode(config, layerIndex);
  const runtime = getHybridGranularRuntimeVisuals(config, layerIndex);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const evaluatedAudioRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    const granularDrives = resolveGranularAudioDrives(evaluatedAudioRoutes);
    const { positions, scales, profile } = createHybridGranularFieldData(
      config,
      mode,
      runtime.source,
      audioRef,
      isPlaying,
      granularDrives,
    );

    const count = Math.min(profile.count, HYBRID_GRANULAR_INSTANCE_CAPACITY);
    for (let i = 0; i < count; i += 1) {
      tempObject.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      tempObject.scale.setScalar(scales[i]);
      tempObject.rotation.set((i % 7) * 0.19, (i % 11) * 0.13, (i % 5) * 0.17);
      tempObject.updateMatrix();
      mesh.setMatrixAt(i, tempObject.matrix);
    }
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;

    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (material instanceof MeshStandardMaterial) {
      material.opacity = MathUtils.clamp(0.82 + granularDrives.opacity * 0.2, 0.06, 1.35);
      material.color.set(runtime.color);
      material.needsUpdate = true;
    }
  });

  return useMemo(() => ({
    color: runtime.color,
    instanceCapacity: HYBRID_GRANULAR_INSTANCE_CAPACITY,
    opacity: 0.82,
  }), [runtime.color]);
}
