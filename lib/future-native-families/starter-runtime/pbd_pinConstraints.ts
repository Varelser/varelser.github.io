import type {
  PbdLayeredObstaclePresetOptions,
  PbdObstacleField,
  PbdPinChoreographyOptions,
  PbdPinChoreographyPreset,
  PbdPinGroupTarget,
  PbdSharedParticle,
} from './pbd_sharedTypes';

export function applyPinGroupPull(
  particles: PbdSharedParticle[],
  indices: readonly number[],
  targetX: number,
  targetY: number,
  strength: number,
): void {
  for (const index of indices) {
    const particle = particles[index];
    if (!particle || particle.pinned) continue;
    particle.x += (targetX - particle.x) * strength;
    particle.y += (targetY - particle.y) * strength;
  }
}

export function buildChoreographedPinGroups(
  groups: readonly PbdPinGroupTarget[],
  options: PbdPinChoreographyOptions,
): PbdPinGroupTarget[] {
  if (options.mode === 'static' || options.amplitude <= 0 || options.speed <= 0) {
    return groups.map((group) => ({ ...group, indices: [...group.indices] }));
  }
  return groups.map((group, index) => {
    const phase = options.frame * options.speed + index * 0.8;
    if (options.mode === 'orbit') {
      return {
        ...group,
        indices: [...group.indices],
        x: group.x + Math.cos(phase) * options.amplitude,
        y: group.y + Math.sin(phase * 0.7) * options.amplitude * 0.45,
      };
    }
    return {
      ...group,
      indices: [...group.indices],
      x: group.x + Math.sin(phase) * options.amplitude,
      y: group.y + Math.cos(phase * 0.5) * options.amplitude * 0.2,
    };
  });
}

export function resolvePinChoreographyPreset(
  base: PbdPinChoreographyOptions,
  preset: PbdPinChoreographyPreset,
): PbdPinChoreographyOptions {
  if (preset === 'manual') return base;
  if (preset === 'breath-wave') {
    return {
      ...base,
      mode: 'sweep',
      amplitude: Math.max(base.amplitude, 0.04),
      speed: Math.max(base.speed, 0.07),
    };
  }
  if (preset === 'counter-orbit') {
    return {
      ...base,
      mode: 'orbit',
      amplitude: Math.max(base.amplitude, 0.05),
      speed: Math.max(base.speed, 0.08),
    };
  }
  return {
    ...base,
    mode: 'sweep',
    amplitude: Math.max(base.amplitude, 0.055),
    speed: Math.max(base.speed, 0.11),
  };
}

export function buildLayeredObstacleFields(
  baseFields: readonly PbdObstacleField[],
  options: PbdLayeredObstaclePresetOptions,
): PbdObstacleField[] {
  const fields = baseFields
    .filter((field) => field.radius > 0 && field.strength > 0)
    .map((field) => ({ ...field }));
  if (options.preset === 'manual') return fields;
  const extra: PbdObstacleField[] = [];
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    const phase = options.frame * 0.05 + index * 0.9;
    if (options.preset === 'staggered-arc') {
      extra.push({
        x: field.x + Math.cos(phase) * field.radius * 0.45,
        y: field.y + Math.sin(phase * 0.8) * field.radius * 0.3,
        radius: field.radius * 0.72,
        strength: field.strength * 0.62,
      });
      extra.push({
        x: field.x - Math.sin(phase) * field.radius * 0.4,
        y: field.y + Math.cos(phase * 0.6) * field.radius * 0.22,
        radius: field.radius * 0.55,
        strength: field.strength * 0.48,
      });
    } else if (options.preset === 'shear-lattice') {
      extra.push({
        x: field.x + field.radius * 0.38,
        y: field.y + Math.sin(phase) * field.radius * 0.2,
        radius: field.radius * 0.58,
        strength: field.strength * 0.55,
      });
      extra.push({
        x: field.x - field.radius * 0.34,
        y: field.y - Math.cos(phase * 0.7) * field.radius * 0.24,
        radius: field.radius * 0.52,
        strength: field.strength * 0.5,
      });
    }
  }
  return [...fields, ...extra];
}

export function applyMultiPinGroupPull(
  particles: PbdSharedParticle[],
  groups: readonly PbdPinGroupTarget[],
): number {
  let affected = 0;
  for (const group of groups) {
    for (const index of group.indices) {
      const particle = particles[index];
      if (!particle || particle.pinned) continue;
      particle.x += (group.x - particle.x) * group.strength;
      particle.y += (group.y - particle.y) * group.strength;
      affected += 1;
    }
  }
  return affected;
}
