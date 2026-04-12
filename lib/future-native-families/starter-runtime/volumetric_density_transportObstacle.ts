import type { VolumetricDensityTransportNormalizedConfig } from './volumetric_density_transportSchema';
import { cellIndex, clamp } from './volumetric_density_transportShared';

function buildObstacleLayer(
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  radius: number,
  softness: number,
  strength: number,
  wakeDirection: number,
): Float32Array {
  const mask = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dx = x - centerX;
      const dy = y - centerY;
      const radialDistance = Math.hypot(dx, dy);
      const radial = clamp(1 - (radialDistance - radius) / softness, 0, 1);
      const plumeDx = (dx * wakeDirection) / Math.max(1, radius * 1.24);
      const plumeDy = (y - centerY) / Math.max(1, radius * 1.92);
      const wake = plumeDy > -0.08 ? clamp((1 - Math.abs(plumeDx)) * (plumeDy + 0.12), 0, 1) * (0.24 + strength * 0.22) : 0;
      const wedge = y > centerY ? clamp(1 - Math.abs(dx) / Math.max(1, radius * 0.78), 0, 1) * 0.16 : 0;
      const shoulder = plumeDy < 0
        ? clamp(1 - Math.abs(dx) / Math.max(1, radius * 0.94), 0, 1) * clamp(1 - Math.abs(dy) / Math.max(1, radius * 1.18), 0, 1) * 0.1
        : 0;
      mask[cellIndex(x, y, width)] = clamp(radial * strength + wake + wedge + shoulder, 0, 1);
    }
  }
  return mask;
}

export function buildObstacleMasks(config: VolumetricDensityTransportNormalizedConfig): {
  primary: Float32Array;
  secondary: Float32Array;
  combined: Float32Array;
} {
  const width = config.resolutionX;
  const height = config.resolutionY;
  const radius = Math.max(1.2, config.obstacleRadius * Math.min(width, height));
  const softness = Math.max(0.6, config.obstacleSoftness * Math.min(width, height));
  const primaryCenterX = (width - 1) * (0.5 + config.obstacleX * 0.35);
  const primaryCenterY = (height - 1) * (0.42 + config.obstacleY * 0.3);
  const secondaryCenterX = (width - 1) * clamp(0.5 - config.obstacleX * 0.28 + (config.obstacleX <= 0 ? 0.18 : -0.18), 0.14, 0.86);
  const secondaryCenterY = (height - 1) * clamp(0.57 - config.obstacleY * 0.22, 0.24, 0.82);
  const primary = buildObstacleLayer(
    width,
    height,
    primaryCenterX,
    primaryCenterY,
    radius,
    softness,
    config.obstacleStrength,
    config.obstacleX <= 0 ? 1 : -1,
  );
  const secondary = buildObstacleLayer(
    width,
    height,
    secondaryCenterX,
    secondaryCenterY,
    Math.max(0.9, radius * 0.72),
    Math.max(0.5, softness * 0.88),
    clamp(config.obstacleStrength * 0.74, 0, 1),
    config.obstacleX <= 0 ? -1 : 1,
  );
  const combined = new Float32Array(width * height);
  for (let index = 0; index < combined.length; index += 1) {
    combined[index] = clamp(Math.max(primary[index], secondary[index]), 0, 1);
  }
  return { primary, secondary, combined };
}

export function applyObstacleField(
  density: Float32Array,
  velocityX: Float32Array,
  velocityY: Float32Array,
  obstacleMask: Float32Array,
  width: number,
  height: number,
  obstacleStrength: number,
): void {
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = cellIndex(x, y, width);
      const mask = obstacleMask[index];
      if (mask <= 1e-4) continue;
      const gradX = obstacleMask[cellIndex(x + 1, y, width)] - obstacleMask[cellIndex(x - 1, y, width)];
      const gradY = obstacleMask[cellIndex(x, y + 1, width)] - obstacleMask[cellIndex(x, y - 1, width)];
      const tangentialX = gradY;
      const tangentialY = -gradX;
      density[index] *= 1 - mask * (0.52 + obstacleStrength * 0.18);
      velocityX[index] = velocityX[index] * (1 - mask * 0.68) + tangentialX * (0.08 + obstacleStrength * 0.1);
      velocityY[index] = velocityY[index] * (1 - mask * 0.52) + tangentialY * (0.08 + obstacleStrength * 0.08);
    }
  }
}
