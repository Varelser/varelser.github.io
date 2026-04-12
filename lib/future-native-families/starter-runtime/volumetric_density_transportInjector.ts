import type { VolumetricDensityTransportNormalizedConfig } from './volumetric_density_transportSchema';
import type { VolumetricDensityTransportRuntimeState } from './volumetric_density_transportState';
import { cellIndex } from './volumetric_density_transportShared';

export function computeInjectorLayers(
  config: VolumetricDensityTransportNormalizedConfig,
  obstacleMask: Float32Array,
): { secondary: Float32Array; tertiary: Float32Array; coupling: Float32Array } {
  const width = config.resolutionX;
  const height = config.resolutionY;
  const secondary = new Float32Array(width * height);
  const tertiary = new Float32Array(width * height);
  const coupling = new Float32Array(width * height);
  const radius = Math.max(1.2, config.injectionRadius * Math.min(width, height) * 0.82);
  const densityGain = Math.max(0.2, config.smokeDensityGain ?? 1);
  const liftBias = Math.max(0, config.smokeLiftBias ?? 0.5);
  const centers = [
    { x: (width - 1) * 0.32, y: (height - 1) * (0.16 - liftBias * 0.025), swirl: -1 },
    { x: (width - 1) * 0.68, y: (height - 1) * (0.15 - liftBias * 0.03), swirl: 1 },
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = cellIndex(x, y, width);
      const open = 1 - obstacleMask[index] * 0.7;
      if (open <= 0.02) continue;
      const dxA = x - centers[0].x;
      const dyA = y - centers[0].y;
      const dxB = x - centers[1].x;
      const dyB = y - centers[1].y;
      const falloffA = Math.max(0, 1 - Math.hypot(dxA, dyA) / radius);
      const falloffB = Math.max(0, 1 - Math.hypot(dxB, dyB) / radius);
      secondary[index] = falloffA * open * (0.72 + densityGain * 0.28);
      tertiary[index] = falloffB * open * (0.72 + densityGain * 0.28);
      const centerBlend = Math.max(0, 1 - Math.abs(x / Math.max(1, width - 1) - 0.5) / 0.28);
      const rise = Math.max(0, Math.min(1, (y / Math.max(1, height - 1) - (0.08 - liftBias * 0.03)) / 0.72));
      coupling[index] = Math.max(0, Math.min(1.9, Math.sqrt(falloffA * falloffB) * (0.5 + centerBlend * 0.9 + rise * (0.4 + liftBias * 0.24)) * open * (0.82 + densityGain * 0.18)));
    }
  }
  return { secondary, tertiary, coupling };
}

export function applyInitialInjection(
  config: VolumetricDensityTransportNormalizedConfig,
  density: Float32Array,
  velocityX: Float32Array,
  velocityY: Float32Array,
  obstacleMask: Float32Array,
): void {
  const densityGain = Math.max(0.2, config.smokeDensityGain ?? 1);
  const liftBias = Math.max(0, config.smokeLiftBias ?? 0.5);
  const injectorX = (config.resolutionX - 1) * 0.5;
  const injectorY = (config.resolutionY - 1) * (0.2 - liftBias * 0.035);
  const radius = Math.max(1.5, config.injectionRadius * Math.min(config.resolutionX, config.resolutionY));
  for (let y = 0; y < config.resolutionY; y += 1) {
    for (let x = 0; x < config.resolutionX; x += 1) {
      const dx = x - injectorX;
      const dy = y - injectorY;
      const dist = Math.hypot(dx, dy);
      const falloff = Math.max(0, 1 - dist / radius);
      if (falloff <= 0) continue;
      const index = cellIndex(x, y, config.resolutionX);
      const openFactor = 1 - obstacleMask[index] * 0.82;
      if (openFactor <= 0.02) continue;
      density[index] = config.injectionRate * falloff * openFactor * densityGain;
      velocityX[index] = (-dy / Math.max(1, radius)) * config.swirlStrength * 0.05 * openFactor;
      velocityY[index] = (0.42 + falloff * (0.54 + liftBias * 0.18)) * config.advectionStrength * openFactor;
      const sideLeft = Math.max(0, 1 - Math.hypot(x - (config.resolutionX - 1) * 0.32, y - (config.resolutionY - 1) * 0.14) / Math.max(1, radius * 0.82));
      const sideRight = Math.max(0, 1 - Math.hypot(x - (config.resolutionX - 1) * 0.68, y - (config.resolutionY - 1) * 0.13) / Math.max(1, radius * 0.82));
      const coupling = Math.sqrt(sideLeft * sideRight);
      density[index] += config.injectionRate * (sideLeft + sideRight) * 0.045 * openFactor * densityGain + config.injectionRate * coupling * 0.06 * openFactor * densityGain;
      velocityX[index] += (sideRight - sideLeft) * config.swirlStrength * 0.045 * openFactor;
      velocityY[index] += (sideLeft + sideRight + coupling) * config.advectionStrength * (0.06 + liftBias * 0.05) * openFactor;
    }
  }
}

export function injectDensityAndVelocity(state: VolumetricDensityTransportRuntimeState): void {
  const { config, density, velocityX, velocityY, obstacleMask } = state;
  const width = config.resolutionX;
  const height = config.resolutionY;
  const densityGain = Math.max(0.2, config.smokeDensityGain ?? 1);
  const liftBias = Math.max(0, config.smokeLiftBias ?? 0.5);
  const injectorX = (width - 1) * 0.5;
  const injectorY = (height - 1) * (0.18 - liftBias * 0.03);
  const radius = Math.max(1.5, config.injectionRadius * Math.min(width, height));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dx = x - injectorX;
      const dy = y - injectorY;
      const dist = Math.hypot(dx, dy);
      const falloff = Math.max(0, 1 - dist / radius);
      if (falloff <= 0) continue;
      const index = cellIndex(x, y, width);
      const openFactor = 1 - obstacleMask[index] * 0.76;
      if (openFactor <= 0.02) continue;
      density[index] += config.injectionRate * falloff * 0.12 * openFactor * densityGain;
      velocityX[index] += (-dy / Math.max(1, radius)) * config.swirlStrength * 0.04 * falloff * openFactor;
      velocityY[index] += (0.24 + falloff * (0.3 + liftBias * 0.16)) * config.advectionStrength * 0.12 * openFactor;
      const sideLeft = Math.max(0, 1 - Math.hypot(x - (width - 1) * 0.32, y - (height - 1) * 0.14) / Math.max(1, radius * 0.82));
      const sideRight = Math.max(0, 1 - Math.hypot(x - (width - 1) * 0.68, y - (height - 1) * 0.13) / Math.max(1, radius * 0.82));
      const coupling = Math.sqrt(sideLeft * sideRight);
      density[index] += config.injectionRate * (sideLeft + sideRight) * 0.028 * openFactor * densityGain + config.injectionRate * coupling * 0.04 * openFactor * densityGain;
      velocityX[index] += (sideRight - sideLeft) * config.swirlStrength * 0.035 * openFactor;
      velocityY[index] += (sideLeft + sideRight + coupling) * config.advectionStrength * (0.04 + liftBias * 0.035) * openFactor;
    }
  }
}
