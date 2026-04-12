import type { ParticleConfig } from '../types';
import { DEFAULT_CONFIG, normalizeConfig } from './appStateConfig';

const DEFAULT_NORMALIZED_CONFIG = normalizeConfig(DEFAULT_CONFIG);

export function isHydrationPlaceholderConfig(config: ParticleConfig) {
  return JSON.stringify(config) === JSON.stringify(DEFAULT_NORMALIZED_CONFIG);
}
