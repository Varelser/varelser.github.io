import React from 'react';
import { createAudioRouteStateMap, evaluateAudioRoutes, resolveEvaluatedAudioTargetValue } from '../lib/audioReactiveRuntime';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, MathUtils } from 'three';
import type { Group, Mesh, ShaderMaterial } from 'three';
import { withCrossFamilyFogProfile, withSourceAwareFogProfile } from '../lib/sourceAwareShaping';
import { getFogProfile } from './sceneVolumeFogSystemProfiles';
import { getFogSliceTransform } from './sceneVolumeFogSystemTransforms';
import { applyVolumeFogMaterialUniforms, getVolumeFogPlaneScale } from './sceneVolumeFogSystemMaterial';
import { getLayerRuntimeFogSnapshot } from '../lib/sceneRenderRoutingRuntime';
import type { VolumeFogSystemProps } from './sceneVolumeFogSystemTypes';
import { getShaderMaterialStyleIndex } from '../lib/materialStyle';

export type VolumeFogRuntimeState = {
  rootRef: React.MutableRefObject<Group | null>;
  materialsRef: React.MutableRefObject<ShaderMaterial[]>;
  sliceMeshRefs: React.MutableRefObject<(Mesh | null)[]>;
  layerMode: VolumeFogSystemProps['config']['layer2Type'];
  layerSource: VolumeFogSystemProps['config']['layer2Source'];
  profile: ReturnType<typeof getFogProfile>;
  sharedColor: Color;
  fogOpacity: number;
  fogDensity: number;
  fogDepth: number;
  fogScale: number;
  fogDrift: number;
  fogGlow: number;
  fogAnisotropy: number;
  materialStyleIndex: number;
  sliceCount: number;
  sliceOffsets: number[];
  planeScale: number;
  globalRadius: number;
};

export function useVolumeFogRuntime({ config, layerIndex, audioRef, isPlaying }: VolumeFogSystemProps): VolumeFogRuntimeState {
  const { camera } = useThree();
  const rootRef = React.useRef<Group>(null);
  const audioRouteStateRef = React.useRef(createAudioRouteStateMap());
  const materialsRef = React.useRef<ShaderMaterial[]>([]);
  const sliceMeshRefs = React.useRef<(Mesh | null)[]>([]);

  const fogRuntime = getLayerRuntimeFogSnapshot(config, layerIndex);
  const layerMode = fogRuntime.mode;
  const layerColor = fogRuntime.color;
  const initialEvaluatedAudioRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
  const fogOpacity = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'fog.opacity', fogRuntime.opacity, { additiveScale: 0.25, clampMin: 0, clampMax: 1.5 });
  const fogDensity = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'fog.density', fogRuntime.density, { additiveScale: 0.35, clampMin: 0.01, clampMax: 3 });
  const fogDepth = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'fog.depth', fogRuntime.depth, { additiveScale: fogRuntime.depth * 0.3, clampMin: 1, clampMax: Math.max(8, fogRuntime.depth * 4) });
  const fogScale = fogRuntime.scale;
  const fogDrift = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'fog.drift', fogRuntime.drift, { additiveScale: 0.25, clampMin: 0, clampMax: 4 });
  const fogSlices = fogRuntime.slices;
  const fogGlow = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'fog.glow', fogRuntime.glow, { additiveScale: 0.3, clampMin: 0, clampMax: 3 });
  const fogAnisotropy = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'fog.anisotropy', fogRuntime.anisotropy, { additiveScale: 0.18, clampMin: 0, clampMax: 1.5 });
  const fogAudioReactive = fogRuntime.audioReactive;
  const materialStyle = fogRuntime.materialStyle;
  const materialStyleIndex = getShaderMaterialStyleIndex(materialStyle);
  const layerSource = fogRuntime.source;
  const profile = React.useMemo(
    () => withCrossFamilyFogProfile(withSourceAwareFogProfile(getFogProfile(layerMode), layerSource), layerMode, layerSource),
    [layerMode, layerSource],
  );
  const globalRadius = config.sphereRadius * fogRuntime.radiusScale;

  const sliceCount = Math.max(4, Math.min(48, Math.round(fogSlices * profile.sliceMul)));
  const sliceOffsets = React.useMemo(() => {
    const depth = fogDepth * profile.depthMul;
    return Array.from({ length: sliceCount }, (_, index) => {
      if (sliceCount === 1) return 0;
      const t = index / (sliceCount - 1);
      return MathUtils.lerp(-depth * 0.5, depth * 0.5, t);
    });
  }, [sliceCount, fogDepth, profile.depthMul]);

  const sharedColor = React.useMemo(() => new Color(layerColor), [layerColor]);
  const planeScale = getVolumeFogPlaneScale(config, fogDepth);

  React.useEffect(() => {
    materialsRef.current.forEach((mat) => mat.dispose());
    materialsRef.current = [];
  }, [sliceCount, layerMode, layerSource]);

  useFrame(({ clock }) => {
    if (!rootRef.current) return;
    rootRef.current.quaternion.copy(camera.quaternion);
    const t = clock.getElapsedTime();
    const evaluatedAudioRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    const dynamicFogOpacity = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'fog.opacity', fogRuntime.opacity, { additiveScale: 0.25, clampMin: 0, clampMax: 1.5 });
    const dynamicFogDensity = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'fog.density', fogRuntime.density, { additiveScale: 0.35, clampMin: 0.01, clampMax: 3 });
    const dynamicFogDrift = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'fog.drift', fogRuntime.drift, { additiveScale: 0.25, clampMin: 0, clampMax: 4 });
    const dynamicFogGlow = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'fog.glow', fogRuntime.glow, { additiveScale: 0.3, clampMin: 0, clampMax: 3 });
    const dynamicFogAnisotropy = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'fog.anisotropy', fogRuntime.anisotropy, { additiveScale: 0.18, clampMin: 0, clampMax: 1.5 });
    const audio = config.audioEnabled
      ? (audioRef.current.pulse * 0.65 + audioRef.current.bass * 0.35) * fogAudioReactive
      : 0;

    materialsRef.current.forEach((material, index) => {
      applyVolumeFogMaterialUniforms(material, {
        sharedColor,
        fogOpacity: dynamicFogOpacity,
        fogDensity: dynamicFogDensity,
        fogScale,
        fogDrift: dynamicFogDrift,
        fogGlow: dynamicFogGlow,
        fogAnisotropy: dynamicFogAnisotropy,
        materialStyleIndex,
        sliceCount,
        profile,
        audio,
        time: t * (isPlaying ? 1 : 0.1),
        sliceIndex: index,
      });
    });

    sliceMeshRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const transform = getFogSliceTransform(
        layerMode,
        layerSource,
        index,
        sliceCount,
        sliceOffsets[index] ?? 0,
        planeScale * profile.planeScaleMul,
        globalRadius,
        t * (isPlaying ? 1 : 0.25),
      );
      mesh.position.copy(transform.position);
      mesh.rotation.copy(transform.rotation);
      mesh.scale.copy(transform.scale);
    });
  });

  return {
    rootRef,
    materialsRef,
    sliceMeshRefs,
    layerMode,
    layerSource,
    profile,
    sharedColor,
    fogOpacity,
    fogDensity,
    fogDepth,
    fogScale,
    fogDrift,
    fogGlow,
    fogAnisotropy,
    materialStyleIndex,
    sliceCount,
    sliceOffsets,
    planeScale,
    globalRadius,
  };
}
