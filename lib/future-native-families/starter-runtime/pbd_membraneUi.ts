import type { FutureNativeUiSectionSpec } from './runtimeContracts';

export const pbdMembraneUiSections: readonly FutureNativeUiSectionSpec[] = [
  {
    id: 'topology',
    title: 'Topology',
    controls: [
      { key: 'width', label: 'Width', kind: 'slider', min: 3, max: 32, step: 1 },
      { key: 'height', label: 'Height', kind: 'slider', min: 3, max: 32, step: 1 },
      { key: 'spacing', label: 'Spacing', kind: 'slider', min: 0.02, max: 0.2, step: 0.005 },
      { key: 'anchorMode', label: 'Anchor mode', kind: 'select', options: ['corners', 'top-edge', 'none', 'rim-quadrants'] },
      { key: 'pinGroupStrength', label: 'Pin group', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'pinGroupCount', label: 'Pin groups', kind: 'slider', min: 1, max: 4, step: 1 },
      { key: 'pinChoreographyPreset', label: 'Pin preset', kind: 'select', options: ['manual', 'breath-wave', 'counter-orbit', 'shear-walk'] },
    ],
  },
  {
    id: 'solver',
    title: 'Solver',
    controls: [
      { key: 'stiffness', label: 'Structural stiffness', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'shearStiffness', label: 'Shear stiffness', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'bendStiffness', label: 'Bend stiffness', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'boundaryTension', label: 'Boundary tension', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'inflation', label: 'Inflation', kind: 'slider', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: 'forces',
    title: 'Forces',
    controls: [
      { key: 'pulseX', label: 'Pulse X', kind: 'slider', min: -1, max: 1, step: 0.01 },
      { key: 'pulseY', label: 'Pulse Y', kind: 'slider', min: -1, max: 1, step: 0.01 },
      { key: 'windX', label: 'Wind X', kind: 'slider', min: -1, max: 1, step: 0.01 },
      { key: 'windY', label: 'Wind Y', kind: 'slider', min: -1, max: 1, step: 0.01 },
      { key: 'windPulse', label: 'Wind pulse', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'pressureStrength', label: 'Pressure', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'pressurePulse', label: 'Pressure pulse', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'floorY', label: 'Floor Y', kind: 'slider', min: -3, max: 0, step: 0.01 },
      { key: 'collisionRadius', label: 'Collision radius', kind: 'slider', min: 0, max: 0.1, step: 0.001 },
      { key: 'selfCollisionStiffness', label: 'Self collision', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'tearThreshold', label: 'Tear threshold', kind: 'slider', min: 1.05, max: 2.0, step: 0.01 },
      { key: 'tearPropagationBias', label: 'Tear propagation', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'tearBiasMapScale', label: 'Tear map scale', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'tearBiasMapFrequency', label: 'Tear map frequency', kind: 'slider', min: 0, max: 6, step: 0.1 },
      { key: 'tearBiasMapPreset', label: 'Tear map preset', kind: 'select', options: ['manual', 'warp-weft', 'radial-flare', 'shear-noise'] },
    ],
  },
  {
    id: 'colliders',
    title: 'Colliders',
    controls: [
      { key: 'circleColliderX', label: 'Circle X', kind: 'slider', min: -1, max: 1, step: 0.01 },
      { key: 'circleColliderY', label: 'Circle Y', kind: 'slider', min: -1, max: 1, step: 0.01 },
      { key: 'circleColliderRadius', label: 'Circle radius', kind: 'slider', min: 0, max: 0.4, step: 0.005 },
      { key: 'capsuleColliderRadius', label: 'Capsule radius', kind: 'slider', min: 0, max: 0.3, step: 0.005 },
      { key: 'obstacleField2Radius', label: 'Obstacle 2 radius', kind: 'slider', min: 0, max: 0.4, step: 0.005 },
      { key: 'obstacleField2Strength', label: 'Obstacle 2 strength', kind: 'slider', min: 0, max: 1, step: 0.01 },
      { key: 'obstaclePreset', label: 'Obstacle preset', kind: 'select', options: ['manual', 'staggered-arc', 'shear-lattice'] },
    ],
  },
];
