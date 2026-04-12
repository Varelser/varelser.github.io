import React from 'react';
import { useThree } from '@react-three/fiber';
import { Color, MathUtils, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { ParticleConfig } from '../types';
import { getConfigPerformanceScore } from '../lib/performanceHints';
import { useProfiledFrame } from '../lib/runtimeProfiling';
import { createAudioRouteStateMap, evaluateAudioRoutes, resolveEvaluatedAudioTargetValue } from '../lib/audioReactiveRuntime';
import { getBurstDriveEnergy } from './sceneBurstDrive';
import type { SceneAudioRef } from './AppSceneTypes';

function getQualityDprRange(quality: ParticleConfig['renderQuality']) {
  if (quality === 'draft') return [1, 1.25] as [number, number];
  if (quality === 'cinematic') return [1, 2] as [number, number];
  return [1, 1.5] as [number, number];
}

export function getAdaptiveDprRange(config: ParticleConfig) {
  const [minDpr, maxDpr] = getQualityDprRange(config.renderQuality);
  const score = getConfigPerformanceScore(config);
  if (score >= 10) return [1, Math.min(1.1, maxDpr)] as [number, number];
  if (score >= 7) return [1, Math.min(1.25, maxDpr)] as [number, number];
  if (score >= 5) return [minDpr, Math.min(1.35, maxDpr)] as [number, number];
  return [minDpr, maxDpr] as [number, number];
}

export function shouldUseAntialias(config: ParticleConfig) {
  return config.renderQuality !== 'draft' && getConfigPerformanceScore(config) < 7.5;
}

function getDefaultCameraPosition(config: ParticleConfig) {
  if (config.viewMode === 'orthographic') {
    return new Vector3(0, 0, 500);
  }
  return new Vector3(0, 0, config.cameraDistance + 200);
}

export const SceneBackgroundSync: React.FC<{ backgroundColor: ParticleConfig['backgroundColor'] }> = ({ backgroundColor }) => {
  const { gl, scene } = useThree();

  React.useEffect(() => {
    const color = new Color(backgroundColor);
    gl.setClearColor(color, 1);
    scene.background = color;
  }, [backgroundColor, gl, scene]);

  return null;
};

export const CameraImpulseRig: React.FC<{
  audioRef: SceneAudioRef;
  config: ParticleConfig;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  isCameraPathPlayingRef?: React.MutableRefObject<boolean>;
  isInteractingRef: React.MutableRefObject<boolean>;
  isPlaying: boolean;
}> = ({ audioRef, config, controlsRef, isCameraPathPlayingRef, isInteractingRef, isPlaying }) => {
  const { camera } = useThree();
  const basePositionRef = React.useRef(getDefaultCameraPosition(config));
  const baseTargetRef = React.useRef(new Vector3(0, 0, 0));
  const baseFovRef = React.useRef('fov' in camera ? camera.fov : 50);
  const baseZoomRef = React.useRef('zoom' in camera ? camera.zoom : 1);
  const baseModeRef = React.useRef(config.viewMode);
  const baseDistanceRef = React.useRef(config.cameraDistance);
  const initializedRef = React.useRef(false);
  const audioRouteStateRef = React.useRef(createAudioRouteStateMap());

  useProfiledFrame('scene:camera-rig', config.executionDiagnosticsEnabled, ({ clock }) => {
    if (isCameraPathPlayingRef?.current) {
      return;
    }
    if (config.cameraControlMode === 'manual') {
      return;
    }
    const t = clock.getElapsedTime();
    const controls = controlsRef.current;
    const impulse = config.cameraImpulseStrength;
    const evaluatedAudioRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    const baseCameraAudioInput = config.audioEnabled
      ? (audioRef.current.bass * config.audioBeatScale + audioRef.current.pulse * config.audioBurstScale * 0.65) * config.audioCameraScale
      : 0;
    const cameraAudioInput = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'camera.shake', baseCameraAudioInput, { additiveScale: 0.25, clampMin: 0, clampMax: 4 });
    const orbitAudioInput = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'camera.orbitSpeed', 0, { additiveScale: 0.25, clampMin: 0, clampMax: 2 });
    const fovAudioInput = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'camera.fov', 0, { additiveScale: 0.3, clampMin: -10, clampMax: 10 });
    const dollyAudioInput = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'camera.dolly', 0, { additiveScale: 18, clampMin: -120, clampMax: 120 });
    const burstEnergy = getBurstDriveEnergy(config, t, isPlaying, config.audioEnabled ? audioRef.current.pulse * config.audioBurstScale : 0);
    const needsSync =
      !initializedRef.current ||
      isInteractingRef.current ||
      baseModeRef.current !== config.viewMode ||
      Math.abs(baseDistanceRef.current - config.cameraDistance) > 0.001;
    if (needsSync) {
      initializedRef.current = true;
      basePositionRef.current.copy(
        config.cameraControlMode === 'auto'
          ? getDefaultCameraPosition(config)
          : camera.position,
      );
      baseTargetRef.current.copy(controls?.target ?? new Vector3(0, 0, 0));
      if ('fov' in camera) baseFovRef.current = camera.fov;
      if ('zoom' in camera) baseZoomRef.current = camera.zoom;
      baseModeRef.current = config.viewMode;
      baseDistanceRef.current = config.cameraDistance;
    }
    if ((impulse <= 0 && config.cameraBurstBoost <= 0) || isInteractingRef.current) {
      return;
    }
    const audioBoost = cameraAudioInput;
    const rawStrength = impulse * (1 + audioBoost * 0.65) + burstEnergy * config.cameraBurstBoost * 0.55;
    const strength = MathUtils.clamp(rawStrength, 0, 2);
    const speed = Math.max(0.05, config.cameraImpulseSpeed + orbitAudioInput * 0.35) * (isPlaying ? 1 : 0.25);
    const drift = config.cameraImpulseDrift;
    camera.position.copy(basePositionRef.current);
    camera.position.x += Math.sin(t * speed) * strength * 28;
    camera.position.y += Math.cos(t * speed * 0.83) * strength * 18;
    camera.position.z += Math.sin(t * speed * 0.47) * drift * 60 + dollyAudioInput;
    if (controls) {
      controls.target.copy(baseTargetRef.current);
      controls.update();
    } else {
      camera.lookAt(baseTargetRef.current);
    }
    if ('fov' in camera && config.viewMode !== 'orthographic') {
      camera.fov = baseFovRef.current + Math.sin(t * speed * 0.6) * strength * 0.8 + fovAudioInput;
      camera.updateProjectionMatrix();
    } else if ('zoom' in camera && config.viewMode === 'orthographic') {
      camera.zoom = Math.max(1, baseZoomRef.current + Math.sin(t * speed * 0.6) * drift * 0.6 + fovAudioInput * 0.02);
      camera.updateProjectionMatrix();
    }
  });

  return null;
};
