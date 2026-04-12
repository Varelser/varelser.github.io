import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { DataTexture, FloatType, LinearFilter, Mesh, MeshBasicMaterial, NearestFilter, OrthographicCamera, PlaneGeometry, RGBAFormat, RepeatWrapping, Scene, WebGLRenderTarget } from 'three';
import type { WebGLRenderer } from 'three';
import type { ParticleConfig } from '../types';
import {
  initWebGPUCompute,
  destroyWebGPUCompute,
} from '../lib/webgpuCompute';
import type { WebGPUComputeReadbackResult, WebGPUComputeState } from '../lib/webgpuCompute';
import { getWebgpuComputeCapabilityReport } from '../lib/webgpuComputeFoundation';
import { FLUID_SIZE } from './gpgpuShaders';

export function getTexSize(count: number): number {
  const side = Math.ceil(Math.sqrt(count));
  let s = 1;
  while (s < side) s <<= 1;
  return Math.max(s, 2);
}

function makeRT(size: number): WebGLRenderTarget {
  return new WebGLRenderTarget(size, size, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    type: FloatType,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

function makeFluidRT(size: number): WebGLRenderTarget {
  const rt = new WebGLRenderTarget(size, size, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
    type: FloatType,
    depthBuffer: false,
    stencilBuffer: false,
  });
  rt.texture.wrapS = RepeatWrapping;
  rt.texture.wrapT = RepeatWrapping;
  return rt;
}

export type WebgpuRuntimeInitStatus = 'idle' | 'initializing' | 'ready' | 'unavailable' | 'failed';

export type GpgpuRuntimeRefs = {
  rtRef: MutableRefObject<{
    posA: WebGLRenderTarget;
    posB: WebGLRenderTarget;
    velA: WebGLRenderTarget;
    velB: WebGLRenderTarget;
  } | null>;
  pingIsA: MutableRefObject<boolean>;
  prevPosRTRef: MutableRefObject<WebGLRenderTarget | null>;
  initPosTexRef: MutableRefObject<DataTexture | null>;
  fluidRTARef: MutableRefObject<WebGLRenderTarget | null>;
  fluidRTBRef: MutableRefObject<WebGLRenderTarget | null>;
  fluidPingIsA: MutableRefObject<boolean>;
  sortRTARef: MutableRefObject<WebGLRenderTarget | null>;
  sortRTBRef: MutableRefObject<WebGLRenderTarget | null>;
  webgpuStateRef: MutableRefObject<WebGPUComputeState | null>;
  webgpuPosTexRef: MutableRefObject<DataTexture | null>;
  webgpuVelTexRef: MutableRefObject<DataTexture | null>;
  webgpuPingIsARef: MutableRefObject<boolean>;
  webgpuLastReadbackRef: MutableRefObject<WebGPUComputeReadbackResult | null>;
  webgpuInitStatusRef: MutableRefObject<WebgpuRuntimeInitStatus>;
};

type UseGpgpuRuntimeArgs = {
  gl: WebGLRenderer;
  texSize: number;
  config: ParticleConfig;
};

export function useGpgpuRuntime({ gl, texSize, config }: UseGpgpuRuntimeArgs): GpgpuRuntimeRefs {
  const rtRef = useRef<{
    posA: WebGLRenderTarget;
    posB: WebGLRenderTarget;
    velA: WebGLRenderTarget;
    velB: WebGLRenderTarget;
  } | null>(null);
  const pingIsA = useRef(true);
  const prevPosRTRef = useRef<WebGLRenderTarget | null>(null);
  const initPosTexRef = useRef<DataTexture | null>(null);
  const fluidRTARef = useRef<WebGLRenderTarget | null>(null);
  const fluidRTBRef = useRef<WebGLRenderTarget | null>(null);
  const fluidPingIsA = useRef(true);
  const sortRTARef = useRef<WebGLRenderTarget | null>(null);
  const sortRTBRef = useRef<WebGLRenderTarget | null>(null);
  const webgpuStateRef = useRef<WebGPUComputeState | null>(null);
  const webgpuPosTexRef = useRef<DataTexture | null>(null);
  const webgpuVelTexRef = useRef<DataTexture | null>(null);
  const webgpuPingIsARef = useRef(true);
  const webgpuLastReadbackRef = useRef<WebGPUComputeReadbackResult | null>(null);
  const webgpuInitStatusRef = useRef<WebgpuRuntimeInitStatus>('idle');

  useEffect(() => {
    if (rtRef.current) {
      rtRef.current.posA.dispose();
      rtRef.current.posB.dispose();
      rtRef.current.velA.dispose();
      rtRef.current.velB.dispose();
    }
    prevPosRTRef.current?.dispose();
    initPosTexRef.current?.dispose();

    const posA = makeRT(texSize);
    const posB = makeRT(texSize);
    const velA = makeRT(texSize);
    const velB = makeRT(texSize);
    const prevPos = makeRT(texSize);
    rtRef.current = { posA, posB, velA, velB };
    prevPosRTRef.current = prevPos;
    pingIsA.current = true;

    const count = texSize * texSize;
    const posData = new Float32Array(count * 4);
    const velData = new Float32Array(count * 4);
    const r = config.gpgpuBounceRadius;
    const shape = config.gpgpuEmitShape;
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      let px = 0;
      let py = 0;
      let pz = 0;
      if (shape === 'disc') {
        const rad = r * Math.sqrt(Math.random());
        px = rad * Math.cos(theta);
        py = 0;
        pz = rad * Math.sin(theta);
      } else if (shape === 'ring') {
        const rad = r * (0.85 + Math.random() * 0.15);
        px = rad * Math.cos(theta);
        py = (Math.random() - 0.5) * r * 0.08;
        pz = rad * Math.sin(theta);
      } else if (shape === 'box') {
        px = (Math.random() - 0.5) * 2 * r;
        py = (Math.random() - 0.5) * 2 * r;
        pz = (Math.random() - 0.5) * 2 * r;
      } else if (shape === 'shell') {
        const phi = Math.acos(2 * Math.random() - 1);
        px = r * Math.sin(phi) * Math.cos(theta);
        py = r * Math.sin(phi) * Math.sin(theta);
        pz = r * Math.cos(phi);
      } else if (shape === 'cone') {
        const h = Math.random() * r;
        const cr = (h / r) * r;
        px = cr * Math.cos(theta);
        py = h - r * 0.5;
        pz = cr * Math.sin(theta);
      } else {
        const phi = Math.acos(2 * Math.random() - 1);
        const rad = r * (0.1 + Math.random() * 0.9);
        px = rad * Math.sin(phi) * Math.cos(theta);
        py = rad * Math.sin(phi) * Math.sin(theta);
        pz = rad * Math.cos(phi);
      }
      posData[i * 4] = px;
      posData[i * 4 + 1] = py;
      posData[i * 4 + 2] = pz;
      posData[i * 4 + 3] = 1;
      velData[i * 4] = (Math.random() - 0.5) * 4;
      velData[i * 4 + 1] = (Math.random() - 0.5) * 4;
      velData[i * 4 + 2] = (Math.random() - 0.5) * 4;
    }

    const initTex = new DataTexture(posData.slice(), texSize, texSize, RGBAFormat, FloatType);
    initTex.needsUpdate = true;
    initPosTexRef.current = initTex;

    const copyScene = new Scene();
    const copyCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const copyGeo = new PlaneGeometry(2, 2);
    const posTex = new DataTexture(posData, texSize, texSize, RGBAFormat, FloatType);
    const velTex = new DataTexture(velData, texSize, texSize, RGBAFormat, FloatType);
    posTex.needsUpdate = true;
    velTex.needsUpdate = true;
    const copyMat = new MeshBasicMaterial({ map: posTex });
    const copyMesh = new Mesh(copyGeo, copyMat);
    copyScene.add(copyMesh);
    gl.setRenderTarget(posA);
    gl.render(copyScene, copyCam);
    gl.setRenderTarget(prevPos);
    gl.render(copyScene, copyCam);
    copyMat.map = velTex;
    copyMat.needsUpdate = true;
    gl.setRenderTarget(velA);
    gl.render(copyScene, copyCam);
    gl.setRenderTarget(null);
    copyScene.remove(copyMesh);
    posTex.dispose();
    velTex.dispose();
    copyMat.dispose();

    sortRTARef.current?.dispose();
    sortRTBRef.current?.dispose();
    sortRTARef.current = makeRT(texSize);
    sortRTBRef.current = makeRT(texSize);

    fluidRTARef.current?.dispose();
    fluidRTBRef.current?.dispose();
    fluidRTARef.current = makeFluidRT(FLUID_SIZE);
    fluidRTBRef.current = makeFluidRT(FLUID_SIZE);
    fluidPingIsA.current = true;

    const fluidInitData = new Float32Array(FLUID_SIZE * FLUID_SIZE * 4);
    for (let fi = 0; fi < FLUID_SIZE * FLUID_SIZE; fi++) {
      const fu = (fi % FLUID_SIZE) / FLUID_SIZE - 0.5;
      const fv = Math.floor(fi / FLUID_SIZE) / FLUID_SIZE - 0.5;
      const fr = Math.sqrt(fu * fu + fv * fv) + 0.001;
      fluidInitData[fi * 4 + 0] = -fv / (fr * fr + 0.1) * 0.08;
      fluidInitData[fi * 4 + 1] = fu / (fr * fr + 0.1) * 0.08;
      fluidInitData[fi * 4 + 2] = 0;
      fluidInitData[fi * 4 + 3] = 1;
    }
    const fluidInitTex = new DataTexture(fluidInitData, FLUID_SIZE, FLUID_SIZE, RGBAFormat, FloatType);
    fluidInitTex.needsUpdate = true;
    const fluidCopyMat = new MeshBasicMaterial({ map: fluidInitTex });
    const fluidCopyMesh = new Mesh(copyGeo, fluidCopyMat);
    copyScene.add(fluidCopyMesh);
    gl.setRenderTarget(fluidRTARef.current);
    gl.render(copyScene, copyCam);
    gl.setRenderTarget(fluidRTBRef.current);
    gl.render(copyScene, copyCam);
    gl.setRenderTarget(null);
    copyScene.remove(fluidCopyMesh);
    fluidCopyMat.dispose();
    fluidInitTex.dispose();
    copyGeo.dispose();

    if (webgpuStateRef.current) {
      destroyWebGPUCompute(webgpuStateRef.current);
      webgpuStateRef.current = null;
    }
    webgpuPosTexRef.current?.dispose();
    webgpuPosTexRef.current = null;
    webgpuVelTexRef.current?.dispose();
    webgpuVelTexRef.current = null;
    webgpuLastReadbackRef.current = null;

    const wgPos = posData.slice() as Float32Array;
    const wgVel = velData.slice() as Float32Array;
    webgpuLastReadbackRef.current = {
      positions: new Float32Array(wgPos),
      velocities: new Float32Array(wgVel),
    };

    const wantsWebGPU = config.gpgpuEnabled
      && (config.gpgpuExecutionPreference === 'webgpu'
        || (config.gpgpuExecutionPreference !== 'webgl' && config.gpgpuWebGPUEnabled));
    const webgpuCapability = getWebgpuComputeCapabilityReport(config);
    const canRequestWebGPUForConfig = wantsWebGPU && webgpuCapability.canRunRequestedConfig;

    let cancelled = false;
    if (canRequestWebGPUForConfig) {
      webgpuInitStatusRef.current = 'initializing';
      initWebGPUCompute(texSize, wgPos, wgVel)
        .then((state) => {
          if (cancelled) {
            if (state) destroyWebGPUCompute(state);
            return;
          }

          webgpuStateRef.current = state;
          webgpuPingIsARef.current = true;
          if (!state) {
            webgpuInitStatusRef.current = 'unavailable';
            return;
          }

          webgpuInitStatusRef.current = 'ready';
          const outPosTex = new DataTexture(
            new Float32Array(wgPos),
            texSize,
            texSize,
            RGBAFormat,
            FloatType,
          );
          outPosTex.needsUpdate = true;
          webgpuPosTexRef.current = outPosTex;

          const outVelTex = new DataTexture(
            new Float32Array(wgVel),
            texSize,
            texSize,
            RGBAFormat,
            FloatType,
          );
          outVelTex.needsUpdate = true;
          webgpuVelTexRef.current = outVelTex;
        })
        .catch(() => {
          if (cancelled) return;
          webgpuStateRef.current = null;
          webgpuInitStatusRef.current = 'failed';
        });
    } else if (wantsWebGPU) {
      webgpuInitStatusRef.current = 'unavailable';
    } else {
      webgpuInitStatusRef.current = 'idle';
    }

    return () => {
      cancelled = true;
      rtRef.current?.posA.dispose();
      rtRef.current?.posB.dispose();
      rtRef.current?.velA.dispose();
      rtRef.current?.velB.dispose();
      rtRef.current = null;
      prevPosRTRef.current?.dispose();
      prevPosRTRef.current = null;
      initPosTexRef.current?.dispose();
      initPosTexRef.current = null;
      sortRTARef.current?.dispose();
      sortRTARef.current = null;
      sortRTBRef.current?.dispose();
      sortRTBRef.current = null;
      fluidRTARef.current?.dispose();
      fluidRTARef.current = null;
      fluidRTBRef.current?.dispose();
      fluidRTBRef.current = null;
      if (webgpuStateRef.current) {
        destroyWebGPUCompute(webgpuStateRef.current);
        webgpuStateRef.current = null;
      }
      webgpuPosTexRef.current?.dispose();
      webgpuPosTexRef.current = null;
      webgpuVelTexRef.current?.dispose();
      webgpuVelTexRef.current = null;
      webgpuLastReadbackRef.current = null;
      webgpuInitStatusRef.current = 'idle';
    };
  }, [texSize, gl, config.gpgpuEmitShape, config.gpgpuBounceRadius, config.gpgpuEnabled, config.gpgpuExecutionPreference, config.gpgpuWebGPUEnabled]);

  return {
    rtRef,
    pingIsA,
    prevPosRTRef,
    initPosTexRef,
    fluidRTARef,
    fluidRTBRef,
    fluidPingIsA,
    sortRTARef,
    sortRTBRef,
    webgpuStateRef,
    webgpuPosTexRef,
    webgpuVelTexRef,
    webgpuPingIsARef,
    webgpuLastReadbackRef,
    webgpuInitStatusRef,
  };
}
