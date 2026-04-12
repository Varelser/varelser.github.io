import { MathUtils, Vector3 } from 'three';
import { getMotionGroupIndexByValue } from './motionCatalog';
import { applySpecificMotionEstimate } from './sceneMotionEstimatorSpecific';
import {
  noiseVec3,
  tempDir,
  tempMotion,
  tempNoise,
  tempSeed,
  tempWindDir,
  upAxis,
  xAxis,
  yAxis,
  zAxis,
  type LayerEstimateArgs,
} from './sceneMotionEstimatorShared';

export function estimateLayerPositionApprox({
  config,
  layerIndex,
  particleData,
  index,
  globalRadius,
  time,
}: LayerEstimateArgs) {
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

  tempMotion.copy(position);
  tempSeed.set(
    position.x * 0.012 * noiseScale + timePhase * 0.3 * evolution,
    position.y * 0.012 * noiseScale + phase,
    position.z * 0.012 * noiseScale + rnd * 9 + timePhase * 0.23,
  );

  if (applySpecificMotionEstimate(tempMotion, position, motionType, timePhase, amp, freq, phase, rnd, variant)) {
    // motion-specific override applied
  } else if (group === 0) {
    noiseVec3(tempNoise, tempSeed);
    tempDir.copy(wind).multiplyScalar(0.08);
    tempMotion.addScaledVector(tempNoise, amp * 0.22 * (0.35 + fluidForce * 0.08));
    tempMotion.addScaledVector(tempDir, amp * 0.08);
    tempMotion.applyAxisAngle(upAxis, tempNoise.x * 0.35 + timePhase * 0.08);
  } else if (group === 1) {
    const x = position.x * 0.01;
    const y = position.y * 0.01;
    const z = position.z * 0.01;
    tempMotion.set(
      Math.sin((y - z) * (0.7 + complexity * 0.05) + timePhase),
      Math.sin((z - x) * (0.9 + fidelity * 0.08) + timePhase * 0.9),
      Math.sin((x - y) * (0.8 + octaveMult * 0.04) + timePhase * 1.1),
    );
    tempMotion.multiplyScalar(amp * 0.3);
    tempMotion.add(position);
  } else if (group === 2) {
    const radial = Math.max(1, Math.hypot(position.x, position.z));
    const angle = Math.atan2(position.z, position.x) + timePhase * (0.35 + freq * 0.02);
    const helixY = Math.sin(timePhase * 0.7 + rnd * 6) * amp * 0.18;
    tempMotion.set(
      Math.cos(angle) * radial,
      position.y + helixY,
      Math.sin(angle) * radial,
    );
    tempMotion.addScaledVector(position.clone().normalize(), amp * 0.08 * Math.sin(timePhase * 1.3 + variant * 4));
  } else if (group === 3) {
    const sx = Math.sin(timePhase * (1.0 + rnd) + position.y * 0.01 * freq);
    const sy = Math.sin(timePhase * (1.3 + variant) + position.z * 0.01 * octaveMult);
    const sz = Math.cos(timePhase * (0.8 + lifeJitter) + position.x * 0.01 * complexity);
    tempMotion.set(sx, sy, sz).multiplyScalar(amp * 0.26).add(position);
  } else if (group === 4) {
    const cell = Math.max(10, 80 - freq * 0.3);
    tempMotion.set(
      Math.round(position.x / cell) * cell,
      Math.round(position.y / cell) * cell,
      Math.round(position.z / cell) * cell,
    );
    tempMotion.lerp(position, 0.55 + Math.sin(timePhase + variant * 5) * 0.1);
  } else if (group === 5) {
    tempDir.copy(position).normalize();
    const pulse = Math.sin(timePhase * (0.9 + speed * 4)) * amp * 0.32;
    tempMotion.addScaledVector(tempDir, pulse);
    tempMotion.y += Math.cos(timePhase * 0.7 + phase) * amp * 0.09;
  } else {
    const shear = Math.sin(timePhase * 0.8 + rnd * 4) * amp * 0.12;
    tempMotion.set(
      position.x + position.y * 0.08 * shear,
      position.y + Math.sin(position.x * 0.01 * freq + timePhase) * amp * 0.08,
      position.z + position.x * 0.08 * shear,
    );
  }

  position.lerp(tempMotion, MathUtils.clamp(affectPos, 0, 1));
  position.addScaledVector(wind, moveWithWind * time * 0.025);
  position.y -= gravity * 0.01 * time;

  if (neighborForce !== 0) {
    noiseVec3(tempNoise, tempSeed.multiplyScalar(1.7));
    tempNoise.normalize();
    position.addScaledVector(tempNoise, neighborForce * 0.12);
  }

  if (collisionMode === 'world') {
    const worldRadius = Math.max(1, collisionRadius);
    const len = position.length();
    if (len > worldRadius) {
      tempDir.copy(position).normalize();
      position.copy(tempDir.multiplyScalar(worldRadius).addScaledVector(tempDir, -repulsion * 0.01));
    }
  }

  if (boundaryEnabled && position.y < boundaryY) {
    position.y = MathUtils.lerp(boundaryY, boundaryY + Math.abs(position.y - boundaryY) * Math.max(0, boundaryBounce), 0.75);
  }

  const particleLife = Math.max(4, life * (1 + lifeSpread * (lifeJitter * 2 - 1)));
  const lifeProgress = (((time * 60) / particleLife) + spawnOffset + burstPhase) % 1;
  const burstEnvelope = 1 - MathUtils.smoothstep(lifeProgress, 0, 0.32);
  tempDir.copy(position).normalize();
  position.addScaledVector(tempDir, burst * burstEnvelope * globalRadius * 0.08 * (0.5 + variant));
  noiseVec3(tempNoise, tempSeed.set(position.x * 0.01, position.y * 0.01, position.z * 0.01 + timePhase));
  position.addScaledVector(tempNoise, trailTurbulence * 6 * burstEnvelope);
  tempWindDir.copy(wind);
  if (tempWindDir.lengthSq() > 0.000001) {
    tempWindDir.normalize();
    position.addScaledVector(tempWindDir, trailDrift * 18 * burstEnvelope);
  }
  position.lerp(base.clone().add(animatedOffset), MathUtils.clamp(trailDrag * 0.16, 0, 0.65));

  if (spinX !== 0) position.applyAxisAngle(xAxis, spinX * time);
  if (spinY !== 0) position.applyAxisAngle(yAxis, spinY * time);
  if (spinZ !== 0) position.applyAxisAngle(zAxis, spinZ * time);

  position.multiplyScalar(Math.max(0, 1 - resistance * 0.025));
  return position;
}
