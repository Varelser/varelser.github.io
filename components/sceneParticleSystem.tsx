import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Vector3 } from 'three';
import type { InstancedMesh } from 'three';
import type { ParticleConfig } from '../types';
import { getInterLayerCollidersForLayer, MAX_INTER_LAYER_COLLIDERS } from '../lib/appStateCollision';
import type { AuxMode, ParticleData } from './particleData';
import { getLayerRuntimeParticleVisualSnapshot } from '../lib/sceneRenderRoutingRuntime';
import { generateParticleDataAsync } from './sceneParticleSystemWorker';
import { buildParticleGeometryKey } from './sceneParticleSystemShared';
import { createParticleUniforms } from './sceneParticleSystemUniforms';
import { renderParticleSystemContent } from './sceneParticleSystemRender';
import { createParticleGhostMaterials } from './sceneParticleSystemGhostMats';
import { updateParticleSystemFrame, type ParticleSystemCollider, type ParticleSystemAudioRef } from './sceneParticleSystemRuntime';
import { createAudioRouteStateMap } from '../lib/audioReactiveRuntime';
import { useProfiledFrame } from '../lib/runtimeProfiling';

export const ParticleSystem: React.FC<{
  config: ParticleConfig;
  layerIndex: 1 | 2 | 3 | 4;
  isAux?: boolean;
  auxMode?: AuxMode;
  audioRef: ParticleSystemAudioRef;
  isPlaying: boolean;
  contactAmount: number;
}> = React.memo(({ config, layerIndex, isAux = false, auxMode = 'aux', audioRef, isPlaying, contactAmount }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const windRef = useRef(new Vector3());
  const spinRef = useRef(new Vector3());
  const prevAudioEnabledRef = useRef<boolean>(config.audioEnabled);
  const prevLayerKeyRef = useRef<string>('');
  const audioRouteStateRef = useRef(createAudioRouteStateMap());

  const interLayerColliders = useMemo<ParticleSystemCollider[]>(() => {
    if (layerIndex === 4 || isAux) {
      return Array.from({ length: MAX_INTER_LAYER_COLLIDERS }, () => ({ center: new Vector3(), radius: 0 }));
    }
    const colliders = getInterLayerCollidersForLayer(config, layerIndex);
    return Array.from({ length: MAX_INTER_LAYER_COLLIDERS }, (_, index) => colliders[index] ?? { center: new Vector3(), radius: 0 });
  }, [config, isAux, layerIndex]);

  const activeInterLayerColliderCount = useMemo(
    () => interLayerColliders.reduce((count, collider) => count + (collider.radius > 0 ? 1 : 0), 0),
    [interLayerColliders],
  );

  const geometryKey = useMemo(
    () => buildParticleGeometryKey(config, layerIndex, isAux, auxMode),
    [config, layerIndex, isAux, auxMode],
  );
  const generationConfig = useMemo(
    // Keep geometry generation tied to geometry-affecting inputs so visual-only edits do not churn buffers.
    () => config,
    [geometryKey, layerIndex, isAux, auxMode],
  );

  const [data, setData] = useState<ParticleData | null>(null);
  useEffect(() => {
    let cancelled = false;
    generateParticleDataAsync(generationConfig, layerIndex, isAux, auxMode).then((nextData) => {
      if (!cancelled) setData(nextData);
    });
    return () => {
      cancelled = true;
    };
  }, [auxMode, generationConfig, geometryKey, isAux, layerIndex]);

  const uniforms = useMemo(
    () => createParticleUniforms(config, isAux),
    [config.contrast, config.opacity, config.particleGlow, config.particleSoftness, config.particleColor, isAux],
  );

  const maxGhost = 8;
  const ghostMats = useMemo(
    () => createParticleGhostMaterials({ config, layerIndex, isAux, uniforms, maxGhost }),
    [config, layerIndex, isAux, uniforms],
  );
  const profilingId = useMemo(() => (
    `scene:particles-layer${layerIndex}${isAux ? `-${auxMode}` : '-core'}`
  ), [auxMode, isAux, layerIndex]);

  useProfiledFrame(profilingId, config.executionDiagnosticsEnabled, (state, delta) => {
    updateParticleSystemFrame({
      config,
      layerIndex,
      isAux,
      auxMode,
      audioRef,
      isPlaying,
      contactAmount,
      state,
      delta,
      meshRef,
      windRef,
      spinRef,
      prevAudioEnabledRef,
      audioRouteStateRef,
      prevLayerKeyRef,
      interLayerColliders,
      activeInterLayerColliderCount,
      ghostMats,
      maxGhost,
    });
  });

  if (!data) return null;

  const geomMode3D = layerIndex === 2 || layerIndex === 3
    ? getLayerRuntimeParticleVisualSnapshot(config, layerIndex).geomMode3D
    : 'billboard';

  return renderParticleSystemContent({
    config,
    layerIndex,
    isAux,
    auxMode,
    data,
    geometryKey,
    geomMode3D,
    meshRef,
    uniforms,
    ghostMats,
    contactAmount,
    isPlaying,
    audioRef,
  });
});
ParticleSystem.displayName = 'ParticleSystem';
