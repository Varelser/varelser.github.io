import React, { useMemo, useRef } from 'react';
import { BufferGeometry, MeshBasicMaterial, ShaderMaterial } from 'three';
import type { ParticleConfig } from '../types';
import { MembraneSystemRender } from './sceneMembraneSystemRender';
import {
  buildMembraneLayout,
  getLayoutDeps,
  type MembraneAudioState,
} from './sceneMembraneSystemShared';
import { useMembraneGeometryBindings, useMembraneRuntime } from './sceneMembraneSystemRuntime';

export const MembraneSystem: React.FC<{
  config: ParticleConfig;
  layerIndex: 2 | 3;
  audioRef: React.MutableRefObject<MembraneAudioState>;
  isPlaying: boolean;
}> = ({ config, layerIndex, audioRef, isPlaying }) => {
  const surfaceMaterialRef = useRef<ShaderMaterial>(null);
  const wireMaterialRef = useRef<MeshBasicMaterial>(null);
  const frameCounterRef = useRef(0);
  const layout = useMemo(() => buildMembraneLayout(config, layerIndex), getLayoutDeps(config, layerIndex));
  const geometry = useMemo(() => new BufferGeometry(), []);

  useMembraneGeometryBindings(geometry, layout);
  useMembraneRuntime({
    config,
    layerIndex,
    audioRef,
    isPlaying,
    layout,
    geometry,
    surfaceMaterialRef,
    wireMaterialRef,
    frameCounterRef,
  });

  if (!layout) return null;

  return (
    <MembraneSystemRender
      config={config}
      layerIndex={layerIndex}
      geometry={geometry}
      surfaceMaterialRef={surfaceMaterialRef}
      wireMaterialRef={wireMaterialRef}
    />
  );
};
