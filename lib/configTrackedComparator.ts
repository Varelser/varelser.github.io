import type { ParticleConfig } from '../types';

export function areConfigsEqualByTrackedKeys(
  previous: ParticleConfig,
  next: ParticleConfig,
  {
    exactKeys = [],
    prefixes = [],
  }: {
    exactKeys?: readonly (keyof ParticleConfig)[];
    prefixes?: readonly string[];
  },
) {
  if (previous === next) return true;

  for (const key of exactKeys) {
    if (previous[key] !== next[key]) {
      return false;
    }
  }

  if (prefixes.length === 0) {
    return true;
  }

  const keys = Object.keys(previous) as Array<keyof ParticleConfig>;
  for (const key of keys) {
    const name = String(key);
    if (!prefixes.some((prefix) => name.startsWith(prefix))) continue;
    if (previous[key] !== next[key]) {
      return false;
    }
  }

  return true;
}
