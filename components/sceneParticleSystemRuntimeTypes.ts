import type React from 'react';
import type { RootState } from '@react-three/fiber';
import { InstancedMesh, ShaderMaterial, Vector3 } from 'three';
import type { ParticleConfig } from '../types';
import type { AudioRouteStateMap } from '../lib/audioReactiveRuntime';
import type { AuxMode } from './particleData';

export type ParticleSystemAudioRef = React.MutableRefObject<{
  bass: number;
  treble: number;
  pulse: number;
  bandA: number;
  bandB: number;
}>;

export interface ParticleSystemCollider {
  center: Vector3;
  radius: number;
}

export interface UpdateParticleSystemFrameArgs {
  config: ParticleConfig;
  layerIndex: 1 | 2 | 3 | 4;
  isAux: boolean;
  auxMode: AuxMode;
  audioRef: ParticleSystemAudioRef;
  isPlaying: boolean;
  contactAmount: number;
  state: RootState;
  delta: number;
  meshRef: React.MutableRefObject<InstancedMesh | null>;
  windRef: React.MutableRefObject<Vector3>;
  spinRef: React.MutableRefObject<Vector3>;
  prevAudioEnabledRef: React.MutableRefObject<boolean>;
  audioRouteStateRef: React.MutableRefObject<AudioRouteStateMap>;
  prevLayerKeyRef: React.MutableRefObject<string>;
  interLayerColliders: ParticleSystemCollider[];
  activeInterLayerColliderCount: number;
  ghostMats: ShaderMaterial[];
  maxGhost: number;
}

export type ParticleLayerUniformState = {
  speed: number;
  amp: number;
  noise: number;
  evol: number;
  fid: number;
  oct: number;
  freq: number;
  rad: number;
  size: number;
  grav: number;
  vis: number;
  fluid: number;
  affectPos: number;
  mouseForce: number;
  mouseRadius: number;
  complexity: number;
  resistance: number;
  moveWithWind: number;
  neighborForce: number;
  collisionMode: number;
  collisionRadius: number;
  repulsion: number;
  trail: number;
  life: number;
  lifeSpread: number;
  lifeSizeBoost: number;
  lifeSizeTaper: number;
  burst: number;
  burstPhase: number;
  burstMode: number;
  burstWaveform: number;
  burstSweepSpeed: number;
  burstSweepTilt: number;
  burstConeWidth: number;
  emitterOrbitSpeed: number;
  emitterOrbitRadius: number;
  emitterPulseAmount: number;
  trailDrag: number;
  trailTurbulence: number;
  trailDrift: number;
  velocityGlow: number;
  velocityAlpha: number;
  flickerAmount: number;
  flickerSpeed: number;
  streak: number;
  spriteMode: number;
  auxLife: number;
  wind: Vector3;
  spin: Vector3;
  boundaryY: number;
  boundaryEnabled: number;
  boundaryBounce: number;
};
