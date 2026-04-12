import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { Color } from 'three';
import type { ShaderMaterial } from 'three';
import {
  getVolumetricFieldSettings,
  getVolumetricMaterialStyleIndex,
  getVolumetricProfile,
  type VolumetricFieldSystemProps,
} from './sceneVolumetricFieldSystemShared';

export function useVolumetricFieldRuntime(
  props: VolumetricFieldSystemProps,
  materialRef: RefObject<ShaderMaterial | null>,
) {
  const { config, layerIndex, audioRef, isPlaying } = props;
  const settings = useMemo(() => getVolumetricFieldSettings(config, layerIndex), [config, layerIndex]);
  const profile = useMemo(() => getVolumetricProfile(settings.mode, settings.source), [settings.mode, settings.source]);
  const color = useMemo(() => new Color(settings.color), [settings.color]);
  const tint = useMemo(() => new Color(profile.tint), [profile.tint]);
  const materialStyleIndex = useMemo(() => getVolumetricMaterialStyleIndex(settings.materialStyle), [settings.materialStyle]);
  const scaleBase = config.sphereRadius * settings.radiusScale * (0.9 + settings.scale * 0.6);
  const depthScale = scaleBase * (0.78 + settings.depth * 0.42);

  useFrame(({ clock }) => {
    const mat = materialRef.current;
    if (!mat) return;
    const t = clock.getElapsedTime();
    const audioMix = config.audioEnabled
      ? (audioRef.current.bass * 0.5 + audioRef.current.treble * 0.25 + audioRef.current.pulse * 0.25) * settings.audioReactive
      : 0;
    mat.uniforms.uTime.value = t * (isPlaying ? 1 : 0.2);
    mat.uniforms.uAudio.value = audioMix;
    mat.uniforms.uOpacity.value = settings.opacity;
    mat.uniforms.uDensity.value = settings.density * (1.0 + audioMix * 0.18);
    mat.uniforms.uGlow.value = settings.glow + audioMix * 0.1;
    mat.uniforms.uAnisotropy.value = Math.max(0, settings.anisotropy + profile.anisotropy);
  });

  return {
    settings,
    profile,
    color,
    tint,
    materialStyleIndex,
    scaleBase,
    depthScale,
  };
}
