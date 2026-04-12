import React, { useEffect, useMemo, useRef } from 'react';
import { BufferGeometry, LineSegments, ShaderMaterial } from 'three';
import {
  buildGrowthLayout,
  getLayoutDeps,
  type GrowthFieldProps,
} from './sceneGrowthFieldSystemShared';
import { GrowthFieldRender } from './sceneGrowthFieldSystemRender';
import { useGrowthFieldRuntime } from './sceneGrowthFieldSystemRuntime';

export const GrowthFieldSystem: React.FC<GrowthFieldProps> = ({ config, layerIndex, audioRef, isPlaying }) => {
  const lineRef = useRef<LineSegments>(null);
  const geometryRef = useRef<BufferGeometry | null>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const layout = useMemo(() => buildGrowthLayout(config, layerIndex), getLayoutDeps(config, layerIndex));

  useEffect(() => {
    geometryRef.current?.dispose();
    geometryRef.current = null;
  }, [layout?.maxStrandCount]);

  useEffect(() => () => {
    geometryRef.current?.dispose();
    geometryRef.current = null;
  }, []);

  useGrowthFieldRuntime({
    config,
    layerIndex,
    audioRef,
    isPlaying,
    lineRef,
    geometryRef,
    materialRef,
    layout,
  });

  if (!layout) return null;

  return <GrowthFieldRender lineRef={lineRef} materialRef={materialRef} />;
};
