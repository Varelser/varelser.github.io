import type { ParticleConfig } from '../types';

export type PostFxStageId =
  | 'brightness-contrast'
  | 'noise'
  | 'bloom'
  | 'chromatic-aberration'
  | 'depth-of-field'
  | 'vignette'
  | 'n8ao';

export type PostFxStackProfile = ParticleConfig['postFxStackProfile'];

const STACK_ORDERS: Record<PostFxStackProfile, PostFxStageId[]> = {
  manual: ['brightness-contrast', 'n8ao', 'noise', 'bloom', 'chromatic-aberration', 'depth-of-field', 'vignette'],
  'touch-feedback': ['brightness-contrast', 'noise', 'chromatic-aberration', 'bloom', 'n8ao', 'vignette', 'depth-of-field'],
  'particular-glow': ['brightness-contrast', 'n8ao', 'bloom', 'chromatic-aberration', 'noise', 'vignette', 'depth-of-field'],
  'retro-feedback': ['brightness-contrast', 'noise', 'chromatic-aberration', 'vignette', 'n8ao', 'bloom', 'depth-of-field'],
  'dream-smear': ['brightness-contrast', 'n8ao', 'depth-of-field', 'bloom', 'chromatic-aberration', 'noise', 'vignette'],
};

export function getActivePostFxStageIds(config: ParticleConfig): PostFxStageId[] {
  const active = new Set<PostFxStageId>();
  if (config.postBrightnessContrastEnabled && (Math.abs(config.postBrightness) > 0.001 || Math.abs(config.postContrastAmount) > 0.001)) {
    active.add('brightness-contrast');
  }
  if (config.postNoiseEnabled && config.postNoiseOpacity > 0.001) {
    active.add('noise');
  }
  if (config.postBloomEnabled) {
    active.add('bloom');
  }
  if (config.postChromaticAberrationEnabled && config.postChromaticAberrationOffset > 0.00001) {
    active.add('chromatic-aberration');
  }
  if (config.postDofEnabled) {
    active.add('depth-of-field');
  }
  if (config.postVignetteEnabled && (config.postVignetteDarkness > 0.001 || config.postVignetteOffset > 0.001)) {
    active.add('vignette');
  }
  if (config.postN8aoEnabled && config.postN8aoIntensity > 0.001) {
    active.add('n8ao');
  }
  return Array.from(active);
}

export function getOrderedActivePostFxStageIds(config: ParticleConfig): PostFxStageId[] {
  const active = new Set(getActivePostFxStageIds(config));
  const preferredOrder = STACK_ORDERS[config.postFxStackProfile] ?? STACK_ORDERS.manual;
  return preferredOrder.filter((stage) => active.has(stage));
}
