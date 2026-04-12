import { applyPbdSurfaceForces } from './pbd_surfaceForces';
import {
  applyMultiPinGroupPull,
  buildChoreographedPinGroups,
  resolvePinChoreographyPreset,
} from './pbd_sharedConstraints';
import {
  buildPinGroups,
  indexOf,
  isBoundary,
  type PbdSoftbodyRuntimeState,
} from './pbd_softbodyTypes';

export function applyPulseAndSoftbodyForces(runtime: PbdSoftbodyRuntimeState): void {
  const { config, particles, frame } = runtime;
  let cx = 0;
  let cy = 0;
  for (const particle of particles) {
    cx += particle.x;
    cy += particle.y;
  }
  cx /= particles.length;
  cy /= particles.length;
  const pulse = Math.sin(frame * 0.12) * 0.0024;
  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      const particle = particles[indexOf(config, x, y)];
      if (particle.pinned) continue;
      const shellWeight = isBoundary(config, x, y) ? 1 : 0.55;
      particle.x += config.pulseX * pulse * shellWeight;
      particle.y += config.pulseY * pulse * (0.65 + shellWeight * 0.35);
    }
  }
  if (config.pinGroupStrength > 0) {
    const baseGroups = buildPinGroups(config);
    const groups = buildChoreographedPinGroups(
      baseGroups,
      resolvePinChoreographyPreset(
        {
          mode: config.pinChoreographyMode,
          amplitude: config.pinChoreographyAmplitude,
          speed: config.pinChoreographySpeed,
          frame,
        },
        config.pinChoreographyPreset,
      ),
    );
    applyMultiPinGroupPull(particles, groups);
    runtime.choreographyDrift = groups.reduce(
      (sum, group, index) => sum + Math.hypot(group.x - baseGroups[index].x, group.y - baseGroups[index].y),
      0,
    );
  }
  const impulse = applyPbdSurfaceForces(
    particles,
    frame,
    cx,
    cy,
    {
      windX: config.windX,
      windY: config.windY,
      windPulse: config.windPulse,
      pressureStrength: config.pressureStrength + config.volumePreservation * 0.35,
      pressurePulse: config.pressurePulse,
    },
    (index) => {
      const x = index % config.width;
      const y = Math.floor(index / config.width);
      return isBoundary(config, x, y) ? 1 : 0.65;
    },
  );
  runtime.windImpulse = impulse.windImpulse;
  runtime.pressureImpulse = impulse.pressureImpulse;
}
