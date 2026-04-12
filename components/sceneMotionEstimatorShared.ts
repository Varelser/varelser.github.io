import { Vector3 } from 'three';
import type { ParticleConfig } from '../types';
import { getMotionGroupIndexByValue } from './motionCatalog';
import type { ParticleData } from './particleData';

export type LayerEstimateArgs = {
  config: ParticleConfig;
  layerIndex: 2 | 3;
  particleData: ParticleData;
  index: number;
  globalRadius: number;
  time: number;
};

export type LayerEstimateRuntime = {
  config: ParticleConfig;
  layerIndex: 2 | 3;
  particleData: ParticleData;
  index: number;
  globalRadius: number;
  time: number;
  phase: number;
  rnd: number;
  motionType: number;
  speedMult: number;
  ampMult: number;
  freqMult: number;
  lifeJitter: number;
  variant: number;
  spawnOffset: number;
  base: Vector3;
  offset: Vector3;
  position: Vector3;
  animatedOffset: Vector3;
  wind: Vector3;
  group: number;
  timePhase: number;
  speed: number;
  amp: number;
  freq: number;
  complexity: number;
  fluidForce: number;
  fidelity: number;
  octaveMult: number;
  affectPos: number;
  resistance: number;
  moveWithWind: number;
  neighborForce: number;
  collisionMode: string;
  collisionRadius: number;
  repulsion: number;
  gravity: number;
  boundaryY: number;
  boundaryEnabled: boolean;
  boundaryBounce: number;
  burst: number;
  burstPhase: number;
  life: number;
  lifeSpread: number;
  trailDrag: number;
  trailTurbulence: number;
  trailDrift: number;
  spinX: number;
  spinY: number;
  spinZ: number;
};

export const tempSeed = new Vector3();
export const tempNoise = new Vector3();
export const tempDir = new Vector3();
export const tempMotion = new Vector3();
export const tempWindDir = new Vector3();
export const upAxis = new Vector3(0, 1, 0);
export const xAxis = new Vector3(1, 0, 0);
export const yAxis = new Vector3(0, 1, 0);
export const zAxis = new Vector3(0, 0, 1);

export function fract(value: number) {
  return value - Math.floor(value);
}

export function pseudoNoise3(x: number, y: number, z: number) {
  return fract(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453);
}

export function signedNoise3(x: number, y: number, z: number) {
  return pseudoNoise3(x, y, z) * 2 - 1;
}

export function noiseVec3(target: Vector3, seed: Vector3) {
  target.set(
    signedNoise3(seed.x + 13.4, seed.y + 7.1, seed.z + 3.7),
    signedNoise3(seed.x + 2.8, seed.y + 17.5, seed.z + 11.9),
    signedNoise3(seed.x + 19.2, seed.y + 5.3, seed.z + 23.1),
  );
  return target;
}

export function buildLayerEstimateRuntime({
  config,
  layerIndex,
  particleData,
  index,
  globalRadius,
  time,
}: LayerEstimateArgs): LayerEstimateRuntime {
  const phase = particleData.d1[index * 4 + 0] ?? 0;
  const rnd = particleData.d1[index * 4 + 1] ?? 0;
  const motionType = Math.round(particleData.d1[index * 4 + 2] ?? 0);
  const radiusScale = particleData.d1[index * 4 + 3] ?? 1;
  const speedMult = particleData.d2[index * 4 + 0] ?? 1;
  const ampMult = particleData.d2[index * 4 + 1] ?? 1;
  const freqMult = particleData.d2[index * 4 + 2] ?? 1;
  const lifeJitter = particleData.d3[index * 4 + 1] ?? 0;
  const variant = particleData.d3[index * 4 + 2] ?? 0;
  const spawnOffset = particleData.d3[index * 4 + 0] ?? 0;

  const base = new Vector3(
    particleData.pos[index * 3 + 0] * radiusScale * globalRadius,
    particleData.pos[index * 3 + 1] * radiusScale * globalRadius,
    particleData.pos[index * 3 + 2] * radiusScale * globalRadius,
  );
  const offset = new Vector3(
    particleData.off[index * 3 + 0],
    particleData.off[index * 3 + 1],
    particleData.off[index * 3 + 2],
  );

  const isLayer2 = layerIndex === 2;
  const speed = (isLayer2 ? config.layer2FlowSpeed : config.layer3FlowSpeed) * speedMult;
  const amp = (isLayer2 ? config.layer2FlowAmplitude : config.layer3FlowAmplitude) * ampMult;
  const freq = (isLayer2 ? config.layer2FlowFrequency : config.layer3FlowFrequency) * freqMult;
  const noiseScale = isLayer2 ? config.layer2NoiseScale : config.layer3NoiseScale;
  const evolution = isLayer2 ? config.layer2Evolution : config.layer3Evolution;
  const complexity = isLayer2 ? config.layer2Complexity : config.layer3Complexity;
  const fluidForce = isLayer2 ? config.layer2FluidForce : config.layer3FluidForce;
  const fidelity = isLayer2 ? config.layer2Fidelity : config.layer3Fidelity;
  const octaveMult = isLayer2 ? config.layer2OctaveMult : config.layer3OctaveMult;
  const affectPos = isLayer2 ? config.layer2AffectPos : config.layer3AffectPos;
  const resistance = isLayer2 ? config.layer2Resistance : config.layer3Resistance;
  const moveWithWind = isLayer2 ? config.layer2MoveWithWind : config.layer3MoveWithWind;
  const neighborForce = isLayer2 ? config.layer2InteractionNeighbor : config.layer3InteractionNeighbor;
  const collisionMode = isLayer2 ? config.layer2CollisionMode : config.layer3CollisionMode;
  const collisionRadius = isLayer2 ? config.layer2CollisionRadius : config.layer3CollisionRadius;
  const repulsion = isLayer2 ? config.layer2Repulsion : config.layer3Repulsion;
  const gravity = isLayer2 ? config.layer2Gravity : config.layer3Gravity;
  const boundaryY = isLayer2 ? config.layer2BoundaryY : config.layer3BoundaryY;
  const boundaryEnabled = isLayer2 ? config.layer2BoundaryEnabled : config.layer3BoundaryEnabled;
  const boundaryBounce = isLayer2 ? config.layer2BoundaryBounce : config.layer3BoundaryBounce;
  const burst = isLayer2 ? config.layer2Burst : config.layer3Burst;
  const burstPhase = isLayer2 ? config.layer2BurstPhase : config.layer3BurstPhase;
  const life = isLayer2 ? config.layer2Life : config.layer3Life;
  const lifeSpread = isLayer2 ? config.layer2LifeSpread : config.layer3LifeSpread;
  const trailDrag = isLayer2 ? config.layer2TrailDrag : config.layer3TrailDrag;
  const trailTurbulence = isLayer2 ? config.layer2TrailTurbulence : config.layer3TrailTurbulence;
  const trailDrift = isLayer2 ? config.layer2TrailDrift : config.layer3TrailDrift;
  const orbitSpeed = isLayer2 ? config.layer2EmitterOrbitSpeed : config.layer3EmitterOrbitSpeed;
  const orbitRadius = isLayer2 ? config.layer2EmitterOrbitRadius : config.layer3EmitterOrbitRadius;
  const emitterPulseAmount = isLayer2 ? config.layer2EmitterPulseAmount : config.layer3EmitterPulseAmount;
  const spinX = isLayer2 ? config.layer2SpinX : config.layer3SpinX;
  const spinY = isLayer2 ? config.layer2SpinY : config.layer3SpinY;
  const spinZ = isLayer2 ? config.layer2SpinZ : config.layer3SpinZ;
  const wind = new Vector3(
    isLayer2 ? config.layer2WindX : config.layer3WindX,
    isLayer2 ? config.layer2WindY : config.layer3WindY,
    isLayer2 ? config.layer2WindZ : config.layer3WindZ,
  );

  const orbitPhase = time * Math.max(0, orbitSpeed);
  const emitterPulse = 1 + Math.sin(time * Math.max(0.05, orbitSpeed || 0.5) * 1.6 + phase) * emitterPulseAmount;
  const animatedOffset = offset.clone().multiplyScalar(emitterPulse).applyAxisAngle(upAxis, orbitPhase);
  animatedOffset.add(new Vector3(
    Math.cos(orbitPhase) * orbitRadius,
    Math.sin(orbitPhase * 0.5) * orbitRadius * 0.25,
    Math.sin(orbitPhase) * orbitRadius,
  ));

  const position = base.clone().add(animatedOffset);
  const group = getMotionGroupIndexByValue(motionType);
  const timePhase = time * (0.4 + speed * 18) + phase * 0.5 + spawnOffset * Math.PI * 2;

  tempSeed.set(
    position.x * 0.012 * noiseScale + timePhase * 0.3 * evolution,
    position.y * 0.012 * noiseScale + phase,
    position.z * 0.012 * noiseScale + rnd * 9 + timePhase * 0.23,
  );

  return {
    config,
    layerIndex,
    particleData,
    index,
    globalRadius,
    time,
    phase,
    rnd,
    motionType,
    speedMult,
    ampMult,
    freqMult,
    lifeJitter,
    variant,
    spawnOffset,
    base,
    offset,
    position,
    animatedOffset,
    wind,
    group,
    timePhase,
    speed,
    amp,
    freq,
    complexity,
    fluidForce,
    fidelity,
    octaveMult,
    affectPos,
    resistance,
    moveWithWind,
    neighborForce,
    collisionMode,
    collisionRadius,
    repulsion,
    gravity,
    boundaryY,
    boundaryEnabled,
    boundaryBounce,
    burst,
    burstPhase,
    life,
    lifeSpread,
    trailDrag,
    trailTurbulence,
    trailDrift,
    spinX,
    spinY,
    spinZ,
  };
}
