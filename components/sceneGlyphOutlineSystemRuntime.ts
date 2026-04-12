import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { Color, LineBasicMaterial, LineSegments, MathUtils } from 'three';
import {
  buildGlyphOutlinePositions,
  getResolvedGlyphOutlineProfile,
  type GlyphOutlineSystemProps,
} from './sceneGlyphOutlineSystemShared';

export function useGlyphOutlineRuntime(
  props: GlyphOutlineSystemProps,
  lineRef: RefObject<LineSegments | null>,
) {
  const { config, layerIndex, audioRef } = props;
  const { runtime, profile } = useMemo(() => getResolvedGlyphOutlineProfile(config, layerIndex), [config, layerIndex]);
  const positions = useMemo(() => buildGlyphOutlinePositions(config, layerIndex, profile), [config, layerIndex, profile]);
  const color = runtime.color;
  const opacity = runtime.opacity;
  const width = runtime.width;
  const audioReactive = runtime.audioReactive;
  const materialStyle = runtime.materialStyle;

  useFrame(({ clock }) => {
    const line = lineRef.current;
    if (!line) return;
    const material = line.material as LineBasicMaterial;
    const t = clock.getElapsedTime();
    const pulse = config.audioEnabled ? audioRef.current.pulse * config.audioBurstScale : 0;
    const bass = config.audioEnabled ? audioRef.current.bass * config.audioBeatScale : 0;
    const shimmer = 0.66 + Math.sin(t * (1.2 + bass * 0.8) * profile.shimmerMul) * 0.12;
    const styleBoost = materialStyle === 'hologram' ? 1.2 : materialStyle === 'chrome' ? 1.05 : materialStyle === 'glass' ? 0.92 : materialStyle === 'ink' ? 0.9 : materialStyle === 'paper' ? 0.96 : materialStyle === 'stipple' ? 0.94 : 1;
    material.opacity = MathUtils.clamp(opacity * profile.opacityMul * (1 + pulse * audioReactive * 0.8) * shimmer * styleBoost, 0.02, 1);
    if (materialStyle === 'hologram') {
      material.color.set(color).lerp(new Color('#66f5ff'), 0.34 + pulse * 0.22 + profile.tintMix * 0.18);
    } else if (materialStyle === 'chrome') {
      material.color.set(color).lerp(new Color('#ffffff'), 0.28 + bass * 0.2 + profile.tintMix * 0.12);
    } else if (materialStyle === 'glass') {
      material.color.set(color).lerp(new Color('#dff8ff'), 0.22 + profile.tintMix * 0.08);
    } else if (materialStyle === 'halftone') {
      material.color.set(color).multiplyScalar(0.88 + pulse * 0.14);
    } else if (materialStyle === 'ink') {
      material.color.set(color).lerp(new Color('#111827'), 0.56);
    } else if (materialStyle === 'paper') {
      material.color.set(color).lerp(new Color('#f5efe0'), 0.42);
    } else if (materialStyle === 'stipple') {
      material.color.set(color).multiplyScalar(0.68).lerp(new Color('#f3f4f6'), 0.08);
    } else {
      material.color.set(color);
    }
    line.position.x = Math.sin(t * 0.24 + layerIndex) * profile.drift * 0.4;
    line.position.y = Math.sin(t * 0.35 + layerIndex * 0.7) * profile.drift * 0.6;
    line.rotation.z = Math.sin(t * 0.18 + layerIndex * 0.4) * profile.shear * 0.22;
    const scale = 1 + pulse * 0.012 * profile.motionMul;
    line.scale.set(scale, scale, 1);
  });

  return {
    profile,
    positions,
    color,
    opacity,
    width,
    materialStyle,
  };
}
