import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { MathUtils } from 'three';
import type { Mesh } from 'three';
import { createAudioRouteStateMap, evaluateAudioRoutes } from '../lib/audioReactiveRuntime';
import { resolveSurfaceAudioDrives } from '../lib/audioReactiveTargetSets';
import {
  createHybridMembraneUniforms,
  getHybridMembraneAudioDrive,
  getHybridMembraneProfile,
  getHybridMembraneSettings,
  getHybridMembraneSize,
  syncHybridMembraneUniforms,
  type HybridMembraneSystemProps,
} from './sceneHybridMembraneSystemShared';

export function useHybridMembraneRuntime(
  props: HybridMembraneSystemProps,
  meshRef: RefObject<Mesh | null>,
) {
  const { config, layerIndex, audioRef, isPlaying } = props;
  const audioRouteStateRef = useRef(createAudioRouteStateMap());
  const settings = useMemo(() => getHybridMembraneSettings(config, layerIndex), [config, layerIndex]);
  const { influence, profile } = useMemo(
    () => getHybridMembraneProfile(settings.mode, settings.source),
    [settings.mode, settings.source],
  );
  const uniforms = useMemo(
    () => createHybridMembraneUniforms(settings, profile, influence),
    [influence, profile, settings],
  );

  useEffect(() => {
    syncHybridMembraneUniforms(uniforms, settings, profile, influence);
  }, [influence, profile, settings, uniforms]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const evaluatedAudioRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    const surfaceDrives = resolveSurfaceAudioDrives(evaluatedAudioRoutes, 'membrane');
    const baseAudioDrive = getHybridMembraneAudioDrive(audioRef, isPlaying);
    const displacementDrive = Math.max(0, surfaceDrives.displacement);
    const reliefDrive = Math.max(0, surfaceDrives.relief);
    const opacityDrive = surfaceDrives.opacity;
    const sliceDepthDrive = surfaceDrives.sliceDepth;
    const wireframeDrive = Math.max(0, surfaceDrives.wireframe);

    uniforms.uTime.value = elapsed;
    uniforms.uAudio.value = baseAudioDrive * (1 + displacementDrive * 0.45);
    uniforms.uOpacity.value = MathUtils.clamp(Math.max(0.08, settings.opacity ?? 0.55) + opacityDrive * 0.24, 0.04, 1.35);
    uniforms.uSag.value = Math.max(0, profile.sag + displacementDrive * 0.16 + sliceDepthDrive * 0.08);
    uniforms.uSpring.value = Math.max(0, profile.spring + reliefDrive * 0.16 + wireframeDrive * 0.1);
    uniforms.uCreep.value = Math.max(0, profile.creep + reliefDrive * 0.12);
    uniforms.uPocket.value = Math.max(0, profile.pocket + sliceDepthDrive * 0.1);
    uniforms.uTwist.value = Math.max(0, profile.twist + sliceDepthDrive * 0.12 + wireframeDrive * 0.08);
    uniforms.uVeil.value = Math.max(0, profile.veil + wireframeDrive * 0.14 + reliefDrive * 0.08);
    if (meshRef.current) {
      meshRef.current.rotation.x = influence.tiltX * 0.6 + reliefDrive * 0.06;
      meshRef.current.rotation.y = influence.tiltY * 0.7 + Math.sin(elapsed * 0.3) * (0.04 + profile.twist * 0.06) + sliceDepthDrive * 0.05;
    }
  });

  return {
    uniforms,
    size: getHybridMembraneSize(config, settings),
  };
}
