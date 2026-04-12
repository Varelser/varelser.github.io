import assert from 'node:assert/strict';
import { normalizeVolumetricDensityTransportConfig } from '../../lib/future-native-families/starter-runtime/volumetric_density_transportAdapter';
import {
  createVolumetricDensityTransportRuntimeState,
  getVolumetricDensityTransportDerivedFieldsView,
  getVolumetricDensityTransportStats,
  stepVolumetricDensityTransportRuntime,
} from '../../lib/future-native-families/starter-runtime/volumetric_density_transportSolver';

function getArrayPeak(values: Float32Array) {
  let peak = 0;
  for (let index = 0; index < values.length; index += 1) {
    peak = Math.max(peak, values[index] ?? 0);
  }
  return peak;
}

export async function main() {
  const config = normalizeVolumetricDensityTransportConfig({
    resolutionX: 12,
    resolutionY: 12,
  });

  const runtime = createVolumetricDensityTransportRuntimeState(config);
  const derived = getVolumetricDensityTransportDerivedFieldsView(runtime);
  assert.equal(derived.plumeAnisotropy, runtime.plumeAnisotropy);
  assert.equal(derived.obstacleWake, runtime.obstacleWake);
  assert.equal(derived.vortexPacketLayerNear, runtime.vortexPacketLayerNear);
  assert.ok(getArrayPeak(runtime.plumeAnisotropy) > 0);
  assert.ok(getArrayPeak(runtime.obstacleWake) > 0);

  const stepped = stepVolumetricDensityTransportRuntime(runtime);
  const steppedDerived = getVolumetricDensityTransportDerivedFieldsView(stepped);
  assert.equal(steppedDerived.plumeBranchLeft, stepped.plumeBranchLeft);
  assert.equal(steppedDerived.primaryObstacleWake, stepped.primaryObstacleWake);
  assert.equal(steppedDerived.vortexPacketLayerFar, stepped.vortexPacketLayerFar);
  assert.ok(getArrayPeak(stepped.vortexPacketLayerNear) > 0);

  const mutated = {
    ...runtime,
    plumeAnisotropy: runtime.plumeAnisotropy.slice(),
  };
  mutated.plumeAnisotropy[0] = 9;
  const stats = getVolumetricDensityTransportStats(mutated);
  assert.equal(stats.plumeAnisotropyPeak, 9);
}
