import { AdditiveBlending, NormalBlending } from 'three';
import type { IUniform } from 'three';
import type { ParticleConfig } from '../types';

export type ShaderUniformMap = Record<string, IUniform>;

export const getParticleBlendMode = (backgroundColor: ParticleConfig['backgroundColor']) => (
  backgroundColor === 'white' ? NormalBlending : AdditiveBlending
);

export const getLineBlendMode = (backgroundColor: ParticleConfig['backgroundColor']) => (
  backgroundColor === 'white' ? NormalBlending : AdditiveBlending
);
