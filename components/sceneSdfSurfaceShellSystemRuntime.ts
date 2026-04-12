import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { Matrix4 } from 'three';
import type { Mesh } from 'three';
import {
  createSdfSurfaceShellUniforms,
  getSdfSurfaceShellProfile,
  getSdfSurfaceShellSettings,
  type SdfSurfaceShellSystemProps,
} from './sceneSdfSurfaceShellSystemShared';

export function useSdfSurfaceShellRuntime(
  props: SdfSurfaceShellSystemProps,
  meshRef: RefObject<Mesh | null>,
) {
  const { config, layerIndex, audioRef, isPlaying } = props;
  const settings = useMemo(() => getSdfSurfaceShellSettings(config, layerIndex), [config, layerIndex]);
  const profile = useMemo(() => getSdfSurfaceShellProfile(settings.mode, settings.source), [settings.mode, settings.source]);
  const uniforms = useMemo(() => createSdfSurfaceShellUniforms(settings, profile), [settings, profile]);
  const radius = useMemo(
    () => config.sphereRadius * Math.max(0.5, settings.radiusScale ?? 1) * 1.2,
    [config.sphereRadius, settings.radiusScale],
  );

  useFrame(({ clock, camera }) => {
    const bass = audioRef.current?.bass ?? 0;
    const treble = audioRef.current?.treble ?? 0;
    const pulse = audioRef.current?.pulse ?? 0;
    const audioDrive = isPlaying ? bass * 0.55 + treble * 0.25 + pulse * 0.2 : 0;
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uAudio.value = audioDrive;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0018 + profile.orbit * 0.003 + audioDrive * 0.0012;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.17) * 0.16 + profile.veil * 0.18;
      const inverse = new Matrix4().copy(meshRef.current.matrixWorld).invert();
      uniforms.uLocalCamera.value.copy(camera.position).applyMatrix4(inverse);
    }
  });

  return { uniforms, radius };
}
