import type { FutureNativeUiSectionSpec } from './runtimeContracts';

export const pbdRopeUiSections: readonly FutureNativeUiSectionSpec[] = [
  {
    id: 'topology',
    title: 'Topology',
    controls: [
      { key: 'segments', label: 'Segments', kind: 'slider', min: 4, max: 256, step: 1 },
      { key: 'restLength', label: 'Rest length', kind: 'slider', min: 0.002, max: 0.2, step: 0.001 },
      { key: 'anchorMode', label: 'Anchor mode', kind: 'select', options: ['start', 'both-ends', 'free'] },
    ],
  },
  {
    id: 'solver',
    title: 'Solver',
    controls: [
      { key: 'stiffness', label: 'Stiffness', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'bendStiffness', label: 'Bend stiffness', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'damping', label: 'Damping', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'gravity', label: 'Gravity', kind: 'slider', min: 0, max: 20, step: 0.1 },
    ],
  },
  {
    id: 'collision',
    title: 'Collision',
    controls: [
      { key: 'collisionRadius', label: 'Collision radius', kind: 'slider', min: 0, max: 0.1, step: 0.001 },
      { key: 'floorY', label: 'Floor Y', kind: 'slider', min: -3, max: 0, step: 0.01 },
      { key: 'circleColliderRadius', label: 'Circle radius', kind: 'slider', min: 0, max: 0.6, step: 0.005 },
      { key: 'capsuleColliderRadius', label: 'Capsule radius', kind: 'slider', min: 0, max: 0.4, step: 0.005 },
      { key: 'selfCollisionStiffness', label: 'Self collision', kind: 'slider', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: 'capsule',
    title: 'Capsule',
    controls: [
      { key: 'capsuleColliderAx', label: 'Capsule A X', kind: 'slider', min: -2, max: 2, step: 0.01 },
      { key: 'capsuleColliderAy', label: 'Capsule A Y', kind: 'slider', min: -2, max: 2, step: 0.01 },
      { key: 'capsuleColliderBx', label: 'Capsule B X', kind: 'slider', min: -2, max: 2, step: 0.01 },
      { key: 'capsuleColliderBy', label: 'Capsule B Y', kind: 'slider', min: -2, max: 2, step: 0.01 },
    ],
  },
];
