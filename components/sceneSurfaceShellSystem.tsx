import React, { useMemo, useRef } from 'react';
import type { Mesh, MeshBasicMaterial, ShaderMaterial } from 'three';
import type { ParticleConfig } from '../types';
import {
  buildHullLayout,
  getLayoutDeps,
  getSourceShellGeometryProfile,
  resolveShellProfile,
} from './sceneSurfaceShellSystemShared';
import { getLayerSource } from '../lib/sourceAwareShaping';
import { useSurfaceShellSystemRuntime } from './sceneSurfaceShellSystemRuntime';
import { SurfaceShellSystemRender } from './sceneSurfaceShellSystemRender';

export const SurfaceShellSystem: React.FC<{
  config: ParticleConfig;
  layerIndex: 2 | 3;
  audioRef: React.MutableRefObject<{ bass: number; treble: number; pulse: number; bandA: number; bandB: number }>;
  isPlaying: boolean;
}> = ({ config, layerIndex, audioRef, isPlaying }) => {
  const shellMaterialRef = useRef<ShaderMaterial>(null);
  const wireMaterialRef = useRef<MeshBasicMaterial>(null);
  const shellMeshRef = useRef<Mesh>(null);
  const wireMeshRef = useRef<Mesh>(null);
  const layout = useMemo(() => buildHullLayout(config, layerIndex), getLayoutDeps(config, layerIndex));
  const layerSource = getLayerSource(config, layerIndex);
  const shellProfile = useMemo(() => resolveShellProfile(config, layerIndex), [config, layerIndex]);
  const sourceProfile = useMemo(() => getSourceShellGeometryProfile(layerSource), [layerSource]);

  useSurfaceShellSystemRuntime({
    config,
    layerIndex,
    audioRef,
    isPlaying,
    layout,
    shellProfile,
    sourceProfile,
    shellMaterialRef,
    wireMaterialRef,
    shellMeshRef,
    wireMeshRef,
  });

  if (!layout) return null;

  return (
    <SurfaceShellSystemRender
      config={config}
      layerIndex={layerIndex}
      shellMaterialRef={shellMaterialRef}
      wireMaterialRef={wireMaterialRef}
      shellMeshRef={shellMeshRef}
      wireMeshRef={wireMeshRef}
    />
  );
};
