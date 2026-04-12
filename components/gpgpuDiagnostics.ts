import type { MutableRefObject, RefObject } from 'react';
import type { WebGLRenderTarget, WebGLRenderer } from 'three';
import type { GpgpuFrameRouting } from './gpgpuExecutionRouting';
import type { GpgpuTransformFeedbackNativeCapturePassSnapshot } from '../lib/gpgpuTransformFeedbackNativeCapturePass';

export type GpgpuFrameDiagnosticSnapshot = {
  backend: string;
  requestedBackend: string;
  path: string;
  reason: string;
  capabilityFlags: string[];
  notes: string[];
  features: string[];
  unsupportedFeatures: string[];
  readbackMode: GpgpuFrameRouting['readbackMode'];
  webgpuStatus: GpgpuFrameRouting['webgpuStatus'];
  nativeTransformFeedbackPass: GpgpuTransformFeedbackNativeCapturePassSnapshot | null;
};

export function createGpgpuFrameDiagnosticSnapshot(
  routing: GpgpuFrameRouting,
  nativeTransformFeedbackPass: GpgpuTransformFeedbackNativeCapturePassSnapshot | null = null,
): GpgpuFrameDiagnosticSnapshot {
  const notes = [
    ...routing.execution.notes,
    ...(nativeTransformFeedbackPass?.execution === 'source-textures-unavailable'
      ? ['native transform feedback pass resources exist, but source textures are not yet exposed as native handles']
      : []),
    ...(nativeTransformFeedbackPass?.resourcesAllocated === true
      && nativeTransformFeedbackPass?.execution !== 'native-capture-issued'
      ? ['native transform feedback pass resources exist, but a real capture issue has not been observed yet']
      : []),
  ];
  return {
    backend: routing.execution.resolvedEngine,
    requestedBackend: routing.execution.requestedEngine,
    path: routing.execution.path,
    reason: routing.execution.reason,
    capabilityFlags: routing.execution.capabilityFlags,
    notes,
    features: routing.foundation.features,
    unsupportedFeatures: routing.foundation.unsupportedFeatures,
    readbackMode: routing.readbackMode,
    webgpuStatus: routing.webgpuStatus,
    nativeTransformFeedbackPass,
  };
}

export function readbackParticlePositions(args: {
  routing: GpgpuFrameRouting;
  gl: WebGLRenderer;
  posOut: WebGLRenderTarget;
  texSize: number;
  posReadbackRef?: RefObject<Float32Array | null>;
  posReadbackVersionRef?: MutableRefObject<number>;
}): void {
  const { routing, gl, posOut, texSize, posReadbackRef, posReadbackVersionRef } = args;
  if (!posReadbackRef || routing.readbackMode !== 'webgl-readback') return;

  const count = texSize * texSize;
  if (!posReadbackRef.current || posReadbackRef.current.length !== count * 4) {
    (posReadbackRef as MutableRefObject<Float32Array | null>).current = new Float32Array(count * 4);
  }
  gl.readRenderTargetPixels(posOut, 0, 0, texSize, texSize, posReadbackRef.current!);
  if (posReadbackVersionRef) {
    posReadbackVersionRef.current += 1;
  }
}
