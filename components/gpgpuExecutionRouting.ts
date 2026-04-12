import type { RefObject } from 'react';
import type { Texture, WebGLRenderTarget } from 'three';
import type { ParticleConfig, ProjectExecutionRoutingSnapshot } from '../types';
import { resolveGpgpuExecutionFoundation } from '../lib/gpgpuExecutionFoundation';
import { getProjectExecutionRoutingEntry } from '../lib/projectExecutionRouting';
import type { WebGPUComputeState } from '../lib/webgpuCompute';
import type { WebgpuRuntimeInitStatus } from './useGpgpuRuntime';

type PingPongTargets = {
  posA: WebGLRenderTarget;
  posB: WebGLRenderTarget;
  velA: WebGLRenderTarget;
  velB: WebGLRenderTarget;
};

export type GpgpuReadbackMode = 'none' | 'webgl-readback' | 'webgpu-readback' | 'webgpu-skip';

export type GpgpuFrameRouting = {
  foundation: ReturnType<typeof resolveGpgpuExecutionFoundation>;
  execution: ProjectExecutionRoutingSnapshot;
  useWebGPU: boolean;
  webgpuStatus: WebgpuRuntimeInitStatus | 'fallback-active';
  outputPosTexture: Texture;
  outputVelTexture: Texture;
  readbackMode: GpgpuReadbackMode;
};

export function getGpgpuCpuReadbackFrameStride(config: ParticleConfig) {
  const smoothTubeStride = config.gpgpuSmoothTubeEnabled
    ? (config.renderQuality === 'cinematic' ? 1 : config.renderQuality === 'draft' ? 3 : 2)
    : 0;
  const metaballStride = config.gpgpuMetaballEnabled
    ? Math.max(1, Math.round(config.gpgpuMetaballUpdateSkip))
    : 0;

  if (smoothTubeStride > 0 && metaballStride > 0) {
    return Math.min(smoothTubeStride, metaballStride);
  }
  return Math.max(smoothTubeStride, metaballStride);
}

export function shouldRequestGpgpuCpuReadback(config: ParticleConfig, frameCount: number) {
  const stride = getGpgpuCpuReadbackFrameStride(config);
  if (stride <= 0) {
    return false;
  }
  return frameCount % stride === 0;
}

export function resolvePingPongTargets(buffers: PingPongTargets, pingIsA: boolean) {
  return {
    isA: pingIsA,
    posIn: pingIsA ? buffers.posA : buffers.posB,
    posOut: pingIsA ? buffers.posB : buffers.posA,
    velIn: pingIsA ? buffers.velA : buffers.velB,
    velOut: pingIsA ? buffers.velB : buffers.velA,
  };
}

export function resolveGpgpuAudioBlast(
  config: ParticleConfig,
  audioLevels: { bass: number; pulse: number },
): number {
  if (!config.gpgpuAudioReactive || !config.audioEnabled) return 0;
  return (audioLevels.bass * 0.55 + audioLevels.pulse * 0.9) * config.gpgpuAudioBlast;
}

export function resolveGpgpuFrameRouting(args: {
  config: ParticleConfig;
  webgpuState: WebGPUComputeState | null;
  webgpuPosTexture: Texture | null;
  webgpuVelTexture: Texture | null;
  fallbackPosTexture: Texture;
  fallbackVelTexture: Texture;
  posReadbackRef?: RefObject<Float32Array | null>;
  webgpuInitStatus?: WebgpuRuntimeInitStatus;
}): GpgpuFrameRouting {
  const {
    config,
    webgpuState,
    webgpuPosTexture,
    webgpuVelTexture,
    fallbackPosTexture,
    fallbackVelTexture,
    posReadbackRef,
    webgpuInitStatus = 'idle',
  } = args;
  const webgpuAvailable = webgpuState !== null && webgpuPosTexture !== null && webgpuVelTexture !== null;
  const foundationBase = resolveGpgpuExecutionFoundation(config, {
    webgpuAvailable,
  });
  const executionBase = getProjectExecutionRoutingEntry(config, 'gpgpu', {
    gpgpuWebgpuAvailable: webgpuAvailable,
  }) ?? {
    key: 'gpgpu',
    label: 'GPGPU',
    enabled: config.gpgpuEnabled,
    mode: foundationBase.features.includes('metaball') ? 'metaball' : foundationBase.path,
    renderClass: foundationBase.features.includes('metaball') ? 'metaball-surface' : 'gpu-particles',
    simulationClass: foundationBase.backend,
    requestedEngine: foundationBase.requestedBackend,
    resolvedEngine: foundationBase.backend,
    path: foundationBase.path,
    overrideId: 'auto',
    proceduralSystemId: null,
    hybridKind: foundationBase.backend === 'webgpu-compute' ? 'compute' : null,
    capabilityFlags: [],
    reason: foundationBase.reason,
    notes: [],
  };

  let foundation = {
    ...foundationBase,
    features: [...foundationBase.features],
    supportedFeatures: [...foundationBase.supportedFeatures],
    unsupportedFeatures: [...foundationBase.unsupportedFeatures],
  };
  let execution: ProjectExecutionRoutingSnapshot = {
    ...executionBase,
    notes: [...(executionBase.notes ?? [])],
    capabilityFlags: [...(executionBase.capabilityFlags ?? [])],
    sceneBranches: [...(executionBase.sceneBranches ?? [])],
  };

  const useWebGPU = execution.resolvedEngine === 'webgpu-compute'
    && webgpuState !== null
    && webgpuPosTexture !== null
    && webgpuVelTexture !== null;
  const requestedWebGPU = execution.requestedEngine === 'webgpu-compute' || foundation.requestedBackend === 'webgpu-compute';
  const webgpuBlockedByConfig = requestedWebGPU && foundation.unsupportedFeatures.length > 0;
  const webgpuStatus: WebgpuRuntimeInitStatus | 'fallback-active' = useWebGPU
    ? 'ready'
    : webgpuBlockedByConfig
      ? 'unavailable'
      : (requestedWebGPU && webgpuInitStatus === 'ready' ? 'fallback-active' : webgpuInitStatus);

  if (requestedWebGPU && !useWebGPU) {
    if (webgpuBlockedByConfig) {
      execution = {
        ...execution,
        reason: 'webgpu requested, but current config is outside compute capability; staying on webgl route',
        notes: [...execution.notes, `webgpu config blocker: ${foundation.unsupportedFeatures.join(', ')}`],
      };
      foundation = {
        ...foundation,
        reason: `webgpu requested, config blocked by unsupported features (${foundation.unsupportedFeatures.join(', ')})`,
      };
    } else if (webgpuInitStatus === 'initializing') {
      execution = {
        ...execution,
        reason: 'webgpu requested, temporarily using webgl while runtime initializes',
        notes: [...execution.notes, 'webgpu runtime: initializing'],
      };
      foundation = {
        ...foundation,
        reason: 'webgpu requested, waiting for runtime init',
      };
    } else if (webgpuInitStatus === 'unavailable') {
      execution = {
        ...execution,
        notes: [...execution.notes, 'webgpu runtime: unavailable on this device/browser'],
      };
    } else if (webgpuInitStatus === 'failed') {
      execution = {
        ...execution,
        notes: [...execution.notes, 'webgpu runtime: initialization failed; using webgl fallback'],
      };
    }
  }

  const requiresCpuPositionReadback = config.gpgpuMetaballEnabled || config.gpgpuSmoothTubeEnabled;
  const readbackMode: GpgpuReadbackMode = !posReadbackRef
    ? 'none'
    : useWebGPU
      ? (requiresCpuPositionReadback ? 'webgpu-readback' : 'webgpu-skip')
      : requiresCpuPositionReadback
        ? 'webgl-readback'
        : 'none';

  return {
    foundation,
    execution,
    useWebGPU,
    webgpuStatus,
    outputPosTexture: useWebGPU && webgpuPosTexture ? webgpuPosTexture : fallbackPosTexture,
    outputVelTexture: useWebGPU && webgpuVelTexture ? webgpuVelTexture : fallbackVelTexture,
    readbackMode,
  };
}
