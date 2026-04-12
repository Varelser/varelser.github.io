import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending } from 'three';
import type { InstancedMesh, MeshStandardMaterial } from 'three';
import type { ParticleConfig } from '../types';
import { buildCrystalLayout, createCrystalGeometry, getCrystalLayoutDeps, getCrystalProfile, getCrystalSettings } from './sceneCrystalAggregateSystemShared';
import { updateCrystalAggregateFrame } from './sceneCrystalAggregateSystemRuntime';
import { createAudioRouteStateMap } from '../lib/audioReactiveRuntime';

export const CrystalAggregateSystem: React.FC<{
  config: ParticleConfig;
  layerIndex: 2 | 3;
  audioRef: React.MutableRefObject<{ bass: number; treble: number; pulse: number; bandA: number; bandB: number }>;
  isPlaying: boolean;
}> = ({ config, layerIndex, audioRef, isPlaying }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const crystalSettings = getCrystalSettings(config, layerIndex);
  const mode = layerIndex === 2 ? config.layer2Type : config.layer3Type;
  const profile = useMemo(() => getCrystalProfile(mode, crystalSettings.source, crystalSettings.materialStyle), [mode, crystalSettings.materialStyle, crystalSettings.source]);
  const layout = useMemo(() => buildCrystalLayout(config, layerIndex), getCrystalLayoutDeps(config, layerIndex));
  const geometry = useMemo(() => createCrystalGeometry(profile.geometry), [profile.geometry]);
  const audioRouteStateRef = useRef(createAudioRouteStateMap());

  React.useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material || !layout) return;
    updateCrystalAggregateFrame({
      audioRef,
      config,
      isPlaying,
      layerIndex,
      layout,
      material,
      mesh,
      time: clock.getElapsedTime(),
      audioRouteStateRef,
    });
  });

  if (!layout) return null;

  return (
    <instancedMesh ref={meshRef as React.Ref<any>} args={[geometry, undefined, layout.instanceCount]} renderOrder={2}>
      <meshStandardMaterial
        ref={materialRef as React.Ref<any>}
        transparent={true}
        depthWrite={false}
        vertexColors={true}
        blending={AdditiveBlending}
      />
    </instancedMesh>
  );
};
