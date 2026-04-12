import { Color, DoubleSide, ShaderMaterial, Vector2, Vector3, Vector4 } from 'three';
import type { ParticleConfig } from '../types';
import { FRAGMENT_SHADER, PARTICLE_VERTEX_SHADER } from './sceneShaders';
import { getParticleBlendMode } from './sceneShared';

export const createParticleGhostMaterials = ({
  config,
  layerIndex,
  isAux,
  uniforms,
  maxGhost,
}: {
  config: ParticleConfig;
  layerIndex: 1 | 2 | 3 | 4;
  isAux: boolean;
  uniforms: Record<string, { value: unknown }>;
  maxGhost: number;
}) => {
  if ((layerIndex !== 2 && layerIndex !== 3) || isAux) return [] as ShaderMaterial[];

  return Array.from({ length: maxGhost }, () => {
    const cloned: Record<string, { value: unknown }> = {};
    for (const [key, uniform] of Object.entries(uniforms)) {
      const value = uniform.value;
      if (value instanceof Color) cloned[key] = { value: value.clone() };
      else if (value instanceof Vector2) cloned[key] = { value: value.clone() };
      else if (value instanceof Vector3) cloned[key] = { value: value.clone() };
      else if (value instanceof Vector4) cloned[key] = { value: value.clone() };
      else if (Array.isArray(value)) cloned[key] = { value: (value as { clone?: () => unknown }[]).map((entry) => entry?.clone?.() ?? entry) };
      else cloned[key] = { value };
    }

    return new ShaderMaterial({
      vertexShader: PARTICLE_VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: cloned,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      blending: getParticleBlendMode(config.backgroundColor),
    });
  });
};
