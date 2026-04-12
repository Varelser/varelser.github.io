import assert from 'node:assert/strict';
import { DataTexture, FloatType, RGBAFormat } from 'three';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import { resolveGpgpuFrameRouting } from '../../components/gpgpuExecutionRouting';

function makeTexture() {
  const data = new Float32Array(4 * 4);
  const texture = new DataTexture(data, 2, 2, RGBAFormat, FloatType);
  texture.needsUpdate = true;
  return texture;
}

function makeFallbackTexture() {
  return { texture: makeTexture() } as const;
}

export async function main() {
  const fallbackPos = makeFallbackTexture();
  const fallbackVel = makeFallbackTexture();

  const unsupportedConfig = {
    ...DEFAULT_CONFIG,
    gpgpuEnabled: true,
    gpgpuExecutionPreference: 'webgpu' as const,
    gpgpuWebGPUEnabled: true,
    gpgpuAudioReactive: true,
  };

  const unsupportedRouting = resolveGpgpuFrameRouting({
    config: unsupportedConfig,
    webgpuState: null,
    webgpuPosTexture: null,
    webgpuVelTexture: null,
    fallbackPosTexture: fallbackPos.texture,
    fallbackVelTexture: fallbackVel.texture,
    webgpuInitStatus: 'ready',
  });
  assert.equal(unsupportedRouting.useWebGPU, false);
  assert.equal(unsupportedRouting.webgpuStatus, 'unavailable');
  assert.match(unsupportedRouting.execution.reason, /outside compute capability/);
  assert.match(unsupportedRouting.execution.notes.join(' '), /config blocker/);

  const warmingConfig = {
    ...DEFAULT_CONFIG,
    gpgpuEnabled: true,
    gpgpuExecutionPreference: 'webgpu' as const,
    gpgpuWebGPUEnabled: true,
    gpgpuAudioReactive: false,
    gpgpuAgeEnabled: false,
    gpgpuVerletEnabled: false,
    gpgpuNBodyEnabled: false,
    gpgpuCurlEnabled: false,
    gpgpuBoidsEnabled: false,
    gpgpuAttractorEnabled: false,
    gpgpuVortexEnabled: false,
    gpgpuWindEnabled: false,
    gpgpuWellEnabled: false,
    gpgpuElasticEnabled: false,
    gpgpuMagneticEnabled: false,
    gpgpuSphEnabled: false,
    gpgpuVFieldEnabled: false,
    gpgpuSpringEnabled: false,
    gpgpuSdfEnabled: false,
    gpgpuMouseEnabled: false,
    gpgpuFluidEnabled: false,
  };

  const warmingRouting = resolveGpgpuFrameRouting({
    config: warmingConfig,
    webgpuState: null,
    webgpuPosTexture: null,
    webgpuVelTexture: null,
    fallbackPosTexture: fallbackPos.texture,
    fallbackVelTexture: fallbackVel.texture,
    webgpuInitStatus: 'initializing',
  });
  assert.equal(warmingRouting.webgpuStatus, 'initializing');

  fallbackPos.texture.dispose();
  fallbackVel.texture.dispose();
}
