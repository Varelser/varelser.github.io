import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { MathUtils } from 'three';
import type { Mesh } from 'three';
import { createAudioRouteStateMap, evaluateAudioRoutes } from '../lib/audioReactiveRuntime';
import { resolveSurfaceAudioDrives } from '../lib/audioReactiveTargetSets';
import {
  createHybridSurfacePatchUniforms,
  getHybridSurfacePatchAudioDrive,
  getHybridSurfacePatchProfile,
  getHybridSurfacePatchSettings,
  getHybridSurfacePatchSize,
  syncHybridSurfacePatchUniforms,
  type HybridSurfacePatchSystemProps,
} from './sceneHybridSurfacePatchSystemShared';

export function useHybridSurfacePatchRuntime(
  props: HybridSurfacePatchSystemProps,
  meshRef: RefObject<Mesh | null>,
) {
  const { config, layerIndex, audioRef, isPlaying } = props;
  const audioRouteStateRef = useRef(createAudioRouteStateMap());
  const settings = useMemo(() => getHybridSurfacePatchSettings(config, layerIndex), [config, layerIndex]);
  const { influence, profile } = useMemo(
    () => getHybridSurfacePatchProfile(settings.mode, settings.source),
    [settings.mode, settings.source],
  );
  const uniforms = useMemo(
    () => createHybridSurfacePatchUniforms(settings, profile, influence),
    [influence, profile, settings],
  );

  useEffect(() => {
    syncHybridSurfacePatchUniforms(uniforms, settings, profile, influence);
  }, [influence, profile, settings, uniforms]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const evaluatedAudioRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    const surfaceDrives = resolveSurfaceAudioDrives(evaluatedAudioRoutes, 'patch');
    const baseAudioDrive = getHybridSurfacePatchAudioDrive(audioRef, isPlaying);
    const displacementDrive = Math.max(0, surfaceDrives.displacement);
    const reliefDrive = Math.max(0, surfaceDrives.relief);
    const opacityDrive = surfaceDrives.opacity;
    const sliceDepthDrive = surfaceDrives.sliceDepth;
    const wireframeDrive = Math.max(0, surfaceDrives.wireframe);

    uniforms.uTime.value = elapsed;
    uniforms.uAudio.value = baseAudioDrive * (1 + displacementDrive * 0.45);
    uniforms.uAudioReactive.value = Math.max(0, settings.audioReactive + displacementDrive * 0.6);
    uniforms.uOpacity.value = MathUtils.clamp(Math.max(0.08, settings.opacity ?? 0.55) + opacityDrive * 0.24, 0.04, 1.35);
    uniforms.uContour.value = profile.contour + reliefDrive * 0.18;
    uniforms.uCrease.value = profile.crease + reliefDrive * 0.16 + wireframeDrive * 0.1;
    uniforms.uGlow.value = profile.glow + reliefDrive * 0.2 + wireframeDrive * 0.16;
    uniforms.uDrift.value = Math.max(0, profile.drift + sliceDepthDrive * 0.1);
    uniforms.uVeil.value = Math.max(0, profile.veil + sliceDepthDrive * 0.08);

    if (meshRef.current) {
      meshRef.current.rotation.x = influence.tiltX + reliefDrive * 0.08;
      meshRef.current.rotation.y = influence.tiltY + Math.sin(elapsed * 0.18) * (0.05 + profile.drift * 0.06) + sliceDepthDrive * 0.04;
    }
  });

  return {
    uniforms,
    size: getHybridSurfacePatchSize(config, settings),
  };
}
