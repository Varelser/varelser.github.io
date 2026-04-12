import { createVolumetricDensityTransportRuntimeFromInput } from '../../lib/future-native-families/starter-runtime/volumetric_density_transportAdapter';
import { buildVolumetricDensityTransportDebugRenderPayload } from '../../lib/future-native-families/starter-runtime/volumetric_density_transportRenderer';
import {
  getVolumetricDensityTransportStats,
  simulateVolumetricDensityTransportRuntime,
  type VolumetricDensityTransportRuntimeState,
  type VolumetricDensityTransportStats,
} from '../../lib/future-native-families/starter-runtime/volumetric_density_transportSolver';

export function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

export const volumetricVerificationInput = {
  resolutionX: 18,
  resolutionY: 22,
  injectionRate: 0.22,
  injectionRadius: 0.14,
  advectionStrength: 0.88,
  buoyancy: 0.2,
  swirlStrength: 0.46,
  pressureRelaxation: 0.25,
  pressureIterations: 5,
  boundaryFade: 0.1,
  dissipation: 0.018,
  lightAbsorption: 0.48,
  shadowStrength: 0.62,
  obstacleX: -0.04,
  obstacleY: -0.08,
  obstacleRadius: 0.16,
  obstacleStrength: 0.52,
  obstacleSoftness: 0.18,
  lightMarchSteps: 7,
  depthLayers: 4,
  volumeDepthScale: 0.72,
};

export interface VolumetricDensityTransportVerificationBundle {
  initialA: VolumetricDensityTransportRuntimeState;
  initialB: VolumetricDensityTransportRuntimeState;
  runtimeA: VolumetricDensityTransportRuntimeState;
  runtimeB: VolumetricDensityTransportRuntimeState;
  initialStats: VolumetricDensityTransportStats;
  stats: VolumetricDensityTransportStats;
  render: ReturnType<typeof buildVolumetricDensityTransportDebugRenderPayload>;
}

function serializeFloatArray(values: Float32Array): string {
  return JSON.stringify(Array.from(values));
}

export function createVolumetricDensityTransportVerificationBundle(): VolumetricDensityTransportVerificationBundle {
  const initialA = createVolumetricDensityTransportRuntimeFromInput(volumetricVerificationInput);
  const initialB = createVolumetricDensityTransportRuntimeFromInput(volumetricVerificationInput);
  assert(serializeFloatArray(initialA.density) === serializeFloatArray(initialB.density), 'volumetric seed must be deterministic');

  const initialStats = getVolumetricDensityTransportStats(initialA);
  const runtimeA = simulateVolumetricDensityTransportRuntime(initialA, 80);
  const runtimeB = simulateVolumetricDensityTransportRuntime(initialB, 80);
  assert(serializeFloatArray(runtimeA.density) === serializeFloatArray(runtimeB.density), 'volumetric stepping must be deterministic');

  return {
    initialA,
    initialB,
    runtimeA,
    runtimeB,
    initialStats,
    stats: getVolumetricDensityTransportStats(runtimeA),
    render: buildVolumetricDensityTransportDebugRenderPayload(runtimeA),
  };
}

export function runVolumetricVerificationBand(
  name: string,
  verify: (bundle: VolumetricDensityTransportVerificationBundle) => void,
  bundle: VolumetricDensityTransportVerificationBundle,
): void {
  try {
    verify(bundle);
  } catch (error) {
    if (error instanceof Error) {
      error.message = `[${name}] ${error.message}`;
    }
    throw error;
  }
}
