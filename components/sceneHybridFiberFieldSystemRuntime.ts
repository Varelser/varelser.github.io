import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments, MathUtils } from 'three';
import { createAudioRouteStateMap, evaluateAudioRoutes } from '../lib/audioReactiveRuntime';
import { resolveFiberAudioDrives } from '../lib/audioReactiveTargetSets';
import {
  createHybridFiberFieldData,
  getHybridFiberLayerMode,
  getHybridFiberRuntimeVisuals,
  getHybridFiberSettings,
  type HybridFiberFieldSystemProps,
} from './sceneHybridFiberFieldSystemShared';

function applyPositions(geometry: BufferGeometry, positions: Float32Array) {
  const current = geometry.getAttribute('position');
  if (!(current instanceof BufferAttribute) || current.array.length !== positions.length) {
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();
    return;
  }
  current.array.set(positions);
  current.needsUpdate = true;
  geometry.computeBoundingSphere();
}

export function useHybridFiberFieldRuntime(
  props: HybridFiberFieldSystemProps,
  lineRef: RefObject<LineSegments | null>,
) {
  const { config, layerIndex, audioRef, isPlaying } = props;
  const audioRouteStateRef = useRef(createAudioRouteStateMap());
  const mode = getHybridFiberLayerMode(config, layerIndex);
  const runtime = getHybridFiberRuntimeVisuals(config, layerIndex);
  const settings = getHybridFiberSettings(config, layerIndex);

  const geometry = useMemo(() => new BufferGeometry(), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const evaluatedAudioRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    const fiberDrives = resolveFiberAudioDrives(evaluatedAudioRoutes);
    const { positions } = createHybridFiberFieldData(config, mode, runtime.source, settings, audioRef, isPlaying, fiberDrives);
    applyPositions(geometry, positions);

    if (lineRef.current?.material instanceof LineBasicMaterial) {
      lineRef.current.material.opacity = MathUtils.clamp(
        Math.max(0.08, settings.opacity * 0.9) + fiberDrives.opacity * 0.22,
        0.05,
        1.35,
      );
      lineRef.current.material.color.set(runtime.color);
      lineRef.current.material.needsUpdate = true;
    }
  });

  return {
    color: runtime.color,
    geometry,
    opacity: Math.max(0.08, Math.min(1, settings.opacity * 0.9)),
  };
}
