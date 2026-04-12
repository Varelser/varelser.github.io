import type { FutureNativeUiSectionSpec } from './runtimeContracts';

export const mpmGranularUiSections: readonly FutureNativeUiSectionSpec[] = [
  {
    id: 'source',
    title: 'Source',
    controls: [
      { key: 'particleCount', label: 'Particle count', kind: 'slider', min: 16, max: 8192, step: 16 },
      { key: 'cellResolution', label: 'Cell resolution', kind: 'slider', min: 8, max: 256, step: 1 },
      { key: 'spawnWidth', label: 'Spawn width', kind: 'slider', min: 0.08, max: 1.5, step: 0.01 },
      { key: 'spawnHeight', label: 'Spawn height', kind: 'slider', min: 0.04, max: 1.2, step: 0.01 },
    ],
  },
  {
    id: 'material',
    title: 'Material',
    controls: [
      { key: 'materialKind', label: 'Material kind', kind: 'select', options: ['sand', 'snow', 'mud', 'paste'] },
      { key: 'cohesion', label: 'Cohesion', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'friction', label: 'Friction', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'damping', label: 'Damping', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'plasticity', label: 'Plasticity', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'yieldRate', label: 'Yield rate', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'kernelRadius', label: 'Kernel radius', kind: 'slider', min: 1, max: 3, step: 0.05 },
      { key: 'apicBlend', label: 'APIC blend', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'stressGain', label: 'Stress gain', kind: 'slider', min: 0, max: 2, step: 0.02 },
      { key: 'hardening', label: 'Hardening', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'gravity', label: 'Gravity', kind: 'slider', min: 0, max: 20, step: 0.1 },
      { key: 'particleRadius', label: 'Particle radius', kind: 'slider', min: 0.002, max: 0.06, step: 0.001 },
    ],
  },
  {
    id: 'bounds',
    title: 'Bounds',
    controls: [
      { key: 'floorY', label: 'Floor Y', kind: 'slider', min: -2, max: 0.5, step: 0.01 },
      { key: 'wallHalfWidth', label: 'Wall half width', kind: 'slider', min: 0.1, max: 2.0, step: 0.01 },
      { key: 'substeps', label: 'Substeps', kind: 'slider', min: 1, max: 12, step: 1 },
    ],
  },
];
