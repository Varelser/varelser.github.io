import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, MathUtils } from 'three';
import type { Mesh, ShaderMaterial } from 'three';
import type { ParticleConfig } from '../types';
import { getBurstDriveEnergy } from './sceneBurstDrive';
import { createAudioRouteStateMap, evaluateAudioRoutes, resolveEvaluatedAudioTargetValue } from '../lib/audioReactiveRuntime';
import { SCREEN_OVERLAY_FRAGMENT_SHADER, SCREEN_OVERLAY_VERTEX_SHADER } from './sceneShaders';
import type { SceneAudioRef } from './AppSceneTypes';

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

const dampOverlayUniform = (material: ShaderMaterial, uniformName: string, targetValue: number, delta: number, rise = 7.5, fall = 4.25) => {
  const uniform = material.uniforms[uniformName];
  if (!uniform) return;
  const currentValue = Number(uniform.value ?? 0);
  const damping = targetValue > currentValue ? rise : fall;
  uniform.value = MathUtils.damp(currentValue, targetValue, damping, delta);
};

export const ScreenOverlay: React.FC<{ audioRef: SceneAudioRef; config: ParticleConfig; isPlaying: boolean; contactAmount: number; isSequencePlaying: boolean; sequenceStepProgressRef: React.MutableRefObject<number> }> = ({ audioRef, config, isPlaying, contactAmount, isSequencePlaying, sequenceStepProgressRef }) => {
  const meshRef = useRef<Mesh>(null);
  const screenImpactBoost = config.interLayerContactFxEnabled && config.interLayerCollisionEnabled ? contactAmount * config.interLayerContactScreenBoost : 0;
  const impactFlashAmount = config.interLayerContactFxEnabled && config.interLayerCollisionEnabled ? contactAmount : 0;
  const audioRouteStateRef = useRef(createAudioRouteStateMap());

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as ShaderMaterial;
    const sequenceStepProgress = sequenceStepProgressRef.current;
    const sequenceDriveAmount = config.screenSequenceDriveEnabled && isSequencePlaying
      ? Math.sin(Math.max(0, Math.min(1, sequenceStepProgress)) * Math.PI) * config.screenSequenceDriveStrength
      : 0;
    if (isPlaying) material.uniforms.uTime.value += delta;
    const evaluatedAudioRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    const pulseDrive = config.audioEnabled ? audioRef.current.pulse * config.audioScreenScale : 0;
    const trebleDrive = config.audioEnabled ? audioRef.current.treble * config.audioJitterScale * config.audioScreenScale : 0;
    const burstDriveAmount = getBurstDriveEnergy(config, clock.getElapsedTime(), isPlaying, config.audioEnabled ? audioRef.current.pulse * config.audioBurstScale : 0) * config.screenBurstDrive;
    const scanlineDrive = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'screen.scanlineIntensity', 0, { additiveScale: 0.18, clampMin: 0, clampMax: 1 });
    const noiseDrive = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'screen.noiseIntensity', 0, { additiveScale: 0.3, clampMin: 0, clampMax: 1 });
    const vignetteDrive = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'screen.vignetteIntensity', 0, { additiveScale: 0.18, clampMin: 0, clampMax: 1 });
    const pulseIntensityDrive = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'screen.pulseIntensity', 0, { additiveScale: 0.32, clampMin: 0, clampMax: 1 });
    const pulseSpeedDrive = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'screen.pulseSpeed', 0, { additiveScale: 0.7, clampMin: -2, clampMax: 2 });
    const interferenceDrive = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'screen.interferenceIntensity', 0, { additiveScale: 0.22, clampMin: 0, clampMax: 1 });
    const persistenceDrive = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'screen.persistenceIntensity', 0, { additiveScale: 0.2, clampMin: 0, clampMax: 1 });
    const splitDrive = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'screen.splitIntensity', 0, { additiveScale: 0.18, clampMin: 0, clampMax: 1 });
    const sweepDrive = resolveEvaluatedAudioTargetValue(evaluatedAudioRoutes, 'screen.sweepIntensity', 0, { additiveScale: 0.22, clampMin: 0, clampMax: 1 });

    const pulseDriveClamped = clampUnit(pulseDrive);
    const trebleDriveClamped = clampUnit(trebleDrive);
    const burstDriveClamped = clampUnit(burstDriveAmount);
    const sequenceDriveClamped = clampUnit(sequenceDriveAmount);

    material.uniforms.uColor.value.set(config.particleColor);
    dampOverlayUniform(material, 'uScanlineIntensity', Math.min(1.0, config.screenScanlineIntensity + screenImpactBoost * 0.12 + sequenceDriveClamped * 0.05 + pulseDriveClamped * 0.06 + scanlineDrive), delta, 8.5, 5.2);
    dampOverlayUniform(material, 'uScanlineDensity', config.screenScanlineDensity + sequenceDriveClamped * 120.0, delta, 6.8, 4.8);
    dampOverlayUniform(material, 'uNoiseIntensity', Math.min(1.15, config.screenNoiseIntensity + screenImpactBoost * 0.28 + sequenceDriveClamped * 0.1 + burstDriveClamped * config.screenBurstNoiseBoost * 0.22 + trebleDriveClamped * 0.18 + noiseDrive), delta, 6.6, 4.4);
    dampOverlayUniform(material, 'uVignetteIntensity', Math.min(1.2, config.screenVignetteIntensity + screenImpactBoost * 0.2 + sequenceDriveClamped * 0.05 + burstDriveClamped * 0.04 + vignetteDrive), delta, 6.4, 4.4);
    dampOverlayUniform(material, 'uPulseIntensity', Math.min(0.72, config.screenPulseIntensity + sequenceDriveClamped * 0.16 + burstDriveClamped * 0.12 + pulseDriveClamped * 0.18 + pulseIntensityDrive), delta, 5.4, 3.4);
    dampOverlayUniform(material, 'uPulseSpeed', config.screenPulseSpeed + sequenceDriveClamped * 0.42 + burstDriveClamped * 0.18 + pulseDriveClamped * 0.22 + pulseSpeedDrive, delta, 5.8, 4.2);
    dampOverlayUniform(material, 'uImpactFlashIntensity', Math.min(0.48, config.screenImpactFlashIntensity + sequenceDriveClamped * 0.08 + burstDriveClamped * config.screenBurstFlashBoost * 0.12 + pulseDriveClamped * 0.12), delta, 4.2, 2.8);
    dampOverlayUniform(material, 'uImpactAmount', impactFlashAmount, delta, 6.4, 3.1);
    dampOverlayUniform(material, 'uInterferenceIntensity', Math.min(0.82, config.screenInterferenceIntensity + sequenceDriveClamped * 0.08 + burstDriveClamped * 0.05 + trebleDriveClamped * 0.1 + interferenceDrive), delta, 6.2, 4.2);
    dampOverlayUniform(material, 'uPersistenceIntensity', Math.min(0.9, config.screenPersistenceIntensity + sequenceDriveClamped * 0.1 + burstDriveClamped * 0.08 + pulseDriveClamped * 0.08 + persistenceDrive), delta, 5.2, 3.8);
    dampOverlayUniform(material, 'uPersistenceLayers', config.screenPersistenceLayers, delta, 7.5, 5.5);
    dampOverlayUniform(material, 'uSplitIntensity', Math.min(0.82, config.screenSplitIntensity + sequenceDriveClamped * 0.08 + burstDriveClamped * 0.05 + trebleDriveClamped * 0.08 + splitDrive), delta, 5.8, 4.0);
    dampOverlayUniform(material, 'uSplitOffset', config.screenSplitOffset + sequenceDriveClamped * 0.04 + burstDriveClamped * 0.015, delta, 6.2, 4.8);
    dampOverlayUniform(material, 'uSweepIntensity', Math.min(0.86, config.screenSweepIntensity + sequenceDriveClamped * 0.16 + burstDriveClamped * 0.1 + pulseDriveClamped * 0.08 + sweepDrive), delta, 5.2, 3.6);
    dampOverlayUniform(material, 'uSweepSpeed', config.screenSweepSpeed + sequenceDriveClamped * 0.42 + burstDriveClamped * 0.18 + trebleDriveClamped * 0.22, delta, 5.8, 4.2);
  });

  if (
    config.screenScanlineIntensity <= 0.001 &&
    config.screenNoiseIntensity <= 0.001 &&
    config.screenVignetteIntensity <= 0.001 &&
    config.screenPulseIntensity <= 0.001 &&
    config.screenImpactFlashIntensity <= 0.001 &&
    config.screenBurstDrive <= 0.001 &&
    config.screenInterferenceIntensity <= 0.001 &&
    config.screenPersistenceIntensity <= 0.001 &&
    config.screenSplitIntensity <= 0.001 &&
    config.screenSweepIntensity <= 0.001 &&
    screenImpactBoost <= 0.001 &&
    (!config.audioEnabled || config.audioScreenScale <= 0.001)
  ) {
    return null;
  }

  const initialEvaluatedAudioRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
  const initialPulseDrive = config.audioEnabled ? audioRef.current.pulse * config.audioScreenScale : 0;
  const initialTrebleDrive = config.audioEnabled ? audioRef.current.treble * config.audioJitterScale * config.audioScreenScale : 0;
  const initialSequenceProgress = sequenceStepProgressRef.current;
  const initialSequenceDriveAmount = config.screenSequenceDriveEnabled && isSequencePlaying
    ? Math.sin(Math.max(0, Math.min(1, initialSequenceProgress)) * Math.PI) * config.screenSequenceDriveStrength
    : 0;
  const burstDriveAmount = getBurstDriveEnergy(config, 0, isPlaying, config.audioEnabled ? audioRef.current.pulse * config.audioBurstScale : 0) * config.screenBurstDrive;
  const initialScanlineDrive = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'screen.scanlineIntensity', 0, { additiveScale: 0.18, clampMin: 0, clampMax: 1 });
  const initialNoiseDrive = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'screen.noiseIntensity', 0, { additiveScale: 0.3, clampMin: 0, clampMax: 1 });
  const initialVignetteDrive = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'screen.vignetteIntensity', 0, { additiveScale: 0.18, clampMin: 0, clampMax: 1 });
  const initialPulseIntensityDrive = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'screen.pulseIntensity', 0, { additiveScale: 0.32, clampMin: 0, clampMax: 1 });
  const initialPulseSpeedDrive = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'screen.pulseSpeed', 0, { additiveScale: 0.7, clampMin: -2, clampMax: 2 });
  const initialInterferenceDrive = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'screen.interferenceIntensity', 0, { additiveScale: 0.22, clampMin: 0, clampMax: 1 });
  const initialPersistenceDrive = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'screen.persistenceIntensity', 0, { additiveScale: 0.2, clampMin: 0, clampMax: 1 });
  const initialSplitDrive = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'screen.splitIntensity', 0, { additiveScale: 0.18, clampMin: 0, clampMax: 1 });
  const initialSweepDrive = resolveEvaluatedAudioTargetValue(initialEvaluatedAudioRoutes, 'screen.sweepIntensity', 0, { additiveScale: 0.22, clampMin: 0, clampMax: 1 });

  return (
    <mesh ref={meshRef as React.Ref<any>} frustumCulled={false} renderOrder={999}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={SCREEN_OVERLAY_VERTEX_SHADER}
        fragmentShader={SCREEN_OVERLAY_FRAGMENT_SHADER}
        transparent={true}
        depthWrite={false}
        depthTest={false}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new Color(config.particleColor) },
          uScanlineIntensity: { value: Math.min(1.0, config.screenScanlineIntensity + screenImpactBoost * 0.12 + clampUnit(initialSequenceDriveAmount) * 0.05 + clampUnit(initialPulseDrive) * 0.06 + initialScanlineDrive) },
          uScanlineDensity: { value: config.screenScanlineDensity + clampUnit(initialSequenceDriveAmount) * 120.0 },
          uNoiseIntensity: { value: Math.min(1.15, config.screenNoiseIntensity + screenImpactBoost * 0.28 + clampUnit(initialSequenceDriveAmount) * 0.1 + clampUnit(burstDriveAmount) * config.screenBurstNoiseBoost * 0.22 + clampUnit(initialTrebleDrive) * 0.18 + initialNoiseDrive) },
          uVignetteIntensity: { value: Math.min(1.2, config.screenVignetteIntensity + screenImpactBoost * 0.2 + clampUnit(initialSequenceDriveAmount) * 0.05 + clampUnit(burstDriveAmount) * 0.04 + initialVignetteDrive) },
          uPulseIntensity: { value: Math.min(0.72, config.screenPulseIntensity + clampUnit(initialSequenceDriveAmount) * 0.16 + clampUnit(burstDriveAmount) * 0.12 + clampUnit(initialPulseDrive) * 0.18 + initialPulseIntensityDrive) },
          uPulseSpeed: { value: config.screenPulseSpeed + clampUnit(initialSequenceDriveAmount) * 0.42 + clampUnit(burstDriveAmount) * 0.18 + clampUnit(initialPulseDrive) * 0.22 + initialPulseSpeedDrive },
          uImpactFlashIntensity: { value: Math.min(0.48, config.screenImpactFlashIntensity + clampUnit(initialSequenceDriveAmount) * 0.08 + clampUnit(burstDriveAmount) * config.screenBurstFlashBoost * 0.12 + clampUnit(initialPulseDrive) * 0.12) },
          uImpactAmount: { value: impactFlashAmount },
          uInterferenceIntensity: { value: Math.min(0.82, config.screenInterferenceIntensity + clampUnit(initialSequenceDriveAmount) * 0.08 + clampUnit(burstDriveAmount) * 0.05 + clampUnit(initialTrebleDrive) * 0.1 + initialInterferenceDrive) },
          uPersistenceIntensity: { value: Math.min(0.9, config.screenPersistenceIntensity + clampUnit(initialSequenceDriveAmount) * 0.1 + clampUnit(burstDriveAmount) * 0.08 + clampUnit(initialPulseDrive) * 0.08 + initialPersistenceDrive) },
          uPersistenceLayers: { value: config.screenPersistenceLayers },
          uSplitIntensity: { value: Math.min(0.82, config.screenSplitIntensity + clampUnit(initialSequenceDriveAmount) * 0.08 + clampUnit(burstDriveAmount) * 0.05 + clampUnit(initialTrebleDrive) * 0.08 + initialSplitDrive) },
          uSplitOffset: { value: config.screenSplitOffset + clampUnit(initialSequenceDriveAmount) * 0.04 + clampUnit(burstDriveAmount) * 0.015 },
          uSweepIntensity: { value: Math.min(0.86, config.screenSweepIntensity + clampUnit(initialSequenceDriveAmount) * 0.16 + clampUnit(burstDriveAmount) * 0.1 + clampUnit(initialPulseDrive) * 0.08 + initialSweepDrive) },
          uSweepSpeed: { value: config.screenSweepSpeed + clampUnit(initialSequenceDriveAmount) * 0.42 + clampUnit(burstDriveAmount) * 0.18 + clampUnit(initialTrebleDrive) * 0.22 },
        }}
      />
    </mesh>
  );
};
