import { useEffect, useMemo } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, LineSegments, ShaderMaterial } from 'three';
import {
  buildTrailLayout,
  ensureErosionTrailGeometry,
  type ErosionTrailSystemProps,
  getErosionProfile,
  getErosionTrailLayoutDeps,
  getLayerErosionTrailSettings,
  updateErosionTrailGeometry,
  updateErosionTrailMaterial,
} from './sceneErosionTrailSystemShared';

export function useErosionTrailRuntime(
  props: ErosionTrailSystemProps,
  lineRef: RefObject<LineSegments | null>,
  geometryRef: MutableRefObject<BufferGeometry | null>,
  materialRef: RefObject<ShaderMaterial | null>,
) {
  const { config, layerIndex, audioRef, isPlaying } = props;
  const layout = useMemo(() => buildTrailLayout(config, layerIndex), getErosionTrailLayoutDeps(config, layerIndex));

  useEffect(() => {
    geometryRef.current?.dispose();
    geometryRef.current = null;
  }, [layout?.trailCount, layout?.segmentsPerTrail]);

  useEffect(() => () => {
    geometryRef.current?.dispose();
    geometryRef.current = null;
  }, []);

  useFrame(({ clock }) => {
    const line = lineRef.current;
    const material = materialRef.current;
    if (!line || !material || !layout) return;

    const settings = getLayerErosionTrailSettings(config, layerIndex);
    const profile = getErosionProfile(config, layerIndex);
    const globalRadius = config.sphereRadius * settings.radiusScale;
    const pulse = config.audioEnabled ? audioRef.current.pulse * config.audioBurstScale : 0;
    const bass = config.audioEnabled ? audioRef.current.bass * config.audioBeatScale : 0;
    const treble = config.audioEnabled ? audioRef.current.treble * config.audioTrebleMotionScale : 0;
    const audioBoost = isPlaying ? (pulse + bass * 0.7 + treble * 0.25) * settings.audioReactive : 0;
    const time = clock.getElapsedTime();

    const geometry = ensureErosionTrailGeometry(line, geometryRef, layout);
    updateErosionTrailGeometry({ geometry, layout, config, layerIndex, settings, profile, globalRadius, audioBoost, time });
    updateErosionTrailMaterial(material, settings, profile, pulse, bass, time);
  });

  return { layout };
}
