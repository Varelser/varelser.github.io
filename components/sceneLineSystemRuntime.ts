import type React from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, LineSegments, Mesh, ShaderMaterial } from 'three';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { createAudioRouteStateMap, evaluateAudioRoutes, resolveEvaluatedAudioTargetValue } from '../lib/audioReactiveRuntime';
import { buildLineData, getLineRefreshInterval, getResolvedLineProfile, LineSystemProps, syncBrushLineGeometry, syncClassicLineGeometry, updateLineMaterial } from './sceneLineSystemShared';
import { getLayerRuntimeConnectionStyle } from '../lib/sceneRenderRoutingRuntime';

export function useLineSystemRuntime(
  props: LineSystemProps,
  lineRef: React.RefObject<LineSegments | null>,
  brushRef: React.RefObject<Mesh | null>,
  lineGeometryRef: React.RefObject<BufferGeometry | null>,
  brushGeometryRef: React.RefObject<BufferGeometry | null>,
) {
  const { config, layerIndex, particleData, uniforms, globalRadius, connectionDistance, connectionOpacity, contactAmount, isPlaying, audioRef } = props;
  const layerConnectionStyle = getLayerRuntimeConnectionStyle(config, layerIndex);
  const lineProfile = useMemo(() => getResolvedLineProfile(config, layerIndex), [config, layerIndex]);
  const refreshAccumulatorRef = useRef(0);
  const audioRouteStateRef = useRef(createAudioRouteStateMap());
  const sampleTimeRef = useRef(0);
  const effectiveDriveRef = useRef({
    connectionDistance,
    connectionOpacity,
    width: lineProfile.widthMul,
    shimmer: lineProfile.shimmerMul,
    flickerSpeed: lineProfile.flickerMul,
    velocityGlow: lineProfile.glowMul,
      velocityAlpha: lineProfile.alphaMul,
      burstPulse: lineProfile.pulseMul,
  });
  const syncLineData = useCallback((sampleTime: number) => {
    const lineData = buildLineData(
      config,
      layerIndex,
      particleData,
      globalRadius,
      effectiveDriveRef.current.connectionDistance,
      sampleTime,
      layerConnectionStyle,
    );
    if (lineGeometryRef.current) {
      syncClassicLineGeometry(lineGeometryRef.current, lineData?.classic ?? null);
    }
    if (brushGeometryRef.current) {
      syncBrushLineGeometry(brushGeometryRef.current, lineData?.brush ?? null);
    }
  }, [brushGeometryRef, config, globalRadius, layerConnectionStyle, layerIndex, lineGeometryRef, particleData]);

  useEffect(() => {
    effectiveDriveRef.current = {
      connectionDistance,
      connectionOpacity,
      width: lineProfile.widthMul,
      shimmer: lineProfile.shimmerMul,
      flickerSpeed: lineProfile.flickerMul,
      velocityGlow: lineProfile.glowMul,
      velocityAlpha: lineProfile.alphaMul,
      burstPulse: lineProfile.pulseMul,
    };
    sampleTimeRef.current = uniforms.uTime.value;
    syncLineData(sampleTimeRef.current);
  }, [connectionDistance, connectionOpacity, lineProfile, syncLineData, uniforms.uTime.value]);

  useFrame((_state, delta) => {
    const evaluatedAudioRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    effectiveDriveRef.current = {
      connectionDistance: resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'line.connectDistance', connectionDistance, { additiveScale: Math.max(8, connectionDistance * 0.35), clampMin: 4, clampMax: Math.max(12, connectionDistance * 4) }),
      connectionOpacity: resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'line.opacity', connectionOpacity, { additiveScale: 0.35, clampMin: 0, clampMax: 1 }),
      width: resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'line.width', lineProfile.widthMul, { additiveScale: 0.35, clampMin: 0.1, clampMax: 4 }),
      shimmer: resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'line.shimmer', lineProfile.shimmerMul, { additiveScale: 0.4, clampMin: 0, clampMax: 4 }),
      flickerSpeed: resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'line.flickerSpeed', lineProfile.flickerMul, { additiveScale: 0.45, clampMin: 0.05, clampMax: 6 }),
      velocityGlow: resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'line.velocityGlow', lineProfile.glowMul, { additiveScale: 0.3, clampMin: 0, clampMax: 4 }),
      velocityAlpha: resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'line.velocityAlpha', lineProfile.alphaMul, { additiveScale: 0.3, clampMin: 0, clampMax: 4 }),
      burstPulse: resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'line.burstPulse', lineProfile.pulseMul, { additiveScale: 0.45, clampMin: 0, clampMax: 4 }),
    };

    if (isPlaying) {
      refreshAccumulatorRef.current += delta;
      if (refreshAccumulatorRef.current >= getLineRefreshInterval(config.renderQuality, particleData.count)) {
        refreshAccumulatorRef.current = 0;
        sampleTimeRef.current = uniforms.uTime.value;
        syncLineData(sampleTimeRef.current);
      }
    }

    updateLineMaterial(
      lineRef.current?.material as ShaderMaterial | undefined,
      config,
      layerIndex,
      uniforms,
      effectiveDriveRef.current.connectionDistance,
      effectiveDriveRef.current.connectionOpacity,
      contactAmount,
      lineProfile,
      {
        width: effectiveDriveRef.current.width,
        shimmer: effectiveDriveRef.current.shimmer,
        flickerSpeed: effectiveDriveRef.current.flickerSpeed,
        velocityGlow: effectiveDriveRef.current.velocityGlow,
        velocityAlpha: effectiveDriveRef.current.velocityAlpha,
        burstPulse: effectiveDriveRef.current.burstPulse,
      },
    );
    updateLineMaterial(
      brushRef.current?.material as ShaderMaterial | undefined,
      config,
      layerIndex,
      uniforms,
      effectiveDriveRef.current.connectionDistance,
      effectiveDriveRef.current.connectionOpacity,
      contactAmount,
      lineProfile,
      {
        width: effectiveDriveRef.current.width,
        shimmer: effectiveDriveRef.current.shimmer,
        flickerSpeed: effectiveDriveRef.current.flickerSpeed,
        velocityGlow: effectiveDriveRef.current.velocityGlow,
        velocityAlpha: effectiveDriveRef.current.velocityAlpha,
        burstPulse: effectiveDriveRef.current.burstPulse,
      },
    );
  });

  return { layerConnectionStyle };
}
