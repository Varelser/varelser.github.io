import { bilerp, cellIndex, clamp } from './volumetric_density_transportShared';

export function computeLightingShadowAndMarch(
  density: Float32Array,
  obstacleMask: Float32Array,
  width: number,
  height: number,
  absorption: number,
  shadowStrength: number,
  marchSteps: number,
  scatterStrength = 0,
  scatterAnisotropy = 0,
): { lighting: Float32Array; shadow: Float32Array; lightMarch: Float32Array } {
  const lighting = new Float32Array(density.length);
  const shadow = new Float32Array(density.length);
  const lightMarch = new Float32Array(density.length);
  const scatterGain = clamp(scatterStrength, 0, 1.5);
  const anisotropyGain = clamp(scatterAnisotropy, 0, 1.5);
  for (let x = 0; x < width; x += 1) {
    let accumulated = 0;
    for (let y = height - 1; y >= 0; y -= 1) {
      const index = cellIndex(x, y, width);
      const verticalBias = height <= 1 ? 0 : y / (height - 1);
      accumulated += density[index] * absorption * (0.14 + scatterGain * 0.03) + obstacleMask[index] * (0.08 + shadowStrength * 0.12 + anisotropyGain * 0.04);
      const scatterLift = density[index] * scatterGain * (0.06 + anisotropyGain * 0.04 + verticalBias * 0.06);
      lighting[index] = clamp(Math.exp(-accumulated) + scatterLift, 0, 1.35);
      shadow[index] = clamp(accumulated * shadowStrength * 2.4, 0, 1.75);
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let transmittance = 1;
      let accumulation = 0;
      for (let step = 0; step < marchSteps; step += 1) {
        const sx = x + step * 0.45;
        const sy = y + step * 0.9;
        const sampledDensity = bilerp(density, width, height, sx, sy);
        const sampledObstacle = bilerp(obstacleMask, width, height, sx, sy);
        accumulation += sampledDensity * absorption * (0.16 + scatterGain * 0.04) + sampledObstacle * (0.24 + anisotropyGain * 0.04);
        transmittance *= Math.exp(-(sampledDensity * absorption * (0.08 + scatterGain * 0.02) + sampledObstacle * (0.18 + anisotropyGain * 0.04)));
      }
      const index = cellIndex(x, y, width);
      const forwardScatter = density[index] * scatterGain * 0.08 + anisotropyGain * 0.05;
      lightMarch[index] = clamp(lighting[index] * (0.68 + scatterGain * 0.06) + transmittance * (0.52 + anisotropyGain * 0.05) + forwardScatter - accumulation * 0.06, 0, 1.28);
    }
  }
  return { lighting, shadow, lightMarch };
}

export function computeSecondaryLightMarch(
  density: Float32Array,
  obstacleMask: Float32Array,
  width: number,
  height: number,
  absorption: number,
  marchSteps: number,
  scatterStrength = 0,
  scatterAnisotropy = 0,
): Float32Array {
  const lightMarchSecondary = new Float32Array(density.length);
  const scatterGain = clamp(scatterStrength, 0, 1.5);
  const anisotropyGain = clamp(scatterAnisotropy, 0, 1.5);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let transmittance = 1;
      let accumulation = 0;
      for (let step = 0; step < marchSteps + 1; step += 1) {
        const sx = x - step * 0.58;
        const sy = y + step * 0.76;
        const sampledDensity = bilerp(density, width, height, sx, sy);
        const sampledObstacle = bilerp(obstacleMask, width, height, sx, sy);
        accumulation += sampledDensity * absorption * (0.13 + scatterGain * 0.03) + sampledObstacle * (0.2 + anisotropyGain * 0.03);
        transmittance *= Math.exp(-(sampledDensity * absorption * (0.06 + scatterGain * 0.02) + sampledObstacle * (0.16 + anisotropyGain * 0.03)));
      }
      const index = cellIndex(x, y, width);
      lightMarchSecondary[index] = clamp(transmittance * (0.58 + anisotropyGain * 0.04) + Math.exp(-accumulation * 0.42) * (0.44 + scatterGain * 0.05) + density[index] * scatterGain * 0.05 - accumulation * 0.045, 0, 1.26);
    }
  }
  return lightMarchSecondary;
}

export function computeRimLight(
  lighting: Float32Array,
  lightMarchSecondary: Float32Array,
  obstacleMask: Float32Array,
  width: number,
  height: number,
  rimBoost = 0,
): Float32Array {
  const rimLight = new Float32Array(lighting.length);
  const boost = clamp(rimBoost, 0, 1.5);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = cellIndex(x, y, width);
      const left = obstacleMask[cellIndex(Math.max(0, x - 1), y, width)];
      const right = obstacleMask[cellIndex(Math.min(width - 1, x + 1), y, width)];
      const down = obstacleMask[cellIndex(x, Math.max(0, y - 1), width)];
      const up = obstacleMask[cellIndex(x, Math.min(height - 1, y + 1), width)];
      const edge = clamp((Math.abs(right - left) + Math.abs(up - down)) * 0.5, 0, 1);
      rimLight[index] = clamp(lightMarchSecondary[index] * (0.66 + boost * 0.06) + lighting[index] * (0.18 + boost * 0.04) + edge * (0.32 + obstacleMask[index] * 0.22 + boost * 0.16) - obstacleMask[index] * (0.1 - boost * 0.02), 0, 1.4);
    }
  }
  return rimLight;
}

export function computePressureField(
  density: Float32Array,
  obstacleMask: Float32Array,
  width: number,
  height: number,
  iterations: number,
  relaxation: number,
): Float32Array {
  const pressure = new Float32Array(density.length);
  const source = new Float32Array(density.length);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = cellIndex(x, y, width);
      source[index] =
        density[index] -
        (density[cellIndex(x - 1, y, width)] +
          density[cellIndex(x + 1, y, width)] +
          density[cellIndex(x, y - 1, width)] +
          density[cellIndex(x, y + 1, width)]) *
          0.25 +
        obstacleMask[index] * 0.08;
    }
  }
  for (let iter = 0; iter < iterations; iter += 1) {
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = cellIndex(x, y, width);
        const obstacleDamping = 1 - obstacleMask[index] * 0.28;
        const neighborMean =
          (pressure[cellIndex(x - 1, y, width)] +
            pressure[cellIndex(x + 1, y, width)] +
            pressure[cellIndex(x, y - 1, width)] +
            pressure[cellIndex(x, y + 1, width)]) *
          0.25;
        pressure[index] = (pressure[index] * (1 - relaxation) + (neighborMean + source[index]) * relaxation) * obstacleDamping;
      }
    }
  }
  return pressure;
}

export function computeVolumeDepth(
  density: Float32Array,
  lighting: Float32Array,
  shadow: Float32Array,
  lightMarchSecondary: Float32Array,
  rimLight: Float32Array,
  pressure: Float32Array,
  obstacleMask: Float32Array,
  depthScale: number,
): Float32Array {
  const volumeDepth = new Float32Array(density.length);
  for (let index = 0; index < density.length; index += 1) {
    const densityLift = density[index] * (12 + lighting[index] * 6 + lightMarchSecondary[index] * 2.2 + rimLight[index] * 1.4);
    const pressureLift = Math.abs(pressure[index]) * 2.0;
    const occlusionDrop = shadow[index] * 0.04 + obstacleMask[index] * 0.08 - rimLight[index] * 0.018;
    volumeDepth[index] = clamp((densityLift + pressureLift - occlusionDrop) * depthScale, 0, 1.6);
  }
  return volumeDepth;
}
