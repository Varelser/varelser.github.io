import type { ShaderMaterial, Vector3 } from 'three';
import type { ParticleConfig } from '../types';
import { resolveLayerParams } from './sceneParticleSystemShared';
import type { AuxMode } from './particleData';
import type { ParticleLayerUniformState } from './sceneParticleSystemRuntimeTypes';

export function resolveParticleLayerUniformState(
  config: ParticleConfig,
  layerIndex: 1 | 2 | 3 | 4,
  isAux: boolean,
  auxMode: AuxMode,
  wind: Vector3,
  spin: Vector3,
): ParticleLayerUniformState {
  const next: ParticleLayerUniformState = {
    speed: 0,
    amp: 0,
    noise: 1,
    evol: 1,
    fid: 1,
    oct: 1,
    freq: 1,
    rad: 100,
    size: 1,
    grav: 0,
    vis: 0,
    fluid: 0,
    affectPos: 1,
    mouseForce: 0,
    mouseRadius: 100,
    complexity: 1,
    resistance: 0,
    moveWithWind: 0,
    neighborForce: 0,
    collisionMode: 0,
    collisionRadius: 20,
    repulsion: 10,
    trail: 0,
    life: 0,
    lifeSpread: 0,
    lifeSizeBoost: 0,
    lifeSizeTaper: 0,
    burst: 0,
    burstPhase: 0,
    burstMode: 0,
    burstWaveform: 0,
    burstSweepSpeed: 1,
    burstSweepTilt: 0.35,
    burstConeWidth: 0.4,
    emitterOrbitSpeed: 0,
    emitterOrbitRadius: 0,
    emitterPulseAmount: 0,
    trailDrag: 0,
    trailTurbulence: 0,
    trailDrift: 0,
    velocityGlow: 0,
    velocityAlpha: 0,
    flickerAmount: 0,
    flickerSpeed: 1,
    streak: 0,
    spriteMode: 0,
    auxLife: 100,
    wind,
    spin,
    boundaryY: 0,
    boundaryEnabled: 0,
    boundaryBounce: 0,
  };

  if (layerIndex === 1) {
    next.speed = config.pulseSpeed;
    next.amp = config.pulseAmplitude;
    next.noise = config.jitter;
    next.complexity = Math.max(1, config.jitter * 2);
    next.freq = config.jitter;
    next.rad = config.sphereRadius;
    next.size = config.baseSize;
    return next;
  }

  if (layerIndex === 2 || layerIndex === 3) {
    const p = resolveLayerParams(config, layerIndex, isAux, auxMode);
    next.speed = p.speed;
    next.amp = p.amp;
    next.freq = p.freq;
    next.noise = p.noise;
    next.complexity = p.complexity;
    next.evol = p.evol;
    next.fid = p.fid;
    next.oct = p.oct;
    next.rad = p.rad;
    next.size = p.size;
    next.grav = p.grav;
    next.resistance = p.resistance;
    next.vis = p.vis;
    next.fluid = p.fluid;
    next.affectPos = p.affectPos;
    next.moveWithWind = p.moveWithWind;
    next.neighborForce = p.neighborForce;
    next.collisionMode = p.collisionMode;
    next.collisionRadius = p.collisionRadius;
    next.repulsion = p.repulsion;
    next.trail = p.trail;
    next.life = p.life;
    next.lifeSpread = p.lifeSpread;
    next.lifeSizeBoost = p.lifeSizeBoost;
    next.lifeSizeTaper = p.lifeSizeTaper;
    next.burst = p.burst;
    next.burstPhase = p.burstPhase;
    next.burstMode = p.burstMode;
    next.burstWaveform = p.burstWaveform;
    next.burstSweepSpeed = p.burstSweepSpeed;
    next.burstSweepTilt = p.burstSweepTilt;
    next.burstConeWidth = p.burstConeWidth;
    next.emitterOrbitSpeed = p.emitterOrbitSpeed;
    next.emitterOrbitRadius = p.emitterOrbitRadius;
    next.emitterPulseAmount = p.emitterPulseAmount;
    next.trailDrag = p.trailDrag;
    next.trailTurbulence = p.trailTurbulence;
    next.trailDrift = p.trailDrift;
    next.velocityGlow = p.velocityGlow;
    next.velocityAlpha = p.velocityAlpha;
    next.flickerAmount = p.flickerAmount;
    next.flickerSpeed = p.flickerSpeed;
    next.streak = p.streak;
    next.spriteMode = p.spriteMode;
    next.auxLife = p.auxLife;
    next.mouseForce = p.mouseForce;
    next.mouseRadius = p.mouseRadius;
    next.wind.set(p.windX, p.windY, p.windZ);
    next.spin.set(p.spinX, p.spinY, p.spinZ);
    next.boundaryY = p.boundaryY;
    next.boundaryEnabled = p.boundaryEnabled;
    next.boundaryBounce = p.boundaryBounce;
    return next;
  }

  next.speed = config.ambientSpeed;
  next.amp = config.ambientSpread;
  next.size = config.ambientBaseSize;
  next.rad = config.ambientSpread;
  return next;
}

export function buildParticleLayerKey(state: ParticleLayerUniformState) {
  return `${state.speed},${state.amp},${state.freq},${state.noise},${state.complexity},${state.evol},${state.fid},${state.oct},${state.rad},${state.size},${state.grav},${state.vis},${state.fluid},${state.affectPos},${state.resistance},${state.moveWithWind},${state.neighborForce},${state.collisionMode},${state.collisionRadius},${state.repulsion},${state.trail},${state.life},${state.lifeSpread},${state.lifeSizeBoost},${state.lifeSizeTaper},${state.burst},${state.burstPhase},${state.burstMode},${state.burstWaveform},${state.burstSweepSpeed},${state.burstSweepTilt},${state.burstConeWidth},${state.emitterOrbitSpeed},${state.emitterOrbitRadius},${state.emitterPulseAmount},${state.trailDrag},${state.trailTurbulence},${state.trailDrift},${state.velocityGlow},${state.velocityAlpha},${state.flickerAmount},${state.flickerSpeed},${state.streak},${state.spriteMode},${state.auxLife},${state.mouseForce},${state.mouseRadius},${state.wind.x},${state.wind.y},${state.wind.z},${state.spin.x},${state.spin.y},${state.spin.z},${state.boundaryY},${state.boundaryEnabled},${state.boundaryBounce}`;
}

export function applyParticleLayerUniforms(
  mat: ShaderMaterial,
  config: ParticleConfig,
  state: ParticleLayerUniformState,
  contactAmount: number,
  isAux: boolean,
) {
  mat.uniforms.uGlobalSpeed.value = state.speed;
  mat.uniforms.uGlobalAmp.value = state.amp;
  mat.uniforms.uGlobalFreq.value = state.freq;
  mat.uniforms.uGlobalNoiseScale.value = state.noise;
  mat.uniforms.uGlobalComplexity.value = state.complexity;
  mat.uniforms.uGlobalEvolution.value = state.evol;
  mat.uniforms.uGlobalFidelity.value = state.fid;
  mat.uniforms.uGlobalOctaveMult.value = state.oct;
  mat.uniforms.uGlobalRadius.value = state.rad;
  const impactSizeBoost = config.interLayerContactFxEnabled && config.interLayerCollisionEnabled
    ? 1 + contactAmount * config.interLayerContactSizeBoost
    : 1;
  mat.uniforms.uGlobalSize.value = state.size * impactSizeBoost;
  mat.uniforms.uGravity.value = state.grav;
  mat.uniforms.uViscosity.value = state.vis;
  mat.uniforms.uFluidForce.value = state.fluid;
  mat.uniforms.uResistance.value = state.resistance;
  mat.uniforms.uMoveWithWind.value = state.moveWithWind;
  mat.uniforms.uNeighborForce.value = state.neighborForce;
  mat.uniforms.uCollisionMode.value = state.collisionMode;
  mat.uniforms.uCollisionRadius.value = state.collisionRadius;
  mat.uniforms.uRepulsion.value = state.repulsion;
  mat.uniforms.uTrail.value = state.trail;
  mat.uniforms.uLife.value = state.life;
  mat.uniforms.uLifeSpread.value = state.lifeSpread;
  mat.uniforms.uLifeSizeBoost.value = state.lifeSizeBoost;
  mat.uniforms.uLifeSizeTaper.value = state.lifeSizeTaper;
  mat.uniforms.uBurst.value = state.burst;
  mat.uniforms.uBurstPhase.value = state.burstPhase;
  mat.uniforms.uBurstMode.value = state.burstMode;
  mat.uniforms.uBurstWaveform.value = state.burstWaveform;
  mat.uniforms.uBurstSweepSpeed.value = state.burstSweepSpeed;
  mat.uniforms.uBurstSweepTilt.value = state.burstSweepTilt;
  mat.uniforms.uBurstConeWidth.value = state.burstConeWidth;
  mat.uniforms.uEmitterOrbitSpeed.value = state.emitterOrbitSpeed;
  mat.uniforms.uEmitterOrbitRadius.value = state.emitterOrbitRadius;
  mat.uniforms.uEmitterPulseAmount.value = state.emitterPulseAmount;
  mat.uniforms.uTrailDrag.value = state.trailDrag;
  mat.uniforms.uTrailTurbulence.value = state.trailTurbulence;
  mat.uniforms.uTrailDrift.value = state.trailDrift;
  mat.uniforms.uVelocityGlow.value = state.velocityGlow;
  mat.uniforms.uVelocityAlpha.value = state.velocityAlpha;
  mat.uniforms.uFlickerAmount.value = state.flickerAmount;
  mat.uniforms.uFlickerSpeed.value = state.flickerSpeed;
  mat.uniforms.uStreak.value = state.streak;
  mat.uniforms.uSpriteMode.value = state.spriteMode;
  mat.uniforms.uAuxLife.value = state.auxLife;
  mat.uniforms.uIsAux.value = isAux ? 1 : 0;
  mat.uniforms.uAffectPos.value = state.affectPos;
  mat.uniforms.uMouseForce.value = state.mouseForce;
  mat.uniforms.uMouseRadius.value = state.mouseRadius;
  mat.uniforms.uWind.value.copy(state.wind);
  mat.uniforms.uSpin.value.copy(state.spin);
  mat.uniforms.uBoundaryY.value = state.boundaryY;
  mat.uniforms.uBoundaryEnabled.value = state.boundaryEnabled;
  mat.uniforms.uBoundaryBounce.value = state.boundaryBounce;
}
