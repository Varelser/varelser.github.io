import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import type { MeshStandardMaterial } from 'three';
import {
  createMarchingCubesObject,
  createMetaballMaterial,
  getMetaballResolution,
  syncMetaballMaterial,
  updateMetaballField,
  type MetaballSystemProps,
} from './sceneMetaballSystemShared';

export function useMetaballRuntime(props: MetaballSystemProps) {
  const { config, posReadbackRef, posReadbackVersionRef, texSize, isPlaying } = props;
  const matRef = useRef<MeshStandardMaterial | null>(null);
  const lastReadbackVersionRef = useRef(0);
  const resolution = getMetaballResolution(config);

  const marchingCubes = useMemo(() => {
    matRef.current?.dispose();
    const material = createMetaballMaterial(config);
    matRef.current = material;
    return createMarchingCubesObject(config, resolution, material);
  }, [config, resolution]);

  useEffect(() => {
    return () => {
      marchingCubes.geometry.dispose();
      matRef.current?.dispose();
    };
  }, [marchingCubes]);

  useFrame(() => {
    const material = matRef.current;
    const positions = posReadbackRef.current;
    if (!material || !positions) return;

    syncMetaballMaterial(material, config);
    marchingCubes.isolation = config.gpgpuMetaballIsoLevel;
    marchingCubes.scale.setScalar(config.gpgpuBounceRadius);

    if (!isPlaying) return;

    const readbackVersion = posReadbackVersionRef.current;
    if (readbackVersion === lastReadbackVersionRef.current) return;
    lastReadbackVersionRef.current = readbackVersion;
    if (readbackVersion % Math.max(1, config.gpgpuMetaballUpdateSkip) !== 0) return;

    updateMetaballField(marchingCubes, positions, texSize, config);
  });

  return { marchingCubes };
}
