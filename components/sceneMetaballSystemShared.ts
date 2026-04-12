import type { MutableRefObject, RefObject } from 'react';
import { Color, DoubleSide, MeshStandardMaterial } from 'three';
import { MarchingCubes } from '../lib/threeStdlibMarchingCubes';
import type { ParticleConfig } from '../types';

export type MetaballSystemProps = {
  config: ParticleConfig;
  posReadbackRef: RefObject<Float32Array | null>;
  posReadbackVersionRef: MutableRefObject<number>;
  texSize: number;
  isPlaying: boolean;
};

export function getMetaballResolution(config: ParticleConfig) {
  return Math.round(Math.max(16, Math.min(64, config.gpgpuMetaballResolution)));
}

export type MetaballMaterialStyleState = {
  color: string;
  opacity: number;
  transparent: boolean;
  depthWrite: boolean;
  wireframe: boolean;
  metalness: number;
  roughness: number;
  emissive: string;
  emissiveIntensity: number;
  flatShading: boolean;
  envMapIntensity: number;
};

function buildLiftedColor(color: string, amount: number) {
  return `#${new Color(color).offsetHSL(0, 0.04, amount).getHexString()}`;
}

export function buildMetaballMaterialStyleState(config: ParticleConfig): MetaballMaterialStyleState {
  const opacity = Math.max(0.02, Math.min(1, config.gpgpuMetaballOpacity));
  const baseState: MetaballMaterialStyleState = {
    color: config.gpgpuMetaballColor,
    opacity,
    transparent: opacity < 0.99,
    depthWrite: opacity >= 0.99,
    wireframe: config.gpgpuMetaballWireframe,
    metalness: config.gpgpuMetaballMetalness,
    roughness: config.gpgpuMetaballRoughness,
    emissive: '#000000',
    emissiveIntensity: 0,
    flatShading: false,
    envMapIntensity: 1,
  };

  switch (config.gpgpuMetaballStyle) {
    case 'glass':
      return {
        ...baseState,
        metalness: Math.min(baseState.metalness, 0.18),
        roughness: Math.min(baseState.roughness, 0.08),
        emissive: buildLiftedColor(baseState.color, 0.08),
        emissiveIntensity: 0.06,
        transparent: true,
        depthWrite: opacity >= 0.995,
        envMapIntensity: 1.35,
      };
    case 'hologram':
      return {
        ...baseState,
        metalness: Math.min(baseState.metalness, 0.16),
        roughness: Math.min(baseState.roughness, 0.14),
        emissive: buildLiftedColor(baseState.color, 0.12),
        emissiveIntensity: 0.42,
        transparent: true,
        depthWrite: false,
        envMapIntensity: 0.45,
      };
    case 'chrome':
      return {
        ...baseState,
        metalness: Math.max(baseState.metalness, 0.92),
        roughness: Math.min(baseState.roughness, 0.12),
        emissive: buildLiftedColor(baseState.color, 0.03),
        emissiveIntensity: 0.04,
        envMapIntensity: 1.6,
      };
    case 'halftone':
      return {
        ...baseState,
        metalness: Math.min(baseState.metalness, 0.22),
        roughness: Math.max(baseState.roughness, 0.78),
        emissive: buildLiftedColor(baseState.color, 0.05),
        emissiveIntensity: 0.08,
        flatShading: true,
        envMapIntensity: 0.55,
      };
    case 'classic':
    default:
      return baseState;
  }
}

export function createMetaballMaterial(config: ParticleConfig) {
  const state = buildMetaballMaterialStyleState(config);
  return new MeshStandardMaterial({
    color: new Color(state.color),
    opacity: state.opacity,
    transparent: state.transparent,
    side: DoubleSide,
    metalness: state.metalness,
    roughness: state.roughness,
    depthWrite: state.depthWrite,
    wireframe: state.wireframe,
    emissive: new Color(state.emissive),
    emissiveIntensity: state.emissiveIntensity,
    flatShading: state.flatShading,
    envMapIntensity: state.envMapIntensity,
  });
}

export function createMarchingCubesObject(config: ParticleConfig, resolution: number, material: MeshStandardMaterial) {
  const maxPoly = resolution ** 3 * 5;
  const obj = new MarchingCubes(resolution, material, false, false, maxPoly);
  obj.isolation = config.gpgpuMetaballIsoLevel;
  obj.scale.setScalar(config.gpgpuBounceRadius);
  return obj;
}

export function syncMetaballMaterial(material: MeshStandardMaterial, config: ParticleConfig) {
  const state = buildMetaballMaterialStyleState(config);
  material.color.setStyle(state.color);
  material.opacity = state.opacity;
  material.transparent = state.transparent;
  material.depthWrite = state.depthWrite;
  material.wireframe = state.wireframe;
  material.metalness = state.metalness;
  material.roughness = state.roughness;
  material.emissive.setStyle(state.emissive);
  material.emissiveIntensity = state.emissiveIntensity;
  material.envMapIntensity = state.envMapIntensity;
  if (material.flatShading !== state.flatShading) {
    material.flatShading = state.flatShading;
    material.needsUpdate = true;
  }
}

export function updateMetaballField(
  obj: MarchingCubes,
  positions: Float32Array,
  texSize: number,
  config: ParticleConfig,
) {
  obj.isolation = config.gpgpuMetaballIsoLevel;
  obj.scale.setScalar(config.gpgpuBounceRadius);
  obj.reset();

  const invR = 0.5 / config.gpgpuBounceRadius;
  const N = texSize * texSize;
  const limit = Math.min(N, Math.max(16, config.gpgpuMetaballParticleLimit));
  const stride = Math.max(1, Math.floor(N / limit));
  const strength = config.gpgpuMetaballStrength;
  const sub = config.gpgpuMetaballSubtract;

  for (let i = 0; i < N; i += stride) {
    const bx = positions[i * 4] * invR + 0.5;
    const by = positions[i * 4 + 1] * invR + 0.5;
    const bz = positions[i * 4 + 2] * invR + 0.5;
    if (bx < 0 || bx > 1 || by < 0 || by > 1 || bz < 0 || bz > 1) continue;
    obj.addBall(bx, by, bz, strength, sub);
  }
}

export function getTexSizeForCount(count: number): number {
  const n = Math.ceil(Math.sqrt(count));
  const sizes = [16, 32, 64, 128, 256, 512, 1024];
  return sizes.find((s) => s >= n) ?? 1024;
}
