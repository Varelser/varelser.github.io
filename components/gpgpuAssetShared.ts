import { FloatType, NearestFilter, PlaneGeometry, RGBAFormat, Scene, WebGLRenderTarget } from "three";
import type { ParticleConfig } from "../types";

export function makeRT(size: number): WebGLRenderTarget {
  return new WebGLRenderTarget(size, size, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    type: FloatType,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

export type UseGpgpuAssetsArgs = {
  config: ParticleConfig;
  texSize: number;
  simScene: Scene;
  simGeo: PlaneGeometry;
};
