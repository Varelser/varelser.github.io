import type { FutureNativeUiSectionSpec } from './runtimeContracts';

export const fractureLatticeUiSections: readonly FutureNativeUiSectionSpec[] = [
  {
    id: 'substrate',
    title: 'Substrate',
    controls: [
      { key: 'width', label: 'Width', kind: 'slider', min: 2, max: 128, step: 1 },
      { key: 'height', label: 'Height', kind: 'slider', min: 2, max: 128, step: 1 },
      { key: 'bondStrength', label: 'Bond strength', kind: 'slider', min: 0.01, max: 4, step: 0.01 },
    ],
  },
  {
    id: 'impact',
    title: 'Impact',
    controls: [
      { key: 'impactX', label: 'Impact X', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'impactY', label: 'Impact Y', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'impactRadius', label: 'Impact radius', kind: 'slider', min: 0.01, max: 0.5, step: 0.01 },
      { key: 'impulseMagnitude', label: 'Impulse', kind: 'slider', min: 0.05, max: 3, step: 0.01 },
    ],
  },
  {
    id: 'failure',
    title: 'Failure',
    controls: [
      { key: 'impulseThreshold', label: 'Impulse threshold', kind: 'slider', min: 0.01, max: 2, step: 0.01 },
      { key: 'debrisSpawnRate', label: 'Debris spawn', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'propagationFalloff', label: 'Propagation', kind: 'slider', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: 'propagation',
    title: 'Propagation bias',
    controls: [
      { key: 'propagationDirectionX', label: 'Direction X', kind: 'slider', min: -1, max: 1, step: 0.01 },
      { key: 'propagationDirectionY', label: 'Direction Y', kind: 'slider', min: -1, max: 1, step: 0.01 },
      { key: 'directionalBias', label: 'Directional bias', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'debrisImpulseScale', label: 'Debris impulse', kind: 'slider', min: 0, max: 2, step: 0.01 },
    ],
  },
  {
    id: 'fragmentation',
    title: 'Fragment split',
    controls: [
      { key: 'splitAffinity', label: 'Split affinity', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'fragmentDetachThreshold', label: 'Detach threshold', kind: 'slider', min: 0.01, max: 1, step: 0.01 },
    ],
  },
];
