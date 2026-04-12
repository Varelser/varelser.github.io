import assert from 'node:assert/strict';
import { getWebgpuComputeCapabilityReport } from '../../lib/webgpuComputeFoundation';
import { getWebgpuSphQualityProfile } from '../../lib/webgpuCompute';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';

export async function main() {
  const curlWind = getWebgpuComputeCapabilityReport({
    ...DEFAULT_CONFIG,
    gpgpuEnabled: true,
    gpgpuWebGPUEnabled: true,
    gpgpuCurlEnabled: true,
    gpgpuWindEnabled: true,
  });
  assert.equal(curlWind.canRunRequestedConfig, true);
  assert.deepEqual(curlWind.unsupportedFeatures, []);

  const vectorField = getWebgpuComputeCapabilityReport({
    ...DEFAULT_CONFIG,
    gpgpuEnabled: true,
    gpgpuWebGPUEnabled: true,
    gpgpuCurlEnabled: true,
    gpgpuWindEnabled: true,
    gpgpuVFieldEnabled: true,
  });
  assert.equal(vectorField.canRunRequestedConfig, true);
  assert.deepEqual(vectorField.unsupportedFeatures, []);

  const vectorFieldWellVortex = getWebgpuComputeCapabilityReport({
    ...DEFAULT_CONFIG,
    gpgpuEnabled: true,
    gpgpuWebGPUEnabled: true,
    gpgpuCurlEnabled: true,
    gpgpuWindEnabled: true,
    gpgpuVFieldEnabled: true,
    gpgpuWellEnabled: true,
    gpgpuVortexEnabled: true,
    gpgpuAttractorEnabled: true,
  });
  assert.equal(vectorFieldWellVortex.canRunRequestedConfig, true);
  assert.deepEqual(vectorFieldWellVortex.unsupportedFeatures, []);

  const mixed = getWebgpuComputeCapabilityReport({
    ...DEFAULT_CONFIG,
    gpgpuEnabled: true,
    gpgpuWebGPUEnabled: true,
    gpgpuCurlEnabled: true,
    gpgpuWindEnabled: true,
    gpgpuVFieldEnabled: true,
    gpgpuWellEnabled: true,
    gpgpuBoidsEnabled: true,
    gpgpuSphEnabled: true,
    gpgpuSphPressure: 3.2,
    gpgpuSphViscosity: 0.55,
    gpgpuSphRadius: 40,
    gpgpuSphRestDensity: 2.0,
  });
  assert.equal(mixed.canRunRequestedConfig, true);
  assert.deepEqual(mixed.unsupportedFeatures, []);
  const fullFieldPlusBoids = getWebgpuComputeCapabilityReport({
    ...DEFAULT_CONFIG,
    gpgpuEnabled: true,
    gpgpuWebGPUEnabled: true,
    gpgpuCurlEnabled: true,
    gpgpuWindEnabled: true,
    gpgpuVFieldEnabled: true,
    gpgpuWellEnabled: true,
    gpgpuVortexEnabled: true,
    gpgpuAttractorEnabled: true,
    gpgpuMouseEnabled: true,
    gpgpuFluidEnabled: true,
    gpgpuBoidsEnabled: true,
    gpgpuSphEnabled: true,
    gpgpuSphPressure: 3.2,
    gpgpuSphViscosity: 0.55,
    gpgpuSphRadius: 40,
    gpgpuSphRestDensity: 2.0,
  });
  assert.equal(fullFieldPlusBoids.canRunRequestedConfig, true);
  assert.deepEqual(fullFieldPlusBoids.unsupportedFeatures, []);

  const lightSph = getWebgpuSphQualityProfile({
    pressure: 2.6,
    viscosity: 0.45,
    radius: 42,
    restDensity: 2.0,
  });
  assert.equal(lightSph.sampleCount, 24);
  assert.ok(lightSph.flowClampScale >= 0.14 && lightSph.flowClampScale <= 0.24);
  assert.ok(lightSph.cohesionStrength >= 0.14 && lightSph.cohesionStrength <= 0.34);

  const denseSph = getWebgpuSphQualityProfile({
    pressure: 6.2,
    viscosity: 1.35,
    radius: 160,
    restDensity: 2.6,
  });
  assert.equal(denseSph.sampleCount, 48);
  assert.ok(denseSph.flowClampScale > lightSph.flowClampScale);
  assert.ok(denseSph.cohesionStrength > lightSph.cohesionStrength);

}
