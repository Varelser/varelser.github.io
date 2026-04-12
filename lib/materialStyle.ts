import type { ParticleConfig } from '../types';

export type ExtendedMaterialStyle = ParticleConfig['layer2MaterialStyle'];

export function getMaterialStyleIndex(style: ExtendedMaterialStyle): number {
  switch (style) {
    case 'glass': return 1;
    case 'hologram': return 2;
    case 'chrome': return 3;
    case 'halftone': return 4;
    case 'ink': return 5;
    case 'paper': return 6;
    case 'stipple': return 7;
    default: return 0;
  }
}

export function getShaderMaterialStyleIndex(style: ExtendedMaterialStyle): number {
  switch (style) {
    case 'ink':
    case 'stipple':
      return 4;
    case 'paper':
      return 0;
    default:
      return getMaterialStyleIndex(style);
  }
}

export function getMaterialStyleUiOptions(): { label: string; val: ExtendedMaterialStyle }[] {
  return [
    { label: 'Classic', val: 'classic' },
    { label: 'Glass', val: 'glass' },
    { label: 'Hologram', val: 'hologram' },
    { label: 'Chrome', val: 'chrome' },
    { label: 'Halftone', val: 'halftone' },
    { label: 'Ink', val: 'ink' },
    { label: 'Paper', val: 'paper' },
    { label: 'Stipple', val: 'stipple' },
  ];
}

export function isGraphicMaterialStyle(style: ExtendedMaterialStyle) {
  return style === 'halftone' || style === 'ink' || style === 'stipple';
}
